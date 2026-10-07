# Finding35 — Floating Time's Up source-evidence disposition

Date: 2026-10-07

Status: **INTEGRATED / DIRECT_FLOATING_SOURCE_EVIDENCE_LIMIT / SYSTEM_REFERENCE_ACCEPTED / PHYSICAL_OPEN**

No application source changed in this slice.

## Integrated implementation

PR240 exact final head:
`94ea1ccdf7bbc8f00585370d799b077b8bad2ef9`

Full Windows CI983/run:
`37459582808` — PASS

Merge:
`7f8a1f3b52a405d94ff5cb1ba98d04bdb251f248`

All three changed source/test blobs were already verified identical on resulting main.

The final implementation:
- replaces the ordinary Pause/Resume slot with Extend only during authoritative `time_up`;
- keeps the Floating action rail at six slots;
- restores Pause/Resume in overtime;
- clears stale local success/status text on authoritative entry into Time's Up.

The CI983 renderer regression asserts exact Time's Up order:
`break,notes,extend,skip,done,return-to-panel`

and exact overtime order:
`break,notes,pause-resume,skip,done,return-to-panel`.

It also proves Floating Extend invokes the existing authoritative `timer_extend` path and projects overtime.

## Canonical source evidence

### VE-016 — Timer Modes — SOURCE_COMPLETE

Direct source evidence establishes:
- ordinary EST expiry becomes persistent `TIME'S UP`;
- Time's Up does not auto-progress;
- Skip, Done and Extend remain available;
- the former ordinary timer-control role becomes Extend after expiry;
- Extend changes the expired state into overtime.

### VE-003 — Focus/Floating interaction — SOURCE_COMPLETE

Direct source evidence establishes the ordinary Floating action-strip family:
- title/time gives way to the compact action strip;
- demonstrated actions include Break, Notes, Pause, Skip and Done;
- the rightmost control returns/expands to Panel;
- hover expands one action label while the outer Floating width remains fixed.

## Evidence limit

The canonical corpus does **not** contain a frame or interval showing **Floating Timer while in Time's Up**.

VE-016's Time's Up/Extend sequence is on the live Focus card. VE-016 only shows Floating Timer later in a Pomodoro countdown state. VE-003 shows ordinary Floating actions but not Time's Up.

Therefore an exact direct source-pixel claim for the Floating-Time's-Up arrangement is impossible from the retained source corpus. Keeping “direct source visual acceptance OPEN” would incorrectly imply that a missing source frame can still be recovered from existing evidence.

## Reconciled decision

Use the repository's evidence fallback order:

1. confirmed VE-016 Time's Up semantic/action substitution;
2. confirmed VE-003 Floating action-strip grammar;
3. calibrated Floating visual system and existing fixed six-slot Narro geometry;
4. deterministic exact-head CI983 regression.

The implemented six-slot substitution is the strongest evidence-backed reconstruction and is accepted as **SYSTEM_REFERENCE_ACCEPTED**.

This is **not** `DIRECT_SOURCE_PARITY_PASS`; it is an explicit `DIRECT_FLOATING_SOURCE_EVIDENCE_LIMIT` disposition.

## Remaining gate

Actual packaged-Windows physical behavior remains OPEN:
- enter Floating Time's Up on the relevant release candidate;
- confirm Extend is reachable in the intended slot;
- activate Extend and confirm overtime/Pause-Resume restoration;
- confirm no stale status copy or geometry break.

Broader M7 Focus/Floating source-parity and physical gates remain independent.

Progress counters do not advance from this evidence disposition.
