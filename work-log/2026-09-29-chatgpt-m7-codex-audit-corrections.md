# 2026-09-29 — PR #192 audit corrections and main reconciliation

**Agent:** ChatGPT  
**Scope:** audit and corrective continuation of the active single-`focusSurface` implementation; no validation run

## Starting repository state

The active implementation is PR #192 on `plan/m7-single-focus`.

Verified starting refs:
- remote branch head: `567aa1777d391a5e4d2b72f5e72c407027744c87`;
- `main`: `9a4bfff39b42220dcaed103245aca455ec730995`;
- the branch was 147 commits ahead and 5 commits behind `main`;
- PR #192 was open.

The latest Windows CI for the old `567aa177...` head was run #666 / `36568312141`, conclusion **failure**. The failure occurred in Repository Preflight at `test:single-focus-architecture`. The exact failing assertion compared source-text positions for the presentation listener and authoritative snapshot, even though runtime initialization already installed the listener and invoked the initial snapshot from the listener promise continuation.

The user instruction that tests/builds/CI/app launches/physical checks remain deferred is still binding. No validation was started in this slice.

## Corrective source work

The active branch was corrected without reset, force update, branch replacement, WebView split, or session-authority changes.

### Completion success visible-region/accessibility correction

`FocusCompletionSuccess` previously used a fixed full-WebView overlay. The persistent host is 700 logical px high even when the native Timer region is only 300 px, so the success card could center outside the visible expanded-Timer region.

The correction:
- gives the coordinator an authoritative CSS visible-height variable for Panel (700), compact Timer (110), and expanded Timer (300);
- constrains the success overlay and scrollable card to that visible height;
- makes the committed Panel/Timer background inert and accessibility-hidden while the modal is open;
- gives the first usable success action autofocus and supports Escape close when no action is pending.

No timer/session completion semantics were changed.

### Same-WebView Panel↔Timer geometry continuity

The coordinator previously declared opacity/transform transitions while active and preparing presentations had identical geometry, so no real continuous geometry motion occurred.

The correction adds a finite 270 ms same-WebView geometry phase:
- Panel→compact Timer contracts the painted Panel to the 110 px target before the native region/placement transaction;
- Timer→Panel expands the native region first with the prepared Panel clipped to the current 110/300 px Timer height, then reveals it continuously;
- reduced-motion uses a 1 ms motion phase;
- normal switching still does not hide/show or resize the Focus WebView;
- transition helper hooks are rollback-safe if a post-native motion/renderer step fails.

### Architecture contract correction

`scripts/test-single-focus-architecture.mjs` now verifies the executable subscription sequence instead of comparing the lexical position of the snapshot helper definition. It also records contracts for the visible-region success overlay and finite geometry transition.

These tests were **edited but not run** in this slice.

### Stale board refresh guard found during the requested local-WIP concern review

The retired remote `src/focusPanelWindow.tsx` does not exist on the active architecture branch. The inaccessible local checkout mentioned by the prior Codex audit was not reset or modified.

Inspection of the replacement `FocusPanel` found a real equivalent risk: shared timer-projection board refreshes used `sameTarget(refreshTarget, target)` inside one closure, which could not protect against an old async response after the target or timer/session identity changed.

The replacement path now accepts a board refresh only while all captured authority still matches:
- current target key;
- timer projection revision;
- live task id;
- open session id;
- effect lifetime.

The Focus Panel static contract now locks those guards. Again, the contract was not run.

## Reconciliation with current main

The main-only branding changes were not documentation-only for the M7 candidate:
- branch `package.json` still runs `tauri icon assets/branding/narro-logo-master.png` during `prebuild`;
- the old branch blob for that PNG was `e62b817a7bad43d7e8605d99d2397216842f48e8`;
- current main blob is `6761e84e4bf4d4088fd162c74dd607e7c089a0ea`.

All five current-main commits after the previous branch merge base were merged into the active branch without force/reset. The merge commit is:
- `7d6244dbcb55b5decc261faf20d20415554bd59d`;
- parents include the active M7 head and main `9a4bfff39b42220dcaed103245aca455ec730995`;
- commit message contains `[skip ci]` to honor the validation deferral.

After the remaining stale-refresh correction, the exact active branch/PR source head is:

`dc9975147ebf92d462e4314d3665465bc82c6381`

At this checkpoint Git compare reports:
- ahead of main: 156 commits;
- behind main: 0;
- merge base: `9a4bfff39b42220dcaed103245aca455ec730995`.

No workflow run exists for the current head because all corrective source commits deliberately use `[skip ci]`.

## Validation status

Nothing in this work log is a Windows CI, build, runtime, visual, or physical PASS.

Still open:
- authoritative Windows Repository Preflight;
- frontend/Rust/test/build validation;
- release build/artifacts;
- exact-head PR validation;
- Gate 7 physical continuity;
- Gate 12 mixed-DPI physical validation;
- affected M1/M6/M7/M8 reopened items.

The most recent actual Windows CI evidence remains the old-head run #666 failure described above. The corrected contract has not yet been executed.

## Continuation

The repository is ready for further **implementation** on the existing PR #192 branch from `dc997514...`, subject to reading current `main` tracking truth first. Do not resurrect `focusPanelWindow.tsx` or a second Timer WebView.

Before validation is authorized, continue only evidence-backed remaining implementation from `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md`. When validation is explicitly authorized, validate the exact then-current PR head and the current build-affecting branding input before any completion claim. Gate 7 and Gate 12 remain open until physical evidence exists.
