# 2026-10-12 — U23 #342 exact-head Windows 3/3, guarded merge and 14/14 Git blob proof; resulting-main pending

**Scope:** U23 read-only planned active Break EST header, no saved estimate/session/board/task mutations, no owner-protected Spectrum Core changes. Previous design and implementation [work log](2026-10-12-chatgpt-u23-read-only-planned-break-est-pr342-ci-pending.md). Windows native physical PA-01–09 stays USER-PAUSED / NOT RUN. Optional M11 remains DORMANT; not needed.

**Source/CI:** [PR342](https://github.com/MariosGiannakaras/Narro/pull/342), branch `feat/u23-break-planned-est-read-projection`, exact accepted head `2914317b40aa7efa6c1401dff73e0106378fb43f`. [PR-head run38272720744](https://github.com/MariosGiannakaras/Narro/actions/runs/38272720744) **COMPLETED SUCCESS 3/3**, validation-gate job `114891009667`, fast-gate `114891059343`, windows-candidate `114892211565`. Earlier intermediate run38272482466 and run38272588918 were superseded/cancelled; never cited as PASS. No local preflight claimed.

**Verified GitHub merge guard:** GitHub native REST PR response (not stale connector normalized `mergeable=false`) reported `mergeable=true`, `mergeable_state=clean` for exact green head. Earlier PR base `bf344ac1650c59d42b91cf8e1de3a7daf0825d0f` → then-current `main` `285563ac1c0e1fa8f021a4626c92f049d6b924bf` was 7 commits ahead, exclusively Markdown (HANDOFF, STATUS, TODO, Blitzit reference audit/register, immutable work logs). No overlapping source/test/config changes. Expected-head guarded `squash` API merge with `expected_head_sha=2914317b40aa7efa6c1401dff73e0106378fb43f` returned `merged:true`, source merge `4ce42cd9b41c4c445a1acbf0737c3a7b3063af7a`. Re-read PR: `merged=true`, exact merge identity and original accepted head.

**Independent exact Git blob parity PR → merged source: 14/14 MATCH.** Each path was fetched separately with explicit ref `2914317b40aa7efa6c1401dff73e0106378fb43f` and `4ce42cd9b41c4c445a1acbf0737c3a7b3063af7a`:

| Path | Matching Git blob SHA |
| --- | --- |
| `scripts/test-focus-break-live-presentation.mjs` | `6d276a04eb4c27e946c524a4bf7691308a4b7ad8` |
| `scripts/validate-focus-visual-state-captures.mjs` | `4b734179c8439d0b2c839ce6b6229160d0843ca6` |
| `src-tauri/src/domain/timer_events.rs` | `f035b93ce6ffeceba0bce106fdc4872001cf2d9c` |
| `src-tauri/src/timer/mod.rs` | `ad43617ec08ddea1fa23a3edc72d234a867b0db1` |
| `src-tauri/src/timer/runtime.rs` | `94f969eb603f5aac07915b2fab9066138aca0353` |
| `src-tauri/src/timer_service.rs` | `c3a2c39b92ad516997076dc668a33531596a3ef4` |
| `src/FocusPanel.tsx` | `1d6e51a23216b341943f5116a7f6d9c2abe12325` |
| `src/finding28PostDragFixture.tsx` | `7c740f978523c630fb9561acf0cf1f96141b7848` |
| `src/floatingTimerVisualFixture.tsx` | `857168930f484c736f8d60db3e6a8f71c5b2d539` |
| `src/focusBreakEstimate.ts` | `4520e14a70a435abb31f8fa3c5855b29fe2d7ff5` |
| `src/focusPanelVisualFixture.tsx` | `19057f976ccf7ddbb41c4c4a5557f6b25d62cdcf` |
| `src/m7IntegrationRegression.tsx` | `152df9d5f6f4eef283a4eb04dd62f0c1233abfeb` |
| `src/shortcutModalRegression.tsx` | `4ffc1368bab75c651a8a076019894e029bd8ce1b` |
| `src/timerSessionApi.ts` | `433f6ea723fbf6c7521f7657156bceb9c98b57be` |

**Pending production acceptance:** Latest executable/main push [run38277579376](https://github.com/MariosGiannakaras/Narro/actions/runs/38277579376), exact `head_sha=4ce42cd9b41c4c445a1acbf0737c3a7b3063af7a`, **IN PROGRESS / NOT PASS** at last check. `U23 1/1` source integrated/PR-head validated; **0/1 source-matched resulting-main release/package accepted** until 3/3 exact resulting-main and actual downloaded archive ZIP CRC plus SHA256 ZIP/`narro.exe`/NSIS/MSI. U22 old hashes apply only to U22 build; no U23 production SHA invented.

**Exact next action:** inspect run38277579376 on exact merged executable. On full 3/3 SUCCESS, download `narro-m7-physical-windows-x64` from *that run*, independently CRC check and hash original ZIP + three contents; repin current Windows physical staging/risk docs, reconcile HANDOFF/TODO/STATUS, record immutable final acceptance and current source identity. On FAIL read first failed step and log, classify cause, correct in existing follow-up workflow without weakening tests; historical failed SHA stays FAIL. No native execution/install or AppData changes.

**Unrelated gates:** PA-01–09 USER-PAUSED/NOT RUN; physically accepted mandatory milestones 3/10, M10 blocked, optional M11 dormant; U04 irreversible Archived Done delete approval-gated. Earlier independent bounded coding U12/U40/U35/U21 4/4, U06 1/1, U09 1/1, U22 1/1 accepted.
