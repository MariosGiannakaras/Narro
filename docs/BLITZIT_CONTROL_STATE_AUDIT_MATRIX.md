# Narro × Blitzit — control/state implementation audit matrix

**Mode:** source snapshot claim → exact Narro component/style/domain → evidence-limited disposition. This is distinct from full-video Pass-3 and from runtime/physical/source-parity acceptance.

**Base main:** `a9632393f053481c58e9aacfb0d3d5e458f3967f` (2026-10-08, Europe/Athens). **Review 01:** `SS-C02, SS-C03, SS-C04, SS-C05, SS-C06, SS-C14, SS-C15, SS-C16`. **Review 02:** `SS-C07, SS-C08, SS-C09, SS-C17`. **Review 03:** `SS-C10, SS-C11, SS-C12, SS-C13`. **Review 04:** `SS-C01, SS-C18, SS-C19, SS-C20, SS-C21, SS-C22`. **Review 05:** `SS-H01–SS-H09`. `SS-T01–SS-T07` are historical context and intentionally outside the 39 current/direct+Help denominator.

**Count:** 215 source-visible/control-state claims mapped across 31/39 direct+Help screenshots (22/22 current v2.6.69; 9/17 Help states); {"PRESENT_CODE_ONLY":126,"GAP_B13":1,"EVIDENCE_LIMIT":27,"INTENTIONAL_DEVIATION":6,"GAP_B55":2,"GAP_B23":2,"GAP_B54":2,"GAP_B25":3,"GAP_B51":1,"GAP_B56":1,"GAP_B34":2,"GAP_B21":1,"GAP_B22":1,"GAP_B57":1,"GAP_B58":2,"GAP_B17":7,"GAP_B18":2,"GAP_B9":1,"GAP_B29":2,"GAP_B14":2,"GAP_B28":1,"GAP_B16":1,"GAP_B30":1,"GAP_B7":2,"GAP_B3":1,"GAP_B8":1,"GAP_B15":5,"GAP_B31":1,"GAP_B26":1,"GAP_B32":1,"GAP_B24":1,"GAP_B44":1,"GAP_B39":1,"GAP_B40":1,"GAP_B43":1,"GAP_B19":3}.

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
## Review 03 — current Archive and Overview empty/hover states

