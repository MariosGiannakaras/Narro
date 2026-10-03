# Runtime single-instance corrective PR checkpoint

Date: 2026-09-30

## Trigger

The user-provided CI #744 whole-app recording exposed simultaneous `Ctrl+Shift+T` and `Ctrl+Shift+P` registration conflicts. The physical audit established RISK-F009 / M7-PHYS-04 as FIX_NOW: Narro had no single-instance boundary, so a second process could independently initialize SQLite, TimerService recovery, recurrence/reminder background services, tray and global shortcuts.

Primary evidence remains:
`work-log/2026-09-30-chatgpt-m7-ci744-physical-whole-app-audit.md`.

## Corrective source slice

PR #206: `fix/runtime-single-instance`

Exact head:
`e110b4eb0c8b3572652f864bb8eed35796a27f70`

Validated source base:
`f86c38102fa4516d6e2429aa26b63ceb8aabfe78` (PR #203 resulting-main Windows CI #777 PASS).

Scope:
- pins official `tauri-plugin-single-instance = "=2.4.5"`;
- registers single-instance before every other Tauri plugin and before `.setup`;
- secondary launch calls the existing `request_show_or_recreate_main` path in the primary process;
- secondary-launch callback does not initialize persistence, TimerService, recurrence/reminder background runtime or shortcuts;
- adds `scripts/test-single-instance-runtime.mjs` and includes it in frontend preflight;
- updates Cargo.lock for the pinned plugin and its Windows 0.60 dependency family.

No Focus presentation, timer/session/domain, schema, reporting or UI behavior is changed by this slice.

The pinned plugin version was chosen because 2.4.5 is the official release containing the relevant Windows foreground behavior correction while retaining the plugin's documented Rust 1.77.2 minimum. The repository CI uses current stable Rust.

## CI

Windows CI #779 / run `36774532337`:
**QUEUED** at this checkpoint.

Do not merge #206 before exact-head CI succeeds. Because Cargo inputs changed, resulting-main validation must run full CI after guarded merge.

## Next sequence

1. Inspect #779 once it completes.
2. If PASS, guarded-merge #206 at exact head `e110b4eb...`.
3. Validate resulting main and record artifacts.
4. Only then reconcile that validated source into PR #192 and implement B5, restoring source-confirmed `Blitz now -> Focus Panel` semantics without reintroducing split-window behavior.
5. Resolve B6 idle Timer semantics explicitly before issuing the next M7 physical artifact.
