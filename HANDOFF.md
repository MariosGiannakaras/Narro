# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entries, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 4/5 | 14/19`

**Reopened Milestone 1 / M7 single-Focus physical closure remains active.** C1/C2/C3/C4 are PASS. The CI #809 event-based re-audit physically accepts the corrected compositor boundary, Blitz-now entry, task/session continuity, cross-window reconciliation, second-launch single-instance behavior, idle no-op result, mixed-DPI crossing, edge/work-area behavior, topology removal recovery and topmost behavior. No new product defect is evidenced. C5 remains OPEN only for saved placement across normal Quit→relaunch plus final tracking reconciliation.

## Parallel user-directed Blitzit forensic track — analysis only

This section is **not** the normal implementation next action. It applies only when the user explicitly asks to continue the Blitzit forensic/source-analysis pass.

User direction recorded 2026-10-02:
- analyze all supplied Blitzit videos/images at the most detailed practical level;
- record the evidence durably in the repository;
- **do not modify Narro implementation in this analysis track**;
- leave enough repository state that a zero-context chat can resume by being told only to continue the forensic pass.

When that instruction is given, read in order:
1. `docs/BLITZIT_FORENSIC_PASS3_HANDOFF.md`
2. `docs/BLITZIT_FORENSIC_REAUDIT_PLAN.md`
3. `docs/BLITZIT_FORENSIC_PASS3_TRACKER.md`
4. `docs/BLITZIT_FORENSIC_PASS3_SCREENSHOTS.md`
5. `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md`

Current source-analysis checkpoint:
- screenshots: **46/46 SOURCE_COMPLETE** at Pass-3 depth;
- full repository MP4s: **2/19 SOURCE_COMPLETE** at Pass-3 depth;
- VE-018: one 9.344 s / 560-frame planning-board excerpt is **PARTIAL** deep evidence, not full VE-018 completion;
- VE-003 Blitz Mode: **SOURCE_COMPLETE** from the actual full MP4;
- VE-005 Add & Manage Tasks and Lists: **SOURCE_COMPLETE** from the actual full MP4;
- exact next video: **VE-013 — Blitzit Tutorial How to Use Subtasks in Blitzit.mp4**;
- raw MP4 access is currently available through the isolated analysis-only media bridge; do not merge that bridge into main.

Do not edit implementation PR #213 or any source/test/config files from this forensic track. Implementation reconciliation is explicitly deferred.

## Current source / validation baseline

- Current repository main implementation merge:
  `7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31` — PR #213 planning-board parity.
  Later commits may be Markdown-only tracking/forensic updates.
- The last fully resulting-main-green implementation checkpoint before the
  concurrent source chain was PR #211 merge
  `c372ca29824c3c3839490a19e79f7ed3482cb360` / main CI #816.
- PR #212 exact head `c9e33c1bd12f0c5285f3a0a8807b94516dd71f33`
  passed Windows CI #833, then merged as
  `acdf8cc54d84247bba83e826020369003d5c244a`.
  It adds native monitor-placement diagnostics, isolated M1 diagnostic app-data
  identity/storage probes, and the floating-only scenario preflight.
- PR #212 resulting-main CI #837 failed only because
  `theme-settings-dark` did not reach visual-fixture readiness after Rust/tests
  and performance-harness validation had passed.
- PR #214 exact head `5073da095eef9cef86065d2813b27ed9e3a93b26`
  passed Windows CI #838 and merged as
  `ad6e1d84793e9a5de5a63dd5a2279d0ad67ed8da`, hardening only the Theme
  Settings capture retry path. Its first main run #839 was cancelled by the
  newer #213 merge.
- PR #213 exact head `54697ca5f242a4007c5eb1e7e58c6eb4552ab3db`
  passed Windows CI #836 and merged as current implementation main
  `7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`.
- Initial resulting-main CI #840 attempt 1 passed fast gate, check/clippy,
  **346 Rust tests**, performance-harness validation, the complete visual suite
  and Tauri release build, then failed only because the packaged Focus runtime
  capture did not acknowledge the Panel checkpoint within 15 s.
- CI #840 attempt 2 also **FAILED**, but later and more specifically: the renderer settled back to Panel only ~6.2 s after Timer→Panel start while the fixed native sampler had stopped after ~2.5 s, producing `timer-to-panel-runtime captured no native HWND movement`.
- Artifact/source comparison shows the existing Focus transition logic is unchanged from exact-head PR #213 CI #836 PASS; the failure is a bounded capture-window race on slow hosted runners, not evidence-backed product behavior failure.
- PR #215 exact head `03cff34c6188bd5033da389ae1dadfa3dc15d4f6` is the active narrow CI correction: probes remain alive until the real end checkpoint, retain hard timeouts and keep all native-motion validator assertions unchanged. Windows CI #841 / run `37029033564` is authoritative for this correction.
- Durable reconciliation:
  `work-log/2026-10-02-chatgpt-current-main-pr212-pr214-pr213-reconciliation.md`.
- CI #840/PR #215 diagnosis:
  `work-log/2026-10-02-chatgpt-ci840-focus-capture-pr215.md`.

