# User-facing implementation progress

Canonical compact progress format requested by the user:

`{completed roadmap milestones}/{total roadmap milestones}M || {completed current-slice checkpoints}/{total current-slice checkpoints} | {completed active-milestone items}/{total active-milestone items}`

Example shape only: `4/10M || 1/5 | 25/28`.

Rules:

- First field = completed roadmap milestones / total roadmap milestones, followed by `M`.
- Second field = current implementation-slice checkpoints.
- Third field = validated top-level items in the active milestone.
- Derive values from repository state; example numbers are never authoritative.
- Existing validation/completion rules remain unchanged.
- Do not silently change denominators.
- Show the line when a counter changes, when a genuinely new slice resets the small counter, or in a useful final implementation status.
- Do not repeat an unchanged line in routine progress updates.
- Do not emit parallel verbose `Γενική υλοποίηση` / `Μικρή τρέχουσα υλοποίηση` lines unless the user explicitly requests them.

`AI_START_HERE.md` records this as the latest explicit user-facing reporting preference and gives it precedence over older presentation-only wording.
