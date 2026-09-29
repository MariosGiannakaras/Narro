# 2026-09-29 — PR #192 CI #672 physical Gate 7 failure

**Agent:** ChatGPT  
**Scope:** exact-build Gate 7 physical continuity review  
**Candidate:** PR #192 / `plan/m7-single-focus`  
**Exact source head:** `73d10ab6a21d731ca363e9932b4ccaf13a000b43`  
**Windows CI:** #672 / run `36589997295` — PASS  
**Runtime artifact:** id `11043444940`, digest `sha256:e1110b10c6d7cb867401126df931f3b52af414f097bb6a0bd9d790f6dac2fd76`

## Capture provenance

User-supplied recording: `2026-09-29 20-49-29.mkv`

- SHA-256: `b843eaa81d8296fe03febfb79e6dbb1f95b2a0834caf11acec68f2f467df4536`
- H.264, 2560×1080
- 60 fps
- duration: 49.384 s
- Windows Ease of Access / Display settings are visible at the start with **Show animations in Windows = On**.
- One identifiable task, `fas`, remains the active Focus task through the tested transitions; the running timer advances rather than resetting.

The raw user recording is not committed to the repository. The hash/timestamps below are the durable evidence index.

## Gate 7 result

**FAIL.**

The single-host architecture removes the earlier split-window overlap mechanism, but the exact #672 build still exposes a large blank/light Focus host area at Panel↔Timer boundaries.

### Repeated Panel → compact Timer failure

Frame analysis of the 60 fps recording found the same near-solid blank/light 340×700 host exposure on four Panel→Timer transitions:

- ~4.883–5.117 s — 15 captured frames;
- ~11.167–11.383 s — 14 frames;
- ~21.950–22.167 s — 14 frames;
- ~25.400–25.617 s — 14 frames.

The first sequence was visually inspected frame-by-frame: the populated Panel contracts/disappears while the native host is still fully exposed, leaving an approximately 0.23–0.25 s blank/light lower host before the compact Timer appears at its target position.

### Timer → Panel boundary

Shorter blank/light host exposure is also visible at the reverse boundary:

- ~8.050–8.100 s;
- ~19.100–19.150 s;
- ~24.367–24.417 s.

These are much shorter than the Panel→Timer failure but confirm that the same underlying unpainted/opaque document background can become visible while native region and renderer clipping are sequenced.

### Compact ↔ expanded Timer

The sampled compact/expanded cycles around 13–18 s do **not** show the same full-height blank-host tail. Gate 7 nevertheless fails because the Panel↔Timer criterion is strict and repeatedly violated.

## Evidence-backed root cause

The failure matches current implementation mechanics:

1. `focusSurface` is correctly configured as a transparent Tauri window.
2. `App.css` still gives `:root` and `body` an opaque `var(--color-canvas)` background.
3. Panel→Timer intentionally animates the active Panel clip **before** the Win32 region is reduced.
4. Timer→Panel expands the native region before the prepared Panel clip has fully revealed.
5. Therefore the persistent WebView's opaque document canvas is exposed whenever presentation clipping and the native region temporarily disagree.

This explains why the visible failure is a blank/light host rather than desktop transparency, without requiring another window architecture change.

## Corrective scope

Use the existing PR #192 branch and keep the selected one-`focusSurface` architecture.

Narrow correction:
- give the runtime `focus.html` document a transparent root/body/#root canvas so the already-transparent Tauri host does not paint `var(--color-canvas)` into clipped regions;
- preserve opaque backgrounds inside the actual Panel/Timer presentation components;
- make focus-document transparency a repository/preflight contract so it cannot regress;
- do not change timer/session authority, native region geometry, Window count, or compact/expanded sequencing without new evidence.

After the correction:
1. run the narrow frontend/config/transition contracts locally where available;
2. run authoritative exact-head Windows CI on the corrected PR head;
3. retest Gate 7 on that exact artifact with Windows animations On;
4. keep Gate 12 open until the 125% secondary-monitor physical test is available.

## Progress

No validated progress counter advances on this failure.

`4/10M || 2/5 | 11/19`

Gate 7 remains OPEN/FAIL. Gate 12 remains OPEN/NOT RUN on the replacement.
