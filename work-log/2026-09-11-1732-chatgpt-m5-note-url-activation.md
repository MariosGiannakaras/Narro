# M5 Notes URL Activation / No Auto-Launch — validated work log

Date: 2026-09-11
Agent: ChatGPT
Milestone: 5 — Design system and Main window product UI
Roadmap item: Require explicit click/keyboard activation to open note URLs; do not auto-launch links when entering focus

## Outcome

The ordered M5 note-URL reliability item is fully implemented, exact-head validated, expected-head merged, resulting-main validated, and reconciled. M5 advances from 20/28 to 21/28 validated top-level items.

Validated source/test baseline: `6f9880133e46c2f93b172f036cd8a5e6ec4d80fd`

Source tree: `b10e0086ff1db304d70f59676325fb2c1fa59e77`

This markdown-only reconciliation log does not replace that source baseline.

## Evidence and implementation

- Re-read the source-product reliability risk N-01 and the Notes/focus behavior evidence before source changes.
- Source inspection found no current behavior defect: exactly one production opener import and one `openUrl()` call existed, both inside the saved-link button click handler in `TaskNotes.tsx`; current focus/timer projection paths contained no URL-open side effects.
- Hardened the saved-link button with `data-note-url-activation="explicit"` plus an explicit accessible name while retaining native button pointer/Enter/Space activation and existing focus-visible styling.
- Added `scripts/test-note-url-activation.mjs`, a source-wide N-01 regression gate requiring exactly one opener import/call and confining it to the approved TaskNotes click handler.
- The gate rejects direct opener/browser-navigation side effects from current `focus.tsx`, `TimerSessionProjection.tsx`, `timerSessionApi.ts`, `App.tsx`, `ListBoard.tsx`, `TaskCard.tsx`, and the note lazy-load effect.
- Existing `http`/`https` validation, editor-anchor navigation suppression and no-remote-preview behavior remain required.
- Wired the gate into canonical frontend preflight. No Rust, persistence, timer/session behavior, Notes layout, larger-editor behavior or spellcheck behavior changed.

## Validation

Local scratch validation:

- `node --check` for the new anti-regression `.mjs`: **PASS**.
- Full local repository preflight: **NOT RUN** because no local Narro checkout/toolchain is available in this connector environment.

PR #93 — `M5: guard note URLs against focus auto-launch`

Final exact PR head: `9236b87239bc9b57916eafd3dfe5f71a0195059e`

Windows PR CI #366:

- run `34605963762`, job `103284328992`, conclusion **SUCCESS**;
- Repository Preflight: **PASS**;
- visual capture/upload: **PASS**;
- Tauri Release: **PASS**;
- diagnostic artifact upload: **PASS**;
- visual artifact `10266877528`, digest `sha256:c372dcbf92bf44e943080df99530ded40c300ac3a8c545ad199ba99b71f891f6`;
- diagnostic artifact `10266803621`, digest `sha256:839876876578f5ced9f3bf1168deb3e0924b6d782d1f186c5a5a0244c9a145eb`;
- submitted reviews: none;
- unresolved review threads: none.

Expected-head guarded merge produced main SHA `6f9880133e46c2f93b172f036cd8a5e6ec4d80fd`.

Windows main CI #367:

- run `34610879130`, job `103300772019`, conclusion **SUCCESS**;
- exact main source SHA `6f9880133e46c2f93b172f036cd8a5e6ec4d80fd`;
- Repository Preflight, visual capture/upload, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10269041513`, digest `sha256:204b813fcbc9fa9741ba57c60dff01916d6d5c6310dbc0d154d7018ca50e4ab7`;
- diagnostic artifact `10268808169`, digest `sha256:88c8434c188cc1edc432a2cafcf5a5a831ea89407d78396e892ecb0ee3c81b2f`.

## Tracking and continuation

- `TODO.md`: item 21 checked; M5 is 21/28.
- `STATUS.md`: source baseline advanced to `6f988013...` and next item recorded.
- `HANDOFF.md`: next ordered slice is larger/resizable Notes editing while preserving compact inline access.
- No user action or product decision is required.
