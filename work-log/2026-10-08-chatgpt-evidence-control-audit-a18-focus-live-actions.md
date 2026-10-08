# A18 — Focus live-card rest/hover and contextual action control grammar

Date: 2026-10-08 (Europe/Athens). Authoritative baseline main `160249aedc6bc70e0099cb351571aa7fb71e40b0`; no open PRs/active Actions; Codex source changes and native C4/35 remain independent. User-directed static evidence-to-code audit, not an implementation.

## B49 — live card pointer/focus rest-to-actions swap (M6)

VE-010 00:21–00:25 high-framerate direct source footage and VE-003 live hover show that in resting Focus live task the title and running clock occupy its surface; on hover these are replaced/overlaid by a row of **compact icon buttons** for Break, Notes, Pause, Skip, Done. Hovering one icon expands that particular action into an accent/labeled pill `Notes` or `Done` while neighbors remain icons; Focus width and hit region remain stable. This is not the ordinary queue rocket/menu strip.

Production `src/FocusPanel.tsx` always renders `<div className=focus-panel__live-heading>` with title and tabular timer, then `<FocusLiveActions>`; `src/FocusLiveActions.tsx` panel branch unconditionally renders a dedicated six-text-button `focus-panel__live-actions` section below metrics/subtasks. `src/focusPanel.css` styles the live-heading and the six-slot grid but has **no hover/focus visible presentation swap** or icon-target→pill conversion for the panel live task. Floating Timer has separate `FloatingActionButton` controls; it does not establish Focus Panel parity. **HIGH-VISIBILITY SOURCE_CONTROL_PARITY_OPEN M6**. Correct using calibrated source styles, stable reserved hit targets, accessible keyboard focus equivalents and no layout shift, with timer/session truth unaffected. Exact animated visual acceptance remains a direct source/candidate and M7 physical gate; no timing result inferred from TSX.

## B50 — Extend source context vs permanent disabled sixth cell (M6)

VE-010/VE-003 ordinary running action strip has Break/Notes/Pause/Skip/Done; VE-016 ~00:42–00:53 time_up explicitly exposes Extend in that timer state. Production `FocusLiveActions.tsx` always includes `<button data-focus-action=extend disabled={busy || !state.extendEnabled}>`, which occupies a sixth regular grid column even in normal work and paused states. This affects source appearance/control disclosure, **not** the correctness of `extendTimer` command or M7 Finding35 missing visible Time's Up label. The Floating branch already uses conditional Extend instead of a sixth disabled cell, an adjacent calibrated pattern; don't conflate view structures.

## Routing/limits

Both B49 and B50 routed as nested non-counting M6 TODO, audit crosswalk, UI_UX_SPEC and 46/19 source inventory; relevant family/video summary reconciled. VE-010's title/time swap is direct video, so no source-version pixel hypothesis is presented as current 2.6.69 acceptance: current screenshots SS-C18/C19 provide only corroborating resting states, exact current hover direct capture not available. Codex keeps all code/native validation ownership. **No source/test/config edits, Rust/TS checks, CI, raw MP4 replay, physical Windows or screenshot comparison run; NOT RUN; no milestone PASS/progress change.**
