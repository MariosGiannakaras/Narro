# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Read `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever timer/session reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **6 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; new item-7 slice 0/5 checkpoints; M6 6/16 items validated.**

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `17d7f9a2a99bd33a43f02afb7d81201c1dc23195`

Source tree: `3476df620697441df7d98b81e3d78d80aa08cbf4`

This is the resulting-main source/test SHA of PR #106 after authoritative Windows main CI #409 passed. It contains the validated PR #105 production Focus live-action implementation plus the PR #106 test-only state-contract assertions. Markdown-only tracking descendants do not replace this source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 6/16 — Implement break, notes, pause/resume, skip, finish.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-actions.md`.

Validated product behavior:

- fixed live action order is Break, Notes, Pause/Resume, Skip, Done;
- Break uses the authoritative manual work->break transition and the established 10-minute default until M8 exposes the persisted preference;
- active-break Resume uses authoritative `timer_skip_break`;
- Pause/Resume reuses M3 idempotent timer transitions including overtime states;
- Skip refreshes authoritative board + timer state, rejects stale live-task identity, excludes future-timed non-overdue Today work and switches through one persistence-first `timer_switch_task`, falling back to `timer_skip_task` only when no next eligible task exists;
- Done commits through the M3 coupled completion boundary before any best-effort start-next attempt, preserving tracked Time Taken;
- secondary start-next failure cannot convert committed completion into failure or invite unsafe retry;
- Notes reuse the validated M5 `TaskNotes` editor and preserve explicit pointer/keyboard-only URL activation;
- React remains presentation/orchestration only; no renderer elapsed/session authority, Rust timer rewrite, schema/migration, dependency or scheduling-policy change was introduced;
- static and Windows light/dark visual regression coverage lock state gating and five-action geometry.

### PR #105 production implementation

- exact head `26c431de9f3c318bce15325c51ef767988d7ece5`;
- Windows PR CI #407 / run `34749228254` / job `103702560465`: **SUCCESS**;
- visual artifact `10315332440`, digest `sha256:de3579f9c3192c4c3a2e7e256ae6ef50d6bb061519bfb74e832c50863d4d7cda`;
- diagnostic artifact `10315167944`, digest `sha256:1f8bb3ae4b443dccc6e58279a32d4e60170cbe1990898fe4344c50adf6d54d30`;
- GitHub merge transaction temporarily advanced main to `1fdc619d120a81dbd30e88e5dfee28ac13fde8b0` / tree `df10c7fab1b13e9742787a9787562e7692b70fe2` before PR metadata closed;
- final GitHub-reported PR #105 merge commit `e31d7b695014e32c14ab452393a521323fef4f03` had zero file changes and retained the same production tree; no push CI was emitted for that no-op completion commit, so item 6 remained open.

### PR #106 test-only state-contract follow-up

- diff: exactly six static assertions in `scripts/test-ui-focus-panel.mjs`; no production-source changes;
- exact head `d6d969b7eaaf4e2fe5ee443236437e070c3b0a1f`;
- Windows PR CI #408 / run `34750003487` / job `103704719842`: **SUCCESS**;
- visual artifact `10315775336`, digest `sha256:d1aab4cfbadce4ae55393ba22324c7139612842b1d68f1b5c8f0c5ad2704d258`;
- diagnostic artifact `10315568456`, digest `sha256:2157ad8e7dba35c672657984fc521179f45a5ba7aef90d65288f8da741dff8ca`;
- expected-head guarded squash merge source/test SHA `17d7f9a2a99bd33a43f02afb7d81201c1dc23195`;
- source tree `3476df620697441df7d98b81e3d78d80aa08cbf4`.

### Resulting-main validation

Windows main CI #409 / run `34750884431` / job `103707110038`: **SUCCESS** on exact main SHA `17d7f9a2a99bd33a43f02afb7d81201c1dc23195`.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10315666938`, digest `sha256:e3d6e5733612f9a2f236773614271e3ed02289ca7c6836555c139c0a67665378`;
- diagnostic artifact `10316660232`, digest `sha256:eba28cfd98279589d912e67f7c98a7963065d5b68293739add61180acb21604b`.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 7/16 — Implement subtasks/progress in focus mode.**

No implementation branch has been created yet for item 7.

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. mandatory reconstruction + exact Focus subtask/progress contract from current docs/source/fixtures and validated M2/M5 subtask APIs — pending;
2. narrow implementation + deterministic/component/static coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of the existing authoritative Rust/domain state; React cannot become parallel timer/session/task authority.
- `main` and `focusSurface` remain the normal two-webview architecture.
- stable task and subtask identities/order/completion state remain authoritative and persistence-first; Focus must not create a renderer-only subtask model.
- item 7 must reuse the validated M2/M5 subtask mutation/read boundaries or proven equivalent existing APIs; do not invent duplicate persistence paths.
- live Focus progress must derive from authoritative task/subtask state and update after successful local mutations; it must not be inferred from timer cadence.
- Break, Notes, Pause/Resume, Skip and Done behavior validated in item 6 must not regress.
- tracked Time Taken, work/break separation, recovery, sleep policy, `Time's Up`/overtime and Pomodoro semantics remain M3 authority.
- successful authoritative completion cannot be reported as failed solely because a secondary continuation/UI refresh fails after commit.
- Notes reuse the validated local Notes behavior; user-visible URLs remain explicit pointer/keyboard actions only.
- future-timed Today tasks remain ineligible until due; Focus actions cannot make them live early.
- existing live timer geometry/sampling and Remaining/Scheduled/Done identity partitioning must not regress.
- item 7 must not absorb item 8 paused EST/Time Taken editing, monitor placement/display hotplug, title scrolling/two-line work, action-slot/tooltips polish, later visual-state/empty-state work, Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports or Milestone 10 release work.
- diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / EXACT NEXT ACTION

Reconstruct the item-7 contract before editing. Inspect current `TaskSubtasks`/subtask UI, list-board task/subtask projection, subtask mutation APIs and Focus production/fixture structure. Determine the narrowest way to expose live-task subtask rows and progress inside Focus while preserving stable identities, ordering and persistence-first mutation success. Add deterministic/static/visual coverage only for item 7. Then create one coherent feature branch/PR and require authoritative Windows CI on the exact head.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 7.
- Local Node/Rust/Tauri validation remains unavailable in this connector-only environment; authoritative Windows GitHub Actions is required before merge.
