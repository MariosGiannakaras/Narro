# 2026-10-17 — B45 recurring-parent Task actions visible menu fixture, exact-head CI and merge

**Owner:** ChatGPT. **Latest user direction:** continue existing work independently; do not restart prior PR367–369, do not perform a global M10 visual audit before its entry gate, and do not ask for physical Windows/OBS unless existing evidence is genuinely insufficient.

## Why and evidence

M5 B45's historical TODO text incorrectly said the production `TaskCard::TaskOverflowMenu` had only generic `Update Schedule` and no `Remove Recurring`. Current verified code already renders `Update Recurring` on parent `recurrenceRuleId` and shows `Remove Recurring` only if the parent-only callback is available. Current `ListBoard.tsx` checks parent/edit/live eligibility, fresh authoritative recurrence ID+updated timestamp, `deleteExistingTasks:false`, an in-flight mutation guard and fail-closed refresh handling. The earlier frozen G5 native corpus **did not exercise the parent overflow menu**; it exercised the underlying recurrence schedule editor/No Repeat and preserved child IDs. Therefore neither fake missing feature nor physical action PASS was appropriate.

## Scoped independent test addition

[PR #370](https://github.com/MariosGiannakaras/Narro/pull/370), branch `test/m5-b45-recurring-overflow-fixture`, changes **only**:

- `src/visualFixtures.tsx`: a `task-recurring-menu` surface rendering the **production TaskCard/real overlay menu** against a synthetic recurring-parent fixture with **no-op action callbacks**; clicks the actual accessible `Task actions` trigger, no persistence or app data mutation.
- `src/visualFixtures.css`: fixture-only visual layout.
- `scripts/capture-visual-fixtures.ps1`: captures actual menu under both dark/light Windows fixture themes.
- `scripts/validate-task-card-state-captures.mjs`: validates opened menu state, recurring parent identity, five correct enabled choices, parent-vs-occurrence label, visual geometry and light/dark equivalence.
- `scripts/test-ui-task-hover-actions.mjs`: static contract for fixture and parent-only safe callback chain.

No source/runtime UI changes, no Rust or persistence changes, no approved Spectrum Core picker/image upload/218 offline icons modified.

## Validated CI, visual evidence, integration

- Exact head **`cde3d7e4188e9f4e3c07a458b24f2c704f8ad97f`**, Actions run **`39037952599`**: validation **SUCCESS**, fast **SUCCESS**, Windows candidate **SUCCESS** = **3/3 PASS**.
- Actual Windows visual artifact `narro-m5-visual-regression`, ID **`12102754320`** (downloaded and inspected). `task-recurring-menu-dark.png/.html` and `task-recurring-menu-light.png/.html` both show **fully visible, not overlapping** production menu `Update Recurring`, `Remove Recurring`, `Change List`, `Duplicate`, `Delete`; the menu is open and parent `data-task-recurrence="parent"`. Dark/light DOM option+geometry tests passed in Windows candidate. This is **SCOPED AUTOMATED UI CONTROL PRESENCE / RENDERED GRAMMAR PASS**, not a physical user action or source animation PASS.
- Expected-head guarded squash merge succeeded at **`b1a342f3955010355c50d930d02e2c5a9f0abf50`**. Resulting main HEAD at verification matched. Exact modified file Git blobs are **5/5 identical** on validated PR head and resulting main:
  - `src/visualFixtures.tsx` = `f89d98478a07fc200cecc170834f62b6f27b5cc0`
  - `src/visualFixtures.css` = `b2877ebb03553c5dfab06cdac7cca974f1eb383a`
  - `scripts/capture-visual-fixtures.ps1` = `48a9db8ec2bb8050b67b949eb4ac83ca67e2c281`
  - `scripts/validate-task-card-state-captures.mjs` = `b75a9eaec239b764bef6f5f8fd7041806bfeec49`
  - `scripts/test-ui-task-hover-actions.mjs` = `4dcf0a2a3d9068702f70863bb0e0f6c21393c637`
- **Resulting-main push Actions run NOT VERIFIED**: GitHub connector's `fetch_commit_workflow_runs` filters to PR-triggered runs; empty returns for merge are not PASS/FAIL evidence. Do not misrepresent identical affected blobs or PR 3/3 as a main-push CI conclusion.

## Honest acceptance boundaries

**B45 source control existence, route and visual labels are CODE INTEGRATED / REGRESSION + WINDOWS FIXTURE OBSERVED.** Actual user click on a real, persisted recurrence parent with in-app update/removal, error/keyboard flows and existing occurrence preservation **remains NOT RUN in this newly authored fixture**. Frozen G5 accepted separate editor lifecycle/persistence paths but not this direct overflow route. Do not conflate; leave B45 M5 physical/source motion conditional open pending genuinely necessary full coverage. No new OBS, no physical personal Windows app launch, no user AppData, no paused PA-01–09, no optional M11/M12. M10 one-time whole-app visual sweep remains NOT STARTED.

**Next safe action:** reconcile the M5 B45 TODO/HANDOFF with this scoped CI proof; continue other uniquely owned, evidence-backed nonphysical work as available. For merged SHA `b1a342f` and earlier merge `a76050a`, fetch real **push/main** CI via an Actions-capable endpoint if one becomes available; this is not a physical testing need. Overall 41/41 Narro-local 9/9 remediated fixed ledgers and previously accepted mandatory 4/10 remain separate from this single targeted visual test; historical bounded evidence-review 5/6 is pending direct resulting-main CI proof.
