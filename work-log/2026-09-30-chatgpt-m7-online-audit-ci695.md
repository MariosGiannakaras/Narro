# M7 full programmatic/online audit — Windows CI #695

Date: 2026-09-30

## User constraint and scope

The user currently has no access to the Windows physical test system. This slice therefore does **not** invent a physical PASS. It performs the strongest available programmatic/logical M7 audit, checks the current architecture against Windows/WebView2/Tauri guidance, hardens a real native-boundary weakness, expands deterministic transition coverage, and validates the exact current PR head through authoritative Windows CI.

## Exact PR / CI evidence

- PR: #192, branch `plan/m7-single-focus`
- Exact current head: `473af660566970ad4499eceda618abb8042f5f19`
- Windows CI: #695 / run `36680495272` — **PASS**
- validation gate: PASS
- Repository Preflight: PASS
- frontend/static M7 contracts + production build: PASS
- Rust fmt/check/clippy/tests: PASS
- floating performance harness self-test: PASS
- Windows visual regression: PASS
- reused frontend-dist verification: PASS
- Tauri release: PASS
- required artifact uploads: PASS

Artifacts:
- runtime `narro-m1-runtime-harness-windows-x64`
  - id `11082430041`
  - size 13,718,286 bytes
  - digest `sha256:0d1affdbbfd6beec4b9127190e4e9887a4ea6a516f683cf89276cdf135bede95`
- visual `narro-m5-visual-regression`
  - id `11081437955`
  - size 3,097,253 bytes
  - digest `sha256:e9bb288b980ed68d9f311f4fa602781a21bdcddb13e0ac06b6bd3e3648455f38`

The runtime implementation at this head is unchanged from the automated-green #693 runtime source. The only non-Markdown delta after #693 is one stricter static transition contract that rejects direct Focus-position mutation outside the shared WebView2-aware helper. #695 revalidates the whole pipeline on the exact current PR head.

## Physical evidence boundary

Latest direct physical evidence remains the exact #684 recording:
- `2026-09-30 02-02-23.mp4`
- SHA-256 `72360756a44ab94ac95aaf245beeadf1069fc91385268b68853bb17f570fd412`

It clears both known #679 failure signatures:
- three observed Panel→Timer transitions have no transparent/full-height host tail, white/blank host, teleport or overlap;
- the observed cross-DPI Timer→Panel return has no stale Narro/WebView viewport or browser scrollbar flash;
- 125% compact/expanded geometry is correct;
- the same `fas` task/session/time remains continuous.

Formal Gate 7 / Gate 12 physical acceptance remains OPEN/UNAVAILABLE because the recording lacks one complete Panel→Timer→Panel cycle, one complete Expand→Collapse cycle, and the exact-current 100%→125% drag-direction subcase. The user cannot currently produce supplemental physical evidence.

## Full M7 implementation audit

The replacement implementation is internally coherent and no currently reproduced M7 defect remains.

Confirmed in source/contracts:
- exactly `main` + one persistent `focusSurface`; no production `floatingTimer` WebView or `timer.html`;
- Panel, compact Timer and expanded Timer share one persistent Focus HWND/WebView and one React `FocusSurfaceCoordinator`;
- one authoritative Rust timer/session projection is shared through the coordinator;
- native Panel/Timer/expanded visible geometry is 340×700 / 340×110 / 340×300 logical and DPI-aware;
- ordinary presentation changes avoid create/destroy/hide/show and ordinary WebView resize as the mode-switch mechanism;
- incoming presentation is prepainted/inert before ownership transfer;
- Panel↔Timer native movement is finite and coordinated with renderer motion;
- Panel→Timer clips to the target region before native movement;
- cross-DPI Timer→Panel remains clipped while target host geometry settles, then uses the physically clean bounded 50 ms reveal guard;
- interactive and programmatic display recovery are serialized/deferred so they cannot fight active movement;
- all Narro-initiated Focus/Timer parent moves and rollback moves pass through one WebView2-aware position helper;
- saved placement, monitor removal recovery, bottom-edge expansion, constrained work-area fit and 125% logical→physical region math have deterministic Rust coverage;
- compact/expanded actions and subtasks remain connected to the authoritative mutation paths;
- Focus shortcut routing targets only the single `focusSurface`;
- Floating Timer attention motion is finite; no decorative infinite Timer animation is present;
- rollback/failure coverage includes native animated failure and renderer failure after native success;
- a 250-cycle deterministic Panel↔Timer stress test passes.

