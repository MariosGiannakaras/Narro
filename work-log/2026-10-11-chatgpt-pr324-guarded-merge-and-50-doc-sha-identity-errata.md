# 2026-10-11 — PR324 exact-head 3-gate acceptance and audit-of-50 SHA provenance errata

## Source acceptance, exact evidence

[PR #324](https://github.com/MariosGiannakaras/Narro/pull/324) `fix(reports): prevent old mutation refresh from overwriting newer session filters or detail`, accepted final original head **`1eab9361049e5cb15177a892385c0f1056756189`**, exact-head [GitHub Windows run 38093211469](https://github.com/MariosGiannakaras/Narro/actions/runs/38093211469) **validation-gate SUCCESS / fast-gate SUCCESS / windows-candidate SUCCESS**, guarded squash merge with **expected_head_sha matching** into resulting main **`7e6e8ecdd51a374a884e3d96c79ec41e761372a9`**; GitHub returned merged:true.

All **3/3 exact changed file Git blob hashes** were fetched independently from accepted head, resulting merge commit and current main; all three values match within each file:
- `scripts/test-reports-read-producers.mjs` `502a2dd7992512b8d121bae512377ea92654b818`
- `scripts/test-ui-reports-sessions.mjs` `d001df20a0a68fddf9c3cc8f942e2f3aec5b4f48`
- `src/ReportsSessions.tsx` `f848df8aa97062b7af9660ce704e2fe104028ad2`

PR324 tracks independent filter/detail request generations and read identity across normal effect reads and post-commit Add/Edit/Delete refresh, preventing stale response **and stale error** commits into a newly selected report. Node regression executes transpiled **actual React handler bodies with deferred IPC**; it is **not physical native Windows interaction** and original Blitzit appearance cannot be asserted. No CSS/native database changes. As of this acceptance, bounded post-audit campaign **3/4 accepted** (#322/#323/#324) and #321 remains OPEN; no integrated latest source ZIP/EXE hashes or native physical gates PASS.

## B49 PR321 Windows failed run — DO NOT CALL PASS

Current separate owner branch `audit/20261011-b49-cdp-pixel-capture`, last inspected head `f129c37b30b27897971f3aa8452c563f8f955111`, exact [run 38092529298](https://github.com/MariosGiannakaras/Narro/actions/runs/38092529298), validation SUCCESS, fast SUCCESS, **windows-candidate FAILURE** first at `Capture Visual Regression Fixtures`. In actual Windows job light Focus CDP pixel+DOM capture printed PASS, but dark `live-actions-focus` timed out with `ready=true`, `pass=false`, `focusOwner=false`, `activeTag=SPAN`, `railOpacity=0`, `headingOpacity=1`, `contractError="Revealing queued actions moved title, card or targets"`. Original Rust Check/Clippy/Tests/Perf all SUCCESS. Failure artifact `narro-visual-regression-failure-diagnostics` ID `11684564496`, real GitHub workflow output SHA256 `0dfdacc26782279d219131edfc9c7af4bcfcdda91bbd42e8a11722cd001cb563` for uploaded artifact (upload digest not independently redownloaded). Later missing packaged artifact is downstream skipped-build failure, not separate source bug. **Preserve strict screenshot evidence gate, don't mark false green, don't overwrite other agent's active PR321 branch.**

## Frozen 50 Markdown audit independent re-verification — supplemental SHA identity correction

The independent audit-of-audit `work-log/2026-10-11-chatgpt-s0-50-doc-audit-independent-sha-reverification.md` verified frozen GitHub manifest 50/50 path identities with no missing/extra and 43 substantive immutable historical logs. **41/43 originally transcribed source SHA correct**, and two errors corrected only in the independent addendum, NOT by mutating immutable originals: L05 original placeholder actual `c4baa5f106e029f0c4f846a9a55767530f19656d`, L40 original malformed SHA actual `bc768f7b8167a83342e754a0ed3c0ed248beb221`. The previously authored addendum table had an imprecise header claiming its T/E values all represent S0: **T01–T03 entries are actually hashes of the then-current `main` files AT REVIEW**, NOT the frozen S0 files. Frozen original T identities, independently fetched:
- T01 `HANDOFF.md`: **S0** `4dee9a08d3e0d5b82dc6823f0d90c4ae9cc8d5df`; **at-review** `b341cc5443dd78189ed1e70f04dd9951baf0778c`.
- T02 `STATUS.md`: **S0** `b20e15faeb87b8f54c9ad2198cd3ea7ebd79ce54`; **at-review** `bc3a0f1cdb1cc87997c02e0321b1a8bcbe131fec`.
- T03 `TODO.md`: **S0** `58a7ad08628797da7c8a8d12144c96b06f98562c`; **at-review** `a33eabb4a0331140cff957255e9923f45eb1332f`.

E01–E04 source-at-review matches exact S0 original SHA. Current T/E docs have changed legitimately again after individual reviews; original 50-unit review status is **50/50 reviewed WITH documented factual/update gaps**, not native or current-live-data perpetual PASS. This correction is a new immutable addendum so neither previous immutable audit-log nor the source historical logs are overwritten. The frozen denominator **70/70 reviewed** remains; neither source/CI A01–A14 14/14 nor physically/source accepted milestones 3/10 should be inflated.

## Exact next step

Continue independent current work without taking over owner PR321 branch. Check latest PR321 head/run when CI completes or branch owner acts; first failed `dark/live-actions-focus` requires actual DOM/focus/layout fixture source diagnosis, not arbitrary visual CSS change. Continue safe independent keyboard-event/ARIA test coverage Q03 if source gate permits, then one latest-current-main Windows production candidate with validated actual ZIP, narro.exe and installers SHA256 **after source PR321 is accepted**, respecting user-paused physical Windows and M11 dormant.
