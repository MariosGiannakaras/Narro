# Narro × Blitzit — control/state implementation audit matrix

**Mode:** source snapshot claim → exact Narro component/style/domain → evidence-limited disposition. This is distinct from full-video Pass-3 and from runtime/physical/source-parity acceptance.

**Base main:** `a9632393f053481c58e9aacfb0d3d5e458f3967f` (2026-10-08, Europe/Athens). **Review 01:** `SS-C02, SS-C03, SS-C04, SS-C05, SS-C06, SS-C14, SS-C15, SS-C16`. **Review 02:** `SS-C07, SS-C08, SS-C09, SS-C17`. `SS-T01–SS-T07` are historical context and intentionally outside the 39 current/direct+Help denominator.

**Count:** 87 source-visible/control-state claims mapped across 12/39 direct+Help screenshots (Review 01: 8; Review 02: 4); {"PRESENT_CODE_ONLY":47,"GAP_B13":1,"EVIDENCE_LIMIT":10,"INTENTIONAL_DEVIATION":2,"GAP_B55":2,"GAP_B23":2,"GAP_B54":2,"GAP_B25":2,"GAP_B51":1,"GAP_B56":1,"GAP_B34":2,"GAP_B21":1,"GAP_B22":1,"GAP_B57":1,"GAP_B58":2,"GAP_B17":5,"GAP_B18":2,"GAP_B9":1,"GAP_B29":2}.

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

## Review 02 — four current Preferences / Shortcuts screenshots

| Source claim ID | Original | Visible control/state/interaction claim | Production comparison or source limit | Disposition |
| --- | --- | --- | --- | --- |
| SS-C07-01 | SS-C07 | Tall dark, scrollable, closeable Preferences overlay over previous context | AppShell navigates to ThemeSettingsPanel bare page; no modal/backdrop/close | GAP_B34 |
| SS-C07-02 | SS-C07 | Heading Preferences plus personalized workflow subtitle | ThemeSettingsPanel title exists; intro differs; root modal/source wording routed with B34 | GAP_B34 |
| SS-C07-03 | SS-C07 | Select Screen selected monitor thumbnail/dimensions/accent outline | BlitzPanelPreferenceSection renders native select only; Focus Quick Preferences differs | GAP_B21 |
| SS-C07-04 | SS-C07 | Blitz Panel Side segmented Left/Right with selected fill | BlitzPanelPreferenceSection maps left/right aria-pressed buttons and CSS selected segment | PRESENT_CODE_ONLY |
| SS-C07-05 | SS-C07 | General Hide EST/Time Taken toggle ON in photographed state | GeneralPreferenceRows Switch uses snapshot.general.hideTaskTimes | PRESENT_CODE_ONLY |
| SS-C07-06 | SS-C07 | Auto-parse EST from title toggle ON in photographed state | GeneralPreferenceRows Switch uses snapshot.general.autoParseEstFromTitle | PRESENT_CODE_ONLY |
| SS-C07-07 | SS-C07 | System/Dark/Light segmented Theme with dark selected | ThemeSettingsPanelView maps THEME_OPTIONS and selected class; runtime value dependent | PRESENT_CODE_ONLY |
| SS-C07-08 | SS-C07 | Timezone offset-qualified IANA selector | GeneralPreferenceRows has freeform timezone textbox, no source dropdown/offset display | GAP_B22 |
| SS-C07-09 | SS-C07 | Information icons preceding several labels | Shared Row and ThemeSettingsPanel plain strong labels omit icons | GAP_B57 |
| SS-C07-10 | SS-C07 | Exact info icon label coverage/hover help behavior | Current screenshot summary shows icons but no interaction or complete label-specific mapping | EVIDENCE_LIMIT |
| SS-C08-01 | SS-C08 | Blitz mode settings group heading | LowerPreferenceSections labels it Blitz Mode; separate copy from behavior | GAP_B58 |
| SS-C08-02 | SS-C08 | Pomodoros OFF toggle state and persisted enable flag | LowerPreferenceSections Switch bound to pomodoroEnabled; actual value state-dependent | PRESENT_CODE_ONLY |
| SS-C08-03 | SS-C08 | Pomodoros OFF hides sprint/break child rows | LowerPreferenceSections always renders disabled Work sprint/Pomodoro break controls | GAP_B17 |
| SS-C08-04 | SS-C08 | Default break length 10min control separate from Pomodoro children | LowerPreferenceSections separate DurationSelect from nested Pomodoro controls | PRESENT_CODE_ONLY |
| SS-C08-05 | SS-C08 | Scrolling title on live timer ON toggle | LowerPreferenceSections Switch bound to scrollingTitle | PRESENT_CODE_ONLY |
| SS-C08-06 | SS-C08 | Timed alerts during task and independently adjustable timing | LowerPreferenceSections parent Switch + nested interval; child persists but remains displayed when OFF | GAP_B17 |
| SS-C08-07 | SS-C08 | Task sound selector and separate preview triangle | SoundPreferenceControl select and preview button; preview owner in localSoundCatalog | PRESENT_CODE_ONLY |
| SS-C08-08 | SS-C08 | Speaker opens anchored vertical volume slider | SoundPreferenceControl always exposes horizontal slider; no speaker trigger/popover | GAP_B18 |
| SS-C08-09 | SS-C08 | Animated flash on timer toggle | LowerPreferenceSections Switch bound to animatedTimerFlash | PRESENT_CODE_ONLY |
| SS-C08-10 | SS-C08 | Notification Alerts toggle with child sound/preview | LowerPreferenceSections parent toggle and sound chooser; child disclosure wrong when OFF | GAP_B17 |
| SS-C08-11 | SS-C08 | Schedule reminders parent with nested lead-time | LowerPreferenceSections scheduleRemindersEnabled and reminderLeadSeconds; child disclosure wrong | GAP_B17 |
| SS-C08-12 | SS-C08 | Nested vertical guide and indented subordinate controls | preferenceSettingsSections.css .preference-settings__row--nested border-left and padding | PRESENT_CODE_ONLY |
| SS-C09-01 | SS-C09 | Celebrate task completion section exact heading | LowerPreferenceSections header is Celebration rather than source copy | GAP_B58 |
| SS-C09-02 | SS-C09 | Show success screen independent enable control | LowerPreferenceSections Switch showSuccessScreen persisted via Preferences | PRESENT_CODE_ONLY |
| SS-C09-03 | SS-C09 | Fun gif on success screen nested ON control | LowerPreferenceSections Fun GIF Switch exists but stays visible disabled when parent OFF | GAP_B17 |
| SS-C09-04 | SS-C09 | Success sound effect independent ON/OFF toggle | LowerPreferenceSections success sound row has selector/volume only, no enable toggle | GAP_B9 |
| SS-C09-05 | SS-C09 | Success sound dropdown and triangle preview | SoundPreferenceControl successSound select plus play button | PRESENT_CODE_ONLY |
| SS-C09-06 | SS-C09 | Success sound speaker-triggered vertical volume popover | SoundPreferenceControl permanent horizontal slider; source speaker popover absent | GAP_B18 |
| SS-C09-07 | SS-C09 | Exact disabled hierarchy/selector commit/cancel when success screen OFF | Static screenshot only shows enabled state; source menu OFF interaction not established | EVIDENCE_LIMIT |
| SS-C17-01 | SS-C17 | Dedicated white shortcut dialog with close X | WindowsShortcutSettingsPanel renders embedded dark Preferences section, not independent white modal | GAP_B29 |
| SS-C17-02 | SS-C17 | Three global shortcut labels/chords and enable toggles | SHORTCUT_ROWS global Go/Alternate/Find chord values and checkbox enable bindings | PRESENT_CODE_ONLY |
| SS-C17-03 | SS-C17 | Seven App-only shortcut rows without enable toggles | inAppShortcuts.ts implements chords; WindowsShortcutSettingsPanel does not display group | GAP_B29 |
| SS-C17-04 | SS-C17 | Global shortcut conflict state and retry | WindowsShortcutSettingsPanel diagnostics/Retry are Narro-only safety controls; source status not measured | PRESENT_CODE_ONLY |
| SS-C17-05 | SS-C17 | Rounded keycap styling on current global rows | WindowsShortcutSettingsPanel kbd and windowsShortcutSettingsPanel.css keycaps | PRESENT_CODE_ONLY |
| SS-C17-06 | SS-C17 | Modal close keyboard/Escape and per-row shortcut selection behavior | Source still does not establish keyboard modality or whether chords editable | EVIDENCE_LIMIT |

