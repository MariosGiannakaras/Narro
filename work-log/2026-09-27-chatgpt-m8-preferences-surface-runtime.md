# 2026-09-27 — M8 Preferences surface and runtime-consumer slice

Status at creation: **SOURCE IMPLEMENTED / AUTHORITATIVE WINDOWS CI PENDING**.

## Baseline

- validated application source baseline entering this slice: `699b6ac46bcc6ebcabbcded21f929a7b32018b42`;
- tracking `main` at slice start: `72bb0d3d0d9a88cf31b97bcf6c77ffea7bced58a`;
- M8 already had confirmed in-app shortcuts plus persisted/global shortcut toggles automated-validated;
- M7 physical/manual closure remains OPEN and intentionally does not block this independent M8 source work;
- Blitzit videos are not yet present and are not a blocker for this source slice.

## Implemented source scope

### Unified typed Preferences boundary

Added `src-tauri/src/preference_settings.rs` plus `src/preferencesApi.ts`:

- reads the existing versioned SQLite Preferences payload rather than creating a second settings store;
- performs partial typed patches through the existing transactional `mutate_preferences` boundary;
- serializes Preferences mutations with a narrow native mutex;
- emits `preferences-changed` only after persistence succeeds;
- normalizes empty optional monitor/timezone values to `None`;
- validates Focus Panel side tokens;
- preserves unrelated preference families on partial patches;
- clearing the success screen also clears nested `fun_gif`;
- Open on Login coordinates native Windows autostart with the SQLite preference:
  - native transition first;
  - SQLite commit second;
  - native rollback if persistence fails;
  - postcondition verifies persisted intent matches observed native autostart state.

No remote sound/media catalog was invented. The snapshot reports local sound preview availability as false until a real Narro-owned/user-local catalog exists.

### Full Preferences surface

Extended the existing Theme Settings surface rather than creating a parallel Settings page:

- Blitz Panel:
  - dynamic monitor list from the existing native `list_monitors` command;
  - automatic primary-display option;
  - current display name/resolution/scale;
  - left/right Focus Panel side;
  - explicit stale/unavailable saved-display feedback and manual refresh;
- General:
  - Open on Login;
  - Hide EST / Time Taken;
  - Auto-parse EST from title;
  - Theme (existing authoritative path);
  - Timezone;
- Blitz Mode:
  - Pomodoro toggle;
  - work sprint duration;
  - Pomodoro break duration;
  - default manual break duration;
  - scrolling live title;
- Alerts:
  - timed task alerts;
  - alert interval;
  - task-alert sound row with explicit unavailable preview state;
  - animated timer flash;
  - notification alerts;
  - notification-sound row with explicit unavailable preview state;
  - schedule reminders;
  - reminder lead time;
- Celebration:
  - success-screen toggle;
  - nested Fun GIF toggle;
  - success-sound row with explicit unavailable preview state;
- existing Windows shortcut settings remain part of the same vertical Preferences surface.

Conditional/nested rows remain mounted and disable with the parent setting rather than collapsing/remounting, avoiding disruptive scroll jumps.

### Runtime consumers

Added an event-driven cross-window Preferences projection with no polling.

Connected validated/established consumers:

- Focus scrolling title updates live from committed Preferences events;
- manual Start Break uses persisted `default_break_seconds`; the old hard-coded M7 constant is removed;
- if the break preference is unavailable/loading, Focus reports that explicitly rather than applying an unsafe fallback;
- Hide EST / Time Taken preserves layout and reveals values on task/live-card hover or keyboard focus;
- conservative shared EST title-suffix parsing is gated by `auto_parse_est_from_title` across:
  - List Board create,
  - Search/quick-create,
  - Focus Add Task;
- supported EST suffix intent covers minutes, hours, and combined hours/minutes case-insensitively;
- title text is deliberately preserved because exact Blitzit suffix-removal/normalization remains unverified source-product fidelity.

Existing native consumers remain authoritative:
- selected monitor / Focus Panel side;
- configured timezone;
- Pomodoro mode/durations.

Persisted Alert/Celebration controls are exposed but this slice does **not** claim unimplemented sound assets or later alert/celebration runtime effects.

## UI/visual evidence

The existing Theme Settings production fixture now composes deterministic full Preferences state and monitors.

Windows visual capture adds:
- `theme-settings-preferences-upper`;
- `theme-settings-preferences-middle`;
- `theme-settings-preferences-lower`.

Validators require the complete section inventory, key controls, deterministic monitor/timezone values, and explicit unavailable sound-preview states.

## Regression contracts

Added:
- `scripts/test-ui-preferences.mjs`;
- `scripts/test-est-title-parser.mjs`.

Evolved legacy contracts that intentionally froze pre-M8 behavior:
- hard-coded ten-minute manual Break requirements now require the persisted M8 break duration;
- Focus live-title production coverage now requires the event-driven Preferences projection while retaining the older narrow Rust read helper as backward regression coverage;
- Theme Settings tests now permit/require composition of the remaining Preferences families.

## Explicit non-claims / next work

This slice does not yet mark the full M8 Preferences top-level roadmap item complete. Remaining source work may still include:
- actual local timed-alert/timer-flash/notification/schedule-reminder runtime effects where not already present;
- completion celebration runtime behavior;
- a real local sound catalog and non-overlapping preview behavior if/when validated Narro-owned/local assets exist;
- the separate Windows locale 12/24-hour display item;
- final screenshot/fidelity reconciliation, including future Blitzit video evidence.

## Validation

- Static/source review: completed during implementation.
- Authoritative Windows CI: **PENDING**.
- No physical/manual gate is claimed PASS by this work log.
