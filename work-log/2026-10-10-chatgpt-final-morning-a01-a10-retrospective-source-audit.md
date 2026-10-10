# 2026-10-10 — Direct retrospective audit of all morning A01–A10 corrections and C01

## User request and exact main baseline

User requested a final thorough audit after multiple interruptions. This is a **fresh source/CI/read-model review** of the latest authoritative main (`53a06bfd6bf939f4d4c8b2bfeac2d3b39a82450a` at intake) and actual GitHub PR/workflow records, not a recollection of previous responses or a claim that CI alone proves correctness. Read bootstrap/workflow/engineering quality/evidence routing and current handoff. At intake zero open PRs, all A01–A10 code slices integrated. Current user-paused physical Windows Codex and strict opt-in M11 remain untouched.

## Independently rechecked exact CI / GitHub merge results

All **twelve** relevant PR heads below have `merged=true` and **all three validation-gate/fast-gate/windows-candidate jobs COMPLETED SUCCESS**, independently fetched from current GitHub:
- C01 Finding35 #302 head `601431bce4d4453d5a6c1a8624901ec7baf2eb58`, run `38044923348`, guarded merge `797d0580d89a3a5ef0ff5b561e941d078bb2407f`.
- A01 #305 run `38047897329`, merged `9203bf7ec3cd096063059cef2e4326c1199744b6`.
- A02 #306 run `38049022590`, merged `8eea11ea6f7aa40f81efafcd9845bfa7eefe9035`.
- A03 #309 run `38052663090`, merged `f5b9db263ca03124467714a816662bacaa348ae0`.
- A04 #307 run `38056858648`, merged `ac48759d551279266c2f1d25f35a1e4f58d482e0`.
- A05 #310 run `38053306094`, merged `3012a030009b752db1df5fb543967ab41285ffef`.
- A06 #311 run `38057049911`, merged `057df046dc27e78bca1abc10aa5fd5fe217aa7c5`.
- A07 #312 run `38062610832`, merged `7469ae748beb15642c58d0f2e311e4c5abc7830e`.
- A08 #313 run `38062951891`, merged `744397d587b2fd98ba9e2b29e6089bbc7ca7ef08`.
- A09 #314 run `38063218931`, merged `8e24cbc44534e72c2ad4366d3c430faa52e77b46`.
- A10 #315 run `38063411322`, merged `c21b1f9e85a07c6ec4f4da25b784c10717d82d41`.
- Combined **same-morning A01–A10 source/test tree** #316 head `edebaa4d1e7f44d95e8dc7730062ae185a7fc6fc`, CI `38066478586` all three gates SUCCESS, guarded merge `1bd24411e159b8a1e5d8e51c97e005d7163a1c34`. Previous precise blob proofs under `work-log/2026-10-10-chatgpt-pr316-composite-main-windows-ci-merge.md`. No new local Node/Rust/manual run was performed for *this* retrospective; source/CI acceptance remains historical proven test evidence.

## Actual source and test inspection, A01–A10

| Unit | Direct audited source/behavior | Disposition |
|---|---|---|
| A01 | `FocusLiveActions` owns live Break/Pause/Extend/Skip/Done with immediate `createFocusActionGate`; lock across authoritative mutation, completion and error/finally; checked `beginBreak`, `run`, `handleDone`/Skip. | Existing source/CI accepted for **internal live actions** only; does not alone serialize separate parent row commands. |
| A02 | Focus `BoardListPicker` source-backed SS-H04 anchored popup uses existing ListIcon/contrast, keyboard option navigation, bounded 340px CSS; original Help screenshot and Windows Edge dual-theme real captures compared in existing immutable PR306 review. | Static control composition accepted; current original precise pixels and native popup animation not claimed. |
| A03 | `FocusPanel` `boardReadRevisionRef` now checks cross-path read epoch across initialization, invalidation, timer projections and explicit refetch; inspected source paths 480–729. | Accepted deferred stale-result regression; late subscription before initial read and new cross-window ownership questions are not covered by blanket physical PASS. |
| A04 | `ListBoard` create and duplicate synchronous refs, retain lock until post-commit authoritative refresh; `SearchPalette` quick-create immediate ref before persistence. | **Found definite missed post-success lock leak** in Search (details below). |
| A05 | `ReportsSessions` Add Session ref guards same-render persisted write through afterMutation; source and existing test inspected. | **Found adjacent Edit/Delete cross-action lock gap** not covered by A05 tests (details below). |
| A06 | `FocusPanel` row Duplicate/Complete and Add Task refs acquire before backend call, release in finally after board read. Committed Add closes editor before fallible refetch, avoiding accidental repeated creates. | A06 source contract correct as scoped. |
| A07 | `FocusPanel` shared `focusMutationOwnerRef` now serializes row/add/Make Live/Change List/Delete/Home; guarded pause->presented-frame->native exit and rollback retained; read source and cross-owner regression. | Parent Focus command ownership accepted as scoped; child live actions own a different local gate and are not automatically globally serialized. |
| A08 | `BlitzEntryButton` same-mount start ref across persisted StartBlitz and native presentation; distinguishes committed session vs presentation failure; release in finally. | Code path consistent with source scope; native opening motion separately OPEN. |
| A09 | `FocusLiveMetrics` and `FocusLiveSubtasks` immediate per-editor mutation owners through persisted write/refetch; preserve committed-but-refresh-failed handling, disabled retry and authoritative projection. | Source/CI accepted; actual OS WebView2/native timer continuity not established here. |
| A10 | `ArchivedListsPanel` Restore/Delete share immediate ref through persistence, with input and modal dismissal checks. | Source/CI accepted, historic async initial-load response not asserted to be newly tested. |
| C01 | `FloatingTimerFoundation` visible Time's Up and dual-theme both-size source-verified browser fixtures PR302. | Rendering code fixed; latest native compact/expanded Time's Up test still OPEN. |

