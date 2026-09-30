# 2026-09-30 — PR #192 CI #684 corrective physical candidate

**Agent:** ChatGPT  
**PR:** #192 / `plan/m7-single-focus`  
**Exact source head:** `274cf727f4d5b693904c2ff10f3835224368c4e8`  
**Windows CI:** #684 / run `36640613105` — PASS  
**Runtime artifact:** id `11066497568`, digest `sha256:490940fd2becb63355725b420f3ac8079b3929f9287693a847bd3a2b4fc8b4f5`  
**Visual artifact:** id `11066094498`, digest `sha256:d4e0d31b472ba67281149187287e962d38b56eee991952d8fbf6364ce056c735`

## Why this candidate exists

Exact CI #679 physical evidence (`2026-09-30 01-11-12.mp4`) proved:
- Gate 7 saved-position teleport was fixed, but Panel→Timer still exposed the full transparent 340×700 host/outline below the moving Timer for multiple frames.
- Gate 12 one-drag movement to the user-confirmed 125% display and scaled Timer geometry were fixed, but cross-DPI Timer→Panel still briefly exposed a stale clipped viewport/browser scrollbars.

Immutable failure evidence:
`work-log/2026-09-30-chatgpt-m7-ci679-physical-fail.md`.

## Corrective delta

- Panel→Timer now applies the target Timer native region before finite native position motion begins.
- Cross-DPI Timer→Panel keeps the previous Timer region clipped while the host adopts the target monitor's physical DPI geometry.
- After a bounded 50 ms viewport-settlement interval, the full Panel region is revealed.
- Same-DPI Timer→Panel retains the existing continuous full-Panel reveal.
- Single persistent `focusSurface`, transparent document canvas, saved placement, rollback, authoritative timer/session state, and no ordinary hide/show/resize architecture are unchanged.
- Regression contracts assert the new sequencing.

CI #682 first exposed a static-test scoping defect; CI #683 then exposed only a rustfmt diff. Those non-behavioral issues were corrected without changing the functional sequencing described above.

## CI #684 evidence

PASS:
- validation gate;
- Repository Preflight;
- frontend contracts/build;
- Rust fmt/check/clippy/tests;
- performance harness;
- Windows visual regression;
- reused frontend-dist verification;
- Tauri release;
- diagnostic runtime artifact upload.

The downloaded runtime ZIP was independently hashed and exactly matched the GitHub artifact digest:
`sha256:490940fd2becb63355725b420f3ac8079b3929f9287693a847bd3a2b4fc8b4f5`.

## Physical validation state

Automated validation is PASS. Physical gates remain open until the exact #684 runtime is recorded:

- Gate 7: verify no transparent/full-height host tail, no white/blank host, and no position teleport through repeated Panel↔Timer cycles.
- Gate 12: verify one normal drag to the 125% display, correct compact/expanded geometry, and return to Panel with no clipped/stale viewport or browser scrollbar flash.
- Confirm task/session/time continuity.

No progress counter advances yet:

`4/10M || 2/5 | 11/19`

Do not merge PR #192 before both physical gates pass.
