# AGENTS.md

## Purpose

This file contains durable implementation rules for MyBlitzit. Keep changing progress in `STATUS.md` and `TODO.md`; do not turn this file into a changelog.

## Start-of-task procedure

Before making changes:

1. Read `STATUS.md` and `TODO.md`.
2. Read only the specification sections relevant to the milestone being implemented.
3. Inspect current Git state, existing implementation, tests, and applicable repository instructions.
4. Do not repeat the original Blitzit research unless:
   - a new requirement contradicts the existing evidence,
   - a specification contains an explicit unresolved item that blocks implementation, or
   - new source material has been added.

Use `docs/RESEARCH_EVIDENCE.md` as the evidence index.

## Source and decision precedence

When sources disagree, use this precedence:

1. latest explicit user instruction
2. current supplied screenshots (the v2.6.69-era captures)
3. current official Blitzit Help Center documentation
4. older supplied public-review screenshots
5. inference

Never silently convert inference into confirmed behavior. If implementation must choose an unspecified behavior, document it as a MyBlitzit local design decision in `STATUS.md`.

## Non-negotiable product scope

MyBlitzit is personal and local-only.

Do not add:

- accounts, login, auth, profiles that imply remote identity
- cloud backend, cloud sync, hosted API, remote database
- subscriptions, payments, license checks, trials, upgrade prompts
- collaboration or multi-user concepts
- telemetry or analytics sent off-device
- AI/Blitzy features
- remote integrations or webhooks
- remote calendar sync
- voice transcription that sends audio to a service

Local OS functionality is allowed where it is necessary for the core experience: notifications, tray/background process, autostart, opening URLs, local file selection for icons, and installers.

## Selected architecture

Use:

- Tauri 2 desktop shell
- React + TypeScript frontend
- Rust backend for authoritative domain/runtime state
- SQLite for durable local persistence
- Tauri native capabilities/plugins only where they materially support a requirement

The three desktop presentations are:

- main application window
- narrow Focus Panel
- compact Floating Timer

They are not separate apps and must not own divergent copies of state.

## Timer and session correctness

Timer behavior is correctness-critical.

- Never treat a UI `setInterval` counter as authoritative elapsed time.
- Store timestamps and accumulated durations; derive displayed time from them.
- Use monotonic time while the process is alive to prevent wall-clock adjustments from corrupting a live session.
- Persist enough state to recover from process interruption.
- On restart, restore an interrupted live session **paused** unless later evidence establishes another behavior. Do not count time while the app was not running.
- Work sessions and break sessions must be distinguishable in persistence and reports.
- Switching windows must not start, stop, duplicate, or reset a session.
- Pausing must stop work-time accumulation.
- EST and Time Taken edits for a live task are allowed only while paused.
- Pomodoro overrides EST for the displayed countdown, but actual work time must still be tracked.

Every timer transition needs unit tests.

## Scheduling correctness

- Use the user's configured local timezone.
- Week boundaries start Monday, matching Blitzit documentation.
- Scheduled tasks must be reclassified into Backlog / This Week / Today according to date.
- Tasks scheduled for a future time today are not eligible to auto-start in Blitz Mode until due.
- Recurrence generation must be deterministic and idempotent.
- No server is available to materialize recurrence or reminders while the app is closed. On launch/resume, catch up missed recurrence generation safely.
- Use the background/tray process for due reminders while the application is running.
- Never create duplicate recurrence instances on repeated startup/day-boundary processing.

## Persistence

- SQLite is the source of truth for durable user data.
- Use migrations from the first schema version.
- Avoid storing absolute paths when an app-data-relative path or copied app asset is safer.
- Preserve user data across application upgrades.
- Permanent deletion must be explicit and irreversible only after confirmation.
- Archiving is reversible until the user selects permanent deletion.
- Keep report/session history when lists are merely archived.

## UI implementation rules

- Reproduce structure, interaction hierarchy, spacing, and state behavior from the supplied current screenshots.
- Support system, dark, and light themes.
- Do not copy Blitzit branding assets or paid/account UI. Use MyBlitzit branding and neutral local equivalents.
- Do not create dead controls for excluded cloud features.
- Prefer removing an excluded control to showing a nonfunctional imitation.
- Keep Focus Panel and Floating Timer deliberately compact.
- Floating Timer must be movable and always on top.
- Focus Panel monitor and left/right placement must be functional, not cosmetic.
- Long active-task titles need the configured scrolling behavior.
- Keyboard navigation and focus states must remain usable even when matching a visually minimal UI.

## Shortcuts

Implement the confirmed shortcuts unless the OS refuses registration.

Global:
- bring MyBlitzit to front: Windows `Ctrl+Shift+B`, macOS `Cmd+Shift+B`
- alternate Focus Panel / Floating Timer: Windows `Ctrl+Shift+T`, macOS `Cmd+Shift+T`
- locate/animate Floating Timer: Windows `Ctrl+Shift+P`, macOS `Cmd+Shift+P`

In-app:
- create task: `Ctrl/Cmd + Alt/Option + T`
- start break: `Ctrl/Cmd + Alt/Option + B`
- pause/resume task: `Ctrl/Cmd + Alt/Option + P`
- skip task: `Ctrl/Cmd + Alt/Option + S`
- finish active task: `Ctrl/Cmd + Alt/Option + F`
- active-task notes: `Ctrl/Cmd + Alt/Option + N`
- search: `Ctrl/Cmd + F` outside Blitz Mode

If a global shortcut is unavailable because another application owns it, show a local settings error rather than failing silently.

## Testing and validation

For each milestone:

1. run the narrowest relevant unit/component tests first
2. run Rust tests for domain/timer/scheduling logic
3. run frontend tests for interaction/state rendering
4. run an integration smoke test for affected Tauri commands/events where practical
5. manually validate desktop-window behavior on the current development OS when the change touches windows, shortcuts, tray, notifications, or packaging
6. update `TODO.md` and `STATUS.md`
7. stop when the milestone acceptance criteria pass

Do not perform unrelated cleanup or broad rewrites.

## Git discipline

- Preserve unrelated user changes.
- Avoid destructive Git operations.
- Work in coherent milestones.
- For a milestone large enough to risk session/quota exhaustion, checkpoint only after a working, validated slice.
- Use clear commits that describe the completed slice.
- Do not leave documentation/status updates until the end of a long implementation phase.

## Definition of done for an implementation milestone

A milestone is complete only when:

- behavior matches the specification and evidence priority
- persistence/invariants are respected
- tests for new domain behavior exist and pass
- affected desktop behavior has been smoke-tested
- no known regression is left undocumented
- `TODO.md` and `STATUS.md` reflect reality
