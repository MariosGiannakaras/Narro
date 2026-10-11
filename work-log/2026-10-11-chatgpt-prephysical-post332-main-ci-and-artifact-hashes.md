# 2026-10-11 — Pre-physical integrated-main CI and actual production artifact SHA proof

## Objective and source boundary

The user's 70/70 S0 audit and independent 50/50 coverage confirmation were already complete. Their next instruction was to close safe source/CI work and minimize Codex's physical Windows workload without claiming native PASS from automation. Do not re-audit validated work or take over another agent's assigned #321 branch.

- GitHub repository: `MariosGiannakaras/Narro`.
- Source-bearing accepted post-audit union: #322/#323/#324/#326/#327/#328/#329/#330/#331/#332 = **10/11**; accepted final merge `c91c5dd86d626ab9a26d763f7e623d11df47c945`. Latest top `main` read at this checkpoint: `eba7fb3d4d898ffc63345a795342ba28aaec0381` (subsequent documentation-only commits do not alter executable source).
- Other-owner PR [#321](https://github.com/MariosGiannakaras/Narro/pull/321) remains **OPEN, head `f129c37b30b27897971f3aa8452c563f8f955111`, Windows FAIL** exact run `38092529298`. Failure is real dark focused-action painted screenshot/keyboard owner, while its validation and fast gates passed; the remaining Windows packaged upload failure was downstream. Do not change or merge this reserved branch without reassignment; full Codex visual/physical gates remain separate.

## New, independently checked integrated-main Windows result

GitHub [push run 38124932682](https://github.com/MariosGiannakaras/Narro/actions/runs/38124932682), exact `head_sha=c91c5dd86d626ab9a26d763f7e623d11df47c945`, event `push`, attempt 1, **completed success**. Three actual jobs all **SUCCESS**, not inferred from a PR run:

| Job | GitHub job ID | Verdict |
| --- | --- | --- |
| validation-gate | 114427237264 | SUCCESS |
| fast-gate | 114427257381 | SUCCESS |
| windows-candidate | 114427939235 | SUCCESS |

Verified Windows job step results: frontend dist reuse, Rust check, Clippy, unit tests, performance harness self-test, visual regression fixture capture, release build, packaged Focus runtime capture, physical-validation Tauri release, physical build smoke, M7 validation logging smoke, M1 diagnostic storage isolation smoke and all corresponding uploads **SUCCESS**. This is a genuinely assembled production source tree through #332, unlike earlier #316/#319/#320 separate candidate artifacts.

Downloaded the actual GitHub artifact **`narro-m7-physical-windows-x64` ID 11697127517**, 15,332,946-byte ZIP ([artifact link](https://github.com/MariosGiannakaras/Narro/actions/runs/38124932682/artifacts/11697127517)), locally verified SHA-256 against GitHub's declared digest and individually decompressed/hash-calculated all three entries:

| File | Uncompressed bytes | SHA-256 |
| --- | ---: | --- |
| Downloaded artifact ZIP | 15,332,946 | `74696defe7963e629878a70ae4fb820734d1aba20958d3714d385ca81579e1d6` |
| `narro.exe` | 15,879,680 | `8292d9e4cf27742332a4a970f005e5a23713f58a0375f93ed4542a21a5adc0c9` |
| `bundle/nsis/Narro_0.1.0_x64-setup.exe` | 4,104,685 | `c1b8a8bf5c650f43a1aa452bd8ddddb1813cdc6434da30775a64692755cc5379` |
| `bundle/msi/Narro_0.1.0_x64_en-US.msi` | 5,795,840 | `d2880877304caa13b21d794c5a75bde7668ed0c9806c3d838ea053b008ad043b` |

These are **byte-level validation of the pre-#321 candidate**, not a claim the final release or the old physical failures is accepted. Exact older physical CI1046 checks, their restoration semantics and the current native checklist remain in `docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md`; do not reuse CI1046 native PASS for replacement code.

## Targeted pre-physical semantic/source boundary review

Read current latest source for `src/FloatingTimerFoundation.tsx`, `src/FocusSurfaceCoordinator.tsx`, `src/ReportsSessions.tsx`, `src/ReportsSessionsView.tsx`, `src/FocusPanel.tsx`, `src/PreferenceSettingsSections.tsx`, `src-tauri/src/timer_region.rs`, `src-tauri/src/floating_placement.rs`, and existing bundled prephysical test coverage. The time-up label is explicitly rendered when authoritative timer state is `time_up`, the Focus coordinator's reentrant mode transition uses a synchronous ref/native rollback, and Reports Add Session maintains pending-dialog/focus containment. Prior #302, #322–#332 code, source-extracted callback tests and CI already target these specific boundaries. No **new evidenced source defect** was established by this targeted read; it is **not** a claim of exhaustive proof, native frame-level correctness, keyboard/UIA fidelity or Blissit source parity. Low-confidence conditional Q08 must not trigger arbitrary CSS rewrites.

## Exact remaining gates / next action

1. #321 remains other-agent-owned; wait for owner correction on **the same branch**, require exact-head validation/fast/windows green and verify actual dark/light action-rail painted pixels; expected-head guarded merge, changed blob identity and main reconciliation. Previous failed screenshot is an honest red gate, not permission to relax the validator.
2. Once #321 is accepted, **Q12** requires ONE fresh final combined resulting-`main` production Windows candidate with validation/fast/windows green and actual downloaded ZIP, uncompressed EXE, NSIS, MSI SHA-256. The current artifact cannot be labeled final post-#321.
3. The user-paused Codex physical Windows batch should then exercise only still-OPEN native gates (M7 C4 motion; M6 initial morph; Finding35 actual Time's Up; Finding29 pending modal UIA focus; Finding27 monitor identity/placement; M8 real notifications/sound; required remaining M1/M5/M9/source acceptance as current tracker directs). These need real interaction/continuous capture, correct DPI/theme/settings, exact executable hash and profile/Windows settings restoration; no source/physical PASS invented. M10 remains gated and optional M11 dormant.
4. No new source/config/test files, branches or duplicate CI were created in this evidence-only slice. The resulting-main three-job green run and artifact were **already present** and verified rather than wastefully rerun; documentation-only update goes directly to main with `[skip ci]` and immutable log preservation.
