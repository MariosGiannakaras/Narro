# AI_START_HERE.md

## Purpose

This repository is designed so that **any capable coding AI can continue Narro from repository state alone**. Previous chat context, a custom kickoff prompt, or instructions copied by the user must not be required.

If you are an AI taking over this repository, treat this file as the bootstrap entrypoint.

## Zero-context takeover procedure

Before asking the user what to do next, do all of the following:

1. Synchronize with the latest `main` and inspect recent commits/current working-tree state. Authoritative process/spec/tracking Markdown is maintained directly on `main`; if you are on an implementation branch, reconcile its copies with `main` before trusting branch-local instructions.
2. Read `AGENTS.md` completely.
3. Read `ENGINEERING_QUALITY.md` completely. Its validation, error-model, robustness and pre-CI rules apply to every implementation slice.
4. Read `AGENT_WORKFLOW.md` completely.
5. Read `HANDOFF.md` completely. This is the **current continuation point**.
6. Read the active milestone section in `TODO.md`.
7. Read `STATUS.md` for durable project-level truth and validated architecture/capability decisions.
8. Inspect the implementation/tests/files referenced by `HANDOFF.md`; never trust a summary without checking repository reality.
9. Read only the product/architecture/evidence docs relevant to the active slice. For user-visible, Blitzit-parity, source-evidence, physical visual-validation, or broad multi-finding remediation work, start evidence discovery from `docs/EVIDENCE_ROUTING_MAP.md` and follow `docs/DEEP_ANALYSIS_IMPLEMENTATION_WORKFLOW.md` so deeper canonical evidence and cross-finding causal analysis are not skipped.
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
- `HANDOFF.md` — **current** exact continuation point; rewritten as work advances and never used as append-only history.
- `TODO.md` — ordered executable milestones; `[x]` means implemented **and validated**.
- `STATUS.md` — concise durable project-level truth, measurements, accepted/rejected architecture findings and important limitations. Current-state sections must not retain superseded claims as if they were still active; move historical checkpoints to `work-log/` or label them explicitly as historical.
- `work-log/*.md` — preferred immutable per-slice implementation/validation logs for new work.
- `WORK_LOG.md` — legacy historical archive retained for older context; do not replace or truncate it.
- `docs/*` — specifications, research evidence, validation procedures and optional design/decision aids.
- Documentation/process/tracking Markdown is committed directly to `main` when it does not affect executable/build/test/CI semantics. Non-Markdown evidence-only artifacts may also go directly to `main` when they are not runtime/build/test inputs; use `[skip ci]` on those direct-main commits so Windows CI is not started. Feature branches are for source/config/test work, not for holding newer repository truth.
- `reference/original-blitzit-screenshots/` — original-product visual evidence, not Narro-owned UI assets.
- `assets/branding/` — Narro branding source material; branding may evolve and should not block unrelated engineering work unless the active slice specifically concerns packaging/visual identity.

## How to choose work without an external prompt

Use this decision order:

1. If `HANDOFF.md` contains a **USER ACTION REQUIRED** blocker, do not pretend an agent can validate it. You may inspect/review supporting code, but do not broaden scope past the blocker unless the handoff explicitly permits parallel work or the user explicitly directs continuation.
2. Otherwise execute the first **NEXT AGENT ACTION** in `HANDOFF.md`.
3. If handoff state is stale or contradicts repository reality, correct it first using current code/tests/CI evidence.
4. If `HANDOFF.md` has no actionable continuation, take the first open item in the current `TODO.md` milestone whose prerequisites are satisfied.
5. Do not skip to a later milestone merely because it is easier or more visually rewarding.
6. **Optional Milestone 11 is a hard exception to ordinary autonomous continuation.** Never start, prepare, schedule, count, or infer the live Blitzit audit from `continue`, `keep going`, `finish the project`, completion of M10, or similar general instructions. M11 requires an explicit user instruction that specifically activates M11 / the live Blitzit reference audit. If it is never explicitly activated, skip it entirely and continue from validated M10 to the required Final Comprehensive Review. If it is activated, obey `docs/BLITZIT_LIVE_REFERENCE_AUDIT.md` phase ordering: **capture/freeze the complete visual + observable protocol/state corpus before analysis, complete analysis/reconciliation before any Narro remediation**.