### M7 production physical lineage

The accepted M7 C4/C5-path production physical candidate remains CI #809 source
`2767b3827670603d1ab259b6a843c2e0da82d85d` / PR #208, because the remaining
saved-placement observation is explicitly bound to that already-audited
candidate and later source slices did not modify the placement-persistence
implementation under test.

- PR #208 exact head: `d885a577c5e7f2e376ed1f6cf5e7f83146dfec58`.
- Exact-head Windows CI #809 / run `36865451660`: **PASS**.
- Resulting-main Windows CI #810 / run `36867438874`: **PASS**.
- PR #209 exact head `5384ea7384d304a843771e225bfb50cd9394bf43`
  passed full Windows CI #811 and regression-locks tray Quit -> save Timer
  placement -> process exit ordering without changing production runtime.
- CI #809 physical evidence remains the accepted M7 C4 baseline; C5 still needs
  the saved-placement restart observation and is not closed by later CI.

## Exact artifacts to use next

### M7 C5 production physical acceptance

Continue to use the already accepted CI #809 **production** physical artifact:

- artifact id `11163439039`
- artifact digest `sha256:39ca0a91d7aa54be79ca35c509f82f25049a15a3fc4ffff199699eab309557a5`
- standalone `narro.exe` SHA-256 `a4b8e163539f429769540480a7aa0b5db9ca6fa2c356d6742f78d687b5cb5675`
- physical-build smoke: PASS, zero CI `runtimeVisual` checkpoints

Packaged Focus visual artifact `11163582492`, digest `sha256:c184e661163bdf9ff1a9dd02859d7c9523add0a5edb6433d2f7ce8a29bf96cf9`, confirms one Focus HWND `0x1022A`, compact 340x110, expanded 340x300, active title/time and no unintended scrollers.

### Remaining M1 diagnostic/manual validation

Use merged-main CI #816 **diagnostic** artifact for selected-monitor placement,
reconnect/re-enumeration and floating-only CPU/RAM measurement:

- run `36989230905`: PASS
- implementation merge `c372ca29824c3c3839490a19e79f7ed3482cb360`
- artifact id `11218838485`
- artifact name `narro-m1-diagnostic-windows-x64`
- ZIP digest `sha256:cd03347215b684fc853aa450aa1903870ed5969ac6c7150edebda72a9048c2f9`
- contained `narro.exe` SHA-256 `f3ea39a540f46455ee8e8f1e078e168ef1745d2a7d5e6520617fa655a39ebc6b`
- Main loads `index.html?diagnostics=1`; `focusSurface` remains real product `focus.html`; no `runtimeVisual`
- artifact includes `measure-floating.ps1`, `run-m1-floating-performance-batch.ps1` and the M1 Windows validation procedures
- performance collection is now one command; the batch runner requires >=3 runs, rejects churn/context/hash mismatches and writes one `batch-summary.json`


Do **not** use the diagnostic artifact to substitute for M7 C5 production saved-placement acceptance.

## CI #806 recording audit

User recording `2026-10-01 15-20-44.mp4`, SHA-256 `86e51a5dcc6cc8bd5cb6af41971daa3c23016a97768c7f8469f567d4f232710b`, was audited across the complete 172.8 s timeline with dense transition sampling.

Important findings:

- The early `Blitz is already active` + `Focus task unavailable` / `All Clear` mismatch is **not clean idle evidence**. It is consistent with the already-documented stale SQLite residue risk from the invalid CI #795 `runtimeVisual=1` artifact.
- A clean real task `Test` becomes active around 78 s. From there, task identity/time remain continuous across Panel, compact Timer and expanded Timer.
- At approximately **81.50 s**, expanded -> compact produces a real white L/outline frame. This is an independent Gate 7 failure and is the evidence that produced PR #208.
- The same clean session supplies positive unaffected evidence for repeated Panel/Timer switching, animations Off then restored On, continuous timer identity, visible Focus->Main completion reconciliation, and Timer dragging.
- The recording does not conclusively prove the clean idle no-op input, real 100%/125% DPI crossing, topology reconnect, fullscreen topmost, or close/restart placement persistence.

Durable evidence: `work-log/2026-10-01-chatgpt-m7-ci806-physical-failure-pr208-ci809-main810.md`.

## CI #809 corrected two-monitor re-audit

User recording `2026-10-01 19-03-32.mp4`, SHA-256 `2da82409caa7b1dc4ad74f1d188ae230d5bd8566f6939f388fb4abe7058096a6`, is a synchronized **two-monitor** 4480×1080 capture. The earlier partial audit incorrectly treated the canvas too much like one surface / 50-50 split. The actual horizontal layout is 1920 + 2560; evidence must be correlated across both monitors at the same timestamp.

