# STATUS.md

Last updated: 2026-09-26

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`. Immutable implementation evidence lives under `work-log/`.

## Current phase

**Milestone 7 — Floating Timer mode.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5 / Gate E: **PASS**.
- Milestone 6 / Gate F: **PASS** — all 16 top-level items validated.
- Milestone 7: **ACTIVE / 8 of 14 top-level items validated**.
- Milestones 8–10: **NOT STARTED**.

General roadmap progress: **6 of 10 milestones complete**.

M7 items 1–6 and 13–14 are validated. The earlier CI #480/#501 physical expand/collapse failures are superseded by the physical CI #503 re-test: three complete native resize cycles, including expanded subtask controls, showed no retained/duplicated action strip in the collapsed DOM or pixels. Normal-size horizontal overflow and timer/session continuity passed. Two #507 20 fps Panel→Timer captures showed blank/pale staging frames before Timer content rendered; the no-flash part of item 7 is **FAIL reproduced**. Actual Windows animations Off removed nonessential translation but both Panel→Timer and Timer→Panel still showed blank frames. The native show-before-React-mode-publication order directly permits an empty surface; the exact compositor contribution still needs testing. #507 basic T/P and both-chord ownership conflict/retry received scoped physical PASS. Visible Timer P gave one finite pulse with Windows animations Off. Hidden Timer P on #507, display-topology/DPI, and independent fullscreen cases remain open; see `work-log/2026-09-25-codex-m7-os-reduced-motion-physical.md`. Item 14's final-UI physical resource protocol completed on CI #505: three valid idle runs per state, each with zero churn, plus a separate running sample. Idle CPU medians were 0.000% of one core in both states; running average was 0.155%. Memory and caveats are in the earlier work log. No M8 work has started.

**Latest CI #530 physical update:** three settled Panel→Timer→Panel shortcut cycles retained one Focus window and the paused task, but continuous capture with Windows animations On showed a pale empty focus frame and then the desktop before Timer appeared. Gate 7 visual continuity is **FAIL** on the latest validated source. The checked frames and exact build provenance are in `work-log/2026-09-26-codex-m7-ci530-panel-timer-physical-fail.md`. Remaining #530 physical matrix entries were not run; no M7 completion is claimed.

## Current automated-validated source baseline

Latest automated-validated source is `449eb5d1fda4a8d26832e803433209025a6dec38`, tree `51b27ba7a867dcea79a49927cb1ed4e0ee7bda6b`; resulting-main Windows CI #530 passed repository preflight, visual fixtures, and Tauri release. The exact CI #530 runtime artifact and source history are in `HANDOFF.md`. Passing automated gates does not override the latest physical Gate 7 failure. Earlier #507 shortcut and #505 resource findings retain only their recorded scope; see their immutable work logs.

## Item 7 earlier physical candidate

PR #125 exact head `fb3547855433b87d576e1e78a5bbe58d5fc2570b`: Windows CI #486 / run `35939359726` / job `107443605380` PASS, including Repository Preflight, visual fixtures, Tauri Release, and diagnostic artifact.

Expected-head guarded squash merge `a7161acdf6a400147af0bbc44d52b1ec6ee64ea5` (tree `077435c468d4e5358b7a2e2b98417332d4e20a05`) passed resulting-main Windows CI #487 / run `35940723610` / job `107447795591` with the same required gates. Runtime artifact `10785466061`, `narro-m1-runtime-harness-windows-x64`, digest `sha256:f84bee3216cfe5d1762916cd54cd0d7703db283bdd7d1930b9b540a100764413`. Visual artifact `10785301496`, digest `sha256:c385e00fe2c06cb0084d17f002c9f82f77b0d9cfa67e95f491a7a0b12f7f941a`.

The target expanded/collapsed hierarchy stays visibility-hidden during native window hide/resize/show and a post-show presented-frame opportunity. Native failure attempts physical-size/visibility rollback, and renderer failure restores the previous expanded hierarchy. This is automated-validated source, not a physical compositor PASS.

## Prior compositor baseline before PR #125

Historical resulting-main automated-validated **source/test** baseline:

`6f99e9b1869b927e5a792cc569b6c8131859c7d8`

Tree:

`a8108fc403e94ab90dc9a85c2070b8852667109f`

This is the squash merge of PR #124 — `M7: mask stale focus content across native resize` — from exact validated PR head `2db045ef82286d8364d77a3ba9654842b9a66eb3`. The merge tree is byte-identical to the exact validated PR-head tree. Markdown-only tracking descendants do **not** replace this source/test baseline.

The PR #124 corrective source:

- preserves the existing finite exit transition, then marks the settled outgoing Focus root `visibility: hidden` before native Panel/Timer geometry runs;
- waits through a shared finite two-`requestAnimationFrame` presented-frame barrier before invoking native mode geometry;
- adds an explicit hidden Floating Timer `resizing` phase after the finite exit and before native collapsed/expanded geometry;
- publishes the final expanded/collapsed hierarchy while hidden, waits another finite presented-frame barrier, then performs the existing entrance transition;
- retains native/Rust geometry authority, the same reusable `focusSurface` webview, established 150ms/180ms motion tokens, reduced-motion behavior, and unchanged timer/session/task/scheduling semantics;
- adds deterministic contracts for the compositor barrier and updates the collapsed contract to the shared helper.

### PR #124 exact-head validation

Final PR head:

`2db045ef82286d8364d77a3ba9654842b9a66eb3`

Windows CI #479 / run `35929764331` / job `107413269935`: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact `10781122135`, digest `sha256:ddeeeb085aeea61a438d204d386c31dc0eb474567114914178d3ec0ebc5d5971`;
- runtime artifact `10781486137`, digest `sha256:e0ee9c832e1a770e10460b4b85f9815b406759ebf34ed0194bbdf89c008832c1`.

PR CI #478 failed only because the older collapsed deterministic contract still expected the previous inline single-rAF helper after the helper was centralized. The contract was corrected in forward test-only commit `2db045ef82286d8364d77a3ba9654842b9a66eb3`; final exact-head CI #479 passed. PR #124 had nine expected changed files and no comments, reviews or unresolved review threads.

Squash merge:

`6f99e9b1869b927e5a792cc569b6c8131859c7d8`

### Resulting-main validation

Windows CI #480 / run `35931208957` / job `107417960065`: **SUCCESS** on exact main source SHA `6f99e9b1869b927e5a792cc569b6c8131859c7d8`.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact `10781109686`, digest `sha256:9d81fc5ce5c6041797a8f8754cb501fe91599c71a6f76411028ceed05eda752f`;
- runtime artifact `10781866423`, digest `sha256:2c203f4c5cc62a645781fdb4ad341527bed6d60f8d0cb3b3cec2139be37c9f29`.

Connector-side deterministic transition source-contract review: **PASS**. Local checkout/npm/Rust preflight in this environment: **NOT RUN**. The authoritative Windows repository preflight, visual regression and Tauri release gates passed on both the exact PR head and resulting main.

Automated validation does **not** prove transient desktop compositor behavior, so physical Windows re-validation remains the final item-7 gate.

## Milestone 6 validated work

Items 1–14 remain documented in their immutable M6 work logs and retain all previously validated invariants. Item 15 adds the following validated presentation behavior without changing authoritative task/timer/session/scheduling/native state:

### Item 15 — Focus visual states

Immutable evidence: `work-log/2026-09-17-2215-chatgpt-m6-focus-visual-states.md`.

Validated behavior:

- the active/running live card projects the existing authoritative timer state using the accent token family;
- paused and overtime states use warning treatment, break uses success treatment, and Time's Up uses destructive treatment;
- ordinary overdue rows project the existing authoritative `task.isOverdue` field and are visually distinct without renderer-side due-state recalculation;
- expanded Notes reuse the established `FocusLiveActions` -> `TaskNotes` path and receive only an expanded visual surface;
- no-eligible presentation is derived only when there is no live task, no Remaining task and at least one Scheduled future-timed task;
- item 15 intentionally preserves the existing empty-card copy and does not add item-16 empty/no-eligible behavior or controls;
- item-11 live-title motion, item-12 ordinary-row full-title access, item-13 reserved action geometry and item-14 tooltip/accessibility contracts remain intact;
- Windows light/dark fixtures cover running, paused, break, Time's Up, overtime, Notes-expanded and no-eligible states;
- asynchronous Notes capture uses a scenario-specific Edge virtual-time budget and the no-eligible dashed-state selector is specificity-safe against the base live-card border shorthand.

The implementation changed no Rust/Tauri, SQLite/schema, dependency/lockfile, task/domain, authoritative timer/session transition, scheduling classification, display-topology or persistence code.

### Item 16 — Empty/no-eligible Focus states

Immutable evidence: `work-log/2026-09-20-2229-chatgpt-m6-focus-empty-states.md`.

Validated behavior:

- generic idle remains distinct when Remaining work exists without a live task;
- no-eligible is shown only when there is no live/Remaining work and at least one future-timed Scheduled task;
- future-scheduled work stays visible in Scheduled and remains ineligible until due;
- genuinely empty Today uses the screenshot-backed `All Clear` state;
- empty/no-eligible states do not fabricate live timer/actions and do not own timer/session/scheduling authority;
- Windows light/dark fixtures and deterministic contracts cover both states;
- no Rust/Tauri, SQLite/schema, persistence, scheduling classification, task/domain or timer/session transition behavior changed.

## Milestone 7 validated work

### Item 1 — Same-window compact-mode foundation

Immutable evidence: `work-log/2026-09-21-1120-chatgpt-m7-floating-compact-mode.md`.

Validated behavior:

- the existing `focusSurface` webview transforms between product Panel and compact modes without creating another persistent webview;
- native Rust mode state remains presentation authority and is reconciled by the renderer on mount;
- product Compact control calls the native same-window transition and renderer mode publishes only after native success;
- compact -> Panel return uses the existing preference-aware `present_focus_panel` path;
- the minimal compact foundation preserves M1 always-on-top/skip-taskbar behavior without absorbing later collapsed/expanded content items;
- mode switching remains presentation-only and does not mutate timer/session/task/scheduling state;
- `?diagnostics=1` retains the M1 diagnostic surface.

CI history included two test-contract-only failures (#447 stale M6 root assertion; #449 LF/CRLF-brittle compact assertion). Both were corrected without production changes before exact-head CI #451 and resulting-main CI #452 passed all required gates.

### Item 2 — Floating Timer movability/topmost/taskbar

Implementation source: PR #118 / merge `f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`.

Automated-validated behavior:

- the frameless product `FloatingTimerFoundation` exposes Tauri-native drag regions over non-interactive content;
- the return-to-Panel button is deliberately excluded from the drag region and remains interactive;
- `core:window:allow-start-dragging` is scoped to `focusSurface` only rather than broadened to `main`;
- native Timer mode remains authority for always-on-top and skip-taskbar state;
- no JS pointer/mouse move loop or renderer-owned `setPosition` path was added;
- safe-position persistence/recovery remains item 10 and borderless-full-screen topmost validation remains item 11;
- no timer/session/task/scheduling/persistence semantics changed.

Physical Windows validation:

- Drag Floating Timer: **PASS**;
- Return to Focus Panel button: **PASS**;
- always-on-top over normal apps: **PASS**;
- no normal Floating Timer taskbar button: **PASS**;
- final Panel position after return: correct original right-side position;
- observed transition artifact: a very brief left-side Panel flicker before settling right. This does not invalidate item 2 and is assigned to the later transition slice.

### Item 3 — Collapsed Floating Timer content

Immutable evidence: `work-log/2026-09-23-1421-codex-m7-floating-collapsed.md`.

Implementation source: PR #119 / merge `14db934e998b2bb619f04bf7e7a1b0fe7b5553fe`.

Validated behavior:

- native Timer mode uses the screenshot/spec-backed `340 x 110` collapsed viewport while retaining item-2 topmost/taskbar/drag authority;
- the title and subtask progress derive from the authoritative list-board projection;
- the timer derives from the existing revision-ordered authoritative timer/session projection;
- Focus Panel and Floating Timer share one timer presentation helper covering EST, count-up, Pomodoro, break, Time's Up and overtime states;
- Add and Expand affordances are visible but intentionally non-mutating until the ordered expanded-content slice;
- deterministic Windows light/dark fixtures validate the collapsed hierarchy and stable geometry;
- no renderer timer/session/task authority, polling, per-second persistence, continuous decorative animation or position loop was introduced.

PR Windows CI #458 and resulting-main Windows CI #459 passed Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads. Local frontend preflight also passed; local Rust/Tauri checks were unavailable because the local environment has no Rust toolchain.

### Items 4–6 — Expanded Floating Timer interactions

Immutable evidence: `work-log/2026-09-23-chatgpt-m7-floating-expanded-interactions.md`.

Implementation source: PR #120 / merge `97931f89ff2b6b9f1aa0ceb628732602be8fd587`.

Validated behavior:

- native Timer sizing supports the established `340 x 110` collapsed viewport and `340 x 300` expanded viewport without another focus webview;
- expand/collapse remains renderer presentation state and native resizing publishes before the renderer commits the corresponding presentation;
- expanded actions reuse the existing authoritative Focus paths for Break, Notes, Pause/Resume, Skip and Done, plus Return to Panel;
- expanded subtasks reuse persisted list-board subtask identities and mutations for create, completion/reopen, reorder and delete, including expected-value/order concurrency guards;
- saved subtask mutations refresh and reconcile authoritative subtask and board projections before more mutations continue;
- icon-only action/subtask controls retain stable 32 px geometry, accessible names and shared tooltips without changing Timer width;
- deterministic Windows light/dark visual fixtures cover collapsed and expanded density/geometry;
- no renderer timer/session/task/scheduling authority, high-frequency native geometry loop, polling clock or continuous decorative animation was introduced.

PR Windows CI #462 and resulting-main Windows CI #463 passed Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads.

## Milestone 7 — source implementation advanced; physical closure deferred

M7 source work through A18 is now reconciled on current `main`.

Latest authoritative source evidence:
- PR #155 exact head: `c630a57346c067ab04c0fa086703582542f4f7e5`;
- Windows CI #559 / run `36250265344`: **PASS**;
- repository preflight, Rust fmt/check/clippy/tests, Windows visual regression, Tauri release build and required artifact uploads: PASS;
- visual artifact: `narro-m5-visual-regression`, artifact id `10908029994`, digest `sha256:9ba27fd6184a4f0a01e056a9a087569ddd3e35a3784a363a366dec658cba9419`;
- diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, artifact id `10908554507`, digest `sha256:90a9cd51164278499283e77062e4dd2227580857583801b2aeac583da08aa8d8`;
- expected-head guarded squash merge: `76ef5dadf1d6587ee52d029d980ad4de7a9abd93`;
- resulting-main Windows CI #560 / run `36251631523`: **PASS** through the identical-tree validation gate.

Validated capabilities added in this batch:
- A18 expanded Floating Timer subtask title editing is complete: click-to-edit, stale-safe `expectedTitle`, Enter/Save commit, Escape/Cancel, authoritative subtask mutation, and post-commit subtask/board refresh reuse;
- the CI #530 Panel/Timer blank/desktop corrective candidate is merged: a short-lived native bitmap/tool-window visual hold covers the same `focusSurface` while renderer/native geometry work is hidden, without adding a third webview or domain authority;
- visual-hold ownership is serialized and cleanup is exercised on success/failure paths;
- M5/M6 parity gates remain in frontend preflight.

Physical status is deliberately not overstated. The merged visual-hold candidate has **NOT** yet received the consolidated Windows continuous-capture/manual matrix. The transition, repeated shortcut, monitor/topology, independent borderless/fullscreen, and non-default taskbar/high-DPI gates remain OPEN.

M7 therefore remains **incomplete at 9/14 top-level items**. By explicit user direction on 2026-09-26, these deferred physical checks and the absent Blitzit video corpus are not blockers for independent source implementation. M8 source work may proceed while M7 stays open; this is an explicit roadmap execution exception and must not be represented as M7 completion.

The current validated application source baseline is `76ef5dadf1d6587ee52d029d980ad4de7a9abd93`. Documentation/tracking-only commits do not replace it.

## Milestone 8 — shortcut foundation validated; Preferences implementation next

M8 has validated its confirmed in-app and global shortcut surfaces plus the versioned local preference persistence foundation.

Latest authoritative source evidence:
- PR #168 exact validated head: `e63dbd3107fca8ccf95d35506c7a16e4eeaac9f6`;
- Windows CI #574 / run `36284019516`: **PASS**;
- Repository Preflight, Rust fmt/check/clippy/tests, Windows visual regression, Tauri release build, and required artifact uploads: PASS;
- visual artifact: `narro-m5-visual-regression`, id `10919562623`, digest `sha256:781ff8dd2dea000db2ba7e1dc6be602fc551f119e30e6d47e88e8242baf9a766`;
- diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, id `10919742072`, digest `sha256:b2febb1520437238b2ed21e8271116c0a823a8984f592296401f3e80abc63528`;
- expected-head guarded squash merge: `699b6ac46bcc6ebcabbcded21f929a7b32018b42`;
- resulting-main Windows CI #575 / run `36284525078`: **PASS** through the identical-tree validation gate.

Validated global-shortcut behavior:
- existing native `Ctrl+Shift+B/T/P` RegisterHotKey authority is preserved;
- preferences schema v3 adds persisted per-global enable intent, defaulting all three enabled for legacy compatibility;
- startup loads persisted shortcut intent before native registration and skips disabled shortcuts;
- enable/disable operations serialize native transitions with atomic SQLite preference mutation;
- persistence failure after native transition restores the previous native registration state where possible;
- enabled intent is distinct from actual registered/conflict state;
- Settings exposes Loading/Saving/Registered/Disabled/Shortcut conflict/Unavailable/Retry states with explicit feedback;
- deterministic visual fixtures cover the conflict/retry state;
- Theme writes now reuse the same atomic preference mutation boundary rather than overwriting an independently changed payload.

The typed/versioned SQLite preference payload already covers the current General, Focus, Alerts and Celebration domains and is regression-tested across database reopen; ShortcutPreferences is now part of that same durable model.

M8 validated top-level state is now **5/8**:
- in-app shortcuts: complete;
- global shortcuts + toggles: complete;
- global conflict/error feedback: complete;
- Start Break shortcut lifecycle: complete;
- versioned local preference persistence: complete;
- full Preferences UI/behavior, conditional/nested behavior, and Windows-locale date/time presentation remain open.

The current validated application source baseline is `699b6ac46bcc6ebcabbcded21f929a7b32018b42`. Tracking/evidence-only commits do not replace it.

### Uploaded Blitzit video corpus — reconciled 2026-09-27

The repository now contains **19/19 paired MP4/SRT sources (38/38 raw files)** under `reference/original-blitzit-videos/inbox/`. Initial ingestion is complete: **19/19 analyzed, 19/19 Narro-reconciled, 19/19 dispositioned**. Coverage lives in `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md`; detailed timestamps/classes/dispositions live in `docs/BLITZIT_VIDEO_EVIDENCE.md`.

Material implementation consequences:
- VE-F003 promotes task-menu `Change List` + `Duplicate` from old B1 ambiguity to current direct behavior evidence; current production lacks those paths, so one narrow post-M5 corrective slice is ordered before unrelated M8 Preferences work. M5 roadmap completion remains intact rather than being re-audited wholesale.
- VE-F001 resolves EST parser title normalization: a successfully parsed terminal duration is removed from the saved visible title and stored as EST.
- VE-F002 resolves only the success-screen-enabled Done path: success UI appears before next-task start and `Next Task` is explicit. Success-screen-disabled progression remains unresolved; the visible `Take a Break` post-click domain semantics are not shown and must not be guessed.
- VE-F008 directly corroborates M8 nested Preferences behavior and hide-times hover disclosure.
- VE-F004 corroborates Blitzit's live-task note-URL auto-open; Narro's explicit-activation deviation remains binding.
- VE-F007 adds a coarse ~0.2–0.3 s source Panel→Floating visual sequence but does not close any deferred M7 physical Windows checks.
- Reports/Sessions findings are routed to M9 and do not front-run M8.

VE-F003 task-menu Change List + Duplicate is now validated in PR #177 / CI #602 / merge `f4c80d04b25f58637c0ef04c03b60dcd52fcff57` / main CI #603. The next source action is to reconcile existing M8 PR #170 onto that validated main baseline, preserve VE-F003 overlaps, rerun exact-head Windows CI, and continue VE-F001/VE-F002/VE-F008 Preferences/runtime completion.

## CI efficiency baseline

PR #152 / main `3dac35988ba03d9b12f5eb58dbb13d9e2792e488` optimizes Windows CI without removing tests or release validation:
- exact-head PR CI remains the full authoritative Windows gate;
- a lightweight main validation gate skips the heavy duplicate job only when GitHub proves an associated merged PR, an identical PR-head/main Git tree, and a successful exact-head PR `Windows CI` run;
- direct/unproven main pushes, different trees, workflow changes and Rust cache-key input changes fall back to full CI;
- Rust/Cargo build state is cached with pinned `Swatinem/rust-cache` for `src-tauri -> target`, with cache writes restricted to trusted main pushes;
- Tauri CI packaging reuses the frontend `dist` already produced by repository preflight and verifies required outputs before packaging instead of running a second frontend production build.

PR #152 exact head `299f46c4f8953d6f0a30bfc9953925c11def7eda` passed Windows CI #525. Guarded squash merge `3dac35988ba03d9b12f5eb58dbb13d9e2792e488` intentionally forced one full main validation because the workflow itself changed; resulting-main CI #526 passed all gates and produced both required artifacts. In #526, preflight took about 6m01s and Tauri release about 4m46s; earlier recent release steps were commonly about 6–8 minutes. The larger expected saving is elimination of redundant full main jobs after ordinary identical-tree merges.

## 2026-09-26 parity audit reconciliation

A repository-only parity/reliability audit was verified one finding at a time against the then-current `main`. The findings are being reconciled in roadmap order without discarding the validated Rust/domain reliability architecture or re-auditing already-settled milestone foundations.

### M5/Main reconciliation — COMPLETE

A1–A9 and A19 are implemented and validated:

- A1 List Duplicate creates independent list/task identities and does not clone completed history.
- A2 persisted local list icons render on active and archived list surfaces through validated owned-asset reads with fallback.
- A3 top-of-lane creation is atomic and rank-safe; no create-then-reorder partial-success path exists.
- A4 normal create accepts optional EST in the same persistence operation.
- A5/A6 Main completion and explicit permanent deletion use authoritative persistence/session/report boundaries; live completion remains timer/session-authoritative and Done is not a planning reorder lane.
- A7 identity-based per-task edits work in All Lists while aggregate create/reorder remain disabled.
- A8 Search highlights matched text without changing keyboard/focus behavior.
- A9 normal Main no longer mounts diagnostic timer JSON; the user-facing Pomodoro resume prompt remains projection-driven and authoritative-transition-backed.
- A19 Done shows a display-timezone local-month completion count.
- obsolete static/visual contracts that froze the earlier omissions were replaced with positive product/safety invariants.

Validation evidence:
- PR #156 exact head `2cde42c10389c2417e1b6e356eae59150ebff8ce`;
- Windows CI #539: PASS;
- repository preflight, Rust fmt/check/clippy/tests: PASS;
- Windows visual regression: PASS;
- visual artifact: `narro-m5-visual-regression`, artifact id `10905522707`, digest `sha256:45339a39e3c0105bb3085646bb40687fbd29969e3ede476383d7933f39a07218`;
- Tauri release build and diagnostic harness upload: PASS;
- guarded squash merge: `4e315f551737d729f76e5f561dd8d7404717e157`;
- resulting-main Windows CI #540: PASS through the repository's identical-tree validation gate; the heavy duplicate job was correctly skipped only after GitHub proved the merged tree equals the exact-head PR tree and that #539 had passed.

The M5 validated source baseline was `4e315f551737d729f76e5f561dd8d7404717e157`. Markdown-only tracking commits did not replace that source SHA.

### M6/Focus parity reconciliation — COMPLETE

A10–A17 are implemented and validated:

- A10 ordinary Focus rows expose stable reserved completion/Rocket/reorder/overflow action geometry with pointer and keyboard/focus access;
- A11 Rocket / Make Live samples authoritative timer/session state and starts or switches through the timer service without completing or discarding prior work;
- A12 individual-list Focus queue reorder reuses the persisted stable-identity reorder boundary; aggregate All Lists reorder remains disabled;
- A13 ordinary-row Notes, scheduling, non-live completion and confirmed permanent delete reuse validated Main/domain boundaries;
- A14 Focus `+ ADD TASK` is persistence-first; All Lists requires explicit owning-list selection before creation;
- A15 Focus Home uses native Main/focus-surface lifecycle and does not reset timer/session state;
- A16 live-task title editing exists only inside Focus Panel Notes and reuses stale-safe persisted title mutation followed by authoritative Focus refresh;
- A17 Time's Up exposes Extend through the existing authoritative `timer_extend` transition;
- obsolete M6 placeholder/non-mutating static contracts were replaced with positive product/safety invariants and Windows visual geometry checks.

Validation evidence:
- PR #158 exact validated head `c13e7f6cfbec3accde4841fd4fd61b68d0924ff6`;
- Windows CI #545 / run `36243619057`: PASS;
- repository preflight, Rust fmt/check/clippy/tests: PASS;
- Windows visual regression: PASS;
- visual artifact: `narro-m5-visual-regression`, artifact id `10906627762`, digest `sha256:4f58feb6526ad3624e07897f58377b620936e4316f60fb64c9de0f83e45d671a`;
- Tauri release build: PASS;
- diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, artifact id `10906727736`, digest `sha256:97dd86ad64f12ffa35da0ce5d0b10dadb1375df6f70178d0584751d234ec65ef`;
- expected-head guarded squash merge: `b1ff5910abec82272c4ee57479a44eb62248a88f`;
- resulting-main Windows CI #546 / run `36244258977`: PASS through the identical-tree validation gate; the heavy duplicate job was correctly skipped after GitHub proved the merged tree equals the exact validated PR-head tree.

The current validated source baseline is therefore `b1ff5910abec82272c4ee57479a44eb62248a88f`. Markdown-only tracking commits after this point do not replace that source SHA.

### Remaining audit classification

- **M5/Main reconciliation — COMPLETE:** A1–A9 and A19.
- **M6/Focus reconciliation — COMPLETE:** A10–A17.
- **M7/Floating reconciliation — DEFERRED:** A18 plus the already-active compositor/physical work. By explicit user direction, implementation stops before M7 and awaits the user's next instruction.
- **B1 Task Change List/Duplicate:** RESOLVED and IMPLEMENTED/VALIDATED. PR #177 exact head `e80034f481bc8d9368bb670cadfce2cdcbe61797` passed Windows CI #602; guarded squash merge `f4c80d04b25f58637c0ef04c03b60dcd52fcff57` passed resulting-main CI #603. Change List preserves the stable task identity and authoritative persisted lane/schedule/history; Duplicate creates an independent identity; live/open-session sources are rejected transactionally.
- **B2 exact Blitz now placement / B3 exact swatch palette:** visual-fidelity questions for the scheduled final parity pass unless stronger current evidence promotes them.
- **B4 Done auto-start next task:** PARTIALLY RESOLVED by VE-003. With success screen enabled, completion enters success UI first and next-task start waits for explicit `Next Task`. The success-screen-disabled path remains unresolved; preserve current Narro behavior there until stronger evidence/decision. `Take a Break` is visible but its post-click timer/session semantics remain unproven.
- Intentional Narro deviations in audit section C remain binding and are not regressions.

PR #155 remains open and draft at exact head `2755d598ad2b13b974cda02760ebf44cd5e60b13`; Windows CI #532 passed, physical compositor validation has not run, and GitHub reports the PR non-mergeable against the newer `main`. Preserve it without rebase/merge/source modification until the user explicitly resumes M7.

## Planned post-M10 final comprehensive review

A required **Final Comprehensive Review Stage** is now scheduled after Milestone 10. It is not Milestone 11; the roadmap milestone denominator remains 10.

Planning status only:
- no final-review task has started or been marked complete;
- no application source/UI implementation, refactor, or validation is part of this planning update;
- all previously validated milestone evidence remains unchanged.

The future stage will combine:
- end-to-end engineering/correctness review against `ENGINEERING_QUALITY.md`, repository invariants, and established Rust/TypeScript/Tauri/SQLite practices;
- professional UI/UX review covering usability, consistency, visual hierarchy, alignment, spacing, typography, color palette, contrast, accessibility, responsive/adaptive behavior, interaction feedback, and significant application states;
- exhaustive visual/fidelity comparison against all available Blitzit screenshots/images/references and the indexed source evidence, including screen/state/component/interaction coverage rather than selected spot checks;
- explicit detection of visual deviations, missing states, missing functionality, incorrect transfers, and source-product parity gaps;
- a single findings register with explicit disposition and evidence-backed remediation/revalidation before the final gate can pass.

For every remaining milestone M7–M10, completion now also requires sufficient user-facing error/failure/loading/waiting/unavailable/recovery feedback and meaningful edge-case coverage appropriate to that milestone. Every milestone completion report must include its total validated source diff as `+A/-B` lines, measured from its validated starting source SHA to its final validated source SHA.
## Blitzit video/transcript evidence ingestion

The repository now has a durable inbox for future user-supplied Blitzit recordings and transcripts:

- raw upload path: `reference/original-blitzit-videos/inbox/`;
- raw evidence guide: `reference/original-blitzit-videos/README.md`;
- durable manifest/timestamped analysis: `docs/BLITZIT_VIDEO_EVIDENCE.md`;
- interaction/motion methodology: `docs/INTERACTION_CAPTURE_GUIDE.md`;
- videos and transcripts are uploaded/committed as normal repository files; no Git LFS requirement applies.

Status: **INBOX READY / CORPUS ANALYSIS NOT STARTED**. Setup was merged through PR #162: exact head `8bf3d2d5f34b870b1a38fe4afa493df73f81f42c`, Windows CI #547 PASS, guarded squash merge `4de310d29cee623cba54da514ba2a74193ba758a`. No video-derived product finding is claimed until files are actually uploaded and inspected.

When recordings have actually been uploaded before an affected remaining milestone closes, materially relevant evidence should be analyzed before that milestone is declared complete. The absence of recordings is not an implementation blocker; independent roadmap work continues and the full corpus can be reconciled later. In particular, Focus Panel/Floating Timer/transition/expand-collapse recordings available before M7 closure are M7 evidence. Independently of earlier milestone routing, the complete uploaded corpus is a required evidence source for the post-M10 Final Comprehensive Review Stage.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` remain the normal two-webview model.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display-topology handling remains event-driven and coalesced; no renderer/high-frequency polling loop is introduced.
- authoritative task/list/subtask/session/timer/scheduling/note/archive/preferences state remains outside renderer memory; persistence-first mutations remain the success boundary.
- stable identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- future-timed Today tasks remain ineligible until due.
- repeated Focus entry cannot duplicate or silently switch an existing live session.
- Focus queue partitioning cannot clone identities or reinterpret scheduling state.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry/task switching/Notes opening.
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe.
- ordinary Focus row titles remain two-line-clamped with accessible full-title access.
- Focus action controls keep item-13 reserved geometry and existing hit positions.
- item-14 icon-only tooltips preserve accessible names, placeholder inactivity and stable geometry.
- item-15 visual states remain presentation-only projections of authoritative state; item 16 must not turn those markers into domain authority.
- hover/focus interactions may not reflow sibling geometry; reduced-motion remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.


