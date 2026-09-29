# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains active.** Exact CI #679 physical evidence failed both strict gates, a narrow sequencing correction is implemented on the same PR #192, and Windows CI #682 is pending on the new exact head.

- PR #192 remains **OPEN** on `plan/m7-single-focus`.
- Last physically tested source: `c0be4ec0fe94863182bbf0d2e1ba4931ada67d93`.
- CI #679 / run `36630411679`: automated PASS, physical Gate 7 + Gate 12 FAIL.
- #679 runtime artifact id `11065275562`, digest `sha256:8b50e089fdaf6e5eaf572dd2b469eac42a521a8ea447c4532161edbc35163400`.
- Physical recording: `2026-09-30 01-11-12.mp4`, SHA-256 `e128d5fb08392f08312d237a9dab2a6d0d75a50611ac34331aa7454077a69642`, H.264 4480×1080 @ 60 fps, 58.483 s.
- Gate 7: position teleport is fixed, but Panel→Timer exposes the full transparent 340×700 host/outline under the moving compact surface for multiple frames (~40.70–40.90 s and repeated later).
- Gate 12: one normal drag now crosses to the user-confirmed 125% display and Timer geometry is correct (~425×138 compact / ~425×375 expanded), but Timer→Panel return still briefly exposes a narrow stale viewport/browser scrollbar state (~53.50–53.60 s; same family around ~21.9–22.1 s).
- Task/session `fas` and elapsed-time continuity remain intact.
- Immutable physical failure evidence: `work-log/2026-09-30-chatgpt-m7-ci679-physical-fail.md`.

Current unvalidated corrective candidate:
- exact head `8a60e92e47ae407098a1f3170ae4170848d262eb`;
- Panel→Timer clips to target Timer region before native position motion;
- cross-DPI Timer→Panel keeps the previous Timer region clipped through target-size correction, waits bounded 50 ms viewport settlement, then reveals full Panel;
- same-DPI Timer→Panel keeps the existing continuous reveal;
- regression contracts enforce this sequencing;
- Windows CI #682 / run `36639559040`: **PENDING**.

No progress counter advances from this implementation until exact-head automated validation and physical acceptance complete.

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

1. Check Windows CI #682 / run `36639559040` first.
2. If CI fails, inspect only the exact failure and fix evidence-backed issues on PR #192.
3. If CI passes, download the exact runtime artifact and request one combined physical recording:
   - 3× Panel→Timer→Panel;
   - 3× compact Expand→Collapse;
   - one normal drag to the 125% display;
   - compact/expanded checks there;
   - return to Panel.
4. Reject any transparent/full-height host tail, white/blank host, spatial teleport, repeated-push drag behavior, stale viewport, clipping, or browser scrollbar flash.
5. Confirm the same task/session/time.
6. Only after both gates pass may guarded merge/resulting-main validation proceed.

Do not merge PR #192 before both physical gates pass.

## USER ACTION REQUIRED

None while CI #682 is pending. After it passes, use only its exact runtime artifact for the next combined physical recording.
