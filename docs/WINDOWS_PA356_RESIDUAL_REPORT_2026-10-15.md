# PA356 residual validation and PA05 scope disposition â€” 2026-10-15

## PA05 â€” PASS with explicit hardware limitation

The user cannot physically unplug the HDMI cable and requests the strongest available programmatic validation and closure. PA05 is closed **PASS for software topology/DPI recovery**, combining the already accepted actual Windows session and exact-source automated coverage. **Physical HDMI unplug/replug is NOT RUN**, accepted as an unavailable hardware observation; it is not simulated, not a physical PASS, and no further user cable action is requested for this PA campaign. Electrical hotplug/handshake-specific failures remain outside this acceptance claim.

Evidence chain:

- [Actual Windows postfix report](WINDOWS_PA_POSTFIX_REPORT_2026-10-13.md), source35528dea / resulting-main CI38384969271 / standalone EXE SHA256cc36f832b7db7a5c09a1d87cc1b581b32af7680bdff079093db36db1a41856f8: named nonprimary LG125â†’100â†’125, selected identity retained, real Windows logical /internal removal with safe primary recovery, explicit Automatic clearing stale selection, then Duplicateâ†’Extend restoring primary100%/LG125%. That published corpus is reused; no new physical operation is claimed.
- Current accepted sourcef7456738b8b8498387d4d9637409c4a384f95ba3 / PR356 / CI38688646540. Five whole monitor/topology/placement/region/API files and seven relevant native lib.rs functions are **byte-identical** to source35528dea. [Hashes and exact validation receipt](../work-log/evidence/pa356-residual-review-20261015/pa05-automated/source-and-validation-proof.json).
- **43/43 relevant native Rust tests PASS** in that exact Windows CI: missing-monitor fallback, negative coordinates, partial/offscreen clamping, invalid/empty/overflow geometry, tiny work areas, compact/expanded fitting, DPI changes, monitor identity ambiguity/malformed keys, persistence round-trip/reopen, display/power event classification, and recovery deferral during interactive/programmatic moves. [Full original CI log](../work-log/evidence/pa356-residual-review-20261015/pa356-ci-complete.log) and selected-test extract are preserved.
- **5/5 targeted local commands PASS**: monitor-selection-identity, diagnostic-placement, ui-floating-movability, single-focus-architecture, ui-preferences. The first four pass directly in the source worktree. The Preferences static test initially fails because core.autocrlf=true inserts CRLF into a literal LF source assertion; the unchanged exact committed test and 32 committed inputs pass when executed from canonical Git bytes. Both attempts are retained. This is a static test checkout sensitivity, not a demonstrated product regression; no runtime/test source was edited to hide it.

Logical recovery audit: the persistent Focus HWND observes display/DPI/work-area/resume events independently of Main; recovery re-enumerates actual current monitors, filters invalid work areas, resolves selected identity by a unique named fallback, clamps the **visible region** rather than treating the full invisible host as the Timer, refreshes the DPI region, and persists safe placement only after successful recovery. Atomic dirty/pending sequencing coalesces changes and defers full recovery during user drag/presentation transactions. Native calls retain explicit error/rollback paths. These are source/automated findings, not a physical cable claim.

The stale New27 CI953 failure is superseded only for the later actually exercised DPI/Automatic recovery path; the old failure and original evidence remain immutable. No new code defect was confirmed, so no speculative patch, PR, build or CI was introduced.

## Current floating-only performance â€” bounded PASS

Current same-CI diagnostic artifact11952771160 / EXE73a78877672d9d9d2ac833ff9c46a376c9ea192694a5e8038b53ad95e02af546. Main actually destroyed; one visible compact Focus340Ã—110, idle, no interaction during each unchanged30s warm-up/60s collection; full Narro process tree includes six WebView2 processes. **6/6 current runs valid**, zero process churn, exact-hash/native preflight before every run.

| Condition | Valid runs | Median CPU, one core / total12-core capacity | Working / private MiB |
|---|---:|---:|---:|
| OBS preview open, recording stopped |3/3|3.7745% /0.3145%|392.610 /309.128|
| OBS process closed |3/3|2.3822% /0.1985%|392.807 /309.189|
| Exact historical CI942 EXE re-run today, OBS closed |1/1 comparator|2.7654% /0.2305%|382.346 /312.068|

