# M6 current residual physical/source acceptance

Status: current residual checklist for the replacement single-`focusSurface` M6 acceptance bundle.

Use only the exact candidate below. Preserve historical accepted M6 evidence; do not repeat it without new invalidating evidence.

## Candidate identity

- Windows CI: **CI1046 / run `37677630228`**
- exact workflow head: `515b0f9a9df5cdf1a67e2b879047ee6551ae6dec`
- merged runtime/test source: `c389148b9edc56dd616e6c95a32b31d52cf79639`
- artifact: `narro-m7-physical-windows-x64`, id `11508639865`
- ZIP SHA-256: `57f19035ee842e3479bde946a4a82348b1dfc9ea3045d600f18707c4d38b0411`
- `narro.exe` SHA-256: `59beeb8271d08fd60adab4d41840bb65ed956d753410d8f2985daf4efe6a9275`
- NSIS SHA-256: `714c3c3d99ea9d820a572c64f3df05d108854d31043801111848c1918b997a56`
- MSI SHA-256: `851f57b27dffb9aa194fc9176696f4a93d35be0ee2b3871e0f85313321886af1`

PR248 exact-head CI1046 is full green and resulting `main` is 18/18 source/test blob-identical to that validated head. Later changes through this checklist repin are Markdown/process/evidence only. Do not trigger a duplicate build solely for this M6 observation bundle.

## Already accepted — do not repeat

- selected-monitor and Left/Right Focus placement: CI942 physical acceptance;
- software topology recovery with Main present/absent: CI942 diagnostic acceptance;
- P3-M6-02 Notes toolbar + recognized http(s): scoped physical/source PASS;
- P3-M6-03 running dark live-card cyan→mint/lime edge/glow: scoped physical/source PASS;
- recorded modal shortcut, queue accessibility and domain/persistence checks remain valid unless directly invalidated.

## A — P3-M6-01 Board → Focus morph

Canonical authority: VE-003.

With normal Windows animation preference, Main visible and an eligible Today task, use ordinary `Blitz now`.

Pass requires:
- Start Blitz commits before the visual handoff;
- Main performs one short shrink/translate **window morph**, not a page fade;
- motion is in the source ~0.22–0.27 s family, without requiring frame-perfect duration equality;
- no blank/white/stale duplicate frame;
- Focus appears with the same committed live task/session;
- Main is not left visibly shrunken.

Record PASS/FAIL, timestamp and any VE-003 divergence.

## B — P3-M6-04 Focus Quick Preferences

Canonical authority: SS-H05 + full Pass-3 VE-003.

From active Focus, open Menu → **Quick Preferences**.

Pass requires the compact Focus-local surface—not full global Preferences—and:
- Hide est/done times;
- Screen selection including Automatic/current screens;
- Blitz Panel Side Left/Right;
- Pomodoros;
- Timed alerts during a task;
- Notification Alerts;
- Show success screen;
- Fun gif on success screen only when success screen is enabled.

Change one harmless reversible setting, return to Focus, reopen Quick Preferences, confirm persistence, then restore it.

Record PASS/FAIL, the setting used and any SS-H05 composition mismatch.

## C — P3-M6-05 ordinary Focus-row actions

Canonical authority: full Pass-3 VE-003.

On one non-live queue row:
- rest/hover/focus geometry remains stable;
- visible rail order is **Complete → Make Live → Subtasks → Notes → overflow**;
- overflow order is **Schedule → Change list → Duplicate → Delete**;
- keyboard/focus reaches the same action family;
- obsolete Move Up / Move Down buttons are absent from the visible rail;
- opening/cancelling overflow does not mutate the task.

Do not repeat broad destructive/domain matrices already accepted.

Record PASS/FAIL plus any order, geometry or keyboard divergence.

## D — P3-M6-06 Home pause/re-entry

Canonical authority: VE-003.

Use a running task that was not intentionally user-paused:
1. Activate Focus **Home**.
2. Observe **PAUSED** before Focus exits.
3. Confirm Main appears without task/session loss.
4. Re-enter Focus through ordinary Blitz entry.
5. Confirm the initial re-entry presentation is still paused.
6. After the Panel is visibly presented, confirm guarded resume of that same Home-origin session/task.
7. Do not treat an intentionally user-paused session as eligible for auto-resume.

Record PASS/FAIL and the visible pause/re-entry/resume sequence.

## Separate Finding33 observation

PR247/CI1025 already proves real Edge/contenteditable Escape closes large Notes and restores focus. The older CI953 native Main/Focus no-op remains a Tauri/WebView/native physical discrepancy, not a browser-DOM production defect.

If captured with this same executable, record it separately as Finding33 evidence; do not use it to claim M6 source parity.

## Closure

M6 remains open until A–D are directly reconciled. A failure reopens only the affected P3-M6 authority. This checklist does not advance roadmap counters by itself.

## Compatible M1 add-on — Finding27 selected-monitor DPI recovery

This is a separate M1 acceptance result, not part of M6 closure, but it can reuse the same CI1046 executable because PR236 and the PR248 monitor-identity hardening are integrated in that runtime source.

Use only when two real displays / a real DPI transition are available.

1. In Preferences/Quick Preferences explicitly select a named non-primary display while its Windows scale is 125%.
2. Put Focus Panel on the selected display and note the chosen Left/Right side and safe visible anchor.
3. Change that same physical display to 100% scaling so its geometry/work-area/DPI-derived monitor key changes without changing the physical display identity.
4. Re-enter/re-present Focus without restarting Narro.
5. PASS requires the same named physical display to remain selected and Focus to recover to a safe visible anchor on the configured side; it must not silently fall back merely because DPI/work-area geometry changed.
6. Separately verify a genuinely unavailable/stale saved display remains visibly unavailable rather than being silently rewritten to Automatic. Then explicitly choose Automatic and confirm that user action commits/clears the stale selection.

Record this result as Finding27/M1 evidence only. Do not overwrite the already accepted CI942 ordinary selected-monitor/removal-reconnect scope.
