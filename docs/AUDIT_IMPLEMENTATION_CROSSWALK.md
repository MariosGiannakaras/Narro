<!-- Current2026-10-04 cross-gate disposition: CI942 closes shared M1 replacement placement/topology/performance, M6 placement/topology and M8 Preferences writer/save-restart. Modal17 corrected in PR232/CI944 but physically open. Detailed scoped results: ../work-log/2026-10-04-codex-m7-ci942-physical-results.md. No whole source-parity or M10 advance. -->

# Audit → implementation crosswalk

Status: **ACTIVE / authoritative implementation-routing companion**

Created: 2026-09-28

This register exists so Narro does not keep implementing against superseded assumptions after stronger parity, video, Help Center, UI/UX or reliability evidence is found.

It does **not** add an eleventh milestone. `TODO.md` remains the ordered 10-milestone roadmap.

## Fidelity interpretation — user direction 2026-09-28

For all in-scope personal/local functionality, the default disposition is **maximum observable Blitzit parity** from the strongest available evidence. Confirmed source behavior/visuals are not optional inspiration and must not be replaced by discretionary redesign.

An `INTENTIONAL_DEVIATION` or `EXCLUDED` disposition is valid only when supported by one of these reasons:
- explicit local-only/personal-use scope removes a cloud/account/subscription/AI/integration dependency;
- reproducing the source behavior would reintroduce a documented reliability/data-integrity defect;
- accessibility or Windows-platform correctness requires a different treatment;
- the source evidence is genuinely ambiguous or technically impossible to reproduce safely.

Every other unexplained visual or functional mismatch is a parity finding to fix or route, including small interaction/state/copy/layout/motion discrepancies when evidence exists.

## Binding routing rule

Before changing any surface:

1. inspect the relevant rows here;
2. use the newest evidence/specification, not an older implementation assumption;
3. if a known finding for an already-built/current surface is `FIX_NOW`, correct and validate it before unrelated forward feature work;
4. if the finding belongs to a genuinely later milestone, keep it routed there and ensure that milestone's TODO contains it;
5. if evidence is ambiguous, exhaust the relevant evidence and keep the uncertainty explicit; when the exact source detail remains unknowable, use the strongest available evidence plus established professional UX/engineering practice, Narro's existing design language, Windows conventions and accessibility to choose the most coherent implementation, then record the inferred decision rather than presenting it as confirmed Blitzit behavior;
6. if Narro intentionally improves on a source limitation/bug, retain the improvement as `INTENTIONAL_DEVIATION`;
7. no material finding may exist only in an evidence document without one explicit disposition here.

Disposition values:
- **VALIDATED**
- **FIX_NOW**
- **ROUTED_Mx**
- **VALIDATION_OPEN**
- **AMBIGUOUS** — exact Blitzit behavior is not established; this preserves evidence uncertainty, but does not automatically block implementation. After relevant research is exhausted, a professional evidence-consistent Narro decision may be implemented and recorded without pretending it is confirmed source behavior.
- **INTENTIONAL_DEVIATION**
- **EXCLUDED**

## Canonical source-analysis consumption

Use `docs/BLITZIT_PARITY_RECONCILIATION_WORKFLOW.md` for the binding source-analysis -> implementation handoff.

`SOURCE_COMPLETE` forensic records are the normal implementation input; implementation agents do not repeat the raw screenshot/video analysis by default. For stable screenshot-backed states, the measurable visual layer is `docs/BLITZIT_VISUAL_CALIBRATION_TRACKER.md`. New material findings are reconciled here against current code before the affected user-visible surface is considered parity-complete. A completed source record may therefore still be `RECONCILIATION_PENDING`, and screenshot source inspection may still be `VISUAL_CALIBRATION_OPEN`. M10/final review directly rechecks original references, but that is release-candidate verification rather than the first implementation comparison.

## Global no-orphan reconciliation — 2026-10-04

**Status: COMPLETE for source -> current implementation -> disposition routing.** This is an implementation-routing result, not a claim that Narro has achieved source parity.

Reconciled baseline:
- reconciled runtime baseline: merged runtime `main` `f53a850f51375f15a0b2b4efe106da95e30b6e73`; later commits in this reconciliation are documentation-only and do not change the compared implementation;
- canonical static source: **46/46 SOURCE_COMPLETE** and **46/46 calibration dispositions**;
- canonical video source: **19/19 SOURCE_COMPLETE**;
- calibrated visual-system families: **8/8 complete**;
- PR #226 Sessions implementation: exact head `106d3447c6614d830b59e5464fe71b70e5552eda` PASSed Windows CI #915; all 22 files changed by that PR have identical blob SHAs on current `main`;
- no new `SOURCE_PARITY_PASS` is claimed by this reconciliation. Narro-owned fixtures, CI screenshots and physical Windows PASS remain distinct evidence gates.

### Static-source coverage ledger — 46/46

| Coverage family | Canonical screenshot IDs | Current Narro / route | Disposition |
| --- | --- | --- | --- |
| Home/list/create/search shells | SS-C01, SS-C03, SS-C04, SS-C05, SS-C06, SS-C16 | Production list/create/search/home surfaces exist and have automated fixture coverage. No orphan functional requirement was found. Direct Blitzit comparison remains required before parity certification. | **IMPLEMENTED / VALIDATION_OPEN** |
| Planning board + archive | SS-C10, SS-C11, SS-H01, SS-H02, SS-H13, SS-H14, SS-H15 | Planning progress/ordinal/rail/drag/delete/archive corrections are implemented in PR227. P3-M5 direct source/state acceptance remains open; narrow metrics20 are corrected in PR233 and await actual CI948 retest. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source and affected metrics20** |
| Focus / Floating / Notes / subtasks | SS-C18, SS-C19, SS-C20, SS-C21, SS-H03, SS-H04, SS-H05, SS-H09, SS-H10, SS-H11, SS-H12 | Core Focus/Floating/Notes/subtask functionality exists; current PR228/229 compact-hover, rounded shell, Notes grammar and calibrated live-edge corrections are implemented. Exact CI936 directly accepts the scoped compact grammar/silhouette; CI942/944 add native/integration evidence. Required affected source comparisons remain listed under P3-M6 and current physical observations. | **IMPLEMENTED / AUTOMATED_VALIDATED; scoped P3-M7 physical/source comparisons accepted; remaining VALIDATION_OPEN** |
| Preferences / Windows shortcuts | SS-C07, SS-C08, SS-C09, SS-C17, SS-H06 | M8 runtime/settings work and PREF-R05/PREF-R06 are automated-validated. CI942 physically verifies the contention correction save/restart. CI944 ordinary modal actions pass17; native modal Find18 remains open pending PR233 exact-EXE retest. | **AUTOMATED_VALIDATED / scoped PHYSICAL_PASS save/restart / VALIDATION_OPEN source and modal18** |
| Scheduling / recurrence | SS-H07, SS-H08 | M4 scheduling/recurrence behavior and the No Repeat destructive consequence are validated. Stable visual comparison remains part of release/source parity revalidation. | **AUTOMATED_VALIDATED / VALIDATION_OPEN** |
| Reports / Sessions | SS-C02, SS-C12, SS-C13, SS-C14, SS-C15, SS-C22, SS-H16, SS-H17 | Production Overview is validated; production Sessions/Add/Edit/detail plus Sessions CSV are on current main with PR #226 exact-head CI #915 blob identity. Overview PDF remains unimplemented. Direct source visual comparison is still open. | **AUTOMATED_VALIDATED / FIX_NOW M9 (Overview PDF) / VALIDATION_OPEN** |
| Historical/context-only | SS-T01, SS-T02, SS-T03, SS-T04, SS-T05, SS-T06, SS-T07 | Retained only where they explain evolution/conflicts. Newer current v2.6.69/Help/Pass-3 evidence wins for implementation. | **CONTEXT / SUPERSEDED; no independent implementation obligation** |

### Video-source coverage ledger — 19/19

