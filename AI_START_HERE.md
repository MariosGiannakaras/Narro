# AI_START_HERE.md

## Purpose

This repository is designed so that **any capable coding AI can continue Narro from repository state alone**. Previous chat context, a custom kickoff prompt, or instructions copied by the user must not be required.

If you are an AI taking over this repository, treat this file as the bootstrap entrypoint.

## Zero-context takeover procedure

Before asking the user what to do next, do all of the following:

1. Synchronize with the latest `main` and inspect recent commits/current working-tree state.
2. Read `AGENTS.md` completely.
3. Read `ENGINEERING_QUALITY.md` completely. Its validation, error-model, robustness and pre-CI rules apply to every implementation slice.
4. Read `AGENT_WORKFLOW.md` completely.
5. Read `HANDOFF.md` completely. This is the **current continuation point**.
6. Read the active milestone section in `TODO.md`.
7. Read `STATUS.md` for durable project-level truth and validated architecture/capability decisions.
8. Inspect the implementation/tests/files referenced by `HANDOFF.md`; never trust a summary without checking repository reality.
9. Read only the product/architecture/evidence docs relevant to the active slice.
10. Inspect the newest relevant files in `work-log/` when recent rationale/validation evidence is needed. Use root `WORK_LOG.md` only for older legacy history.
11. Continue the exact highest-priority unblocked action recorded in `HANDOFF.md`.

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
- `ENGINEERING_QUALITY.md` — mandatory implementation quality bar: typed failures, validation, edge cases, preflight and CI discipline.
- `AGENT_WORKFLOW.md` — multi-agent synchronization, evidence, logging and handoff protocol.
- `HANDOFF.md` — **current** exact continuation point; rewritten as work advances.
- `TODO.md` — ordered executable milestones; `[x]` means implemented **and validated**.
- `STATUS.md` — concise durable project-level state, measurements, accepted/rejected architecture findings and important limitations.
- `work-log/*.md` — preferred immutable per-slice implementation/validation logs for new work.
- `WORK_LOG.md` — legacy historical archive retained for older context; do not replace or truncate it.
- `docs/*` — specifications, research evidence, validation procedures and optional design/decision aids.
- `reference/original-blitzit-screenshots/` — original-product visual evidence, not Narro-owned UI assets.
- `assets/branding/` — Narro branding source material; branding may evolve and should not block unrelated engineering work unless the active slice specifically concerns packaging/visual identity.

## How to choose work without an external prompt

Use this decision order:

1. If `HANDOFF.md` contains a **USER ACTION REQUIRED** blocker, do not pretend an agent can validate it. You may inspect/review supporting code, but do not broaden scope past the blocker unless the handoff explicitly permits parallel work or the user explicitly directs continuation.
2. Otherwise execute the first **NEXT AGENT ACTION** in `HANDOFF.md`.
3. If handoff state is stale or contradicts repository reality, correct it first using current code/tests/CI evidence.
4. If `HANDOFF.md` has no actionable continuation, take the first open item in the current `TODO.md` milestone whose prerequisites are satisfied.
5. Do not skip to a later milestone merely because it is easier or more visually rewarding.

## Autonomy expectations

A capable agent should normally:

- inspect before editing;
- implement the narrow coherent slice;
- validate inputs/state and define explicit failure paths before adding side effects;
- add/update tests for boundary conditions and real regressions;
- run the strongest meaningful local preflight available **before** a source/config push that triggers Windows CI;
- record unavailable local checks as `NOT RUN`, never as PASS;
- use GitHub Actions as the reproducible second gate, not as a replacement for avoidable local checking;
- prepare downloadable Windows artifacts when physical user testing is required;
- review actual CI results rather than assuming success;
- keep source/docs/checklists consistent;
- preserve concurrent user changes and use forward Git history;
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
2. Run and record the validations the environment permits, following `ENGINEERING_QUALITY.md`.
3. Update `TODO.md` only with evidence-backed checkbox changes.
4. Create one new immutable coherent entry under `work-log/` following `work-log/README.md`. Do not overwrite another entry or truncate root `WORK_LOG.md`.
5. Update `STATUS.md` only if project-level truth changed.
6. Rewrite `HANDOFF.md` with the exact continuation state.
7. Ensure `HANDOFF.md` explicitly distinguishes:
   - `NEXT AGENT ACTION` — work another AI can perform now;
   - `USER ACTION REQUIRED` — physical/manual decision or validation only the user can provide;
   - blockers/NOT RUN evidence.
8. Leave no required continuation context only in chat, local scratch files, or unpushed commits.

The success condition is simple: **a different AI with access only to the latest repository should be able to continue correctly without asking the user to reconstruct prior context.**
