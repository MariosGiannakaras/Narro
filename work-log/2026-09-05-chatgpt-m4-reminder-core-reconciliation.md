# M4 durable one-off reminder core reconciliation

Date: 2026-09-05

## Scope

This immutable log records the validated Milestone 4 durable one-off reminder core delivered through PR #43.

Implemented source behavior:

- typed `ReminderRecord` / `NewReminderInput` using the existing M2 reminder schema;
- strict RFC3339 mutation timestamps;
- strict local `YYYY-MM-DD` / `HH:MM` parsing;
- IANA timezone validation and strict DST gap/fold rejection through the established scheduling resolver;
- reminder creation rejected for completed/archived tasks and archived-list contexts;
- deterministic, side-effect-free pending-due evaluation by resolved absolute instant;
- fired, dismissed, completed-task, archived-task and archived-list reminders excluded from pending delivery;
- explicit conditional/idempotent `mark_reminder_fired` and `dismiss_reminder` terminal transitions;
- integration regressions for resolved-instant ordering across timezones, invalid timezone, New York DST spring gap/fall fold, terminal idempotency and inactive contexts.

Explicitly outside PR #43:

- tray/background polling and OS notification delivery orchestration;
- exactly-once OS delivery across a crash between notification submission and `fired_at` persistence;
- Preferences/Main-window UI, sounds/previews or recurring reminder generation.

The top-level M4 TODO item `Implement one-off local reminders` therefore remains open after this slice. PR #43 establishes the durable core that the next tray/background delivery slice must consume.

## PR validation

PR #43: `M4: add durable one-off reminder core`

Exact validated PR head:

`e7ad0e936bda7bd55bf6146eeed9834342dec4c3`

Authoritative Windows PR validation:

- Windows CI #221;
- run `33984170905`;
- job `101354563375`;
- repository preflight: PASS;
- Tauri release build: PASS;
- artifact upload: PASS;
- artifact ID `9974807441`;
- digest `sha256:3d427309eb210efbee385a09a3fdba65ff1e595fd99bd0623374658bd18f5db9`.

Earlier CI #218 and #220 failed only on evidence-backed `cargo fmt --check` differences. Only the formatter-required deltas were applied before the final successful exact-head validation.

## Merge

PR #43 was guarded-squash-merged with expected head:

`e7ad0e936bda7bd55bf6146eeed9834342dec4c3`

Resulting main source SHA:

`3ba3203fa567234665f5caa2e1e6bede98805d64`

The merge message intentionally contained no CI-skip token.

## Resulting-main validation

Authoritative Windows main validation:

- Windows CI #222;
- run `33984813779`;
- job `101356279605`;
- exact source SHA `3ba3203fa567234665f5caa2e1e6bede98805d64`;
- repository preflight: PASS;
- Tauri release build: PASS;
- artifact upload: PASS;
- artifact ID `9974997335`;
- digest `sha256:c82b91fe12b797f6b95a6257d558741203c3a194fa6d4f3737fbdd25a6bea7c4`.

This SHA is the validated source baseline for continuation. Later Markdown-only reconciliation commits do not replace it.

## Durable invariants established for reminder delivery follow-up

- `pending_due_reminders` remains side-effect free;
- due comparison is based on resolved absolute instants rather than local clock text;
- strict IANA/DST validation remains fail-closed;
- `fired_at` must not be written before successful notification submission;
- fired/dismissed transitions remain terminal and idempotent;
- renderer code must not own authoritative reminder state;
- the next delivery slice must explicitly address retry/restart behavior against historical late/duplicate/missed reminder failures without claiming exactly-once crash semantics unless proven.

## Next ordered work

Remain in Milestone 4. The next narrow source slice should connect the validated reminder due-query core to Narro's existing Windows notification transport while the Tauri process remains alive in tray/background mode. That source slice is NOT STARTED at the end of this reconciliation.
