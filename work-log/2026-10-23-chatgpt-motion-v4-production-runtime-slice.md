# Motion v4 — experimental runtime integration slice (2026-10-23)

**Owner:** ChatGPT implementation track. **Branch:** `feature/m7-motion-v4-ab-candidate`; immutable starting compositor control PR389 `88baa42b02e79999d8b93f592ace9829c9ee1a88`. **Status at authoring:** source written, exact-head CI NOT RUN, packaged Windows EXE NOT BUILT, physical normal/reduced 8/8 NOT RUN. This is NOT accepted Motion v4 or an A02 fix.

## Source changes

- Reused reviewed standalone PR418 TypeScript pure 500 ms/1 ms four-route sampler, deterministic tests, and HTML prototype without rewriting visual contract.
- Connected actual Focus Panel ↔ Timer and Compact ↔ Expanded coordinator timing to `motionV4Duration`; the existing native Rust raster/geometry loop remains the single measured visible-animation clock, while the React geometry marker waits for a presented frame instead of sleeping on an independent timer.
- Aligned standalone Timer fallback duration and Focus/Timer CSS geometry tokens to 500 ms and retained 1 ms reduced-motion media override.
- Kept direct **Expanded Timer → Panel/Home** supported, although it is not among the four illustrative prototype routes. The Timer-only request enforces the legitimate compact↔expanded route; existing rollback, protected raster, one focusSurface host, persisted task/timer state, accessibility/inert states and spectral list assets remain unchanged.
- Wired PR418 pure model regression into standard frontend preflight and updated existing native/React source contracts to check this integration.

## Explicit incomplete acceptance

This is a **first real production timing/lifecycle integration**, **not** the full signed-off shared-element choreography. The Rust compositor continues to choose one outgoing/incoming full raster; the precise source-to-destination DOM anchor measurement, visible shared-element travel, action-first native reveal, fully clipped subtask-row stages, DWM frame validity and exact screenshot assertions remain unimplemented or unproven. Do not label Motion v4 implementation DONE, a ghosting fix, physical PASS, or a release candidate. Browser reference is illustrative.

**First unresolved code action after tests:** establish source-accurate measured element anchors and one-raster native choreography with no duplicate title/time, independently on this branch, before treating its binary as the complete Motion v4 candidate. Avoid mixing this experiment into PR389 diagnostic control.

**Dependency:** PR389 draft remains strict PHYSICAL_BEFORE_MERGE with old A02 FAIL, current diagnostic exact-head automated and native evidence outstanding. This experiment must not merge before compositor control is resolved and cross-validated. For CI, use one 3-gate candidate run after the coherent batch instead of runs per file; on failures inspect the first failing step and repair on this branch. Ordinary PA01–09 native activity is a separate Windows operator duty; never touch personal AppData.
