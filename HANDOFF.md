# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entries, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains active.** The single-`focusSurface` replacement is automated-green but unmerged; physical Gate 7 / Gate 12 evidence is unavailable.

### M7 / replacement chain

- PR #192 remains **OPEN / DO NOT MERGE** on `plan/m7-single-focus`.
- Exact automated-green PR head: `0ef808445b567a4a3194296ed1dccb5a6a58b03e`.
- Windows CI #744 / run `36737427034`: **PASS** on that exact head.
- Passed: Repository Preflight, frontend contracts/build, Rust fmt/check/clippy/tests, Windows visual regression, Tauri release, packaged Focus runtime capture/validation, runtime harness upload and visual artifact uploads.
- Packaged runtime artifact `narro-m7-focus-runtime-visual`: id `11109291010`, digest `sha256:45994931d9e19d13c1ccff62634b2b616c62c59222bd2d26f02e1a278a9b9da9`.
- Runtime harness artifact: id `11109560929`, digest `sha256:6b848df39993108d8102cd75265692ce824ec3d592d569170285b60d67ee2fef`.
- Visual-regression artifact: id `11107169960`, digest `sha256:14b0dbc5f68995190a62079625b1a3189efbbd69f7ba899f07a726db75fc8503`.
- Downloaded artifact inspection confirms settled Panel 340x700, compact Timer 340x110, expanded Timer 340x300, correct native region/DPI metadata, and no document/root scrollbar.
- The hosted runner reports `prefers-reduced-motion: true`. High-frequency HWND samples therefore correctly show only start/end positions for the reduced-motion path. This **does not** prove the standard ~250 ms motion character.
- Physical Gate 7 / Gate 12 remain **NOT RUN / UNAVAILABLE**. Do not reclose affected M1/M6/M7/M8 shortcut items or merge PR #192 from CI #744 alone.
- Fully merged/physically accepted replacement-chain baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.
- Durable evidence: `work-log/2026-09-30-chatgpt-m7-ci744-packaged-runtime-pass.md`.

### Parallel M9

User explicitly authorized safe M9 work in parallel while M7 is physically blocked.

#### Reporting history foundation — VALIDATED / MERGED

- PR #197 exact head `041bdda72ab513d571d940e71a1e18d4027d009b` passed Windows CI #746.
- Guarded squash merge `f7d6d995d2a402a04fa47b8fb781be8d1fbb6624`; resulting-main CI #748 **PASS**.
- Read-only typed range/list history, closed work/break rows, completed-task rows, archived-history retention and permanent-delete exclusion are established.
- Durable evidence: `work-log/2026-09-30-chatgpt-m9-reporting-foundation-validation.md`.

#### Historical Sessions mutation persistence — VALIDATED / MERGED

- PR #200 exact validated head `f2972e50eaa7e3008390544466598455e2cd16bd`.
- Windows CI #756 / run `36747066733`: **PASS**.
- Guarded squash merge `10e5a97a703cff4d77141f548e66945cddda4956`.
- Resulting-main CI #757 / run `36750152569`: **PASS**.
- Manual closed work-session creation, stale-safe closed-session edit/delete, live/open-session protection and ledger-derived Time Taken reconciliation are established.
- Durable evidence: `work-log/2026-09-30-chatgpt-m9-session-mutations-validation.md`.

#### Overview aggregation — VALIDATED / MERGED

- PR #199 exact head `3deec9c056e8ea449d96a9c2b9ac8572d7fabf9d`.
- Windows CI #770 / run `36756491555`: **PASS**.
- Expected-head guarded squash merge `f165390da50879bb7ed9740da9033cce60132d6a`.
- Resulting-main Windows CI #772 / run `36759460205`: **PASS**.
- Main runtime artifact id `11118855812`, digest `sha256:7070fd9a533549707314cfa789c5d1f3277ebf50c9e49cb2dc6da398cd64ed56`.
- Main visual artifact id `11118267950`, digest `sha256:217c2372efef8333669b4156262cf65b64a231f89ac582fe80eab93e6eb8d6cd`.
- Validated backend capability: Overview summary metrics, daily Tasks/Breaks/Total series, productive hour/day/month, Time By List, Done-task timing/punctuality, timezone/DST grouping and fail-closed edge handling.
- User-facing Overview integration remains open.

#### Report command/API boundary — MERGED / RESULTING-MAIN VALIDATION PENDING

- PR #202 exact head `5c4ad3c1c44b5155a82b51480c8d0c7d3de5171f`.
- Windows CI #769 / run `36756461300`: initial hosted-Edge ready-marker failure only; failed-job rerun on the same head **PASS**.
- Expected-head guarded squash merge `d835149371a880df5a3c4572f2815e714c37738c`.
- Resulting-main Windows CI #776 / run `36762102643`: **IN PROGRESS**.
- Do not count renderer accessibility validated until #776 passes.

