# 2026-09-03 — Floating performance harness CI validation

## Result

PR #7 (`m1-floating-performance-harness`) was validated on its exact merge context and squash-merged to `main` as `4a475d3863e80ac0520bcae9ec728658b0c25195`.

Final PR head: `3bc2940a348cf92f78b59ab122bc7d5d7fa62997`.

Tested base: `196e839dc00db5f87ed9dcb894b6fd2675695c33`.

`main` was re-read before merge and still matched that tested base; merge used the expected PR head SHA.

## Windows CI evidence

Windows CI #66 / run `33727105026`: **SUCCESS**.

Validated on Windows:

- repository/config preflight: PASS;
- frontend production build: PASS;
- Rust fmt/check/Clippy/tests: PASS;
- `npm run test:performance-harness`: PASS;
- deterministic PowerShell process-tree selection test: PASS;
- deterministic memory aggregation test: PASS;
- deterministic CPU interval/percentage calculation test: PASS;
- deterministic process-churn detection test: PASS;
- Tauri release build: PASS;
- diagnostic artifact upload: PASS.

Artifact:

- ID: `9882735216`;
- name: `narro-m1-runtime-harness-windows-x64`;
- digest: `sha256:2eef59e89911a588a2699a79fc07c4af32f22068e05decf5cd76b4809dbc9f98`.

## What this proves

The measurement harness mechanics are automated-validated on Windows and the same source context still produces the Narro release artifact.

The harness:

- targets the Narro root plus descendants instead of all Edge/WebView2 processes;
- measures CPU from cumulative CPU-time deltas over timed intervals;
- records working set and private bytes for the process tree and each process;
- identifies process churn using PID + process-start identity;
- refuses to present CPU across churn as steady-state evidence;
- emits reviewable JSON/CSV output.

## What remains MANUAL NOT RUN

No hosted CI CPU/RAM values are accepted as the M1 performance result.

Still required on a real Windows 10/11 x64 machine:

- `focusSurface` in compact Floating Timer mode;
- inactive/static timer state;
- `main` destroyed, not hidden;
- at least three valid 30-second-warmup / 60-second sample runs using `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`;
- record all run averages plus their median and the process breakdown;
- interpret the results in `STATUS.md` and decide whether the two-webview Tauri/WebView2 architecture passes the M1 performance gate.

The remaining native capability observations should be performed in the same consolidated physical Windows batch where practical.