| Video | Material implementation result | Disposition |
| --- | --- | --- |
| VE-001 | Broad product-loop corroboration only; account/cloud/pricing/integration material stays outside Narro scope. | **IMPLEMENTED where in scope / EXCLUDED where scoped out** |
| VE-002 | Terminal EST suffix parse/removal is implemented and validated. | **AUTOMATED_VALIDATED M8** |
| VE-003 | Focus queue/live actions, success gate and Panel/Floating foundation exist. The compact rest/hover/selected-pill grammar and rounded silhouette now have exact CI936 direct source comparison, with the exterior shadow deviation documented. Other Focus/source gates retain their detailed routes. | **SCOPED PHYSICAL_PASS / SOURCE_COMPARISON_PASS grammar/silhouette; exterior shadow INTENTIONAL_DEVIATION; remaining VALIDATION_OPEN** |
| VE-004 | First-use/list/task/Blitz/Focus core loop exists. Auth/trial/pricing is excluded. Board/Floating deltas inherit the explicit M5/M7 rows below. | **IMPLEMENTED / EXCLUDED / routed deltas** |
| VE-005 | Core task CRUD, lane movement, overflow and metrics exist. Resting ordinal, five-action hover rail, Today progress and lifted-card/reflow/settle were implemented in PR227/CI927; P3-M5-01/02/03 still require direct physical/source verification. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source comparison** |
| VE-006 | CI948 direct comparison finds Delete confirmation in the wrong container25: canonical menu remains open, bottom row becomes trash/Confirm/X. Direct empty-list Archive/no-second-dialog grammar passes; whole shell/counts remain open. | **PR234 delete candidate LOCAL_VALIDATED/CI_PHYSICAL_OPEN; SCOPED_SOURCE_PASS archive grammar** |
| VE-007 | Scheduling/reminder shortcut flow is implemented and validated. | **AUTOMATED_VALIDATED M4/M8** |
| VE-008 | Recurring setup/materialization and detached-child safety are implemented and validated. | **AUTOMATED_VALIDATED M4/M5** |
| VE-009 | Custom recurrence forms and conditional recurrence semantics are implemented and validated. | **AUTOMATED_VALIDATED M4** |
| VE-010 | PR229/CI939 implements Bold/Italic/strike/bullets/numbered/undo/redo and automatic http(s) URL recognition, without an Add Link control. Browser opening still requires explicit activation. Toolbar/URL grammar has scoped CI942 direct comparison PASS; whole Notes source composition remains open. | **SCOPED PHYSICAL_PASS / SOURCE_COMPARISON_PASS toolbar+URL; whole Notes VALIDATION_OPEN; browser-open INTENTIONAL_DEVIATION retained** |
| VE-011 | Overview metrics/chart/lower panels are production-wired and automated-validated. The source's own historic numeric inconsistency remains an evidence limitation, not a Narro target. | **AUTOMATED_VALIDATED M9 / VALIDATION_OPEN source comparison** |
| VE-012 | Reporting semantics are implemented from authoritative local session history; rounding/denominator ambiguities remain explicitly bounded. | **AUTOMATED_VALIDATED M9 / AMBIGUOUS only where source is internally inconsistent** |
| VE-013 | Subtask add/edit/reorder/delete/progress across board/Focus/Floating is implemented; historical integration-specific behavior is not Narro scope. Physical Floating continuity is still open. | **AUTOMATED_VALIDATED / VALIDATION_OPEN M7 / EXCLUDED integration context** |
| VE-014 | Preferences hierarchy/runtime effects and PREF-R05/PREF-R06 are validated. CI942 physically verifies the later contention correction save/restart; whole Preferences source/shortcut acceptance remains open. | **AUTOMATED_VALIDATED M8 / scoped PHYSICAL_PASS CI942 / VALIDATION_OPEN source** |
| VE-015 | Sessions dashboard, Add Session, inline edit/detail and Sessions CSV are now on current main and exact-head CI #915 validated. Overview PDF remains the sole top-level M9 implementation gap. | **AUTOMATED_VALIDATED M9 / FIX_NOW M9 Overview PDF / VALIDATION_OPEN source comparison** |
| VE-016 | EST/Pomodoro/count-up/break/overtime semantics are implemented; current Focus/Floating exact presentation remains subject to M7 physical and source-parity validation. | **AUTOMATED_VALIDATED M3/M6 / VALIDATION_OPEN M7** |
| VE-017 | Recurrence update/No Repeat consequence behavior is validated. | **AUTOMATED_VALIDATED M4/M5** |
| VE-018 | Historical planning semantics remain context; the separate 9.344 s planning clip keeps its unmapped lineage and is not relabeled as VE-018. Modern planning deltas are routed from that direct clip plus current Help evidence. | **CONTEXT / AMBIGUOUS lineage / FIX_NOW M5 only for independently corroborated deltas** |
| VE-019 | Historical Floating/theme/subtask evolution is context. Narro intentionally does not reproduce the historical first-subtask-live limitation. | **INTENTIONAL_DEVIATION** + current evidence wins |

### Calibrated visual-system coverage — 8/8

| Family | Current implementation comparison | Disposition / implementation route |
| --- | --- | --- |
| VS-01 Shells / surface hierarchy | Main/Focus/Floating/modal/Preferences shells exist. Compact16px rounded treatment and cyan→mint/lime live edge are implemented in PR228/229. CI936 directly accepts the compact silhouette; native exterior shadow deviation is explicit. Other calibrated shells require their source comparison. | **IMPLEMENTED / scoped compact PHYSICAL_PASS; VALIDATION_OPEN M5–M9** |
| VS-02 Spacing / density / alignment | Shared spacing tokens and dense card/row foundations exist; PR #225 corrects narrow-card/readability regressions. Cross-surface direct source comparison is not yet certified. | **IMPLEMENTED foundation / VALIDATION_OPEN M5–M9** |
| VS-03 Typography / truncation | Shared hierarchy/ellipsis exists. Exact Blitzit font identity is not established by source evidence and must not be invented. | **IMPLEMENTED / AMBIGUOUS exact font / VALIDATION_OPEN** |
| VS-04 Controls / inputs | Shared compact controls exist, but source-calibrated focus/selected treatment must be consumed per affected surface rather than replaced by arbitrary one-off styling. | **ROUTED_M5/M6/M8/M9; VALIDATION_OPEN** |
| VS-05 Cards / rows | Planning ordinal→completion and five-action hover rail are implemented and automated-validated by PR227/CI927. P3-M5-02 retains direct source/physical acceptance; PR233 separately corrects narrow metric and queued-title allocation. | **AUTOMATED_VALIDATED / VALIDATION_OPEN M5/M6** |
| VS-06 Accent / glow / progress | Today done/total progress and calibrated Focus live edge/glow are implemented and automated-validated in PR227/229. Today progress source comparison remains under P3-M5-01; P3-M6-03 signature edge has scoped direct CI942 comparison PASS, whole Focus parity remains open. | **AUTOMATED_VALIDATED M5/M6 / VALIDATION_OPEN source comparison** |
| VS-07 Menus / popovers / dialogs | Shared overlay primitives exist. Inline task-delete and direct active-list Archive presentation are implemented by PR227/CI927; source/state verification remains under P3-M5-04/05. Other overlays require their direct parity checks. | **AUTOMATED_VALIDATED M5; VALIDATION_OPEN affected overlays** |
| VS-08 State grammar / motion | Planning lift/reflow/settle and reduced-motion-safe250ms Blitz entry are implemented in PR227/229. Compact rest/hover grammar was directly compared on CI936. P3-M5-03 and P3-M6-01 retain physical/source motion verification. | **AUTOMATED_VALIDATED / scoped compact SOURCE_COMPARISON_PASS / VALIDATION_OPEN M5/M6** |

**2026-10-04 current-route hygiene:** older family/video/visual-system rows now reflect the implemented PR227/229 corrections and the scoped CI936/942 compact/Preferences observations. The detailed P3 rows below remain the acceptance controller. This reconciliation adds no new physical or SOURCE_PARITY_PASS verdict; real planning/Notes/entry/Preferences comparison remains open where not exercised. [Route reconciliation](../work-log/2026-10-04-codex-crosswalk-current-route-reconciliation.md).

### Explicit current implementation gaps after reconciliation

