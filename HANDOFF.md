# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 7 in `TODO.md`, relevant `STATUS.md`, the Floating Timer sections of the product/UI/evidence docs, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md`. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 7 — Floating Timer mode.**

- Milestones 1–6: COMPLETE / PASS.
- Milestone 7: ACTIVE / **0 of 14** top-level items validated.
- Milestones 8–10: NOT STARTED.
- General roadmap progress: **6/10 milestones complete**.
- M6 item 16 closed at **5/5 checkpoints complete**.
- Current M7 item-1 implementation slice: **2/5 checkpoints complete**.

Repository compact progress source values: `6/10M || 2/5 | 0/14`.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`ab5818fa92970655b63323839111a1977a5837a7`

Source tree:

`60a01fa240b8ff903d99d7da87c597587ff816b8`

This is the expected-head guarded squash merge of PR #116 after authoritative resulting-main Windows CI #446 passed on the exact merged source SHA. Markdown-only tracking descendants after this SHA do **not** replace the validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-20-2229-chatgpt-m6-focus-empty-states.md`

## LATEST VALIDATION EVIDENCE — M6 ITEM 16 / GATE F

PR #116 — `M6: handle Focus empty states`

Final exact PR head:

`f0e02570308d86416861c53e1d296e5edb309ef8`

Authoritative PR Windows CI #445:

- run `35366848885`;
- job `105671693894`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10557321916`, digest `sha256:829ca1d136cd2c48947f8f401295de81729486f7924cc6a49cb2d2d32b04baf3`;
- diagnostic/runtime artifact `10556649008`, digest `sha256:13859a5d3b70377a3c1898e9cddaba062aaa941786a81c85ca8ed6080da78c50`.

Evidence-backed CI history:

- Windows CI #443 / run `35366559621` / job `105670327157` failed only on a stale item-15 fixture-source assertion;
- correction `096f6fe0fa8f052ae125f1711f2370aadeb5aa57` changed only deterministic test expectations for the new empty scenario;
- intermediate CI #444 was superseded/cancelled and was not used as a merge gate;
- final exact-head CI #445 passed all gates.

Final review verified the exact head unchanged and mergeable, `main` still exactly at base `50557554d326ec49ba21da46f80139cb7be009d2`, exactly nine expected changed files, and no conversation comments, submitted reviews or inline review comments.

Expected-head guarded squash merge:

`ab5818fa92970655b63323839111a1977a5837a7`

Authoritative resulting-main Windows CI #446:

- run `35527458034`;
- job `106122008480`;
- exact main source SHA `ab5818fa92970655b63323839111a1977a5837a7`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10610393632`, digest `sha256:bae649a3d22b004b2732a7499a4a280fef287e819695c27cde821653c3d7e402`;
- diagnostic/runtime artifact `10609968144`, digest `sha256:79b448f6c1f3d6f6515ed440808b8c7e42904d2790cb6001e41fb1f3ed66ab4f`.

Validated M6 item-16 capability:

- generic idle, no-eligible-yet and genuinely empty Today presentations are distinct;
- future-timed Today work remains visible in Scheduled but ineligible until due;
- genuinely empty Today uses the screenshot-backed `All Clear` state;
- empty/no-eligible states do not fabricate live timer/actions or own timer/session/scheduling authority;
- all prior M6 item 1–15 invariants remain intact.

Milestone 6 is **16/16 validated / Gate F PASS**.

## ACTIVE IMPLEMENTATION SLICE

**M7 item 1/14 — Implement compact mode by transforming the existing `focusSurface` window; do not create a third persistent webview.**

Implementation branch:

`m7-floating-compact-mode`

Branch base / latest `main` tracking tip when the slice started:

`42e2cd905e9dda58b6d40eecccd8bbe735377f55`

Latest source/test implementation head before this handoff-only checkpoint:

`720d6cce37004d77171de8e3fa1650fb70abc96d`

No M7 item-1 PR is established yet.

### Checkpoint 1/5 — COMPLETE: compact-mode transformation contract reconstructed

Repository/M1/M6/product/UI evidence establishes:

- the product must reuse the single existing `focusSurface` webview; no third persistent webview is allowed;
- M1 already physically validated Panel -> Timer -> Panel reuse, Timer always-on-top and skip-taskbar behavior;
- Rust/native already owns mode-dependent size/restyle through `configure_focus_surface_mode` and keeps presentation mode in `FOCUS_SURFACE_MODE_STATE`;
- normal product `focus.tsx` previously ignored that mode and always rendered `FocusPanel`; the M6 Compact control was intentionally inactive;
- M7 item 1 therefore owns product mode projection/wiring, not a new timer engine or new native window primitive;
- mode transitions are presentation-only and must not start/pause/resume/switch/complete the authoritative session;
- renderer reload must reconcile the existing Rust presentation mode rather than blindly assuming Panel;
- compact -> Panel return must use the production preference-aware `present_focus_panel` path so selected monitor/side placement is restored;
- item 1 does **not** absorb later M7 collapsed screenshot content, expanded actions/subtasks, shortcut behavior, safe floating position persistence, transition animation or final performance remeasurement.

