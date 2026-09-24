# 2026-09-24 — M7 Timer resize DOM identity

Agent: Codex. Coherent slice: reproduce the physical item-7 failure, correct the observed React DOM identity collision, add an executable resize lifecycle regression, and validate the exact source head.

## Physical diagnosis of the prior candidate

The PR #136 CI #501 runtime artifact `10813650281` was run on a real Windows desktop with one 2560×1080 display. Panel → Timer, active-session continuity, and Timer expand worked. After collapsing, the six expanded action icons remained visibly painted over the collapsed title and timer, including after two seconds. The live WebView DOM confirmed this was retained content, not only a compositor image: the Timer reported `data-floating-expanded="false"` and idle resize phase, yet both one `.floating-timer-foundation__actions` node with six action buttons and one `.floating-timer-foundation__heading` were mounted under the same content node. The tested app was stopped and the original Narro SQLite profile was restored byte-for-byte from its pre-test backup.

`FloatingTimerFoundation` rendered conditional `FocusLiveActions` beside `FocusLiveSubtasks`, both with `key={liveTask.id}`. These are sibling elements with duplicate keys. On action-strip removal during collapse, React could retain the wrong sibling. Native redraw/show-hide experiments and disabling the CSS transform did not remove the stale DOM node, supporting a reconciliation cause rather than a native repaint cause. This is diagnosis of the #501 candidate, not a physical PASS for the new candidate.

## Source and regression

PR [#138](https://github.com/MariosGiannakaras/Narro/pull/138), exact head `7900825ca474c49fdf297a8d7a42cff043ea325c`, assigns distinct stable `actions:` and `subtasks:` key prefixes. The production Floating Timer component is exercised through the existing Edge visual fixture: three complete expand/collapse cycles click its real subtask control and assert the rendered action strip, heading, and subtask panel counts at all seven phases. A negative control with the original duplicate keys built successfully but failed at cycle phase 2: the collapsed DOM retained an action strip. The corrected source passed. Fixture capture now quotes paths so a worktree with spaces uses the same Windows validation as CI; generated visual artifacts are ignored by Git.

## Validation and merge

- Local `npm ci`, full `npm run preflight:frontend`, focused Edge Timer visual capture and lifecycle validator, `npm run check:rust:fmt`, and staged diff check: **PASS**. Local Rust compile: **NOT RUN to completion** because MSVC `link.exe` is unavailable; no Rust source changed.
- Exact-head PR Windows CI #503 / run `36046718991` / job `107791974753`: **PASS**, including Repository Preflight, visual regression, Tauri Release, and artifact uploads. Runtime artifact `10829228469`, digest `sha256:6670cdf19365cbfe381fa0f6ff488556595942038cac9b16bd3d5626f310a0ec`; visual artifact `10829780583`, digest `sha256:d058febbb441c34ecb9e4279c3499787fa56e11fef85064311c21b686b349b78`.
- Expected-head guarded squash merge produced main `5e0e0c1018d319ee39cc30f8abce9d1febdbdd94`. PR head and resulting-main trees are identical: `a44422e0cc8c3b6842408adffc6b615dd7637c0d`. Automatic main CI #504 / run `36048915712` was cancelled after identity was proven to avoid an equivalent second build. The PR artifact is the exact-tree physical candidate.
- Physical Windows retest of the #138 runtime, other M7 shortcuts, position/topmost/taskbar behavior, idle observation, and final resource measurements: **NOT RUN**. The item-7 top-level acceptance gate remains open.

## Continuation

Use the exact PR #138 artifact for the consolidated physical matrix in `docs/M7_FLOATING_RUNTIME_VALIDATION.md`. Confirm the running process path before attributing any behavior. If the new runtime still fails, inspect the live DOM and rendered pixels at the failure phase before another source change. Preserve the user's Narro profile and keep physical and automated evidence separate.