| ID | Gap | Current Narro evidence | Route |
| --- | --- | --- | --- |
| P3-M5-01 | Today must expose source `done/total Done` progress treatment while retaining persistent accent/CTA structure. | Merged `ListBoard.tsx`/Rust projection renders typed Today completion numerator + pending denominator with calibrated progress while preserving Today accent/CTA. PR #227 CI #927 and resulting-main CI #928 PASS. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source comparison** |
| P3-M5-02 | Resting planning card uses ordinal; hover replaces/reveals completion at left and exposes Subtasks / Notes / lane-left / lane-right / overflow at right without geometry reflow. | Merged `TaskCard.tsx` reserves ordinal/completion and exact five-action rail; narrow-card reserved-row readability remains intact. PR #227 CI #927 and main CI #928 PASS. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source comparison** |
| P3-M5-03 | Cross-lane drag must preserve the observed lifted-card/live-reflow/settle grammar in addition to positional insertion. | Merged drag presentation adds lifted preview, card-height placeholder/live reflow and finite settle; authoritative mutation still persists positional `beforeTaskId`. PR #227 CI #927 and main CI #928 PASS. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source comparison** |
| P3-M5-04 | Source retains the task menu and replaces only Delete with destructive trash/Confirm/X; preserve explicit confirmation and report-exclusion safety. | CI948 functional cancel/delete/identity PASS, but card-rail confirmation source comparison FAIL25 against VE00618s. Narrow implementation reopened. | **PR234 LOCAL_VALIDATED / CI_PHYSICAL_SOURCE_RETEST_OPEN; CI948 FAIL25 preserved** |
| P3-M5-05 | List Archive applies directly from the list menu; permanent archived-list delete remains destructive. | CI948 actual owned empty-list archive/restore and VE00636s direct-action comparison pass the no-second-dialog grammar. Whole shell/nonempty aggregate count remains open. | **SCOPED_SOURCE_PARITY_PASS / PHYSICAL_PASS; wider VALIDATION_OPEN** |
| P3-M6-01 | Blitz entry fades the board before Focus presentation (~250 ms observed); reduced motion must remove nonessential motion without changing the state transition. | Merged `BlitzEntryButton` keeps authoritative Start Blitz first, then a finite 250 ms board fade, then Focus presentation; reduced motion bypasses the delay and `finally` restores board presentation. PR #229 CI #939 and resulting-main CI #940 PASS. | **AUTOMATED_VALIDATED M6 / VALIDATION_OPEN source comparison** |
| P3-M6-02 | Notes toolbar/URL grammar: B, I, strike, bullets, numbered, undo, redo; typed/pasted http(s) URL auto-recognizes as clickable. External launch requires explicit activation. | PR229/CI939 production controls and URL recognition are physically exercised on CI942 and directly compared with canonical VE01035s/Pass-3. Notes runtime remains unchanged through PR233. Whole Notes composition/independent formatting combinations are not certified. | **SCOPED PHYSICAL_PASS / SOURCE_COMPARISON_PASS toolbar+URL grammar**; browser activation **INTENTIONAL_DEVIATION**. [Direct comparison](../work-log/2026-10-04-codex-m6-scoped-source-evidence-reuse.md). |
| P3-M6-03 | Focus live card uses calibrated crisp cyan→mint/lime edge/glow rather than flat single-color accent. | Actual CI942 running dark Notes state directly compared with UNIQUE_CALIBRATED SS-C19: thin cyan→mint/lime edge, restrained glow, no giant neon bloom. Unchanged focusVisualStates through PR233; whole card/queue/theme equality not claimed. | **SCOPED PHYSICAL_PASS / SOURCE_COMPARISON_PASS signature edge**. [Direct comparison](../work-log/2026-10-04-codex-m6-scoped-source-evidence-reuse.md). |
| P3-M7-01 | Compact Floating Timer rest/hover converts title/time to the icon action strip; only hovered action expands to a labeled pill. | PR228 implements one retained controller,130ms title/time→strip crossfade, selected pill anchored over fixed slots, keyboard equivalent and explicit compact Notes expansion. | **PHYSICAL_PASS / SOURCE_COMPARISON_PASS observed grammar** — exact CI936 directly compares SS-C20/SS-H09/VE003 rest, six actual hovers, fixed button targets and selected labeled pills;942 retains the unchanged native/hover path. Theme/pixel equality and arbitrary exact motion durations are not claimed. [Direct review](../work-log/evidence/m7-ci936-20261004/VISUAL_REVIEW.md). |
| P3-M7-02 | Compact Floating shell uses the calibrated rounded source treatment (~15–17 px family) and associated restrained elevation. | PR228 uses16px shell/clip radius and existing elevation token. Native region clipping/DWM shadow disabled for prior frame reliability means CSS alone does not prove source exterior desktop shadow. | **PHYSICAL_PASS rounded silhouette / INTENTIONAL_DEVIATION exterior shadow** — CI936 exact Windows/source comparison confirms rounded shell but lacks exterior desktop shadow; reliable native region/frame removal prevents demonstrated caption/inset defects. Deviation explicitly accepted/documented, not shadow SOURCE_PARITY_PASS. [Decision](../work-log/2026-10-04-codex-m7-ci936-physical-results.md). |
| P3-M9-01 | Overview export must generate local PDF; Sessions export is current-source CSV. | Sessions CSV is implemented on current main; no Overview PDF export command exists. | **FIX_NOW M9** |
| P3-VAL-01 | Affected Notes/tooltip/expansion/narrow-card/Preferences correction acceptance must follow current exact-source evidence. | CI936/942 close large-Notes, native Expand/Panel transitions and Preferences save/restart. Wrapped tooltip09 and quick-create delayed-loading07 retain their explicit bounded/inconclusive physical routes; PR233 metric20/queued-title21/native-modal18 and task contention19 await exact EXE. | **PARTIAL PHYSICAL_PASS / remaining VALIDATION_OPEN M2/M5/M6/M7/M8** |
| P3-VAL-02 | Reports/Sessions and all stable calibrated surfaces still require actual canonical-source comparison before any `SOURCE_PARITY_PASS`. | Narro-owned fixture/capture PASS exists but is not source-side comparison evidence. | **VALIDATION_OPEN affected milestone; M10 release recheck** |
| P3-RISK-01 | Fresh-launch no-implicit-start and running-session Notes/title continuity still lack the dedicated integrated regressions required by the history risk index. | Current architecture is aligned, but dedicated regressions are not located. | **VALIDATION_OPEN M10** |

### No-orphan result

Every material Pass-3 video finding, canonical screenshot family, calibrated visual-system family and still-relevant Help/history reliability requirement now has an implementation disposition above or in the detailed rows below. Historical/context evidence is explicitly non-binding where stronger current evidence exists. The final verification for this reconciliation must preserve:
- **zero** un-routed material Pass-3 findings;
- **zero** calibrated visual-system families without an implementation/validation route;
- no PR #225 correction left as stale `FIX_NOW` merely because physical validation is still open;
- no PREF-R05/PREF-R06 row left `OPEN`;
- no Sessions dashboard/Add/Edit/detail/CSV work left routed as unimplemented after PR #226;
- no source ambiguity promoted to confirmed behavior;
- no `SOURCE_PARITY_PASS` inferred from Narro-owned screenshots or Windows-only physical PASS.

## Current CI948 reconciliation — 2026-10-04

[Exact physical/source results](../work-log/2026-10-04-codex-m7-ci948-physical-results.md), complete pre/post M1–M9 inventory and whole media.18 PHYSICAL_PASS;19 CRUD scope PASS / lane Move OPEN;20 normal125% PASS / reduced edit OPEN;21 PARTIAL_OPEN;09 wrapped tooltip scoped PASS;C5 formal PASS. Old candidates below retain their original verdicts. M10 blocked.

