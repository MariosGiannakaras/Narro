# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entries, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains active.** The single-`focusSurface` replacement is still unmerged and physical Gate 7 / Gate 12 evidence is unavailable. PR #192 was semantically reconciled with current main/PREF-R02 and revalidated through build/visual stages, but its packaged-runtime visual harness still fails before it can produce valid runtime screenshots.

- PR #192 remains **OPEN** on `plan/m7-single-focus`; do not merge it.
- Latest reconciled PR #192 candidate: exact head `3d5de00256a6ce7ec2bcd77bccad9f008839f2e5`, which semantically preserves the single-Focus replacement while carrying validated PREF-R02 and current repository tracking/work-log truth.
- Windows CI #720 / run `36704256369`: **FAIL** only at the packaged-runtime capture on that exact head. Repository Preflight, frontend contracts/build, Rust fmt/check/clippy/tests, performance-harness self-test, Windows visual regression, reused frontend-dist verification and Tauri release all passed first.
- Exact #720 failure: `WebView2 DevTools targets did not become ready within 20000ms: TypeError: fetch failed`, reproducing #718 after successful application build/startup. This is currently a CI harness/transport failure; no product-runtime defect is established by it.
- #720 packaged-runtime diagnostic artifact: `narro-m7-focus-runtime-visual`, id `11091398339`, digest `sha256:d62b0733619dd85daf91c05477286ec9699dcd11e946aebb2e940bbba53ffc7e`; it contains failure diagnostics, not accepted screenshots.
- #720 normal visual-regression artifact: `narro-m5-visual-regression`, id `11092010216`, digest `sha256:4441607340a4691df2f1e1a260e172ebf8d6bf87149a2d0dbdff93af85ea9e76`.
- The last fully automated-green PR #192 source checkpoint remains exact head `63bb20e9c32dcaffacf96c3bd5a6c52e9114b257` / Windows CI #708, which implemented the overflow, interactive mixed-DPI region sync, and Fluent point-to-point easing corrections. #718 does not invalidate those earlier corrections; it means the newer runtime-capture candidate is not green.
- Physical acceptance is still **NOT RUN / UNAVAILABLE**. The last physical source remains #684 head `274cf727f4d5b693904c2ff10f3835224368c4e8`, whose recording exposed the three defects corrected by #708.
- The fully merged/physically accepted application-source baseline for the reopened M1/M6/M7 chain remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed` until the replacement passes its required gates and is merged/reconciled.

Independent M8 work exists and must not be confused with M7 closure:
- PR #193 / PREF-R02 finite reduced-motion-safe timer flash is **MERGED**. Exact PR head `2413de4f0e02daf829ffc753ca70b48a1e11712e` passed Windows CI #714 / run `36694484904`; squash merge/main source commit is `f1277a91f25068f4ec4818c0c14b27d2d3ca46fa`. All eight changed source/test blobs were verified identical between the validated PR head and merged source. PREF-R02 is therefore **VALIDATED**.
- PREF-R03 notification-alert gating is **VALIDATED / MERGED**: PR #195 reconciled exact head `c3a09e3780871cea70d008ac540f8d62cb684be7` passed Windows CI #722 / run `36704515416`; guarded squash merge `1c9f2c7dc670fddcbf8cf687ca5b1945588eb01c` passed resulting-main CI #723 / run `36705536633`.
- PR #194 / PREF-R06 Windows-locale schedule presentation remains **OPEN**. Reconciled head `16ae996a478687ad3e61788e77de00159f4207c2`; CI #721 attempt 1 failed only the known task-scheduling visual-fixture readiness flake and attempt 2 is in progress. Reconcile again with current main after PREF-R03/tracking before any merge.

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
- PR #192 reconciled head `3d5de002...` is **CI FAILED** only because the packaged-runtime screenshot harness still cannot connect to WebView2 DevTools after preflight, visual regression and Tauri release succeed; do not characterize that head as automated-green.
- Gate 12 still requires the real 125% secondary-display physical scenario when the Windows test environment becomes available.
- `RISK-F007` and `RISK-F008` are explicit `VALIDATION_OPEN` items for final reliability coverage.
- PREF-R02 and PREF-R03 are validated/merged; PREF-R06 remains open and requires reconciliation/revalidation on current main.

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

1. Resume PR #192 first. Before the next source/test change, reconcile latest `main` again because main now contains merged PREF-R03 plus tracking that postdates reconciled head `3d5de002...`.
2. Fix only the reproduced CI #718/#720 packaged-runtime visual-harness transport failure. The executable builds and starts; current evidence is that WebView2 DevTools discovery never becomes reachable. Prefer CI-only WebView2 diagnostics/launch configuration (including isolated user-data directory and robust DevTools endpoint discovery) over any product-runtime behavior change.
3. Run the narrow harness contract checks, then exact-head Windows CI. Require Repository Preflight, visual regression, Tauri release, packaged Focus runtime capture/validation and required artifact uploads to pass.
4. If the runtime capture becomes green, inspect its exact screenshots/metadata programmatically. Keep physical Gate 7/Gate 12 open; CI screenshots are supplemental and do not replace the real Windows physical protocol.
5. When physical Windows access returns, use the newest exact validated PR artifact for the remaining strict Panel↔Timer/Expand↔Collapse, 100%↔125%, geometry/scrollbar, eased-motion, topology, performance, and task/session/time continuity checks.
6. Only after physical PASS complete replacement performance/topology acceptance, guarded-merge the exact validated PR head, validate/reconcile resulting `main`, and then reclose affected M1/M6/M7/M8 shortcut items.
7. PR #195 is complete. PR #194 may continue independently without displacing PR #192: reconcile it with latest current `main`, rerun exact-head CI after every SHA change, and merge only from a validated head.

## USER ACTION REQUIRED

None currently. The user's Windows test system is unavailable. Do not request physical evidence again until the user says access has returned.
