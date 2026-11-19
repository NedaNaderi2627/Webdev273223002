import {
  insertBooking,
  listBookingsByWorkstationAndDate,
  findBookingById,
  deleteBookingById,
} from '../data/bookings.js';

export class BookingConflictError extends Error {
  constructor(message = 'Booking slot already taken') {
    super(message);
    this.name = 'BookingConflictError';
    this.status = 409;
  }
}

export class NotOwnerError extends Error {
  constructor(message = 'Unauthorized to cancel this booking') {
    super(message);
    this.name = 'NotOwnerError';
    this.status = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Booking not found') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

function hasTimeOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

export function createBooking({ userId, workstationId, date, startTime, endTime }) {
  const existing = listBookingsByWorkstationAndDate(workstationId, date);
  const conflict = existing.some((row) =>
    hasTimeOverlap(startTime, endTime, row.start_time, row.end_time)
  );

  if (conflict) {
    throw new BookingConflictError();
  }

  try {
    return insertBooking({ userId, workstationId, date, startTime, endTime });
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw new BookingConflictError();
    }
    throw error;
  }
}

export function cancelBooking({ bookingId, userId }) {
  const booking = findBookingById(bookingId);

  if (!booking) {
    throw new NotFoundError();
  }

  if (booking.user_id !== userId) {
    throw new NotOwnerError();
  }

  deleteBookingById(bookingId);
  return { success: true };
}
