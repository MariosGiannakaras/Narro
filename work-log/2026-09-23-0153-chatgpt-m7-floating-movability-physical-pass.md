# M7 Floating Timer movability — physical Windows PASS

Date/time: 2026-09-23 01:53 +03:00
Agent/tool: ChatGPT recording user-observed Windows evidence
Milestone: 7 — Floating Timer mode
Item: 2/14
State: COMPLETE / AUTOMATED + PHYSICAL WINDOWS VALIDATED

## Exact build under test

Validated source SHA:

`f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`

Tree:

`adf0342eba2944bca5e986d80f977bb06864682a`

Resulting-main Windows CI:

- run number: #454;
- run ID: `35593002396`;
- job ID: `106311386561`;
- runtime artifact: `10636128018`;
- runtime artifact digest: `sha256:8d2113cfd00bc73a84d96294380f43f33fef460ddc86e8d880b3f986ae124cb5`.

Automated CI had already passed Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads on this exact source.

## Physical observations

The user opened Focus Panel on the right side of the screen, switched to Timer/compact mode, moved the Floating Timer, and observed that it stayed in the released position.

Recorded results:

- Drag: **PASS**.
- Return button: **PASS**.
- Always on top: **PASS**.
- Taskbar: **PASS**.

Return behavior:

- after Return to Focus Panel, the Panel reappeared at the original right-side location.

## Additional observation — transition flicker

During Timer -> Panel return, the Panel very briefly flickers/flashes on the left side before settling back at the correct original right-side position.

Interpretation:

- final position correctness passed;
- the return control itself passed;
- item 2's movability/topmost/taskbar contract is satisfied;
- the brief transition artifact is not silently discarded: it is assigned to M7 item 7, which owns Focus Panel <-> Floating Timer transition behavior and will validate/remediate the flash without introducing high-frequency JS native-window geometry animation.

## Tracking outcome

- M7 item 2 becomes complete.
- M7 advances from 1/14 to 2/14 validated top-level items.
- General roadmap remains 6/10 milestones complete.
- Next ordered slice is M7 item 3: collapsed Floating Timer title/live timer/subtask progress/add/expand.
- No user action remains for item 2.
