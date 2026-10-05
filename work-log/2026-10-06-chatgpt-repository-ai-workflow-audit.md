# 2026-10-06 — repository AI/workflow audit and PR235 lifecycle reconciliation

## Scope

Full audit of the current AI/coding-agent bootstrap, implementation workflow, validation rules, current-truth tracking, recent Git/PR/CI state and the Codex Windows-evidence handoff. Authoritative starting main was `8168f2d1522edffadd8b87a193359abca2b96656`.

## Process findings

- `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `docs/CI_VALIDATION_STRATEGY.md` and `work-log/README.md` agree on the important invariants: GitHub main is authoritative; implementation/automated validation/physical acceptance are distinct; exact-head automated-green source should integrate before unrelated manual observation; physical PASS is never inferred; current truth belongs in HANDOFF/TODO/STATUS while immutable detail belongs in work logs.
- `GEMINI.md`, `CLAUDE.md` and `.github/copilot-instructions.md` remain thin pointers and do not duplicate or override the canonical workflow. Historical `prompts/*` are explicitly non-authoritative onboarding aids.
- The temporary Codex capture-only/no-analysis constraint did not remain as a project-wide blocker in the latest bootstrap. Current HANDOFF correctly authorizes normal evidence analysis, implementation and validation. M11 remains dormant/opt-in and M10 remains hard-blocked by unresolved M1–M9 gates.
- Root `TODO.md` and especially `STATUS.md` still contain large historical sections. They are mostly labeled historical and the authoritative current block is at the top, but the volume creates retrieval/token and stale-search risk. Do not delete or compact them casually: first prove that unique durable facts are represented in immutable work logs/canonical docs.

## Git/PR/CI findings and action

PR235 was the only open PR. It was still draft despite exact head `38219e200fe3bec7309f8e03e72003184ca86d08` being mergeable and fully green on Windows CI953/run `37258629373`. CI953 physical evidence additionally records scoped native PASS for the changed task-drag and retained-menu-paint paths; remaining canonical/motion comparison and findings07/23/27 are separate acceptance/correction work.

Keeping the PR draft/open conflicted with the repository's short-lived integration policy. During this audit:
- PR235 body was updated to the actual CI953/physical state;
- it was marked ready;
- it was expected-head-guarded squash-merged as `a0dd76edfce00f053231430d767dd091689ac52f`;
- all 14 changed source/test file blob SHAs on resulting main were compared with the exact CI953 head and matched.

The separate branch `wip/m7-async-read-and-evidence-tools-20261005` remains three commits ahead of PR235 head. Its four app/test files implement an async `spawn_blocking` read proposal for finding07, but the branch also contains machine-specific evidence tooling. The app proposal is not Windows-compiled/native-validated and must be extracted/reconciled rather than merged wholesale.

Historical branch `fix/m7-visual-hold-physical` is 733 commits behind main and 15 commits ahead from an old merge base; its PR191 was closed as a superseded architecture experiment. It is not a continuation branch.

## Tracking drift corrected

The authoritative top block already had the right current counters: M2–M4 complete, M1 reopened by finding27, M7 C1–C3/C5 accepted and C4 open (4/5). However the active M7 section still called PR225's old 3/5 checkpoint “Active”, said M2–M5 stayed closed, and described the already-implemented replacement as “in progress/unvalidated”. The current M7 closure plan also still said CI953 was building. Those current-truth statements were reconciled in the same audit, while historical checkpoint text was preserved as history.

## Current continuation

`3/10M || 4/5 | 14/19`

PR235 is integrated. Highest-priority ordered source blocker is M1 finding27 (saved explicit monitor identity/recovery across real DPI change). Finding07 should be reconciled from only the four-file async-read WIP delta on a fresh current-main implementation branch; finding23 remains review-first. Existing CI953 recordings should be analyzed before new physical acquisition. No new acceptance is claimed merely because evidence was captured.
