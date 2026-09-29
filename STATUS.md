# STATUS.md

Last updated: 2026-09-30

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`. Immutable implementation evidence lives under `work-log/`.

## Current phase

**Milestone 1 — reopened Windows/Focus foundation, driven by the M7 single-Focus corrective program.**

**Current corrective direction, 2026-09-30:** retain one persistent nominal
340×700 logical px `focusSurface` HWND/WebView with one React root/coordinator.
The exact CI #679 artifact physically failed both strict gates despite fixing the
saved-position teleport and repeated-push cross-monitor drag behavior.

**Latest physical evidence:** source
`c0be4ec0fe94863182bbf0d2e1ba4931ada67d93`, CI #679 / run
`36630411679`, recording `2026-09-30 01-11-12.mp4` (SHA-256
`e128d5fb08392f08312d237a9dab2a6d0d75a50611ac34331aa7454077a69642`).
Gate 7 still exposes a full-height transparent/outlined host tail during
Panel→Timer (~40.70–40.90 s and repeated later). Gate 12 now crosses to the
user-confirmed 125% display in one continuous drag with correct scaled Timer
geometry, but return-to-Panel still flashes a narrow stale viewport/browser
scrollbar state (~53.50–53.60 s; same family around ~21.9–22.1 s).

**Current PR #192 corrective candidate:** exact head
`8a60e92e47ae407098a1f3170ae4170848d262eb`. Panel→Timer now clips to the
target Timer region before native position motion. Cross-DPI Timer→Panel keeps
the previous Timer region clipped through target host size correction, waits a
bounded 50 ms viewport-settlement interval, then reveals the full Panel; same-DPI
return retains the continuous reveal. Regression contracts cover both ordering
rules. Windows CI #682 / run `36639559040` is **IN PROGRESS**. No physical
counter advances until exact-head CI and a new combined physical batch pass.
See `work-log/2026-09-30-chatgpt-m7-ci679-physical-fail.md`.

The corrective dependency chain is M1 foundation → M6 Focus integration → M7
Timer/transition → affected M8 shortcut integration. M2–M5 and unaffected M8
settings/persistence remain outside the rewrite. PR #191 is **closed unmerged**;
its split-window composition is superseded historical evidence, not a merge candidate.

- Milestone 1 / Gate A: **REOPENED / 11 of 19 top-level items currently validated**. Exact-head CI now validates the two-window replacement composition and consolidated Focus-only production entry; interactive presentation/topology, performance and physical acceptance items remain open.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5 / Gate E: **PASS**.
- Milestone 6 / Gate F: **REOPENED / 15 of 18 top-level items currently validated**. Placement/topology plus complete Focus Panel integration on the new host require replacement-code validation.
- Milestone 7: **OPEN / 1 of 15 top-level items currently validated**. Host/presentation/placement/shortcut/performance-dependent items are reopened; Gate 7 and Gate 12 remain open.
- Milestone 8: **PARTIAL / 3 of 8 top-level items currently validated**. Focus shortcut routing and Start Break are reopened because the integration target changes; unaffected settings work remains validated.
- Milestones 9–10: **NOT STARTED**.

General roadmap progress: **4 of 10 milestones currently complete**.

This reduction is intentional and evidence-based, not loss of historical work. M1 and M6 were previously completed on the superseded Focus implementation, and their work logs remain valid historical evidence. Because the replacement changes implementation that materially supported those gates, affected items are reopened until validated on the replacement. A direct dependency was also found in M8 shortcut routing, so only those M8 items are reopened. M2–M5 remain complete because no direct dependency has been identified.

**Historical CI #530 physical checkpoint:** three settled Panel→Timer→Panel shortcut cycles retained one Focus window and the paused task, but continuous capture with Windows animations On showed a pale empty focus frame and then the desktop before Timer appeared. This was an earlier Gate 7 FAIL and is retained only as historical evidence; CI #624 and the later PR #191 experiments provide newer pre-replacement evidence. The checked #530 frames and provenance remain in `work-log/2026-09-26-codex-m7-ci530-panel-timer-physical-fail.md`.

## Current validated application source baseline

The current validated **merged application source baseline** is `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed` (PREF-R01 / Windows CI #624), as recorded in `HANDOFF.md`. PR #191 remains closed historical evidence. The active PR #192 corrected head `44119dbe829131d38f56fd35250142ed973b2574` passed Windows CI #674 but then physically failed Gate 7 and Gate 12, so it does **not** replace the merged validated baseline. Continue the same PR with the exact-build corrective scope recorded in `HANDOFF.md`.

## Repository documentation/process policy — 2026-09-29

Authoritative process/spec/tracking/evidence-only changes now advance **directly on `main`** when they do not change executable, build, test, packaging, dependency or CI semantics. Markdown is path-ignored by Windows CI; non-Markdown evidence-only commits use GitHub's supported `[skip ci]` commit instruction. These commits do not replace the validated application-source baseline. Active implementation branches must reconcile this repository truth from `main` before continuing source work.

This exemption does **not** apply to workflow YAML, scripts/tests, package/Cargo manifests or lockfiles, Tauri/runtime/capability configuration, migrations/schemas, generated manifests, or fixtures/assets consumed by runtime/build/test/packaging. Those remain validation-affecting source and use the normal branch/PR/preflight/CI discipline.

The existing Windows CI already ignores `**/*.md` on push and pull request, so no workflow edit was required. Sanitized M7 evidence PNGs were also published directly to `main` in commit `1655076e97c5d75e8acc0494931d6f82e0e88ff4` using `[skip ci]`; GitHub reported no Windows CI run for that commit.

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

M7 remains **incomplete at 9/14 top-level items**. The 2026-09-26 exception allowed independent M8 source work while those physical checks stayed open. That execution exception is now superseded by the user's 2026-09-28 direction: after validated PREF-R01, the next implementation gate is the consolidated M7 physical Windows batch before any further M8 source slice.

The M7 source checkpoint baseline at that time was `76ef5dadf1d6587ee52d029d980ad4de7a9abd93`; it is historical evidence, not the current project source baseline.

## Milestone 8 — Preferences/runtime in progress

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

M8 validated top-level state is **6/8**:
- in-app shortcuts: complete;
- global shortcuts + toggles: complete;
- global conflict/error feedback: complete;
- Start Break shortcut lifecycle: complete;
- conditional/nested Preferences behavior: complete;
- versioned local preference persistence: complete;
- the top-level Preferences item remains open because PREF-R02, PREF-R03 and PREF-R05 are still open; PREF-R01 and PREF-R04 are validated;
- Windows-locale/system 12/24-hour presentation remains open as PREF-R06.

The shortcut-foundation checkpoint baseline was `699b6ac46bcc6ebcabbcded21f929a7b32018b42`; it is historical evidence, not the current project source baseline.

### Uploaded Blitzit video corpus — reconciled 2026-09-27

The repository now contains **19/19 paired MP4/SRT sources (38/38 raw files)** under `reference/original-blitzit-videos/inbox/`. Initial ingestion is complete: **19/19 analyzed, 19/19 Narro-reconciled, 19/19 dispositioned**. Coverage lives in `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md`; detailed timestamps/classes/dispositions live in `docs/BLITZIT_VIDEO_EVIDENCE.md`.

Material implementation consequences:
- VE-F003 promoted task-menu `Change List` + `Duplicate` from old B1 ambiguity to current direct behavior evidence; the narrow post-M5 correction was completed and validated in PR #177 without reopening M5 wholesale.
- VE-F001 resolves EST parser title normalization: a successfully parsed terminal duration is removed from the saved visible title and stored as EST.
- VE-F002 resolves only the success-screen-enabled Done path: success UI appears before next-task start and `Next Task` is explicit. Success-screen-disabled progression remains unresolved; the visible `Take a Break` post-click domain semantics are not shown and must not be guessed.
- VE-F008 directly corroborates M8 nested Preferences behavior and hide-times hover disclosure.
- VE-F004 corroborates Blitzit's live-task note-URL auto-open; Narro's explicit-activation deviation remains binding.
- VE-F007 adds a coarse ~0.2–0.3 s source Panel→Floating visual sequence but does not close any deferred M7 physical Windows checks.
- Reports/Sessions findings are routed to M9 and do not front-run M8.

VE-F003 task-menu Change List + Duplicate is validated in PR #177 / CI #602 / merge `f4c80d04b25f58637c0ef04c03b60dcd52fcff57` / main CI #603. PR #170 was subsequently reconciled and validated; this paragraph is retained only as evidence history, not as a current continuation instruction.

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

PR #155 is merged. Its later reconciled exact head `c630a57346c067ab04c0fa086703582542f4f7e5` passed Windows CI #559 and merged as `76ef5dadf1d6587ee52d029d980ad4de7a9abd93`; the remaining M7 state is physical/manual acceptance, not an open source PR.

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
## Blitzit evidence corpus — current state

The earlier inbox-setup state is superseded. The uploaded corpus is present and fully reconciled:
- 38/38 raw files;
- 19/19 MP4/SRT pairs;
- 19/19 product-behavior analyses/reconciliations/dispositions complete;
- 19/19 second-pass UI/UX forensic reviews complete.

Current durable evidence lives in `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md`, `docs/BLITZIT_VIDEO_EVIDENCE.md`, `docs/BLITZIT_UI_UX_VIDEO_TRACKER.md` and `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md`. No video upload/analysis prerequisite remains open. The post-M10 Final Comprehensive Review must still re-reference this corpus as an end-state gate.

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
- Validated application source baseline immediately after this VE-F003 slice: `f4c80d04b25f58637c0ef04c03b60dcd52fcff57` (historical checkpoint).

**Historical checkpoint (2026-09-27):** M8 was 5/8 and roadmap was 6/10 at this point. Existing PR #170 still required reconciliation onto that baseline before its historical CI could be reused.


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
- Validated application source baseline immediately after this M8 reconciliation slice: `0a54b20f16f5cb69a32602148750b10d533ad470` (historical checkpoint).

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

**Historical checkpoint (2026-09-27):** this slice brought M8 to **6/8** while roadmap completion was **6/10** at that time. Current counters are defined only by the top Current phase section.

## Schedule-reminder Preferences runtime — validated 2026-09-28

- PR #180 exact head: `0309c879998f43ff8c6e39e65f02c44669fa48b8`.
- Windows CI #607 / run `36352510898`: PASS — Repository Preflight, visual fixtures, Tauri Release and artifact uploads succeeded.
- Visual artifact `narro-m5-visual-regression`, id `10942113822`, digest `sha256:3428b6e380deab43abfaa031d140bb5ba47782f0a8d09393a4077773868bb16e`.
- Runtime artifact `narro-m1-runtime-harness-windows-x64`, id `10942647770`, digest `sha256:fd036e89988fd34cf0170bace0ec3d81bff1b5b38e9020b29c716e49e0597724`.
- Expected-head guarded squash merge: `643528ca223b29fd8fbd215db5b1b525c912c6fc`.
- Resulting-main Windows CI #608 / run `36353206934`: PASS.
- Schedule-reminder Preferences now use a dedicated durable idempotent effect ledger, persisted enable/lead settings and the existing authoritative background reminder thread. Failed notification submission remains retryable and manual/explicit M4 reminder rows remain separate.
- The validated application source baseline immediately after this schedule-reminder slice was `643528ca223b29fd8fbd215db5b1b525c912c6fc`; later validated source slices supersede it.

## Product fidelity direction — clarified 2026-09-28

The user explicitly confirmed that Narro is intended as a **local, personal-use reconstruction of Blitzit**, with maximum observable visual and functional parity for all in-scope features supported by evidence.

Binding interpretation:
- confirmed Blitzit UX/visual/product behavior is the default target;
- do not introduce discretionary redesigns or "better UX" substitutions on evidenced surfaces;
- internal architecture may differ freely;
- cloud/account/subscription/AI/integration dependencies remain excluded by the local-only scope;
- documented source bugs/reliability failures are not reproduced when doing so would compromise correctness/data integrity;
- accessibility/Windows correctness and genuine evidence ambiguity remain explicit exceptions;
- ambiguity does **not** mean implementation should remain frozen when the exact source detail is unrecoverable: after exhausting relevant evidence, choose the strongest professional reconstruction using adjacent Blitzit patterns, Narro's established UI/UX system, Windows conventions, accessibility, reliability and standard engineering/design practice; record it as inference/design decision rather than confirmed source behavior;
- the Blitzit history/risk research is preventive: known failure families must inform implementation architecture, edge cases and regression tests before the affected feature is built;
- every material exception or inferred decision must stay documented in the audit crosswalk/STATUS rather than becoming a silent deviation.

This clarification does not reopen milestones merely because stronger fidelity guidance exists. Reopening occurs when concrete evidence or a replacement implementation invalidates the acceptance basis of specific items. The current single-Focus replacement is such a case for defined M1/M6/M7 and M8-shortcut scope; unaffected milestones/items remain closed.

## Final audit-method hardening — 2026-09-28

A self-audit of the audit plan found that the existing evidence work is already broad/deep, but three final-review requirements needed to be made explicit rather than implied:
- **reference completeness:** every canonical Blitzit image must receive an individual final disposition, so a general screen matrix cannot silently skip a reference;
- **named professional UI/UX methodology:** final review must apply explicit evaluation lenses (including Nielsen heuristics, Gestalt, Fitts, Hick-Hyman, progressive disclosure/recognition-over-recall, Windows conventions) plus measurable WCAG 2.2 AA contrast evidence where applicable, while preserving confirmed Blitzit parity as the product target;
- **local desktop security/privacy sweep:** final engineering review must explicitly inspect Tauri capabilities/IPC, external URL/filesystem/network/telemetry boundaries, SQLite/query boundaries, dependency advisories and release configuration.

The final visual comparison gate also now requires repeatable capture context plus key geometry/typography/color measurements where useful, not subjective visual inspection alone.

This is audit methodology only. It does not change application source, milestone completion, or the current validated application source baseline.

## Audit incorporation gate — active 2026-09-28

The project now uses `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` as the mandatory finding→implementation routing layer.

Binding execution rule:
- known actionable findings on already-built/current surfaces are corrected before unrelated forward feature work;
- future-milestone findings remain routed to their ordered milestone;
- source ambiguities are not guessed arbitrarily: exhaust relevant evidence, then use the professional evidence-consistent fallback defined in `AGENTS.md` and record material inference explicitly;
- intentional Narro reliability/accessibility/agency improvements are retained;
- no material parity/video/Help/UIUX/reliability finding may remain orphaned only inside an evidence document.

Current audit state:
- **CORR-01 recurrence update / No Repeat flow:** VALIDATED in PR #182 / CI #617 / main CI #618.
- **PREF-R01 timed task alerts:** VALIDATED in PR #184 / CI #624 / merge `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.
- **M7-PHYS-01:** active `FIX_NOW` physical failure on PR #192 head `73d10ab6...`; the 60 fps exact-artifact recording shows repeated blank/light host exposure during Panel↔Timer. Evidence-backed cause is the opaque focus document canvas (`App.css` root/body) becoming visible while renderer clipping and Win32 region differ.
- **M7-PHYS-02:** active `FIX_NOW` mixed-DPI finding; replacement Gate 12 remains NOT RUN.
- The replacement materially invalidates prior acceptance evidence for defined M1/M6/M7 items and directly affected M8 shortcut integration; those checklist items are reopened in `TODO.md`.
- Implementation and exact-head automated validation are complete on PR #192 head `73d10ab6...` / Windows CI #672, but Gate 7 then physically failed. Continue on the same PR with the narrow document-transparency correction; do not reopen the architecture without new evidence.

## CORR-01 recurrence No Repeat correction — validated 2026-09-28

- Evidence: VE-017 + current Help Center recurrence state + UI/UX forensic reconciliation.
- PR #182 exact validated head: `72ab6c77d5e5f5e50c7f3f7e6a0c11b98c7c606c`.
- Windows CI #617 / run `36354972305`: PASS — Repository Preflight, Rust checks/tests, light/dark Repeat + No Repeat visual fixtures, Tauri Release and required artifact uploads all succeeded.
- Visual artifact `narro-m5-visual-regression`, id `10943374010`, digest `sha256:4d9b5005e53d842c1c8eb9774b6f29e9b950c0447a651914243d84c9f7b776b6`.
- Runtime artifact `narro-m1-runtime-harness-windows-x64`, id `10943557612`, digest `sha256:1a9325c54af943de7ba05cf375ab313447f3a10b004e81a6f85a858a91a02ee6`.
- Expected-head guarded squash merge: `50006f29b0329037aecfdab772104db8670768b0`.
- Resulting-main Windows CI #618 / run `36355523089`: PASS.
- Existing recurrence now exposes `No Repeat` in-flow. Normal updates show neutral `Replace existing tasks(n)`; No Repeat shows the warm/red `Delete existing tasks(n)` consequence.
- Unchecked No Repeat detaches existing linked children as independent tasks. Checked Delete Existing removes only pristine active generated children; customized, history-bearing, completed, archived and legacy-linked children survive and detach.
- Stale expected-version guards, parent identity, recurrence idempotence and persistence-first publication remain intact.
- **At this CORR-01 checkpoint** there were no active `FIX_NOW` audit rows. Later M7 physical evidence created M7-PHYS-01/02; current audit state is recorded above.
- The validated application source baseline immediately after CORR-01 was `50006f29b0329037aecfdab772104db8670768b0`; later validated source slices supersede it.

**Historical checkpoint:** roadmap was **6/10** and M8 **6/8** before the later single-Focus replacement reopened affected M1/M6/M7/M8 items.


## PREF-R01 timed task alerts — validated 2026-09-28

- PR #184 exact validated head: `fc61ed5926fdb1c605de8ce1e1a9fb28ea0dfd7e`.
- Windows CI #624 / run `36357415253`: PASS — Repository Preflight, Windows visual regression, Tauri Release and required artifact uploads succeeded.
- Visual artifact `narro-m5-visual-regression`: id `10944696812`, digest `sha256:2569c35b4aef14a713b4d73d4f80b9bd6e02114e764b6e9f8646aa29a781c769`.
- Runtime artifact `narro-m1-runtime-harness-windows-x64`: id `10944304485`, digest `sha256:4f76740bc6f69dcd1d664c9fb80011520567612c9eb6d87ab4e09e02e3b1bf7c`.
- Expected-head guarded squash merge: `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.
- Resulting-main source identity was verified against the validated PR head: same base `0770e3d41b3f5a55b2d23b6874975cbd420ef379` and identical blob SHAs for all nine changed files.
- Timed alerts consume persisted enable/interval Preferences and authoritative Rust work elapsed state.
- Pause/break time does not advance timed-alert progress.
- Durable run/boundary effects provide delayed catch-up and at-most-once/idempotent behavior across repeated observation and database reopen.
- Enabling alerts late or changing interval does not backfill prior work.
- Typed local `timed-alert-effect` events form the later PREF-R02/PREF-R05 consumption boundary without implementing flash/sound prematurely.
- PREF-R02, PREF-R03, PREF-R05 and PREF-R06 remain open.
- **Validated application source baseline established by this slice:** `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`; it remains the current validated application source baseline unless a later source validation supersedes it.
- **Historical checkpoint:** roadmap was **6/10**, M8 **6/8**, and the then-current M7 physical closure shorthand was **9/14** before later evidence/reopening.
- The then-current next gate was consolidated M7 physical Windows validation; that action was later superseded by the corrective architecture program recorded at the top of this file.

## M7 CI #624 physical Windows batch — 2026-09-28, corrections in progress

The latest suitable validated application artifact was CI #624 (runtime artifact `10944304485`, exact source tree `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`). The real Windows 10 Pro 19045 batch is recorded with timings, raw video hashes and sanitized frames in `work-log/2026-09-28-codex-m7-ci624-physical-batch.md`.

- **Gate 7 FAIL:** three Panel↔Timer cycles with Windows animations On exposed 3–5 pure-white frames on every Timer→Panel return; three Expand/Collapse cycles exposed enlarged/shrinking white surfaces. Two valid Panel↔Timer cycles with Windows animations Off had no blank frames; Off Expand/Collapse remains untested. The OS animation setting was restored to its original On value.
- **Gate 8 PASS:** rapid transition-boundary Ctrl+Shift+T bursts settled with one Focus window, no stuck state and continuous paused session.
- **Gate 9 PASS:** repeated visible-Timer Find pulses with actual animations On/Off stayed finite; Panel-mode P was a no-op; the Off pulse followed native mode hide/show.
- **Gate 10 PASS:** secondary-monitor move, disconnect/reconnect recovery, restart with saved placement, and separate no-saved-placement restart preserved the same task/session/time and kept Timer inside an available work area.
- **Gate 11 PASS:** Timer stayed visible above a separate borderless fullscreen Windows Forms app through focus switching. Exclusive fullscreen was unavailable and remains unclaimed.
- **Gate 12 FAIL:** on moving to a 125% secondary monitor, Timer shrank to about 271×75 and exposed horizontal/vertical scrollbars. A Panel→Timer logical-size reapply restored 425×138. Once correctly sized, bottom-edge expansion to 443×384 at y=696 fit exactly within the 1080 px work area and collapsed accessibly. Non-default taskbar edge and a separately shortened work area were not run.

At the time of the CI #624 batch, the M7 checklist had reached the then-current closure state recorded in its immutable work log. That state is now superseded for roadmap progress by the single-Focus replacement reopening: current M7 is **1/15**, current M8 is **3/8**, and current roadmap completion is **4/10**. The physical batch remains valid historical evidence for the superseded implementation.

PR #191 (`fix/m7-visual-hold-physical`) first made the native bitmap hold opaque/explicitly topmost, disabled DWM transitions on the Focus/hold HWNDs, and added mixed-DPI Timer logical-size recovery. Exact head `f1ef35aabc97aed9e8044130e442a85276c62536` passed Windows CI run `36371772752`; its exact runtime artifact was physically retested. Three Panel↔Timer and three Expand/Collapse cycles with Windows animations **Off** retained the same paused `fas` session and 07:40, but the resize still exposed an expanded white tail under compact content, so Gate 7 remains **FAIL**. The attempted On capture was interrupted before cycles and Gate 12 was not run on this candidate. Evidence is in `work-log/2026-09-28-codex-m7-pr191-retest-in-progress.md` and its sanitized frame sequence.

The next PR #191 candidate covers the union of old/new Timer rectangles with the desktop hold and raises the hold again after native reveal. Its first head `788fb87` passed Windows compilation but failed CI run `36373523377` at Clippy on a redundant cast. Current head `12707c0bd5c28854e6017ef1d805e41c686e3f60` removes the cast without changing behavior and passed exact-head Windows CI run `36373768756` (preflight, visual fixtures, Tauri release). Runtime artifact id `10949818132`, digest `sha256:5d03ce449875167e9c559316df980c0ec9f64a1b74baf153985d376b0f3b2850`; extracted `narro.exe` SHA-256 `B48808150F6BC87BD026E0065B413BA470AF6390143B05957AD1B19AC9E706A3`. `cargo fmt --check`, `git diff --check`, and the visual-hold owner tests pass locally; local `cargo check` is unavailable because `link.exe` is absent. A fresh On/Off + mixed-DPI physical retest remains required. The original SQLite profile backup is still held for restoration after testing. The user has restored the secondary monitor to its original 100%; Windows animations are now On by both `SPI_GETANIMATION` and `SPI_GETCLIENTAREAANIMATION` and must end in the original On state.

The new physical findings are routed as `M7-PHYS-01` and `M7-PHYS-02`, both `FIX_NOW`, in `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` until physical acceptance.

The exact `12707c0` binary was then physically recorded at 60 fps with Windows animations On: three Panel↔Timer and three Expand/Collapse cycles retained the same paused `fas` session, but the old expanded white rectangle remained visible below compact content during resize. Gate 7 remains **FAIL**; animations Off and Gate 12 were not run on this failing candidate. The raw capture hash and sanitized failure frame are in `work-log/2026-09-28-codex-m7-pr191-retest-in-progress.md`. Commit `d505b93` changes the native hold to the target window bounds before reveal, including mode changes; exact-head CI run `36374929708` and physical retest are pending. The original SQLite profile backup remains held for restoration, secondary scale is 100%, and Windows animations are On.

**Repeated-failure escalation, 2026-09-28 (earlier snapshot):** The chronological evidence and distinct visual signatures are consolidated in `work-log/2026-09-28-codex-m7-visual-continuity-history.md`. `d505b93` passed exact-head Windows CI and its sampled animations-On cycles avoided the earlier white tail, but the 60 fps animations-Off resize capture on one 100% display shows a full-white expanded Timer frame at frames 570 and 677. Gate 7 remained **FAIL**. This is not claimed to be the identical compositor cause as earlier defects. CI-validated physical failures on `f1ef35a`, `12707c0`, and `d505b93` exceeded the new `AGENTS.md` escalation threshold. At this point, `b23c8ab` had passed CI run `36397349549` but had no physical verdict; the architecture assessment and profile restoration were still pending. The subsequent result and current state are recorded below.

**Architecture assessment and latest physical result:** `work-log/2026-09-28-codex-m7-architecture-assessment.md` records the full source-to-compositor sequence, alternatives, and bounded experiment decision. Exact PR #191 head `b23c8ab` passed CI run `36397349549` but **physically FAILED Gate 7**: the batched animations-Off recording caught a fully white expanded Timer at frame 1394 and white collapse areas at frames 1489 and 1552, with valid adjacent frames and the same paused session. The desktop captures ran below requested 60 fps, so the On recordings are not asserted as PASS; the Off frames alone prove failure. The offscreen bitmap preparation did not remove the symptom. No further small hold patch is planned. The first architecture experiment is a separate persistent Timer WebView, fixed at expanded outer size and clipped natively for compact display; a native layered Timer is the fallback if that fails or costs too much. Neither alternative is implemented or validated. After capture, Narro was stopped, the original SQLite profile restored byte-for-byte (SHA-256 `D18A33C0BF5F88DACC74A513105C5E7A8FE7D3EE5E3A02F12E6EBDCBC5EC33C0`, integrity `ok`), and both Windows animation settings restored to On. Windows reported one display, so Gate 12's secondary-display branch remained open. At that checkpoint M7 was open and PR #191 was still open/unmerged; PR #191 was later closed unmerged as superseded on 2026-09-29.

**Historical separate Timer experiment snapshot, 2026-09-29:** A local candidate now gives the Panel (`focusSurface`) and Timer (`floatingTimer`) persistent WebView windows. The Timer HWND remains at 340×300 logical pixels, while a DPI-aware Win32 region exposes 340×110 in compact mode; renderer content is painted before region expansion and clipped before collapse. Rust keeps authoritative mode/session state and native placement; both renderers project the same timer session. The Panel remains the single mode-transition coordinator. Frontend preflight and TypeScript/Vite build passed locally; Rust formatting passed. Local native compilation is unavailable because MSVC `link.exe` is absent, so exact-head Windows CI is the next compilation gate. No physical or performance verdict exists for this candidate, and Gate 7/12 remain open. This is a scoped experiment rather than an adopted architecture or M7 PASS.

**First separate-Timer physical batch:** Exact candidate `8b94946` passed Windows CI `36493571169`; the downloaded binary SHA-256 and full capture provenance are in `work-log/2026-09-29-codex-m7-separate-timer-physical.md`. On and Off batches each recorded 3× Expand/Collapse and 3× Timer↔Panel at about 78 actual fps on one 100% display. All 12 clipping boundaries avoided the previous full-white expanded frame/old white tail, and the frame scan found no inkless white top-window candidate. The same paused `fas` session and `07:40` survived. However, the On boundary frames exposed brief `Loading Focus Panel…` and `Loading focus task…` copy while already-mounted renderers refreshed the same board. **Gate 7 remains FAIL** for this candidate. The next candidate retains the last valid same-target board during refresh; local frontend preflight passed, while exact-head CI, repeat physical capture and resource comparison are pending. Gate 12's secondary 125% branch remains open; Windows currently exposes one display. Windows animations were restored to On after both batches.

**Second separate-Timer physical batch:** The same-target board-retention head `a6a9459` passed Windows CI `36495957450` attempt 2 and was physically captured on its exact executable with Windows animations On. The loading copy is gone, but the compact Timer still overlays the Panel's top controls for several frames during mode switching; Gate 7 remains **FAIL**. A scoped native follow-up `4e4960b` disables DWM show/hide transitions for both Focus windows and activates the destination before reveal. Exact-head CI and one Panel↔Timer physical capture are pending. The architecture experiment's measured paused floating-only working set increased by about 95 MiB versus the single-WebView comparison. Details and raw video hashes are in the 2026-09-29 work log. Gate 12 remains open; no further M8 implementation is authorized in this slice.

**Time-bounded DWM retest and stop, 2026-09-29 (historical decision):** Exact source `4e4960b` passed Windows CI run `36530577060`; its exact executable was recorded through three settled Panel↔Timer cycles at 77.41 fps with Windows animations On. The six transition boundary sequences contain neither the old full-white host nor loading copy, but Timer→Panel still briefly overlaps the compact Timer and Panel card for about 0.07–0.10 seconds. This is an improvement, **not strict Gate 7 acceptance**. The user directed that checks remain confined to the transition and that the repeated-fix loop stop. At that checkpoint PR #191 remained unmerged; it was later closed unmerged as superseded. Gate 7/12 remain open for the replacement architecture. Original SQLite profile and Windows animations On were restored and verified. At that point the next comparison was proposed as a native layered Timer/window composition; the subsequent user-selected single fixed-host Focus plan above **supersedes that next-action recommendation**. Full physical evidence remains in `work-log/2026-09-29-codex-m7-separate-timer-physical.md`.
