# Blitzit — unified comparison corpus

All Blitzit reference material is now under `reference/original-blitzit/`. This directory is **source evidence**, not a Narro application asset or test result.

| Area | Files | Purpose |
| --- | ---: | --- |
| [`screenshots/`](screenshots/CANONICAL_INDEX.md) | 46 images | 22 current direct, 17 official Help Center, 7 historical reference states |
| [`videos/inbox/`](videos/inbox/README.md) | 19 original MP4 + 19 matching SRT | Direct interaction/motion evidence and transcripts, retained as same-basename pairs |
| [`extracted-frames/`](extracted-frames/) | 2 PNGs | VE005 excerpts derived from original Blitzit video; **not separately acquired original screenshots** |

The detailed original→new path, exact Git blob SHA, provenance, and logical size of each of the **86 media/source files** are recorded in [`SOURCE_MANIFEST.json`](SOURCE_MANIFEST.json). Screenshots retain the original [`CANONICAL_INDEX.md`](screenshots/CANONICAL_INDEX.md); videos retain their original filenames, captions and original [`README.md`](videos/README.md). No original bytes were changed by migration.

Use original Blitzit images and videos **only to compare** new Narro builds/recordings; do not ship or embed them in the app. Future fresh Narro physical recordings belong in separately controlled Narro acceptance evidence, **not** here. Historical Git paths that predate consolidation remain discoverable in prior commits and immutable work logs; links in active project docs point to this consolidated root.

Evidence interpretation and progress: [`docs/EVIDENCE_ROUTING_MAP.md`](../../docs/EVIDENCE_ROUTING_MAP.md), [`docs/BLITZIT_VIDEO_EVIDENCE.md`](../../docs/BLITZIT_VIDEO_EVIDENCE.md), and [`docs/PHYSICAL_ACCEPTANCE_NEW_RECORDING_BASELINE_2026-11-06.md`](../../docs/PHYSICAL_ACCEPTANCE_NEW_RECORDING_BASELINE_2026-11-06.md). The original 27-family Narro cleanup safety block is unaffected.
