# Independent Shortcut accessibility + write-admission correction (staged, no CI)

## Live ownership and baseline

- Owner: ChatGPT independent frontend track; **do not touch Codex-owned PR #389** (`fix/m7-pixel-preserving-composition`) or his still-open native recordings.
- Source derived from accepted `main` `cd14ec1557c5d27a1b5901b9c43dbd9dc3b3fe8c` after merged PR #388. All changes isolated in **unPR'd** branch `fix/shortcuts-a11y-and-singleflight-staged`; no merge or CI triggered. The exact staging HEAD can be read from live GitHub; it is not the candidate already accepted on main.
- Context: Codex main handoff at this checkpoint says missing capture states (C33 near taskbar, Notes larger, normal reaction, isolated alerts) should be filmed/reviewed next; PR389 exact native review **8/8 → 4 scoped PASS/4 FAIL**. None of this independent Shortcut work changes Timer/native or Codex's evidence.

## Verified defect in current merged product

`WindowsShortcutSettingsPanelView` visually draws three global and seven app-only shortcuts as separate `<kbd aria-hidden="true">` elements to match SS-C17. The enclosing generic `<span aria-label={row.chord}>` is not reliably eligible for an ARIA accessible name under the implicit generic role. Because the only rendered key symbols were `aria-hidden`, assistive technology could fail to speak the chord. The row title and switch label still existed but did **not** convey the exact key sequence.

**Fix:** Remove the unreliable generic `aria-label`. Add one ordinary real-text `<span class="windows-shortcuts__accessible-chord">{row.chord}</span>` inside each keycap group, visually hidden by locally-scoped clipping CSS (not `display:none`, `hidden`, or `aria-hidden`), while leaving the visible decorated `<kbd aria-hidden>` elements unchanged. Both global and fixed-app rows continue using the original immutable typed chord inventories, registration semantics and UI geometry. No source-chord changes, no new ARIA role invented, no extra keyboard controls or focus stops.

### Synchronous native registration admission

The function `WindowsShortcutSettingsPanel.change(kind,enabled)` used `if(pendingKind)return`, then `setPendingKind(kind)`. React publishes state on a later render, so two rapid action callbacks inside the same event turn can both cross this condition and issue overlapping `setGlobalShortcutEnabled` Tauri native commands. Unlike pure UI state, native global hotkey registration/unregistration has OS-level side effects and can fail mid-transition. Out-of-order responses could overwrite an authoritative settings snapshot or leave a misleading registration status.

**Fix:** The true owner of shortcut writes acquires a synchronous `useRef(false)` gate **before** calling the native command, and releases it inside the shared `finally` on successful commit *or* failed command followed by authoritative `getGlobalShortcutSettings` refresh. `pendingKind` remains the visible UI busy status and disables controls. `applyNewerShortcutDiagnostics`, OS registration, error/retry/status display and saved booleans remain untouched. Subsequent retry after either settlement is admitted; duplicate same-turn event is ignored as before in the busy UI, but now correctly guaranteed even before React rerender.

## Tests authored and what actually ran

`scripts/test-shortcut-accessibility-and-admission.mjs` uses `typescript.transpileModule` of the **actual production component file**, a minimal controlled React/JSX runtime, and a deferred native shortcut API mock; it is wired into `package.json` mandatory frontend preflight *for future authorized CI*, but the branch has no PR so nothing was launched.

The script checks:
- Exactly **3 global + 7 fixed-app** full spoken shortcut chords in the expected order, exposed as ordinary text.
- Every full-text chord has matching, visual `kbd` segments marked `aria-hidden`; no generic `aria-label` dependency and CSS uses screen-reader-safe offscreen clipping; unrelated dialog visual rules stay present.
- Two simultaneous `onChange` calls before any React render produce exactly **one** native registration call. UI busy/pending matches the admitted owner.
- Forced native failure: original error is displayed, authoritative current settings are refreshed, in-flight ownership released and retry accepted. Successful second write sets committed snapshot and clears stale error.

**Performed in this environment:** exact fetched-production `change()` body was isolated, TypeScript annotations removed and executed in V8 with a deferred native mock; synchronous deduplication, failure refresh and retry **PASS** in that bounded isolated unit. Read-only JSX/CSS/preflight structural assertions **PASS**. Full `node scripts/test-shortcut-accessibility-and-admission.mjs` / full React browser / Windows screen-reader / actual OS hotkey or native CI **NOT RUN** (no local GitHub checkout/dependencies). The test is designed to provide these runtime execution checks when the branch is safely validated in a real project checkout. Do not claim the screen reader physical fix is verified by a mock.

## Integration and guardrails

- **No new CI:** user explicitly prohibited starting another CI. Keep this staging branch without PR/main source push. Do not run `workflow_dispatch`, do not amend PR #389, do not merge until explicitly authorized to validate.
- Source modified only `src/WindowsShortcutSettingsPanel.tsx`, `src/windowsShortcutSettingsPanel.css`, `package.json` and the dedicated new regression script (plus this handoff). No Timer, Rust, database, Spectrum Core picker/image/icons, AppData or user-paused native tests modified.
- Next ChatGPT or Codex independent implementation step: run `npm run test:shortcut-accessibility-and-admission`, existing `test:ui-global-shortcut-settings`, `test:ui-preferences`, TypeScript build and affected Preferences/Shortcuts visual fixtures **locally** when checkout available. Verify native screen reader announces all 10 chords exactly once, switch state and conflict/retry feedback, and that simultaneous toggles cannot race OS registration. If these checks fail, fix only the proven cause on this isolated branch; do not claim PASS for unexecuted tests. Later, with user permission to start CI, choose coherent integration plan outside Codex PR389 ownership.

This does not change the milestone completion count or resolve native Timer physical FAIL.
