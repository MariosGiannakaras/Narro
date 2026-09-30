# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains active.** Exact CI #684 physical evidence cleared both previously observed #679 defect signatures. Because the user currently has no access to the Windows test system, the missing strict repetitions/direction cannot be physically recorded. PR #192 has therefore received an additional programmatic/WebView2 hardening pass and is automated-green on exact Windows CI #693; formal Gate 7 + Gate 12 physical acceptance remains OPEN/UNAVAILABLE, not failed.

- PR #192 remains **OPEN** on `plan/m7-single-focus`.
- Last physically tested source: `c0be4ec0fe94863182bbf0d2e1ba4931ada67d93`.
- CI #679 / run `36630411679`: automated PASS, physical Gate 7 + Gate 12 FAIL.
- Physical recording: `2026-09-30 01-11-12.mp4`, SHA-256 `e128d5fb08392f08312d237a9dab2a6d0d75a50611ac34331aa7454077a69642`, 4480×1080 @ 60 fps, 58.483 s.
- Gate 7 #679: saved-position teleport fixed, but Panel→Timer exposed the full transparent 340×700 host/outline below the moving Timer for multiple frames (~40.70–40.90 s and repeated later).
- Gate 12 #679: one normal drag reached the user-confirmed 125% display with correct ~425×138 / ~425×375 Timer geometry, but cross-DPI Timer→Panel still briefly exposed a stale clipped viewport/browser scrollbar state (~53.50–53.60 s; same family ~21.9–22.1 s).
- Same task/session `fas` and elapsed-time continuity remained intact.
- Immutable failure evidence: `work-log/2026-09-30-chatgpt-m7-ci679-physical-fail.md`.

Current exact corrective candidate:
- source head `274cf727f4d5b693904c2ff10f3835224368c4e8`;
- Windows CI #684 / run `36640613105`: **PASS**;
- runtime artifact id `11066497568`, digest `sha256:490940fd2becb63355725b420f3ac8079b3929f9287693a847bd3a2b4fc8b4f5`;
- visual artifact id `11066094498`, digest `sha256:d4e0d31b472ba67281149187287e962d38b56eee991952d8fbf6364ce056c735`;
- downloaded runtime ZIP hash independently matches the GitHub digest;
- Panel→Timer clips to target Timer region before native position motion;
- cross-DPI Timer→Panel keeps the previous Timer region clipped through target host DPI-size correction, waits bounded 50 ms viewport settlement, then reveals the full Panel;
- same-DPI Timer→Panel keeps the existing continuous reveal;
- CI #682 failed only a new static-test scoping assertion; CI #683 then failed only rustfmt; both non-behavioral issues were corrected before final exact-head CI #684 PASS;
- immutable candidate evidence: `work-log/2026-09-30-chatgpt-m7-ci684-corrective-candidate.md`.

Latest exact #684 physical retest:
- recording `2026-09-30 02-02-23.mp4`, SHA-256 `72360756a44ab94ac95aaf245beeadf1069fc91385268b68853bb17f570fd412`, H.264 4480×1080 @ 60 fps, 37.516667 s;
- three Panel→Timer transitions are clean: no #679 transparent/full-height host tail, no white/blank host, no teleport or overlap;
- only two complete Panel→Timer→Panel cycles are present, so the strict 3-cycle Gate 7 batch is still incomplete;
- two complete Expand→Collapse cycles are clean; one additional complete cycle is still required by the batch protocol;
- 125% Timer geometry is correct at approximately 425×138 compact / 425×375 expanded;
- cross-DPI Timer→Panel return no longer exposes the #679 stale WebView viewport/browser scrollbars; the previous Timer region stays clipped only for the intended bounded ~50 ms settle before full Panel reveal;
- one ordinary cross-monitor drag is clean with no repeated push/snap-back, but this recording captures 125%→100%, while the strict protocol still requires one ordinary drag to the 125% display;
- same task/session `fas` and elapsed-time continuity remain intact;
- immutable evidence: `work-log/2026-09-30-chatgpt-m7-ci684-physical-partial-pass.md`.


