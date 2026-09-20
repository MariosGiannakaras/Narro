# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 7 in `TODO.md`, relevant `STATUS.md`, the Floating Timer sections of the product/UI/evidence docs, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md`. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 7 — Floating Timer mode.**

- Milestones 1–6: COMPLETE / PASS.
- Milestone 7: ACTIVE / **0 of 14** top-level items validated.
- Milestones 8–10: NOT STARTED.
- General roadmap progress: **6/10 milestones complete**.
- M6 item 16 closed at **5/5 checkpoints complete**.
- Current M7 item-1 implementation slice: **0/5 checkpoints complete**.

Repository compact progress source values: `6/10M || 0/5 | 0/14`.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`ab5818fa92970655b63323839111a1977a5837a7`

Source tree:

`60a01fa240b8ff903d99d7da87c597587ff816b8`

This is the expected-head guarded squash merge of PR #116 after authoritative resulting-main Windows CI #446 passed on the exact merged source SHA. Markdown-only tracking descendants after this SHA do **not** replace the validated source/test baseline.

Latest immutable completed evidence:

`work-log/2026-09-20-2229-chatgpt-m6-focus-empty-states.md`

## LATEST VALIDATION EVIDENCE — M6 ITEM 16 / GATE F

PR #116 — `M6: handle Focus empty states`

Final exact PR head:

`f0e02570308d86416861c53e1d296e5edb309ef8`

Authoritative PR Windows CI #445:

- run `35366848885`;
- job `105671693894`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10557321916`, digest `sha256:829ca1d136cd2c48947f8f401295de81729486f7924cc6a49cb2d2d32b04baf3`;
- diagnostic/runtime artifact `10556649008`, digest `sha256:13859a5d3b70377a3c1898e9cddaba062aaa941786a81c85ca8ed6080da78c50`.

Evidence-backed CI history:

- Windows CI #443 / run `35366559621` / job `105670327157` failed only on a stale item-15 fixture-source assertion;
- correction `096f6fe0fa8f052ae125f1711f2370aadeb5aa57` changed only deterministic test expectations for the new empty scenario;
- intermediate CI #444 was superseded/cancelled and was not used as a merge gate;
- final exact-head CI #445 passed all gates.

Final review verified the exact head unchanged and mergeable, `main` still exactly at base `50557554d326ec49ba21da46f80139cb7be009d2`, exactly nine expected changed files, and no conversation comments, submitted reviews or inline review comments.

Expected-head guarded squash merge:

`ab5818fa92970655b63323839111a1977a5837a7`

Authoritative resulting-main Windows CI #446:

- run `35527458034`;
- job `106122008480`;
- exact main source SHA `ab5818fa92970655b63323839111a1977a5837a7`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- both required artifact uploads: **SUCCESS**;
- visual artifact `10610393632`, digest `sha256:bae649a3d22b004b2732a7499a4a280fef287e819695c27cde821653c3d7e402`;
- diagnostic/runtime artifact `10609968144`, digest `sha256:79b448f6c1f3d6f6515ed440808b8c7e42904d2790cb6001e41fb1f3ed66ab4f`.

Validated M6 item-16 capability:

- generic idle, no-eligible-yet and genuinely empty Today presentations are distinct;
- future-timed Today work remains visible in Scheduled but ineligible until due;
- genuinely empty Today uses the screenshot-backed `All Clear` state;
- empty/no-eligible states do not fabricate live timer/actions or own timer/session/scheduling authority;
- all prior M6 item 1–15 invariants remain intact.

Milestone 6 is **16/16 validated / Gate F PASS**.

## ACTIVE IMPLEMENTATION SLICE

**M7 item 1/14 — Implement compact mode by transforming the existing `focusSurface` window; do not create a third persistent webview.**

No M7 implementation branch or PR is established yet.

### Checkpoint plan — 0/5 complete

1. Reconstruct the exact compact-mode transformation contract from current `focusSurface` native/window code, M1 validated window/performance behavior, M6 Focus Panel implementation, timer/session projection, and relevant Floating Timer product/UI/evidence docs.
2. Implement the narrow compact-mode transformation slice with deterministic/static/native coverage and semantic review; preserve the two-webview architecture, authoritative timer/session state, native geometry ownership and display recovery.
3. Validate the exact PR head with authoritative Windows CI: Repository Preflight, relevant Windows visual/native regression, Tauri Release and both required artifact uploads.
4. Verify exact head unchanged, expected changed-file scope, clean PR comments/reviews/threads and mergeability; squash merge with an expected-head guard.
5. Validate the resulting-main source SHA with authoritative Windows CI, then reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable M7 item-1 work log.

### M7 item-1 starting boundary

- normal architecture remains exactly two webviews: `main` and reusable `focusSurface`;
- Focus Panel <-> Floating Timer is a presentation/window-mode change and must not reset, duplicate, start, stop or switch the authoritative session;
- Rust/native window coordination remains monitor/work-area/DPI/physical-position authority;
- current display-topology recovery and work-area clamping must not regress;
- Floating Timer must retain always-on-top / skip-taskbar behavior already proved in M1;
- the compact frontend path must remain lightweight and must not import dashboard/reports/settings/editor code into its initial bundle;
- renderer refresh cadence cannot become timer authority;
- no continuous decorative animation/polling may be introduced;
- M7 item 1 is transformation foundation only; later collapsed/expanded content polish, shortcuts, safe-position persistence and final performance remeasurement remain ordered later M7 items unless a narrow dependency is required.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains personal, local-only Windows 10/11 x64 software.
- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display handling remains event-driven/coalesced and off-screen recovery semantics remain intact.
- task/list/subtask identities, queue partitioning, scheduling eligibility and tracked Time Taken remain authoritative.
- renderer presentation cannot become timer/session/task/scheduling authority.
- future-timed Today tasks remain ineligible until due.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- M6 item-11 live-title motion, item-12 row-title access, item-13 reserved action geometry, item-14 tooltips/accessibility, item-15 visual states and item-16 empty-state semantics remain intact.
- Notes URLs remain explicit pointer/keyboard activation only.
- reduced-motion remains usable and timer numerals retain fixed/tabular geometry.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Reconstruct M7 item-1 compact-mode transformation from the repository before editing source. Inspect the current native `focusSurface` mode switch, window configuration, focus entry/frontend routing, authoritative timer projection, M1 performance/native validation evidence and Floating Timer product/UI evidence. Then create one narrow implementation branch from the latest `main` tracking tip and implement only the evidence-backed transformation foundation.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M7 item 1.
- Full local repository/frontend/Rust/Tauri preflight is unavailable in this connector-only environment; record unavailable checks as **NOT RUN** and use authoritative Windows CI for the complete gate.
