# PR431 + PR436 source-only merge / Codex evidence reconciliation (2026-10-27)

**User direction:** Complete all runnable source, regression, analysis and CI work independently; the user's physical Windows checks run on their own schedule and are NOT this ChatGPT owner's work. No M10 or optional M11/M12 activation.

## Real source merge

- PR431 canonical tested source: `3c3b72b06eaa841bce9429dace83a6b5c33ba701`; Actions run `40573065951` validation/fast/Windows **3/3 SUCCESS**. Includes confirmed V10 source correction and approved real Windows monitor names + in-card desktop previews.
- PR436 predecessor: `aa6c562af315da5426f672761b158762111638a7`, from obsolete earlier PR431 source `6dce8daa`; its previous run `40520665995` **3/3 PASS** is historical and does not validate the latest upstream.
- Built merged source tree `e3d41f2067c3583ddc42df00e8e53bf5982b8cbe` from **exact PR431 tree** `3c7ace1049c3b8e668718d64f7aa3acf6ac19bd8`, adding precisely the six PR436-owned source/test/docs deltas.
- Created true Git two-parent merge `a31d11d0b0c1304eb3ac201ad708954fcb303c91`, first parent PR436 predecessor `aa6c562a`, second parent PR431 `3c3b72b0`. Updated the **existing** PR436 branch with expected-old-head guard, no force. Compared new combined branch against PR431: **only six files differ**, confirming retention of all newer PR431 monitor/provenance/Preferences source and snapping extras.
- Shared `src-tauri/src/lib.rs` resolves only 16-DIP inset visibility; shared `src-tauri/src/windows/mod.rs` appends pure snapping solver/four Rust regression suites while keeping new MonitorDescriptor identity/preview fields. `windows/topology.rs` native WM_MOVING, frontend source regression, acceptance plan, historical immutable snapping log are retained byte-identical from prior PR436.
- New [CI40579536904](https://github.com/MariosGiannakaras/Narro/actions/runs/40579536904) exact **combined source SHA `a31d11d0`** validation PASS and fast PASS, Windows candidate RUNNING as this log was written; **full 3/3 NOT YET CLAIMED**.

## Other evidence-led dispositions

- Prior 57/57 M5–M9 static cells already inspected on source-pinned versions; not 57 physical successes or 57 distinct missing features.
- G01–G23 original 17 scoped PASS/6 PARTIAL plus separately executed 6/6 narrow later native closures on a different exact binary. Not a single-release 23/23 claim. G24/G25/G27 scoped functional PASS, G26 measured low idle CPU 0.3122% of one core over 30 seconds but no long-run memory/leak baseline or formal budget. G28 strict DWM/perceptual acceptance remains INCONCLUSIVE, not a confirmed fresh source defect. G29 manual Break natural resume is current documented policy; no arbitrary timer semantic change.
- A PR389 and B Motion v4 PR419 each 8/8 bounded recorded functional routes PASS in original A/B Windows trials; native strict compositor acceptance remains separate. Original TimerService first B poisoned-mutex symptom cause unknown; later PR431 owns callback unlock + typed poison tests. Existing timed-alert cursor issue was addressed separately by PR422. Neither ambiguous cause is license for a speculative second implementation.
- Source review of Win32 `CreateDCW`: Microsoft's `CreateDCW` contract permits the same explicit display device name in its driver and device parameters, and the existing code chooses the actual named adapter, not a universal screen DC. This verifies API contract only, **not actual visual Windows output**.

## Remaining source-only operations

1. Check exact combined PR436 Actions run `40579536904`; on failure fetch first failed job/step/log and fix only supported source/fixture/tooling errors in existing branch; on 3/3 success verify exact ZIP+manifest+PE/MSI/NSIS artifact provenance.
2. After the result, update main HANDOFF/TODO/STATUS with accurate source-only state and next *source* engineering action; physical outcomes are independent and neither requested nor scheduled here.
3. Keep PR431/PR436 PR389/419 source ownership and branch history intact; no PR-to-main merge until their own binding acceptance gates. PR418 remains the separate Motion v4 design contract, PR419 separate native experimental candidate; do not overwrite a controlled A/B baseline without an evidenced source defect.

Formal milestone status at checkpoint: M1–M4 accepted 4/10; M5–M9 not formally accepted, M10 gated and separately user-approved, M11/M12 inactive.