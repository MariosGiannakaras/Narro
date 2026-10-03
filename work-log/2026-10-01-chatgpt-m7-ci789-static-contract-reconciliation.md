# M7 physical-correction CI #789 static-contract reconciliation

Date: 2026-10-01

## Context

Physical CI #787 evidence reopened M7 with three evidence-backed defects. Production corrections were implemented in:
- `6972c4e08d8fce4b1eb4f7843123f22564c28607` — active Timer semantics, expanded task/time, Find-Timer active gate, idle Timer→Panel normalization, active packaged runtime harness.
- `c77ece58439753d92ab486d1ebb3a43605efbbd3` — cross-window board invalidation and authoritative Main/Focus/Home re-read.

## CI #789

Exact head:
`c77ece58439753d92ab486d1ebb3a43605efbbd3`

Windows CI #789 / run `36791787553`: **FAIL**

The failure was during frontend preflight in `scripts/test-ui-focus-panel.mjs`.
It still asserted direct `invoke<TimerSessionPayload>("timer_*")` implementation strings after timer mutations were deliberately routed through `committedTimerMutation()` so successful timer/session changes also invalidate other visible board projections.

Relevant earlier contracts passed before the failure, including the packaged Focus runtime visual harness contract.

No production rollback was warranted.

## Static contract reconciliation

The Focus Panel static test was updated to require:
- the typed `invoke<TimerSessionPayload>(command, args)` inside the committed mutation helper;
- `emitBoardInvalidated()`;
- all public timer mutation functions routing through `committedTimerMutation()`.

A targeted source-contract scan then found the same superseded direct-invoke expectation in:
- task metrics;
- M6 Extend parity;
- task create/edit;
- subtasks;
- reorder/move;
- list-board Change List/Duplicate;
- hover actions;
- scheduling/recurrence.

Those tests were updated to protect the new committed-mutation wrappers rather than the old direct textual shape. Production source did not change during this static reconciliation sequence.

## Current exact candidate

PR #192 exact head:
`3ef70edde95190a3981a7f53aa57d6a1f6da189a`

Windows CI #793 / run `36792233873`: pending at checkpoint creation.

Do not issue another physical artifact until #793 passes and fresh runtime/visual artifacts are reviewed.