|Finding|Observed discrepancy / requirement|Route and current disposition|
|---|---|---|
|M7-OBS-20261004-22|New committed Main list appears in Focus All tasks but not selector until restart; list APIs emit no catalog invalidation.|**PR234 LOCAL_VALIDATED / CI_PHYSICAL_OPEN M6/M7 integration**: committed list CRUD broadcast, stale-safe event/entry reconciliation and archived/deleted selection recovery; no timer polling.|
|M7-OBS-20261004-23|Fourth/fifth queue rows/actions clipped by fixed700px host; actual wheel has no effect.|**PR234 LOCAL_VALIDATED / CI_PHYSICAL_OPEN M6/M7 integration**: fixed-host bounded inner queue/wheel/keyboard access, stable header, no document/horizontal scrollbar. Hidden inner track is explicit accessibility reconstruction, not source-confirmed styling.|
|M7-OBS-20261004-24|Initial/overlay/recreated Main leaves Tauri native drag/drop enabled, incompatible with Windows HTML5 task drag. Unsuccessful physical attempts do not isolate near-border/title hit testing.|**PR234 LOCAL_VALIDATED / CI_PHYSICAL_OPEN M5/native integration**: disable native handler for Main across lifecycle; confirmed-card physical lift/drop/reorder100%/125% remains OPEN. Focus native drag unchanged.|
|M7-OBS-20261004-25 / P3-M5-04|Canonical VE00618s retains overflow menu with Schedule/Change List/Duplicate and trash/Confirm/X bottom row; Narro instead confirms in card rail.|**PR234 LOCAL_CORRECTION / REVISED_CI_PHYSICAL_SOURCE_RETEST_OPEN**: initial949 PASS; added DOM regression confirms Schedule / Repeat disappears from underlying cards during confirmation. Retain/disable controls and preserve metadata/geometry100%/125%; targeted normal/reduced PASS, broader rerun pending. Functional948 PASS and source25 FAIL remain historical; no new native/source PASS.|
|P3-M5-05 narrow|Canonical VE00636s direct Archive grammar exercised on owned empty list and Restore.|**SCOPED SOURCE_PARITY_PASS / PHYSICAL_PASS** direct-action/no-second-dialog grammar only. Whole shell and nonempty aggregate-count validation OPEN.|

## 1. Parity/code audit findings

| ID | Finding | Route | Disposition |
| --- | --- | --- | --- |
| A1 | List Duplicate missing from production wiring | M5 reconciliation | **VALIDATED** |
| A2 | Persisted local list icons not rendered consistently | M5 reconciliation | **VALIDATED** |
| A3 | Top-of-lane add must create highest-priority atomically | M5 reconciliation | **VALIDATED** |
| A4 | Normal task create needs EST | M5 reconciliation | **VALIDATED** |
| A5 | Main board completion/permanent delete missing | M5 reconciliation | **VALIDATED** |
| A6 | Pointer/keyboard completion into Done | M5 reconciliation | **VALIDATED** |
| A7 | Safe per-task edits in All Lists | M5 reconciliation | **VALIDATED**; aggregate reorder remains disabled |
| A8 | Search matched-substring highlighting | M5 reconciliation | **VALIDATED** |
| A9 | Diagnostic JSON leaked into normal Main | M5 reconciliation | **VALIDATED** |
| A10 | Ordinary Focus rows lacked actions | M6 reconciliation | **VALIDATED** |
| A11 | Rocket/Make Live missing | M6 reconciliation | **VALIDATED** |
| A12 | Focus queue reorder missing | M6 reconciliation | **VALIDATED** |
| A13 | Focus row Notes/schedule/delete/complete missing | M6 reconciliation | **VALIDATED** |
| A14 | Focus Add Task disabled | M6 reconciliation | **VALIDATED** |
| A15 | Focus Home disabled | M6 reconciliation | **VALIDATED** |
| A16 | Live title editing unavailable through Notes | M6 reconciliation | **VALIDATED** |
| A17 | Time's Up Extend missing | M6 reconciliation | **VALIDATED** |
| A18 | Floating Timer subtask title editing missing | M7 reconciliation | **VALIDATED** |
| A19 | Done lane missing local-month completion count | M5 reconciliation | **VALIDATED** |
| B1 | Task Change List / Duplicate uncertain/missing | VE-F003 | **VALIDATED** — PR #177 |
| B2 | Exact Blitz-now placement fidelity | M10 final visual parity | **ROUTED_M10** |
| B3 | Exact swatch/palette fidelity | M10 final visual parity | **ROUTED_M10** |
| B4 | Done auto-start-next behavior | M8 success flow | **PARTIAL / AMBIGUOUS** — success-screen-enabled path validated; disabled path unproven |
| B5 | `Blitz now` must enter/open Focus Panel; PR #192 previously preserved an already-visible Floating Timer instead | M7 corrective semantics | **VALIDATED** — automated Focus-entry semantics are retained; CI #809 physical recording `2026-10-01 19-03-32.mp4` visibly activates Main `Blitz now` at ~5.2–5.4 s and the existing Focus surface presents the Focus Panel. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| B6 | An idle/no-task Floating Timer can still be exposed through stale Timer presentation / Find-Timer paths | M7 corrective semantics | **VALIDATED** — automated active-state gating remains green; CI #809 ends in visible `All Clear` and the operator-context idle T / Find-Timer sequence surfaces no placeholder/stale Timer or attention pulse. See `work-log/2026-10-02-chatgpt-m7-ci809-c4-closure.md`. |

Audit section-C intentional Narro deviations remain binding unless newer explicit evidence/user direction supersedes them.

## 2. Video findings

| ID | Finding | Consequence | Disposition |
| --- | --- | --- | --- |
| VE-F001 | Terminal EST suffix becomes EST and is removed from saved title | M8 task-create consumers | **VALIDATED** |
| VE-F002 | Success-screen-enabled Done waits for explicit Next Task | M8 completion | **VALIDATED** |
| VE-F003 | Task overflow includes Change List + Duplicate | M5 corrective slice | **VALIDATED** |
| VE-F004 | Help/roadmap evidence documents note-link auto-open in some Blitzit versions; VE-010 direct trigger is ambiguous | Require explicit activation | **INTENTIONAL_DEVIATION** — preserve explicit activation; do not claim VE-010 itself proves auto-open-on-live |
| VE-F005 | Recurrence detachment can leave independent old children | Preserve customizations and idempotence | **VALIDATED reliability model**; UI gap tracked below |
| VE-F006 | Reports/Sessions derive from session history and support editing | M9 | **AUTOMATED_VALIDATED / VALIDATION_OPEN** — Overview plus Sessions/Add/Edit/detail and Sessions CSV are on current `main`; PR #226 exact-head CI #915 validated the 22 changed blobs now present on main and resulting-main CI #917 PASSed all gates. Overview PDF remains `FIX_NOW M9`; direct source visual comparison remains open. |
| VE-F007 | Panel→Floating transformation ≈0.27s; continuous-window character | M7 physical/fidelity gate | **PHYSICAL_PASS exercised corrected paths CI936/942** — continuous two-DPI normal/reduced Collapse/Expand/Panel paths and same-HWND/session accepted. Exact source duration equality remains unclaimed; compact grammar has its separate direct P3-M7-01 comparison. [Review](../work-log/evidence/m7-ci936-20261004/VISUAL_REVIEW.md). |
| VE-F008 | Preferences children stay in place; hidden times disclose on hover | M8 | **VALIDATED** |
| VE-F009 | Historical first-subtask-live limitation | Do not regress Narro | **INTENTIONAL_DEVIATION** |
| VE-F010 | Planning-board cross-lane drag supports pointer-position insertion, not append-only movement | M5 board parity correction | **VALIDATED** — PR #213 exact head `54697ca5f242a4007c5eb1e7e58c6eb4552ab3db`, Windows CI #836 PASS, merged as `7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`; persisted `beforeTaskId` now supports positional cross-lane insertion. Full drag lift/reflow/settle visual fidelity remains separately open under UX-F016. |
| VE-F011 | Lane headline time is live remaining work, not raw initial EST sum | M5 board read-model correction | **VALIDATED** — PR #213 exact head `54697ca5f242a4007c5eb1e7e58c6eb4552ab3db`, Windows CI #836 PASS, merged as `7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`; board projection now separates nominal and saturating remaining EST and pending lane headers consume remaining work. |
| VE-F012 | Today shows completion progress `done/total Done` and highlighted lane treatment | PR227/CI927 implements Today done/total Done progress in addition to the existing accent/CTA. P3-M5-01 awaits direct current-source visual comparison. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source comparison** |
| VE-F013 | Task ordinal is visible at rest and remains attached to moved cards during demonstrated planning sequence | PR227/CI927 implements the task ordinal at rest and hover/focus completion substitution. P3-M5-02 awaits direct source/interaction comparison; unsupported source persistence claims remain unasserted. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source comparison** |
| VE-F014 | Planning hover grammar is ordinal→completion at left plus Notes/lane-left/lane-right/overflow at right | PR227/CI927 implements reserved ordinal/completion and Subtasks/Notes/lane-left/lane-right/overflow targets. P3-M5-02 awaits direct physical/source hover/focus geometry comparison. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source comparison** |
| VE-F015 | Today owns anchored gradient `Blitz now`; activation fades board ~250 ms before Focus | Today-owned anchored CTA is retained; PR229/CI939 implements finite250ms board fade before Focus, with reduced-motion bypass. P3-M6-01 awaits direct source/physical motion verification. | **AUTOMATED_VALIDATED M6 / VALIDATION_OPEN source comparison** |

