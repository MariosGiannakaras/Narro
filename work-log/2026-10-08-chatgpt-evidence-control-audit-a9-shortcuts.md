# A9 — SS-C17 in-app shortcut discoverability omission

Date: 2026-10-08 (Europe/Athens)

Read-only source-evidence-to-production review continuing A2–A8. Canonical SS-C17 (current Blitzit 2.6.69 760×726) directly shows a separate closeable shortcuts UI with `Global (works outside & inside Blitzit)` three keycaps and enable toggles plus `App (works only inside of Blitzit)` seven fixed keycaps without toggles. Production `src/WindowsShortcutSettingsPanel.tsx` contains a single `SHORTCUT_ROWS` array of **three** `GlobalShortcutKind` bindings, renders only those with enable state and diagnostic controls, and is embedded by `ThemeSettingsPanel.tsx` as a Preferences section. No app-only reference group. Meanwhile `src/inAppShortcuts.ts` resolves all seven source app-only chords (Ctrl+Alt+T/B/P/S/F/N and Ctrl+F); current shortcut execution was historically scoped-tested.

This is **B29 / M8 FIX_NOW user-visible discoverability and control composition gap**, not missing keyboard behavior. It must be corrected without disrupting existing shortcut dispatch or fabricating global registration/toggle semantics for app-only actions. Modal-vs-embedded presentation is source-different; choose a source-consistent accessible correction, preserve local Windows shortcut-conflict statuses and setup architecture, and add deterministic presentation regression that the displayed seven chords exactly match `resolveInAppShortcut` behavior.

The resulting A8 inventory now annotates SS-C17 as B29, and crosswalk + TODO + UI_UX_SPEC are consistent. Source records are sufficient to identify the two-group omission, so raw screenshot/video replay is not required for this bounded tracking decision. Whole visual parity still unaccepted.

Docs-only branch-independent audit. No implementation/config/test modifications, CI, physical Windows actions or new source-parity acceptance: **NOT RUN**. Prior automated shortcut behavior remains historical PASS for its tested scope. Codex owns implementation and physical correction. Tracker 46/19 are source corpus index counts, not end-to-end implementation-PASS counts.
