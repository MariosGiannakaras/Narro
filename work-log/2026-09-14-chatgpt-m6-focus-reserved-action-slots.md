# M6 Focus reserved action slots — validated implementation log

Date: 2026-09-14
Milestone: 6 — Blitz Mode / Focus Panel
Item: 13/16 — Reserve action slots for hover/focus controls so controls never push task text or move hit targets.

This entry is immutable evidence for the validated item-13 slice. Later Markdown-only tracking commits do not replace the validated source/test baseline recorded below.

## Contract reconstructed

Repository, product and UI evidence established the following narrow scope:

- public Blitzit feedback reports that Focus hover actions/labels can move controls and become difficult to target;
- `AGENTS.md` and `docs/UI_UX_SPEC.md` require hover/focus disclosure to preserve sibling geometry and action-target positions, with reserved/overlay action slots and keyboard/focus equivalents;
- item 12 already established the ordinary Remaining/Scheduled/Done two-line/full-title contract and left action-slot work for item 13;
- ordinary Focus task rows currently expose no action controls, so item 13 must not invent reorder/delete APIs or blank dead action geometry for them;
- the live Break/Notes/Pause-Resume/Skip/Done strip already uses a stable five-column grid and must keep that geometry;
- Focus subtasks already reuse `TaskSubtasks` Move up/Move down/Delete controls inside a fixed `5.75rem` action column, so the narrow implementation is to preserve that existing slot at rest and reveal its controls in place;
- item 14 remains responsible for any additional icon-only tooltip work.

## Implementation

Implementation branch: `m6-focus-reserved-action-slots`

Branch base/tracking tip: `7b49182fae61277794cd7650205149d2dfeef655`

Final PR head: `864e1bb82582dcc38d1188989900ab80ff09accd`

PR: #113 — `M6: reserve Focus action slots`

Final changed-file scope was exactly six files:

- `HANDOFF.md` — branch checkpoint only;
- `package.json` — frontend preflight and Windows visual validator registration;
- `scripts/test-ui-focus-action-slots.mjs` — deterministic geometry/reveal contract;
- `scripts/validate-focus-action-slot-captures.mjs` — stable live-action geometry validation across Focus captures;
- `src/FocusTaskRowTitle.tsx` — loads the Focus-scoped action-slot stylesheet without changing item-12 title markup/accessibility;
- `src/focusActionSlots.css` — reserved Focus subtask action rail and stable live-action slot fill.

Validated behavior:

- the existing Focus subtask action rail keeps its fixed `5.75rem` geometry even while controls are visually hidden;
- resting subtask actions use opacity plus pointer hit-state only; the rail is never removed from layout;
- row hover and `:focus-within` reveal the same existing Move up/Move down/Delete controls in the same positions;
- hidden controls are pointer-inert and revealed controls restore pointer targeting without shifting siblings;
- no transform, margin shift, animation, transition or alternate geometry model was added;
- the existing live action strip remains a stable five-column grid and each button fills its existing cell;
- ordinary Focus task-row title geometry from item 12 remains unchanged;
- no Rust/Tauri, SQLite, task/domain, timer/session, scheduling, display-topology, dependency or persistence behavior changed.

## Deterministic and visual coverage

`test-ui-focus-action-slots.mjs` locks:

- Focus-only stylesheet scope;
- fixed `5.75rem` reserved width and non-flexing rail;
- opacity/pointer reveal at hover and `:focus-within`;
- absence of layout removal, absolute-position replacement, margin shifts, transforms and transitions;
- existing fixed subtask action grid and stable five-slot live grid;
- reuse of existing Move up/Move down/Delete controls;
- preservation of item-12 two-line/flexible title invariants;
- frontend preflight and Windows visual-validator registration.

`validate-focus-action-slot-captures.mjs` reuses the existing Focus Windows captures and requires identical live-action strip width/height across light/dark and running/paused fixtures.

## Local validation

The branch checkpoint recorded both new `.mjs` files passing `node --check`.

A full local repository/Rust/Tauri preflight was **NOT RUN** because no local repository checkout/toolchain path was available in the implementation environment. Authoritative Windows CI remained the reproducible validation gate.

## Exact PR-head validation

PR #113 exact head:

`864e1bb82582dcc38d1188989900ab80ff09accd`

Windows CI #427:

- run: `34825911944`
- job: `103917914647`
- conclusion: **SUCCESS**

Required gates:

- Repository Preflight: **SUCCESS**
- Windows visual regression: **SUCCESS**
- Tauri Release: **SUCCESS**
- visual artifact upload: **SUCCESS**
- diagnostic/runtime artifact upload: **SUCCESS**

Artifacts:

- visual regression artifact `10340298598`, digest `sha256:b0e3e14719b52c419b8d8c7db39f2769076bbc30cd8d5ea21cfd18c3a7535fe0`;
- diagnostic/runtime artifact `10340327995`, digest `sha256:a971057b66273e86a3a84f21d25a7f656cdcf0301377075ebc9eaa34c5ae2ca5`.

Final review found the exact head unchanged and mergeable, exactly the six expected files above, no conversation comments, no submitted reviews and no inline review threads.

## Merge baseline

PR #113 was squash merged with an expected-head guard for `864e1bb82582dcc38d1188989900ab80ff09accd`.

Validated source/test merge SHA:

`7ca86fbb9190c1e177f5913a3080e12b83ee4706`

Tree:

`2919ba53996bf58e2873064af09fc15e363bc406`

Tracking-only descendants after this SHA do not replace this source/test baseline.

## Resulting-main validation

Windows CI #428:

- run: `34838648618`
- job: `103958220072`
- exact main source SHA: `7ca86fbb9190c1e177f5913a3080e12b83ee4706`
- conclusion: **SUCCESS**

Required gates:

- Repository Preflight: **SUCCESS**
- Windows visual regression: **SUCCESS**
- Tauri Release: **SUCCESS**
- visual artifact upload: **SUCCESS**
- diagnostic/runtime artifact upload: **SUCCESS**

Artifacts:

- main visual artifact `10345666316`, digest `sha256:98b2426e33fea6af375b1620c51bd5075569e6b6ced37f97eb03849154c26d93`;
- main diagnostic/runtime artifact `10345880764`, digest `sha256:1a25b508373f21ccd02b4f0c0502b6ac5c9cd666204e359cf9940cd26320823e`.

## Invariants preserved

- `main` plus reusable `focusSurface` remain the normal two-webview architecture;
- native/Rust remains monitor/work-area/DPI/physical-position authority;
- display reaction remains event-driven/coalesced;
- task/list/subtask identities, Focus queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged;
- renderer title/action presentation does not own timer/session/task state;
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe;
- item-12 ordinary Focus row titles remain two-line-clamped with keyboard-accessible full-title access;
- hidden/revealed Focus action controls now retain reserved geometry and existing hit positions;
- Break/Pause-Resume/Skip/Done semantics remain authoritative;
- future-timed Today tasks remain ineligible until due;
- Notes URLs remain explicit pointer/keyboard activation only;
- diagnostics remain gated behind `?diagnostics=1` and excluded account/cloud/integration controls remain absent.

## Roadmap continuation

After tracking reconciliation, Milestone 6 is **13/16** validated and general progress remains **5/10 milestones complete**.

The next ordered slice is M6 item 14/16:

`Add tooltips for icon-only controls.`

A zero-context continuation must reconstruct item 14 from current Focus icon-only controls, the shared accessible `Tooltip` primitive, current disabled/placeholder controls, Focus keyboard/focus behavior and existing M5 tooltip contracts before editing. Item 15 visual-state polish and item 16 empty states remain separate.
