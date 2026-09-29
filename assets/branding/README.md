# Narro Branding Assets

This folder contains the canonical Narro-owned branding sources curated from the owner-supplied `Narro_Brand_Kit_PureVector.zip`.

## Canonical assets

- `narro-logo-master.svg` — canonical stacked logo for light surfaces; true vector source, dark `#171717` wordmark.
- `narro-logo-master.png` — 1536×1536 RGBA raster compatibility derivative of the canonical stacked logo.
- `narro-logo-stacked-dark.svg` — stacked logo for dark surfaces; `#F4F4F4` wordmark.
- `narro-logo-horizontal-light.svg` — horizontal lockup for light surfaces.
- `narro-logo-horizontal-dark.svg` — horizontal lockup for dark surfaces.
- `narro-symbol.svg` — symbol-only true vector mark with transparent background.
- `narro-app-icon-light.svg` — square true-vector launcher composition on Narro Snow.
- `narro-app-icon-dark.svg` — square true-vector launcher composition on Narro Ink.
- `narro-symbol-transparent.png` — 1024×1024 transparent, padded symbol-only raster derivative.
- `narro-app-icon-light.png` — 1024×1024 opaque app-icon raster derivative on Narro Snow.
- `narro-app-icon-dark.png` — 1024×1024 opaque app-icon raster derivative on Narro Ink.
- `brand-tokens.json` — Narro brand neutrals.

## Brand neutrals

- Narro Ink: `#171717`
- Narro Snow: `#F4F4F4`

The Ink/Snow pair has approximately 16.3:1 contrast, so either wordmark variant has strong contrast on its intended neutral background.

## Variant naming

`light` means **for light surfaces** and therefore uses the dark Ink wordmark. `dark` means **for dark surfaces** and uses the Snow wordmark.

The supplied kit also contains vertical aliases and symbol aliases. Those duplicates are intentionally not retained when they do not add a distinct Narro asset. Android, iOS and web/PWA exports also remain outside this Windows-only repository because they can be regenerated from the canonical vector sources if product scope changes.

## Pure-vector audit

The uploaded `Narro_Brand_Kit_PureVector.zip` was independently checked rather than trusting only its included audit metadata:

- all **16/16 SVG files** parse as standalone XML;
- no SVG contains `<image>`, `<feImage>`, `<foreignObject>`, `<script>` or `<text>`;
- no SVG contains a `data:image` / base64 raster payload;
- no SVG references an external URL or external image resource;
- the artwork is composed from vector paths/rectangles and SVG gradients;
- wordmarks are outlined paths, so the SVGs have no runtime font dependency;
- both `narro-app-icon-*.svg` files are now genuine vector compositions. This supersedes the previous kit, whose app-icon SVG wrappers embedded PNG data.

The core logo/symbol SVGs in this repository were already byte-identical to the corresponding files in the PureVector kit. The meaningful source correction is the addition of the audited pure-vector app-icon SVGs and use of vector sources for scalable branding.

## Repository usage

Prefer SVG for repository/UI/documentation branding. Use the stacked/horizontal lockup for logo surfaces, the square app-icon composition for launcher/package identity, and the symbol-only mark for very small system surfaces such as the tray.

PNG files are derivatives for integrations that require raster input; they are not the canonical editable brand source.

Do not recolor, distort, rotate, add effects, or substitute Blitzit/source-product branding.
