# 2026-10-11 — User-requested 50-file audit reconfirmation and exact CI guarded merges #327–#329

## Priority and result

User interrupted earlier steps and explicitly requested **independent re-verification that all 50 original documentation audit units were fully covered and properly recorded before continuing finished CI**. This work was done *against live GitHub*, not based on conversational assertions, and completed before merging pending PRs. Frozen retrospective **70/70 REVIEWED**, original S0 docs **50/50 COVERED WITH TWO DOCUMENTARY SHA TRANSCRIPTION ERRATA**, original code/CI A01–A14 **14/14** accepted, mandatory roadmap physically/source completed **3/10**. Manual Windows Codex remains USER-PAUSED; no physical parity inferred.

### Independent identity check (actually rerun this session)
- Frozen original S0 source compare **`13a009b2d03fbcef819a1358bede447bf0564ade..71536805de34343e6cf9a809557b6d6902e25c48`** directly returned **168 commits ahead, 0 behind, 104 distinct changed Git paths = precisely 50 `.md` plus 54 source/test/config**.
- Parsed authoritative `docs/AUDIT_2026-10-10_FROM_0600_TRACKER.md` checked IDs T01–T03/E01–E04/L01–L43: **50 entries, 50 unique paths, 50 unique IDs**, exact **set equality** with 50 actual S0 Markdown paths, **0 missing, 0 extra, 0 duplicate**.
- Parsed three immutable individual row audit logs:
  - `work-log/2026-10-11-chatgpt-0600-audit-docs-t01-e04-l01-l08.md` **15 individual rows**
  - `work-log/2026-10-11-chatgpt-0600-audit-docs-l09-l28.md` **20 individual rows**
  - `work-log/2026-10-11-chatgpt-0600-audit-docs-l29-l43.md` **15 individual rows**
  Exact **50/50 unique ID-to-audit-row correspondence**, 0 missing/extra.
- **Individually re-fetched all 50 original paths at live main**: 50/50 exist, no Git fetch errors. **L01–L43 all 43 unchanged immutable historical files exist. 41/43 original summary Git blob hashes exact**, two auditable transcription errors:
  - **L05 original individual audit row was a placeholder** `[sha to be inserted by verification]`; original file actual SHA `c4baa5f106e029f0c4f846a9a55767530f19656d`.
  - **L40 original individual audit summary SHA truncated/malformed** `bc768f7b8167a83342e754a0ed248beb221` (38 hexadecimal chars); actual Git blob `bc768f7b8167a83342e754a0ed3c0ed248beb221`.
  Corrections already durably recorded in **new immutable addenda** `work-log/2026-10-11-chatgpt-s0-50-doc-audit-independent-sha-reverification.md` and `work-log/2026-10-11-chatgpt-pr324-guarded-merge-and-50-doc-sha-identity-errata.md`, both actually retrieved/inspected this session. **No source immutable log or original audit summary was overwritten.**
- T01–T03, E01–E04 all 7 live current-truth docs fetched: E02 remains exact originally audited blob, the **other 6 changed legitimately** after S0 review due to later tracking/document reconciliation and PR state. A historical reviewed blob SHA cannot be treated as a permanent hash of live mutable docs. Addenda explicitly distinguish original S0 T01–T03 from then-current first-review T01–T03 blobs. This audit checks identity/coverage and evidence provenance, **not fresh independent native Win32/Blitzit visual-semantic validation of 50 documents**.

**Disposition:** no skipped, duplicated or left-in-progress original Markdown audit unit. Two real audit-summary evidence defects transparently corrected **without altering immutable files**. Frozen 50/50 and 70/70 *review* counts justified; native parity/physical/combined Windows candidate remains separate OPEN/NOT RUN.

## PR and Windows CI acceptance after recheck

Latest authoritative `main` at source checkpoint after these merges: **`1dc64c568b7c229d869f794dddb7609b8ccfb4a4`**. Three unrelated **TEST-ONLY** post-audit regression PR heads independently checked on GitHub against their exact completed Actions run: **all validation-gate, fast-gate and windows-candidate SUCCESS**, on the same immutable PR head each. Guards used `expected_head_sha` and squash merge; **all six accepted changed test/fixture blobs separately fetched at PR head and corresponding resulting merge, all 6/6 equal**.

