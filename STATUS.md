# STATUS.md

Last updated: 2026-09-04

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

Current validated `main` baseline before this research-only documentation change: `c769c284002628b73f76b4c1e35b1595dc685bf0`.

Merged M3 implementation slices:

- PR #23 / `efb50743e1625a597f2e8466d552f67f03539d5d`: authoritative pure Rust timer state machine with controlled time, CountUp/EST/Pomodoro, explicit pause/break/Time's Up/overtime states and renderer-independent work accounting.
- PR #24 / `2da2496d1e7eab4ba57a0c80d82c680614fe2397`: task Done/Skip/Switch timer lifecycle and Time's Up exits.
- PR #25 / `faf46923acbebd59cd0b1d241eaad80c2618f606`: typed session persistence foundation, work/break separation, monotonic checkpoints and database enforcement of at most one unfinished session.
- PR #27 / `c769c284002628b73f76b4c1e35b1595dc685bf0`: persistence-first `TimerRuntime`, atomic Work<->Break/task-switch row replacement, no per-second SQLite writes, fractional-segment accounting and failed-switch rollback. Windows CI #122 / run `33889344761`: SUCCESS.

Current merged integration tests already prove a basic pause/resume/finish path excludes paused wall time and combines work before/after the pause; they also prove break exclusion, Pomodoro row boundaries and atomic task-switch persistence behavior.

PR #26 (`m3-session-coordinator`) was closed unmerged. Its crash/restart recovery work is **not** part of `main`.

Remaining correctness boundaries before M3 can close:

- durable runtime checkpoint/recovery after process interruption;
- transactionally safe coordination between task completion mutation and final timer/session persistence;
- authoritative rebasing after manual Time Taken edits while paused;
- typed Tauri timer/session events with renderers kept non-authoritative;
- exactly-once Pomodoro notification/boundary side effects;
- explicit Windows sleep/resume no-data-loss coverage.

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

`TODO.md` and `HANDOFF.md` now translate the research into only the actionable M3/M4/UI anti-regressions that are relevant to Narro. No product code or new feature implementation was performed in this research phase.

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
