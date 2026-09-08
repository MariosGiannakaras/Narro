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

This is the expected-head guarded squash merge of PR #83 — `M5: add Create/Edit List modal`.

Exact PR evidence:

- validated PR head `17f3e3c1b9c7fad562b6bc7e05eee029bf047598`;
- Windows PR CI #307 / run `34204710799` / job `101991403060`: **SUCCESS**;
- Repository Preflight, real light/dark Create/Edit modal captures, visual artifact, Tauri release and diagnostic artifact: **PASS**;
- PR visual artifact `10047503212`, digest `sha256:41bc8583d36927989be1c604151e69df97b70e24b9cf0df6b1c2e67127398371`;
- PR diagnostic artifact `10047701183`, digest `sha256:646145f1a90ce6434080e7cac9f283023369d2106517da3996265281eef1a03e`.

Expected-head guarded squash merge produced `997ba6d019425ec2a15fdef630ca50c2fbab981f`.

Resulting-main evidence:

- Windows main CI #308 / run `34206908315` / job `101998422358`: **SUCCESS**;
- exact source SHA `997ba6d019425ec2a15fdef630ca50c2fbab981f`;
- Repository Preflight, real Create/Edit modal captures, visual artifact, Tauri release and diagnostic artifact: **PASS**;
- main visual artifact `10048388708`, digest `sha256:67e1919bd4e996a9fae786bea1f0fe5da73a3327b8cdf6a24a531934992ab840`;
- main diagnostic artifact `10048640730`, digest `sha256:163c10356a44fc7238aead403f5d465bbe47b8ae4b1d69a52773219368792c3d`.

Main tracking tip `4786bb6f269d7dda6054d21d635add3600a833a9` is docs-only and does not replace this validated source/test baseline. Detailed completed-slice evidence: `work-log/2026-09-08-1117-chatgpt-m5-create-edit-list-modal.md`.

## ACTIVE SLICE

**M5 Main UI — List board with Backlog, This Week, Today, Done.**

Branch: `m5-list-board`, based on main docs tip `4786bb6f269d7dda6054d21d635add3600a833a9`.

Latest source/test candidate before this tracking commit:

`1e0c5d7dc38201175ffe349e6a00974deb0e8d95`

Candidate implementation includes:

- read-only Rust `list_board` projection over active lists and stable persisted task identities;
- individual-list and aggregate All Lists targets without creating a synthetic persisted list;
- Backlog / This Week / Today projection for pending tasks through the already validated M4 `effective_planning_lane_at` logic rather than trusting `manual_lane` for scheduled tasks;
- Done projection from completed, non-archived tasks only;
- duplicate-identity fail-closed guard plus checked count and aggregate-EST arithmetic;
- active-list target validation and persisted timezone preference use, falling back to the Windows/WebView IANA timezone only when no preference is stored;
- typed renderer-facing `get_list_board_snapshot` read command; no task mutation commands are used by the board;
- real runtime navigation from Home list-card `Open`, Home `All Lists`, and sidebar `All my lists`, plus in-board list selector switching;
- four-column `ListBoard` hierarchy with title/count/aggregate EST and deliberately baseline/static task rows;
- aggregate view origin labels for tasks from different lists;
- reserved top/bottom future-add geometry without exposing dead `+` / `ADD TASK` controls;
- deterministic individual and aggregate board light/dark fixtures, Edge capture wiring, semantic/geometry validation and `scripts/test-ui-list-board.mjs` frontend-preflight coverage;
- prior List Editor/List Card preflight assertions updated only where the now-real Open target made their old literal exclusions stale;
- no drag/drop/reorder, inline task creation/editing, full task-card state model, Time Taken controls, scheduling/recurrence UI, subtasks, notes, destructive task/list flows, search, Settings or Reports behavior was added.

Semantic/diff review before PR: **PASS**. Compared with main, 14 files are changed and all are confined to the list-board read model, navigation integration, visual harness/preflight and supporting styles/types. The projection does not mutate task/list identity or order.

Local Node/Rust preflight: **NOT RUN**. This connector-only execution environment has no usable local checkout/toolchain; Windows GitHub Actions CI remains the authoritative reproducible gate.

PR: **not yet opened at this tracking commit**.

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

Open exactly one PR from `m5-list-board` to `main`, record its exact current head SHA after this tracking commit, and observe the authoritative Windows CI for that exact head.

Require Repository Preflight including `test:ui-list-board`, real Edge light/dark individual + All Lists board captures, visual artifact upload, Tauri release and diagnostic artifact upload to succeed on the same exact PR head.

If CI fails, inspect the exact failure log and fix only evidence-backed issues. After exact-head PASS, inspect the final changed-file diff plus all PR comments/reviews/inline threads, merge only with an expected-head guard, validate the resulting main source SHA with Windows CI, and only then mark `List board with Backlog, This Week, Today, Done` complete and reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` plus one new immutable work-log entry.

## USER ACTION REQUIRED

**None.**
