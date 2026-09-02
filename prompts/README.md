# prompts/

These files are **historical or slice-specific agent prompts** created during earlier Narro implementation sessions.

They are retained because they contain useful reasoning/context for those slices, but they are **not required onboarding** and they do not define current work by themselves.

Any AI taking over Narro should start with:

1. `AI_START_HERE.md`
2. `AGENTS.md`
3. `AGENT_WORKFLOW.md`
4. `HANDOFF.md`
5. the active milestone in `TODO.md`
6. `STATUS.md`

Only read a prompt file when the current `HANDOFF.md`, a work-log entry, or a specific historical investigation points to it.

If an old prompt conflicts with current code, `HANDOFF.md`, `STATUS.md`, `TODO.md`, current tests/CI evidence or newer user decisions, the old prompt is stale and must not override current repository reality.

New work should normally be driven directly from repository state rather than creating a new kickoff prompt for every agent/session.