| Source claim ID | Original | Visible control/state/interaction claim | Production comparison or source limit | Disposition |
| --- | --- | --- | --- | --- |
| SS-C10-01 | SS-C10 | Archived lists is Home-shell destination, sidebar remains | AppShell archived-lists renders ArchivePanel inside workspace with unchanged nav | PRESENT_CODE_ONLY |
| SS-C10-02 | SS-C10 | Archive segmented tabs with Archived lists selected | ArchivePanel activeTab state, role=tablist and aria-selected | PRESENT_CODE_ONLY |
| SS-C10-03 | SS-C10 | Right contextual helper Your archived lists | ArchivedListsPanel embedded-helper, archivedListsPanel.css justify-content:flex-end | PRESENT_CODE_ONLY |
| SS-C10-04 | SS-C10 | Centered empty-state icon | ArchivedListsPanel .empty-icon and centered grid styling | PRESENT_CODE_ONLY |
| SS-C10-05 | SS-C10 | Exact empty title No archived lists found | ArchivedListsPanel strong literal matches source title | PRESENT_CODE_ONLY |
| SS-C10-06 | SS-C10 | Exact source supporting sentence | ArchivedListsPanel uses local restore/help text instead of source sentence | GAP_B14 |
| SS-C10-07 | SS-C10 | Any archive populated actions on this empty current frame | Current SS-C10 is empty; populated task previews/action grammar come from separate SS-H14 | EVIDENCE_LIMIT |
| SS-C11-01 | SS-C11 | Archived done tasks tab selected while Home shell remains | ArchivePanel done tab + ArchivedDoneTasksPanel embedded state | PRESENT_CODE_ONLY |
| SS-C11-02 | SS-C11 | Wide archived Done task search input | ArchivedDoneTasksPanel type=search and archivePanel.css flexible wide field | PRESENT_CODE_ONLY |
| SS-C11-03 | SS-C11 | Right anchored All Lists list filter | ArchivedDoneTasksPanel filter button and positioned menu | PRESENT_CODE_ONLY |
| SS-C11-04 | SS-C11 | Open filter lists All Lists plus named list-color badges | ArchivedDoneTasksPanel filterLists, option roles and .filter-dot per-list color | PRESENT_CODE_ONLY |
| SS-C11-05 | SS-C11 | Exact No Archived tasks found empty title | ArchivedDoneTasksPanel strong matches source title | PRESENT_CODE_ONLY |
| SS-C11-06 | SS-C11 | Source empty-state supporting sentence | ArchivedDoneTasksPanel uses automatic 60-day explanatory copy vs current screenshot copy | GAP_B14 |
| SS-C11-07 | SS-C11 | Search/list scope actual result and keyboard interactions in source | Static filter-open screenshot has no committed search/filter outcome; Narro has local filters | EVIDENCE_LIMIT |
| SS-C12-01 | SS-C12 | Reports Back, Overview/Sessions Beta tabs and current Export PDF | ReportsOverviewView header/tabs and Overview PDF export | PRESENT_CODE_ONLY |
| SS-C12-02 | SS-C12 | All Lists and date-range trigger in report header | ReportsOverviewView filter and calendar popup; list trigger badge still B25 | GAP_B25 |
| SS-C12-03 | SS-C12 | Four dashboard summary metric card slots | ReportsOverviewView metrics.slice(0,4) from Rust DTO | PRESENT_CODE_ONLY |
| SS-C12-04 | SS-C12 | Tasks, Breaks, Total bar categories with selectable legend | ReportsOverviewView ReportChart and legend toggle control | PRESENT_CODE_ONLY |
| SS-C12-05 | SS-C12 | Dark date tooltip showing per-series values | ReportChart current tooltip on hovered/focused date from chartDays | PRESENT_CODE_ONLY |
| SS-C12-06 | SS-C12 | Whole hovered date band/Total bar brightening | reportsOverview.css no full date-category hovered band or selected Total bar emphasis | GAP_B28 |
| SS-C12-07 | SS-C12 | Chart options ellipsis actionable affordance | ReportChart button Chart options has no onClick or menu | GAP_B16 |
| SS-C12-08 | SS-C12 | Daily x-axis consecutive zero-activity dates | Rust overview daily_series only contains session-bearing dates, CSS fixed 8 columns | GAP_B30 |
| SS-C12-09 | SS-C12 | Most Productive cards and Time By List/Done Tasks below chart | ReportsOverviewView productive-grid and lower-grid | PRESENT_CODE_ONLY |
| SS-C12-10 | SS-C12 | Meaning of source work-day=8 with task/time=0 in this dataset | SS-C12 still does not expose underlying zero-duration sessions or exact date/task population | EVIDENCE_LIMIT |
| SS-C13-01 | SS-C13 | Three equal Most Productive time cards | ReportsOverviewView productive-grid map hour/day/month and CSS grid | PRESENT_CODE_ONLY |
| SS-C13-02 | SS-C13 | Time By List panel empty message exact string | ReportsOverviewView No report on the selected date range literal | PRESENT_CODE_ONLY |
| SS-C13-03 | SS-C13 | Done Tasks separate panel with green/red Early/Late percentages | ReportsOverviewView punctuality spans & progress bar | PRESENT_CODE_ONLY |
| SS-C13-04 | SS-C13 | Substantial lower panel height in empty state | ReportsOverviewView lower-grid and reportsOverview.css panel sizing; source pixel compare not run | PRESENT_CODE_ONLY |
| SS-C13-05 | SS-C13 | Empty Done Tasks body exact source copy/absence | Current source screenshot description does not establish whether extra empty-copy exists | EVIDENCE_LIMIT |

**Review 03 boundaries:** SS-C10/C11 are empty-state/one-filter-open screenshots and cannot prove populated archive actions or search/filter post-commit semantics. SS-C12 has zero dashboard totals and an 8-workdays number but not the underlying sessions/tasks; do not force a new numeric bug without the dataset. Visual-coded elements remain `PRESENT_CODE_ONLY`, not direct pixels/motion PASS.
## Review 04 — remaining current v2.6.69 List Editor, Focus, Floating and Sessions detail states

