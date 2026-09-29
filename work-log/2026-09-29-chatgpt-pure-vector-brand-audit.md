# 2026-09-29 — PureVector branding audit and runtime staging

**Agent:** ChatGPT  
**Scope:** user-directed Narro branding correction; roadmap milestone counters unchanged

## Input and independent vector audit

The owner supplied `Narro_Brand_Kit_PureVector.zip`.

The package was independently inspected rather than trusting only its bundled `vector-audit.json`:

- **16/16 SVG files** parse as standalone XML;
- no SVG contains `<image>`, `<feImage>`, `<foreignObject>`, `<script>` or `<text>`;
- no SVG contains `data:image` / base64 raster payloads;
- no SVG references external image/resources;
- retained geometry is vector paths/rectangles with SVG gradients;
- wordmarks are outlined paths and have no runtime font dependency.

Result: the supplied SVG set is genuinely vector. This specifically corrects the previous kit problem where app-icon SVG wrappers embedded PNG data.

## Repository comparison

The existing core Narro vector assets were already byte-identical to the PureVector kit:

- stacked light master;
- stacked dark;
- horizontal light/dark;
- symbol;
- brand tokens.

The material source delta was the corrected app-icon SVG pair.

Exact PureVector app-icon Git blobs:

- light: `f991d44e5babe8951575df676b2296bc19cc275f`;
- dark: `dbcb2efc2dfcfa1d0f5b6cf53a0cde7086236c02`.

## Direct-main canonical source/docs correction

Commit:

`3df07e9411f7af5f6279b48ab0632013313f053f`

Changes:

- added exact pure-vector `assets/branding/narro-app-icon-light.svg`;
- added exact pure-vector `assets/branding/narro-app-icon-dark.svg`;
- corrected `assets/branding/README.md` to the PureVector source/audit truth;
- switched root README branding display/source from the raster master to `narro-logo-master.svg`.

These new SVGs are canonical non-runtime assets at this point; the commit used `[skip ci]` and GitHub reports **zero workflow runs** for the commit.

## Runtime packaging/tray wiring staged off main

Branch:

`brand/pure-vector-runtime`

Exact unvalidated head:

`d2521cf67b46215c2e961a34751af9cb5a20ab81`

Diff versus current main is intentionally limited to:

- `package.json`: `prepare:icons` now uses `assets/branding/narro-app-icon-light.svg` as the Tauri launcher/package icon source;
- removed obsolete `scripts/sync-tray-icon.mjs`, which previously copied the generic generated 64×64 package icon into the tray;
- replaced `src-tauri/icons/narro-tray-64.png` with a dedicated 64×64 transparent symbol-only derivative downsampled from the PureVector kit's 1024×1024 transparent symbol export.

The tray and package identity are therefore separated correctly: square app-icon vector for launcher/package identity, symbol-only raster derivative where Tauri's runtime tray inclusion needs a small bitmap.

No PR was opened. The Windows workflow triggers only on `main` pushes or pull requests to `main`, and GitHub reports **zero workflow runs** for this branch head.

## Validation boundary

By the standing user instruction:

- tests: **NOT RUN**;
- builds: **NOT RUN**;
- CI: **NOT RUN**;
- app launch: **NOT RUN**;
- Windows tray/taskbar/installer physical validation: **NOT RUN**.

Therefore the runtime branch is implemented but **not validated and not merged**. It must not be described as accepted application source yet.

## Concurrent M7 truth discovered during startup

Live repository inspection corrected stale handoff state:

- PR #192 is open on `plan/m7-single-focus`;
- exact head: `1fb5a6fd0e776643c858380fc6721fc777bffbf3`;
- Windows CI #652 / run `36561562029`: **FAIL**;
- first evidence-backed failure is `scripts/test-single-focus-architecture.mjs`: `Timer placement must be saved before transition-time save suppression begins`.

No rerun or M7 source change was made in this branding slice.

## Progress

- General roadmap: **4/10 milestones complete**.
- Current small branding slice: **2/3 complete**.
  1. independent vector audit — complete;
  2. canonical source/docs correction — complete;
  3. runtime packaging/tray validation + merge — blocked by the standing no-validation instruction.

## Exact continuation

When the user explicitly authorizes validation, validate exact branding head `d2521cf67...`, then open/validate a normal PR, merge with expected-head protection, validate resulting `main`, and record physical Windows branding evidence as required. Until then, preserve the branch and do not trigger CI.
