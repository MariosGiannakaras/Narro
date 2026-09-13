# STATUS.md

Last updated: 2026-09-14

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`. Immutable implementation evidence lives under `work-log/`.

## Current phase

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5 / Gate E: **PASS** — all 28 top-level items validated.
- Milestone 6: **ACTIVE / 10 of 16 top-level items validated**.
- Milestones 7–10: **NOT STARTED**.

General roadmap progress: **5 of 10 milestones complete**.

M6 items 1–10 are validated. The next ordered work is item 11: **Implement configured scrolling behavior for the live title.** Do not skip ahead to ordinary row-title wrapping, action-slot/tooltips, later Focus visual states, Floating Timer, shortcuts/preferences, Reports, or release work.

## Current validated source baseline

Latest fully resulting-main-validated **source/test** baseline:

`fc0e52f6951e92f961aa8c38bee2069265bdaf1a`

Tree:

`c0012d64417d3791860d232a56f760b7cc12986d`

This is the expected-head guarded squash merge of PR #110 — `M6: react Focus Panel to display changes` — from exact validated PR head `8bd4021c9b2a2b63293acee42d9e29b5ab129ca6`.

Windows resulting-main CI #418 / run `34781877521` / job `103790256608` passed on this exact source SHA. Markdown-only tracking descendants created after this source SHA do **not** replace the validated source/test baseline.

Main validation artifacts:

- visual regression artifact `10324493612`, digest `sha256:3abcb8e113e78cc28275cc4791fec3d8fa0e5d6a7dd1704d4301d9a6d7595388`;
- diagnostic/runtime-harness artifact `10325578509`, digest `sha256:22ed8e6a29ad8679052379b97ec531a89cd5094a5845553fa19c8046f3fd3309`.

## Milestone 6 validated work

### Items 1–2 — Focus entry boundary

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-entry.md`.

- explicit `Blitz now` starts Focus; render/window lifecycle never implicitly starts a timer;
- Rust owns top eligible Today selection and scheduling eligibility;
- future-timed Today tasks remain ineligible until due;
- repeated/concurrent Focus entry cannot duplicate or silently switch the authoritative live session.

### Item 3 — Focus Panel hierarchy

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-panel-hierarchy.md`.

- normal `focusSurface` renders the product Focus Panel while diagnostics stay gated;
- hierarchy includes list selector, Today, quick controls, aggregate EST/progress, live card, Remaining, Add Task, Scheduled and Done;
- the panel projects existing authoritative state rather than creating renderer authority.

### Item 4 — authoritative Focus live timer

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-live-timer.md`.

- EST countdown, count-up, Pomodoro work/break, Time's Up and overtime project authoritative timer state;
- timer numerals use fixed/tabular geometry;
- renderer sampling is bounded/revision-aware and cannot determine elapsed-time correctness.

### Item 5 — Remaining / Scheduled / Done workflow

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-workflow-sections.md`.

- live identity is excluded from non-live sections;
- ordinary/overdue Today work stays in Remaining;
- future-timed non-overdue Today work is isolated in Scheduled;
- Done remains authoritative and section order is preserved.

### Item 6 — Focus live actions

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-actions.md`.

- Break, Notes, Pause/Resume, Skip and Done reuse authoritative timer/session/task boundaries;
- Done persists completion/Time Taken before best-effort next-task continuation;
- Notes reuse the validated editor/viewer and URLs remain explicit activation only.

### Item 7 — Focus subtasks/progress

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-subtasks.md`.

- Focus reuses persisted subtask identities/order/completion state;
- subtask mutations remain persistence-first;
- committed-refresh failure is represented as saved-but-not-refreshed and blocks unsafe repeated mutation until refresh/reopen.

### Item 8 — paused Focus EST / Time Taken editing

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-paused-metrics.md`.

- live EST and Time Taken are editable only for authoritative `paused` / `overtime_paused` state;
- edits reuse typed timer/session mutation boundaries and expected-value guards;
- committed-refresh failure cannot misreport the already-committed mutation as failed or trigger unsafe retry.

