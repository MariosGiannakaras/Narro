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
- Active source slice: **Windows locale/system 12/24-hour visible date/time formatting — ACTIVE**.
- Active implementation branch: **`ai/m4-windows-locale-formatting`**.
- Active implementation PR: **None yet**.
- Latest fully main-validated source baseline: **`83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`**.
- Branch started from current tracking-only `main` (`62fbd7ea8774b123ed90e93ca5cca68ad56fab28`); Markdown-only descendants do not replace the validated source baseline.
- No open implementation PR or pending source CI existed when this slice began.
- Local Rust/Node preflight in this connector-only environment: **NOT RUN**.
- Current small-slice progress: **1/6**.

## USER-FACING PROGRESS

**`M-4/10 | 1/6 | 10/15`**

Locale-formatting checkpoints:

1. mandatory startup + current visible-formatting/spec/dependency audit + branch start — COMPLETE;
2. shared locale-aware visible formatter + deterministic contract tests/diagnostic projection + candidate diff review — PENDING;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — PENDING;
4. final exact-head semantic/diff review — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## PRODUCT / RELIABILITY CONTRACT

- visible date/time text follows the Windows/system locale and its default 12/24-hour convention;
- do not hardcode an hour cycle or a product-specific date order when the system locale already defines it;
- date-only values remain calendar dates and must never be converted through UTC for display;
- timed schedule storage, IANA timezone resolution, recurrence materialization and eligibility semantics remain unchanged;
- this slice is presentation formatting only: no schema migration and no schedule mutation;
- use one shared formatting boundary so later Main/Focus scheduling UI does not invent independent locale logic;
- current `main` and `focusSurface` are still diagnostic/runtime surfaces, so the slice may add a narrow visible formatting diagnostic/example while establishing the shared formatter contract; do not start Milestone 5 product UI.

## NEXT AGENT ACTION — ACTIVE BRANCH

1. Implement a shared frontend date/time formatting module using the runtime's default locale/hour cycle rather than hardcoded locale or `hour12` settings.
2. Parse date-only `YYYY-MM-DD` values as local calendar components rather than UTC instants.
3. Add deterministic contract checks for date-only parsing, invalid values, locale option construction, and explicit injected locales/hour-cycle behavior where useful without changing the default-system policy.
4. Surface a minimal diagnostic projection in both webview entry paths only if needed to prove the shared formatter is actually used; do not build scheduling product UI.
5. Review the candidate diff, then update this file to 2/6 and open one PR.
6. Accept Windows CI only for the PR's exact head; then final-review, guarded-merge, validate resulting main, and reconcile tracking.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- strict IANA timezone/DST rules remain fail-closed;
- week starts Monday;
- occurrence uniqueness remains the recurrence duplicate-prevention boundary;
- reminder delivery submit-before-ack/retry semantics remain unchanged;
- no renderer owns authoritative recurrence/reminder/timer state;
- no broad product UI work inside this M4 formatting slice;
- async `main` recreation remains intact.

## REMINDER ACCEPTANCE — INDEPENDENT PENDING EVIDENCE

PR #45 reminder source remains fully validated and reconciled. Physical installed-build observation of one actual due reminder in tray/background mode remains pending before the two reminder TODO parent items may be checked. Do not reopen PR #45 unless physical evidence reveals a defect.

## USER ACTION REQUIRED

None for this locale-formatting source slice. Physical installed-build visible due-reminder observation remains independently pending for reminder acceptance.
