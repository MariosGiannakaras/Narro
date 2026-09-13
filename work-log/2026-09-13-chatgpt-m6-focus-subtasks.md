# M6 Focus subtasks/progress — immutable implementation log

Date: 2026-09-13
Agent: ChatGPT
Milestone: 6 — Blitz Mode / Focus Panel
Slice: item 7/16 — Implement subtasks/progress in focus mode

## Outcome

Completed and fully Windows-validated the ordered Focus live-task subtask/progress slice. The Focus live card now projects the same persisted subtask identities/order/completion state used by Main/List Board, with a compact progress surface and expanded persisted row operations. No Focus-only persistence model was introduced.

## Validated source identity

Resulting-main source/test SHA: `cadc4eab7a04c2b4defccf085f7658d031ff8328`

Source tree: `be9c421f2e769ff2842c103b92203680609ef32a`

Markdown-only tracking descendants do not replace this validated source/test baseline.

## Implementation scope

- Added `src/FocusLiveSubtasks.tsx` as Focus presentation/orchestration around the already validated list-board subtask APIs.
- The live card exposes a subtask progress ring, authoritative `n/m Subtasks` count, Add control, and expand/collapse control.
- Expansion loads `getListBoardTaskSubtasks(taskId, listId)` and reuses `TaskSubtasks` for persisted create, title edit, complete/reopen, reorder and delete.
- Existing expected-title, expected-completion, expected-update-time and expected-order guards remain the mutation concurrency boundary.
- After a saved mutation, Focus refreshes both the task-scoped subtask snapshot and current board projection, then reconciles completed/total counts before accepting the refreshed local projection.
- If the mutation committed but the secondary authoritative refresh/reconciliation fails, Focus reports saved-but-not-refreshed, blocks unsafe repeat mutation attempts and requires reopening/refreshed Focus. The committed mutation is not misreported as failed.
- The live card retains the parent `data-task-id`, so the validated `TaskSubtasks` parent identity guard remains effective.
- `FocusLiveActions` only composes the new subtask surface; validated Break, Notes, Pause/Resume, Skip and Done behavior is unchanged.
- Focus-specific CSS provides stable compact progress/expanded-row geometry without importing the full Main-window board stylesheet into the Focus bundle.
- The older passive live-meta subtask label is hidden so the new progress surface is the single visible live-task subtask count.
- React StrictMode mounted-guard handling was corrected before PR validation so development effect replay cannot suppress later authoritative refresh state updates.

## Coverage

- `scripts/test-ui-focus-panel.mjs` locks authoritative reads/mutations, post-commit refresh reconciliation, unsafe-retry blocking, identity-guard reuse, progress/add/toggle markers, unchanged item-6 action ordering, no renderer-owned timer authority and no implicit note-URL opening.
- `scripts/validate-focus-panel-captures.mjs` validates Focus subtask DOM/accessibility/geometry in Windows light/dark captures.
- `src/focusPanelVisualFixture.tsx` measures the collapsed subtask surface/ring in the deterministic production-component fixture.
- A pre-PR syntax-only TypeScript 5.8.3 transpilation of `FocusLiveSubtasks.tsx` produced 0 diagnostics; full local Node/Rust/Tauri repository validation was not available in the connector-oriented environment, so Windows GitHub Actions remained authoritative.

## PR #107 exact-head validation

Branch: `m6-focus-subtasks`

Exact PR head: `00b1d7290cf8ea09fe3b5b986b203bd44406d720`

Exact head tree: `be9c421f2e769ff2842c103b92203680609ef32a`

Windows PR CI #410:

- run `34754810013`;
- job `103717290439`;
- conclusion: **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression/capture: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10317231156`, digest `sha256:ee3b07a3853fa04bec91445d0579f1f9786bc21dc92629de25d733be93fe81e3`;
- diagnostic/runtime-harness artifact `10317120955`, digest `sha256:5a0ba23305c1d34b973c81cdd834a50c594d87b6f8076860be64708456b35a01`.

Final exact-head review confirmed the head was unchanged and mergeable, the changed-file scope remained `HANDOFF.md`, Focus production/subtask files and Focus static/visual tests only, and there were no PR comments, submitted reviews or unresolved review threads.

## Merge and resulting-main validation

PR #107 was squash-merged with expected-head guard `00b1d7290cf8ea09fe3b5b986b203bd44406d720`.

Resulting main source/test SHA: `cadc4eab7a04c2b4defccf085f7658d031ff8328`

Source tree: `be9c421f2e769ff2842c103b92203680609ef32a`

Windows resulting-main CI #411:

- run `34756977752`;
- job `103722921099`;
- exact main SHA `cadc4eab7a04c2b4defccf085f7658d031ff8328`;
- conclusion: **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression/capture: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10317784445`, digest `sha256:240f3330e0c6ee0935d25d67abdab90d7852d0ea1c194ea9c90cf50788dcb0e9`;
- diagnostic/runtime-harness artifact `10318046699`, digest `sha256:f5195bda2a5d8902e916dffdda79b074d909184be5cb564f0762812d38a67bea`.

## Preserved invariants / exclusions

- Stable task/subtask identities, ordering and completion state remain persistence-first and authoritative outside renderer memory.
- Focus progress is derived from authoritative task/subtask state, never from timer sampling cadence.
- Break, Notes, Pause/Resume, Skip and Done behavior validated in item 6 is unchanged.
- Tracked Time Taken, work/break separation, recovery, sleep policy, `Time's Up`/overtime and Pomodoro semantics remain M3 authority.
- Future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard actions only.
- No Rust/Tauri source, timer engine/session semantics, database schema/migration, dependency/lockfile, scheduling policy, Main-window behavior, Floating Timer behavior, monitor/display policy, shortcuts/preferences, Reports or release behavior changed in this slice.

## Progress after reconciliation

General roadmap: **5/10 milestones complete**.

Milestone 6: **7/16 items validated**.

Item-7 implementation slice: **5/5 checkpoints complete**.

## Exact continuation

The next ordered Milestone 6 item is item 8: `Permit EST/Time Taken editing only while paused.`

A zero-context agent should reconstruct current `main`, confirm no unfinished implementation PR/CI, then inspect the validated M3 paused metric-edit authority (`setPausedTimerEstimate` / `setPausedTimerTimeTaken`), M5 task metric editor behavior and current Focus live card. Implement only paused Focus EST/Time Taken editing through the existing authoritative paused mutation boundaries; do not absorb monitor placement/display hotplug or later Focus/Floating/Settings work.