# PR437 pre-physical audit — source review complete, one confirmed defect, CI pending

User requested pre-physical inspection **without corrections**, then directed publication without waiting for CI. Source **44a22f2aaa2b0d901efcdc1317f1f0d28e163ac6**, existing [PR437](https://github.com/MariosGiannakaras/Narro/pull/437) DRAFT/UNMERGED. Product source/tests/config/lockfiles and branch head remain unchanged. No Narro app, personal profile, desktop test, recording, installation or merge. This is the bounded Time Taken/native-diagnostic dependency review; it is not a whole-application audit or milestone acceptance.

**Verdict:** the review is complete and all10 source-level domains below are dispositioned:9 scoped PASS,1 FAIL. **Integrated Time Taken physical readiness = NOT READY because PP44-F01 is confirmed and uncorrected.** Automated Windows build/packaging is separately pending. Do not turn a future green CI into a pass for the untested failing combination.

## Exact automated evidence and reuse

One `workflow_dispatch` [CI41031984280](https://github.com/MariosGiannakaras/Narro/actions/runs/41031984280) targets the exact44a source despite its historical skip-ci message, with no trigger/source commit. Snapshot published in `ci-snapshot.json`: validation-gate SUCCESS, fast-gate SUCCESS, Windows check/Clippy/Rust tests/performance-harness SUCCESS; **windows-candidate still IN PROGRESS at Capture Visual Regression Fixtures** at last observation. Overall2/3 gates complete, not3/3. Both newly added native publication regression cases are covered by the successful Rust test step. Final suite count/log/artifacts were not fetched while the job remained active; do not invent a completed run or final artifact. The user explicitly said to let the other chat consume the remaining CI result, so no monitoring/automatic correction was started.

Local current-head Rust format check and actual production live metrics/reducer, actual Focus mutation handlers and Reports separation contracts PASS. The earlier complete local frontend preflight/TypeScript/Vite build is validly reused: `preflight-exact-source-reuse.json` confirms14/14 changed production/test paths match their frozen canonical hashes and that these14 are the entire bd86→44a diff; current working source bytes normalize to those exact Git blobs. Current exact-head fast-gate independently reran the complete frontend gate successfully. No in-place normalization or product modification. Full local native execution remains NOT RUN due missing MSVC link.exe; actual Windows CI supplies it. Earlier8bfd CI41027738611/artifact12965422969 is historical, not acceptance for44a.

## Source/dependency disposition matrix

These PASS values mean only the source/automated claim stated, never physical or Blitzit parity.

| ID | Source-level claim and owner | Evidence / result |
| --- | --- | --- |
| S01 | Exact head/inputs, no correction during audit | **PASS**44a remote/local identity and no tracked source WIP;14-path frozen preflight identity; exact dispatch head |
| S02 | Native/durable work basis, checkpoints and history are not double-counted | **PASS** runtime checkpoint basis updates only after successful persistence; cached aggregate + uncheckpointed native work; current controller/cache tests |
| S03 | Paused manual edit uses persisted CAS, preserving raw work and Timer authority | **PASS** task/list/expected-total guards, actual handler execution and native tests; editor remains durable while display uses task-bound native payload |
| S04 | External history refresh reaches paused consumers without a Timer transition | **PASS** shared atomic post-commit signal, retained one-shot receipt including explicit checkpoint, decorated change:null event, deferred emission after mutex release; two new real controller/service cases passed in CI |
| S05 | Late older history/PENDING responses cannot undo a newer ready projection | **PASS** actual production reducer tests with >2^53 string generations, task ownership and semantic revision priority; same-revision ready/pending ordering |
| S06 | Successful historical edits/deletes preserve readable effective Time Taken after manual lowering | **FAIL PP44-F01** actual SQL commits negative totals in2 cases;4 nonnegative controls pass; production reader rejects negative totals and Board propagates error |
| S07 | Pause/break/Pomodoro/Time's Up/overtime/switch/Done/restart ownership | **PASS scoped** actual controller/runtime tests, corrected existing explicit-resume policy, no downtime added; no native Quit/relaunch or hardware acceptance inferred |
| S08 | Failure/cancellation/ordering protects committed authority | **PASS scoped** display read failure does not undo committed Timer mutation; explicit pending/unavailable/overflow handling, failed decoration retains receipt, failed CAS unchanged state; transient cached read retries only on a changed basis, a documented bounded policy |
| S09 | No new per-tick SQL/writes/polling or repeated idle events | **PASS source/tests** key-owned cache, ordinary snapshot reads in memory, unavailable-table guard, same-key no read, one-shot publication; no measured CPU/RAM claim |
| S10 | Native move diagnostic is opt-in/read-only/bounded and preserves existing behavior | **PASS source/tests** original subclass/snap order/return/geometry preserved,2048 max/256 queue/try_send, writer-only file I/O, numeric fields, native tests; actual move cause remains OPEN |

Direct/transitive paths reviewed: Report command commit/error/CAS→independent app-managed invalidation Arc→controller cache ownership/checkpoint→native background advancement/publication/decorating→deferred lock-release emitter→shared Focus coordinator/event/sampling→revision reducer→metric task binding/durable editor. All production Timer payload constructors originate in the controller and pass through its live projection; no uncovered alternate native producer was found. FocusPanel keys FocusLiveActions by liveTask.id, so its metric local state is remounted on task switch; Floating hides the metric subtree. No new CSS/control/asset/approved picker/upload/icon, subscription authority, report formula or timer ledger change. Existing M7 native raster/geometry and physical holds remain separate. Source cadence remains the documented Narro-local reliability decision, not newly observed Blitzit parity.

Relevant prevention: NER-003 exact-head preflight/compiler ownership; NER-009 one Timer owner and paused edit; NER-014 history invalidation/async ordering; NER-001/002 prohibit visual/native conclusions from this inspection. Blitzit history index's tracked-time/manual-edit/report reliability family applies. Existing source records and earlier causal reviews reused; no raw-source video research repeated, no optional M11/M12 work.

## PP44-F01 — valid history mutation after lowering Taken breaks its reader

**Priority P2; SOURCE/SQL CONFIRMED, not physically observed.** Route M5 manual Time Taken / M9 Reports session editing, shared persistence invariant. This is pre-existing: `persistence/sessions.rs` has identical Git blob `63299c7cad3c03eee8c7fa76b302371d8f7056a1` on44a,8bfd and authoritative main before this report; the current PR does not introduce that mutation algorithm. The audit newly exposes its interaction with manual adjustments and live projection. No historical accepted ledger invariant or raw timer elapsed is declared lost.

Ordinary valid sequence: task has90 seconds in a closed manual work session. Set task Taken to5; production rule stores signed adjustment `5−90=−85`. Edit that closed session90→1 or delete it, using the correct updatedAt CAS. Existing session transaction successfully commits and leaves adjustment−85. Effective total is then **−84** or **−85**. `task_time_taken_seconds` refuses this value; `project_task` propagates the error through the whole requested Board snapshot. A live task's new cache would expose explicit unavailable instead of a valid metric. That last UI/cache symptom is source-derived, not a new screenshot/native observation. Exact UI fallback/retained state depends on its consumer; no blank-screen/crash claim is made.

Reproduction: `reproduce-history-underflow.py` runs all11 actual migrations in SQLite `:memory:`; extracts and executes production SUM/manual-adjustment UPDATE/manual-session INSERT/session UPDATE/DELETE SQL. It uses valid task/list/session UUIDs and timestamps, closed sessions, matching CAS, actual defaults and foreign-key constraints. It computes the documented signed adjustment, **does not execute a substitute Rust service**. Rust preconditions/negative-reader branch and Board propagation are separately source-inspected. Full Rust call-chain reproduction is still required in the later repair regression, and no physical PASS/FAIL is fabricated.

| Desired Taken after90s history | Operation | Committed effective total | Nonnegative/readable invariant |
| --- | --- | ---: | --- |
|5|Edit90→1|−84|FAIL|
|5|Delete90|−85|FAIL|
|90|Edit90→1|1|PASS control|
|90|Delete90|0|PASS control|
|100|Edit90→1|11|PASS control|
|100|Delete90|10|PASS control|

Repository sources at the audited commit:

- [manual adjustment rule, task_metadata.rs246](https://github.com/MariosGiannakaras/Narro/blob/44a22f2aaa2b0d901efcdc1317f1f0d28e163ac6/src-tauri/src/persistence/task_metadata.rs#L246), [negative effective reader rejection234–241](https://github.com/MariosGiannakaras/Narro/blob/44a22f2aaa2b0d901efcdc1317f1f0d28e163ac6/src-tauri/src/persistence/task_metadata.rs#L234).
- [edit closed session593](https://github.com/MariosGiannakaras/Narro/blob/44a22f2aaa2b0d901efcdc1317f1f0d28e163ac6/src-tauri/src/persistence/sessions.rs#L593), [delete643](https://github.com/MariosGiannakaras/Narro/blob/44a22f2aaa2b0d901efcdc1317f1f0d28e163ac6/src-tauri/src/persistence/sessions.rs#L643).
- [Board task projection490](https://github.com/MariosGiannakaras/Narro/blob/44a22f2aaa2b0d901efcdc1317f1f0d28e163ac6/src-tauri/src/list_board.rs#L490), [request propagation571](https://github.com/MariosGiannakaras/Narro/blob/44a22f2aaa2b0d901efcdc1317f1f0d28e163ac6/src-tauri/src/list_board.rs#L571).

**Repair recommendation only, not implemented:** define a coherent nonnegative-total policy for history mutations after a manual correction; enforce it transactionally at the persistence owner. Preserve legitimate explicit session edits, CAS/rollback, raw live accounting and unrelated task history. Do not hide an invalid committed aggregate solely in the renderer. Add real Rust regressions for lowering→closed edit/delete while inactive, active-paused, work/break boundaries, zero/raise controls, report/Board reads, failed CAS and restart; repair plus actual acceptance belongs to a later authorized correction phase. Do not treat the current positive-only history test as this combined regression.

## Remaining work and handoff

1. Other chat consumes final CI41031984280 on44a: on failure preserve first causal job/step/log; **do not automatically repair during this audit-only request**. On success record all3 gates, exact native test output and current artifact/source/member identity. No new run or source trigger is necessary just to observe this active run.
2. PP44-F01 is one confirmed repair item with2 reproduced manifestations, not two independent bugs. It keeps integrated Taken/Reports physical readiness NOT READY even if current CI is green. User asked no fixes, so none applied.
3. Movement's actual in-process trace/physical differing-position/SNAP/hardware and PR389/419 holds remain OPEN. Current source audit cannot decide native movement or Blitzit visual parity. No accepted stationary J05 replay was performed.
4. Mandatory roadmap/M10/optional-stage counters were not advanced. This scoped M5/M9 interaction finding does not erase unrelated historical evidence; reconciliation is claim-level. No merge, native session, profiler, recorder, personal DB/AppData access or local background work remains. Only the already-running finite GitHub CI is left to finish as the user requested.
