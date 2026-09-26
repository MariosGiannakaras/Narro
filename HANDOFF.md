# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, newest immutable `work-log/`, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT VALIDATED SOURCE BASELINE

M5/Main and M6/Focus parity reconciliation are complete.

- M5 validated source merge: `4e315f551737d729f76e5f561dd8d7404717e157` from PR #156; PR CI #539 PASS; resulting-main CI #540 PASS.
- M6 PR #158 exact validated head: `c13e7f6cfbec3accde4841fd4fd61b68d0924ff6`.
- M6 Windows CI #545 / run `36243619057`: PASS.
- Required M6 visual artifact: `narro-m5-visual-regression`, artifact id `10906627762`, digest `sha256:4f58feb6526ad3624e07897f58377b620936e4316f60fb64c9de0f83e45d671a`.
- Required M6 diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, artifact id `10906727736`, digest `sha256:97dd86ad64f12ffa35da0ce5d0b10dadb1375df6f70178d0584751d234ec65ef`.
- M6 expected-head guarded squash merge: `b1ff5910abec82272c4ee57479a44eb62248a88f`.
- Resulting-main Windows CI #546 / run `36244258977`: PASS through the repository identical-tree validation gate.
- **Current validated source baseline:** `b1ff5910abec82272c4ee57479a44eb62248a88f`.

Markdown-only tracking commits after that source SHA do not replace the validated source baseline.

## CURRENT ORDERED WORK

The parity audit reconciliation remains complete through M6.

1. **M5 parity/reliability reconciliation (A1–A9, A19): COMPLETE.**
2. **M6 Focus reconciliation (A10–A17): COMPLETE.**
3. Current task is repository evidence/tracking setup only: create the durable Blitzit video/transcript upload inbox, analysis index, evidence rules, and roadmap tasks. Do not modify or validate Narro application/UI behavior as part of this slice.
4. On a later implementation instruction, resume **M7/A18/compositor work from repository state**, preserving existing validated M7 evidence and reconciling PR #155 against the newer `main`.
5. If user-supplied Focus/Floating Timer recordings are present before M7 closes, analyze the materially relevant subset first and route findings through `docs/BLITZIT_VIDEO_EVIDENCE.md`; do not ignore known video evidence merely because a post-M10 review also exists.
6. Continue M8 → M9 → M10 in the existing order only after prerequisites close.
7. After M10, the Final Comprehensive Review Stage must include the complete uploaded video/transcript corpus as well as screenshots/docs.

Roadmap completion remains **6/10 milestones**.

Video evidence paths:
- upload inbox: `reference/original-blitzit-videos/inbox/`;
- analysis index: `docs/BLITZIT_VIDEO_EVIDENCE.md`;
- corpus status: **NOT YET ANALYZED**.

For each remaining milestone M7–M10:
- require sufficient error/failure/loading/waiting/unavailable/recovery feedback and meaningful edge-case coverage appropriate to that milestone;
- include the milestone's total validated source diff as `+A/-B` lines in its completion report, measured from validated starting source SHA to final validated source SHA.

## M6 RECONCILIATION — COMPLETED CAPABILITIES

A10–A17 are implemented and validated:

- A10 ordinary Focus rows expose completion, Rocket/Make Live, reorder and overflow actions with fixed reserved geometry and keyboard/focus equivalents.
- A11 Rocket samples authoritative timer/session state and starts or switches through the timer service, preserving prior work instead of completing/skipping it.
- A12 individual-list Focus queue reorder reuses persisted stable task identities; aggregate All Lists reorder remains disabled.
- A13 ordinary-row Notes, scheduling, non-live completion and explicit permanent delete reuse validated Main/domain boundaries.
- A14 Focus `+ ADD TASK` persists first; All Lists requires an explicit owning-list choice.
- A15 Focus Home shows/recreates Main and hides Focus through native lifecycle without timer/session reset.
- A16 live-task title editing exists only inside Focus Panel Notes and reuses stale-safe persisted title mutation followed by authoritative refresh.
- A17 Time's Up exposes Extend through authoritative `timer_extend`.
- obsolete placeholder/static contracts were evolved into positive final invariants; Windows visual fixtures validate row/action geometry.

Do not reopen A10–A17 without new repository-backed evidence.

## AUDIT CLASSIFICATION

- A1–A9, A19: COMPLETE and validated in M5 reconciliation.
- A10–A17: COMPLETE and validated in M6 reconciliation.
- A18: M7 parity sub-gap; do not implement yet.
- B1: unresolved task-menu fidelity requirement; no implementation without stronger evidence or explicit decision.
- B2/B3: visual-fidelity questions; defer to the final parity/fidelity pass unless stronger evidence promotes them.
- B4: Done auto-start-next remains unresolved in source evidence; preserve current behavior.
- Audit section C intentional Narro deviations remain binding.

## OPEN M7 PR — PRESERVE DURING THIS PLANNING TASK

PR #155 `M7: cover focus transitions with a temporary native visual hold` remains open and draft.

- exact head: `2755d598ad2b13b974cda02760ebf44cd5e60b13`;
- Windows CI #532: PASS;
- physical compositor validation: NOT RUN;
- GitHub reports it non-mergeable against the newer `main`;
- do not merge, rebase, rewrite, validate, or contaminate it as part of this planning/tracking task;
- when M7 implementation is explicitly resumed later, reconstruct current repository state first and reconcile this preserved work carefully rather than replacing validated M7 history.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains local-only Windows software with Tauri 2 + React/TypeScript, SQLite, and authoritative Rust/domain state.
- `main` and reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust remains monitor/work-area/DPI/window-position authority.
- persistence-first mutation boundaries remain authoritative for list/task/subtask/note/scheduling/archive state.
- stable task identities, tracked Time Taken, date-only/timezone/recurrence semantics, and All Lists aggregate semantics remain intact.
- future-timed Today tasks remain ineligible until due.
- Focus entry and task switching cannot duplicate or silently reset live sessions.
- Break/Pause-Resume/Skip/Done/Extend/Make Live reuse authoritative timer/session transitions.
- Focus Home cannot reset timer/session state.
- live-task title editing remains confined to Notes.
- aggregate All Lists reorder remains disabled.
- Notes URLs require explicit activation.
- hover/focus actions retain reserved geometry, accessibility, and reduced-motion usability.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- diagnostics remain gated rather than shown in normal product surfaces.

## EXACT NEXT ACTION

Finish and merge only this evidence/tracking setup. No application source/UI change or application validation belongs to this slice.

After this setup is merged, a later explicit implementation instruction should reconstruct current `main`, inspect PR #155/current M7 evidence, check whether any files have been uploaded under `reference/original-blitzit-videos/inbox/`, and then:
- if relevant M7 recordings exist, analyze the relevant subset first and record timestamped findings;
- otherwise resume M7 from the repository-recorded checkpoint without restarting it.

The complete video/transcript corpus remains a mandatory evidence source for the post-M10 Final Comprehensive Review Stage.

## USER ACTION REQUIRED

The upload inbox is ready for future use. The user may place raw Blitzit videos and transcripts/captions in `reference/original-blitzit-videos/inbox/` at any time. Uploading the corpus is not a blocker for unrelated implementation work unless already-uploaded evidence materially affects the milestone being closed.
