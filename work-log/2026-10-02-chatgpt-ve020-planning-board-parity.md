# 2026-10-02 — VE-020 planning-board parity correction

Agent/tool: ChatGPT / GitHub connector  
Branch: `blitzit/planning-board-forensics-20261002`  
Base main: `acb8fadb7c3cc5bc31c990d1b8f89dc417d53abd`

## Evidence

New user-supplied Blitzit planning clip:
- SHA-256 `501ed5d15959e691a18f6046f63b7a2068f4cb076979fa8fb92a04e7e0643299`
- 2944×1904
- 60 fps
- 560 frames
- 9.34 s

Frame-level findings are recorded in `docs/BLITZIT_SUPPLIED_CLIP_2026-10-02.md`.

## Material implementation corrections

- cross-lane board drag now persists the pointer-selected insertion anchor instead of always appending;
- cross-lane persistence compacts the source and rewrites the target order inside one transaction;
- board read model now exposes source-observed remaining EST separately from nominal EST;
- pending lanes render remaining EST while Done retains nominal aggregate semantics;
- Blitz entry moved from the global post-App strip into Today;
- Today receives stronger source-like visual emphasis;
- Blitz CTA receives a rounded source-like multi-stop gradient and finite hover/focus shift with reduced-motion handling;
- exact Today empty copy uses `No Tasks`.

## Explicit non-guesses

Not implemented from VE-020 alone:
- stable ordinal persistence semantics;
- completed/total lane-progress accounting;
- exact meaning of every hover quick-action glyph;
- final board fade;
- continuous/pointer-reactive CTA gradient motion.

These are routed to `docs/BLITZIT_MEDIA_FORENSIC_PLAN.md`.

## Validation state at this checkpoint

- Repository-local preflight: NOT RUN in the GitHub-connector environment.
- Rust regression tests added for positional cross-lane persistence and remaining-EST clamping.
- Static contract tests updated for positional anchors, remaining EST and Today-lane Blitz placement.
- PR/Windows CI: pending after branch completion.

## Project sequencing

This is a user-directed Blitzit parity correction. It does not close, rewrite or substitute any existing M1/M7 physical Windows acceptance gate.
