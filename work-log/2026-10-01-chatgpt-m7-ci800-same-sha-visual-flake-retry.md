# M7 CI #800 same-SHA visual flake retry

Date: 2026-10-01

PR #192 exact head:
`7962411435bcb2ebf71c775963711273220a5186`

Windows CI #800 / run `36833625252` attempt 1: **FAIL** before the physical-build boundary.

Exact failure:
- Repository preflight passed.
- Failure occurred in `Capture Visual Regression Fixtures`.
- `task-scheduling-light` failed to report its ready marker after four capture attempts.
- Edge emitted hosted-runner noise (`optimization_guide ... Edge LLM: Not supported on non Desktop SKU`).
- Because visual capture failed, Tauri release/physical build/smoke steps were skipped in attempt 1.

This does not constitute evidence of a source scheduling regression:
- the same `task-scheduling-light` fixture required a retry in exact-green CI #795 and then passed;
- no relevant source changed between the accepted scheduling contract and current artifact-boundary correction;
- the artifact-boundary changes are confined to CI/config/smoke infrastructure.

No source change was made for this failure.

The failed `build-and-test` job was rerun at the same exact commit SHA. CI #800 is now attempt 2 and remains the active exact-head gate.

On attempt-2 PASS, review the new production-config `narro-m7-physical-windows-x64` artifact and the direct runtimeVisual-boundary smoke evidence. On attempt-2 FAIL, inspect the exact new failure before any code change.
