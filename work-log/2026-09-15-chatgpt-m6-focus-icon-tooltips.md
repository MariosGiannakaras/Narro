# M6 Focus icon-only tooltips — validated implementation log

Date: 2026-09-15
Agent/tool: ChatGPT with GitHub connector
Milestone: 6 — Blitz Mode / Focus Panel
Item: 14/16 — Add tooltips for icon-only controls
Result: VALIDATED / COMPLETE

This entry is immutable evidence for the validated item-14 slice. Markdown-only tracking commits created after the source/test merge do not replace the validated source/test baseline recorded below.

## Contract reconstructed

Repository, product, UI and existing implementation evidence established the following narrow scope:

- reuse the validated shared `Tooltip` primitive, including pointer intent, keyboard-focus discovery, `aria-describedby` association and Escape dismissal;
- add tooltips only to genuinely icon-only Focus controls that did not already use the shared tooltip path;
- preserve existing accessible names and existing action/disabled semantics;
- preserve item-13 reserved geometry and hit-target locations; tooltip disclosure must not resize or move controls;
- keep existing shared `TaskSubtasks` and `TaskNotes` tooltip paths unchanged rather than layering duplicate tooltips;
- keep text-labelled Home, live Break/Notes/Pause-Resume/Skip/Done, metric values and the labelled subtask disclosure outside this icon-only slice;
- keep Preferences and Compact-view placeholders functionally inactive while making their purpose discoverable by keyboard focus;
- do not absorb item-15 visual-state polish, item-16 empty-state behavior, Milestone 7 Floating Timer work or Milestone 8 Preferences/shortcut behavior.

The missing icon-only Focus surfaces were:

- topbar Preferences (`⚙`) placeholder;
- topbar Compact view (`↙`) placeholder;
- live-subtask Add (`+`) control;
- paused metric Cancel (`×`) and Save (`✓`) controls.

## Implementation

Implementation branch: `m6-focus-icon-tooltips`

Branch base: `c162d159a4e69eb3ee8312a9b11c589135cb435c`

Final exact PR head: `b5f21b93d36c84b9fbb83f75796f0f1d7ad7b680`

PR: #114 — `M6: add Focus icon tooltips`

Final changed-file scope was exactly eight files:

- `HANDOFF.md` — implementation checkpoint state;
- `package.json` — registers the item-14 deterministic frontend contract in preflight;
- `scripts/test-ui-focus-icon-tooltips.mjs` — locks icon-only tooltip, accessibility and geometry contracts;
- `scripts/test-ui-focus-panel.mjs` — evolves the existing placeholder invariant to allow keyboard-discoverable `aria-disabled` placeholders while requiring them to remain handler-free;
- `src/FocusLiveMetrics.tsx` — shared contextual tooltips for paused-editor Cancel/Save icons;
- `src/FocusLiveSubtasks.tsx` — shared tooltip for the Add-subtask icon;
- `src/FocusPanel.tsx` — shared tooltips for Preferences and Compact-view placeholder icons;
- `src/focusActionSlots.css` — preserves disabled-looking presentation for focusable `aria-disabled` quick placeholders without changing geometry.

Validated behavior:

- Preferences and Compact view use the established shared `Tooltip` primitive;
- their duplicate native `title` tooltips were removed;
- both retain their accessible names and use `aria-disabled="true"` so keyboard focus can discover the tooltip while no click/action handler exists;
- the text-labelled Home placeholder remains outside the icon-only tooltip slice;
- Add subtask retains its contextual accessible name, existing handler and existing disabled semantics while gaining a shared tooltip;
- paused metric Cancel/Save retain their contextual accessible names, handlers and disabled semantics while gaining shared tooltips;
- existing TaskSubtasks and TaskNotes tooltip behavior is unchanged;
- item-13 reserved action geometry and hit targets remain unchanged; no transform, margin shift, transition or alternate layout model was introduced;
- no Rust/Tauri, SQLite/schema, dependency/lockfile, task/domain, timer/session, scheduling, display-topology or persistence behavior changed.

## Deterministic/static coverage

`scripts/test-ui-focus-icon-tooltips.mjs` locks:

- exact missing icon-only coverage;
- reuse of the shared `Tooltip` primitive;
- preservation of accessible names;
- placeholder non-activation;
- preservation of existing TaskSubtasks/TaskNotes tooltip paths;
- pointer and keyboard tooltip discovery plus Escape dismissal on the shared primitive;
- stable Focus topbar and paused-metric geometry;
- frontend preflight registration.

The existing Focus panel contract was updated only after exact CI evidence showed that its old native-`disabled` assertion conflicted with keyboard-focus tooltip discovery. The evolved assertion still requires both placeholder controls to remain non-mutating and handler-free.

## Local validation

The branch checkpoint recorded the new item-14 `.mjs` contract passing `node --check`.

