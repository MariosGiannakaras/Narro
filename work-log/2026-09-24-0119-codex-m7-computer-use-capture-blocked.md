# M7 item 7 — portable identity verified; Computer Use capture blocked

Date: 2026-09-24 01:19 Europe/Athens
Agent/tool: Codex Computer Use Windows test, GitHub connector, local process/hash inspection
Milestone/item: M7 item 7, final physical Windows motion gate
Result: **NOT RUN / blocked by Computer Use capture and input geometry**; zero valid transition repetitions.

## Current repository and build

At inspection, GitHub `main` still ended at tracking commit `00f120d9ccc0fdfdf12361105f425b6306523450`; there were no open PRs. Resulting-main CI #477, run `35907803574`, job `107339752322`, reported success for repository preflight, Windows visual fixtures and Tauri release. The runtime artifact is `10771699056`, digest `sha256:1da888a05d0158b6db30c5e6f3b17688cb660cac2ef103ec5c949997fad1daa2`, from source `36a3f6f6a1ecd5249839100e1e1249305050fa07`.

The extracted raw executable at `E:\SystemFiles\Desktop\narro-m7-item7-main-ci477-windows-x64\narro.exe` had SHA-256 `d0c82a2fea79d4100ae4bb398207a1b2300ead7eec68071d291b6bc8de4c1fc0`, matching the established CI #477 raw executable identity. At first inspection no `narro.exe` process or Narro window was returned. An attempted `sky.launch_app` by explicit portable path resolved to the older installed executable at `C:\Users\MariosG\AppData\Local\Narro\narro.exe` (SHA-256 `78515bdb3a05bb9ef27920b1c3c67b56b7950a7759ef0e3a93abd0c978f58dd0`), so that process was stopped and no observation of it was counted. The portable executable was then launched explicitly. Final process inspection returned one `narro.exe`, PID 13896 at the portable path, with the expected file hash. PID and process state are transient; reverify before any future run.

## Computer Use observation

The native Windows `@oai/sky` bridge initialized and returned the portable Narro window. An accessibility-only state capture succeeded and showed the main Narro screen, including a paused timer/session projection. Screenshot-backed `get_window_state` failed repeatedly with `SetIsBorderRequired failed: No such interface supported (0x80004002)`. An accessibility-index click on `Blitz now` failed with `coordinate input geometry is unavailable`. A keyboard shortcut was sent and the app window could still be enumerated, but no visual transition was captured or evaluated. A later process PID differed from the initial launch PID; no cause or app defect is inferred from that observation alone.

No screenshots were obtainable from Computer Use. There is no evidence for smoothness, flicker, left/staging flash, blank/stuck presentation, intermediate compact sizing, right-side return, horizontal overflow, or continuity through any requested transition. Counts: Focus Panel → Floating Timer **0/5 valid**, Floating Timer → Focus Panel **0/5 valid**, Collapsed → Expanded → Collapsed **0/5 valid**. This is a **test-infrastructure blocker**, not an app-motion PASS or FAIL.

## Changes and continuation

No Narro source, tests, TODO checkbox, or milestone status changed. No app fix was justified without a concrete observed symptom. Item 7 remains at `6/10M || 4/5 | 6/14`; item 8 remains gated. Restore working Computer Use screenshot/input geometry (or obtain equivalent directly observed Windows visual evidence), reverify the live portable path/hash, then perform five valid repetitions of each flow with a running visible timer and task/session continuity checks. Label the evidence **Codex Computer Use Windows test** only when that method actually yields valid observations.
