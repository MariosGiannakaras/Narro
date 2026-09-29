# M7 single Focus surface planning handoff — 2026-09-29

## Scope and starting state

This is a **documentation-only** decision for the next implementation chat. The checkout was on `fix/m7-visual-hold-physical` at documentation head `16be511`; the last experimental application-source commit was `4e4960b`. PR #191 is open and unmerged. The existing untracked generated icon files under `src-tauri/icons/` were left untouched. No application source or configuration was changed in this slice.

The user selected a single fixed-maximum-size Focus HWND/WebView with React Panel/Timer presentation switching and native visible-region clipping. They explicitly directed that implementation be completed first, with **no tests, builds, CI, app launches, recordings, or physical checks** until they separately authorize the testing phase. This takes precedence over the repository's normal interim-validation workflow for this implementation phase.

## Reason and evidence limit

- VE-003 shows a continuous visible Panel/Timer geometry transformation of about 0.27 s, but does not prove Blitzit's internal HWND count or rendering architecture.
- The earlier one-Focus-WebView implementation repeatedly hid/resized the HWND and physically failed Gate 7 with white/blank frames on CI-validated builds.
- PR #191's fixed-size, separately clipped Timer WebView removed the old white resize frames on its first exact physical comparison but left a 0.07–0.10 s Timer/Panel overlap on exact source `4e4960b`; its measured floating-only working set was about 95 MiB higher than the earlier single-WebView build. Gate 7 remains FAIL.
- Existing `src-tauri/src/timer_region.rs` demonstrates Win32 `SetWindowRgn` clipping of a fixed Timer HWND. Generalizing it to the single Focus HWND, including **width and height**, is technically plausible. It has not been implemented or physically validated. This alternative was absent from the 2026-09-28 assessment; that assessment remains immutable historical evidence, and this entry supersedes only its next-experiment recommendation.

## Files changed and exact continuation

`docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md` now provides the implementation sequence, native/React ownership, geometry and placement rules, error rollback, cleanup map, and validation boundary. `docs/ARCHITECTURE.md` and `docs/UI_UX_SPEC.md` state the proposed mechanism and evidence distinction. `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, `TODO.md`, `STATUS.md`, and `HANDOFF.md` route the open Gate 7 finding to this plan and direct the next chat to implement it before testing. No M7 acceptance checkbox was promoted to PASS and no M8 work began.

The next chat should implement the plan in this unmerged PR #191 checkout (or a child branch), use validated `main` as the behavioral baseline, and stop at code complete with all checks marked **NOT RUN by user direction**. It must wait for the user's explicit go-ahead before any test/CI/physical validation. Gate 7 and Gate 12 remain **OPEN/FAIL**.

## Validation for this planning slice

- Tests/build/CI/manual Windows validation: **NOT RUN — explicitly deferred by user**.
- Product claim: **implementation plan only**, no assertion of visual continuity or performance acceptance.