## Blitzit video UI/UX forensic second pass (2026-09-27)

- The separate product-behavior ingestion remains complete at 19/19 video/transcript pairs.
- The user-requested deep UI/UX forensic pass is also complete at **19/19**.
- Coverage explicitly includes layout, visible copy, inputs, task/menu states, overlays, Notes, Subtasks, Preferences, scheduling/recurrence, Focus/Floating, success UI, Reports/Sessions, animations, micro-animations and micro-interactions.
- Direct 60 fps VE-003 evidence measures the visible Focus Panel → Floating Timer geometry transformation at roughly **0.27 s**.
- The source's clipped/sparse intermediate content during that transition is classified as a source artifact, not a Narro fidelity target.
- Generic hover/menu/modal/inline/chart timings in `docs/UI_UX_SPEC.md` are Narro calibration targets rather than measured Blitzit constants because tutorial edits prevent trustworthy exact timing for those interactions.
- VE-006 shows task deletion without a separately visible confirmation in the demonstrated source sequence; Narro retains explicit permanent-delete confirmation as an intentional safety improvement.
- Detailed evidence: `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md`; coverage tracker: `docs/BLITZIT_UI_UX_VIDEO_TRACKER.md`.


## Blitzit Help Center text + image evidence pass (2026-09-27)