Unresolved video ambiguities remain explicit:
- success-screen-disabled Done progression;
- success-screen `Take a Break` post-click semantics;
- exact easing/timing for edited tutorial interactions.

## 3. Help Center / image findings

| ID | Finding | Consequence | Disposition |
| --- | --- | --- | --- |
| HC-F001 | Permanent task delete is `Delete → Confirm` | Keep explicit confirmation/report exclusion | **VALIDATED** |
| HC-F002 | Sessions prose says PDF but current screenshot says CSV | Overview PDF / Sessions CSV | **PARTIAL / FIX_NOW M9** — current-source Sessions CSV is implemented, exact-head CI #915 validated and resulting-main CI #917 validated; Overview PDF remains unimplemented. |
| HC-F003 | Recurrence edit: No Repeat conditionally shows warm/red `Delete existing tasks(n)` | Source-evidenced No Repeat flow with safe generated-child cleanup | **VALIDATED** — PR #182 / CI #617 / main #618 |
| HC-F004 | Source may require restart after monitor hotplug | Narro must recover dynamically | **PHYSICAL_PASS exercised software topology CI942** — actual2→1→2/Main present and absent/same PID/HWND and safe recovery with Duplicate→Extend restore. Physical cable/sleep-wake NOT RUN; retain as explicitly bounded future validation, not a fabricated PASS. [Review](../work-log/2026-10-04-codex-m7-ci942-physical-results.md). |
| HC-F005 | Done tasks older than 60 days auto-archive | Existing strict-60-day sweep | **VALIDATED** |
| HC-F006 | Today / Later today +2h / Tomorrow / Next week +7d | M4 schedule shortcuts | **VALIDATED** |
| HC-F007 | Schedule reminder enable + lead time | M8 background reminder runtime | **VALIDATED** — PR #180 |
| HC-F008 | Preferences Alerts/Celebration nested hierarchy | M8 | **VALIDATED UI**, remaining runtime below |
| HC-F009 | Source can lag due to server processing | Do not copy cloud delay | **INTENTIONAL_DEVIATION** |
| HC-F010 | Voice/cloud transcription | Out of local-only scope | **EXCLUDED** |
| HC-F011 | Blitzit 3.0 account/cloud/integration material | Must not override v2/current target | **EXCLUDED** |

## 4. UI/UX forensic findings

| ID | Finding | Consequence | Disposition |
| --- | --- | --- | --- |
| UX-F001 | Interaction grammar is inline/contextual | Surface architecture rule | **BINDING / ongoing** |
| UX-F002 | Gradient = high-salience primary; mint=selected/success; red/warm=destructive | Shared tokens/fixtures | **VALIDATED foundation**, M10 parity |
| UX-F003 | Dark/light preserve hierarchy/density | Themes | **VALIDATED**, M10 parity |
| UX-F004 | Panel→Floating ≈0.27 s; clipping/blank is source artifact | The unchanged native transition correction has continuous normal/reduced100%/125% changed-path acceptance on CI936/942. This closes the exercised Windows continuity scope; exact source timing equality is not claimed. | **PHYSICAL_PASS exercised paths CI936/942; no pixel/duration equality claim** |
| UX-F005 | Generic hover/menu/modal/chart timings are not source-measured | Treat tokens as Narro calibration | **VALIDATED documentation rule** |
| UX-F006 | No Repeat replaces neutral Replace row with destructive Delete Existing row | Source-evidenced recurrence consequence hierarchy | **VALIDATED** — PR #182 visual fixtures / CI #617 |
| UX-F007 | Task hover keeps geometry; completion left/actions right; anchored overflow | PR227/CI927 implements stable reserved ordinal/completion and five-action hover rail. Direct physical/source validation remains under P3-M5-02; narrow card/metric containment20 remains separately reopened. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source comparison and affected containment** |
| UX-F008 | Success hierarchy: completed title/context, dominant Next Task, EST/Taken, queue | M8 success UI | **VALIDATED** |
| UX-F009 | Preferences nested controls stay in place | M8 | **VALIDATED** |
| UX-F010 | Floating Timer expands vertically for subtasks | M7 | **VALIDATED source**, physical continuity open |
| UX-F011 | Schedule/recurrence footer uses secondary Cancel + primary gradient action | Narro combined Schedule/Repeat dialog preserves the secondary Cancel + gradient primary hierarchy without splitting state authority | **VALIDATED NARRO ADAPTATION** — PR #182 visual fixtures / CI #617 |
| UX-F012 | Reports hierarchy: four metrics → main chart → secondary panels | M9 | **AUTOMATED_VALIDATED / VALIDATION_OPEN** — production Overview PASSed CI #906/#907; direct canonical source comparison remains open. |
| UX-F013 | Sessions inline edit + Add Session dialog remain contextual | M9 | **AUTOMATED_VALIDATED / VALIDATION_OPEN** — production Sessions/Add/Edit/detail is on current main with PR #226 changed-blob identity to exact-head CI #915 and resulting-main CI #917 PASS; direct canonical source comparison remains open. |
| UX-F014 | Main first paint exposes blank/washed/dark staging before Home settles | M10 final quality pass | **ROUTED_M10** — visible in the 2026-09-30 CI #744 physical recording; not established as an M7 source regression |
| UX-F015 | Global shortcut registration failures render as large persistent error cards inside ordinary Home content | M8 shortcut UX / M10 final review | **ROUTED_M10** — conflict/retry semantics are validated; final contextual presentation remains a release-quality UX finding and must not be treated as an open M8 runtime implementation item. |
| UX-F016 | Cross-lane drag shows floating card, live source reflow, positional destination insertion and settle | PR227/CI927 implements lifted drag preview, card-height placeholder/live reflow, positional persistence and finite settle. P3-M5-03 awaits direct physical/source comparison; exact source drag duration remains unmeasured. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source comparison** |
| UX-F017 | Today lane has persistent cyan→green accent outline and anchored gradient Blitz CTA | M5/M10 board composition | **VALIDATED STRUCTURE / ROUTED_M10 FIDELITY** — PR #213 validated stronger Today boundary plus anchored CTA structure; exact gradient/border pixel calibration remains M10/review. |
| UX-F018 | Today progress is a done/total progress treatment, corroborated by current help-v2.x screenshot | Typed Today numerator/denominator and progress are implemented in PR227/CI927. P3-M5-01 awaits direct calibrated source comparison. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source comparison** |
| UX-F019 | Resting task-left affordance is ordinal; completion replaces/reveals on hover without geometry shift | Resting ordinal and hover/focus completion substitution are implemented in PR227/CI927 with reserved geometry. P3-M5-02 awaits direct source/physical comparison. | **AUTOMATED_VALIDATED M5 / VALIDATION_OPEN source comparison** |
| UX-F020 | Blitz entry fades the board before Focus presentation (~250 ms in supplied planning clip) | PR229/CI939 implements finite250ms board fade before Focus and reduced-motion bypass; state correctness remains independent of motion. P3-M6-01 awaits direct physical/source comparison. | **AUTOMATED_VALIDATED M6 / VALIDATION_OPEN source comparison** |

## 5. Reliability/history findings

