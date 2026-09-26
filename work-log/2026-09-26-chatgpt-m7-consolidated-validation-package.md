# M7 consolidated latest-build validation package — 2026-09-26

## Scope

Documentation/package preparation only. No product source change and no Windows CI intended.

## Exact build

Validated source baseline:
`449eb5d1fda4a8d26832e803433209025a6dec38`, tree `51b27ba7a867dcea79a49927cb1ed4e0ee7bda6b`.

Windows CI #530: PASS.

Runtime artifact:
- ID `10902390320`;
- digest `sha256:726991f5a92eadda25eaa833d0a7443c21531896eb56e462609a0db6988cc6de`;
- prepared user package `narro-m7-latest-main-ci530-windows-x64.zip`.

## Validation consolidation

`docs/M7_FLOATING_RUNTIME_VALIDATION.md` was rewritten from the stale #507-era instructions to the current #530 baseline.

The single future physical session now covers only unresolved gates:
1. Panel/Timer continuity plus Expand/Collapse, animations On/Off;
2. Ctrl+Shift+T transition-boundary stress;
3. Ctrl+Shift+P visible/Panel/native-hidden and actual reduced-motion behavior;
4. secondary-monitor/topology/no-saved-placement recovery;
5. independent borderless full-screen stacking, optional exclusive fullscreen separately;
6. non-default taskbar / secondary monitor / constrained work area / high-DPI placement.

Previously settled drag, ordinary shortcut, same-monitor restore, primary-bottom expansion, maximized/F11 stacking, idle animation and performance checks are explicitly excluded from routine repetition.

## Blocking state

No further evidence-backed M7 source correction is recorded. The consolidated Windows physical session is the remaining blocker before M7 can close and M8 can begin.
