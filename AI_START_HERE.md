# AI_START_HERE.md

## Purpose

This repository is designed so that **any capable coding AI can continue Narro from repository state alone**. Previous chat context, a custom kickoff prompt, or instructions copied by the user must not be required.

If you are an AI taking over this repository, treat this file as the bootstrap entrypoint.

## Zero-context takeover procedure

Before asking the user what to do next, do all of the following:

1. Synchronize with the latest `main` and inspect recent commits/current working-tree state.
2. Read `AGENTS.md` completely.
3. Read `AGENT_WORKFLOW.md` completely.
4. Read `HANDOFF.md` completely. This is the **current continuation point**.
5. Read the active milestone section in `TODO.md`.
6. Read `STATUS.md` for durable project-level truth and validated architecture/capability decisions.
7. Inspect the implementation/tests/files referenced by `HANDOFF.md`; never trust a summary without checking repository reality.
8. Read only the product/architecture/evidence docs relevant to the active slice.
9. Inspect the latest relevant `WORK_LOG.md` entries when historical rationale or validation evidence is needed.
10. Continue the exact highest-priority unblocked action recorded in `HANDOFF.md`.

Do **not** ask the user for a prompt that merely repeats repository instructions.
Do **not** ask “what should I work on next?” when `HANDOFF.md` and `TODO.md` already answer that question.

Ask the user only when one of these is genuinely required:

- a product/scope decision not already recorded in the repository;
- physical Windows observation or interaction that cannot be automated;
- credentials/secrets/permissions that the repository cannot provide;
- destructive or externally consequential action requiring explicit approval;
- a real ambiguity/conflict that cannot be resolved from current evidence.

## Repository roles

These files have distinct jobs:

- `AI_START_HERE.md` — universal zero-context bootstrap.
- `AGENTS.md` — durable product, engineering, correctness, scope and architecture rules.
- `AGENT_WORKFLOW.md` — multi-agent synchronization, evidence, logging and handoff protocol.
- `HANDOFF.md` — **current** exact continuation point; rewritten as work advances.
- `TODO.md` — ordered executable milestones; `[x]` means implemented **and validated**.
- `STATUS.md` — concise durable project-level state, measurements, accepted/rejected architecture findings and important limitations.
- `WORK_LOG.md` — chronological append-only implementation/validation history.
- `docs/*` — specifications, research evidence, validation procedures and optional design/decision aids.
- `reference/original-blitzit-screenshots/` — original-product visual evidence, not Narro-owned UI assets.
- `assets/branding/` — canonical Narro branding assets/rules.

## How to choose work without an external prompt

Use this decision order:

1. If `HANDOFF.md` contains a **USER ACTION REQUIRED** blocker, do not pretend an agent can validate it. You may inspect/review supporting code, but do not broaden scope past the blocker unless the handoff explicitly permits parallel work.
2. Otherwise execute the first **NEXT AGENT ACTION** in `HANDOFF.md`.
3. If `HANDOFF.md` is stale or contradicts repository reality, correct it first using current code/tests/CI evidence.
4. If `HANDOFF.md` has no actionable continuation, take the first open item in the current `TODO.md` milestone whose prerequisites are satisfied.
5. Do not skip to a later milestone merely because it is easier or more visually rewarding.

## Autonomy expectations

A capable agent should normally:

- inspect before editing;
- implement the narrow coherent slice;
- add/update tests and validation harnesses;
- use GitHub Actions/available automation for Windows compile/test evidence;
- prepare downloadable Windows artifacts when physical user testing is required;
- review actual CI results rather than assuming success;
- keep source/docs/checklists consistent;
- commit/push forward commits;
- leave the repository ready for another zero-context agent.

Do not make the user act as a messenger between agents. If the next agent needs information, commit it to the repository.

## Validation boundary

Distinguish these clearly:

- **implemented** — code exists;
- **compiled** — relevant build/check passes;
- **automated validated** — relevant tests/CI pass;
- **manual Windows validated** — the behavior was physically observed on Windows where necessary.

Never promote one level to another without evidence. `TODO.md` parent items remain open when required validation is still pending.

## End-of-session contract

Before stopping, every agent must leave a complete repository handoff:

1. Commit/push all intended source/config/test/doc changes using forward commits.
2. Run and record the validations the environment permits.
3. Update `TODO.md` only with evidence-backed checkbox changes.
4. Append one coherent entry to `WORK_LOG.md`; never replace prior history.
5. Update `STATUS.md` only if project-level truth changed.
6. Rewrite `HANDOFF.md` with the exact continuation state.
7. Ensure `HANDOFF.md` explicitly distinguishes:
   - `NEXT AGENT ACTION` — work another AI can perform now;
   - `USER ACTION REQUIRED` — physical/manual decision or validation only the user can provide;
   - blockers/NOT RUN evidence.
8. Leave no required continuation context only in chat, local scratch files, or unpushed commits.

The success condition is simple: **a different AI with access only to the latest repository should be able to continue correctly without asking the user to reconstruct prior context.**
