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

- PR #197: `feat/m9-reporting-foundation`, independent of Focus/window mutation code.
- Initial exact head `2b01fe2467c83a860908acad2d9096b19fb2589c` failed Windows CI #745 / run `36738181054` **only** at `cargo fmt --check`.
- Formatting plus removal of obvious unused imports advanced PR #197 to exact head `041bdda72ab513d571d940e71a1e18d4027d009b`.
- The slice adds a read-only local reporting history model: RFC3339 range boundary, optional list filter, closed work/break session rows, completed-task rows, EST, Time Taken from work sessions plus manual adjustment, archived history visibility, and permanent-delete exclusion through existing cascade semantics.
- No timer/session mutation, Focus/window, schema/migration, or network behavior is changed.
- Do not accept/merge PR #197 until exact-head Windows CI passes.

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

1. Inspect live exact-head CI for PR #197 head `041bdda72...`. If it failed, fix only the exact evidence-backed preflight/compiler/test issue. If it passed, download/inspect relevant artifacts, then guarded-merge the exact validated head and validate resulting main before marking the M9 foundation slice complete.
2. Do not poll long-running CI continuously. While CI is running, continue only an independent M9 sub-slice whose correctness does not depend on the pending result; otherwise stop at the CI boundary.
3. Keep PR #192 at automated-green head `0ef80844...` unless new evidence justifies another source/test change. Before any such M7 change, reconcile latest `main` tracking truth into the branch and rerun exact-head Windows CI.
4. When physical Windows access returns, use the latest exact validated PR #192 artifact for Gate 7/Gate 12 plus reopened M1/M6 replacement acceptance: standard-motion Panel<->Timer and Expand<->Collapse continuity, selected-monitor/edge placement, 100%<->125% mixed-DPI crossing, topology recovery, geometry/scrollbar, performance, and task/session/time continuity.
5. Only after physical PASS finish replacement closure, guarded-merge PR #192, validate resulting main, and then reclose affected M1/M6/M7/M8 shortcut items.

## USER ACTION REQUIRED

None currently. The user's Windows test system is unavailable. Do not request physical evidence again until the user says access has returned.