The older exact bytes also show higher CPU today than their October04 recording, so these observations do not establish a current-code CPU regression. No unexplained major memory increase or process churn was observed, and no architecture rewrite is justified. The environmental cause of the historical CPU shift is **unknown**; OBS causality, long-duration leak freedom, every presentation/workload and an arbitrary performance threshold are not claimed. Historical comparator used a fresh profile/current collector and one run, current runs used an already warmed process; this is a bounded same-machine comparison, not a matched causal experiment. [Machine-readable values](../work-log/evidence/pa356-residual-review-20261015/performance-comparison.json).

The first collection attempt was invalid when a transient WebView process disappeared during sampling; the collector aborted before emitting samples/summary. It is excluded and preserved, not counted as a product FAIL or a successful run.

## PA06 diagnostic acquisition â€” no new physical PASS

Three diagnostic probes were attempted: Windows notifications enabled, disabled, and a persisted real+2min reminder with Settings foreground. Whole177.884s and252.150s dual-display recordings, actual OS-toggle actions, UIA/native state, foreground watch and logs are [frozen on main](../work-log/evidence/pa356-residual-native-20261015/). Both recordings fully decode without errors. Sampled bottom-right regions from both screens show no toast at the inspected times; this does not prove absence in every frame or possible notification location.

The reminder fired_at is2026-10-15T09:49:01Z, with one durable task/reminder pair; submitted=true/fired_at alone is not visible delivery proof. Aggregate analysis corrected its own initial task lookup to join reminders.task_id rather than treating reminder ID as task ID; no task loss occurred.

The diagnostic AUMID com.mariosg.Narro.M1Diagnostic has no installed Start-menu identity; Get-StartApps returns the registered production com.mariosg.Narro only. [Official Tauri Windows notification guidance](https://v2.tauri.app/plugin/notification/) requires an installed app, and [Microsoft desktop toast guidance](https://learn.microsoft.com/en-us/windows/win32/shell/enable-desktop-toast-with-appusermodelid) requires a valid shortcut/AUMID. Therefore these diagnostic probes cannot close production OS permission/disabled/background acceptance or justify a product notification patch. **NEXT: use the exact accepted production/installed Narro identity with a fresh protected owned profile and a real deadline.** Prior PA351 selected-sound/mute/automatic audio acceptance remains valid. PR333's listener-registration failure recovery is already automated-covered; an invented physical fault-injection gate is not required.

## Safety, tracking and boundaries

Narro is quit, OBS recording stopped, Windows notifications restoredOn and original Focus AssistOff unchanged; primary100%/LG125% topology and motion restored. Personal production DB remains byte-identical SHA25613185e54bc0ea08f3b368ccc48a8ede429683e1d58a60b15b8f7491a06d2224d.

A first profile-protection attempt failed to rename the diagnostic namespace because the helper held SQLite open, but its shell still launched the diagnostic once. Normal Quit followed before UI testing. Production was untouched. Diagnostic startup mutated its original DB; the verified prelaunch SQLite logical backup was restored. Original diagnostic raw-byte identity is unavailable; recovered snapshot SHA701973ee is explicitly distinguished from original8372189a. [Published recovery record](../work-log/evidence/pa356-residual-native-20261015/first-launch-recovery.json). Later launches used fail-closed owned-profile/hash guards; all namespaces are restored. Do not replay restored isolation ledgers.

M1 GateA is reclosed for its required scaffold/software recovery scope, including the superseded New27 and current floating-only measurement, with the unavailable hardware branch explicitly bounded above. Mandatory milestone completion is now **4/10 (M1â€“M4)**. M5â€“M9 source/native acceptance gates remain separate; M10 hard entry is blocked and no M10 checkbox advances. PA09/M11/live Blitzit remain excluded. Spectrum Core picker/image upload/218icons are unchanged. Prior PA356 Preferences/PDF2/2, M9export12/12 and installer acceptance are retained; clean-machine/older-schema/true-boot limits are not invented extra PA08 checkboxes.
