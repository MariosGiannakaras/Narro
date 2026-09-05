# STATUS.md

Last updated: 2026-09-05

For zero-context AI continuation, start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 3 — Timer/session engine.**

Milestone 1 Windows desktop capability/performance Gate A is validated. Milestone 2 domain/persistence Gate B is validated. The selected architecture remains Tauri 2 + React/TypeScript + Rust + SQLite on Windows 10/11 x64, with normally two persistent webviews only:

- `main`;
- `focusSurface`, reused for Focus Panel and Floating Timer.

Product UI should still not be polished yet. Milestones 3–4 establish the correctness-critical timer/session, scheduling, recurrence, reminder and persistence foundations before the screenshot-driven UI milestones.

## Gate A — Windows desktop viability

**Result: PASS / proceed with current Tauri 2 + WebView2 architecture.**

The evidence does not justify a native Win32/WinUI Floating Timer rewrite at this stage. The native overlay remains a measured fallback only if later real Floating Timer UI materially regresses CPU/memory or exposes a concrete WebView2 limitation.

Latest physical evidence:

- `work-log/2026-09-03-chatgpt-m1-physical-capability-results.md`;
- `work-log/2026-09-03-chatgpt-autostart-restart-validation.md`.

## Physically proven on real Windows

Observed PASS:

- authoritative Rust state/event propagation between `main` and `focusSurface` in both directions;
- hide/show `main`;
- destroy `main` while Rust runtime / `focusSurface` continue running;
- mutate authoritative Rust state while `main` is absent;
- async `main` recreation without the historical Windows WebView2 deadlock;
- exact authoritative Rust state appears correctly in the recreated `main`;
- `focusSurface` remains responsive after recreation;
- Focus Panel -> Floating Timer -> Focus Panel reuses the same secondary webview;
- Floating Timer always-on-top behavior;
- Floating Timer skip-taskbar behavior;
- only `main` and `focusSurface` remain as persistent webviews;
- tray/background recovery and explicit Quit;
- selected-monitor Focus Panel left/right positioning;
- display disconnect/reconnect recovery without restarting Narro;
- global shortcut physical behavior;
- visible Windows notification delivery from installed Narro;
- autostart enable/disable registration behavior visible in Windows Task Manager Startup apps;
- actual Narro autostart launch after a real Windows restart, with `main` open normally after sign-in;
- three valid floating-only steady-state process-tree performance runs with `main` destroyed.

## Native capability implementation evidence

### Tray/background lifecycle

Persistent tray, Show/Recreate Narro, Show Focus Surface, explicit Quit and tray left-click recovery are implemented and physically validated.

### Monitor enumeration and positioning

Monitor descriptors/work areas/scale, stable monitor selection, negative desktop coordinates and selected-monitor left/right Focus Panel placement are implemented, automated-tested and physically validated.

### Display topology / off-screen recovery

Event-driven `WM_DISPLAYCHANGE`, persistent `focusSurface` observation, deferred/coalesced recovery and visible-work-area clamping are implemented and physically validated for disconnect/reconnect recovery. Windows CI #54 / run `33683913556`: SUCCESS.

### Global shortcut

Merged PR #4 / merge `fce2bbf65ab07d50a6928605c00fb694079739a0`.

Native `RegisterHotKey` / `UnregisterHotKey`, `Ctrl+Shift+B` + `MOD_NOREPEAT`, persistent-HWND `WM_HOTKEY` handling, idempotent registration/unregistration and conflict diagnostics are automated-validated and physically validated.

Windows CI #63 / run `33720583395`: SUCCESS. Artifact ID `9880361708`, digest `sha256:137b43b1cd62fcacfa0261b496b591cc492d4d0c2193a2dfbab60b34f9836680`.

### Local Windows notification

Merged PR #5 / merge `60da68ee853c9698fc4f024610df4bd1965672ca`.

Official `tauri-plugin-notification` 2.4.0 is used through Rust. Installed-build visible notification delivery is physically validated.

Windows CI #64 / run `33722574933`: SUCCESS. Artifact ID `9881057394`, digest `sha256:337fe0acccaebe77c73197f9cbe91ae35d8e7a7269615be4b36066d333b3f9a6`.

