# M6 Focus live-title scrolling — immutable implementation evidence

Date: 2026-09-14

Milestone: 6 — Blitz Mode / Focus Panel

Ordered item: 11/16 — Implement configured scrolling behavior for the live title.

## Validated contract

The slice consumes the existing persisted `focus.scrolling_title` preference and keeps its established safe default of `false`.

The behavior is deliberately narrow:

- scrolling applies only to the active/live Focus title, not ordinary Focus task rows;
- disabled preference preserves static single-line ellipsis;
- enabled preference scrolls only when the live title actually overflows its horizontal slot;
- overflow detection is event-driven through an initial synchronous measurement and `ResizeObserver`, with no polling or JavaScript animation loop;
- presentation motion is transform-only and does not alter timer or sibling geometry;
- `prefers-reduced-motion` disables the scrolling animation and restores static ellipsis while full-title access remains available;
- source/product evidence does not define an exact scroll speed/direction, so the chosen animation pacing is a Narro implementation detail rather than a source-fidelity claim;
- Milestone 8 still owns preference editing/live settings UI;
- ordinary Focus row-title wrapping remains item 12 scope.

## Implementation

Implementation branch: `m6-focus-live-title-scroll`

Branch base/tracking tip: `f635d2b0bf84cc87f8c5309c3c87a0a70458a34c`

Final exact PR head: `fe16914c341badea32c0087cc2a45385b0988de0`

PR: #111 — `M6: implement configured Focus live-title scrolling`

Changed-file scope at final review was exactly:

- `HANDOFF.md`
- `package.json`
- `scripts/test-ui-focus-live-title.mjs`
- `src-tauri/src/focus_preferences.rs`
- `src-tauri/src/lib.rs`
- `src/FocusLiveTitle.tsx`
- `src/FocusPanel.tsx`
- `src/focusLiveTitle.css`

Implementation details:

- `src-tauri/src/focus_preferences.rs` adds a read-only native boundary for the persisted scrolling-title preference; it does not mutate preferences or add a schema/migration;
- the native unit regression proves absent/default preference reads `false` and persisted `true` reads `true`;
- `src-tauri/src/lib.rs` only adds the new module and command registration;
- `src/FocusLiveTitle.tsx` measures actual horizontal overflow, revalidates with `ResizeObserver`, exposes off/idle/active state, and stores the measured overflow as a CSS custom property;
- `src/focusLiveTitle.css` keeps ellipsis by default, animates only the overflowing active state using `transform`, and disables motion under reduced-motion preference;
- `src/FocusPanel.tsx` reads the persisted preference in production, fails closed to non-scrolling on preference-read failure, keeps that failure nonfatal, and uses the scrolling component only for the live title;
- `scripts/test-ui-focus-live-title.mjs` locks the preference source/default, read-only native boundary, active-title-only wiring, overflow measurement, absence of polling/JS animation loop, transform-only motion, reduced-motion fallback and ordinary-row separation;
- `package.json` includes the deterministic contract test in frontend preflight.

No dependency/lockfile, database migration, task/list/subtask identity, timer/session state machine, scheduling eligibility, selected-monitor/display reaction, ordinary row-title wrapping, Floating Timer, or Preferences UI behavior changed.

## PR CI evidence

### Initial Windows CI #419 — evidence-backed failure

Run: `34783581280`

Job: `103794887023`

The repository preflight reached and passed the frontend/static contracts, including the new live-title scrolling contract and TypeScript/Vite production build, then failed only at `cargo fmt -- --check`.

The exact rustfmt output affected only the new `src-tauri/src/focus_preferences.rs` formatting: two match-arm wraps and the Tauri command signature layout. No logic/compile failure had been reached, and downstream visual/release/artifact steps were skipped because preflight stopped.

Only those rustfmt changes were applied. The resulting final PR head was `fe16914c341badea32c0087cc2a45385b0988de0`.

### Authoritative exact-head Windows CI #420 — PASS

Run: `34783673637`

Job: `103795136716`

Exact head: `fe16914c341badea32c0087cc2a45385b0988de0`

All required gates passed:

- Repository Preflight: SUCCESS
- Windows visual regression fixtures: SUCCESS
- visual regression artifact upload: SUCCESS
- Tauri Release build: SUCCESS
- diagnostic/runtime artifact upload: SUCCESS

PR artifacts:

- visual regression artifact `10326121804`, digest `sha256:a2f832fa137f09bfb3bcde920921a174ded832aa291082c86d418ec101089972`;
- diagnostic/runtime artifact `10325962636`, digest `sha256:fa90989aadb279da4d9b526924acbaba9169b531f8740a20f87f2aaf159fb45b`.

## Final review and guarded merge

Final PR review confirmed:

- PR remained open and mergeable before merge;
- exact head remained `fe16914c341badea32c0087cc2a45385b0988de0`;
- changed-file scope remained exactly the eight files listed above;
- no PR conversation comments;
- no submitted reviews;
- no inline review threads.

PR #111 was squash-merged with `expected_head_sha=fe16914c341badea32c0087cc2a45385b0988de0`.

Resulting main source/test SHA:

`088b9dd75a7af0aa7e5d32dcbcfffdbc501d90cb`

Tree:

`fbc93b4779f1f8988b4e3f38e1205facf9f7023b`

## Resulting-main authoritative validation — PASS

Windows CI #421

Run: `34785000692`

Job: `103798741480`

Exact main source SHA: `088b9dd75a7af0aa7e5d32dcbcfffdbc501d90cb`

All required gates passed:

- Repository Preflight: SUCCESS
- Windows visual regression fixtures: SUCCESS
- visual regression artifact upload: SUCCESS
- Tauri Release build: SUCCESS
- diagnostic/runtime artifact upload: SUCCESS

Main artifacts:

- visual regression artifact `10326331827`, digest `sha256:aaa71f3dbb91e522a1d1c8291939819729e720f0a31ad40e4c4463aa51cf8572`;
- diagnostic/runtime artifact `10326422964`, digest `sha256:35abf0bba3a27fb9d42f3360eccd3e9f84abb3e252fe1f1159f9d51019a87afc`.

## Preserved invariants

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- Native/Rust remains monitor/work-area/DPI/physical-position authority.
- Display reaction remains event-driven/coalesced; no title behavior introduced a polling loop.
- Renderer title motion cannot become task/timer/session authority.
- Stable task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken are unchanged.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- Future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard activation only.
- Reduced-motion remains usable and timer numerals retain fixed/tabular geometry.
- Ordinary Focus row-title behavior remains separate item 12 scope.
- Excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Exact continuation

Milestone 6 is now **11/16 validated**; general roadmap progress remains **5/10 milestones complete**.

The next ordered item is item 12: `Allow ordinary focus-row task titles up to two lines where practical; expose full title accessibly.`

A zero-context agent should reconstruct the current ordinary Focus row title markup/CSS, existing title/full-text accessibility conventions, screenshot/product evidence, layout-shift invariants and Focus visual/static coverage before implementing the narrowest item-12 presentation slice. Do not absorb item 13 action-slot work, item 14 tooltips, item 15 visual-state polish, item 16 empty states, Floating Timer, or Milestone 8 Preferences UI.