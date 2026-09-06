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
- Local Node runtime exists, but project dependencies are unavailable in the local container; project preflight remains **NOT RUN locally**.
- Current small-slice progress: **2/6**.

## USER-FACING PROGRESS

**`M-4/10 | 2/6 | 10/15`**

Locale-formatting checkpoints:

1. mandatory startup + current visible-formatting/spec/dependency audit + branch start — COMPLETE;
2. shared locale-aware visible formatter + executable contract test + shared diagnostic projection + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — PENDING;
4. final exact-head semantic/diff review — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## CANDIDATE CONTRACT

- `src/dateTimeFormat.ts` is the shared visible date/time formatting boundary for both webviews.
- Default calls pass no explicit locale and no `hour12`/`hourCycle`, so WebView2/Intl uses the runtime's Windows/system locale and hour-cycle convention.
- `YYYY-MM-DD` date-only values are parsed into local calendar components at local noon, never through UTC, preventing display-day shifts.
- local clock values are validated as strict `HH:mm` and formatted with locale-native hour presentation.
- explicit locale injection exists only as a deterministic test seam; production/default calls use the runtime default locale.
- `scripts/test-date-time-format.mjs` transpiles and executes the actual TypeScript formatter via the repository TypeScript dependency and checks leap-day/date validation, invalid times, date-only local-component preservation, `en-US` 12-hour vs `en-GB` 24-hour behavior, and default-system resolution.
- `package.json` runs the formatter contract before the frontend build in `preflight:frontend`.
- the existing shared `TimerSessionProjection` renders one fixed locale-format sample in both `main` and `focusSurface`, proving both webviews consume the same formatter without adding scheduling product UI.
- no Rust/domain/schema/scheduling/timezone mutation code changed.

## NEXT AGENT ACTION — PR VALIDATION

1. Open one PR from `ai/m4-windows-locale-formatting` and record its exact head SHA.
2. Accept Windows CI only for that exact head. If it fails, inspect the exact failing log and fix only evidence-backed problems.
3. On full preflight/release/artifact success, record run/job/artifact/digest and perform final exact-head semantic/diff review.
4. Guarded-merge only the validated expected head.
5. Validate resulting main on authoritative Windows CI.
6. Reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and create one new immutable locale-formatting work-log entry.

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
