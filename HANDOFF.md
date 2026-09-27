# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, newest immutable `work-log/`, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT VALIDATED SOURCE BASELINE

M5/Main and M6/Focus parity reconciliation remain complete. M7 source implementation is validated through A18 but still awaits deferred physical closure. M8 shortcut foundation/versioned preference persistence, VE-F003 task-menu correction, and the reconciled Preferences/runtime evidence slice are now validated.

- VE-F003 PR #177 exact validated head: `e80034f481bc8d9368bb670cadfce2cdcbe61797`.
- Windows CI #602 / run `36349274182`: PASS — Repository Preflight, visual regression fixtures, Tauri Release and diagnostic artifact upload all succeeded.
- Visual artifact: `narro-m5-visual-regression`, id `10941762475`, digest `sha256:cad2d6f2b0210c1fb2d3213e564d8f0193a8b71ee8488331027fe5206dba85d5`.
- Diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, id `10941867097`, digest `sha256:0f0daac870f0f5d13f88be0f970b341cfcc859c92bc07e5a599d6a2f88391979`.
- Expected-head guarded squash merge: `f4c80d04b25f58637c0ef04c03b60dcd52fcff57`.
- Resulting-main Windows CI #603 / run `36349966245`: PASS through the identical-tree validation gate.
- M8 Preferences/runtime PR #170 reconciled exact head: `633877b1e64b2de3c8b24fad388bef2af6c1793b`.
- Windows CI #604 / run `36350930729`: PASS — Repository Preflight, Preferences visual regression fixtures, Tauri Release and diagnostic artifact upload all succeeded.
- Visual artifact: `narro-m5-visual-regression`, id `10942775993`, digest `sha256:5be194669c48d3442a3ac301ccdc4168a51f378d00b332ac690f8defb61413b5`.
- Diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, id `10942122319`, digest `sha256:53543709c13df1a17bd76ed95fa5d6aba14d1f8092e3236cf16e43bceb4b2782`.
- Expected-head guarded squash merge: `0a54b20f16f5cb69a32602148750b10d533ad470`.
- Resulting-main Windows CI #605 / run `36351530441`: PASS through the identical-tree validation gate.
- PR #180 exact validated head: `0309c879998f43ff8c6e39e65f02c44669fa48b8`.
- Windows CI #607 / run `36352510898`: PASS.
- Expected-head guarded squash merge: `643528ca223b29fd8fbd215db5b1b525c912c6fc`.
- Resulting-main Windows CI #608 / run `36353206934`: PASS.
- **Current validated application source baseline:** `643528ca223b29fd8fbd215db5b1b525c912c6fc`.

Tracking/evidence-only commits after this SHA do not replace the validated application source baseline.

## CURRENT ORDERED WORK

1. **M5 parity/reliability reconciliation (A1–A9, A19): COMPLETE.**
2. **M6 Focus reconciliation (A10–A17): COMPLETE.**
3. **M7 source implementation: 9/14 top-level items validated; M7 remains OPEN for deferred physical/manual acceptance.**
4. The uploaded Blitzit corpus remains fully inventoried and functionally reconciled: **38/38 raw files, 19/19 MP4/SRT pairs, 19/19 product-behavior analyses/reconciliations/dispositions complete**. Details: `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md` and `docs/BLITZIT_VIDEO_EVIDENCE.md`.
5. **User-requested second-pass UI/UX video forensics is COMPLETE: 19/19 deep-reviewed.** Durable evidence is in `docs/BLITZIT_UI_UX_VIDEO_TRACKER.md`, `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md`, and the reconciled `docs/UI_UX_SPEC.md`.
6. **User-requested Help Center text + image evidence pass is COMPLETE:** 34/34 visible legacy-navigation pages inventoried/classified and 15/15 Narro-relevant pages deep-reviewed. The canonical local screenshot corpus is also reconciled: **46 retained images** (22 current v2.6.69, 17 Help Center originals, 7 historical), content-named and deduplicated. Evidence PR #175 exact validated head `8d2ade29eff3e3be3550e6d0638f875d0097237d`; Windows CI #594 PASS; expected-head guarded squash merge `72e825c991a53aee9c68a2411fa2439a9e599f26`; resulting-main Windows CI #595 PASS through the identical-tree validation gate. Durable evidence: `docs/BLITZIT_HELP_CENTER_EVIDENCE.md`, `docs/BLITZIT_HELP_CENTER_TRACKER.md`, and `reference/original-blitzit-screenshots/CANONICAL_INDEX.md`. Newer 3.0 docs remain version-separated.
7. Deferred M7 manual checks remain OPEN/NOT RUN and do not block independent source implementation.
8. **Post-validation VE-F003 task-menu correction: COMPLETE / VALIDATED.** `Change List` now performs a persistence-first same-identity move to another active list while preserving authoritative lane/schedule/recurrence/session history; `Duplicate` creates one independent identity; live/open-session mutation is rejected transactionally; the fixed action geometry and confirmed `Schedule → Change List → Duplicate → Delete` hierarchy are covered by regression/visual validation. PR #177 / CI #602 / main CI #603.
9. **M8 remains in progress: 6/8 top-level items validated.** VE-F001, VE-F002 and VE-F008 are validated in reconciled PR #170 / CI #604 / main CI #605; conditional/nested Preferences behavior is validated without scroll-jump remounts. The top-level Preferences item remains open only for runtime effects the validated slice explicitly did not claim.
10. The audit-incorporation gate is active. Resolve current `FIX_NOW` discrepancies before unrelated M8 forward work; first is CORR-01 recurrence No Repeat / Delete Existing. Then close remaining M8 Preferences runtime effects and Windows-locale date/time before M9.
11. After M10, run the required Final Comprehensive Review Stage and re-reference the complete uploaded corpus and Help Center evidence as part of end-state validation.

