# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 7 in `TODO.md`, relevant `STATUS.md`, the Floating Timer sections of the product/UI/evidence docs, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md`. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 7 — Floating Timer mode.**

- Milestones 1–6: COMPLETE / PASS.
- Milestone 7: ACTIVE / **3 of 14** top-level items validated.
- Milestones 8–10: NOT STARTED.
- General roadmap progress: **6/10 milestones complete**.
- M7 item 1: COMPLETE / VALIDATED.
- M7 item 2: COMPLETE / AUTOMATED + PHYSICAL WINDOWS VALIDATED.
- M7 item 3: COMPLETE / AUTOMATED-VALIDATED.
- Current M7 items 4–6 expanded-interactions slice: **0/5 checkpoints complete**.

Repository compact progress source values: `6/10M || 0/5 | 3/14`.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`14db934e998b2bb619f04bf7e7a1b0fe7b5553fe`

Source tree:

`b17136a7b622fcdbf0346e589092613806627e46`

This is the expected-head guarded squash merge of PR #119. PR Windows CI #458 and resulting-main Windows CI #459 passed Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads on the exact source. Local frontend preflight also passed on the resulting-main source.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

Latest immutable validation evidence:

`work-log/2026-09-23-1421-codex-m7-floating-collapsed.md`

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

**M7 items 4–6/14 — Expanded Floating Timer interactions: action strip, subtask management, stable tooltips/hit targets.**

### Checkpoint plan — 0/5 complete

1. Reconstruct the exact expanded action/subtask hierarchy, existing authoritative Focus action/subtask mutation paths, screenshot evidence and items 4–6 scope boundaries.
2. Implement expanded/collapsed presentation, action strip, subtask add/complete/reorder/delete, and stable tooltip/hit-target behavior with deterministic contracts and Windows visual fixtures.
3. Validate the exact PR head with authoritative Windows CI: Repository Preflight, relevant visual regression, Tauri Release and both required artifact uploads.
4. Verify exact head unchanged, expected changed-file scope, clean PR comments/reviews/threads and mergeability; squash merge with expected-head guard.
5. Validate the resulting-main source SHA with authoritative Windows CI, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable items 4–6 work log.

## ITEMS 4–6 BOUNDARIES

- The existing `focusSurface` remains the only focus webview and native Timer mode remains window authority.
- Reuse M6 authoritative task/timer/subtask reads and existing safe mutations; do not create renderer-owned timer/session state.
- Reuse the existing `FocusLiveActions` authoritative action path and list-board subtask mutation APIs; do not duplicate timer/session/task authority.
- Expansion/collapse is local presentation state only and must not reset, duplicate, start, stop or switch the active session.
- The action strip owns Break, Notes, Pause/Resume, Skip, Done and Return to Panel only.
- Expanded subtasks own add, completion, reorder and delete against the same stable subtask identities used by Main/Focus.
- Icon-only controls require stable >=32 px hit boxes, accessible names and tooltips without width reflow.
- Transition animation and the recorded Timer -> Panel left-side flash are item 7.
- Position persistence/recovery is item 10.
- Borderless-full-screen topmost validation is item 11.
- No continuous polling/decorative animation or JS native-window geometry loop.

## NEXT AGENT ACTION

Reconstruct items 4–6 from `Screenshot_17.png`, `docs/RESEARCH_EVIDENCE.md`, `docs/UI_UX_SPEC.md`, `docs/PRODUCT_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, the current `FloatingTimerFoundation`, `FocusLiveActions`, `TaskSubtasks`, and the validated M6 Focus mutations. Determine the narrowest reuse path, then create one coherent expanded-interactions branch from the latest main tracking tip.

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

- No user/product decision blocks M7 items 4–6.
- Local frontend preflight is available and passed for item 3. Local Rust fmt/check/Clippy/tests/Tauri release remain unavailable because this environment has no Rust toolchain; authoritative Windows CI remains the complete native automated gate.
