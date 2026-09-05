# Milestone 3 — Typed authoritative timer/session events

Date: 2026-09-05
Agent: ChatGPT
Slice: Tauri-owned timer service + revisioned renderer projection

## Reachable commits

- PR #32 final source head: `83ed096ddedbe36cdf38e6e8b4e16a380e62338a`
- squash merge on `main`: `349260f28475f53472b444af6180704a4b981c20`

## Implementation

PR #32 added a typed `timer-session-changed` contract and a Rust-owned `TimerController` around the persistence-first `TimerRuntime`. Successful persisted transitions publish revisioned payloads carrying the authoritative runtime/session projection and a typed change; rejected transitions do not consume a revision.

The Tauri shell now owns a `TimerService` containing the SQLite-backed controller and a process-local monotonic `Instant`. Renderer commands do not supply authoritative timer timestamps. A Rust background thread advances the timer every 250 ms, and only authoritative state/session boundaries are broadcast as events; ordinary elapsed refresh/checkpoint work does not create fake transitions.

Both `main` and `focusSurface` consume the same typed projection through a shared TypeScript bridge. Bootstrap is subscribe-first/snapshot-second to avoid losing a transition during webview startup/recreation. Lower revisions are ignored; same-revision snapshots remain eligible so checkpoint-only elapsed refreshes can replace the projection without fabricating a transition revision.

Invalid lifecycle calls return typed command failures rather than relying on controller `expect()` assumptions, and startup fails closed if the authoritative background timer thread cannot be created.

## Validation

- Windows PR CI #161 / run `33936979665`: **PASS**.
- Windows `main` CI #162 / run `33947484856`: **PASS**.
- Both runs passed repository preflight, frontend TypeScript/Vite build, rustfmt, Rust compile, Clippy, Rust tests, performance harness, Tauri release build and diagnostic artifact upload.
- Local Rust toolchain in the execution environment: **NOT RUN / unavailable**. Windows CI remained the authoritative compiler/Clippy/test gate.

## Durable architecture rules

- Rust/Tauri owns timer time and automatic boundary advancement; renderers are projection-only unless they request an explicit domain transition.
- `main` destruction/recreation and Focus Panel/Floating Timer presentation changes must never reset, duplicate or advance a timer session.
- Broadcast follows persistence success. Event transport failure may be logged, but must not roll back or invent a different already-committed domain transition.

## Newly identified next-slice regression target

Inspection after merge found a late-observation edge that must be addressed by the Pomodoro side-effect slice: `TimerEngine::advance_inner` can traverse Pomodoro Work -> Break -> Paused in one late call. `TimerRuntime::commit_candidate` currently compares only the initial and final binding, so a sufficiently late observation can end back on a Work binding and skip persistence of the intermediate Break session. The next slice must persist/emit every crossed authoritative boundary in order before attaching exactly-once Pomodoro boundary side effects.

## Continuation point

Next Milestone 3 priority is Pomodoro automatic boundary handling: preserve each crossed Work/Break boundary under late observation, emit break-start/end notification decisions once per authoritative boundary, and expose a durable end-of-break awaiting-resume prompt state to both webviews. Do not claim transactional exactly-once Windows toast delivery unless the implementation can actually guarantee it; distinguish authoritative boundary decision from external OS submission semantics.
