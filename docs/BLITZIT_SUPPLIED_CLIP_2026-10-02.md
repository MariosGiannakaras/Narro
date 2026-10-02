# User-supplied Blitzit planning clip — 2026-10-02

Evidence ID: **VE-020**  
Source: user-supplied MP4 in the 2026-10-02 ChatGPT session; raw binary is not yet archived in this repository.  
SHA-256: `501ed5d15959e691a18f6046f63b7a2068f4cb076979fa8fb92a04e7e0643299`  
Observed media: 2944×1904, 60 fps, 560 frames, 9.34 s.

This uninterrupted planning-board interaction is stronger than the edited tutorial corpus for the specific transient behavior below.

## Direct observations

- Dark planning board with Backlog / This Week / Today visible.
- Task hover preserves card geometry while exposing completion/action affordances.
- Four tasks are dragged from This Week to Today.
- Cross-lane drop is **positional**, not append-only. The final Today order is visibly `1, 3, 4, 2`, proving insertion at the pointer-selected vertical position.
- Visible ordinal labels remain attached to the moved cards in this sequence.
- Source and destination lists reflow during drag/drop.
- This Week starts at `Est: 6hrs 35min` although the visible nominal EST values total 7h35 because Marketing brief shows 2h30 EST and 1h already taken.
- After moving Marketing brief, This Week becomes 5h05 and Today becomes 1h30. The lane estimate therefore uses remaining work: `max(EST - Time Taken, 0)`.
- Subsequent visible values are arithmetically consistent: 3h05/3h30, 2h35/4h00, 2h30/4h05.
- Today progress changes `0/0 DONE → 0/1 → 0/2 → 0/3 → 0/4`; This Week remains `2/8 DONE` because moving is not completion.
- Today contains a high-salience rounded `🚀 Blitz now` CTA using the source pink→warm→mint/cyan gradient family.
- Today has a stronger cyan/mint accent boundary than neighboring lanes.
- CTA gradient appearance changes during the final hover/interaction segment.
- A whole-board fade begins near the end, but product transition vs edited recording boundary is not independently corroborated. Do not implement that fade from this clip alone.

## Reconciliation against Narro before this correction

Already present:
- task-card hover highlight and reserved action slot;
- completion control;
- pointer drag interaction;
- same-lane positional reorder;
- drop-settle animation;
- authoritative refresh and task identity preservation;
- Blitz domain start and Focus presentation.

Confirmed gaps:
1. cross-lane hover forced `beforeTaskId: null`, so moves appended;
2. lane aggregate EST summed nominal EST and ignored Time Taken;
3. `Blitz now` was a global strip after `<App />`, not the Today-lane primary CTA;
4. Today lacked source-like stronger lane emphasis;
5. the existing 19-video forensic pass did not record these planning-board arithmetic/position details at this granularity.

## Implemented in the VE-020 parity branch

- cross-lane moves carry `beforeTaskId` through renderer → typed API → Rust command and persist the selected target position transactionally;
- the board projection now exposes both nominal aggregate EST and `aggregateRemainingEstSeconds`; pending lanes render the latter and clamp each task at zero when Time Taken exceeds EST;
- `Blitz now` is rendered inside Today instead of globally after the app root;
- Today receives a stronger accent boundary;
- Blitz CTA uses a high-salience rounded source-like pink/warm/mint/cyan gradient with finite hover/focus motion and reduced-motion handling;
- Today empty copy matches the observed `No Tasks` capitalization.

## Still unresolved before implementation

- persistence/meaning of visible ordinal labels after cross-lane moves;
- exact completed/total accounting for lane progress across scheduled, recurring and completed tasks;
- exact semantics of every quick-action glyph in this clip;
- whether the final fade is a real product transition;
- whether CTA gradient movement is hover-driven, continuously animated or pointer-reactive.

These unresolved items are mandatory targets in `docs/BLITZIT_MEDIA_FORENSIC_PLAN.md` and must not be guessed.
