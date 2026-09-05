# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

Milestone 1 Gate A is PASS, Milestone 2 Gate B is PASS, and Milestone 3 Gate C is PASS. M3 is closed; ordered source work may now proceed into M4. Do not skip to polished Milestone 5/6 product UI until M4 is closed unless the user explicitly changes milestone order.

The architecture remains Tauri 2 + React/TypeScript + Rust + SQLite on Windows 10/11 x64, with `main` plus the reused `focusSurface` webview. Do not regress the async `main` recreation path; the old synchronous WebView2 recreation path deadlocked on real Windows.

## USER-FACING PROGRESS RULE

`AGENT_WORKFLOW.md` requires every implementation update to show both:

- `Γενική υλοποίηση: X/Y ...` — validated milestones out of Narro's stable 10-milestone roadmap;
- `Μικρή τρέχουσα υλοποίηση: A/B ...` — meaningful checkpoints inside the active implementation slice.

Current general roadmap progress is **3/10 validated milestones** because M1, M2 and M3 are complete. Failed CI does not increment progress and denominators must not change silently.

Rule commits on `main`:

- `8a8c062339f9c071af12b6be774af37ba238e594` — dual progress levels;
- `091842ee2f5f90a62f8bc4b88c20a5839b1d4f58` — general progress explicitly tied to the stable 10-milestone roadmap.

## VALIDATED MILESTONE 3 BASELINE

Current validated **source** implementation baseline is PR #35 squash merge:

`5eaf7f0eba1770112d41744377ea134ad5d41e33`

Exact validated PR head:

`a4582f5ea76737c8a5e01cb4e1c2cfb87a826159`

Validation:

- Windows PR CI #192 / run `33964109578` / job `101301016918`: **SUCCESS**;
- PR preflight, Tauri release build and artifact upload: **PASS**;
- PR artifact ID `9969024118`, digest `sha256:834b247060eedfd426cf0566f97614fd357a326a25a4c4353547be0cb77fc2f6`;
- Windows main CI #196 / run `33964738776` / job `101302758803`: **SUCCESS**;
- main preflight, Tauri release build and artifact upload: **PASS**;
- main artifact ID `9969220078`, digest `sha256:c2d1b2ce9cbaf12abdb45020a537b89081005c0f1f7305007cb97f812ee974d1`.

Markdown-only tracking/work-log commits are newer than the source SHA and do not change the validated source baseline.

## MILESTONE 3 RESULT

**Gate C: PASS / proceed to Milestone 4.**

M3 has automated-validated coverage for:

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
- Rust/Tauri-owned timer time; renderers cannot supply authoritative elapsed time;
- late Pomodoro catch-up that persists every crossed Work/Break boundary in order;
- durable once-only Pomodoro notification decisions/claims, with Windows toast submission best-effort after persistence;
- authoritative `awaitingResume` projection and minimal shared Resume workflow after Pomodoro break completion;
- long-duration / large-elapsed overflow safety covering near-`u64::MAX` Work/Break recovery, SQLite signed-duration boundaries and very large Time Taken aggregates;
- Windows suspend/resume no-data-loss accounting with configurable policy and durable session snapshot.

Windows sleep policy is now a durable product decision:

- global default: `exclude` unattended system sleep from Time Taken;
- global policy may be changed to `count`;
- per-task override: `inherit`, `exclude`, or `count`;
- effective policy is snapshotted into the current focus session when it opens;
- later preference changes do not mutate an already-running session's accounting semantics;
- Work↔Break preserves the same policy; Switch Task resolves the target task policy;
- native `WM_POWERBROADCAST` observes suspend/resume;
- Windows `GetTickCount64` measures the suspend interval instead of relying on ambiguous Rust `Instant` suspend behavior;
- suspend and resume force durable checkpoints without consuming semantic event revisions;
- `count` catch-up goes through the existing authoritative boundary stepper, including Pomodoro effects;
- process-restart downtime remains excluded from work.

Latest completion evidence:

- `work-log/2026-09-05-1514-chatgpt-m3-windows-sleep-policy.md`.

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
- PR #34 `22d59dd5b52e42a5bab4e1f058df2338a072fb16` — large-elapsed/overflow regressions;
- PR #35 `5eaf7f0eba1770112d41744377ea134ad5d41e33` — configurable Windows sleep/resume accounting.

PR #26 (`m3-session-coordinator`) was closed unmerged and is historical only; its recovery intent was superseded by PR #29.

## IMPORTANT TIMER INVARIANTS TO PRESERVE

M4 and later work must not regress these:

- renderer reads do not advance authoritative time or supply `now_ms` / wall time;
- Tauri/Rust owns automatic timer boundary advancement;
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
- active sleep accounting semantics come from the persisted focus-session policy, not from a live preference read or renderer clock;
- one-open-session persistence invariant remains enforced.

## TRACKING RECONCILIATION

M3 completion tracking on `main`:

- `TODO.md` commit `67f6ccd2d8e8e03e2e3303a2e1bfc7e70302a2e7` — sleep/resume item checked and Gate C PASS recorded;
- `STATUS.md` commit `7214fb0e8cfa7a79822a5472ee38e7d9a62e278d` — phase advanced to M4 and PR/main validation evidence recorded;
- immutable completion log commit `1cbe49f1dc90e5f4452ba89be5ed30578328ea6f` — `work-log/2026-09-05-1514-chatgpt-m3-windows-sleep-policy.md`.

## NEXT AGENT ACTION — MILESTONE 4

Start with the first ordered M4 correctness slice, not product UI.

Before writing source, inspect the existing scheduling/recurrence domain and persistence foundation plus `docs/PRODUCT_SPEC.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the active M4 TODO. Reuse the existing typed schedule metadata from M2 rather than creating parallel identities or renderer-owned date logic.

A suitable first M4 slice is the scheduling/eligibility core:

1. define deterministic Windows-local Monday-based week classification around the existing date-only and local-datetime schedule types;
2. implement official scheduling shortcut resolution: Today, Later today (+2h), Tomorrow, Next week (+7d), custom date;
3. classify scheduled tasks into Backlog / This Week / Today without shifting date-only tasks across timezone boundaries;
4. make future-timed Today tasks ineligible before their due local time;
5. add controlled-time regressions for Monday/week boundaries, weekend behavior, timezone/DST edges and date-only versus timed schedules;
6. validate exact-head Windows CI before marking any corresponding M4 TODO items complete.

Do not begin recurrence materialization, reminder dispatch, or UI integration until the scheduling/eligibility core is coherent unless source inspection proves a narrower dependency requires it.

## IMPORTANT M4 FILES / AREAS TO INSPECT

- `AGENT_WORKFLOW.md`
- `TODO.md`
- `STATUS.md`
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `docs/SOURCE_AUDIT.md`
- `docs/PRODUCT_SPEC.md`
- `src-tauri/src/domain/`
- `src-tauri/src/persistence/`
- existing schedule/recurrence/reminder types and tests discovered under `src-tauri/`
- task planning/lane classification persistence introduced in M2
- `work-log/2026-09-05-1514-chatgpt-m3-windows-sleep-policy.md`

A handoff is complete only when another capable agent can continue from repository state without requiring prior chat context.