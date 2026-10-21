import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const assert = (ok, message) => { if (!ok) throw new Error(`Action-icon regression: ${message}`); };

// All UI action icons are local decorative vectors, not platform-dependent fonts
// or runtime network images. The 218 List Editor icons are an unrelated,
// protected catalogue and must not be changed by this normalization.
const icons = read("src/ActionIcon.tsx");
assert(icons.includes('export function ActionIcon('), "shared icon component is missing");
assert(icons.includes('export type ActionIconName'), "icon names must be closed by a TypeScript union");
assert(icons.includes('"aria-hidden": true as const') && icons.includes('focusable: "false"'),
  "SVGs must not steal accessible names/focus from the existing buttons");
assert(!icons.includes("<img") && !icons.includes("fetch("), "action icons must remain offline inline SVG");

const sourceFiles = [
  "FocusPanel", "FloatingTimerFoundation", "FocusLiveSubtasks", "FocusLiveActions",
  "TaskSubtasks", "TaskNotes", "FocusQuickPreferences", "FocusLiveMetrics",
  "TaskCard", "ListBoard", "BoardListPicker", "ArchivedDoneTasksPanel", "HomeDashboard",
  "ReportsOverviewView", "ReportsSessionsView", "ScheduleCalendarStep",
  "TaskScheduleDialog", "SearchPalette", "BlitzEntryButton",
  "PreferencesDialog", "WindowsShortcutsDialog",
];
const legacyArrows = /[⌃⌄↗↙⛶‹›«»]/u;
for (const name of sourceFiles) {
  const file = read(`src/${name}.tsx`);
  assert(file.includes('from "./ActionIcon"'), `${name} must import the shared SVG family`);
  assert(!legacyArrows.test(file), `${name} still contains font-dependent arrow/expansion glyphs`);
  assert(file.includes("<ActionIcon "), `${name} must actually render a vector action`);
}

const panel = read("src/FocusPanel.tsx");
const floating = read("src/FloatingTimerFoundation.tsx");
const subst = read("src/FocusLiveSubtasks.tsx");
const actions = read("src/FocusLiveActions.tsx");
const notes = read("src/TaskNotes.tsx");
const board = read("src/TaskCard.tsx");
const reports = read("src/ReportsSessionsView.tsx");
const homeDashboard = read("src/HomeDashboard.tsx");
const homeCss = read("src/homeDashboard.css");
assert(homeDashboard.includes('trigger={<ActionIcon name="more" />}')
  && homeDashboard.includes('triggerLabel={`More actions for ${card.title}`}')
  && homeDashboard.includes('data-home-list-card'),
  "Home list action must use centered offline More SVG with the unchanged named menu");
assert(!homeDashboard.includes('trigger={<span aria-hidden="true">…</span>}'),
  "font-dependent ellipsis must not return to the Home action control");
assert(homeCss.includes(".home-list-card__action-slot .overlay-trigger {")
  && homeCss.includes("width: 2rem;")
  && homeCss.includes("height: 2rem;")
  && homeCss.includes("padding: 0;"),
  "Home menu icon must retain existing hitbox and central SVG alignment");

const completionRingCss = read("src/listBoard.css");
const markCount = (board.match(/className="list-board-task__completion-mark"/g) ?? []).length;
assert(markCount === 5, "all five task-card completion mark variants must share the same ring");
assert(completionRingCss.includes(".list-board-task__completion-mark {")
  && completionRingCss.includes("border: 1px solid currentColor;")
  && completionRingCss.includes("border-radius: 999px;"),
  "the existing 16px CSS completion ring is the one actual circle owner");
assert(!board.includes('<span className="list-board-task__completion-mark"><ActionIcon name="circle" /></span>')
  && !board.includes('"check" : "circle"'),
  "a second SVG circle inside the CSS ring creates the visibly doubled turquoise outline");
assert(board.split('<span className="list-board-task__completion-mark" />').length - 1 === 3,
  "all three non-completed buttons/previews must use exactly one CSS ring");
assert(board.includes('{done ? <ActionIcon name="check" /> : null}')
  && board.includes('{state === "done" ? <ActionIcon name="check" /> : null}'),
  "Done cards and inline title editor must keep the original centered check SVG");

const railCss = read("src/listBoard.css");
const actionButton = board.slice(board.indexOf("function TaskActionButton("), board.indexOf("function TaskOverflowMenu("));
assert(railCss.includes(".list-board,\n.list-board * {\n  box-sizing: border-box;")
  && railCss.includes("width: 1rem;\n  height: 1.75rem;\n  min-width: 1rem;")
  && railCss.includes("border: 1px solid var(--color-border-subtle)"),
  "planning task action rail uses a bordered 16px border-box, not 16px of content");
assert(actionButton.includes('<ActionIcon name={glyph} size={14} />')
  && board.includes('trigger={<ActionIcon name="more" size={14} />}'),
  "planning task hover and overflow icons must fit inside the actual 14px content width");
