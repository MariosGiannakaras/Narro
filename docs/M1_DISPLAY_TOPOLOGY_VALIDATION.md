# Milestone 1: Display Topology Recovery Validation

This procedure validates Narro's Windows display-topology recovery behavior. It is separate from explicit monitor enumeration/left-right placement in `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`.

Automated CI can prove the geometry tests, Win32 observer compilation and release build. It cannot prove that a physical monitor disconnect/reconnect produces the expected Windows message or that real desktop windows remain reachable. Those observations require an interactive Windows desktop.

## Expected implementation behavior

- Narro observes Windows `WM_DISPLAYCHANGE` through the persistent top-level `focusSurface` HWND.
- The observer is event-driven; it does not poll display state.
- Repeated display-change messages are coalesced so only one recovery pass is pending at a time.
- Recovery re-enumerates the current monitor work areas.
- Normal, non-minimized windows are kept on the work area they intersect most; if their previous display disappeared completely, they fall back to a current valid work area.
- `main` may be absent because it is intentionally destroy/recreate capable; topology recovery must continue through `focusSurface` and must not require `main` to exist.
- Minimized, maximized and fullscreen windows are left to Windows rather than being forcibly repositioned by Narro.

## Scenario 1 — secondary-monitor disconnect while both Narro windows exist

Prerequisite: at least two enabled monitors.

1. Launch the exact current artifact identified in `HANDOFF.md`.
2. Show `focusSurface` and switch it to Panel mode.
3. Use **Refresh Monitors** and place the Focus Panel on a secondary monitor.
4. Move `main` onto the same secondary monitor as well.
5. Without closing Narro, disconnect or disable that secondary monitor in Windows Display Settings.
6. Wait only for normal Windows display reconfiguration; do not restart Narro and do not click a Narro refresh/recovery control.
7. **PASS/FAIL:** does `focusSurface` automatically reappear wholly within a remaining monitor work area?
8. **PASS/FAIL:** does `main` automatically remain/reappear within a remaining monitor work area?
9. **PASS/FAIL:** is Narro still responsive after the topology change?
10. **PASS/FAIL:** does **Refresh Monitors** now show the current reduced monitor topology?

Record:

- FocusSurface automatic recovery: `PASS / FAIL`
- Main automatic recovery: `PASS / FAIL`
- No Narro restart required: `PASS / FAIL`
- App responsive after disconnect: `PASS / FAIL`
- Re-enumeration reflects current topology: `PASS / FAIL`

## Scenario 2 — topology change while `main` is destroyed

**Goal:** prove the display observer is tied to the persistent `focusSurface`, not to the destroyable main webview.

1. Start with at least two monitors enabled.
2. Show `focusSurface` and place it on a secondary monitor.
3. Use **Destroy Main** so `main` no longer exists.
4. Confirm **Refresh Window List** from `focusSurface` shows only `focusSurface`.
5. Disconnect/disable the secondary monitor without restarting Narro.
6. **PASS/FAIL:** does `focusSurface` automatically recover onto a remaining work area even though `main` is absent?
7. Mutate the Rust diagnostic counter from `focusSurface`.
8. **PASS/FAIL:** does the authoritative Rust state remain responsive after the display change?
9. Recreate `main`.
10. **PASS/FAIL:** does recreated `main` open on a reachable display rather than remaining off-screen?

Record:

- Observer survives while main is absent: `PASS / FAIL`
- FocusSurface recovered automatically: `PASS / FAIL`
- Rust state responsive after topology change: `PASS / FAIL`
- Recreated main reachable: `PASS / FAIL`

## Scenario 3 — reconnect/reorder

1. Re-enable/reconnect the removed monitor.
2. If convenient, change its relative arrangement in Windows Display Settings (for example, move it from right of primary to left of primary).
3. **PASS/FAIL:** does Narro remain responsive without restart?
4. Click **Refresh Monitors**.
5. **PASS/FAIL:** do reported desktop positions/work areas reflect the new topology, including negative coordinates where applicable?
6. Place the Focus Panel left/right on the reconnected monitor.
7. **PASS/FAIL:** does explicit placement use the new work-area geometry correctly?

Record:

- Reconnect/reorder requires no restart: `PASS / FAIL`
- New topology enumerates correctly: `PASS / FAIL`
- New edge placement correct: `PASS / FAIL`

## Failure reporting

For any FAIL, report:

- which scenario/step failed;
- which monitor was disconnected/reconnected;
- whether `main` existed at the time;
- whether `focusSurface` was Panel or Timer mode;
- where the affected Narro window ended up;
- whether Narro remained responsive;
- a screenshot if the failure is visual/off-screen related and a screenshot is practical.

Do not mark the Milestone 1 display-topology TODO complete from compilation or unit tests alone. It requires the physical Windows observations above.
