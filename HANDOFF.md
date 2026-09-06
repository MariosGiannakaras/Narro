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

- Latest completed source slice: **startup/resume/date-change recurrence orchestration + missed-week catch-up — COMPLETE / RECONCILED**.
- Active source slice: **None**.
- Active implementation branch: **None**.
- Active implementation PR: **None**.
- Pending source CI/main validation: **None**.
- Latest fully main-validated source baseline: **`83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`**.
- Next ordered unblocked source slice: **Windows locale/system 12/24-hour visible date/time formatting — NOT STARTED**.
- Physical reminder acceptance remains independently pending: **visible due reminder while Narro remains in tray/background mode**.

Markdown-only reconciliation commits newer than the validated source SHA do not replace that source baseline.

## USER-FACING PROGRESS

**`M-4/10 | 6/6 | 10/15`**

Do not reset the slice counter until a genuinely new source slice begins and its denominator is explicitly recorded.

Recurrence orchestration checkpoints:

1. mandatory startup + product/risk/source/runtime audit + branch start — COMPLETE;
2. Rust-owned orchestration + deterministic startup/date-change/missed-week/idempotency tests + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — COMPLETE;
4. final semantic/diff review of exact validated head — COMPLETE;
5. guarded merge with expected validated head — COMPLETE;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — COMPLETE after the tracking PR carrying this file is merged.

## LATEST VALIDATED SOURCE BASELINE

`83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`

### PR #51 exact-head validation

Exact validated PR head:

`5adcb73099af418e007fe3d4b263d146d383c75e`

- Windows PR CI #241 / run `34018912013` / job `101447745275`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9984989563`.
- Digest `sha256:e899a6c05874cb50caabcc8d2e5db3b346a4a98f0e6cf269d9bbb5676fdf9643`.
- Final exact-head semantic/diff review: **PASS**.
- Unresolved inline review threads: **none**.
- PR conversation comments: **none**.

PR #51 was guarded-squash-merged with expected head `5adcb73099af418e007fe3d4b263d146d383c75e` and produced:

`83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`

### Resulting-main validation

- Windows main CI #244 / run `34022250016` / job `101456840746`: **SUCCESS** on exact source SHA `83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9986069438`.
- Digest `sha256:41cade65815899a3c068f978f8f3e286eb75f0d0b3eb2e60267030bb6f201d4a`.

Evidence: `work-log/2026-09-06-chatgpt-m4-recurrence-orchestration-reconciliation.md`.

## VALIDATED RECURRENCE ORCHESTRATION CONTRACT

- `src-tauri/src/recurrence_service.rs` is the Rust-owned orchestration authority; no renderer polling or second recurrence materialization engine exists.
- `materialize_recurrence_week` remains the transactional child/occurrence creation primitive.
- no materialization watermark => process the current local week only, avoiding arbitrary historical backfill;
- existing watermark => process every missed Monday-based week in order, then process the current local date idempotently;
- repeated startup/same-day/same-week/date-change passes create no duplicate child tasks;
- timed recurrence resolves the current date in the recurrence rule's validated IANA timezone;
- date-only recurrence uses the Windows/system local calendar date and never converts through UTC;
- one failing rule does not block unrelated active rules;
- successful earlier catch-up weeks remain durable if a later week fails, and retry resumes from the monotonic watermark;
- orchestration uses a separately configured SQLite connection;
- one immediate startup cycle plus a bounded 60-second background cycle covers startup, local-date change and post-sleep/resume catch-up while Narro remains running.

## NEXT AGENT ACTION — NOT STARTED

Remain inside Milestone 4.

The next ordered **unblocked source** implementation slice is **Windows locale/system 12/24-hour visible date/time formatting**.

Before changing source:

1. run the mandatory repository startup sequence and confirm current `main` descends from source baseline `83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`;
2. confirm there is no unfinished implementation PR or source CI that must be resumed first;
3. inspect current visible date/time formatting paths in both webviews plus any Rust-projected strings;
4. preserve stored scheduling semantics: this slice is presentation formatting only, not schedule/timezone mutation;
5. use Windows/system locale conventions for 12/24-hour presentation without changing date-only or IANA scheduling logic;
6. define a new meaningful slice denominator before source changes and record it here;
7. validate exact PR head on authoritative Windows CI, final-review, guarded-merge, validate resulting main, then reconcile tracking.

The two reminder-related top-level TODO items remain open only because physical installed-build visible notification evidence is still pending. That independent acceptance does not block locale-formatting source work unless it exposes a reminder defect.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- occurrence uniqueness remains the duplicate-prevention boundary;
- date-only schedules never convert through UTC;
- week starts Monday;
- strict IANA timezone/DST rules remain fail-closed;
- recurrence materialization remains transactional per week and orchestration remains Rust-owned;
- failed one-rule orchestration remains retryable;
- reminder delivery submit-before-ack/retry semantics remain unchanged;
- no renderer owns authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact.

## REMINDER ACCEPTANCE — INDEPENDENT PENDING EVIDENCE

PR #45 reminder source remains fully validated and reconciled. Physical installed-build observation of one actual due reminder in tray/background mode remains pending before the two reminder TODO parent items may be checked. Do not reopen PR #45 unless physical evidence reveals a defect.

## USER ACTION REQUIRED

None for the next locale-formatting source slice. Physical installed-build visible due-reminder observation remains independently pending for reminder acceptance.
