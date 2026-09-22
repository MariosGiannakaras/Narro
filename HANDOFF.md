# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 7 in `TODO.md`, relevant `STATUS.md`, the Floating Timer sections of the product/UI/evidence docs, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md`. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 7 — Floating Timer mode.**

- Milestones 1–6: COMPLETE / PASS.
- Milestone 7: ACTIVE / **1 of 14** top-level items validated.
- Milestones 8–10: NOT STARTED.
- General roadmap progress: **6/10 milestones complete**.
- M7 item 1: **COMPLETE / VALIDATED**.
- Current M7 item-2 slice: **4/5 checkpoints complete**; implementation and automated validation are complete, physical Windows drag validation is pending.

Repository compact progress source values: `6/10M || 4/5 | 1/14`.

## CURRENT AUTOMATED-VALIDATED SOURCE BASELINE

Source/test SHA:

`f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`

Source tree:

`adf0342eba2944bca5e986d80f977bb06864682a`

This is the expected-head guarded squash merge of PR #118 after authoritative resulting-main Windows CI #454 passed on the exact merged source SHA. Markdown-only tracking descendants after this SHA do **not** replace the source/test baseline.

Latest immutable item-2 evidence:

`work-log/2026-09-22-1545-chatgpt-m7-floating-movability.md`

## M7 ITEM 2 IMPLEMENTATION / CI EVIDENCE

PR #118 — `M7: make Floating Timer movable`

Final exact PR head:

`2ca6b59958e368c27024b06a652c9eb56ca30b44`

Authoritative PR Windows CI #453:

- run `35591332492`;
- job `106306156731`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10634403550`, digest `sha256:f2850ed4be8e9c588004657d03a74c20a30d218fe128a01e8cad17beff313215`;
- diagnostic/runtime artifact `10635435409`, digest `sha256:1b51f68a27180dbfdd93d0840612c477abbd0ecaa4ba38a34379262032084066`.

Final review verified exact head unchanged, exactly five expected changed files, no conversation comments, submitted reviews or inline review threads, and mergeability.

Expected-head guarded squash merge:

`f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`

Authoritative resulting-main Windows CI #454:

- run `35593002396`;
- job `106311386561`;
- exact main source SHA `f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10635408100`, digest `sha256:1b4a398bc4f4b9b82efb23876c25f803eafd391ad14c99d14d8e2dd6a6da6b0c`;
- diagnostic/runtime artifact `10636128018`, digest `sha256:8d2113cfd00bc73a84d96294380f43f33fef460ddc86e8d880b3f986ae124cb5`.

Implemented behavior:

- product compact surface uses Tauri-native `data-tauri-drag-region` on non-interactive content;
- return-to-Panel remains outside the drag region and clickable;
- drag capability is scoped only to `focusSurface`;
- existing native Timer-mode always-on-top and skip-taskbar properties are retained;
- renderer does not own geometry and no JS drag/mousemove loop was introduced;
- later safe-position/full-screen/collapsed-content items were not absorbed.

## ACTIVE IMPLEMENTATION SLICE

**M7 item 2/14 — Make the Floating Timer movable, always-on-top, and absent from normal taskbar presentation where appropriate.**

### Checkpoint status — 4/5 complete

1. **COMPLETE** — reconstructed item-2 contract; topmost/taskbar primitives were already M1-validated and the missing behavior was native movability.
2. **COMPLETE** — implemented scoped native drag affordance plus deterministic contract coverage.
3. **COMPLETE** — exact PR head passed authoritative Windows CI #453.
4. **COMPLETE** — exact-head final review passed and PR #118 was expected-head guarded squash merged.
5. **PENDING PHYSICAL OBSERVATION** — resulting-main Windows CI #454 passed, but actual drag interaction on a real Windows desktop is **NOT RUN**. After physical PASS, mark item 2 `[x]`, advance M7 to 2/14, reset the next item-3 slice to 0/5, and reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` plus a new immutable validation log.

## USER ACTION REQUIRED

Use the exact Windows CI #454 artifact:

- artifact name: `narro-m1-runtime-harness-windows-x64`;
- artifact ID: `10636128018`;
- source SHA: `f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`.

On a real Windows 10/11 desktop:

1. Download/extract the artifact and run the included raw `narro.exe`.
2. Ensure an eligible Today task exists, enter Blitz/Focus mode, then use **Compact view** to show the product Floating Timer.
3. Drag the Floating Timer from its label/background/non-button area and release it somewhere visibly different.
4. Confirm **PASS/FAIL**: the same Floating Timer window follows the pointer and remains usable after release.
5. Confirm **PASS/FAIL**: the **Return to Focus Panel** button is still clickable and does not start a drag.
6. If practical, briefly confirm the Timer still stays above a normal app and has no normal taskbar button.

Only the drag observation is the new blocking evidence; M1 already physically validated the native Timer topmost/taskbar primitives.

## NEXT AGENT ACTION

Do not start M7 item 3 while the USER ACTION REQUIRED blocker above is unresolved.

When the user reports the physical result:

- on **PASS**, record the observation in a new immutable work log, mark M7 item 2 complete, advance milestone progress to 2/14, reset item-3 slice progress to 0/5, and begin item 3;
- on **FAIL**, record the exact symptom and fix only the evidence-backed drag problem on a new coherent branch from current main.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains personal, local-only Windows 10/11 x64 software.
- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust remains monitor/work-area/DPI/physical-position authority.
- Timer-mode topmost/taskbar state remains native authority.
- renderer presentation cannot become timer/session/task/scheduling authority.
- Focus Panel <-> Floating Timer presentation changes cannot reset, duplicate, start, stop or switch a session.
- future-timed Today tasks remain ineligible until due.
- M6 Focus Panel accessibility/geometry/visual-state/empty-state invariants remain intact.
- Notes URLs remain explicit pointer/keyboard activation only.
- reduced-motion remains usable and no continuous decorative animation/polling is introduced.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## BLOCKERS / NOT RUN

- Physical product Floating Timer drag validation on real Windows: **NOT RUN / BLOCKING ITEM-2 COMPLETION**.
- No additional product decision is required.
- Full local repository/frontend/Rust/Tauri preflight is unavailable in this connector-only environment; authoritative Windows CI #453/#454 provides the automated gate.
