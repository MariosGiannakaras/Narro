# Current Windows supplement — 2026-10-29

[Corrected PR437 native evidence](../work-log/evidence/pr437-corrected-native-20261029/README.md) now supersedes changed-head NOT RUN solely for tested J01/U-R03/J05 subclaims: model labels full/quick PASS scoped; software return and user-drag override PASS scoped; reduced-motion duplicate title/time FAIL on both100%/125% and both desktop capture APIs. Normal-motion, real HDMI, error variants and other gates remain OPEN/NOT RUN. User resumed work; this protected session is finished and profiles/layout/animation restored. Current HANDOFF routes J05 to source owner; no source edits/CI/merge/counter changes. Earlier 59-cell counts remain documentary, not a count of new physical tests.

---

# M5–M9 source-readiness register — 2026-10-27

## 2026-10-28 live correction — exclude already validated work, preserve only evidence gaps

**Authority and counting:** live `TODO.md` has **59 unchecked M5–M9 documentary acceptance cells**: M5 6, M6 13, M7 18, M8 **11** (nine 2026-10-27 items **plus two 2026-10-27 user-requested U-R04/U-R05**), M9 11. The original **57-cell** crosswalk below is a frozen 2026-10-27 source-review baseline, **not** the current 59-item outstanding engineering backlog. All its 57 cells have prior deep static source review; U-R04/U-R05 have since been source-implemented and automated-validated on [PR431](https://github.com/MariosGiannakaras/Narro/pull/431), head `3c3b72b06eaa841bce9429dace83a6b5c33ba701`, [CI40573065951](https://github.com/MariosGiannakaras/Narro/actions/runs/40573065951) 3/3 PASS, and are contained in its [PR436](https://github.com/MariosGiannakaras/Narro/pull/436) and [PR437](https://github.com/MariosGiannakaras/Narro/pull/437) descendants (GitHub compare PR431→PR437 `48 ahead/0 behind`). No new source defect or separate implementation follows from an unchecked cell.

### Exclusions: completed work is not a fresh fix/test request

| Previously evidenced outcome | Exact scope retained | Do **not** request again unless source-impact analysis invalidates it |
| --- | --- | --- |
| [PR431 V01–V09](../docs/PR431_PHYSICAL_VERDICTS_2026-10-27.md) | **9/9 scoped native PASS** on old exact `6dce8daa`; V10 fresh-absent-monitor fallback was **FAIL on that old binary**, replaced in later source but replacement native **NOT RUN** | Real drag, OFF/ON genuine Quit/restart position policy, side/inset, connected-monitor first reveal, same-HWND placement, settled Done, *that* HDMI reconnect scenario. Historical passing subclaims do not automatically certify changed later binaries. |
| [PR437 original native packet](../work-log/evidence/pr437-native-20261028/README.md) | On older exact `2fc7881c`: **J02 PASS scoped** connected-screen previews/name-independent mapping; **J05 PASS scoped** same HWND/task/paused endpoint; **J06 PASS scoped** eventual exactly-once Done→Next/task identity. **J05 continuous first frames subsequently FAIL** in separate capture. | Do not recapture connected J02 snapshots, old J05 endpoint identity or old J06 eventual flow just because they share a checklist cell. Retest a narrow affected subclaim only when newer raster/monitor/revision changes actually invalidate it. |
| [PR437 first-paint evidence](../work-log/evidence/pr437-first-paint-20261028/README.md) | Full Preferences and Quick Preferences initial skeleton→ready **PASS scoped** on old exact `2fc7881c` / reduced motion; no warm/retry/normal-motion claim | Do not call this an outstanding initial-form fix or claim general no-flicker parity. |
| Prior merged source + PR automation | 57 original cells **deep static reviewed**, merged Reports Done ordering [PR388](https://github.com/MariosGiannakaras/Narro/pull/388) and pre-existing M5/M6/M8/M9 component functions. PR431 repairs pending-Preferences Done and request-keyed Reports stale responses; CI 3/3 PASS. Current PR437 `41e8ff8a` [run40677357491](https://github.com/MariosGiannakaras/Narro/actions/runs/40677357491) **3/3 PASS**, three artifacts fully SHA/CRC/provenance-verified. | These are **source/automated PASS**, not open source-fix tasks; do not treat them as all-source visual parity or physical acceptance. Preserve the approved Spectrum Core picker, image upload and 218 icons. |

### Actual remaining work — one-time, dependency-aware evidence only

1. **Changed PR437 native subclaims U-R03 / J01 / J05:** replacement EXE `3c14067a28aea1a594546b888e9dbc688ed4374d0f698cef2c6c5986abbdc002`, exact head `41e8ff8a`, source/CI/provenance PASS. Selected LG→software disconnect→reconnect returning unpinned Timer (**U-R03**), actual TV EDID model in full/quick Preferences (**J01**), and continuous real Panel↔compact first frames/normal and reduced motion with no duplicated/blank title/time (**J05**) **NOT RUN on corrected EXE**. Prior old-EXE FAILs cannot be relabeled PASS. [Frozen exact-scenario protocol](../work-log/2026-10-28-chatgpt-pr437-three-artifact-byte-verification-and-scoped-prephysical-review.md).
2. **Hardware/native topology variants not covered by accepted old evidence:** **J03/J04** actual HDMI absent/return **NOT RUN** on new PR437; missing-monitor preview freshness/error recovery and model/desktop association U-R04/U-R05 in affected Windows topology **NOT RUN**. This is not a replay of already-passed connected J02 or old V09 reconnect, which exercised different preconditions.
3. **Independent A/B compositor gate:** [PR389 A](https://github.com/MariosGiannakaras/Narro/pull/389) and [PR419 B](https://github.com/MariosGiannakaras/Narro/pull/419) have independently green source/Windows builds but each lacks the required **strict eight-case real-native visual acceptance on its current binary**; A historical 4/8 failures are old-binary evidence. B is a comparator, not a production replacement. Keep both draft/unmerged, do not count eight cases as eight new implementation fixes.
4. **Dependent PR431/436/integrated stack:** preserve V01–V09 and prior bounded physical successes where unaffected; only revalidate previously failed V10/affected U-R04/U-R05, latest native snapping, first-frame/motion and any separately recorded undecided requests. PR431/436/437 remain unmerged pending scoped native signoff, conflict strategy and resulting-main CI after any authorized merge.
5. **Remaining M5/M6/M8/M9 acceptance, not reimplementation:** previously reviewed source-present behaviors need only *missing or invalidated* visual/keyboard/hover/focus, state/persistence and exact-source parity acceptance. The archived preview composition and other evidence-limited parity cannot be marked PASS without actual comparable evidence, but their working Narro-local features must not be rewritten speculatively. Combine compatible checks; exclude already graded claims.
6. **Separate running Time Taken observation:** [source triage](../work-log/2026-10-28-chatgpt-pr437-time-taken-running-display-source-triage.md) supports a stale live-UI projection while persisted work was recovered; no proven data loss. Any live update must reconcile the runtime and SQLite checkpoint without double counting, preserve paused edit CAS and add tests. **No implementation/PASS claimed**; do not treat this as another U-R03/J01/J05 physical failure.

**Practical meaning:** This is **six overlap-aware evidence/repair work families**, **not 59 implementation tickets** and not a new count of mandatory physical test cases. Some physical variants may be combined in one protected session. Never decrement formal TODO checkboxes until each full milestone's documented acceptance gates actually pass. PA-01–09 is **USER-PAUSED under the active project instruction**; no user Windows, HDMI, AppData or executable action was performed. Physical status is **NOT RUN** for changed build; final native-acceptance readiness **NOT CERTIFIED**. M1–M4 accepted 4/10; M5–M9 remain OPEN.

---


**Purpose:** Convert the literal 57 unchecked `TODO.md` cells into a nonduplicative pre-physical disposition, without calling them 57 bugs. Snapshot source: `TODO.md` blob `8b7def91b30ea54ffa7c42e5f87ec556478b86b5`. This register is a **triage/control document**, not additional source-product proof, native acceptance, a new milestone or authority to start M10/M11/M12. It supplements the earlier [exact 57-item label inventory](../work-log/2026-10-27-chatgpt-m5-m9-57-open-checkbox-inventory-audit.md) and the [2026-10-24 PA-01–09 pre-physical review](../work-log/2026-10-24-chatgpt-pa01-pa09-optin-prephysical-audit.md).

**Source-verified corrections already present:** Reports newest-first Done row chronology, date-only grouping, timezone/ties and shared PDF contract are in merged [PR388](https://github.com/MariosGiannakaras/Narro/pull/388), `src/reportDoneOrdering.ts`, with `scripts/test-report-done-ordering.mjs`; the old `TODO.md` 2026-10-20 READY_FOR_FIX statement was superseded on 2026-10-27. `PR431` source head `484e2e72a0ac349989d57bae49644792fd64d165` has an **in-flight exact-head CI** for subsequent partial-sync-error protection; prior `95ef3b6d` 3/3 green Windows source/artifact verified, but is now historical once new head exists. Experimental compositor A [PR389](https://github.com/MariosGiannakaras/Narro/pull/389) and B [PR419](https://github.com/MariosGiannakaras/Narro/pull/419) both have **separate exact-head 3/3 CI PASS** and independently manifest-matching EXE; physical strict 8/8 per candidate remains OPEN and cannot be converted into merged/main readiness. No other *new* proven source defect is justified merely by an unchecked cell.

**Further source/package verification (2026-10-27):** [Bounded production CSS and three-PR integration review](../work-log/2026-10-27-chatgpt-search-production-css-m7-three-pr-intersection-prephysical.md) confirms the actual release frontend dist from prior green PR431 head contains the rounded Search parent-focus CSS and inner-input outline suppression; this is **compiled production-bundle evidence, not target Windows native PASS**. Archived Lists responsive preview cards with bottom actions are **already present in live main source**, superseding the older horizontal-row FIX_NOW report; exact 2024/v2.x metadata spacing remains an evidence limit, not a code defect to synthesize. **G29 manual Break natural-expiry auto-resume is existing documented/accepted behavior, not an unresolved fix or product-choice gate**, as established by [corrected source-policy ruling](../work-log/2026-10-25-chatgpt-g29-m7-verdict-correction-pr427-retracted.md) and [2026-10-27 correction](../work-log/2026-10-27-chatgpt-g29-current-authoritative-policy-reconciliation.md). The active native Panel/Timer and optional persistence fixes remain on PR431; updated first-paint SSR Quick Preferences coverage and Panel inset wording are at head `ead9a0c14d6457a527c57ee6b35d008f0e3d9eb7`, with exact-head CI40437739504 pending as of documentation. No source-parity PASS or global readiness claim is inferred.

**P03/P09/P11 exact physical evidence limits (2026-10-27):** [Original 2026-10-26 P01–P20 bounded video verdicts](../work-log/2026-10-26-chatgpt-original-video-p01-p20-bounded-verdict-final.md) establish **P03 Board Done independent-scroll candidate mismatch NOT directly filmed at its action timestamp**, with no confirmed original-source independent-lane-scroll requirement; do not randomly convert shared Board scrolling to per-lane scrolling. **P09 Compact Timer pointer move FAIL observed on older exact binary, but DOM hit-test/native held-input/root owner unproven; P11 Ctrl+F native WebView2 Find and Ctrl+Alt+T nonaction observed on older exact binary, event delivery/focus owner unproven.** [Merged PR429](https://github.com/MariosGiannakaras/Narro/pull/429) introduces read-only bounded actual native input tracing/self-test and [targeted guide](P09_P11_NATIVE_INPUT_PREFLIGHT.md), **not a product repair** or native retest. Therefore actual first-cause P09/P11 requires a clean focused Windows input/HWND source trace on the relevant exact EXE; don't infer permanent regression after subsequent code changes or claim physical PASS from instrumentation. The user's later own drag/Escape evidence should be reconciled narrowly by build identity and gesture subtype, not discarded or treated as a universal pass. [Immutable PR429 evidence](../work-log/2026-10-26-chatgpt-pr429-prephysical-validated-merged.md). These source/native gates are separate from 57-checkbox counts and unmerged PR389/419 compositor acceptance.

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
