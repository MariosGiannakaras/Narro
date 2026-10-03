# 2026-10-04 — Repository continuation / M10 gate audit

## Scope

Documentation/process audit only. No Narro production source, tests, Rust/React/Tauri configuration, migrations, build logic, PR source branch or runtime behavior was changed.

The user asked for a general repository check after a stale planning branch was found 295 commits behind main. The audit therefore checked:
- current `main` and authoritative bootstrap/tracking files;
- live PR/CI state;
- remote branch ahead/behind state;
- whether unmerged branch work was superseded, duplicated, historical, or still useful;
- M1–M9 open acceptance obligations that could invalidate a premature M10 release-candidate pass;
- whether Final Comprehensive Review wording could accidentally trigger a second broad Blitzit forensic pass.

## Live baseline

Initial audit baseline:
- `main`: `5f2adb452e80a69e22407fc34e5dafd5caf1daf7`;
- active PR: #227 `fix(m5): align Pass-3 board parity corrections`;
- PR #227 exact head at audit: `d40cd9edec6456bc25dafb792ad3ab29876abe99`;
- Windows CI #927 / run `37161179503`: started for that exact head and still IN_PROGRESS at the final audit check;
- PR #227 changed only source/test/fixture files and did not touch authoritative coordination Markdown.

Documentation corrections ended on main at:
- `a67f025ce7191870a7d2adfc615aa5715bab1d2f`.

No CI PASS is claimed for #927 in this log.

## Findings corrected

### 1. Stale HANDOFF continuation

Before correction, `HANDOFF.md` still said there were no open PRs and instructed a new agent to create an M5 branch. Live GitHub already had PR #227, so that wording could have caused duplicate M5 work.

Corrected durable rule:
- PR #227 is the active M5 line;
- inspect its live exact-head CI before merge;
- do not create a competing M5 branch;
- its branch does not touch authoritative coordination Markdown, so current main tracking must survive the later merge.

### 2. Explicit concurrency ownership

The user-directed split is now durable:
- active PR #227 line owns M5 and then the routed M6 correction slice only;
- that line stops after validated/merged M6 and must not take M7/M9/M10;
- the existing local Windows/Codex line owns all M7 closure, including P3-M7-01/02 and the PR #225 exact-EXE physical line;
- M1/M6/M8 physical acceptance that depends on the same replacement focusSurface build stays with the Windows validation line where it can be batched safely;
- after these lines converge on authoritative main, the later release line closes remaining M1–M9 obligations and may enter M10 only when the hard gate is clear.

### 3. Hard M10 release-candidate entry gate

A new binding gate was added to `AGENT_WORKFLOW.md` and `TODO.md`.

M10 must not start, count, or advance while any required M1–M9 obligation remains open, including:
- reopened earlier-milestone acceptance;
- M1–M9 `FIX_NOW` implementation routes;
- required physical/manual Windows gates;
- milestone-level source-parity correction/direct-comparison gates;
- active earlier-milestone source/config/test PRs that can still change the application.

Preparatory M10 tooling may exist earlier only if independent; it does not count as M10 validation.

Immediately before M10, the release line must reconcile TODO/HANDOFF/STATUS/crosswalk/live PR+CI/resulting main and record the exact release-candidate starting SHA.

### 4. Final Review no longer implies a second broad forensic pass

The old Final Comprehensive Review wording still instructed a future agent to ingest/catalog and complete timestamped analysis of the whole uploaded Blitzit corpus even though canonical source analysis is already complete:
- 19/19 MP4s;
- 46/46 canonical screenshots;
- 46/46 static calibration dispositions;
- 8/8 calibrated visual-system families.

The TODO wording now requires Final Review to consume/re-verify the canonical records and release-candidate comparison results. Raw media is reopened only for:
- a concrete ambiguity/conflict;
- an implementation-exposed uncaptured detail;
- direct final source verification of a comparable release-candidate state.

This keeps final source verification strict without repeating the completed forensic research pass.

## Dormant branch audit

Remote branch comparison was performed against the then-current main.

### Superseded / duplicate / historical — do not resume as continuation branches

