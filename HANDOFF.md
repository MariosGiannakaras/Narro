# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, the Focus/Blitz sections of `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` when reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **14 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.
- General roadmap progress: **5/10 milestones complete**.
- Current item-15 implementation slice: **2/5 checkpoints complete**.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`08d06b6fcf9167d832c3e2f51e04756141f02b7b`

Source tree:

`3fa724f6fd92c6952729ab6f826d9fa8fd96cb47`

This is the expected-head guarded squash merge of PR #114 after authoritative resulting-main Windows CI #432 passed on the exact merged source SHA. Markdown-only tracking descendants after this SHA do **not** replace the validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-15-chatgpt-m6-focus-icon-tooltips.md`

Latest completed validation evidence:

- PR #114 exact head `b5f21b93d36c84b9fbb83f75796f0f1d7ad7b680`;
- PR Windows CI #431 / run `34861579858` / job `104035182883`: **SUCCESS**;
- resulting-main Windows CI #432 / run `34999410686` / job `104483783226` on source SHA `08d06b6fcf9167d832c3e2f51e04756141f02b7b`: **SUCCESS**;
- Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads passed on both gates.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 15/16 — Implement active-card, paused, break, time-up/overtime, overdue, notes-expanded and no-eligible-task visual states.**

Implementation branch:

`m6-focus-visual-states`

Branch base / tracking tip when the slice started:

`8a335e9bc186e65fe673b24b640c715bf01bdb20`

Latest source/test implementation head before this handoff-only checkpoint:

`260a5ea2abc35d85fe12057b2ab12545c9827ff4`

Open implementation PR:

**#115 — `M6: add Focus visual states`**

### Checkpoint 1/5 — COMPLETE: exact visual-state contract reconstructed

Repository/code/spec evidence establishes the following boundary:

- item 15 is **presentation only** over state already owned by authoritative timer/session, scheduling and board projections;
- the existing `data-focus-live-state` projection is the source for running, paused, break, `time_up`, `overtime_running` and `overtime_paused` visual treatment;
- running/active remains the strong accent presentation;
- paused and overtime use warning-state emphasis; break uses success-state emphasis; Time's Up uses destructive-state emphasis;
- overdue styling projects the existing authoritative `task.isOverdue` field and does not recalculate due state in the renderer;
- Notes-expanded styling reuses the existing `FocusLiveActions` -> `TaskNotes` expansion path and must not alter timer state or URL activation rules;
- the item-15 no-eligible **visual marker** is derived only when the existing Focus partition has no live task, no Remaining task and at least one Scheduled future-timed task;
- item 15 preserves the existing empty-card copy and adds no empty-state action/control flow; **item 16 remains responsible for actual empty/no-eligible behavior/content**;
- no new timer/session transition, eligibility rule, scheduling classification, task mutation, persistence boundary, native/window behavior, Preferences behavior or Floating Timer behavior belongs in this slice.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic/static/visual coverage + semantic review

Production presentation changes:

- `src/FocusPanel.tsx`
  - projects overdue rows through `data-focus-overdue` / a presentation class using existing `task.isOverdue`;
  - derives `noEligibleVisualState` only from the already-established Remaining/Scheduled partition;
  - adds `data-focus-live-state="no-eligible"` and a no-eligible presentation class without changing the existing `No live task in this view` copy or creating actions;
  - leaves authoritative live timer state projection unchanged.
- `src/focusVisualStates.css`
  - adds token-based active/running, paused, break, Time's Up, overtime, overdue, Notes-expanded and no-eligible presentation;
  - adds no transform, animation, transition, absolute positioning or margin-based target movement.
- `src/focusActionSlots.css`
  - loads the new Focus-scoped state stylesheet while retaining the validated item-13 fixed action geometry unchanged.

Coverage changes:

- `src/focusPanelVisualFixture.tsx` supports deterministic `running`, `paused-metrics`, `break`, `time-up`, `overtime`, `notes-expanded` and `no-eligible` scenarios while preserving established running/paused geometry contracts;
- Notes-expanded fixture execution uses the production Notes toggle and a fixture-only mock of the authoritative note-read boundary;
- `scripts/capture-focus-panel-fixtures.ps1` captures all seven scenarios in light and dark themes and gives only the asynchronous Notes-expanded scenario a 500 ms Edge virtual-time budget so its established production note-read/toggle path can settle before `--dump-dom`;
- new `scripts/test-ui-focus-visual-states.mjs` locks scope, state projection, item-15/item-16 separation, token use, no-motion/no-layout-shift rules and the Notes-specific virtual-time wait contract;
- new `scripts/validate-focus-visual-state-captures.mjs` validates semantic state markers, computed visual distinction, Notes expansion, overdue distinction and no-eligible non-activation;
- `scripts/test-ui-focus-action-slots.mjs` was narrowly evolved so the fixture may omit live-action geometry only in the no-live scenario while retaining existing live-scenario geometry checks;
- `scripts/test-ui-focus-panel.mjs` was evolved after exact CI evidence so the legacy production-fixture contract recognizes the expanded scenario matrix and optional live-only geometry without weakening paused-state/timer/action invariants;
- `package.json` registers the new deterministic test and Windows visual validator.

