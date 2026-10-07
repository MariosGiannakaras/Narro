# 2026-10-07 — M6 PR244 integrated / CI1014 active

## Scope

Durable integration checkpoint for P3-M6-06 Focus Home pause provenance. This closes implementation, exact-head automated validation and guarded integration checkpoints only. Direct physical/canonical source acceptance remains OPEN.

## Exact validated chain

- PR244: `Fix M6 Focus Home pause provenance parity`
- Branch: `fix/m6-focus-home-pause-origin`
- Exact validated head: `ae69acd71ef15d91c87a3d935e4df40479a1ae2b`
- Exact-head Windows CI1013 / run `37594066892`: **PASS** through validation gate, frontend/contracts, Rustfmt, Rust check, Clippy, Rust tests, performance, Windows visual fixtures, Tauri release, packaged Focus runtime, physical-validation build, M7 automatic validation preparation/logging and M1 diagnostic storage isolation.
- Expected-head guarded squash merge: `8c9a1a181c51e9119ef2e04a5de742027ed845ea`
- Changed source/test files: 9.
- Post-merge source/test blob identity: **9/9 byte-identical** between exact green PR head and merge commit.
- Resulting-main CI1014 / run `37602323133`: **ACTIVE** at this checkpoint.

## Integrated behavior

The source-confirmed Home lifecycle now uses bounded pause provenance rather than generic Pause/Resume:

- Home can create a transient one-shot pause lease only from authoritative running/overtime-running work with task + open-session identity.
- The lease records exact committed timer revision, task ID and session ID.
- Focus applies the authoritative paused projection and waits the existing two-frame presented-frame barrier before native Home exit, giving the PAUSED state a real paint opportunity.
- If Home exit fails after creating the lease, rollback uses only the same guarded lease.
- `start_blitz` remains unchanged and resume-free, so re-entry first reveals the paused state.
- Visible and hidden Blitz entry paths use the existing Blitz-only Panel request after Focus reveal.
- The persistent coordinator settles Panel, waits the presented-frame barrier, then invokes guarded Home resume.
- Resume consumes the lease once and commits only if authoritative revision/task/session/state still exactly match.
- Any intervening user mutation, task/session replacement, or process restart prevents auto-resume.
- No generic Home Pause/Resume, resume-all-paused behavior, persisted pause-origin state, second timer authority, polling loop or timeout-based paint delay was introduced.

## Validation history

- CI1011 was superseded/cancelled when the branch head moved.
- CI1012 passed validation/fast gates and production Rust check, then failed only in Clippy's lib-test compile because the new unit test referenced the private re-export `crate::domain::timer_events::TimerRuntimeSnapshot`.
- The test-only path was corrected to public `crate::timer::runtime::TimerRuntimeSnapshot`.
- CI1013 then passed the full exact-head workflow.

## Validation limits

Still OPEN and not implied by CI:
- direct physical observation of visible `PAUSED` before Home exit;
- direct physical/canonical observation of paused transient then running on Blitz re-entry;
- canonical Blitzit source comparison for the integrated current candidate;
- P3-M6-01 direct Board→Focus source-motion comparison.

## Progress

`3/10M || 3/3 | 17/18`

Whole M6 remains open because the affected physical/canonical acceptance gates remain unresolved.

## Exact next action

1. Inspect resulting-main CI1014/run `37602323133`; record PASS durably or fix only attributable failures.
2. If CI1014 succeeds, identify and continue the highest-priority repository-recorded implementation line that is unblocked by the remaining physical/manual M6 gates.
3. Do not convert Narro CI/runtime fixtures into canonical source/physical PASS.
