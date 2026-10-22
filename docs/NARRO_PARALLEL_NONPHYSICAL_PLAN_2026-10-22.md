# Narro — parallel nonphysical implementation plan (2026-10-22)

**Owner:** ChatGPT source/CI agent. **Latest user instruction:** execute as many independent tasks as possible concurrently; communicate each task's real phase in a table. Code changes do **not** imply source parity, automated CI PASS, physical Windows PASS or milestone acceptance.

## Stage definitions

- **Προς ανάλυση**: no fresh code or evidence assessment yet.
- **Αναλύεται**: source/evidence/fixture review active, no verified fix.
- **Υλοποιείται**: code and regression being changed, not yet accepted.
- **Ελέγχεται**: independent source/runtime test or exact SHA CI review.
- **Προς CI**: code written but no confirmed run for that SHA.
- **CI σε εξέλιξη**: exact SHA run has not passed all mandatory gates.
- **Προς ενσωμάτωση**: exact SHA 3/3 PASS but merge and resulting-main evidence still required.
- **Ολοκληρώθηκε**: accepted source change with exact-head CI 3/3, guarded merge and resulting-main changed-source identity. This is **not** automatically physical acceptance.
- **Ελέγχθηκε — χωρίς νέα διόρθωση**: existing code/tests already implement this slice; remaining source fidelity or native acceptance may remain open.
- **Φυσική επικύρωση εκκρεμεί**: native OS evidence specifically still missing/failing.

## Task board (statuses recorded at this checkpoint)

| # | User-facing task | Phase | Proof / next action |
|---|---|---|---|
| 1 | Dedicated Windows Shortcuts: fit 10 rows | Ελέγχθηκε — χωρίς νέα διόρθωση | Existing source-calibrated 10-row CSS, fixture fit assertion and keyboard ownership. Exact original Blitzit pixel parity is not proven. |
| 2 | Preferences visual density and information glyphs | Ελέγχθηκε — επιμέρους διορθώσεις υπάρχουν | Actual General Timezone info glyph and Time section already implemented; avoid duplicated C39/C40 changes. Remaining unproven pixel details require evidence. |
| 3 | Expanded timer title/control strip | Αναλύεται / φυσική επικύρωση εκκρεμεί | Known source geometry discrepancy, but shared Timer compositor PR389 real physical transition failures; no unsupported redesign. |
| 4 | Reports Add Session popup composition | Ελέγχθηκε — επιμέρους λειτουργία υπάρχει | Already anchored under opener when measurable, centered as safe fallback for hidden nested opener. Precise source geometry not verified. |
| 5 | Reports Recent Tasks color/name badge | Ελέγχθηκε — χωρίς νέα διόρθωση | Compact color-initial chip and accessible list title already implemented and covered by source/fixture contracts. |
| 6 | Archived list preview/layout | Αναλύεται / πηγαία πιστότητα ανοιχτή | Existing archive read/retry/touch and cards implemented; do not invent unavailable historical provenance. |
| 7 | Monitor selection visual | Αναλύεται / πηγαία πιστότητα ανοιχτή | Real Automatic/Screen monitor keys and dimension previews implemented. No evidence to authorize fake desktop screenshot or native capture API. |
| 8 | Task success screen/animations | Ελέγχθηκε — επιμέρους λειτουργία υπάρχει | Existing offline animations and user-facing settings copy. Source-exact visual matching still unproved. |
| 9a | Settings volume popover: Escape must not save uncommitted draft | **CI σε εξέλιξη — PR403** | Exact head `6c821e659bd534fa0c82b3a489948188c71ec270`, fast/validation PASS, Windows candidate pending. Executed actual React callback focus/blur test in preflight. |
| 9b | Reports Overview date picker: Escape/keyboard focus restoration | **CI σε εξέλιξη — PR405** | Exact head `c55b19524f7ccd54e96e31262cfabd31578c3f61`, fast/validation PASS, Windows candidate pending. Actual production date picker handler regression. |
| 10 | Home Archive/Duplicate same-render and competing writes | **Ολοκληρώθηκε — PR402** | Exact head `accb0f908df0d2599a6ea36e8f8a4e56728947a2`, CI `39744249518` 3/3 SUCCESS, guarded squash merge `b27c130addabd809a864c131503f50a2d00133c7`, 5/5 matching resulting-main blobs. |
| 11 | Error/loading/retry states across app | Αναλύεται | Archive initial-read retry/fail-closed presentation already accepted PR398. Other sources require individual evidence before change. |
| 12 | Scheduling/recurrence/timezone edge cases | Ελέγχεται — functionality already implemented | Existing deterministic date-only/DST/recurrence regression suites; release and native acceptance remain separate. |
| 13a | Reports Recent Tasks search Enter and no-match state | **CI σε εξέλιξη — PR404 attempt 2** | Exact head `9667ce2cbf9044e3fd2651a3093cfea4c8e2be2a`, fast/validation PASS; original Windows run `39747650759` FAILED in **unrelated Finding33 Notes Edge Page.navigate/CDP timeout**; same-head failed-job rerun requested, remains PENDING, not PASS. Actual keyboard-handler regression. |
| 13b | Reports calculations, ordering and exports | Ελέγχεται — existing code/tests | Prior Done ordering and independent CSV/PDF authority tests already exist; no new proven arithmetic bug found here. |
| 14 | Focus Panel ↔ Timer stale/mixed pixels | **Φυσική αποτυχία παραμένει — PR389** | 4/8 scoped physical transitions FAIL despite historic CI; needs causal compositor fix and native Windows retest, no false PASS. |
| 15 | CI guardrails and artifact provenance | **Ολοκληρώθηκε — PR400/PR401** | PR400/401 exact-head CI 3/3 and guarded merges; PR401 `f817c7b1ff262b7156c1297b0773095db7f8105f` main 5/5 blobs. Resulting-main CI after newest PR402 is running/not claimed PASS. Bigger visual sharding is separate high-risk work, not implemented. |
| 16 | Regression test coverage | Υλοποιείται σε παράλληλα slices | Real callback/hook tests in PR403, PR404, PR405, all fast-gate PASS; replacement Windows verdicts pending. |

