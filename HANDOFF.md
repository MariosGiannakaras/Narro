# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entries, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 corrective foundation remains active.** The single-`focusSurface` replacement is automated-green but unmerged; physical Gate 7 / Gate 12 evidence is unavailable.

### M7 / replacement chain

- PR #192 remains **OPEN / DO NOT MERGE** on `plan/m7-single-focus`.
- Exact automated-green head: `0ef808445b567a4a3194296ed1dccb5a6a58b03e`.
- Windows CI #744 / run `36737427034`: **PASS**.
- CI artifact evidence remains valid for reduced-motion packaged geometry: Panel 340×700, compact Timer 340×110, expanded Timer 340×300, one persistent Focus HWND/WebView, DPI/region checks, and no document/root scrollbar.
- User-provided physical recording `2026-09-30 23-13-14.mp4`, SHA-256 `eb3b862d58f69b1000f665d35dd52bf4d0703bfc1dda80f92c759de9c4809a1b`, was audited visually and semantically.
- **The recording is not accepted as final Gate 7 evidence.** Main visibly reports simultaneous Ctrl+Shift+T and Ctrl+Shift+P registration conflicts. Narro currently has no single-instance enforcement, so another Narro runtime is the strongest explanation and exact Focus-surface process ownership cannot be proven. Even if another app owned the chords, the recording still demonstrates the runtime-validity gap.
- **RISK-F009 / FIX_NOW:** prevent or safely redirect a second Narro instance so one process owns SQLite/background orchestration/global shortcuts.
- **B5 / FIX_NOW:** PR #192 changed Start Blitz semantics. Authoritative source says `Blitz now` opens Focus Panel; `present_focus_for_blitz` currently preserves an already-visible Timer and the rewritten test explicitly requires that wrong behavior. Restore Focus Panel entry without abandoning the single-host architecture.
- **B6 / FIX_NOW:** current first-party Blitzit Windows shortcut and Blitz Mode guides explicitly restrict Ctrl+Shift+T to Blitz Mode and define Floating Timer as current-task/countdown presentation. Idle/no-task Ctrl+Shift+T must not expose a placeholder Timer; it is a presentation no-op without timer/session mutation. Durable resolution: `work-log/2026-09-30-chatgpt-m7-b6-idle-toggle-semantics.md`.
- The physical recording positively confirms only limited non-final observations: empty Focus state is semantically correct; no-eligible Blitz entry does not surprise-start work; compact Timer is movable; sampled idle transitions show no obvious full-white host frame. It does **not** prove active-session continuity, expanded Timer continuity, mixed-DPI Gate 12, or exact candidate ownership.
- PR #192 is diverged/dirty relative to current main and must be reconciled with the latest validated main source before any new physical acceptance artifact.
- Latest fully validated current-main source checkpoint is now `f86c38102fa4516d6e2429aa26b63ceb8aabfe78` (PR #203 resulting-main Windows CI #777 PASS). Markdown-only commits after it do not replace the source SHA.
- Durable evidence: `work-log/2026-09-30-chatgpt-m7-ci744-physical-whole-app-audit.md`.

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
- Resulting-main Windows CI #777 / run `36769374384`: **PASS**.
- Runtime artifact id `11123510715`, digest `sha256:171e72d4da36d73ed1f5f471a78251e7690918a4eb3535cea47872408f91bd77`.
- Visual artifact id `11122989272`, digest `sha256:692415b0ba11d911ec8798b2b907f462efec0c74fd4df00a5ce4694837eebf35`.
- #203 is fully validated/merged. Sessions UI is technically unblocked, but new M7 FIX_NOW findings take priority before unrelated forward feature work.

#### Overview aggregation command/API — ACTIVE

- PR #205: `feat/m9-overview-command`.
- Exact head `1588d48a3f273cef360028bd549be9a70dac9ef1`, intentionally based on validated main `d8351493...` so it does not depend on pending #203.
- Windows CI #778 / run `36769649192`: **FAIL**. Do not change #205 until the exact failure is inspected after the active M7 FIX_NOW correction path is stabilized.
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

1. Inspect PR #206 exact head `ab1e89fcabc7b8385016a738603d41002f9c3b14`, Windows CI #784 / run `36780624064`. #783 intentionally generated the resolver diff; Cargo changed exactly one pre-existing lock dependency string (`windows_i686_gnullvm` -> `windows_i686_gnullvm 0.52.6`). Strict `--locked` is restored. Durable evidence: `work-log/2026-10-01-chatgpt-m7-single-instance-lock-reconciliation.md`.
2. On #784 PASS, expected-head guarded-merge #206 and require full resulting-main Windows CI because Cargo.toml/Cargo.lock changed. Record exact merge SHA and artifacts before promoting RISK-F009.
3. Reconcile that validated main plus current tracking truth into PR #192 using a normal two-parent merge commit (first parent old #192 head, second parent validated main), not a force-reset. Build the tree from validated main and reapply #192 M7 deltas. Semantic overlaps are constrained to `package.json`, `scripts/capture-visual-fixtures.ps1`, `src-tauri/src/lib.rs`, and combined Cargo inputs. Preserve M9 report modules/API, main 4-attempt/backoff visual readiness, #206 single-instance-first registration, and all #192 single-host source/harness.
4. Implement B5 on reconciled #192: source-confirmed `Blitz now -> Focus Panel` through the persistent coordinator. Visible Timer must receive a target-Panel coordinator request (deferred through hydration/transition if necessary); hidden host may be natively prepared as Panel before reveal. Rewrite the regression that currently protects Timer preservation.
5. Implement B6 on reconciled #192: native Ctrl+Shift+T must read `TimerService::snapshot()` before show/emit and require non-Idle state plus task binding. Idle/no-task is a presentation no-op; snapshot failure is reported through existing Focus-toggle diagnostics; running/paused/time-up/overtime/break remain eligible. Add defensive coordinator and static regression coverage without timer/session mutation.
6. Run exact-head Windows CI for reconciled #192, issue a fresh artifact, then physically retest with exactly one Narro runtime, an active task/session, repeated Panel↔Timer and Expand↔Collapse, and real 100%↔125% Gate 12 coverage.
7. M9 remains preserved: #198 exact-head/artifact accepted but unmerged; #203 fully validated/merged via main #777; #205 CI #778 failed and awaits evidence-backed diagnosis after the active M7 corrective chain.

## USER ACTION REQUIRED

None currently. Do not request another physical run until the corrected/reconciled M7 exact-head artifact is ready.