Roadmap completion remains **6/10 milestones**. M8 is not complete yet.

For each remaining milestone M7–M10:
- require sufficient error/failure/loading/waiting/unavailable/recovery feedback and meaningful edge-case coverage appropriate to that milestone;
- include the milestone's total validated source diff as `+A/-B` lines in its completion report, measured from validated starting source SHA to final validated source SHA.

Video corpus status: **initial product-behavior ingestion COMPLETE** — 38/38 raw files inventoried; 19/19 paired, analyzed, Narro-reconciled and dispositioned. Evidence PR #172 carries that durable reconciliation. A separate user-requested **UI/UX forensic second pass is COMPLETE at 19/19**; keep it distinct from the functional-ingestion counter. The post-M10 final comprehensive review remains a separate required end-state gate.

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
- B1: RESOLVED and VALIDATED by direct VE-005 evidence plus VE-F003 PR #177. Current task overflow exposes `Schedule / Update Schedule`, `Change List`, `Duplicate`, and destructive `Delete` while preserving explicit permanent-delete confirmation.
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

1. Read `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` before any source work. It is the mandatory finding→implementation routing layer.
2. **Resolve CORR-01 before unrelated M8 forward work:** recurrence update / No Repeat flow.
   - current Narro shows generic `Replace Existing Tasks` plus separate `Remove recurrence`;
   - current VE-017 + Help Center evidence shows `No Repeat` as the recurrence choice and a conditional warm/red `Delete existing tasks(n)` row;
   - unchecked No Repeat detaches existing generated children as independent tasks;
   - checked Delete Existing removes only safely eligible generated children through one authoritative transactional boundary;
   - do not silently delete historical/session-bearing/customized user work merely to copy source behavior;
   - preserve expected-version/stale guards, parent identity, recurrence idempotence, persistence-first publication and explicit failure/recovery feedback;
   - add Rust/frontend/visual regression coverage and validate exact PR head on Windows.
3. After CORR-01 passes exact-head CI, guarded merge and resulting-main validation, resume audited M8 work in order:
   - PREF-R01 timed task alerts;
   - PREF-R02 finite/reduced-motion-safe timer flash;
   - PREF-R03 notification-alert gating without duplicate M3 effects;
   - PREF-R05 local sound/preview only with validated Narro-owned or user-local assets;
   - PREF-R06 Windows locale/system 12/24-hour presentation.
4. PREF-R04 schedule-reminder preference/lead integration is already validated in PR #180 / CI #607 / main CI #608. Do not reimplement it.
5. M7 physical compositor/monitor/DPI validation remains OPEN; VE-F007/UX-F004 remain validation-open rather than guessed from automation.
6. M9 must consume the routed VE-F006 / HC-F002 / UX-F012 / UX-F013 findings when reached.

## USER ACTION REQUIRED

No action is required for M8 source implementation. The deferred M7 physical matrix and Blitzit video upload/analysis will be requested only when needed for closure or when the user chooses to provide them. Videos may be uploaded normally to `reference/original-blitzit-videos/inbox/` without pre-classification.
