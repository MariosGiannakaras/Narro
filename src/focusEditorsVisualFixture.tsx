import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { TaskNotes } from "./TaskNotes";
import { SearchPalette } from "./SearchPalette";
import { TaskCard } from "./TaskCard";
import type { ListBoardTask } from "./listBoardApi";
import "./listBoard.css";
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
const board = scenario === "board-narrow";
const boardMetrics = scenario === "board-metrics";
const timerGeometry = scenario === "timer-geometry";
const motionToPanel = scenario === "motion-timerCompact-panel";
const panel = scenario.includes("-panel-");
const large = scenario.endsWith("-large");
const visibleHeight = panel ? 700 : 300;
const requestedReducedMotion = params.get("motion")?.toLowerCase() === "true";
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
assertMotionPreference();
function assertMotionPreference() {
  if (reducedMotion !== requestedReducedMotion) throw new Error(`Renderer motion preference did not match capture request: requested=${requestedReducedMotion}, actual=${reducedMotion}`);
}
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
  const notes = <TaskNotes taskId={taskId} listId={listId} taskTitle="Long validation task title for keyboard and editor overflow"
    expanded canExpand readOnly={false} allowTitleEdit
    onToggleExpanded={() => {}} onMutationStatus={() => {}} onRefreshBlocked={() => {}} />;
  if (boardMetrics) {
    const task: ListBoardTask = {id: taskId, listId, listTitle: "Long owning list title", listColor: null,
      title: "LongUnbrokenTaskTitleForActualNarrowMetricContainment1234567890", estSeconds: null,
      timeTakenSeconds: "0", scheduledLocalDate: null, scheduledLocalTime: null, isOverdue: false, completedAt: null};
    const noop = () => {};
    const cases = [
      {id: "normal", width: 147}, {id: "wide", width: 340}, {id: "middle", width: 196},
      {id: "long-times", width: 147}, {id: "estimate-edit", width: 147}, {id: "taken-edit", width: 147},
      {id: "aggregate", width: 147}, {id: "hidden-times", width: 147},
      {id: "paused-baseline", width: 226}, {id: "paused-estimate-edit", width: 226}, {id: "paused-taken-edit", width: 226},
    ];
    return <main style={{display: "grid", gridTemplateColumns: "repeat(4, max-content)", gap: 12, padding: 12}}>
      {cases.map(item => <div key={item.id} data-narrow-metric-case={item.id} style={{width: item.width}}>
        <TaskCard task={item.id === "long-times" ? {...task, estSeconds: 3_600_000, timeTakenSeconds: "18446744073709551615"} : task}
          aggregateView={item.id === "aggregate"} onTitleEdit={noop} onScheduleEdit={noop}
          onEstimateEdit={noop} onTimeTakenEdit={noop} hideTaskTimes={item.id === "hidden-times"}
          liveState={item.id.startsWith("paused-") ? "paused" : undefined}
          metricEditor={item.id.endsWith("-edit") ? {metric: item.id.includes("estimate-edit") ? "estimate" : "time_taken",
            value: "1:23:45", pending: false, onChange: noop, onCancel: noop, onSubmit: noop} : undefined} />
      </div>)}
    </main>;
  }
  if (board) {
    const task: ListBoardTask = {id: taskId, listId, listTitle: "Test", listColor: null,
      title: "Readable planning task title", estSeconds: null, timeTakenSeconds: "0",
      subtaskTotalCount: 0, subtaskCompletedCount: 0, scheduledLocalDate: null,
      scheduledLocalTime: null, isOverdue: false, completedAt: null};
    return <main className="list-board">
      {[144, 340].map(width => <div id={`card-${width}`} key={width} style={{width, margin: 12}}>
        <TaskCard task={task} aggregateView fixtureState="normal" onTitleEdit={() => {}} />
      </div>)}
      <div id="card-edit" style={{width: 144, margin: 12}}><TaskCard task={task} aggregateView
        titleEditor={{value: task.title, pending: false, onChange: () => {}, onCancel: () => {}, onSubmit: () => {}}} /></div>
    </main>;
  }
  if (timerGeometry) return <main className="floating-timer-foundation" data-floating-expanded="false"
    data-floating-region-expanded="false" data-floating-resize-phase="idle" style={{width: 340}}>
    <div className="floating-timer-foundation__content">
      <div className="floating-timer-foundation__heading"><strong>Stable task</strong><span>08:11</span></div>
      <div className="floating-timer-foundation__actions"><button>Break</button><button>Notes</button></div>
      <div>Subtasks</div>
    </div>
  </main>;
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
      {panel ? <div style={{padding: 12}}><div className="focus-panel__notes">{notes}</div></div>
        : <div className="floating-timer-foundation" data-floating-expanded="true"
            data-floating-region-expanded="true" data-floating-resize-phase="idle">
          <div className="floating-timer-foundation__content"><div className="floating-timer-foundation__notes">{notes}</div></div>
        </div>}
    </section>
  </main>;
}
const root = find<HTMLElement>("#root");
const result: Record<string, unknown> = {theme, scenario, reducedMotion};
if (scenario === "finding28-post-drag") {
  try {
    const { mountFinding28PostDragFixture } = await import("./finding28PostDragFixture");
    await mountFinding28PostDragFixture(root);
    result.finding28FixtureMounted = true;
  } catch (error: unknown) {
    document.documentElement.dataset.finding28FixtureError =
      error instanceof Error ? error.message : String(error);
    throw error;
  }
} else if (scenario === "m7-integration") {
  const { runM7IntegrationRegression } = await import("./m7IntegrationRegression");
  Object.assign(result, await runM7IntegrationRegression(root));
} else if (scenario === "shortcut-modal") {
  const { runShortcutModalRegression } = await import("./shortcutModalRegression");
  Object.assign(result, await runShortcutModalRegression(root));
} else {
flushSync(() => createRoot(root).render(<Fixture />));
if (boardMetrics) {
  await wait(40);
  const samples = [];
  for (const item of document.querySelectorAll<HTMLElement>('[data-narrow-metric-case]')) {
    const card = item.querySelector<HTMLElement>('article')!;
    const controls = Array.from(card.querySelectorAll<HTMLElement>('.list-board-task__meta, .list-board-task__times, .list-board-task__metric, .list-board-task__schedule-trigger'));
    const before = controls.map(control => control.getBoundingClientRect().toJSON());
    const bounds = card.getBoundingClientRect();
    for (const control of controls) {
      const rect = control.getBoundingClientRect();
      assert(rect.left >= bounds.left && rect.right <= bounds.right + 0.5, item.dataset.narrowMetricCase + ': metric/schedule escapes card');
      assert(control.scrollWidth <= control.clientWidth + 1, item.dataset.narrowMetricCase + ': text/input overflows metric');
    }
    const metrics = card.querySelectorAll<HTMLElement>('.list-board-task__metric');
    const first = metrics[0].getBoundingClientRect(), second = metrics[1].getBoundingClientRect();
    assert(first.right <= second.left + 0.5 || first.bottom <= second.top + 0.5, 'Metric targets overlap');
    const schedule = card.querySelector<HTMLButtonElement>('.list-board-task__schedule-trigger');
    if (schedule) schedule.focus(); else card.querySelector<HTMLButtonElement>('button')!.focus();
    card.dataset.taskCardState = 'action_revealed';
    await wait(30);
    assert(JSON.stringify(before) === JSON.stringify(controls.map(control => control.getBoundingClientRect().toJSON())), 'Hover/focus changed metric target geometry');
    assert(card.scrollWidth <= card.clientWidth + 1, item.dataset.narrowMetricCase + ': card has horizontal overflow ' + JSON.stringify({card: [card.clientWidth, card.scrollWidth], nodes: Array.from(card.querySelectorAll<HTMLElement>('*')).filter(node => node.getBoundingClientRect().right > bounds.right + 0.5).map(node => ({class: node.className, text: node.textContent?.slice(0,40), rect: node.getBoundingClientRect().toJSON(), visibility: getComputedStyle(node).visibility}))}));
    samples.push({case: item.dataset.narrowMetricCase, width: bounds.width, controls: before});
  }
  result.metricCases = samples;
  const pausedHeight = find<HTMLElement>('[data-narrow-metric-case="paused-baseline"] article').getBoundingClientRect().height;
  for (const id of ["paused-estimate-edit", "paused-taken-edit"]) {
    const editCard = find<HTMLElement>(`[data-narrow-metric-case="${id}"] article`);
    assert(editCard.getBoundingClientRect().height === pausedHeight, 'Opening metric editor changed reserved card height ' + JSON.stringify({id, before: pausedHeight, after: editCard.getBoundingClientRect().height, title: editCard.querySelector('.list-board-task__title-row')?.getBoundingClientRect().toJSON(), meta: editCard.querySelector('.list-board-task__meta')?.getBoundingClientRect().toJSON()}));
  }
  result.metricEditingHeightStable = true;
  result.metricsContained = result.metricTargetsDoNotOverlap = result.metricGeometryStable = result.metricTextContained = true;
} else if (board) {
  await wait(40);
  for (const width of [144, 340]) {
    const card = find<HTMLElement>(`#card-${width} article`);
    const title = card.querySelector<HTMLElement>('.list-board-task__title')!;
    const rail = card.querySelector<HTMLElement>('.list-board-task__action-slot')!;
    const before = title.getBoundingClientRect();
    assert(before.width >= 60, 'Planning title collapsed at card width ' + width);
    card.dataset.taskCardState = 'action_revealed';
    title.focus();
    await wait(30);
    const after = title.getBoundingClientRect(), bounds = card.getBoundingClientRect();
    assert(JSON.stringify(before.toJSON()) === JSON.stringify(after.toJSON()), 'Hover/focus moved planning title');
    assert(rail.getBoundingClientRect().left >= bounds.left && rail.getBoundingClientRect().right <= bounds.right, 'Narrow action rail escaped card');
    result[`titleWidth${width}`] = before.width;
  }
  const input = find<HTMLInputElement>('#card-edit input');
  const cardBounds = find<HTMLElement>('#card-edit article').getBoundingClientRect();
  assert(input.getBoundingClientRect().width >= 60 && input.getBoundingClientRect().right <= cardBounds.right, 'Narrow title editor collapsed');
  result.readableTitles = result.stableTitleGeometry = result.actionRailContained = result.editInputContained = true;
} else if (timerGeometry) {
  const timer = find<HTMLElement>('.floating-timer-foundation');
  await wait(30);
  timer.dataset.floatingExpanded = 'true';
  timer.dataset.floatingResizePhase = 'prepainting';
  await wait(20);
  result.initialClipAtomic = getComputedStyle(timer).transitionDuration === '0s'
    && getComputedStyle(timer).clipPath.includes('190px') && timer.getAnimations().length === 0;
  assert(result.initialClipAtomic, 'Initial expanded clip animates before native region grows');
  const heading = find<HTMLElement>('.floating-timer-foundation__heading');
  result.prepaintHeaderOpaque = heading.contains(document.elementFromPoint(30, 14));
  assert(result.prepaintHeaderOpaque, 'Nested containing block exposes actions above prepaint heading');
  timer.dataset.floatingRegionExpanded = 'true';
  timer.dataset.floatingResizePhase = 'revealing-start';
  assert(getComputedStyle(timer).transitionDuration === '0s', 'Reveal start did not establish initial clip atomically');
  timer.dataset.floatingResizePhase = 'revealing';
  await wait(20);
  result.finiteRevealRetained = parseFloat(getComputedStyle(timer).transitionDuration) > 0;
  assert(result.finiteRevealRetained, 'Finite geometry reveal was removed');
  const actions = find<HTMLElement>('.floating-timer-foundation__actions');
  result.expandedHeadingAboveActions = heading.getBoundingClientRect().bottom <= actions.getBoundingClientRect().top;
  assert(result.expandedHeadingAboveActions, 'Settled expanded heading overlaps actions');
  result.reducedMotionRespected = !reducedMotion || parseFloat(getComputedStyle(timer).transitionDuration) <= 0.001;
  assert(result.reducedMotionRespected, 'Reduced reveal retains normal duration');
} else if (motion) {
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
  if (reducedMotion) {
    result.reducedMotionRespected = getComputedStyle(incoming).transitionDuration.split(',').every(duration => parseFloat(duration) <= 0.001)
      && getComputedStyle(incoming).transform === 'none';
    assert(result.reducedMotionRespected, "Reduced-motion presentation retained decorative movement");
  }
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
  const presentation = find<HTMLButtonElement>('[data-task-note-control="presentation"]');
  const toolbar = find<HTMLElement>('.task-notes__toolbar');
  toolbar.style.width = '230px';
  result.presentationWrappedLeft = presentation.getBoundingClientRect().top
    > find<HTMLElement>('[data-task-note-control="format"]').getBoundingClientRect().top;
  assert(result.presentationWrappedLeft, 'Fixture did not reproduce wrapped-left presentation button');
  const tooltip = presentation.parentElement!.querySelector<HTMLElement>('[role="tooltip"]')!;
  getComputedStyle(tooltip).opacity;
  const tooltipOpened = new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => { observer.disconnect(); reject(new Error("Keyboard tooltip did not open")); }, 1000);
    const observer = new MutationObserver(() => {
      if (tooltip.dataset.open !== 'true') return;
      getComputedStyle(tooltip).opacity;
      result.reducedMotionRespected = getComputedStyle(tooltip).transitionDuration.split(',').every(duration => parseFloat(duration) <= 0.001)
        && getComputedStyle(tooltip).transform === 'none';
      result.tooltipTransitionRetained = reducedMotion ? result.reducedMotionRespected
        : tooltip.getAnimations().some(animation => animation instanceof CSSTransition && animation.transitionProperty === 'opacity');
      result.tooltipOpenedFromKeyboard = getComputedStyle(tooltip).visibility === 'visible';
      const bounds = tooltip.getBoundingClientRect();
      const boundary = inline.getBoundingClientRect();
      result.tooltipContained = bounds.left >= boundary.left && bounds.right <= boundary.right
        && bounds.left >= 0 && bounds.right <= 340 && wrapper.scrollWidth <= wrapper.clientWidth;
      observer.disconnect(); window.clearTimeout(timeout); resolve();
    });
    observer.observe(tooltip, {attributes: true, attributeFilter: ['data-open']});
  });
  presentation.focus();
  await tooltipOpened;
  assert(result.tooltipTransitionRetained, "Notes tooltip opening lost its opacity transition");
  assert(result.tooltipOpenedFromKeyboard && result.tooltipContained, "Keyboard tooltip escaped the Notes width");
  presentation.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true}));
  await wait(20);
  result.tooltipEscapeClosed = tooltip.dataset.open === 'false';
  assert(result.tooltipEscapeClosed, "Escape did not close keyboard tooltip");
  toolbar.style.width = '';
  input.focus();
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
}
const node = document.createElement('script');
node.id = 'focus-editor-contract'; node.type = 'application/json'; node.textContent = JSON.stringify(result);
document.body.append(node);
document.documentElement.dataset.focusEditorFixtureReady = 'true';
