# M7 item 7 native hidden-resize correction

Date: 2026-09-24. Agent: Codex, Desktop checkout and GitHub connector.

## Context and decision

Physical re-test of exact resulting-main CI #480 showed Panel -> Timer PASS, Timer -> Panel borderline/functional PASS, expand/collapse FAIL, right-side Panel return PASS, normal-size horizontal scrollbar PASS, and timer/session continuity PASS. Screenshots showed stale or duplicated expanded action-strip pixels accumulating across repeated native resize cycles. PR #125 was an unvalidated native hidden-resize hypothesis when Codex took ownership.

Kept the existing `focusSurface` webview and established 340×110/340×300 native geometry. Changed `src/FloatingTimerFoundation.tsx` so the target hierarchy is visibility-hidden before and through native hide/resize/show, then receives a finite post-show presented-frame opportunity before the transparent entrance. Changed `src-tauri/src/lib.rs` to snapshot physical size/visibility, hide before resizing, and attempt rollback of both after resize/show failure. The renderer also restores its previous expanded state on native error. Updated `scripts/test-ui-floating-expanded.mjs` for the ordering and recovery contract. No timer/session/task authority, extra webview, or high-frequency geometry loop was introduced.

## Exact evidence

- PR #125 final head `fb3547855433b87d576e1e78a5bbe58d5fc2570b`; changed files: the three above.
- Local `npm run preflight:frontend`: PASS on the behavioral candidate before the final rustfmt-only commit. Local Rust compilation: NOT RUN to completion because crates.io index timed out.
- CI #485 failed only `cargo fmt --check`; exact formatting correction was applied.
- PR Windows CI #486 / run `35939359726` / job `107443605380`: PASS (Repository Preflight, Windows visual fixtures, Tauri Release, diagnostic artifact). PR runtime artifact `10785280230`, digest `sha256:7a2d52731be4696b98d167163fab2b8754da883b7321d7a2fd5a1439d8d4d8c0`.
- PR reviews, comments, and review threads: none at final-head review.
- Expected-head guarded squash merge: `a7161acdf6a400147af0bbc44d52b1ec6ee64ea5`, tree `077435c468d4e5358b7a2e2b98417332d4e20a05`.
- Resulting-main Windows CI #487 / run `35940723610` / job `107447795591`: PASS (same required gates). Runtime artifact `10785466061`, `narro-m1-runtime-harness-windows-x64`, digest `sha256:f84bee3216cfe5d1762916cd54cd0d7703db283bdd7d1930b9b540a100764413`. Visual artifact `10785301496`, digest `sha256:c385e00fe2c06cb0084d17f002c9f82f77b0d9cfa67e95f491a7a0b12f7f941a`.

## Tracking and limitations

`TODO.md`, `STATUS.md`, and `HANDOFF.md` were updated in the tracking branch following this validation. Item 7 remains unchecked and at 4/5 checkpoints because transient desktop compositor behavior requires direct physical Windows observation. The new CI #487 runtime is the exact current physical candidate; no physical PASS is claimed.

The user is unavailable for physical testing for several hours and authorized isolated independent later M7 work. Item 8 Ctrl+Shift+T is in PR #126; item 9 Ctrl+Shift+P is prepared locally. Continue their exact-head CI and resulting-main validation in TODO order without closing item 7 from automated evidence.
