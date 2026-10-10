# 2026-10-10 — Finding35 first exact CI failure: stale two-mode static capture inventory

## Exact evidence
PR [#302](https://github.com/MariosGiannakaras/Narro/pull/302) initial head `01e49bc7209142f31125ec6f268e0780c04c15a4`; [Windows CI 38044663152](https://github.com/MariosGiannakaras/Narro/actions/runs/38044663152) validation-gate **SUCCESS**, fast-gate **FAIL**, Windows candidate **SKIPPED / NOT RUN**. Inspected the exact first failure from job `114191669785` (not downstream steps): `scripts/test-ui-floating-collapsed.mjs:139` threw `Floating Timer collapsed contract failed: Windows capture must cover collapsed and expanded states`.

## Cause and narrow correction
The new source/Edge capture deliberately expanded `foreach ($state in @("collapsed", "expanded"))` to four modes, adding `time-up-compact` and `time-up-expanded`. A previously existing source-text invariant still required the **exact old two-mode literal** and rejected the updated, more complete capture list. This is **obsolete test contract** (NER-003 stale fixture/contract), not a proven rendering regression. Fixed only that assertion to require the exact four-state inventory. No application UI/CSS behavior changed during this fix.

Replacement PR head `601431bce4d4453d5a6c1a8624901ec7baf2eb58`, new Actions [run 38044923348](https://github.com/MariosGiannakaras/Narro/actions/runs/38044923348) **QUEUED / NOT PASS** at first inspection. Do not infer full CI PASS or merge yet. Local tests: **NOT RUN** (GitHub-only environment). Future similar changes must reconcile both capture producer and preflight expectations in the same source slice, treating first failed assertion before expensive Windows packaging.

## Continuation
Inspect exact replacement CI on useful checkpoint; if fail, isolate first relevant error; only after validation+fast+Windows all SUCCESS guard merge the exact PR head. Finding35 native physical remains OPEN; C4 FAIL still requires comparative physical compositor evidence. Historical fixed 8/8 coding units remain accepted; this new correction is 0/1 until guarded acceptance.
