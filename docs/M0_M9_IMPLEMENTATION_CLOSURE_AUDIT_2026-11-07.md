# M0–M9 implementation and closure audit — 2026-11-07

This is a dated audit/disposition map, not another live task controller. [HANDOFF](../HANDOFF.md) chooses the next operation; [TODO](../TODO.md) owns the original milestone criteria. No checkbox or physical verdict is changed by this audit.

## Scope, identities and conclusion

User request: another repository-wide check, especially implementation method and what remains until M0–M9 can close. Audit base main: `c6b396c9621f19beafda34ab2de7ce9589d75ff0`; current source heads were rechecked live. No local Narro executable/installer, physical capture, AppData reset or OS/hardware change was run. No application PR was modified or merged.

**The repository defines mandatory M1–M10, not a numbered M0.** Here M0 means the existing requirements/source/architecture foundation only; it is not a new milestone, denominator or research campaign. Formal M1–M4 acceptance remains scoped as recorded. The one unchecked M1 standalone harness invocation is explicitly optional/deferred, not a blocker reopening M1.

**M5–M9 have59 unchecked documentary acceptance rows:6/13/18/11/11. They are not59 unimplemented features.** Most behavior already exists. Important corrections are implemented and automated-validated only on the open source stack; they are absent from main. Their remaining work is independent native/source acceptance, integration, resulting-main verification and precise criterion reconciliation. New physical failure may require a focused source correction; missing proof alone is not a reason to rewrite working code.

The existing architecture is suitable to continue this closure cycle: Rust/domain/SQLite owns durable identity, accounting and timers; React projects it; one serialized Focus presentation owner and finite native raster own Panel/Timer transitions. This audit does not establish a reason for a blanket rewrite or early whole-app one-HWND migration. It does not certify every source line, native path or source-parity claim correct.

## Verification actually performed

- Inventoried the complete current repository tree and source/test/module families. Main contains137 TypeScript/TSX files and93 Rust source files,79,164 lines including fixtures/tests; the coarse production-source marker scan found no `todo!`, `unimplemented!`, TODO/FIXME/HACK placeholders. This inventory/scan is discovery, not a correctness proof or a claim that every line was independently exercised.
- Cross-checked all59 open M5–M9 criteria and the optional M1 row against reachable components/native commands, existing regressions, source dispositions and current PR contributions. Reviewed the M2–M4 foundation constraints, transactions/CAS, timer boundaries, recurrence/DST, normal Quit, shared projections and relevant error/focus paths; reused unchanged accepted evidence instead of replaying the closed original research.
- Direct comparison proves main application source/config under `src/` and `src-tauri/` is unchanged since its PR437 merge base `ba34c4ae37c5a997977deb8f60479df1bb791bce`. PR437 contributes51 application source/config paths relative to today's main. Current main's later workflow/test/cleanup corrections must be preserved.
- Read and compared the actual PP44-F01 history transaction/reader and its repaired branch; Timer callback lock boundary/deferred-report guard; task/session/checkpoint/history-owned live Taken cache; renderer synchronous Timer revision owner; keyed Reports projection; monitor identity/preview/recovery/SNAP and finite raster/move-diagnostic entrypoints. Linked their existing regressions and native limits below. No speculative source patch was applied.
- Rechecked six open PR identities and exact green runs for default/A/B/upstream candidates. Main-equivalent source/tooling CI42347227803 is3/3 SUCCESS. The30 open CI-recurrence issues are candidate-pattern triage prompts, not30 proven current app defects or new M9 implementation tickets. Their individual root causes are not all re-investigated or closed by this audit.
- Ran actual local `git merge-tree --write-tree --name-only` trials, without mutating any source branch. PR418/431/436/437 merge mechanically cleanly with audit-base main. A389 and B419 each conflict in `package.json`. All six trial trees retain zero `work-log/evidence/` files. PR437 trial preserves current main HANDOFF/STATUS/TODO/rules/helper/CI and has application/build inputs identical to exact PR437.
- Executed full frontend preflight on that local, unpublished combined main+PR437 tree: **116 test command entries PASS**, config/icon preparation and production build PASS;121 total npm lifecycle entries, exit0. Trial tree `9b5ad06676c6baffc3802328b702f8edddde1301`, local-only synthetic commit `45aaed82d28a0f9913d6f969d1aaf79feea5b6b7`. These are audit scaffolding, not a published/admitted application build. Checkout returned to main afterward. Local native Rust execution and native/physical/source-pixel acceptance were **NOT RUN**; exact-head Windows CI below is reused for automated native evidence.