- Current visible legacy Help Center navigation: **34/34 pages inventoried/classified**.
- Narro-relevant core/product pages: **15/15 deep-reviewed for article text and available official image evidence**.
- Newer Blitzit 3.0 migration/integration material is explicitly version-separated from the v2.6.69/current-reference family and does not override supplied direct evidence.
- Permanent task delete confirmation is now source-confirmed: current Deleting/Archiving docs specify `Delete → Confirm`.
- Sessions export conflict remains deliberate: Help prose says PDF; current supplied screenshot says `Export .csv`; screenshot wins for Narro.
- Help screenshots reinforce task/list/Focus/Preferences/scheduling/recurrence/report visual hierarchy but do not establish exact animation timings.
- Troubleshooting documents source server-delay and second-monitor-restart limitations; Narro retains persistence-first local behavior and runtime display-topology recovery.
- Detailed evidence: `docs/BLITZIT_HELP_CENTER_EVIDENCE.md`; tracker: `docs/BLITZIT_HELP_CENTER_TRACKER.md`.


## Blitzit reference-image canonicalization (2026-09-27)

- The local reference folder now contains **46 canonical image files** with content-based descriptive filenames.
- **22** are current supplied v2.6.69 references, **17** are retained official Help Center originals, and **7** are historical Tool Finder references.
- One near-identical supplied Reports screenshot was removed from the working tree; Git history preserves it.
- Nine Help Center overlaps were not retained because stronger current/direct screenshots already cover the same state.
- Selection precedence is current/direct → newer version → complete state → resolution/sharpness → minimal unrelated chrome.
- Canonical inventory: `reference/original-blitzit-screenshots/CANONICAL_INDEX.md`.
- No application source/config/build semantics changed.
- PR #175 exact validated head `8d2ade29eff3e3be3550e6d0638f875d0097237d`: Windows CI #594 PASS (Repository Preflight, visual fixtures, Tauri Release, diagnostic artifact upload).
- Expected-head guarded squash merge: `72e825c991a53aee9c68a2411fa2439a9e599f26`.
- Resulting-main Windows CI #595 PASS through the repository identical-tree validation gate; heavy duplicate build job correctly skipped.
- Validated application source baseline remains `699b6ac46bcc6ebcabbcded21f929a7b32018b42`.


