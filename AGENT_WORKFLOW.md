# Narro Multi-Agent Workflow

Narro is intentionally maintained so different coding AIs can alternate without prior chat context. **The repository is the handoff medium and must be sufficient by itself.**

This protocol complements `AGENTS.md`. Product, architecture, correctness and scope rules in `AGENTS.md` remain authoritative.

## Universal bootstrap

Every zero-context agent session begins at:

`AI_START_HERE.md`

An agent must not require the user to paste a kickoff prompt, previous-chat summary or the previous agent's response when repository state already contains the needed information.

At minimum, before editing code:

1. synchronize with latest `main` and inspect current Git/recent commits;
2. read `AI_START_HERE.md`;
3. read `AGENTS.md` completely;
4. read this file completely;
5. read `HANDOFF.md` completely;
6. read the active milestone in `TODO.md`;
7. read `STATUS.md`;
8. inspect the implementation/tests/CI relevant to the handoff;
9. consult only the relevant specification/evidence docs;
10. continue the highest-priority unblocked action from `HANDOFF.md`.

If `HANDOFF.md` is stale or contradicts repository reality, correct it before broadening work.

Do not ask the user “what should I work on?” when the repository already answers it. Ask only for a genuine unresolved product decision, required secret/permission, destructive approval, or physical/manual Windows evidence that cannot be automated.

## Files and responsibilities

- `AI_START_HERE.md` — universal zero-context bootstrap.
- `AGENTS.md` — durable product/engineering rules and invariants.
- `AGENT_WORKFLOW.md` — this synchronization/evidence/handoff protocol.
- `HANDOFF.md` — current continuation state; rewritten as work advances.
- `TODO.md` — ordered executable work; checkboxes reflect validated reality.
- `STATUS.md` — concise project-level state, durable decisions, measurements and known limitations.
- `WORK_LOG.md` — chronological append-only record of meaningful implementation/validation slices.
- `docs/*` — researched specifications, evidence, validation procedures and optional design/decision aids.
- `prompts/*` — historical or slice-specific aids only; **not required onboarding** unless current `HANDOFF.md` explicitly points to one.

Do not duplicate detailed state into every file. Put information in the file whose role matches it.

## How an agent chooses work autonomously

Use this order:

1. If `HANDOFF.md` contains an unresolved **USER ACTION REQUIRED**, do not fake or substitute that evidence. Work only on explicitly allowed parallel tasks.
2. Otherwise execute the first **NEXT AGENT ACTION** in `HANDOFF.md`.
3. If handoff state is stale, reconcile it with actual code/tests/CI and fix the handoff first.
4. If there is no actionable handoff, take the first open item in the current `TODO.md` milestone whose prerequisites are satisfied.
5. Do not skip to later milestones merely because they are easier or visually rewarding.

The user should not need to relay one agent's explanation to another.

## TODO checkbox discipline

`TODO.md` is the executable checklist.

- `[ ]` = not fully implemented and validated.
- `[x]` = implemented **and** the relevant acceptance evidence exists.

Compilation is not manual Windows validation. Code existence is not compilation. A passing unit test does not prove window/taskbar/monitor behavior.

For partial work keep the parent open and add nested evidence checkboxes when useful, for example:

```md
- [ ] Prove display-topology recovery.
  - [x] implementation compiles in Windows CI
  - [x] unit tests cover clamping logic
  - [ ] physical monitor disconnect/reconnect validated on Windows
```

Whenever a checkbox changes, ensure the evidence is recorded in `WORK_LOG.md` or a linked durable validation document.

## Evidence levels

Use precise language:

- **implemented** — code exists;
- **compiled** — relevant build/check passes;
- **automated validated** — relevant tests/CI pass;
- **manual Windows validated** — behavior was physically observed on a real Windows desktop when that is required.

Never promote one level into another without evidence.

## Meaningful change rule

Every meaningful project change must reach the repository before handoff, including source, migrations, tests, configuration, dependencies, tracked platform assets, durable decisions, benchmark evidence, TODO changes and blockers.

Do not leave required continuation information only in:

- chat messages;
- local scratch notes;
- unstaged/uncommitted files;
- an agent-specific task description;
- CI logs that are not summarized/linked from durable repo state when their result matters.

