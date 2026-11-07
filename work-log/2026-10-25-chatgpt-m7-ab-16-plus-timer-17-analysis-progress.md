# M7 A/B 16 transition + normal-media Timer alert — bounded source/evidence analysis progress, 2026-10-25

## Ownership, denominator and status
Owner: ChatGPT non-physical analysis; original protected native recordings acquired/frozen by Codex in `work-log/evidence/physical-acceptance-20261025/`. User requests per-analysis X/Y and completion percentage. Fixed **17 independent target cases = 8 A + 8 B + 1 normal-media recovered Timer alert**; not all PA families, all M5–M10 work, or 17 defects. Previously closed six G07/G13–16/G20 native claims are excluded and remain PASS.

**Current: 0/17 complete final visual/audio analyses (0%); 17/17 have completed stages 1 and 2 of 3 = 67% per case, with stage 3 PENDING.** This 67% is a checklist fraction, not a statistical confidence score, native PASS, or percent of video frames inspected. For transition cases: stage 1 = exact source/media/capture identity + native/QPC route; stage 2 = per-token timing/commit/error/capture sampling and settled screenshots; stage 3 = continuous original-MKV moving-path/Blitzit comparative visual examination incl. subframe limits, which **was not executed in this analysis**. For Timer alert: stage 1 = exact main/normal media/391→691 durable effect; stage 2 = callback-timed WAV PCM analysis; stage 3 = original-MKV flash assessment and human-audible sound identity/fidelity, **not executed**. These stages are mutually necessary; no case is 100% until stage 3 is completed or specifically evidence-limited with an accepted formal disposition.

Main `62a08100b3dd5028d0cacdfe19d56a66a2752ade`, resulting-main CI `40176625627` 3/3 green; A PR389 `ec9227a2e09a69c380d4605aaf9623bdd9b9c394`, CI `40084188512` green; B PR419 `43adb6a9d798dca56dd89c0f4f91c888e1d4fcd9`, CI `40084666277` green. Source and executable hashes available in the frozen packet README. No source/config/test/CI/Windows execution or personal-data action in this analysis.

## Per-transition evidence and progress
Abbreviations: P→C = Panel→Compact; C→E = Compact→Expanded; E→C = Expanded→Compact; C→P = Compact→Panel. Each row has `native.begin` and `native.committed`, no native failure/rollback event, and DwmFlush result 0 in sampled frame metadata. Durations below are measured begin→committed by native QPC, not presented video frame-perfect timings.

| Case | Exact candidate and motion | Route | Native raster frames | QPC begin→commit | Analysis progress | Native/visual conclusion |
|---|---|---|---:|---:|---|---|
| A-N1 | PR389 normal | P→C | 17 | 263.7ms | 2/3 = 67% | Native commit; visual PENDING |
| A-N2 | PR389 normal | C→E (A02) | 17 | 254.1ms | 2/3 = 67% | Native commit; historical ghost risk still OPEN |
| A-N3 | PR389 normal | E→C | 17 | 255.7ms | 2/3 = 67% | Native commit; visual PENDING |
| A-N4 | PR389 normal | C→P | 17 | 271.7ms | 2/3 = 67% | Native commit; visual PENDING |
| A-R1 | PR389 reduced | P→C | 2 | 23.7ms | 2/3 = 67% | Native commit; visual PENDING |
| A-R2 | PR389 reduced | C→E | 2 | 9.7ms | 2/3 = 67% | Native commit; visual PENDING |
| A-R3 | PR389 reduced | E→C | 2 | 8.5ms | 2/3 = 67% | Native commit; visual PENDING |
| A-R4 | PR389 reduced | C→P | 2 | 21.8ms | 2/3 = 67% | Native commit; visual PENDING |
| B-N1 | PR419 normal | P→C | 33 | 514.5ms | 2/3 = 67% | Native commit; visual PENDING |
| B-N2 | PR419 normal | C→E | 33 | 513.5ms | 2/3 = 67% | Native commit; visual PENDING |
| B-N3 | PR419 normal | E→C | 33 | 504.5ms | 2/3 = 67% | Native commit; visual PENDING |
| B-N4 | PR419 normal | C→P | 33 | 518.1ms | 2/3 = 67% | Native commit; visual PENDING |
| B-R1 | PR419 reduced | P→C | 2 | 28.1ms | 2/3 = 67% | Native commit; visual PENDING |
| B-R2 | PR419 reduced | C→E | 2 | 10.8ms | 2/3 = 67% | Native commit; visual PENDING |
| B-R3 | PR419 reduced | E→C | 2 | 10.8ms | 2/3 = 67% | Native commit; visual PENDING |
| B-R4 | PR419 reduced | C→P | 2 | 21.2ms | 2/3 = 67% | Native commit; visual PENDING |
| T-1 | Main normal/reduce=false/125%DPI | Recovered 391s alert | n/a | decided+claimed 11:56:14.177Z | 2/3 = 67% | Durable/signal scoped PASS; flash/fidelity PENDING |

