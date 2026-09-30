# PREF-R06 Windows-locale presentation — validated merge checkpoint

Date: 2026-09-30

## Scope

Independent Milestone 8 closure for visible schedule date/time formatting. No Focus/window, timer/session authority, scheduling persistence, or recurrence semantics changed.

## Exact evidence

- PR #194 exact validated head: `16ae996a478687ad3e61788e77de00159f4207c2`.
- Windows CI #721 / run `36704495943`: PASS.
- Expected-head guarded squash merge: `88dea3bcbd988f2e77ea0edccb218be95e5b2438`.
- Resulting-main Windows CI #724 / run `36709829221`: PASS.
- Main visual artifact: `11093782878`, digest `sha256:d822baa8ca1fc0f07ea8499721e28548359bac22d5196158e563accd06a75d01`.
- Main runtime artifact: `11093233909`, digest `sha256:51a9ba88c92ea36b8619df7b47ccd0dc9351ec213a202ffa898a7a02a90df433`.

## Validated behavior

The Schedule dialog read-only preview uses Narro's existing default-locale `Intl.DateTimeFormat` helpers rather than raw `YYYY-MM-DD at HH:mm` presentation. The operating-system locale therefore owns visible date ordering and 12/24-hour convention. Raw local date/time strings remain form/storage values and a fail-safe transient-draft fallback only.

## Progress

PREF-R06 and the M8 Windows-locale checklist item are complete. General roadmap remains 4/10 and the active corrective-slice counters do not advance from this independent sub-item.