Latest programmatic hardening:
- exact source head `22e86c5788416ebbdf249c123baf549b1820b10b`;
- Windows CI #693 / run `36678327585`: **PASS**;
- runtime artifact id `11080808573`, digest `sha256:ff04c3fbaf66a95c00d486ea08d66ff7f21fc8fabf27c980d9b7ebce3eb30b3c`;
- visual artifact id `11081246096`, digest `sha256:871dc6a5ccf186e7a7ee069ede1fc76c2d23ec0d3e5a94249164174e805317d7`;
- all programmatic Focus/Timer parent HWND moves now route through one helper that explicitly calls WebView2 `NotifyParentWindowPositionChanged()`;
- Tauri is pinned to `~2.11.5` because the implementation intentionally uses native `with_webview` access;
- transition tests now include animated-native rollback, renderer-failure rollback after animated native success, and 250 repeated deterministic Panel↔Timer cycles;
- CI #691 failed only rustfmt; CI #692 failed only two Rust borrow-shape errors; both were corrected before #693 and neither was a behavioral failure;
- no radical architecture replacement is justified by current evidence; the single persistent `focusSurface` remains the preferred design;
- immutable evidence: `work-log/2026-09-30-chatgpt-m7-programmatic-hardening-ci693.md`.

No progress counter advances from the hardening/CI alone. The strict physical gates remain unavailable because the user currently has no access to the Windows test environment.

## CURRENT VALIDATED APPLICATION SOURCE BASELINE

**`e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`**

This remains the fully merged/physically accepted application-source baseline (PREF-R01). PR #192 is not promoted to the validated baseline until its required physical gates pass, it is guarded-merged, and resulting-main validation/tracking reconciliation completes.

## EVIDENCE / AUDIT STATE

- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` is authoritative for finding disposition.
- `M7-PHYS-01` and `M7-PHYS-02` are `VALIDATION_OPEN / PHYSICAL ACCEPTANCE UNAVAILABLE`: #684 clears the known defect signatures and #693 adds automated WebView2/DPI hardening, but no current physical environment exists to close the strict acceptance protocol.
- Uploaded tutorial/source evidence and prior validated milestones remain unchanged.
- Gate 12 now has a real user-confirmed 125% secondary-display test environment, so it must be physically exercised rather than left NOT RUN.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains local-only Windows software with Tauri 2 + React/TypeScript, SQLite, and authoritative Rust/domain state.
- Runtime window composition remains only `main` + one persistent `focusSurface`.
- Focus Panel, compact Timer and expanded Timer remain presentations inside the same persistent Focus HWND/WebView.
- Ordinary Focus presentation changes do not create/destroy/hide/show/resize the Focus WebView.
- Focus/Floating presentation changes cannot reset, duplicate or independently advance a live session.
- Panel/Timer geometry remains 340×700, 340×110 and 340×300 logical respectively, DPI-aware through native visible-region handling.
- Transparent Focus document canvas remains required so region/clip transitions cannot expose an opaque host.
- Native presentation changes remain serialized and rollback-safe.
- Existing local-only product, persistence, task identity, scheduling, recurrence, accessibility and explicit-link-activation invariants remain intact.
- PR #191 remains closed/unmerged historical evidence only.

## NEXT AGENT ACTION

1. Treat PR #192 exact head `22e86c5788416ebbdf249c123baf549b1820b10b` / Windows CI #693 as the current automated-green M7 source candidate.
2. Do not add more transition/DPI code without new evidence; the #684 physical defect signatures are cleared and the parent-move synchronization gap is now hardened.
3. Do not revive the split Timer WebView architecture from PR #191.
4. Keep Gate 7 + Gate 12 physical acceptance explicitly OPEN/UNAVAILABLE while no suitable Windows environment exists; do not invent a PASS.
5. Do not merge PR #192 while the repository's physical-before-merge rule remains in force.
6. If a physical environment becomes available later, only a short exact-current-build supplemental batch is needed. If a new exact-build defect appears, fix only that observed signature.
7. If implementation proceeds elsewhere in the roadmap while the manual gate is unavailable, preserve this blocker explicitly and do not count/reclose the affected milestones prematurely.

## USER ACTION REQUIRED

None currently. The user has stated that the Windows test system is unavailable. Do not repeatedly request another recording until the user says physical access is available again.
