# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, theme-related sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Inspect open implementation PRs and their exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **26 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `e142ff2f7d131570f01b5daf24d1122e4f219620`

Source tree: `505e62200da03b8469e7036c241dcc1e45b06e78`

Latest reconciled main tracking tip before this feature branch: `0db81e3ad0128579ac5b173083c3565824a8485f`.

Markdown-only tracking/checkpoint commits do not replace the validated source baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 26/28 — Archived lists/tasks surfaces.**

Immutable evidence: `work-log/2026-09-12-2102-chatgpt-m5-archives.md`.

- final exact PR #98 head `221b4c888294d563c13b5b280017ca1f59b77590`;
- Windows PR CI #385 / run `34701194858` / job `103573146278`: **SUCCESS**;
- merged source SHA `e142ff2f7d131570f01b5daf24d1122e4f219620`;
- Windows main CI #386 / run `34701768320` / job `103574673946`: **SUCCESS**.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 27/28 — Light/dark/system theme.**

Implementation branch: `m5-theme-preference`.

Current small-slice progress: **1/5**.

### Checkpoint 1/5 — COMPLETE: reconstruction + narrow contract

Repository reconstruction established:

- no open implementation PR existed when this branch was created;
- `ThemePreference::{System, Dark, Light}` already exists in the authoritative Rust preferences domain and `PreferencesPayload.general.theme` defaults to `System`;
- SQLite preferences persistence already round-trips the full payload through `get_preferences`, `initialize_preferences` and `save_preferences`;
- `src/theme.css` already provides explicit `data-theme="light"`, `dark`, `system` selectors and `prefers-color-scheme: dark` resolution for System mode;
- both `main` and `focusSurface` import the shared theme CSS indirectly through `App.css`, but neither currently loads persisted theme or listens for preference changes;
- the current main `Settings` utility is only a placeholder;
- current screenshot/source evidence shows a `General` Preferences section with a segmented `System / Dark / Light` theme control;
- item 27 must not absorb timezone, hide-times, EST parsing, Pomodoro, alerts, monitor/side, celebration or other Milestone 8 preference families.

Narrow implementation contract:

1. Add a theme-specific renderer boundary over the existing authoritative preferences row; do not add schema or a parallel settings store.
2. `get_theme_preference` initializes the existing default preferences row if absent and returns the persisted theme token.
3. `set_theme_preference` validates `system|dark|light`, mutates only `general.theme`, preserves every other persisted preference field, commits through existing `save_preferences`, and returns the committed theme.
4. After a committed theme change, emit one `theme-preference-changed` event to synchronize both webviews. A post-commit emit failure must be logged separately and must not report the committed preference write as failed.
5. Add one minimal shared theme runtime provider used by both `main` and `focusSurface`. It loads the persisted preference on mount, applies it to `document.documentElement.dataset.theme`, listens for the cross-webview event, and avoids polling/duplicating authority.
6. Keep `System` as the persisted/root token `system`; existing CSS media-query resolution follows Windows/WebView2 color-scheme changes without rewriting the stored preference.
7. Add only the evidenced theme subsection to the current Settings destination: `Preferences` → `General` → `Theme` with System/Dark/Light segmented controls. User-visible selection changes only after persistence succeeds; failures keep the prior applied theme and surface an alert.
8. Theme changes are presentation/preferences-only and must not reset or mutate task/list/timer/session/scheduling state.
9. Add deterministic Rust preservation/idempotence tests, frontend static contracts, and Windows Edge theme-preference fixtures/DOM validation. Existing broad light/dark fixture coverage remains the hierarchy-preserving visual baseline.
10. No dependency/lockfile/schema change is expected.

## FIVE CHECKPOINTS FOR THIS SLICE

1. reconstruction + narrow theme contract — **COMPLETE**;
2. implementation + deterministic/runtime coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- authoritative preferences remain local SQLite-backed domain state; renderer state is projection only;
- setting theme preserves all non-theme preference fields;
- committed local mutations are never reported as failed because a secondary event broadcast fails;
- both normal webviews consume the same persisted theme and do not create separate theme authority;
- System mode follows the OS/browser color scheme through the existing CSS media query, with no polling;
- list/task/subtask identities, archives, Search, timer/session/Time Taken, scheduling/date-only/timezone/recurrence/reminders and Notes behavior remain unchanged;
- theme changes must not destroy/recreate a webview or reset authoritative runtime state;
- keyboard/focus-visible access and reduced-motion behavior remain required;
- no auth/cloud/telemetry/trial/upgrade/profile/AI/integration authority is introduced.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Continue checkpoint 2 on `m5-theme-preference`: implement the theme-specific Rust command/event boundary, shared main/focus runtime provider, theme-only Settings surface, deterministic tests and Windows Edge fixture/DOM validation. Review the full branch diff against `0db81e3ad0128579ac5b173083c3565824a8485f` before opening a PR. Full local preflight is unavailable in the connector environment; use static/semantic checks available here, then require authoritative Windows CI on the exact PR head.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks item 27.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative for Rust/Tauri validation.
