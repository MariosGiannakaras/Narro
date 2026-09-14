# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, the Focus/Blitz sections of `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` when reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **13 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

General roadmap progress: **5/10 milestones complete**.

Item-14 implementation slice: **2/5 checkpoints complete**.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`7ca86fbb9190c1e177f5913a3080e12b83ee4706`

Source tree:

`2919ba53996bf58e2873064af09fc15e363bc406`

This remains the expected-head guarded squash merge of PR #113 after authoritative resulting-main Windows CI #428 passed on the exact merged source SHA. Markdown-only tracking descendants and the current unvalidated item-14 branch do **not** replace this validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-14-chatgpt-m6-focus-reserved-action-slots.md`

## ACTIVE IMPLEMENTATION SLICE

**M6 item 14/16 — Add tooltips for icon-only controls.**

Implementation branch:

`m6-focus-icon-tooltips`

Branch base/tracking tip:

`c162d159a4e69eb3ee8312a9b11c589135cb435c`

Latest source/test implementation head before this handoff-only commit:

`e8d0221d36ac45056189d7a7df7fae5febe77775`

No item-14 PR exists yet.

### Checkpoint 1/5 — COMPLETE: contract reconstructed

Repository/code evidence establishes the narrow contract:

- reuse the validated shared `Tooltip` primitive, including pointer intent, keyboard-focus discovery, `aria-describedby` association and Escape dismissal;
- add tooltips only where Focus currently has genuinely icon-only controls without the shared tooltip path;
- preserve every existing accessible name and existing action/disabled behavior;
- preserve item-13 reserved geometry and hit-target locations; tooltip disclosure must not resize or move controls;
- already-tooltipped shared `TaskSubtasks` and `TaskNotes` controls must remain unchanged rather than gaining duplicate tooltip layers;
- text-labelled Home, live Break/Notes/Pause-Resume/Skip/Done controls, metric values and the labelled subtask toggle are outside the icon-only slice;
- disabled Preferences and Compact-view placeholders must remain functionally inactive; item 14 must not implement their later product behavior;
- item 15 visual-state polish, item 16 empty-state work, Milestone 7 Floating Timer and Milestone 8 settings/shortcuts remain separate.

The actual missing icon-only Focus tooltip surfaces are:

- topbar Preferences (`⚙`) placeholder;
- topbar Compact view (`↙`) placeholder;
- live-subtask Add (`+`) control;
- paused metric Cancel (`×`) and Save (`✓`) controls.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic/static review

Changed source/test/config scope before this handoff is exactly six files:

- `src/FocusPanel.tsx`
  - Preferences and Compact-view icon placeholders now reuse the shared `Tooltip` primitive;
  - native `title` duplication was removed for those two controls;
  - they use `aria-disabled="true"` with their existing accessible names so keyboard focus can disclose the tooltip while no click/action handler exists;
  - text-labelled Home remains native-disabled and outside the icon-only slice.
- `src/FocusLiveSubtasks.tsx`
  - wraps the existing `+` Add-subtask control in `Tooltip content="Add subtask"` while retaining its contextual accessible label and existing disabled/action semantics.
- `src/FocusLiveMetrics.tsx`
  - wraps the existing paused-editor Cancel/Save icon controls in contextual shared tooltips while retaining their aria labels, handlers and disabled state.
- `src/focusActionSlots.css`
  - preserves the validated item-13 action-slot rules;
  - adds only Focus-topbar styling that keeps keyboard-discoverable `aria-disabled` placeholders visually non-actionable and neutralizes active hover/press styling without changing geometry.
- `scripts/test-ui-focus-icon-tooltips.mjs`
  - locks exact icon-only coverage, reuse of the shared accessible tooltip primitive, placeholder non-activation, preservation of existing TaskSubtasks/TaskNotes tooltips, and unchanged topbar/metric geometry.
- `package.json`
  - registers the deterministic item-14 contract in `preflight:frontend`.

Review evidence:

- compare from base `c162d159a4e69eb3ee8312a9b11c589135cb435c` is ahead only, with exactly the six files above before this handoff;
- no Rust/Tauri, SQLite/schema, dependency/lockfile, task/domain, timer/session, scheduling, display-topology or persistence code changed;
- no new action handlers or functional behavior were added to Preferences or Compact view;
- no transform, margin, transition or alternate layout model was added to the validated item-13 geometry path;
- the new `.mjs` test passes local `node --check`;
- full local repository/frontend/Rust/Tauri preflight is **NOT RUN** because no local repository checkout/toolchain path is available in this implementation environment; authoritative Windows CI remains required.

### Checkpoint 3/5 — PENDING

Open one PR from `m6-focus-icon-tooltips`, fetch its exact head SHA, and require authoritative Windows CI on that exact head: Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads. If CI fails, inspect the exact failure and fix only evidence-backed problems on the same branch/PR.

### Checkpoint 4/5 — PENDING

After exact-head CI success, verify the unchanged exact head, mergeability, changed-file scope and all PR conversation comments/reviews/inline threads. Then squash merge with an expected-head guard.

### Checkpoint 5/5 — PENDING

Validate the resulting main source SHA with authoritative Windows CI. Only after full success reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable item-14 work log; M6 then becomes 14/16.

## INVARIANTS THAT MUST NOT REGRESS

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and item-10 recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged by presentation work.
- renderer title/action/tooltip presentation cannot become timer/session/task authority.
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe.
- item-12 ordinary Focus row titles remain two-line-clamped with keyboard-accessible full-title access.
- item-13 hidden/revealed action controls keep their reserved geometry and existing hit positions.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard activation only.
- reduced-motion remains usable and timer numerals retain fixed/tabular geometry.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Open/inspect the item-14 PR from `m6-focus-icon-tooltips`, record its exact head SHA, and run authoritative Windows CI. Do not start item 15 in parallel. If CI fails, inspect the exact failing log and make only an evidence-backed correction on this same branch/PR.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks item 14.
- Full local repository/Rust/Tauri preflight remains unavailable in this environment; the new deterministic test itself passed `node --check`, and Windows CI is the authoritative validation gate.