Disposable build output, caches, secrets and machine-specific junk should not be committed.

## WORK_LOG.md protocol

`WORK_LOG.md` is chronological and append-only in normal operation.

Never replace the file with only the newest entry. Never rewrite prior entries just to make history cleaner. Correct mistakes with new forward entries.

Add one entry per coherent implementation/validation slice containing:

- date/time or date;
- agent identity/tool when useful;
- milestone/slice;
- reachable commit SHA(s);
- material files/components changed;
- decisions and reasoning;
- exact build/test/manual checks with PASS/FAIL/NOT RUN;
- measurements when relevant;
- blockers/limitations;
- exact continuation point.

If a command or physical check was not run, say `NOT RUN`.

## HANDOFF.md protocol

`HANDOFF.md` is intentionally short and operational. It is rewritten as current state changes and must not become the historical log.

It must always contain, in clear sections:

- current milestone/slice;
- current verified baseline/important commits or CI artifact when relevant;
- what is proven vs merely implemented;
- **NEXT AGENT ACTION** — prioritized work an AI can perform now;
- **USER ACTION REQUIRED** — only genuine manual/physical/product decisions, or `None`;
- blockers and `NOT RUN` validation;
- particularly relevant files;
- temporary diagnostics that must not be mistaken for final UI/architecture.

If a user manual test is pending, include the exact artifact/run/build identity so old binaries cannot be confused with new ones.

## STATUS.md protocol

`STATUS.md` is concise project-level truth. Update it when a change affects:

- current phase/milestone status;
- accepted/rejected architecture after evidence;
- confirmed native capability gates;
- measured CPU/RAM/startup/window behavior;
- durable product/engineering decisions;
- important known limitations future work depends on.

Do not use `STATUS.md` as a second work log or repeat all research summaries there.

## CI and user Windows validation

Use GitHub Actions or equivalent automated infrastructure for reproducible compilation/tests whenever agent environments lack Rust/Windows tooling.

When a behavior genuinely requires a real interactive Windows desktop:

1. implement the smallest diagnostic/production path required;
2. keep automated Windows CI green;
3. produce a clearly identified downloadable artifact when practical;
4. document an exact short manual procedure;
5. ask the user only for the observations automation cannot provide;
6. record the returned PASS/FAIL evidence in the repository;
7. fix failures before broadening the milestone.

The user's Windows machine is primarily a **test bench**, not a requirement for writing ordinary application code.

## Commit and synchronization discipline

Agents are expected to work sequentially unless explicitly coordinated otherwise.

During normal work:

- synchronize with latest `main`;
- make coherent descriptive commits;
- preserve unrelated changes;
- use forward commits for corrections;
- never amend/rebase/force-push already-published `main` history unless the user explicitly requests a history rewrite;
- verify actual CI outcomes before claiming success;
- keep referenced commit SHAs reachable.

Before handoff:

1. run relevant checks available in the environment;
2. commit/push all intended changes;
3. update evidence-backed TODO checkboxes;
4. append a coherent `WORK_LOG.md` entry;
5. update `STATUS.md` if project-level truth changed;
6. rewrite `HANDOFF.md` with exact continuation state;
7. verify no required work/context is uncommitted or chat-only.

A handoff is incomplete if a different AI with only repository access would need the user to reconstruct what happened.

## Decisions and deviations

Specs and architecture documents include proposals, not infallible commands. A better implementation may replace a proposal when it preserves the same product/correctness intent and is supported by evidence.

For material deviations:

1. verify the alternative;
2. record evidence/reasoning in `WORK_LOG.md`;
3. update `STATUS.md` if it becomes durable project truth;
4. update affected specs/architecture/TODO when the old direction would mislead future agents.

Never silently change explicit user decisions, local-only scope, data-integrity invariants or confirmed product semantics.

## Milestone 1 special rule

Milestone 1 is a capability/performance spike, not polished product UI.

Temporary diagnostic controls are acceptable and should remain obviously temporary. Do not begin polished Blitzit-like UI or Milestone 2 while a blocking M1 architecture/runtime validation in `HANDOFF.md` is unresolved.

If a coding environment cannot perform Windows GUI checks, implement/CI-validate the narrow slice and prepare a user-test artifact rather than pretending native behavior was validated.
