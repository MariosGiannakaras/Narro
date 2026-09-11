# STATUS.md

Last updated: 2026-09-12

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 24 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

The first twenty-four ordered M5 items are fully main validated. The latest completed item is **List settings: name, icon, archive/delete flows**. The next ordered item is **Search / quick-actions palette with keyboard-first behavior**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`69c98ea107090e31589bb58299de603652336228`

Tree:

`0ae45142388df4dde7546c14ed1f1cf5b59d8c73`

This is the expected-head guarded merge of PR #96 — `M5: add list settings archive and delete flows`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

### PR #96 exact-head validation

Final validated PR head: `0a17f510f92fdb5bd364933cca04ce95624e755b`.

Windows PR CI #378:

- run `34655658720`, job `103447372737`, conclusion **SUCCESS**;
- exact head `0a17f510f92fdb5bd364933cca04ce95624e755b`;
- Repository Preflight, production Edge list-settings capture/DOM validation, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10286345586`, digest `sha256:7252b8f053ef4316c72a1c3325fba5afd0a767741d48178edc4392035264902e`;
- diagnostic artifact `10285591255`, digest `sha256:7d467a95a6f0c4054ad4adf2ec0b853674afa6645ea488bf0aa27dbefc9408fe`;
- final exact-head review: mergeable, 31 commits ahead / 0 behind its base, no submitted reviews, no unresolved review threads;
- the post-review CI fixes were limited to stale deterministic guards, rustfmt-only formatting, and explicit SQLite connection drops in Windows test cleanup; no new product scope was added.

Expected-head guarded merge produced main source SHA `69c98ea107090e31589bb58299de603652336228`.

### Resulting-main validation

Windows main CI #379:

- run `34656547631`, job `103450115073`, conclusion **SUCCESS**;
- exact source SHA `69c98ea107090e31589bb58299de603652336228`;
- Repository Preflight, production Edge list-settings capture/DOM validation, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10286422012`, digest `sha256:9fdbdc0f96ae93c6d24b6be8b069e9ac7e49415846408af61b3568177e3fd848`;
- diagnostic artifact `10285427967`, digest `sha256:b8f1f479c2ff8fe45075406980151d0ea887be369295cabafa11c14c24942678`.

Detailed immutable evidence is recorded in `work-log/2026-09-12-0220-chatgpt-m5-list-settings.md`.

## Milestone 5 — validated ordered work

Validated top-level items 1–23 remain as previously recorded. Item 24 is now additionally validated:

24. List settings reuse the validated Edit List path for name/icon/color, provide persistence-first active-list Archive with explicit confirmation, and expose minimal authoritative Archived Lists management for Restore and archive-only permanent deletion.

### Latest completed: List settings

Validated behavior includes:

- existing Create/Edit List persistence and owned-icon validation remain the name/icon/color settings path rather than a parallel editor;
- active Home list cards expose Archive through an explicit focus-contained destructive confirmation and publish success only after `archive_list_from_settings` resolves;
- archived list summaries come from authoritative SQLite and the production Archived lists destination exposes Restore plus archive-only permanent deletion;
- Restore and permanent-delete renderer state changes happen only after the local mutation succeeds; failures keep the relevant surface open with an error;
- permanent deletion commits the database delete first, then performs best-effort cleanup only for app-owned `list-icons/<filename>` assets; cleanup failure cannot turn a committed deletion into a reported mutation failure;
- archive/restore preserves list/task/history identity and `All Lists` remains a synthetic non-mutable aggregate;
- confirmation behavior includes modal semantics, Escape dismissal, Tab containment, initial Cancel focus and opener focus restoration;
- deterministic source gates and real Windows Edge light/dark captures cover active Archive, archived-list Restore and permanent-delete confirmation;
- no task/timer/Notes/scheduling/schema/search/theme/Focus Panel behavior was absorbed into the slice.

### Next ordered M5 item

`Search / quick-actions palette with keyboard-first behavior.`

Treat this as a focused keyboard-first search/command surface. Reconstruct current source/spec evidence before choosing its command/search scope. Do not absorb the later full archived lists/tasks surface, theme work, Focus Panel work, reports, cloud/account controls, or speculative command behavior unsupported by repository product evidence.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` are the normal two-webview model; presentation changes must not duplicate authoritative runtime state.
- authoritative task/list/session/timer/scheduling/note state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask/list identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- list archive/restore preserves history; permanent list deletion remains explicit, archive-only and irreversible.
- post-commit owned-icon cleanup is best effort and cannot redefine a committed database deletion as failed.
- Notes use one mounted compact/large editor/draft path; presentation switching cannot discard unsaved rich text.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from focus/session/window transitions.
- Notes spellcheck remains a native user-agent hint only; no Narro remote spelling service, custom dictionary, persistence schema or automatic text mutation.
- hover/focus/edit interactions may not reflow task/list card geometry or move hit targets.
- keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
