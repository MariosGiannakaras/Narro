# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains active.** The three defects reconfirmed from the exact #684 video reassessment are now source-corrected and automated-validated on PR #192, but the required physical Gate 7 + Gate 12 acceptance is still unavailable because the user currently has no access to the Windows test system.

- PR #192 remains **OPEN** on `plan/m7-single-focus`; do not merge it yet.
- Current exact PR head: `63bb20e9c32dcaffacf96c3bd5a6c52e9114b257`.
- Windows CI #708 / run `36688532688`: **PASS** on that exact head.
- Runtime artifact `narro-m1-runtime-harness-windows-x64`: id `11084209028`, digest `sha256:0082039e7ffefe48971f4398c2722643fad665cc8c69d7ffdaba3dda8dbfd51d`.
- Visual artifact `narro-m5-visual-regression`: id `11085410196`, digest `sha256:00782b19dd444efc42d0dc56268d9a598f38aac0fcdc0df546dbed8a4e289ff2`.
- Repository Preflight, frontend contracts/build, Rust fmt/check/clippy/tests, performance-harness self-test, Windows visual regression, reused frontend-dist verification, Tauri release and both required artifact uploads passed.
- `M7-PHYS-03`: the Focus document root now owns no scrolling (`:root/html/body/#root { overflow: hidden }`); intentional component-level scrolling remains intact.
- `M7-PHYS-02`: interactive `WM_DPICHANGED` now refreshes only the Timer native visible region from the incoming DPI immediately, while full host-size/position recovery remains deferred until `WM_EXITSIZEMOVE`.
- `M7-PHYS-01`: native Panel↔Timer point-to-point motion now uses the Fluent `cubic-bezier(0.55, 0.55, 0, 1)` easing contract, aligned with the renderer motion, instead of linear interpolation.
- Deterministic CSS/native/motion contracts cover the new overflow, DPI-region and easing behavior.
- No physical claim is made for #708. The last physical source remains #684 head `274cf727f4d5b693904c2ff10f3835224368c4e8`, whose reassessed video exposed the three defects now targeted by #708.
- The fully merged/physically accepted application-source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.
- This documentation checkpoint advances `main` only. Before any later source edit, physical test or merge, reconcile current `main` tracking truth into PR #192 and re-run exact-head Windows CI because the PR SHA will change.
- Immutable automated checkpoint: `work-log/2026-09-30-chatgpt-m7-ci708-overflow-dpi-easing.md`.

No progress counter advances from CI #708 alone. The strict physical gates remain OPEN/UNAVAILABLE, not PASS and not newly failed.

## CURRENT VALIDATED APPLICATION SOURCE BASELINE

**`e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`**

This remains the fully merged/physically accepted application-source baseline (PREF-R01). PR #192 is not promoted to the validated baseline until its required physical gates pass, it is guarded-merged, and resulting-main validation/tracking reconciliation completes.

## EVIDENCE / AUDIT STATE

- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` is authoritative for finding disposition.
- `M7-PHYS-01`, `M7-PHYS-02` and `M7-PHYS-03` are **IMPLEMENTED / AUTOMATED_VALIDATED / PHYSICAL_OPEN** on exact PR head `63bb20e9c32dcaffacf96c3bd5a6c52e9114b257` / Windows CI #708.
- The exact #684 physical recording remains the evidence that motivated these corrections; #708 has not been physically observed.
- Uploaded tutorial/source evidence and prior validated milestones remain unchanged.
- Gate 12 has a real user-confirmed 125% secondary-display scenario and must be physically exercised when the Windows environment becomes available again.

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

1. Keep PR #192 open and unmerged; do not start unrelated M8 work while the reopened M1/M6/M7 validation basis is still open.
2. Do not add another source patch without new evidence. The currently known #684 overflow/DPI/motion defects are implemented and automated-green on #708.
3. When physical Windows access becomes available again, first reconcile the latest `main` tracking Markdown into `plan/m7-single-focus`, then re-run exact-head Windows CI and use that newly validated artifact.
4. Run the remaining strict physical protocol on that exact build: complete the missing Panel→Timer→Panel and Expand→Collapse repetitions, ordinary 100%→125% drag, compact/expanded geometry, return-to-Panel viewport/scrollbar continuity, eased transition character, and task/session/time continuity.
5. Only after physical PASS: complete the remaining replacement performance/topology checks required by TODO, guarded-merge the exact validated PR head, validate resulting `main`, then reconcile roadmap/tracking state.

## USER ACTION REQUIRED

None currently. The user has stated that the Windows test system is unavailable. Do not repeatedly request another recording until the user says physical access is available again.
