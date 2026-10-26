# PR430 — isolated read-only Win32 physical input corroboration candidate (2026-10-26)

## Ownership and exact identity

ChatGPT implementation track; branch `fix/p09-p11-win32-physical-input-receipt-20261026`; [PR430](https://github.com/MariosGiannakaras/Narro/pull/430); exact submitted head `4785201e9746204d69a49a7b6b482cb74f8dd0e5`; base main `9f1815717913889a2722f50a6ff5f54d61012c5a`. This is **candidate source, NOT MERGED** at this writing. Exact-head required validation/fast/Windows CI **PENDING / NOT VERIFIED**; never call premerge or resulting-main PASS until witnessed.

## Evidence and causal boundary

[PR429](https://github.com/MariosGiannakaras/Narro/pull/429) merged CDP DOM probe with exact-head 3/3 CI PASS, but no original Windows keyboard/held-mouse/HWND independent receipt. Original P11 Ctrl+F opened WebView2 Find and Ctrl+Alt+T did not visibly quick-create; previous attempted Board trials include modal/editable confounders, so true event owner remains UNKNOWN. P09 native Compact Timer HWND stayed fixed during attempted drag, but actual held button/native move loop and hit target remain unproven. No evidence authorizes a speculative shortcut/drag runtime patch.

## Bounded changes

1. New `scripts/capture-native-input-receipt.ps1`: opt-in Windows-only read-only Win32 `GetForegroundWindow`, `GetGUIThreadInfo`, `GetWindowThreadProcessId`, `EnumWindows`, `GetWindowRect`, `GetCursorPos` and `GetAsyncKeyState`. Requires explicit isolated `Narro.exe` PID and absolute path in preexisting isolated evidence dir; creates output exclusively via `FileMode.CreateNew`; no input injection, hook, window manipulation, Narro data/DB access or personal-profile access. It persists only Ctrl+F/Ctrl+Alt+T shortcut-chord booleans, modifiers, held left-button state, HWND/PID/rect/cursor and bounded monotonic elapsed sample times. **No standalone letter-key state or arbitrary text persisted.** Captures never mean native PASS.
2. Existing Windows `test:performance-harness` appends one no-interaction `-SelfTest` to exercise isolated Win32 P/Invoke entry points.
3. `docs/P09_P11_NATIVE_INPUT_PREFLIGHT.md` describes parallel timestamp-aligned CDP and Win32 original evidence, limitations, and manual operator workflow.

## Validation truth

- Inline static source/invariant review: **7/7 checked** (read-only Win32 API/absence of injection, PID isolation and fail closed, CreateNew file, focused/top-level HWND capture, existing Windows harness, protocol pairing). This is **not** execution-based PowerShell or app validation.
- Local PowerShell executable/interoperability check: **NOT RUN** (this ChatGPT execution has Linux tools, no PowerShell or interactive Windows operator).
- P11/P09 real Windows focused physical tests: **NOT RUN on this candidate**; OS keyboard scan codes and native WM_ENTERSIZEMOVE are **not captured by this polling tool**. A missed poll is inconclusive.
- PR430 exact-head validation/fast/windows candidate: **PENDING / NOT VERIFIED** at this handoff; subsequent head SHA must be independently checked before attributing a run.
- Motion A/PR389, B/PR419 scoped 8/8+8/8 functional PASS and separate compositor holds remain unchanged; no application runtime, approved Spectrum Core picker/image upload/218 icons, persistence or Window geometry changed. The exactly three human physical actions P18 tray Quit, P19 actual HDMI unplug/replug, P20 true held mouse+Escape remain NOT RUN. P03 scroll source requirement remains OPEN. M1–M4 accepted 4/10; M5–M9 OPEN; M10 BLOCKED; M11/M12 inactive.

## Single next action

At a fresh owned, isolated Windows physical session, record **P11 first** under noneditable/modal-free focused Main using both read-only receipts and original video plus external OS keyboard evidence; then **P09** held drag on a verified Compact direct drag region with native HWND rect/WM move-loop. Fix only the evidenced runtime owner with a narrow regression PR. In parallel, exact-head PR430 CI must pass before its own guarded merge; this does not require waiting idly or marking unrelated physical work complete.
