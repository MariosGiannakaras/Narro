# 2026-09-25 — M7 transition frame analysis helper

Agent: Codex. Source baseline remains `d7ae14462af677e1c04c4b2966cd1ce1a857d5d3`; no product behavior changed. Added optional `scripts/analyze-focus-transition-frames.py` and executable fixture tests `scripts/test-analyze-focus-transition-frames.py` to flag pale, text-free runs in fixed PNG desktop captures. The helper is an evidence aid, not a compositor PASS oracle: occlusion, crop choice, and pale real content can cause false results. It requires local Pillow and is not part of the release runtime.

Local PASS: two executable fixture tests; Python compile; `npm run check:config`; `git diff --check`. Running the helper on machine-local #507 captures found candidate intervals `[280,280]` and `[282,283]` for the normal Panel→Timer capture, `[264,265]` with Windows animations Off, and `[269,270]` for reduced-motion Timer→Panel. The isolated frame 280 is the nearly faded outgoing Panel, showing why candidate frames still require visual inspection. No Windows CI or new physical test was run for this diagnostic-only slice.

The M7 visual FAIL and next product-code action remain as in `HANDOFF.md`: fix native show/React publication ordering with recovery semantics and executable async tests, then validate exact head and retest physically. No M7 checkbox closes from this helper.
