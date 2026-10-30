# GitHub Copilot repository instructions

This repository is self-handing-off. Do not require the user to provide prior chat context or a custom task prompt.

Use `AI_START_HERE.md` as the entrypoint. For an existing task/chat/interrupted run, follow its **resume-in-place fast path** using only relevant live PR/head/CI evidence; never restart full discovery. Follow its **zero-context takeover procedure once** only for a genuinely new coding session lacking adequate repository context.

Canonical durable rules live in `AGENTS.md` and `AGENT_WORKFLOW.md`. Current work lives in `HANDOFF.md` and the active milestone of `TODO.md`.

Do not duplicate or override those instructions here.
