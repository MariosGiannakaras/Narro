# Narro Multi-Agent Workflow

Narro is maintained so different coding AIs can alternate without prior chat context. **The repository is the handoff medium and must be sufficient by itself.**

`AGENTS.md` remains authoritative for durable product/scope/correctness rules. `ENGINEERING_QUALITY.md` is authoritative for implementation quality, error handling, robustness, validation and pre-CI discipline.

## Start of every zero-context session

1. Synchronize with latest `main` and inspect recent commits/current Git state.
2. Read `AI_START_HERE.md`.
3. Read `AGENTS.md`.
4. Read `ENGINEERING_QUALITY.md`.
5. Read `HANDOFF.md` completely.
6. Read the active milestone in `TODO.md`.
7. Read `STATUS.md`.
8. Inspect the implementation/tests/CI referenced by the handoff.
9. Read only the relevant specs/evidence.
10. Read the newest relevant files under `work-log/` when recent rationale/evidence is needed; use root `WORK_LOG.md` only for older legacy history.
11. Continue the highest-priority unblocked action in `HANDOFF.md`.

Do not ask the user for a kickoff prompt or previous-chat summary when repository state already answers what to do. Ask only for genuine unresolved product decisions, required permissions, destructive approval, or physical Windows evidence that cannot be automated.

## Canonical files

- `AI_START_HERE.md` — universal zero-context bootstrap.
- `AGENTS.md` — durable engineering/product rules.
- `ENGINEERING_QUALITY.md` — mandatory quality/preflight/error-model standard.
- `HANDOFF.md` — exact current continuation state.
- `TODO.md` — ordered executable work; `[x]` means implemented and validated.
- `STATUS.md` — concise project-level truth and durable capability/architecture state.
- `work-log/*.md` — preferred immutable per-slice logs for all new work.
- `WORK_LOG.md` — legacy historical archive; preserve it and do not truncate/rewrite it.
- `docs/*` — specs, evidence and validation procedures.
- `prompts/*` — historical/slice-specific aids only; not required onboarding unless `HANDOFF.md` explicitly references one.

## Choosing work autonomously

1. If `HANDOFF.md` contains `USER ACTION REQUIRED`, do not fake that evidence or broaden past the blocker unless the handoff explicitly allows parallel work or the user explicitly instructs continuation.
2. Otherwise execute the first `NEXT AGENT ACTION`.
3. If handoff state is stale, reconcile it with actual code/tests/CI and correct the handoff first.
4. If no actionable handoff exists, take the first open item in the current `TODO.md` milestone whose prerequisites are satisfied.
5. Do not skip to a later milestone because it is easier or more visually rewarding.

The user should never have to relay one agent's explanation to another.

## Evidence and TODO discipline

Use precise levels:

- **implemented** — code exists;
- **compiled** — relevant build/check passes;
- **automated validated** — relevant tests/CI pass;
- **manual Windows validated** — behavior was physically observed on Windows when required.

`[x]` is allowed only when the item's required evidence exists. Keep partially complete parent tasks open and use nested checkboxes for verified sub-parts.

Compilation does not prove taskbar, monitor, tray, shortcut, notification or other interactive Windows behavior.

## Pre-CI discipline

Before every source/config push that will trigger Windows CI:

1. review the actual candidate diff;
2. run the strongest meaningful local checks available in the environment;
3. prefer `npm run preflight` when Node dependencies and Rust toolchain are available;
4. otherwise run the valid subset (`check:config`, frontend build/type check, Rust fmt/check/clippy/tests where possible) and record unavailable checks as `NOT RUN`;
5. fix known local failures before pushing;
6. prefer building/reviewing a coherent slice off `main`, then advance `main` once so one source slice causes one CI run;
7. never use CI as a blind syntax/formatting probe when the equivalent local tool is available.

Windows CI is the reproducible second gate. Inspect the real failing step/log before changing code or rerunning. Do not retry a deterministic failure without a corrective change.

Documentation-only commits should not consume Windows CI unless they affect build/test semantics.

## Work-log protocol

For every new coherent implementation/validation slice, create one **new immutable** Markdown file under `work-log/` following `work-log/README.md`.

Suggested name:

`YYYY-MM-DD-HHMM-agent-short-slice.md`

Each entry records:

- agent/tool;
- milestone/slice;
- reachable commit SHA(s);
- material changes;
- decisions/reasoning;
- exact local preflight/build/CI/manual evidence with PASS/FAIL/NOT RUN;
- measurements when relevant;
- TODO/STATUS/HANDOFF changes;
- blockers;
- exact continuation point.

Never overwrite another work-log entry. Corrections get a new file. Root `WORK_LOG.md` is legacy history and must not be truncated or replaced.

## HANDOFF.md protocol

Keep `HANDOFF.md` short and operational. It must clearly contain:

- current milestone/slice;
- verified baseline/artifact/commits when relevant;
- what is proven vs merely implemented;
- `NEXT AGENT ACTION`;
- `USER ACTION REQUIRED` or `None`;
- blockers/NOT RUN evidence;
- important files;
- temporary diagnostic warnings where relevant.

When a user test is pending, include exact artifact/run/build identity so an old binary cannot be confused with a new one.

## CI and Windows user testing

Use automated Windows CI for reproducible compilation/tests. When a behavior genuinely requires an interactive Windows desktop:

1. implement the narrowest testable path;
2. run local preflight before pushing;
3. keep CI green;
4. produce a clearly identified downloadable artifact when practical;
5. document a short exact manual procedure;
6. ask the user only for observations automation cannot provide;
7. record returned PASS/FAIL evidence in the repository;
8. fix failures before broadening work.

The user's Windows PC is primarily a **test bench**, not where ordinary code must be written.

## Git discipline

- synchronize with latest `main`;
- make coherent forward commits;
- preserve unrelated/concurrent user work;
- do not amend/rebase/force-push published `main` during normal handoff work;
- verify actual CI results before claiming success;
- keep referenced SHAs reachable.

Before stopping:

1. commit/push intended changes;
2. run/record available validation;
3. update evidence-backed TODO checkboxes;
4. create a new `work-log/*.md` entry;
5. update `STATUS.md` if project-level truth changed;
6. rewrite `HANDOFF.md`;
7. ensure no required continuation context exists only in chat/local files.

A handoff is complete only when a different AI with repository access alone can continue correctly.

## Decisions and deviations

Specs and architecture docs include proposals, not infallible commands. A better implementation may replace a proposal when it preserves product/correctness intent and is supported by evidence.

For material deviations, record reasoning/evidence in the work log, update `STATUS.md` if it becomes durable truth, and update affected specs/TODO when the old direction would mislead future agents.

Never silently change explicit user decisions, local-only scope, data-integrity invariants or confirmed product semantics.

## Milestone 1 rule

Milestone 1 validates Windows/Tauri/WebView2 capability and performance; it is not polished product UI. Temporary diagnostic controls are acceptable. Do not start polished UI or Milestone 2 while a blocking M1 validation remains in `HANDOFF.md`.
