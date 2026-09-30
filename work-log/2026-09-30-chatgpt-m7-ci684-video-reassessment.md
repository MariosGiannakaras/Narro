# M7 CI #684 video reassessment — scrollbar, DPI-settle, and motion findings

Date: 2026-09-30

## Trigger

The user questioned whether the CI #684 recording still contained:
- Narro scrollbars after mixed-DPI movement;
- visibly drag-like Panel↔Timer motion;
- size/layout crowding.

The recording was re-read from zero rather than treating either the prior assistant interpretation or the user's recollection as authoritative.

## Exact evidence

Recording:
- `2026-09-30 02-02-23.mp4`
- SHA-256 `72360756a44ab94ac95aaf245beeadf1069fc91385268b68853bb17f570fd412`
- 4480×1080, 60 fps, 37.516667 s
- exact tested source: CI #684 / PR #192 head `274cf727f4d5b693904c2ff10f3835224368c4e8`

## Corrected findings

### 1. Persistent Narro document scrollbar — CONFIRMED

The previous interpretation that visible scrollbars belonged only to the Windows Settings window was incorrect.

A vertical browser scrollbar is visible inside the Narro Timer itself:
- expanded Timer around ~18.4 s;
- settled compact Timer around ~25.8 s on the 125% display;
- compact Timer after the 125%→100% move around ~27.8 s, after the native visible height has already settled.

The scrollbar occupies/crowds the Timer's right edge and visually competes with the rightmost control area in expanded mode.

This is a real M7 layout/overflow defect and is not a transient Settings-window artifact.

### 2. 125%→100% drag exposes a transient physical-size mismatch — CONFIRMED

During the ordinary cross-monitor drag:
- ~27.3–27.5 s: the target 100% Timer content is already approximately 320–325 px wide, but the visible native height remains ~138 px (the previous 125%-scaled compact height);
- by ~27.8 s: visible height settles to ~110 px.

This means renderer/monitor scale and the native visible region are briefly out of phase after crossing from 125% to 100%.

This is separate from the older #679 stale Panel viewport/browser-scrollbar flash. #684 fixed that older return-to-Panel signature, but the compact Timer drag still has a transient DPI-region mismatch.

### 3. Programmatic Panel→Timer cross-monitor motion is visibly drag-like — CONFIRMED

Frame geometry around the first Panel→Timer transition:
- ~14.433 s: Panel x≈4124;
- ~14.467 s: compact surface x≈3940;
- ~14.500 s: x≈3550;
- ~14.533 s: x≈3167;
- ~14.667 s: x≈1636;
- ~14.700 s: x≈1445;
- ~14.733 s: x≈870.

The same HWND therefore traverses roughly 3250 physical px across the desktop in about 0.27 s using the current finite position animation.

At ~14.733 s the visible Timer is still ~340×110 physical; at ~14.767 s it becomes ~424/425×138 after reaching the 125% display. So the long native travel also ends with a visible cross-DPI size adjustment.

The transition is continuous, but the visual character is closer to a dragged/flying native window than a restrained connected morph. This is a UX quality defect, not merely subjective wording.

### 4. Layout crowding — CONFIRMED / principally explained by overflow

Expanded mode around ~18.4 s shows the browser scrollbar consuming the right edge beside the rightmost controls. The current CSS already has internal min-width and grid constraints, so the first correction should remove document-level overflow rather than adding arbitrary min/max scaling rules to individual controls.

## Why the prior #684 disposition was too optimistic

The previous review correctly observed that #684 removed:
- the #679 full-height transparent host tail;
- the #679 stale cross-DPI Timer→Panel viewport/browser-scrollbar flash.

It incorrectly generalized that result into "no Narro/WebView scrollbars" and did not distinguish:
- the persistent Timer document scrollbar;
- the compact Timer's delayed DPI-region correction after manual cross-monitor drag;
- the aesthetic/native-motion problem of moving the HWND across several thousand pixels.

## #684 → #695 implementation delta

The runtime hardening after #684 adds WebView2 parent-position notification and stronger tests. It does **not** change:
- `focusDocument.css` document overflow sizing;
- Timer/Focus CSS layout;
- the 270 ms linear native position interpolation policy.

Therefore the persistent scrollbar and drag-like transition are not fixed by #695. The explicit WebView2 notification may improve timing, but it does not by itself prove the observed DPI-region mismatch is gone.

## Platform guidance

- WebView2 can track monitor scale changes and update rasterization scale.
- Win32 `WM_DPICHANGED` supplies the new DPI and a suggested scaled window rectangle; per-monitor-DPI apps are expected to keep native geometry synchronized with that DPI.
- CSS `overflow:hidden` suppresses document scrollbars when the surface itself is intentionally clipped and internal scroll containers own any required scrolling.
- Windows Fluent motion guidance uses eased, context-appropriate point-to-point motion; linear traversal is not the preferred default for polished movement.

## Corrective direction

A narrow M7 corrective slice is justified:

1. Focus document viewport:
   - explicitly make `html/body/#root` exact-size, zero-minimum, and `overflow:hidden`;
   - preserve internal component scroll containers where scrolling is intentional.

2. Mixed-DPI interactive move:
   - react to `WM_DPICHANGED` during an interactive Timer drag by refreshing only the native visible region for the new DPI;
   - continue deferring full position/host-size recovery until the native move loop exits so recovery cannot fight the user's drag.

3. Motion:
   - replace linear native position interpolation with an eased point-to-point curve while retaining finite ~270 ms connected motion and reduced-motion behavior;
   - do not return to per-frame JS resize or a second Timer WebView.

4. Add regression contracts/tests and run exact-head Windows CI.

## State

These are new exact-video findings. PR #192 must remain open. Gate 7 and Gate 12 are again evidence-backed corrective work, not merely unavailable repetition gaps.

No milestone/counter advances from this reassessment.
