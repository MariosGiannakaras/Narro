# Original Blitzit Screenshots — Reference Only

This directory contains the canonical visual-evidence set used for Blitzit/Narro fidelity work.

Current canonical corpus after the 2026-09-27 reconciliation:
- **22** current supplied Blitzit v2.6.69 references;
- **17** official Help Center originals that add a distinct state/context;
- **7** historical Tool Finder references retained only for version/history context;
- **46 total** retained image files.

See `CANONICAL_INDEX.md` for the exact state-by-state inventory, dimensions, provenance classes and duplicate decisions.

## Naming convention

Every retained file is named from its visible content, with a provenance/version prefix:

- `current-v2.6.69-...` — current supplied direct screenshots;
- `help-v2x-...` — official Help Center imagery from the v2.x/current-reference documentation family;
- `historical-tool-finder-...` — older review captures used only as corroborative/history evidence.

Do not reintroduce opaque names such as `Screenshot_5.png`, UUID-only filenames, CDN hashes, or long video-title filenames. New files should identify the actual visible surface/state.

## Canonical-selection rule

When multiple images show materially the same state, keep the strongest evidence rather than accumulating duplicates. Rank candidates by:

1. current/direct supplied evidence;
2. newer source-product version;
3. completeness of the visible UI state;
4. resolution/sharpness;
5. minimal unrelated OS/tutorial chrome.

Retain a second image only if it adds a genuinely distinct state, interaction, crop detail or desktop/window context.

The 2026-09-27 pass removed one near-identical supplied duplicate (`Screenshot_11.png`) and declined nine Help Center overlaps because stronger current/direct references already cover those states.

## Purpose

Use these files as evidence for layout, hierarchy, spacing/density, typography, radii/borders, dark/light relationships, task/list states, Focus/Floating composition, Preferences, Reports, Search, archive states and captured hover/expanded/destructive states.

They are **reference material, not implementation assets**. Do not ship, import, trace, or reuse Blitzit logos, branding, artwork or screenshots in Narro.

## Interpretation rule

A screenshot proves only the visible state/version captured. It does not prove hidden behavior, exact CSS values, animation timing/easing, persistence semantics, or that a visible source-product limitation should be copied.

Use this corpus together with:
- `docs/UI_UX_SPEC.md`
- `docs/BEHAVIOR_MATRIX.md`
- `docs/RESEARCH_EVIDENCE.md`
- `docs/SOURCE_AUDIT.md`
- `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md`
- `docs/BLITZIT_HELP_CENTER_EVIDENCE.md`

Direct recordings remain stronger for motion/transient behavior when the sequence is visible. Current direct screenshots remain stronger than older/help imagery for current static UI when the state materially overlaps.

## Source archive

The supplied research archive was:
- `blitzit Ss.rar`
- SHA-256: `18ab981eebbdf8327976c09bf732f62857d501dae08e6057dfc743c7378b5fab`
- 30 PNG source captures reviewed originally.

The canonical working set retains 29 of those source files under descriptive names; the near-identical Reports duplicate was removed from the working tree but remains recoverable from Git history.
