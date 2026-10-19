# 2026-10-19 — RA01 actual Board drop correction, PR381 Windows PASS / merged

**Owner:** ChatGPT implementation from Codex's finalized 100/100 analytical dispositions, 18 media. Recorded RA01 physical old EXE FAIL theme1 PTS375.217/375.233 remains historical FAIL. No new physical run, install, native PA, Blitzit M11, user AppData or protected Spectrum Core changes.

**Branch:** fix/m5-ra01-drag-pending-visual-20261019; [PR381](https://github.com/MariosGiannakaras/Narro/pull/381), exact accepted head da54fd7999f37bdd287ac66acbd2bda8569ceaa9.
**Exact-head Windows [run39183551093](https://github.com/MariosGiannakaras/Narro/actions/runs/39183551093): validation SUCCESS, fast SUCCESS, windows-candidate SUCCESS (3/3)**. Native interactive Windows PA and local Node/Rust runs NOT RUN in this GitHub connector environment.
**Expected-head guarded squash merge:** 668818dfcfc64dc899e30c4613ff355f92317361, merged:true.

Changed executable/test file identity confirmed 4/4 identical PR head versus resulting merge:
- scripts/test-board-drop-visual-handoff.mjs: 5fdf10e0dac2382b233a3fea2bd82463789bbd97
- scripts/test-ui-task-reorder.mjs: b7ab7782fdceeeca1fd1f5cfd82029fe9ad64f27
- src/ListBoard.tsx: 5f066f8d05b154fb84cdcacdf0bebf781c664027
- src/boardTaskPointerDrag.ts: a1764eccb78b9b092643f6fdd5a1ce2c27de1703

The actual pointer holder now releases listeners/capture immediately but maintains its inert preview until Board's write and authoritative read settle; the source slot/drop placeholder likewise remains in the pending handoff. Persistence rejection restores source; committed write plus refresh failure stays fail-closed with reopen guidance and no second unsafe write. Actual production async mutation callback and pointer lifecycle are tested with deferred IPC in the mandatory reorder gate.

**Resulting-main push CI:** [run39185545730](https://github.com/MariosGiannakaras/Narro/actions/runs/39185545730), event:push, head 668818dfcfc64dc899e30c4613ff355f92317361, RUNNING/NOT YET PASS at initial verification; check final job outcomes and keep historical failed results separate.

**Next:** confirm resulting-main 3/3, then check [PR382 RA02](https://github.com/MariosGiannakaras/Narro/pull/382) exact final head and Windows gates, guarded merge if 3/3 and no semantic overlap; validate combined resulting-main. Actual latest-EXE RA01 native drag release normal/reduced and Blitzit exact motion remain OPEN. Milestones 4/10 accepted; no M10/M11/M12 activation or other-owner PR344 takeover.
