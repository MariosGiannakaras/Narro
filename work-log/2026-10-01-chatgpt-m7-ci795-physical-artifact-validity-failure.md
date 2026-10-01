# M7 CI #795 physical recording — artifact validity failure

Date: 2026-10-01

## Evidence

User physical recording:
- file: `2026-10-01 09-21-24.mp4`
- SHA-256: `80b05a2410c752c8e56d68be37db9b4d92db3cd767b666a909cc60c6f2e20fb5`
- duration: approximately 99.33 seconds
- frame size: 2560×1080 at 60 fps
- intended source candidate: PR #192 exact head `26f4fc25f3e7dcb4c48df53b4123251fbcf7bce2`
- intended CI: #795 / run `36822373471`

This recording is **NOT valid final physical Gate 7 / Gate 12 evidence** because the supplied executable was not a production-config build.

## Artifact validity defect

CI #795 built Narro using:
`tauri build --config src-tauri/tauri.ci.conf.json`

That CI config overrides the persistent Focus window URL with:
`focus.html?runtimeVisual=1`

The renderer activates `startFocusRuntimeVisualDriver()` whenever that query parameter is present. The driver intentionally:
- creates a list named `CI Focus Runtime`;
- creates a task named `Packaged runtime focus task`;
- starts a one-hour authoritative timer/session;
- hides Main and drives Panel/Timer transitions for packaged capture.

The workflow then uploaded the **same instrumented executable** from `src-tauri/target/release/narro.exe` as `narro-m1-runtime-harness-windows-x64`, and that artifact was supplied for physical validation.

The recording visibly confirms the contamination:
- Main contains the `CI Focus Runtime` list and `Packaged runtime focus task`;
- Focus can display those fixture records/session data during ordinary physical use.

Therefore the physical run is testing CI capture instrumentation mixed with the user's persistent SQLite profile, not the normal Narro product configuration.

## Important interpretation

This finding does **not** invalidate the #795 automated packaged runtime evidence itself. That instrumentation is intentional for the hosted capture.

It invalidates only the artifact handoff boundary:
- automated capture binary may be instrumented;
- user physical validation binary must load production `focus.html` with no `runtimeVisual=1`.

The supplied ZIP contained only EXE/installers and no SQLite database, so the contamination is not a bundled DB. It is runtime fixture mutation caused by using the CI-config executable.

## Correction

PR #192 corrective commits:

### `907d1f97949153b5ccb181ad0ed3d9784efd4605`

Separates automated capture and physical validation builds:
- existing `tauri:ci` remains the instrumented capture build;
- new `tauri:physical-ci` uses `src-tauri/tauri.physical.conf.json`;
- physical config only disables duplicate frontend rebuilding and does **not** override `app.windows`, so it inherits production `focus.html`;
- physical build uses isolated `src-tauri/target-physical`;
- CI uploads a new artifact named `narro-m7-physical-windows-x64`;
- the old instrumented `narro-m1-runtime-harness-windows-x64` is no longer the physical artifact.

### `5bda58516f9d1010d5d5b7b7f9abac76408c3db9`

Adds runtime artifact smoke validation before upload:
- launches the production-config physical EXE with isolated APPDATA/LOCALAPPDATA;
- explicitly removes `NARRO_FOCUS_CAPTURE_DIR`;
- requires isolated `narro.db` to be created;
- waits long enough for an accidentally activated visual driver to persist data;
- scans the SQLite bytes and rejects the build if `CI Focus Runtime` or `Packaged runtime focus task` appears;
- only after that smoke passes may `narro-m7-physical-windows-x64` upload.

Static config/harness contracts now protect build order, isolated target path, production-window inheritance and the runtime smoke gate.

## Physical observations that remain useful but non-closing

The recording still provides qualitative evidence that:
- expanded Timer now visibly retains task title + live time;
- compact/expanded transitions are materially improved;
- Main/Focus projections visibly update during parts of the run;
- the startup blank/white first-paint defect remains visible and stays routed to later UX cleanup.

However none of these observations may close M7 because the running binary was CI-instrumented and had mutated the profile/session.

## Current gate

PR #192 exact head:
`5bda58516f9d1010d5d5b7b7f9abac76408c3db9`

Windows CI #797 / run `36825553397`: pending at checkpoint creation.

A new physical run must use the **new production-config physical artifact from #797 or later**, not any `narro-m1-runtime-harness-windows-x64` artifact.

Before that retest, the user's existing profile may still contain the fixture list/task created by the bad physical artifact. Do not auto-delete user data by title in production code. For clean acceptance, the user should remove the known CI fixture records manually or use a clean validation profile before recording.

No milestone or current-slice counter advances from this invalid physical recording.