## VE-F003 task overflow correction — validated 2026-09-27

Current direct VE-005 evidence is now implemented without reopening M5:

- task overflow order: `Schedule / Update Schedule → Change List → Duplicate → Delete`;
- `Change List` moves the same TaskId to another active list, preserving the authoritative persisted lane plus schedule, recurrence linkage and prior closed-session history;
- `Duplicate` reuses M2 duplication semantics and creates exactly one independent TaskId without copying session history, manual-time adjustment, recurrence-parent/rule identity or completion/archive state;
- command-level stale/live checks are backed by transactional persistence guards so concurrent open-session state cannot silently cross the mutation boundary;
- All Lists remains a projection; task ownership is the persisted `listId`;
- the existing 6.25rem action slot remains fixed, with move up/down hit positions retained and the third slot used by the anchored overflow menu;
- permanent deletion still requires the existing explicit confirmation dialog.

Validation:
- PR #177 exact head `e80034f481bc8d9368bb670cadfce2cdcbe61797`;
- Windows CI #602 / run `36349274182`: PASS;
- visual artifact `10941762475`, digest `sha256:cad2d6f2b0210c1fb2d3213e564d8f0193a8b71ee8488331027fe5206dba85d5`;
- diagnostic artifact `10941867097`, digest `sha256:0f0daac870f0f5d13f88be0f970b341cfcc859c92bc07e5a599d6a2f88391979`;
- exact-head guarded squash merge `f4c80d04b25f58637c0ef04c03b60dcd52fcff57`;
- resulting-main Windows CI #603 / run `36349966245`: PASS through identical-tree validation;
- source slice diff: **+879/-28** across 14 files;
- **current validated application source baseline: `f4c80d04b25f58637c0ef04c03b60dcd52fcff57`**.

