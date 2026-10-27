# M5–M9: exhaustive 57-cell dependency/logic/code audit plan — 2026-10-27

**User directive:** audit all 57 existing documentary acceptance cells *deeply*, prioritize failure-prone M7. This is a **new, bounded source-analysis workstream**, separate from prephysical readiness **3/5; 8/13** and formal roadmap **M1–M4 4/10**. The previous [57-cell triage](M5_M9_OPEN_PREPHYSICAL_RECONCILIATION_2026-10-27.md) is **57/57 labels classified**, NOT 57/57 exhaustive code review. Never equate source-review disposition to native Windows PASS or original Blitzit parity.

**Pinned audit inputs:** GitHub main HEAD at kickoff `6e62f16bf7757315a7efb2b67d80386b0e853678` (documentation may advance; verify affected application source blobs on subsequent passes), open PR431 `3e45b9986e4f6afed5ff07f33b922f71eea878f3` (exact 3/3 CI40470719965, PE SHA256 `261bfe17324718510e1debf711110645eb514fee87b94315328a7344827f3362`); M7 A PR389 `ec9227a2e09a69c380d4605aaf9623bdd9b9c394`; B PR419 `43adb6a9d798dca56dd89c0f4f91c888e1d4fcd9` (independently green, physically unaccepted, not integrated). Immutable past native evidence remains scoped to its exact build and tests.

## Acceptance rule for one DEEP_REVIEWED row

A row counts as **1/57 deep static reviewed** only once its durable finding/trace has:
1. **Precisely identified** user action and expected state/visual behavior plus canonical evidence or explicit unknown.
2. **Grounded** the actual current source path and exact source SHA: entry and consumer, React state owner/IPC, Rust command/service/transaction/SQLite and event topology **where relevant**; explicitly `N/A` for legitimately absent layers.
3. **Walked** sequencing, synchronous admission, stale async responses, debouncing, lock and cancellation/reentrancy guards.
4. **Walked** errors, partial commits, rollback, retry and user feedback; no error swallowed into a success claim.
5. **Walked** memory→disk, process restart, retained HWND/show/hide, task/session continuity and cross-window observations, only where relevant.
6. **Examined** OS/display/DPI/hotplug, focus/keyboard/accessibility and normal/reduced-motion or relevant negative states.
7. **Tracked** cross-feature dependencies and invalidation edges (M5/M6/M8/M9; PR431 vs PR389 vs PR419) and likely causal first-failure owners.
8. **Mapped** meaningful automated tests (actual semantic runtime tests vs source-string contracts vs screenshot/CI) and recorded missing regression conditions.
9. **Separated** `CODE_PRESENT`, `CONFIRMED_DEFECT`, `UNPROVEN_RISK`, `AUTOMATED_PASS`, `PHYSICAL_OPEN`, `SOURCE_PARITY_OPEN`, `BLOCKED_BY_DEPENDENCY` with exact evidence. A clean static review does not imply functional/physical PASS.
10. **Recorded** line/function references or immutable evidence, confidence boundaries, the single next validation needed, and source correction only for demonstrable failures.

Unexamined criteria remain **0/57 deep reviewed**, even if prior triage, CI or video review exists. A candidate-specific subpath may be marked `PARTIAL` and excluded from deep-reviewed numerator until the row's relevant cross-path ownership is checked. Each review is time/source-scoped; a later source change reopens affected rows.

## Work order and numerical bounds (57 total, no overlap)

| Order | Milestone | Cells | Audit emphasis / cross-milestone propagation |
|---:|---|---:|---|
| 1 | **M7** | **18** | One persistent HWND/React/native presentation ownership, rasters and DWM staging, timer geometry/drag/persistence, monitor DPI/hotplug, reduced motion, shortcuts and reentry, current PR431 vs physical-only A/B |
| 2 | **M6** | **13** | Focus selection, timer ledger, Done/Break, live projections, stale async actions and one shared native Focus host; feed into M7 |
| 3 | **M8** | **9** | Preferences state/event race, shortcuts/pending error recovery, sounds/alerts/OS permissions, appearance under focus and restart |
| 4 | **M9** | **11** | Reports Sessions/Overview/Done/chart/CSV/PDF and true read freshness, timezone/order and task ledger |
| 5 | **M5** | **6** | Board/list/recurrences/Archive, Spectrum Core approved UI, drag/done scheduling and cross-focus invalidation |
| 6 | Cross-edge reconciliation | (no new denominator) | M5↔M6↔M7↔M8↔M9 graph, prioritized confirmed defects + regressions; source ownership/PR order; targeted physical handoff and fresh exact-head CI only on real code change |

**Initial formal deep-review count:** **0/57**; M7 **0/18**. Update in the *linked immutable dated deep-audit logs* only upon a completed row trace. The existing user readiness counter **3/5 / 8/13** is unchanged and must not be used as this audit numerator.

## Mandatory M7 risk map, audited in dependency order

- **Core native presentation ownership:** M7-01, 03, 04, 05, 07, 08, 09, 16, 17, 18. Trace `FocusSurfaceCoordinator` → `focusSurfaceModeApi` → `lib.rs` presentation/raster state → `timer_region` / `focus_frame_hold` → precise PE and physical evidence; distinguish PR389 A `250ms`, PR419 B `500ms` from PR431. Verify cancellation, stale renderer, timeouts/watchdog, commit/rollback and incoming event orders. **Do not silently merge candidates under active strict physical holds.**
- **Placement and native lifecycle:** M7-02, 12, 13, 14. Trace `floating_placement`, `windows/topology`, `normal_shutdown`, preference settings, monitor identities, DPI sizing and saved/temporary disconnection policy, WindowMode transition suppression, drag cancel/settled save. Preserve personal AppData.
- **Interaction/security/accessibility:** M7-06, 10, 11, 15 + action rails. Check hotkeys registration/races, actual pointer delivery, finite pulse/idle animations, focus/tray/topmost; physical evidence is the only native-pixel/interaction oracle.
- **Critical shared-state dependencies:** M6 TimerService and panel/board refresh; M8 display preferences/shortcut enablement; M9 session and Done ledger; M5 ListBoard selection. Avoid changing exact source behavior of approved Spectrum Core picker/image/218 icons.

## Deliverables and decision gates

1. Commit this plan only to main tracking/documentation (no source/config mutation, no CI or physical execution implied).
2. Produce append-only immutable audit logs with a row matrix of **ID / source owner / cross-dependencies / test scope / evidence confidence / first-risk mechanism / DEEP_REVIEWED or PARTIAL / next action**; test and patch only confirmed defects in the existing owning PR or safe new feature PR following workflow.
3. Update `HANDOFF.md`, `STATUS.md`, `TODO.md` with exact source/ref and live bounded review counter; never edit previous immutable logs.
4. Once M7 deep-review 18/18 is genuinely obtained, apply same rule to M6 13, M8 9, M9 11 and M5 6, then cross-milestone causal dependency passes. Revalidate impacted rows after source fixes.
5. Codex Windows physical operator owns independent actual original-binary observations under proper authorization; PA-01–09 stay user-paused under governing project restriction. PR389/PR419 strict `PHYSICAL_BEFORE_MERGE` remains; M10, M11 and M12 never activate through this audit.

**Scope honesty:** "exhaustive" here means systematic evidence-backed path and invariant coverage for all 57, not formal verification of every possible interleaving or unobservable GPU present. Highlight uncovered interleavings and mark `EVIDENCE_LIMIT` instead of promising mathematical completeness.
