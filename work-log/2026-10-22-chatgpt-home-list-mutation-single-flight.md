# 2026-10-22 — Home Archive/Duplicate single-flight corrective batch

**Owner:** ChatGPT frontend source / nonphysical acceptance. **User instruction:** do additional concrete repairs now; avoid idling on >7-minute CI, preserve accepted list picker/upload/icons and others' branches.

## Confirmed source failure mode
`src/AppShell.tsx` previously guarded `archiveList` with only captured `archivePendingId` React state and `duplicateList` with only captured `duplicatePendingId` state. Those guards take effect after render, so same-render double Archive or Duplicate requests could both invoke persistence. The distinct guards also permitted an Archive+Duplicate race against the same list. The archived-list Restore/Delete screen already has synchronous mutation admission; main Home lacked it.

## Implemented
[PR402](https://github.com/MariosGiannakaras/Narro/pull/402), branch `fix/home-list-same-render-mutation-owner-20261022`, exact submitted head `5e1dc5f2608303f08cd15a432cbb388cd785d3b5`, base main `dc16daf0738f8b47c0e5dfc39967303dfd8675a6`.

Four modified/new paths:
- `src/AppShell.tsx`: add synchronous per-component `homeListMutationInFlightRef`; both handlers acquire it before calling native archive/duplicate, exclude both competing pending states, release in `finally`; UI disables both actions while either pending. Existing persistence-first refresh and error messages are unchanged. Recognized in-app shortcut boundary also blocks during pending duplicate.
- New `scripts/test-home-list-mutation-gate.mjs`: transpile and execute the **actual production handler closures** inside a deterministic VM with stale captured React state and deferred IPC. Exercise same-render duplicate Archive, duplicate Duplicate, Archive versus Duplicate in both directions/across IDs, success-only refresh, lock release and retry after native rejection.
- `scripts/test-ui-app-shell.mjs`: include the actual-handler regression in mandatory frontend preflight.
- `scripts/test-ui-list-settings.mjs`: update Archive UI contract to require both pending states rather than old Archive-only suppression.

Nine independent source/test contract checks performed through live GitHub file inspection: **9/9 structural PASS**. GitHub Windows CI run `39743908068` at the exact PR head was **IN_PROGRESS / NOT YET PASS** at last observation. This is not yet an accepted code fix or physical OS PASS.

No app data/schema or Rust transaction logic changed. Approved Spectrum Core list editor color picker/image upload/218 offline icons unaffected. No optional M11/M12 work.

## Other project state on this handoff
- PR399 already 3/3 CI PASS, expected-head guarded squash merge `d6b5d441621b63ca257e5c68307731b6e7a30855`, **5/5 resulting-main source blobs exact**.
- PR401 source + artifact manifest head `d0bf09ad70df8fdb9f7b782042ec78cc49315532` still open; exact-head CI `39742617831` previously validation/fast PASS, Windows in progress. Source-only head from before reconcile had 3/3 but cannot validate replacement head. Workflow-change resulting-main CI required.
- Draft native Timer compositor PR389 genuine physical 4/8 failed transitions remains OPEN; no physical PASS inference. PA native checks incomplete. Mandatory milestone acceptance remains 4/10.

**ONE NEXT ACTION:** When run `39743908068` has genuinely completed, inspect first failing job if FAIL, fix the existing branch; if current exact-head CI 3/3 PASS, expected-head guarded merge PR402 and verify resulting main. Do not idle poll; keep PR401 and native PR389 separate.
