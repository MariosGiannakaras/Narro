# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains active.** Exact CI #679 physical evidence failed both strict gates, the resulting narrow sequencing correction is now automated-green on the same PR #192, and the next unresolved boundary is one exact-build physical Gate 7 + Gate 12 retest.

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

No progress counter advances until exact #684 physical Gate 7 and Gate 12 acceptance completes.

## CURRENT VALIDATED APPLICATION SOURCE BASELINE

**`e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`**

This remains the fully merged/physically accepted application-source baseline (PREF-R01). PR #192 is not promoted to the validated baseline until its required physical gates pass, it is guarded-merged, and resulting-main validation/tracking reconciliation completes.

## EVIDENCE / AUDIT STATE

- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` is authoritative for finding disposition.
- `M7-PHYS-01` and `M7-PHYS-02` remain `FIX_NOW / PHYSICAL RETEST OPEN`; automated CI #679 does not close them.
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

Analyze the next user recording against exact CI #684 runtime artifact id `11066497568`.

1. Gate 7: at least 3× Panel→Timer→Panel; reject any transparent/full-height host tail, white/blank host, spatial teleport, overlap or abrupt discontinuity.
2. Compact/expanded: at least 3× Expand→Collapse; reject stale expanded tails or clipping.
3. Gate 12: one ordinary drag to the user-confirmed 125% display; verify compact/expanded geometry and no repeated-push/snap-back behavior.
4. Return to Panel; reject any narrow stale viewport, horizontal/vertical browser scrollbar flash, clipping or offset content.
5. Confirm the same task/session/time.
6. If both gates PASS, record immutable evidence and continue guarded merge/resulting-main validation. If either fails, keep PR #192 open and fix only the observed exact-build failure signature.

Do not merge PR #192 before both physical gates pass.

## USER ACTION REQUIRED

Use only CI #684 exact runtime artifact id `11066497568` / source `274cf727f4d5b693904c2ff10f3835224368c4e8` for the next combined physical recording.
