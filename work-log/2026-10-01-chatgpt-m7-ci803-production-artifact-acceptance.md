# M7 CI #803 automated PASS and production physical artifact acceptance

Date: 2026-10-01

## Exact candidate

PR #192 branch:
`plan/m7-single-focus`

Exact head:
`440b172565d94fadb3e814559bec5f3b47e48012`

Windows CI:
- run number: #803
- run id: `36840822689`
- result: **PASS**

## Why this candidate supersedes the earlier physical builds

The old CI795 user-facing artifact was invalid because it reused the CI-instrumented `runtimeVisual=1` executable.

Current workflow now separates:
- instrumented automated Focus capture build;
- production-config physical validation build from isolated `src-tauri/target-physical`.

The physical build is uploaded only as:
`narro-m7-physical-windows-x64`

## Required artifact evidence

### Production physical artifact
- artifact id: `11151976720`
- GitHub digest: `sha256:cc193e2363c01721e8ecc16207d1faf08001dd9194e415657d8605518e0007aa`
- downloaded ZIP digest matched exactly.
- contained `narro.exe` SHA-256:
  `625caea10060e69b0148ca22c6e2f645cd675536d505a31f2e31db974df4cd43`
- NSIS SHA-256:
  `518632f97402920fb1cb1e8a9b28502f11b6aca4405438c80491519c4016918f`
- MSI SHA-256:
  `46cafdbc907f22309613d3ba6a5e5c446b79e6043718d066ac35cbc1cce842d4`

### Packaged Focus runtime visual
- artifact id: `11151474106`
- digest: `sha256:2efdb3eafdf5f8e3fd581263eceae1aec60914bf0041834c5a4ac7467fe53b64`
- downloaded digest matched exactly.

### Visual regression
- artifact id: `11151548652`
- digest: `sha256:979a58467f70b518ea236160a2b7673d7acc32c2444bcdc808345ccb335615f8`
- downloaded digest matched exactly.

## Production physical artifact smoke

CI step:
`Verify Physical Validation Build`

Result: **PASS**

Authoritative log:
`Physical validation build stayed free of CI runtimeVisual checkpoints.`

The smoke deliberately enables `NARRO_FOCUS_CAPTURE_DIR` while launching the production-config physical EXE. No `checkpoint-*.json` appeared, proving that the production Focus window did not activate the CI `runtimeVisual=1` renderer driver.

This closes the artifact-validity defect that invalidated the CI795 physical recording.

## Scheduling visual reliability

The recurring `task-scheduling-light` hosted failure was corrected through a fixture-only readiness change, not by relaxing product or visual assertions.

Fresh #803 visual regression capture passed. The accepted light scheduling screenshot visibly contains the fully hydrated Schedule / Repeat dialog and the required geometry contract.

## Same-DPI Timer→Panel endpoint correction

CI #801 had exposed a real same-DPI endpoint correction:
`(388,80) → (684,0) → (668,0)`

Production correction `5c8f4c4e...` makes same-DPI Panel motion plan against the actual outer HWND size while preserving cross-DPI target-scale planning.

Fresh #803 packaged runtime transition samples:
- Timer→Panel starts at `(388,80)`;
- next sampled position is `(668,0)`;
- every later sample remains `(668,0)`;
- the old `684→668` reverse correction is absent.

The corresponding actual frames were visually inspected:
- first frame is the compact active Timer;
- next settled frame is the Focus Panel;
- no blank/stale intermediate presentation is visible in the reduced-motion hosted sample.

Panel→Timer likewise lands directly at `(388,80)`.

## Settled Focus evidence

Fresh packaged runtime still demonstrates:
- real active `Packaged runtime focus task`;
- same Focus HWND `0x1020A` across Panel, compact and expanded Timer;
- compact native visible region 340×110;
- expanded native visible region 340×300;
- expanded Timer retains task title + live countdown;
- zero unintended root/document scrollers in settled captures.

Hosted runner remains `prefersReducedMotion: true`, so normal Windows motion character and real mixed-DPI remain physical-only acceptance gates.

## Physical acceptance status

This head is **automated-green and artifact-accepted** but M7 is not complete.

Next required evidence must use the exact production physical artifact above.

Before recording, remove the old CI fixture records (`CI Focus Runtime` / `Packaged runtime focus task`) from the validation profile or use a clean profile. The new production build will not create them, but data left by the invalid CI795 artifact can remain in SQLite.

Required physical matrix:
1. one Narro authority/process; second launch does not create a competing runtime;
2. active task/session;
3. repeated Panel↔Timer;
4. repeated compact↔expanded;
5. same task/session and continuous authoritative time;
6. no white/blank/stale/staging/duplicate pixels/document scrollbar;
7. visible Timer → `Blitz now` → Focus Panel;
8. idle/no-task Ctrl+Shift+T and Find Timer no-op;
9. Main/Focus/Home cross-window board reconciliation;
10. always-on-top over maximized/fullscreen app;
11. drag/save/restart placement near edges/taskbar;
12. two monitors at 100%↔125%, crossing, expand/collapse and topology/hotplug recovery.

No roadmap or small-slice counter advances until physical PASS.