## Execution lanes and merge dependencies

A. **Accepted now:** CI artifact identity #401 and Home mutation safety #402 both 3/3 PASS and exact 5/5 resulting-main source identity. Distinguish resulting-main Windows push `39748153648` **RUNNING/NOT VERIFIED** from accepted PR head gates.

B. **Three independent implementation PRs currently in Windows CI:** #403 Preferences volume Escape, #404 Reports Recent Tasks selector, #405 Reports Overview date picker. Files are intentionally disjoint across the three branches. CI run IDs: #403 `39747643428`, #404 `39747650759` (attempt 2 failure-only rerun), #405 `39748926344`. Their fast/validation gates passed at their present heads, native candidate **NOT YET ACCEPTED**. Do not wait-idly poll; inspect result once naturally available, fix the first evidenced cause, merge sequentially with exact-head guard only on 3/3 PASS. Reconcile true file conflicts without overwriting newer main tracking or accepted work.

C. **Independent nonphysical audits after executable changes:** inspect remaining source-evidence-only visual deltas and lifecycle/error/admission paths, preserving approved Spectrum Core Create/Edit List color picker, image upload and all 218 offline icons. Optional M11/M12 remain strictly dormant. Avoid changing native compositor PR389 by copying speculative pixel values.

**Validated project baseline:** 41/41 uncertainty-local handling, 9/9 confirmed code gaps corrected historically, 4/10 mandatory milestones accepted; these counters are not overall app percentage and not updated by opening PRs. Physical PA categories contain OPEN/NOT RUN cases, not an active user pause.

**Next action:** After the new Windows checks have had natural time to complete, check #403/#404/#405 exact head/attempt and inspect first failure if any; on 3/3 SUCCESS, expected-head guarded merge and resulting-main identity. In parallel continue evidence-based source audits, not idle polling.
