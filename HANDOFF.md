# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, newest immutable `work-log/`, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT VALIDATED SOURCE BASELINE

M5/Main and M6/Focus parity reconciliation remain complete. M7 source implementation is validated through A18 but still awaits deferred physical closure. M8 has begun and its confirmed in-app shortcut slice is validated.

- M8 PR #166 exact validated head: `18a4d2b5a26bc705bf7cdf7bea647275b4877890`.
- Windows CI #569 / run `36255993870`: PASS.
- Visual artifact: `narro-m5-visual-regression`, id `10911290878`, digest `sha256:7f7b8bb93f54d437edb8751a43fc0da9e4b5d0fd1832abee5583581a0bdb7aea`.
- Diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, id `10910393452`, digest `sha256:faff93e41553adc51a0ced99172795517f51d918f2873ce6a294af6c59d56ec9`.
- Expected-head guarded squash merge: `030274149cafdf590c5aa08f2cd1c9409595c7aa`.
- Resulting-main Windows CI #570 / run `36262618691`: PASS via identical-tree validation gate.
- **Current validated application source baseline:** `030274149cafdf590c5aa08f2cd1c9409595c7aa`.

Tracking-only commits after this SHA do not replace the validated application source baseline.

## CURRENT ORDERED WORK

1. **M5 parity/reliability reconciliation (A1–A9, A19): COMPLETE.**
2. **M6 Focus reconciliation (A10–A17): COMPLETE.**
3. **M7 source implementation: 9/14 top-level items validated; M7 remains OPEN for deferred physical/manual acceptance.**
4. By explicit user direction, missing Blitzit videos and deferred M7 manual checks are not blockers for independent source implementation; do not mark them PASS.
5. **M8 in progress.** Confirmed in-app shortcuts and Start Break shortcut lifecycle reuse are validated through PR #166 / CI #569 / main CI #570.
6. **Next M8 source slice:** existing native global shortcuts `Ctrl+Shift+B/T/P` + persisted per-global enable toggles + clear conflict/error feedback. Reuse the current Rust `RegisterHotKey` authority and diagnostic serialization; do not replace it.
7. Continue M8 Preferences after the shortcut slice, then M9 → M10 according to prerequisites.
8. After M10, run the required Final Comprehensive Review Stage, including the complete uploaded video/transcript corpus.

Roadmap completion remains **6/10 milestones**. M8 is not complete yet.

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

Start the next coherent M8 source slice from validated source baseline `030274149cafdf590c5aa08f2cd1c9409595c7aa`.

Priority:
1. inspect the existing native `Ctrl+Shift+B`, `Ctrl+Shift+T`, and `Ctrl+Shift+P` registration/diagnostic authority and current Preferences schema;
2. add persisted per-global enable toggles without duplicating or weakening native registration conflict handling;
3. startup must honor persisted enable state rather than unconditionally registering disabled shortcuts;
4. toggle failures/conflicts must leave committed preference/native state coherent and surface actionable feedback;
5. add focused Rust/frontend contracts before authoritative Windows CI.

Do not rerun deferred M7 manual checks unless this M8 slice directly depends on them. Missing Blitzit videos remain non-blocking.

## USER ACTION REQUIRED

No action is required for M8 source implementation. The deferred M7 physical matrix and Blitzit video upload/analysis will be requested only when needed for closure or when the user chooses to provide them. Videos may be uploaded normally to `reference/original-blitzit-videos/inbox/` without pre-classification.
