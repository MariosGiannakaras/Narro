# Narro — parallel nonphysical implementation plan (2026-10-22)

**Owner:** ChatGPT sole coding and static visual comparison agent. User explicitly resumed PA-01–09 on 2026-10-22; Codex reserved ONLY for later actual native physical/video/motion execution when code candidate is ready. No PA case is marked PASS without individual evidence. **Latest user instruction:** execute as many independent tasks as possible concurrently; communicate each task's real phase in a table. Code changes do **not** imply source parity, automated CI PASS, physical Windows PASS or milestone acceptance.

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
| 9a | Settings volume popover: Escape must not save uncommitted draft | **Ολοκληρώθηκε — PR403** | Exact head `6c821e659bd534fa0c82b3a489948188c71ec270`, CI `39747643428` **3/3 SUCCESS**, guarded merge `20cf54436bd40064cf6839ba3013d6882cd07fdd`, **3/3 main blobs exact**. Native physical PASS separately unclaimed. |
| 9b | Reports Overview date picker: Escape/keyboard focus restoration | **Ολοκληρώθηκε — PR405** | Exact head `c55b19524f7ccd54e96e31262cfabd31578c3f61`, CI `39748926344` **3/3 SUCCESS**, guarded merge `86e5a8746608f55d4062ea79e9470ef931ebfede`, **3/3 main blobs exact**. |
| 10 | Home Archive/Duplicate same-render and competing writes | **Ολοκληρώθηκε — PR402** | Exact head `accb0f908df0d2599a6ea36e8f8a4e56728947a2`, CI `39744249518` 3/3 SUCCESS, guarded squash merge `b27c130addabd809a864c131503f50a2d00133c7`, 5/5 matching resulting-main blobs. |
| 11 | Home initial-read Retry | **Ολοκληρώθηκε — PR409 code/merge** | Head `0bbb58aa` CI `39762674590` 3/3 PASS, guarded merge `6b7ef2f`, 5/5 matching blobs; resulting-main CI `39766772841` **3/3 PASS** with original source-SHA-matched artifact uploads, independent fourhash NOT RUN. |
| 11b | Search, Schedule, Reports local-read error recovery | **Ολοκληρώθηκε — PR410, combined main 3/3** | Head `6fd8748721932bec9171eb4251222f95afe3f708` PR CI `39768224869` 3/3 PASS, guarded merge `b9526a246ef48e5597545b1f72d5a6cff24caec7`, 8/8 matching blobs; combined main `17d6aab8998b0c3108f70d6c5ce636df49f817c3` run `39783598136` 3/3 PASS. 3/3 scoped source recovery groups accepted, physical native NOT RUN. |
| 11c | Preferences and Windows Shortcuts initial-read recovery | **Ολοκληρώθηκε — PR411, combined main 3/3** | Head `47b9f3e62629d102585451f6d4b58d908d8ce72e` PR CI `39769632922` 3/3 PASS, guarded merge `17d6aab8998b0c3108f70d6c5ce636df49f817c3`, 5/5 blobs; combined main run `39783598136` 3/3 PASS, six original same-source SHA artifacts. 2/2 scoped source recovery groups accepted, physical native NOT RUN. |
| 12 | Scheduling/recurrence/timezone edge cases | Ελέγχεται — functionality already implemented | Existing deterministic date-only/DST/recurrence regression suites; release and native acceptance remain separate. |
| 13a | Reports Recent Tasks search Enter and no-match state | **Ολοκληρώθηκε — PR404** | Exact head `9667ce2cbf9044e3fd2651a3093cfea4c8e2be2a`, replacement CI `39747650759` **3/3 SUCCESS**, guarded merge `e38a5891b34877495272055f6be489f26515f94e`, **4/4 main blobs exact**. Earlier Windows failure remains historical. |
| 13b | Reports calculations, ordering and exports | Ελέγχθηκε — χωρίς νέα διόρθωση στο C51 | Production `ReportsOverview.tsx` already applies `orderReportDoneTasks(overview.doneTasks)` prior to shared UI/PDF. Additional arithmetic/parity evidence independent. |
| 14 | Focus Panel ↔ Timer stale/mixed pixels | **PR389 διορθώθηκε test guard — νέο CI σε αναμονή** | Original physical 4/8 FAIL. New Win32 layered compositing code head `13646855e0145cc73d288dd26ce9287475191025`, exact run `39797486080` QUEUED, prior first run `39794923437` fast FAIL from stale GDI assertion corrected, not accepted. New Codex physical 8/8 still NOT RUN. |
| 15 | CI guardrails and artifact provenance | **Ολοκληρώθηκε — PR400/PR401** | PR400/401 exact-head CI 3/3 and guarded merges; PR401 `f817c7b1ff262b7156c1297b0773095db7f8105f` main 5/5 blobs. Resulting-main CI after newest PR402 is running/not claimed PASS. Bigger visual sharding is separate high-risk work, not implemented. |
| 16 | Regression test coverage | Ολοκληρώθηκε για PR403–405 / νέα εύρη μόνο μετά από εύρημα | Actual production callback/keyboard tests under exact-head 3/3-success CI #403–405; no claim that all application acceptance tests are complete. |

