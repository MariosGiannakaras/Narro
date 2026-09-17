# M6 Focus visual states — validated implementation log

Date: 2026-09-17
Agent/tool: ChatGPT with GitHub connector
Milestone: 6 — Blitz Mode / Focus Panel
Item: 15/16 — Implement active-card, paused, break, time-up/overtime, overdue, notes-expanded and no-eligible-task visual states
Result: VALIDATED / COMPLETE

This entry is immutable evidence for the validated item-15 slice. Markdown-only tracking commits created after the source/test merge do not replace the validated source/test baseline recorded below.

## Contract reconstructed

Repository, product, UI, reliability and existing implementation evidence established the following narrow scope:

- item 15 is presentation-only over state already owned by authoritative timer/session, scheduling and board projections;
- the existing live timer/session state remains the source for running, paused, break, `time_up`, `overtime_running` and `overtime_paused` presentation;
- running/active uses the accent token family; paused/overtime use warning; break uses success; Time's Up uses destructive emphasis;
- overdue presentation projects the existing authoritative `task.isOverdue` field and must not recalculate due state in the renderer;
- Notes-expanded styling reuses the established `FocusLiveActions` -> `TaskNotes` path and cannot alter timer state or URL activation rules;
- the no-eligible visual marker is true only when there is no live task, no Remaining task and at least one Scheduled future-timed Today task;
- actual empty/no-eligible content and user-facing control flow remain item-16 scope;
- no timer/session transition, eligibility rule, scheduling classification, task mutation, persistence boundary, native/window behavior, Preferences behavior or Floating Timer behavior belongs in item 15.

The historical risk index was consulted because Focus presentation must not accidentally become timer/session authority. Existing tracked-time, pause/resume, scheduling and identity anti-regressions remained unchanged.

## Implementation

Implementation branch: `m6-focus-visual-states`

Branch base / starting tracking tip:

`8a335e9bc186e65fe673b24b640c715bf01bdb20`

Final exact PR head:

`9e68c546826513255d2e9538e6fc9baae428a432`

PR: #115 — `M6: add Focus visual states`

Final changed-file scope was exactly 11 files:

- `HANDOFF.md`;
- `package.json`;
- `scripts/capture-focus-panel-fixtures.ps1`;
- `scripts/test-ui-focus-action-slots.mjs`;
- `scripts/test-ui-focus-panel.mjs`;
- `scripts/test-ui-focus-visual-states.mjs`;
- `scripts/validate-focus-visual-state-captures.mjs`;
- `src/FocusPanel.tsx`;
- `src/focusActionSlots.css`;
- `src/focusPanelVisualFixture.tsx`;
- `src/focusVisualStates.css`.

Production behavior added:

- Focus live cards expose distinct token-based visual treatments for running, paused, break, Time's Up and overtime states while continuing to project authoritative timer/session state;
- ordinary overdue rows expose `data-focus-overdue="true"` and destructive-state styling using the already-authoritative `task.isOverdue` value;
- expanded Notes gain a Focus-scoped visual surface while retaining the existing production Notes editor/viewer path;
- the empty live-card path gains a `no-eligible` presentation marker only when existing queue partitioning has no live/Remaining work but retains Scheduled future work;
- item-15 keeps the existing empty-card copy `No live task in this view` and creates no empty-state action/control flow, preserving item-16 separation;
- no transform, animation, transition, absolute positioning or margin-based movement was introduced by the visual-state stylesheet.

No Rust/Tauri, SQLite/schema, dependency/lockfile, task/domain, authoritative timer/session transition, scheduling classification, display-topology or persistence code changed.

## Deterministic and visual coverage

The Focus visual fixture now covers:

- `running`;
- `paused-metrics`;
- `break`;
- `time-up`;
- `overtime`;
- `notes-expanded`;
- `no-eligible`.

Coverage verifies:

- authoritative live-state markers and visual distinction;
- fixed live timer/action geometry where a live task exists;
- overdue state projection and computed-style distinction;
- paused metrics and Resume affordance;
- break and Time's Up/overtime labels/timers;
- production Notes toggle/editor path and vertical in-card expansion;
- no-eligible non-activation, Scheduled task visibility and absence of fabricated live timer/actions;
- no-eligible dashed presentation independent of stylesheet import order;
- item-13 action-slot geometry remains valid when live-only geometry is absent in the no-live fixture.

## Local validation

Available connector-only environment evidence:

- `node --check scripts/test-ui-focus-visual-states.mjs`: **PASS** on an earlier branch revision;
- `node --check scripts/validate-focus-visual-state-captures.mjs`: **PASS**;
- full local repository/frontend/Rust/Tauri preflight: **NOT RUN** because a complete local checkout/toolchain was unavailable.

Authoritative Windows CI remained the full reproducible gate.

## CI failures and evidence-backed corrections

### Windows CI #433 — stale legacy fixture source contract

Initial exact head:

`72c7dc9a61b06816ff49c0ec149a1f0d492cb294`

Run `35003897863`, job `104498736068`: **FAIL** at Repository Preflight.

Exact failure: `scripts/test-ui-focus-panel.mjs` still asserted the old two-scenario fixture source shape and reported `paused metric visual scenario is missing`.

Correction commit:

`0cba2e14dbf76bec92592ffcd723dda3e48806fb`

Only the stale deterministic fixture contract was evolved to recognize the expanded scenario matrix and optional live-only geometry. Production behavior was unchanged.

