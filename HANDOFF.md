# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 7 in `TODO.md`, relevant `STATUS.md`, the Floating Timer sections of the product/UI/evidence docs, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md`. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 7 — Floating Timer mode.**

- Milestones 1–6: COMPLETE / PASS.
- Milestone 7: ACTIVE / **1 of 14** top-level items validated.
- Milestones 8–10: NOT STARTED.
- General roadmap progress: **6/10 milestones complete**.
- M7 item 1 closed at **5/5 checkpoints complete**.
- Current M7 item-2 implementation slice: **0/5 checkpoints complete**.

Repository compact progress source values: `6/10M || 0/5 | 1/14`.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`8a42e84265b426eb1e7a1d7723cc56637604c750`

Source tree:

`ed21649ac72f9bf6de1d9fe40d9b0549830464f1`

This is the expected-head guarded squash merge of PR #117 after authoritative resulting-main Windows CI #452 passed on the exact merged source SHA. Markdown-only tracking descendants after this SHA do **not** replace the validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-21-1120-chatgpt-m7-floating-compact-mode.md`

## LATEST VALIDATION EVIDENCE — M7 ITEM 1

PR #117 — `M7: add Floating Timer compact-mode foundation`

Final exact PR head:

`2bd3144c00d1fd99be35bd43a5ed661f51beaf3c`

Authoritative PR Windows CI #451:

- run `35533171618`;
- job `106137420110`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10612486287`, digest `sha256:413902b9a659246e818a7275a2d9cda852f69f125e8442f11afd00a8df3f2377`;
- diagnostic/runtime artifact `10611533572`, digest `sha256:1f33793cc15b5983d851f7f5927ff655fc8d84d88f13ca284d1e13ea384b41e4`.

CI history before the final gate:

- Windows CI #447 failed only because legacy M6 `scripts/test-ui-focus-panel.mjs` required direct `<FocusPanel />` rendering; commit `d861ffa5ef6d21b180548c7821864786914851f8` updated only that stale deterministic assertion;
- Windows CI #449 failed only because the new compact-mode contract used an LF-only literal against CRLF Windows checkout; commit `e8b4961f98b6c0c8c5c3e4ed84fc81eb928a197b` made that assertion whitespace/line-ending safe;
- production source was unchanged by both corrections.

Final review verified the exact head unchanged and mergeable, `main` still exactly at base `42e2cd905e9dda58b6d40eecccd8bbe735377f55`, exactly eleven expected changed files, and no conversation comments, submitted reviews or inline review comments.

Expected-head guarded squash merge:

`8a42e84265b426eb1e7a1d7723cc56637604c750`

Authoritative resulting-main Windows CI #452:

- run `35577507700`;
- job `106262581005`;
- exact main source SHA `8a42e84265b426eb1e7a1d7723cc56637604c750`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10629191288`, digest `sha256:beaa8d1da636da62fe54a0a055d60a7f21fc6f45fbc9de243ba30a0d8a78e286`;
- diagnostic/runtime artifact `10629786016`, digest `sha256:1f69c7413051eb596c63bb62e1e820dc5e7313b442f06945de36ffc3ec8c7215`.

Validated item-1 capability:

- normal product `focusSurface` now projects native Panel/Timer presentation mode instead of always rendering Panel;
- Compact switches the existing `focusSurface` through the M1-validated native Timer mode rather than creating another webview;
- native mode snapshot reconciles renderer reload;
- compact -> Panel uses preference-aware `present_focus_panel`;
- mode publication happens only after native transition success;
- the item-1 compact shell remains intentionally minimal and does not absorb later title/timer/subtask/action-strip work;
- timer/session/task/scheduling state remains authoritative outside renderer presentation.

## ACTIVE IMPLEMENTATION SLICE

**M7 item 2/14 — Make the Floating Timer movable, always-on-top, and absent from normal taskbar presentation where appropriate.**

No item-2 implementation branch or PR is established yet.

### Checkpoint plan — 0/5 complete

1. Reconstruct the exact product-grade movability/topmost/taskbar contract from M1 physical evidence, current Tauri window configuration, item-1 compact shell, product/UI specs and Windows-native constraints. Identify what is already validated versus actually missing.
2. Implement only the missing narrow item-2 behavior with deterministic/native/UI coverage and semantic review. Do not absorb safe-position persistence, full-screen validation, collapsed visual content or shortcuts.
3. Validate the exact PR head with authoritative Windows CI: Repository Preflight, relevant Windows visual/native regression, Tauri Release and both required artifact uploads.
4. Verify exact head unchanged, expected changed-file scope, clean PR comments/reviews/threads and mergeability; squash merge with an expected-head guard.
5. Validate the resulting-main source SHA with authoritative Windows CI, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable M7 item-2 work log.

### M7 item-2 starting boundary

- M1 already physically proved the Timer mode can be always-on-top and skipped from the normal taskbar;
- item 1 reuses those native properties in the product compact transition;
- item 2 must therefore avoid reimplementing already validated topmost/taskbar primitives and focus on any missing product-grade **movability** / window-chrome interaction;
- native/Rust remains window geometry authority; renderer may request an OS-native drag operation only if required, but must not implement JS pointer-loop geometry;
- safe last-position persistence/recovery belongs to item 10 and must not be pulled forward;
- borderless-full-screen always-on-top validation belongs to item 11;
- collapsed title/timer/subtask/add/expand content belongs to item 3;
- no continuous polling or decorative animation belongs in this item.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains personal, local-only Windows 10/11 x64 software.
- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and off-screen recovery semantics remain intact.
- timer/session/task/scheduling state remains authoritative outside renderer presentation.
- Focus Panel <-> Floating Timer transformation cannot reset, duplicate, start, stop or switch a session.
- future-timed Today tasks remain ineligible until due.
- M6 Focus Panel accessibility/geometry/visual-state/empty-state invariants remain intact.
- item-1 native mode reconciliation and same-window Compact/Panel switching remain intact.
- Notes URLs remain explicit pointer/keyboard activation only.
- reduced-motion remains usable and no continuous decorative animation/polling is introduced.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Reconstruct item 2 from repository evidence before editing source. Inspect current `focusSurface` Tauri config/window decorations and resizability, native Timer-mode properties, any existing `start_dragging`/window-drag path, the item-1 compact shell, M1 physical observations and Floating Timer screenshot/spec evidence. Determine whether the missing product behavior is only a native drag affordance or includes a narrow window property correction. Then create one item-2 branch from the latest `main` tracking tip.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M7 item 2.
- Full local repository/frontend/Rust/Tauri preflight is unavailable in this connector-only environment; record unavailable checks as **NOT RUN** and use authoritative Windows CI for the complete gate.
