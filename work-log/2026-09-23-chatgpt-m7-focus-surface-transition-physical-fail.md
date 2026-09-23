# M7 Focus surface transition — physical Windows FAIL

Date: 2026-09-23
Milestone: 7 — Floating Timer mode
Item: 7/14
State: PHYSICAL FAIL / CORRECTIVE SLICE REQUIRED

## Exact build tested

Source SHA:

`c6f28fcfede74c02afff875b6322e4743ed01549`

Resulting-main Windows CI #469:

- run `35878281929`;
- job `107239838245`;
- runtime artifact `10760351396`;
- runtime digest `sha256:a2a8a43ae013e9897f376d6f85535945cf54673656662def7f27f48e1f9614f0`.

Automated preflight, Windows visual regression, Tauri Release and required artifacts were PASS before this physical check.

## Physical observations

User-reported results:

- Flicker: **FAIL**.
- Position: **PASS** — Focus Panel consistently returns to the configured right side. Moving the Floating Timer left does not change the Panel's preferred right-side return location.
- Session: **PASS** — after Resume and repeated Panel/Timer switching, the timer continued counting; no observed reset/duplication/switch.
- Transition: **FAIL / UX not accepted**.

Additional screenshot evidence from the same build:

- horizontal overflow/scrollbars are visible on Focus/Timer surfaces;
- the Floating Timer expansion visually exposes an intermediate enlarged compact presentation before the full expanded action/subtask presentation settles.

## Blitzit parity boundary

Repository evidence establishes:

- Focus Panel -> Floating Timer as a presentation switch;
- Floating Timer collapsed <-> expanded as a separate control;
- expanded state exposes action strip/subtasks;
- resize control returns to Focus Panel.

There is no evidence for a required third intermediate presentation state. The visible intermediate state in Narro is therefore treated as an implementation artifact, not parity behavior.

## Engineering implication

The first item-7 correction hid native staging, but physical evidence shows the transition acceptance criterion is still unmet.

The next fix must remain narrow:

1. retain native target-monitor DPI staging but place the staging window at the target Panel edge rather than work-area origin so compositor latency cannot expose a left-side jump for a right-side Panel;
2. remove horizontal overflow without disabling required vertical Panel scrolling;
3. coordinate native expanded/collapsed resize and renderer expanded-state publication so one user expand action does not visibly show a third intermediate presentation.

Do not start M7 item 8. Item 7 remains 6/14 overall and 4/5 for the current slice until a corrected candidate passes automated and physical Windows validation.
