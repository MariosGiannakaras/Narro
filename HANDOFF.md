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

- PR #200 exact validated head: `f2972e50eaa7e3008390544466598455e2cd16bd`.
- Windows CI #756 / run `36747066733`: **PASS**.
- Guarded squash merge: `10e5a97a703cff4d77141f548e66945cddda4956`.
- Resulting-main CI #757 / run `36750152569`: **PASS**; validation gate proved merged tree `7c5fe3cfc68f0af1c3cd0b112b571d004110603c` identical to the exact validated PR tree.
- #756 artifacts: runtime id `11113411940`, digest `sha256:e4decb648c8bc9d1ac0712dde2678796149375568e5a16f48ec2c113485b6ccf`; visual id `11113132388`, digest `sha256:b80c3d1db42bfe9bc9949bb3d362d4ded014d9fe433b57a0b4339dd132543b58`.
- Capabilities: manual closed work-session creation, stale-safe closed-session edit/delete, strict open/live-session protection, RFC3339/range/duration validation, immediate transactions, expected-`updated_at` guards and ledger-derived Time Taken reconciliation.
- No top-level M9 TODO item closes until command/UI/visual integration exists.
- Durable evidence: `work-log/2026-09-30-chatgpt-m9-session-mutations-validation.md`.

#### Overview aggregation — MERGED / RESULTING-MAIN VALIDATION PENDING

- PR #199 exact validated head: `3deec9c056e8ea449d96a9c2b9ac8572d7fabf9d`.
- Windows CI #770 / run `36756491555`: **PASS**.
- #770 artifacts: runtime id `11117162224`, digest `sha256:81d64afba163055cddbfcead54ad9c1d8daa69e2d5729b79f3d48a0e41ce7d26`; visual id `11116946922`, digest `sha256:69b2fc2d7d727d525c318819ed281fccc5f217d388244f28c8d4be9bec8613ec`.
- Expected-head guarded squash merge: `f165390da50879bb7ed9740da9033cce60132d6a`.
- Resulting-main Windows CI is still **PENDING / NOT VALIDATED**. Do not count this slice complete or expose the aggregate command until that gate passes.

#### Reports Overview visual foundation — ACTIVE / EXACT-HEAD REVALIDATION

- PR #198 head `5d037bca0cb3ee109e618b902edaa246362819f7` passed Windows CI #768 / run `36756417062`.
- Visual artifact id `11116733937`, digest `sha256:95c62588f6807cd8bcc181d2bf28be0d1cea855cc69bb4bf467e377cf605b5dd`; runtime artifact id `11116982150`, digest `sha256:62446c9dacd5ade6781b7c19a71a9880dcdf41842f2c9944a852f5ef08342fae`.
- Mandatory artifact review inspected all eight Reports light/dark PNGs and captured DOM files. Overview, list-filter and date-picker states were visually present, but both `reports-lower-*.png` images failed to show the lower `Time By List` / `Done Tasks` panels even though the DOM contained them. #198 was therefore **not merged**.
- Narrow fixture correction on the same branch now scrolls to the actual lower grid and publishes readiness only when the entire lower region is inside the viewport. Captured-DOM validation now requires `data-reports-lower-viewport-ready="true"`.
- Final corrected head: `7d3ab9369043424a0c35fb441a46e462c17330d8`.
- Windows CI #774 / run `36759587923` is **IN PROGRESS**. On PASS, download and inspect the fresh Reports PNG/DOM artifact again before merge.

#### Report command/API boundary — RETRY IN PROGRESS

- PR #202 exact head remains `5c4ad3c1c44b5155a82b51480c8d0c7d3de5171f`.
- Windows CI #769 / run `36756461300` initially failed before report-specific validation because pre-existing `task-scheduling-dark` did not expose its strict ready marker after four hosted-Edge captures.
- Repository preflight passed and no #202 source defect was established. Failed jobs were rerun without source changes; that rerun is **IN PROGRESS**.

#### Sessions dashboard projection — EXACT-HEAD GREEN / UNMERGED

- PR #203 exact head: `59b7b2713505bdea7cf2521eaebd5f2bf164fb17`.
- Windows CI #771 / run `36756524757`: **PASS**.
- Keep it unmerged until the already-merged #199 source checkpoint completes resulting-main validation, then guarded-merge #203 and validate resulting main before Sessions UI work.

#### Visual readiness harness — VALIDATED / MERGED

- PR #201 exact validated head: `61b4bf4b73a93b5166ce12255f86960ccb84bd5d`.
- Windows CI #762 / run `36751993652`: **PASS**.
- Guarded squash merge: `ff4627e8013c4bc6b30a79589b49a30cc5b09d22`.
- Resulting-main Windows CI #765 / run `36755450984`: **PASS**; validation gate reused the byte-identical already-validated PR tree and skipped duplicate build work.
- Strict ready-marker behavior is preserved; explicit-ready fixtures receive up to four bounded captures with retry-only backoff.
- Durable evidence: `work-log/2026-09-30-chatgpt-visual-ready-harness-validation.md`.

Durable checkpoint for the current parallel lanes: `work-log/2026-09-30-chatgpt-m9-parallel-ci774-checkpoint.md`.


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

1. Inspect the resulting-main Windows CI for merge `f165390d...`; record exact PASS/failure evidence before treating #199 as validated.
2. Inspect #774 on PR #198 final head `7d3ab936...`. On PASS, download the new visual artifact and verify both lower light/dark PNGs visibly contain `Time By List` and `Done Tasks`, while rechecking the other Reports states. Merge only after that artifact review passes.
3. Inspect the #769 rerun on PR #202. Fix source only if the rerun exposes an evidence-backed #202 defect; on PASS, guarded-merge the exact head and validate resulting main.
4. After #199 resulting-main validation is complete, guarded-merge PR #203 exact head `59b7b271...` and validate resulting main before Sessions UI work.
5. Keep PR #192 at automated-green head `0ef80844...` until physical Windows access returns; Gate 7/Gate 12 remain open.

## USER ACTION REQUIRED

None currently. The user's Windows test system is unavailable. Do not request physical evidence again until the user says access has returned.