## Autonomy expectations

A capable agent should normally:

- inspect before editing;
- implement the narrow coherent slice;
- when several independently evidenced **source/config/test** changes in the active milestone can be implemented safely without waiting for one another's CI/manual result, batch them into one coherent branch/PR with their regression coverage before triggering Windows CI; keep documentation-only truth updates on `main`;
- prefer fewer high-value CI runs over micro-PRs or CI after only a few incremental lines, while never inflating scope merely to make a diff larger;
- keep batching within compatible scope: do not mix unrelated milestones, architecture rewrites, or changes whose correctness depends on an earlier unresolved result;
- validate inputs/state and define explicit failure paths before adding side effects;
- add/update tests for boundary conditions and real regressions;
- run the strongest meaningful local preflight available **before** a source/config push that triggers Windows CI;
- record unavailable local checks as `NOT RUN`, never as PASS;
- use GitHub Actions as the reproducible second gate, not as a replacement for avoidable local checking;
- **do not tight-loop poll long-running CI/build jobs.** Once the exact head/run is recorded and a build/candidate is actively progressing, continue independent safe work. Re-check only after substantive work, when that result becomes necessary for the next safe action, or when new evidence/user input says it completed. Repeated no-change polling is not progress;
- when a physical Windows check is required but does not determine whether independent next work is safe, keep the manual gate OPEN and batch compatible manual checks into one later session on the latest relevant build;
- never mark a deferred manual check PASS from automated evidence, and do not defer a manual result when that result is needed to choose or validate the next safe implementation;
- after CI or another intermediate checkpoint completes, continue immediately with the next unblocked repository-recorded action instead of ending the implementation session merely because a checkpoint was reached;
- provide brief progress updates during long work without turning those updates into stop points;
- prepare downloadable Windows artifacts when physical user testing is required;
- review actual CI results rather than assuming success;
- keep source/docs/checklists consistent;
- preserve concurrent user changes and use forward Git history;
- leave the repository ready for another zero-context agent.

Do not make the user act as a messenger between agents. If the next agent needs information, commit it to the repository.

## User-facing progress — ChatGPT implementation track (2026-10-08 latest user direction)

The user explicitly superseded the prior user-facing compact roadmap/milestone fraction format because milestone completion includes separate Windows physical and source acceptance, and thus misrepresents **this chat's actual coding progress**.

For substantive implementation updates, use an explicit **X/Y implementation progress counter** (not any M-number milestone): X is the number of this coding campaign's source PR batches **guarded-merged after exact-head Windows CI PASS**; Y is the exact number of **merged plus currently opened implementation PR batches in the specifically enumerated campaign scope**. Current 2026-10-09 opened PR #249–#281 inclusive = **31/33** code batches (31 guarded-merged after exact-head full Windows CI; #280 B67 and #281 B31 remain open, replacement-head CI not yet accepted). Never count a source feature twice or fabricate an item/denominator. If a new PR expands the scoped implementation backlog, explicitly announce the changed denominator (e.g., a new PR increments Y while X stays 31 until exact-head CI and guarded merge). Also report precise PR/CI/merge stage and the independent wider TODO code queue; Y is **not** the total remaining app work. Record code implementation, targeted tests, exact-head Windows CI, guarded merge and later native/source acceptance as separate statuses. Milestone counters remain exact, authoritative and preserved internally in TODO/STATUS/HANDOFF; they are no longer the default user-facing output format.

**Programming first, physical later:** The user paused Codex intentionally. ChatGPT implementation chats will implement and automatically validate/merge as many dependency-safe code, config and UI corrections as feasible. **Only when the coding campaign is complete will the user restart Codex to physically validate the latest integrated build**, rather than intermediate/superseded executables. Continue independent source fixes without waiting for native-only acceptance, keeping those gates OPEN. Ownership and source evidence rules otherwise unchanged.

## Deep analysis campaign policy

For broad implementation continuation, corrective batches, user-visible parity work, or a set of unresolved evidence findings, `docs/DEEP_ANALYSIS_IMPLEMENTATION_WORKFLOW.md` is binding.

Key consequences:

