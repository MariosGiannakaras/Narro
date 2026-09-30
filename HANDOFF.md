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

#### Validated / merged foundations

- Reporting history: PR #197 / CI #746 / merge `f7d6d995...` / main CI #748 **PASS**.
- Historical session mutations: PR #200 / CI #756 / merge `10e5a97a...` / main CI #757 **PASS**.
- Visual ready-marker harness: PR #201 / CI #762 / merge `ff4627e8...` / main CI #765 **PASS**.
- Overview aggregation: PR #199 exact head `3deec9c056e8ea449d96a9c2b9ac8572d7fabf9d`, CI #770 **PASS**, guarded merge `f165390da50879bb7ed9740da9033cce60132d6a`, resulting-main CI #772 **PASS**.
- Report history/session command API: PR #202 exact head `5c4ad3c1c44b5155a82b51480c8d0c7d3de5171f`, #769 failed-job rerun **PASS**, guarded merge `d835149371a880df5a3c4572f2815e714c37738c`, resulting-main CI #776 **PASS**.
  - #776 runtime artifact id `11118644987`, digest `sha256:6a279a7255d67d32037d94ff9476da1a40885dddc7a8709ce36ff08d5af0fe52`.
  - #776 visual artifact id `11118599648`, digest `sha256:312bc3018872d85cae6dcf5f4ac4a371811f909cf27fc44d353eba0f0e78d712`.

#### Reports Overview visual foundation — EXACT-HEAD + ARTIFACT ACCEPTED / UNMERGED

- PR #198 exact head `a0364a72b6c01c29d1e4d5b7ca44d2883d0e2dd7`.
- Windows CI #775 / run `36761834293`: **PASS**.
- visual artifact id `11118822894`, digest `sha256:39ad0150eda65f566dc2f1cc2ded45264f770f755f2a9f3af86a314ea176b764`.
- runtime artifact id `11119163993`, digest `sha256:9be79a1b269990c143cc2cc4f24a13143a1b2688c15b431c08b8efe18b269eda`.
- Mandatory review inspected all eight light/dark Reports captures and captured DOM. Overview, list filter, date picker and lower panels are visibly present; both lower captures now show the full `Time By List` and `Done Tasks` panels and carry the strict lower-viewport ready marker.
- Production UI is unchanged by the lower framing rule because only the fixture-only html data attribute activates it.
- Ready for guarded merge after the current #203 resulting-main gate settles, preserving serial main validation.

#### Sessions dashboard projection — MERGED / RESULTING-MAIN PENDING

- PR #203 exact validated head `59b7b2713505bdea7cf2521eaebd5f2bf164fb17`.
- Exact-head Windows CI #771: **PASS**.
- Guarded squash merge `f86c38102fa4516d6e2429aa26b63ceb8aabfe78`.
- Resulting-main Windows CI #777 / run `36769374384`: **IN PROGRESS**.
- Do not begin Sessions UI until #777 passes.

#### Overview aggregation command/API — ACTIVE

- PR #205: `feat/m9-overview-command`.
- Exact head `1588d48a3f273cef360028bd549be9a70dac9ef1`, intentionally based on validated main `d8351493...` so it does not depend on pending #203.
- Windows CI #778 / run `36769649192`: **IN PROGRESS**.
- Scope: `get_report_overview` delegating to validated `report_overview`; camelCase typed IPC DTOs; decimal-string serialization for all `u64` counts/accounting/durations; stable invalid-`displayTimezone` handling; typed renderer invoke; static preflight and lossless serialization regression.
- No SQL, timer/session mutation, schema/migration, Focus/window, polling, network or production UI changes.
- After #777 PASS, reconcile #205 with latest validated main before final exact-head validation/merge.

Current durable checkpoint: `work-log/2026-09-30-chatgpt-m9-visual-acceptance-and-overview-api.md`.


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

1. Inspect #777 on merged main `f86c3810...`. On PASS, record artifacts and treat #203 as fully validated.
2. Guarded-merge accepted PR #198 exact head `a0364a72...`, then validate its resulting main before marking the visual foundation merged.
3. Inspect PR #205 CI #778. Fix only evidence-backed failures. After #777 PASS, reconcile #205 with the latest validated main and require exact-head Windows CI before merge.
4. After #198 merge and #205 validation, implement production Overview wiring as the next narrow M9 slice.
5. Only after #203 resulting-main PASS, begin Sessions UI work.
6. Keep PR #192 at automated-green head `0ef80844...` until physical Windows access returns; Gate 7/Gate 12 remain open.

## USER ACTION REQUIRED

None currently. The user's Windows test system is unavailable. Do not request physical evidence again until the user says access has returned.
