import test from 'node:test';
import assert from 'node:assert';
import db from '../src/data/db.js';
import {
  createBooking,
  cancelBooking,
  BookingConflictError,
  NotOwnerError,
  NotFoundError,
} from '../src/services/bookings.js';
import { recommendTimeSlots } from '../src/services/recommendations.js';

const clean = (ws, date) =>
  db.prepare('DELETE FROM bookings WHERE workstation_id = ? AND date = ?').run(ws, date);

test('bookings service: create, conflict, unique/other errors, cancel, owner and not-found', () => {
  const ws = 9101;
  const date = '2026-07-01';
  clean(ws, date);

  const origPrepare = db.prepare.bind(db);
  let dbErrorMode = null;
  db.prepare = (sql) => {
    const stmt = origPrepare(sql);
    if (dbErrorMode && sql.includes('INSERT INTO bookings')) {
      return {
        run() {
          if (dbErrorMode === 'unique') {
            throw new Error('UNIQUE constraint failed: bookings.workstation_id');
          }
          throw new Error('SQLITE_BUSY');
        },
      };
    }
    return stmt;
  };

  try {
    const b = createBooking({ userId: 1, workstationId: ws, date, startTime: '10:00', endTime: '12:00' });
    assert.ok(b.id);

    assert.throws(
      () => createBooking({ userId: 2, workstationId: ws, date, startTime: '11:00', endTime: '13:00' }),
      (e) => e instanceof BookingConflictError && e.status === 409
    );

    dbErrorMode = 'unique';
    assert.throws(
      () => createBooking({ userId: 3, workstationId: ws, date, startTime: '13:00', endTime: '14:00' }),
      (e) => e instanceof BookingConflictError && e.status === 409
    );

    dbErrorMode = 'other';
    assert.throws(
      () => createBooking({ userId: 3, workstationId: ws, date, startTime: '13:00', endTime: '14:00' }),
      (e) => e.message === 'SQLITE_BUSY'
    );
    dbErrorMode = null;

    assert.throws(
      () => cancelBooking({ bookingId: b.id, userId: 2 }),
      (e) => e instanceof NotOwnerError && e.status === 403
    );

    assert.throws(
      () => cancelBooking({ bookingId: 999999999, userId: 1 }),
      (e) => e instanceof NotFoundError && e.status === 404
    );

    assert.deepStrictEqual(cancelBooking({ bookingId: b.id, userId: 1 }), { success: true });
  } finally {
    db.prepare = origPrepare;
    clean(ws, date);
  }
});

test('recommendations service: model, fetch path, all fallback branches, and timeout', async () => {
  const ws = 9102;
  const date = '2026-07-02';
  const prevKey = process.env.GEMINI_API_KEY;
  const origFetch = globalThis.fetch;
  delete process.env.GEMINI_API_KEY;
  clean(ws, date);

  try {
    createBooking({ userId: 1, workstationId: ws, date, startTime: '12:00', endTime: '13:00' });
    createBooking({ userId: 1, workstationId: ws, date, startTime: '13:00', endTime: '15:00' });
    const afterMidDay = await recommendTimeSlots({ userId: 1, workstationId: ws, date });
    assert.strictEqual(afterMidDay.source, 'fallback');

    clean(ws, date);
    createBooking({ userId: 1, workstationId: ws, date, startTime: '08:00', endTime: '09:00' });

    const noKeyNonEmpty = await recommendTimeSlots({ userId: 1, workstationId: ws, date });
    assert.strictEqual(noKeyNonEmpty.source, 'fallback');
    assert.strictEqual(noKeyNonEmpty.slots.length, 3);

    const modelRes = await recommendTimeSlots(
      {
        userId: 1,
        workstationId: ws,
        date,
        serviceType: 'custom_lab',
        preferredRange: '10:00-15:00',
      },
      { async generate() { return { slots: [{ startTime: '09:00', endTime: '10:30' }] }; } }
    );
    assert.strictEqual(modelRes.source, 'model');

    for (const payload of [
      undefined,
      null,
      {},
      { ok: false },
      { ok: true, slots: [] },
      { ok: true, slots: null },
      { ok: 'yes', slots: [] },
      { slots: [] },
      { slots: 'invalid' },
    ]) {
      const fb = await recommendTimeSlots(
        { userId: 1, workstationId: ws, date },
        { async generate() { return payload; } }
      );
      assert.strictEqual(fb.source, 'fallback');
      assert.ok(fb.recommendedSlot);
    }

    const errNonEmpty = await recommendTimeSlots(
      { userId: 1, workstationId: ws, date },
      { async generate() { throw new Error('boom'); } }
    );
    assert.strictEqual(errNonEmpty.source, 'fallback');
    assert.ok(errNonEmpty.recommendedSlot);

    process.env.GEMINI_API_KEY = 'test-key';
    globalThis.fetch = async () => ({
      ok: true,
      slots: [{ startTime: '11:00', endTime: '12:00' }],
    });
    const fetchRes = await recommendTimeSlots({ userId: 1, workstationId: ws, date });
    assert.strictEqual(fetchRes.source, 'model');

    globalThis.fetch = async () => {
      throw new Error('network down');
    };
    const fetchErrRes = await recommendTimeSlots({ userId: 1, workstationId: ws, date });
    assert.strictEqual(fetchErrRes.source, 'fallback');
    assert.ok(fetchErrRes.recommendedSlot);

    for (const t of ['09:00-11:00', '11:00-13:00', '14:00-16:00']) {
      const [s, e] = t.split('-');
      createBooking({ userId: 1, workstationId: ws, date, startTime: s, endTime: e });
    }

    delete process.env.GEMINI_API_KEY;
    const noKeyEmpty = await recommendTimeSlots({ userId: 1, workstationId: ws, date });
    assert.strictEqual(noKeyEmpty.source, 'fallback');
    assert.strictEqual(noKeyEmpty.recommendedSlot, null);

    for (const payload of [
      undefined,
      null,
      {},
      { ok: false },
      { ok: true, slots: [] },
      { ok: true, slots: null },
      { slots: [] },
      { slots: 'invalid' },
    ]) {
      const fbEmpty = await recommendTimeSlots(
        { userId: 1, workstationId: ws, date },
        { async generate() { return payload; } }
      );
      assert.strictEqual(fbEmpty.source, 'fallback');
      assert.strictEqual(fbEmpty.recommendedSlot, null);
    }

    const timeoutRes = await recommendTimeSlots(
      { userId: 1, workstationId: ws, date },
      {
        generate({ signal }) {
          return new Promise((_r, rej) => signal.addEventListener('abort', () => rej(signal.reason)));
        },
      },
      10
    );
    assert.strictEqual(timeoutRes.source, 'fallback');
    assert.strictEqual(timeoutRes.recommendedSlot, null);
  } finally {
    globalThis.fetch = origFetch;
    if (prevKey !== undefined) process.env.GEMINI_API_KEY = prevKey;
    else delete process.env.GEMINI_API_KEY;
    clean(ws, date);
  }
});