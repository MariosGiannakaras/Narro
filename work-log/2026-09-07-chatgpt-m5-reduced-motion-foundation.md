# M5 reduced-motion foundation

Date: 2026-09-07
Agent/tool: ChatGPT / GitHub connector
Milestone: 5 — Design system and Main window product UI
Slice: fifth ordered shared-visual-foundation item — `prefers-reduced-motion`

## Scope

This slice implements only:

- `Implement prefers-reduced-motion behavior before adding component-specific animation.`

It intentionally does not implement tooltip/popover/menu components, screenshot fixtures, App shell/Home/board/task UI, component-specific animation, smooth scrolling, native-window animation, or completion/attention animations.

## Source implementation

Implementation PR: #76 — `M5: add reduced-motion foundation`.

Final exact validated PR head:

`3a67e076292424e8cbcfec4713ed7e3463fc3420`

Material source/config/test changes:

- `src/motion.css` adds one `@media (prefers-reduced-motion: reduce)` contract;
- shared transition-duration tokens collapse to `--motion-duration-reduced: 1ms` in reduced mode;
- tooltip intent delay remains unchanged because it represents interaction intent rather than decorative animation duration;
- lift/overlay distance tokens reduce to `0rem` and press/drag scale tokens reduce to identity `1`;
- reduced-mode transition-property lists omit `transform`, retaining stable visual-state properties only;
- shared transition delays clear to `0ms` in reduced mode;
- normal-motion calibration remains unchanged;
- `scripts/test-ui-motion.mjs` was adjusted to validate normal motion independently from the reduced-motion override block;
- new `scripts/test-ui-reduced-motion.mjs` validates reduced-mode invariants;
- `package.json` adds `test:ui-reduced-motion` to `preflight:frontend`;
- no React component behavior, Rust, Tauri configuration, persistence, timer/session, scheduling, recurrence, reminder, or native-window behavior changed.

## Local / pre-PR evidence

Available dependency-light checks:

- exact candidate diff review: PASS; five intended files only;
- `node --check scripts/test-ui-motion.mjs`: PASS;
- `node --check scripts/test-ui-reduced-motion.mjs`: PASS;
- normal-motion contract against LF `App.css`: PASS;
- reduced-motion contract against LF `App.css`: PASS;
- normal-motion contract against simulated Windows CRLF `App.css`: PASS;
- reduced-motion contract against simulated Windows CRLF `App.css`: PASS;
- full local repository build/Rust preflight: **NOT RUN** because the execution environment did not have a complete materialized checkout/dependency set.

## Exact-head Windows PR validation

Windows CI #272:

- run `34116005616`;
- job `101722851191`;
- exact PR head `3a67e076292424e8cbcfec4713ed7e3463fc3420`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `10016707418`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:ded80ef9c67d38293be47d869c50d773596e7e9185ff6f22696df6cb22cb2c8c`.

Final exact-head semantic review found only `HANDOFF.md`, `package.json`, `scripts/test-ui-motion.mjs`, `scripts/test-ui-reduced-motion.mjs`, and `src/motion.css`. PR comments, reviews and review threads requiring resolution: none.

## Merge and resulting-main validation

PR #76 merged from the same exact validated head `3a67e076292424e8cbcfec4713ed7e3463fc3420`, producing source/test SHA:

`0b0433fe9c2922d1a02a5a45656857368dcbbecb`

The merge was observed in repository state after validation; no stronger claim about the client-side expected-head guard mechanism is made beyond the fact that the merged PR head remained exactly the validated SHA.

Windows main CI #273:

- run `34117327629`;
- job `101727089898`;
- exact source SHA `0b0433fe9c2922d1a02a5a45656857368dcbbecb`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `10017138498`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:8d38e33021958d150907f4165588f9eb772e6f7e44649c5cf9d9c1748f51f14e`.

No physical Windows acceptance is required for this foundation-only CSS/preflight slice because no animated product component consumes the shared motion primitives yet.

## Evidence-backed roadmap effect

Once this documentation-only reconciliation is present on `main`:

- the M5 `prefers-reduced-motion` item is `[x]`;
- Milestone 5 top-level progress is `5/28`;
- validated source/test baseline is `0b0433fe9c2922d1a02a5a45656857368dcbbecb`;
- later Markdown-only tracking descendants do not replace that source/test baseline;
- the next ordered item is `Implement accessible tooltip/popover/menu primitives with stable geometry.`

## Invariants retained

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- semantic color, typography, geometry and motion roles remain separate reusable contracts;
- motion does not own or delay domain-state completion;
- reduced motion removes nonessential translation/scale without hiding state changes;
- tooltip intent delay remains independent from animation duration;
- no hover/focus layout shift or moving hit targets were introduced;
- timer numerals remain tabular with no per-second animation;
- no infinite decorative animation was introduced, especially on `focusSurface`.

## Exact continuation point

1. Merge the documentation-only tracking reconciliation.
2. Preserve source/test baseline `0b0433fe9c2922d1a02a5a45656857368dcbbecb`.
3. Perform mandatory startup again.
4. Start only the next ordered M5 item: accessible tooltip/popover/menu primitives with stable geometry.
