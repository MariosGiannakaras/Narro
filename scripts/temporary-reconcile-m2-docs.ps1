$ErrorActionPreference = 'Stop'

$todo = Get-Content TODO.md -Raw
$todoReplacements = @{
  '- [ ] Implement EST, Time Taken, completion timestamp, scheduled date/time, recurrence metadata, and archive state.' = '- [x] Implement EST, Time Taken, completion timestamp, scheduled date/time, recurrence metadata, and archive state.'
  '- [ ] Implement subtasks with ordering/completion state.' = '- [x] Implement subtasks with ordering/completion state.'
  '- [ ] Implement rich-note storage using a constrained local document format.' = '- [x] Implement rich-note storage using a constrained local document format.'
  '- [ ] Implement preferences and schema defaults.' = '- [x] Implement preferences and schema defaults.'
  '- [ ] Implement permanent-task-delete semantics so deleted tasks no longer appear in user-facing reports, matching current official behavior.' = '- [x] Implement permanent-task-delete semantics so deleted tasks no longer appear in user-facing reports, matching current official behavior.'
  '- [ ] Ensure successful create/edit/move is committed locally before success is reflected in UI state.' = '- [x] Ensure successful create/edit/move is committed locally before success is reflected in UI state.'
  '- [ ] Add deterministic fixture builders for tests.' = '- [x] Add deterministic fixture builders for tests.'
  '- [ ] Add repeated drag/drop and scheduled-lane-move tests based on publicly reported source-product duplication/reorder failures.' = '- [x] Add repeated drag/drop and scheduled-lane-move tests based on publicly reported source-product duplication/reorder failures.'
}
foreach ($entry in $todoReplacements.GetEnumerator()) {
  if (-not $todo.Contains($entry.Key)) { throw "TODO replacement target missing: $($entry.Key)" }
  $todo = $todo.Replace($entry.Key, $entry.Value)
}
Set-Content TODO.md $todo -Encoding utf8

$status = Get-Content STATUS.md -Raw
$status = $status.Replace('**Milestone 2 — Domain model, identity invariants, and local persistence.**', '**Milestone 3 — Timer/session engine.**')
$m2Status = @'
## Milestone 2 completion

**Result: PASS / proceed to Milestone 3.**

Validated late-M2 slices:

- PR #15 / merge `106867b40d1c13572e11468b9217a9738a453036`: recurrence metadata persistence; Windows CI #101 SUCCESS.
- PR #16 / merge `78039b5c2bb71386edf8b0ac97cc2534e524190a`: subtask persistence; Windows CI #105 SUCCESS.
- PR #17 / merge `1ef6da2ab1996c71c8706e2eac7ebf98bf197253`: constrained rich-note persistence; Windows CI #108 SUCCESS.
- PR #19 / merge `e662eddfffb3f747d36b9b5121461bf48cf18b8e`: preferences/default persistence; Windows CI #109 SUCCESS; artifact `9901755321`, digest `sha256:854f42ae4efe0662269925c4934a33c14bfe179079f3fcd5981d3d69db9a0d67`.
- PR #20 / merge `253c306aa0cdd73ee47dc5db1f508c21a6c5d632`: permanent-delete/report-exclusion regression; Windows CI #111 SUCCESS; artifact `9903032185`, digest `sha256:7dd5d6a3b409f90fa1887f7016f10764d91b9c881ecba2a26d64aa57b6c75ecd`.
- PR #21 / merge `16bb8b3e2fc2ac44c23c31268ad92bf1cdf8b7a3`: deterministic fixtures, scheduled-lane stress and cross-connection mutation commit visibility; Windows CI #113 SUCCESS; artifact `9903528911`, digest `sha256:94fc4731c349ab4d8bf4a8712e7320cbe3428c1f4a0f1f0d17a3e7de18bb1d3c`.

Milestone 2 acceptance is satisfied: repeatable migrations; restart-safe CRUD/reorder; stable identities under repeated moves; exactly one new identity on duplication; archive/restore history retention; explicit permanent deletion with task-owned reportable history removal; deterministic fixtures; and persistence-first create/edit/move success boundaries.