**Test-quality qualification:** a number of the new Node tests assert production source strings and execute deterministic *models of* asynchronous gates, rather than directly dispatching genuine React events into the mounted production component. These are useful coverage and wiring safeguards but not sufficient proof of every browser/native interleaving. The exact current combined Windows CI additionally compiled the actual app, exercised broader Rust/frontend regressions and rendered Windows Edge visual fixtures. Do not convert these automated claims into precise Blitzit source parity or native compositor PASS.

## NEW confirmed issue A11 — SearchPalette success leaves persistent gate locked

Actual `src/AppShell.tsx` always renders `<SearchPalette open={searchOpen} ... />`, while `SearchPalette` returns `null` when closed but **does not unmount**. PR307 added `quickTaskInFlightRef` acquired before `createListBoardTask`, released **only on rejected write**. On success it called `onRequestClose()` and `onTaskCreated()` without releasing ref. On the next opening, `useEffect` cleared React `quickTaskPending` but left ref=true, so any subsequent submit silently returned. This is confirmed logical deadlock after a successful first task creation; it is independent of native Windows animation.

New independent [PR #317](https://github.com/MariosGiannakaras/Narro/pull/317), initial head `2c9305e4f911a2980a67e1e9c3b45489d2e2a8fa`, releases the owner in a finally **after** success close/navigation callbacks; preserves write failure retry and same-render suppression. Adds `scripts/test-search-quick-task-reopen.mjs` with actual handler wiring and same-mounted double-success, delayed write, callback-error and failure recovery model; wired into existing fast preflight `test:ui-search-palette`. CI [38071911442](https://github.com/MariosGiannakaras/Narro/actions/runs/38071911442) validation+fast SUCCESS, Windows candidate IN PROGRESS at first later checkpoint. **NOT ACCEPTED/MERGED** pending exact-head full CI and resulting-main identity. Local manual event test NOT RUN.

## NEW evidenced risk A12 — Reports Edit/Delete rely on rendered state only

Actual `ReportsSessions.commitEndTime` and `deleteSession` used only `mutationPendingId` as same-render exclusion. A second Edit/Delete or competing Add can begin before React publishes pending state; backend expectedUpdatedAt guards some duplicate persistence, but rejected stale second mutation can cause spurious visible errors. This is source-provable concurrency window, **not evidence of silent duplicate historical writes**.

Independent [PR #318](https://github.com/MariosGiannakaras/Narro/pull/318), initial head `51b7137702f49e3e4e35459aab0834989618670b`, reuses A05 Add Session ref as shared `sessionMutationInFlightRef`, guarded Add/Edit/Delete acquisitions before IPC and unconditional finally release after read-after-write; preserves draft/end-time validation/expectedUpdatedAt. Existing Add regression renamed to new shared ref; new `test-reports-session-write-owners.mjs` covers same-render competing actions, blocked authoritative refresh, persistence failure and retry. CI [38072180843](https://github.com/MariosGiannakaras/Narro/actions/runs/38072180843) IN PROGRESS/NOT ACCEPTED at initial checkpoint. Local manual/Windows/native UIA NOT RUN.

## Further honest limits and routing
- One boundary to analyze if implementation continues: `FocusLiveActions` internal per-child gate is not the same ref as parent `FocusPanel.focusMutationOwnerRef`. The A07 test covers **parent row/add/home actions**, not a same-render collision between a child Done/Skip and parent Make Live. Backend live-task identity checks reduce unguarded data corruption claims; direct combined interleaving regression NOT RUN. Classify as a **further source-risk question, not a confirmed user-visible bug**. Do not change timer architecture without a proven causal case.
- Retained CI1046 nine MKV original hashes verified and direct critical C4/M6/F35 intervals inspected in `work-log/2026-10-10-chatgpt-ci1046-direct-mkv-source-motion-audit.md`; no fresh latest-build 9-video equivalent or automatic native PASS.
- The current PR316 production-config candidate `narro-m7-physical-windows-x64`, artifact `11675827068`, is the last full-green **integrated as-of-A10** candidate. If PR317/318 source fixes merge, this artifact will be stale for their affected surface. Current candidate downloaded ZIP/EXE hashes **NOT RUN**.
- Physical/OS gates remain: C4 actual continuously rendered Timer→Panel host morph, M6 initial real native motion, C01/F35 native label at true 110/300px region, M9 UIA pending focus, M1 actual monitor/DPI change, M8 real OS notifications/sounds. Mandatory milestones **3/10**; optional M11 dormant and user-paused Codex not restarted.
- No new UX colors/icons were invented or changes made to approved Spectrum Core picker/218 icon catalog.

## Exact next action
Check latest PR317 and PR318 CI after meaningful other analysis. If any job fails, inspect the **first** actual causally failed step, correct only the supported cause. If full green, guard-merge each exact head and prove affected source/test Git blobs against resulting main. For the **combined final physical binary**, ensure a candidate includes both new source fixes (rebase one PR onto the other's accepted main before its final CI, or one narrow combined-main CI strategy), and repin hash verification and current handoff. Update TODO/STATUS/crosswalk only to proven scope; do not claim full source audit or native acceptance from a few models.
