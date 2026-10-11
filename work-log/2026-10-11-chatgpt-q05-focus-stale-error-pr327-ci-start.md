# 2026-10-11 — independent Q05 stale Focus IPC error regression PR327, CI queued

**Context:** S0 historical 70/70 reviewed, independent 50 Markdown source coverage reverified with 50/50 unique files/log rows and 2 original SHA transcription errata L05/L40. Original A01–A14 source/CI 14/14 accepted; mandatory fully source/physical milestones 3/10. Post-audit narrowly defined PR campaign **4/6 accepted**: #322/#323/#324/#326 merged with exact CI and blob proof; #321 B49 other-agent-owned dark screenshot failure OPEN, #327 newly opened and NOT ACCEPTED. Physical Windows Codex user-paused, M10 blocked, optional M11 dormant. This log supplements `work-log/2026-10-11-chatgpt-independent-50-doc-verified-and-pr326-merged.md`.

**PR [#327](https://github.com/MariosGiannakaras/Narro/pull/327)** branch `audit/20261011-focus-stale-failure-epoch-test`, exact head **`ac12363892cc90ac17d70345df47b72ed4108272`**, base branch main source latest `12a8f2c322b2f7f393a814046893bb56c3f9f167`. This is a **test-only** single bounded Q05 stale-error interleaving, not new production functionality, and no overlap with other-agent #321.

**Two paths changed:**
- `src/m7IntegrationRegression.tsx`: extend original deferred `get_list_board_snapshot` Tauri mock to hold rejects as well as resolutions, remount actual `FocusPanel` with an initial read pending, deliver newer board invalidation result (including a visibly named new task), reject older initial IPC afterward, assert newer task still remains and obsolete error string never appears.
- `scripts/test-ui-focus-panel.mjs`: keep the actual mounted Q05 regression reachable in mandatory preflight via two source sentinel checks.

Existing `src/FocusPanel.tsx` revision and target identity fencing from accepted PR #309 remain untouched. No UI CSS, dialogs, native persistence, timer behavior, Blitzit source/pixels changed. This tests a **single stale error path**, not all rapid target switches, timer-change/mutation read inversions or native screen reader.

**Exact CI:** PR head `ac123638...` workflow [38116234747](https://github.com/MariosGiannakaras/Narro/actions/runs/38116234747) **QUEUED/NOT RUN at this checkpoint**. No local Node/Rust/Windows tool run with GitHub connector. Do not increment 4/6 or merge until validation/fast/windows-candidate all SUCCESS at same head, guarded expected-head merge and 2/2 accepted blob match to resulting main; investigate exact failure logs if any.

**Next:** check this run when its result is needed and meanwhile only independent work; preserve #321 independent owner (head `f129c37b30b27897971f3aa8452c563f8f955111`, run `38092529298` Windows dark B49 failure) and do not claim B49 PASS. After #321 correction and PR327 accepted, Q12 one latest combined-main Windows production candidate with downloaded ZIP, `narro.exe` and installer SHA256; physical Windows gated/user-paused.
