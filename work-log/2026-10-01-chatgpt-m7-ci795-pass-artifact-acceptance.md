# M7 CI #795 exact-head PASS and artifact acceptance

Date: 2026-10-01

## Exact source

PR #192 branch:
`plan/m7-single-focus`

Exact validated head:
`26f4fc25f3e7dcb4c48df53b4123251fbcf7bce2`

Windows CI:
- run number: #795
- run id: `36822373471`
- result: **PASS**

The run completed Repository Preflight, frontend production build, Rust fmt/check/clippy/tests, performance harness, Windows visual regression, Tauri release build, packaged Focus runtime capture/validation and all required artifact uploads.

## Required artifacts

### Packaged Focus runtime visual
- artifact: `narro-m7-focus-runtime-visual`
- id: `11144380370`
- GitHub digest: `sha256:bd048627706561ed9fc168cbe7bb34c1457204c814f04f7e151be03f4bf7b923`
- downloaded ZIP SHA-256 matched the GitHub digest exactly.

### Physical/runtime harness
- artifact: `narro-m1-runtime-harness-windows-x64`
- id: `11144235897`
- GitHub digest: `sha256:4520728c8ea35aa20a5f20f71e5d208c2057f966082f8e6f44ca8015943bdd43`
- downloaded ZIP SHA-256 matched the GitHub digest exactly.
- contents include `narro.exe`, NSIS setup and MSI.

### Windows visual regression
- artifact: `narro-m5-visual-regression`
- id: `11142994011`
- GitHub digest: `sha256:d5eb6e2ae6b4b6544865043a6823e9b4523d09003692e8397cea67ed2dc99f08`
- downloaded ZIP SHA-256 matched the GitHub digest exactly.

## Mandatory artifact review

The fresh packaged runtime is accepted for automated evidence.

Observed settled runtime captures:
- Panel: active `Packaged runtime focus task`, state `Running`, live countdown around `59:59`;
- compact Timer: `Packaged runtime focus task` + live `59:53`;
- expanded Timer: the same task title + live `59:52`, followed by actions/subtasks.

This directly closes the prior hosted-fixture gap: the runtime harness is no longer demonstrating an idle placeholder Timer.

Native metadata:
- Panel HWND: `0x201FE`;
- compact Timer HWND: `0x201FE`;
- expanded Timer HWND: `0x201FE`;
- compact native region: 340×110;
- expanded native region: 340×300;
- one persistent Focus HWND/WebView is retained across the settled presentations.

DOM/native capture validation reports no unintended document/root scrollers. The fresh light/dark visual-regression expanded Timer captures also visibly retain the task title + timer above the action/subtask content.

The packaged runner reports `prefersReducedMotion: true`. The reduced-motion Panel→Timer and Timer→Panel frame sequences were inspected and did not show an obvious blank/stale Focus presentation, but this does **not** validate the normal ~270 ms physical motion character.

## Physical status

M7 is **not complete**. The next gate is a fresh physical run using this exact artifact.

Required matrix remains:
1. confirm one Narro authority/process and second launch does not create a competing runtime;
2. run an active task/session;
3. repeat Panel↔Timer many times;
4. repeat compact↔expanded many times;
5. preserve task/session identity and continuous authoritative time;
6. no white/blank/stale/staging/duplicate pixels/document scrollbar;
7. visible Timer → `Blitz now` → Focus Panel;
8. idle/no-task Ctrl+Shift+T and Find Timer do not expose Timer;
9. Main/Focus/Home projections reconcile after cross-window mutations;
10. always-on-top over maximized/fullscreen app;
11. drag/save/restart placement near edge/taskbar;
12. two monitors at 100%↔125%, cross between them, expand/collapse near edges/taskbar and topology/hotplug recovery.

No roadmap/current-slice counter advances from automated CI/artifact acceptance alone because the physical gate is still required.
