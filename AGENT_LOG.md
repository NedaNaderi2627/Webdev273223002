# Agent log

One entry per agent session, newest at the bottom. Be honest: what went wrong is the useful part.

<!-- Copy this block for each session:

## YYYY-MM-DD · <short title>
- Goal:
- Delegated:
- Checkpoints:
- Went wrong:
- Changed by hand:

-->

## 2026-06-06 · Build slice 1
- Goal: sign-in and the lab list, per SPEC.md slice 1
- Delegated: plan, database setup, sign-in, list screen
- Checkpoints: read the plan, opened the labs table, tried the list without signing in
- Went wrong: none so far
- Changed by hand: none

## 2026-11-11 · Exercise 3 · Book a workstation (Slice 2)
- Goal: Implement workstation booking with overlap validation (409), authorization checks (401/403), tests, and UI states per SPEC.md Slice 2
- Autonomy: The agent works alone within one step of the plan; I read the diff before every commit
- Checkpoints: plan review before any code, npm test green before each commit, permission prompt for everything in "Always ask before"
- Delegated: migration file, service function, routes, UI screen, initial test drafts
- Went wrong: none so far
- Changed by hand: none

### Plan
1. `migrations/002_bookings.sql`: Create `bookings` table with `user_id`, `workstation_id`, `date`, `start_time`, `end_time`, and unique index.
2. `src/services/bookings.js`: Implement `createBooking` (throws overlap error) and `cancelBooking`, with direct unit tests for AC-2.
3. `src/routes/bookings.js`: Implement endpoints with proper status codes.
4. `src/web/bookings.js` & `views/booking.ejs`: Booking UI with loading, empty, and error states.
Changed in review: Ensured overlap rule lives strictly in `src/services/bookings.js`, separated 401 from 403, and avoided external date libraries.

## What the agent did that I did not ask for
- Pending final diff review after implementation steps.