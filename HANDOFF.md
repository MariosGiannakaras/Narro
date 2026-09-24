# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active M7 `TODO.md`, relevant `STATUS.md`, the latest immutable `work-log/` entry, and live PR/CI state. Prior source evidence remains in older work logs.

## CURRENT MILESTONE

Milestone 7 — Floating Timer mode. Milestones 1–6 are complete; M7 top-level items 1–6 are validated. Current compact progress: `6/10M || 5/5 | 6/14`. Items 7–14 retain physical Windows gates. The user authorized independent M7 work while physical testing is unavailable; do not advance to M8 before M7 acceptance is observed.

## CURRENT SOURCE AND VALIDATION

PR [#138](https://github.com/MariosGiannakaras/Narro/pull/138) is the latest source slice. A physical test of CI #501 reproduced stale expanded controls in collapsed Timer geometry. Live WebView inspection found the action strip and collapsed heading mounted together: the action and subtask siblings shared the same React key. PR #138 gives them distinct stable keys. Its executable Edge fixture covers three expand/collapse cycles and fails against the duplicate-key baseline. The new runtime still needs a physical retest.

- Exact PR head `7900825ca474c49fdf297a8d7a42cff043ea325c`: Windows CI #503 / run `36046718991` / job `107791974753` **PASS**, including Repository Preflight, visual fixtures, Tauri Release, and artifact uploads.
- Expected-head guarded squash merge: main source `5e0e0c1018d319ee39cc30f8abce9d1febdbdd94`. PR head and main trees are identical: `a44422e0cc8c3b6842408adffc6b615dd7637c0d`. Automatic main CI #504 / run `36048915712` was **CANCELLED** after identity was proven.
- PR runtime artifact `10829228469` (`narro-m1-runtime-harness-windows-x64`), digest `sha256:6670cdf19365cbfe381fa0f6ff488556595942038cac9b16bd3d5626f310a0ec`; visual artifact `10829780583`, digest `sha256:d058febbb441c34ecb9e4279c3499787fa56e11fef85064311c21b686b349b78`.
- Local full frontend preflight/build, Edge Timer visual capture and lifecycle validator, Rust formatting, and diff check **PASS**. The negative control with the original duplicate keys failed at cycle phase 2. Local Rust compile was **NOT RUN to completion** because MSVC `link.exe` is unavailable. The new runtime's physical Windows checks are **NOT RUN**.

The physical re-tests of CI #480 and #501 found repeated stale/duplicated action-strip pixels during expand/collapse. PR #138 addresses the DOM cause observed in CI #501; only a new physical run can close that observation gate. Items 8–10 and 12 have automated source evidence; items 11, 13, and 14 require observation/measurement. `TODO.md` keeps their top-level gates open.

## NEXT AGENT ACTION

1. Recheck main, local/unpublished state, open PRs, and CI. If a concrete independent M7 source failure is found, complete a coherent slice with executable tests and exact-head validation; do not repeat completed PRs.
2. Run [one consolidated M7 Windows session](docs/M7_FLOATING_RUNTIME_VALIDATION.md) with main tree `a44422e` and PR #138 runtime artifact `10829228469`. Confirm the running executable belongs to that artifact before attributing observations to this source.
3. Record each physical PASS/FAIL/NOT RUN, captures, monitor/app conditions, and final-UI resource measurements in a new immutable work log. Fix any observed failure before broadening work. Update `TODO.md`, `STATUS.md`, and this handoff from evidence only.

## USER ACTION REQUIRED

Physical Windows interaction/observation is required for remaining M7 gates. CI cannot prove compositor pixels, shortcut conflicts, monitor/taskbar placement, topmost behavior over other apps, idle motion, or physical CPU/memory.

## INVARIANTS

Narro remains local-only Windows software with `main` plus reusable `focusSurface`. Rust/native owns timer/session, placement, DPI, and persistence. Mode changes, shortcuts, and placement recovery must preserve the live session. Display recovery remains event-driven; no continuous geometry or decorative animation loop. Keep physical and automated evidence distinct.
