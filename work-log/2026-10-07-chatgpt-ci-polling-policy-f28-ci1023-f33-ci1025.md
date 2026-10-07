# CI polling policy correction + Finding28 CI1023 + Finding33 CI1025

Date: 2026-10-07

Progress: `3/10M || 0/3 | 17/18`

## User-directed CI execution correction

The user explicitly corrected an inefficient execution pattern: do not sit in repeated polling loops while a CI build/candidate is actively progressing.

Durable repository policy now states:
- record the exact head/run once;
- continue independent dependency-safe work while the build runs;
- re-check after substantive work, when the result becomes necessary for the next safe action, or when new evidence/user input indicates completion;
- repeated no-change polling is not progress.

This refines the previous "check frequently" wording; it does not weaken exact-head validation requirements.

## Finding28 — CI1023 exact result

PR245 head `71df77bec87b03352e562234741f53dbeb6a584e`, CI1023/run `37626644186`:
- validation gate PASS;
- fast gate PASS;
- Windows Rust check/clippy/tests PASS;
- performance harness PASS;
- every pre-existing visual capture/validator PASS before the Finding28 regression.

The new input trace established:
- initial Edge/CDP hover movement produced `pointermove` with pointerId 1;
- Edge/CDP `mousePressed` produced `mousedown` with buttons=1 on the expected task shell;
- **no `pointerdown` was produced**;
- production drag starts exclusively from React `onPointerDown`.

Therefore CI1023 is a test-transport diagnosis, not a product verdict.

PR245 head `69f940d9158682e79cacde415165c21b2c915694` now uses deterministic synthetic `PointerEvent` transport for drag start/move/finish and records that transport as untrusted/synthetic. Real Edge/CDP keyboard events and real Edge pointer movement remain authoritative for the Finding28 focus/hover rail probes. CI1028/run `37634586041` is pending/active; do not busy-poll it.

## Finding33 — CI1025 exact result

The initial PR247 CI1024 failure was only Windows temp-profile cleanup (`EPERM`) after the regression itself completed. Head `8f921d7063f78a51ea4e42b0e102c96cfe8ef8e3` added retrying profile removal only.

Exact-head CI1025/run `37630032472` is full PASS. PR247 was expected-head-guarded squash-merged as `ad6019b87d1ea7382b99db34b1e7e75725d1b107`. The 3 changed test/wiring blobs are identical on resulting `main`.

The regression proves the rendered production Edge/contenteditable path:
- receives real Escape from the focused contenteditable;
- closes large Notes to compact;
- preserves the shared editor;
- restores focus to the presentation control.

Disposition: no blind production Escape fix. The CI953 physical Main+Focus no-op remains a Tauri/WebView/native physical discrepancy for later physical routing. Resize failure remains unestablished.
