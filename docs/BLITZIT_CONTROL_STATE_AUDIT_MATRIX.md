# Narro × Blitzit — control/state implementation audit matrix

**Mode:** source snapshot claim → exact Narro component/style/domain → evidence-limited disposition. This is distinct from full-video Pass-3 and from runtime/physical/source-parity acceptance.

**Base main:** `a9632393f053481c58e9aacfb0d3d5e458f3967f` (2026-10-08, Europe/Athens). **Review 01:** `SS-C02, SS-C03, SS-C04, SS-C05, SS-C06, SS-C14, SS-C15, SS-C16`. `SS-T01–SS-T07` are historical context and intentionally outside the 39 current/direct+Help denominator.

**Count:** 52 source-visible/control-state claims mapped across 8/39 direct+Help screenshots; {"PRESENT_CODE_ONLY":32,"GAP_B13":1,"EVIDENCE_LIMIT":7,"INTENTIONAL_DEVIATION":2,"GAP_B55":2,"GAP_B23":2,"GAP_B54":2,"GAP_B25":2,"GAP_B51":1,"GAP_B56":1}.

**Status definitions:** `PRESENT_CODE_ONLY` = current production source expresses the structure/interaction but neither native rendering nor source visual PASS is claimed; `GAP_Bn` = exact source-to-code discrepancy already routed in crosswalk/TODO; `INTENTIONAL_DEVIATION` = local-only scope exclusion; `EVIDENCE_LIMIT` = screenshot cannot prove detailed behavior, regardless of what Narro happens to implement; `NOT_REVIEWED` = remaining screenshot/state not audited at this granularity.

## Review 01 — eight current/direct screenshot states

