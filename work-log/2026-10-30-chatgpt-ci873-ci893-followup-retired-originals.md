# Evidence retirement — superseded Narro CI873 and CI893 follow-up videos (2026-10-30)

Owner ChatGPT cleanup; parent main `c56f3176b6839ae7df43b3584594378941fe8939` after PR453.

Retired **five archived Narro full-length playback files** totaling **150,600,785 logical bytes** from current Git tree:

- `work-log/evidence/2026-10-03-m7-ci873-c5-completed/c5-continuous-dual-monitor.mp4`: 42,174,434 bytes.
- `work-log/evidence/m7-ci893-followup-20261003/video/part-000.mp4`, `part-001.mp4`, `part-002.mp4`, `part-003.mp4`: 108,426,351 bytes combined.

Only legacy CI873 and old CI893 follow-up *Narro* videos were removed. CI873's **three compact motion video excerpts** and **161 original PNG/JPG images** remain. CI893 follow-up retains **eight review images**, `manifest.json`, `video-provenance.json`, `frame-index.json`, `actions.jsonl`, `task-ledger.json`, historical results, logs and observations. Its full video was not the exact candidate for current PR389/419/437 Windows acceptance, and the original CI893 parent full video had already been retired under PR450.

No source Blitzit evidence was removed: protected `reference/` tree `46dea0c640cbfc17003acf439d96f503a5c39410` and `src/` `715f8a0acc5bab9a170d3c55d683f3dcb64d0e90`, `src-tauri/` `d15e3d16751fee44dc494b406235e482011022c5`, `tests/` `229d81ddd95bfae21db7c05e60452e02ca1a0709` are unchanged. The five path deletions are allowlisted; original media remains recoverable from parent commit `c56f3176b6839ae7df43b3584594378941fe8939`, without rewriting history. Historical manifests and result links remain frozen as dated snapshots and may reference pre-retirement paths.

This is evidence-only `[skip ci]`, not new Windows native acceptance. Do not delete CI953 unreviewed/OPEN source recordings merely because old; investigate and close their active consumer before retirement. All original Blitzit videos remain permanently protected.