M8 remains 5/8 top-level validated; roadmap remains 6/10. Existing PR #170 must be reconciled onto this baseline before its historical CI can be reused for any purpose.


## M8 Preferences/runtime reconciliation — validated 2026-09-27

The existing M8 PR #170 was preserved and reconciled onto the validated VE-F003/main state rather than replaced.

Validation:
- reconciled exact head: `633877b1e64b2de3c8b24fad388bef2af6c1793b`;
- Windows CI #604 / run `36350930729`: PASS — Repository Preflight, Preferences visual fixtures, Tauri Release and diagnostic artifact upload all succeeded;
- visual artifact `narro-m5-visual-regression`, id `10942775993`, digest `sha256:5be194669c48d3442a3ac301ccdc4168a51f378d00b332ac690f8defb61413b5`;
- diagnostic artifact `narro-m1-runtime-harness-windows-x64`, id `10942122319`, digest `sha256:53543709c13df1a17bd76ed95fa5d6aba14d1f8092e3236cf16e43bceb4b2782`;
- expected-head guarded squash merge: `0a54b20f16f5cb69a32602148750b10d533ad470`;
- resulting-main Windows CI #605 / run `36351530441`: PASS through the repository identical-tree validation gate;
- validated source diff from prior source baseline `f4c80d04b25f58637c0ef04c03b60dcd52fcff57`: **+2273/-105 across 38 files**;
- **current validated application source baseline: `0a54b20f16f5cb69a32602148750b10d533ad470`**.

