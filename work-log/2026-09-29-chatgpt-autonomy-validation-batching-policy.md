# Autonomy and validation-batching policy — 2026-09-29

## Scope

Process/tracking reconciliation only. No application source/config/test/runtime file is changed by this commit.

## User direction

The user explicitly delegated ordinary implementation and validation sequencing to the agent and requested that the rule live in the repository for every future chat, not only conversational memory.

Durable interpretation:
- continue the ordered roadmap autonomously when repository evidence provides the next safe action;
- do not stop at routine validation checkpoints merely to request permission;
- batch compatible tests/CI/manual checks when later work is genuinely independent;
- run targeted validation earlier when an unresolved result could invalidate dependent work, enlarge rework, or materially worsen failure isolation;
- physical/manual Windows checks may be consolidated on the latest relevant artifact while their gates remain OPEN;
- when user input is genuinely required, state the exact constraint, realistic options, the recommended option, and the rationale before asking;
- destructive/external actions and physical-only evidence remain separate approval/observation boundaries.

This supersedes the temporary M7 instruction that required fresh user authorization merely to start ordinary tests/CI.

## Current engineering decision

PR #192 is a high-blast-radius Focus architecture replacement and M8 Focus routing depends on it. Therefore the next recommended action is an exact-head automated validation checkpoint before stacking dependent M8 source work. This is intentionally not a full physical closure after every small change: Gate 7/12 physical checks may remain batched for a later compatible Windows session.

## Progress and evidence

- Roadmap counters: unchanged.
- M1/M6/M7/M8 reopened-item counters: unchanged.
- PR #192 implementation source head before validation: `b506fd016eea2d3c45635a2cbdc74acde831d674`.
- Current-head tests/builds/CI/runtime/physical validation: **NOT RUN** by this process-only commit.
- Validated application source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.

## Continuation

Reconcile `plan/m7-single-focus` with current `main` process/tracking truth, then validate the exact resulting PR head. Start with repository preflight and narrow single-Focus/transition contracts; if those pass, proceed to the full authoritative Windows CI/release-artifact gate. Do not start dependent M8 source work before this automated checkpoint.
