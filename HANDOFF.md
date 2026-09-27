# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, newest immutable `work-log/`, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT VALIDATED SOURCE BASELINE

M5/Main and M6/Focus parity reconciliation remain complete. M7 source implementation is validated through A18 but still awaits deferred physical closure. M8 shortcut foundation and versioned preference persistence are validated.

- M8 global-shortcut PR #168 exact validated head: `e63dbd3107fca8ccf95d35506c7a16e4eeaac9f6`.
- Windows CI #574 / run `36284019516`: PASS.
- Visual artifact: `narro-m5-visual-regression`, id `10919562623`, digest `sha256:781ff8dd2dea000db2ba7e1dc6be602fc551f119e30e6d47e88e8242baf9a766`.
- Diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, id `10919742072`, digest `sha256:b2febb1520437238b2ed21e8271116c0a823a8984f592296401f3e80abc63528`.
- Expected-head guarded squash merge: `699b6ac46bcc6ebcabbcded21f929a7b32018b42`.
- Resulting-main Windows CI #575 / run `36284525078`: PASS through the identical-tree validation gate.
- **Current validated application source baseline:** `699b6ac46bcc6ebcabbcded21f929a7b32018b42`.

Tracking-only commits after this SHA do not replace the validated application source baseline.

## CURRENT ORDERED WORK

1. **M5 parity/reliability reconciliation (A1–A9, A19): COMPLETE.**
2. **M6 Focus reconciliation (A10–A17): COMPLETE.**
3. **M7 source implementation: 9/14 top-level items validated; M7 remains OPEN for deferred physical/manual acceptance.**
4. The uploaded Blitzit corpus remains fully inventoried and functionally reconciled: **38/38 raw files, 19/19 MP4/SRT pairs, 19/19 product-behavior analyses/reconciliations/dispositions complete**. Details: `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md` and `docs/BLITZIT_VIDEO_EVIDENCE.md`.
5. **User-requested second-pass UI/UX video forensics is COMPLETE: 19/19 deep-reviewed.** Durable evidence is in `docs/BLITZIT_UI_UX_VIDEO_TRACKER.md`, `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md`, and the reconciled `docs/UI_UX_SPEC.md`.
6. **User-requested Help Center text + image evidence pass is COMPLETE:** 34/34 visible legacy-navigation pages inventoried/classified and 15/15 Narro-relevant pages deep-reviewed. The canonical local screenshot corpus is also reconciled: **46 retained images** (22 current v2.6.69, 17 Help Center originals, 7 historical), content-named and deduplicated. Durable evidence: `docs/BLITZIT_HELP_CENTER_EVIDENCE.md`, `docs/BLITZIT_HELP_CENTER_TRACKER.md`, and `reference/original-blitzit-screenshots/CANONICAL_INDEX.md`. Newer 3.0 docs remain version-separated.
7. Deferred M7 manual checks remain OPEN/NOT RUN and do not block independent source implementation.
8. **Post-validation VE-F003 remains the next source correction:** current direct VE-005 evidence confirms task-menu `Change List` + `Duplicate`, while current Narro production lacks those paths. Current Help Center additionally confirms the existing permanent-delete confirmation step. Implement narrowly without reopening unrelated M5 work.
9. **M8 remains in progress: 5/8 top-level items validated.** After VE-F003 validates/merges, resume the documented Preferences sections on the existing typed/versioned persistence model, incorporating VE-F001 EST normalization, VE-F002 success-screen-enabled completion gating, and VE-F008 nested Preferences evidence.
10. Then close Windows-locale date/time presentation and any remaining M8 acceptance gaps before M9.
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

1. The Blitzit video UI/UX forensic pass (**19/19**), Help Center text+image pass (**34/34 classified; 15/15 relevant deep-reviewed**), and canonical screenshot/image reconciliation (**46 retained, deduplicated references**) are complete. Do not repeat either without new source evidence or a material source update.
2. Re-read the exact live state of open source PR #170 before touching it; it predates the evidence reconciliation and must not be merged or treated as current merely because its prior CI passed.
3. Resume the ordered source work with the narrow **VE-F003 task-menu correction** from latest main:
   - expose `Change List` through one persistence-first same-identity move to a chosen active list;
   - expose `Duplicate` through existing durable duplicate semantics, producing one independent identity with no aliased history/session/recurrence state;
   - match the confirmed compact anchored menu hierarchy/order and destructive-red treatment from VE-005;
   - preserve live-task safety, All Lists projection semantics, stale guards, scheduling/session integrity, explicit error/recovery feedback and Narro's stationary/reserved hover action geometry;
   - preserve explicit permanent-delete confirmation; VE-006 did not visibly expose it, but current official Help Center documentation explicitly specifies `Delete → Confirm`.
4. After VE-F003 validates/merges, resume M8 Preferences/runtime completion over the existing typed/versioned persistence model, incorporating VE-F001 / VE-F002 / VE-F008 plus the completed UI/UX forensic evidence.
5. Then close Windows-locale date/time presentation and remaining M8 acceptance gaps before M9.

Measured/source-specific fidelity note:
- VE-003 Panel→Floating shows ~0.27 s continuous geometry transformation at 60 fps.
- Do not copy the source's clipped/sparse intermediate content.
- Generic hover/menu/modal/inline/chart timing values in `docs/UI_UX_SPEC.md` are Narro calibration targets, not measured Blitzit constants.

Sound assets/previews remain local-only. If no validated local sound catalog exists, expose the preference/state boundary and explicit unavailable feedback rather than inventing remote assets. Deferred M7 physical checks remain OPEN and need not be rerun unless a source change directly affects them.

## USER ACTION REQUIRED

No action is required for M8 source implementation. The deferred M7 physical matrix and Blitzit video upload/analysis will be requested only when needed for closure or when the user chooses to provide them. Videos may be uploaded normally to `reference/original-blitzit-videos/inbox/` without pre-classification.