## Active Milestone 3 work

The next source slice is the **authoritative timer/session state machine** in `src-tauri/src/timer/`.

Start pure and deterministic: typed idle/running/paused/break/time-up states, injected timestamps/fake-time tests, EST countdown and count-up semantics, idempotent pause/resume, and structured invalid-transition errors. Renderer ticks must never own authoritative elapsed time, and SQLite must not be written every second.

Session persistence/checkpointing, interrupted-session restore, Pomodoro automation and typed webview events belong to subsequent M3 slices after the transition model passes exact-head Windows CI.

Product UI remains intentionally unpolished while Milestones 3–4 establish correctness-critical runtime behavior.

## Durable scope
'@
$statusPattern = '(?s)## Active Milestone 2 work.*?## Durable scope'
if (-not [regex]::IsMatch($status, $statusPattern)) { throw 'STATUS active M2 block not found' }
$status = [regex]::Replace($status, $statusPattern, $m2Status)
Set-Content STATUS.md $status -Encoding utf8

$handoff = @'
# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 3 section in `TODO.md`, `STATUS.md`, and the newest relevant `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 3 — Timer/session engine.**

Milestone 1 Gate A is PASS and Milestone 2 durable local persistence is PASS. Continue with Tauri 2 + React/TypeScript + Rust + SQLite and the two-window composition (`main` + reused `focusSurface`). Do not regress the async `main` recreation path; the old synchronous WebView2 recreation path deadlocked on real Windows.

## VALIDATED MILESTONE 2 BASELINE

Merged and Windows-CI validated on `main`:

- PR #8: typed durable IDs, schema/migrations and FK enforcement.
- PR #9: list lifecycle CRUD/order/archive/restore/delete.
- PR #10: task CRUD/planning/completion/archive lifecycle.
- PR #11: stable-ID bucket ordering, independent duplication and reorder/move corruption regressions.
- PR #13: Time Taken plus typed schedule metadata persistence.
- PR #15 / merge `106867b40d1c13572e11468b9217a9738a453036`: recurrence metadata CRUD/linkage; CI #101 SUCCESS.
- PR #16 / merge `78039b5c2bb71386edf8b0ac97cc2534e524190a`: subtasks; CI #105 SUCCESS.
- PR #17 / merge `1ef6da2ab1996c71c8706e2eac7ebf98bf197253`: rich notes; CI #108 SUCCESS.
- PR #19 / merge `e662eddfffb3f747d36b9b5121461bf48cf18b8e`: preferences/defaults; CI #109 SUCCESS.
- PR #20 / merge `253c306aa0cdd73ee47dc5db1f508c21a6c5d632`: permanent-delete/report exclusion; CI #111 SUCCESS.
- PR #21 / merge `16bb8b3e2fc2ac44c23c31268ad92bf1cdf8b7a3`: deterministic fixtures, scheduled move/reorder stress and cross-connection persistence-first mutation visibility; CI #113 SUCCESS.

Milestone 2 acceptance is PASS.

## NEXT AGENT ACTION — MILESTONE 3

Implement a narrow **authoritative timer/session state-machine** slice first.

1. Keep authoritative runtime state in Rust; renderer cadence must never own elapsed time.
2. Add typed idle, work-running, work-paused, break-running and time-up/overtime decision states.
3. Keep display mode distinct from tracked work: EST countdown when EST exists/Pomodoro off; count-up when no EST/Pomodoro off. Pomodoro automation comes later.
4. Use injected absolute timestamps/fake-time tests. Compute elapsed work from timestamps + accumulated checkpoints, not per-second increments.
5. Make pause/resume idempotent and reject invalid transitions with structured errors.
6. EST zero crossing becomes explicit `Time's Up`; Extend preserves the same logical work session and exposes overtime.
7. Break time must never count as work time.
8. Do not persist every second. Session persistence/checkpointing is the next slice after the pure transition model.
9. Do not pull M4 scheduling/eligibility or polished M5+ UI into this slice.
10. Validate exact source head with Windows CI because local Rust execution is unavailable in the ChatGPT environment.