Evidence: `acceptance/native-traces-A/focus-transition-trace.jsonl` (320 records), B (576), `A-normal-frames.json` (1597 records), `A-reduced-frames.json` (1107), `B-normal-frames.json` (407), `B-reduced-frames.json` (1735), motion/media settings JSON and candidate-specific settled image evidence. In both A and B, the same HWND is maintained across their own eight cases (A `3476386`; B `2033082`). A normal 250ms requested and B normal 500ms requested; reduced requests 1ms native, with nonzero observed wall duration including overhead. A normal raster steps 17 each; B normal 33 each; reduced 2 each. All sampled DwmFlush return codes were 0. Normal transitions had native QPC frame samples within their begin/commit windows; reduced transitions shorter than capture cadence may have zero mid-interval samples, which cannot independently certify transient pixels. Static settled screenshot evidence confirms distinct Panel/Compact/Expanded endpoints, not all intervening frames. Some large fixed-host crop regions include unrelated pixels beyond the actual visible region and cannot be scored as real Timer ghosting from screenshots alone.

## Alert bounded findings
`topology/secondary-normal-media.json` verifies Focus `reduce=false` and DPR 1.25; `topology/normal-motion.json` reports no reduced-media preference. `topology/timer-observation.jsonl` has the recovered run's durable `boundary_seconds:391` decided/claimed exactly once at `2026-10-25T11:56:14.177Z`, followed by next boundary 691 and monotone observed elapsed. `topology/audio-callbacks.jsonl`: 46 captured callbacks, first UTC `11:56:14.443636Z` (~267ms after claim); callback timestamps reflect captured chunks, not exact audible onset. `topology/standard-alert-loopback.wav` was decoded directly from the binary as WAV PCM stereo 48kHz 16bit: 188416 PCM data bytes, duration 0.98133s, sample-normalized RMS ~0.02982 and peak ~0.19574, verifying non-silence, **not confirming sound selection/identity/fidelity**. Original secondary 1920×1080 native MKV exists and is indexed around `11:56:14.177Z`, but its continuous frames were not decoded here; actual flash visibility and animation fidelity remain PENDING. Recovered lock poison did not reproduce; historical cause OPEN, no source fix implied.

## Technical limitations and exact next operation
GitHub UTF-8 file and base64 image paths supported native trace/JSON, source-specific static JPG and short WAV analysis. Complete MKV/analysis-v2 full moving-path binary frames could not be decoded in this tool environment in this pass. The frozen package contains all 11 original videos and already reviewed QPC sheets; do not mistake those existing acquisition/review facts for a new image-by-image acceptance. The prior 112-frame source review is preserved, not repeated. Source candidate physical holds remain: PR389 strict `PHYSICAL_BEFORE_MERGE`, PR419 dependent B acceptance; no merge and no milestone advancement.

**ONE NEXT ACTION:** use a binary-capable analysis environment or Windows operator on the **already frozen and hashed** original A-normal, A-reduced, B-normal, B-reduced MKVs and Topology secondary-normal-alert MKV to grade the remaining per-case stage 3 (moving path/absence of ghosting/clipping, credible video timing; normal-media alert flash and human audio identity). Reuse the existing indexed traces/derivatives, do not re-record previously completed cases, and only then move each 2/3→3/3 and record native PASS/FAIL/EVIDENCE_LIMIT individually. If a confirmed defect arises, implement a cause-led minimal regression-protected fix on the existing owned branch with new exact-head CI, not a speculative compositor patch.
