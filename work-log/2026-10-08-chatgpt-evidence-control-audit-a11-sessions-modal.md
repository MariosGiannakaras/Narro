# A11 — Sessions task detail modal access and lifecycle analysis

Date: 2026-10-08 (Europe/Athens). Starting GitHub main at prior A10 commit `8e8afd7d190a6a8477852209fea8255bc6d16182`. User assigned independent audit only; Codex handles executable corrections and native Windows checks.

## Grounding

Canonical SS-C22 v2.6.69 directly shows a task session detail overlay with inline end-time edit and green confirm. VE-015 ~01:53–02:04 shows the task session detail dialog and + Add Session action. **Neither source establishes Escape, Tab containment, opener focus or nested-dialog semantics**; do not claim Blitzit implements them.

Current `src/ReportsSessionsView.tsx::ReportTaskSessionsDialog` renders `role=dialog aria-modal=true` and a close X, but no dialog ref, focus management, Escape key handler, Tab/Shift+Tab loop or focus restoration. In the *same* component file, `ReportAddSessionDialog` implements those via dialog/search-input/opener refs, useEffect focus/cleanup and `handleAddSessionKeyDown`. Repo Finding29 prior scoped PASS covers this Add Session modal, not task detail.

In `src/ReportsSessions.tsx`, `ReportTaskSessionsDialog` is rendered while `detailView` exists and `ReportAddSessionDialog` when `addOpen`. The detail onAddSession route calls `openAddSession(taskId)`, which only initializes draft and sets `addOpen=true`, without clearing `detailTaskId` or otherwise dismissing/suspending detail. Thus both can be mounted with `aria-modal=true` simultaneously. Existing CSS gives both the same fixed backdrop z-index. This is a **code-proven modal ownership / potential a11y and visibility issue**; actual keyboard/browser/native runtime experience remains NOT RUN, not asserted FAIL.

## Disposition and safeguards

**B32 / M9 NARRO_ACCESSIBILITY_LIFECYCLE_OPEN / RENDERED_TEST_REQUIRED.** Decide and document correct one-active-dialog lifecycle at detail→Add Session transfer; preserve any intentional return-to-detail behavior, never leave two actively semantically modal dialogs with ambiguous focus/keyboard ownership. Add semantic rendered tests for detail open initial focus, Tab/Shift+Tab/Escape and opener restoration; detail→Add Session→Escape/cancel/commit, return ownership, disabled/pending edit; prevent accidental keyboard activation of background page. Reuse existing accessible modal patterns and do not reimplement the already validated Add Session behavior unless necessary; avoid invalidating Finding29 scoped PASS without corresponding tests.

This is **a Narro local accessibility/reliability requirement supported by current code**, not a claim of missing observed Blitzit Escape behavior. Source detail screenshot stays SOURCE_PARITY_OPEN independently.

Documentation-only change to TODO, crosswalk, UI_UX_SPEC and 46/19 routing index; no TS/Rust code/config/test changes and no CI/native checks (NOT RUN), no roadmap/slice counter advanced. Do not overwrite current CI1046 physical closure, HANDOFF or concurrent Codex work. Future continuation: inspect unreviewed per-control states and test the B30 >8 dates risk when source implementation starts; raw video only if interaction/motion-source ambiguity warrants it.
