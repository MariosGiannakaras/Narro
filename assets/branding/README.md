# Narro Branding Assets

This directory is the curated **Windows-project brand source set** derived from the owner-supplied `Narro_Brand_Kit_PureVector.zip`. It intentionally does not mirror the entire cross-platform kit.

## Independent audit of the supplied kit

The uploaded kit contains 101 files: **16 SVG**, **73 PNG**, and 12 documentation/platform metadata files.

The SVG set was independently inspected rather than trusting only the included audit JSON:

- **16/16 SVG files parse as standalone XML**;
- no `<image>`, `<feImage>`, `<foreignObject>`, `<script>` or live `<text>` elements;
- no `data:image` / base64 raster payloads;
- no external image/resource references;
- artwork is made from vector paths, rounded rectangles and SVG linear gradients;
- the wordmark is outlined geometry, so rendering has no font dependency.

Result: the current PureVector kit is genuinely vector. The earlier kit problem where app-icon SVG wrappers embedded PNG data is no longer present.

The kit also contains many intentional duplicates. Examples: the vertical and stacked lockups are byte-identical, all light/dark symbol aliases are byte-identical, and the web favicon SVGs are byte-identical to the corresponding app-icon SVGs. These duplicates are not all useful in a Windows-only source tree.

## Retained canonical sources

| Asset | Role | Status |
| --- | --- | --- |
| `narro-logo-stacked-light.svg` | Stacked logo for light surfaces | canonical vector |
| `narro-logo-stacked-dark.svg` | Stacked logo for dark surfaces | canonical vector |
| `narro-logo-horizontal-light.svg` | Horizontal logo for light surfaces | canonical vector |
| `narro-logo-horizontal-dark.svg` | Horizontal logo for dark surfaces | canonical vector |
| `narro-symbol.svg` | Symbol-only transparent mark | canonical vector |
| `narro-app-icon-light.svg` | Square light launcher/app composition | canonical vector |
| `narro-app-icon-dark.svg` | Square dark launcher/app composition | canonical vector |
| `brand-tokens.json` | Brand neutral tokens | canonical data |

`narro-logo-master.svg` is retained as a compatibility alias of `narro-logo-stacked-light.svg`; both point to the same exact vector blob. There is no separate light/dark symbol file because the symbol artwork itself is identical on both themes.

## Retained raster derivatives

- `narro-logo-master.png` — stacked-light raster compatibility asset;
- `narro-symbol-transparent.png` — square transparent symbol derivative;
- `narro-app-icon-light.png` / `narro-app-icon-dark.png` — square opaque launcher derivatives.

These PNGs are convenience/platform derivatives. **They are not canonical editable artwork.**

The PureVector kit's two launcher PNG masters are opaque even though its bundled `validation.json` labels them RGBA. Independent image inspection reports RGB with no alpha, which is consistent with their full Snow/Ink backgrounds. The transparent symbol PNG is RGBA.

## Windows integration policy

Narro is Windows-only at the current project scope, so Android, iOS and web/PWA export directories from the source kit are intentionally excluded.

Windows uses two different brand treatments:

1. **Application/installer identity** — generated from the square app-icon vector, producing the Tauri/Windows PNG and multi-resolution ICO outputs.
2. **System tray identity** — a dedicated symbol-only transparent 64 px raster derivative, because a tiny tray surface should not use the full wordmark or the plated launcher composition.

The Tauri-generated files under `src-tauri/icons/` are **generated platform outputs**, not brand masters. The authoritative build/dev preparation must regenerate them from the retained Narro vector source. A generated file must never become the source from which another branding asset is resampled.

## Brand neutrals

- Narro Ink: `#171717`
- Narro Snow: `#F4F4F4`

The Ink/Snow pair is approximately 16.3:1 contrast.

## Usage

- Prefer SVG for scalable UI, documentation and repository branding.
- Use the light wordmark variants on light surfaces and dark variants on dark surfaces.
- Use the symbol-only asset for small identity surfaces.
- Use the square app-icon compositions only where an application/launcher icon is appropriate.
- Do not recolor, distort, rotate, add effects, stretch, or substitute source-product/Blitzit branding.
