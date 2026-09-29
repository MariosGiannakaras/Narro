# 2026-09-29 — Branding inventory, curation and Windows integration

**Agent:** ChatGPT  
**Scope:** Narro branding only

## Supplied PureVector kit inventory

The owner-supplied `Narro_Brand_Kit_PureVector.zip` was fully enumerated.

Counts:
- 101 total files;
- 16 SVG files;
- 73 PNG files;
- 12 documentation/platform metadata files.

Independent SVG inspection confirmed:
- 16/16 standalone SVG XML;
- zero `<image>` / `<feImage>`;
- zero embedded base64/data-URI raster payloads;
- zero external image/resource references;
- zero scripts;
- zero live `<text>` elements or runtime font dependency;
- geometry consists of paths, rounded rectangles and SVG linear gradients.

The current kit is therefore genuinely vector.

## Duplicate analysis

The source kit intentionally contains many aliases/export duplicates. Material examples:
- `narro-logo-vertical-light.svg` is byte-identical to `narro-logo-stacked-light.svg`;
- `narro-logo-vertical-dark.svg` is byte-identical to `narro-logo-stacked-dark.svg`;
- symbol light/dark/transparent SVG aliases are byte-identical;
- web light/dark favicon SVGs are byte-identical to their corresponding app-icon SVGs;
- multiple iOS/Android/web raster sizes are duplicate encodings of the same rendered icon.

Those platform export trees are not copied wholesale into Narro because the current product scope is Windows-only.

## Repository comparison

The repository already contained exact PureVector blobs for:
- horizontal light/dark;
- stacked light under the compatibility name `narro-logo-master.svg`;
- stacked dark;
- symbol;
- app-icon light/dark;
- brand tokens.

The explicit `assets/branding/narro-logo-stacked-light.svg` path was added as an alias to the exact existing stacked-light blob so light/dark lockups are symmetrical without duplicating artwork content.

The repository's branding PNGs visually match the intended Narro assets and remain raster derivatives, not canonical sources.

A separate issue was found in `src-tauri/icons/`: the committed generic application icon outputs still show the default Tauri blue/yellow mark. Historical Windows builds could nevertheless show Narro because `prepare:icons` regenerated those files in the build workspace before packaging. The committed generated outputs are therefore stale platform products, not valid branding masters.

## Canonical source curation on main

Direct-main branding/docs commit:

`4eec40492c2ac8678ea812d94be7003feed01be0`

Changes:
- added explicit `narro-logo-stacked-light.svg` alias to the exact canonical vector blob;
- rewrote `assets/branding/README.md` as the Windows-project asset inventory and usage contract;
- root README now uses a theme-aware `<picture>` element: stacked dark on dark UI and stacked light on light UI;
- clarified that PNG files and `src-tauri/icons/*` are derivatives, never editable/canonical artwork.

No workflow run was triggered for this direct-main branding-source/docs commit.

## Windows runtime integration staged

Branch:

`brand/pure-vector-runtime`

Exact current head:

`92551eaba723ce5ae94fa2cc92e0027e46df1942`

Changes relative to main:
- `prepare:icons` uses `assets/branding/narro-app-icon-light.svg` instead of the full stacked wordmark PNG;
- `predev` and `prebuild` both regenerate platform app icons, so dev and release packaging cannot silently keep the committed Tauri default icon;
- removed obsolete `scripts/sync-tray-icon.mjs`, which incorrectly reused the generic application icon as the tray icon;
- `src-tauri/icons/narro-tray-64.png` is a dedicated 64×64 transparent symbol-only derivative from the 1024 PureVector transparent symbol;
- added `scripts/verify-branding.mjs` and wired `check:branding` into frontend preflight. It guards pure-vector SVG constraints, canonical alias identity, app-icon canvases/colors, expected raster dimensions, RGBA tray output, icon-generation source, dev/build regeneration and the runtime tray path.

The dedicated tray symbol was inspected at 16/20/24/32/40/48/64 px and remains recognizable across the Windows tray scale range.

No PR and no workflow run have been triggered for this runtime branding branch.

## Retained vs excluded

Retained:
- stacked light/dark vector lockups;
- horizontal light/dark vector lockups;
- symbol-only vector;
- light/dark square app-icon vectors;
- compact brand token data;
- a small set of raster compatibility derivatives;
- dedicated runtime tray derivative.

Not copied:
- duplicate vertical aliases;
- duplicate symbol light/dark aliases;
- Android exports;
- iOS AppIcon exports;
- web/PWA/favicon export tree;
- visual cheatsheet as a runtime/repository asset.

These can all be regenerated from canonical sources if product scope changes.

## Validation boundary

Standing project instruction still forbids tests/builds/CI/app launches until explicitly authorized.

Therefore:
- static/manual asset inspection: **performed**;
- tests: **NOT RUN**;
- build: **NOT RUN**;
- CI: **NOT RUN**;
- installed Windows taskbar/Start/installer/tray observation: **NOT RUN**.

Current branding slice remains **2/3**. The third checkpoint is exact-head automated validation, merge and Windows-visible packaging/tray confirmation when authorized.
