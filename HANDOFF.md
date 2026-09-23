# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 7 in `TODO.md`, relevant `STATUS.md`, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md`. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 7 — Floating Timer mode.**

- Milestones 1–6: COMPLETE / PASS.
- Milestone 7: ACTIVE / **6 of 14** top-level items validated.
- Milestones 8–10: NOT STARTED.
- General roadmap progress: **6/10 milestones complete**.
- M7 items 1–6: COMPLETE / VALIDATED.
- M7 item 7: IMPLEMENTED + AUTOMATED-VALIDATED; PHYSICAL WINDOWS TRANSITION CHECK PENDING.
- Current M7 item-7 transition slice: **4/5 checkpoints complete**.

Repository compact progress source values: `6/10M || 4/5 | 6/14`.

## CURRENT AUTOMATED-VALIDATED SOURCE BASELINE

Source/test SHA:

`c6f28fcfede74c02afff875b6322e4743ed01549`

Source tree:

`06f56b2bb2e16a111900b8c1209460a03b897145`

This is the expected-head guarded squash merge of PR #121. Exact PR head `f53efc250b20149aee920e9831e21173ffd618eb` passed Windows CI #468; resulting-main source passed Windows CI #469. Both runs passed Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads.

Markdown-only tracking descendants do **not** replace this source/test baseline.

Latest immutable item-7 evidence:

`work-log/2026-09-23-chatgpt-m7-focus-surface-transition-automated.md`

## ITEM 7 IMPLEMENTED BEHAVIOR

- Existing `focusSurface` remains the only focus webview.
- During activating Panel/Timer geometry changes, native code hides a previously visible `focusSurface` before staging/reconfiguration and shows it after final geometry is ready.
- Panel presentation preserves the target-monitor DPI staging move-before-resize path while keeping the staging position hidden.
- Panel is moved to its final saved/preferred edge before show/focus/mode publication.
- Failure recovery best-effort restores the previous visible Panel position.
- Renderer mode content uses a keyed one-shot opacity/transform entrance based on the existing finite 150ms motion primitive.
- Reduced motion keeps the existing 1ms/zero-displacement behavior.
- No polling, keyframe loop, high-frequency JS native geometry animation, timer/session/task/scheduling transition change, or third webview was introduced.

## ITEM 7 AUTOMATED EVIDENCE

PR #121 exact validated head:

`f53efc250b20149aee920e9831e21173ffd618eb`

PR Windows CI #468:

- run `35871031356`;
- job `107214857096`;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10754608474`, digest `sha256:6d4df7b273cadbf916b4fdb5e972673f27e8199231c4df694619efe285639b20`;
- runtime artifact `10755089049`, digest `sha256:730c6eaa28ac8c4da5e7714474fccb11a25ec358629a830ecc17874962d0225e`.

Expected-head guarded squash merge:

`c6f28fcfede74c02afff875b6322e4743ed01549`

Resulting-main Windows CI #469:

- run `35878281929`;
- job `107239838245`;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10760500725`, digest `sha256:fb14171a4d5fe3b001c553a21a81068851af9f8e5e22603bb6746ff145b3e040`;
- runtime artifact `10760351396`, digest `sha256:a2a8a43ae013e9897f376d6f85535945cf54673656662def7f27f48e1f9614f0`.

## CHECKPOINT PLAN — 4/5 COMPLETE

1. COMPLETE — reconstructed native Panel/Timer transition ordering, renderer publication, reduced-motion contract and physical flicker evidence.
2. COMPLETE — implemented hidden native staging/final placement plus finite content transition and deterministic contracts.
3. COMPLETE — exact PR head passed authoritative Windows CI #468.
4. COMPLETE — exact-head/diff/discussion/mergeability review passed and expected-head squash merge completed.
5. PENDING PHYSICAL OBSERVATION — resulting-main Windows CI #469 is PASS, but automated CI cannot prove absence of the transient real-desktop left-side flash.

## PHYSICAL WINDOWS VALIDATION REQUIRED

Use the exact resulting-main CI #469 runtime artifact:

- artifact name: `narro-m1-runtime-harness-windows-x64`;
- artifact ID: `10760351396`;
- source SHA: `c6f28fcfede74c02afff875b6322e4743ed01549`;
- digest: `sha256:a2a8a43ae013e9897f376d6f85535945cf54673656662def7f27f48e1f9614f0`.

Test:

1. Run the raw `narro.exe` from the extracted artifact.
2. Put Focus Panel on the right side of the screen.
3. Enter Floating Timer/Compact mode.
4. Return to Focus Panel. Repeat several times.
5. **PASS** only if the Panel does not visibly flash at the left/staging position and appears directly at its correct final right-side position.
6. Confirm Panel <-> Timer switching does not reset/duplicate/switch the active session.
7. Observe that the short content entrance is usable; if practical, also verify reduced-motion mode remains usable.

## NEXT AGENT ACTION

**Do not start M7 item 8 while the item-7 physical blocker is unresolved.**

- On physical PASS: create a new immutable physical-validation work log; mark item 7 `[x]`; advance M7 to **7/14**; reset the next item-8 slice to **0/5**; reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md`; then begin ordered item 8.
- On physical FAIL: record the exact observed symptom and create a narrow evidence-backed fix branch from the current main source. Do not start item 8.

## USER ACTION REQUIRED

Physical Windows Timer -> Panel transition observation using the exact resulting-main CI #469 artifact.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains personal, local-only Windows 10/11 x64 software.
- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust remains monitor/work-area/DPI/physical-position authority.
- Timer-mode topmost/taskbar state remains native authority.
- renderer presentation cannot become timer/session/task/scheduling authority.
- Focus Panel <-> Floating Timer presentation changes cannot reset, duplicate, start, stop or switch a session.
- item-2 drag/topmost/taskbar behavior remains intact.
- items 4–6 expanded actions/subtasks/tooltips remain intact.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard activation only.
- no continuous decorative animation/polling or high-frequency JS native-window geometry loop is introduced.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## BLOCKERS / NOT RUN

- **Physical Windows flash-removal observation: NOT RUN / BLOCKING item 7 completion.**
- No user/product decision blocks the implementation.
- Local Rust/Tauri validation remains unavailable in connector-only execution; authoritative Windows CI supplies the automated native gate.
