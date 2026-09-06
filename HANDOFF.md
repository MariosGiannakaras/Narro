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
- Active source slice: **M4 physical reminder acceptance harness — ACTIVE / CANDIDATE READY**.
- Active implementation branch: **`ai/m4-reminder-acceptance-harness`**.
- Active implementation PR: **None yet**.
- Branch base: tracking-only `main` **`6a824e761b54f1c069a7923aac2606abd8ecd2b9`**.
- Latest fully main-validated source/test baseline: **`9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`**.
- Pending source CI/main validation: **this acceptance-harness slice**.
- Remaining M4 completion gate after the harness is validated: **physical installed-Windows observation of one actual due one-off reminder while Narro remains in tray/background mode**.

Markdown-only descendants of the validated source/test SHA do not replace that source baseline.

## WHY THIS SLICE IS REQUIRED

The prior handoff correctly required physical due-reminder acceptance, but repository inspection showed that the validated diagnostic build could not create a real due reminder through the persisted reminder path:

- `src/App.tsx` exposed only `Send Test Notification`;
- `send_test_notification` submits directly to the Windows notification backend and bypasses reminder persistence/dispatch;
- no Tauri command/UI created a persisted `ReminderRecord` for manual acceptance;
- Milestone 5 scheduling UI is intentionally not implemented yet.

Asking for physical M4 acceptance on that build would therefore require unsupported external SQLite manipulation. `AGENT_WORKFLOW.md` requires the narrowest testable path before interactive Windows evidence, so this diagnostic-only seam is required to make the existing acceptance gate executable.

## USER-FACING PROGRESS

**`M-4/10 | 2/6 | 13/15`**

Reminder-acceptance-harness checkpoints:

1. mandatory startup + confirm physical-acceptance path gap + risk review + branch start — COMPLETE;
2. implement narrow persisted-reminder acceptance probe + deterministic tests + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including repository preflight, Tauri release and artifact — PENDING;
4. final exact-head semantic/diff review — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI + tracking/work-log reconciliation + exact manual procedure/artifact identity — PENDING.

## CANDIDATE CONTRACT

The candidate is diagnostic-only and does not implement Milestone 5 product scheduling UI.

Implemented:

- new isolated `src-tauri/src/reminder_acceptance.rs`;
- one Tauri command `schedule_reminder_acceptance_probe`;
- one diagnostic control `Schedule Real Reminder Probe (+2 min)` in the existing Main diagnostic surface;
- the renderer supplies only a near-future local `YYYY-MM-DD` / `HH:mm` plus WebView2-resolved IANA timezone;
- Rust strictly validates date, time, timezone and DST resolution before writing rows;
- diagnostic list + Today task + real reminder are inserted in one SQLite transaction, with typed read-back before commit;
- deterministic tests prove the persisted row becomes visible to the real `pending_due_reminders` boundary at its resolved instant;
- deterministic forced reminder-insert failure proves list/task/reminder setup rolls back atomically;
- invalid timezone is rejected before any rows are written;
- the command does **not** call the notification API.

The existing Rust-owned `reminder_service` background thread remains unchanged and is therefore the only code that can discover the due row, submit `Task reminder`, and acknowledge `fired_at`. The diagnostic fixture writes directly to the already-established durable schema inside one transaction because the public create-list/create-task/create-reminder functions each own their own transaction and cannot be safely nested; typed decoders and the real due-query boundary verify the committed shape.

Expected physical notification after validation:

- title: `Task reminder`;
- body: `Reminder acceptance probe - expected once`;
- exactly one visible notification is expected;
- background poll interval remains 30 seconds.

Candidate diff review: PASS. Compared with base `6a824e761b54f1c069a7923aac2606abd8ecd2b9`, the source candidate changes only `src-tauri/src/lib.rs`, adds `src-tauri/src/reminder_acceptance.rs`, changes `src/App.tsx`, and updates this HANDOFF tracking file. `reminder_service.rs`, notification transport, reminder schema and product TODO/STATUS are unchanged.

Local project preflight is NOT RUN in the connector-only environment; authoritative Windows CI is required for the exact PR head.

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
- acceptance probe must never directly submit a Windows notification;
- no renderer owns authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact.

## NEXT AGENT ACTION — PR VALIDATION

1. Open one PR from `ai/m4-reminder-acceptance-harness` and record its exact head SHA.
2. Accept Windows CI only for that exact head; on failure inspect the exact failing step/log and fix only evidence-backed problems.
3. On success record run/job/artifact/digest and perform final exact-head semantic/diff review.
4. Guarded-merge only the validated expected head.
5. Validate the resulting main source SHA on authoritative Windows CI.
6. Reconcile `STATUS.md`, `HANDOFF.md` and a new immutable work-log entry; TODO remains `13/15` until actual physical Windows reminder evidence is returned.
7. Only after the validated resulting-main artifact exists, give the user the exact short physical acceptance procedure.

## USER ACTION REQUIRED

**Not yet.** Do not ask the user to perform the physical reminder acceptance until this harness has a fully validated resulting-main Windows artifact. Once available, the only required observation will be whether exactly one `Task reminder` Windows notification with body `Reminder acceptance probe - expected once` appears at/after the displayed due time while Narro remains running in tray/background mode.