## Existing source changes still outside main

| Source role | Current use |
| --- | --- |
| PR437 | Default joined431/436 + Motion v4/accounting/recovery candidate; exact source/CI/package owned by HANDOFF |
| A/PR389 and B/PR419 | Independent strict8/8 sources/quiet packages; no verdict transfer |
| PR431 and PR436 | Upstream requirements represented in default source; preserve independent claim coverage |
| PR418 | Design/source contract, not another physical binary |


### Confirmed accounting defect versus an already-authored repair

**PP44-F01 remains a main-integration blocker, not an unfixed new437 source defect.** Main `persistence/sessions.rs` edits/deletes closed history and commits without reconciling a previously negative manual adjustment; `task_metadata.rs::task_time_taken_seconds` rejects a negative effective total. PR437 `0e8b960b`/formatted head63234502 adds `preserve_nonnegative_time_taken_after_history_mutation` in the same successful CAS transaction, preserving raw sessions/checkpoints and rollback. Existing Rust regressions cover edit/delete, zero floor, positive adjustment/CAS and later live accrual. Its exact native Board/Reports/edit/delete/restart proof and integration remain open. Do not reset data to hide the failure, clamp only the renderer, or duplicate this existing repair elsewhere.

**The historical poisoned-lock incident is not root-fixed merely by the unlock guard.** Main emits some Timer boundary callbacks under the state guard; PR431/437 defer them until unlock, including committed-error paths, and add poisoned-lock/SQLite integrity regressions. That is a concrete prevention improvement. The original first-process panic lacks a definitive first-fault reproduction/stack; retain its explicit unknown disposition and instrumented failure route. Do not claim a cause or completed native recovery from green tests alone.

**Movement is a source/instrumentation investigation only if the real probe still fails.** PR437 already includes opt-in bounded, nonblocking `NARRO_NATIVE_MOVE_TRACE_DIR` receipts. First prove capture/input and actual nonzero HWND displacement. If no displacement occurs, retain the exact attempt/trace and return it to the source owner; do not run a long SNAP/differing-position campaign or invent a new root cause from stationary footage.

## Criterion-level closure map — the existing59 rows

Implementation column: **MAIN** means reachable existing code, not physical PASS; **STACK** means additional current431/436/437 source not yet integrated; **LIMIT** means a source-unknown detail requiring the existing explicit disposition. All new physical acquisition remains NOT RUN. Existing bounded historical verdicts remain historical facts and may be reused only where their scope/dependencies remain valid; retired Narro media must not be restored as fresh comparison evidence.