| ID | Risk | Required anti-regression | Disposition |
| --- | --- | --- | --- |
| RISK-F001 | Tracked-time loss / Done 00:00 / pause divergence | Session ledger, completion transaction, paused edit rebasing | **VALIDATED M3**, rerun M10 |
| RISK-F002 | Reorder/move duplicate corruption | Stable IDs, exact-set reorder, transactional move, independent duplicate | **VALIDATED M2/M5**, rerun M10 |
| RISK-F003 | Wrong-day/timezone scheduling | Date-only/local-datetime split, DST/week tests, locale presentation | **M4 correctness validated**; display locale still open |
| RISK-F004 | Renderer/navigation/sleep timer corruption | Authoritative Rust runtime | **VALIDATED M3/M6**, M7 physical open |
| RISK-F005 | Backend outage blocked source product | Local SQLite authority | **VALIDATED architecture** |
| RISK-F006 | Monitor hotplug source restart requirement | Event-driven topology recovery | **IMPLEMENTED**, physical M7/M10 open |
| RISK-F007 | Surprise implicit timer start on fresh app launch | Fresh startup must not create/start a focus session without explicit user action; recovery may only restore an existing durable checkpoint under the validated M3 recovery policy | **VALIDATION_OPEN** — current startup/Focus/shortcut contracts expose no intended implicit-start path, but no dedicated fresh-start regression was located; close before final M10 reliability acceptance |
| RISK-F008 | Live-task Notes/title metadata edit disturbs timer/session | Opening, editing and saving Notes/title must preserve live task/session identity and authoritative elapsed/accounting; EST/Time Taken edits remain restricted to the validated paused-runtime boundaries | **VALIDATION_OPEN** — functional Notes/title editing and paused metric safety are validated, but no dedicated integrated running-session continuity regression was located; close before final M10 reliability acceptance |
| RISK-F009 | Multiple Narro processes can coexist against the same local SQLite/background runtime and contend for global shortcuts | M1/M7 runtime foundation | **AUTOMATED_VALIDATED / PHYSICAL_RECHECK_PENDING** — official Tauri single-instance boundary is registered before persistence/background/shortcut authority; PR #206 exact head `ab1e89fc...` passed #784, guarded merge `4f489419...` passed resulting-main #785. Fresh M7 physical artifact must confirm one-process ownership during the final Gate 7/12 matrix |

## 6. Active M8 audited runtime tasks

| ID | Runtime effect | Status |
| --- | --- | --- |
| PREF-R01 | Timed alerts during live task using persisted interval + authoritative timer/session state | **VALIDATED** — PR #184 exact head `fc61ed5926fdb1c605de8ce1e1a9fb28ea0dfd7e`, CI #624, guarded merge `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`; merged source verified identical to validated PR source for all changed blobs |
| PREF-R02 | Finite animated timer flash; reduced-motion safe | **VALIDATED** — PR #193 exact head `2413de4f0e02daf829ffc753ca70b48a1e11712e`, Windows CI #714 / run `36694484904`, merged source `f1277a91f25068f4ec4818c0c14b27d2d3ca46fa`; all eight changed source/test blobs verified identical to validated PR head |
| PREF-R03 | Notification Alerts gating without duplicating authoritative M3 effects | **VALIDATED** — PR #195 reconciled exact head `c3a09e3780871cea70d008ac540f8d62cb684be7`, Windows CI #722 / run `36704515416`, guarded squash merge `1c9f2c7dc670fddcbf8cf687ca5b1945588eb01c`, resulting-main CI #723 / run `36705536633`; disabled alerts consume durable boundary effects without backfill, enabled alerts preserve the existing at-most-once M3 notification path, and Preferences-read failures leave effects pending |
| PREF-R04 | Schedule reminders enable + lead integrated with durable/idempotent delivery | **VALIDATED** — PR #180 exact head `0309c879998f43ff8c6e39e65f02c44669fa48b8`, CI #607, merge `643528ca223b29fd8fbd215db5b1b525c912c6fc`, main CI #608 |
| PREF-R05 | Sound selector/preview from validated Narro-owned or user-local assets only | **VALIDATED** — PR #220 exact head `af4420aa7610008c2dba8cf54c12158178abf7d4` PASSed CI #881; guarded merge `45c3218f5923c2ff673d8c1dd562de7545be1ecb` PASSed resulting-main CI #882. |
| PREF-R06 | Windows locale/system 12/24-hour presentation | **VALIDATED** — PR #194 exact head `16ae996a478687ad3e61788e77de00159f4207c2` PASSed CI #721; guarded merge `88dea3bcbd988f2e77ea0edccb218be95e5b2438` PASSed resulting-main CI #724. |

## 7. Immediate correction queue

### CORR-01 — recurrence update / No Repeat flow

Evidence: VE-017, HC-F003, UX-F006, `help-v2x-recurrence-no-repeat-delete-existing-tasks.jpg`.

**Status: VALIDATED / CLOSED.**

Validation:
- PR #182 exact head: `72ab6c77d5e5f5e50c7f3f7e6a0c11b98c7c606c`;
- Windows CI #617 / run `36354972305`: PASS;
- visual artifact `narro-m5-visual-regression`, id `10943374010`, digest `sha256:4d9b5005e53d842c1c8eb9774b6f29e9b950c0447a651914243d84c9f7b776b6`;
- runtime artifact `narro-m1-runtime-harness-windows-x64`, id `10943557612`, digest `sha256:1a9325c54af943de7ba05cf375ab313447f3a10b004e81a6f85a858a91a02ee6`;
- guarded squash merge: `50006f29b0329037aecfdab772104db8670768b0`;
- resulting-main Windows CI #618 / run `36355523089`: PASS via the repository validation gate.

Validated behavior:
1. existing recurrence exposes `No Repeat` inside the recurrence flow;
2. normal updates keep a neutral `Replace existing tasks(n)` consequence row;
3. No Repeat swaps that row for warm/red `Delete existing tasks(n)`;
4. unchecked No Repeat removes the rule and detaches existing linked children as independent tasks;
5. checked Delete Existing deletes only pristine active generated children;
6. customized, history-bearing, completed, archived, or legacy-linked children are preserved and detached;
7. stale rule/version guards, parent identity, persistence-first publication and recurrence idempotence remain intact;
8. Repeat + No Repeat states are captured/validated in light and dark themes.

### M7-PHYS — exact-build physical corrections

CI #624 physical Windows evidence is in `work-log/2026-09-28-codex-m7-ci624-physical-batch.md`.

