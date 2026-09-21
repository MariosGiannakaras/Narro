# M7 Floating Timer compact-mode foundation — validated implementation log

Date: 2026-09-21
Agent/tool: ChatGPT with GitHub connector
Milestone: 7 — Floating Timer mode
Item: 1/14 — Implement compact mode by transforming the existing `focusSurface` window; do not create a third persistent webview
Result: VALIDATED / COMPLETE

This immutable entry records the first Milestone 7 slice. Markdown-only tracking commits created after the source/test merge do not replace the validated source/test baseline below.

## Contract reconstructed

Repository, M1 physical evidence, M6 implementation and product/UI specs established:

- Narro normally uses exactly two webviews: `main` and reusable `focusSurface`;
- M1 already physically proved `focusSurface` Panel -> Timer -> Panel reuse, Timer always-on-top and skip-taskbar behavior;
- Rust/native already owns mode-dependent window size/restyle via `configure_focus_surface_mode`;
- normal product `focus.tsx` previously always rendered `FocusPanel` and did not project the native Timer mode;
- M6 intentionally left the Compact control inactive for M7;
- item 1 therefore owns the **product same-window mode transformation foundation**, not a new timer engine or another native window primitive;
- renderer reload must reconcile the existing Rust presentation mode rather than blindly assume Panel;
- compact -> Panel return must use the preference-aware production `present_focus_panel` path;
- item 1 must not absorb later M7 collapsed screenshot content, expanded actions/subtasks, shortcuts, safe-position persistence, transition animation or final performance remeasurement.

Mode changes are presentation/window changes only. They may not start, pause, resume, switch, complete or otherwise own the authoritative timer/session.

## Implementation

Implementation branch:

`m7-floating-compact-mode`

Starting tracking/base SHA:

`42e2cd905e9dda58b6d40eecccd8bbe735377f55`

Final exact PR head:

`2bd3144c00d1fd99be35bd43a5ed661f51beaf3c`

PR: #117 — `M7: add Floating Timer compact-mode foundation`

Final changed-file scope was exactly eleven files:

- `HANDOFF.md`;
- `package.json`;
- `scripts/test-ui-floating-compact-mode.mjs`;
- `scripts/test-ui-focus-icon-tooltips.mjs`;
- `scripts/test-ui-focus-panel.mjs`;
- `src-tauri/src/lib.rs`;
- `src/FloatingTimerFoundation.tsx`;
- `src/FocusPanel.tsx`;
- `src/floatingTimerFoundation.css`;
- `src/focus.tsx`;
- `src/focusSurfaceModeApi.ts`.

Production behavior:

- native `focus_surface_mode_snapshot` exposes read-only Panel/Timer presentation state;
- production `present_floating_timer` reuses `FOCUS_SURFACE_LABEL` and the existing M1-validated Timer configuration;
- the legacy diagnostic Timer command delegates to the production same-window compact transition;
- the M1 foundation remains `300x100`, always-on-top and skip-taskbar for this item; later M7 visual/sizing work may refine content-driven dimensions;
- typed renderer mode API wraps snapshot, compact presentation and preference-aware Panel return;
- product `FocusSurfaceProduct` reconciles native mode on mount;
- renderer mode changes only after the native transition succeeds;
- transition failure remains visible without mutating timer/session state;
- the M6 Compact button becomes the ordered M7 active control when its product callback is present, while deterministic Focus fixtures remain inert;
- a minimal `FloatingTimerFoundation` product shell makes the transformation reversible with an accessible return-to-Panel control;
- no collapsed screenshot title/timer/subtask/action-strip content from later items is implemented yet.

No SQLite/schema, task/domain, timer/session transition, scheduling classification, persistence, monitor-selection, display-topology recovery or dependency/lockfile behavior changed.

## Deterministic coverage

New `scripts/test-ui-floating-compact-mode.mjs` locks:

- reuse of the existing `FOCUS_SURFACE_LABEL`;
- absence of `WebviewWindowBuilder` from the production compact transition;
- retained M1 compact always-on-top/skip-taskbar foundation;
- native read-only mode snapshot/reconciliation;
- native-success-before-renderer-mode publication;
- active Compact callback semantics;
- accessible reversible Panel return;
- absence of timer/session mutation commands in the mode API;
- no later-item live-timer/actions/subtask content in the item-1 foundation shell;
- no decorative animation/overlay behavior in this item;
- frontend preflight registration.

Existing Focus Panel and icon-tooltip contracts were evolved only to recognize Compact as the ordered M7 active control while Preferences remains inactive.

Local branch clone + targeted validation was attempted but **NOT RUN** because the connector execution environment could not resolve `github.com` before checkout. Authoritative Windows CI remained the full gate.

## CI failure history and evidence-backed corrections

### Windows CI #447 — stale M6 product-root assertion

Initial exact PR head:

