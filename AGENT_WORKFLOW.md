# Narro Multi-Agent Workflow

This repository is expected to be worked on alternately by different coding agents, including Codex and Antigravity. **The repository is the handoff medium.** Do not rely on another agent having access to previous chat context, local scratch notes, or unstaged files.

This file defines the working protocol. It complements `AGENTS.md`; product, architecture, correctness and scope rules in `AGENTS.md` remain authoritative.

## Files and responsibilities

Use these files for distinct purposes:

- `AGENTS.md` — durable engineering/product rules and invariants.
- `TODO.md` — ordered executable work. Checkboxes reflect verified reality.
- `STATUS.md` — concise project-level state, durable decisions, measurements and known limitations.
- `HANDOFF.md` — the current continuation point for the next agent.
- `WORK_LOG.md` — append-only chronological record of meaningful implementation slices.
- `docs/*` — researched specifications, evidence and proposals.

Do not duplicate the same detailed information into every file. Link/reference the appropriate file instead.

## Start of every agent session

Before editing code:

1. Fetch/pull the latest `main` and inspect the current Git state.
2. Read `AGENTS.md`.
3. Read `HANDOFF.md` completely.
4. Read `STATUS.md` and the active milestone in `TODO.md`.
5. Read only the specs/reference material relevant to the current slice.
6. Inspect the implementation and tests that already exist; do not assume the previous agent's summary is sufficient.
7. Confirm that the `HANDOFF.md` continuation point still matches repository reality. If it does not, correct `HANDOFF.md` before proceeding.

Never overwrite or revert another agent's work merely because it differs from an earlier plan. Investigate the repository history and current evidence first.

## TODO checkbox discipline

`TODO.md` is the executable checklist.

Use checkboxes strictly:

- `[ ]` means not yet fully implemented and validated.
- `[x]` means the item is implemented **and** the relevant validation/acceptance evidence exists.

Do not mark `[x]` simply because code was written or because it compiled once.

If an item is partly complete, keep the parent item open and add nested checkboxes only when useful, for example:

```md
- [ ] Prove display-topology change handling.
  - [x] enumerate monitors
  - [x] clamp saved position to visible work area
  - [ ] verify physical monitor disconnect/reconnect on Windows
```

Do not invent a nonstandard “in progress” checkbox state. The active slice belongs in `HANDOFF.md`.

Whenever a checkbox changes:

- ensure the underlying code is committed;
- record relevant test/manual validation in `WORK_LOG.md`;
- update `HANDOFF.md` if it changes what the next agent should do.

## Meaningful change rule

Every meaningful project change must reach the repository before handoff, including:

- source code;
- migrations/schema changes;
- tests and fixtures;
- configuration/build files;
- dependencies;
- generated platform assets that are intentionally tracked;
- benchmark scripts/results intended as evidence;
- durable implementation decisions;
- updated TODO checkboxes;
- current blockers/limitations.

Do not leave required work only in local files or chat messages.

Temporary build output, dependency caches, secrets, machine-specific junk and disposable diagnostics should not be committed unless the project explicitly needs them as fixtures/evidence.

## WORK_LOG.md protocol

`WORK_LOG.md` is chronological and append-only in normal operation. Do not rewrite previous entries to make history look cleaner. Correct an earlier mistake with a new entry.

Add one entry per coherent implementation/validation slice, not per individual file save.

Each entry should contain:

- date/time or date;
- agent (`Codex`, `Antigravity`, or other);
- active milestone/slice;
- commits created during the slice;
- files/components materially changed;
- decisions made and why;
- tests/build/manual checks executed and their result;
- measurements when relevant;
- known limitations/blockers introduced or discovered;
- exact next continuation point.

If a command/test was not run, say **not run** rather than implying success.

For Windows-only validation that the current environment cannot perform, record that explicitly and leave the relevant TODO checkbox unchecked.

## HANDOFF.md protocol

`HANDOFF.md` should remain short enough to read at the beginning of every session. It is rewritten as the active continuation state changes.

It must always state:

- current milestone;
- last agent that worked on it;
- last verified repository/commit state when useful;
- what is already complete in the current slice;
- exact next actions in priority order, using checkboxes;
- tests/manual validation still required;
- blockers or environment limitations;
- files that are especially relevant to the next action;
- any temporary implementation that must not be mistaken for final product UI/architecture.

Do not use `HANDOFF.md` as a historical log; move historical detail to `WORK_LOG.md`.

## STATUS.md protocol

Update `STATUS.md` when a change affects the project-level truth, including:

- phase/milestone status;
- architecture selected or rejected after evidence;
- measured CPU/RAM/startup/window behavior;
- durable constraints or known limitations;
- important decisions that future milestones depend on;
- completed major capability gates.

Do not add every small code change to `STATUS.md`.

## Commit and synchronization discipline

Agents are expected to work sequentially unless explicitly coordinated otherwise.

At session start:

- synchronize with latest `main`;
- inspect recent commits when another agent worked since the previous session.

During work:

- make coherent commits with descriptive messages;
- checkpoint a long milestone after a working/validated slice;
- preserve unrelated changes;
- avoid destructive history rewrites;
- **do not amend, rebase, force-push, or otherwise replace commits that have already been published to `main` during normal agent handoff work**;
- use new forward commits to correct code, documentation, commit-message mistakes, or handoff metadata so SHAs referenced by `WORK_LOG.md` and other agents remain stable;
- only rewrite published `main` history when the user explicitly requests a history rewrite and the consequences for existing handoff references are handled deliberately.

Before handoff:

1. run the relevant tests/checks that the environment permits;
2. commit and push all intended changes;
3. update `TODO.md` checkboxes based on validation, not optimism;
4. append the coherent slice to `WORK_LOG.md`;
5. update `STATUS.md` if project-level truth changed;
6. rewrite `HANDOFF.md` with the exact continuation point;
7. ensure there are no required uncommitted/unpushed files;
8. report any validations that could not be performed.

A handoff is incomplete if the next agent needs information that exists only in the previous agent's chat.

## Decisions and deviations

Specifications and architecture documents include proposals, not infallible instructions. An agent may find a better implementation.

For a material deviation:

1. verify the alternative against the same product/correctness/performance intent;
2. document the evidence in `WORK_LOG.md`;
3. update `STATUS.md` if it becomes a durable project decision;
4. update the affected spec/architecture/TODO when the old direction would mislead the next agent.

Do not silently change confirmed product semantics, local-only scope, data-integrity invariants or user decisions.

## Validation evidence

Prefer reproducible evidence:

- test command + result;
- build command + result;
- benchmark method + machine/context + result;
- manual Windows scenario + observed result;
- screenshot/reference comparison when UI work begins.

Avoid claims such as “works”, “done”, “optimized” or “production-ready” without saying what was actually checked.

## Milestone 1 special rule

Milestone 1 is a capability/performance spike, not polished product UI.

Agents must not prematurely build the full Blitzit-like interface. The purpose is to validate the Windows/Tauri/WebView2/native architecture and measure it. Temporary diagnostic controls are acceptable but must be labeled/treated as temporary.

If Windows-specific validation cannot be executed in the agent environment, implement the narrow testable slice, document exactly what remains unverified, and leave the corresponding TODO item open for a Windows-capable session.