- `analysis/blitzit-pass3-media-bridge`: temporary source-video artifact bridge; source forensics are now complete/canonical.
- `blitzit/planning-board-forensics-20261002`: old planning evidence/implementation line superseded by canonical Pass-3 records, merged PR #213 and current PR #227 corrections.
- `feat/m9-reports-command-api`: PR #204 was explicitly closed as duplicate of the existing Reports command implementation line.
- `fix/blitzit-planning-board-parity`: five unique old planning commits remain outside main ancestry, but the material planning behavior was superseded/reimplemented through merged PR #213 and the routed/current PR #227 corrections. Do not merge this old branch.
- `fix/m7-visual-hold-physical`: PR #191 was closed unmerged after repeated physical failures and superseded by the adopted single-focus replacement and later corrective/physical lineage through PR #192 and PR #225.
- `fix/visual-fixture-ready-retries`: zero commits ahead of main; no unique continuation work.
- `m1/retry-diagnostic-db-hash`: PR #218 was explicitly closed because direct-main follow-up `f1a200c...` superseded the same validator-only fix and passed resulting-main CI #866.
- `plan/m8-notification-alert-gate`: PR #196 was explicitly closed as duplicate of merged PR #195.

These branches being “ahead” does not by itself prove missing product functionality; in several cases the equivalent/corrected implementation entered main through a different lineage.

### Preserve as evidence/seed, but do not merge wholesale

#### `brand/pure-vector-runtime`

This old branch contains still-relevant M10 branding concepts:
- canonical app-icon source rather than the full stacked wordmark;
- dedicated symbol-only tray derivative;
- branding verification/preflight.

Current main still has older icon/tray generation mechanics, so the branch contains useful M10 evidence/implementation ideas.

However it is long-diverged and is **not a safe continuation branch**. M10 must re-evaluate/reapply only the useful concepts from current main. `TODO.md` and `STATUS.md` now record that rule.

#### `m1/diagnostic-event-trace` and `m1/diagnostic-event-trace-v2`

These contain unique diagnostic-trace experiments that are not present on current main. Current Candidate-B M1 B/C/D procedures do not require them, and no current handoff names them as a prerequisite.

Disposition: historical diagnostic experiments. Do not resurrect automatically; reuse only if new physical evidence demonstrates a concrete need for deeper native event tracing.

## Earlier milestone gates relevant before M10

The audit confirmed that “M7 finished” is not by itself sufficient to enter M10.

At this checkpoint:
- M1 remains reopened at 14/19 top-level items, including selected-monitor/reconnect/performance acceptance;
- M6 still has reopened physical replacement-host acceptance;
- PR #225 exact-EXE physical observations affect M5/M7/M8 acceptance;
- M9 is 11/12 plus a non-counting direct canonical source-parity gate;
- M5/M6/M7 Pass-3 corrections are still in active/queued implementation/validation.

The new M10 gate explicitly prevents release validation from running on an application that can still materially change.

## Files changed

Documentation/process only:
- `AGENT_WORKFLOW.md`;
- `TODO.md`;
- `HANDOFF.md`;
- `STATUS.md`;
- this immutable work log.

No implementation file, PR source branch or test was changed.

## Non-actions by design

- No stale remote branch was deleted. Branch deletion is destructive and was unnecessary to make continuation safe.
- No old branch was merged or rebased.
- No PR #227 source was changed.
- No CI result was guessed or promoted.
- No progress counter was incremented.

## Exact continuation

1. M5/M6 owner resumes PR #227 and inspects exact-head CI #927; merge/reconcile only if actual validation permits, then complete the routed M6 slice and stop.
2. Existing M7/local-Windows owner completes M7 P3 corrections plus the dependent exact-build physical acceptance.
3. Reconcile remaining M1–M9 physical/source-parity obligations on resulting main.
4. Complete M9 Overview PDF and Reports/Sessions direct parity if still open.
5. Enter M10 only after the hard entry gate is mechanically and evidentially clear.
6. Final Comprehensive Review then runs against the frozen validated M10 release candidate using canonical Pass-3 evidence rather than repeating broad forensics.

Progress counters were intentionally unchanged by this documentation-only audit.
