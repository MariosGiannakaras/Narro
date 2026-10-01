# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entries, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 / M7 single-Focus physical closure remains active.** C1/C2/C3 are validated. The corrected CI #809 two-monitor re-audit physically accepts the compositor boundary, Blitz-now entry, cross-window reconciliation, mixed-DPI crossing, edge/work-area behavior, topology removal recovery and topmost behavior. No new product defect is evidenced. C4/C5 remain open only for three non-pixel-conclusive residual observations: second-launch ownership, the identities of the two idle shortcut inputs, and Quit→relaunch saved placement.

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

Still supportive but not independently pixel-conclusive:
- the recording launches Narro and later Alt-Tab shows one Narro app entry with no conflict/duplicate UI, but it does not show Task Manager process count or visibly prove a primary process existed immediately before the launcher activation;
- after completion, `All Clear` remains idle with no stale Timer resurfacing, but the identities of Ctrl+Shift+T / Ctrl+Shift+P are not rendered/marked;
- live drag/cross-monitor/edge placement is well proven, but no unambiguous tray Quit → same-build relaunch → saved-placement recovery appears.

The recording does not visibly show `Get-FileHash`; exact CI #809 identity is bound by the operator/test context rather than a pixel-readable hash.

Corrected durable evidence: `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. The prior `2026-10-01-chatgpt-m7-ci809-partial-physical-audit.md` remains immutable as the superseded first interpretation.

## M7 checkpoint state

- C1: PASS
- C2: PASS
- C3: PASS
- C4 / Gate 7 physical continuity: **OPEN only for input/ownership proof**. The visual/session/Blitz-now/reconciliation portions are physically PASS. Remaining: unequivocal second-launch ownership and observable/attested identities of the idle Ctrl+Shift+T / Ctrl+Shift+P inputs.
- C5 / Gate 12 + platform closure: **OPEN only for saved-placement restart**. Mixed-DPI crossing, edge/taskbar placement, real topology-removal recovery and topmost-over-maximized-app are physically PASS.

Do not increment progress until C4/C5 both close.

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

Do **not** repeat compositor, Blitz-now, mixed-DPI, edge/taskbar, topology-removal or topmost tests. Those are accepted by the corrected CI #809 re-audit.

Only three closure observations remain:

1. **Single-instance ownership (C4):** with Narro already running, launch the same CI #809 EXE again. Show either Task Manager Details filtered to `narro.exe`, or another unequivocal process/runtime observation establishing that only one Narro authority remains.
2. **Idle shortcut identities (C4):** at visible `All Clear`, make Ctrl+Shift+T and Ctrl+Shift+P auditable (for example, a Notepad marker immediately before each). Neither may surface/pulse a stale Timer.
3. **Saved placement across restart (C5):** with an active Timer, drag it to an obvious non-default safe location, tray `Quit Narro`, relaunch the same CI #809 EXE, then show the Timer returning to a safe visible saved placement.

These can be one short recording. No animations-Off cycle count or reconnect choreography needs to be repeated: `docs/M7_CLOSURE_PLAN.md` is the authoritative closure controller.

If those observations pass, reconcile `TODO.md`, `STATUS.md`, crosswalk and a final immutable work-log, close C4/C5/M7, then resume the ordered roadmap.

If any fails, create only one narrow evidence-backed corrective PR for the exact failing behavior and repeat only that physical portion.

## Deferred unrelated work

- PR #205 (`M9: expose validated Overview aggregation command/API`) remains open/deferred until M7 physical closure.
- PR #198 (`M9: add screenshot-backed Reports Overview visual foundation`) remains open/deferred.
- Static-contract cleanup remains maintenance-only and is not an M7 blocker.
