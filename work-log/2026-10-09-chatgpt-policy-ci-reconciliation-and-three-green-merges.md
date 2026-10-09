# 2026-10-09 — product/CI instructions corrected; bounded green integrations

## User decisions (authoritative; do not reinterpret)

1. **CI:** It is permitted and useful to inspect workflow completion. The restriction is against idling for long periods, repeatedly polling without useful work, or waiting through a build rather than completing the response/doing independent work. On any new user message, resume checking relevant outstanding runs. Check when required for the next safe action.
2. **Unknown Blitzit internals:** agents decide the best safe, deterministic, local-first functional behavior, implement and test it directly. An inferred local functional contract is not a claim of Blitzit source confirmation.
3. **Unknown source visuals:** defer missing exact Blitzit appearance to optional **explicitly activated** M11 source physical comparison. No activation here; independent Narro Windows physical acceptance remains needed.
4. **Approved Create/Edit List:** user-owned Spectrum Core color picker + image upload + 218-icon selection are fixed Narro product choices. Do not change them to match Blitzit; only correct proved bugs without altering approved UX.
5. Finish compatible implementation/CI/merge as feasible before consolidated Codex physical run; Codex physical owner remains paused now.

## Read-only CI inspection and actual new integrations

Source PR #285 head `c2de5400a9e14d9c29ab6887b6026aa0dc5c0f95` / run 37917252663 three jobs SUCCESS; expected-head guarded squash-merged as `b68942aa4149941742e646be3e1c028485c9440f`.
Source PR #296 head `ef092b549e6791f6aa70c4db6dbafc5bff23db95` / run 37964404603 three jobs SUCCESS; expected-head guarded squash-merged as `c3eff12da7c17a4172cbef7c0d1e42689043cba3`. This Week numerator/denominator remains explicitly **Narro-inferred** (U24), not proven Blitzit formula; no domain-safety or native/source parity PASS inferred.
Source PR #288 head `0cd5bc5ade5d8af9f14d909f6867c50bc4e15774` / run 37922790771 three jobs SUCCESS; expected-head guarded squash-merged as `1b8c895bf72638727d703219debe229abc8fbd76`.
All three changed PR heads had no product-doc changes; newer policy docs on main were preserved. Resulting-main Windows CI and packaged/native Windows checks were **NOT RUN/NOT VERIFIED** at this checkpoint; PR-head PASS is not a resulting-main PASS.

Main instructions updated: `AI_START_HERE.md` commit `3cf661909871815acc6d549cb55550dd32e6ab00`; `AGENTS.md` commit `20f12b8e0f49cd50c1583abd7e0cdb465ab89a98`; source-uncertainty register commit `dc4edf253895e710830eb95c6623a651bf10f5fc`. All docs-only [skip ci].

## Exact failure findings; do not invent PASS

- #299 M6 B50 old exact head `ade3a5a1f03e8ffc15216f60878a90300916f9fe`, run 37963623234: validation PASS, **fast FAIL** at `scripts/test-ui-focus-panel.mjs:264`: stale test asserts `Skip < Extend` although new authorized contextual third-slot Extend is before Skip. Branch `implementation/m6-b50-contextual-extend-20261009` received targeted test-only commit `424cc988644ece1d6ce5bc89fd8e7c2cec10cb56` that flips the check to Extend-before-Skip. No behavior/CSS modified. New exact-head full CI required; local Node/Windows tests NOT RUN here.
- #295 B21 original head `aa15424621e1ff932a1148521e680c9f799cf106`, run 37964120703: validation PASS, **fast FAIL** due to missing `src/WindowsShortcutsDialog.tsx` read by `scripts/test-ui-preferences.mjs`. The branch predates #294's now integrated dedicated-shortcuts source. Reconcile with modern main without dropping user/current source; rerun exact-head CI. Do not classify as a monitor feature defect.
- #286 B32 original head `50d312b395ba52323360d55b02384265a8373959`, run 37930178261: Rust 389/389 and visual capture contracts passed; **Windows FAIL** at `scripts/validate-reports-captures.mjs`: `reports-sessions-detail-keyboard-light screenshot is unexpectedly small`. Missing Focus upload artifact is secondary. Diagnose screenshot creation/fixture readiness/focus, not arbitrary assertion weakening; native acceptance OPEN.
- #280 B67 head `19c95930a9e3da3f92ba54a71a725763066e6d81` run 37902450730 FAIL: prior proved transient Edge profile cleanup EPERM resolved separately by merged #283 on main; this old branch head still needs current-main integration and new CI. Do not turn previous FAIL into PASS.
- #298 B22 head `000e7d50d34a2e7a4c04f581582f717f9d46ddc2` run 37963074274 three jobs SUCCESS, but GitHub currently marks mergeable=false after subsequent Preferences edits (including merged #288). Do not force merge or overwrite recent source. Reconcile to main with current records, rerun CI if changed.
- #300 B57 head `9a393ee5be8741d442fb36e472dbb1e97b6b5599` run 37965486561 validation+fast SUCCESS, Windows candidate IN PROGRESS at inspection. Do not mark green until complete.

## Continuation

1. Reconcile overlapping #298/#295/#300 Preferences PRs against latest main, retaining #288 current titles and #294 dedicated-shortcuts. Correct #295 only evidence-backed stale test/source ownership as needed; do not overwrite other ongoing PR owners.
2. Check the new #299 exact-head CI at next useful checkpoint/user message. Fix only exact failures. #286 requires specific screenshot evidence, and #280 must be rebased/reconciled with #283 before claim.
3. Update current handoff/TODO/STATUS with actual merged vs open head/CI status; keep M1–M9 physical gates and M11 dormant. No Codex physical reactivation or source-visual PASS is claimed.