### Windows autostart

Merged PR #6 / squash merge `063cc91b5f8c4f9e5ef8efbec38136159fa68a41`.

Official `tauri-plugin-autostart` 2.5.1 is used through Rust-owned `autostart_status`, `autostart_enable`, and `autostart_disable` commands. Caller-idempotence, post-operation state verification and structured failure handling are implemented.

Windows CI #65 / run `33725057607`: SUCCESS. Artifact ID `9881948331`, digest `sha256:3ab3168645ce90dfb22ad7cc8911a222b0abd06c568632428f8602b99d7c8a0e`.

Physical validation: **PASS**. Enable/disable registration was observed in Windows Task Manager Startup apps, and after a real Windows restart Narro launched automatically with the `main` window open normally after sign-in.

Evidence: `work-log/2026-09-03-chatgpt-autostart-restart-validation.md`.

## Floating-only performance baseline

Harness merged in PR #7 / squash merge `4a475d3863e80ac0520bcae9ec728658b0c25195` and automated-validated by Windows CI #66 / run `33727105026`.

Raw physical runs are committed under:

- `performance/m1-floating/20260903-074630Z/`;
- `performance/m1-floating/20260903-074840Z/`;
- `performance/m1-floating/20260903-075029Z/`.

Common conditions:

- installed `narro.exe`;
- scenario `floating-only-main-destroyed`;
- 12 logical processors;
- 30-second warm-up;
- about 60 seconds sampled per run;
- 1 `narro.exe` + 6 attributable `msedgewebview2.exe` processes;
- zero process-churn intervals;
- `steadyStateValid: true` in every run.

| Run | Avg CPU (% one core) | Avg CPU (% total capacity) | Avg working set | Avg private bytes |
| --- | ---: | ---: | ---: | ---: |
| `20260903-074630Z` | 0.000% | 0.0000% | 393.62 MiB | 319.19 MiB |
| `20260903-074840Z` | 0.077% | 0.0064% | 396.21 MiB | 325.40 MiB |
| `20260903-075029Z` | 0.026% | 0.0022% | 401.35 MiB | 337.17 MiB |
| **median** | **0.026%** | **0.0022%** | **396.21 MiB** | **325.40 MiB** |

Interpretation:

- idle CPU is effectively zero;
- no renderer polling loop or continuing process churn was observed;
- memory is dominated by WebView2 rather than the Rust host;
- summed working set includes shared/resident pages and is not unique physical RAM;
- run 2 contains a one-time WebView2 allocation increase, while run 3 plateaus with only about 0.13 MiB private-memory min-to-max movement across the sample;
- there is no current signal of a continuing baseline leak;
- no arbitrary RAM cutoff exists in the repository and one should not be invented after seeing the data.

Performance decision: **continue with Tauri + WebView2 `focusSurface`.** Re-run the same measurement after real Floating Timer UI exists, including collapsed/expanded/timer-running states and before/after repeated Focus↔Floating/Notes/subtask stress transitions.

Evidence: `work-log/2026-09-03-chatgpt-floating-performance-results.md`.

## Recreate deadlock history

The original synchronous `WebviewWindowBuilder::build()` recreation path deadlocked on the user's real Windows machine. Narro now uses the async creation path, which passed physical retesting. Do not regress this without new evidence.

## Milestone 2 completion

**Result: PASS / proceed to Milestone 3.**

Milestone 2 is automated-validated through PR #21. Durable coverage includes IDs/schema/migrations, list/task/subtask lifecycle, stable ordering and duplication invariants, Time Taken and typed schedule metadata, recurrence metadata persistence, constrained rich notes, versioned preferences/defaults, explicit permanent-delete report exclusion, deterministic fixtures, persistence-first mutation visibility, and repeated scheduled-lane move/reorder corruption regressions.

Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 current merged state

Current validated **source** implementation baseline: `3ffbaca0c5df78833584de26270686f6cdadca16`.

Markdown-only work-log/tracking commits may be newer and do not change this source baseline.

Merged M3 implementation slices:

