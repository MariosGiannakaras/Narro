# 2026-09-26 — M8 persisted global shortcut toggles

## Scope

Second M8 source slice: preserve the existing Windows native global-shortcut implementation while adding per-global persisted enable toggles and product-facing conflict/error state.

Validated application source baseline entering this slice:
`030274149cafdf590c5aa08f2cd1c9409595c7aa`.

Tracking main used as the branch base:
`d2c29ed1df1155e76b6aba215648ffbfe68be194`.

## Implemented source

### Persisted shortcut preferences

- preferences schema advanced from v2 to v3;
- added `ShortcutPreferences` for:
  - Go to Narro / `Ctrl+Shift+B`;
  - Alternate Focus Mode / `Ctrl+Shift+T`;
  - Find focus timer / `Ctrl+Shift+P`;
- all three default enabled to preserve the validated pre-M8 behavior;
- the whole shortcuts section uses `#[serde(default)]`, so v1/v2 payloads without it load with safe all-enabled defaults;
- added explicit v2 migration coverage.

### Atomic settings persistence

- added transactional `mutate_preferences` read-modify-write boundary;
- migrated the existing Theme production writer to the same atomic boundary;
- unrelated latest preference fields are preserved across sequential mutations.

### Native shortcut coherence

- retained the existing Windows `RegisterHotKey` implementation and diagnostic authority;
- added symmetric unregister authority for Focus toggle and Find Timer;
- added a typed `GlobalShortcutKind`;
- default Go-to-Narro register/unregister now uses the same serialization/rollback discipline;
- native state update failures roll back the OS hotkey operation where possible;
- startup loads persisted shortcut intent before `shortcuts::install` and does not register disabled shortcuts even briefly.

### Persisted/native setting transaction

- added `shortcut_settings` module and commands:
  - `get_global_shortcut_settings`;
  - `set_global_shortcut_enabled`;
- user toggle operations are serialized separately from native registration retries;
- native transition occurs before preference commit;
- persistence failure after a native transition rolls native state back to the previous registration state;
- enabled preference intent remains distinct from actual registered/conflict state.

### Product Settings UI

- existing Settings route remains the product entry point; no account/avatar surface was added;
- Windows Shortcuts section shows the three confirmed rows/chords;
- each global shortcut has an individual checkbox toggle;
- states include Loading, Saving, Registered, Disabled, Shortcut conflict, Unavailable, and Retry;
- diagnostic events keep native availability current;
- toggle failures refresh the authoritative persisted/native snapshot and surface explicit error feedback;
- responsive, focus-visible, and reduced-motion styles are included.

### Visual and regression evidence

- shortcut panel exposes a deterministic view for fixtures;
- existing Preferences visual fixture now includes the Windows Shortcuts section;
- a dedicated shortcut-conflict fixture state verifies enabled intent + native unavailable state + Retry;
- new `test:ui-global-shortcut-settings` frontend gate covers schema, startup, persistence, native rollback, commands, UI, and fixture wiring;
- existing Theme test now requires atomic preference mutation rather than the old whole-payload save path.

## Validation state

- local/source static reasoning: complete;
- authoritative exact-head Windows CI: **PENDING**;
- merge/resulting-main validation: **PENDING**.

Do not mark the M8 global shortcut TODO items complete until exact-head Windows CI and resulting-main validation pass.

## Deferred/non-blocking evidence

M7 physical/manual closure and not-yet-uploaded Blitzit videos remain open but do not block this independent M8 source slice by explicit user direction.
