# 2026-10-17 — Focus control-tracker reconciliation (read-only source + frozen native evidence)

**User priority:** parallel progress on existing Narro evidence and confirmed corrections, with bounded X/Y; no new OBS capture, no user-paused PA tests and no opt-in M11/M12.

## Why this work was necessary

The active M6 section of `TODO.md` contained four *historical pre-fix descriptions* still written as if they represented the current source. Independently rechecked actual `main` code plus source-facing regression tests; **updated these four checklist paragraphs in place** without marking actual Blitzit/source motion parity or milestone PASS.

| Finding | Verified present in current code | Native/evidence limit |
| --- | --- | --- |
| A3/SS-H04 Focus list selector | `FocusPanel.tsx` embeds `BoardListPicker variant="focus"`; `BoardListPicker.tsx` includes accessible anchored listbox, colored/icon list badges and stacked All Lists badges; `scripts/test-ui-focus-panel.mjs` checks Focus picker elements and keyboard contract. | Exact reference-source styling, keyboard dismissal and actual physical comparable Focus popup acceptance OPEN. |
| A18/B49 Focus title/action rail | `FocusLiveActions.tsx` provides five icon actions; `focusPanel.css` swaps live heading for action rail on hover/focus, with targeted label pill. D1 frozen Windows stills show Break/Notes/Resume/Skip/Done hovered controls in actual app. | Motion/time/complete layout and M7 host-region behavior OPEN; no duplicate B49 implementation. |
| A14/B36 persisted Break in Done | `FocusPanel.tsx` maps bounded typed `useFocusDoneBreaks` rows by persisted session ID and preserves task-based progress denominator; `scripts/test-ui-focus-panel.mjs` checks owner, bounded SQL and stale-read guards. D3 frozen Focus screenshot and owned-state snapshots show distinct Break history between work segments. | Exact current Blitzit source parity and motion OPEN; no claim of physical Reports parity. |
| V01/B63 success in live card | `FocusPanel.tsx` renders inline success under live card while retaining Focus queue; `FocusCompletionSuccess.tsx` supports inline and Next Task/Take a Break/Close; same Focus test checks inline marker. D2 native screenshots show enabled Success screen. | Actual GIF/audio/animation timing and full source version parity OPEN. |

**Action:** `TODO.md` paragraphs A3, A18/B49, A14/B36, V01/B63 now state `CURRENT CODE INTEGRATED` / observed as appropriate and retain outstanding source/native gates. This is *evidence reconciliation*, not new source/config/test code, and does not alter M1–M4 validated 4/10, M5 OPEN, M6 OPEN, M7 physical restrictions, or optional M11/M12 status.

## Independent M8 visual candidate discovered but not started

Already accepted source evidence `current-v2.6.69-preferences-general.png` and native `work-log/evidence/pa356-keyboard-review-20261015/lg-dark-save.png` visibly differ: reference Preferences is a single scrollable continuous surface with section separators, whereas Narro has separate rounded elevated group cards and extra category eyebrows. Current `src/themeSettingsPanel.css` applies raised section fill/border/radius/shadow, and `ThemeSettingsPanel.tsx` / `PreferenceSettingsSections.tsx` include decorative kicker paragraphs. This discrepancy is already tracked as **B34 M8 FIX_NOW** in `TODO.md`; no duplicate new finding.

**No B34 code write/PR was performed:** the GitHub branch-create operation was blocked by tool safety checks. Checked branch search afterward; the proposed `fix/m8-b34-preferences-continuous-layout` did not exist. Do not claim a branch, patch, tests or CI for B34. This UI correction remains separately actionable by an authorized coding agent after respecting existing ownership and validating the screenshot-matched CSS delta with tests and CI.

## Current integration blocker and safe next step

PR365 (B23 Home rows) merged `a76050afe69d24585611b163c667974b0f4b545f` after exact PR-head run39016905982 3/3 SUCCESS. Main changed blob SHAs match validated PR head. GitHub connector workflow lookup is PR-only; direct public GitHub actions API via web is inaccessible. Thus **resulting-main push CI remains NOT VERIFIED**, not PASS. Review `.github/workflows/ci.yml` indicates push/main runs and an identical-tree shortcut based on exact PR success, but workflow **configuration does not prove the execution result**. Obtain actual run ID/conclusion when tooling permits; do not initiate duplicate build only because status is inaccessible.

**User's bounded main work-package counter stays 5/6:** original evidence intake, scoped still/state comparison and B23 code/PR work complete; resulting-main CI + complete final closeout still blocked. Additional 4/4 current-source tracker reconciliations are independently completed but do not inflate the 5/6 numerator. Other source-motion-only branches remain OPEN/NOT RUN. No new OBS, app launch or AppData access was undertaken.
