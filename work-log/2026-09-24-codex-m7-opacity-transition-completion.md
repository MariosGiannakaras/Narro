# 2026-09-24 — M7 focus opacity transition completion

Agent: Codex. Coherent slice: Panel/Timer mode and collapsed/expanded Timer transition completion, cancellation recovery, and executable async coverage.

## Source and reasoning

PR [#136](https://github.com/MariosGiannakaras/Narro/pull/136), exact head `41618d984e9e7c030f60b15daa5097ffae0b6e3a`, changed `src/FocusSurfaceTransition.tsx`, `src/FloatingTimerFoundation.tsx`, `src/focus.tsx`, new `src/opacityTransition.ts`, two existing integration contracts, new executable `scripts/test-opacity-transition.mjs`, and `package.json`. The prior paths resolved their pending mode/resize state only from `transitionend`. CSS can legitimately produce no transition, such as a state change before an entrance is painted, or cancel one; in either case the old promise could remain pending. The shared helper observes the element's actual opacity transition through `getAnimations().finished`, handles the no-animation case, and checks the final computed opacity. A cancelled transition at the required boundary can complete; one at an incorrect boundary fails explicitly. Mode failure clears the pending lock and reports an error. Timer resize keeps the renderer at the new expanded state if native resize already committed and only the entrance phase fails.

No timer/session/domain/native code, CSS timing, WebView count, or display-topology ownership changed. The source does not claim to correct the previously observed WebView2 stale-pixel failure without a physical retest.

## Validation and merge

- Local `npm ci`, focused opacity behavioral tests, affected Focus/Timer integration contracts, `npx tsc --noEmit`, full `npm run preflight:frontend` including Vite production build, `npm run check:rust:fmt`, and `git diff --check`: **PASS**. Local Rust compile: **NOT RUN** because no Rust source changed and the desktop shell lacks MSVC `link.exe`.
- Behavioral tests execute no-transition completion, waiting for the real opacity transition while ignoring an unrelated transform animation, cancellation at the correct end state, cancellation at an incorrect end state, and a missing end state.
- Local headless Edge DevTools check: **PASS** for browser API behavior. An established 50 ms opacity CSS transition appeared in `getAnimations()` as one opacity transition and ended at computed opacity `0`; when no transition was established, the end state was observed without one. This checks the browser primitive, not the Narro compositor path.
- Exact-head PR Windows CI #501 / run `36010919741` / job `107671092266`: **PASS**. Repository Preflight, visual fixtures, Tauri Release, and artifact uploads all passed. Runtime artifact `10813650281`, digest `sha256:da1b4decb8f95dc58455339b6ea9678d004434f46d19d07e286722eecdb4d526`; visual artifact `10812927597`, digest `sha256:3a7e48a15b5c2a632d3c6f0e4bc877b6dcdcb1e15d279cce334346261d8abdd4`.
- PR was mergeable at the exact head, with no reviews or comments. Expected-head guarded squash merge produced `0fc7401eed306024f8114bb2d5a8c00380541e9a`. PR and resulting-main trees are identical: `f7dd73ab77556ab3c078f4670e6051d07c98e8f3`. Automatic main CI #502 / run `36013056226` was **CANCELLED** after tree identity was verified, avoiding a duplicate release build. The PR artifact is the exact-tree physical candidate.
- Physical Windows compositor, mode/resize animation, shortcuts, monitor placement, topmost behavior, and final-UI resources: **NOT RUN**. Top-level M7 items remain open.

## Tracking and continuation

`TODO.md` gains an automated item-7 subcheck only. `STATUS.md` and `HANDOFF.md` identify the current tree/artifact; `docs/M7_FLOATING_RUNTIME_VALIDATION.md` uses the PR artifact for one consolidated session. `AGENT_WORKFLOW.md` documents cancellation of a duplicate automatic main run only after exact tree identity is proven and the PR artifact is suitable. The next safe action is to verify fresh repository state, then run the consolidated physical M7 matrix when available or fix an evidence-backed independent source failure. Do not advance to M8 before physical M7 acceptance.
