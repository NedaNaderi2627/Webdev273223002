import test from 'node:test';
import assert from 'node:assert';
import { createBooking } from '../src/services/bookings.js';

test('AC-2 overlapping booking is refused with error', () => {
  const bookingData = {
    userId: 1,
    workstationId: 1,
    date: '2026-06-01',
    startTime: '10:00',
    endTime: '12:00'
  };

  createBooking(bookingData);

  assert.throws(() => {
    createBooking(bookingData);
  }, /Time slot is already booked/);
});