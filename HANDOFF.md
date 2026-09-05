# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 3 section in `TODO.md`, `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 3 — Timer/session engine.**

Milestone 1 Gate A is PASS and Milestone 2 Gate B is PASS. Milestone 3 has one remaining unresolved correctness boundary: Windows sleep/resume accounting. Do not start Milestone 4 or polished product UI until M3 is closed unless the user explicitly changes milestone order.

The architecture remains Tauri 2 + React/TypeScript + Rust + SQLite on Windows 10/11 x64, with `main` plus the reused `focusSurface` webview. Do not regress the async `main` recreation path; the old synchronous WebView2 recreation path deadlocked on real Windows.

## USER-FACING PROGRESS RULE

`AGENT_WORKFLOW.md` requires every implementation update to show both:

- `Γενική υλοποίηση: X/Y ...` — validated milestones out of Narro's stable 10-milestone roadmap;
- `Μικρή τρέχουσα υλοποίηση: A/B ...` — meaningful checkpoints inside the active implementation slice.

Current general roadmap progress is **2/10 validated milestones** because M1 and M2 are complete while M3 remains open on the sleep/resume decision. Failed CI does not increment progress and denominators must not change silently.

Rule commits on `main`:

- `8a8c062339f9c071af12b6be774af37ba238e594` — dual progress levels;
- `091842ee2f5f90a62f8bc4b88c20a5839b1d4f58` — general progress explicitly tied to the stable 10-milestone roadmap.

## VALIDATED MILESTONE 3 BASELINE

Current validated **source** implementation baseline is PR #34 squash merge:

`22d59dd5b52e42a5bab4e1f058df2338a072fb16`

Exact PR head:

`e779514558005c5dd7cea23bf7483388d9b4f1c0`

Validation:

- Windows PR CI #184 / run `33959065974` / job `101287590338`: **SUCCESS**;
- PR preflight, Tauri release build and artifact upload: **PASS**;
- PR artifact ID `9967498244`, digest `sha256:efa254abf3468b1d7ee7df1d641a33fcfb1c801c12932710648dda258fcf21aa`;
- Windows main CI #185 / run `33959681959` / job `101289258096`: **SUCCESS**;
- main preflight, Tauri release build and artifact upload: **PASS**;
- main artifact ID `9967652919`, digest `sha256:17eae2b6603293c0f5309b24f1ff8ab316d5bf90722dba70703eafcb903282e2`.

Markdown-only tracking/work-log commits may be newer than the source SHA and do not change the validated source baseline.

## MERGED M3 CAPABILITIES

M3 now has automated-validated coverage for:

- authoritative pure-Rust CountUp / EST / Pomodoro / pause / break / Time's Up / overtime state machine;
- Done / Skip / Switch lifecycle;
- typed work/break session persistence and one-open-session database invariant;
- persistence-first `TimerRuntime` with atomic Work<->Break and task-switch replacement;
- durable runtime checkpoint/recovery;
- interrupted running/overtime recovery to safe non-running states without counting process downtime as work;
- break recovery without charging process downtime;
- atomic product-level Done so tracked work cannot become `00:00` when completing a task;
- paused live Time Taken rebasing without rewriting raw session history or snapping back after resume/recovery;
- exact 15m + pause + 15m work accounting across recovery;
- typed revisioned timer/session events shared by `main` and `focusSurface`;
- Rust/Tauri-owned monotonic timer time; renderers cannot supply authoritative elapsed time;
- late Pomodoro catch-up that persists every crossed Work/Break boundary in order;
- durable once-only Pomodoro notification decisions/claims, with Windows toast submission best-effort after persistence;
- authoritative `awaitingResume` projection and minimal shared Resume workflow after Pomodoro break completion;
- long-duration / large-elapsed overflow safety covering near-`u64::MAX` Work/Break recovery, SQLite signed-duration boundaries and very large Time Taken aggregates.

Latest slice evidence:

- `work-log/2026-09-05-1315-chatgpt-m3-large-elapsed-safety.md`.

Earlier key M3 merges:

- PR #23 `efb50743e1625a597f2e8466d552f67f03539d5d` — timer state machine;
- PR #24 `2da2496d1e7eab4ba57a0c80d82c680614fe2397` — Done/Skip/Switch;
- PR #25 `faf46923acbebd59cd0b1d241eaad80c2618f606` — session persistence;
- PR #27 `c769c284002628b73f76b4c1e35b1595dc685bf0` — persistence-first runtime;
- PR #29 `3d4ab087682d3cf91a93f18aa5e1bd2cb23d2719` — durable recovery;
- PR #30 `138fb5cc753dc520be731159be453fc6046aecb4` — atomic product Done;
- PR #31 `c59e434e9f6b13b1837159f00e51fc96dd7f10a7` — paused Time Taken/recovery regressions;
- PR #32 `349260f28475f53472b444af6180704a4b981c20` — typed timer/session events and Tauri-owned timer service;
- PR #33 `3ffbaca0c5df78833584de26270686f6cdadca16` — exact Pomodoro boundary effects/notifications/resume projection;
- PR #34 `22d59dd5b52e42a5bab4e1f058df2338a072fb16` — large-elapsed/overflow regressions.

PR #26 (`m3-session-coordinator`) was closed unmerged and is historical only; its recovery intent was superseded by PR #29.

## IMPORTANT INVARIANTS

Preserve all of these:

- renderer reads do not advance authoritative time or supply `now_ms` / wall time;
- Tauri/Rust owns automatic boundary advancement;
- publish/broadcast only after successful persisted timer/session transition;
- broadcast failure after commit is log-only;
- Pomodoro OS notification failure after durable claim is log-only; do not report timer mutation failure because a toast failed;
- event revision increments only on semantic persisted transition; checkpoint-only refresh keeps the same revision;
- initial timer snapshot has no change event;
- invalid lifecycle commands return structured errors without panic or consuming revision;
- product/UI Done uses `TimerRuntime::complete_task`;
- live Time Taken uses `TimerRuntime::set_time_taken_while_paused`;
- generic task Time Taken mutation rejects an active focus session;
- raw timer/session elapsed remains monotonic; manual corrections use durable adjustment rather than rewriting history;
- process restart downtime is not counted as work;
- no M4 scheduling or polished M5/M6 UI work while M3 is still open.

## LARGE-ELAPSED SLICE RESULT

PR #34 added six deterministic integration regressions and required no production runtime semantic change. Existing checked arithmetic and persistence-first rollback behavior passed:

1. continuous CountUp near the full `u64` clock span;
2. recovered Work total near `u64::MAX` rejecting a new segment with `DurationOverflow` atomically;
3. recovered Break total near `u64::MAX` rejecting projected overflow atomically;
4. session duration beyond SQLite signed `INTEGER` range rejecting before mutation;
5. very large valid Time Taken aggregate remaining exact;
6. overflowing Time Taken aggregate rejecting metadata rebase without mutation.

`TODO.md` long-duration item is now `[x]`.

## NEXT AGENT ACTION — BLOCKED ON PRODUCT DECISION

Do not invent Windows sleep accounting semantics.

Before implementing the final M3 slice, obtain an explicit user decision for this question:

**If a work timer is running when Windows enters system sleep, should the unattended sleep duration count toward Time Taken?**

Two direct policies are available:

- **Exclude sleep time from work** — treat sleep like unavailable/downtime and resume from the pre-sleep tracked amount without charging the asleep interval.
- **Count sleep time as work** — if the timer was running when Windows slept, include the sleep interval in active work when the system resumes.

After the user chooses, implement the narrowest Windows sleep/resume policy and no-data-loss tests, validate exact-head PR CI and main CI, update TODO/STATUS/HANDOFF/work-log, and then close Milestone 3 if all acceptance criteria are satisfied.

## USER ACTION REQUIRED

**Required:** choose whether unattended Windows sleep time counts as active work for a timer that was running at sleep entry.

Until that decision exists, no further M3 source implementation should guess the behavior and Milestone 4 must not start automatically.

## IMPORTANT FILES

- `AGENT_WORKFLOW.md`
- `TODO.md`
- `STATUS.md`
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `docs/SOURCE_AUDIT.md`
- `docs/PRODUCT_SPEC.md`
- `src-tauri/src/timer/`
- `src-tauri/src/timer_service.rs`
- `src-tauri/src/domain/timer_events.rs`
- `src-tauri/src/persistence/sessions.rs`
- `src-tauri/src/persistence/timer_runtime.rs`
- `src-tauri/src/persistence/timer_controller.rs`
- `src-tauri/src/persistence/pomodoro_effects.rs`
- `src-tauri/src/persistence/live_completion.rs`
- `src-tauri/src/persistence/live_time_taken.rs`
- `src-tauri/tests/timer_large_elapsed_safety.rs`
- `src-tauri/tests/timer_recovery_regressions.rs`
- `work-log/2026-09-05-1315-chatgpt-m3-large-elapsed-safety.md`

A handoff is complete only when another capable agent can continue from repository state without requiring prior chat context.