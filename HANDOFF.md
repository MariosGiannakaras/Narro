# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` / `docs/RESEARCH_EVIDENCE.md` / `docs/BLITZIT_HISTORY_RISK_INDEX.md` evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 11 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`997ba6d019425ec2a15fdef630ca50c2fbab981f`

This is the expected-head guarded squash merge of PR #83 — `M5: add Create/Edit List modal`. Windows PR CI #307 / run `34204710799` / job `101991403060` and resulting-main CI #308 / run `34206908315` / job `101998422358` both passed Repository Preflight, real Create/Edit visual captures, Tauri release and required artifacts. Detailed completed-slice evidence: `work-log/2026-09-08-1117-chatgpt-m5-create-edit-list-modal.md`.

Main tracking tip `4786bb6f269d7dda6054d21d635add3600a833a9` is docs-only and does not replace this validated source/test baseline.

## ACTIVE SLICE

**M5 Main UI — List board with Backlog, This Week, Today, Done.**

Branch: `m5-list-board`, based on main docs tip `4786bb6f269d7dda6054d21d635add3600a833a9`.

PR: #84 — `M5: add list board hierarchy` — OPEN / mergeable.

Latest source/test candidate before this tracking commit:

`38a186822a364c6431882a26b5894d24039c8ed3`

Candidate implementation includes:

- read-only Rust `list_board` projection over active lists and stable persisted task identities;
- individual-list and aggregate All Lists targets without creating a synthetic persisted list;
- Backlog / This Week / Today projection for pending tasks through validated M4 `effective_planning_lane_at` rather than trusting `manual_lane` for scheduled tasks;
- Done projection from completed, non-archived tasks only;
- duplicate-identity fail-closed guard plus checked task-count and aggregate-EST arithmetic;
- active-list target validation and persisted timezone preference use, falling back to the Windows/WebView IANA timezone only when no preference is stored;
- typed renderer-facing `get_list_board_snapshot` read command; no task mutation commands are used by the board;
- real runtime navigation from Home list-card `Open`, Home `All Lists`, sidebar `All my lists`, and in-board list selector switching;
- four-column `ListBoard` hierarchy with title/count/aggregate EST and deliberately baseline/static task rows;
- aggregate-view origin labels for tasks from different lists;
- reserved top/bottom future-add geometry without exposing dead `+` / `ADD TASK` controls;
- deterministic individual and aggregate board light/dark fixtures, Edge capture wiring, semantic/geometry validation and `scripts/test-ui-list-board.mjs` frontend-preflight coverage;
- prior List Editor/List Card preflight assertions updated only where the now-real Open target made old literal exclusions stale;
- no drag/drop/reorder, inline task creation/editing, full task-card state model, Time Taken controls, scheduling/recurrence UI, subtasks, notes, destructive task/list flows, search, Settings or Reports behavior was added.

Semantic/diff review before PR: **PASS**. Compared with main, changes are confined to the list-board read model, navigation integration, visual harness/preflight, supporting styles/types, and this handoff. The projection does not mutate task/list identity or order.

Local Node/Rust preflight: **NOT RUN**. This connector-only execution environment has no usable local checkout/toolchain; Windows GitHub Actions CI remains the authoritative reproducible gate.

### Latest CI evidence

Windows PR CI #309 / run `34259918088` / job `102175005224` on exact PR head `8b13c8dc0ba887b4b5c1efd5b16afebbc0af418c`:

- frontend/static contracts including `test:ui-list-board`: **PASS**;
- TypeScript/Vite production build: **PASS**;
- Repository Preflight: **FAIL** only at `cargo fmt --check`;
- visual capture, release and artifacts were correctly skipped after the formatting gate failed.

The #309 failure was formatting-only. The Windows rustfmt diff was applied exactly:

- `b59a2f35fab3c91b35e1aa9d067e732a7b6e0db3` — rustfmt layout for `list_board.rs`;
- `38a186822a364c6431882a26b5894d24039c8ed3` — preserve formatted EOF/newline in `lib.rs` while retaining only the list-board module/handler registration.

No runtime/domain/visual behavior changed in those corrective commits. The next authoritative run must validate the new exact head after this tracking update; #309 is diagnostic evidence only and is not merge evidence.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 11/28`**

List-board checkpoints:

1. mandatory startup + current-main/open-PR/spec/screenshot/M2 task-read/identity/M4 scheduling-risk/visual-harness inspection + exact existing branch reconstruction — COMPLETE;
2. board read model/navigation + deterministic static/visual candidate + semantic/diff review — COMPLETE;
3. exact PR-head Windows CI including repository preflight, board captures, release and required artifacts — PENDING;
4. exact-head semantic/diff/feedback review + expected-head guarded merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## IMPORTANT INVARIANTS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- this board slice is read-only: renderer presentation must not mutate task identities, list identities, lane order or persistence;
- scheduled pending tasks must be projected through validated M4 effective planning-lane semantics; schedule metadata must not be mistaken for `manual_lane` mutation;
- archived lists/tasks remain absent; completed non-archived tasks project to Done exactly once;
- All Lists is a read projection across active lists, never a synthetic persisted list;
- task identity duplication must fail closed rather than render duplicate aliases;
- renderer-provided timezone is fallback presentation context only; a stored configured timezone wins and all timezone identifiers are validated;
- task rows remain baseline/static for this slice; detailed task-card states, drag/drop, task creation/editing, EST/Time Taken editing, scheduling, subtasks, notes and destructive controls remain later ordered items;
- no dead top/bottom Add Task controls are exposed even though stable future action geometry is reserved;
- existing Create/Edit List, Home, shell, theme, overlay, reduced-motion and exact 1280x720 PNG contracts must not regress;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Record PR #84's exact head after this tracking update and observe the fresh authoritative Windows CI for that exact head. Do not make another source change unless the new run produces evidence-backed failure.

Require Repository Preflight including `test:ui-list-board`, real Edge light/dark individual + All Lists board captures, visual artifact upload, Tauri release and diagnostic artifact upload to succeed on the same exact PR head.

After exact-head PASS, inspect the final changed-file diff plus all PR comments/reviews/inline threads, merge only with an expected-head guard, validate the resulting main source SHA with Windows CI, and only then mark `List board with Backlog, This Week, Today, Done` complete and reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` plus one new immutable work-log entry.

## USER ACTION REQUIRED

**None.**