- PR #23 / `efb50743e1625a597f2e8466d552f67f03539d5d`: authoritative pure Rust timer state machine with controlled time, CountUp/EST/Pomodoro, explicit pause/break/Time's Up/overtime states and renderer-independent work accounting.
- PR #24 / `2da2496d1e7eab4ba57a0c80d82c680614fe2397`: task Done/Skip/Switch timer lifecycle and Time's Up exits.
- PR #25 / `faf46923acbebd59cd0b1d241eaad80c2618f606`: typed session persistence foundation, work/break separation, monotonic checkpoints and database enforcement of at most one unfinished session.
- PR #27 / `c769c284002628b73f76b4c1e35b1595dc685bf0`: persistence-first `TimerRuntime`, atomic Work<->Break/task-switch row replacement, no per-second SQLite writes, fractional-segment accounting and failed-switch rollback. Windows CI #122 / run `33889344761`: SUCCESS.
- PR #29 / `3d4ab087682d3cf91a93f18aa5e1bd2cb23d2719`: durable timer-runtime checkpoint/recovery tied to the open focus session. Interrupted running/overtime recover paused, break progress survives without charging downtime, and checkpoint/session mismatches are rejected. PR CI #128 / run `33917954626`: SUCCESS. Main CI #129 / run `33919037186`: SUCCESS.
- PR #30 / `138fb5cc753dc520be731159be453fc6046aecb4`: atomic product-level task completion boundary combining final session close, checkpoint removal, task completion and rank compaction before Idle publication. PR CI #138 / run `33927834736`: SUCCESS. Main CI #139 / run `33928547004`: SUCCESS.
- PR #31 / `c59e434e9f6b13b1837159f00e51fc96dd7f10a7`: live Time Taken edits restricted to a paused runtime-aware transaction, preserving raw session history, plus exact 15m+15m pause/recovery and task-switch restart regressions. PR CI #144 / run `33929261772`: SUCCESS. Main CI #145 / run `33931153129`: SUCCESS.
- PR #32 / `349260f28475f53472b444af6180704a4b981c20`: typed revisioned timer/session events and Tauri-owned timer service. Rust owns monotonic time/background advance; successful persisted transitions broadcast `timer-session-changed`; both `main` and `focusSurface` use the shared race-safe revision-aware projection bridge. PR CI #161 / run `33936979665`: SUCCESS. Main CI #162 / run `33947484856`: SUCCESS.
- PR #33 / `3ffbaca0c5df78833584de26270686f6cdadca16`: exact late Pomodoro boundary persistence, durable once-only local notification decisions/claims, best-effort post-commit Windows notification submission, authoritative `awaitingResume` projection, shared Resume prompt in both webviews, and recovery preservation without replaying claimed notification decisions. Exact head `6a3e7d2f2b5fa941e6389bea7e3ed3247987c817`; PR CI #181 / run `33953073811`: SUCCESS. Main CI #182 / run `33955789396`: SUCCESS.

The high-risk tracked-time boundaries are now automated-covered: process downtime is excluded, one open-session identity survives recovery, task switching remains coherent across restart, Done cannot publish task completion without final session persistence, a paused manual Time Taken correction remains stable after resume/recovery without rewriting historical session durations, renderer lifecycle no longer owns or advances timer time, and late Pomodoro observation cannot skip the persisted intermediate Break boundary.

PR #26 (`m3-session-coordinator`) was closed unmerged and is historical only. Its intended crash-recovery capability is superseded by merged PR #29.

Important product/runtime APIs and ownership rules:

- product task Done: `TimerRuntime::complete_task`;
- lower-level timer/session lifecycle only: `TimerRuntime::finish_task`;
- live paused Time Taken edit: `TimerRuntime::set_time_taken_while_paused`;
- generic `set_task_time_taken` rejects an active focus session;
- process-local monotonic timer ownership: Tauri `TimerService` / Rust, never renderer timestamps;
- authoritative typed projection: `timer-session-changed`, consumed by both webviews after persistence success;
- Pomodoro notifications use one durable local boundary decision/claim per source session/effect kind. Windows toast submission happens after persistence and is best-effort; Narro does not claim transactional exactly-once delivery across a crash in the external OS notification API;
- end-of-Pomodoro-break prompt state is authoritative `awaitingResume`, survives renderer recreation/process recovery, and clears when the authoritative projection leaves paused Pomodoro (including Resume).

