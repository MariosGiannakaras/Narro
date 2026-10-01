# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entries, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 2/5 | 11/19`

**Reopened Milestone 1 / M7 single-Focus physical closure remains active.** C1/C2/C3 are validated. CI #806 physical evidence exposed one real Timer compositor defect; the narrow correction is now merged and automated-green. C4/C5 remain physical-open.

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

## M7 checkpoint state

- C1: PASS
- C2: PASS
- C3: PASS
- C4 / Gate 7 physical continuity: **OPEN**, but narrowed to retesting the corrected Timer-to-Timer boundary on the #809 production artifact.
- C5 / Gate 12 + platform closure: **OPEN** for the remaining physical-only platform checks.

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

Use the exact CI #809 physical artifact above with a **clean validation profile**. Do not repeat already-proven unaffected work unnecessarily.

Residual run:

1. active task; 5x compact <-> expanded with Windows animations On, watching specifically for the former white L/blank frame;
2. 2x compact <-> expanded with animations Off; restore On;
3. verify second launch remains single-instance;
4. Timer -> `Blitz now` -> Panel;
5. end the task, then verify idle Ctrl+Shift+T and Find Timer no-op;
6. real 100% <-> 125% monitor crossing plus edge/taskbar expand/collapse;
7. topology disconnect/reconnect if available;
8. topmost over maximized/borderless-fullscreen app;
9. drag, close/restart, safe saved placement.

If this residual run passes, reconcile `TODO.md`, `STATUS.md`, crosswalk and a final immutable work-log, close M7, then resume the ordered roadmap.

If it fails, create only one narrow evidence-backed corrective PR for the failing gate and repeat only the affected physical portion.

## Deferred unrelated work

- PR #205 (`M9: expose validated Overview aggregation command/API`) remains open/deferred until M7 physical closure.
- PR #198 (`M9: add screenshot-backed Reports Overview visual foundation`) remains open/deferred.
- Static-contract cleanup remains maintenance-only and is not an M7 blocker.
