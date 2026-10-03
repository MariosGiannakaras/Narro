# M7 CI #744 physical whole-app audit — behavioral and semantic findings

Date: 2026-09-30

## Recording identity

User-provided physical Windows recording:
- file: `2026-09-30 23-13-14.mp4`
- SHA-256: `eb3b862d58f69b1000f665d35dd52bf4d0703bfc1dda80f92c759de9c4809a1b`
- duration: approximately 36.15 s
- capture: 2560×1080, 60 fps

Intended executable under test:
- PR #192 `plan/m7-single-focus`
- exact CI #744 automated-green head `0ef808445b567a4a3194296ed1dccb5a6a58b03e`
- runtime harness artifact id `11109560929`
- artifact digest `sha256:6b848df39993108d8102cd75265692ce824ec3d592d569170285b60d67ee2fef`

## Critical validity limitation

The recording cannot be accepted as final Gate 7 evidence.

At approximately 28–30 s Main visibly reports both:
- `Ctrl+Shift+T: global shortcut 'Ctrl+Shift+T' is already registered and cannot be claimed by Narro`
- `Ctrl+Shift+P: global shortcut 'Ctrl+Shift+P' is already registered and cannot be claimed by Narro`

The repository has no single-instance enforcement in `src-tauri/Cargo.toml` / startup. The physical validation protocol already requires fully quitting the older Narro instance before launching an exact-build candidate.

Because both Narro-specific chords are simultaneously owned elsewhere, the strongest explanation is another Narro runtime still holding the shortcuts. An unrelated application owning both chords is possible, so duplicate Narro is not asserted as proven. However process ownership is not trustworthy enough to attribute the observed Focus Panel/Timer transitions to the newly launched CI #744 process. This invalidates a strict M7 physical PASS from this recording.

This is also a product reliability gap, not just a test-procedure issue: multiple Narro processes can currently coexist against the same local app-data/SQLite authority while each installs background runtime services and attempts shortcut ownership.

## Confirmed semantic regression in PR #192

Authoritative product evidence says:
- clicking `Blitzit now` opens the Focus Panel;
- the top eligible Today task becomes live;
- Floating Timer is a transition from Focus Panel/Blitz Mode.

PR #192 changes `BlitzEntryButton` from `presentFocusPanel()` to `presentFocusForBlitz()`. The native `present_focus_for_blitz` command contains a visible-host branch that only focuses the existing Focus surface, preserving an already-visible Timer presentation.

The replacement preflight test explicitly rewrites the old contract and now requires:
> “Blitz Focus entry must preserve an already-visible Timer/Panel presentation…”

That is contrary to `docs/SOURCE_AUDIT.md`, `docs/PRODUCT_SPEC.md`, `docs/BLITZIT_VIDEO_EVIDENCE.md`, and the original M6 Focus-entry contract. This is a **FIX_NOW semantic regression**. The single-host architecture must preserve product semantics rather than redefining them to simplify coordination.

## Additional semantic concern

The recording shows Panel↔Floating Timer switching while the timer projection is idle and there is no active Focus task. The compact surface shows `No active focus task`.

Current authoritative source wording defines Ctrl+Shift+T as alternating Panel/Floating **during Blitz Mode**, and describes Floating Timer as keeping the task + countdown visible. The previous implementation also permitted presentation toggling without checking live-task state, so this is not established as a PR #192 regression. It remains a parity/semantic concern requiring explicit resolution; it must not be silently treated as confirmed correct behavior.

## Whole-application observations

### Behaviors consistent with current product authority

- Home loads persisted list cards and zero-pending state without fabricating work.
- Empty Focus Panel shows `All Clear`, `No Today tasks left to focus on.`, zero Scheduled tasks, and existing Done rows. This matches the validated M6 empty-state contract.
- `Blitz now` with no eligible Today task returns `No eligible Today task is ready yet.` and does not implicitly start a task/session. This is consistent with Focus-entry policy and RISK-F007.
- Focus Home returns to Main without visible task/history loss in the recording.
- The compact surface is movable and remained visible above the ordinary desktop/WinRAR in the observed single-monitor sequence.
- In the sampled 30 fps transition strips no obvious full-white/blank Focus frame was observed. This is only idle-state visual evidence and cannot be promoted to Gate 7 because process identity and active-session continuity were not established.

### General app issues visible in the recording

1. Main first-paint/startup presentation exposes a blank/washed/dark intermediate window for roughly a few hundred milliseconds before the Home hierarchy settles. This is an app-start UX defect/quality issue, not established as an M7 source regression.
2. Global shortcut registration failures are injected as large persistent red cards into ordinary Home content. The requirement that conflicts be visible/retryable is correct, but the current placement is application-global diagnostic-like UI rather than contextual shortcut/settings feedback. This pre-exists PR #192 because `src/App.tsx` is not in the PR diff.
3. The recording contains no active task/session. Therefore it does not exercise or prove the most important M7 semantic invariant: same task/session identity and continuous authoritative timer accounting across Panel↔Timer transitions.
4. Expanded Timer actions/subtasks were not meaningfully exercised, so compact↔expanded Gate 7 continuity is not proven.
5. No 100%↔125% cross-monitor movement was captured, so Gate 12 remains entirely open.

## Branch/integration validity

PR #192 is currently diverged from main:
- PR base/merge-base family predates the current M9 source;
- compare against current main shows newer report/session source on main that is absent from CI #744;
- current PR metadata reports `mergeable_state: dirty`.

The physical CI #744 executable is therefore suitable only as isolated historical M7 candidate evidence. It is not the current whole-app integration build.

Before another physical acceptance run:
1. establish a validated current-main source checkpoint;
2. resolve the single-instance reliability gap;
3. correct the Blitz-entry semantic regression;
4. reconcile current main into PR #192;
5. rerun exact-head Windows CI;
6. issue a fresh artifact;
7. physically test that exact artifact with an active session plus the full Gate 7/Gate 12 matrix.

## Routing

- **M7-PHYS-04 / FIX_NOW:** prevent or safely redirect a second Narro instance; the exact candidate under test must own its shortcuts/background runtime unambiguously.
- **M7-SEM-01 / FIX_NOW:** restore `Blitz now -> Focus Panel` semantics while preserving one persistent `focusSurface`.
- **M7-SEM-02 / VALIDATION_OPEN:** resolve whether Panel↔Floating toggle is available when no active task/Blitz execution exists; do not infer parity from current implementation.
- **APP-UX-01 / ROUTED_M10:** eliminate visible Main first-paint blank/washed staging.
- **APP-UX-02 / ROUTED_M8/M10:** keep shortcut registration failures visible/retryable but move them into a contextually appropriate shortcut/settings/global-feedback treatment.

No M7 checklist item or roadmap counter advances from this recording.
