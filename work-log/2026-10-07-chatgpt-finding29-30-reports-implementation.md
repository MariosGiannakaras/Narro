# Findings29/30 — Reports Add Session implementation slice

Date: 2026-10-07

Status: **IMPLEMENTED ON PR246 / AUTOMATED VALIDATION OPEN**

## Scope

This branch implements only the already-analyzed Reports → Add Session corrections for Finding29 and Finding30. It is independent of Finding28 / PR245 and does not touch PR245 files.

PR: #246  
Branch: `fix/finding29-30-reports-add-session`  
Exact authoritative head: `7b47aacea282d5307633d0596f15e229b0c0feb2`

## Finding29 correction

`ReportAddSessionDialog` now:
- captures/restores opener focus;
- moves initial focus to the task-search field;
- traps Tab and Shift+Tab inside the modal;
- closes on Escape only when no Add mutation is pending;
- preserves pending dismissal protection;
- moves focus to the dialog shell while every interactive control is disabled during pending state.

The existing session mutation, task selection, date/time and persistence semantics are unchanged.

## Finding30 correction

The Recent Tasks picker now:
- keeps vertical scrolling;
- suppresses horizontal scrolling;
- constrains row/title/list flex sizing with `min-width: 0`;
- keeps task/list text on one line with ellipsis instead of expanding scroll width.

The full underlying task/list text remains in the DOM.

## Regression coverage

The existing Reports Windows visual gate now includes:
- a rendered Add Session keyboard fixture for initial focus, Tab wrap, Shift+Tab wrap, Escape dismissal, focus restoration, pending Escape protection and pending focus containment;
- a long unbroken Recent Tasks title;
- a rendered `scrollWidth <= clientWidth + 1` containment assertion;
- captured-DOM validators and fast-gate source guards.

CI1019 was started on the first PR246 head and is superseded by the tightened head; it must not be used for acceptance.

Exact-head CI1020/run `37615461397` is queued.

Physical Windows acceptance and direct source-parity acceptance remain OPEN regardless of automated CI result.

Progress remains `3/10M || 0/3 | 17/18`.
