# 2026-10-24 — 13 authentic Narro MKVs: scoped real-Windows observation verdicts

**Owner:** ChatGPT, analysis-only. **Artifact:** [GitHub Actions run 40025773555](https://github.com/MariosGiannakaras/Narro/actions/runs/40025773555) **COMPLETED SUCCESS**, artifact **12533495087**, `narro-20261023-thirteen-native-mkvs`. **Original recorded application:** main `cdaf85b3c20028a78d17f75f5700e652e7147f7e`, CI `39921466242`; **not** current draft PR389/419 candidate.

**Media integrity:** 13/13 extracted MKV SHA-256 match the frozen `work-log/evidence/native-resume-20261023/SHA256-MANIFEST.json` values. The 13 original videos cover 1,560.471 s / reported 90,140 decoded frames at 2560×1080; nominal 60 fps is not proof of uniform unique 16.667ms frames. The media was **not re-recorded**. Inspect actual video only, not Adobe/generated proxy or unrelated automated CI screenshots. Accompanying UTC journal, source code and exports corroborate cases where applicable.

**Inspection performed:** all **13** original clips oriented from existing genuine keyframe sheets (**19** sheets), plus **34** before/after native-content action-comparison sheets, original-resolution targeted frames, and **6** motion interval sheets around Break Panel↔Compact. The action-oriented review examines adjacent labels, state chips, menus, count headers, task rows, Notes/subtasks and surrounding layout rather than only the clicked target. **This is a scoped observational case review, not a claim that every one of 90,140 frames was read and adjudicated individually, or that every short-lived compositor glitch below capture cadence is excluded.** No new physical tests were executed; these are judgments of already recorded authentic Windows interaction with the stated build.

## Scoped criterion outcomes — exactly 35 defined checks

**PASS 30 / FAIL 1 / PENDING 4**, with denominator **35** = the explicitly enumerated per-feature criteria below, **not** the acquisition journey count, full roadmap, current-release physical acceptance or Blitzit source parity.

| ID | Family | Physical criterion | Verdict | Clip time (seconds) | Evidenced observed outcome |
|---|---|---|---|---|---|
| N01 | B1 | Home → All my lists → Board → Home/project preview | **PASS** | 18.43–68.18 | The recorded routes lead to the corresponding visible screen and back; first entry has an initial stale-load/retry limitation. |
| N02 | B2 | Schedule ordinary Backlog task for Tomorrow | **PASS** | 44.39–86.50 | Picker selection, Next, Save and scheduled lane state visible. |
| N03 | B2 | Recurring pattern dropdown Escape and cancel edit | **PASS** | 90.72–116.05 | Pattern options visible, menu dismissed and modal cancelled without committed change. |
| N04 | B2 | Reversible empty list archive/unarchive | **PASS** | 34.62–57.72 (archive clip) | List disappears from Home, appears Archived lists, is restored. |
| N05 | B2 | Archived done task tab navigation | **PASS** | 63.68–64.68 (archive clip) | Tab and archived-record rows visible. |
| N06 | B3 | Create two tasks and Escape empty Add form | **PASS** | 14.31–40.99 (native drag clip) | A/B cards appear; additional blank Add form closed. |
| N07 | B3 | Duplicate owned B task | **PASS** | 65.17–66.17 (native drag clip) | Third Backlog task card with B identity appears. |
| N08 | B3 | Move B to next lane with inline arrow | **PASS** | 71.79–72.79 (native drag clip) | B task appears under This Week; source Backlog reduces. |
| N09 | B3 | Pointer drag to reorder B/A | **PENDING** | 47.08–48.08 (native drag clip) | No successful reorder established; native input injection cannot be assumed to reach the DnD handler. |
| N10 | B3 | Pointer drag B across to Today / drag-cancel ownership | **PENDING** | 54.29–55.29 (native drag clip) | No demonstrated cross-lane drop or cancelled-drag result; do not attribute tool-input failure to app. |
| N11 | B4 | Focus list selector and list-specific queue | **PASS** | 112.82–113.82 (Notes clip), 11.84–21.14 (Break clip) | Selector reflects current list; Reading & research All Clear and Capture Project tasks are distinct. |
| N12 | B4/B5 | Pause and resume owned Pomodoro task | **PASS** | 44.32 (Notes clip), 26.26–27.26 (Break clip) | Paused state, then resumed Pomodoro Work state and feedback visible. |
| N13 | B4 | Notes text save, larger editor and Escape return | **PASS** | 55.86–86.40 (Notes clip) | Saved content appears under Saved note; large editor displays content; Escape returns. |
| N14 | B4 | Subtask create, commit and mark complete | **PASS** | 89.30–109.46 (Notes clip) | Synthetic subtask appears; 0/1→1/1 and strike-through appear after action. |
| N15 | B4 | Live Skip/switch-task continuation | **PENDING** | 8.82–28.0 (Skip clip) | Final clip has no qualifying live task, so actual live Skip/switch was not exercised. |
| N16 | B5 | Start manual Break from work | **PASS** | 30.34–31.34 (Break clip) | Break card, feedback and countdown become visible. |
| N17 | B5 | Break Panel→Compact endpoint and sampled visible hierarchy | **PASS** | 35.90–37.30 (Break clip) | Actual original 50ms strips show Panel then single compact surface; no whole old Panel and compact surface coexist in sampled boundary; no strict frame-perfect source parity claim. |
| N18 | B5 | Compact→Break Panel endpoint and sampled visible hierarchy | **PASS** | 43.09–44.45 (Break clip) | Original strips show compact followed by restored Panel; no two complete hierarchies observed in sampled boundary. |
| N19 | B5 | Skip Break → resumed work/history | **PASS** | 47.41–48.41 (Break clip) | Break skipped feedback and resumed Pomodoro state; separate Break history row visible. |
| N20 | B5 | Complete task with Success ON / Take a Break | **PASS** | 61.19–66.72 (Break clip) | Success panel and downstream Take a Break/All Clear visible. |
| N21 | B5 | Actual automatic Pomodoro/EST expiry and full timers | **PENDING** | Full B5 clip | No natural expiry boundary was recorded; cannot assert physical PASS. |
| N22 | B6 | Success OFF complete without success modal | **PASS** | 28.37–34.51 (Success OFF clip) | New task becomes live, then moves to Done/All Clear with no Success popup. |
| N23 | B7 | Dark→Light→System theme selection | **PASS** | 45.64–58.72 (Preferences clip) | Actual window changes color theme and selection; no OS-theme change claimed. |
| N24 | B7 | Timezone dropdown and Escape close | **PASS** | 73.58–107.78 (Preferences clip) | Native visible timezone choices, then closed after Escape; no OS timezone mutation. |
| N25 | B7 | Sound volume popovers/slider/keyboard interaction | **PASS** | 50.85–132.73 (lower Preferences clip) | Task/Notification/Success volume controls visibly open and respond; audio playback not captured and NOT accepted. |
| N26 | B8 | Windows shortcuts dialog Tab/Shift+Tab/Escape | **PASS** | 137.37–160.76 (lower Preferences clip) | Modal visible, focus highlight moves, Escape returns to Preferences. |
| N27 | B9 | Overview Reports list filter changes scoped metrics | **PASS** | 21.30–28.36 (Reports Overview clip) | Reading & research selection changes report summary and bars. |
| N28 | B9 | Overview list filter dismiss on Escape | **FAIL** | 33.88→34.60 and 41.90–43.50 (Reports Overview clip) | Menu remains visibly open after logged Escape; later date-range calendar opens while list popover is still open. Exact recorded source ReportsOverview listbox lacks corresponding Escape close route. |
| N29 | B9 | Date-range preset and calendar previous/next year | **PASS** | 42.26–75.41 (Reports Overview clip) | Calendar navigates; Last 60 days preset and Apply change displayed report. |
| N30 | B9 | Chart Tasks-only selector | **PASS** | 89.00–96.64 (Reports Overview clip) | Chart changes from multiseries to Tasks-only bars. |
| N31 | B9 | Overview PDF export creates artifact | **PASS** | 103.16–104.16 (Reports Overview clip) | Saved-PDF feedback appears and frozen file is present; PDF internal content/layout not asserted. |
| N32 | B10 | Add a manual Session | **PASS** | 27.59–50.80 (Reports Sessions clip) | Manual session created, rows/summary update; preserved CSV backs persisted row. |
| N33 | B10 | Edit a closed Session end-time minute and commit | **PASS** | 77.85–108.96 (Reports Sessions clip) | Inline editor and save execute, summary total falls from 10h17 to 10h16; future-ending synthetic edited record is a separate product-contract ambiguity, not marked bug. |
| N34 | B10 | Sessions CSV export with selected Break visibility | **PASS** | 119.62–120.62 (Reports Sessions clip) | Actual CSV contains 45 valid 8-column work rows matching source export schema; break rows hidden. |
| N35 | B10 | Sessions list filter to Capture Project | **PASS** | 129.34–136.70 (Reports Sessions clip) | List selection changes total sessions 45→36 and tasks 38→29. |

## Confirmed material FAIL — Reports Overview list popover keyboard ownership (N28)

**Exact original:** `B9B10-reports-navigation/native-original.mkv`. List filter opens at **21.30s**, Reading & research is selected **27.36s**; Escape action is logged at **33.88s**. Original native crops at **30.50, 33.50, 34.60, 37.00, 41.90, 43.50s** all show the list popover remaining visible, even though Escape was requested. Clicking the date range (journal **42.26s**) then opens the right-hand calendar **while the left filter popover remains present**. The report selection and chart totals themselves **PASS**; only **keyboard dismiss / popover exclusivity** is FAIL.

Corroborating recorded source `src/ReportsOverview.tsx` at `cdaf85b3`: `onToggleListFilter={() => setListFilterOpen(open => !open)}` and state `listFilterOpen`, with separate `datePickerOpen` state. Recorded `src/ReportsOverviewView.tsx` listbox lacks the Escape handler implemented on its separate date picker. This corroborates *missing close behavior at this UI path*; does not prove every possible keyboard input delivery context. The recording presents visible after-action evidence, so the disposition is **FAIL at captured main SHA**. An older/newer code fix is **not inferred**.

## Additional surrounding-content examinations (do not invent FAIL)

- **Focus Break row and counters:** After Break is skipped, the lower Done group goes from 29 to 30 visible rows because it includes a *completed Break session*, while the header remains `29/30 Done` for **tasks**. After the active task is completed, heading becomes 31 rows vs header `30/30 Done`. The recorded source intentionally computes `doneTasks.length + doneBreaks.length` for the lower group and only authoritative task counts above. **Expected from existing source model; no invented domain-count corruption FAIL.** This is a potentially confusing wording/design distinction, not proven Blitzit parity.
- **Reports edited session ends in the future:** The frozen edited CSV row ended `2026-10-23T19:05Z`, while its Save/export happened about `18:08Z`. Code permits future end times (while requiring end > start). Product-contract ambiguity, **NOT a confirmed UI FAIL**. Real edit/CSV save outcome PASSES in scope.
- **B1 initial stale board cache:** the journal records an explicit refresh/retry; eventual navigation and expected screens are visible. First-attempt timing and startup correctness remain unverified, do not attribute initial data freshness PASS.
- **Board drags:** mouse trajectory and recorded journal alone do not prove the OS delivered the requisite pressed pointer events. The inline lane button independently PASSES. Native drag reorder and drag cancel are PENDING not product FAILs.
- **Focus Panel ↔ Compact Timer:** real main footage around **35.55–37.30s** and **42.70–44.45s** was examined at approximately 50ms-spaced consecutive samples, showing endpoint replacement and no two *complete* simultaneous hierarchies in the selected sampled transition interval. The full 60fps uninterrupted source is preserved. **This is not** proof new PR389 A01–A08 or PR419 passes, not pixel-perfect Blitzit morph timing, and does not overturn historical scoped A02 ghost-title FAIL from a different recorded candidate.
- **Preferences audio:** original MKVs have **no audio stream**, hence visible volume controls pass but actual system sound playback, alerts and volume loudness remain NOT RUN.
- **Reports PDF:** actual output file and saved status are present; numerical chart/layout/content and Acrobat deep inspection not performed in this case matrix.
- **B5 expiry and B4 Skip:** input paths that would require a live task, real autonomous expiry and transitions across an elapsed Pomodoro cycle were not exercised. Do not mark these checks PASS because neighboring screens appeared normal.

## Physical execution versus acceptance

- Existing operator **acquisition coverage** stays **19/24 completed planned journeys**, **5/24 partial**, **0 wholly not acquired**; it is not an implementation PASS counter and was **not** physically repeated here.
- This review has **35** scoped visual/interaction criteria for **old main** and yields only old-main observed outcomes as above; these are independent from the native **PR389 8-case** candidate acceptance. PR389/PR419 newest candidate physical **0/8 NOT RUN** for that native transition suite (strict `PHYSICAL_BEFORE_MERGE` still open).
- Scope exclusions: no actual physical 125% DPI/monitor switch/topmost physical desktop acceptance, OS microphone/sound, tray Quit+relaunch restore under current candidate; no hard 60fps compositor/no single skipped frame assertion; no latest original Blitzit interaction audit; no optional M11.
- **Zero production/app/test/config/PR/CI changes** were made; this document is the only durable repository write of this batch, with no raw desktop capture or personal user content attached.

**Next analysis-only action if genuinely necessary:** inspect native 60fps uninterrupted frame ranges around specific newly reported transition glitch, and if a corrected current-build test becomes available compare the *same* narrowly defined criteria under exact matching candidate provenance. The 35-item old-main case review is otherwise concluded within its explicitly bounded acquisition/evidence limits.
