# Lab Booking

<!-- Exercise 2. Write the non-goals first. Every acceptance criterion must be checkable in under a minute.
     Keep these headings exactly as they are: the self-checks look for them by name.
     The full target is on the course site under Resources → The course project. -->

## Project option
lab booking

## Goals
- Allow users to book specific lab time slots and services.
- Prevent scheduling overlaps for the same time slot.
- Support local sign-in and external provider authentication.

## Non-goals
- Real payment gateway is not integrated.
- Real SMS messages are not sent.
- Reminder and survey emails are simulated and logged in the database instead of external sending.
- No physical door access control.

## Constraints
- The project must be completed and testable within the simple course stack (Node.js, SQLite).
- Every acceptance criterion must be checkable in under a minute.
## The model feature
<!-- Which model, which modality, and what it does for a user.
     Name three things or the check fails: the input it receives, the output it produces,
     and what happens when the model is slow, rate-limited or wrong. -->
- Model:Gemini 2.5 Flash
- Input:User's requested service type and preferred date/time range.
- Output:Recommended optimal available time slot for the lab booking.
- When it fails:Falls back to showing standard available time slots manually without AI recommendation if the model is slow or rate-limited.

## Auth
<!-- Local sign-in plus at least one provider. Say how an account signing in both ways stays one account. -->
- Local:Username and password stored securely in SQLite database.
- Provider:OAuth / GitHub or Google login as external provider.
- Linking:Accounts are linked by matching the verified email address.

## MCP tools
<!-- At least three tools your own MCP server exposes over this project's data.
     Each tool calls the same service functions the HTTP API calls, so the same rules apply.
     A description shorter than 20 characters is not a description. -->
| Tool | What it does | Who may call it |
| --- | --- | --- |
| check_availability | Checks available time slots for a given lab and date | Authenticated user or system |
| create_booking | Creates a new lab booking for the user | Authenticated user |
| cancel_booking | Cancels an existing booking by its unique ID | Owner of the booking or admin |

## UI
- Stack: HTML, CSS, JavaScript (Vanilla / EJS)
- Screens:
  1. Sign-in / Authentication screen
  2. Lab booking and time-slot selection screen
  3. User dashboard to view and manage active bookings

## Architecture
- Layers & Files:
  1. UI / View: `views/booking.ejs` (User submits booking form).
  2. Route: `routes/bookingRoutes.js` (Receives HTTP POST request).
  3. Controller: `controllers/bookingController.js` (Processes logic and validates user input).
  4. Service / Model: `models/bookingModel.js` (Interacts with SQLite database).
- Exception / Architectural Deviation: AI recommendation logic in `services/aiService.js` is called directly from the controller rather than going through a dedicated middleware layer, deviating slightly from strict separation of concerns for simplicity.
## Acceptance criteria
- [AC-1] [Auth] A user who enters incorrect credentials on the sign-in screen sees "Invalid username or password", and no session token is issued.
- [AC-2] [Booking] A user who requests a time slot that overlaps with an existing booking sees "Time slot is already booked", and no new row appears in the `bookings` table.
- [AC-3] [AI] A user requesting an AI time-slot recommendation when the model is available sees optimal slots, and when the model fails, they see standard manual slots without crashing.
- [AC-4] A student who cancels their own booking sees the slot become available again immediately in the database and UI.
- [AC-5] A staff member who opens the admin panel sees the list of all active bookings across all university labs.
- [AC-6] A user who tries to book a workstation that is already occupied receives a conflict error message.
- [AC-7] The MCP tool `check_availability` returns the correct list of free workstations for a given date.
- [AC-8] Signing in with Google using an email address that already has a local password account links them into one single user account.

### Slice 1: sign-in and lab booking screen
- [AC-9] A visitor who opens the dashboard without signing in is automatically redirected to the `/login` page.
- [AC-10] After signing in with a seeded account, the user sees the list of available labs loaded directly from the database.
- [AC-11] Deleting a lab row directly in the database and reloading the page removes that lab from the user's screen.

## Traceability
| Criterion | Test |
| --- | --- |
| AC-1 | test('AC-1 invalid credentials show error and deny access') |
| AC-2 | test('AC-2 overlapping booking is refused with error') |
| AC-3 | test('AC-3 ai recommendation falls back correctly on failure') |

## Spec vs result
- Status: Ready for implementation and verification.