# M4 Windows locale/system visible date/time formatting reconciliation

Date: 2026-09-06
Agent: ChatGPT
Milestone: 4 — Scheduling, recurrence, reminders, eligibility
Slice: Windows locale/system 12/24-hour visible date/time formatting

## Validated source identity

- Implementation PR: #54 — `M4: format visible dates and times with Windows locale`
- Exact validated PR head: `73010ed9777d70123eee966c736ab1528173258c`
- Guarded squash-merge source SHA: `cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`
- This tracking reconciliation is Markdown-only; it does not replace that validated source baseline.

## PR-head Windows evidence

Windows CI #248:

- run `34032151067`
- job `101483547592`
- exact head `73010ed9777d70123eee966c736ab1528173258c`
- Repository preflight: PASS
- Tauri release build: PASS
- artifact upload: PASS
- artifact ID `9989152398`
- digest `sha256:5d40ce11808defb18602cd5aa8d18077d59986181841b876f7167ea18aa9849f`

Final exact-head semantic/diff review was PASS. No unresolved review threads or PR comments were present.

## Guarded merge

PR #54 was squash-merged only after re-reading the exact head and supplying expected head `73010ed9777d70123eee966c736ab1528173258c`.

Resulting source SHA:

`cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`

## Resulting-main Windows evidence

Windows CI #249:

- run `34038489647`
- job `101500825881`
- exact main source SHA `cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`
- Repository preflight: PASS
- Tauri release build: PASS
- artifact upload: PASS
- artifact ID `9991119217`
- digest `sha256:769419c27a7c02624a6891ea692ecc218e42600aa4a2cbbe57e922b3b9c5e7e9`

## Validated behavior

- `src/dateTimeFormat.ts` is the shared visible date/time formatting boundary for both current webviews.
- Default/production formatting does not force a locale, `hour12`, or `hourCycle`; WebView2/Intl therefore resolves Windows/system locale and 12/24-hour convention.
- strict `YYYY-MM-DD` date-only values are represented through local calendar components at local noon rather than UTC conversion, preserving the intended day.
- strict `HH:mm` local clock values are validated before locale formatting.
- explicit locale injection exists only as a deterministic test seam.
- the executable contract test transpiles and executes the actual TypeScript formatter and covers leap-day/date validity, invalid clocks, date-only component preservation, explicit US 12-hour vs GB 24-hour behavior, and default runtime resolution.
- repository preflight runs the formatter contract before the frontend build.
- `TimerSessionProjection` uses one fixed diagnostic locale sample in both `main` and `focusSurface`, proving shared formatter consumption without broad Milestone 5 scheduling UI work.
- no Rust/domain/schema/scheduling/timezone semantics changed.

## Tracking reconciliation

- `TODO.md`: only the top-level Milestone 4 item `Format visible dates/times using Windows locale/system 12/24-hour convention by default.` is eligible to transition to `[x]`.
- `STATUS.md`: validated source baseline advanced to `cadcf8b2d6d25d8cdd20652f11a426edbb21c91d` with PR/main CI evidence.
- `HANDOFF.md`: locale formatting marked COMPLETE / RECONCILED and next ordered unblocked source slice set to the combined M4 scheduling/recurrence regression matrix.
- compact progress after reconciliation: `M-4/10 | 6/6 | 11/15`.

Reminder physical acceptance remains independently pending and the two reminder top-level TODO items remain open.

## Next action

Run the mandatory zero-context startup sequence, then implement only the missing portions of the top-level M4 regression item covering DST, Monday/week boundaries, timezone changes, repeated startup, missed days, future-time eligibility and weekend/date-only behavior. Reuse existing tests where coverage already exists rather than duplicating them. After that, proceed to the separate scheduled-lane movement anti-duplication regression item.
