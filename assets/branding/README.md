# Narro Branding Assets

This folder contains the canonical Narro-owned branding sources curated from the owner-supplied `Narro_Brand_Kit_Complete.zip`.

## Canonical assets

- `narro-logo-master.svg` — canonical stacked logo for light surfaces; true vector source, dark `#171717` wordmark.
- `narro-logo-master.png` — 1536×1536 RGBA raster companion generated from the canonical vector for compatibility with the existing repository/build path.
- `narro-logo-stacked-dark.svg` — stacked logo for dark surfaces; `#F4F4F4` wordmark.
- `narro-logo-horizontal-light.svg` — horizontal lockup for light surfaces.
- `narro-logo-horizontal-dark.svg` — horizontal lockup for dark surfaces.
- `narro-symbol.svg` — symbol-only true vector mark with transparent background.
- `narro-symbol-transparent.png` — 1024×1024 transparent, padded symbol-only raster derivative.
- `narro-app-icon-light.png` — 1024×1024 opaque app-icon composition on Narro Snow.
- `narro-app-icon-dark.png` — 1024×1024 opaque app-icon composition on Narro Ink.
- `brand-tokens.json` — brand neutrals used by the supplied kit.

## Brand neutrals

- Narro Ink: `#171717`
- Narro Snow: `#F4F4F4`

The Ink/Snow pair has approximately 16.3:1 contrast, so either wordmark variant has strong contrast on its intended neutral background.

## Variant naming

`light` means **for light surfaces** and therefore uses the dark Ink wordmark. `dark` means **for dark surfaces** and uses the Snow wordmark.

The supplied kit also contained `vertical` aliases identical to the stacked assets and `light`/`dark` symbol aliases that were byte-identical. Those duplicate aliases are intentionally not retained here.

Android, iOS and web/PWA size exports from the kit are also intentionally not copied into this Windows-only repository. They are derivatives of the canonical sources above and can be regenerated if the product scope changes.

## Visual/technical validation

The supplied brand kit was checked before this replacement:

- all retained SVG files parse as standalone vector XML;
- retained SVGs contain vector paths/rectangles/gradients only, with no font dependency, external image, script or external URL reference;
- the kit's two `narro-app-icon-*.svg` files are not true vectors: each embeds a PNG payload, so they are intentionally excluded;
- the committed PNG derivatives are regenerated from the retained vector artwork at the audited kit dimensions, neutral backgrounds and spacing instead of treating those embedded-raster SVG wrappers as canonical;
- the raster logo and transparent symbol preserve alpha; the two app-icon PNGs are intentionally fully opaque;
- the light app icon background is exactly `#F4F4F4`; the dark app icon background is exactly `#171717`;
- the 1024 app icon keeps the symbol centered with about 10% horizontal and 17% vertical outer clearance;
- the symbol remains recognizable in downsample checks through 16–32 px, although final Windows tray/taskbar adoption still belongs to platform packaging validation.

## Repository usage

`narro-logo-master.png` keeps its existing filename so current repository references remain valid. The root README and current Tauri icon-generation path can continue resolving it without a source/config change.

Do not recolor, distort, rotate, add effects, or substitute Blitzit/source-product branding. Prefer SVG for scalable UI/documentation use. Use the dedicated app-icon or symbol assets for small icon surfaces instead of shrinking the full wordmark where the integration permits it.
