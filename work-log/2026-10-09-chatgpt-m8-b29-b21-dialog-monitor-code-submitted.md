# M8 source-visible controls: dedicated Shortcuts and full Preferences monitor thumbnails (2026-10-09)

## Source/evidence route and priority
Followed `AI_START_HERE.md` → `HANDOFF.md` → M8 `TODO.md` and `docs/EVIDENCE_ROUTING_MAP.md` / `docs/BLITZIT_VISUAL_SYSTEM.md`. The user explicitly directs programming first; consolidated real Windows/Codex physical validation and later Blitzit source-uncertainty review are separate. GitHub Actions completion must **not be polled** in this chat; user will announce results.

Canonical current SS-C17 source shows a **separate light Windows Shortcuts dialog** with three toggleable global keys and seven fixed in-app shortcuts. SS-C07 / VE-014 current-source Preferences shows a selected **monitor thumbnail with actual WxH overlay**, `Screen 1` label and teal→lime selection outline. The old full Narro Preferences page had only native monitor dropdown; Focus-local Quick Preferences already had adjacent screen-preview grammar. Main `PreferencesDialog` was **already implemented on latest main**; historical B34 gap text was stale, and no replacement or duplication was undertaken.

## B29 dedicated shortcuts UI — source submitted
PR [#294](https://github.com/MariosGiannakaras/Narro/pull/294), `implementation/m8-b29-shortcuts-dedicated-dialog-20261009`, latest source head `0a8b596d8e90451aafefc09d6fb3a963c1ab07a5`:
- New `WindowsShortcutsDialog.tsx` and `windowsShortcutsDialog.css` with calibrated light-dialog palette, explicit X/Escape, Tab/Shift+Tab containment, focus entry/return, scroll bounds and no permanent new native window.
- In full Preferences only, a `View shortcuts` entry swaps the main active modal from Preferences to the dedicated Shortcuts dialog, retaining underlying Home/Board/Reports destination. Closing returns to Preferences (Narro-local conservative navigation choice; exact source return not observed).
- Reuses existing `WindowsShortcutSettingsPanel` component, 3 global toggle/diagnostic/conflict/retry authorities and 7 no-toggle in-app keys. No Rust, SQLite, event-listener, hotkey registration or settings schema change.
- Targeted `scripts/test-ui-preferences.mjs` safety assertions added. Preexisting `scripts/test-ui-theme-settings.mjs` and `scripts/test-ui-app-shell.mjs` assertions expecting literal `<ThemeSettingsPanel />` updated to reflect real `<ThemeSettingsPanel onOpenShortcuts=` composition. No unrelated functionality changed.
- **Implementation proposed**, local TypeScript/npm/Windows tests **NOT RUN**, Actions completion **NOT CHECKED**, no accepted green CI or merge.

## B21 full Preferences monitor thumbnails — source submitted
PR [#295](https://github.com/MariosGiannakaras/Narro/pull/295), `implementation/m8-b21-monitor-thumb-selector-20261009`, exact proposed source head `cb68f1b2fdd54d469dd2406b092d4344ff1c3361`:
- `PreferenceSettingsSections.tsx`: screen option thumbnails from real `MonitorDescriptor` with actual dimensions; explicit Automatic plus all currently available monitors; selected `aria-pressed`; pending-disabled; existing persisted monitor keys and `findSelectedMonitor` compatibility unchanged. Stale saved-display state never silently selects another monitor; neutral warning banner + explicit recovery via Automatic or another listed monitor. Standard panel side/refresh flows retained.
- `preferenceSettingsSections.css`: existing calibrated radius, spacing and cyan→lime selected outline; responsive/keyboard focus treatment.
- `scripts/test-ui-preferences.mjs`: visual/control/persistence/static regression assertions. No Rust/native topology or placement changes.
- **Implementation proposed**, local TypeScript/npm/Windows tests **NOT RUN**, Actions completion **NOT CHECKED**, no merge or physical acceptance.

## Cross-branch integration risks
1. B21 modifies `src/PreferenceSettingsSections.tsx`, also in open #288 B58 copy-only source; **soft/mechanical overlap**. Reconcile and test both after whichever first merges.
2. B21 and B29 both modify `scripts/test-ui-preferences.mjs`; **soft/mechanical overlap**. Ensure both sets of assertions on post-merge main, then exact-head rerun.
3. Neither owns physical Codex M1/M7 selected-monitor/DPI or window-presentation failures; do not infer physical PASS from these UI changes.
4. M8 B22 Timezone menu behavior and B57 per-label info activation remain genuinely unobserved; do not invent those interactions in this batch.
5. Report Done B27 #293 and #286 share `src/reportsVisualFixture.tsx`; their independent histories are documented separately.

## Next
Continue a **dependency-safe, evidence-backed** code slice if one exists. For already-proposed source, await user's explicit notice about finished Actions before **checking** exact-head CI. Before merging, reconcile overlapping live source/main and validate the replacement exact head, then expected-head guarded merge, resulting-main source validation and durable tracking. Physical/Blitzit rendered/source acceptance remain OPEN; do not increment final implementation accepted counter from code submission alone.
