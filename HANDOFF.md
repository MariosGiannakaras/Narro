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

## PHYSICAL WINDOWS VALIDATION RESULT — FAIL

Exact resulting-main CI #469 build was physically tested on Windows.

Observed:
- Flicker: **FAIL** — the transition still does not satisfy the no-visible-flash acceptance criterion.
- Position: **PASS** — Focus Panel consistently returns to the configured right side; moving Floating Timer left does not change the Panel's preferred right-side return position.
- Session: **PASS** — after Resume and repeated Panel/Timer switching, the timer continued rather than resetting/duplicating/switching the live session.
- Transition: **FAIL / UX NOT ACCEPTED** — the current visual transition still looks incomplete.
- Additional screenshot evidence: horizontal overflow/scrollbars are visible in Focus/Timer surfaces, and expansion exposes a visually intermediate enlarged compact state before the fully expanded Floating Timer content settles.

Blitzit parity note:
- repository evidence establishes Panel -> Floating Timer mode switching and a separate collapsed <-> expanded control;
- there is no evidence for a required third intermediate presentation step.

The current item-7 implementation therefore remains **4/5**, and item 8 must not start.

## ACTIVE CORRECTIVE PR

PR #122 — `M7: fix physical Focus transition artifacts`

Branch:

`m7-transition-physical-fix`

Current exact head:

`b5d65917ea75f50ab351b20fe750c56366923ae6`

Expected changed-file scope: seven files — three product/native/CSS transition files plus four deterministic contract files.

CI history:

- Windows CI #470 / run `35884992614` on previous head `3f66457a0f7164ecbb0d16601a2ee8408394ee92`: **FAILED** in Repository Preflight only because the older collapsed deterministic contract still prohibited any `requestAnimationFrame`. Product/native code did not fail; visuals/release were skipped.
- The contract was narrowed to permit exactly one finite `nextPaint()` paint-boundary rAF while continuing to prohibit renderer clock/loop ownership.
- Windows CI #471 / run `35885188470` on exact current head `b5d65917ea75f50ab351b20fe750c56366923ae6`: **IN PROGRESS** at Repository Preflight when this handoff was written.

Do not merge until #471 (or a newer exact-head run if the branch moves) passes Repository Preflight, Windows visual regression, Tauri Release and both artifact uploads. After PASS, perform final exact-head/diff/discussion/mergeability review and guarded squash merge, then resulting-main CI and physical Windows re-test.

## CORRECTIVE SLICE

Create a narrow branch from the latest tracking main. Fix only evidence-backed transition/overflow issues:
1. eliminate residual left/staging flash by making any unavoidable DPI staging occur at the target Panel edge rather than work-area origin, while retaining native geometry authority;
2. prevent focus-surface horizontal overflow without removing required vertical Panel scrolling;
3. remove the visible expanded-window-before-expanded-content intermediate state by coordinating native resize and renderer publication without renderer-owned geometry loops.

After implementation: exact-head Windows CI, guarded merge, resulting-main CI, then repeat physical Windows validation.

## PREVIOUS PHYSICAL WINDOWS VALIDATION INSTRUCTIONS

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

**Do not start M7 item 8 while the item-7 physical FAIL is unresolved.**

- On physical PASS: create a new immutable physical-validation work log; mark item 7 `[x]`; advance M7 to **7/14**; reset the next item-8 slice to **0/5**; reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md`; then begin ordered item 8.
- Physical FAIL has now been recorded. Resume the narrow corrective slice described above; do not start item 8.

## USER ACTION REQUIRED

None until the corrective candidate has passed automated validation; then repeat the physical transition check.

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

- **Physical Windows flash-removal observation: FAIL / BLOCKING item 7 completion.**
- **Corrective PR #122 exact-head Windows CI #471: IN PROGRESS / BLOCKING merge.**
- No user/product decision blocks the implementation.
- Local Rust/Tauri validation remains unavailable in connector-only execution; authoritative Windows CI supplies the automated native gate.
