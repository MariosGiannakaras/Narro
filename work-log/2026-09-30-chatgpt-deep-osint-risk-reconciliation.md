# Deep Blitzit OSINT → Narro risk reconciliation

Date: 2026-09-30

## Scope

Repository-only reconciliation after deeper public Blitzit research (archives, user reports, release-history signals and technical stack evidence).

No Narro runtime/source architecture is changed by this checkpoint. The purpose is to ensure that material source-product reliability findings have an explicit implementation/validation disposition.

## Result

The deeper research does **not** justify a Narro architecture rewrite.

Already covered by validated Narro invariants/tests:
- tracked-time loss / Done 00:00 / pause-resume divergence;
- duplicate/reorder identity corruption;
- wrong-day/timezone scheduling and recurrence idempotence;
- renderer/window lifecycle not owning timer authority;
- backend outage risk avoided by local SQLite authority;
- monitor/topology recovery is already an open physical validation obligation;
- replacement floating-only CPU/memory measurement remains an explicit M1 gate.

Two no-orphan gaps were found between `docs/BLITZIT_HISTORY_RISK_INDEX.md` and the authoritative audit crosswalk:

1. **Surprise timer auto-start on fresh launch.** The risk index records a source-product fix for the first task starting automatically on app launch. Current Narro architecture/static contracts show no intended implicit-start path, but no dedicated fresh-start regression was located. Added as `RISK-F007` / `VALIDATION_OPEN`.
2. **Live Notes/title metadata edit continuity.** The risk index records source release notes preserving timer state while editing notes/time estimates. Narro already validates paused EST/Time Taken through authoritative timer boundaries and validates Notes/title functionality, but no dedicated integrated running-session continuity regression was located for Notes/title edits. Added as `RISK-F008` / `VALIDATION_OPEN`.

Both are final reliability obligations, not evidence of a currently reproduced Narro defect. They do not authorize speculative runtime changes. If a targeted regression exposes a defect, fix only the evidenced failure.

## Concurrent repository state observed during audit

- PR #192 is still the active single-`focusSurface` replacement line and remains unmerged.
- Live PR #192 head observed during this audit: `12ec6471c2d2d63470c5ecab08ebc65748fc1e42`.
- Windows CI #718 / run `36695046828` was still in progress when this log was written; no PASS is claimed here.
- PR #194 (Windows locale presentation / PREF-R06) had CI #713 PASS.
- PR #195 (notification Alerts gating / PREF-R03) had CI #715 PASS.
- `main` had independently advanced with PREF-R02 finite timer-alert flash work. This audit does not alter or revalidate those source changes.

## Continuation

The active M1/M6/M7 replacement validation order remains unchanged. The two new risk rows should be closed by narrow deterministic regressions before final M10 reliability acceptance (or earlier if startup/timer or live-metadata wiring changes). Do not treat the historical Electron/Vue/Firebase implementation stack as a reason to replace Narro's Tauri/Rust/SQLite architecture.
