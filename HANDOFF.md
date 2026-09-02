# HANDOFF.md

This file is the current continuation point for the next Narro coding/review session. Historical detail belongs in `WORK_LOG.md`.

## Current milestone

**Milestone 1 — Windows desktop scaffold, capability and performance spike**

The first real Windows validation proved shared Rust state/event propagation, main hide/show, forced main destruction without process loss, and state mutation while `main` is absent.

The first artifact failed at `Recreate Main`: a blank replacement window appeared and both webviews became unresponsive. That behavior was consistent with Tauri's documented Windows/WebView2 deadlock for webview creation from synchronous commands.

The recreate path has now been changed to an **async Tauri command**, matching Tauri's documented Windows command example. This fix still requires real Windows retesting before the lifecycle item can be marked complete.

## New verified CI artifact for recreate retest

- Workflow: `Windows CI`
- Run ID: `33658001715`
- Run number: `22`
- Commit: `2237f2f9d44c5a332856153475a11a47d04f6e67`
- Conclusion: `success`
- Artifact: `narro-m1-runtime-harness-windows-x64`
- Artifact size: `10,060,596` bytes
- Artifact digest: `sha256:f18b11a21add9b089508e131d7532fceeccac8a559c03ac33f4c7996248c6f97`
- Artifact contents:
  - `narro.exe`
  - `bundle/nsis/Narro_0.1.0_x64-setup.exe`
  - `bundle/msi/Narro_0.1.0_x64_en-US.msi`

Prefer the raw `narro.exe` for this retest so installer caching cannot cause an older build to be executed.

## Already proven on the user's Windows desktop

- [x] `main` -> `focusSurface` state/event propagation
- [x] `focusSurface` -> `main` state/event propagation
- [x] hide/show `main`
- [x] forced destroy of `main` leaves process and `focusSurface` alive
- [x] Rust state mutates while `main` is absent

Detailed first-pass evidence is in `docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`.

## Next action — USER Windows retest

Use the new artifact from run `33658001715` and launch the included raw `narro.exe`.

Retest in this order:

1. Launch `narro.exe`.
2. Show `focusSurface`.
3. Mutate state in both directions once to confirm the baseline still works.
4. Set the counter to a recognizable non-zero value.
5. From `focusSurface`, click **Destroy Main**.
6. Confirm `focusSurface` remains responsive and mutate state once more.
7. Click **Recreate Main**.
8. Confirm the recreated `main` loads the Narro diagnostic UI rather than a blank white client area.
9. Confirm `focusSurface` remains responsive after recreation.
10. Confirm recreated `main` immediately shows the surviving Rust counter/state instead of resetting to zero.

If any of steps 7–10 fail or freeze, stop and report the exact observation. Do not proceed to mode/AOT tests from a frozen or partially initialized process.

If recreate passes, continue in the same fresh process:

11. Switch `focusSurface` Panel -> Timer -> Panel.
12. Verify Timer Mode is always-on-top against a normal Windows application.
13. Verify Timer Mode skip-taskbar behavior.
14. Refresh the window list and verify only `main` and `focusSurface` exist.

## Evidence discipline

Do not mark the parent lifecycle or focus-mode TODO items complete until the user reports the corresponding real Windows PASS results.

CI proves compilation/build; it does not prove interactive Windows behavior.

## After user retest

The next agent must:

1. record the user's PASS/FAIL results in the durable runtime evidence / `WORK_LOG.md`;
2. update only evidence-backed `TODO.md` checkboxes;
3. if recreate still fails, keep later Milestone 1 capabilities blocked and fix the recreate path again;
4. if recreate and mode-switch validation pass, continue Milestone 1 with monitor enumeration/edge placement, display topology recovery, shortcuts, tray, notifications, autostart, then floating-only CPU/RAM measurements;
5. keep polished product UI and Milestone 2 blocked until the Milestone 1 architecture/capability gate is sufficiently validated.

## Important files

- `AGENTS.md`
- `AGENT_WORKFLOW.md`
- `TODO.md`
- `STATUS.md`
- `WORK_LOG.md`
- `docs/ARCHITECTURE.md`
- `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`
- `docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`
- `.github/workflows/ci.yml`

Use forward commits only. Do not amend/rebase/force-push published `main` history for normal handoff work.