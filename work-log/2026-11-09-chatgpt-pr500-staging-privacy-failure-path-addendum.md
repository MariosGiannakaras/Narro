# 2026-11-09 — PR500 failure-path staging privacy addendum

This is a **new immutable addendum**, not an edit to [the earlier PR500 retry/integrity review](2026-11-09-chatgpt-pr500-frozen-evidence-retry-integrity-review.md). Owner: independent ChatGPT reviewer; application source and Codex-owned PR500 source remain untouched.

At review time the live PR500 source was still `49f33fdef1eff2fe974b6a7eb08f6d1569153cae`, OPEN/unmerged, and [CI42663090123](https://github.com/MariosGiannakaras/Narro/actions/runs/42663090123) retained 3/3 PASS for that **unchanged** head. The exact corrected application PR499 `ae0447c4bebd49215f0c49eb8cd9acf0db8fc80c`, held ancestor PR437 and independently held A389/B419 were unchanged.

## Source evidence

In `scripts/upload-physical-evidence.py`, `upload()` creates `temp = pathlib.Path(tempfile.mkdtemp(prefix='narro-upload-'))`, creates a ZIP of every frozen evidence member under that directory, then runs GitHub CLI release access/creation, private draft checks, upload and remote hash verification. `renamed.unlink(); temp.rmdir()` occurs **only on the fully successful return path**. There is no encompassing `try/finally`.

Consequently, if the uploaded release is already published (`if not release['isDraft']: raise RuntimeError(...)`), if GitHub CLI upload/auth/network fails, if remote size/digest verification rejects data, or if the archive source-mutates mid-package, the exception bypasses temporary-file deletion and may leave a **duplicate ZIP containing real private desktop video/log records outside the normal evidence directory**. The PR's own `test_published_release_refused` exercises this exception path, but never asserts temporary directory cleanup. The finding concerns **future failures** and is supported by the actual source control flow. We did **not** inspect the Windows machine's temp directory, run a real upload failure, or claim prior uploaded packets are corrupted.

The previously established **retry idempotency and EVIDENCE_INDEX mutation** defects remain unresolved at this head. Updated the same [PR500 review comment](https://github.com/MariosGiannakaras/Narro/pull/500#issuecomment-6747353741) rather than opening a duplicate thread. Required narrow Codex-owned correction: cleanup temporary ZIP and directory through a `finally` on all success/failure paths, preserve the authoritative original frozen evidence and draft-only privacy guards, add a mock failure-injection regression checking temp deletion, and correct wrapper-level timestamp/idempotency with two-attempt tests before replacement exact-head Windows 3/3 and guarded integration.

## Remaining dependency

Existing GitHub private draft release still contains nine ZIP assets and the 2,854-byte index; the connected source reviewer can read release metadata/digests but cannot download authenticated draft release binaries through the available GitHub fetch action. Actual video/PTS/full-stack log case review remains NOT RUN in this ChatGPT session. Existing 59 M5–M9 acceptance rows, physical PA gates and A/B 8/8 checks are unaffected. Do not initiate fresh recording, private release publication, installer testing, source changes, or merge as a workaround.
