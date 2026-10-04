# CI936 physical checkpoint and diagnostic correction decision

Exact source `ff21477e57b42b7e672b439625db6e9a20abb152`, guarded merge `f9a282d0ee7bcc5e7b40abb83df459927036662a`, full Windows CI936/run37184564836 PASS. Production EXE SHA256 `4136582562a19aaa2fbd0cd2a67c49b4353117186a66be41fa84cb4968311a78`; isolated diagnostic `add3e892b6f08879730dbd017862d36f1d9ca94040ada29f7ae769c5c0b5be53`. Later merged M6 source is a separate baseline and is not silently certified by these observations.

## Exercised production result

- C5 **PASS**: real active compact Timer cross-monitor drag (~2986px), tray Quit08:10:26Z, same-EXE relaunch08:10:27Z, explicit Timer restore08:10:38Z at `(1280,616)`, same task paused325 durable seconds. Whole-session evaluator maximum movement3254px is not the final drag distance. Accepted evaluator result is frozen before the later ordinary Quit.
- Four-line Notes Save/restart persistence and completion retaining325 seconds **PASS**. Actual large-editor outward clamp100% normal and125% reduced inward resize/keyboard/Escape/Save were exercised. Completion advances the next pre-existing validation task; subsequent normal Quit stops it. No database restoration or time correction was performed.
- Physical pause/resume keyboard and Break pointer work while the finite native child exists; sampled GDI/USER counts stable24/46 before/after the keyboard probe. This is physical input evidence, not direct domain-command invocation.
- Continuous two-display60fps recording covers normal/reduced100%/125%, middle/bottom/edge expand-collapse, Panel returns, six hover actions, Notes and restart. Representative direct-frame review so far shows no Timer absence; final C4/canonical review is **OPEN**. Final package publication will include the complete stopped original recording and whole native log folder, with inspected ranges explicitly distinguished from exports.

## New diagnostic failures

`M7-OBS-20261004-15`: isolated diagnostic matrix at08:14:16Z yields2/4 PASS. Primary left/right pass; requested secondary placements return to saved primary preference after mixed-DPI recovery. Existing `runFocusPanelPlacementMatrix` invokes `position_focus_panel` without updating the preference that `revalidate_open_focus_panel_after_display_change` resolves. Saving the matching secondary preference in the isolated namespace and using native positioning physically reaches `(-425,0)`,425×875/DPI120. This supports a diagnostic-authority conflict; it does not justify disabling production topology recovery.

Decision: diagnostic placement temporarily uses the existing preference service for monitor/side, serialized with the step's native command and settled probe. Restore the original two placement fields on success/failure and retain combined errors if restoration fails. Test both automatic/null preference restoration and mid-step failure. Do not modify other settings or introduce new Focus windows.

`M7-OBS-20261004-16`: actual floating-performance preflight fails in the EnumWindows callback: `Cannot overwrite variable PID because it is read-only or constant.` No sample is valid or taken. The artifact's `$pid` local collides case-insensitively with PowerShell `$PID`; deterministic fixture self-tests do not execute that callback.

Decision: rename the owner variable, add native callback coverage through the same production enumeration helper, keep existing strict compact-region/Main-absent requirements and batch this change with15 into one exact-head Windows CI. Actual measurements must retain exact helper/source hashes and3×30s warmup/60s sample protocol.

## Topology and environment

Both physical displays were enabled for the production paths: LG primary2560×1080/100%, secondary LGTV1920×1080/125% left of primary. Intentional diagnostic Windows software removal at~08:21:57Z recovers the same process to a safe primary region without restart. Re-enable requests return success but current desktop enumeration remains primary-only, including after OBS/Settings closure. Reconnect is **OPEN**; native success codes alone are not proof. Restore original topology before closing it. The recording's disabled-display black interval is the intentional OS removal, not a Narro blank-frame finding.

Normal OS animation is restored, OBS recording stopped08:32:49Z and OBS closed. Production is normally quit; isolated diagnostic PID139484 remains the sole Narro root, Main destroyed, compact no-active-task Focus alive. Complete artifacts remain under ignored `artifacts/m7-ci936-physical-20261004/run-final` and `artifacts/m7-pr230-ci936/candidate/Narro-M7-Logs` until final publication. Private production app-data safety backup is excluded from publication.

Counts remain `3/10M || 3/5 | 14/19`. This checkpoint advances no full milestone/source-parity counter.