## USER ACTION REQUIRED

**None.** Initial Milestone 3 work is automated Rust/domain work.

## IMPORTANT FILES

- `src-tauri/src/timer/mod.rs`
- `src-tauri/src/domain/ids.rs`
- `src-tauri/src/domain/tasks.rs`
- `src-tauri/src/persistence/tasks.rs`
- `src-tauri/src/persistence/task_metadata.rs`
- `src-tauri/migrations/0002_domain_foundation.sql`
- `docs/BEHAVIOR_MATRIX.md`
- `docs/PRODUCT_SPEC.md`
- `TODO.md`
- `STATUS.md`
- newest `work-log/*.md`

## DURABLE M1 REFERENCES

- `work-log/2026-09-03-chatgpt-m1-physical-capability-results.md`
- `work-log/2026-09-03-chatgpt-autostart-restart-validation.md`
- `work-log/2026-09-03-chatgpt-floating-performance-results.md`
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`
'@
Set-Content HANDOFF.md $handoff -Encoding utf8

$log = @'
# Milestone 2 completion and transition to Milestone 3

Date: 2026-09-04

Milestone 2 durable domain/persistence work is complete and validated.

## Late-M2 evidence

- PR #15 / merge `106867b40d1c13572e11468b9217a9738a453036`: recurrence metadata persistence; exact head `87ddb30ba142706c7cc377accd4a3aef5fb1fb43`; Windows CI #101 / run `33768324650`: SUCCESS; artifact `9898946694`, digest `sha256:55b733023d551324295412baeadaf9f0e606781c563e17a12cf4034a18f800af`.
- PR #16 / merge `78039b5c2bb71386edf8b0ac97cc2534e524190a`: subtask persistence; exact head `ba78568b97f3423c1eb79e1ced029faa610618af`; Windows CI #105 / run `33771065413`: SUCCESS; artifact `9900064489`, digest `sha256:f591efd77d77b26c0a34d37799e7b3403e348140e42570934f4b2242240ed1d7`.
- PR #17 / merge `1ef6da2ab1996c71c8706e2eac7ebf98bf197253`: rich-note persistence; exact head `0ea3bcb4443591c3c6e6b7ea38f6c878e0162668`; Windows CI #108: SUCCESS; artifact `9901108113`, digest `sha256:1df893e1fa8f0cf698c6b63ff568484c33c069446f4487ec9a1be79911001552`.
- PR #19 / merge `e662eddfffb3f747d36b9b5121461bf48cf18b8e`: preferences/defaults; exact head `808c8258d8e6e29d7255951d1e270e735f5e7351`; Windows CI #109 / run `33775318489`: SUCCESS; artifact `9901755321`, digest `sha256:854f42ae4efe0662269925c4934a33c14bfe179079f3fcd5981d3d69db9a0d67`.
- PR #20 / merge `253c306aa0cdd73ee47dc5db1f508c21a6c5d632`: permanent-delete/report exclusion; exact head `84ccaacd58d8c838b8d20214c915d94239633707`; Windows CI #111 / run `33778508372`: SUCCESS; artifact `9903032185`, digest `sha256:7dd5d6a3b409f90fa1887f7016f10764d91b9c881ecba2a26d64aa57b6c75ecd`.
- PR #21 / merge `16bb8b3e2fc2ac44c23c31268ad92bf1cdf8b7a3`: deterministic fixtures, 32-cycle scheduled Backlog↔Today move/reorder stress and cross-connection persistence-first mutation visibility; exact head `2f37a33b3eec9b7522660bc2c997b66d52d5062d`; Windows CI #113 / run `33779908004`: SUCCESS; artifact `9903528911`, digest `sha256:94fc4731c349ab4d8bf4a8712e7320cbe3428c1f4a0f1f0d17a3e7de18bb1d3c`.

## Gate result

Milestone 2 acceptance is PASS. Proceed to Milestone 3 timer/session engine work. No physical user action is required for the initial M3 Rust slices.
'@
Set-Content work-log/2026-09-04-chatgpt-m2-completion.md $log -Encoding utf8
