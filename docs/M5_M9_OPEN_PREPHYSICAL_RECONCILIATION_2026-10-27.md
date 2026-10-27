# M5–M9 source-readiness register — 2026-10-27

**Purpose:** Convert the literal 57 unchecked `TODO.md` cells into a nonduplicative pre-physical disposition, without calling them 57 bugs. Snapshot source: `TODO.md` blob `8b7def91b30ea54ffa7c42e5f87ec556478b86b5`. This register is a **triage/control document**, not additional source-product proof, native acceptance, a new milestone or authority to start M10/M11/M12. It supplements the earlier [exact 57-item label inventory](../work-log/2026-10-27-chatgpt-m5-m9-57-open-checkbox-inventory-audit.md) and the [2026-10-24 PA-01–09 pre-physical review](../work-log/2026-10-24-chatgpt-pa01-pa09-optin-prephysical-audit.md).

**Source-verified corrections already present:** Reports newest-first Done row chronology, date-only grouping, timezone/ties and shared PDF contract are in merged [PR388](https://github.com/MariosGiannakaras/Narro/pull/388), `src/reportDoneOrdering.ts`, with `scripts/test-report-done-ordering.mjs`; the old `TODO.md` 2026-10-20 READY_FOR_FIX statement was superseded on 2026-10-27. `PR431` source head `484e2e72a0ac349989d57bae49644792fd64d165` has an **in-flight exact-head CI** for subsequent partial-sync-error protection; prior `95ef3b6d` 3/3 green Windows source/artifact verified, but is now historical once new head exists. Experimental compositor A [PR389](https://github.com/MariosGiannakaras/Narro/pull/389) and B [PR419](https://github.com/MariosGiannakaras/Narro/pull/419) both have **separate exact-head 3/3 CI PASS** and independently manifest-matching EXE; physical strict 8/8 per candidate remains OPEN and cannot be converted into merged/main readiness. No other *new* proven source defect is justified merely by an unchecked cell.

**Reading the table:** CODE_PRESENT_CLAIMED means the checked repository notes document a prior implementation/merge, not that a new physical test ran or exact source parity passed. `M7_MOTION_GATE` means multiple checklist cells refer to one overlapping continuous-motion/compositor evidence and correction family, not separate bugs. `REVIEW_RENDERED_COMPOSITION` means an actual known appearance discrepancy with evidence limitations, not permission to invent new UI. Rows stay open until independent acceptance; no count is decremented.

## M5 — 6 documentary open cells

| Cell | What the user sees / tests | Pre-physical disposition |
|---:|---|---|
| [1](../TODO.md#milestone-5) · L346 | Home task-preview rows | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [2](../TODO.md#milestone-5) · L350 | Create/Edit List Spectrum Core UI | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [3](../TODO.md#milestone-5) · L355 | Scheduled occurrence groups | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [4](../TODO.md#milestone-5) · L357 | Done date grouping | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [5](../TODO.md#milestone-5) · L373 | Recurring-parent actions | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [6](../TODO.md#milestone-5) · L394 | Archived list previews | REVIEW_RENDERED_COMPOSITION — source card-density difference remains; avoid changing locked Spectrum Core UI |

## M6 — 13 documentary open cells

| Cell | What the user sees / tests | Pre-physical disposition |
|---:|---|---|
| [1](../TODO.md#milestone-6) · L448 | Focus list selector | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [2](../TODO.md#milestone-6) · L451 | Focus live-card hover actions | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [3](../TODO.md#milestone-6) · L452 | POMO badge | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [4](../TODO.md#milestone-6) · L454 | Break Done history | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [5](../TODO.md#milestone-6) · L456 | Inline Done success card | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [6](../TODO.md#milestone-6) · L457 | Celebration media | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [7](../TODO.md#milestone-6) · L458 | Early/late completion feedback | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [8](../TODO.md#milestone-6) · L459 | Break active-card identity | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [9](../TODO.md#milestone-6) · L460 | Break header EST projection | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [10](../TODO.md#milestone-6) · L471 | Overdue signed clock | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [11](../TODO.md#milestone-6) · L472 | Time's Up actions | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [12](../TODO.md#milestone-6) · L473 | Relative overdue age | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [13](../TODO.md#milestone-6) · L502 | Focus end-to-end / single focusSurface | E2E_PHYSICAL_PENDING |

## M7 — 18 documentary open cells

| Cell | What the user sees / tests | Pre-physical disposition |
|---:|---|---|
| [1](../TODO.md#milestone-7) · L539 | One Focus HWND shared by Panel/Timer | ARCHITECTURE_OR_BEHAVIOR_PRESENT_HISTORICALLY; CURRENT_NATIVE_GATE_OPEN |
| [2](../TODO.md#milestone-7) · L540 | Drag/topmost/taskbar | ARCHITECTURE_OR_BEHAVIOR_PRESENT_HISTORICALLY; CURRENT_NATIVE_GATE_OPEN |
| [3](../TODO.md#milestone-7) · L543 | Compact Timer surface | ARCHITECTURE_OR_BEHAVIOR_PRESENT_HISTORICALLY; CURRENT_NATIVE_GATE_OPEN |
| [4](../TODO.md#milestone-7) · L544 | Expanded action rail | ARCHITECTURE_OR_BEHAVIOR_PRESENT_HISTORICALLY; CURRENT_NATIVE_GATE_OPEN |
| [5](../TODO.md#milestone-7) · L545 | Expanded subtasks/editing | ARCHITECTURE_OR_BEHAVIOR_PRESENT_HISTORICALLY; CURRENT_NATIVE_GATE_OPEN |
| [6](../TODO.md#milestone-7) · L548 | Fixed-width icon targets/tooltips | ARCHITECTURE_OR_BEHAVIOR_PRESENT_HISTORICALLY; CURRENT_NATIVE_GATE_OPEN |
| [7](../TODO.md#milestone-7) · L549 | Panel↔Timer content/motion | M7_MOTION_GATE — PR389/419 source & CI green separately; no consolidated native signoff |
| [8](../TODO.md#milestone-7) · L580 | Native gate continuous Panel/Timer/resize frames | M7_MOTION_GATE |
| [9](../TODO.md#milestone-7) · L581 | Native gate staging/ghost/scroll/reappearance | M7_MOTION_GATE |
| [10](../TODO.md#milestone-7) · L582 | Mode shortcut | ARCHITECTURE_OR_BEHAVIOR_PRESENT_HISTORICALLY; CURRENT_NATIVE_GATE_OPEN |
| [11](../TODO.md#milestone-7) · L589 | Locate Timer pulse shortcut | ARCHITECTURE_OR_BEHAVIOR_PRESENT_HISTORICALLY; CURRENT_NATIVE_GATE_OPEN |
| [12](../TODO.md#milestone-7) · L596 | Timer placement, drag, restart policy and hotplug | PR431_EXACT_HEAD_REVALIDATING — session-only default/optional restart |
| [13](../TODO.md#milestone-7) · L601 | Topmost versus maximized/borderless | ARCHITECTURE_OR_BEHAVIOR_PRESENT_HISTORICALLY; CURRENT_NATIVE_GATE_OPEN |
| [14](../TODO.md#milestone-7) · L605 | Timer expansion near taskbar/bottom edge | ARCHITECTURE_OR_BEHAVIOR_PRESENT_HISTORICALLY; CURRENT_NATIVE_GATE_OPEN |
| [15](../TODO.md#milestone-7) · L612 | No perpetual idle animation | ARCHITECTURE_OR_BEHAVIOR_PRESENT_HISTORICALLY; CURRENT_NATIVE_GATE_OPEN |
| [16](../TODO.md#milestone-7) · L631 | Candidate compositor strict motion comparison | M7_MOTION_GATE |
| [17](../TODO.md#milestone-7) · L632 | Action-label/time/hit-target comparison | M7_MOTION_GATE |
| [18](../TODO.md#milestone-7) · L633 | M7 integrated milestone reconciliation | M7_MOTION_GATE |

## M8 — 9 documentary open cells

| Cell | What the user sees / tests | Pre-physical disposition |
|---:|---|---|
| [1](../TODO.md#milestone-8) · L682 | Dedicated Windows shortcuts dialog | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [2](../TODO.md#milestone-8) · L687 | Settings info glyphs | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [3](../TODO.md#milestone-8) · L689 | Preferences modal composition | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [4](../TODO.md#milestone-8) · L690 | Monitor card selection | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [5](../TODO.md#milestone-8) · L691 | Timezone selector | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [6](../TODO.md#milestone-8) · L692 | Parent/child settings disclosures | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [7](../TODO.md#milestone-8) · L693 | Sound volume popover | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [8](../TODO.md#milestone-8) · L694 | Timed-alert task-card flash | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [9](../TODO.md#milestone-8) · L695 | Independent success sound | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |

## M9 — 11 documentary open cells

| Cell | What the user sees / tests | Pre-physical disposition |
|---:|---|---|
| [1](../TODO.md#milestone-9) · L726 | Reports list filter badges | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [2](../TODO.md#milestone-9) · L729 | Date-range chart coverage | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [3](../TODO.md#milestone-9) · L730 | Chart hover day band | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [4](../TODO.md#milestone-9) · L731 | Chart options menu | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [5](../TODO.md#milestone-9) · L734 | Done rows date/order/layout | MERGED_PR388_FIX_PRESENT — timestamp-descending UI/PDF, physical/source parity still OPEN |
| [6](../TODO.md#milestone-9) · L736 | Month/year date navigation | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [7](../TODO.md#milestone-9) · L738 | Sessions Total Tasks metric | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [8](../TODO.md#milestone-9) · L739 | Sessions Break icon | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [9](../TODO.md#milestone-9) · L741 | Add Session task-picker open/close | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [10](../TODO.md#milestone-9) · L742 | Recent Tasks colored list badges | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |
| [11](../TODO.md#milestone-9) · L743 | Sessions detail dialog focus/lifecycle | CODE_PRESENT_CLAIMED; SOURCE/NATIVE_PARITY_OPEN |

## Non-duplicative practical work packages

**A. Current complete source slice:** PR431 new head must be 3/3 exact-SHA CI green and manifested. Same-source scoped user-native checks: 16-DIP Panel margin on relevant monitor/DPI; restart OFF vs ON including legacy location; live Quick Preferences monitor/side relocation; Preferences and Search first/repeated paint; no repeat HDMI/drag-Escape evidence without invalidation. A passed automated build is NOT physical proof.

**B. Independent M7 compositor:** PR389 A and PR419 B are separate alternate code branches; prior A8/8+B8/8 real native route acquisitions and frame reviews are already frozen, but strict acceptance is still OPEN, see [current physical reconciliation](../work-log/2026-10-25-chatgpt-m7-current-candidate-physical-gate-reconciliation.md). Do not merge A/B blindly or attempt an unapproved global fade/animation rewrite. Inspect existing QPC/native capture first; fix only a confirmed first discrepant frame/root cause on the owner branch. Missing real present/interaction evidence cannot be manufactured by preflight.

**C. M5/M6/M8/M9 acceptance:** Use prior head/merged-main preflights and frozen native captures. Verify only missing/invalidated shared-surface subtasks; an original-version evidence limit does not mean disabling a working Narro-local feature. Protected Spectrum Core picker/image/icons must remain untouched. Existing [PA-01–09 pre-physical dispositions](../work-log/2026-10-24-chatgpt-pa01-pa09-optin-prephysical-audit.md) are retained rather than rerun from scratch. For M9 B27 the actual code gap is already fixed in merged PR388; check native/rendered parity only.

**Exit condition:** All material source defects established by observable evidence have an exact merged/main or deliberately held owner-branch correction, regression, and successful exact-head CI; any remaining physical-only or original-source-only uncertainty is specifically recorded. There is no evidence-supported claim of 57 outstanding app bugs, 57 mandatory preflights, or one source-integrated all-fixes executable yet. Roadmap still M1–M4 formally accepted (4/10), M5–M9 open; M10 separate approval hard gate.
