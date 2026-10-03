# M7 CI #801 packaged runtime — same-DPI Panel endpoint snap

Date: 2026-10-01

## Exact candidate

PR #192 exact head:
`1f9bc0185177ed9aaf9b3efc6248c5e8031da9b5`

Windows CI #801 / run `36836958927`: **FAIL**

The scheduling visual-readiness correction itself worked:
- repository preflight passed;
- full Windows visual-regression capture passed;
- the previously unstable scheduling fixtures completed and validators passed;
- Rust fmt/check/Clippy/tests and release build passed before packaged runtime capture.

The only failing gate was packaged Focus runtime validation.

## Failed artifact

Artifact:
- name: `narro-m7-focus-runtime-visual`
- id: `11149609321`
- digest: `sha256:e8c018547e8895061819f93c9c0ebd169d8f63ebb526d805de16b4ce975e4573`

Exact validator failure:
`timer-to-panel-runtime native HWND x-axis motion reversed`

The failed artifact was downloaded and inspected rather than weakening the assertion.

## Motion evidence

Panel→Timer reduced-motion samples:
- start outer HWND: `(668,0)`
- final Timer: `(388,80)`
- monotonic; no reversal.

Timer→Panel reduced-motion samples:
- start Timer: `(388,80)`
- first Panel animation endpoint: `(684,0)`
- native final settled Panel: `(668,0)`

Settled Panel metadata confirms:
- outer HWND width: 356 px;
- client width: 340 px;
- final edge position: x=668.

The 16 px reverse correction is therefore not sampler jitter. The animation planner used the 340 px logical/client target width when calculating the Panel edge (`1024 - 340 = 684`), while the real decorated HWND is 356 px wide and the native finalizer correctly places it at `1024 - 356 = 668`.

On standard-motion systems this would present as a small opposite-direction snap after the intended point-to-point animation.

## Root cause

`animate_focus_surface_presentation_internal` planned Panel motion with:
`focus_host_size_for_target_scale(...)`

That helper represents the logical/client host target. For same-DPI Timer→Panel transitions the current fixed host already has the correct real outer HWND dimensions, so using the logical size creates an avoidable mismatch with the native finalizer.

Cross-DPI return is intentionally different because target DPI can change the fixed host size and retains its existing dedicated settle path.

## Correction

Commit:
`5c8f4c4ec7ae403cf05bd4b7994187da50bb0aa7`

Behavior:
- same-DPI Panel animation target uses the current actual outer HWND size, clamped to the target work area;
- cross-DPI Panel animation continues using target-scale host planning;
- the strict monotonic native motion validator is unchanged.

Regression coverage:
- same-DPI helper test requires 356×709 current outer size to remain 356×709 for motion planning;
- cross-DPI helper test requires target-scale sizing (1.0→1.25 produces 425×875 in a large work area);
- existing eased-motion exact-endpoint and monotonic tests remain intact.

No renderer, timer/session, SQLite, scheduling or artifact-boundary semantics changed.

## Current gate

PR #192 exact head:
`5c8f4c4ec7ae403cf05bd4b7994187da50bb0aa7`

Windows CI #802 / run `36840338653`: **IN PROGRESS** at this checkpoint.

On PASS, mandatory review must confirm:
1. scheduling visual fixtures remain stable;
2. Timer→Panel motion no longer contains the 684→668 reverse correction;
3. the dedicated production-config physical build completes;
4. its runtimeVisual-boundary smoke passes;
5. only the new `narro-m7-physical-windows-x64` artifact is used for physical Gate 7/Gate 12.
