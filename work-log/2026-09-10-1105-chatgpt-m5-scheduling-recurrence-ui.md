# M5 Scheduling / Recurrence UI — validated completion

Date: 2026-09-10

Milestone: **5 — Design system and Main window product UI**

Roadmap item: **Scheduling UI and recurrence editor**

## Validated source baseline

The fully main-validated source/test SHA for this slice is:

`64b7cc8cc79b3991a7407c2838b60f923c63dc75`

Source tree:

`537390a65e7cec0343f01741db7c110bf38377a6`

This SHA is the expected-head guarded merge of PR #90. Markdown-only tracking commits after this log do not replace this source/test baseline.

## Delivered behavior

- Production List Board scheduling editor for individual real tasks; aggregate All Lists remains read-only.
- Authoritative Today / Later today / Tomorrow / Next week shortcut resolution in Rust.
- Custom date-only and local-date-time schedules preserve the established M4 date/time/timezone semantics and reject ambiguous/nonexistent DST local times.
- Expected-list and expected-schedule stale guards execute inside an immediate SQLite transaction.
- Production recurrence create/edit/remove UI over the existing M4 recurrence model.
- Existing-rule update/remove/Replace Existing use atomic expected-rule-version guards inside persistence transactions.
- Replace Existing rejects stale writes before child scan/detach/delete, preserving modified/history-bearing generated children and occurrence reservations.
- Generated recurrence occurrences cannot create nested recurrence rules.
- Authoritative recurrence parent/occurrence identity is projected to task cards so closed cards display Repeats / Occurrence state without renderer polling.
- Opening the schedule editor locks conflicting board mutations; schedule controls are excluded from drag initiation.
- Successful mutations remain persistence-first and refresh from the authoritative board snapshot; committed mutation plus failed refresh uses the existing safe blocked-mutation path.
- Dialog keyboard/focus behavior includes Escape, Cancel, close, Tab/Shift+Tab containment, opener focus restoration and explicit focus-visible styling.

## Correctness fixes found during review / CI

- Semantic review found a TOCTOU stale-write window in renderer-facing recurrence update/remove/Replace Existing; expected `updated_at` validation was moved into the same immediate persistence transaction as the mutation.
- Added a Rust regression proving stale Replace Existing fails before generated-child mutation.
- Existing frontend static guards that previously forbade any scheduling interaction were narrowed only enough to admit this ordered feature while retaining exclusions for unordered completion/delete interactions and requiring schedule-control drag isolation.
- Windows `rustfmt 1.9.0-stable` formatting output was applied exactly to the affected Rust files; diff review showed no semantic drift.
- PR CI #351 proved the complete Repository Preflight but exposed an asynchronous visual-capture race: the schedule fixture loaded through a Tauri mock and `requestAnimationFrame`, while Edge `--dump-dom` could capture before the fixture-ready marker. The capture harness now supplies a schedule-only virtual-time budget; synchronous legacy fixtures are unchanged.
- Captured scheduling geometry reflects the dialog content box inside its 1px border and is required to remain identical across light/dark captures.

## PR validation

PR #90 — `M5: add scheduling and recurrence editor`

Final exact validated PR head:

`6b90835b58a2c659b0a78584b20af7d7c614a965`

Windows CI #353:

- run: `34408571026`
- job: `102657360398`
- exact head: `6b90835b58a2c659b0a78584b20af7d7c614a965`
- conclusion: **SUCCESS**
- Repository Preflight: **PASS**
- Capture Visual Regression Fixtures: **PASS**
- Upload Visual Regression Artifact: **PASS**
- Build Tauri Release: **PASS**
- Upload Diagnostic Harness Artifact: **PASS**
- visual artifact: `10126546425` — `narro-m5-visual-regression`
- visual digest: `sha256:7543eebd260dfabec66c784e3b3ec3a79fbcd7927d1d96d5f14941ccb46dd97b`
- diagnostic artifact: `10126751008` — `narro-m1-runtime-harness-windows-x64`
- diagnostic digest: `sha256:f76696b40b91006e10beb055ca01d2b7be5c682965c83ec3631b1736b5852b31`

Final exact-head diff/comment/review reconciliation: **PASS**. No PR comments, submitted reviews, or inline review threads required resolution.

PR #90 was merged using an expected-head guard for `6b90835b58a2c659b0a78584b20af7d7c614a965`, producing main source SHA `64b7cc8cc79b3991a7407c2838b60f923c63dc75`.

## Resulting-main validation

Windows CI #354:

- run: `34451504139`
- job: `102788059565`
- event: `push`
- exact main source SHA: `64b7cc8cc79b3991a7407c2838b60f923c63dc75`
- conclusion: **SUCCESS**
- Repository Preflight: **PASS**
- Capture Visual Regression Fixtures: **PASS**
- Upload Visual Regression Artifact: **PASS**
- Build Tauri Release: **PASS**
- Upload Diagnostic Harness Artifact: **PASS**
- visual artifact: `10141970473` — `narro-m5-visual-regression`
- visual digest: `sha256:f91c5c14056fe8f72edb005cd4153201dc5799dd82abdaf45a487a6111577bfb`
- diagnostic artifact: `10142174154` — `narro-m1-runtime-harness-windows-x64`
- diagnostic digest: `sha256:255491c37bcb2fa7943a92d635d6ab82b6d0e7f05fe828cec3fbcde6fd2f178a`

## Roadmap reconciliation

After this main validation, `Scheduling UI and recurrence editor` is complete. Milestone 5 advances from **17/28** to **18/28** top-level items validated.

The next ordered M5 item is **Subtasks UI**.

## Invariants for continuation

- Renderer code must not recreate scheduling, DST, week-classification or recurrence materialization authority.
- Date-only schedules remain calendar dates and never round-trip through UTC.
- Stable task identity, recurrence detachment/reservation behavior and persistence-first success remain mandatory.
- Stale renderer writes must fail atomically before destructive recurrence child work.
- All Lists remains an aggregate read projection.
- Scheduling changes may not rewrite tracked Time Taken/timer/session state.
- Task-card title/action geometry and keyboard accessibility must not regress.
- Notes, subtasks, destructive list/task flows, search, Settings, Reports and Focus/Floating product UI were not added by this slice.
