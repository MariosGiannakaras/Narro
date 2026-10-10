# 2026-10-10 — Frozen 06:00 retrospective audit P04 / PR305 A01 synchronous Focus action gate

## Authority and verdict

**P04 independently AUDITED / SOURCE-AND-AUTOMATED-CI-PASS within its stated per-mounted FocusLiveActions scope. Native Windows interaction and other component owner boundaries OPEN.** This item is review coverage, not milestone closure or an end-to-end timer persistence proof. Source S0 scope frozen in `docs/AUDIT_2026-10-10_FROM_0600_TRACKER.md`. User specifically asked to continue narrow independent PR reviews and report actual code PR X/18 separately from 70 combined review units. No source/test/CI edit, no new PR, no user-paused physical Codex session and no optional M11 activation in this slice.

PR [#305](https://github.com/MariosGiannakaras/Narro/pull/305) final exact head **`73f95f5ce1efa2995025127890b5624aa8d9a814`**, merged 2026-10-10T11:45:44Z as **`9203bf7ec3cd096063059cef2e4326c1199744b6`**. Four patch paths directly inspected:
1. `src/focusActionGate.ts` — new synchronous per-mounted gate.
2. `src/FocusLiveActions.tsx` — real action wiring before first async side effect.
3. `scripts/test-focus-action-gate.mjs` — executable real pure gate with deferred mock work and source-wiring checks.
4. `package.json` — test command registration and fast frontend preflight reachability.

## Exact CI and Git identity

Original PR exact-head [workflow 38047897329](https://github.com/MariosGiannakaras/Narro/actions/runs/38047897329): **validation-gate SUCCESS**, **fast-gate SUCCESS**, **windows-candidate SUCCESS**. The Windows runner produced source-built validation, diagnostics, physical-candidate and static visual artifacts on head `73f95f5c...`; no artifact was used to claim a new visual state for this nonvisual PR. The four files independently fetched from accepted head and resulting-main merge commit are **4/4 Git blob-identical**:

| Path | Git blob SHA (PR head = merged main) |
|---|---|
| `package.json` | `3dfba00b7b7e61bcadb58ffa49d3f4b21ae12d9e` |
| `scripts/test-focus-action-gate.mjs` | `97a0547349b05cb5a36bfbe26bb992b348bdf88c` |
| `src/FocusLiveActions.tsx` | `e34aec896c0d36a91a229b40b40509ddcba20cda` |
| `src/focusActionGate.ts` | `a38646430dff597eb03b9b51e2597f2439b97b9f` |

Re-read current `main` versions of `src/focusActionGate.ts`, `src/FocusLiveActions.tsx`, `scripts/test-focus-action-gate.mjs`, `package.json`, and `src/FocusPanel.tsx`; original gate code and exact test blobs remain present, `test:focus-action-gate` is declared and referenced by `preflight:frontend`. Later #312 added a separate `focusMutationOwnerRef` to `FocusPanel` for row/add/live/change-list/delete/Home; this is distinct from the five FocusLiveActions timer operations, not reason to reinstate historical React-only locks.

## Causal source review: what actually is and is not protected

Before #305, historical #301 `FocusLiveActions` checked only React `pendingAction`; two event handlers in one render could read the same `busy=false` and begin conflicting native calls. #305 adds `const actionGateRef = useRef(...)` initialized once per mounted component. Pure `createFocusActionGate()` has synchronous exclusive `active`, `tryBegin(action)` rejects any request while active, `finish(action)` releases only for the named active owner, `current()` exposes owner for guard checks. `beginMutation(action)` returns early when fixture/busy or synchronous `!actionGate.tryBegin(action)`, claims **before any awaited IPC/state read**, sets pending/status. All production entry points follow: `run` covering Break, Pause/Resume and Extend; `handleSkip`; `handleDone`. Each successful claim encloses existing data reads/native command, projection/status and catch in `try/finally { finishMutation(action) }`; `beginBreak` validates preferences and rejects when owner active. Errors remain visibly reported, `Done` retains authoritative commit-then-success logic and special recovery when next task fails, Rust remains final session authority. No changed UI labels, action control CSS, accessibility, clock presentation or visible visual layout in these four patch files.

**Automated test quality:** test imports the **real `createFocusActionGate` production TypeScript function** (run with Node strip-types). It checks owner acquisition; duplicate same owner; different owner exclusion across Done/Skip/Pause/Break/Extend; wrong-owner `finish` does not release; valid release; deferred work admits only one write across same-tick Done×2 and Skip; promise rejection releases owner and future Extend can acquire. Additional static regex guards confirm `FocusLiveActions` callsites and registration in preflight. **Explicit limitation:** actual `FocusLiveActions.run/handleSkip/handleDone` React handler functions are NOT executed under event-loop controlled Tauri IPC in this PR's test. The deferred asynchronous harness models the production mechanism with real gate, not end-to-end native writes. Do not infer actual double transactions were reproduced before fix or native multi-window retry behavior validated.

**Lifecycle/owner boundary:** per-mounted `FocusLiveActions` instance only; simultaneous separate components or after unmount use their own owners. The current Focus coordinator ensures presentationActive ownership of Panel vs Floating and the Rust timer/session API remains authoritative, but independent Next Task/Rest success handler ownership is **not** covered. A request arriving after first command/finally but before React rerenders can be admitted using old UI state; any authoritative command validator, current snapshot and further guards must handle that boundary; no actual duplicate side effect confirmed here. This is not a reason to broadly rewrite #305 without a specific regression.

## Cross-check the prior P02 findings without conflation

- **P02-F02 remains OPEN in current source.** `src/FocusSurfaceCoordinator.tsx::startNextTaskFromSuccess` and `takeRestBetweenTasks` still use only `completionSuccessPending` React state check and update before `await snapshotTimerSession()`, with no synchronous shared ref owner. Thus #305's FocusLiveActions gate **does not close** same-render double Next or Next-versus-Rest risk. P02 retrospective audit already records **source-proven admission, unproven native duplicate write**, and requires targeted actual-handler deferred regression and narrow success-owner ref remediation. #312's `FocusPanel` owner handles row/add/live/change-list/delete/Home, not coordinator success callbacks either.
- **P02-F01 remains OPEN:** PR301 and newer #320 `live-actions-focus` PNGs byte-identical to normal running image while DOM states pass. #305 does not change screenshot capture and this nonvisual PR CI must not be used as a surrogate for tested icon reveal pixels.
- No newly confirmed product bug within P04 gate itself. Original Blitzit source pixel parity and physical Windows C4/M6/native mutation event correctness independently OPEN.

## Result / exact continuation

P04 **AUDITED_SCOPE_PASS_WITH_EXTERNAL_GATES_OPEN**. Fixed retrospective progress after this slice: **7/70** = **7/19 PR reviews**, **6/18 code/test PR reviews** (#280, #301, #302, #305, #319, #320), **0/50** Markdown, **0/1** final integrated candidate; seventh PR is evidence-only #308. Separate accepted source/CI implementation A01–A14 **14/14** unchanged, physical/source-accepted roadmap **3/10** unchanged. **NEXT P05 #306 A02 anchored Focus list picker**, review native/source selector target identity, keyboard and screenshots, retaining P02 F01/F02 remediations on tracker. User-paused physical session not restarted. No local Node/Rust/Windows tests run in this GitHub connector audit; original exact Windows CI evidence inspected directly.
