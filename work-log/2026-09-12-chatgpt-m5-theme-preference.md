# 2026-09-12 — M5 persisted System/Dark/Light theme validation and reconciliation

## Scope

Completed Milestone 5 item 27/28: **Light/dark/system theme**.

This entry is immutable validation evidence. Markdown tracking descendants do not replace the validated source/test SHA recorded below.

## Source baseline and branch

- prior reconciled tracking tip: `0db81e3ad0128579ac5b173083c3565824a8485f`;
- prior fully main-validated source/test baseline: `e142ff2f7d131570f01b5daf24d1122e4f219620`;
- implementation branch: `m5-theme-preference`;
- semantic-reviewed implementation candidate before checkpoint-only documentation: `9662d03afdff3ec2cacdb96b3dfe0cb3a8847433`;
- final exact PR head: `048f5009e5cee07cb78544f7ccd6290c43f33980`.

## Implemented behavior

- Reused the existing authoritative SQLite preferences row and existing `ThemePreference::{System, Dark, Light}` domain type; no migration/schema/dependency/lockfile change was required.
- Added theme-only renderer commands. `get_theme_preference` initializes/reads the persisted value and `set_theme_preference` accepts only `system|dark|light`, mutates only `general.theme`, preserves all unrelated preference fields and commits through the existing persistence boundary.
- After a committed write, Rust emits `theme-preference-changed`; an event-broadcast failure is logged separately and cannot report the already committed write as failed.
- Installed a shared `ThemeRuntimeProvider` in both `main` and `focusSurface`; it subscribes before the initial read, validates event payloads, projects `data-theme` to the root and performs no polling.
- Preserved `system` as the persisted/root token. Existing `prefers-color-scheme` CSS resolves Windows/WebView2 light/dark changes without rewriting persistence.
- Replaced the main Settings placeholder only with the source-evidenced Preferences → General → Theme System/Dark/Light segmented control. It exposes accessible group/pressed semantics, a persistence-pending state and a role-alert failure state; failed writes restore the previous projection.
- Removed hard-coded dark diagnostic focus colors in favor of existing semantic theme tokens.
- Added Rust tests for System default initialization/idempotence, preservation of unrelated preferences, repeated saves and invalid tokens.
- Added deterministic static wiring/order/absence coverage plus production theme fixtures for System, Dark, Light and failed-save states. Captured-DOM validation checks exact root theme, selected pressed option, accessible Theme group and rollback/error behavior.
- Did not absorb timezone, hide-times, EST parsing, Pomodoro, alerts, monitor/side, celebration or other later preference families.
- Did not change timer/session, scheduling, archive, Notes, Reports or account/cloud/integration authority.

## Exact PR-head validation

PR #99: `M5: add persisted light dark and system theme`.

Final exact head: `048f5009e5cee07cb78544f7ccd6290c43f33980`.

Windows PR CI #388:

- run `34711580262`;
- job `103601188758`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- production Windows Edge theme-settings capture/DOM validation: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

PR artifacts:

- visual `narro-m5-visual-regression`: artifact `10303218552`, digest `sha256:af6a8261abb3693e3123a4551daa6f91db1c862ad49bc01712582013898ffb7b`;
- diagnostic `narro-m1-runtime-harness-windows-x64`: artifact `10303194119`, digest `sha256:77b60fa4bca214ca8bb5b30f9a349a6a7fac8b3996626559b2223d49ab8cc3e9`.

Final PR review evidence:

- base main `0db81e3ad0128579ac5b173083c3565824a8485f`;
- 17 changed files, limited to theme IPC/runtime/UI/static/Windows-capture wiring plus checkpoint documentation;
- `src-tauri/src/lib.rs` adds only the theme module and two command registrations;
- no `Cargo.toml`, lockfile, migration or domain-preference-schema change;
- no submitted reviews or PR conversation comments;
- the final PR head remained the exact head validated by CI before merge.

## Merge

PR #99 was squash-merged from exact validated head `048f5009e5cee07cb78544f7ccd6290c43f33980`.

Resulting main source/test SHA:

`40ac4acabea105e82a1f1a1211436bda628d4526`

Source tree:

`0e7dc95db73a5577cc83ff4aa7c933ae9aba906d`

## Resulting-main validation

Windows main CI #389 / run `34712441687`:

- exact main SHA `40ac4acabea105e82a1f1a1211436bda628d4526`;
- attempt 1 job `103603519635`: Repository Preflight **SUCCESS**; job then reached the Windows visual-regression step and was cancelled at the workflow's configured 30-minute job timeout, with no test failure recorded;
- rerun attempt 2 job `103608683661`: **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- production Windows Edge theme-settings capture/DOM validation: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

Main artifacts from successful rerun:

- visual `narro-m5-visual-regression`: artifact `10303868283`, digest `sha256:7322bd3cb3cca9cf7726ccc08819ce253dc8c113d3109c200f501c0ec51fe776`;
- diagnostic `narro-m1-runtime-harness-windows-x64`: artifact `10304293100`, digest `sha256:624df25ab71fc867fb06f14021eaed7133b88f4f4ab8d98089b721ac40388712`.

## Reconciliation result

- M5 item 27/28 is fully validated.
- M5 validated count advances from 26/28 to **27/28** only after the successful resulting-main rerun above.
- General milestone progress remains **4/10** because Milestone 5 is still active.
- The next ordered M5 item is **Remove all account/trial/upgrade/cloud/integration controls**.
- `TODO.md`, `STATUS.md` and `HANDOFF.md` are reconciled in the markdown-only tracking commit that includes this immutable entry.
- The validated source baseline remains `40ac4acabea105e82a1f1a1211436bda628d4526`; this markdown-only tracking commit does not replace it.
