# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 7 in `TODO.md`, relevant `STATUS.md`, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md`. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 7 — Floating Timer mode.**

- Milestones 1–6: COMPLETE / PASS.
- Milestone 7: ACTIVE / **6 of 14** top-level items validated.
- Milestones 8–10: NOT STARTED.
- General roadmap progress: **6/10 milestones complete**.
- M7 items 1–6: COMPLETE / VALIDATED.
- M7 item 7: CORRECTIVE SOURCE AUTOMATED-VALIDATED; PHYSICAL WINDOWS RE-TEST PENDING.
- Current item-7 slice: **4/5 checkpoints complete**.

Repository compact progress values: `6/10M || 4/5 | 6/14`.

## CURRENT AUTOMATED-VALIDATED SOURCE BASELINE

Source/test SHA:

`91a28ba7c5389130b6edb45deabe62a9e01f9d08`

Source tree:

`e4ecb48ab3ca84915d4d7972e83f7bfd5ed5ad78`

This is the expected-head guarded squash merge of PR #122 from exact validated PR head `b5d65917ea75f50ab351b20fe750c56366923ae6`.

Markdown-only tracking descendants do **not** replace this source/test baseline.

Latest immutable evidence:

`work-log/2026-09-23-chatgpt-m7-focus-surface-transition-corrective-automated.md`

## PHYSICAL FAILURE THAT TRIGGERED THE CORRECTION

Exact prior main CI #469 build physically produced:

- Flicker: FAIL;
- final configured right-side Panel position: PASS;
- active session/timer continuity: PASS;
- transition UX: FAIL;
- horizontal focus-surface scrollbars in screenshots;
- visible enlarged compact/intermediate presentation during Floating Timer expansion.

Repository Blitzit evidence establishes Panel -> Floating Timer plus a separate collapsed <-> expanded control; it does not establish a required third intermediate presentation state.

## CORRECTIVE BEHAVIOR NOW AUTOMATED-VALIDATED

- native Panel DPI staging uses the configured target edge rather than raw work-area origin;
- final Panel edge remains recalculated after native Panel resize using physical outer geometry;
- focus-surface transition clips horizontal overflow; Timer transition is isolated from document scrolling;
- Floating Timer resize uses finite paint-boundary presentation gating: suppress current hierarchy, resize natively, publish final hierarchy, reveal;
- exactly one finite `requestAnimationFrame` helper is permitted for paint-boundary gating; no renderer clock/loop or native-position ownership was introduced;
- native/Rust remains geometry/DPI authority;
- same reusable `focusSurface` remains the only focus webview;
- timer/session/task/scheduling transitions are unchanged.

## CORRECTIVE CI EVIDENCE

PR #122 exact validated head:

`b5d65917ea75f50ab351b20fe750c56366923ae6`

PR Windows CI #471:

- run `35885188470`;
- job `107263411613`;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10761689991`, digest `sha256:442ad79b52565c9481379987b66dc81a996a794ffd40dfed95bf380283fa8b2c`;
- runtime artifact `10763131609`, digest `sha256:6a06cc70202189f620ee30ada78afa4769ba04befa3509e7e8e0da657535af84`.

Expected-head guarded squash merge:

`91a28ba7c5389130b6edb45deabe62a9e01f9d08`

Resulting-main Windows CI #472:

- run `35887924927`;
- job `107272742116`;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10763618553`, digest `sha256:8f25127a7b924fbada100d85826ae553a9e92f755554e6a6f20c985b32b16710`;
- runtime artifact `10763339801`, digest `sha256:2a763e673486fa60fd87b2af358846db1a5a00e7d7c9b7658ef3cb3301239c94`.

CI #470 on the previous corrective head failed only a stale deterministic contract that prohibited all rAF usage; no production failure was evidenced. The contract-only fix then passed #471/#472.

## CHECKPOINT PLAN — 4/5 COMPLETE

1. COMPLETE — reconstructed transition ordering, physical failure evidence and Blitzit parity boundary.
2. COMPLETE — implemented narrow target-edge staging, overflow correction and paint-gated expand/collapse publication.
3. COMPLETE — exact corrective PR head passed authoritative Windows CI #471.
4. COMPLETE — exact-head/diff/discussion review, expected-head merge and resulting-main Windows CI #472 passed.
5. **PENDING PHYSICAL WINDOWS RE-TEST** — automated CI cannot prove transient desktop flicker/overflow/intermediate-state absence.

## USER ACTION REQUIRED

Use exact resulting-main CI #472 runtime artifact:

- name: `narro-m1-runtime-harness-windows-x64`;
- ID: `10763339801`;
- source SHA: `91a28ba7c5389130b6edb45deabe62a9e01f9d08`;
- digest: `sha256:2a763e673486fa60fd87b2af358846db1a5a00e7d7c9b7658ef3cb3301239c94`.

Physical checks:

1. Run raw `narro.exe` from the extracted artifact.
2. Put Focus Panel on the right side.
3. Repeat Panel -> Floating Timer -> Return to Focus Panel.
4. Flicker PASS only if no left/staging flash is visible.
5. Position PASS if Panel appears directly at the configured right side.
6. Repeat collapsed -> expanded -> collapsed in Floating Timer.
7. Overflow PASS only if there is no horizontal scrollbar in Panel/collapsed/expanded focus surfaces.
8. Expand Transition PASS only if no enlarged/shrunken intermediate compact hierarchy appears.
9. Session PASS if Resume/timer state continues correctly through the switches.
10. Report overall Transition UX PASS/FAIL plus any remaining concrete symptom.

## NEXT AGENT ACTION

**Do not start M7 item 8 until item 7 physical re-validation passes.**

- On full PASS: create immutable physical-pass work log; mark item 7 `[x]`; advance M7 to **7/14**; reset active item-8 slice to **0/5**; reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md`; begin ordered item 8.
- On any FAIL: record the exact symptom and make only an evidence-backed correction from current main. Keep item 7 at 6/14 and 4/5.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains personal, local-only Windows 10/11 x64 software.
- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust remains monitor/work-area/DPI/physical-position authority.
- Timer-mode topmost/taskbar state remains native authority.
- renderer cannot become timer/session/task/scheduling authority.
- mode/expand presentation changes cannot reset, duplicate, start, stop or switch the live session.
- item-2 drag/topmost/taskbar behavior and items 4–6 actions/subtasks/tooltips remain intact.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit activation only.
- no continuous decorative animation/polling or high-frequency JS native-window geometry loop.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain `?diagnostics=1` gated.

## BLOCKERS / NOT RUN

- **Physical Windows corrective re-test: NOT RUN / BLOCKING item 7 completion.**
- No user/product decision blocks implementation.
- Local Rust/Tauri validation is unavailable in connector-only execution; authoritative Windows CI supplies the automated native gate.
