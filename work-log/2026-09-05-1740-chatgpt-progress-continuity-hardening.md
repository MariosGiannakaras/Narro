# Progress continuity hardening — 2026-09-05

- **Agent/tool:** ChatGPT
- **Milestone:** 4 — cross-chat implementation continuity
- **Scope:** repository-rule hardening only; no source/runtime behavior changed

## Trigger

After PR #36 had already been fully validated, merged, main-CI validated and reconciled, a resumed chat reported the small implementation progress as `4/6` even though the completed M4 scheduling/eligibility slice was already `6/6` in repository evidence.

The repository was correct; the conversational checkpoint was stale.

## Durable correction

`AGENT_WORKFLOW.md` now explicitly requires:

- latest repository state outranks chat history, cached summaries and remembered checkpoints;
- after a new chat, interruption, resume or context loss, re-read current `HANDOFF.md`, active `TODO.md`, relevant `STATUS.md`, newest relevant immutable work log, and referenced/open PR/CI evidence before reporting substantive progress;
- validated progress may not move backward because stale conversational context was loaded;
- the small progress counter resets only when a genuinely new implementation slice is explicitly started;
- `HANDOFF.md` must contain current general progress plus either active small-slice progress or latest completed small-slice progress.

Rule commit:

- `cfafb2bc3d78b42a038b588c96747fe30c1dbffa`

`HANDOFF.md` was rewritten operationally to record explicitly:

- general progress: `3/10` validated milestones;
- latest completed small slice: `6/6` for PR #36 scheduling/eligibility core;
- do not report a lower value for that completed slice;
- reset the small counter only when explicitly starting the next M4 timezone/DST slice.

Handoff commit:

- `890241ddee15390c85c3232b0881af10a41e6a17`

## Source baseline remains unchanged

No source/config files changed. The validated source baseline remains:

- PR #36 exact head: `530bb99bacb184972123d34d11e4567d9d110a53`;
- squash merge: `4a39d94545a361736968b455a20a3889ee5c9a1c`;
- PR Windows CI #199 / run `33966273403` / job `101306868458`: SUCCESS;
- PR artifact `9969712672`, digest `sha256:a873bd0184629f540e36290513c49692558cd5b7a08d229996d85f1e8c16a61b`;
- main Windows CI #200 / run `33967873158` / job `101311074138`: SUCCESS;
- main artifact `9970182535`, digest `sha256:57acc2e14297bd34d44851cf7d99f491a604ba2df382c1ba41242b4a4b17e0ef`.

Documentation-only commits do not replace that validated source SHA.

## PR #1 metadata repair

While loading the GitHub file-update action, the agent accidentally replaced the body of historical closed PR #1 with `noop`. This did not affect source, refs, merge state or CI. The PR body was immediately reconstructed from the immutable historical evidence in `work-log/2026-09-03-chatgpt-monitor-and-display-topology.md`, including its validated head and CI #54 evidence.

No historical source or validation evidence was changed.

## Exact continuation point

Milestone 4 remains active. PR #36 scheduling/eligibility core is complete (`6/6`). The next source slice is timezone/DST correctness. When that new slice begins, explicitly reset the small progress counter with a newly stated denominator and record it in the next handoff.
