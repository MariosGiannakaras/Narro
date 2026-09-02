# Generic continuation prompt — Codex or Antigravity

Use this after the initial Milestone 1 kickoff whenever switching between coding agents.

---

Continue work on **MariosGiannakaras/Narro** from the repository's current state. You are replacing another coding agent, so **do not rely on prior chat context**.

Before editing anything:

1. synchronize/fetch latest `main` and inspect recent commits/current Git state;
2. read `AGENTS.md`;
3. read `AGENT_WORKFLOW.md` completely;
4. read `HANDOFF.md` completely — this is your immediate continuation point;
5. read `STATUS.md` and the active milestone/slice in `TODO.md`;
6. inspect the actual code/tests related to the handoff;
7. read only the relevant specs/references needed for the current slice.

Continue from `HANDOFF.md`; do not restart completed work and do not jump milestones unless the repository evidence requires it.

Treat architecture/spec implementation details as researched proposals rather than infallible truth. You may improve them when there is concrete evidence that a different approach is more reliable, simpler, faster, lighter, more accessible or better for Windows while preserving product intent. Document material deviations instead of changing direction silently.

`TODO.md` checkbox rule is strict:

- `[ ]` = not fully implemented and validated;
- `[x]` = implemented and relevant validation actually passed.

Partial work stays open; add nested checkboxes if useful. Never mark a Windows/manual capability complete if your environment could not actually verify it.

Work in coherent commits. Before stopping or handing to another agent, you MUST:

- commit/push all intended changes;
- run and record relevant tests/build/manual checks available in your environment;
- update `TODO.md` based on evidence;
- append a detailed entry to `WORK_LOG.md` with your agent name, commits, changed components, decisions/reasons, exact validations/results, measurements, blockers and next action;
- update `STATUS.md` if project-level truth changed;
- rewrite `HANDOFF.md` with the exact continuation point and remaining validation;
- ensure no required information exists only in this chat or uncommitted local files.

Do not perform broad unrelated cleanup. Preserve unrelated work and keep the current milestone's acceptance intent.