Current semantic scope against the item-15 base is ten implementation/test/config files plus this handoff checkpoint:

1. `package.json`;
2. `scripts/capture-focus-panel-fixtures.ps1`;
3. `scripts/test-ui-focus-action-slots.mjs`;
4. `scripts/test-ui-focus-panel.mjs`;
5. `scripts/test-ui-focus-visual-states.mjs`;
6. `scripts/validate-focus-visual-state-captures.mjs`;
7. `src/FocusPanel.tsx`;
8. `src/focusActionSlots.css`;
9. `src/focusPanelVisualFixture.tsx`;
10. `src/focusVisualStates.css`.

No Rust/Tauri, SQLite/schema, dependency/lockfile, task/domain, authoritative timer/session transition, scheduling classification, display-topology or persistence code changed.

Local validation available in this environment:

- `node --check scripts/test-ui-focus-visual-states.mjs`: **PASS** on the pre-wait contract version; the current file is simple deterministic Node source and remains covered by authoritative preflight;
- `node --check scripts/validate-focus-visual-state-captures.mjs`: **PASS**;
- full local repository/frontend/Rust/Tauri preflight: **NOT RUN** because no local repository checkout/network path is available; authoritative Windows CI remains required.

### Exact CI evidence so far

Initial PR exact head:

`72c7dc9a61b06816ff49c0ec149a1f0d492cb294`

Windows CI #433:

- run `35003897863`;
- job `104498736068`;
- **FAILED** at Repository Preflight;
- setup, dependency install and all frontend checks before `test:ui-focus-panel` passed;
- exact failure: legacy `scripts/test-ui-focus-panel.mjs` still required the old two-scenario fixture source shape and reported `paused metric visual scenario is missing`;
- Windows visual regression, Tauri Release and artifact uploads were skipped after the failed preflight;
- evidence-backed fix commit `0cba2e14dbf76bec92592ffcd723dda3e48806fb` changed only that legacy deterministic fixture contract; production behavior was unchanged.

Next exact PR head:

`2fd45c98030e0497d6357ad9190d4ccd9f18963c`

Windows CI #435:

- run `35004348203`;
- job `104500535711`;
- Repository Preflight: **SUCCESS**, including frontend build, Rust fmt/check/clippy/tests and performance harness;
- Focus capture generation: completed and wrote all fixture files;
- existing Focus Panel, row-title and action-slot visual validators: **SUCCESS**;
- new Focus visual-state validator: **FAILED** only because `focus-panel-notes-expanded-light` lacked `data-focus-panel-fixture-ready="true"` in the dumped DOM;
- exact evidence: the Notes-expanded fixture intentionally executes `notesButton.click()` and waits 80 ms after the asynchronous authoritative-note read mock, while the Focus Edge capture had no virtual-time budget and could dump DOM before that async path settled;
- repository precedent: existing asynchronous visual capture harnesses use Edge `--virtual-time-budget`;
- Tauri Release and both artifact uploads were skipped after the visual-regression failure.

Evidence-backed Notes fixture fix:

- commit `7006c7e79f81b106f0e97a46de702c0aa5ce5be9` adds `VirtualTimeBudgetMs = 500` only to the Notes-expanded Focus scenario and passes that argument to Edge only when nonzero;
- commit `260a5ea2abc35d85fe12057b2ab12545c9827ff4` locks this asynchronous capture-wait contract in `test-ui-focus-visual-states.mjs`;
- no production rendering, timer/session, scheduling, persistence or native behavior changed in either fix.

### Checkpoint 3/5 — PENDING

Require a fresh authoritative Windows CI run on the exact latest PR head after this handoff commit:

- Repository Preflight;
- Windows visual regression, including all new Focus state captures/validator;
- Tauri Release;
- both required artifact uploads.

If it fails, inspect the exact failing step/log and fix only evidence-backed issues on `m6-focus-visual-states`. A failed run does not increment progress.

### Checkpoint 4/5 — PENDING

After exact-head CI success, verify the head is unchanged, the PR remains mergeable, the changed-file scope is expected, and all PR conversation comments/reviews/inline threads are clear. Then squash merge with an expected-head guard.

### Checkpoint 5/5 — PENDING

Validate the resulting main source SHA with authoritative Windows CI. Only after full success reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable item-15 work log. M6 then becomes 15/16 and item 16 becomes the next ordered slice.

## INVARIANTS THAT MUST NOT REGRESS

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and item-10 recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged by presentation work.
- renderer visual-state presentation cannot become timer/session/task/scheduling authority.
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

Check PR #115 and authoritative Windows CI on its exact latest head first. If CI fails, fetch the exact job log and fix only the evidenced problem on `m6-focus-visual-states`. If CI succeeds, record artifacts and proceed to final exact-head review plus expected-head guarded squash merge. Do not start item 16 in parallel.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks item 15.
- Full local repository/frontend/Rust/Tauri preflight is not available in this environment; Windows CI is the authoritative validation gate.