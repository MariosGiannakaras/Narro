# Finding28 Windows temp-profile EPERM and bounded cleanup retry — 2026-10-09

## Exact evidence
- #280 B67 head 19c95930a9e3da3f92ba54a71a725763066e6d81 run 37902450730 job 113729370980: 386/386 Rust tests PASS and all visual and Finding28 post-drag behavior PASS. During finally, scripts/test-finding28-post-drag-action-rail.mjs:582 fs.rmSync(profile) fails Windows EPERM on a temp Edge folder. Capture step failed; missing focus-runtime artifact upload is downstream. Overall run FAILURE.
- #281 resulting-main head 0ab774008ab8f4a330edb25df924d7d459156080 push 37902069957 job 113727973530: identical root EPERM after all relevant visual/Focus/board tests PASS. Overall main run FAILURE. No assumption that earlier PR-head PASS transfers to main.

## Narrow source correction, not yet merged
- PR https://github.com/MariosGiannakaras/Narro/pull/283, branch fix/ci-finding28-edge-temp-profile-retry-20261009, head 7ec484c44fb026bd1e272b7d33c7c3b37fedd386. Only scripts/test-finding28-post-drag-action-rail.mjs and scripts/test-ui-task-reorder.mjs changed.
- Actual Edge/preview killTree and behavioral assertions unchanged. Node recursive temp delete now retries only transient filesystem failures for at most maxRetries 20 with retryDelay 500 ms; persistent cleanup failure is still a failed CI check. Static contract guards teardown ordering and retry config.
- Exact-head CI 37908694743 IN PROGRESS/NOT PASS when tracked. Local Node/Rust/Windows tests NOT RUN (GitHub connector only). Require full green Windows candidate plus guarded merge; check resulting main separately and reconcile owned #280 branch without unrelated code changes.
- Source campaign 32/35 (32 guarded merged; #280 B67, #282 Spectrum final design, #283 harness retry open). Final user HTML archived on main and unchanged; visual/native parity OPEN.

## Deferred user-requested follow-on
Once the current implementation/CI gates finish, audit conjectural Blitzit behavior using docs/EVIDENCE_ROUTING_MAP.md and the crosswalk. Separate confirmed source evidence, user-directed Narro additions, version-limited footage and unsupported UNKNOWN; do not invent domain behavior before corroboration.