| Source claim ID | Original | Visible control/state/interaction claim | Production comparison or source limit | Disposition |
| --- | --- | --- | --- | --- |
| SS-C01-01 | SS-C01 | Home dimmed behind centered Create List dialog | AppShell mounts ListEditorModal above existing Home; role=dialog aria-modal | PRESENT_CODE_ONLY |
| SS-C01-02 | SS-C01 | Top-right × and Create a new list heading | ListEditorModal close button and heading based on mode | PRESENT_CODE_ONLY |
| SS-C01-03 | SS-C01 | Circular image-upload affordance plus JPG/PNG/SVG accept | ListEditorModal input type=file accept and safe local image-validation path | PRESENT_CODE_ONLY |
| SS-C01-04 | SS-C01 | Source UPLOAD AN ICON and (Optional) (jpg,png,svg) exact copy | ListEditorModal uses local helper/formats with max-1MiB safety copy; source alignment/copy already in M5 SS-C01 gate | GAP_B7 |
| SS-C01-05 | SS-C01 | Pick a list color including leading multicolor/custom swatch | ListEditorModal renders six fixed radio swatches only, no custom picker | GAP_B3 |
| SS-C01-06 | SS-C01 | Selected lime/green swatch bright outline and check | ListEditorModal data-selected with ✓, but source preset count/order and pixels differ | GAP_B8 |
| SS-C01-07 | SS-C01 | Title field Enter your list title placeholder | ListEditorModal has title input without source placeholder; part of existing M5 SS-C01 content gate | GAP_B7 |
| SS-C01-08 | SS-C01 | Outlined Cancel and cyan-lime Create submit | ListEditorModal footer cancel/submit; styles require direct rendered comparison | PRESENT_CODE_ONLY |
| SS-C01-09 | SS-C01 | Picker opening details/commit/cancel and upload progress | Source still and VE-005 do not show custom picker or upload intermediate states | EVIDENCE_LIMIT |
| SS-C18-01 | SS-C18 | Expanded Floating Timer remains compact width with larger height | FloatingTimerFoundation data-floating-expanded and region/resize states and CSS | PRESENT_CODE_ONLY |
| SS-C18-02 | SS-C18 | Top icon-led Break/Notes/Pause/Skip/Done actions | FocusLiveActions floating presentation uses FloatingActionButton with icons | PRESENT_CODE_ONLY |
| SS-C18-03 | SS-C18 | Restore/Panel/expand control on Floating Timer surface | FloatingTimerFoundation and floating action subtask toolbar expose restore/expand controls | PRESENT_CODE_ONLY |
| SS-C18-04 | SS-C18 | 3/4 Subtasks ring with visible fraction | FocusLiveSubtasks progressState and floating progressbar/count | PRESENT_CODE_ONLY |
| SS-C18-05 | SS-C18 | Subtask plus and disclosure chevron | FocusLiveSubtasks floating toolbar add/expand controls | PRESENT_CODE_ONLY |
| SS-C18-06 | SS-C18 | Completed subtask struck, incomplete normal | FocusLiveSubtasks completed state, CSS and subtask title | PRESENT_CODE_ONLY |
| SS-C18-07 | SS-C18 | Subtask row up/down/delete actions | FocusLiveSubtasks floating actions with reorder/delete mutations | PRESENT_CODE_ONLY |
| SS-C18-08 | SS-C18 | Exact expansion motion/continuous window correctness on real Windows | Current native CI1046 C4/35 status separately open, static image cannot establish motion | EVIDENCE_LIMIT |
| SS-C19-01 | SS-C19 | All list picker and Today header + settings/Home/compact controls | FocusPanel header has text native select and quick action buttons; control selection exists | GAP_B15 |
| SS-C19-02 | SS-C19 | Est header and gradient progress 1/4 Done | FocusPanel summary derives aggregateEstSeconds, done/count and gradient fill | PRESENT_CODE_ONLY |
| SS-C19-03 | SS-C19 | Live BFCM strategy title, running timer and mint highlighted card | FocusPanel FocusLiveTitle, focusTimerPresentation, live-card accent CSS | PRESENT_CODE_ONLY |
| SS-C19-04 | SS-C19 | Live subtask progress 1/4 with plus and expand | FocusLiveActions composes FocusLiveSubtasks panel | PRESENT_CODE_ONLY |
| SS-C19-05 | SS-C19 | Ordinary pending queue list-color/name badges | FocusTaskRow aggregateView list-chip borderColor from task.listColor | PRESENT_CODE_ONLY |
| SS-C19-06 | SS-C19 | Warm relative overdue 2d ago | FocusTaskRow prints Overdue plus absolute taskScheduleLabel instead | GAP_B31 |
| SS-C19-07 | SS-C19 | Add task button below ordinary queue | FocusPanel + ADD TASK and inline persisted form | PRESENT_CODE_ONLY |
| SS-C19-08 | SS-C19 | Scheduled subsection count, due rows with time | FocusPanel scheduledTasks filter, scheduled group and FocusTaskRow schedule label | PRESENT_CODE_ONLY |
| SS-C19-09 | SS-C19 | Done subsection count/struck title/Taken | FocusPanel doneTasks group and FocusTaskRow done/time presentation | PRESENT_CODE_ONLY |
| SS-C19-10 | SS-C19 | Integration badges in source queue | Cloud/integration features deliberately excluded from local-only Narro scope | INTENTIONAL_DEVIATION |
| SS-C19-11 | SS-C19 | Exact count-up vs countdown at snapshot and animated hover interaction | SS-C19 is resting still; timer mode and live hover require runtime/video evidence | EVIDENCE_LIMIT |
| SS-C20-01 | SS-C20 | Compact Floating title left and timer right | FloatingTimerFoundation heading title, timer and collapsed CSS geometry | PRESENT_CODE_ONLY |
| SS-C20-02 | SS-C20 | 2/4 progress ring/counter and Add plus | FocusLiveSubtasks progress ring/count/add in floating toolbar | PRESENT_CODE_ONLY |
| SS-C20-03 | SS-C20 | Downward chevron expands compact Timer | FocusLiveSubtasks expand button and requestExpanded path | PRESENT_CODE_ONLY |
| SS-C20-04 | SS-C20 | No permanent actions in resting collapsed state | FloatingTimerFoundation compactActionsVisible only hover/focus, inert/aria-hidden hidden actions | PRESENT_CODE_ONLY |
| SS-C20-05 | SS-C20 | Actual cross-window morph/hover timing on Windows | SS-C20 static still; CI1046 M7 C4 remains physical FAIL and cannot be accepted from markup | EVIDENCE_LIMIT |
| SS-C21-01 | SS-C21 | Live card remains while queued Notes task expands in place | FocusPanel renderTaskRow with notesExpanded TaskNotes embedded below row | PRESENT_CODE_ONLY |
| SS-C21-02 | SS-C21 | Note toolbar B/I/strikethrough/lists/undo/redo | TaskNotes RichNoteEditor formatting toolbar and keyboard controls | PRESENT_CODE_ONLY |
| SS-C21-03 | SS-C21 | Editable multiline note body/row pushes rest downward | TaskNotes editor within FocusTaskRow expansion, container flow positioning | PRESENT_CODE_ONLY |
| SS-C21-04 | SS-C21 | Bottom-right × Close action inside expanded Notes | RichNoteEditor footer has Save note only; Focus outer Notes toggle can close | GAP_B26 |
| SS-C21-05 | SS-C21 | Microphone-like source Notes affordance | Explicitly excluded cloud/voice speech capture per HC-F010 local-only scope | INTENTIONAL_DEVIATION |
| SS-C21-06 | SS-C21 | Close-on-dirty autosave/cancel semantics | Source still only shows × Close location, not resulting persistence path | EVIDENCE_LIMIT |
| SS-C22-01 | SS-C22 | Centered task session-detail overlay with task name and list chip | ReportTaskSessionsDialog titled task, list-color/name chip and backdrop | PRESENT_CODE_ONLY |
| SS-C22-02 | SS-C22 | Add Session button and session count/aggregate time | ReportTaskSessionsDialog detail actions, totalSessions and totalTime | PRESENT_CODE_ONLY |
| SS-C22-03 | SS-C22 | Date-grouped session rows, Session ordinals/date/start/end/duration | ReportTaskSessionsDialog maps detail.rows SessionRow with formatted time and ordinal | PRESENT_CODE_ONLY |
| SS-C22-04 | SS-C22 | End-time inline editor accent + green check submit | ReportsSessionsView SessionRow edit input type=time and ✓ commit button | PRESENT_CODE_ONLY |
| SS-C22-05 | SS-C22 | Individual session row overflow ellipsis | ReportsSessionsView SessionRow Menu with destructive Delete | PRESENT_CODE_ONLY |
| SS-C22-06 | SS-C22 | Narro detail modal Escape/Tab/return focus and conflicting Add modal | ReportTaskSessionsDialog aria-modal but no keyboard focus owner; B32 engineering accessibility gap | GAP_B32 |
| SS-C22-07 | SS-C22 | Exact source keyboard behavior/save-cancel of inline edit | Current SS-C22 static state shows checked edit but does not prove keyboard commit/cancel | EVIDENCE_LIMIT |