Full local repository/frontend/Rust/Tauri preflight: **NOT RUN** in this connector-only implementation environment because no local repository/toolchain checkout was available. Authoritative Windows CI was the reproducible validation gate.

## Initial CI failure and evidence-backed correction

Initial exact PR head: `fa43d369769d296462a044ba0cb8e59953655476`

Windows CI #429:

- run `34861136189`;
- job `104033361648`;
- result: **FAIL** at Repository Preflight;
- setup, dependency install and preceding frontend checks passed;
- exact failure: the legacy `scripts/test-ui-focus-panel.mjs` contract still required Preferences to be native `disabled`, conflicting with item-14 keyboard-focus tooltip discovery;
- visual regression, Tauri Release and artifact uploads did not run after the failed preflight.

The corrective change updated only that stale deterministic invariant; production behavior was unchanged. No blind rerun or unrelated cleanup was performed.

## Exact PR-head validation

Final exact PR head:

`b5f21b93d36c84b9fbb83f75796f0f1d7ad7b680`

Windows CI #431:

- run `34861579858`;
- job `104035182883`;
- conclusion: **SUCCESS**.

Required gates:

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**.

Artifacts:

- visual regression artifact `10355218307`, digest `sha256:ceed21c226b08e25a86eb23c7fb394460aeef463b21c035745192615af9e6931`;
- diagnostic/runtime artifact `10355048819`, digest `sha256:a8f7e5cc1ecb4a9e2593c7305c14347a8b199ee3d859be883441dc723f26c80a`.

Final review verified:

- the exact PR head remained unchanged and mergeable;
- `main` remained at the PR base `c162d159a4e69eb3ee8312a9b11c589135cb435c` before merge;
- changed-file scope was exactly the eight expected files above;
- no PR conversation comments existed;
- no submitted reviews existed;
- no inline review threads existed;
- product/UI requirements still matched the implementation: ambiguous icon-only Focus controls require accessible tooltips and stable hit targets, with keyboard/focus discovery.

## Merge baseline

PR #114 was squash merged with an expected-head guard for:

`b5f21b93d36c84b9fbb83f75796f0f1d7ad7b680`

Validated source/test merge SHA:

`08d06b6fcf9167d832c3e2f51e04756141f02b7b`

Tree:

`3fa724f6fd92c6952729ab6f826d9fa8fd96cb47`

Markdown-only tracking descendants after this SHA do not replace this validated source/test baseline.

## Resulting-main validation

Windows CI #432:

- run `34999410686`;
- job `104483783226`;
- exact main source SHA `08d06b6fcf9167d832c3e2f51e04756141f02b7b`;
- conclusion: **SUCCESS**.

Required gates:

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**.

Artifacts:

- main visual artifact `10408799567`, digest `sha256:b7921a3d487e7189a9d25293ab452f6a71ffa03d2e16b44ffd7a1386ea780b8b`;
- main diagnostic/runtime artifact `10409522085`, digest `sha256:dae179c6b33294e79db6a05da415172620d4752dd524402a138097238839551c`.

No manual Windows interaction was required for this tooltip-only slice beyond the repository's automated Windows visual/production build gates.

## Invariants preserved

- `main` plus reusable `focusSurface` remain the normal two-webview architecture;
- native/Rust remains monitor/work-area/DPI/physical-position authority;
- display handling remains event-driven/coalesced;
- task/list/subtask identities, Focus queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged;
- renderer title/action/tooltip presentation does not own timer/session/task state;
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe;
- item-12 ordinary Focus row titles remain two-line-clamped with keyboard-accessible full-title access;
- item-13 hidden/revealed action controls retain reserved geometry and existing hit positions;
- item-14 tooltips are keyboard/pointer discoverable without activating placeholder behavior or shifting geometry;
- Break/Pause-Resume/Skip/Done remain authoritative transitions;
- future-timed Today tasks remain ineligible until due;
- Notes URLs remain explicit pointer/keyboard activation only;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent and diagnostics remain gated behind `?diagnostics=1`.

## Tracking reconciliation and continuation

Item 14 is eligible to be checked complete only after the resulting-main CI evidence above. The reconciliation updates `TODO.md`, `STATUS.md` and `HANDOFF.md` as Markdown-only descendants of the validated source/test SHA.

After reconciliation, Milestone 6 is **14/16** validated and general roadmap progress remains **5/10 milestones complete**.

The next ordered slice is M6 item 15/16:

`Implement active-card, paused, break, time-up/overtime, overdue, notes-expanded and no-eligible-task visual states.`

A zero-context continuation must reconstruct the exact item-15 visual-state contract from current Focus production state projection, timer/session state definitions, notes/subtask presentation, current Windows fixtures/validators and the item-16 empty-state boundary before editing. Do not start Milestone 7 or later work in parallel.
