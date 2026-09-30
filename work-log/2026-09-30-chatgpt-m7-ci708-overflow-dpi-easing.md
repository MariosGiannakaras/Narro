# M7 CI #708 — overflow, interactive DPI region sync, and eased motion

Date: 2026-09-30

## Scope

Continuation of PR #192 (`plan/m7-single-focus`) after the exact #684 video reassessment reconfirmed three defects:
1. settled compact/expanded Timer document scrollbar;
2. transient compact Timer visible-region DPI mismatch during manual 125%↔100% crossing;
3. long cross-screen Panel↔Timer traversal using linear native stepping, which read as dragged/flying motion.

No architecture reset was authorized or required. The persistent composition remains `main` + one `focusSurface` HWND/WebView.

## Exact source and CI

- PR: #192
- exact head: `63bb20e9c32dcaffacf96c3bd5a6c52e9114b257`
- Windows CI: #708
- workflow run: `36688532688`
- result: PASS
- runtime artifact: `narro-m1-runtime-harness-windows-x64`
  - id: `11084209028`
  - digest: `sha256:0082039e7ffefe48971f4398c2722643fad665cc8c69d7ffdaba3dda8dbfd51d`
- visual artifact: `narro-m5-visual-regression`
  - id: `11085410196`
  - digest: `sha256:00782b19dd444efc42d0dc56268d9a598f38aac0fcdc0df546dbed8a4e289ff2`

CI passed validation gate, Repository Preflight, frontend contracts/build, Rust fmt/check/clippy/tests, performance-harness self-test, Windows visual regression, reused frontend-dist verification, Tauri release, and both required artifact uploads.

## Implemented corrective behavior

### Focus document overflow

`src/focusDocument.css` makes `:root`, `html`, `body`, and `#root` full-size, zero-margin, transparent, and `overflow: hidden`. The document itself therefore cannot create browser scrollbars. Intentional scrolling remains owned by component-level containers such as subtasks/notes/success content.

### Interactive mixed-DPI Timer region

The Windows topology observer now distinguishes an interactive `WM_DPICHANGED` while `WM_ENTERSIZEMOVE` is active. It extracts the new X DPI, coalesces region refreshes on the main thread, and asks the current Timer presentation to reapply its compact/expanded native visible region using that explicit DPI.

Full host-size/position recovery still remains dirty/deferred until `WM_EXITSIZEMOVE`, preserving the earlier invariant that Narro must not fight the user's drag.

### Panel↔Timer motion

Native point-to-point movement no longer interpolates linearly. It uses the Windows Fluent existing-element point-to-point curve `cubic-bezier(0.55, 0.55, 0, 1)`, solved deterministically by bisection so elapsed progress maps through CSS-style x(t) before y(t). Exact start/end coordinates are preserved.

Renderer and native motion contracts use the same easing family and finite ~250 ms transition window. The implementation remains finite point-to-point movement; it does not introduce high-frequency region animation or a second Timer WebView.

## Regression coverage

The exact #708 head includes deterministic coverage for:
- document-root overflow ownership;
- 100%/125% Timer region scaling in both directions;
- interactive `WM_DPICHANGED` refresh gating versus programmatic moves;
- preservation of deferred full recovery;
- Fluent easing constants, exact endpoints and non-linear distance progression;
- renderer/native motion contract alignment;
- pre-motion Timer clipping, cross-DPI Panel reveal sequencing and rollback invariants;
- existing single-`focusSurface` architecture contracts.

## Physical status

**NOT RUN / UNAVAILABLE for #708.**

The user currently has no access to the Windows test system. Therefore:
- no claim is made that #708 physically removes the settled scrollbar;
- no claim is made that #708 physically synchronizes visible height immediately during 100%↔125% crossing;
- no claim is made that the eased traversal is visually accepted;
- Gate 7 and Gate 12 remain OPEN/UNAVAILABLE;
- no roadmap/TODO checkbox or progress counter advances;
- PR #192 must not be merged yet.

The last physical evidence remains the exact #684 recording `2026-09-30 02-02-23.mp4` (SHA-256 `72360756a44ab94ac95aaf245beeadf1069fc91385268b68853bb17f570fd412`), whose reassessment motivated this correction.

## Continuation

This tracking entry is committed directly to `main`, so PR #192 will be behind current tracking truth. Before any future source edit, physical validation, or merge:
1. reconcile current `main` tracking Markdown into `plan/m7-single-focus`;
2. re-run exact-head Windows CI because the PR SHA changes;
3. use that exact newly validated artifact for the remaining physical protocol;
4. only after physical PASS complete remaining replacement validation, guarded merge, resulting-main validation, and tracking reconciliation.

The fully merged/physically accepted application-source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.
