# 2026-10-12 — Narro repository consolidation, Phase A/B metadata and research de-duplication

## Explicit user authorization and exclusion
User said **“Ξεκινά. Να μου λες που βρισκόμαστε κάθε φορά”** following a proposed multi-phase organization of existing trackers/research, branch provenance and prevention of duplicate investigations. This authorizes **source-safe documentation/index consolidation and non-destructive audit of branches/scripts/evidence**, not an inference of permission to delete remote refs, immutable media, rewrite Git history, install/run native Windows or activate optional M11. No source/config/tests/CI changes here. User needs regular concise status updates.

## Reused (not repeated) prior completion
At start the **latest live main HEAD** was `fd8ee410cfd9c882160c565ab5a743420f6bd971`, no open PRs. Prior hygiene already compacted active root HANDOFF/STATUS/TODO without damaging original full trackers. Independently fetched the three `work-log/tracker-archives/2026-10-12-{HANDOFF,STATUS,TODO}-before-hygiene.md` snapshots: original exact Git blob SHA **`cd7516e64842423ca3443fb89d42ac454abf1e4a`**, **`6a3e8a2a7559d38c413a579296fa36389a6898b2`**, **`4d45150bd4e3b14b62be0c633fab52c503d8e2c9`** respectively; all 3 provider-reported content SHAs MATCH pre-hygiene index. Did not recompact or overwrite these immutable files. [Original shallower audit](../docs/REPOSITORY_HYGIENE_SHALLOW_PASS_2026-10-12.md).

## Real branch-metadata review: 20/20
Fetched live GitHub `branches?per_page=100`: exactly **main + 20 non-main remote refs**, 0 open PRs. Compared **each branch** using GitHub `compare_commits({base:"main",head:branch})`: **2 fully-behind** branches, both 0 ahead (`audit/20261011-focus-live-real-handler-regressions` behind 402, `fix/visual-fixture-ready-retries` behind 1733), and **18 diverged with one or more unique branch commits** (ahead 1..21, behind 630..1906). Ahead/behind metrics are exact **at the baseline main SHA noted above** and need recheck before *any* future deletion/merge because docs-only commits advance main. Every branch SHA, discrepancy count, touched source family, PR link and conservative disposition is in the **single live [branch and tracker index](../docs/TRACKER_STATUS_INDEX.md)**; do not build another disconnected branch tracker.

PR-head search returned 7 exact associations; separately fetched all seven current PR records and verified **CLOSED / merged=false**:
- `audit/20261011-reports-filter-refresh-stale-order` PR [#325](https://github.com/MariosGiannakaras/Narro/pull/325);
- `evidence/ci1046-video-transfer-20261010` PR [#308](https://github.com/MariosGiannakaras/Narro/pull/308) explicit *do not merge* transfer;
- `feat/m9-reports-command-api` PR [#204](https://github.com/MariosGiannakaras/Narro/pull/204);
- `fix/m7-visual-hold-physical` PR [#191](https://github.com/MariosGiannakaras/Narro/pull/191);
- `infra/ci-learning-visual-fixture-signatures-20261009` PR [#292](https://github.com/MariosGiannakaras/Narro/pull/292), superseded by #291;
- `m1/retry-diagnostic-db-hash` PR [#218](https://github.com/MariosGiannakaras/Narro/pull/218);
- `plan/m8-notification-alert-gate` PR [#196](https://github.com/MariosGiannakaras/Narro/pull/196).

A CLOSED/unmerged older PR or a branch with unique commits is **not a proven missing current feature**. No branch deleted/force-pushed/rebased/reopened. Source spot checks of latest main:
- `src/ReportsSessions.tsx` already has `sessionsReadRevisionRef`, `sessionsActiveRequestKeyRef` and `refreshSessions` / `afterMutation` (relevance to #325); no retrospective merge permitted without reproducing a current bug.
- `src/ArchivedDoneTasksPanel.tsx` has guarded `deleteInFlightRef`, typed `permanentlyDeleteArchivedDoneTaskFromSettings`, actual `ListMutationConfirmDialog` (old M5 archive copy branch is outdated).
- `src/FocusLiveActions.tsx` already contains an Extend action path (do not substitute old B50 branch).
- `src/ReportsOverviewView.tsx` has actionable Chart options menu/series presets (old source/copy claims superseded).
- `src-tauri/src/diagnostic_trace.rs` was **not found in latest main**; old M1 trace branch is a separate diagnostics/provenance assessment, NOT proof a user-facing Narro functionality is missing and NOT permission to run physical native tests.

## Scripts/tests conservative inventory
Read current `package.json` scripts JSON: **115 named npm script entries**, **98 `test:`**, **4 `check:`**, other prepare/build/dev/preflight/tauri. **0 exact command-string duplicates**; raw script counts do not establish redundant tests. Some tests chain direct script dependencies, e.g. `test:performance-harness` repeats a performance scenario command internally, while `prepare:m7-physical-session` references the same physical preparation path; this is *not* reason to remove either without investigating expected timing and coverage. No test, package script, workflow, CI fast gate or assertion edited. Prior shallow path audit reported 135/135 directly referenced script/asset paths exist; not re-run in this phase.

## Actual prevention change
Updated the existing canonical [`docs/TRACKER_STATUS_INDEX.md`](../docs/TRACKER_STATUS_INDEX.md) with a **20/20 branch provenance matrix** and a four-step **no-repeat research intake policy**, instead of creating more independent finding trackers. Updated existing `AI_START_HERE.md`, `docs/EVIDENCE_ROUTING_MAP.md`, `docs/DEEP_ANALYSIS_IMPLEMENTATION_WORKFLOW.md` to point to this single index before new research/evidence work. Only Markdown edited on main with `[skip ci]`; no new executable build claim.

## Remaining stage and blockers
**Consolidation metadata progress:** 3/3 old tracker snapshots verified, 20/20 branch histories compared, 7/7 known PR associations queried and CLOSED/unmerged, 115/115 named npm scripts inventoried, **0 branches deleted / 0 immutable files deleted / 0 code edits**. **Pending:** all **20 branch ownership/retention decisions** (2 behind may be retire candidates only after owner+reference review, 18 diverged need replacement/requirement disposition); test-coverage similarity examination beyond exact commands; approximately **9.4 GB** Git-tracked evidence retention and checksummed off-repo/LFS storage policy (requires separate explicit migration approval). Neither filename resemblance nor duplicate-looking screenshot licenses deletion or CI weakening.

**Separate unchanged product counters:** U01–U41 Narro-local functionality **41/41**, known code gaps **9/9**, mandatory fully physical accepted milestones **3/10**, **7 remain**, native Codex PA-01–09 **USER-PAUSED/NOT RUN**. User-owned Spectrum Core picker/upload/218 icons LOCKED. Latest executable source still [U04 guarded merge `ec7673c`](https://github.com/MariosGiannakaras/Narro/pull/343), [resulting-main CI38287299890](https://github.com/MariosGiannakaras/Narro/actions/runs/38287299890) 3/3 success and verified original production artifact11765510661; new docs-only commits do not invalidate that source.

**One safe next action:** continue *non-destructively* with a per-branch owner/consumer/dependency map for the two behind branches and highest-risk divergent branches (#325/diagnostics), and a script-coverage-group inventory. Ask for specific owner sign-off before branch retirement or evidence migration, do not initiate native physical PA or optional M11. Use current [single index](../docs/TRACKER_STATUS_INDEX.md), not a second tracker.
