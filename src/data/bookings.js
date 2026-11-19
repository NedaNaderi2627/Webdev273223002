import db from './db.js';

export function insertBooking({ userId, workstationId, date, startTime, endTime }) {
  const stmt = db.prepare(`
    INSERT INTO bookings (user_id, workstation_id, date, start_time, end_time)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(userId, workstationId, date, startTime, endTime);
  return {
    id: result.lastInsertRowid,
    userId,
    workstationId,
    date,
    startTime,
    endTime,
  };
}

export function listBookingsByWorkstationAndDate(workstationId, date) {
  return db
    .prepare(
      `SELECT id, user_id, workstation_id, date, start_time, end_time
       FROM bookings
       WHERE workstation_id = ? AND date = ?`
    )
    .all(workstationId, date);
}

export function findBookingById(bookingId) {
  return db
    .prepare(
      `SELECT id, user_id, workstation_id, date, start_time, end_time
       FROM bookings
       WHERE id = ?`
    )
    .get(bookingId);
}

export function deleteBookingById(bookingId) {
  return db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
}
