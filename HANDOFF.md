# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, newest immutable `work-log/`, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT VALIDATED SOURCE BASELINE

M5/Main and M6/Focus parity reconciliation remain complete. M7 source implementation has advanced through A18 and the latest compositor correction.

- M7 PR #155 exact validated head: `c630a57346c067ab04c0fa086703582542f4f7e5`.
- Windows CI #559 / run `36250265344`: PASS.
- Visual artifact: `narro-m5-visual-regression`, id `10908029994`, digest `sha256:9ba27fd6184a4f0a01e056a9a087569ddd3e35a3784a363a366dec658cba9419`.
- Diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, id `10908554507`, digest `sha256:90a9cd51164278499283e77062e4dd2227580857583801b2aeac583da08aa8d8`.
- Expected-head guarded squash merge: `76ef5dadf1d6587ee52d029d980ad4de7a9abd93`.
- Resulting-main Windows CI #560 / run `36251631523`: PASS through the identical-tree validation gate.
- **Current validated source baseline:** `76ef5dadf1d6587ee52d029d980ad4de7a9abd93`.

Tracking-only commits after this SHA do not replace the validated application source baseline.

## CURRENT ORDERED WORK

1. **M5 parity/reliability reconciliation (A1–A9, A19): COMPLETE.**
2. **M6 Focus reconciliation (A10–A17): COMPLETE.**
3. **M7 source implementation: 9/14 top-level items validated; M7 remains OPEN for deferred physical/manual acceptance.**
   - A18 is complete and automated-validated.
   - PR #155 visual-hold correction is merged and automated-validated.
   - physical continuous-transition, repeated shortcut, topology/placement, borderless/fullscreen, and non-default taskbar/high-DPI checks remain OPEN/NOT RUN on the latest build.
4. By explicit user direction on 2026-09-26, missing Blitzit videos and deferred M7 manual checks are **not blockers for independent source implementation**. Do not mark them PASS; batch them later on the latest relevant build.
5. **Next source implementation: M8 Windows shortcuts and preferences.** This is an explicit roadmap execution exception while M7 manual closure remains pending; it does not increment the 6/10 milestone completion counter.
6. Continue M9 → M10 only according to their source prerequisites and the same evidence discipline.
7. After M10, run the required Final Comprehensive Review Stage, including the complete uploaded video/transcript corpus.

Roadmap completion remains **6/10 milestones**.

For each remaining milestone M7–M10:
- require sufficient error/failure/loading/waiting/unavailable/recovery feedback and meaningful edge-case coverage appropriate to that milestone;
- include the milestone's total validated source diff as `+A/-B` lines in its completion report, measured from validated starting source SHA to final validated source SHA.

Video corpus status: upload inbox ready; corpus not yet uploaded/analyzed; not an implementation blocker.

## M6 RECONCILIATION — COMPLETED CAPABILITIES

A10–A17 are implemented and validated:

- A10 ordinary Focus rows expose completion, Rocket/Make Live, reorder and overflow actions with fixed reserved geometry and keyboard/focus equivalents.
- A11 Rocket samples authoritative timer/session state and starts or switches through the timer service, preserving prior work instead of completing/skipping it.
- A12 individual-list Focus queue reorder reuses persisted stable task identities; aggregate All Lists reorder remains disabled.
- A13 ordinary-row Notes, scheduling, non-live completion and explicit permanent delete reuse validated Main/domain boundaries.
- A14 Focus `+ ADD TASK` persists first; All Lists requires an explicit owning-list choice.
- A15 Focus Home shows/recreates Main and hides Focus through native lifecycle without timer/session reset.
- A16 live-task title editing exists only inside Focus Panel Notes and reuses stale-safe persisted title mutation followed by authoritative refresh.
- A17 Time's Up exposes Extend through authoritative `timer_extend`.
- obsolete placeholder/static contracts were evolved into positive final invariants; Windows visual fixtures validate row/action geometry.

Do not reopen A10–A17 without new repository-backed evidence.

## AUDIT CLASSIFICATION

- A1–A9, A19: COMPLETE and validated in M5 reconciliation.
- A10–A17: COMPLETE and validated in M6 reconciliation.
- A18: COMPLETE and automated-validated in M7 PR #155 / CI #559 / main CI #560.
- B1: unresolved task-menu fidelity requirement; no implementation without stronger evidence or explicit decision.
- B2/B3: visual-fidelity questions; defer to the final parity/fidelity pass unless stronger evidence promotes them.
- B4: Done auto-start-next remains unresolved in source evidence; preserve current behavior.
- Audit section C intentional Narro deviations remain binding.

## M7 DEFERRED PHYSICAL CLOSURE

PR #155 is merged. No open M7 source PR remains from that slice.

The following physical/manual acceptance remains OPEN and must be batched later on the latest relevant build:
- Panel↔Timer and Expand/Collapse continuous visual continuity, including Windows animations On/Off;
- transition-boundary shortcut stress;
- locate-timer native-hidden/reduced-motion follow-up;
- secondary monitor/topology/no-saved-placement recovery;
- independent borderless/fullscreen stacking;
- non-default taskbar, constrained work area, secondary monitor and high-DPI placement.

Do not mark M7 complete until these required checks close, but do not block independent M8 source implementation on them.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains local-only Windows software with Tauri 2 + React/TypeScript, SQLite, and authoritative Rust/domain state.
- `main` and reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust remains monitor/work-area/DPI/window-position authority.
- persistence-first mutation boundaries remain authoritative for list/task/subtask/note/scheduling/archive state.
- stable task identities, tracked Time Taken, date-only/timezone/recurrence semantics, and All Lists aggregate semantics remain intact.
- future-timed Today tasks remain ineligible until due.
- Focus entry and task switching cannot duplicate or silently reset live sessions.
- Break/Pause-Resume/Skip/Done/Extend/Make Live reuse authoritative timer/session transitions.
- Focus Home cannot reset timer/session state.
- live-task title editing remains confined to Notes.
- aggregate All Lists reorder remains disabled.
- Notes URLs require explicit activation.
- hover/focus actions retain reserved geometry, accessibility, and reduced-motion usability.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- diagnostics remain gated rather than shown in normal product surfaces.

## EXACT NEXT ACTION

Start the first coherent M8 source slice from validated baseline `76ef5dadf1d6587ee52d029d980ad4de7a9abd93`.

Priority:
1. inspect the confirmed in-app shortcut requirements and existing timer/list mutation boundaries;
2. implement the confirmed in-app shortcuts without duplicating domain logic;
3. include clear unavailable/error behavior and regression coverage;
4. batch compatible M8 work before authoritative Windows CI where safe.

Do not rerun the deferred M7 manual matrix yet unless a new M8 change depends on its result. Missing videos are not a blocker.

## USER ACTION REQUIRED

No action is required for M8 source implementation. The deferred M7 physical matrix and Blitzit video upload/analysis will be requested only when needed for closure or when the user chooses to provide them. Videos may be uploaded normally to `reference/original-blitzit-videos/inbox/` without pre-classification.
