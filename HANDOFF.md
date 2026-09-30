# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entries, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains active.** The single-`focusSurface` replacement is still unmerged and physical Gate 7 / Gate 12 evidence is unavailable. The latest PR #192 CI attempt added a packaged-runtime visual harness but failed in that harness before it could produce valid runtime screenshots.

- PR #192 remains **OPEN** on `plan/m7-single-focus`; do not merge it.
- Current exact PR #192 head: `12ec6471c2d2d63470c5ecab08ebc65748fc1e42`.
- Windows CI #718 / run `36695046828`: **FAIL** on that exact head.
- CI #718 passed Repository Preflight, frontend contracts/build, Rust fmt/check/clippy/tests, performance-harness self-test, Windows visual regression, reused frontend-dist verification, and the Tauri release build.
- CI #718 failed only at **Capture Packaged Focus Runtime**: `WebView2 DevTools targets did not become ready within 20000ms: TypeError: fetch failed`.
- Failed-run packaged-runtime artifact `narro-m7-focus-runtime-visual`: id `11088098271`, digest `sha256:1d7f00558925f2e67893b70019c660d88d19d747556b6684abd17aadec251b07`; it contains failure diagnostics, not accepted visual evidence.
- CI #718 visual-regression artifact `narro-m5-visual-regression`: id `11087997897`, digest `sha256:cd9618282b7f01c950b6413ffb5d07064e030321f201a1203a0244b8a823751e`.
- The last fully automated-green PR #192 source checkpoint remains exact head `63bb20e9c32dcaffacf96c3bd5a6c52e9114b257` / Windows CI #708, which implemented the overflow, interactive mixed-DPI region sync, and Fluent point-to-point easing corrections. #718 does not invalidate those earlier corrections; it means the newer runtime-capture candidate is not green.
- Physical acceptance is still **NOT RUN / UNAVAILABLE**. The last physical source remains #684 head `274cf727f4d5b693904c2ff10f3835224368c4e8`, whose recording exposed the three defects corrected by #708.
- The fully merged/physically accepted application-source baseline for the reopened M1/M6/M7 chain remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed` until the replacement passes its required gates and is merged/reconciled.

Independent M8 work exists and must not be confused with M7 closure:
- PR #193 / PREF-R02 finite reduced-motion-safe timer flash is **MERGED**. Exact PR head `2413de4f0e02daf829ffc753ca70b48a1e11712e` passed Windows CI #714 / run `36694484904`; squash merge/main source commit is `f1277a91f25068f4ec4818c0c14b27d2d3ca46fa`. All eight changed source/test blobs were verified identical between the validated PR head and merged source. PREF-R02 is therefore **VALIDATED**.
- PR #194 / PREF-R06 Windows-locale schedule presentation remains **OPEN**; exact head `354c6efcf62f66af0539bec085960bcafed7261c` passed CI #713. Do not count it complete before merge/current-main reconciliation.
- PR #195 / PREF-R03 notification-alert gating remains **OPEN**; exact head `edd7ee79c535df615ac8a897baa1c033152869aa` passed CI #715. Do not count it complete before merge/current-main reconciliation.

Deep Blitzit research reconciliation is durable:
- `RISK-F007`: fresh app launch must never implicitly create/start a timer session; dedicated regression still open.
- `RISK-F008`: live Notes/title edits must preserve the same authoritative task/session/accounting; dedicated integrated running-session continuity regression still open.
- Both are validation obligations, not currently reproduced Narro defects. See `work-log/2026-09-30-chatgpt-deep-osint-risk-reconciliation.md`.

No progress counter advances from CI #718 or the research reconciliation.

## CURRENT VALIDATED APPLICATION SOURCE BASELINE

**`e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed` for the reopened M1/M6/M7 replacement acceptance chain.**

PR #193/PREF-R02 is independently merged and automated-validated as described above, but it does not close or replace the open physical/architecture acceptance basis of PR #192.

## EVIDENCE / AUDIT STATE

- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` is authoritative for finding disposition.
- `M7-PHYS-01`, `M7-PHYS-02` and `M7-PHYS-03` remain **IMPLEMENTED / AUTOMATED_VALIDATED / PHYSICAL_OPEN** from exact #708 head `63bb20e9...`.
- PR #192 current head `12ec6471...` is **CI FAILED** because the newly added packaged-runtime screenshot harness could not connect to WebView2 DevTools; do not characterize that head as automated-green.
- Gate 12 still requires the real 125% secondary-display physical scenario when the Windows test environment becomes available.
- `RISK-F007` and `RISK-F008` are explicit `VALIDATION_OPEN` items for final reliability coverage.
- PREF-R02 is validated; PREF-R03 and PREF-R06 have green PR CI but remain unmerged/open.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains local-only Windows software with Tauri 2 + React/TypeScript, SQLite, and authoritative Rust/domain state.
- Runtime window composition remains only `main` + one persistent `focusSurface`.
- Focus Panel, compact Timer and expanded Timer remain presentations inside the same persistent Focus HWND/WebView.
- Ordinary Focus presentation changes do not create/destroy/hide/show/resize the Focus WebView.
- Focus/Floating presentation changes cannot reset, duplicate or independently advance a live session.
- Panel/Timer geometry remains 340×700, 340×110 and 340×300 logical respectively, DPI-aware through native visible-region handling.
- Transparent Focus document canvas remains required so region/clip transitions cannot expose an opaque host.
- Native presentation changes remain serialized and rollback-safe.
- Existing local-only product, persistence, task identity, scheduling, recurrence, accessibility, explicit-link activation, and timer/session authority invariants remain intact.
- PR #191 remains closed/unmerged historical evidence only.

## NEXT AGENT ACTION

1. Resume PR #192 first. Before changing source/test code, reconcile the latest `main` into `plan/m7-single-focus` because `main` now contains newer tracking plus merged PREF-R02.
2. Inspect and fix only the evidence-backed CI #718 packaged-runtime visual-harness failure: WebView2 DevTools target readiness/connection. Do not change product runtime behavior unless the harness investigation proves a product startup defect.
3. Run the narrow harness self-test/local checks available, then exact-head Windows CI. Require Repository Preflight, visual regression, Tauri release, packaged Focus runtime capture/validation and required artifact uploads to pass.
4. If the runtime capture becomes green, inspect its exact screenshots/metadata programmatically. Keep physical Gate 7/Gate 12 open; CI screenshots are supplemental and do not replace the real Windows physical protocol.
5. When physical Windows access returns, use the newest exact validated PR artifact for the remaining strict Panel↔Timer/Expand↔Collapse, 100%↔125%, geometry/scrollbar, eased-motion, topology, performance, and task/session/time continuity checks.
6. Only after physical PASS complete replacement performance/topology acceptance, guarded-merge the exact validated PR head, validate/reconcile resulting `main`, and then reclose affected M1/M6/M7/M8 shortcut items.
7. Independent PRs #194/#195 may be resumed only without displacing the active PR #192 failure. Reconcile them with current `main`, rerun exact-head CI after any SHA change, and merge only from validated heads.

## USER ACTION REQUIRED

None currently. The user's Windows test system is unavailable. Do not request physical evidence again until the user says access has returned.
