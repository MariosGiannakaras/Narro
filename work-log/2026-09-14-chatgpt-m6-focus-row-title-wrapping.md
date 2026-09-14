# M6 Focus ordinary row-title wrapping — validated implementation log

Date: 2026-09-14
Milestone: 6 — Blitz Mode / Focus Panel
Item: 12/16 — Allow ordinary focus-row task titles up to two lines where practical; expose full title accessibly.

This entry is immutable evidence for the validated item-12 slice. Later tracking-only commits do not replace the validated source/test baseline recorded below.

## Contract reconstructed

Repository/product/UI evidence established the following narrow scope:

- item 12 applies only to ordinary Remaining, Scheduled and Done Focus task-row titles;
- the active/live title remains on the separate item-11 scrolling path;
- ordinary titles may occupy up to two lines where the compact Focus layout permits and must clamp afterward rather than expand without bound;
- the complete title must remain accessible through an established keyboard-capable mechanism rather than pointer hover alone;
- reuse the already validated shared `Tooltip` primitive and its `aria-describedby` association;
- the Focus title wrapper must remain `min-width: 0` inside the flexible title slot so long text does not force horizontal geometry changes;
- long unbroken text must wrap safely;
- a second title line may increase row height, but it must not change row width or absorb item-13 reserved-action-slot work;
- no animation or transform is required for ordinary row titles;
- task/timer/session/scheduling authority, item-11 live-title scrolling, reduced-motion behavior, Floating Timer and Preferences remain unchanged.

## Implementation

Implementation branch: `m6-focus-row-title-wrapping`

Branch base/tracking tip: `4932985e5bc21cb0049ce219b9fbf699ca12dc06`

Final PR head: `789cd1a69efca59e33035660a4b91c11d63f1a39`

PR: #112 — `M6: allow two-line Focus row titles`

Changed-file scope at final review was exactly nine files:

- `HANDOFF.md` — branch checkpoint only;
- `package.json` — preflight and Windows visual validator registration;
- `scripts/test-ui-focus-live-title.mjs` — preserved the active/live-title separation contract;
- `scripts/test-ui-focus-row-titles.mjs` — deterministic ordinary-row title contract;
- `scripts/validate-focus-row-title-captures.mjs` — Windows capture geometry/accessibility validation;
- `src/FocusPanel.tsx` — ordinary row title wiring only;
- `src/FocusTaskRowTitle.tsx` — shared-tooltip ordinary title presentation;
- `src/focusPanelVisualFixture.tsx` — deliberately long ordinary title fixture and geometry metadata;
- `src/focusTaskRowTitle.css` — two-line clamp, flexible wrapper and focus presentation.

Validated behavior:

- only ordinary Focus rows use `FocusTaskRowTitle`;
- ordinary titles clamp to two lines;
- `overflow-wrap: anywhere` prevents long unbroken titles from expanding the row horizontally;
- shared Tooltip/full-title access is keyboard-capable and associated through the existing accessibility primitive;
- the tooltip anchor participates in the existing flexible title slot with `min-width: 0`;
- row width remains stable while a long title may grow only vertically to its second line;
- no animation/transform was introduced;
- active/live title scrolling remains separate and unchanged;
- no Rust/native, database, timer/session/task/scheduling, dependency/lockfile, Floating Timer or Preferences behavior was changed.

## Exact PR-head validation

Authoritative Windows CI #425:

- run: `34811100017`
- job: `103872454315`
- exact head: `789cd1a69efca59e33035660a4b91c11d63f1a39`
- conclusion: **SUCCESS**

Required gates:

- Repository Preflight: **SUCCESS**
- Windows visual regression: **SUCCESS**
- Tauri Release: **SUCCESS**
- visual artifact upload: **SUCCESS**
- diagnostic/runtime artifact upload: **SUCCESS**

Artifacts:

- visual regression artifact `10334544083`, digest `sha256:5d43cd8b449d5a854246819b6bf99fd3c641618fd65642f4a449dc624a6c261f`;
- diagnostic/runtime artifact `10334883696`, digest `sha256:7927d191f6877d533129ebe9622b50e9a5ce38ae44068c0220b510dc36f18312`.

Final PR review found no conversation comments, no submitted reviews and no inline review threads. The final changed-file scope matched the intended item-12 implementation and preservation/tracking files.

## Merge baseline

PR #112 was squash merged to main.

Validated source/test merge SHA:

`a62ff3424525486ea1487429ff043d0139b85abd`

Tree:

`7d269939de6e5812e66ef1b002796d11132b00a7`

Tracking-only descendants after this SHA do not replace this source/test baseline.

## Resulting-main validation

Windows CI #426:

- run: `34819905050`
- exact main source SHA: `a62ff3424525486ea1487429ff043d0139b85abd`

Attempt 1 job `103898850739` passed Repository Preflight, including the item-12 static contract, TypeScript/Vite build, rustfmt/check/Clippy and all Rust tests. It also captured and validated the Focus Panel and ordinary row-title fixtures successfully. The run then failed only in the unrelated existing scheduling visual validator with:

`task-scheduling-light fixture did not report ready state`

No source or harness change was made because the failure was a transient readiness miss unrelated to item 12. The exact same main SHA was rerun.

Attempt 2 job `103901669712`: **SUCCESS**.

Required gates:

- Repository Preflight: **SUCCESS**
- Windows visual regression: **SUCCESS**
- Tauri Release: **SUCCESS**
- visual artifact upload: **SUCCESS**
- diagnostic/runtime artifact upload: **SUCCESS**

Successful attempt-2 artifacts:

- main visual artifact `10338361964`, digest `sha256:659986ba76d0ac911ea80343d6e552eaf7826d355902efed1abba5970d9b2281`;
- main diagnostic/runtime artifact `10338572056`, digest `sha256:1f72c7c9c04cc93a65d28a495ffb8a44a081c87b0e8ec5d1b8e698f3633092f9`.

## Invariants preserved

- `main` plus reusable `focusSurface` remain the normal two-webview architecture;
- native/Rust remains monitor/work-area/DPI/physical-position authority;
- display reaction remains event-driven/coalesced;
- task/list/subtask identities, Focus queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative and unchanged;
- renderer title presentation does not own timer/session/task state;
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe;
- ordinary Focus row titles now have a validated two-line/full-title contract that later action-slot work must not shrink or reflow unpredictably;
- Break/Pause-Resume/Skip/Done semantics remain authoritative;
- future-timed Today tasks remain ineligible until due;
- Notes URLs remain explicit pointer/keyboard activation only;
- diagnostics remain gated behind `?diagnostics=1` and excluded account/cloud/integration controls remain absent.

## Roadmap continuation

After tracking reconciliation, Milestone 6 is **12/16** validated and general progress remains **5/10 milestones complete**.

The next ordered slice is M6 item 13/16:

`Reserve action slots for hover/focus controls so controls never push task text or move hit targets.`

A zero-context continuation must reconstruct item 13 from current Focus row/action markup and CSS, shared overlay/action-slot primitives, the validated M5 task-card reserved-action pattern, product/UI evidence and current Focus static/visual fixtures before editing. Item 14 tooltips and later visual-state work remain separate.