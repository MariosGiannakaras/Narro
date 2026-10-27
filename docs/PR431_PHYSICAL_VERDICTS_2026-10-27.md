> **Replacement-source boundary (2026-10-27):** The ten verdicts below are **frozen physical evidence for OLD PR431 head `6dce8daa`, PE `4acd49ce`**, not the new build. PR431 corrected the confirmed V10 Panel-first shortcut path in `50ebef094ee392b13d958586f8c074a57de9e015`; [CI40546804802](https://github.com/MariosGiannakaras/Narro/actions/runs/40546804802) **3/3 SUCCESS**, artifact **12753914605** ZIP/manifest/3 members independently verified, new PE SHA256 **`d069bb862a42a04a5554aea793f3c16e839cd34fd14e48817a18095b6d5dde97`**. [Immutable provenance](../work-log/2026-10-27-chatgpt-pr431-v10-replacement-exact-3of3-and-physical-provenance.md). **V10 new-source physical NOT RUN.** Old V10 physical FAIL remains historical real FAIL, previous V01–V09 PASS evidence is scoped to old binary and reusable only where unaffected. U-R04/U-R05 planned; PR436 physical not run.

# Current-candidate physical verdict summary — 2026-10-27

**9 PASS / 1 FAIL across the ten explicitly adjudicated subclaims listed below.** This is a reconciliation of already recorded verdicts, not new testing, an exhaustive physical inventory, or acceptance of every M1–M9 requirement. Candidate PR431 head `6dce8daa27e386823abb704d31a8ffa2a7b004de`, EXE SHA256 `4acd49ce81fb3b6778457dd060941cdeb4936e0078da6074e1a19c69005728c0`, CI40502071920. PR live-verified OPEN at this checkpoint. Previously reviewed historical builds are not added to this count.

| ID | Independently bounded requirement | Verdict | Evidence / limits |
|---|---|---|---|
| V01 | Clean real launch and exact candidate/process identity | PASS | Earlier P431-01, PID/path/EXE SHA + environment receipts. Preflight identity only. |
| V02 | Immediate Focus Panel side/monitor placement through Quick Preferences | PASS | Earlier P431-05 native placement outcome, same HWND,100/125% left/right receipts. No universal flicker/error-path claim. |
| V03 | Panel selected-side/top inset16DIP at existing100%/125% DPI | PASS | Earlier P431-06, calibrated Win32 rects20px@125%,16px@100%. |
| V04 | First hidden OFF Timer reveal at selected connected monitor anchor | PASS | Earlier P431-07 initially hidden host + direct shortcut + static/UIA receipts. Not a first-frame motion verdict. |
| V05 | Real Timer drag and retention through Panel/Compact/Expanded and Main show/minimize | PASS | Human P431-08, same HWND329194; drag[-296,+206], Timer[1908,222] retained through exercised modes/lifecycle. Held Escape not repeated; no full compositor/motion claim. |
| V06 | Actual tray Quit/relaunch, remember-position OFF resets Timer | PASS | Human P431-09, PID4640 exits, PID9260 same EXE, Timer[2204,16] rather than previous dragged point. |
| V07 | Actual tray Quit/relaunch, remember-position ON restores moved Timer | PASS | Human P431-09, saved ON, real drag[1503,110], PID9260 exits, PID17764 exact restart restores[1503,110]. Hidden-setting-toggle variant excluded. |
| V08 | Done after saved Preferences are ready and success-screen ON completes once and persists | PASS | Earlier P431-11 explicitly scoped after-ready completion/persistence PASS: task identities unchanged, completed count+1, visible success + tracked time. Cold-read/OFF/read-failure/audio variants excluded. |
| V09 | HDMI reconnect restores Timer on selected LG without wiping monitor preference | PASS | Human P431-10 recovery: same HWND30738078 visible[-445,20,-20,895], selected DISPLAY2 retained; original video~250–261s and native screenshot/receipts. |
| V10 | Selected monitor absent at fresh hidden OFF Timer reveal falls back to primary | FAIL | Human P431-10: actual cable disconnected; single-screen topology, HWND hidden after shortcut; stderr MONITOR_SELECTION_STALE five entries. Fallback fails; reconnect success does not negate failure. |

## Authoritative evidence

- [Earlier exact-candidate packet and full case limits](../work-log/evidence/pr431-native-20261027/README.md), acceptance-matrix.json and original media.
- [Human continuation: two unchanged originals, exact UTC/PTS pointers, native receipts and hashes](../work-log/evidence/pr431-human-20261027/README.md), acceptance-supplement.json and SHA256SUMS.json. Originals plus receipts published through f4f84189; later docs do not change executable identity.

## What remains outside these verdicts

**Recorded but awaiting complete relevant visual/transition analysis:** full Preferences first-reveal, Quick Preferences first-reveal, Search motion/reference comparison and Panel placement transitions, plus Reports pending-request pixel audit. These are analysis obligations on existing originals first, not automatic requests to record again. Some bounded endpoint observations already exist; no whole-family PASS from them.

**Explicitly unexercised variants:** hidden-Timer setting toggle across restart; Done during cold unsettled read, saved OFF, legitimate read-failure fallback and independent audible sound; Reports date/timezone, same-key refresh/error/Retry/PDF admission under pending requests. Complete each only where safe and required, using existing automated/native evidence appropriately; do not call an unrun requirement FAIL or call CI a physical PASS.

The older composite twelve-case tally **3 scoped PASS /8 PARTIAL /1 FAIL** groups multiple requirements per case. It is retained as a historical/coarse checklist view, not the user-facing tally of individual adjudicated claims. No single exhaustive physical PASS denominator across all milestones has yet been reconciled; these ten rows must not be presented as all physical checks complete.

## Next implementation and safety

Fix V10/P431-10 on the existing PR431 source-owner path, preserving V05–V07/V09. Include user-requested U-R04 correct actual monitor names and U-R05 actual desktop snapshot only inside existing monitor frame, no extra UI elements/new Refresh displays. [Exact approved scope](PR431_SCOPED_NATIVE_ACCEPTANCE_2026-10-27.md#explicit-user-additions--monitor-selector-2026-10-27). U-R04/U-R05 are planned and not counted as tested PASS/FAIL. Source owner then validates corrections and records only affected missing/regression native checks on the exact corrected executable; retain PR431 hold until appropriately resolved. Independently finish existing-original analysis rather than unnecessarily recapture.

Personal profiles restored hash-identically; no owned Narro or recorder active at preceding verified freeze. No code changes, capture or new CI in this reconciliation. PR389/419 strict compositor holds remain separate; formal M1–M4 accepted4/10 unchanged, M5–M9 OPEN, M10 hard entry/user approval gate preserved, optional M11/M12 inactive.