`04b612d274c6e04b827d46f82542a6eede9552d7`

Run `35533002557`, job `106136907926`: **FAIL** at Repository Preflight.

Exact failure:

`Focus Panel UI contract failed: product Focus Panel default rendering is missing`

The legacy M6 source assertion still required normal product `focus.tsx` to render `<FocusPanel />` directly, while ordered M7 item 1 introduced `<FocusSurfaceProduct />`.

Evidence-backed correction:

`d861ffa5ef6d21b180548c7821864786914851f8`

Only the stale deterministic expectation changed. Production source was unchanged.

### Windows CI #449 — line-ending-brittle new compact contract

Run `35533079926`, job `106137172020`: **FAIL** at Repository Preflight.

Exact failure:

`Floating compact-mode contract failed: M1 diagnostic Timer command must delegate to the production same-window compact transition`

Source inspection confirmed the delegation existed. The new assertion embedded an LF-only multi-line source string while Windows checkout used CRLF.

Evidence-backed correction:

`e8b4961f98b6c0c8c5c3e4ed84fc81eb928a197b`

The deterministic assertion was changed to a semantic function-slice check insensitive to line endings. Production source was unchanged.

A later durable handoff commit produced final exact PR head `2bd3144c00d1fd99be35bd43a5ed661f51beaf3c`.

## Exact PR-head validation

Windows CI #451:

- run `35533171618`;
- job `106137420110`;
- exact PR head `2bd3144c00d1fd99be35bd43a5ed661f51beaf3c`;
- conclusion: **SUCCESS**.

Required gates:

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**.

Artifacts:

- visual regression artifact `10612486287`, digest `sha256:413902b9a659246e818a7275a2d9cda852f69f125e8442f11afd00a8df3f2377`;
- diagnostic/runtime artifact `10611533572`, digest `sha256:1f33793cc15b5983d851f7f5927ff655fc8d84d88f13ca284d1e13ea384b41e4`.

Final review verified:

- exact PR head remained `2bd3144c00d1fd99be35bd43a5ed661f51beaf3c`;
- PR was mergeable;
- `main` remained exactly at PR base `42e2cd905e9dda58b6d40eecccd8bbe735377f55`;
- changed-file scope was exactly the eleven expected files above;
- no conversation comments existed;
- no submitted reviews existed;
- no inline review comments existed.

## Merge baseline

PR #117 was squash merged with an expected-head guard for:

`2bd3144c00d1fd99be35bd43a5ed661f51beaf3c`

Validated source/test merge SHA:

`8a42e84265b426eb1e7a1d7723cc56637604c750`

Tree:

`ed21649ac72f9bf6de1d9fe40d9b0549830464f1`

Markdown-only tracking descendants after this SHA do not replace this validated source/test baseline.

## Resulting-main validation

Windows CI #452:

- run `35577507700`;
- job `106262581005`;
- exact main source SHA `8a42e84265b426eb1e7a1d7723cc56637604c750`;
- conclusion: **SUCCESS**.

Required gates:

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**.

Artifacts:

- main visual artifact `10629191288`, digest `sha256:beaa8d1da636da62fe54a0a055d60a7f21fc6f45fbc9de243ba30a0d8a78e286`;
- main diagnostic/runtime artifact `10629786016`, digest `sha256:1f69c7413051eb596c63bb62e1e820dc5e7313b442f06945de36ffc3ec8c7215`.

No additional manual Windows interaction was required for this foundation slice because the same-window mode transformation, always-on-top and skip-taskbar primitives were already physically validated in M1; item 1 adds product wiring/reconciliation over those existing native primitives. Later M7 items explicitly require renewed physical/full-screen/position/performance validation where ordered.

## Invariants preserved

- normal architecture remains exactly `main` + reusable `focusSurface`;
- no third persistent webview is created;
- native/Rust remains window mode/geometry/topmost/taskbar authority;
- renderer mode projection does not own timer/session/task/scheduling state;
- timer/session identity survives presentation changes;
- M6 Focus Panel semantics and accessibility contracts remain intact;
- display topology recovery remains native/event-driven;
- no continuous decorative animation/polling is introduced;
- diagnostics remain gated by `?diagnostics=1`.

## Tracking reconciliation and continuation

M7 item 1 is now **VALIDATED / COMPLETE**.

Milestone 7 progress becomes **1/14**.
General roadmap progress remains **6/10 milestones complete**.

The next ordered item is M7 item 2:

`Make it movable, always-on-top, and absent from normal taskbar presentation where appropriate.`

M1 already proved always-on-top and skip-taskbar behavior for the diagnostic Timer mode. Item 2 must reconstruct the current product/native movement and window-chrome contract and implement only the missing product-grade movable/topmost/taskbar behavior without starting collapsed-content item 3, position persistence item 10, full-screen validation item 11 or later work.
