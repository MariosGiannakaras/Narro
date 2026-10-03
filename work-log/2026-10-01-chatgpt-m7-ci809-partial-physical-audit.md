# M7 CI #809 residual physical recording — partial acceptance audit

Date: 2026-10-01

## Scope

This entry records the complete audit of the user-provided residual CI #809 recording `2026-10-01 19-03-32.mp4`.

Recording:
- SHA-256: `2da82409caa7b1dc4ad74f1d188ae230d5bd8566f6939f388fb4abe7058096a6`
- duration: 161.05 s
- capture: dual-display desktop at 4480x1080 / 60 fps
- intended candidate: CI #809 production physical artifact `11163439039`

The recording does not visibly show `Get-FileHash`, so exact executable identity is inherited from the user-provided CI #809 test context rather than independently proven by the pixels in this recording.

## Corrected Gate 7 boundary

The former CI #806 defect was a white L/outline during expanded -> compact at ~81.50 s.

The new recording contains at least six standard-motion compact <-> expanded sequences in the early active session. Dense transition sampling was inspected around:
- ~13.61 -> 15.00 s;
- ~15.80 -> 17.72 s;
- ~19.14 -> 21.25 s;
- ~21.86 -> 23.37 s;
- ~25.08 -> 28.74 s;
- ~33.28 -> 35.04 s.

Across those transitions, populated Timer content remains present through native-region changes. The former white L/outline / blank Timer-region frame is not reproduced. No document scrollbar is observed in the settled compact/expanded endpoints.

Result for the exact behavior corrected by PR #208: **PHYSICAL PASS**.

No new product defect was found in this boundary.

## Other positive evidence

- Active task/time remains coherent while presentations change.
- Focus-to-Main completion reconciliation is visible: the Focus surface reaches `All Clear` while the completed task appears in Main Done.
- Windows `Show animations in Windows` is visibly On around ~100 s, then Off around ~101 s, and restored On around ~131-132 s.
- With animations Off, one clean Timer expansion sequence is visible around ~109.6-111.4 s; however the recording then transitions to Panel rather than proving two complete compact -> expanded -> compact cycles.
- Windows Display settings visibly show one selected display at 100% scaling around ~133.5-134 s.
- The display topology is then reduced to one active display (`Show only on 2` / equivalent) around ~135-140 s; Narro/Focus remains safely visible on the surviving display. A reconnect/re-enable is not recorded.

## Residual checks not conclusively proven

These are **not product FAILs**. The recording simply does not contain enough observable evidence to close them:

1. two complete compact -> expanded -> compact cycles while Windows animations are Off;
2. second-launch single-instance confirmation (no Task Manager Details/process-count or otherwise unequivocal second-launch evidence);
3. Timer -> Main `Blitz now` -> Focus Panel: Timer->Panel transitions are visible, but the initiating Main `Blitz now` click is not unambiguous;
4. idle Ctrl+Shift+T and Ctrl+Shift+P/Find Timer input: an idle `All Clear` interval with no resurfaced Timer is visible, but the otherwise invisible keypresses are not independently observable/marked;
5. real mixed-DPI crossing: 100% is visible, but a second display at 125% is not visibly established before the move;
6. topology reconnect/re-enable after the observed topology reduction;
7. Timer topmost over a maximized/borderless-fullscreen application;
8. drag -> normal Quit -> relaunch -> safe saved placement.

## Gate state

Counters remain:

`4/10M || 2/5 | 11/19`

- C1: PASS
- C2: PASS
- C3: PASS
- C4: OPEN, but PR #208's corrected standard-motion Timer compositor boundary is now physically PASS
- C5: OPEN

Do not repeat the six standard-motion compact/expanded cycles. The next recording should contain only the residual observable checks above.

No corrective source PR is justified by this recording because no new runtime defect is evidenced.