### Windows CI #435 — asynchronous Notes-expanded capture readiness

Exact head:

`2fd45c98030e0497d6357ad9190d4ccd9f18963c`

Run `35004348203`, job `104500535711`: Repository Preflight **SUCCESS**, then visual regression **FAIL** because `focus-panel-notes-expanded-light` lacked the ready marker in the dumped DOM.

Evidence showed the fixture intentionally used the production Notes toggle and asynchronous note read path, including an 80 ms settle, while the Edge `--dump-dom` capture had no virtual-time budget.

Correction commits:

- `7006c7e79f81b106f0e97a46de702c0aa5ce5be9` — adds a 500 ms Edge virtual-time budget only to the Notes-expanded scenario;
- `260a5ea2abc35d85fe12057b2ab12545c9827ff4` — locks that scenario-specific wait contract.

No production behavior changed.

### Windows CI #438 — no-eligible CSS cascade specificity

Exact head:

`7bc574a53b10d2a21a3771820a3da9e43923c40a`

Run `35087031493`, job `104764225335`: Repository Preflight **SUCCESS**; Focus capture generation and existing Focus validators **SUCCESS**; the prior Notes-expanded failure was resolved. The new visual-state validator then failed only because computed `borderStyle` for `focus-panel-no-eligible-light` was `solid` rather than the intended `dashed`.

Evidence showed the simple `.focus-panel__live-card--no-eligible` rule could lose to the later/equal-specificity base `.focus-panel__live-card { border: 1px solid ... }` shorthand.

Correction commits:

- `db447e52ce6ace7193b84b60c1eb2d790df10f6c` — uses a state-qualified no-eligible selector with sufficient specificity to outrank the base shorthand independent of import order;
- `6bbf5e1c0071291a14fa7d967851b2e91c8506fc` — locks the cascade-specificity contract.

Again, no timer/session/scheduling/persistence/native behavior changed.

## Exact PR-head validation

Final exact PR head:

`9e68c546826513255d2e9538e6fc9baae428a432`

Windows CI #441:

- run `35088139238`;
- job `104767793017`;
- conclusion: **SUCCESS**.

Required gates:

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**.

Artifacts:

- visual regression artifact `10443108727`, digest `sha256:b7bf9c7372e744e4e46879581c56e94cf23dc32d94b601f917d6f1ef568ab99f`;
- diagnostic/runtime artifact `10444005797`, digest `sha256:af4846a9b2c554c73dc5179a8dce986beb423006277742b06798df6ef3ec5364`.

Final review verified:

- the exact PR head remained `9e68c546826513255d2e9538e6fc9baae428a432` and mergeable;
- `main` remained at PR base `8a335e9bc186e65fe673b24b640c715bf01bdb20` before merge;
- changed-file scope was exactly the 11 expected files above;
- no PR conversation comments existed;
- no submitted reviews existed;
- no inline review threads existed.

## Merge baseline

PR #115 was squash merged with an expected-head guard for:

`9e68c546826513255d2e9538e6fc9baae428a432`

Validated source/test merge SHA:

`1ddf7daf60c1507f12fc87b67119aa65fc8621bb`

Tree:

`e6e984689ea8a82c34b60790fdcee328c6d7b37b`

Markdown-only tracking descendants after this SHA do not replace this validated source/test baseline.

## Resulting-main validation

Windows CI #442:

- run `35264051291`;
- job `105346638723`;
- exact main source SHA `1ddf7daf60c1507f12fc87b67119aa65fc8621bb`;
- conclusion: **SUCCESS**.

Required gates:

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**.

Artifacts:

- main visual artifact `10515379819`, digest `sha256:a99b0bdec30c42ae5f572a4142a90fb99027e8fe7e6f135b0c145bc6d447279c`;
- main diagnostic/runtime artifact `10516970405`, digest `sha256:fe3b6317750b0bedc24c4a4f538bf5c0063191dec88ec5dc541be42a4d86ed75`.

No manual Windows interaction was required for this presentation-only slice beyond the repository's automated Windows visual/production build gates.

## Invariants preserved

- `main` plus reusable `focusSurface` remain the normal two-webview architecture;
- native/Rust remains monitor/work-area/DPI/physical-position authority;
- display handling remains event-driven/coalesced;
- task/list/subtask identities, Focus queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged;
- renderer visual presentation does not own timer/session/task/scheduling state;
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe;
- item-12 ordinary Focus row titles remain two-line-clamped with keyboard-accessible full-title access;
- item-13 hidden/revealed controls retain reserved geometry and existing hit positions;
- item-14 tooltips remain keyboard/pointer discoverable without shifting geometry;
- Break/Pause-Resume/Skip/Done remain authoritative transitions;
- future-timed Today tasks remain ineligible until due;
- Notes URLs remain explicit pointer/keyboard activation only;
- item-16 actual empty/no-eligible behavior remains intentionally unimplemented by this slice.

## Tracking reconciliation and continuation

Item 15 is now eligible to be checked complete because both exact-head PR validation and resulting-main validation passed.

Tracking reconciliation marks Milestone 6 as **15/16** validated while general roadmap progress remains **5/10 milestones complete**.

The next ordered slice is M6 item 16/16:

`Handle empty/no-eligible-task states.`

A zero-context continuation must reconstruct the exact behavior/content distinction between genuinely empty Today work and future-timed Today work that is visible in Scheduled but not yet eligible. Preserve authoritative Focus-entry/scheduling rules and do not start Milestone 7 in parallel.