### Checkpoint 2/5 — COMPLETE: narrow foundation implementation + deterministic coverage + semantic review

Native/product implementation:

- `src-tauri/src/lib.rs`
  - exposes read-only `focus_surface_mode_snapshot`;
  - adds production `present_floating_timer`, which resolves the existing `FOCUS_SURFACE_LABEL` and reuses `configure_focus_surface_mode(...Timer)`;
  - retains the M1-validated Timer foundation geometry/properties `300x100 / always-on-top / skip-taskbar` until later visual sizing work;
  - makes the legacy diagnostic Timer command delegate to the production same-window transition;
  - registers the new read/presentation commands;
- `src/focusSurfaceModeApi.ts` provides typed renderer wrappers for native mode snapshot, compact presentation and preference-aware Panel return;
- `src/focus.tsx` adds a product `FocusSurfaceProduct` root that:
  - reconciles native presentation mode on mount;
  - changes renderer mode only after the native transition succeeds;
  - keeps failures visible without changing timer/session state;
  - preserves `?diagnostics=1` as the explicit M1 diagnostic path;
- `src/FocusPanel.tsx` activates the Compact control only when the product callback is present and disables it during a pending transition; deterministic Focus fixtures without the callback remain inert;
- `src/FloatingTimerFoundation.tsx` + `src/floatingTimerFoundation.css` provide only the minimal compact product shell and accessible return-to-Panel control required to make the transformation reversible. They intentionally contain no live timer/title/subtask/action-strip implementation from later M7 items.

Coverage:

- new `scripts/test-ui-floating-compact-mode.mjs` locks:
  - reuse of `FOCUS_SURFACE_LABEL`;
  - absence of `WebviewWindowBuilder` in the production compact transition;
  - existing compact always-on-top/skip-taskbar native foundation;
  - mode snapshot/reconciliation;
  - native-success-before-renderer-mode publication;
  - active Compact callback semantics;
  - accessible reversible return path;
  - prohibition on timer/session mutations and later M7 content leakage;
  - no decorative animation/overlay behavior in item 1;
  - frontend preflight registration;
- `scripts/test-ui-focus-panel.mjs` and `scripts/test-ui-focus-icon-tooltips.mjs` are evolved only so Compact becomes the ordered M7 active control while Preferences remains the sole icon-only placeholder;
- `package.json` registers the new deterministic contract in frontend preflight.

Semantic diff against the slice base is exactly ten files. No SQLite/schema, task/domain, timer/session transition, scheduling classification, persistence, monitor-selection, display-topology recovery or dependency/lockfile behavior changed.

Local validation:

- attempted local branch clone + targeted deterministic tests/frontend build;
- **NOT RUN** because the execution environment failed before checkout with `Could not resolve host: github.com`;
- do not treat any local test/build as PASS.

### Checkpoint 3/5 — PENDING

Create the M7 item-1 PR from `m7-floating-compact-mode`, then validate its exact head with authoritative Windows CI: Repository Preflight, relevant Windows visual/native regression, Tauri Release and both required artifact uploads.

### Checkpoint 4/5 — PENDING

After exact-head CI success, verify the head unchanged, expected changed-file scope, clean PR comments/reviews/threads and mergeability; then squash merge with an expected-head guard.

### Checkpoint 5/5 — PENDING

Validate the resulting-main source SHA with authoritative Windows CI, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable M7 item-1 work log.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains personal, local-only Windows 10/11 x64 software.
- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and off-screen recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative.
- renderer presentation cannot become timer/session/task/scheduling authority.
- future-timed Today tasks remain ineligible until due.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- M6 item-11 live-title motion, item-12 row-title access, item-13 reserved action geometry, item-14 tooltips/accessibility, item-15 visual states and item-16 empty-state semantics remain intact.
- Notes URLs remain explicit pointer/keyboard activation only.
- reduced-motion remains usable and timer numerals retain fixed/tabular geometry.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Create the M7 item-1 PR from `m7-floating-compact-mode` and validate its exact latest head with authoritative Windows CI. If CI fails, inspect the exact failing step/log and fix only evidence-backed problems on the same branch. Do not start M7 item 2 in parallel.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M7 item 1.
- Full local repository/frontend/Rust/Tauri preflight is unavailable in this connector-only environment; record unavailable checks as **NOT RUN** and use authoritative Windows CI for the complete gate.