| PR + target | Exact CI run / 3 jobs | Accepted head | Guarded resulting-main squash | Head↔merge blobs |
|---|---|---|---|---|
| [#327](https://github.com/MariosGiannakaras/Narro/pull/327) Q05 real Focus stale initial IPC error after newer board | [38116234747](https://github.com/MariosGiannakaras/Narro/actions/runs/38116234747) SUCCESS 3/3 | `ac12363892cc90ac17d70345df47b72ed4108272` | `799538da1fbe336355436126f7ca3925dce2761c` | **2/2** `scripts/test-ui-focus-panel.mjs` `8d8192c4aef368fd577e3e205036dc956af81a5e`; `src/m7IntegrationRegression.tsx` `8fb53a915626f9e5fb0f5ce838aa490e9bf05c83` |
| [#328](https://github.com/MariosGiannakaras/Narro/pull/328) Q04 actual Board Create/Duplicate/Search Quick Task delayed IPC handlers | [38116433635](https://github.com/MariosGiannakaras/Narro/actions/runs/38116433635) SUCCESS 3/3 | `0d46dd30ab65ea41033a0ec7abcb0b94ce155eb3` | `2a55972df8873c34471e537eadac72b6ac44a12a` | **2/2** `scripts/test-board-create-single-flight.mjs` `f82bb56959543d58250656ab76af89918086a793`; `scripts/test-board-search-production-handlers.mjs` `fd584a5cecc9976f831b24bede3fdbf57b8e24d6` |
| [#329](https://github.com/MariosGiannakaras/Narro/pull/329) Q06 actual Reports Add/Edit/Delete delayed IPC handlers | [38116774489](https://github.com/MariosGiannakaras/Narro/actions/runs/38116774489) SUCCESS 3/3 | `228efeafc34719ea8caa9e098c7fc8841518736a` | `1dc64c568b7c229d869f794dddb7609b8ccfb4a4` | **2/2** `scripts/test-reports-real-mutation-handlers.mjs` `5463ce1829684bfdf135c7d2b8de608863685301`; `scripts/test-reports-session-write-owners.mjs` `145479f5bdd4c68d6f0dc6a307b943d2259086ac` |

GitHub mergeability momentarily returned false while calculating after preceding main merge, **then returned true** before guarded merges for #328 and #329. No force merge with known conflict. No stale branch Markdown was introduced.

## #330 exact failed CI and narrow remediation

- Post-audit [#330](https://github.com/MariosGiannakaras/Narro/pull/330) Q07 actual production FocusPanel Row/MakeLive/Add/Delete/Home shared owner and native exit rollback, **two TEST-ONLY paths**. Original head `fba5fea4eb8801d213794b8934fcb4a9cfe55b5b` exact Windows run **38117098114** validation SUCCESS, fast FAILURE, Windows SKIPPED downstream.
- Actually read fast job `114404070760` log, **first failure** `AssertionError: confirmed backend deletion must dismiss modal` at `scripts/test-focus-panel-real-owner-rollback.mjs:140`. Source production `confirmDelete` shows committed delete `setDeleteTarget(null)` **before** post-write `await refreshBoard`, with `focusMutationOwnerRef` released only after refresh; no established product code bug. The test spun through 50 Node `Promise.resolve()` iterations, which was an unsound cross-context VM promise/IPC continuation timer.
- **Only test file** corrected on existing owner branch `audit/20261011-focus-panel-real-owner-rollback`: await actual mounted production handler `setDeleteTarget(null)` callback via promise with a bounded 2s deadline instead of fixed microtask iteration. New exact head **`42044c17c69d31034b47621316987d5f01e721d5`**, run [38119707298](https://github.com/MariosGiannakaras/Narro/actions/runs/38119707298) **IN PROGRESS / no PASS claimed** at snapshot. Must inspect fast/Windows jobs and actual any subsequent red log, require 3/3 at exact head, guarded expected-head merge, 2/2 Git blobs.

## Ownership, blockers and next action
- [#321](https://github.com/MariosGiannakaras/Narro/pull/321) B49 real visual Focus screenshot pixel proof is **OTHER OWNER ACTIVE** (current head `f129c37b30b27897971f3aa8452c563f8f955111`), previous run `38092529298` validation+fast SUCCESS, **Windows FAIL dark focus ownership/rail**. Do **not** edit/merge/recreate without explicit reassignment. It blocks treating any latest binary as final; exact new code CI must be watched for other owner's changes.
- After #330, newer merged-current-source Windows candidate Q12 with original #319/#320 + accepted #322/#323/#324/#326/#327/#328/#329 and eventually #330/#321 still requires actual **one-piece full Windows CI and downloaded ZIP/EXE/installer SHA256**; previous #316/#319/#320 individual PR-head packages are NOT that. No new combined candidate fabricated.
- **Next:** read latest #330 exact CI job state and failure logs, then guarded merge when 3/3 green; continue independent evidence-backed work without overwriting other owner. Reconcile root HANDOFF/TODO/STATUS current top on documentation-only `main` with 7/9 acceptance and exact next action; frozen 70/70 retrospective review remains intact. C4/M6/F35/F29/F27/M8 manual physical Windows USER-PAUSED, M10 blocked, M11 dormant.
