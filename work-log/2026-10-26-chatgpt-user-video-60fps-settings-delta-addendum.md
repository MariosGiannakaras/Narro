# 2026-10-26 — 60-fps original-video targeted pixel-change addendum

Analysis-only immutable note following [bounded user-video source review](2026-10-26-chatgpt-user-video-pr431-quickprefs-search-v4-evidence-review.md). **No native app execution, no full 12,500-frame visual certification.**

Original user MP4 SHA256 `063f8fcadb4cff1aa2b14770e26a6305249437432be470e74e940ae9a17a1f65`, 2560×1080, 60 fps. Three explicit bounded 60fps intervals extracted via ffmpeg (not one image per second) from original clip. For efficient per-frame pixel comparisons, fixed **1100×750** video region at **(0,150)** was grayscale-resampled to **220×150**; absolute difference of each decoded frame against its immediately preceding frame was computed, both mean intensity and fraction with difference greater than 25/255. The quantitative ratios refer to the *sampled ROI only*, not all original-resolution pixels or semantics.

| Segment | Decoded consecutive frames | Two highest event deltas (time, avg abs intensity, affected-pixel ratio) | Interpretation with inspected full-res stills |
|---|---:|---|---|
| Preferences first opening | 54 frames, ~10.200–11.100 s | 10.433 s: mean **10.50**, **8.61%** ROI; 10.567 s: mean **8.48**, **7.99%** | distinct initial modal/loading change, then materially different populated monitor layout ~133 ms later; direct static samples at 10.4 and 10.6 visually support two-stage rendering |
| Preferences subsequent opening | 48 frames, ~32.500–33.300 s | 32.700 s: mean **10.49**, **8.67%**; 32.817 s: mean **4.71**, **5.38%** | second opening likewise initial + subsequent change ~117 ms later; target-source executable identity unknown |
| Search light opening | 48 frames, ~49.400–50.200 s | 49.667 s: mean **119.97**, **89.85%** (large backdrop/modal change); next 49.683 s: mean **3.60**, **2.59%** | search open + smaller next-frame settle, does not itself prove a separate function failure. Longer captured Search old-style focus remains independently confirmed by observed stills |

The ROI includes both main backdrop and dialog pixels; percentages are **not** a claimed direct measurement of only the preferences modal. Exact video seek timestamps assume standard 60fps frame mapping; the fixed video 60/1 and 12,500-frame metadata were verified. This narrows the render anomaly in this **user-recorded process**, not proof that the process ran the exact PR431 SHA, since its executable path/hash were never captured.

Next: once actual process SHA is established, compare equivalent first-open 60fps native captures of that same build; only then assign the preferences source-replacement regression verdict, minimizing redundant HDMI or Timer tests. No changes to source/current physical PASS/milestone state.