## Execution lanes and merge dependencies (verified 2026-10-22)

A. **Source accepted:** PR401–405 have genuine exact-head 3/3 Windows CI PASS, expected-head guarded merges and resulting-main changed-file blob identity checks (PR401 5/5, PR402 5/5, PR403 3/3, PR404 4/4, PR405 3/3). Historical failed/cancelled runs remain distinct.
B. **Resulting-main automation:** most recent combined main push run `39755456824` **3/3 SUCCESS (validation/fast/windows-candidate), exact resulting-main merged SHA `86e5a8746608f55d4062ea79e9470ef931ebfede`** at the last observed checkpoint. Earlier intermediate main pushes may be cancelled; avoid treating those as validated.
C. **Safe independent review:** C51 chronology already uses `orderReportDoneTasks`, so do not reopen it. Focus/Timer #389 has genuine failed physical transitions and requires compositor correction under existing ownership. Evidence-limited UI/source details stay OPEN, not random code edits. Optional M11/M12 dormant. Preserve approved Spectrum Core Create/Edit List picker/upload and 218 icons.

**Validated project baseline:** 41/41 uncertainty-local handling, 9/9 confirmed code gaps corrected historically, 4/10 mandatory milestones accepted; these counters are not overall app percentage and not updated by opening PRs. Physical PA categories contain OPEN/NOT RUN cases, not an active user pause.

**Next action:** Five recovery groups source/automated accepted on final combined resulting-main `17d6aab8998b0c3108f70d6c5ce636df49f817c3` Windows run `39783598136` 3/3. The next safe source task requires an independently evidenced unowned defect; otherwise continue nonphysical evidence reconciliation and keep physical/source gates OPEN. 57 M5–M9 checklist items remain open (not automatically missing code); M10 hard entry blocked, PA paused, PR389 physical 4/8 FAIL and other-owned.


**Static checks 2026-10-22:** [source-vs-actual image report](../work-log/2026-10-22-chatgpt-static-image-comparison-old-actual-source-scoped.md). ChatGPT inspected Home cards/ordinals, Preferences monitor/theme, Shortcuts ten-row historical viewport, locked List icon picker, older M7 mixed-pixel fail. Old Narro captures cannot prove current fixes; newest Windows screenshot remains required for Shortcuts static fit and matched Search/Reports.

**Latest accepted-main rendered static audit:** [verified Windows artifact SHA256, Shortcuts dark/light 10/10 + Search/Reports/Preferences](../work-log/2026-10-22-chatgpt-latest-main-static-windows-fixtures-audited.md). Source-original pixel/semantic equivalence separate, no continuous-video obligation for static icon/layout checks. PR344 resumed PA protocol head `ed1f06843c571988d1e74ee4cbdb9404a5d06c44`, CI `39796820131` pending.
