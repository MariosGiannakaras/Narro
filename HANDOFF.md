# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 7 in `TODO.md`, relevant `STATUS.md`, the Floating Timer sections of the product/UI/evidence docs, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md`. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 7 — Floating Timer mode.**

- Milestones 1–6: COMPLETE / PASS.
- Milestone 7: ACTIVE / **2 of 14** top-level items validated.
- Milestones 8–10: NOT STARTED.
- General roadmap progress: **6/10 milestones complete**.
- M7 item 1: COMPLETE / VALIDATED.
- M7 item 2: COMPLETE / AUTOMATED + PHYSICAL WINDOWS VALIDATED.
- Current M7 item-3 slice: **0/5 checkpoints complete**.

Repository compact progress source values: `6/10M || 0/5 | 2/14`.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`

Source tree:

`adf0342eba2944bca5e986d80f977bb06864682a`

This is the expected-head guarded squash merge of PR #118. PR Windows CI #453 and resulting-main Windows CI #454 passed on the exact source. The exact CI #454 runtime build was then physically validated on Windows on 2026-09-23.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

Latest immutable validation evidence:

`work-log/2026-09-23-0153-chatgpt-m7-floating-movability-physical-pass.md`

## M7 ITEM 2 FINAL PHYSICAL EVIDENCE

Exact source/build under test:

- source SHA `f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`;
- Windows CI #454 / run `35593002396`;
- diagnostic/runtime artifact `10636128018`, digest `sha256:8d2113cfd00bc73a84d96294380f43f33fef460ddc86e8d880b3f986ae124cb5`.

User-observed Windows results:

- Drag: **PASS** — Floating Timer moved and remained at the released position.
- Return button: **PASS** — Return to Focus Panel restored the Panel at its original right-side position.
- Always on top: **PASS**.
- Taskbar: **PASS** — no normal Floating Timer taskbar button.

Observed but non-blocking transition artifact:

- Timer -> Panel produces a very brief flash/flicker of the Panel on the left side before it settles back at the correct original right-side Panel position.
- Final position correctness is intact.
- This is recorded for M7 item 7 (Focus Panel <-> Floating Timer transition), not treated as an item-2 failure.

## ACTIVE IMPLEMENTATION SLICE

**M7 item 3/14 — Implement collapsed state matching the supplied compact screenshot: title, live timer, subtask progress, add, expand.**

### Checkpoint plan — 0/5 complete

1. Reconstruct the exact collapsed hierarchy, dimensions, authoritative data/mutation sources, screenshot evidence, and item-3 scope boundaries from repository evidence.
2. Implement only collapsed title/live timer/subtask progress/add/expand behavior with deterministic UI contracts and Windows visual fixtures where appropriate.
3. Validate the exact PR head with authoritative Windows CI: Repository Preflight, relevant visual regression, Tauri Release and both required artifact uploads.
4. Verify exact head unchanged, expected changed-file scope, clean PR comments/reviews/threads and mergeability; squash merge with expected-head guard.
5. Validate the resulting-main source SHA with authoritative Windows CI, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable item-3 work log.

## ITEM-3 BOUNDARIES

- The existing `focusSurface` remains the only focus webview and native Timer mode remains window authority.
- Reuse M6 authoritative task/timer/subtask reads and existing safe mutations; do not create renderer-owned timer/session state.
- Item 3 owns only the collapsed hierarchy: task title, live timer, subtask progress, add affordance and expand affordance.
- Expanded action strip is item 4.
- Expanded subtask rows/reorder/delete is item 5.
- Stable tooltip/hit-target work is item 6.
- Transition animation and the recorded Timer -> Panel left-side flash are item 7.
- Position persistence/recovery is item 10.
- Borderless-full-screen topmost validation is item 11.
- No continuous polling/decorative animation or JS native-window geometry loop.

## NEXT AGENT ACTION

Reconstruct item 3 from `Screenshot_19.png`, `docs/RESEARCH_EVIDENCE.md`, `docs/UI_UX_SPEC.md`, `docs/PRODUCT_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, the current `FloatingTimerFoundation`, and the already-validated M6 Focus live timer/subtask/add implementations. Determine the narrowest reuse path, then create one coherent item-3 branch from the latest main tracking tip.

## USER ACTION REQUIRED

**None.**

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains personal, local-only Windows 10/11 x64 software.
- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust remains monitor/work-area/DPI/physical-position authority.
- Timer-mode topmost/taskbar state remains native authority.
- renderer presentation cannot become timer/session/task/scheduling authority.
- Focus Panel <-> Floating Timer presentation changes cannot reset, duplicate, start, stop or switch a session.
- future-timed Today tasks remain ineligible until due.
- M6 Focus Panel accessibility/geometry/visual-state/empty-state invariants remain intact.
- item-2 native drag capability remains scoped only to `focusSurface` and interactive controls remain non-drag regions.
- Notes URLs remain explicit pointer/keyboard activation only.
- reduced-motion remains usable and no continuous decorative animation/polling is introduced.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## BLOCKERS / NOT RUN

- No user/product decision blocks M7 item 3.
- Full local repository/frontend/Rust/Tauri preflight is unavailable in this connector-only environment; authoritative Windows CI remains the complete automated gate.
