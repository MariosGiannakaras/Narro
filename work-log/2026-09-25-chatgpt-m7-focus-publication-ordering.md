# M7 Focus publication ordering correction — 2026-09-25

## Scope

This immutable entry records the corrective M7 item-7 source slice for the reproduced Focus Panel ↔ Floating Timer blank/staging interval. The validated source baseline is PR #145 / resulting main `c875b4894e90cc75c04c9ff9508ef1dc1a176ad5`. Physical Windows compositor re-validation was **not run in this slice** and remains mandatory.

## Reproduced failure and diagnosis

CI #507 physical evidence had two continuous 20 fps Panel→Timer captures with blank/pale staging frames before Timer content rendered. With actual Windows animations Off, both Panel→Timer and Timer→Panel still showed blank frames.

The source ordering explained the failure: after the outgoing root completed its finite exit and a presented-frame barrier, the renderer called native `present_floating_timer` / `present_focus_panel`. Those native presenters hid/reconfigured/showed the shared `focusSurface`; only after native success did React publish `setMode(targetMode)`. Therefore the native host could become visible before the target React hierarchy existed.

## Source correction

PR #145 introduced a coherent transition ownership boundary:
- `src/focusModeTransition.ts` coordinates prepare target → publish target → presented-frame barrier → reveal target;
- `src/focus.tsx` uses `flushSync` to publish the target mode while the native host is still hidden;
- `src/FocusSurfaceTransition.tsx` supports a prepainted target root so the first revealed target frame is not an empty entrance state;
- `src/focusSurfaceModeApi.ts` exposes split `prepare_floating_timer`, `reveal_floating_timer`, `prepare_focus_panel`, and `reveal_focus_panel` calls while retaining the legacy presenters for diagnostic/non-orchestrated paths;
- Rust splits hidden preparation from reveal and records native presentation authority only after reveal;
- Timer prepare performs hidden geometry/placement without publishing Timer authority;
- Panel prepare reuses target-edge placement while hidden;
- Panel prepare failure now restores previous size, position, topmost, skip-taskbar and visibility, returning `FOCUS_SURFACE_MODE_RECOVERY_FAILED` if rollback itself fails;
- coordinator recovery returns the previous renderer/native presentation after target frame/reveal/cancellation failure.

No fixed timeout/polling workaround, second webview, renderer timer/session authority, or high-frequency geometry loop was added.

## Executable regression coverage

New `scripts/test-focus-mode-transition.mjs` covers:
1. success ordering;
2. target prepare failure;
3. presented-frame failure and previous-mode recovery;
4. target reveal failure and recovery;
5. cancellation after prepare and recovery;
6. explicit recovery failure preserving the original transition failure.

Existing M7 static contracts were updated to require hidden prepare/reveal boundaries, prepainted target publication, full Panel rollback, and the coordinated shortcut/compact transition path. The executable coordinator suite is part of `preflight:frontend`.

## CI history

PR branch final head: `f901fa907b550e921daf32123ec84a49aebb7006`; tree `67ced4d48545772a48b5452f686f3b15127ce5a2`.

- Windows CI #510: failed in the new static integration contract because a literal LF assertion was brittle against Windows CRLF checkout. Production behavior was not implicated; the test was made newline-agnostic.
- Windows CI #511: failed in the same updated static contract because the assertion still expected an earlier source spelling after the stronger Panel `recovery_snapshot` implementation. The test was aligned to the actual invariant.
- Windows CI #512: frontend tests/build passed; failure was only `cargo fmt --check` requesting one formatting-line collapse. The formatting-only correction was applied.
- Windows CI #513 / run `36173387766`: **PASS** on exact PR head `f901fa907b550e921daf32123ec84a49aebb7006`. Repository Preflight, Windows visual regression, Tauri Release and required artifact uploads all succeeded.
  - runtime artifact `10881596977`, digest `sha256:3b5ef648af09bb7feb8924a265660038339fbddfdc02ef30810bc69aa9522b0f`;
  - visual artifact `10880369572`, digest `sha256:71ee5ef8b45a09e2cdac1a559deaec6cff4f5ccbc6735bae422515cabc8f8635`.
- PR #145 was squash-merged with expected-head guard at `f901fa907b550e921daf32123ec84a49aebb7006`, producing main source commit `c875b4894e90cc75c04c9ff9508ef1dc1a176ad5`.
- The resulting main tree is `67ced4d48545772a48b5452f686f3b15127ce5a2`, byte-identical to the validated PR-head tree.
- Windows CI #514 / run `36176196311` / job `108207271685`: **PASS** on exact resulting-main source SHA `c875b4894e90cc75c04c9ff9508ef1dc1a176ad5`. All required steps succeeded.
  - runtime artifact `10882911552`, digest `sha256:b73a1dafd98af88eb1f76886508dd07786005e121fd5f001205085eccf1f483e`;
  - visual artifact `10883280101`, digest `sha256:226331d647043da70f7ee3c7af9a489da38e0407060eb3cfd8c1e5a252cebd13`.

Local Rust/Tauri validation was not used as authority for this slice; the authoritative Windows CI passed on both exact PR head and resulting main.

## Physical status

**NOT RUN after PR #145 in this slice.** Automated tests and screenshots cannot prove transient Windows desktop compositor continuity. M7 item 7 therefore remains open.

Required next physical evidence from the CI #514 runtime artifact:
- continuous Panel→Timer and Timer→Panel capture with no blank/pale/staging frame;
- no abrupt return flicker;
- Windows animations Off/reduced-motion follow-up in both directions;
- no horizontal focus-surface scrollbar;
- no stale/duplicated expanded pixels through expand/collapse.

After that, continue the remaining M7 Windows matrix already tracked in `TODO.md` / `docs/M7_FLOATING_RUNTIME_VALIDATION.md`. Do not advance to M8 until M7 acceptance is complete.
