# M7 CI #802 test-literal compile correction

Date: 2026-10-01

## Candidate

PR #192 exact head:
`5c8f4c4ec7ae403cf05bd4b7994187da50bb0aa7`

Windows CI #802 / run `36840338653`: **FAIL**

## What passed

Repository preflight progressed through frontend/static validation and production Rust `cargo check`.

## Exact failure

`cargo clippy --all-targets --all-features --locked -- -D warnings` failed only while compiling the new lib tests:

`error[E0560]: struct windows::PhysicalRect has no field named origin`

The two new regression tests constructed `GeometryRect` with:
`origin: GeometryPoint { ... }`

The repository geometry type is `PhysicalRect` and its field is:
`position`

No production implementation error was reported.

## Correction

Test-only commit:
`440b172565d94fadb3e814559bec5f3b47e48012`

Only the two test literals changed from `origin` to `position`.

Production native motion correction remains:
`5c8f4c4ec7ae403cf05bd4b7994187da50bb0aa7`

## Current gate

PR #192 exact head:
`440b172565d94fadb3e814559bec5f3b47e48012`

Windows CI #803 / run `36840822689`: **IN PROGRESS** at this checkpoint.