### Item 9 — selected-monitor / left-right Focus Panel placement

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-panel-placement.md`.

- production presentation reads persisted selected-monitor/side preferences in native code;
- explicit saved monitor selection resolves exactly and stale keys retain `MONITOR_SELECTION_STALE` rather than silently selecting another display;
- no saved monitor uses the native primary monitor plus persisted/default side;
- production and diagnostic placement reuse M1 physical work-area/DPI edge geometry;
- renderer code owns no monitor enumeration, DPI, work-area or physical-position calculations.

Validated source SHA for item 9: `3230808b61c6649b1adce166731c9ca1f5a2480b`; resulting-main Windows CI #416 passed.

### Item 10 — live display-topology reaction

Immutable evidence: `work-log/2026-09-14-chatgpt-m6-focus-display-reaction.md`.

Validated behavior:

- the existing M1 Win32 observer remains event-driven/coalesced; no polling was added;
- display geometry revalidation covers `WM_DISPLAYCHANGE`, `WM_DPICHANGED`, work-area `WM_SETTINGCHANGE`, and Windows resume events;
- generic M1 visible-work-area recovery runs before specialized selected-monitor/side Focus Panel revalidation;
- specialized revalidation runs only for an already-visible native Panel-mode `focusSurface`;
- display events cannot show/focus a hidden surface and cannot convert Timer/Floating presentation into Panel;
- exact saved-monitor semantics remain unchanged: stale explicit keys are not rewritten or silently redirected, while generic visible-area recovery can still keep the open panel reachable;
- no saved monitor keeps item-9 native primary-monitor fallback;
- display reaction does not mutate task/timer/session state and does not introduce renderer geometry authority, a third webview, Preferences UI or Floating Timer scope.

#### PR #110 validation

Exact PR head:

`8bd4021c9b2a2b63293acee42d9e29b5ab129ca6`

Tree:

`c0012d64417d3791860d232a56f760b7cc12986d`

Windows CI #417 / run `34779023404` first job `103782478568` passed repository preflight and all item-10 Rust/static tests, then failed only because the unrelated existing `task-scheduling-dark` visual capture missed its ready marker. The unchanged scheduling capture path had passed adjacent authoritative runs and the light capture passed in the failed attempt, so the same failed job was rerun on the unchanged exact head rather than introducing an unrelated source/harness patch.

Rerun job `103787883396`: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- PR visual artifact `10324987092`, digest `sha256:1e0db7c3b05c28509b32d0575094369a693c8767cdd641b16ef9fccf682ae9f2`;
- PR diagnostic/runtime artifact `10324709335`, digest `sha256:15f0a20b583a08698ecf316d705f2acee0206231a1274b0f1b6812011a521746`.

Final review found the exact head unchanged and mergeable, exactly four expected changed files, and no PR conversation comments, reviews or inline comments.

Expected-head guarded squash merge source/test SHA:

`fc0e52f6951e92f961aa8c38bee2069265bdaf1a`

Resulting-main Windows CI #418 / run `34781877521` / job `103790256608`: **SUCCESS** with all required gates/artifacts listed above.

## Milestone 6 — next ordered work

The next top-level item is:

11. `Implement configured scrolling behavior for the live title.`

Before implementation, reconstruct the current live-title rendering, the persisted scrolling-title preference/domain shape, existing shared motion/reduced-motion primitives, screenshot/source evidence and Focus visual fixture coverage. The slice must remain presentation-only: do not absorb ordinary Focus row-title wrapping, action slots/tooltips, later visual states, Floating Timer, or Milestone 8 Preferences UI.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` remain the normal two-webview model.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display-topology handling remains event-driven and coalesced; no renderer/high-frequency polling loop is introduced.
- generic visible-area recovery must remain effective even if selected-monitor revalidation fails.
- display events cannot activate hidden surfaces or change Panel/Timer presentation mode.
- authoritative task/list/subtask/session/timer/scheduling/note/archive/preferences state remains outside renderer memory; persistence-first mutations remain the success boundary.
- stable identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- future-timed Today tasks remain ineligible until due.
- repeated Focus entry cannot duplicate or silently switch an existing live session.
- Focus queue partitioning cannot clone identities or reinterpret scheduling state.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry/task switching/Notes opening.
- hover/focus interactions may not reflow sibling geometry; reduced-motion remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.