| Source claim ID | Original | Visible control/state/interaction claim | Production comparison or source limit | Disposition |
| --- | --- | --- | --- | --- |
| SS-C02-01 | SS-C02 | Date-range trigger text and popup anchor | ReportsOverviewView.tsx range button/popover | PRESENT_CODE_ONLY |
| SS-C02-02 | SS-C02 | Preset column Today/Yesterday/This week/30/60/90 | ReportsOverviewView.tsx DateRangePicker preset button array | PRESENT_CODE_ONLY |
| SS-C02-03 | SS-C02 | Two adjacent monthly calendars, Sunday-first weekdays | ReportsOverviewView.tsx months.slice(0,2), reportsOverview.css two-column calendars | PRESENT_CODE_ONLY |
| SS-C02-04 | SS-C02 | Single and double month chevron family | ReportsOverviewView.tsx and ReportsSessionsView.tsx use only ‹ › | GAP_B13 |
| SS-C02-05 | SS-C02 | Pink/purple range endpoints and connected between-days | ReportsOverviewView.tsx selected/edge props, reportsOverview.css .is-selected/.is-start/.is-end | PRESENT_CODE_ONLY |
| SS-C02-06 | SS-C02 | Cancel + Apply footer hierarchy | ReportsOverviewView.tsx date-actions and CSS date-cancel/date-apply | PRESENT_CODE_ONLY |
| SS-C02-07 | SS-C02 | Exact chevron functions/keyboard transitions/Apply disabled semantics | Current static screenshot has no direct action or keyboard observation | EVIDENCE_LIMIT |
| SS-C03-01 | SS-C03 | Wide dark canvas/side nav vs dense top-row card hierarchy | AppShell.tsx and HomeDashboard.tsx + appShell.css/homeDashboard.css | PRESENT_CODE_ONLY |
| SS-C03-02 | SS-C03 | Create list/All my lists/Archived lists side navigation | AppShell.tsx nav and handleNavigate | PRESENT_CODE_ONLY |
| SS-C03-03 | SS-C03 | Trial/account/upgrade/avatar/cloud/assistant source controls | Excluded local-only/auth-free Narro scope per AGENTS/product spec | INTENTIONAL_DEVIATION |
| SS-C03-04 | SS-C03 | Greeting with personal account name | HomeDashboard.tsx hour greeting exists; cloud profile personalization excluded | INTENTIONAL_DEVIATION |
| SS-C03-05 | SS-C03 | Your Lists heading and right-aligned contextual helper | HomeDashboard.tsx puts h2 + p in same flex child; helper is below title | GAP_B55 |
| SS-C03-06 | SS-C03 | List icon/title/ellipsis with open/edit/duplicate/archive wiring | HomeDashboard.tsx ListCard; AppShell.tsx getListCardActions | PRESENT_CODE_ONLY |
| SS-C03-07 | SS-C03 | Task preview ordinals and trailing tracked/done time | HomeDashboard.tsx renders colored dot and only task.estSeconds | GAP_B23 |
| SS-C03-08 | SS-C03 | Pending count and aggregate EST in card footer | HomeDashboard.tsx pendingLabel/formatEstimate in ListCard footer | PRESENT_CODE_ONLY |
| SS-C03-09 | SS-C03 | Dashed accent Create List tile at end of grid | HomeDashboard.tsx CreateListTile exists; perimeter gradient missing | GAP_B54 |
| SS-C03-10 | SS-C03 | Search/Settings top utilities and Home/Reports bottom nav | AppShell.tsx utility buttons and primary-nav | PRESENT_CODE_ONLY |
| SS-C04-01 | SS-C04 | Large card-shaped Create List tile in lists grid | HomeDashboard.tsx CreateListTile inside grid, homeDashboard.css min-height | PRESENT_CODE_ONLY |
| SS-C04-02 | SS-C04 | Centered plus and uppercase CREATE LIST label | HomeDashboard.tsx button children; plus gradient CSS | PRESENT_CODE_ONLY |
| SS-C04-03 | SS-C04 | Dashed cyan-teal to lime border gradient | homeDashboard.css uses flat dashed --color-accent-solid border | GAP_B54 |
| SS-C04-04 | SS-C04 | Whole tile pointer and keyboard action target | HomeDashboard.tsx one <button> onCreateList handler | PRESENT_CODE_ONLY |
| SS-C04-05 | SS-C04 | Exact tile hover/press transition from still | SS-C04 has cursor only, no animated transition observation | EVIDENCE_LIMIT |
| SS-C05-01 | SS-C05 | Hover/focus card outline strengthens without reflow | homeDashboard.css :hover/:focus-within border and background; screenshot match unrun | PRESENT_CODE_ONLY |
| SS-C05-02 | SS-C05 | Gradient Open action appears over dimmed previews | HomeDashboard.tsx Open; homeDashboard.css absolute center opacity and task dimming | PRESENT_CODE_ONLY |
| SS-C05-03 | SS-C05 | Header ellipsis opens compact anchored management menu | HomeDashboard.tsx Menu trigger alignment | PRESENT_CODE_ONLY |
| SS-C05-04 | SS-C05 | Edit List > Duplicate > divider > Archive List order | HomeDashboard.tsx MenuItems with role=separator between Duplicate/Archive | PRESENT_CODE_ONLY |
| SS-C05-05 | SS-C05 | No Delete action in active-list menu | HomeDashboard.tsx active list menu omits Delete (archive first) | PRESENT_CODE_ONLY |
| SS-C05-06 | SS-C05 | Hover easing/press dynamics from source still | Screenshot does not record duration, neighboring video may be used at final acceptance | EVIDENCE_LIMIT |
| SS-C06-01 | SS-C06 | Dimmed Home with centered compact palette | SearchPalette.tsx role=dialog overlay, searchPalette.css full backdrop and compact panel | PRESENT_CODE_ONLY |
| SS-C06-02 | SS-C06 | Search magnifier, exact placeholder and Ctrl+F hint | SearchPalette.tsx SearchIcon/input/kbd | PRESENT_CODE_ONLY |
| SS-C06-03 | SS-C06 | Divider and Quick actions heading | SearchPalette.tsx section heading, searchPalette.css query bottom border | PRESENT_CODE_ONLY |
| SS-C06-04 | SS-C06 | Add new task/Add new list/Go to Reports initial actions | SearchPalette.tsx three buttons; AppShell.tsx navigation callbacks | PRESENT_CODE_ONLY |
| SS-C06-05 | SS-C06 | Typed search results, no-results text, fuzzy rank | Unobserved by SS-C06; Narro code includes local substring results but source contract unknown | EVIDENCE_LIMIT |
| SS-C06-06 | SS-C06 | Keyboard selection, modal Escape and focus-return parity | SearchPalette.tsx owns keyboard/focus locally; source screenshot cannot verify matching behavior | EVIDENCE_LIMIT |
| SS-C14-01 | SS-C14 | Sessions Beta tab and Add Session toolbar | ReportsSessionsView.tsx Tabs and + Add Session button | PRESENT_CODE_ONLY |
| SS-C14-02 | SS-C14 | Current-version Export .csv rather than old PDF | ReportsSessionsView.tsx Export .csv and ReportsSessions.tsx export route | PRESENT_CODE_ONLY |
| SS-C14-03 | SS-C14 | Sessions All Lists trigger stacked color badges | ReportsSessionsView.tsx trigger renders literal N; menu has colored option badges | GAP_B25 |
| SS-C14-04 | SS-C14 | Hide Break sessions icon composition | ReportsSessionsView.tsx generic ◉, VE-015 gamepad-type source icon | GAP_B51 |
| SS-C14-05 | SS-C14 | Shared date-range trigger and preset/two-month calendar | ReportsSessionsView.tsx DateRangePicker and callbacks | PRESENT_CODE_ONLY |
| SS-C14-06 | SS-C14 | 0min Total Time / 2 Total Tasks / 0 Total Sessions | session_reporting.rs total_tasks distinct worked-task IDs; screenshot fixture artificially uses 2/0 | GAP_B56 |
| SS-C14-07 | SS-C14 | Empty Sessions body without prominent centered no-data card | ReportsSessionsView.tsx groups.map yields none when groups empty | PRESENT_CODE_ONLY |
| SS-C15-01 | SS-C15 | All Lists filter overlay anchored below trigger | ReportsOverviewView.tsx listFilterOpen and reportsOverview.css anchor/menu | PRESENT_CODE_ONLY |
| SS-C15-02 | SS-C15 | All Lists/colored per-list items and checkmarks | ReportsOverviewView.tsx listOptions / selected ids, menu role=listbox | PRESENT_CODE_ONLY |
| SS-C15-03 | SS-C15 | Stacked trigger badge identity rather than N glyph | ReportsOverviewView.tsx literal N trigger; B25 covers Overview/Sessions | GAP_B25 |
| SS-C15-04 | SS-C15 | Trigger active-border when filter is open | reportsOverview.css [aria-expanded=true] treatment | PRESENT_CODE_ONLY |
| SS-C15-05 | SS-C15 | Filter exact numeric effect and menu postselection open policy | SS-C15 still cannot establish numeric change, VE-011 supplies separate historical behavior | EVIDENCE_LIMIT |
| SS-C16-01 | SS-C16 | Light-theme neutral canvas/near-white cards | AppShell/HomeDashboard CSS theme tokens; physical source comparison not performed | PRESENT_CODE_ONLY |
| SS-C16-02 | SS-C16 | Hover stronger outline and fixed-centered gradient Open | homeDashboard.css hover and absolute Open overlay | PRESENT_CODE_ONLY |
| SS-C16-03 | SS-C16 | Existing task previews remain beneath Open and dim | HomeDashboard.tsx preview remains mounted; CSS opacity=.3 on hover | PRESENT_CODE_ONLY |
| SS-C16-04 | SS-C16 | Same right-aligned Your Lists helper in light shell | HomeDashboard.tsx same below-heading helper layout in both themes | GAP_B55 |
| SS-C16-05 | SS-C16 | Numbered task preview and source trailing time | HomeDashboard.tsx dots and EST-only projection shared with dark theme | GAP_B23 |
| SS-C16-06 | SS-C16 | Exact light-theme source color values and hover motion | Only code tokens inspected, no candidate/source screenshot comparison or motion measurement | EVIDENCE_LIMIT |

