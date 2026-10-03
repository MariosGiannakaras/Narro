# M7 CI #809 C4 closure — second-launch and idle-input re-audit

Date: 2026-10-02

## Context

This entry extends the corrected two-monitor audit in
`work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`.

A further event-based pass over the same 161.05 s recording found evidence that
had still been missed when the first corrected map was written.

Recording:
- `2026-10-01 19-03-32.mp4`
- SHA-256 `2da82409caa7b1dc4ad74f1d188ae230d5bd8566f6939f388fb4abe7058096a6`
- synchronized two-monitor 4480×1080 canvas (1920 + 2560)

Candidate context remains CI #809 production physical artifact
`11163439039`, source `2767b3827670603d1ab259b6a843c2e0da82d85d`.

## Second-launch single-instance ownership — PHYSICAL PASS

The earlier corrected audit looked primarily at the launch near the start of the
recording and could not prove that a primary Narro process was already alive.

A second independent `narro.exe` activation exists later:

- around 38.0 s, Narro Main is already visibly running and the active Floating
  Timer is simultaneously visible on the second monitor;
- around 39.25–40.75 s, the desktop `narro.exe` icon is visibly
  selected/activated again while that first Narro runtime is already on screen;
- through at least 41.5 s, the same Main + active Timer state remains present;
- no second Narro Main/Focus UI, reset, competing state, or shortcut-conflict
  surface appears.

This is direct physical second-launch evidence, not merely startup inference.

It composes with the already validated PR #206 single-instance runtime contract:
`tauri_plugin_single_instance` is registered before setup and a secondary
launch routes to `request_show_or_recreate_main` instead of initializing a
second persistence/timer/background/shortcut authority.

M7-PHYS-04 is therefore physically accepted.

## Idle Ctrl+Shift+T / Ctrl+Shift+P no-op — PHYSICAL PASS with operator-context input identity

The recording's visible checklist explicitly defines the final idle test:
complete the active task to `All Clear`, then exercise Ctrl+Shift+T and
Ctrl+Shift+P and require no stale Timer/pulse.

The final sequence is:
- around 144 s, the Focus surface still has the active task;
- by ~146 s, completion has reconciled and the Focus surface visibly shows
  `All Clear` / no live task while Main Today is empty and Done has the
  completed task;
- from that idle state until the next unrelated Alt-Tab interaction around
  ~150 s, no compact/expanded placeholder Timer, stale task Timer, or attention
  pulse is surfaced.

The screen recorder does not render keyboard chord labels. The user subsequently
clarified that the tests in the recording must be correlated event-wise rather
than assumed to be simultaneous/in checklist order. Given the explicit on-screen
test procedure, the terminal All-Clear test position, the stable no-op outcome,
and the already automated-validated B6 active-state gates for both T and Find
Timer, this is accepted as **operator-context physical input evidence** rather
than claiming the key labels are pixel-visible.

B6 is therefore physically accepted.

## C4 result

The authoritative `docs/M7_CLOSURE_PLAN.md` C4 requirements are now covered:

- active task/session — PASS;
- repeated Panel↔Timer — PASS from CI806 unaffected evidence + CI809;
- repeated compact↔expanded — PASS on corrected CI809;
- task/session/time continuity — PASS;
- no blank/pale/staging/stale/duplicated frames — PASS;
- no document scrollbar — PASS;
- Timer → Blitz now → Panel — PASS;
- idle/no-task T and Find Timer no-op — PASS;
- single-instance ownership — PASS;
- Main/Focus mutation reconciliation — PASS.

**C4: PASS.**

No new runtime/source defect is evidenced and no corrective PR is justified.

## C5 remaining scope

C5 already has physical PASS evidence for:
- mixed-DPI 125%↔100% crossing;
- edge/taskbar-constrained placement;
- real topology/display-removal recovery;
- topmost over a maximized application.

The recording does not contain an unambiguous
**drag → tray Quit Narro → same-build relaunch → saved-placement recovery**
sequence. Dense 153–160 s reinspection confirms the apparent disappearance and
reappearance there is Alt-Tab switching, not process restart.

Therefore C5 remains OPEN only for saved placement across normal restart, then
final tracking reconciliation.

## Progress implication

C1/C2/C3/C4 are now PASS; C5 remains OPEN.

The repository's previous `2/5` closure counter was stale after the already
documented C3 integration PASS. The evidence-backed current closure state is
therefore `4/5`, not `2/5`.

M1 TODO items whose complete replacement validation is now evidenced by the
accepted physical run may be reconciled separately; this work log does not
claim M1 milestone completion.
