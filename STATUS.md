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
- Milestone 6: **ACTIVE / 13 of 16 top-level items validated**.
- Milestones 7–10: **NOT STARTED**.

General roadmap progress: **5 of 10 milestones complete**.

M6 items 1–13 are validated. The next ordered work is item 14: **Add tooltips for icon-only controls.** Do not skip ahead to later Focus visual states, empty states, Floating Timer, shortcuts/preferences, Reports, or release work.

## Current validated source baseline

Latest fully resulting-main-validated **source/test** baseline:

`7ca86fbb9190c1e177f5913a3080e12b83ee4706`

Tree:

`2919ba53996bf58e2873064af09fc15e363bc406`

This is the expected-head guarded squash merge of PR #113 — `M6: reserve Focus action slots` — from exact validated PR head `864e1bb82582dcc38d1188989900ab80ff09accd`.

Windows resulting-main CI #428 / run `34838648618` / job `103958220072` passed on this exact source SHA. Markdown-only tracking descendants created after this source SHA do **not** replace the validated source/test baseline.

Main validation artifacts:

- visual regression artifact `10345666316`, digest `sha256:98b2426e33fea6af375b1620c51bd5075569e6b6ced37f97eb03849154c26d93`;
- diagnostic/runtime-harness artifact `10345880764`, digest `sha256:1a25b508373f21ccd02b4f0c0502b6ac5c9cd666204e359cf9940cd26320823e`.

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

### Item 11 — configured live-title scrolling

Immutable evidence: `work-log/2026-09-14-chatgpt-m6-focus-live-title-scrolling.md`.

Validated behavior:

- the established persisted `focus.scrolling_title` preference is reused; its safe default remains `false`;
- scrolling is confined to the active/live title and ordinary Focus row titles remain unchanged for item 12;
- disabled preference and enabled-without-overflow both retain static ellipsis;
- enabled overflowing titles use measured horizontal overflow plus `ResizeObserver` revalidation, with no polling or JavaScript animation loop;
- title motion is transform-only and does not alter timer/sibling geometry;
- `prefers-reduced-motion` disables the animation and restores static ellipsis while full-title access remains available;
- the production native preference boundary is read-only and adds no schema/migration or Preferences UI;
- timer/session/task/scheduling/display-topology authority remains unchanged.

#### PR #111 validation

The initial Windows CI #419 / run `34783581280` / job `103794887023` passed the frontend/static contracts and production frontend build, then failed only at `cargo fmt -- --check` for formatting in the new `src-tauri/src/focus_preferences.rs`. Only the exact rustfmt output was applied; no logic or scope change was introduced.

Final exact PR head:

`fe16914c341badea32c0087cc2a45385b0988de0`

Authoritative Windows CI #420 / run `34783673637` / job `103795136716`: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- PR visual artifact `10326121804`, digest `sha256:a2f832fa137f09bfb3bcde920921a174ded832aa291082c86d418ec101089972`;
- PR diagnostic/runtime artifact `10325962636`, digest `sha256:fa90989aadb279da4d9b526924acbaba9169b531f8740a20f87f2aaf159fb45b`.

Final review found the exact head unchanged and mergeable, exactly eight expected changed files, and no PR conversation comments, reviews or inline review threads.

Expected-head guarded squash merge source/test SHA:

`088b9dd75a7af0aa7e5d32dcbcfffdbc501d90cb`

Tree:

`fbc93b4779f1f8988b4e3f38e1205facf9f7023b`

Resulting-main Windows CI #421 / run `34785000692` / job `103798741480`: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- main visual artifact `10326331827`, digest `sha256:aaa71f3dbb91e522a1d1c8291939819729e720f0a31ad40e4c4463aa51cf8572`;
- main diagnostic/runtime artifact `10326422964`, digest `sha256:35abf0bba3a27fb9d42f3360eccd3e9f84abb3e252fe1f1159f9d51019a87afc`.

### Item 12 — ordinary Focus row-title wrapping and full-title access

Immutable evidence: `work-log/2026-09-14-chatgpt-m6-focus-row-title-wrapping.md`.

Validated behavior:

- only ordinary Remaining/Scheduled/Done Focus row titles use the new presentation; the active/live title remains on the separate item-11 path;
- ordinary titles can use up to two lines, then clamp rather than grow without bound;
- full text remains keyboard-accessible through the established shared `Tooltip` / `aria-describedby` mechanism;
- the Focus-specific tooltip anchor remains flexible with `min-width: 0`, preserving the existing horizontal title slot;
- long unbroken titles wrap safely with `overflow-wrap: anywhere`;
- second-line growth is vertical only; row width remains stable and item-13 action-slot behavior remains separate;
- no animation or transform was introduced for ordinary row titles;
- task/timer/session/scheduling authority and the item-11 active-title scrolling contract remain unchanged.

#### PR #112 validation

Final exact PR head:

`789cd1a69efca59e33035660a4b91c11d63f1a39`

Authoritative Windows CI #425 / run `34811100017` / job `103872454315`: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression, including the ordinary-row long-title geometry validator: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- PR visual artifact `10334544083`, digest `sha256:5d43cd8b449d5a854246819b6bf99fd3c641618fd65642f4a449dc624a6c261f`;
- PR diagnostic/runtime artifact `10334883696`, digest `sha256:7927d191f6877d533129ebe9622b50e9a5ce38ae44068c0220b510dc36f18312`.

Final changed-file scope was nine expected files: `HANDOFF.md`, `package.json`, the live-title preservation contract, the two new row-title test/validator scripts, `FocusPanel.tsx`, `FocusTaskRowTitle.tsx`, the Focus visual fixture and `focusTaskRowTitle.css`. PR #112 had no conversation comments, reviews or inline review threads.

Squash merge source/test SHA:

`a62ff3424525486ea1487429ff043d0139b85abd`

Tree:

`7d269939de6e5812e66ef1b002796d11132b00a7`

Resulting-main Windows CI #426 / run `34819905050` initially failed only in the unrelated existing scheduling visual validator after item-12 preflight and Focus captures had already passed. Attempt 1 job `103898850739` reported `task-scheduling-light fixture did not report ready state`; no source change was made. The same exact main SHA was rerun.

Successful attempt 2 job `103901669712`: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- main visual artifact `10338361964`, digest `sha256:659986ba76d0ac911ea80343d6e552eaf7826d355902efed1abba5970d9b2281`;
- main diagnostic/runtime artifact `10338572056`, digest `sha256:1f72c7c9c04cc93a65d28a495ffb8a44a081c87b0e8ec5d1b8e698f3633092f9`.

### Item 13 — reserved Focus action slots

Immutable evidence: `work-log/2026-09-14-chatgpt-m6-focus-reserved-action-slots.md`.

Validated behavior:

- Focus subtask Move up/Move down/Delete controls reuse the existing fixed `5.75rem` action column rather than creating a second geometry model;
- the action rail remains reserved at rest and hidden controls are pointer-inert;
- row hover and `:focus-within` reveal the controls in place through opacity/pointer state only;
- revealing controls does not change title width, sibling geometry or action target positions;
- no transform, margin shift, animation or transition was introduced;
- the live Break/Notes/Pause-Resume/Skip/Done strip remains a stable five-column grid;
- ordinary Focus task rows retain the item-12 two-line/full-title contract and do not gain invented task-action APIs;
- task/timer/session/scheduling/domain/native authority remains unchanged.

#### PR #113 validation

Final exact PR head:

`864e1bb82582dcc38d1188989900ab80ff09accd`

Authoritative Windows CI #427 / run `34825911944` / job `103917914647`: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression, including the new Focus action-slot geometry validator: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- PR visual artifact `10340298598`, digest `sha256:b0e3e14719b52c419b8d8c7db39f2769076bbc30cd8d5ea21cfd18c3a7535fe0`;
- PR diagnostic/runtime artifact `10340327995`, digest `sha256:a971057b66273e86a3a84f21d25a7f656cdcf0301377075ebc9eaa34c5ae2ca5`.

Final changed-file scope was six expected files: `HANDOFF.md`, `package.json`, `scripts/test-ui-focus-action-slots.mjs`, `scripts/validate-focus-action-slot-captures.mjs`, `src/FocusTaskRowTitle.tsx` and `src/focusActionSlots.css`. PR #113 had no conversation comments, submitted reviews or inline review threads.

Expected-head guarded squash merge source/test SHA:

`7ca86fbb9190c1e177f5913a3080e12b83ee4706`

Tree:

`2919ba53996bf58e2873064af09fc15e363bc406`

Resulting-main Windows CI #428 / run `34838648618` / job `103958220072`: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- main visual artifact `10345666316`, digest `sha256:98b2426e33fea6af375b1620c51bd5075569e6b6ced37f97eb03849154c26d93`;
- main diagnostic/runtime artifact `10345880764`, digest `sha256:1a25b508373f21ccd02b4f0c0502b6ac5c9cd666204e359cf9940cd26320823e`.

## Milestone 6 — next ordered work

The next top-level item is:

14. `Add tooltips for icon-only controls.`

Before implementation, reconstruct the current Focus icon-only controls and their accessible names, the shared `Tooltip` primitive, current disabled/placeholder controls, Focus keyboard/focus behavior and the already validated Milestone-5 tooltip/accessibility patterns. Add tooltips without changing control geometry or absorbing item 15 visual-state polish or item 16 empty states.

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
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe.
- ordinary Focus row titles remain two-line-clamped with accessible full-title access.
- Focus action controls keep item-13 reserved geometry and existing hit positions; item-14 tooltip work must not resize or move them.
- hover/focus interactions may not reflow sibling geometry; reduced-motion remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.