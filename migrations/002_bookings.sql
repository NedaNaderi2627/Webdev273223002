-- Create bookings table for workstation reservations
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    workstation_id INTEGER NOT NULL,
    booking_date TEXT NOT NULL,
    slot INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Unique index to prevent double booking of the same workstation, date, and slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_workstation_date_slot
ON bookings (workstation_id, booking_date, slot);