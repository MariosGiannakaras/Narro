# Diagnostic logging readiness audit — 2026-11-07

Agent: Codex. Scope: diagnostic coverage for intermittent failures during the prepared physical campaign. Source inspection and workflow correction only; no application/runtime/source change.

## Evidence and findings

- PR437 exact source `632345026d9c693613a3a0b3e9a8105740fcc6af`: [timer_diagnostics.rs](https://github.com/MariosGiannakaras/Narro/blob/632345026d9c693613a3a0b3e9a8105740fcc6af/src-tauri/src/timer_diagnostics.rs) initializes before persistence recovery when `NARRO_TIMER_DIAGNOSTICS_DIR` is configured. JSONL milestones/first poison/Rust panic are opt-in, flushed per record and bounded at approximately4 MiB/PID. Successful periodic ticks and all frontend errors are not a continuous journal.
- [Native move trace](https://github.com/MariosGiannakaras/Narro/blob/632345026d9c693613a3a0b3e9a8105740fcc6af/src-tauri/src/windows/move_trace.rs) requires `NARRO_NATIVE_MOVE_TRACE_DIR`, caps2,048 attempted records and uses a256-item nonblocking queue. Drops/write errors or the cap can leave later observations uncovered.
- [validation_log.rs](https://github.com/MariosGiannakaras/Narro/blob/632345026d9c693613a3a0b3e9a8105740fcc6af/src-tauri/src/validation_log.rs) is enabled by executable stem `narro-m7-validation`; normal admitted `narro.exe` does not activate it. Renaming changes diagnostic mode and is not a silent remedy.
- Exact A389 `ec9227a2e09a69c380d4605aaf9623bdd9b9c394` and B419 `6a72cf56ee03ea8026b56644adb47780d15d8692` lack both Timer diagnostics and native move trace modules. Their lib/validation source was independently read. New environment variables cannot add missing instrumentation to these binaries.
- Current-main helper does not configure either channel or redirect stdout/stderr. Release main.rs selects the Windows GUI subsystem. Runtime stream capture must be observed, not assumed.

## Correction and continuation

Canonical fresh protocol now specifies a candidate/mode capability matrix, prelaunch absolute session directories, actual PID/start-record/move-row health checks, coverage limits and safe-boundary monitoring, video/action chronology and retention across Quit/relaunch. HANDOFF and STATUS expose the remaining limit; the local instruction snapshot is synchronized.

Source capability audit: PASS. Runtime log creation/write health, app launch, capture/input and physical cases: NOT RUN. No EXE/installer executed, AppData/OS/security settings changed, application PR modified or milestone closed. Normal Markdown instruction changes do not require Windows CI.

Unlimited same-PID rotation and equivalent channels on the existing A/B packages remain unimplemented. If needed by a specific diagnostic claim, its source owner must supply a validated change/artifact; bounded PR437 probes can begin after observed admission. Do not equate a missing log record with absence of failure. All Blitzit/source/software inputs remain protected.
