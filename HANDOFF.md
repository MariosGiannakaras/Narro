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

#### Overview aggregation — ACTIVE

- PR #199: `feat/m9-report-aggregation`.
- Current reconciled exact head checkpoint: `a95bd0319b5b03cab6119af135243c8b1b1d6146`.
- CI #753 first failed only rustfmt; CI #755 then reached tests and exposed a wrong fixture expectation: Tuesday had two focus sessions vs Monday one, so documented productive-day semantics require weekday-from-Monday `1`. The test was corrected, then current `main` was merged into the branch.
- CI #759 / run `36750257383` is **IN PROGRESS**. Do not merge until exact-head PASS and current main tracking is reconciled again if main has advanced.

#### Reports Overview visual foundation — ACTIVE / HARNESS-BLOCKED

- PR #198 exact source head checkpoint: `8039342e4a55ee21a83dbf20e9349fb103c5b1cc`.
- Preflight/frontend/Rust passed, but CI #752 failed twice before any Reports capture because pre-existing `task-scheduling-light` did not expose its explicit ready marker within two hosted-Edge captures.
- An unrelated later PR #200 visual run captured that same fixture successfully, confirming intermittent harness readiness rather than a scheduling or Reports source regression.
- Scope remains fixture-only/presentational until production wiring: pure Overview view, summary cards, accessible Tasks/Breaks/Total chart+tooltip, productive cards, Time By List, Done Tasks/punctuality, list filter, date picker, reduced-motion CSS, light/dark captures.
- Do not weaken Reports validation or merge #198 without actual Reports PNG/DOM artifact inspection.

#### Visual readiness harness — ACTIVE

- PR #201: `ci/visual-ready-retry-hardening`, source head checkpoint `f2aa19787800d8d889a6828ec8da712313f789ed`.
- Change is confined to `scripts/capture-visual-fixtures.ps1`: explicit ReadyMarker fixtures keep the same strict marker requirement but receive up to four bounded captures instead of two, with small retry-only backoff.
- CI #760 is **IN PROGRESS**.
- If #201 validates, merge it first, validate resulting main, then reconcile #198 with that main before exact-head Reports visual CI.


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

1. Inspect live CI #759 for PR #199 and CI #760 for PR #201. Fix only exact evidence-backed failures.
2. If #201 passes, expected-head merge it, validate resulting main, then reconcile PR #198 with that validated harness/main state and rerun exact-head Windows CI. On PASS, download and visually inspect every Reports Overview light/dark PNG and DOM capture before merge.
3. If #199 passes, reconcile any newer main tracking/source state, require exact-head CI on that reconciled head, then guarded merge and resulting-main validation.
4. Build the next M9 command/API layer from the latest validated main: Overview/history reads plus historical Sessions create/edit/delete must reuse #197/#200 authority, stable error codes and local-only SQLite. Do not mutate or duplicate the live timer authority.
5. Keep PR #192 at automated-green head `0ef80844...` until physical Windows access returns; Gate 7/Gate 12 remain open.

## USER ACTION REQUIRED

None currently. The user's Windows test system is unavailable. Do not request physical evidence again until the user says access has returned.
