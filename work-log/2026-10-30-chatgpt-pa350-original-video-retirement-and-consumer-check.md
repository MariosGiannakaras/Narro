# PA350 superseded Narro full-video retirement and remaining evidence consumers — 2026-10-30

**Owner:** ChatGPT evidence cleanup. **Mode:** verified evidence-only Git tree surgery, no app/source/test/CI/desktop operations.

## Exact PR456 deletion and recovery

- Base `main`: `0b8be046bd24a628aefba9b1b56a2690f0c33b6b`, tree `73c487723bfaccae3e500965e4f3741606af62f5`.
- [PR456](https://github.com/MariosGiannakaras/Narro/pull/456) head `f82a2c1095fc4be88454057f3dacb035e53a68fd`, expected-head guarded squash merge **`333be97903d01ab75221618e3449da2e3adc8865`**, tree `00ee32bb8aaec18183232d72a9b228a77979aae5`.
- Exactly three **historical Narro** full-video blobs removed from current checkout:
  - `work-log/evidence/pa350-native/continuous.mkv.part001` — 50,331,648 B.
  - `work-log/evidence/pa350-native/continuous.mkv.part002` — 50,331,648 B.
  - `work-log/evidence/pa350-native/continuous.mkv.part003` — 33,941,170 B.
  - **Total 3 files / 134,604,466 logical bytes.** GitHub exact base/head compare shows three removals only and no added/modified files.
- **Exact lossless recovery:** obtain these three original paths from pre-deletion commit `0b8be046bd24a628aefba9b1b56a2690f0c33b6b`; reconstruct/verify using retained `pa350-native/freeze-manifest.json`. Git history was not rewritten.

## Consumer-level evidence assessment

The retired video documents superseded PR350 binary source `4b183470b6e90abfb8f2cb717e931e17531a0d0d` / EXE SHA256 `6c780f13e564c11251c56f516f01fbb59727e83294a09868ae2617376babb964`, **not** an active PR389/419/431/436/437 exact-build candidate. [PA350 aggregate report](../docs/WINDOWS_PA350_NATIVE_REPORT_2026-10-14.md) explicitly reviewed 5/5 groups; video uncovered Main entry and Reports visual defects plus notification delivery sound failure in that older build. The downstream physically checked dispositions are independently retained:

- [PA351](../docs/WINDOWS_PA351_NATIVE_REPORT_2026-10-14.md): actual selected sound/volume 0–100 automatic-delivery scope PASS, C5 normal Quit/relaunch PASS; Main entry and Reports bars still failed at that intermediate build.
- [PA353](../docs/WINDOWS_PA353_NATIVE_REPORT_2026-10-14.md): Main→Focus native entry reliability PASS; Reports scrollbar correction PASS, separate tooltip defect subsequently followed up.
- [PA354](../docs/WINDOWS_PA354_NATIVE_REPORT_2026-10-14.md): chart tooltip containment PASS, newly observed picker/PDF boundaries required further work.
- [PA356](../docs/WINDOWS_PA356_NATIVE_REPORT_2026-10-15.md) and [final PA01–08 disposition](../docs/WINDOWS_PA01_08_FINAL_2026-10-15.md): affected preference/PDF and actual OS toast branches accepted in exercised scope; 8/8 PA groups dispositioned, **not** 8 blanket source-parity PASS.
- Protected `pa350-native/freeze-manifest.json` and `chronological-actions.md` remain as frozen provenance; `pa350-native/screens-uia-hwnd-all-Narro-M7-Logs-owned-db.zip` (12,191,523 B) and both `pa350-native-review/` archives (3,009,269 B aggregate frames/audio/ledgers and 10,817,540 B supplement recordings/logs) plus `manifest.json` remain. No original Blitzit media was deleted; other legacy/Narro-source videos and all CI953 review-needed streams unaffected.

**Critical limits:** accepted historical PA cases are not verified current PR437 physical PASS. PA09/canonical Blitzit motion/appearance parity and present PR389/419 compositor 8/8 before-merge holds remain OPEN. The old PA350 full-video original is recoverable if an exact past-frame re-review becomes genuinely necessary. The historical report/manifests still refer to pre-retirement blob paths as immutable dated snapshots, not promises the current checkout contains them.

## Exact post-merge tree check and duplicate constraints

At merge `333be97903d01ab75221618e3449da2e3adc8865`: full recursive Git tree returned `truncated:false`, **19,133 blobs / 11,369,216,947 logical bytes**; `work-log/evidence/` **17,307 blobs / 11,096,728,414 B**. Remaining PA350 raw MKV parts **0**; the six retained evidence/manifest/log paths above exist. `reference/` tree `46dea0c640cbfc17003acf439d96f503a5c39410`; application `src/` `715f8a0acc5bab9a170d3c55d683f3dcb64d0e90`, `src-tauri/` `d15e3d16751fee44dc494b406235e482011022c5`, `tests/` `229d81ddd95bfae21db7c05e60452e02ca1a0709` unchanged.

The complete path/SHA/size Git-tree metadata was also examined for **exact duplicate SHA groups**: 62 groups of repeated tracked blobs larger than 100KB represent **53,092,288 logical bytes** beyond one path per group. This is **not** 53MB of additional stored Git objects (identical Git SHAs are already object-deduplicated), nor automatic deletion eligibility. High-volume duplicate consecutive PNGs appear under `safe-capture-supplement-20261021/.../native-unreviewed-samples/` and repeated CI953 `events.jsonl` snapshots occur across distinct packets. They carry temporal/provenance paths tied to OPEN/unreviewed motion, so **no deletion** was authorized from those groups. Canonical Blitzit comparison PNGs with repeated SHAs are source evidence and protected by actual provenance. Repeated timestamped PA frames may be deliberate independent event receipts even if pixels match.

**Aggregate checkout retirement PR445–456:** 19,296 old Narro paths / **5,556,168,183 logical bytes**. Neither current checkout deletion nor `[skip ci]` changes the shared Git history object store. PR456 had **no new exact-head 3/3 Windows CI** and **no new physical test**. Existing historical CI gate statuses remain unchanged.

## Pending qualified cleanup, not a blanket deletion queue

- **CI953**: original intervals and manifest paths explicitly have unresolved source/motion REVIEW_PENDING, OPEN or UNREVIEWED claims. Keep full originals until cases are resolved or exact replacement evidence is documented.
- **CI950**: actual native drag/menu/read-delay source diagnosis; full film not exhaustively reviewed. Do not retire merely because superseded.
- **capture57 / 2026-10-20**: partial/unanalysed 57-scenario acquisition, with distinct original multimedia/audio integrity and no replacement claim.
- **2026-10-24–30 physical/PR389/419/431/436/437**: original recordings can still support actual compositor/movement/monitor/Timer native acceptance and must be held.
- **PA351–356**: later accepted physical case evidence is *reused* by the final PA report; retiring these native originals may invalidate the best available physical baseline. Require explicit per-case unique-consumer confirmation first.
- **Mixed diagnostic ZIPs / PA-postfix / CI1046**: contain unique audio, raw traces, native/source-parity and sometimes unreviewed sequence context; assess exact named consumer and equivalent retained originals before deletion.

**ONE NEXT:** perform bounded consumer analysis on the next historical Narro original/ZIP **only if** no current acceptance/review/manifest depends on its unique content; use allowlisted PR/recovery commit/immutable receipt, otherwise mark HOLD and select a different independent family. Preserve all original Blitzit source media and never claim physical PASS from archival cleanup.