**Review 02 boundaries:** `PRESENT_CODE_ONLY` does not establish selected-value runtime state or pixel parity. Parent OFF transitions are sourced from VE-014 canonical full-video Pass-3 notes (B17), while SS-C08/09 stills show only specific ON/OFF instances. Success-sound OFF interactions, info tooltips and source shortcut-keyboard semantics are not established by static pixels.
## Caveats and exact continuation

- **No automatic promotion of `PRESENT_CODE_ONLY`:** check actual Windows candidate and canonical Blitzit source side-by-side before `SOURCE_PARITY_PASS`. Static code can be wrong in geometry, data, keyboard, timing or runtime composition.
- **B56 backend/fixture divergence is a priority causal finding:** the existing `reportsVisualFixture.tsx` hardcodes `2 Total Tasks / 0 Sessions` while real `session_reporting.rs` derives tasks solely from work-session IDs and cannot produce `2/0`; the source itself shows `2/0` in current v2.6.69 and `39/22` in older VE-015. This proves a definition mismatch but not the source's exact task inclusion/counting rule. Require a product-semantic reconciliation before implementing; do not blindly switch to count of all tasks.
- **EVIDENCE_LIMIT rows are not missing feature tickets.** Especially search results matching, search keyboard navigation and date-picker double-chevron effect: source static images do not prove them. A current Narro implementation does not establish source parity. Review canonical video context or original media only where it actually resolves the disputed observation.
- **Next static claim-audit candidates:** current/direct `SS-C10–SS-C13` and remaining `SS-C18–SS-C22`, followed by Help state equivalents. Use same row statuses; preserve previously routed B IDs and do not duplicate their fixes. Raw MP4 needed for direct motion/sequence parity, not for static existence/copy claims.
- **Validation:** documentation-only evidence audit. App/frontend/Rust tests, Windows CI, native physical comparison, and raw media reinspection **NOT RUN**. No progress/counters advanced: `3/10M || 0/3 | 17/18`. Codex retains app/native ownership and physical CI1046 C4/35/29 gates.
