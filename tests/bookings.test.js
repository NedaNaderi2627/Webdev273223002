import test from 'node:test';
import assert from 'node:assert';
import db from '../src/data/db.js';
import {
  createBooking,
  cancelBooking,
  BookingConflictError,
  NotOwnerError,
} from '../src/services/bookings.js';

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