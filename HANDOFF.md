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

#### Reporting foundation — VALIDATED / MERGED

- PR #197 exact validated head: `041bdda72ab513d571d940e71a1e18d4027d009b`.
- Windows CI #746 / run `36739580536`: **PASS**.
- Expected-head guarded squash merge: `f7d6d995d2a402a04fa47b8fb781be8d1fbb6624`.
- Resulting-main Windows CI #748 / run `36741939684`: **PASS** on exact source commit `f7d6d995...`.
- #748 artifacts:
  - runtime harness id `11111680536`, digest `sha256:e31aeb4525023ccea67d205d12642f326a94f1ecfbb18a33f4564cc49b49a206`;
  - visual regression id `11110314443`, digest `sha256:1bf15cdf6ba8f5005156a3d2f5a37dcedca9568c6e3e467563857dc20dbc282b`.
- Read-only capabilities: typed RFC3339 range/filter boundary, closed work/break session rows, completed-task history, EST, Time Taken from work sessions + manual adjustment, archived-history retention, permanent-delete exclusion through existing cascade semantics.
- No timer/session mutation, Focus/window, schema/migration or network behavior changed.
- Durable evidence: `work-log/2026-09-30-chatgpt-m9-reporting-foundation-validation.md`.
- No top-level M9 TODO item is closed solely by this foundation.

#### Reports Overview visual foundation — ACTIVE

- PR #198: `feat/m9-reports-overview-visual`.
- CI #747 failed at Repository Preflight only because `src/reportsVisualFixture.tsx` used invalid TypeScript optional tuple syntax; visual capture never ran and no artifact was produced.
- The tuple typing was corrected with a named optional tuple type, and the branch was semantically reconciled with current validated M9 reporting source.
- Latest live exact head must be read from GitHub before work; do not trust the older `cd819b19...` checkpoint.
- Scope remains frontend-only until later production wiring: pure `ReportsOverviewView`, four metric cards, accessible Tasks/Breaks/Total chart + focus-readable tooltip, productive hour/day/month, Time By List, Done Tasks/punctuality, list-filter, two-month date picker, reduced-motion CSS, and light/dark Windows Edge fixtures.
- Fixture data is fixture-only; production report values must come from validated local reporting/aggregation logic.
- Require exact-head Windows CI, including Reports captured-DOM/PNG validation, then inspect the actual visual artifact before merge.

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

1. Resume PR #198 from its latest live exact head. Inspect the newest exact-head Windows CI. If it fails, fix only the evidence-backed compile/fixture/visual issue; if it passes, download and inspect all Reports Overview PNG/DOM captures before acceptance.
2. Before PR #198 merge, ensure the branch contains current `main` tracking truth and validated reporting foundation, then require exact-head CI on that reconciled head. Merge only with an expected-head guard and validate the resulting `main` source SHA.
3. After the visual foundation is validated/merged, production-wire the Overview to local reporting/aggregation in the next narrow M9 slice; do not leak fixture data into production.
4. Keep PR #192 at automated-green head `0ef80844...` unless new evidence justifies another M7 source/test change. Physical Gate 7/Gate 12 remain open.
5. When physical Windows access returns, use the latest exact validated PR #192 artifact for the remaining replacement physical matrix; only then merge/reclose affected M1/M6/M7/M8 items.

## USER ACTION REQUIRED

None currently. The user's Windows test system is unavailable. Do not request physical evidence again until the user says access has returned.
