# M6 current residual physical/source acceptance

Status: current residual checklist for the replacement single-`focusSurface` M6 acceptance bundle.

Use only the exact candidate below. Preserve historical accepted M6 evidence; do not repeat it without new invalidating evidence.

## Candidate identity

- Windows CI: **CI1025 / run `37630032472`**
- exact workflow head: `8f921d7063f78a51ea4e42b0e102c96cfe8ef8e3`
- merged runtime/test source: `ad6019b87d1ea7382b99db34b1e7e75725d1b107`
- artifact: `narro-m7-physical-windows-x64`, id `11486928221`
- ZIP SHA-256: `ac88a2b01d18597cf5de813f1af1b00cf16a6832d13234613e8b95faf7f91599`
- `narro.exe` SHA-256: `a7881c6c3984314f6c089865e87cd22c97c292606fe13997b170b3973ac4bfd1`
- NSIS SHA-256: `b057f098f2bce8da0df327e451f1a7f4bc2ebc799fc69b56615b805aaf6f71e4`
- MSI SHA-256: `ba5764423bf67a1fef83c11ae363b690a172d5a4f22da276657c1efb0656114f`

From merge `ad6019b8...` through the main state used to create this checklist, all later changes are Markdown/process/evidence only. Runtime, Rust, Cargo, frontend, workflow and build-config source are unchanged. Do not trigger a duplicate build solely for this M6 observation bundle.

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

This is a separate M1 acceptance result, not part of M6 closure, but it can reuse the same CI1025 executable because PR236 is already integrated in that runtime source.

Use only when two real displays / a real DPI transition are available.

1. In Preferences/Quick Preferences explicitly select a named non-primary display while its Windows scale is 125%.
2. Put Focus Panel on the selected display and note the chosen Left/Right side and safe visible anchor.
3. Change that same physical display to 100% scaling so its geometry/work-area/DPI-derived monitor key changes without changing the physical display identity.
4. Re-enter/re-present Focus without restarting Narro.
5. PASS requires the same named physical display to remain selected and Focus to recover to a safe visible anchor on the configured side; it must not silently fall back merely because DPI/work-area geometry changed.
6. Separately verify a genuinely unavailable/stale saved display remains visibly unavailable rather than being silently rewritten to Automatic. Then explicitly choose Automatic and confirm that user action commits/clears the stale selection.

Record this result as Finding27/M1 evidence only. Do not overwrite the already accepted CI942 ordinary selected-monitor/removal-reconnect scope.