| Milestone / existing criterion | Implementation and source owner | Smallest outstanding proof / disposition |
| --- | --- | --- |
| M5 B23 Home preview rows | MAIN `HomeDashboard.tsx`, Home CSS/tests | Comparable fresh original-source geometry; keep inferred EST row-time meaning explicit. No new rounded-row implementation. |
| M5 SS-C01 approved List editor | MAIN `ListEditorModal.tsx` / popovers | Missing upload/rendering, dark-custom contrast and applicable native states; preserve user-accepted picker/icon scopes and locked Spectrum/upload/218 icons. |
| M5 B40 scheduled occurrence groups | MAIN `ListBoard.tsx`, `boardTaskGroups.ts` | Missing source styling/motion and exercised recurrence paths; no duplicate group implementation. |
| M5 B43 Done date grouping | MAIN Board/date formatter + existing rendered contracts | Unproven source geometry, long/narrow header and real independent scroll; preserve accepted grammar. |
| M5 B45 recurring-parent menu | MAIN `TaskCard.tsx`, `taskScheduleQuickRemove.ts`, recurrence CAS | Actual parent action, persistence/child preservation, keyboard/source state; menu presence is already implemented. |
| M5 A2 archived preview composition | MAIN `ArchivedListsPanel.tsx` responsive preview cards | Compare available canonical composition; do not resurrect the obsolete no-previews/horizontal-row diagnosis or guess unknown metadata. |
| M6 A3 Focus selector | MAIN `BoardListPicker.tsx` / `FocusPanel.tsx` | Remaining keyboard/selection/source appearance; reuse scoped catalog projection facts. |
| M6 B49 live hover actions | MAIN `FocusLiveActions.tsx` and shared controls | Actual hover, hit targets, focus, pending and source comparison. |
| M6 B37 POMO badge | MAIN `FocusPanel.tsx` / timer projection | Fresh work/Break source geometry and native state, not another badge patch. |
| M6 B36 Break Done history | MAIN `useFocusDoneBreaks.ts`, `get_focus_done_breaks` | Exact current-source styling/motion; preserve accepted bounded persistence/presence. |
| M6 B63 inline completion success | MAIN `FocusCompletionSuccess.tsx`, coordinator | First/next/last success and header/queue on the admitted host; strict motion remains independent. |
| M6 B64 celebration media | MAIN `FocusCelebrationReaction.tsx`; LIMIT original media | Compare available animation evidence; unknown original GIF assets/variants need explicit source-limit disposition, not invented parity. |
| M6 B65 early/late completion text | MAIN success metrics/domain projection | Actual corresponding early/late states and original wording/visual scope. |
| M6 B35 Break active-card identity | MAIN `FocusPanel.tsx` / live task projection | Native Break behavior and source appearance; do not mutate durable task identity for display. |
| M6 B38 temporary Break header EST | MAIN Focus aggregate/projection | Native work-to-Break-to-work projection and exact available source; no second persistence computation. |
| M6 B67 signed overdue clock | MAIN `focusTimerPresentation.ts` / Focus and Timer views | Real expiry/Extend and signed clock on exact binary; old proposed-only diagnosis is obsolete. |
| M6 B50 Time's Up actions | MAIN `FocusLiveActions.tsx` | Real pending/expiry/Extend/Skip actions, hidden versus visible controls and source interaction. |
| M6 B31 overdue relative age | MAIN `focusOverdueAge.ts` / task rows | Actual dated tasks, visible relative age and relevant source states. |
| M6 replacement coordinator reacceptance | MAIN + STACK `FocusSurfaceCoordinator.tsx` | Changed M6 dependencies on the admitted single-host transition/task/session implementation; reuse unaffected domain work. |
| M7 one-host compact presentation | MAIN + STACK coordinator/native region | Exact same HWND/WebView, source/destination ownership and complete first/settled frames. |
| M7 move/topmost/taskbar | MAIN + STACK native placement/windows | Real nonzero drag, z-order/taskbar and measured placement. Trace a failure before speculative source edits. |
| M7 collapsed content | MAIN `FloatingTimerFoundation.tsx`; STACK live Taken/revision | Actual title/timer/subtask/add/expand state including accounting consistency. |
| M7 expanded action strip | MAIN Floating Timer/live actions | Exercise each applicable action, real input, pending/focus/error and source controls. |
| M7 expanded subtasks | MAIN `FocusLiveSubtasks.tsx`, `TaskSubtasks.tsx` | Actual create/edit/reorder/delete/progress and focus/durability, not presence-only footage. |
| M7 stable icon targets/tooltips | MAIN shared icons/Timer CSS | Hover/focus, clipping/hit geometry and unchanged width at applicable DPI. |
| M7 Panel↔Timer transition | STACK Motion v4/raster/monotonic owner | Exact continuous directions normal/reduced; no duplicate text/blank/clipping/stale hit areas. |
| M7 Gate7 exact-executable compositor | STACK + separate A389/B419 owners | Each held binary's own criterion; no browser/CI/other-candidate transfer. |
| M7 flash/scrollbar/duplicate revalidation | STACK atomic native raster | Complete original first/last handoff intervals at admitted motion/DPI states. |
| M7 Focus↔Timer shortcut | MAIN shortcut native owner + STACK transition | Actual global/in-app input and serialized result during relevant states. |
| M7 locate-Timer finite pulse | MAIN shortcuts/coordinator | Actual locate/focus/pulse, finite termination, reduced-motion and visible placement. |
| M7 placement/restart policy | STACK431/437 optional persisted placement | Same-process position; actual tray Quit/new process OFF versus ON, missing-monitor fallback and return. |
| M7 topmost versus other apps | MAIN native window flags | Real normal-maximized/borderless observation; document any exclusive-fullscreen boundary. |
| M7 expanded work-area containment | MAIN + STACK placement/SNAP | Real edge/bottom/taskbar, DPI/work-area and four-corner behavior with displacement. |
| M7 no continuous idle decoration | MAIN finite motion + STACK finite raster | Quiet non-recording performance/idle observation using its existing measurement protocol. |
| M7 OBS-01 replacement motion | Existing criterion, current STACK | Current first-frame/geometry/source claim; old CI953/PR225 is provenance, not the next binary. |
| M7 OBS-02 action labels | Existing criterion, MAIN + STACK | Missing current input/timing/hit-target/source comparison only. |
| M7 final scoped reconciliation | Current owner/claim matrix | Retire stale PR225 next-action wording; reconcile all applicable current M7 subclaims and preserve independent M1 acceptance. |
| M8 B29 Windows Shortcuts dialog | MAIN `WindowsShortcutsDialog.tsx` | Native dialog input/focus/toggle and corresponding original visual scope. |
| M8 B57 preference info icons | MAIN `PreferenceSettingsSections.tsx` | Known per-label/source state; hidden unknown tooltip mechanics remain LIMIT, not invented commands. |
| M8 B34 Preferences composition | MAIN styling; STACK loading/readiness | Cold/ready/save/error, keyboard/focus and source composition without a partial-form flash. |
| M8 B21 monitor-card selector | MAIN selector; STACK actual identity/images | Real selection/mapping/appearance; placement success alone does not prove the control. |
| M8 U-R04 model/friendly names | STACK431/437 `monitor_display.rs` / selectors | Verify actual physical-device-to-label mapping in full and quick Preferences. Code is no longer merely planned. |
| M8 U-R05 per-device snapshot | STACK431/437 native bounded preview | Distinct actual desktop/image association, missing/stale/error behavior; preserve frame and no added refresh UI. |
| M8 B22 timezone selector | MAIN selector + validated IANA boundary | Actual keyboard/menu/save and available source geometry; do not invent the source option set. |
| M8 B17 conditional child controls | MAIN preference sections/domain | Actual parent toggles, child preservation and keyboard/source states. |
| M8 B18 volume popover | MAIN `SoundPreferenceControl.tsx` | Actual anchored vertical input/preview, Escape/outside/focus and source motion. |
| M8 B69 finite timed-alert wash | MAIN `TimedAlertFlashRuntime.tsx` | Real alert/card target, finite/reduced-motion behavior and source timing/palette. |
| M8 B9 independent success sound | MAIN preference + committed-success sound owner | Actual audible preview/success/volume/mute and parent interaction; silent video is not audio PASS. |
| M9 B25 Reports filter | MAIN multi-select/presentation; STACK request key | Real list/date changes and error/retry without mixed old-request data; direct source state. |
| M9 B30 full date buckets | MAIN report projection/chart/PDF | Applicable8/30/60/90-day rendering and native/PDF/source comparison. |
| M9 B28 chart category hover | MAIN Reports view/hover | Actual pointer/keyboard category band, Total emphasis and original composition. |
| M9 A3 chart options | MAIN series-visibility controls; LIMIT original options | Actual independent toggles; unknown original submenu does not justify a new feature set. |
| M9 B27 Done row chronology | MAIN merged PR388 `reportDoneOrdering.ts` | Missing native/source/PDF comparison; do not redo ordering or mutate shared Rust history. |
| M9 A2 date navigation | MAIN range presets/calendar; LIMIT original chevron effect | Native Apply/Cancel/keyboard and known source state; preserve explicit inferred effect. |
| M9 B56 Sessions Total Tasks | MAIN completed-or-worked unique-task contract; LIMIT source formula | Data-consistent native totals; do not claim unknowable exact Blitzit formula/archive semantics. |
| M9 B51 Break icon | MAIN Sessions icon/filter | Direct current-source visible state and actual filter behavior. |
| M9 B68 Add Session task picker | MAIN bounded Recent Tasks picker | Actual open/select/dismiss/pending and durable task identity; no inferred recency algorithm. |
| M9 B59 Recent Tasks list badges | MAIN list-color-backed picker rows | Comparable badge appearance and real dropdown state; heading is not sorting proof. |
| M9 B32 Sessions detail modal | MAIN nested session-dialog lifecycle | Actual focus/keyboard/commit/cancel and missing source detail; preserve bounded previous acceptance. |

