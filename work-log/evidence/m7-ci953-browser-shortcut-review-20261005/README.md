# CI953 browser shortcut: bounded evidence analysis, 2026-10-05

Only eight sampled video frames and the paired action/UIA/preference records were reviewed. No new acquisition, source correction, test/build/CI or milestone closure. The complete two-minute recording was not reviewed frame by frame. This is a supplemental review, not an increment to the historical 44/100 reviewed-cell counter.

Exact candidate source: `38219e200fe3bec7309f8e03e72003184ca86d08`; Windows CI953; EXE SHA256 `bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8`.

[Immutable original packet](../m7-ci953-browser-shortcut-20261005/README.md), [whole MP4](../m7-ci953-browser-shortcut-20261005/video/full.mp4), [UTC actions](../m7-ci953-browser-shortcut-20261005/chronological-actions.csv). Whole MP4 SHA256: `008b0c822c327a7d7484201517488efbc8d6e5a03b1e8defccdbb64e15851fc3`. Original acquisition metadata remains unchanged.

| Condition | Recorded input UTC | Direct visual/native observation | Bounded disposition |
|---|---|---|---|
| Alternate Focus Mode enabled | Ctrl+T 15:32:02.6587455Z; Ctrl+W 15:32:03.6681778Z; Ctrl+Shift+T 15:32:04.6650947Z | At84s compact Timer overlays the desktop/browser;85.5s shows about:blank plus New tab. After closure/chord,87.5s and88s show one about:blank tab and Narro Focus Panel. Enabled UIA also lists one browser tab. | CONFIRMED: the global chord changes compact Timer to Panel while a browser is foreground; the closed tab was not restored in the sampled post-action state. This corroborates the reported shortcut conflict, not a new source regression diagnosis. |
| Alternate Focus Mode disabled | Space 15:32:09.0863032Z; Ctrl+T 15:32:09.9853841Z; Ctrl+W 15:32:10.9637700Z; Ctrl+Shift+T 15:32:11.9399469Z | Snapshot records toggle_focus_mode_enabled=false.92.5s shows two tabs;93.6s shows one about:blank tab;95.2s and95.6s still show one tab and browser without a visible Narro overlay. Disabled UIA also lists one browser tab. | OPEN: no visible Narro takeover in these samples, but browser reopening did not visibly succeed. This does not establish full shortcut-unregistration or browser compatibility PASS. |

The closed tab was an unused New tab, not a loaded, identifiable page. There was no positive-control reopen with Narro fully exited. The recording therefore cannot distinguish Edge restore-history behavior from an input/registration issue in the disabled case. No cause is assigned. A later targeted test should open a recognizable local page, close it, establish Ctrl+Shift+T reopening with Narro exited, then compare enabled/disabled Narro without changing source. No such new test was run here.

The regular browser and existing InPrivate browser are visibly distinct. The regular window has bookmarks; actual profile isolation was not verified by this review. Launch intent alone is not evidence of an empty/isolated profile. No existing user tab was intentionally closed in the recorded sequence.

[Disabled preference snapshot](../m7-ci953-browser-shortcut-20261005/inventory/shortcut-disabled.json), [restored snapshot](../m7-ci953-browser-shortcut-20261005/inventory/final-restored.json): false during second sequence, true after final Space. This proves persisted preference values, not every runtime registration state. [Enabled UIA](../m7-ci953-browser-shortcut-20261005/observations/enabled-browser.json), [disabled UIA](../m7-ci953-browser-shortcut-20261005/observations/disabled-browser.json).

## Derived frames

These are extracted from the original video, not separately acquired screenshots. Original4480x1080 frame cropped to primary-display rectangle2560x1080 at x1920,y0, then scaled to1600x675. Secondary monitor is intentionally outside this bounded review. Video offsets are exact extraction requests; UTC alignment uses original creation15:30:37.826219Z with approximately one-second uncertainty. Do not infer animation timing or transition continuity from these samples.

| Video seconds | Frame | State |
|---|---|---|
|84|[frame](frame-84.png)|Before enabled sequence; compact Timer|
|85.5|[frame](frame-85.5.png)|Enabled New tab created|
|87.5|[frame](frame-87.5.png)|Enabled post-chord; Focus Panel, one tab|
|88|[frame](frame-88.png)|Same sampled post-chord state|
|92.5|[frame](frame-92.5.png)|Disabled New tab created|
|93.6|[frame](frame-93.6.png)|Disabled tab closed, one tab|
|95.2|[frame](frame-95.2.png)|Disabled post-chord, one tab; unrelated ChatGPT toast|
|95.6|[frame](frame-95.6.png)|Same sampled post-chord state|

M8 browser compatibility remains OPEN; M7 C4 and all other open M1-M9/source-parity gates remain unchanged. No M10 checkbox/counter advancement; M11 dormant. Continue reviewing other existing recordings independently; reserve any browser retry for the precise missing positive control above.