## Caveats and exact continuation

- **No automatic promotion of `PRESENT_CODE_ONLY`:** check actual Windows candidate and canonical Blitzit source side-by-side before `SOURCE_PARITY_PASS`. Static code can be wrong in geometry, data, keyboard, timing or runtime composition.
- **B56 backend/fixture divergence is a priority causal finding:** the existing `reportsVisualFixture.tsx` hardcodes `2 Total Tasks / 0 Sessions` while real `session_reporting.rs` derives tasks solely from work-session IDs and cannot produce `2/0`; the source itself shows `2/0` in current v2.6.69 and `39/22` in older VE-015. This proves a definition mismatch but not the source's exact task inclusion/counting rule. Require a product-semantic reconciliation before implementing; do not blindly switch to count of all tasks.
- **EVIDENCE_LIMIT rows are not missing feature tickets.** Especially search results matching, search keyboard navigation and date-picker double-chevron effect: source static images do not prove them. A current Narro implementation does not establish source parity. Review canonical video context or original media only where it actually resolves the disputed observation.
- **Next static claim-audit candidates:** current/direct `SS-C07–SS-C09`, `SS-C10–SS-C13`, `SS-C17` and remaining `SS-C18–SS-C22`, followed by Help state equivalents. Use same row statuses; preserve previously routed B IDs and do not duplicate their fixes. Raw MP4 needed for direct motion/sequence parity, not for static existence/copy claims.
- **Validation:** documentation-only evidence audit. App/frontend/Rust tests, Windows CI, native physical comparison, and raw media reinspection **NOT RUN**. No progress/counters advanced: `3/10M || 0/3 | 17/18`. Codex retains app/native ownership and physical CI1046 C4/35/29 gates.