| ID | Physical finding | Route | Disposition |
| --- | --- | --- | --- |
| M7-PHYS-01 | Panel↔Timer visual continuity: old opaque/transparent host-tail defects are fixed, but #684 cross-monitor motion remained visually drag-like | M7 visual continuity | **VALIDATED** — automated single-host motion contracts remain green; CI #809 physical re-audit confirms repeated populated presentation transitions with no blank/pale/stale/duplicate host frame, and PR #208's former expanded→compact white-L boundary no longer reproduces. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| M7-PHYS-02 | Mixed-DPI movement/recovery: #684 compact Timer visible-region DPI could lag the renderer during manual crossing | M7 topology/DPI | **VALIDATED** — CI #809 physical re-audit observes the compact Timer crossing the 1920-wide display at ~425 physical px to the 2560×1080 display at ~340 physical px; Windows settings explicitly show the latter at 100%, matching the 125%→100% 1.25 ratio. Timer remains usable through the crossing. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| M7-PHYS-03 | Settled compact/expanded Timer exposed a browser scrollbar and crowded right-edge controls in #684 | M7 layout/overflow | **VALIDATED** — CI #809 physical compact/expanded endpoints and edge-constrained expansion show no document/root scrollbar or unusable clipping; component-local content behavior remains intact. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| M7-PHYS-04 | CI #744 physical run could not establish exact-candidate Focus ownership because both Narro T/P global chords were already owned elsewhere | M1/M7 runtime validity | **VALIDATED** — PR #206 single-instance ownership is automated-validated, and CI #809 physically shows Main + active Timer already alive around 38 s before a later `narro.exe` activation at ~39.25–40.75 s; the same runtime state persists with no competing Narro UI/reset/conflict afterward. See `work-log/2026-10-02-chatgpt-m7-ci809-c4-closure.md`. |
| M7-PHYS-05 | Expanded active Floating Timer removes the current task title and live time | M7 Floating Timer parity | **VALIDATED** — accepted automated captures retain task title/live time, and CI #809 physical expanded Timer repetitions visibly retain the same active task/time through standard-motion presentation changes. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| M7-PHYS-06 | Main All Lists remains stale after Focus quick-create/start mutates the same authoritative board | M6/M7 cross-window projection correctness | **VALIDATED** — automated board invalidation/re-read remains green; CI #809 physical recording visibly reconciles Focus completion to Main Done while both surfaces remain live against the same authoritative state. See `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. |
| M7-PHYS-07 | Physical validation artifact was the CI-instrumented `runtimeVisual=1` executable and mutated the user's SQLite with capture fixtures | M7 artifact validity / acceptance chain | **AUTOMATED_VALIDATED / PHYSICAL_RETEST** — recording SHA-256 `80b05a2410c752c8e56d68be37db9b4d92db3cd767b666a909cc60c6f2e20fb5`; commits `907d1f97...` + `5bda5851...` split production physical build and add isolated-profile no-fixture runtime smoke; CI #803 production physical artifact passes zero-checkpoint runtime smoke; rerun physical matrix only on exact production artifact |
| M7-PHYS-08 | Same-DPI Timer→Panel native animation reached the client-width edge then reversed16px to the decorated HWND edge | M7 visual continuity / native geometry | **PHYSICAL_PASS exercised changed-host CI936/942 paths** —936 directly reviews300 whole-moving-path Panel/restore frames plus native27 Panel returns/same HWND/safe origins; frameless region removes decorated-edge composition. No exact source-pixel equality claim. [Review](../work-log/evidence/m7-ci936-20261004/VISUAL_REVIEW.md). |
| M7-PHYS-09 | CI #806 active-session expanded→compact briefly exposed a white L/outline while the native Timer region changed | M7 visual continuity / Timer native-region swap | **FIX_IMPLEMENTED / AUTOMATED_VALIDATED / PHYSICAL_RETEST** — recording SHA-256 `86e51a5dcc6cc8bd5cb6af41971daa3c23016a97768c7f8469f567d4f232710b` shows the defect at ~81.50 s after clean task `Test` is active. PR #208 exact head `d885a577...` presents the contracted compact React frame before clipping and suppresses only the forced `SetWindowRgn` redraw for prepainted Timer↔Timer swaps; CI #809 PASS, merge `2767b382...` has the identical validated tree, main CI #810 PASS. Production artifact `11163439039` passes zero-`runtimeVisual` smoke; standard-motion physical retest remains required. |

The #684 reassessment remains historical defect evidence; the later CI #809 physical dispositions above supersede its open-retest state. CI #873 now physically passes the saved-placement restart criterion as recorded below. Separate M1 replacement/performance gates and formal M7 reconciliation remain open. No architecture reset or second Timer WebView is justified by the observations alone. Unaffected validated Preferences/persistence work remains preserved.

### CI #873 continuation — 2026-10-03 physical evidence

| ID | Direct observation | Route | Disposition |
| --- | --- | --- | --- |
| M7-C5-20261003 | Active compact Timer drag → normal tray Quit → same exact EXE relaunch → saved visible Timer at `(1640,780)`; same title/time recovered paused | C5 saved-position physical acceptance | **PHYSICAL_PASS** — native two-session evaluator PASS (328 px qualifying movement) and continuous two-monitor 60 fps video. [Completed run](../work-log/2026-10-03-codex-m7-ci873-c5-completed.md). Formal milestone reconciliation remains separate. |
| M7-OBS-20261003-01 | CI873 expanded→Panel overlays outgoing/incoming content; CI884 Panel→compact reveals target above outgoing Panel | M7 narrow motion-content review | **PHYSICAL_PASS exercised corrected paths CI936/942** — direct Expand and whole-path Panel/restore ranges preserve the sole displayed hierarchy; finite prepaint/native child retains outgoing paint without another timer authority. Later modal/default and queued-title integration findings remain separate. [Review](../work-log/evidence/m7-ci936-20261004/VISUAL_REVIEW.md). |
| M7-OBS-20261003-02 | CI #873 settled 100% DPI Panel displays `Res...` and disabled `Exte...` action labels | M7 narrow layout/accessibility review | **IMPLEMENTED / VALIDATION_PENDING** — PR #221 reserves stable six-slot widths for complete labels. Sixteen rendered normal/paused/theme captures and CI #884 physical 125% labels PASS; native 100% DPI observation on the final changed host remains required. |

## 8. No-orphan gate

Before a milestone or substantial slice continues:
- every new material finding is added here;
- findings contradicting an already-built/current surface are evaluated before forward work;
- `FIX_NOW` findings are fixed+validated or reclassified with evidence;
- future findings appear here and in their milestone TODO;
- intentional deviations stay protected by tests/specs where material;
- ambiguity is not permission to guess;
- M10/final review rechecks all `ROUTED_M10`, `VALIDATION_OPEN` and remaining `AMBIGUOUS` rows.

### M7 CI #884 runtime findings — 2026-10-03

**CI893 physical reconciliation:** [Full scoped results and video](../work-log/2026-10-03-codex-m7-ci893-physical-batch-evidence.md). M7-OBS01 sole-hierarchy acceptance and02 full labels PASS on observed paths;03 frame alignment and changed-host C5 PASS.04 inline horizontal containment PASS but a wrapped presentation tooltip remains FAIL.05 Save reachability PASS, whole large-modal containment still FAIL: repeated-failure reassessment required before the selected root-relative anchoring correction.06 exercised Greek T/N/P PASS; complete chord/layout matrix remains OPEN.07 settled title/Tab/Escape PASS; physical delayed-loading ownership INCONCLUSIVE (automated coverage remains). These scoped results do not imply SOURCE_PARITY_PASS.