Architecture decision for manual Time Taken remains: user corrections do not rewrite raw session history or raw monotonic timer elapsed. They rebase durable task adjustment while paused, so later real work accrues on the corrected effective baseline.

### Remaining M3 correctness boundaries

- long-duration/large-elapsed overflow safety;
- explicit Windows sleep/resume no-data-loss coverage. Whether unattended sleep counts as work remains an unresolved product-policy decision and must not be invented.

Next source slice: add long-duration/large-elapsed safety coverage so timer/session arithmetic, boundary interpolation and event revisioning fail safely rather than overflow or corrupt persisted state. Keep Windows sleep/resume accounting policy unresolved until explicitly decided.

Scheduling classification, recurrence materialization, reminder firing and DST/week semantics remain Milestone 4.

## Blitzit historical/reliability research — 2026-09-04

Focused historical research is complete and stored in `docs/BLITZIT_HISTORY_RISK_INDEX.md`. It complements, rather than replaces, `docs/SOURCE_AUDIT.md` and `docs/RESEARCH_EVIDENCE.md`.

Main evidence-backed conclusions:

- tracked-time loss is a recurring Blitzit failure family from late 2024 through current late-August/early-September 2026 reports, covering completion-to-`00:00`, navigation/sleep loss, pause accounting, post-pause persistence and manual Time Taken edit divergence;
- Blitzit's current public roadmap still lists `Tasks sometimes lose tracked time` as **In Development**;
- Blitzit's own November 2025 retrospective says reporting accuracy was a long-standing problem and that session tracking was rebuilt around individual editable sessions;
- task duplication/reorder corruption recurs across historical Frill reports and an independent 2025 hands-on review; Narro M2's stable-ID/exact-set/persistence-first rules already address that risk class;
- scheduling/day-boundary failures recur across historical shipped fixes and current reports; the existing M4 date-only/local-datetime, timezone, DST and idempotence requirements remain necessary;
- the March 2026 Firebase suspension is developer-confirmed and temporarily made all user tasks/data inaccessible; Narro's local-only SQLite authority intentionally avoids this centralized availability failure class;
- the core Blitzit value proposition remains simple planning -> one-task focus -> persistent timer/Pomodoro -> completion, so Narro should improve reliability without adding workflow friction.

The official desktop changelog URL exists but its current public page exposes the release feed dynamically; a complete static desktop version ledger could not be recovered. Known public version/date anchors are recorded without inventing missing releases.

Product UI remains intentionally unpolished while Milestones 3–4 establish correctness-critical behavior.

## Durable scope

Narro is a **personal, local-only Windows desktop productivity application** reproducing the core Blitzit planning -> focus experience while improving reliability and interaction quality.

Excluded unless the user changes scope: accounts/auth, cloud backend/sync, subscriptions/licensing/payments, off-device telemetry, collaboration, remote integrations/webhooks/MCP, AI/Blitzy, remote voice transcription, and non-Windows targets.

Allowed local Windows equivalents include SQLite, tray/background lifecycle, notifications, autostart, local file assets and local report exports.

## Durable correctness decisions

Future agents must preserve `AGENTS.md` and `ENGINEERING_QUALITY.md`, especially authoritative Rust/domain state, stable identities, scheduling/timer invariants, explicit link activation, dynamic monitor topology, minimal `focusSurface`, structured recoverable failures, and evidence-backed architecture changes.

For source-product risks and regression targets, use `docs/BLITZIT_HISTORY_RISK_INDEX.md` together with `docs/SOURCE_AUDIT.md`; do not infer that a historical Blitzit fix permanently closes a failure class when newer evidence reports recurrence.

## Multi-agent continuation rule

Repository state must be sufficient for another capable coding AI without prior chat context. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `work-log/*.md`, and legacy `WORK_LOG.md` according to their documented roles.
