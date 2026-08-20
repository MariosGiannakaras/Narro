# Narro Branding Assets

This folder contains the official Narro visual identity supplied by the project owner.

## Canonical logo

The canonical Narro logo design is the user-supplied square RGBA artwork containing:

- the multicolor rounded-bar Narro symbol;
- the lowercase `narro` wordmark;
- the original magenta/purple → blue/cyan → green gradient treatment;
- transparent background.

Original supplied master metadata:

- dimensions: `1254 × 1254` px;
- color mode: RGBA with transparency;
- SHA-256: `c553431248aafc705ce20230a69418769e41e019f0eea4dc88d0949c9bb05a5a`.

The full-resolution chat upload is the canonical source design. The current repository file `narro-logo.webp` is a verified lightweight preview derivative for README/documentation use, not a replacement for the full-resolution master.

If the original PNG is later committed directly to this repository, use the path:

`assets/branding/narro-logo-master.png`

and verify that its SHA-256 matches the value above before treating it as the canonical binary master.

## Usage rule

Use this Narro identity for Narro-owned application branding. Do not substitute Blitzit logos, marks, screenshots, or other source-product branding.

Do not redesign, recolor, distort, stretch, rotate, add effects to, or replace the Narro logo merely for implementation convenience. Preserve its aspect ratio, transparency, gradient identity, and overall geometry.

Platform-specific derivatives are allowed when technically necessary, for example:

- Windows application icon / `.ico` multi-size bundle;
- installer icon;
- executable/window icon;
- Start menu / shortcut icon;
- taskbar icon;
- tray icon;
- splash/about/help surfaces if Narro later uses them;
- documentation and repository previews.

Those files should be generated from the canonical Narro artwork rather than independently redrawn.

## Small-icon treatment

The complete symbol + wordmark will not remain legible at very small Windows sizes such as 16–32 px. For tray/taskbar/app-icon derivatives, an icon-only crop/variant based on the Narro symbol portion may be more appropriate.

Treat that as a derived presentation of the same identity, not permission to invent a different mark. Validate the result at actual Windows icon sizes before adopting it. If a material visual reinterpretation is needed, request owner approval rather than silently changing the logo.

## Implementation guidance

When the application scaffold exists:

1. keep the master artwork in `assets/branding/`;
2. generate required Tauri/Windows icon sizes from it;
3. keep generated platform assets in the framework-appropriate icon directory while documenting their source;
4. use the logo only where branding is useful—do not turn every application surface into decorative branding;
5. test dark and light contexts so transparent/white wordmark portions remain readable;
6. preserve a high-resolution source and regenerate derivatives rather than repeatedly resampling a small derivative.

`narro-logo.webp` is intended primarily for lightweight repository/documentation display. Do not use it as the source for final high-resolution installer/application assets when the original master is available.
