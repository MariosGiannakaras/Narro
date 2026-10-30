# CI948 full-original Narro video retirement and repository-wide evidence inventory — 2026-10-30

Owner: ChatGPT evidence-cleanup. Evidence-only scope, no application code or native Windows operation.

## Exact action and identity

- Baseline main commit: `94bbd3e9544bd2da2a2c85b5881c27abaece8b97`, tree `52644bf2fba47508752727b12c4020ff5fc139f1`.
- PR [#455](https://github.com/MariosGiannakaras/Narro/pull/455), branch `cleanup/retire-ci948-raw-originals-20261030`, exact PR head `bfb2fd10805cbc8070236c98b651ab0f92506bbb`, guarded squash merge `faa0c92196c3cb078912fec0647b9c5cdee6f63c`.
- Deleted **11 obsolete full-recording MKV Git blob parts / 403,630,464 logical bytes**. Exactly one `recording-01/original.mkv.part-001` (16,275,991 B) and ten `recording-02/original.mkv.part-001` through `part-010` (387,354,473 B) under `work-log/evidence/m7-ci948-20261004/video-original/`. The exact PR compare showed **11 removed files, zero other changes**.
- Historical source is CI948/main `28e840f50d0888ab86801efc36fff76c6e8e74aa`, executable SHA256 `0914b4c983d91c1e7de3937be53cf2f226e49c8049143469732499bccd932aa3`, [Windows run 37220348196](https://github.com/MariosGiannakaras/Narro/actions/runs/37220348196). These old binaries are not an exact candidate for the pending PR389/419/437 physical acceptance.
- Reversibility: both **original full recordings remain recoverable at the exact pre-deletion commit `94bbd3e9544bd2da2a2c85b5881c27abaece8b97`** using their original paths and `parts.json` SHA/size metadata. No Git history rewrite. Archived README/manifests/historical results are not rewritten; links to retired blobs are historic, not current-checkout guarantees.

## Preserved evidence/limits

The six short original-stream CI948 MKV excerpts (`clips/`: modal matrix, metrics/queue failures, wrapped Notes, native planning drag, inline deletion/archive, C5 drag/Quit/relaunch), selected visual gallery and source comparisons, 28 historical JPG review atlases, review indexes/metadata, `parts.json`, `reassemble.py`, action/observation/provenance logs and the immutable [CI948 physical report](2026-10-04-codex-m7-ci948-physical-results.md) are retained. The earlier **840 derived PNG frames** were separately retired in PR452 with their exact recovery identity. The original 44-minute CI948 recording was never fully reviewed frame by frame; deletion does not turn an OPEN historical claim into PASS. The original CI948 follow-up fixes moved to later source and native candidate branches. Pending modern native claims require their own exact-build observation.

The current `reference/` Git tree is unchanged at `46dea0c640cbfc17003acf439d96f503a5c39410`. `src/` `715f8a0acc5bab9a170d3c55d683f3dcb64d0e90`, `src-tauri/` `d15e3d16751fee44dc494b406235e482011022c5`, `tests/` `229d81ddd95bfae21db7c05e60452e02ca1a0709` are also unchanged. Original Blitzit assets are protected **by provenance regardless of folder**, including any canonical source-comparison images outside `reference/`.

## Exhaustive Git tree metadata inventory (not exhaustive semantic review)

The GitHub recursive tree after PR455 (main commit `faa0c92196c3cb078912fec0647b9c5cdee6f63c`, root tree `51abd986871e017bb33df91fde75538d93f568e7`) returned `truncated:false`. **Every current tracked file path and reported blob byte size was enumerated**; its contents were not each visually inspected or individually compared with source. Totals:

| Scope | Tracked blob count | Logical bytes |
| --- | ---: | ---: |
| Entire checkout tree | 19,135 | 11,503,815,494 |
| `work-log/` (including evidence) | 18,336 | 11,237,664,703 |
| `work-log/evidence/` | 17,310 | 11,231,332,880 |
| `reference/` (protected source tree) | 90 | 256,176,725 |

As file-extension indicators only, not safe-to-delete classifications: 259 `.mkv` blobs (3,964,307,957 B), 241 `.mp4` (755,325,833 B), 146 `.zip` (749,130,369 B), 35 `.bin` (888,235,625 B), 4,445 `.png` (860,342,422 B), 1,988 `.jpg` (632,752,130 B). Additional split-part formats (e.g. `.part001`, `.part-001`, `.part01`) make extension-only tallies incomplete. None of these counts alone proves the files are obsolete, duplicates or Blitzit/Narro-owned.

The cumulative validated PR445–455 checkout retirement is **19,293 files / 5,421,563,717 logical bytes**. This does not change old Git history storage, remote Git packfile bytes, or GitHub clone history.

## Disposition of remaining evidence families

- **PERMANENTLY PROTECTED:** original Blitzit videos/screenshots/transcripts/canonical source comparisons, whether under `reference/` or nested inside prior evidence; provenance must be established before deleting unknown assets.
- **REVIEW-DEPENDENT / HOLD:** all CI953 packets with explicit `OPEN`, `UNREVIEWED`, `REVIEW_PENDING` visual/motion claims; CI950 original streams where source/native failure analysis remains open; 2026-10-20 `capture57` partially acquired/not fully analyzed; and 2026-10-24–30 Windows physical/compositor/Timer/monitor streams supporting PR389/419/431/436/437 and PA-01–09. Old age does not retire a consumer.
- **CASE-BY-CASE / NOT YET VERIFIED:** historical PA350–356 and 2026-10-08 CI1046 whole streams, ZIPs with possible unique logs/audio/metadata, duplicated archives and older residual capture folders. Their physical/source parity conclusions, pending acceptance dependencies and unique original-byte roles require specific cross-checks; do not bulk-delete by suffix or date. A mixed ZIP may contain nonreplaceable data.
- **RETIREMENT ELIGIBILITY:** only dated Narro originals whose exact candidate is superseded **and** no active review/gate/current test/source-reference needs full motion, with compact findings/selected visual context/provenance retained, PR exact path allowlist and recovery SHA. CI948 full MKV passed this narrow disposition; no blanket status is assigned to other families.

## Future acquisition prevention and validation boundary

Current `.gitignore` already ignores `artifacts/` and `work-log/evidence/**` by default for new Narro captures; force-add is exceptional. The binding [retention policy](../docs/EVIDENCE_RETENTION_POLICY.md) requires a named current consumer, exact build/source, status, owner and explicit retirement trigger. GitHub Actions fast-gate sparse checkout excludes `work-log/` and `reference/` from application tests; CI artifacts have independent configured retention. Avoid new tracked media dumps absent a consumer. This is a verified **policy/ignore rule**, not a guarantee that a future agent cannot explicitly force-add blobs.

PR455 was a deletion-only `[skip ci]` archival PR, so no new exact-head Windows 3/3 run or native physical PASS is claimed. PR445's prior 3/3 CI remains historical evidence of its own policy/test changes. M1–M4 remain 4/10 accepted; M5–M9 physical/source claims OPEN; M10 requires user review; M11/M12 dormant.

**Next scope:** for each remaining historical Narro full recording/ZIP, first identify its named open consumer and the unique evidence not preserved in logs/clips/representative frames. Retire only individually proven unnecessary files, keeping immutable results and exact recoverability; preserve all original Blitzit sources and pending acceptance material.