**Review 04 source limits:** The visible Notes Close is B26 but the still does not prove dirty-close persistence. The independent success/Timer physical gates C4 and Finding35 remain current FAIL despite structural TSX matches. Current source screenshot SS-C22 does not prove exact keyboard modality; B32 is a Narro accessibility obligation, not invented Blitzit shortcut semantics. Cloud integration badges and microphone/voice controls are scope-excluded, not missing local-only Narro functionality.
## Review 05 — Help source board, Focus placement/preferences, recurrence and Floating Timer states H01–H09

| Source claim ID | Original | Visible control/state/interaction claim | Production comparison or source limit | Disposition |
| --- | --- | --- | --- | --- |
| SS-H01-01 | SS-H01 | Four Backlog/This Week/Today/Done columns | ListBoard.tsx LANES definitions and four BoardLane rendering | PRESENT_CODE_ONLY |
| SS-H01-02 | SS-H01 | Top Back action/list-scope picker/list summary | ListBoard header selection exists, list-scope native select is not source anchored badge menu | GAP_B24 |
| SS-H01-03 | SS-H01 | Each pending lane estimate/time label and add affordance | BoardLane header Est plus top/bottom inline create actions | PRESENT_CODE_ONLY |
| SS-H01-04 | SS-H01 | This Week and Today Done fraction/progress | BoardLane only supplies/render Today progress, not This Week | GAP_B44 |
| SS-H01-05 | SS-H01 | Today persistent cyan-to-lime outline | listBoard.css Today lane gradient border background | PRESENT_CODE_ONLY |
| SS-H01-06 | SS-H01 | Bottom-anchored gradient BLITZIT NOW CTA with rocket | BoardLane today renders BlitzEntryButton at lane bottom | PRESENT_CODE_ONLY |
| SS-H01-07 | SS-H01 | Task left ordinal/title/EST bottom-left/Taken bottom-right | TaskCard ordinal completion slot, title and separate estimate/timeTaken presentation | PRESENT_CODE_ONLY |
| SS-H01-08 | SS-H01 | Recurring parents separated in Backlog Recurring tasks group | BoardLane maps flat lane.tasks no recurring parent subsection | GAP_B39 |
| SS-H01-09 | SS-H01 | Scheduled task subsections per due time group | BoardLane task list flat with per-card scheduled metadata only | GAP_B40 |
| SS-H01-10 | SS-H01 | Done grouped by completion date and count | BoardLane flat Done tasks and overall completed-this-month number | GAP_B43 |
| SS-H01-11 | SS-H01 | Completed titles struck through | TaskCard data-task-card-state done and CSS strike state | PRESENT_CODE_ONLY |
| SS-H01-12 | SS-H01 | Bottom global Add task and Help Center source extras | Local-only Home/Reports navigation retained; cloud assistant/help center controls excluded; quick task via Search | INTENTIONAL_DEVIATION |
| SS-H02-01 | SS-H02 | Today title, 1hr30 estimate and plus | BoardLane title/Est and add actions | PRESENT_CODE_ONLY |
| SS-H02-02 | SS-H02 | 4/5 Done gradient fraction and progress bar | BoardLane todayProgress and list-board-lane__progress CSS | PRESENT_CODE_ONLY |
| SS-H02-03 | SS-H02 | Ordinal 1 reserved at far-left on ordinary task | TaskCard ordinal/completion swap in reserved leading slot | PRESENT_CODE_ONLY |
| SS-H02-04 | SS-H02 | EST lower-left and Taken lower-right task metrics | TaskCard distinct metric slots with formatting/edit paths | PRESENT_CODE_ONLY |
| SS-H02-05 | SS-H02 | Persistent Today cyan→green outline and bottom + ADD TASK | listBoard.css Today gradient edge and BoardLane bottom add action | PRESENT_CODE_ONLY |
| SS-H02-06 | SS-H02 | External integration badges by title | Excluded cloud/integration product controls by Narro local-only scope | INTENTIONAL_DEVIATION |
| SS-H02-07 | SS-H02 | Actual click behavior/hover animation implied by still | Single Help still does not prove timing/easing or mutation; videos separate | EVIDENCE_LIMIT |
| SS-H03-01 | SS-H03 | Companion Focus surface at screen edge beside another application | FocusPanel separate focusSurface Tauri companion and monitor/side preference logic | PRESENT_CODE_ONLY |
| SS-H03-02 | SS-H03 | Header/live card/queue/overdue scheduled/Add Task within narrow vertical region | FocusPanel.tsx combined grouped vertical layout | PRESENT_CODE_ONLY |
| SS-H03-03 | SS-H03 | Actual Windows dock bounds/stale-state/DPI correctness | Source screenshot shows macOS context; CI1046 C4 and M1 DPI observations remain open | EVIDENCE_LIMIT |
| SS-H04-01 | SS-H04 | Focus list trigger badge and chevron | FocusPanel uses native text-only select, no colored badge | GAP_B15 |
| SS-H04-02 | SS-H04 | All Lists popup with stacked badges and +5 count | FocusPanel native select plain All option, no custom popup | GAP_B15 |
| SS-H04-03 | SS-H04 | Work/Home/Content Plan per-list color badge entries | FocusPanel select uses option.title only | GAP_B15 |
| SS-H04-04 | SS-H04 | List popup overlays panel and retains current Focus screen | Source anchored menu, Narro OS native chooser instead | GAP_B15 |
| SS-H04-05 | SS-H04 | List selection filtering/persistence behavior from static menu | SS-H04 static open state cannot prove the postselection task count; Narro target-switch code exists | EVIDENCE_LIMIT |
| SS-H05-01 | SS-H05 | Focus Menu/Back/Quick Preferences separate from full Preferences | FocusQuickPreferencesView header/back and separate panel view | PRESENT_CODE_ONLY |
| SS-H05-02 | SS-H05 | Hide EST/Done times quick toggle | FocusQuickPreferencesView QuickToggle bound to hideTaskTimes | PRESENT_CODE_ONLY |
| SS-H05-03 | SS-H05 | Screen thumbnails/dimensions/selected border | FocusQuickPreferences screens role=radiogroup, selected CSS and monitor widths | PRESENT_CODE_ONLY |
| SS-H05-04 | SS-H05 | Blitz Panel Side left/right segmented control | FocusQuickPreferences .segments and aria-pressed side | PRESENT_CODE_ONLY |
| SS-H05-05 | SS-H05 | Pomodoros/Timed alerts/Notification alerts/Success screen toggles | FocusQuickPreferences respective QuickRows/snapshot toggles | PRESENT_CODE_ONLY |
| SS-H05-06 | SS-H05 | Conditional nested Fun gif when success screen ON | FocusQuickPreferences conditionally maps child row only when showSuccessScreen | PRESENT_CODE_ONLY |
| SS-H05-07 | SS-H05 | Selecting monitor under live Windows multi-DPI geometry | Help screenshot cannot prove Windows capture, separate M1/M7 native gate | EVIDENCE_LIMIT |
| SS-H06-01 | SS-H06 | Pomodoros ON and nested Work Sprint 30 / Break Time 10 | LowerPreferenceSections child duration values and parent state, but child rows always mounted | GAP_B17 |
| SS-H06-02 | SS-H06 | Indented vertical-guide Pomodoro settings | preferenceSettingsSections.css nested border-left indentation | PRESENT_CODE_ONLY |
| SS-H06-03 | SS-H06 | Default break length separate from Pomodoro nested pair | LowerPreferenceSections top-level manual break DurationSelect | PRESENT_CODE_ONLY |
| SS-H06-04 | SS-H06 | Scrolling title on live timer ON switch | LowerPreferenceSections bound to scrollingTitle | PRESENT_CODE_ONLY |
| SS-H06-05 | SS-H06 | ON→OFF collapse semantics and child-value persistence | VE-014 reveals ON; current full Preferences always renders disabled children, B17 | GAP_B17 |
| SS-H07-01 | SS-H07 | Scheduler modal over dimmed Board and quick-date choices | TaskScheduleDialog modal and Today/LaterToday/Tomorrow/NextWeek buttons | PRESENT_CODE_ONLY |
| SS-H07-02 | SS-H07 | Custom full calendar first-step and Next footer | TaskScheduleDialog uses native date input/single view, no source two-step calendar | GAP_B19 |
| SS-H07-03 | SS-H07 | Selected date 7 gradient circular endpoint | TaskScheduleDialog lacks source selectable calendar date grid | GAP_B19 |
| SS-H07-04 | SS-H07 | Small purple date dots inside calendar grid | No internal custom calendar exists; source dots semantic meaning unknown | EVIDENCE_LIMIT |
| SS-H07-05 | SS-H07 | Cancel/Next wizard step navigation | TaskScheduleDialog Cancel/Save schedule in one view, not Next/Pick Date | GAP_B19 |
| SS-H08-01 | SS-H08 | Recurring schedule presets No Repeat selected | TaskScheduleDialog recurrencePreset state and source choices, scoped domain tested | PRESENT_CODE_ONLY |
| SS-H08-02 | SS-H08 | Conditional red Delete existing tasks(6) with checkbox | TaskScheduleDialog shows child-count consequence controls when linked parent rule removed | PRESENT_CODE_ONLY |
| SS-H08-03 | SS-H08 | Cancel + gradient Schedule button footer | TaskScheduleDialog dialog submit/Cancel controls; exact styling/source layout separately open B19 | PRESENT_CODE_ONLY |
| SS-H08-04 | SS-H08 | Replacing existing children vs detaching/deleting safely | Authoritative Rust recurrence replacement/No Repeat scoped tested, separate from pixels | PRESENT_CODE_ONLY |
| SS-H08-05 | SS-H08 | No Repeat unchecked outcome from this one still | Screenshot doesn't show a committed unchecked path; VE-017 has distinct direct sequence | EVIDENCE_LIMIT |
| SS-H09-01 | SS-H09 | Compact Floating Timer actions inside same rounded surface | FloatingTimerFoundation collapsed hover/focus states, FocusLiveActions floating branch | PRESENT_CODE_ONLY |
| SS-H09-02 | SS-H09 | Only targeted Notes expands into labeled pill | FloatingActionButton hover/focus icon→label CSS and selected compact state | PRESENT_CODE_ONLY |
| SS-H09-03 | SS-H09 | Adjacent Pause/Skip/Done and restore icons stay compact | FocusLiveActions floating icon actions and responsive action CSS | PRESENT_CODE_ONLY |
| SS-H09-04 | SS-H09 | Precise hover-pill expansion/motion and native window contour | CI936 partial direct source comparison exists; exact other states remain physical M7 gates | EVIDENCE_LIMIT |

