# Audit finding incorporation gate and PR #180 validation

Date: 2026-09-28
Agent: ChatGPT
Scope: durable finding→implementation routing plus schedule-reminder validation reconciliation.

## Validated source entering this tracking slice

PR #180 implemented the audited Schedule Reminders preference/runtime path.

- exact head: `0309c879998f43ff8c6e39e65f02c44669fa48b8`
- Windows CI #607 / run `36352510898`: PASS
- visual artifact id `10942113822`, digest `sha256:3428b6e380deab43abfaa031d140bb5ba47782f0a8d09393a4077773868bb16e`
- runtime artifact id `10942647770`, digest `sha256:fd036e89988fd34cf0170bace0ec3d81bff1b5b38e9020b29c716e49e0597724`
- guarded squash merge: `643528ca223b29fd8fbd215db5b1b525c912c6fc`
- resulting-main Windows CI #608 / run `36353206934`: PASS
- validated application source baseline: `643528ca223b29fd8fbd215db5b1b525c912c6fc`

## User direction

The user explicitly requires that Narro stop implementing from superseded pre-audit assumptions. Known detailed findings affecting already-built/current surfaces must be incorporated before unrelated forward work so implementation is not repeatedly built and corrected.

## Repository response

Created `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` as the single routing layer joining parity/code audit, video findings, Help Center/image findings, UI/UX forensic findings, reliability/history anti-regressions and active Preferences runtime findings.

`TODO.md` now contains an active cross-cutting audit-incorporation gate without changing the 10-milestone denominator. `AGENTS.md` requires future zero-context agents to consult the crosswalk and blocks unrelated forward work while a current-surface `FIX_NOW` finding remains.

## Immediate correction discovered

Current `TaskScheduleDialog` still encodes an older recurrence-edit assumption:
- an existing rule always shows `Replace Existing Tasks` in warning styling;
- removal is a separate `Remove recurrence` button.

Current VE-017 + Help Center evidence instead shows:
- recurrence edit can select `No Repeat`;
- No Repeat conditionally exposes `Delete existing tasks(n)` in a warm/red destructive row;
- unchecked removal detaches child tasks into independent tasks;
- checked deletion removes existing generated schedule tasks and leaves the parent as a single non-recurring task.

This is now **CORR-01 / FIX_NOW** and blocks unrelated M8 forward work.

Reliability constraint: Narro must not silently destroy historical/session-bearing/customized user work merely to imitate source UI. The eligible-child deletion rule must be transactional, conservative and regression-tested.

## Progress

- roadmap: **6/10 milestones complete**
- M8: **6/8 top-level items validated**
- CORR-01 slice: **0/4 checkpoints**
- M7 physical/manual closure remains open
