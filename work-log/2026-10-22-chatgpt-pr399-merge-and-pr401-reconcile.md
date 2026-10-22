# 2026-10-22 — PR399 merge closure and PR401 exact-source reconciliation

**Owner:** ChatGPT nonphysical source and CI. **Request:** "Τι έχει μείνει;" Current status confirmed with GitHub; completed the safe already-validated PR merge rather than treating a passed CI as unfinished.

## PR399 accepted
- PR399 `a9e479f52586fe364fa3ce640d11358ac25f1e05`, run `39673179963` **validation/fast/Windows candidate 3/3 SUCCESS**.
- Verified open/mergeable unchanged exact head before an expected-head guarded squash merge.
- Resulting main merge `d6b5d441621b63ca257e5c68307731b6e7a30855`, GitHub `merged:true`.
- Independently retrieved all **5 affected source/test blobs** on both the accepted head and this resulting main; **5/5 exact SHA equal PASS**: `scripts/test-ui-archives.mjs`, `scripts/validate-archive-captures.mjs`, `src/ArchivePanel.tsx`, `src/ArchivedListsPanel.tsx`, `src/archiveVisualFixture.tsx`.
- Resulting-main Windows push run `39742485304` **IN_PROGRESS / NOT YET PASS** when checked. Existing preceding main push `39671526638` **3/3 SUCCESS**. No physical Windows manual keyboard PASS inferred.

## PR401 merge-reconciled, not yet accepted
- Earlier PR401 head `86969a9b6c6d7514ccc3072ac00e77848e01969e`, Windows run `39674664763` **3/3 SUCCESS**, but GitHub reported PR401 `mergeable:false` after PR399 merged and main advanced.
- Read the exact PR401 five-file changed list and both current-main/source blobs where they existed. Reconstructed a new tree atop accepted main tree `2e44602b07aa6d91427ee0952a2a3a76fd3aa859` with exactly these five PR401 blobs: `.github/workflows/ci.yml`, `package.json`, `scripts/test-ci-artifact-manifest.mjs`, `scripts/test-ci-tiering.mjs`, `scripts/write-ci-artifact-manifest.mjs`. The two newly added scripts are absent on original main as expected. Preserved all other newer main paths.
- New two-parent commit `d0bf09ad70df8fdb9f7b782042ec78cc49315532`, old PR401 head first parent/new main second parent. Updated **same existing branch** `fix/ci-windows-artifact-provenance-20261021` by expected-head guarded fast-forward, no force-push. GitHub reports PR401 `OPEN / MERGEABLE`, exactly five changed filenames.
- Replacement exact-head Windows CI `39742617831` **IN_PROGRESS / NOT YET 3/3 PASS** at final check; previous green run does not validate this new merge head, and because workflow changes, resulting-main Windows workflow verification remains mandatory.

## Other boundaries
- PR400 CI failure classifier and documentation triggers merged earlier with 3/3 CI. PR394 picker accessibility and PR398 Archive retry/touch behavior also merged earlier with 3/3 CI.
- PR389 had **4 of 8 real physical Focus Panel/Timer composition transitions FAIL** on last owned Windows review, despite old automated CI pass. Requires different source compositor strategy and actual Windows validation. PA-01–09 incomplete cases OPEN/NOT RUN; user removed pause, so Codex can carry out native testing. M11 and M12 strictly optional/not activated.
- Accepted mandatory milestones remain **4/10**. Protect approved Spectrum Core picker, image upload, 218 offline icons.
- Do not idle-poll long Windows CI (~20 min historically) or describe pending work as passed.

**ONE NEXT OPERATION:** Check replacement run `39742617831` after natural completion. On first FAIL, inspect failed step/log, repair existing PR401 branch and regression; on exact SHA 3/3 SUCCESS, expected-head guarded merge PR401, verify five resulting-main blob identities and complete mandatory resulting-main workflow-change CI. Separately preserve physical PR389 failure and native PA acceptance as OPEN.
