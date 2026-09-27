# Blitzit reference image canonicalization — complete

Date: 2026-09-27  
Agent: ChatGPT  
Scope: evidence/reference corpus organization only; no Narro application source/config/build changes

## Trigger

The user asked that official Help Center images be stored together with the existing Blitzit reference screenshots, that overlapping depictions be deduplicated in favor of the better evidence, and that filenames describe the actual visible content.

## Starting state

- Main at slice start: `3320cf511453695c302da98b382dae46a9805a22`.
- Existing local Blitzit screenshot folder: 30 supplied images plus README.
- Existing image filenames were mostly opaque (`Screenshot_*.png`, UUIDs, long Tool Finder video names).
- Help Center evidence docs recorded 26 official image URLs, but those source image bytes had not yet been materialized into the repository.

## Source-byte acquisition

Direct local runtime download from Framer CDN was unavailable, so a temporary PR-only GitHub Actions workflow was used to fetch the exact source bytes without screenshotting or recompressing them.

Evidence workflow:
- run `36346220292` — initial capture, PASS;
- artifact `blitzit-help-center-image-comparison`;
- artifact id `10940383012`;
- artifact digest `sha256:8ad4d18826acfe44d886ae23674d0fdd3f6a7799b78c4630034da43f54513558`.

The artifact contained:
- 26 official Help Center originals;
- the existing local screenshot corpus for side-by-side comparison.

The temporary workflow was removed from the branch after canonicalization and is not intended to reach main.

## Selection criteria

When two images materially depict the same UI state, canonical selection used this order:

1. current/direct supplied evidence;
2. newer source-product version;
3. more complete uncropped state;
4. resolution/sharpness;
5. less unrelated OS/tutorial chrome.

An alternate was retained only if it adds a distinct UI state, interaction state, detail crop, or useful desktop/window context.

## Dedupe result

### Supplied archive

- Original supplied screenshots: **30**.
- Retained after canonicalization: **29**.
- Removed from working tree: `Screenshot_11.png`.
- Reason: near-identical Reports Overview duplicate of `Screenshot_10.png`; only about 0.03% of pixels differ materially, and the retained capture is marginally sharper.
- Git history preserves the removed file.

### Help Center originals

- Official Help Center images compared: **26**.
- Retained locally: **17**.
- Not retained due to stronger existing current/direct overlap: **9**.

Rejected overlaps:
- list-card overflow;
- Productivity Overview;
- Time By List crop;
- Reports date-range picker;
- Sessions task-detail;
- Home toolbar crop;
- Preferences General;
- Preferences Alerts;
- Preferences Celebration.

## Final canonical corpus

Total retained reference images: **46**.

Breakdown:
- **22** current supplied v2.6.69 references;
- **17** official Help Center v2.x/current-reference originals;
- **7** historical Tool Finder references.

All retained files now use content-based descriptive names:
- `current-v2.6.69-...`;
- `help-v2x-...`;
- `historical-tool-finder-...`.

Canonical inventory and dimensions:
- `reference/original-blitzit-screenshots/CANONICAL_INDEX.md`.

Folder policy/naming rules:
- `reference/original-blitzit-screenshots/README.md`.

## Documentation reconciliation

Updated:
- `docs/RESEARCH_EVIDENCE.md` to use canonical filenames;
- `docs/BLITZIT_HELP_CENTER_EVIDENCE.md` with the 17 retained local Help images and 9 overlap decisions;
- `docs/BLITZIT_HELP_CENTER_TRACKER.md` with canonicalization counters;
- `docs/REFERENCES.md`;
- `STATUS.md`;
- `HANDOFF.md`.

The only remaining reference to `Screenshot_11.png` is intentional documentation explaining why that duplicate was removed.

## Validation

- canonical image count: PASS — **46**;
- provenance split: PASS — **22 current / 17 Help / 7 historical**;
- opaque UUID filenames in current research inventory: **0**;
- temporary capture workflow after canonicalization: removed from branch;
- application source/build semantics changed: **none**;
- validated application source baseline remains unchanged.

## Continuation

Do not recreate removed overlaps merely for completeness. When future source screenshots arrive:
1. compare against `CANONICAL_INDEX.md`;
2. keep a new image only if it is stronger or adds a distinct state/context;
3. name it by visible content plus provenance/version;
4. update the canonical index and evidence docs.

After this evidence PR merges, resume the repository-ordered VE-F003 source correction, then M8 Preferences/runtime work.
