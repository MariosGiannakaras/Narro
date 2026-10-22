# Deferred timer recovery review, M11 Blitzit announcements and post-M12 Narro ideation — 2026-10-19

Owner: ChatGPT / connected GitHub documentation-only edits on `main`. User requests: (1) preserve a future path to verify forced-close timer/session recovery and decide if a shorter SQLite checkpoint interval is justified; (2) add an official-source Blitzit announced-but-not-shipped feature inventory to optional M11; (3) reserve independent ChatGPT-proposed Narro features until the optional M12 has actually completed **and the entire application has passed its final required review and final stable product/release gate**.

## Existing implementation and evidence (not new work)

- M3 timer engine/checkpoint/recovery remain previously implemented and CI-tested. Current runtime background advancement interval: 250 ms (`src-tauri/src/timer_service.rs`); 30,000 ms periodic durable checkpoint threshold in active counting states (`src-tauri/src/timer/runtime.rs`); 1,000 ms view-only sample cadence (`src/timerSessionApi.ts`). Timer transition/checkpoint SQLite writes are transactional and interrupted sessions recover non-running. Last uncommitted work since the last successful checkpoint can be lost on abrupt process termination; repeated failed writes can extend the exposure. Recovery after a force-kill of the latest release build **NOT RUN**, and no maximum-loss guarantee was physically proved.
- M3 automated recovery evidence is historical PASS. No new source edits, tests, run/build, CI or Windows PA execution occurred here. Not claiming power-failure/data-corruption durability or changing the checkpoint cadence on speculation.

## Durable future queue

- In `TODO.md` under completed M3, added a **non-counting, NOT STARTED** crash/restart and injected-checkpoint-write-failure acceptance for an isolated disposable profile at the next separately authorized consolidated M10/Final Review Windows test. Check task identities/status/order, paused/non-running recovered timer, durable history/Time Taken, no lost already-committed seconds, no duplicate sessions/work or counted process downtime, and correct subsequent transitions. Decide on 30 seconds vs a candidate 5–10 seconds only from observed loss/write volume/contention/performance/error-feedback evidence. Any actual changes require narrow source PR, regression tests and CI/native validation. Personal AppData and paused PA-01–09 remain untouched.
- In the dormant optional M11 spec and TODO, added a dated, source-attributed official Blitzit future-feature announcement search, neutral collection/freezing, and classification as announced unshipped/shipped/withdrawn or changed/unverifiable. Reuse the historical roadmap index only as a starting point; current statuses need verification after explicit M11 activation. This is **not** new in-scope Narro parity functionality and does not authorize cloud/account/service work.
- The new post-final-product section of `TODO.md`, plus M11 and M12 specs, requires BOTH (a) **M12 explicitly activated and COMPLETE** and (b) **all required Final Comprehensive Review, final stable Windows candidate and application/release completion** before a separate analysis and prioritized proposals of original Narro capabilities. If M12 is dormant/skipped, the post-product analysis is on hold. Existing post-parity candidate inventory is preserved and not automatically approved. Proposals remain separate from any actual implementation and require a subsequent user scope decision.

## Repository documentation commits

- M11 announced-features protocol initial edit: `28ab6f28ee8a3ca7b6b230f680ef84e3888d775c`.
- M11 follow-up explicitly deferring Narro ideation: `9fb3df4ad18e75c3e3940cbd7da66402e02db709`.
- `TODO.md` roadmap/deferred-timer and post-M12 gate: `ddcef377b66a52c52720c729edfbc9dbfae5df45`.
- M12 documentation: `08deda01892427cc9b49904128d16c211310c68f`.
- `STATUS.md` tracking: `e3ceea89823678c6cf3b1658e44859694709a2e7`.
- `HANDOFF.md` tracking: `0845274c4947ed177db3500656f038dc9843f997`.

Documentation-only writes to current `main`; no code PR, no new executable validation, no revision of the previously accepted RA01/RA02 source baseline `300aa9da43e286783afc72436c4cca243b72a354`; no optional milestone activation and no change to M1–M4 formally accepted **4/10**. New documentation commits advance `main` only as documentation truth. No CI run was requested by these changes; **CI: NOT RUN (docs-only)**. Physical test: **NOT RUN**.

## Handoff / current ownership

Remain on the exact `HANDOFF.md` active RA01/RA02 final-build native acceptance when expressly reauthorized; do not replace that single next action or reopen historical video analysis. New timer crash/interval assessment is deferred to a later separately approved isolated physical scenario, optional M11 research only on explicit activation, and original Narro proposal work only after both strict post-M12/product gates.
