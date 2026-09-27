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
4. The uploaded Blitzit corpus is now fully inventoried and initially reconciled: **38/38 raw files, 19/19 MP4/SRT pairs, 19/19 analyzed, 19/19 reconciled, 19/19 dispositioned**. Details: `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md` and `docs/BLITZIT_VIDEO_EVIDENCE.md`.
5. Deferred M7 manual checks remain OPEN/NOT RUN and do not block independent source implementation; video evidence does not convert them into PASS.
6. **Post-validation VE-F003 correction is now the next source slice:** current direct VE-005 evidence confirms task-menu `Change List` + `Duplicate`, while current Narro production lacks those paths. Implement narrowly without reopening unrelated M5 work.
7. **M8 remains in progress: 5/8 top-level items validated.** After VE-F003 validates/merges, resume the documented Preferences sections on the existing typed/versioned persistence model, incorporating VE-F001 EST normalization, VE-F002 success-screen-enabled completion gating, and VE-F008 nested Preferences evidence.
8. Then close Windows-locale date/time presentation and any remaining M8 acceptance gaps before M9.
9. After M10, run the required Final Comprehensive Review Stage and re-reference the complete uploaded corpus as part of end-state validation.

Roadmap completion remains **6/10 milestones**. M8 is not complete yet.

For each remaining milestone M7–M10:
- require sufficient error/failure/loading/waiting/unavailable/recovery feedback and meaningful edge-case coverage appropriate to that milestone;
- include the milestone's total validated source diff as `+A/-B` lines in its completion report, measured from validated starting source SHA to final validated source SHA.

Video corpus status: **initial ingestion COMPLETE** — 38/38 raw files inventoried; 19/19 paired, analyzed, Narro-reconciled and dispositioned. Evidence PR #172 carries the durable reconciliation. The post-M10 final comprehensive review remains a separate required end-state gate.

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

1. If evidence PR #172 is still open, validate its exact current head and merge it with an expected-head guard. It is evidence/tracking only and does not replace validated application source baseline `699b6ac46bcc6ebcabbcded21f929a7b32018b42`.
2. From latest main, implement the narrow VE-F003 task-menu correction:
   - expose `Change List` through one persistence-first same-identity move to a chosen active list;
   - expose `Duplicate` through the existing durable duplicate semantics, producing one independent identity with no aliased history/session/recurrence state;
   - preserve live-task safety, All Lists projection semantics, stale guards, schedule/session integrity, explicit error/recovery feedback, and reserved action geometry;
   - add focused persistence/command/UI regression coverage and run authoritative Windows CI.
3. After VE-F003 validates/merges, resume the coherent M8 Preferences source slice over the existing v3 `PreferencesPayload` / atomic `mutate_preferences` boundary. Incorporate:
   - VE-F001: supported terminal EST suffix parses into EST and is removed from the saved visible title;
   - VE-F002: with success screen enabled, completion enters success UI before any next-task start; `Next Task` is explicit;
   - VE-F008: conditional Pomodoro/alert/celebration children appear in-place without disruptive scroll repositioning and hidden task times remain available on hover.
4. Do **not** invent the post-click domain semantics of the success-screen `Take a Break` control or change the success-screen-disabled Done progression without stronger evidence/explicit decision.
5. Then close Windows-locale date/time presentation and remaining M8 acceptance gaps before M9.

Sound assets/previews remain local-only. If no validated local sound catalog exists, expose the preference/state boundary and explicit unavailable feedback rather than inventing remote assets. Deferred M7 physical checks remain OPEN and need not be rerun unless a source change directly affects them.

## USER ACTION REQUIRED

No action is required for M8 source implementation. The deferred M7 physical matrix and Blitzit video upload/analysis will be requested only when needed for closure or when the user chooses to provide them. Videos may be uploaded normally to `reference/original-blitzit-videos/inbox/` without pre-classification.
