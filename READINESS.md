# Readiness Report — Exercise 4

## Summary
Current readiness assessment for the **University Lab Booking** application ahead of Exercise 4 completion and final defence.
The application is deployed and verified live on Render (`https://webdev273223002.onrender.com`) behind Cloudflare over HTTPS (`HTTP/2`), with `/health` returning `200 OK` (`{"status":"ok","db":"ok"}`), `recommendations` returning slot suggestions (`200 OK`) with deterministic fallback schedule support, and clean `404` JSON responses (`{"error":"Not found"}`) on invalid/undefined requests.

How I checked: Verified the live Render deployment via `curl` and browser DevTools, and cross-checked `server.js`, `src/services/recommendations.js`, `src/services/bookings.js`, `course.json`, and `node checks/ex4.mjs`.

## Live URL
The production deployment is live at `https://webdev273223002.onrender.com` (no trailing slash).
- **Health Check:** `GET https://webdev273223002.onrender.com/health` returns `HTTP/2 200` (`content-type: application/json; charset=utf-8`) with `{"status":"ok","db":"ok"}`.
- **UI & Slot Suggestion:** Opening `https://webdev273223002.onrender.com` renders the **University Lab Booking** UI (`Workstation ID: 101`, `Date: 12/01/2026`, **Suggest Slot** button), and clicking **Suggest Slot** requests `recommendations?workstationId=101&date=2026-12-01` (`200`, `240 ms`) and displays `Fallback schedule (suggestion): 09:00-11:00, 11:00-13:00, 14:00-16:00`.

How I checked: Ran live `curl` checks against `/health` and loaded `https://webdev273223002.onrender.com` in the browser while inspecting DevTools Network and UI output.

## Environment variables
Application configuration is documented in `.env.example` (such as port, database URL, and model/provider settings) without committing secrets or `.env`.
Production database connectivity is active on the live deployment (`"db":"ok"` on `/health`), and any remaining provider/environment variables should remain properly configured in Render without exposing secrets in the repository.

How I checked: Verified `.env.example` exists, checked that `.env` is not committed via `node checks/ex4.mjs`, and confirmed live health status on `/health`.

## Fail
When an upstream model request fails or times out, `/api/recommendations` / `recommendations` falls back cleanly to deterministic schedule suggestions (`Fallback schedule (suggestion): 09:00-11:00, 11:00-13:00, 14:00-16:00`) rather than crashing the server.
Malformed or invalid live requests also return clean JSON (`HTTP/2 404` — `{"error":"Not found"}`) instead of crashing or leaking stack traces:
- Malformed JSON on `POST /recommendations` (`{"workstationId": 101`) -> `HTTP/2 404` (`{"error":"Not found"}`)
- Empty JSON body `{}` on `POST /recommendations` -> `HTTP/2 404` (`{"error":"Not found"}`)
- Missing query parameters on `GET /recommendations` -> `HTTP/2 404` (`{"error":"Not found"}`)
- Unknown route (`GET /nonexistent-test`) -> `HTTP/2 404` (`{"error":"Not found"}`)

How I checked: Executed live `curl` tests against `https://webdev273223002.onrender.com` and reviewed error/fallback handling in `server.js` and `src/services/recommendations.js`.

## States
The slot recommendation UI handles four states in concept and code:
- **Loading:** Updates `#status` immediately to `"Thinking and loading slots..."` on form submission.
- **Empty:** Displays `"No slots available for this selection. Try another date or workstation."` when no slots match.
- **Error:** Displays a plain-language error message (`"Could not load recommendations right now. Please try again."` or `"Network error while loading slot recommendations. Please check your connection."`) on failed requests or network issues.
- **Success / Fallback:** Updates `#status` in place without a full page reload—verified live when clicking **Suggest Slot** for workstation `101` on `12/01/2026`, displaying `Fallback schedule (suggestion): 09:00-11:00, 11:00-13:00, 14:00-16:00` (full booking create/cancel UI states remain a gap).

How I checked: Inspected `/` HTML/JS in `server.js`, tested **Suggest Slot** on the live site, and verified response behavior via `curl`.

