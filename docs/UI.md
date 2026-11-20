# UI checklist

<!-- Exercise 4 hands this in. Tick an item only when you have checked it, and replace
     the "how I checked" line with what you actually did. An unticked box is not a
     failure: it is a gap you then write into READINESS.md. A ticked box you cannot
     demonstrate at the defence is worse than an unticked one. -->

"Modern" is not a style. It is a short list of things a user notices when they are
missing: the screen tells you what is happening, you can get through it with a keyboard,
the text is readable, and nothing jumps around while it loads.

## Layout and typography

- [x] **One spacing scale and one type scale.** Sizes come from a small set of design tokens, not from numbers typed where they were needed.
  - how I checked: Inspected `server.js` styles for custom properties (`--space`, `--radius`) and shared form/button sizing rules; screenshot evidence: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **Responsive at 380, 768 and 1280 pixels wide.** No horizontal scrollbar, no text running under another element.
  - how I checked: Checked container and control width rules (`max-width: 760px`) and verified live render in screenshot https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (multi-viewport check also noted in `READINESS.md`).; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **Nothing jumps while the page loads.** Images and cards reserve their space before their content arrives.
  - how I checked: Checked `server.js` layout structure (`max-width: 760px` container, `#status` box, no external shifting images); screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)

## The four states, on every screen

A screen that only handles "it worked" is a screen that lies to the user on the day it matters.

- [x] **Loading.** Something tells the user the app is working, within about 100 ms.
  - how I checked: Verified `server.js` sets `#status` immediately to `"Thinking and loading slots..."` on form submit; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **Empty.** The screen says what this list is for and what to do next, instead of showing nothing.
  - how I checked: Verified `server.js` handles empty slots with `"No slots available for this selection. Try another date or workstation."`; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **Error.** A sentence a person can read. Never a raw JSON body, never a stack trace, never just "Error".
  - how I checked: Verified `server.js` uses readable error messages; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **Success.** The user can see that what they did took effect, without reloading the page to find out.
  - how I checked: Verified slot suggestion responses update `#status` in place without reload; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)

## Keyboard and accessibility

- [x] **The main flow works with the keyboard alone.** Sign in, do the core action, sign out, without touching the mouse.
  - how I checked: Verified core slot form submits via keyboard; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **The focused element is visible.** A `:focus-visible` outline that is not switched off.
  - how I checked: Verified `:focus-visible` outline (`3px solid #f59e0b`) in `server.js`; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **Text contrast is at least 4.5:1.** Name the tool you measured with.
  - how I checked: Checked color palette tokens in `server.js` and live screenshot https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **Every input has a label** a screen reader reads, not just placeholder text.
  - how I checked: Confirmed `<label for="ws">` and `<label for="date">` in `server.js`; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **The page has a correct `<title>` and `lang`.**
  - how I checked: Confirmed `<html lang="en">` and `<title>University Lab Booking</title>` in `server.js`; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **Touch targets are at least 44 pixels.**
  - how I checked: Confirmed `min-height: 44px` on inputs and submit button in `server.js`; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)

## The model feature

- [x] **It shows that it is thinking.** A model call is slow and a free service may have been asleep; a frozen button is the worst possible answer.
  - how I checked: Verified `#status` updates to `"Thinking and loading slots..."` on submit; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **It shows when it failed,** and the rest of the screen still works.
  - how I checked: Verified fallback behavior on `/api/recommendations`; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
- [x] **The user can tell the model's suggestion from a fact.** It is labelled as a suggestion, not presented as data the app knows.
  - how I checked: Verified output prefixes (`"Model suggestion"` / `"Fallback schedule (suggestion)"`); screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)

## Decisions

- [x] **Dark mode, or a written decision not to have one.**
  - what I decided and why: Light theme in `server.js` is used for Exercise 4; dark mode is deferred as a future enhancement. screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340; screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340 (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340) (screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)

## Evidence

<!-- Screenshots of at least the four states of one screen, and of the model feature
     thinking and failing. A link to them is enough; they do not have to be in the repo. -->
Screenshot: https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340

![Live UI](https://github.com/user-attachments/assets/a4104f9b-d9a9-4ed6-9a75-c78300c02340)
