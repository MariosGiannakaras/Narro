# U01–U41 Narro-local implementation progress — fixed denominator and evidence boundaries

## CURRENT 2026-10-12 — User-directed general counter first: 40/41 functionally covered, 1/41 intentionally blocked

**Definition:** Each exact `U01`…`U41` source-uncertainty item is assigned **exactly once** below. "Functionally covered" means that Narro has an approved/implemented and automated-tested local behavior for the relevant capability, including deliberately different documented Narro-local alternatives. It **does not** mean that 40 original contemporary Blitzit algorithms/screens/animations have been matched or that native Windows physical tests have passed. Some findings were uncertainties rather than missing features. This is a *coverage counter for these 41 defined concerns only*, **NOT the denominator for total application functionality or exact Blitzit parity**.

**Current global implementation:** **40/41 local functional coverage**; **1/41 missing action (U04)**. The 41 historical unknowns are **41/41 reviewed** independently (source-observation findings, not 41 bugs). The subset of actual specifically identified local feature/UI code gaps is **8/9 fixed** (`U06,U09,U12,U21,U22,U23,U35,U40`) and **1/9 approval-blocked U04**. Native fully accepted mandatory milestones **3/10 (7 remaining)**; physical PA-01–09 **USER-PAUSED / NOT RUN (9 cases)**; optional M11 dormant/NOT ACTIVATED. Never silently translate coverage into current Blitzit source fidelity or physical PASS.

## All forty-one unique IDs mapped to functional code or an explicit blocker

| Disposition (count) | Exact IDs | Current Narro-local meaning |
| --- | --- | --- |
| **LOCKED_APPROVED_LOCAL (2)** | U01, U02 | Approved Narro-specific Spectrum Core color picker and upload/letter/218 offline icon system. Functional; protected from parity-driven rewrite. |
| **EXISTING_FUNCTIONAL_CODE (16)** | U03, U05, U07, U10, U11, U14, U17, U18, U19, U20, U26, U27, U30, U33, U34, U37 | Functional Narro behavior already exists. Some copy/render/audio/OS/physical and original-source details remain OPEN; this is not pixel/native parity. |
| **NARRO_LOCAL_DETERMINISTIC (9)** | U08, U13, U15, U16, U29, U31, U32, U38, U41 | Coherent functional Narro-local contract accepted where current original click/algorithm is not proved; no M11 prerequisite. |
| **FUNCTIONAL_OLDER_SOURCE_DIFFERENCE (5)** | U24, U25, U28, U36, U39 | Functional Narro implementation exists, but old Blitzit evidence differs in ordering/semantics/copy. Counted as local functionality ONLY; source parity is not closed. |
| **EXACT_CI_MERGED_FIX (8)** | U06, U09, U12, U21, U22, U23, U35, U40 | Eight independently source-implemented fixes, exact-head Windows CI 3/3, guarded merges and source-matched resulting-main validation/hashes; original-current-Blitzit parity separately OPEN. |
| **BLOCKED_IRREVERSIBLE_DELETE (1)** | U04 | Only nonimplemented action: Archived Done permanent delete button disabled/no IPC. Requires explicit approval of removing task plus sessions, notes, reports and dependent data; source-only safety audit done. |

**Arithmetic:** **2 approved+locked + 16 code-present + 9 Narro-local deterministic + 5 implemented old-source differences + 8 remediated = 40/41 functionally covered; +1 U04 not implemented =41/41 classified**. For source-coded relevant-gaps **8/9** with **1/9 U04 outstanding**. No additional U42 or duplicate. The 5 older-source differences **U24/U25/U28/U36/U39** and copy-sensitive **U07** are explicitly *not* Blitzit-fidelity approvals, even though their Narro controls/workflows function.

## Evidence and current executable baseline

- [Consolidated 41-row fixed U-ID audit](BLITZIT_UNVERIFIED_AUDIT_CONSOLIDATED_TRIAGE_2026-10-11.md); [detailed source uncertainty register](BLITZIT_UNVERIFIED_BEHAVIOR_REGISTER.md); these records disclose source-correctness and physical uncertainty separately.
- Accepted U12/U40/U35/U21 bounded **4/4** together after exact-head CI/guarded merged source; U06 **1/1**, U09 **1/1**, U22 **1/1**, U23 **1/1** independent bounded implementation + resulting-main Windows accepted. Not 41 new PRs, and not 41 identical implementation units.
- **Latest executable** U23 [PR342](https://github.com/MariosGiannakaras/Narro/pull/342), original exact green PR head `2914317b40aa7efa6c1401dff73e0106378fb43f` [CI38272720744](https://github.com/MariosGiannakaras/Narro/actions/runs/38272720744) 3/3 PASS, guarded merge `4ce42cd9b41c4c445a1acbf0737c3a7b3063af7a` and 14/14 matching changed blobs; [resulting-main Windows CI38277579376](https://github.com/MariosGiannakaras/Narro/actions/runs/38277579376) exact executable head 3/3 PASS, original production [artifact11760996038](https://github.com/MariosGiannakaras/Narro/actions/runs/38277579376/artifacts/11760996038) ZIP CRC + ZIP/exe/NSIS/MSI four SHA256 independently verified. [Immutable complete source/release proof](../work-log/2026-10-12-chatgpt-u23-resulting-main-threejob-production-crc-four-sha-accepted.md). Subsequent `main` updates Markdown only.
- **U04 exact blocker:** The archived Done per-task UI remains `data-archived-done-delete="unavailable"`, with no deletion IPC. Direct `permanently_delete_task` is a low-level irreversible DELETE, whose FK cascades consume task-owned sessions, notes, subtasks, reminders and related effects, and change reports/CSV. [Independent source-only risk audit](../work-log/2026-10-12-chatgpt-u04-archived-done-delete-safety-causal-audit-no-source-edit.md). User question "why wasn't U04 done" is not unambiguous approval for deleting historical records: require explicit product decision whether task+all associated history must be permanently erased and whether a backup/export is required, then implement per-row confirmation, transaction CAS, negative-state, concurrent/race, downstream report tests. No user data was modified.
- **Risk boundary:** original-source truth (M11 hard opt-in), Windows native physical PA-01–09 (USER-PAUSED) and functional local code coverage are separate. Preserve the user-approved Spectrum Core Create/Edit List picker, image upload/letter, 218 icons.

## Binding user-facing counter order from 2026-10-12

On meaningful next implementation update report, in **this order**:
1. **Γενική υλοποίηση U01–U41:** **40/41 λειτουργικά καλυμμένα**, **1/41 εκκρεμές (U04)**. If this count changes, cite actual changes and their correct validation, not PR count.
2. **Ειδικά επιβεβαιωμένα κενά:** **8/9 διορθωμένα**, **1/9 εκκρεμές**.
3. **Υποχρεωτικά milestones:** **3/10 φυσικά αποδεκτά**, **7/10 παραμένουν**. Native PA-01–09 **NOT RUN / USER-PAUSED**; no fake PASS.
4. **Τρέχον PR/CI/source SHA:** if anything actually changed, include statuses and exact active blocker.

Never print "40/41 Blitzit parity", "40/41 physical acceptance" or "40/41 all product features". M11 still optional; user can later explicitly authorize it, but none of these counts activates it.
