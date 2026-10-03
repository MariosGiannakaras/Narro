import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { TaskNotes } from "./TaskNotes";
import { SearchPalette } from "./SearchPalette";
import "./App.css";
import "./focusSurfaceCoordinator.css";
import "./floatingTimerFoundation.css";
import "./focusPanel.css";

function reportFixtureFailure(message: string) {
  const errorNode = document.createElement('script');
  errorNode.id = 'focus-editor-contract'; errorNode.type = 'application/json';
  errorNode.textContent = JSON.stringify({error: message}); document.body.append(errorNode);
  document.documentElement.dataset.focusEditorFixtureReady = 'true';
}
window.addEventListener('error', e => reportFixtureFailure(e.message));
window.addEventListener('unhandledrejection', e => reportFixtureFailure(String(e.reason)));

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "dark" ? "dark" : "light";
const scenario = params.get("scenario") ?? "notes-timerExpanded-large";
const quick = scenario.startsWith("quick-");
const motion = scenario.startsWith("motion-");
const motionToPanel = scenario === "motion-timerCompact-panel";
const panel = scenario.includes("-panel-");
const large = scenario.endsWith("-large");
const visibleHeight = panel ? 700 : 300;
document.documentElement.dataset.theme = theme;
const taskId = "31111111-1111-4111-8111-111111111111";
const listId = "21111111-1111-4111-8111-111111111111";
const draftMarker = "Unsaved draft survives large view.";
const wait = (ms: number) => new Promise<void>(r => window.setTimeout(r, ms));
const assert = (value: unknown, message: string) => { if (!value) throw new Error(message); };
const find = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${selector}`);
  return element;
};
(window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string) => Promise<unknown> } }).__TAURI_INTERNALS__ = {
  invoke: async (command) => {
    if (command === "get_archived_lists_for_settings") return {lists: [], doneTasks: [], filterLists: []};
    if (command === "get_list_board_task_note") return {
      taskId, listId, mutable: true,
      note: {taskId, editorFormatVersion: 1, updatedAt: "2026-10-03T00:00:00Z",
        document: {blocks: [{kind: "paragraph", runs: [{text: "LongWord".repeat(30)}]}]}}
    };
    if (command === "get_home_snapshot" || command === "get_list_board_snapshot") {
      await wait(250);
      if (scenario === "quick-error") throw new Error("Controlled local list-read failure");
      if (command === "get_home_snapshot") return {lists: scenario === "quick-empty" ? [] : [{id: listId, title: "Test"}]};
      return {backlog: {tasks: []}, thisWeek: {tasks: []}, today: {tasks: []}, done: {tasks: []}};
    }
    throw new Error(`Unused fixture command ${command}`);
  }
};
function Fixture() {
  const [open, setOpen] = useState(false);
  return motion ? <main className="focus-surface-coordinator" data-focus-presentation={motionToPanel ? "timerCompact" : "panel"}
    data-focus-geometry-motion="true" data-focus-geometry-motion-phase="start"
    data-focus-geometry-motion-from={motionToPanel ? "timerCompact" : "panel"}
    data-focus-geometry-motion-to={motionToPanel ? "panel" : "timerCompact"}>
    <section id="outgoing" className="focus-surface-coordinator__presentation" data-focus-presentation={motionToPanel ? "timer" : "panel"} data-focus-visibility="active">Outgoing hierarchy</section>
    <section id="incoming" className="focus-surface-coordinator__presentation" data-focus-presentation={motionToPanel ? "panel" : "timer"} data-focus-visibility="preparing">Ready hierarchy</section>
  </main> : quick ? <>
    <button id="open-fixture" onClick={() => setOpen(true)}>Open Create</button>
    <SearchPalette open={open} initialMode="task-create" taskCreateOnly
      onRequestClose={() => setOpen(false)} onOpenList={() => {}} onOpenTask={() => {}}
      onAddList={() => {}} onGoReports={() => {}} onTaskCreated={() => {}} />
  </> : <main className="focus-surface-coordinator" data-focus-presentation={panel ? "panel" : "timerExpanded"}>
    <section className="focus-surface-coordinator__presentation" data-focus-presentation={panel ? "panel" : "timer"} data-focus-visibility="active">
      <div style={{padding: 12}}>
        <div className={panel ? "focus-panel__notes" : "floating-timer-foundation__notes"}>
          <TaskNotes taskId={taskId} listId={listId} taskTitle="Long validation task title for keyboard and editor overflow"
            expanded canExpand readOnly={false} allowTitleEdit
            onToggleExpanded={() => {}} onMutationStatus={() => {}} onRefreshBlocked={() => {}} />
        </div>
      </div>
    </section>
  </main>;
}
const root = find<HTMLElement>("#root");
flushSync(() => createRoot(root).render(<Fixture />));
const result: Record<string, unknown> = {theme, scenario};
if (motion) {
  const host = find<HTMLElement>(".focus-surface-coordinator");
  const outgoing = find<HTMLElement>("#outgoing");
  const incoming = find<HTMLElement>("#incoming");
  await wait(40);
  result.soleTargetAtStart = getComputedStyle(outgoing).opacity === "0" && getComputedStyle(incoming).opacity === "1";
  assert(result.soleTargetAtStart, "Outgoing hierarchy remains painted beside ready target");
  host.dataset.focusGeometryMotionPhase = "running";
  await wait(40);
  result.soleTargetDuringMotion = getComputedStyle(outgoing).opacity === "0";
  assert(result.soleTargetDuringMotion, "Outgoing hierarchy reappeared during native motion");
  host.dataset.focusGeometryMotion = "false";
  await wait(40);
  result.rollbackRestoredOutgoing = getComputedStyle(outgoing).opacity === "1";
  assert(result.rollbackRestoredOutgoing, "Rollback did not restore the committed hierarchy");
  host.dataset.focusGeometryMotion = "true";
  await wait(40);
} else if (quick) {
  const trigger = find<HTMLButtonElement>("#open-fixture");
  trigger.focus();
  flushSync(() => trigger.click());
  await wait(40);
  const loadingDialog = find<HTMLElement>('[role="dialog"]');
  result.loadingFocusContained = loadingDialog.contains(document.activeElement);
  assert(result.loadingFocusContained, "Loading dialog lost keyboard ownership " + document.activeElement?.outerHTML.slice(0,160));
  await wait(400);
  const dialog = find<HTMLElement>('[role="dialog"]');
  result.readyFocusContained = dialog.contains(document.activeElement);
  assert(result.readyFocusContained, "Settled dialog lost keyboard ownership");
  if (scenario === "quick-success") {
    const title = find<HTMLInputElement>('[data-search-task-field="title"]');
    result.titleFocused = document.activeElement === title;
    assert(result.titleFocused, "Delayed title was not focused after loading");
    const buttons = dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    const last = buttons[buttons.length - 1];
    last.focus();
    last.dispatchEvent(new KeyboardEvent("keydown", {key: "Tab", bubbles: true, cancelable: true}));
    result.tabWrapped = document.activeElement === buttons[0];
    assert(result.tabWrapped, "Modal Tab did not wrap");
  }
  (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", {key: "Escape", bubbles: true, cancelable: true}));
  await wait(30);
  result.escapeClosed = !document.querySelector('[role="dialog"]');
  result.focusRestored = document.activeElement === trigger;
  assert(result.escapeClosed && result.focusRestored, "Escape failed to close/restore focus");
} else {
  await wait(100);
  const editor = find<HTMLElement>('[data-task-note-control="editor"]');
  editor.querySelector('p')?.append(draftMarker);
  editor.dispatchEvent(new InputEvent("input", {bubbles: true, inputType: "insertText", data: draftMarker}));
  await wait(20);
  const inline = find<HTMLElement>('.task-notes__editor-shell');
  const wrapper = find<HTMLElement>(panel ? '.focus-panel__notes' : '.floating-timer-foundation__notes');
  result.inlineHorizontalOverflow = wrapper.scrollWidth > wrapper.clientWidth || inline.scrollWidth > inline.clientWidth;
  assert(!result.inlineHorizontalOverflow, "Notes has horizontal overflow " + JSON.stringify({wrapper: [wrapper.clientWidth, wrapper.scrollWidth], shell: [inline.clientWidth, inline.scrollWidth], nodes: Array.from(wrapper.querySelectorAll<HTMLElement>("*")).filter(e => e.scrollWidth > e.clientWidth + 1).map(e => [e.className, e.clientWidth, e.scrollWidth])}));
  const input = find<HTMLInputElement>('.task-notes__title-editor input');
  result.titleInputContained = input.getBoundingClientRect().right <= input.parentElement!.getBoundingClientRect().right + 0.5;
  assert(result.titleInputContained, "Title input padding escaped its grid column");
  if (large) {
    find<HTMLButtonElement>('[data-task-note-control="presentation"]').click();
    await wait(40);
    const shell = find<HTMLElement>('[data-task-note-presentation="large"]');
    const save = find<HTMLElement>('[data-task-note-control="save"]');
    const rect = shell.getBoundingClientRect();
    const saveRect = save.getBoundingClientRect();
    result.modal = {x: rect.x, y: rect.y, width: rect.width, height: rect.height, saveBottom: saveRect.bottom};
    assert(rect.x >= 0 && rect.right <= 340 && rect.y >= 0 && rect.bottom <= visibleHeight, "Large Notes escapes visible native region");
    assert(saveRect.bottom <= rect.bottom && saveRect.right <= rect.right && saveRect.top >= rect.top, "Save control is clipped " + JSON.stringify({shell: rect.toJSON(), save: saveRect.toJSON()}));
    const oldWidth = shell.style.width, oldHeight = shell.style.height;
    shell.style.width = '1000px'; shell.style.height = '1000px';
    result.resizeBounded = shell.getBoundingClientRect().right <= 340 && shell.getBoundingClientRect().bottom <= visibleHeight;
    assert(result.resizeBounded, "Resizing escapes visible native region");
    shell.style.width = oldWidth; shell.style.height = oldHeight;
    editor.focus();
    editor.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape", bubbles: true, cancelable: true}));
    await wait(30);
    result.escapeReturnedInline = !document.querySelector('[data-task-note-presentation="large"]');
    assert(result.escapeReturnedInline, "Escape did not return inline");
    find<HTMLButtonElement>('[data-task-note-control="presentation"]').click();
    await wait(30);
  }
  result.draftPreserved = editor.textContent?.includes(draftMarker);
  result.editorNodePreserved = editor === document.querySelector('[data-task-note-control="editor"]');
  assert(result.draftPreserved && result.editorNodePreserved, "Presentation switch discarded editor/draft");
}
const node = document.createElement('script');
node.id = 'focus-editor-contract'; node.type = 'application/json'; node.textContent = JSON.stringify(result);
document.body.append(node);
document.documentElement.dataset.focusEditorFixtureReady = 'true';
