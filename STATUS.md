# STATUS.md

Last updated: 2026-09-03

For zero-context AI continuation, start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 2 — Domain model, identity invariants, and local persistence.**

Milestone 1 Windows desktop capability/performance Gate A is validated. The selected architecture remains Tauri 2 + React/TypeScript + Rust + SQLite on Windows 10/11 x64, with normally two persistent webviews only:

- `main`;
- `focusSurface`, reused for Focus Panel and Floating Timer.

Product UI should still not be polished yet. Milestones 2–4 establish the correctness-critical domain, timer/session, scheduling, recurrence, reminder and persistence foundations before the screenshot-driven UI milestones.

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

## Active Milestone 2 work

Milestone 2 now has an automated-validated persistence/identity foundation through task metadata persistence:

- domain IDs + SQLite schema/migrations: PR #8, merge `5d3201e4fd9b2d7b0e93fc4ec89b135aa61da9cc`; exact head `91fef967959146c69dc6ff018326277151f716dd` passed Windows CI #73;
- list lifecycle persistence: PR #9, merge `c6a7dabb5b919647486ef467bff8c3b649663cea`; Windows CI #77 / run `33749371662` passed;
- task CRUD/planning/completion/archive lifecycle: PR #10, merge `6631c9fa57ce999ca3da9e99908420a2da7ffec4`; exact head `2484f3bf825169cdf5b9e0f7bb046c5f48132e32` passed Windows CI #82 / run `33756963309`;
- task bucket ordering + independent duplication invariants: PR #11, merge `b01dcd1223f1c0cdf81db8cf694708b528feaa2a`; exact head `f74f5520dd039a26e25dad967ca80e430b8b70b1` passed Windows CI #87 / run `33759742017`;
- task Time Taken + typed schedule metadata persistence: PR #13, merge `0595025fcea529a7723468c0a6b530e9ebbb4092`; exact head `2cd35bda25df8f2e8a1cd69e44c14427b77f3948` passed Windows CI #92 / run `33763969680`; artifact `9897160600`, digest `sha256:08477502ee766ed8e03599225da0ab5925bab7fb1659cd76b8bbe6b29c2cadfa`.

Proven invariants now include durable UUID identities, explicit migrations, enabled foreign keys, list/task archive + permanent-delete semantics, Backlog/This Week/Today/Done task transitions, exact-set transactional reorder, restart-persistent bucket positions, duplication as one new independent task identity, Time Taken as persisted work-session duration plus a normalized signed manual adjustment, and transactional schedule state using explicit `none` / `date_only` / `local_datetime` shapes with restart persistence.

The broad M2 metadata checkbox intentionally remains open because recurrence metadata CRUD/persistence semantics are not yet implemented. The next source slice is therefore **recurrence metadata persistence** only: typed rule create/read/update/disable/delete contracts, lifecycle validation, parent-task linkage and restart tests. Recurrence occurrence generation/materialization, Monday-of-due-week behavior, DST catch-up, Replace Existing Tasks execution and scheduling eligibility remain Milestone 4 concerns and must not be pulled forward.

Product UI remains intentionally unpolished while Milestones 2–4 establish correctness-critical behavior.

## Durable scope

Narro is a **personal, local-only Windows desktop productivity application** reproducing the core Blitzit planning -> focus experience while improving reliability and interaction quality.

Excluded unless the user changes scope: accounts/auth, cloud backend/sync, subscriptions/licensing/payments, off-device telemetry, collaboration, remote integrations/webhooks/MCP, AI/Blitzy, remote voice transcription, and non-Windows targets.

Allowed local Windows equivalents include SQLite, tray/background lifecycle, notifications, autostart, local file assets and local report exports.

## Durable correctness decisions

Future agents must preserve `AGENTS.md` and `ENGINEERING_QUALITY.md`, especially authoritative Rust/domain state, stable identities, scheduling/timer invariants, explicit link activation, dynamic monitor topology, minimal `focusSurface`, structured recoverable failures, and evidence-backed architecture changes.

## Multi-agent continuation rule

Repository state must be sufficient for another capable coding AI without prior chat context. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `work-log/*.md`, and legacy `WORK_LOG.md` according to their documented roles.