assert(actionButton.includes("onClick={action}") && actionButton.includes("aria-label={label}")
  && board.includes('data-task-action="overflow"'),
  "icon optical sizing must preserve click handlers, labels and overflow interaction");

for (const [source, needle, reason] of [
  [panel, 'data-focus-compact-control="true"', "Panel compact action identity"],
  [panel, '<ActionIcon name="panel-to-timer" />', "Panel to compact Timer direction"],
  [floating, 'data-floating-fallback-action="return-to-panel"', "Timer return action identity"],
  [floating, '<ActionIcon name="timer-to-panel" />', "Timer to Panel direction"],
  [floating, '<ActionIcon name="chevron-up" />', "idle-expanded Timer collapse direction"],
  [actions, 'return <ActionIcon name="timer-to-panel" size={18} />', "live Timer return shared icon"],
  [subst, '<ActionIcon name={expanded ? "chevron-up" : "chevron-down"} />', "live subtask state direction"],
  [notes, '<ActionIcon name={largePresentation ? "shrink" : "expand"} />', "Notes enlarge/shrink directions"],
  [board, 'glyph: ActionIconName;', "task rail action names must be type-checked"],
  [reports, '<ActionIcon name={pickerOpen ? "chevron-up" : "chevron-down"} />', "task picker disclosure state"],
  [reports, '<ActionIcon name={listFilterOpen ? "chevron-up" : "chevron-down"} />', "Reports list filter state"],
]) assert(source.includes(needle), reason);
assert(panel.includes('onClick={onRequestCompact}') &&
  floating.includes('onClick={onReturnToPanel}') &&
  subst.includes('onClick={() => void toggleExpanded()}') &&
  notes.includes('onClick={toggleLargePresentation}'),
  "normalization must preserve the native control handlers");
assert(!board.includes('glyph="←"') && !board.includes('glyph="→"'),
  "lane reordering must use semantic ArrowLeft/ArrowRight vectors");
// The close button is a separate user action, not part of the approved picker.
// Protect picker state, selection checks, uploads and built-in icon ownership.
const listEditor = read("src/ListEditorModal.tsx");
assert(listEditor.includes('aria-label="Close list editor" onClick={requestClose} disabled={saving}><ActionIcon name="close" />'),
  "the List Editor close affordance must use the same SVG X without changing its handler");
for (const [needle, label] of [
  ['<SpectrumColorPopover color={color} onChange={setColor}', "approved color picker state and onChange"],
  ['<BuiltinListIcon id={builtinIconId} />', "approved built-in icon catalog rendering"],
  ['URL.createObjectURL(file)', "approved image upload preview"],
  ['onChange={(event) => void handleIconChange(event)}', "approved image-upload input handler"],
  ['{selected ? "✓" : ""}', "approved color swatch selected-state decoration"],
  ['{!isPresetColor ? "✓" : "+"}', "approved custom-color selected-state decoration"],
]) assert(listEditor.includes(needle), `List Editor must preserve ${label}`);
const sound = read("src/SoundPreferenceControl.tsx");
assert(sound.includes('<ActionIcon name="play" />') && sound.includes("onClick={preview}")
  && sound.includes('className="preference-settings__sound-preview motion-interactive"'),
  "audio preview must use SVG Play with the unchanged handler and visual control identity");
assert(icons.includes('case "play"'), "the shared Play icon is not defined");
// The original Blitzit v2.6.69 expanded-Timer screenshot uses a trash can
// for deleting a subtask; the X glyph is reserved for canceling an edit.
for (const [path, deleteMarker, cancelMarker, name] of [
  ["src/FocusLiveSubtasks.tsx", 'data-floating-subtask-action="delete"', 'data-floating-subtask-action="cancel-edit"', "Timer"],
  ["src/TaskSubtasks.tsx", 'data-task-subtask-control="delete"', 'data-task-subtask-control="cancel-edit"', "Board"],
]) {
  const source = read(path);
  const deleting = source.slice(source.indexOf(deleteMarker), source.indexOf("</button>", source.indexOf(deleteMarker)));
  const cancelling = source.slice(source.indexOf(cancelMarker), source.indexOf("</button>", source.indexOf(cancelMarker)));
  assert(deleting.includes('<ActionIcon name="trash" />')
    && deleting.includes("onClick="), `${name} Delete must render a trash SVG and preserve its handler`);
  assert(cancelling.includes('<ActionIcon name="close" />'),
    `${name} Cancel Edit must retain the distinct X semantic SVG`);
  assert(source.includes('<ActionIcon name={completed ? "circle-check" : "circle"} />'),
    `${name} completed subtasks must use the original circular-check shape, not a free-floating tick`);
}

const pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["test:ui-action-icons"] === "node scripts/test-ui-action-icons.mjs",
  "shared action-icon test script is missing");
assert(pkg.scripts["preflight:frontend"].includes("npm run test:ui-action-icons"),
  "action icon regressions must run in the normal preflight/CI");
console.log("Narro shared semantic action-icon controls: PASS");
