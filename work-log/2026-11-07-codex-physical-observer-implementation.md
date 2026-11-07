# Automatic physical-session observer implementation — 2026-11-07

Codex; test infrastructure for the user's current M1–M9 physical campaign. [PR495](https://github.com/MariosGiannakaras/Narro/pull/495), exact head `5fe80235c22dc7dc9f7056ec84d81551b54770f1`; source tree `12d31e319ac84fae2dfbccb3b5e111a5d64baede`, based on main `0bed5c4164d4125304e981e621a2a2bbffaa8c25`. [CI42385888449](https://github.com/MariosGiannakaras/Narro/actions/runs/42385888449) IN PROGRESS at this receipt.

## User decision and implementation

Record meaningful successful operations/state changes and failures across frontend/IPC/backend/SQLite/native lifecycle automatically throughout physical testing; collect and analyze these with original recordings/actions/build identity. Compile the observer only into the physical build, not the final product/default release. Main [contract](../docs/PHYSICAL_SESSION_OBSERVABILITY.md), durable rules and current HANDOFF now carry this requirement.

26 source/config/test files implement physical-only Cargo hooks/plugin, separate instrumented frontend, rotating16 MiB JSONL, queue/drop/health reporting, normal-Quit drain/recovery, a standalone exact-manifest/PID/hash supervisor with recorder-first start and same-build relaunch, and automatic indexed/timestamped/hash-verified collection. The physical artifact includes the standalone supervisor. There is no raw-evidence Git upload, chat-content interception, cloud telemetry or automatic activity by ended chats.

Tauri's immutable internals remain intact: physical-only Vite adapters observe calls without changing arguments/results. The critical final Timer checkpoint stays after potentially blocking diagnostic drain. Cancelled Quit resumes the observer and marks the brief gap. SQLite precommit is named commit-request, never durability proof. Async events without explicit context remain unlinked; DOM coalescing is not paint proof. Video frame-zero UTC has a bounded start/first-frame anchor, not exact UTC synchronization; actual frame PTS are collected.

## Verification and failure learning

- Complete local frontend preflight and production build: PASS.
- Observer/admission/queue-loss/freeze/integrity/cancelled-Quit-order regression suite:30 assertions PASS; no Narro/desktop launch.
- Separate physical frontend build and compiled default-output exclusion: PASS.
- Rust format, affected config/provenance/runtime-harness/tiering checks and PowerShell probe parser: PASS.
- Local Rust compiler/Clippy/tests: NOT RUN; MSVC link.exe unavailable. Required Windows CI compiles the feature, runs Rust tests and a real frontend/IPC/SQLite/normal-Quit lifecycle/exclusion probe.
- Local physical recording/input/native/source-parity acceptance: NOT RUN.

A first local CSS contract failure came from CRLF materialization of LF Git sources in this temporary checkout; restoring source-exact LF resolved it without changing product CSS/assertions. Generated packaging icons were restored before publication. Normal Git pushing a partial checkout attempted unrelated promisor-object downloads; the exact intended26 files were published via forward Git data API commit on latest main instead, without rewriting history or security settings.

Applicable prevention controls: NER-003 available full preflight/parser before candidate CI; NER-004 semantic logging/first-frame admission and explicit gaps; NER-005 one current HANDOFF and packet index; NER-006 latest-main base and guarded integration; NER-011 narrow read-before-write/API targets; NER-012 separate source/CI/packet/native verdicts. Original Blitzit/reference/recovery/software inputs were not edited. No milestone checkbox/source/native hold changed.

Continue exact CI and only evidenced repairs on495; integrate when its actual checks permit, then validate observer integration on the held application sources before new campaign admission. Preserve the needed temporary checkout until publication is safe, refresh the offline kit, and retire only owned scaffolding.
