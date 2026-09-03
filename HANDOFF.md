# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read this file, `ENGINEERING_QUALITY.md`, the active Milestone 1 section in `TODO.md`, `STATUS.md`, and the newest relevant `work-log/*.md` entries.

Do not require the user to reconstruct prior chat context or provide a custom continuation prompt.

## CURRENT MILESTONE

**Milestone 1 — Windows desktop scaffold, native capability and performance spike**

Product UI remains intentionally blocked until the remaining Windows capability gate is sufficiently proven.

Current source truth is on `main`. Use forward history only; never amend/rebase/force-push published `main` during normal handoff work.

## PHYSICALLY PROVEN ON REAL WINDOWS

Detailed prior runtime evidence: `docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`.

Observed PASS:

- `main` -> `focusSurface` authoritative Rust state/event propagation;
- `focusSurface` -> `main` state/event propagation;
- hide/show `main`;
- forced destroy of `main` leaves the runtime / `focusSurface` alive;
- Rust state can mutate while `main` is absent;
- async `main` recreation opens/initializes without the original Windows WebView2 deadlock;
- `focusSurface` remains responsive after recreation;
- Panel -> Timer -> Panel on the same `focusSurface`;
- Timer Mode always-on-top;
- Timer Mode skip-taskbar;
- only `main` + `focusSurface` remain as persistent webviews;
- three valid floating-only steady-state CPU/process-tree memory runs with `main` destroyed.

Still deliberately unconfirmed:

- exact surviving Rust counter/state visibly appears unchanged in recreated `main` — previous user report was ambiguous (`PASS/FAIL`), so do not infer PASS.

## IMPLEMENTED / AUTOMATED-VALIDATED, PHYSICAL WINDOWS EVIDENCE STILL OPEN

### Tray/background lifecycle

Persistent tray, Show/Recreate Narro, Show Focus Surface, explicit Quit and tray left-click recovery are implemented. Physical tray/background/Quit validation remains **NOT RUN**.

### Monitor enumeration / Focus Panel positioning

Monitor descriptors/work areas/scale, stable monitor selection, stale-selection rejection, negative desktop coordinates and selected-monitor left/right placement are implemented and automated-validated. Physical positioning remains **NOT RUN**.

### Display topology / off-screen recovery

Event-driven `WM_DISPLAYCHANGE`, persistent `focusSurface` observation, deferred/coalesced recovery and visible-work-area clamping are merged and automated-validated. Windows CI #54 / run `33683913556`: **SUCCESS**. Physical disconnect/reconnect/reorder recovery remains **NOT RUN**.

Evidence: `work-log/2026-09-03-chatgpt-monitor-and-display-topology.md`.

### Global shortcuts

Merged PR #4 / merge `fce2bbf65ab07d50a6928605c00fb694079739a0`.

Implemented native `RegisterHotKey` / `UnregisterHotKey`, `Ctrl+Shift+B` + `MOD_NOREPEAT`, `WM_HOTKEY` through persistent `focusSurface`, Rust-owned trigger diagnostics, Show/Recreate Main, idempotent register/unregister, structured errors and deterministic conflict probe.

Automated evidence:

- Windows CI #63 / run `33720583395`: **SUCCESS**;
- final PR head `e79ed5abc24fd7d6a3af2180ddbeaeeefcd88c21`;
- full preflight, Tauri release build and artifact upload: **PASS**;
- artifact ID `9880361708`;
- digest `sha256:137b43b1cd62fcacfa0261b496b591cc492d4d0c2193a2dfbab60b34f9836680`.

Physical shortcut firing remains **MANUAL NOT RUN**.

Evidence: `work-log/2026-09-03-chatgpt-global-shortcuts.md`.

### Local Windows notifications

Merged PR #5 / merge `60da68ee853c9698fc4f024610df4bd1965672ca`.

Implementation:

- official Tauri 2 `tauri-plugin-notification` `2.4.0` Rust API;
- Narro-owned `send_test_notification` command with bounded static diagnostic title/body;
- stable delivery errors and typed submission result;
- temporary diagnostic button only;
- no guest `notification:*` capability exposed to the renderer;
- no reminder/scheduling product semantics, cloud service, telemetry or extra webview.

Automated evidence:

- Windows CI #64 / run `33722574933`: **SUCCESS**;
- final PR head `c33c4547948a6a5c89d2d597ac93d550af05d69c`;
- full preflight, Tauri release build and artifact upload: **PASS**;
- artifact ID `9881057394`;
- digest `sha256:337fe0acccaebe77c73197f9cbe91ae35d8e7a7269615be4b36066d333b3f9a6`.

Physical Windows notification appearance remains **MANUAL NOT RUN**. Validate an installed artifact for canonical app identity.

Evidence: `work-log/2026-09-03-chatgpt-windows-notifications.md`.

### Windows autostart

Merged PR #6 / squash merge `063cc91b5f8c4f9e5ef8efbec38136159fa68a41`.

Implementation:

- official Tauri 2 `tauri-plugin-autostart` `2.5.1` Rust API;
- Narro-owned `autostart_status`, `autostart_enable`, and `autostart_disable` commands;
- no guest `autostart:*` capability exposed to the renderer;
- typed `{ enabled, changed }` diagnostic status;
- caller-idempotent enable/disable transition planning;
- explicit post-operation state verification;
- structured query/enable/disable/state-mismatch errors;
- deterministic Rust tests for transition/state logic;
- temporary diagnostic controls only.

