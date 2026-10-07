# Finding28 — CI1028 synthetic-event routing result

Date: 2026-10-07

Status: **REGRESSION HARNESS ACTIVE / NO PRODUCT VERDICT**

Progress: `3/10M || 0/3 | 17/18`

## CI1028 exact result

PR245 exact head: `69f940d9158682e79cacde415165c21b2c915694`  
Windows CI1028/run: `37634586041`

PASS before Finding28:
- validation gate;
- fast frontend/contract gate;
- Rust check, Clippy and Rust tests;
- performance harness;
- every pre-existing Windows visual capture/validator, including the 50-scenario focus-editor set.

Finding28 then failed before any focus/action-rail assertion.

The fixture and production ListBoard were mounted and ready. The real Edge pointer positioning event appeared in the trace, but the explicitly synthetic `PointerEvent` dispatched through `elementFromPoint` did not appear in the window input trace. The driver failed with:

`Finding28 deterministic pointerdown did not reach the production drag shell.`

Therefore CI1028 is a harness-routing result only. It says nothing about the observed CI953 focus/action-rail mismatch.

## Evidence-backed correction

PR245 head `a2dcd17e6742993756bbeda77f3adcf37b55a462` changes only the Finding28 regression driver.

The synthetic drag-start event now:
- targets the known production reorderable shell directly rather than rediscovering a descendant through `elementFromPoint`;
- uses dedicated pointer id `41` to avoid collision with the real Edge mouse pointer stream;
- still enters the real React `onPointerDown` path;
- keeps subsequent synthetic `pointermove`/`pointerup` on the production window drag listeners;
- keeps actual Edge/CDP Tab, Shift+Tab and hover pointer movement for the focus/action-rail conclusions.

No Narro production source/CSS behavior changed.

At the time of this record, GitHub had not yet exposed a new exact-head workflow run for `a2dcd17e...`. Do not busy-poll. Continue independent safe work and inspect that run when it exists/completes.
