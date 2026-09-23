# M7 item 7 — Codex Computer Use Windows test attempt blocked

Date: 2026-09-24 (Europe/Athens)
Agent/tool: Codex / GitHub connector, GitHub CLI, Computer Use
Milestone/item: M7 item 7, final Windows motion checkpoint
Result: **NOT RUN / no valid repetitions**

## Refreshed source and CI

- Fresh clone `main`: `ab0bdfed7f2bca365abf442224323c5bf8482b85` (tracking-only descendant of the motion source).
- Motion source/test SHA: `36a3f6f6a1ecd5249839100e1e1249305050fa07`; tree `207b9bbef4fdcf5d4aec95a81ae6604bc56b55a0`.
- Open PRs at inspection: none.
- Latest resulting-main Windows CI #477: run `35907803574`, success, source SHA `36a3f6f6a1ecd5249839100e1e1249305050fa07`.
- Runtime artifact: ID `10771699056`, `narro-m1-runtime-harness-windows-x64`, GitHub artifact digest `sha256:1da888a05d0158b6db30c5e6f3b17688cb660cac2ef103ec5c949997fad1daa2`.
- Downloaded raw `narro.exe` SHA-256: `d0c82a2fea79d4100ae4bb398207a1b2300ead7eec68071d291b6bc8de4c1fc0`.

## Running executable provenance

Read-only Windows process inspection found `narro.exe` PID 13816 at `C:\Users\MariosG\AppData\Local\Narro\narro.exe`. Its on-disk SHA-256 was `78515bdb3a05bb9ef27920b1c3c67b56b7950a7759ef0e3a93abd0c978f58dd0`, different from the CI #477 raw executable. PID is an observation at inspection time, not a durable identity. The already-running installed app therefore cannot be accepted as an exact-build item-7 test.

## Computer Use attempt

The Computer Use skill and its guidance, API, and confirmation policy were read. The required `@oai/sky` initialization through `mcp__node_repl__js` failed before JavaScript execution and before window enumeration with:

`codex/sandbox-state-meta: sandboxCwd is not a local file URI: file:///mnt/c/Users/MariosG/Documents/Codex/2026-09-24/continue-the-narro-implementation-from-github`

The helper was reset and a lightweight `list_windows()` attempt failed with the same error. No app input, screenshots, visual observations, or transition repetitions occurred. No claim about transition smoothness, flash, flicker, compact intermediate scaling, final position, scrollbars, or timer/session continuity is supported by this attempt.

## Tracking and continuation

`TODO.md` item 7 remains unchecked; M7 remains 6/14 and the item-7 slice remains 4/5. `STATUS.md` and `HANDOFF.md` record the attempt and preserve the exact CI artifact identity. No source correction is warranted without a visible motion symptom; item 8 stays gated.

Recover Computer Use access, close the older installed instance through its normal UI, run the raw CI #477 executable, verify the process path and SHA-256, then observe five repetitions each of Panel to Timer, Timer to Panel, and Collapsed to Expanded to Collapsed with the required state/visual checks. Label resulting evidence **Codex Computer Use Windows test**. Only a valid full pass can close item 7 and unblock item 8.