## Implementation method and shortest valid closure sequence

1. **Admit the existing joined candidate437.** Read current HANDOFF/protocol, recheck its live SHA and cached EXE hash and actual capture/input/process state. Do not rebuild unchanged source because another chat begins. Start with a short real movement/trace admission and the repaired PP44-F01 accounting journey; these determine whether dependent long batches are useful. Keep unrelated Windows/hardware actions within the actual case scope.
2. **Acquire only compatible missing/invalidated claims together.** Panel/compact/expanded normal/reduced motion, real timer expiry/Done/restart, Reports/history and normal-profile UI can share prepared data and chronology. Real HDMI/topology, audio, quiet performance and strict independent A/B suites retain their own proof conditions. Use original Blitzit versus fresh Narro, actual frame timestamps and per-claim verdicts; do not restore retired media or repeat source research.
3. **Repair only a defensible remaining failure at its authority.** Use the existing source owner/PR. Diagnose the full relevant interval and event/IPC/native/SQLite chain first; distinguish failed input, stale projection, persisted corruption and compositor defects. Fix accounting in one transaction, Timer identity in its one synchronous owner, request data at its request key, and native composition at its owned handoff. Do not add renderer-only clamps, arbitrary waits, duplicate state, high-frequency JS native resizing or separate per-symptom replacement branches. Add a causal semantic regression plus relevant negative/stale/restart/error boundaries; preserve fixtures/assertions. Two separately corrected native failures of the same criterion require the existing architectural reassessment.
4. **Validate the one changed source head.** Narrow affected tests → full available frontend preflight → exact-head prescribed Windows CI; record unavailable local Rust/native checks honestly. Existing greenCI belongs to the exact recorded SHA. Reuse unaffected evidence. Do not spend another full CI merely on this audit, docs, a new chat or unchanged artifacts.
5. **Complete independent holds, then integrate once coherently.** Prefer existing437 as the joined production landing point for its already-contained431/436 contribution, subject to each requirement/owner's actual acceptance. Do not merge six PRs blindly or repeat the same overlapping suite on431,436 and437. A/B strict holds remain independent; a comparator is not an additional required production runtime. Recheck actual merge conflicts/current main at that time, preserve newer rules/helper/CI and completed cleanup, and resolve any necessary package contracts before validating the resulting source. Trial cleanliness is not merge authorization.
6. **Verify resulting main and reconcile criteria.** Expected-head guarded merge only after its actual holds close; compare exact application/build/tree identities and observe the required resulting-main CI rather than assuming success. Reuse still-valid native claims with an explicit dependency/identity rationale; rerun any application/build/packaging interaction actually invalidated. Close individual TODO rows only when their entire acceptance is evidenced or an existing permitted source-limit disposition applies. Keep confirmed known mismatches OPEN; do not convert uncertainty into PASS or require optional M11 to resolve an already accepted source limit.
7. **Stop at accepted M9.** Publish exact main/build identity, per-milestone source/automated/native/parity status, unresolved limitations and user-test instructions for the post-M9 review. M10 requires subsequent explicit approval. Whole-app single-HWND TrackB, M10 release/installer-wide sweep, optional live Blitzit M11 and in-app M12 are not additional pre-M9 prerequisites or automatically authorized by this audit. PA08 installer work is performed only for a genuinely required/invalidated scenario, not replayed by default.

## Closure and limits

All59 documentary rows now have a code/owner and smallest remaining proof/disposition in this audit. There is no finding here that justifies starting59 fresh feature implementations. The actionable main/source gap is landing the already-authored joined fixes after their acceptance, plus any narrowly established failure that remains in the current executable. Real movement's causal owner, first-fault poisoned-lock history and unobserved native/source states remain explicitly unresolved; no fabricated all-app PASS is issued.

Original Blitzit86 manifest assets, accepted design choices, detailed checkbox sequence and optional-stage gates are protected. Cleanup remains complete. Audit scaffolding is disposable; verified software candidates remain available outside Git. The [immutable audit receipt](../work-log/2026-11-07-codex-m0-m9-implementation-closure-audit.md) records publication/validation provenance; current HANDOFF records final local disposal and the one next action.
