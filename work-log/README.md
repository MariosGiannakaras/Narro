# Narro work-log directory

This directory is the preferred durable implementation/validation log for all new work.

## Why this exists

The original root `WORK_LOG.md` became large and was accidentally overwritten during multi-agent work. Replacing a giant append-only file is fragile when different tools/APIs edit repository files differently.

Therefore:

- root `WORK_LOG.md` is retained as **legacy historical archive**;
- do not delete or rewrite its prior history;
- all **new** coherent work/validation slices should create one new Markdown file in this directory.

## Naming

Use a sortable descriptive filename such as:

`YYYY-MM-DD-HHMM-agent-short-slice.md`

If exact time is not useful/known:

`YYYY-MM-DD-agent-short-slice.md`

Do not overwrite an existing entry. If a correction is needed, create a new correction entry.

## Required entry content

Each new log file should include:

- date/time or date;
- agent/tool identity when useful;
- milestone/slice;
- reachable commit SHA(s);
- materially changed files/components;
- decisions and reasoning;
- exact tests/build/CI/manual observations with PASS/FAIL/NOT RUN;
- measurements when relevant;
- TODO/STATUS/HANDOFF changes;
- known blockers/limitations;
- exact continuation point.

## Evidence discipline

Do not write vague statements such as `works`, `done`, `optimized`, or `production-ready` without the evidence that supports them.

Distinguish:

- implemented;
- compiled;
- automated validated;
- manual Windows validated.

## Reading history

For recent context, read the newest relevant entries in `work-log/` first.

Use root `WORK_LOG.md` only when older Milestone 1 history/rationale is needed.

`HANDOFF.md` remains the authoritative current continuation state and should not be replaced by log history.
