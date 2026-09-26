# 2026-09-26 — M8 confirmed in-app shortcuts

## Scope

First independent M8 source slice, explicitly allowed while M7 physical/manual closure remains deferred.

Validated application source baseline entering this slice:
`76ef5dadf1d6587ee52d029d980ad4de7a9abd93`.

The branch was created from current tracking main `3dba05260e19a04c458d2a24a477d8caeb31b844`; tracking-only commits after the source baseline do not replace it.

## Implemented shortcut routing

Confirmed Windows in-app shortcuts:

- `Ctrl+Alt+T` — open the existing persistence-first quick-task workflow;
- `Ctrl+Alt+B` — start manual break through the existing authoritative timer mutation;
- `Ctrl+Alt+P` — pause/resume through existing timer transitions; break state uses authoritative break skip/resume behavior;
- `Ctrl+Alt+S` — skip the live task through the existing Focus action logic;
- `Ctrl+Alt+F` — finish the active task through the existing Focus Done logic;
- `Ctrl+Alt+N` — open active Notes; collapsed Floating Timer expands first through its existing native resize path;
- `Ctrl+F` — Search in Main; explicitly unavailable with user-facing feedback in Focus mode.

## Architecture and correctness

- Added one shared typed chord resolver in `src/inAppShortcuts.ts`; held-key repeats and shifted/meta variants do not alias destructive actions.
- Main never duplicates timer mutation logic. For Focus actions it samples the authoritative timer read-only, reports no-active-task locally, then routes a typed event to `focusSurface`.
- `FocusLiveActions` owns the actual B/P/S/F/N shortcut mutations and calls the same handlers/APIs as the visible controls.
- Collapsed Floating Timer keeps the action controller mounted but visually absent, preserving compact layout while allowing in-app shortcuts.
- Notes shortcut expands Floating Timer through the existing safe native resize path before opening Notes.
- Editable inputs/selects/contenteditable surfaces suppress Ctrl+Alt action shortcuts to avoid accidental mutation while typing.
- Search remains intentionally unavailable in Focus mode per the confirmed product behavior.
- Quick task creation in Focus reuses `SearchPalette` in task-create-only mode and publishes success only after `createListBoardTask` resolves.
- User-facing unavailable/delivery/list-loading/mutation failures remain visible rather than silently ignored.

## Tests and evolved contracts

- Added executable `scripts/test-in-app-shortcuts.mjs` for chord resolution and routing/authority invariants.
- Registered `test:in-app-shortcuts` in frontend preflight.
- Evolved SearchPalette's old Ctrl+F static contract to require the shared resolver.
- Evolved collapsed Floating Timer static contract to allow a hidden mounted action controller while preserving collapsed title/timer hierarchy.
- Existing Focus/Timer tests continue to cover manual break, pause/resume, skip, done, Notes, timer persistence, and authoritative session boundaries.

## Validation state

Exact-head Windows CI: PENDING.

Do not mark M8 shortcut TODO items complete until exact-head Windows validation and required merge/main validation succeed.

## Deferred evidence

M7 physical/manual checks and the not-yet-uploaded Blitzit video corpus remain OPEN but are not blockers for this independent source slice.
