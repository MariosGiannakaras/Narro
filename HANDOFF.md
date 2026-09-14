# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, the Focus/Blitz sections of `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` when reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **12 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

General roadmap progress: **5/10 milestones complete**.

Item-13 implementation slice: **2/5 checkpoints complete**.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`a62ff3424525486ea1487429ff043d0139b85abd`

Source tree:

`7d269939de6e5812e66ef1b002796d11132b00a7`

This is the squash merge of PR #112 after authoritative resulting-main Windows CI #426 passed on the exact merged source SHA in same-SHA attempt 2. Markdown-only tracking descendants after this source SHA do **not** replace the validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-14-chatgpt-m6-focus-row-title-wrapping.md`

## ACTIVE IMPLEMENTATION SLICE

**M6 item 13/16 — Reserve action slots for hover/focus controls so controls never push task text or move hit targets.**

Implementation branch:

`m6-focus-reserved-action-slots`

Branch base/tracking tip:

`7b49182fae61277794cd7650205149d2dfeef655`

Latest source/test candidate before this handoff-only checkpoint commit:

`1c51472eea4c4eb791b89ff4ffb34212412f461b`

Tree:

`e7424ef6967b77fcaaaa1093d68323b1ea8ffc21`

No item-13 PR exists yet.

### Checkpoint 1/5 — COMPLETE: contract reconstructed

Repository evidence establishes the narrow item-13 contract:

- Blitzit public history contains a repeated Focus-control signal: action buttons that move while targeted are disproportionately frustrating; Narro explicitly requires reserved geometry;
- `AGENTS.md` prohibits hover/focus animation from reflowing task text, moving sibling controls or changing row/card geometry and requires reserved/overlay action-icon slots;
- item 12 already established the ordinary Focus-row two-line/full-title contract and explicitly left action-slot work for item 13;
- the production live task already uses a stable five-column Break/Notes/Pause-Resume/Skip/Done strip; item 13 must preserve that geometry rather than redesign the action semantics;
- the production Focus subtask path already reuses `TaskSubtasks` Move up/Move down/Delete controls inside a fixed `5.75rem` action column; this is the existing Focus hover/focus control rail that can be hardened without introducing new task mutations;
- ordinary Remaining/Scheduled/Done rows currently expose no action controls, so item 13 does not invent reorder/delete task APIs or blank dead action geometry there;
- item 14 still owns any additional tooltip work; item 13 changes only geometry/reveal behavior.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic/static/visual review

Source/test changes before this handoff are exactly five files:

- `src/focusActionSlots.css`
  - Focus-scoped subtask action rail keeps a permanent `5.75rem` slot;
  - resting rail uses opacity/pointer hit-state only, never `display:none` or inserted layout;
  - row hover and `:focus-within` reveal the same existing controls in place;
  - no transform, margin shift, animation or transition was added;
  - live action buttons explicitly fill their existing five-column grid cells.
- `src/FocusTaskRowTitle.tsx`
  - one CSS side-effect import only; item-12 markup/accessibility behavior is unchanged.
- `scripts/test-ui-focus-action-slots.mjs`
  - locks Focus-only scope, reserved widths, hover/focus equivalence, no layout-removal/motion rules, stable live grid, existing subtask controls and item-12 title invariants.
- `scripts/validate-focus-action-slot-captures.mjs`
  - reuses existing Windows Focus captures and their measured live-action geometry;
  - requires identical action-strip width/height across light/dark and running/paused fixtures.
- `package.json`
  - registers the deterministic test in frontend preflight and the geometry validator in Windows visual regression.

Review evidence:

- compare from branch base shows exactly those five files and no Rust/Tauri, SQLite, domain, timer/session/task/scheduling or dependency changes;
- both new `.mjs` files passed local `node --check`;
- full local repository preflight / Rust / Tauri validation: **NOT RUN** because no local repository checkout/toolchain path is available in this environment; authoritative Windows CI is required;
- the candidate intentionally reuses existing Focus subtask mutations and live action semantics rather than adding a new renderer mutation path.

### Checkpoint 3/5 — PENDING

Open one PR from this branch and require authoritative Windows CI on the exact PR head: Repository Preflight, Windows visual regression including the new action-slot validator, Tauri Release and both required artifact uploads.

### Checkpoint 4/5 — PENDING

After exact-head CI success, verify unchanged head, mergeability, changed-file scope and all comments/reviews/threads; then squash merge with expected-head guard.

### Checkpoint 5/5 — PENDING

Validate the resulting main source SHA with authoritative Windows CI. Only after full success reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable work log; M6 then becomes 13/16.

## INVARIANTS THAT MUST NOT REGRESS

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and item-10 recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged by presentation work.
- renderer title/action presentation cannot become timer/session/task authority.
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe.
- item-12 ordinary Focus row titles remain two-line-clamped with keyboard-accessible full-title access.
- hidden/revealed action controls keep their reserved geometry and existing hit positions.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard activation only.
- reduced-motion remains usable and timer numerals retain fixed/tabular geometry.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Open/inspect the item-13 PR from `m6-focus-reserved-action-slots`, record its exact head SHA, and run authoritative Windows CI. If CI fails, inspect the exact failure and fix only evidence-backed issues on the same branch/PR. Do not start item 14.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks item 13.
- Full local repository/Rust/Tauri validation is unavailable; new script syntax checks passed locally and authoritative Windows CI remains required.