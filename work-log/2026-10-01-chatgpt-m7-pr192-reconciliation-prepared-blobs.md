# M7 #192 reconciliation prepared blobs

Date: 2026-10-01

## Purpose

While PR #206 exact-head Windows CI #784 is running, the next #192 reconciliation was prepared without moving or modifying `plan/m7-single-focus`.

The existing #192 branch remains at:
`0ef808445b567a4a3194296ed1dccb5a6a58b03e`

No branch/ref was changed by this preparation. The objects below are unreferenced Git blobs until a later validated-main reconciliation commit consumes them.

## Prepared blobs

- Combined `package.json`:
  `7156a10453c3e428f5ff786670ad6943227903e1`
  - preserves #192 single-focus/runtime harness tests;
  - removes obsolete split-window opacity/visual-hold test scripts;
  - preserves M9 `test:ui-reports-api`;
  - preserves #206 `test:single-instance-runtime`;
  - restores strict `cargo check ... --locked`.

- Combined `scripts/capture-visual-fixtures.ps1`:
  `3df3ff28cba4c21e0995c3b54d6c74623627f4b6`
  - preserves #192 task-schedule 10000ms fixture budget;
  - preserves validated main four-attempt ready-marker retry;
  - preserves linear 250ms retry backoff.

- Combined `src-tauri/Cargo.toml`:
  `cca8452289ec882b4a2b67c435d4f8be15bb6e8d`
  - preserves #192 Tauri `~2.11.5` pin;
  - adds #206 exact `tauri-plugin-single-instance = "=2.4.5"`.

- Combined `src-tauri/src/lib.rs`:
  `180cd13a79e490729f10a70067006e8eed280735`
  - starts from #192 single-host native implementation;
  - preserves M9 `report_commands`, `reporting`, `session_reporting` modules;
  - preserves M9 report-history/manual-session handlers;
  - registers single-instance plugin before all other Tauri plugins/setup authority;
  - implements B5 visible-host target-Panel request through `focus-panel-requested`;
  - keeps hidden-host native Panel preparation.

- B5/B6 `src/FocusSurfaceCoordinator.tsx`:
  `74211a295838a7db3f7d6349e6ecc85a4bf2a84d`
  - handles `focus-panel-requested`;
  - defers Panel requests through hydration/transition/resize boundaries;
  - gives deferred Blitz Panel target priority before deferred global toggle;
  - defensively refuses a known-idle/no-task toggle projection;
  - keeps timer projection ref current.

- B6 `src-tauri/src/shortcuts/mod.rs`:
  `d968fb7a22cc030adcd07f5e2bc8251c6e6c8c8e`
  - reads managed `TimerService::snapshot()` before showing/emitting;
  - reports snapshot failure through existing Focus-toggle diagnostic channel;
  - no-ops unless non-Idle + task binding;
  - explicit Rust regression covers Running, Paused, Break, TimeUp, OvertimeRunning, OvertimePaused and invalid Idle/missing-task cases.

- Updated B6 static regression:
  `scripts/test-ui-focus-toggle-shortcut.mjs`
  blob `c6b1e72ee0c587210877898df6bbd9068cd77d9b`.

- Updated B5 Focus-entry static regression:
  `scripts/test-ui-focus-entry.mjs`
  blob `8feb814065d57eaf472d31ea422cf3fad4cb5c4c`.

A partial B5-only lib blob also exists:
`b87e7356e40e71dd1eb3a46cd44dca00c3c2d6bd`,
but the combined lib blob above supersedes it for reconciliation.

## Intended reconciliation

After #206 passes exact-head CI, is guarded-merged, and resulting-main Windows CI passes:

1. use the latest validated/current main tree as the base tree;
2. reapply all #192 file deltas from old head `0ef80844...`;
3. replace the semantic-overlap/B5/B6 paths with the prepared blobs above;
4. retain the validated main `src-tauri/Cargo.lock` (the #192 Tauri pin already resolves to the same locked Tauri 2.11.5);
5. create a normal merge commit whose first parent is old #192 head and second parent is the validated/current main;
6. fast-forward `plan/m7-single-focus` to that merge commit — no force reset;
7. exact-head Windows CI must pass before any physical artifact is accepted.

The remaining #192 changed-file blobs can be copied directly from tree
`01eae38e7634152f8d387165d6f04cb8be1600ba`,
except removed files, which must remain deleted.

No milestone/item counter advances from this preparation.
