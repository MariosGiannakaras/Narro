# 2026-10-11 — B49 actual tooltip timing gate, new CI retry on original PR #321

## Responsibility and baseline

User has explicitly reassigned **all** coding, source/test PR ownership, GitHub Actions and merging to ChatGPT. Codex performs only later user-paused physical Windows validation. The project remained 10/11 post-audit implemented+Windows-CI-accepted units before this slice. Last documented pre-#321 integrated candidate remains valid intermediate evidence but not final Q12.

## New real failure and source evidence

Existing PR #321 previous head `940ce10e3b3eed83513ea127286d98960d0d12d3`, [run 38141136444](https://github.com/MariosGiannakaras/Narro/actions/runs/38141136444) actually **FAILED** despite validation-gate and fast-gate SUCCESS. Exact failed Windows step: **Capture Visual Regression Fixtures**; a later missing packaged Focus runtime artifact is downstream only.

Windows log first causal error from live Edge CDP Focus fixture:
`{"ready":true,"pass":false,"focusOwner":false,"activeTag":"SPAN","railOpacity":"0","headingOpacity":"1","contractError":"{\"error\":\"Uncaught Error: Focused queued title tooltip did not open before containment measurement\"}"}`.
It occurred in LIGHT this time before final B49 live-action refocus; this is not a successful focus proof. Downloaded [failure diagnostic artifact 11703503337](https://github.com/MariosGiannakaras/Narro/actions/runs/38141136444/artifacts/11703503337), verified actual ZIP SHA-256 `a91a6f64cc55fd717d225629eaff0ae9ec4e8204357a1ef158e4d099cc2a2f36` and examined the retained `focus-panel-live-actions-focus-light.html`. DOM has exactly one error-only visual contract and no tooltip with `data-open=true`. The same-run ordinary `focus-panel-light.html` has a correct full visual contract and one open real queued tooltip, confirming the baseline fixture path is functional. The failed screenshot never passes the source/CI pixel validator.

Actual shared production `Tooltip` in `src/overlayPrimitives.tsx` uses focus-triggered `setTimeout(400ms)` then asynchronous React `setOpen(true)` commit; CDP fixture previously awaited one fixed 450ms elapsed time, then required actual open. Under non-virtualized headless CDP, this fixed wait is insufficient to establish a React commit. The evidence is of a **test/capture timing race**, not proof of a Narro product tooltip defect. The viewport-before-navigation fix remains valid and narrowly scoped but did not alone close Q01.

## Same-branch fix

On existing branch `audit/20261011-b49-cdp-pixel-capture`, commit `b30d080f4315af08f13932609c0b97e4a5fffc95` updates **fixture only** `src/focusPanelVisualFixture.tsx`: preserve initial 400+50ms wait, then bounded extra up to 2 seconds of 100ms polling until the *real mounted tooltip* reports `dataset.open === "true"`, while verifying `document.activeElement === title`; if wrong owner or timeout, preserve strict FAIL with focused evidence (active tag, tooltip state, viewport). Never force tooltip open, bypass React event, manually style, or skip title geometry/containment check.

Commit `221558f80012342d7d3f9e1720c42a8e477c9c67` updates existing mandatory `scripts/test-ui-focus-action-slots.mjs` to assert the bounded actual-open and focus-owner probe stays present.

The existing PR strict CDP focused action rail, real PNG comparison, decoded action region, geometry, title containment, theme and accessible owner checks are unchanged. No production application behavior, CSS, Rust, native IPC, or visual design altered.

## Actual validation/current source state

- [New exact-head CI 38143961415](https://github.com/MariosGiannakaras/Narro/actions/runs/38143961415), head `221558f80012342d7d3f9e1720c42a8e477c9c67`: **validation-gate SUCCESS**, fast-gate **IN PROGRESS / NOT PASS**, windows-candidate **NOT PASS**, at last inspection.
- All seven changed PR paths fetched at this exact head; current main path blobs for the three modified original files are still their original pre-PR values and four PR-added files are absent on main. No overlapping changes identified; do not overwrite newer direct-main docs.
- No local Windows toolchain/Edge capture performed here: **NOT RUN**. No physical Tauri/UIA or source-parity PASS claimed.

## Next action

Inspect actual exact-head CI; if red diagnose first failure and narrowly fix same branch; if 3/3 Windows success expected-head guarded squash merge #321, then verify **all 7/7 changed Git blobs** on resulting main. Progress only then 11/11.

After merge perform final **Q12** on the exact resulting-main production run, actually download final ZIP, unzip and SHA256 ZIP / production `narro.exe` / NSIS / MSI. Pre-#321 artifacts cannot stand in. Keep the intentionally paused physical Codex gates OPEN, M10 blocked, optional M11 dormant.