- analyze the independent open-finding set deeply enough to assign a durable disposition/cause before symptom patching;
- for visual work, inspect composition/state grammar in detail rather than performing a general visual pass;
- for motion/transient findings, inspect the actual MP4 interval and continuous context; transcripts, UIA metrics, action manifests and sampled frames are supporting evidence rather than substitutes for motion review;
- consume the completed Blitzit Pass-3/calibration corpus instead of broadly redoing source forensics; re-open raw source only for ambiguity/conflict, newly exposed detail, or direct final parity verification;
- continue independent `READY_FOR_FIX` branches/CI while analysis proceeds on unrelated items, but keep dependent/shared-authority work sequential;
- keep `PHYSICAL_ONLY`, `SOURCE_PARITY_OPEN`, `PRODUCT_DECISION_REQUIRED` and `EVIDENCE_LIMIT` gates explicit rather than inventing fixes or PASS claims;
- persist the disposition/cause map and exact next action to repository tracking/work logs so no conversation memory is required.

## User-directed autonomy and validation batching policy

The user's current explicit operating direction is durable repository policy:

- continue the ordered implementation autonomously instead of stopping at routine validation checkpoints;
- choose validation timing by engineering risk: batch tests/CI/manual checks when later work is genuinely independent, but run targeted validation earlier when an unresolved result could invalidate dependent work, enlarge rework, or make failures materially harder to isolate;
- use the claim/invalidation protocol in `docs/CI_VALIDATION_STRATEGY.md`: identify which evidence a change actually invalidates, start with the narrowest meaningful check, batch dependency-safe fixes before expensive candidate CI/builds, and do not rerun unaffected evidence by habit;
- reuse an exact-head validated artifact for compatible deferred physical/manual checks while no relevant source/config/build change has invalidated that candidate; beginning a new manual session alone is not a rebuild trigger;
- physical/manual Windows checks may be consolidated into a later compatible batch when their result is not required to choose the next safe implementation; keep those gates explicitly OPEN until observed;
- for interactive physical validation, choose the most reliable evidence method for the scenario; when continuous video/screen capture is useful, prepare compatible checks beforehand and keep the useful capture reasonably focused, while allowing intermediate probes/tool changes/adaptive diagnostics whenever they materially improve evidence quality or are needed to continue safely; batch analysis/remediation after useful capture segments when practical rather than treating the recorder as a rigid workflow boundary;
- a previous instruction requiring fresh user permission merely to start ordinary tests/CI is superseded. The agent may initiate proportionate automated validation when it is the technically appropriate next step;
- when a genuine restriction, permission issue, destructive/external action, physical-only observation, or unresolved product decision requires the user, explain the exact constraint, the realistic options, the recommended option, and why before asking for the decision;
- do not ask the user for routine implementation sequencing that the repository can resolve.

This policy changes execution timing, not evidence semantics: implementation is not validation, deferred checks are not PASS, and destructive or externally consequential actions still require the approvals defined elsewhere in the repository.

## Validation boundary

Distinguish these clearly:

- **implemented** — code exists;
- **compiled** — relevant build/check passes;
- **automated validated** — relevant tests/CI pass;
- **manual Windows validated** — the behavior was physically observed on Windows where necessary.

Never promote one level to another without evidence. `TODO.md` parent items remain open when required validation is still pending.

### Integration is not milestone completion

An exact-head automated-green implementation slice may be expected-head guarded-merged to `main` while a purely observational physical Windows gate remains OPEN. The merge integrates validated source; it does not convert manual evidence to PASS.

Do not keep automated-green implementation PRs open solely to wait for physical observation. If the later physical run fails, record the exact failure and correct it through a narrow follow-up PR from current `main`, then repeat only the affected manual gate unless evidence requires more.

Use `docs/CI_VALIDATION_STRATEGY.md` for the authoritative branch/CI/manual-gate policy.

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
9. Re-scan `HANDOFF.md`, `STATUS.md`, `TODO.md` and `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` for stale current baselines, obsolete open-PR claims, superseded next actions, and contradictory evidence counters.

The success condition is simple: **a different AI with access only to the latest repository should be able to continue correctly without asking the user to reconstruct prior context.**
