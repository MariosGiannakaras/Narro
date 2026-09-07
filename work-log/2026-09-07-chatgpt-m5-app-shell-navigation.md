# M5 App shell/navigation validation

Date: 2026-09-07
Agent/tool: ChatGPT with GitHub connector
Milestone/slice: Milestone 5 — Main UI — App shell/navigation

## Source and PR

- Starting fully main-validated source/test baseline: `7918c378d50f516a152f0a7a90a7564eaedac42f`.
- Implementation branch: `m5-app-shell-navigation`.
- PR: #80 — `M5: add app shell navigation`.
- Final exact validated PR head: `e1a0eb737cce5095b04cae32130fa3f08b3dcb5d`.
- PR changed files: 12, confined to `HANDOFF.md`, main frontend shell/navigation, static shell contracts, and visual-regression harness wiring; no Rust/domain/persistence/native-window source changed.
- PR comments, review submissions, and inline review threads requiring resolution: none.

## Material implementation

- Replaced the temporary diagnostic dashboard as the default main-window presentation with reusable `AppShell` navigation.
- Added compact left navigation for `+ Create new list`, `All my lists`, and `Archived lists`.
- Added stable upper-right Search and Settings utility entry points.
- Added stable bottom Home and Reports primary navigation.
- Added `aria-current="page"`, navigation landmarks, focus-visible states, and reduced-motion-safe navigation transitions.
- Preserved the legacy Windows diagnostic controls only behind explicit `?diagnostics=1`; normal product mode no longer starts shortcut/monitor/autostart diagnostic probes.
- Preserved authoritative Rust `get_state` / `state-changed` projection and renderer-independent domain authority.
- Added deterministic `scripts/test-ui-app-shell.mjs` to frontend preflight.
- Extended the existing Windows Edge visual harness with `app-shell-light` and `app-shell-dark` captures while retaining the prior foundation fixtures.
- Added exact 1280x720 PNG validation plus semantic shell/default-Home/stable-geometry checks.
- Renamed the main document title from the temporary diagnostic title to `Narro`.
- Source review caught and corrected shared-token mismatches before CI: `--radius-task-card`, `--motion-duration-hover-focus`, and `--motion-ease-enter`.
- Deliberately did not implement Home list cards, create/edit list flows, board/task UI, search palette behavior, Settings content, Reports content, or later Milestone 5 items.

## Validation

Local Node/Rust checkout validation: **NOT RUN**. This connector-only environment did not expose a local repository checkout/toolchain; no local PASS is claimed.

### Exact PR-head Windows CI

Windows CI #285:

- run: `34144266196`;
- job: `101812742288`;
- exact head: `e1a0eb737cce5095b04cae32130fa3f08b3dcb5d`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact: `10027211577`, `narro-m5-visual-regression`, digest `sha256:b1df010bcd84089ff2f49999337e3e059f9dab9530274b2c3158d9643e8cc9fd`;
- diagnostic artifact: `10027371165`, `narro-m1-runtime-harness-windows-x64`, digest `sha256:f870171b482fe9a42f3550bebaef6162e75604ee82f3b9dfe0308f0f67827f09`.

The exact-head diff/review check passed after CI. PR #80 was squash-merged using an expected-head guard set to the validated head.

### Merge and resulting-main validation

- Squash merge source SHA: `31f84a1fe2064e59ea27acc7c9afa9f650669608`.
- Windows main CI #286:
  - run: `34146374105`;
  - job: `101819196686`;
  - exact source SHA: `31f84a1fe2064e59ea27acc7c9afa9f650669608`;
  - conclusion: **SUCCESS**;
  - Repository Preflight: **PASS**;
  - Capture Visual Regression Fixtures: **PASS**;
  - Upload Visual Regression Artifact: **PASS**;
  - Tauri Release: **PASS**;
  - Upload Diagnostic Harness Artifact: **PASS**;
  - visual artifact: `10027957828`, `narro-m5-visual-regression`, digest `sha256:d28c47553ec3ecbbda5aa7bde8d7eacddaa5cd1c803ad22f2e63faf86aeb4d53`;
  - diagnostic artifact: `10028115494`, `narro-m1-runtime-harness-windows-x64`, digest `sha256:d5f60f59a284361432fdcc1e929ba32c97bf77d588790c14181e75cb1efa5add`.

No separate physical Windows acceptance is required for this shell/navigation slice: the behavior is renderer presentation/navigation, and Windows CI executes the real Edge capture path plus the release build. Native window lifecycle semantics were not changed.

## Tracking reconciliation

- `TODO.md`: mark `App shell/navigation` validated complete.
- `STATUS.md`: advance Milestone 5 from 7/28 to 8/28 and set `31f84a1fe2064e59ea27acc7c9afa9f650669608` as the latest fully main-validated source/test baseline.
- `HANDOFF.md`: close this five-checkpoint slice and advance the exact next ordered action to `Home dashboard/list cards`.
- Markdown-only tracking descendants do not replace the validated source/test SHA above.

## Blockers and continuation

Blockers: none.

Exact continuation point: perform mandatory startup again, inspect the Home/list-card evidence in `docs/UI_UX_SPEC.md` and current `AppShell`/main frontend/visual harness, then implement only the next ordered Milestone 5 item: `Home dashboard/list cards`. Preserve the validated shell geometry, accessibility, reduced-motion behavior, diagnostic gating, and authoritative Rust/domain boundaries. Do not fold the later list-card hover/menu/create-list-state item into the Home dashboard slice except for the minimum static card structure genuinely required by the Home item.