## Online engineering review

Relevant external platform evidence:

1. Microsoft WebView2 documents `CoreWebView2Controller.NotifyParentWindowPositionChanged` as the API for informing WebView2 that the parent or an ancestor HWND moved. It is explicitly separate from `Bounds` and is not documented as a compositor/viewport-settled acknowledgement.
   - https://learn.microsoft.com/en-us/dotnet/api/microsoft.web.webview2.core.corewebview2controller.notifyparentwindowpositionchanged
   - https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/win32/icorewebview2controller

2. WebView2 Controller3 exposes `RasterizationScale` and `ShouldDetectMonitorScaleChanges`; when monitor-scale detection is enabled, WebView2 tracks monitor DPI scale and updates rasterization scale.
   - https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/winrt/microsoft_web_webview2_core/corewebview2controller
   - https://github.com/MicrosoftEdge/WebView2Feedback/blob/main/specs/RasterizationScale.md

3. Win32 `SetWindowRgn` defines the portion of the HWND in which Windows permits drawing. Narro's one-shot presentation region changes therefore match the intended mechanism for hiding the unused lower part of the fixed Focus host.
   - https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowrgn

4. Tauri `WebviewWindow::with_webview` executes access to the native webview on the main thread and explicitly recommends pinning Tauri to at least a minor version when relying on the platform-native webview type.
   - https://docs.rs/tauri/latest/tauri/webview/struct.WebviewWindow.html

5. Wry has long notified WebView2 when the window position/size changes on `WM_WINDOWPOSCHANGED`. Narro's explicit notification after its own programmatic moves is therefore defense-in-depth and a deterministic local invariant; it is **not** claimed as the root cause of the #679 defect.
   - https://docs.rs/crate/wry/latest/source/CHANGELOG.md

6. A current Tauri Windows issue reports progressive degradation when `SetWindowRgn` is used on every continuous resize frame. Narro does not do that: region mutations remain finite presentation-boundary operations rather than a high-frequency native animation loop.
   - https://github.com/tauri-apps/tauri/issues/15569

7. Current WebView2 bug evidence also shows that repeated `NotifyParentWindowPositionChanged` is not a universal fix for unrelated stale/IME presentation problems. Consequently the physically clean clipped-settle guard is retained rather than replaced by notification alone.
   - https://github.com/MicrosoftEdge/WebView2Feedback/issues/5675

## Architecture verdict

**No radical M7 architecture change is justified.**

The single persistent `focusSurface` remains preferable to a second persistent Timer WebView:
- it preserves one renderer/session presentation authority;
- it eliminates two-Focus-window overlap by construction;
- it avoids the measured ~95 MiB floating-only cost observed in the rejected PR #191 experiment;
- it avoids repeatedly creating/repainting WebViews;
- it matches the known clean #684 physical behavior and current Windows/WebView2 constraints.

Do not revive PR #191 or introduce per-frame native region/resize animation without new evidence.

If a future exact-build physical test reproduces a cross-DPI stale-viewport defect after this hardening, the next escalation should investigate explicit WebView2 rasterization/DPI readiness or a renderer/native acknowledgement boundary. It should not automatically introduce a second WebView.

## M7 completion boundary

This audit supports a strong **implemented + automated-validated** M7 candidate, but not physical completion.

The following classes still require a real Windows environment under the repository's existing acceptance policy:
- strict Gate 7 transition repetition / normal-vs-reduced-motion observation;
- strict Gate 12 real mixed-DPI direction/work-area observation;
- interactive taskbar/topmost/fullscreen behavior on the replacement build where required;
- real replacement floating-only CPU/memory measurement (CI runs the harness self-test, not a physical steady-state measurement).

Therefore:
- PR #192 remains OPEN;
- it is not merged;
- no physical PASS is invented;
- no roadmap/current-slice/M1 counter advances;
- progress remains `4/10M || 2/5 | 11/19`.

## Continuation

There is no evidence-backed M7 source defect left to fix at this time.

Preserve exact PR head `473af660566970ad4499eceda618abb8042f5f19` and CI #695 as the latest automated-green candidate. Do not change source merely to chase unavailable manual evidence. Resume physical closure only when a suitable Windows environment exists, or fix only a newly observed exact-build failure signature.
