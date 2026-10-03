# M7 PR #192 reconciled exact-head CI #786 checkpoint

Date: 2026-10-01

## Single-instance baseline closed

PR #206 exact head `ab1e89fcabc7b8385016a738603d41002f9c3b14`:
- Windows CI #784: PASS
- guarded squash merge: `4f48941939fa5114e100992280b9ea96540f0df8`
- resulting-main Windows CI #785 / run `36782620879`: PASS

#785 artifacts:
- runtime `11128833526`, digest `sha256:1f9b43978387c973a451ef6283bb0fee0c08afbe954d9b8c99845c9c463ea220`
- visual `11128124562`, digest `sha256:adaa4da4bb13a65bb4aac38e80d716be02eebf0621f90d7b9eff75e012219c7e`

RISK-F009 is now automated/main-validated. Physical one-process ownership remains part of the final M7 artifact matrix.

## PR #192 branch reconciliation

The previously prepared candidate `1a53848c...` was found to be behind three newer Markdown-only main commits. Before moving the branch, authoritative tracking was updated for #785 and the candidate was rebuilt over current main without changing any non-Markdown blob.

Current authoritative main used for reconciliation:
`20275b2fd5ed57546efe91c1300da71094bfdf7b`

New reconciliation tree:
`231b4cec44fbf63363f43a2a3ea73b5f4e3ecaa4`

New two-parent merge commit:
`0762aafd26dbf983f4208667f60381264956af4a`

Parents:
1. prior #192 head `0ef808445b567a4a3194296ed1dccb5a6a58b03e`
2. current main `20275b2fd5ed57546efe91c1300da71094bfdf7b`

A blob-level comparison against the earlier prepared candidate confirmed **zero non-Markdown differences**. The branch ref was then moved with a non-force fast-forward.

PR #192 now:
- head `0762aafd26dbf983f4208667f60381264956af4a`
- mergeable: true at branch-move checkpoint
- Windows CI #786 / run `36785840236`: QUEUED

This exact head contains:
- full one-`focusSurface` M7 replacement;
- validated main/M9 reporting/session source;
- validated #206 single-instance-first runtime ownership;
- B5 `Blitz now -> Focus Panel` correction;
- B6 active-Focus-only Ctrl+Shift+T correction;
- current visual-ready retry/backoff policy and M7 runtime harness.

Do not merge #192 or issue a physical PASS claim until #786 passes, fresh artifacts are reviewed, and the physical active-session Gate 7 / mixed-DPI Gate 12 matrix is executed on the exact artifact.

No roadmap or active-M9 item counter advances at this checkpoint.
