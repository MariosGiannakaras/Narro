# 2026-09-24 — M7 Timer topology recovery and validated main

Agent: Codex. Coherent slice: restore and live display-topology recovery for the Floating Timer, including constrained work areas and native failure rollback.

## Source and decision

PR [#134](https://github.com/MariosGiannakaras/Narro/pull/134), exact head `44ad3c91f3af1f7f50666afc1802afba3808cc26`, changed `src-tauri/src/floating_placement.rs`, `src-tauri/src/windows/topology.rs`, `src-tauri/src/lib.rs`, and two focused frontend contract scripts. Before this change, Timer restore returned early without a saved position, while generic topology recovery only moved the visible Timer. A monitor shrink, disconnection, or DPI change could therefore leave an oversized outer window outside a usable work area. The source now measures/fits/positions the native outer rectangle on restore and visible topology changes, rechecks after cross-monitor DPI movement, suspends placement saves during the transition, and attempts geometry/visibility rollback if native steps fail. Mode presentation also snapshots and restores its prior native state on failure. The existing two-webview model and Rust timer/session authority remain.

The Rust geometry tests exercise a disconnected-monitor fallback and a saved position on a shorter high-DPI work area. Existing focus entry/transition scripts check integration contracts; they do not simulate WebView2 compositor behavior or native API failure. Those behaviors remain physical or integration-test gates, not implied PASS results.

## Validation

- Local `npm ci`, `npm run preflight:frontend`, `npm run check:rust:fmt`, focused focus/Timer contracts, and `git diff --check`: **PASS** on the source candidate. Local `npm run check:rust`: **NOT RUN to completion**, because MSVC `link.exe` is missing from the desktop shell.
- Exact-head PR Windows CI #499 / run `35985228076` / job `107586210179`: **PASS**. Repository Preflight, visual fixtures, Tauri Release, and both artifact uploads passed. PR runtime artifact `10801709247`, digest `sha256:1cfe61ea9acee543d7c04fc0c62e209acb7e3bf850ca57f55f918fade3048e50`; visual artifact `10801698387`, digest `sha256:75dbd8058c340af83e9f5e5c10849af90b0e48b169b1e1db4dd1ddac4015dec0`.
- Expected-head guarded squash merge produced main source `c9ae5911aeacdd2f6604f41d35968ce691131b43`. PR head and resulting-main tree are identical: `1e770357a7e69fa3771283c3b3ba5815231accf2`.
- Resulting-main Windows CI #500 / run `35986934404` / job `107591702897`: **PASS**, including Repository Preflight, visual fixtures, Tauri Release, and uploads. Runtime artifact `10803027598`, digest `sha256:fbb99fa6058074bf3704b19f0bb33a4feb4b57ea9443227f2afdd3393ccf5ccc`; visual artifact `10803365142`, digest `sha256:022b965346bfb2a4da17ae30b75f6477a5160f9415eb115f50deec2ecb5ce208`.
- Physical Windows monitor/DPI/taskbar/compositor and shortcut behavior: **NOT RUN**. No top-level M7 item was closed from CI.

## Tracking and continuation

`TODO.md` records automated item-10/12 subchecks while leaving physical parents open. `STATUS.md` identifies the new source baseline. `HANDOFF.md` points to this log and the single consolidated session; `docs/M7_FLOATING_RUNTIME_VALIDATION.md` names the current main artifact and adds the no-saved-placement display-change case. No PR remained open at the time of this handoff. The next action is to verify fresh GitHub state and either address a concrete independent M7 source failure or run the consolidated Windows matrix when physical testing becomes available. Do not advance to M8 until M7 acceptance is observed.
