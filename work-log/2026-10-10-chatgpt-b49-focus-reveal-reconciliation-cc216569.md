# 2026-10-10 — PR301 Edge focus reveal remediation and forward reconciliation

## Baseline, scope and evidence
User-visible coding acceptance remains **6/8**: completed I01–I06 through exact-head three-job Windows CI and guarded merge. I07 B49 and I08 B63 share existing PR #301. Codex native Windows/Blitzit source visual parity gates remain OPEN; optional M11 not activated.

#301 head `657920b2df19d53d536c6e5d5270ba140d403b6f`, run `38029857004`: validation and fast PASS, Windows visual FAIL at `focus-panel-live-actions-focus-light` with detailed measured `action-rail-opacity=0, heading-opacity=1`. All other strict conditions had passed, including action focus owner, pill visibility and unchanged geometry. Downloaded exact Windows diagnostics artifact `11661354700`: failed light HTML had no reveal-pass, subsequent light screenshot *did* show Pause icon + text pill, and dark HTML passed despite dark screenshot showing normal heading. This is a real inconsistent focus-triggered style/paint timing behavior; do not declare B49 PASS based on a screenshot alone.

## Narrow changes on existing branch
Existing PR #301 branch `implementation/m6-b63-inline-focus-success-20261009`:
- CSS `src/focusPanel.css`: adds native ancestor `:focus-within` reveal/heading fade as a browser-compatible fallback alongside original `:has(.focus-panel__live-actions:focus-within)` and hover. Preserves five contextual B50 controls, accessible labels, animations and existing layout.
- Real Edge fixture `src/focusPanelVisualFixture.tsx`: wait for computed `opacity=1` rail and `opacity=0` heading, bounded at 1.5s, rather than blindly sample after 300ms. All prior strict final-state keyboard, label, and <=1px geometry assertions remain. No suppression/threshold relaxation.
- Cheap gate `scripts/test-ui-focus-action-slots.mjs`: demands focus-within fallback, 1.5s bounded settling contract. Fixed declaration order bug introduced while adding fast check, so fixture source is read before use.

Initial head `77748f99e99a46d427dac8f9ba3178ec842faf55`, CI `38033418891` was still running when source conflict reconciliation was needed; it is NOT authoritative for later heads.

## Protect newer main; one source-overlay forward merge
Latest main at reconciliation `0e34101d352c921a19a5f213bf850d8d3987fb81`, accepted #280 merge `c1633c9edb372228ad597fde686575b58b8437fb`. Compared full Git trees, not guessed Git diff metadata. Exactly **16 executable/source/test files** differ between #301 and main. Retained main's identical B67 files (`package.json`, timer presentation, Floating foundation/overtime test etc.), and current authoritative newer Markdown `HANDOFF.md`, `STATUS.md`, `TODO.md`, `docs/NARRO_ENGINEERING_RISK_REGISTER.md`; did not restore stale branch Markdown or unrelated code. Created forward **two-parent commit** on the *same existing PR branch*, head **`cc21656992978886ce380c4497781ffad6105419`**, first parent prior head `77748f99e99a46d427dac8f9ba3178ec842faf55`, second parent main `0e34101d352c921a19a5f213bf850d8d3987fb81`. Head ref advanced by expected-head fast-forward, no force. GitHub PR now `mergeable:true`.

New exact-head run **`38033695809`** in progress at checkpoint (validation running), NOT PASS. Check this run's actual fast + Windows jobs at substantive checkpoint/new message. If red inspect *exact new* assertion/artifact and fix narrow; if all three SUCCESS, guarded expected-head squash merge PR301 and verify resulting main source blobs, update I07 & I08 both PASS to **8/8**. Then stage one consolidated Codex physical Windows candidate; physical failures remain open and no M11 work.
