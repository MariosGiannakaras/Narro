# VE-F003 task Change List + Duplicate — validated

Date: 2026-09-27  
Agent: ChatGPT  
Scope: narrow post-M5 evidence-backed correction before resuming M8 Preferences

## Source evidence

Current direct VE-005 video evidence confirms the task overflow hierarchy:
1. Schedule / Update Schedule
2. Change List
3. Duplicate
4. Delete

Official Help Center evidence separately confirms permanent task deletion retains an explicit confirmation step in Narro.

## Starting state

- latest main/tracking base at branch creation: `0d0dfd4fc80418dd39a9b0455f868ceb13c0c7c8`;
- prior validated application source baseline: `699b6ac46bcc6ebcabbcded21f929a7b32018b42`;
- M8: 5/8 top-level items validated;
- roadmap: 6/10 milestones complete;
- open M8 PR #170 existed at historical head `a22b552623195e40d7f88cf0e23a9b05a1eb0792` and was intentionally left untouched until this ordered correction validated.

## Implemented

- Kept the validated fixed three-position task action rail; move up/down remain stationary and the third reserved slot now hosts the anchored overflow trigger.
- Added the source-confirmed menu order `Schedule / Update Schedule → Change List → Duplicate → Delete`; Delete uses destructive treatment.
- Added an accessible Change List chooser over current active-list options.
- Change List:
  - validates stable task/list identity;
  - moves the same TaskId through the existing persistence move primitive;
  - preserves the authoritative persisted manual lane rather than inferring it from the projected board lane;
  - preserves schedule metadata, recurrence linkage and closed-session history;
  - publishes UI only after persistence succeeds.
- Duplicate:
  - reuses the validated M2 duplicate primitive;
  - creates exactly one independent TaskId;
  - does not copy manual-time adjustment, session history, recurrence rule/parent identity, completion or archive state.
- Added command and transactional persistence guards against open/live sessions for both actual list moves and duplication, preventing stale/concurrent UI paths from silently mutating a live task.
- Preserved All Lists as an identity projection, explicit permanent-delete confirmation, committed-refresh failure blocking and existing scheduling/session boundaries.
- Added/updated static UI contracts, Rust regressions and visual geometry markers.

## Reliability correction during review

The first implementation passed a projected lane token into Change List as a stale guard. That is invalid for scheduled tasks because the board's effective lane can differ from the persisted `manual_lane`. Before final validation, that argument was removed. Change List now validates the owning list identity and preserves the authoritative persisted lane.

The live-session pre-check was also hardened inside the transactional persistence primitives to close the race between a command-level guard and the actual write.

## CI history

Initial exact head `077ca12c9c1c498d5f1a04121cc099475109f6ee`:
- Windows CI #601 / run `36349125592`: FAIL at Repository Preflight only because `cargo fmt --check` requested formatting.
- Frontend build had passed before the fmt failure.
- No behavioral/test failure was observed.
- The exact rustfmt output was applied forward; no behavior was changed by that correction.

Final exact PR head:
- `e80034f481bc8d9368bb670cadfce2cdcbe61797`
- Windows CI #602 / run `36349274182`: **SUCCESS**
- Repository Preflight: PASS
- Windows visual regression fixtures: PASS
- Tauri Release: PASS
- visual artifact `narro-m5-visual-regression`, id `10941762475`, digest `sha256:cad2d6f2b0210c1fb2d3213e564d8f0193a8b71ee8488331027fe5206dba85d5`
- diagnostic artifact `narro-m1-runtime-harness-windows-x64`, id `10941867097`, digest `sha256:0f0daac870f0f5d13f88be0f970b341cfcc859c92bc07e5a599d6a2f88391979`

## Merge and resulting-main validation

- PR #177
- expected-head guarded squash merge: `f4c80d04b25f58637c0ef04c03b60dcd52fcff57`
- resulting-main Windows CI #603 / run `36349966245`: **SUCCESS**
- the repository identical-tree validation gate proved the merged tree equals the exact validated PR-head tree, so the heavy duplicate main job was correctly skipped.

Source-slice diff reported by GitHub: **+879/-28** across 14 files.

## Result

- VE-F003: COMPLETE / VALIDATED.
- New validated application source baseline: `f4c80d04b25f58637c0ef04c03b60dcd52fcff57`.
- Roadmap remains 6/10.
- M8 remains 5/8.
- M7 deferred physical/manual matrix remains OPEN.

## Exact continuation

Resume existing PR #170 rather than creating a replacement. Reconcile its historical head `a22b552623195e40d7f88cf0e23a9b05a1eb0792` onto validated main `f4c80d04b25f58637c0ef04c03b60dcd52fcff57`, preserving VE-F003 overlaps in `src/ListBoard.tsx`, `src/TaskCard.tsx`, and `src-tauri/src/lib.rs`. Its old CI #586 is historical and must not authorize merge after reconciliation. Continue M8 with VE-F001, VE-F002 and VE-F008, then Windows-locale date/time closure.
