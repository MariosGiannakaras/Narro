# 2026-10-06 — M6 P3-M6-01 Board→Focus morph design analysis

## Scope

Design/evidence analysis only while PR242 P3-M6-05 exact-head CI is pending. No production source/config/test behavior is changed by this record.

The goal is to replace PR229's current board-opacity fade with the canonical VE-003 Board→Focus geometry character without violating the adopted two-window Narro architecture, timer/session authority or Windows reliability invariants.

## Evidence reopened

Canonical Pass-3 already records Board→Focus as approximately 0.22 s shrink/translate window morph rather than page fade. The raw VE-003 MP4 was reopened narrowly because implementation design requires knowing whether the board content itself scales/reflows or is visibly cropped during the native geometry change.

Dense 60 fps review around the transition confirms:

- the board window begins shrinking/translating while the existing board pixels/layout remain visually fixed and are progressively clipped;
- the board does **not** responsively reflow its columns during the early geometry contraction;
- after substantial contraction, the rendered hierarchy swaps to Focus content and the geometry continues toward the narrow final panel;
- the source therefore demonstrates a window/surface morph, not a content-level opacity fade or CSS scale;
- the recording establishes visible behavior only. It does not establish Blitzit's internal window count, native APIs or renderer architecture.

Representative reviewed raw frames were around the transition where:
- full board remains visible immediately before contraction;
- an intermediate frame retains Backlog / This Week / part of Today while the right side is physically clipped;
- the next hierarchy shows Focus Today content in a still-not-fully-settled narrow window;
- the final panel settles at the desktop edge.

## Current Narro mismatch

Current `BlitzEntryButton.tsx`:
1. commits authoritative `start_blitz`;
2. applies a 250 ms `data-blitz-focus-transition="fading"` opacity fade to the Main list board;
3. invokes `present_focus_for_blitz`.

Current Rust `present_focus_for_blitz` positions/presents the retained `focusSurface`, but does not implement the source geometry morph.

The domain ordering from PR229 remains correct and must not change: the timer/session start is authoritative and independent of presentation effects.

## Required design constraints

Preserve:

- exactly the normal `main` + persistent `focusSurface` WebViews;
- no third persistent WebView and no second timer authority;
- no high-frequency JavaScript native geometry loop;
- current selected-monitor/side Focus Panel target geometry;
- current coordinator path when `focusSurface` is already visible;
- reduced-motion removal of nonessential translation/scale;
- exact Main geometry/state recovery on visual-transition failure;
- committed timer/session state even if the optional visual effect cannot be acquired;
- direct Focus presentation fallback when capture/morph preparation fails but Focus can still be shown.

## Selected bounded mechanism for implementation

For the normal hidden-Focus entry path, use a **finite native Main-window visual morph with frozen renderer pixels**, not a CSS board transformation.

Proposed sequence:

1. `start_blitz` remains committed first in the renderer.
2. Rust prepares the hidden persistent `focusSurface` in Panel native geometry and records the final target rect.
3. Capture the current Main WebView pixels through the existing WebView2 `CapturePreview` path; never use parent/desktop GDI pixels.
4. Install a finite raster child over Main's client area so Main renderer reflow cannot become visible while native geometry changes.
5. Snapshot Main position/size/window-state needed for rollback/restore.
6. On an ordinary restored Main window, animate the **native Main window rect** with the existing bounded Rust-side point-to-point easing/step discipline toward the prepared Focus Panel rect. The frozen child remains fixed and is naturally clipped by the shrinking parent, matching the observed source character.
7. At the endpoint, hide Main, restore its original geometry while hidden, clear the finite raster, then show/focus the already-prepared `focusSurface`.
8. Reduced motion bypasses the geometry animation and performs the direct Main→Focus handoff.
9. Maximized/fullscreen/minimized or otherwise unsafe Main states should prefer a direct reliable handoff rather than mutating user window state solely for parity.
10. If capture/raster/animation setup fails, restore Main geometry/visibility and fall back to direct Focus presentation. Do not report a committed focus session as failed merely because the optional morph effect failed.

Why this mechanism:
- it preserves the source's clipped-window character;
- it does not resize the persistent `focusSurface` or violate M7 same-host rules;
- it does not create a third WebView;
- it reuses already-proven own-WebView2 pixel capture instead of stale parent/desktop GDI;
- it keeps renderer/domain authority separate from finite native presentation;
- it avoids exposing responsive Main reflow during contraction.

A separate transient top-level raster overlay was considered but is not preferred initially because it would need to reproduce native Main frame/z-order semantics and introduces another native surface. Directly animating the existing Main HWND under a frozen child is narrower and source-closer for ordinary restored-window entry.

## Validation obligations

Automated:
- authoritative `start_blitz` still precedes presentation;
- old board-fade contract is removed;
- reduced motion bypasses native morph;
- two persistent WebViews only;
- target Panel geometry is prepared through existing authority;
- Main renderer capture/hold is finite and has rollback cleanup;
- morph failure falls back without undoing committed timer/session state;
- restored Main position/size are not replaced by the Focus target;
- no renderer loop owns native motion.

Physical/source:
- normal-motion Board→Focus continuous capture on exact candidate;
- compare source character: progressive native crop/translate, no page fade, no responsive board reflow exposed;
- no blank/desktop/stale duplicate frame at handoff;
- final Focus Panel target monitor/side correct;
- Main Home return restores usable prior Main geometry;
- reduced-motion direct handoff remains clear and does not animate translation/scale.

## Current execution dependency

Do not start a competing source branch while PR242 P3-M6-05 is still active because both slices touch shared M6 contracts/tracking. After PR242 validates/merges/reconciles, implement this design from resulting `main`, unless exact Windows evidence or a newer repo disposition invalidates the mechanism.
