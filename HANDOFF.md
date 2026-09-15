# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, the Focus/Blitz sections of `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` when reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **14 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

General roadmap progress: **5/10 milestones complete**.

Current item-15 implementation slice: **0/5 checkpoints complete**.

Item 14 closed at **5/5 checkpoints complete** after exact-head PR validation, expected-head guarded merge, resulting-main validation and tracking reconciliation.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`08d06b6fcf9167d832c3e2f51e04756141f02b7b`

Source tree:

`3fa724f6fd92c6952729ab6f826d9fa8fd96cb47`

This is the expected-head guarded squash merge of PR #114 after authoritative resulting-main Windows CI #432 passed on the exact merged source SHA. Markdown-only tracking descendants after this source SHA do **not** replace the validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-15-chatgpt-m6-focus-icon-tooltips.md`

### Item-14 validation evidence

PR #114 — `M6: add Focus icon tooltips`

Final exact PR head:

`b5f21b93d36c84b9fbb83f75796f0f1d7ad7b680`

Authoritative PR Windows CI #431:

- run `34861579858`;
- job `104035182883`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10355218307`, digest `sha256:ceed21c226b08e25a86eb23c7fb394460aeef463b21c035745192615af9e6931`;
- diagnostic/runtime artifact `10355048819`, digest `sha256:a8f7e5cc1ecb4a9e2593c7305c14347a8b199ee3d859be883441dc723f26c80a`.

Final review found the exact head unchanged and mergeable, exactly eight expected changed files, no PR conversation comments, no submitted reviews and no inline review threads.

Expected-head guarded squash merge:

`08d06b6fcf9167d832c3e2f51e04756141f02b7b`

Authoritative resulting-main Windows CI #432:

- run `34999410686`;
- job `104483783226`;
- exact main source SHA `08d06b6fcf9167d832c3e2f51e04756141f02b7b`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10408799567`, digest `sha256:b7921a3d487e7189a9d25293ab452f6a71ffa03d2e16b44ffd7a1386ea780b8b`;
- diagnostic/runtime artifact `10409522085`, digest `sha256:dae179c6b33294e79db6a05da415172620d4752dd524402a138097238839551c`.

Validated item-14 behavior:

- shared keyboard/pointer-accessible tooltips cover Focus Preferences, Compact view, live-subtask Add and paused metric Cancel/Save icon-only controls;
- existing accessible names and active-control handlers/disabled semantics remain intact;
- Preferences and Compact view remain functionally inactive, handler-free placeholders while keyboard focus can discover their tooltips;
- existing TaskSubtasks/TaskNotes tooltip paths remain unchanged;
- item-13 reserved geometry and action hit targets remain unchanged;
- no Rust/Tauri, SQLite/schema, dependency, task/domain, timer/session, scheduling, display-topology or persistence behavior changed.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 15/16 — Implement active-card, paused, break, time-up/overtime, overdue, notes-expanded and no-eligible-task visual states.**

No item-15 implementation branch or PR is established by this handoff yet. Reconstruct the exact visual-state contract before creating or editing implementation source.

### Five checkpoints for item 15

1. Reconstruct the exact item-15 contract from current Focus production rendering, authoritative timer/session state definitions, current Notes/subtask/metric state, current fixtures/validators, `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, existing item-3–14 work logs/tests and the item-16 boundary — **pending**.
2. Implement the narrow visual-state presentation plus deterministic/static/visual coverage and semantic diff review without changing authoritative domain/native behavior or absorbing item-16 empty-state behavior — **pending**.
3. Validate the exact PR head with authoritative Windows CI: Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads — **pending**.
4. Verify the unchanged exact head, mergeability, changed-file scope and all PR conversation comments/reviews/inline threads, then squash merge with an expected-head guard — **pending**.
5. Validate the resulting main source SHA with authoritative Windows CI, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable item-15 work log — **pending**.

### Scope boundary to reconstruct before editing

Item 15 names these visual states explicitly:

- active card;
- paused;
- break;
- Time's Up / overtime;
- overdue;
- Notes expanded;
- no-eligible-task visual state.

Item 16 separately says `Handle empty/no-eligible-task states.` Therefore a zero-context agent must derive from repository evidence which no-eligible presentation styling belongs to item 15 versus which empty-state behavior/content/control flow remains item 16. Do not guess or collapse the two items into one slice.

Item 15 is presentation work. It must not create renderer authority, alter timer/session transitions, change eligibility or scheduling classification, mutate persistence semantics, implement Preferences/shortcuts, or start Floating Timer work.

## INVARIANTS THAT MUST NOT REGRESS

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and item-10 recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged by presentation work.
- renderer title/action/tooltip/visual-state presentation cannot become timer/session/task authority.
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe.
- item-12 ordinary Focus row titles remain two-line-clamped with keyboard-accessible full-title access.
- item-13 hidden/revealed action controls keep their reserved geometry and existing hit positions.
- item-14 icon-only tooltips retain keyboard/pointer discovery, accessible names, placeholder inactivity and stable geometry.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- future-timed Today tasks remain ineligible until due.
- Focus queue partitioning must not duplicate task identities or reinterpret scheduling state.
- Notes URLs remain explicit pointer/keyboard activation only.
- reduced-motion remains usable and timer numerals retain fixed/tabular geometry.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Reconstruct item 15 before editing. Inspect the current Focus rendering/state selectors and styles, especially `FocusPanel`, live timer/actions/metrics/subtasks/notes presentation, timer/session state definitions and all current Focus fixture capture/validation scripts. Compare those paths with the documented active, paused, break, Time's Up/overtime, overdue, Notes-expanded and no-eligible screenshots/spec rules. Establish the exact item-15/item-16 boundary, then create one coherent item-15 branch and implement only the evidence-backed visual-state delta.

Do not start Milestone 7 or later work in parallel.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks item 15.
- No manual Windows interaction is currently required before item-15 implementation; authoritative Windows CI remains the required source validation gate.
