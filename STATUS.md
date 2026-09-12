# STATUS.md

Last updated: 2026-09-12

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 26 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

The first twenty-six ordered M5 items are fully main validated. The latest completed item is **Archived lists/tasks surfaces**. The next ordered item is **Light/dark/system theme**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`e142ff2f7d131570f01b5daf24d1122e4f219620`

Tree:

`505e62200da03b8469e7036c241dcc1e45b06e78`

This is the merge of PR #98 — `M5: add archived lists and done task surfaces` — from exact validated PR head `221b4c888294d563c13b5b280017ca1f59b77590`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

### PR #98 exact-head validation

Windows PR CI #385:

- run `34701194858`, job `103573146278`, conclusion **SUCCESS**;
- exact head `221b4c888294d563c13b5b280017ca1f59b77590`;
- Repository Preflight: **SUCCESS**;
- production Windows Edge archive capture/DOM validation: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10299679369`, digest `sha256:62839495d4c0704d3d8de5382f4a149f178b9a8e879993cf0e998c101da9a88d`;
- diagnostic artifact `10300690015`, digest `sha256:166e901be83ed5e6b135fa29e9fbc2f6f43a95450c54c3fcd1184354eb81ad4a`;
- final PR metadata: 25 commits / 20 changed files; no submitted reviews, issue comments, or inline review comments.

### Resulting-main validation

Windows main CI #386:

- run `34701768320`, job `103574673946`, conclusion **SUCCESS**;
- exact source SHA `e142ff2f7d131570f01b5daf24d1122e4f219620`;
- Repository Preflight: **SUCCESS**;
- production Windows Edge archive capture/DOM validation: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10301150038`, digest `sha256:931157337934c352a0c0a52793d0e65468902f9b3e9ea12b9130de7ae57e4ca8`;
- diagnostic artifact `10300770757`, digest `sha256:c19f3397e0c56dc751475924f676f1569973a0493741f3c5c6a14954d0f8ed0a`.

Detailed immutable evidence is recorded in `work-log/2026-09-12-2102-chatgpt-m5-archives.md`.

## Milestone 5 — validated ordered work

Validated top-level items 1–25 remain as previously recorded. Item 26 is now additionally validated:

26. Archived lists/tasks surfaces compose the source-evidenced `Archived lists` / `Archived done tasks` sibling archive view; retain validated list restore/delete behavior; automatically archive eligible completed tasks strictly older than 60 days; and expose local read-only archived-done search/filter/empty/results states with deterministic Windows Edge coverage.

### Latest completed: Archived lists/tasks surfaces

Validated behavior includes:

- `ArchivePanel` composes sibling `Archived lists` and `Archived done tasks` segments in the existing archive destination;
- existing archived-list Restore and archive-only permanent-delete flows remain persistence-first and unchanged;
- completed tasks on active lists strictly older than 60 days are moved into task archive through an idempotent authoritative Rust/SQLite sweep using existing `completed_at` / `archived_at` fields;
- archived-list tasks are excluded from the active-list Archived Done Tasks projection, preventing duplicate archive presentation;
- archived task rows preserve task identity, completion history and authoritative Time Taken/session accounting;
- Archived Done Tasks is read-only in this slice and provides local case-insensitive Search, `All Lists` / active-list filtering, deterministic loading/error/empty/results states, and no invented restore/delete controls;
- board reads run the same Rust-owned archive snapshot/sweep before projecting Done so stale completed tasks are not retained visually;
- deterministic static checks plus dedicated Windows Edge light/dark captures cover lists-empty, done-empty, filter-open and populated-results states;
- no schema/dependency/lockfile, timer/session engine, scheduling, Notes, Focus Panel, Reports implementation or account/cloud/integration authority changed.

### Next ordered M5 item

`Light/dark/system theme.`

Implement only the evidenced theme preference and hierarchy-preserving runtime theme behavior. Reuse the existing shared theme tokens/fixtures; do not absorb the final M5 account/cloud-control removal item, later Focus Panel, Reports, or unrelated preference families.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` are the normal two-webview model; presentation changes must not duplicate authoritative runtime state.
- authoritative task/list/session/timer/scheduling/note/archive state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask/list identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- list archive/restore preserves history; permanent list deletion remains explicit, archive-only and irreversible.
- automatic done-task archival is idempotent and preserves normal historical/session data; permanent deletion semantics remain distinct.
- archived-list tasks must not be duplicated into the active-list Archived Done Tasks projection.
- Search remains local/read-only; quick task creation must continue to use the existing persistence-first create path with explicit list/lane selection.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from focus/session/window transitions.
- hover/focus/edit interactions may not reflow task/list card geometry or move hit targets.
- keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
