# HANDOFF.md

This is the **current operational continuation state** for Narro. Historical detail belongs in `WORK_LOG.md`.

Any zero-context AI should first read `AI_START_HERE.md`, then this file.

## CURRENT MILESTONE

**Milestone 1 — Windows desktop scaffold, capability and performance spike**

The architecture has passed part of its first real Windows runtime test:

- shared authoritative Rust state/event propagation works between `main` and `focusSurface`;
- `main` hide/show works;
- forced destruction of `main` does not terminate the Rust process or `focusSurface`;
- Rust state continues to mutate while `main` does not exist.

The first artifact failed when recreating `main`: the replacement window appeared blank and both webviews became unresponsive. Current source changes `main_window_recreate` from a synchronous command to an async Tauri command, following Tauri's documented Windows/WebView2-safe command pattern. This fix is compiled/built in Windows CI but **has not yet been manually validated on Windows**.

## VERIFIED BUILD FOR RETEST

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

Prefer the raw `narro.exe` for retesting so installer caching cannot accidentally execute an older build.

## ALREADY MANUAL-WINDOWS-VALIDATED

- [x] `main` -> `focusSurface` state/event propagation
- [x] `focusSurface` -> `main` state/event propagation
- [x] hide/show `main`
- [x] forced destroy of `main` leaves process and `focusSurface` alive
- [x] Rust state mutates while `main` is absent

Durable first-pass evidence:

`docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`

## NEXT AGENT ACTION

**None until the USER ACTION REQUIRED below is completed.**

Do not broaden Milestone 1 into monitors, display hotplug, shortcuts, tray, notifications, autostart, CPU/RAM measurement or product UI while the recreate path is still awaiting real Windows validation.

Allowed agent work while waiting is limited to source/CI review that does not bypass or pretend to satisfy the pending manual evidence.

## USER ACTION REQUIRED

Run the new artifact from `Windows CI` run `33658001715` on a real Windows desktop and test the recreate fix.

Use this exact sequence:

1. Launch the included raw `narro.exe`.
2. Show `focusSurface`.
3. Mutate state in both directions once to confirm the baseline still works.
4. Set the counter to a recognizable non-zero value.
5. From `focusSurface`, click **Destroy Main**.
6. Confirm `focusSurface` remains responsive and mutate state once more.
7. Click **Recreate Main**.
8. Confirm recreated `main` loads the diagnostic UI instead of a blank white client area.
9. Confirm `focusSurface` remains responsive after recreation.
10. Confirm recreated `main` immediately shows the surviving Rust counter/state instead of resetting to zero.

If steps 7–10 fail/freeze, stop and report the exact observation.

If recreate passes, continue in the same fresh process:

11. Switch `focusSurface` Panel -> Timer -> Panel.
12. Verify Timer Mode is always-on-top against a normal Windows application.
13. Verify Timer Mode skip-taskbar behavior.
14. Refresh the window list and verify only `main` and `focusSurface` exist.

## AFTER USER EVIDENCE ARRIVES

The next AI should proceed without requiring a custom prompt:

1. record the returned PASS/FAIL observations in durable runtime evidence and append them to `WORK_LOG.md`;
2. update only evidence-backed nested checkboxes in `TODO.md`;
3. if recreate still fails, keep later M1 capability work blocked and repair the recreate path;
4. if recreate + Panel/Timer/AOT/taskbar/two-window checks pass, continue the first unblocked Milestone 1 items in `TODO.md` in order: monitor enumeration/edge placement, display-topology recovery, shortcuts, tray/background lifecycle, notifications, autostart, then floating-only CPU/RAM measurement;
5. keep polished product UI and Milestone 2 blocked until the Milestone 1 architecture/capability gate is sufficiently validated.

## NOT YET VALIDATED

- recreated `main` loads successfully without freezing;
- surviving Rust state appears correctly in recreated `main`;
- Panel -> Timer -> Panel on the same `focusSurface`;
- Floating Timer always-on-top behavior;
- Floating Timer skip-taskbar behavior;
- exactly two persistent webviews after mode switching;
- remaining Milestone 1 native capabilities/performance measurements.

## IMPORTANT FILES

- `AI_START_HERE.md`
- `AGENTS.md`
- `AGENT_WORKFLOW.md`
- `TODO.md`
- `STATUS.md`
- `WORK_LOG.md`
- `docs/ARCHITECTURE.md`
- `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`
- `docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`
- `.github/workflows/ci.yml`

## TEMPORARY IMPLEMENTATION WARNING

The current React diagnostic controls are a Milestone 1 validation harness, **not Narro product UI**. Do not polish them or treat their current dimensions/styles as final product design.

Use forward commits only. Never amend/rebase/force-push published `main` history during normal handoff work.
