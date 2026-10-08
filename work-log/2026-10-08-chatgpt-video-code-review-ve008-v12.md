# Video-to-code review 12 — VE008 recurring task setup

Date 2026-10-08, previous main 2d057174a19c617c4a8c53d634bbecfbb23a7bf0. Canonical source Pass-3 full MP4 02:46.905 60fps already complete; no replay.

Production checked: TaskScheduleDialog, TaskCard menu, ListBoard UI and API, Rust recurrence/materialization/normalize_parent_as_backlog, persistence/recurrence_replace and recurrence create, list_board LaneAccumulator, persistence/tasks active query, scheduling effective lanes. Comparison 24 time-local claims.

New B71: source pending arithmetic 9−1+5=13 excludes linked recurrence parent, and detached parent adds +1. Current Rust board snapshot still counts linked parent by tasks.len; parent is alive/unarchived and linked recurrence_rule_id, so count includes it. Pre-existing B19/B33/B39/B40/B41/B42/B45 retained. Parent normalizes Backlog, children remain independently mutable; no basis to rewrite underlying M4 recurrence algorithms. Older parent menu VE008 superseded by VE017 newer source.

Progress **12/19 video-to-code** (242 claims), static screenshot mappings stay **39/39** (250 controls); original raw MP4 Pass-3 remains 19/19 independently. No source/test edits, CI or physical reruns. Native/user-visible acceptance NOT RUN, historic scoped PASS unchanged. Audit evidence write directly main; Codex owns implementation.

Next VE009 custom recurrence, then VE010 and other pending VE004/006/017–019.
