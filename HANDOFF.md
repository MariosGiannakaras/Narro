# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entries, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 4/5 | 14/19`

**Reopened Milestone 1 / M7 single-Focus physical closure remains active.** C1/C2/C3/C4 are PASS. The CI #809 event-based re-audit physically accepts the corrected compositor boundary, Blitz-now entry, task/session continuity, cross-window reconciliation, second-launch single-instance behavior, idle no-op result, mixed-DPI crossing, edge/work-area behavior, topology removal recovery and topmost behavior. No new product defect is evidenced. C5 remains OPEN only for saved placement across normal Quit→relaunch plus final tracking reconciliation.

## Current validated source baseline

- Current main source: `2767b3827670603d1ab259b6a843c2e0da82d85d` — PR #208, narrow Gate 7 Timer-region redraw correction.
- PR #208 exact head: `d885a577c5e7f2e376ed1f6cf5e7f83146dfec58`.
- Exact-head Windows CI #809 / run `36865451660`: **PASS**.
- PR-head tree == merged-main tree: `7ceb264e7eff8a74449c206a7cc998b2a4f0bb54`.
- Resulting-main Windows CI #810 / run `36867438874`: **PASS** via the identical-tree validation gate; heavy candidate jobs correctly skipped because #809 already validated the exact merged tree.
- This source preserves the single persistent `focusSurface` architecture. No timer/session/persistence semantics changed in #208.

## Exact physical artifact to use next

CI #809 production physical artifact:

- artifact id `11163439039`
- artifact digest `sha256:39ca0a91d7aa54be79ca35c509f82f25049a15a3fc4ffff199699eab309557a5`
- standalone `narro.exe` SHA-256 `a4b8e163539f429769540480a7aa0b5db9ca6fa2c356d6742f78d687b5cb5675`
- physical-build smoke: PASS, zero CI `runtimeVisual` checkpoints

Packaged Focus visual artifact `11163582492`, digest `sha256:c184e661163bdf9ff1a9dd02859d7c9523add0a5edb6433d2f7ce8a29bf96cf9`, confirms one Focus HWND `0x1022A`, compact 340x110, expanded 340x300, active title/time and no unintended scrollers. Hosted capture is reduced-motion and cannot close the physical standard-motion gate.

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

**USER ACTION REQUIRED — only one M7 physical observation remains.**

Do not repeat compositor, animations, Panel/Timer, Blitz-now, shortcuts, single-instance, DPI, edge/taskbar, topology or topmost tests. Those are accepted.

Using the same exact CI #809 production artifact:

1. keep/start one real active task so Floating Timer is visible;
2. drag Timer to an obvious safe non-default position;
3. tray **Quit Narro** normally;
4. relaunch the same CI #809 `narro.exe`;
5. reopen/show Timer for the recovered/live task as applicable;
6. show that the saved placement returns to a safe visible position and is not stranded/off-screen.

One short continuous recording is enough.

If saved placement passes:
- mark C5 PASS;
- perform final M7 tracking/crosswalk/TODO reconciliation;
- add a final immutable work-log;
- close M7 and resume the first remaining ordered M1 replacement item, not deferred M9.

If saved placement fails:
- create one narrow evidence-backed corrective PR for placement persistence/recovery only;
- validate exact head in Windows CI, guarded-merge, validate merged main, and repeat only saved-placement physical evidence.

Operational checklist: `docs/M7_CI809_RESIDUAL_PHYSICAL_CHECKLIST.md`.

## Deferred unrelated work

- PR #205 (`M9: expose validated Overview aggregation command/API`) remains open/deferred until M7 physical closure.
- PR #198 (`M9: add screenshot-backed Reports Overview visual foundation`) remains open/deferred.
- Static-contract cleanup remains maintenance-only and is not an M7 blocker.
