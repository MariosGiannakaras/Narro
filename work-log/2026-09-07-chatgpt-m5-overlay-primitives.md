# M5 accessible overlay primitives

Date: 2026-09-07
Agent/tool: ChatGPT / GitHub connector
Milestone: 5 — Design system and Main window product UI
Slice: sixth ordered shared-visual-foundation item — accessible tooltip/popover/menu primitives with stable geometry

## Scope

This slice implements only:

- `Implement accessible tooltip/popover/menu primitives with stable geometry.`

It intentionally does not implement the screenshot/visual-regression fixture harness, App shell, Home, list cards, board/task product UI, Rust/domain/persistence behavior, or native-window behavior.

## Source implementation

Implementation PR: #78 — `M5: add accessible overlay primitives`.

Final exact validated PR head:

`abe99e355f0dcb5c8d35a23a509c1cd598375e6c`

Material source/config/test changes:

- `src/overlayPrimitives.tsx` adds dependency-free React `Tooltip`, `Popover`, `Menu`, and `MenuItem` primitives;
- tooltip semantics include `role="tooltip"` plus `aria-describedby`, preserving an existing description relationship;
- popover/menu triggers expose `aria-haspopup`, `aria-expanded`, and `aria-controls`;
- menu semantics include `role="menu"` / `role="menuitem"`, disabled-item exclusion, ArrowUp/ArrowDown/Home/End navigation, Escape dismissal and focus restoration;
- active menu-item selection invokes the selected callback, closes the menu and restores focus to the trigger;
- popover/menu dismiss on outside pointer interaction;
- `src/overlayPrimitives.css` anchors overlays in `position: relative` wrappers and uses `position: absolute` overlay surfaces so opening/closing does not reflow sibling geometry;
- tooltip/popover/menu styling reuses semantic theme/geometry/motion contracts and removes transforms under reduced motion;
- `src/App.css` imports the primitive stylesheet after the existing shared foundation contracts;
- `scripts/test-ui-overlay-primitives.mjs` guards accessibility, keyboard, dismissal, stable-geometry, motion and reduced-motion contracts;
- `package.json` includes `test:ui-overlay-primitives` in `preflight:frontend`;
- no new frontend dependency was added;
- no Rust, persistence, timer/session, scheduling, recurrence, reminder or native-window behavior changed.

## Review correction before final validation

Initial PR head `1a086d7a15fb5c9688d212cf198e103b175d0045` passed Windows CI #274, but final semantic review found one interaction gap: selecting an active menu item did not itself guarantee menu dismissal and trigger-focus restoration.

The PR was corrected before merge:

- `Menu` now provides an internal selection context;
- `MenuItem` invokes its supplied `onSelect` callback and then closes/restores focus through that context;
- the deterministic contract test explicitly checks the selection-dismissal wiring.

The old green run was not used as merge evidence. A new exact-head Windows run was required and passed on the corrected head.

## Local / pre-PR evidence

The execution environment did not have a complete local materialized repository/toolchain checkout, so full local npm/Rust preflight was **NOT RUN**.

Evidence available before authoritative Windows validation:

- mandatory repository/spec/architecture/dependency inspection: PASS;
- candidate diff scope review: PASS; five intended files only;
- deterministic overlay contract test added to `preflight:frontend`;
- initial Windows CI exposed no compiler/test issue;
- final semantic review found and corrected the menu-selection dismissal/focus gap before merge.

## Exact-head Windows PR validation

Windows CI #276:

- run `34130835990`;
- job `101770362797`;
- exact corrected PR head `abe99e355f0dcb5c8d35a23a509c1cd598375e6c`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `10022463278`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:1290021593167b6dc8843580df93b17402243155efd9b377870960169174afd4`.

Final exact-head review confirmed:

- PR remained at `abe99e355f0dcb5c8d35a23a509c1cd598375e6c`;
- five changed files only;
- no PR comments;
- no submitted reviews requiring action;
- no unresolved review threads.

## Merge and resulting-main validation

PR #78 was squash-merged with expected-head guard set to the exact validated head `abe99e355f0dcb5c8d35a23a509c1cd598375e6c`.

Resulting source/test SHA:

`392c4b0b9e2c395212f77ac9286349cc0b784d05`

Windows main CI #277:

- run `34132388297`;
- job `101775346828`;
- exact source SHA `392c4b0b9e2c395212f77ac9286349cc0b784d05`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `10023061747`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:8de39fd9e1d1d3b8eb0f9f2295d79928b0d2f82e3ccf3feb9d79a1b1fd75d329`.

No physical Windows acceptance is required for this primitive-only infrastructure slice because no product screen consumes the primitives yet. Rendered interaction/visual acceptance begins with the upcoming fixture/product UI work.

## Evidence-backed roadmap effect

Once the tracking reconciliation is present on `main`:

- the M5 accessible tooltip/popover/menu item is `[x]`;
- Milestone 5 top-level progress is `6/28`;
- validated source/test baseline is `392c4b0b9e2c395212f77ac9286349cc0b784d05`;
- later Markdown-only tracking descendants do not replace that source/test baseline;
- the next ordered item is `Establish a screenshot/visual-regression fixture harness for representative dark/light states.`

## Invariants retained

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- semantic color, typography, geometry and motion roles remain independent reusable contracts;
- overlays use reserved/absolute geometry and do not reflow sibling layout;
- keyboard/focus accessibility is part of the primitive contract;
- tooltip intent delay remains independent from animation duration;
- reduced motion removes nonessential transform motion without hiding state changes;
- timer/session authority and timer numeral behavior remain unchanged;
- no infinite decorative animation was introduced.

## Exact continuation point

1. Preserve validated source/test baseline `392c4b0b9e2c395212f77ac9286349cc0b784d05`.
2. Treat later Markdown-only tracking descendants as documentation only.
3. Perform mandatory startup again.
4. Start only the next ordered M5 item: screenshot/visual-regression fixture harness for representative dark/light states.
