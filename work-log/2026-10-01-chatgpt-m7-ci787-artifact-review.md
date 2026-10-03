# M7 PR #192 CI #787 automated-green artifact review

Date: 2026-10-01

## Exact candidate

PR #192 branch:
`plan/m7-single-focus`

Exact head:
`dce6933ff7a777c837822f7a5a83c37d47434e07`

Windows CI #787 / run `36786367870`: **PASS**

All authoritative Windows job stages passed:
- Repository Preflight
- frontend contracts/build
- Rust fmt/check/clippy/tests
- performance-harness self-test
- visual regression capture/upload
- reused frontend-dist verification
- Tauri release build
- packaged Focus runtime capture/validation
- packaged Focus runtime artifact upload
- diagnostic/runtime harness upload

## Artifacts

Packaged Focus runtime visual:
- id `11129918136`
- digest `sha256:e8d6733de16ebe60e3e9fa2968bee87bf0db1037381e04f18c3f294225c84570`

General visual regression:
- id `11129892760`
- digest `sha256:7ccfda9d8c80865850e8b574bb08cb9b5b4feb62c5a4fb704efc72d5381fc470`

Windows runtime harness:
- id `11129693452`
- digest `sha256:0f708660fd9449e3239af6d89932790df188d4f5a23152c6c22c20e9037578f3`

Runtime harness ZIP contents:
- `narro.exe` — 14,713,344 bytes — SHA-256 `cd57a17a941ae2b38cfb28d37cdb036c61731a3691ee59e190384a7be057dc3e`
- NSIS setup — 3,723,424 bytes — SHA-256 `59b218908d73d51f3d5b111034552c62e96438721f41d6477244b8130c024930`
- MSI — 5,296,128 bytes — SHA-256 `2ee0e73dffe805137d95f9340f3e0380046ebfdf557d8440734b5312286a1386`

## Mandatory artifact inspection

Packaged runtime metadata and screenshots were manually inspected.

Settled native/DOM evidence:
- same HWND `0x10216` across Panel / compact Timer / expanded Timer;
- DPI 96 / scale 1 hosted runner;
- Panel client/root 340×700, native visible region full Panel;
- compact Timer visible region 340×110;
- expanded Timer visible region 340×300;
- Panel, compact and expanded roots report `overflow-x/y: hidden`;
- zero unintended scrollers at every captured checkpoint;
- presentation/active-presentation/expanded-region flags reconcile correctly;
- Panel returns cleanly after Timer sequence;
- stdout contains successful SQLite startup diagnostic; stderr is empty.

Static light/dark visual fixtures for Focus Panel and compact/expanded Timer were inspected and show no new layout regression.

Transition frame sequences were also inspected. The hosted environment reports `prefersReducedMotion: true`, so native motion samples contain only start/end positions rather than proof of the standard-motion ~250 ms character. This remains a physical acceptance requirement.

The packaged-runtime harness still uses its deterministic idle presentation fixture; therefore B5/B6 are proven by repository/Rust/static contracts, not by an active-session hosted runtime scenario. Final acceptance still requires the physical active-session matrix.

## Physical gate

This exact candidate is ready for physical validation but **must not be merged yet**.

Required physical checks:
1. run exactly one Narro runtime;
2. create/start an eligible Today task and verify active session;
3. repeatedly alternate Panel↔Timer with Ctrl+Shift+T;
4. verify same task/session and continuous authoritative elapsed/time accounting;
5. repeatedly Expand↔Collapse;
6. verify no white/blank/stale/staging frame, no duplicated pixels and no document scrollbar;
7. verify `Blitz now` returns an already-visible Timer to Focus Panel;
8. verify Ctrl+Shift+T while runtime is Idle/no-task is a presentation no-op;
9. verify Focus/Home and shortcut behavior with no second-instance shortcut conflict;
10. execute real 100%↔125% monitor crossing, edge/taskbar placement and topology recovery.

Because main tracking Markdown has advanced after the current #192 ancestry, a source-identical docs reconciliation and final exact-head Windows CI will still be required after physical PASS and before guarded merge.

No roadmap or milestone counter advances from automated CI alone.
