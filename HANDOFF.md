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

Current small-slice progress: **2/5**.

Semantic-reviewed source/test candidate before this checkpoint-only HANDOFF commit:

`9662d03afdff3ec2cacdb96b3dfe0cb3a8847433`

### Checkpoint 1/5 — COMPLETE: reconstruction + narrow contract

Repository reconstruction established:

- no open implementation PR existed when this branch was created;
- `ThemePreference::{System, Dark, Light}` already exists in the authoritative Rust preferences domain and `PreferencesPayload.general.theme` defaults to `System`;
- SQLite preferences persistence already round-trips the full payload through `get_preferences`, `initialize_preferences` and `save_preferences`;
- `src/theme.css` already provides explicit `data-theme="light"`, `dark`, `system` selectors and `prefers-color-scheme: dark` resolution for System mode;
- both `main` and `focusSurface` import the shared theme CSS indirectly through `App.css`, but neither previously loaded persisted theme or listened for preference changes;
- the main `Settings` utility was previously only a placeholder;
- current screenshot/source evidence shows a `General` Preferences section with a segmented `System / Dark / Light` theme control;
- item 27 must not absorb timezone, hide-times, EST parsing, Pomodoro, alerts, monitor/side, celebration or other Milestone 8 preference families.

### Checkpoint 2/5 — COMPLETE: implementation + deterministic coverage + semantic/diff review

Implemented at reviewed candidate `9662d03afdff3ec2cacdb96b3dfe0cb3a8847433`:

- new Rust `theme_settings` renderer boundary reuses the existing preferences row and schema; `get_theme_preference` initializes/reads the persisted theme, while `set_theme_preference` validates `system|dark|light`, mutates only `general.theme`, preserves all other preference fields and commits through the existing `save_preferences` boundary;
- after a committed write, Rust broadcasts `theme-preference-changed`; event failure is logged separately and cannot turn a committed preference write into a renderer-visible mutation failure;
- Rust tests cover System default initialization/idempotence, preservation of unrelated general/focus/alerts/celebration preferences, repeated theme saves and invalid theme-token rejection;
- new shared `ThemeRuntimeProvider` is installed in both `main` and `focusSurface`; it listens before reading the persisted preference to avoid a stale startup read overwriting a newer cross-window event, projects only a valid theme token to `document.documentElement.dataset.theme`, and performs no polling;
- `System` remains the persisted/root token `system`; existing `theme.css` `prefers-color-scheme` media queries continue to resolve Windows/WebView2 light/dark changes without rewriting persistence;
- the Settings destination now exposes only the evidenced `Preferences → General → Theme` surface with System/Dark/Light segmented controls, accessible group/pressed semantics, persistence-pending state and role-alert failure state;
- selected theme changes only after the authoritative write has committed; a failed write keeps/reapplies the previous projected theme;
- the focus diagnostic presentation no longer hard-codes dark background/error colors and consumes the shared semantic theme tokens;
- deterministic static coverage validates Rust save-before-emit ordering, module/handler/API/runtime wiring, both webview providers, System OS-following CSS contract, absence of polling, and exclusion of later M8 preference families;
- dedicated production theme fixture/capture coverage includes System, Dark, Light and failed-save states; captured-DOM validation checks exact `data-theme`, selected `aria-pressed` option, accessible Theme group and rollback/error state;
- package/Vite wiring adds only the new static/Windows visual gates and one fixture input; no dependency, lockfile, schema, timer/session, scheduling, archive, Notes, Reports or cloud/account/integration source changed.

Branch-wide semantic/diff review against `0db81e3ad0128579ac5b173083c3565824a8485f` found:

- expected theme IPC/runtime/UI/test/capture scope only;
- `src-tauri/src/lib.rs` changes are limited to one module plus two command registrations;
- `vite.config.ts` final diff is exactly one fixture input;
- `package.json` changes are only the new theme static gate and Windows capture/validator wiring;
- no `Cargo.toml`, lockfile, migration, domain preferences schema, timer engine, archive persistence, scheduling, Notes or report implementation change;
- full local Node/Rust execution is unavailable in this connector environment, so authoritative strict TypeScript, rustfmt/clippy/tests and Windows Edge execution remain pending exact-head Windows CI.

## FIVE CHECKPOINTS FOR THIS SLICE

1. reconstruction + narrow theme contract — **COMPLETE**;
2. implementation + deterministic/runtime coverage + semantic/diff review — **COMPLETE**;
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

Inspect the exact current head of `m5-theme-preference` and any open PR. Open or resume the item-27 PR, then run/inspect authoritative Windows CI on that exact head. Fix only evidence-backed failures. Do not increment checkpoint 3 until Repository Preflight, production Windows Edge theme-settings captures/DOM validation, required visual artifact upload, Tauri Release and diagnostic artifact upload all succeed on the exact PR head. Then perform final exact-head review, expected-head guarded merge, resulting-main Windows CI, and tracking reconciliation before starting M5 item 28.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks item 27.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative for Rust/Tauri validation.
