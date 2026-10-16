# PR362 final corrected candidate

Source `560efeb076d2ec167232b9d86aa3354f6893214b` is pushed on `fix/m5-m6-cross-window-subtasks`; [CI38894130069](https://github.com/MariosGiannakaras/Narro/actions/runs/38894130069) is in progress. [Final preflight, four rendered cases and provenance](evidence/pr362-final-candidate-20261016/README.md). Prior `0e9cdae1` and its green CI38889617175 are superseded for acceptance, not merged.

Final-review regression reproduced lost committed-refresh errors in both Board and Focus. Synchronous error latches preserve the blocked-write explanation against late successful/error reads and reject same-render unsafe retries. Mounted production-component red/green and actual-handler guards cover the whole failure path. Full frontend preflight and four actual rendered theme/motion cases PASS. No native PASS yet; no active recording or isolated profile.

Next: use exact final CI result; on 3/3 success perform expected-head guarded merge, prove resulting-main executable/build/test/workflow identity, verify provider artifact SHA/CRC/PE-x64/EXE hash, then one protected dual-monitor Windows recording of three cross-window directions. Existing accepted PA360 source-control/Search checks remain valid on unchanged dependencies. M1–M4 complete **4/10**, M5–M9 remain scoped OPEN, M10 hard gate blocked, M11 dormant.
