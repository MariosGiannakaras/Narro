# A2 — additional evidence-to-implementation control gaps

Date: 2026-10-08 (Europe/Athens)

## Scope / method

User explicitly directed ChatGPT to independently locate missing Blitzit→Narro implementation details while Codex performs native Windows validation and executable corrections. Consulted latest GitHub main `ca422989e953104e61d0aa83d88c0896ae48df72`, bootstrap/process/quality/handoff/tracking files, canonical Pass-3 screenshot and video findings, UI/UX spec, source crosswalk and representative production TSX/Rust/API/UI-contract files. No need to repeat full 46 screenshots/19 MP4s: this is an evidence-record-to-code reconciliation, not a new raw-source forensic pass. The screenshot/video findings listed below are detailed enough to identify missing UI controls/fields. Reopen original raw source only for ambiguities, conflicts, motion-sensitive claims or direct final source parity verification. The prior SS-C01 color-picker report B3/B7/B8 remains separate; SS-C01 shows the multicolor first swatch and user reports a custom picker, but the screenshot/video do not show full picker operation.

## A2 confirmed control-level gaps

- **B9 / M8 / SS-C09 + VE-014 ~02:06–02:13:** `Success sound effect` owns an independent enable toggle. Narro `PreferenceSettingsSections.tsx`, `SoundPreferenceControl.tsx` and `preferencesApi.ts` expose sound selection, preview and volume, but no success-sound enable flag. Requires typed persistence/default, UI toggle, runtime gating and backward-compatible tests. Parent toggle when success screen disabled is not source-established.
- **B10 / M5 / SS-H14 + VE-006 ~00:48–00:59:** archived-list cards retain recognizable task previews and `Unarchive`/`Delete Forever`. Narro `ArchivedListsPanel.tsx` uses compact title/status rows; TS/Rust `ArchivedListSummary` contains no task preview data. Correct bounded read projection and card presentation; preserve validated archive/restore/delete and confirmation semantics. This is a source composition/data projection omission, not proof stored archived tasks have been deleted.
- **B11 / M5 / SS-H15 + VE-006 ~00:59–01:10:** archived Done is a five-column `Task Name/List/Info/Date/Action` table with optional document/`No Info`, relative dates and per-row trash. Narro `ArchivedDoneTasksPanel.tsx` has plain read-only rows, no column headings/info/trash; `scripts/validate-archive-captures.mjs` explicitly locks the earlier read-only item26 surface. Trash click/aftereffect is **not observed** in source, so implementation must use a safely defined local confirmation/report-history rule and not claim source-proven immediate deletion.
- **B12 / M5 / SS-H11 + VE-013 ~00:16–00:31:** board subtask creation shows subtask header plus, `Enter subtask task title*`, in-field X/cancel and repeat-on-Enter. Current `TaskSubtasks.tsx` has a different `Add subtask` + Add button presentation, no source plus/X. Existing repeat/persistence/identity semantics should remain.
- **B13 / M9 / SS-C02:** calendar visibly uses single and double chevrons. Narro `ReportsOverviewView.tsx` and `ReportsSessionsView.tsx` expose only previous/next-month arrows, no separate double action. This is a control-level source parity gap; exact second navigation semantics are `EVIDENCE_LIMIT`, not a confirmed jump-by-year rule.
- **B14 / M5 / SS-C10/SS-C11:** archived empty-state support text differs from canonical source although headings and search/filter exist. Low-priority copy parity, not a missing archive backend.

## Triaged nonfindings and open evidence

- Success `Take a Break` button being disabled is already tracked as finding37 / `PRODUCT_DECISION_REQUIRED` and is **not** recast as a previously untracked omission.
- SS-C21 microphone-like Notes toolbar affordance lacks proven behavior and possible voice/cloud transcription is explicitly excluded by `HC-F010`; do not create a transcription feature merely because an icon appears.
- SS-H07 calendar dots have no proved semantic meaning, so no new data feature is inferred.
- VE-006 populated archive source is v2.4.89 whereas SS-C10/11 current v2.6.69 confirm empty shell. The older populated control anatomy remains the strongest recorded source for the populated state, subject to future evidence precedence.
- Existing tests and historical PASS remain true for scoped implemented paths, but do not prove completeness of every source UI affordance. In particular, a test requiring read-only archived Done rows is not source-equivalence evidence.

## Disposition / concurrency / next implementation route

Crosswalk B9–B14, nested **non-top-level-counting** TODO acceptance gates in M5/M8/M9 and UI_UX_SPEC have been updated. Codex owns native/physical checks and executable fixes; do not take over its active branch, alter repinned physical candidate or overwrite its current handoff. The implementation agent should look up current open PR/branch/CI and take dependency-safe B10+B11 archive projection/visual bundle, B12 board subtask control bundle, B9 success-sound persisted-state/runtime bundle, B13 scoped calendar evidence check/implementation, and previous B3/B7/B8 Create List work. Preserve old approved functionality and add specific regression/visual fixtures, exact-head CI and separate source/physical acceptance. Do not mark M5/M8/M9 complete solely because past general automated tests passed.

This is an **additional bounded audit pass**, not evidence that every control across 46 screenshots/19 videos has been exhaustively re-compared. Unreviewed families remain eligible for later granular audit.

## Verification

Documentation-only edits to `TODO.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, `docs/UI_UX_SPEC.md` and this new immutable log; no Narro executable/test changes. Application tests, full Windows CI, native visual comparison: **NOT RUN**; no progress counters or acceptance PASS advanced. Post-write GitHub readback is the only current verification.
