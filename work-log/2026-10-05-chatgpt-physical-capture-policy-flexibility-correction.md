# 2026-10-05 — Physical capture policy flexibility correction

## Scope

Documentation/process correction only. No Narro runtime/source/test/config/CI behavior changed.

The preceding execution-first capture policy was intentionally corrected because its wording was too tool-specific and too rigid for general physical validation. The efficiency goal remains valid, but OBS or any particular recorder must not become a mandatory workflow boundary.

## Current authoritative rule

For ordinary M1–M10 and Final-Review interactive Windows validation:

- choose the most reliable evidence method for the scenario: OBS/video, Computer Use, screenshots, native/UIA probes, diagnostic logs, purpose-built capture tools, or a combination;
- prepare compatible checks before a substantial session and prefer related/paired observations close together when that improves comparability;
- when continuous recording is useful, keep the useful interval reasonably focused and avoid prolonged unrelated source/debug work that adds no evidence;
- allow intermediate probes, tool changes, state inspection and adaptive diagnostic steps whenever they materially improve evidence quality, are needed to preserve/recover the scenario, or determine the next safe action;
- stop/restart/switch capture methods whenever that produces clearer evidence;
- analyze completed capture segments and batch compatible evidence-backed remediation where practical;
- never treat this efficiency guidance as rigid choreography if doing so would weaken validation or hide causal information.

Quiet performance protocols remain separate when recording would contaminate the measurement.

Optional M11 remains deliberately stricter: if explicitly activated, its complete planned live-Blitzit capture corpus must be collected/frozen before substantive analysis, and analysis/reconciliation must complete before remediation.

## Supersession

This log supersedes the **workflow interpretation** in `work-log/2026-10-05-chatgpt-execution-first-physical-capture-policy.md`. That older log remains immutable historical evidence of the prior wording; current truth is in:
- `AI_START_HERE.md`
- `AGENTS.md`
- `AGENT_WORKFLOW.md`
- `HANDOFF.md`
- `STATUS.md`

## Continuation shorthand

The repository already defines ordinary autonomous continuation. A user message of `continue` / `συνέχισε` is sufficient to resume the highest-priority unblocked repository-recorded action. It does **not** activate dormant optional M11.

## Current project state

No implementation progress, validation result, milestone checkbox, active PR source or CI verdict changed through this correction.