**Help source precedence:** H01–H09 are Help v2.x structural states; current v2.6.69 stills override them where in conflict. H03 macOS dock context does not certify native Windows edge geometry, and H07 purple date-dot meaning is unknown. A code-present state is not a direct visual parity PASS.
## Caveats and exact continuation

- **No automatic promotion of `PRESENT_CODE_ONLY`:** check actual Windows candidate and canonical Blitzit source side-by-side before `SOURCE_PARITY_PASS`. Static code can be wrong in geometry, data, keyboard, timing or runtime composition.
- **B56 backend/fixture divergence is a priority causal finding:** the existing `reportsVisualFixture.tsx` hardcodes `2 Total Tasks / 0 Sessions` while real `session_reporting.rs` derives tasks solely from work-session IDs and cannot produce `2/0`; the source itself shows `2/0` in current v2.6.69 and `39/22` in older VE-015. This proves a definition mismatch but not the source's exact task inclusion/counting rule. Require a product-semantic reconciliation before implementing; do not blindly switch to count of all tasks.
- **EVIDENCE_LIMIT rows are not missing feature tickets.** Especially search results matching, search keyboard navigation and date-picker double-chevron effect: source static images do not prove them. A current Narro implementation does not establish source parity. Review canonical video context or original media only where it actually resolves the disputed observation.
- **Next static claim-audit candidates:** Help states `SS-H10–SS-H17` (8/39 remaining). All 22 current-direct stills have claim routes, not direct source-parity PASS. Continue claim-level Help reviews with source-version priority. Use same row statuses; preserve previously routed B IDs and do not duplicate their fixes. Raw MP4 needed for direct motion/sequence parity, not for static existence/copy claims.
- **Validation:** documentation-only evidence audit. App/frontend/Rust tests, Windows CI, native physical comparison, and raw media reinspection **NOT RUN**. No progress/counters advanced: `3/10M || 0/3 | 17/18`. Codex retains app/native ownership and physical CI1046 C4/35/29 gates.
