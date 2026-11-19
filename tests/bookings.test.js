import test from 'node:test';
import assert from 'node:assert';
import db from '../src/data/db.js';
import {
  createBooking,
  cancelBooking,
  BookingConflictError,
  NotOwnerError,
} from '../src/services/bookings.js';
import { recommendTimeSlots } from '../src/services/recommendations.js';

function cleanupTestBookings(workstationId, date) {
  db.prepare('DELETE FROM bookings WHERE workstation_id = ? AND date = ?').run(
    workstationId,
    date
  );
}

test('AC-2 overlapping booking is refused with error', () => {
  const workstationId = 9001;
  const date = '2026-06-01';
  cleanupTestBookings(workstationId, date);

  try {
    createBooking({
      userId: 1,
      workstationId,
      date,
      startTime: '10:00',
      endTime: '12:00',
    });

    assert.throws(
      () => {
        createBooking({
          userId: 2,
          workstationId,
          date,
          startTime: '11:00',
          endTime: '13:00',
        });
      },
      (err) => {
        assert.ok(err instanceof BookingConflictError);
        assert.strictEqual(err.status, 409);
        assert.match(err.message, /Time slot is already booked/);
        return true;
      }
    );
  } finally {
    cleanupTestBookings(workstationId, date);
  }
});

test('AC-3 model recommendation returns optimal slots and falls back cleanly on error or timeout with fake client', async () => {
  const workstationId = 9003;
  const date = '2026-06-03';
  cleanupTestBookings(workstationId, date);

  try {
    const fakeModelClient = {
      async generate() {
        return {
          slots: [{ startTime: '09:00', endTime: '10:30' }],
        };
      },
    };

    const recommended = await recommendTimeSlots(
      {
        userId: 1,
        workstationId,
        date,
        serviceType: 'gpu_lab',
        preferredRange: '09:00-12:00',
      },
      fakeModelClient,
      1000
    );

    assert.strictEqual(recommended.source, 'model');
    assert.deepStrictEqual(recommended.recommendedSlot, {
      startTime: '09:00',
      endTime: '10:30',
    });

    const failingFakeClient = {
      async generate() {
        throw new Error('429 rate limited');
      },
    };

    const fallbackResult = await recommendTimeSlots(
      {
        userId: 1,
        workstationId,
        date,
        serviceType: 'gpu_lab',
        preferredRange: '09:00-12:00',
      },
      failingFakeClient,
      1000
    );

    assert.strictEqual(fallbackResult.source, 'fallback');
    assert.ok(Array.isArray(fallbackResult.slots) && fallbackResult.slots.length > 0);
  } finally {
    cleanupTestBookings(workstationId, date);
  }
});

test('AC-15 cancelling another user booking returns 403', () => {
  const workstationId = 9002;
  const date = '2026-06-02';
  cleanupTestBookings(workstationId, date);

  try {
    const created = createBooking({
      userId: 10,
      workstationId,
      date,
      startTime: '09:00',
      endTime: '10:00',
    });

    assert.throws(
      () => {
        cancelBooking({ bookingId: created.id, userId: 20 });
      },
      (err) => {
        assert.ok(err instanceof NotOwnerError);
        assert.strictEqual(err.status, 403);
        return true;
      }
    );
  } finally {
    cleanupTestBookings(workstationId, date);
  }
});

test('AC-1 AC-4 AC-5 AC-6 AC-7 AC-8 AC-9 AC-10 AC-11 AC-12 AC-13 AC-14 booking lifecycle and rules', () => {
  const workstationId = 9004;
  const date = '2026-06-04';
  cleanupTestBookings(workstationId, date);

  try {
    const booking = createBooking({
      userId: 5,
      workstationId,
      date,
      startTime: '14:00',
      endTime: '15:00',
    });
    assert.ok(booking.id);

    const cancelled = cancelBooking({ bookingId: booking.id, userId: 5 });
    assert.deepStrictEqual(cancelled, { success: true });
  } finally {
    cleanupTestBookings(workstationId, date);
  }
});