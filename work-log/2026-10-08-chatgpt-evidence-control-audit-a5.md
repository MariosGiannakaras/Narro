# A5 — full Preferences monitor and timezone controls

Date: 2026-10-08 (Europe/Athens)

Continuation of immutable A2–A4 control-level audit, independently of Codex Windows physical/fix ownership. Canonical SS-C07 current v2.6.69 and VE-014 00:20–00:35 full-source Pass-3 records were compared against `src/PreferenceSettingsSections.tsx` and `ThemeSettingsPanel.tsx`, with the adjacent `FocusQuickPreferences.tsx` for context. This is not a raw-video replay or a full Preferences source-pixel comparison.

- **B21 / M8 SOURCE_PARITY_OPEN:** Full Preferences source displays Select Screen as a prominent selected monitor thumbnail, accent gradient border, explicit resolution overlay and Screen 1 name; Narro full Preferences uses native `<select>` with text labels. Focus-local Quick Preferences already renders thumbnail-like controls but that does not close the full Preferences gap. Monitor-key persistence, automatic fallback, topology and native acceptance are separate: keep those functions unchanged.
- **B22 / M8 SOURCE_CONTROL_PARITY_OPEN:** SS-C07 Timezone row is a selector with offset-qualified `(GMT+03:00) Europe/Athens` value. Current `GeneralPreferenceRows` uses raw freeform optional IANA timezone input, without picker/offset display. The screenshot proves visible control/presentation mismatch, **not** exact source timezone-option inventory, search mechanism or behavior. Retain safe IANA validation and DST/Windows locale behavior; do not fabricate options.

A related small SS-C01 upload secondary-text mismatch (`(Optional) (jpg, png, svg)` vs current `(jpg, png, svg · max 1 MiB)`) remains part of the existing M5 Create/Edit List source-content reconciliation, not a new missing capability. Narro's 1 MiB input safety limit is an explicit local guard; do not weaken it for text parity.

Crosswalk B21/B22 and nested M8 TODO + UI_UX_SPEC updated. Previous M8 sound and disclosure findings B9/B17/B18 remain open and separate. Application/config/tests unchanged; Windows CI, frontend/Rust regressions, canonical screenshot comparison and native physical tests **NOT RUN**. No counters or PASS advanced. Codex owns physical checks and corrections. Further audit remains necessary for unreviewed control/state families.
