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


Latest corrected physical reassessment:
- exact #684 recording rechecked from zero: `2026-09-30 02-02-23.mp4`, SHA-256 `72360756a44ab94ac95aaf245beeadf1069fc91385268b68853bb17f570fd412`;
- persistent Narro vertical browser scrollbar is visible in settled compact and expanded Timer states (~18.4 s, ~25.8 s, ~27.8 s);
- during the ordinary 125%→100% drag, the target 100% Timer is already narrow while visible native height remains ~138 px around ~27.3–27.5 s, then settles to ~110 px by ~27.8 s;
- first Panel→Timer transition moves the same HWND from x≈4124 to x≈870 across ~3250 physical px in ~0.27 s with linear native stepping, then changes from ~340×110 to ~425×138 on the 125% display;
- these findings were not corrected by #695 because the post-#684 runtime delta changed WebView2 parent-move notification/tests, not Focus document overflow or the native motion policy;
- corrective direction: exact Focus-document overflow lock, WM_DPICHANGED visible-region refresh during interactive Timer drag while full recovery remains deferred, and eased finite native point-to-point motion;
- immutable evidence: `work-log/2026-09-30-chatgpt-m7-ci684-video-reassessment.md`.

Latest full programmatic/online M7 audit:
- exact current PR head `473af660566970ad4499eceda618abb8042f5f19`;
- Windows CI #695 / run `36680495272`: **PASS**;
- runtime artifact id `11082430041`, digest `sha256:0d1affdbbfd6beec4b9127190e4e9887a4ea6a516f683cf89276cdf135bede95`;
- visual artifact id `11081437955`, digest `sha256:e9bb288b980ed68d9f311f4fa602781a21bdcddb13e0ac06b6bd3e3648455f38`;
- Repository Preflight, frontend contracts/build, Rust fmt/check/clippy/tests, performance-harness self-test, Windows visual regression, reused frontend-dist verification, Tauri release and artifact uploads all passed;
- runtime implementation is unchanged from the automated-green #693 source; the only non-Markdown delta after #693 is a stricter static contract prohibiting direct Focus-position mutation outside the shared WebView2-aware helper;
- all programmatic Focus/Timer parent HWND moves route through that helper, which explicitly calls WebView2 `NotifyParentWindowPositionChanged()`;
- Tauri remains pinned to `~2.11.5` for native `with_webview` access;
- transition coverage includes animated-native rollback, renderer-failure rollback after animated native success, and 250 repeated deterministic Panel↔Timer cycles;
- online review confirms `NotifyParentWindowPositionChanged` is parent-movement notification rather than viewport-settlement acknowledgement; Wry also performs parent-position notification on Windows, so Narro's explicit helper is defense-in-depth, not claimed as the #679 root-cause fix;
- finite `SetWindowRgn` presentation changes remain preferable to high-frequency native region animation; the physically clean bounded 50 ms cross-DPI clipped-settle guard is retained;
- no radical architecture replacement is justified; the single persistent `focusSurface` remains the preferred design;
- immutable evidence: `work-log/2026-09-30-chatgpt-m7-online-audit-ci695.md`.
- PR #192 currently reports `mergeable=false` because authoritative tracking/evidence Markdown on `main` advanced after exact-head CI #695; no executable/runtime source changed on `main` in that reconciliation. Do not change the validated PR head merely to remove tracking drift while physical closure is unavailable. Before any future merge/source edit, reconcile current `main` truth into the branch and re-run exact-head automated validation because that reconciliation changes the PR commit SHA.

No progress counter advances from the hardening/CI alone. The strict physical gates remain unavailable because the user currently has no access to the Windows test environment.

## CURRENT VALIDATED APPLICATION SOURCE BASELINE

**`e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`**

This remains the fully merged/physically accepted application-source baseline (PREF-R01). PR #192 is not promoted to the validated baseline until its required physical gates pass, it is guarded-merged, and resulting-main validation/tracking reconciliation completes.

## EVIDENCE / AUDIT STATE

- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` is authoritative for finding disposition.
- `M7-PHYS-01` and `M7-PHYS-02` are `VALIDATION_OPEN / PHYSICAL ACCEPTANCE UNAVAILABLE`: #684 clears the known defect signatures and exact-head CI #695 validates the current hardened candidate, but no current physical environment exists to close the strict acceptance protocol.
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

1. Resume PR #192 on the same branch; do not merge the CI #695 candidate.
2. Reconcile current `main` tracking truth into the branch before source edits.
3. Fix only the newly evidenced #684 defects:
   - remove Focus document-level scrollbars without disabling intentional internal scrolling;
   - refresh the Timer native visible region immediately for the new DPI during an interactive `WM_DPICHANGED`, while keeping full host-size/position recovery deferred until `WM_EXITSIZEMOVE`;
   - replace linear native Panel↔Timer position interpolation with an eased finite point-to-point curve while retaining the one persistent `focusSurface`.
4. Add deterministic CSS/native/motion regression coverage.
5. Run exact-head Windows CI and record artifacts.
6. Physical closure remains unavailable until the user regains a Windows test environment; do not invent physical PASS.

## USER ACTION REQUIRED

None currently. The user has stated that the Windows test system is unavailable. Do not repeatedly request another recording until the user says physical access is available again.