Physically accepted after the corrected event-based re-audit:
- six+ animations-On compact↔expanded sequences: the CI #806 white L/blank boundary does not recur;
- active task/session/time continuity and no document scrollbar;
- Main `Blitz now` is visibly activated at ~5.2–5.4 s and the existing Focus surface presents Panel;
- expanded Timer retains task/title/time;
- Focus completion reconciles to Main Done;
- real mixed-DPI crossing around ~116–122 s: compact Timer is ~425 physical px on the 1920-wide side and ~340 px on the 2560-wide side; Windows settings explicitly show the latter at 100%, matching 125%→100%;
- lower-edge/taskbar constrained expansion remains visible and usable;
- real topology reduction/removal around ~136.5–142 s recovers Narro safely onto the surviving display without restart;
- compact Timer remains topmost over a maximized Notepad++ window during the cross-monitor sequence;
- Windows animations are visibly switched Off and restored On; the authoritative `docs/M7_CLOSURE_PLAN.md` does not require a separate two-cycle-Off count for closure.

Further re-audit then found the missing C4 event evidence:
- around 38 s Narro Main + active Timer are already visibly alive;
- around 39.25–40.75 s the desktop `narro.exe` is activated again;
- through at least ~41.5 s the same Main/Timer state persists with no competing Narro UI/reset/conflict, physically closing the second-launch single-instance observation;
- after completion, Focus reaches `All Clear` around ~146 s and remains there without placeholder/stale Timer or pulse until the next unrelated Alt-Tab interaction; combined with the explicit on-screen final shortcut procedure and user clarification that tests must be correlated event-wise, this is accepted as operator-context physical no-op evidence for idle T / Find Timer.

Still missing:
- no unambiguous tray Quit → same-build relaunch → saved-placement recovery appears anywhere in the recording.

The recording does not visibly show `Get-FileHash`; exact CI #809 identity is bound by the operator/test context rather than a pixel-readable hash.

Corrected durable evidence: `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. The prior `2026-10-01-chatgpt-m7-ci809-partial-physical-audit.md` remains immutable as the superseded first interpretation.

## M7 checkpoint state

- C1: PASS
- C2: PASS
- C3: PASS
- C4 / Gate 7 physical continuity: **PASS**. Visual/session/Blitz-now/reconciliation, second-launch ownership and idle no-op behavior are accepted on CI #809.
- C5 / Gate 12 + platform closure: **OPEN only for saved-placement restart + final reconciliation**. Mixed-DPI crossing, edge/taskbar placement, real topology-removal recovery and topmost-over-maximized-app are physically PASS.

Progress is now `4/10M || 4/5 | 14/19`. Do not advance C5 or milestone completion until saved-placement restart is physically observed.

## Invariants that must not regress

- Narro remains local-only Windows Tauri 2 + React/TypeScript + Rust + SQLite.
- Runtime window composition is only `main` + one persistent `focusSurface`.
- Focus Panel, compact Timer and expanded Timer are presentations inside the same persistent Focus HWND/WebView.
- Ordinary presentation switching must not create/destroy/hide/show/resize the WebView as its mechanism.
- Timer/session authority remains Rust-owned and continuous through presentation changes.
- Logical geometry remains Panel 340x700, compact Timer 340x110, expanded Timer 340x300 with DPI-aware native visible regions.
- Focus document roots must not expose browser scrollbars.
- Native presentation changes remain serialized and rollback-safe.
- `Blitz now` enters Focus Panel.
- Idle/no-task Ctrl+Shift+T and Find Timer must not expose a placeholder Timer.
- Single-instance ownership must prevent competing SQLite/background/global-shortcut authority.

## Unfinished work / exact next action

Two independent tracks are permitted:

1. **Current-main validation reconciliation (agent-actionable):**
   - resume PR #215 exact head `03cff34c6188bd5033da389ae1dadfa3dc15d4f6`;
   - inspect Windows CI #841 / run `37029033564`;
   - require packaged runtime PASS **and** inspect the resulting Timer→Panel
     artifact to confirm it captures actual source→target native motion;
   - if #841 passes, guarded-merge #215 and validate the resulting combined
     main; then reconcile Candidate B to that resulting-main diagnostic artifact;
   - if #841 fails, inspect that exact failure before changing anything else.
2. **Remaining physical Windows gates (user-action required later):**
   - M7 C5 saved placement on the CI #809 production artifact;
   - M1 selected-monitor Panel Left/Right, reconnect/re-enumeration and
     floating-only performance on the final resulting-main diagnostic artifact.

PR #212 already reduced the future manual burden:
- diagnostic app data is isolated under
  `com.mariosg.Narro.M1Diagnostic`;
- runtime identifier/storage isolation is shown and must PASS before testing;
- monitor placement has a native expected-vs-actual PASS/FAIL probe;
- the performance runner verifies duplicate processes, destroyed Main HWND,
  visible compact Focus region and DPI before every child measurement.

Do not add parallel monitor/performance automation unless current evidence shows
one of those probes is insufficient. Do not resume deferred M9 while reopened
Milestone 1 remains incomplete.

Physical procedure:
`docs/M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md`.

## Deferred unrelated work

- PR #205 (`M9: expose validated Overview aggregation command/API`) remains open/deferred until M7 physical closure.
- PR #198 (`M9: add screenshot-backed Reports Overview visual foundation`) remains open/deferred.
- Static-contract cleanup remains maintenance-only and is not an M7 blocker.
