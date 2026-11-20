# Readiness Report — Exercise 4

## Summary
Current readiness assessment for the University Lab Booking application ahead of Exercise 4 completion and final defence.
The Node.js HTTP server (`server.js`) provides `/health`, `/api/recommendations` (with fallback schedule logic), and a minimal UI (`/`), alongside unit tests and CI coverage gates.

How I checked: Inspected `server.js`, `src/services/recommendations.js`, `src/services/bookings.js`, `course.json`, and ran `node checks/ex4.mjs`.

## Live URL
Current `liveUrl` in `course.json` is not yet populated because the production deployment on Render is pending.
Once deployed, the live URL (no trailing slash) will be placed in `course.json` and verified via `GET /health` and `GET /api/recommendations`.

How I checked: Checked `course.json` (`liveUrl` is currently empty) and tested local endpoints on port `3000`.

## Environment variables
Application configuration is documented in `.env.example` (such as port, database URL, and model/provider settings) without committing secrets or `.env`.
Production Neon PostgreSQL connection values and provider keys must be configured in the hosting environment before full production cutover.

How I checked: Verified `.env.example` exists and no `.env` file is committed via `node checks/ex4.mjs`.

## Fail
When an upstream model request fails or times out, `/api/recommendations` falls back cleanly to deterministic schedule suggestions (`source: "fallback"`) rather than crashing the server.
On the client, HTTP errors and network failures display readable messages (`"Could not load recommendations right now. Please try again."` and `"Network error while loading slot recommendations. Please check your connection."`) instead of raw stack traces or JSON dumps.

How I checked: Queried `GET /api/recommendations` locally and reviewed error/fallback branches in `server.js` and `src/services/recommendations.js`.

## States
The slot recommendation UI handles four states in concept and code:
- **Loading:** Updates `#status` immediately to `"Thinking and loading slots..."` on form submission.
- **Empty:** Displays `"No slots available for this selection. Try another date or workstation."` when no slots match.
- **Error:** Displays a plain-language error message on failed requests or network issues.
- **Success:** Updates `#status` with recommended/fallback slots in place without a full page reload (full booking create/cancel UI states remain a gap).

How I checked: Inspected `/` HTML/JS in `server.js` and verified `/api/recommendations` response behavior via `curl`.

## Waterfall
A typical recommendation request starts with form submission in the browser, followed by a single `GET /api/recommendations?workstationId=...&date=...` request to `server.js`, which queries slot/recommendation logic and returns JSON so the UI updates `#status`.
Full client-side waterfall timing across cold starts and live Neon PostgreSQL queries still needs measurement after Render deployment.

How I checked: Traced the client `fetch` call and route handler in `server.js`.

## Security
Basic input handling, explicit labels, `:focus-visible` styling, and absence of committed `.env` secrets are in place.
Full authentication/authorization flows, session/token hardening, and rate-limiting/input-validation audits remain gaps to address before final defence.

How I checked: Reviewed `server.js`, `.env.example`, and `docs/UI.md`.

## Model
In production, slot recommendations call the configured model provider with a timeout and fall back to deterministic slot suggestions (`source: "fallback"`) if the model is unavailable or slow.
- **Data leaving the app:** The app only sends non-sensitive booking lookup parameters (`workstationId` and `date`) outside to the model provider when requesting slot suggestions. Sensitive data such as passwords, authentication tokens, personal user profiles, and raw database records never leave the app or go to third-party services.
- **Cost per request:** Exact per-request pricing depends on the configured model/tier and token length; placeholder/estimate to be confirmed against the provider pricing page (checked 2026-11-20; exact billable rate still to be recorded once final model ID is locked).
- **When the provider is down:** When the model provider is down, times out, or returns an error, the service falls back to local/deterministic slot suggestions (`source: "fallback"`) and keeps the UI and API working.

How I checked: Inspected `src/services/recommendations.js` and tested `GET /api/recommendations` locally.

## MCP
The MCP server command is declared in `course.json` (`"mcp": "npm run mcp"`).
- **Who may call MCP tools & what it grants:** MCP access is intended for authorized local/configured client sessions invoking the declared tool handlers; fine-grained caller identity/role enforcement in production still needs explicit review and hardening.

How I checked: Checked `course.json` and `package.json` scripts.

## Known gaps, ranked by risk
1. **High — Production Database Persistence (Neon / PostgreSQL):** Moving from local SQLite (`src/data/db.js`) to persistent Neon PostgreSQL so bookings and state survive redeploys.
2. **High — Live Deployment & `liveUrl`:** Completing Render deployment and setting `liveUrl` (without trailing slash) in `course.json`.
3. **Medium — Auth & Booking UI Flows:** Implementing complete sign-in/sign-out and in-page booking create/cancel actions with immediate no-reload success states.
4. **Medium — Responsive, Contrast & Dark Mode Polish:** Testing 380px/768px/1280px viewports, measuring text contrast with a contrast tool, and finalizing the dark-mode decision.
5. **Low — Screenshots & Evidence Links:** Capturing UI state screenshots and model thinking/fallback screenshots for `docs/UI.md`.

How I checked: Cross-referenced `docs/UI.md`, `src/data/db.js`, `course.json`, and `node checks/ex4.mjs`.