## Waterfall
- **Initial Page Load (`live-network-waterfall.png`):** `9 requests` (`474 kB transferred` / `476 kB resources`), `DOMContentLoaded: 374 ms`, `Load: 400 ms`, `Finish: 618 ms`, starting with the document (`200`, `1.5 kB`, `320 ms`), cached SVG (`0 ms`), and client JS bundles (`200`, `3 ms`–`55 ms`).
- **Interactive Slot Request (`live-network-suggest-slot.png`):** Clicking **Suggest Slot** triggers `recommendations?workstationId=101&date=2026-12-01` (`fetch`, `200`, `0.4 kB`, `240 ms`), bringing the session to `10 requests` (`475 kB transferred`).

How I checked: Captured and inspected the browser DevTools Network waterfall on initial load and after clicking **Suggest Slot** on `https://webdev273223002.onrender.com`.

## Security
Traffic is served over HTTPS (`HTTP/2`) via Cloudflare (`server: cloudflare`) to Render (`x-render-origin-server: Render`), undefined/restricted probes (`GET /bookings`, `HEAD /health`) return `HTTP/2 404` (`{"error":"Not found"}`) with no stack traces, and `.env` secrets are not committed.
Gaps remaining before final defence include adding explicit application-level HTTP security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`), full authentication/authorization flows, session/token hardening, and rate-limiting/input-validation audits.

How I checked: Inspected live HTTP response headers and error responses via `curl`, and reviewed `server.js`, `.env.example`, and `docs/UI.md`.

## Model
In production, slot recommendations call the configured model provider with a timeout and fall back to deterministic slot suggestions (`Fallback schedule (suggestion): 09:00-11:00, 11:00-13:00, 14:00-16:00`) if the model is unavailable or slow.
- **Data leaving the app:** The app only sends non-sensitive booking lookup parameters (`workstationId` and `date`) outside to the model provider when requesting slot suggestions. Sensitive data such as passwords, authentication tokens, personal user profiles, and raw database records never leave the app or go to third-party services.
- **Cost per request:** Exact per-request pricing depends on the configured model/tier and token length; placeholder/estimate to be confirmed against the provider pricing page (checked 2026-11-20; exact billable rate still to be recorded once final model ID is locked).
- **When the provider is down:** When the model provider is down, times out, or returns an error, the service falls back to deterministic slot suggestions and keeps the UI and API working.

How I checked: Inspected `src/services/recommendations.js` and tested slot suggestion behavior locally and on the live deployment.

## MCP
The MCP server command is declared in `course.json` (`"mcp": "npm run mcp"`).
- **Who may call MCP tools & what it grants:** MCP access is intended for authorized local/configured client sessions invoking the declared tool handlers; fine-grained caller identity/role enforcement in production still needs explicit review and hardening.

How I checked: Checked `course.json` and `package.json` scripts.

## Known gaps, ranked by risk
1. **High — Route & Parameter Validation Consistency:** Align local/live route behavior (such as returning `400 Bad Request` when required query parameters on `GET /recommendations` are missing instead of `404`, and reconciling local vs. live UI views).
2. **High — Security Headers & Auth Hardening:** Add explicit HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy`) and complete authentication/authorization and rate-limiting controls.
3. **Medium — Auth & Booking UI Flows:** Implementing complete sign-in/sign-out and in-page booking create/cancel actions with immediate no-reload success states.
4. **Medium — Responsive, Contrast & Dark Mode Polish:** Testing 380px/768px/1280px viewports, measuring text contrast with a contrast tool, and finalizing the dark-mode decision.
5. **Low — Screenshots & Evidence Links:** Storing and linking the captured evidence screenshots (`live-ui-ready.png`, `live-ui-result.png`, `live-network-waterfall.png`, `live-network-suggest-slot.png`) cleanly in the repository/docs.

How I checked: Cross-referenced live `curl`/DevTools findings with `docs/UI.md`, `src/data/db.js`, `course.json`, and `node checks/ex4.mjs`.
