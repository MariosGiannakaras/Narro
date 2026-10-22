# 2026-10-22 — UI PR403–405 closure at exact accepted source

**Owner:** ChatGPT UI/source/CI. Continuation of same parallel nonphysical plan; no new branch or duplicate work. GitHub is repository authority.

## Exact-head accepted changes

| PR | Work | Exact accepted PR head | Exact-head CI | Guarded squash merge | Resulting-main affected blob identity |
|---|---|---|---|---|---|
| [#403](https://github.com/MariosGiannakaras/Narro/pull/403) | Preference volume Escape cancels draft rather than blur-saving it | `6c821e659bd534fa0c82b3a489948188c71ec270` | `39747643428` **validation / fast / Windows candidate 3/3 SUCCESS** | `20cf54436bd40064cf6839ba3013d6882cd07fdd` | **3/3 exact** in updated main |
| [#404](https://github.com/MariosGiannakaras/Narro/pull/404) | Reports Recent Tasks Enter-first-result/no-matches status | `9667ce2cbf9044e3fd2651a3093cfea4c8e2be2a` | `39747650759` latest **3/3 SUCCESS** (previous candidate attempt failure remains historical) | `e38a5891b34877495272055f6be489f26515f94e` | **4/4 exact** in updated main |
| [#405](https://github.com/MariosGiannakaras/Narro/pull/405) | Reports Overview date picker keyboard initial focus / Escape restoration | `c55b19524f7ccd54e96e31262cfabd31578c3f61` | `39748926344` **validation / fast / Windows candidate 3/3 SUCCESS** | `86e5a8746608f55d4062ea79e9470ef931ebfede` | **3/3 exact** in updated main |

#405 had been temporarily GitHub mergeable:false during other incoming merges, but the newer API recomputation returned **mergeable:true**. The agent verified its exact PR head, three successful named jobs, and used `expected_head_sha` on squash merge. Afterwards each of its three affected blobs was compared against the exact source blob on `main`; 3/3 exact.

For preceding #401/#402: accepted heads each exact 3/3 SUCCESS with guarded merges `f817c7b1ff262b7156c1297b0773095db7f8105f` and `b27c130addabd809a864c131503f50a2d00133c7`, respectively; each 5/5 matching resulting-main blobs already verified. Their combined resulting-main push `39748153648` **SUCCESS** (API currently shows completed/success).

Latest post-#405 combined resulting-main push **`39755456824` IN PROGRESS / NOT VERIFIED**; corresponding scheduled run `39755601891` also running. Older intermediate push runs `39753398117` and `39753449441` **CANCELLED**, not PASS.

## Independent audit
- C51 Reports Done chronology had a historical READY_FOR_FIX evidence entry. Current production `ReportsOverview.tsx:doneTaskPresentation` already explicitly calls `orderReportDoneTasks(overview.doneTasks)`; do not duplicate the accepted Done chronology fix from an old report. Further original-source pixel parity not asserted.
- Shortcuts dense 10-row layout, Preferences Time section/info glyphs and Reports list initial-badge already exist with fixture/preflight contracts. No duplicate patch justified.
- Focus/Timer compositor draft #389 **4/8 true physical transitions failed**, not automatically solved by Windows candidate CI. PA cases incomplete and source exact parity OPEN. Preserve protected Spectrum Core Create/Edit List picker, image upload and all 218 offline icons. Mandatory milestone acceptance remains **4/10**; optional M11/M12 dormant.

**NEXT SAFE ACTION:** Verify the final outcome of resulting-main push `39755456824` when naturally finished (first failing job/step on FAIL; actual 3/3 PASS on success). Resume independent audits for a causal reproducer, then implement narrow source fixes under separate PRs; do not reopen already corrected UI fragments or override another owner of PR389/344.
