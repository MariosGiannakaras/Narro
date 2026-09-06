# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/PRODUCT_SPEC.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

- Milestone 1 / Gate A: COMPLETE / PASS.
- Milestone 2 / Gate B: COMPLETE / PASS.
- Milestone 3 / Gate C: COMPLETE / PASS.
- Milestone 4: ACTIVE / PARTIALLY IMPLEMENTED.
- Milestones 5–10: NOT STARTED.

## ACTIVE WORK RECORD

- Latest completed source/test slice: **combined M4 scheduling/recurrence regression matrix — COMPLETE / MAIN-VALIDATED / RECONCILED**.
- Active source slice: **M4 physical reminder acceptance harness — ACTIVE**.
- Active implementation branch: **`ai/m4-reminder-acceptance-harness`**.
- Active implementation PR: **None yet**.
- Branch base: tracking-only `main` **`6a824e761b54f1c069a7923aac2606abd8ecd2b9`**.
- Latest fully main-validated source/test baseline: **`9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`**.
- Pending source CI/main validation: **this acceptance-harness slice**.
- Remaining M4 completion gate after the harness is validated: **physical installed-Windows observation of one actual due one-off reminder while Narro remains in tray/background mode**.

Markdown-only descendants of the validated source/test SHA do not replace that source baseline.

## WHY THIS SLICE IS REQUIRED

The previous handoff correctly required physical due-reminder acceptance, but repository inspection found that the validated diagnostic build cannot currently create a real due reminder through the product reminder pipeline:

- `src/App.tsx` exposes only `Send Test Notification`;
- `send_test_notification` submits directly to the Windows notification backend;
- no Tauri command/UI currently creates a persisted `ReminderRecord` for manual acceptance;
- the Milestone 5 scheduling UI is intentionally not implemented yet.

Therefore asking the user to perform the physical M4 reminder acceptance on the current build would require unsupported external SQLite manipulation and would not be the repository's narrowest reproducible test path. `AGENT_WORKFLOW.md` requires implementing the narrowest testable path before asking for interactive Windows evidence.

## USER-FACING PROGRESS

**`M-4/10 | 1/6 | 13/15`**

Reminder-acceptance-harness checkpoints:

1. mandatory startup + confirm physical-acceptance path gap + risk review + branch start — COMPLETE;
2. implement narrow persisted-reminder acceptance probe + deterministic tests + candidate diff review — PENDING;
3. exact PR-head Windows CI success including repository preflight, Tauri release and artifact — PENDING;
4. final exact-head semantic/diff review — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI + tracking/work-log reconciliation + exact manual procedure/artifact identity — PENDING.

## ACCEPTANCE-HARNESS CONTRACT

The source slice must remain diagnostic-only and must not implement Milestone 5 product UI.

Required behavior:

- expose one diagnostic action that creates a real persisted reminder through the existing list/task/reminder persistence APIs;
- use the renderer only to provide the current Windows/WebView2-resolved IANA timezone and a near-future local date/time;
- persist the probe transactionally so validation failure cannot leave partial diagnostic list/task rows;
- do **not** call the notification API directly from the probe;
- let the existing Rust-owned `reminder_service` background thread discover the due persisted reminder and call the existing task-reminder notification transport;
- return enough typed data for the diagnostic UI to show the scheduled local date/time/timezone and expected notification title/body;
- keep the two reminder parent TODO items open until physical Windows evidence is actually returned.

## LATEST VALIDATED REMINDER SOURCE

Reminder implementation remains validated through PR #43/#45. PR #45 evidence:

- exact validated PR head `61e7a473917cc3ae189228af63f3969f5fac361a`;
- Windows PR CI #226 / run `33987769236` / job `101364389957`: SUCCESS;
- PR artifact `9975828913`, digest `sha256:5efad294c22a6cdc936830f87495ad014393b1c992271fae5445ee7e94624b2f`;
- guarded merge source SHA `cd30ffafbe3e9cb0431f4bc8230c095451a106ca`;
- resulting-main CI #227 / run `33988613427` / job `101366662297`: SUCCESS;
- main artifact `9976084645`, digest `sha256:31bd024a7f4da25191582a0cb0812df53d8ba20aa31abcd6dbe39e0d492d5550`.

Current latest fully validated source/test baseline is newer: `9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`, Windows CI #253 artifact `9994050581`, digest `sha256:59ecfea5477108de7bb1a754680df36bad3830650e5f7c3dca17a86545f52a70`.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- strict IANA timezone/DST rules remain fail-closed;
- week starts Monday;
- reminder due evaluation remains Rust-owned and side-effect free until notification submission;
- reminder `fired_at` is written only after successful OS notification submission;
- failed reminder submission remains pending and retryable;
- acceptance probe must not directly submit a Windows notification;
- no renderer owns authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact.

## NEXT AGENT ACTION — IMPLEMENT ACCEPTANCE PROBE

1. Add the narrow diagnostic persisted-reminder probe with explicit typed failure handling and transaction rollback on partial setup failure.
2. Add deterministic Rust tests for successful persisted setup and rollback on invalid reminder input.
3. Add one diagnostic UI control that schedules the probe a short time in the future using WebView2's resolved IANA timezone and explains the tray/background observation.
4. Review the actual candidate diff, then open one PR and accept Windows CI only for its exact head.
5. After guarded merge and resulting-main CI, reconcile tracking and provide the exact artifact/manual procedure.

## USER ACTION REQUIRED

**Not yet.** Do not ask the user to perform the physical reminder acceptance until this harness has a fully validated resulting-main Windows artifact. Once available, the only required observation will be whether exactly one `Task reminder` Windows notification appears at/after the displayed due time while Narro remains running in tray/background mode.