Validated product/runtime checkpoints:
- VE-F001: terminal EST suffix parsing is preference-gated; successful parse stores EST and strips only the parsed terminal suffix from the saved visible title across List Board, Search/quick-create and Focus Add Task;
- VE-F002: when success screen is enabled, Done commits completion and enters success UI before any next task starts; `Next Task` performs the explicit start transition;
- unresolved success-screen-disabled progression remains unchanged;
- source-visible success-screen `Take a Break` remains explicit but unavailable rather than inventing post-click timer/session semantics;
- VE-F008: nested Preferences controls stay mounted/in place and parent-gate without scroll-jump remounts;
- Hide EST / Time Taken preserves hover/focus disclosure;
- manual Start Break consumes persisted default break duration;
- event-driven Preferences projection updates consumers across windows without polling;
- no remote sound/media catalog was invented.

Scope remains partial at the top-level Preferences item: runtime effects not claimed by the slice (including any remaining timed-alert/timer-flash/notification/schedule-reminder/local-sound behavior) remain open, as does the separate Windows-locale date/time item.

M8 is now **6/8 top-level items validated**. Roadmap remains **6/10 milestones complete**.

## Schedule-reminder Preferences runtime — validated 2026-09-28

- PR #180 exact head: `0309c879998f43ff8c6e39e65f02c44669fa48b8`.
- Windows CI #607 / run `36352510898`: PASS — Repository Preflight, visual fixtures, Tauri Release and artifact uploads succeeded.
- Visual artifact `narro-m5-visual-regression`, id `10942113822`, digest `sha256:3428b6e380deab43abfaa031d140bb5ba47782f0a8d09393a4077773868bb16e`.
- Runtime artifact `narro-m1-runtime-harness-windows-x64`, id `10942647770`, digest `sha256:fd036e89988fd34cf0170bace0ec3d81bff1b5b38e9020b29c716e49e0597724`.
- Expected-head guarded squash merge: `643528ca223b29fd8fbd215db5b1b525c912c6fc`.
- Resulting-main Windows CI #608 / run `36353206934`: PASS.
- Schedule-reminder Preferences now use a dedicated durable idempotent effect ledger, persisted enable/lead settings and the existing authoritative background reminder thread. Failed notification submission remains retryable and manual/explicit M4 reminder rows remain separate.
- **Current validated application source baseline: `643528ca223b29fd8fbd215db5b1b525c912c6fc`.**

## Audit incorporation gate — active 2026-09-28

The project now uses `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` as the mandatory finding→implementation routing layer.

Binding execution rule:
- known actionable findings on already-built/current surfaces are corrected before unrelated forward feature work;
- future-milestone findings remain routed to their ordered milestone;
- source ambiguities are not guessed;
- intentional Narro reliability/accessibility/agency improvements are retained;
- no material parity/video/Help/UIUX/reliability finding may remain orphaned only inside an evidence document.

Current immediate correction:
- **CORR-01 recurrence update / No Repeat flow** — current Narro recurrence UI still reflects an older assumption. VE-017 plus current Help Center evidence shows No Repeat conditionally exposing a destructive `Delete existing tasks(n)` row. This correction is ordered before remaining M8 alert/sound runtime work.
