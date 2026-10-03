# M7 CI #884 physical batch: findings and correction queue

Exact source 5cc184d87ae4f3562e439012292526940a48cb0a, merged equivalent 1a96da7d8b4c6f4aa2aa58cb7d6bd49726b0fab0, CI run 37122117866 PASS, artifact 11274516121, EXE SHA-256 a279664e4805eed7673ca30b1e2af6ff0f47356c1d59f8f92dacbdd8e2eb4bb3. Real process 14080, persistent Focus HWND 82577016, DISPLAY2 1920x1080 at 125%. Current topology has only one display; this batch cannot claim new two-monitor acceptance.

Continuous OBS capture: 2026-10-03 15-21-27.mkv, 5414.850 seconds, 1920x1080, 60 fps, 237850105 bytes, SHA-256 7573668b7ce06678c33e304baf6e885bae7de2d7e7c43bc05e175af581ccceab. Recording stopped normally at approximately 13:51:43 UTC. It includes idle implementation/review intervals; scenario actions are indexed separately. Evidence publication is in progress.

| Case | Result | Observed evidence |
|---|---|---|
| Create / Skip / Pause / shared Main projection | PASS | Dedicated long-title task created 13:27:54 UTC, Skip started it, Pause at 13:28:55 retained 0:00:13; Main preview reconciled |
| Expanded subtask add/edit/save/reorder/complete/reopen/delete | PASS | Two distinct displayed titles; progress 0/2 -> 1/2 -> 0/2 -> 0/1; edited B reordered before A and explicitly deleted; A retained |
| Notes persistence | PASS | Task note saved, saved content/preview reloaded; no URL launched |
| Manual break and explicit return | PASS | 10-minute Break; Resume restored the prior paused work state, with 13 seconds unchanged |
| Task completion and auto-next | PASS, precise ledger check pending | Dedicated task moved to Done, Today progress 3/4, next original C5 task auto-started and was explicitly paused after 19 seconds; its Time Taken is now 2:17:16. Done row rounds sub-minute duration to 1min; exact 13-second persistence requires ledger verification |
| Full Panel action labels | PASS at 125%, 100% NOT RUN | Break Notes Resume Skip Extend Done visible; automated fractional fit PASS at normal fixture scale |
| Normal/reduced motion | CAPTURED / dense review pending | Same HWND, same task/time endpoints, normal geometry and one reduced-motion round trip; OS animation setting restored On |
| Native frame footprint | FAIL | Outer 443x884, client 425x875 at x+9; settled Timer left strip and Panel lower edge; Tao 0.35.3 undecorated shadow insets and region origin mismatch explain a concrete failure path. This is not asserted to be the historical white-L symptom |
| Inline Notes overflow | FAIL | Expanded Timer empty Notes displays horizontal scrollbar; scoped width/box sizing needed, preserve intentional vertical content scrolling |
| Larger Notes reachability | FAIL | Expanded Timer region is 300 logical px but large modal uses 700px host vh; footer/editor clipped. Bound modal to current visible Focus height while preserving draft/editor node and resize capability |
| Keyboard layout | FAIL Greek / PASS English | Read focused WebView child HKL 4080408, Ctrl+Alt+T no dialog; changed focused child to 4090409, same chord opened Create; restored Greek. Parent Narro thread HKL is insufficient for this comparison |
| Quick-create keyboard focus | FAIL | Dialog loading mounts title after the initial one-shot focus attempt; Escape from retained outside focus does not reach dialog. Cancel pointer works. Focus loading dialog, then title after ready, preserve trap/restoration |

## One coherent correction batch

1. Evidence and crosswalk reconciliation.
2. Implement native shadow/inset boundary, scoped Focus form/editor layout and locale-safe shortcuts/modal focus, with regression coverage.
3. Strongest local preflight, one exact-head full Windows CI.
4. Exact EXE retest of affected native/motion/Notes/keyboard/DPI/restart gates; preserve existing accepted unrelated checks.
5. Publish complete logs, video-derived images/clips, PASS/FAIL/NOT RUN ledger; reconcile only observed acceptance.

No framework migration or additional Focus WebView is proposed. The product already requires fixed Focus host sizes and user drag; disabling its native resize/shadow is an internal Windows composition correction. The larger Notes editor stays resizable inside the actual visible area, an explicit Narro Windows reachability decision; it does not change the confirmed inline Notes flow from VE-010 SOURCE_COMPLETE. Current implementation slice 1/5; roadmap 5/10M and physical count 14/19 are unchanged. M7 remains open. M1 B/C/D are separate and not passed by this batch.