Automated evidence:

- Windows CI #65 / run `33725057607`: **SUCCESS**;
- exact tested base `697428bb5f02d1d5dcce7a43f6602f4414abb4bc`;
- final PR head `c837687844d987bac282943d06e1fa353c1a5756`;
- full preflight, Tauri release build and artifact upload: **PASS**;
- artifact ID `9881948331`;
- digest `sha256:3ab3168645ce90dfb22ad7cc8911a222b0abd06c568632428f8602b99d7c8a0e`.

Physical enable/disable and actual next-sign-in/reboot launch remain **MANUAL NOT RUN**.

Evidence: `work-log/2026-09-03-chatgpt-windows-autostart.md`.

## FLOATING-ONLY PERFORMANCE BASELINE — PHYSICALLY MEASURED

Performance harness merged in PR #7 / squash merge `4a475d3863e80ac0520bcae9ec728658b0c25195` and automated-validated by Windows CI #66 / run `33727105026`.

The user physically ran the canonical installed-build protocol three times and committed the raw evidence in commit `55c860d6c7ab72e1de1963c49708507e6b6d0640` under:

- `performance/m1-floating/20260903-074630Z/`;
- `performance/m1-floating/20260903-074840Z/`;
- `performance/m1-floating/20260903-075029Z/`.

All three runs:

- scenario `floating-only-main-destroyed`;
- 30-second warm-up;
- approximately 60-second sample window;
- 12 logical processors;
- 1 `narro.exe` + 6 attributable `msedgewebview2.exe` processes;
- zero process-churn intervals;
- `steadyStateValid: true`.

Run averages / median:

| Run | Avg CPU (% one core) | Avg CPU (% total capacity) | Avg working set | Avg private bytes |
| --- | ---: | ---: | ---: | ---: |
| `074630Z` | 0.000% | 0.0000% | 393.62 MiB | 319.19 MiB |
| `074840Z` | 0.077% | 0.0064% | 396.21 MiB | 325.40 MiB |
| `075029Z` | 0.026% | 0.0022% | 401.35 MiB | 337.17 MiB |
| **median** | **0.026%** | **0.0022%** | **396.21 MiB** | **325.40 MiB** |

Interpretation:

- idle CPU is effectively zero; there is no evidence of a continuous polling/animation loop;
- memory is dominated by WebView2 rather than the Rust host;
- last-snapshot WebView2 working set is roughly 362–369 MiB, while `narro.exe` is roughly 32.5 MiB;
- last-snapshot WebView2 private bytes are roughly 260–277 MiB, while `narro.exe` is roughly 60.4 MiB;
- run 2 includes a one-time WebView2 private-memory allocation increase; run 3 then plateaus with only about 0.13 MiB min-to-max private-memory movement over the full minute, so the baseline does not show continuing leak behavior;
- summed working set includes shared/resident pages and is not unique physical RAM; private bytes must be considered alongside it.

### Performance architecture decision

**Proceed with the current Tauri + WebView2 `focusSurface` architecture.**

The repository intentionally has no arbitrary RAM cutoff, and `docs/DECISION_GATES.md` says not to use one as the sole pass/fail criterion. Near-zero idle CPU, a stable process tree and stabilized final-run memory do not justify a native Win32/WinUI overlay rewrite at this stage.

The current three-run baseline is the comparison point for later Floating Timer work. Revisit after real Floating Timer UI exists, especially collapsed/expanded/timer-running CPU and memory before/after repeated Focus↔Floating and Notes/subtask expansion stress tests.

Detailed interpretation is in `STATUS.md`. Record an immutable measurement work-log before ending this continuation cycle.

## ACTIVE VALIDATION SLICE

**Next slice: remaining consolidated physical Windows Milestone 1 capability validation.**

Performance sampling is no longer a blocker. Do not ask the user to re-run the baseline unless new evidence requires it.

Still-open physical checks:

- exact state survival across `main` recreate;
- tray/background recovery and explicit Quit;
- monitor enumeration and selected left/right Focus Panel placement;
- stale monitor selection rejection;
- display disconnect/reconnect/off-screen recovery, including while `main` is destroyed;
- global shortcut register/fire/unregister/conflict behavior;
- local Windows notification appearance from an installed build;
- autostart enable/disable and actual next-sign-in launch;
- confirm no unexpected parallel Narro instance/invisible stranded process during autostart/recovery scenarios.

## NEXT AGENT ACTION

1. synchronize with latest `main`;
2. read the committed performance baseline in `STATUS.md`; do not repeat the measurement work by default;
3. guide the user through one concise consolidated physical Windows capability pass using the installed diagnostic build;
4. record each observation strictly as PASS / FAIL / NOT RUN;
5. reconcile Milestone 1 checkboxes in `TODO.md` from actual observed evidence;
6. if a physical failure reveals a product/runtime blocker, fix that narrow blocker and revalidate through Windows CI;
7. once remaining Gate A evidence is acceptable, record the final Milestone 1 Gate A result and proceed to Milestone 2;
8. do not start polished product UI before the Gate A decision.

## TEMPORARY HARNESS WARNING

Current React diagnostic controls, dimensions and styling are Milestone 1 scaffolding only. Do not polish them or treat them as final Narro product UI. Branding/icon expansion remains deferred unless a native capability specifically requires application identity.