| New ID | Finding | Scope | Disposition |
|---|---|---|---|
| M7-OBS-20261003-08 | CI893 compact→expanded prematurely reveals tall content and shifts heading/action strip during prepaint | M7 same-host Timer geometry | **PHYSICAL_PASS exercised CI936 Expand boundaries** —240 directly inspected consecutive Expand frames plus native matrix and unchanged942 native path accept affected clipping/position behavior. Source/whole-theme equality is not claimed. [Review](../work-log/evidence/m7-ci936-20261004/VISUAL_REVIEW.md). |
| M7-OBS-20261003-09 | CI893 wrapped Notes presentation button moves left but fixed-end tooltip clips there | M7 keyboard tooltip | **AUTOMATED_VALIDATED / VALIDATION_OPEN** — PR #225 implements boundary-aware tooltip placement and exact-head CI #911 PASSed; exact-EXE physical retest remains open. |
| M7-OBS-20261004-12 | CI911 unchanged100% Panel→compact restore drifts y205→255→317→394;125%333→445 | M7 saved Timer origin | **PHYSICAL_PASS CI932** — PR228 retains safe top-left in twelve100%/125% normal/reduced Panel returns; genuine topology recovery remains proportional. Exact31ac4176... EXE. |
| M7-OBS-20261004-13 | CI911/CI932 Collapse loses Timer pixels; native caption can replace the Timer despite unchanged HWND/geometry/position | M7 transition continuity | **PHYSICAL_PASS exercised changed-path matrix CI936/942** —936 directly reviews1800 unique consecutive Collapse and540 Expand/Panel frames across two DPI/motion/placement contexts;942 adds current unchanged-path ranges. No whole Timer absence/caption in inspected ranges; bounded finite own-surface child input/lifetime and M1 performance accepted. Old932 FAIL retained. Full C4 integration remains open for18 and subsequent affected findings. [Review](../work-log/evidence/m7-ci936-20261004/VISUAL_REVIEW.md). |
| M7-OBS-20261004-14 | Canonical VE003 ~02:26.5 directly shows Break gamepad; CI932 compact action uses coffee cup | M7 P3-M7-01 icon fidelity | **AUTOMATED_VALIDATED / PHYSICAL_PASS / SOURCE_COMPARISON_PASS glyph CI936** — actual compact hover Break gamepad directly compared with canonical VE003; accessible label/fixed target retained. [Direct review](../work-log/evidence/m7-ci936-20261004/VISUAL_REVIEW.md). |
| M7-OBS-20261004-15 | CI936 isolated diagnostic requested monitor/side conflicts with persisted placement preference used by DPI recovery; matrix2/4 FAIL, matched-preference secondary125% placement succeeds | Reopened M1 placement diagnostic / M7 dependency | **AUTOMATED_VALIDATED / PHYSICAL_PASS PR231/CI942** — existing preference authority and restoration; exact diagnostic4/4 twice across100%/125%, original secondary/right baseline physically restored. Initial stale Windows monitor selection retained as failed precondition; automatic/null restoration is automated coverage only. |
| M7-OBS-20261004-16 | CI936 actual performance scenario enumeration throws on read-only PowerShell `$PID` collision before sampling; deterministic self-test misses native callback | Reopened M1 performance harness / M7 dependency | **AUTOMATED_VALIDATED / PHYSICAL_PASS PR231/CI942 collector** — owner renamed, actual HWND enumeration regression; unmodified collector3/3 quiet native runs valid/no churn. CPU/working-set stable; final bounded M1/M7 performance acceptance PASS with cold private difference8.279MiB/+2.55% explicitly documented, native allocation lower/no churn. Exact allocation cause/long-duration leak freedom not claimed. [Complete decision](../work-log/2026-10-04-codex-m7-ci942-physical-results.md). |
| M7-OBS-20261004-17 | CI942 modal focused buttons leak action shortcuts | M6/M7/M8 shortcut integration | **AUTOMATED_VALIDATED PR232/CI944 / PHYSICAL_PASS CI944 exercised action routing** — Main/Focus English/Greek action matrices, Main→Focus delivered actions, local Enter/Escape and ordinary post-close Pause/Resume/Notes preserve authority. Search separately fails18. Old CI942 failure immutable; no whole shortcut/source acceptance claim. [Exact scope](../work-log/2026-10-04-codex-m7-ci944-physical-results.md). |
| M7-OBS-20261004-18 | CI944 Ctrl+F native WebView2 Find escapes Main/Focus Add dialogs in both keyboard layouts | M6/M7/M8 modal default ownership | **IMPLEMENTED PR233 / PHYSICAL_FAIL CI944 / RETEST_OPEN** — recognized modal shortcuts consume browser defaults while local Enter/Escape remain usable;46 local actual-rendered scenarios PASS. Corrected head162304d3 full CI947 and resulting-main28e840f5 CI948 PASS; exact EXE retest required. [Failure](../work-log/2026-10-04-codex-m7-ci944-physical-results.md). |
| M7-OBS-20261004-19 | CI944 owned task create reports TASK_CREATE_FAILED/database is locked; retry commits once | Narrow reopened M2 writer concurrency / M5 integration | **IMPLEMENTED PR233 / PHYSICAL_FAIL CI944 / RETEST_OPEN** —12 mutation paths reserve writer before reads;14-operation two-connection contention matrix and negative upgrade control pass Windows CI946 Rust tests. Corrected head162304d3 full CI947 and resulting-main28e840f5 CI948 PASS; physical retest open. Physical competing-writer identity is not proven. [Failure](../work-log/2026-10-04-codex-m7-ci944-physical-results.md). |
| M7-OBS-20261004-20 | CI944 narrow125% Today card Schedule/Repeat + EST + Taken extends into Done | Narrow M5 layout / M7 incidental surface | **IMPLEMENTED PR233 / PHYSICAL_FAIL CI944 / RETEST_OPEN** — responsive metrics and boundary-aware tooltips;11 board cases in four theme/motion combinations and unchanged EST/Taken edit height PASS. All20 local visual validator families PASS. Corrected head162304d3 full CI947 and resulting-main28e840f5 CI948 PASS; exact EXE retest required. [Local validation](../work-log/2026-10-04-codex-m7-pr233-ci947-local-validation.md). |
| M7-OBS-20261004-21 | CI944 long All Lists badge + reserved actions reduce ordinary title to about28 physical pixels at125%; SS-C19 retains readable narrow queued titles | Affected M6 queue / M7 integration | **IMPLEMENTED PR233 / RETEST_OPEN** — source-informed accessible title-first allocation with metadata-line reserved rail; targets preserved, actual rendered visible-title tooltip and reveal geometry PASS normal/reduced light/dark. Exact row allocation is an explicit Narro decision. Corrected head162304d3 full CI947 and resulting-main28e840f5 CI948 PASS; real queue/source comparison required. [Reconciliation](../work-log/2026-10-04-codex-m7-queued-title-reconciliation.md). |
| M5-OBS-20261003-10 | CI893 default small planning lanes reserve all title width for action slots, making titles invisible | M5 narrow desktop card layout, exposed during M7 | **AUTOMATED_VALIDATED / VALIDATION_OPEN** — PR #225 implements the narrow-card second-row correction and exact-head CI #911 PASSed; exact-EXE title/edit/hover/focus physical retest remains open. This does not close the separate source ordinal/hover-rail gaps. |
| M8-OBS-20261003-11 | Real CI893 first success-screen Preferences save fails with `database is locked`, retry succeeds | M8 concurrent local persistence | **AUTOMATED_VALIDATED / PHYSICAL_PASS CI942 save/restart** — writer-first Preferences regression and actual dark/success-on save survive normal Quit/relaunch; light/success-off restored. No forced-lock physical stress or whole Preferences source-parity claim. [Review](../work-log/2026-10-04-codex-m7-ci942-physical-results.md). |

All findings use the exact CI #884 validation EXE and real Windows 125% capture in [the batched findings](../work-log/2026-10-03-codex-m7-ci884-batched-findings.md). Reconcile against that evidence; do not call the native frame strip a recurrence of an older transient symptom.

| ID | Finding | Scope | Disposition |
|---|---|---|---|
| M7-OBS-20261003-03 | Frameless Focus shadow insets expose native frame and offset client from outer-origin region | M7 Windows host / region | **PHYSICAL_PASS exercised changed-host paths CI936/942** — native frame removal/region alignment,100%/125% transitions and movement, exact C5 restart and retained finite child accepted. Exterior shadow is an explicit Windows correctness deviation. [Direct review](../work-log/evidence/m7-ci936-20261004/VISUAL_REVIEW.md). |
| M7-OBS-20261003-04 | Expanded inline Notes shows unnecessary horizontal scrollbar | M7 editor / layout | **AUTOMATED_VALIDATED / VALIDATION_OPEN** — PR #222 bounds box sizing and horizontal content, collapses closed tooltip geometry while preserving its opacity/transform opening state, and aligns the edge tooltip inward. Real rendered keyboard-open/transition/Escape and reduced-motion regressions PASS; preserve intentional vertical editor scroll. Exact-EXE retest remains OPEN |
| M7-OBS-20261003-05 | Larger Notes uses full-host vh and loses footer below expanded 300px region | M7 editor reachability | **PHYSICAL_PASS whole large-editor bounds CI936/942** —936 normal100%324×284/reduced125%405×355 within300/375px presentation, outward resize clamp, inward resize/Save/keyboard/Escape and multiline restart;942 current Notes implementation large editor/Save accepted. No whole Notes source-parity certification. [Review](../work-log/2026-10-04-codex-m7-ci942-physical-results.md). |
| M7-OBS-20261003-06 | In-app shortcuts depend on translated key and fail in Greek layout | Shared shortcut boundary, exercised M7 | **PHYSICAL_PASS exercised ordinary English/Greek actions CI942/944** — actual focused WebView keyboard layouts4090409/4080408, ordinary T/B/P/S/F/N and Main Search; modal action isolation17 also passes944. Native modal Search independently fails18. No blanket M8 conflict/autostart acceptance. [Review](../work-log/2026-10-04-codex-m7-ci944-physical-results.md). |
| M7-OBS-20261003-07 | Quick-create loading race leaves focus outside modal so Escape/trap does not run | Focus Create modal accessibility | **AUTOMATED_VALIDATED / VALIDATION_OPEN** — PR #222 owns loading shell and ready title focus; rendered delayed success/error/empty, Tab/Escape and focus restore are covered; physical retest remains OPEN |