#### Reports Overview visual foundation — ACTIVE / SECOND ARTIFACT CORRECTION

- PR #198 head `7d3ab9369043424a0c35fb441a46e462c17330d8` passed CI #774 / run `36759587923`.
- #774 visual artifact id `11119035534`, digest `sha256:3572fa1cd573e18dfdf6092c4e8d35ce4da92001eb8ae46233e21de46054d0e8`.
- Fresh artifact review still rejected merge: lower-mode DOM carried the expected readiness/panel markers, but both actual 1280x720 PNGs showed only the upper edge of the lower panels because the document had insufficient scroll range.
- New fixture-only CSS correction hides only the already separately captured metrics/chart when `html[data-reports-fixture-mode="lower"]` is present, so productive cards plus the complete lower grid fit in the initial viewport. Production never sets this attribute.
- Exact new head `a0364a72b6c01c29d1e4d5b7ca44d2883d0e2dd7`.
- Windows CI #775 / run `36761834293`: **IN PROGRESS**.
- Even on PASS, #198 still requires fresh PNG/DOM artifact inspection before merge.

#### Sessions dashboard projection — EXACT-HEAD GREEN / UNMERGED

- PR #203 exact head `59b7b2713505bdea7cf2521eaebd5f2bf164fb17`.
- Windows CI #771 / run `36756524757`: **PASS**.
- Keep unmerged until #202 resulting-main validation settles, then guarded-merge #203 and validate resulting main before Sessions UI.
- The shared `src-tauri/src/lib.rs` edits are additive/non-semantic: #202 adds `report_commands` and command registrations; #203 adds `session_reporting`.

#### Visual readiness harness — VALIDATED / MERGED

- PR #201 exact validated head `61b4bf4b73a93b5166ce12255f86960ccb84bd5d`.
- Windows CI #762 / run `36751993652`: **PASS**.
- Guarded squash merge `ff4627e8013c4bc6b30a79589b49a30cc5b09d22`.
- Resulting-main CI #765 / run `36755450984`: **PASS**.
- Strict ready-marker behavior remains intact with bounded retries.

Current durable checkpoint: `work-log/2026-09-30-chatgpt-m9-ci772-command-merge-visual-reframe.md`.


### Independent M8

- PREF-R02, PREF-R03 and PREF-R06 are validated/merged.
- PREF-R05 remains asset-evidence blocked.
- Affected in-app/global Focus shortcut closure remains coupled to final M7 replacement validation.

### Reliability obligations

- `RISK-F007`: no implicit timer/task start on fresh launch — validation open for M10.
- `RISK-F008`: live Notes/title edits preserve authoritative running session/accounting — validation open for M10.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains local-only Windows software with Tauri 2 + React/TypeScript, SQLite, and authoritative Rust/domain state.
- Runtime window composition remains only `main` + one persistent `focusSurface`.
- Focus Panel, compact Timer and expanded Timer remain presentations inside the same persistent Focus HWND/WebView.
- Ordinary Focus presentation changes do not create/destroy/hide/show/resize the Focus WebView.
- Focus/Floating presentation changes cannot reset, duplicate or independently advance a live session.
- Logical presentation geometry remains 340x700, 340x110 and 340x300 and is DPI-aware through native visible-region handling.
- Transparent Focus document roots remain required; no browser document scrollbar may appear.
- Native presentation changes remain serialized and rollback-safe.
- M9 reporting is read-only over existing authoritative task/session persistence until explicit later M9 editing slices.
- Existing persistence-first task identity, scheduling/recurrence, accessibility, explicit-link activation, and timer/session authority invariants remain intact.
- PR #191 remains closed/unmerged historical evidence only.

## NEXT AGENT ACTION

1. Inspect #776 on merged main `d8351493...`. On PASS, record artifacts and treat #202 as validated.
2. Inspect #775 on PR #198 head `a0364a72...`. On PASS, download the new visual artifact and visually verify every Reports light/dark capture, especially complete `Time By List` and `Done Tasks` visibility in both lower PNGs. Merge only after that review passes.
3. After #776 PASS, guarded-merge PR #203 exact head `59b7b271...` and validate its resulting main before Sessions UI work.
4. After #198 visual acceptance/merge and #202 validation, extend the production Overview wiring from the validated aggregation/history APIs; do not leak fixture data into production.
5. Keep PR #192 at automated-green head `0ef80844...` until physical Windows access returns; Gate 7/Gate 12 remain open.

## USER ACTION REQUIRED

None currently. The user's Windows test system is unavailable. Do not request physical evidence again until the user says access has returned.
