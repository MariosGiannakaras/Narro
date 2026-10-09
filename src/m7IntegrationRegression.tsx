import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { useState } from "react";
import { FloatingTimerFoundation } from "./FloatingTimerFoundation";
import { FocusPanel } from "./FocusPanel";
import { ListBoard } from "./ListBoard";
import { createListFromEditor, updateListFromEditor, duplicateListFromHome } from "./listEditorApi";
import { archiveListFromSettings, restoreListFromSettings, permanentlyDeleteListFromSettings } from "./listSettingsApi";
import { emitBoardInvalidated } from "./boardInvalidation";
import type { ListBoardRequestTarget, ListBoardTask, ListBoardSnapshot } from "./listBoardApi";
import type { TimerSessionPayload } from "./timerSessionApi";

// Render production components and call production APIs; replace only native
// IPC/storage. Assertions cover observable results and adverse response order.
export async function runM7IntegrationRegression(container: HTMLElement) {
  const assert = (value: unknown, text: string) => { if (!value) throw new Error("M7 projection: " + text); };
  const wait = () => new Promise<void>(resolve => setTimeout(resolve, 25));
  const id = "21111111-1111-4111-8111-111111111111";
  let lists = [{ id, title: "Original" }];
  const tasks: ListBoardTask[] = Array.from({ length: 12 }, (_, index) => ({
    id: `31111111-1111-4111-8111-${String(index + 1).padStart(12, "0")}`,
    listId: id, listTitle: "Original", listColor: null, title: index === 11
      ? "M7 PR233 CI948 LongUnbrokenTitleForNarrowMetricAndQueuedBadgeValidation1234567890"
      : `Queue task ${index + 1} with long readable title`,
    estSeconds: null, timeTakenSeconds: "0", subtaskTotalCount: 0, subtaskCompletedCount: 0,
    scheduledLocalDate: null, scheduledLocalTime: null, isOverdue: false, completedAt: null,
  }));
  const timer: TimerSessionPayload = { revision: 1, awaitingResume: false, change: null,
    runtime: { open_session_id: null, timer: { state: "idle", task_id: null,
      mode: null, work_elapsed_ms: 0, total_break_ms: 0, countdown_remaining_ms: null,
      overtime_ms: 0, break_kind: null, break_remaining_ms: null } } };

  const scopeListId = "41111111-1111-4111-8111-111111111111";
  const otherListId = "41111111-1111-4111-8111-222222222222";
  const scopedLiveTask: ListBoardTask = {
    ...tasks[0], id: "51111111-1111-4111-8111-111111111111",
    listId: scopeListId, listTitle: "Scoped", title: "Scoped live task", timeTakenSeconds: "12",
  };
  const scopedNextTask: ListBoardTask = {
    ...tasks[1], id: "51111111-1111-4111-8111-111111111112",
    listId: scopeListId, listTitle: "Scoped", title: "Scoped next task",
  };
  const globalOldTask: ListBoardTask = {
    ...tasks[2], id: "51111111-1111-4111-8111-999999999999",
    listId: otherListId, listTitle: "Other", title: "Global old task",
  };
  let scopeScenario = false;
  let scopeCompleted = false;
  let scopeBoardReads: Array<string | null> = [];
  let scopeTimer: TimerSessionPayload = {
    revision: 50,
    awaitingResume: false,
    change: null,
    runtime: {
      open_session_id: "scope-session",
      timer: {
        state: "running",
        task_id: scopedLiveTask.id,
        mode: { kind: "count_up" },
        work_elapsed_ms: 12_000,
        total_break_ms: 0,
        countdown_remaining_ms: null,
        overtime_ms: 0,
        break_kind: null,
        break_remaining_ms: null,
      },
    },
  };
  const scopeBoard = (target: ListBoardRequestTarget): ListBoardSnapshot => {
    const listScoped = target.kind === "list";
    const todayTasks = scopeCompleted
      ? (listScoped ? [scopedNextTask] : [globalOldTask, scopedNextTask])
      : (listScoped ? [scopedLiveTask, scopedNextTask] : [globalOldTask, scopedLiveTask, scopedNextTask]);
    return {
      target: listScoped
        ? { kind: "list", id: target.id, title: "Scoped", color: null }
        : { kind: "all_lists", id: null, title: "All Lists", color: null },
      displayTimezone: "Europe/Athens",
      backlog: { tasks: [], count: 0, aggregateEstSeconds: 0 },
      thisWeek: { tasks: [], count: 0, aggregateEstSeconds: 0 },
      today: { tasks: todayTasks, count: todayTasks.length, aggregateEstSeconds: 0 },
      done: {
        tasks: scopeCompleted ? [{ ...scopedLiveTask, completedAt: "2026-10-06T09:00:00Z" }] : [],
        count: scopeCompleted ? 1 : 0,
        aggregateEstSeconds: 0,
      },
      todayCompletionCount: scopeCompleted ? 1 : 0,
      doneMonthCompletionCount: scopeCompleted ? 1 : 0,
    };
  };

  let boardTasks = [...tasks];
  const taskLanes = new Map<string, "backlog" | "thisWeek" | "today">();
  const laneTasks = (lane: "backlog" | "thisWeek" | "today") => boardTasks.filter(task => (taskLanes.get(task.id) ?? "today") === lane);
  const laneSnapshot = (lane: "backlog" | "thisWeek" | "today") => ({tasks: laneTasks(lane), count: laneTasks(lane).length, aggregateEstSeconds: 0});
  const board = (target: { kind: string; id?: string }): ListBoardSnapshot => ({
    target: target.kind === "list" ? { kind: "list", id: target.id!, title: "Original", color: null }
      : { kind: "all_lists", id: null, title: "All Lists", color: null },
    displayTimezone: "Europe/Athens",
    backlog: laneSnapshot("backlog"), thisWeek: laneSnapshot("thisWeek"), today: laneSnapshot("today"),
    done: { tasks: [], count: 0, aggregateEstSeconds: 0 }, todayCompletionCount: 0, doneMonthCompletionCount: 0,
  });
  const callbacks = new Map<number, (value: unknown) => void>();
  const listeners = new Map<number, { event: string; handler: number }>();
  let callbackId = 0, homeReads = 0, emissions = 0, mutationFailure = false, deliveryFailure = false;
  let deferHome = false, deleteFailure = false, deleteCalls = 0;
  const homeWaiters: Array<(value: unknown) => void> = [];
  let deferredDelete: (() => void) | undefined;
  const dragCalls: Array<Record<string, unknown>> = [];
  const native = window as unknown as {
    __TAURI_INTERNALS__: { transformCallback: (callback: (value: unknown) => void) => number;
      invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> };
    __TAURI_EVENT_PLUGIN_INTERNALS__: { unregisterListener: (event: string, id: number) => void };
  };
  native.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener: (_event, listener) => { listeners.delete(listener); } };
  native.__TAURI_INTERNALS__ = {
    transformCallback(callback) { callbacks.set(++callbackId, callback); return callbackId; },
    async invoke(command, args = {}) {
      if (command === "plugin:event|listen") {
        const handler = Number(args.handler); listeners.set(handler, { event: String(args.event), handler }); return handler;
      }
      if (command === "plugin:event|emit") {
        emissions++;
        if (deliveryFailure) throw new Error("secondary notification failed");
        for (const listener of [...listeners.values()]) if (listener.event === args.event) {
          callbacks.get(listener.handler)!({ event: listener.event, id: listener.handler, payload: null });
        }
        return;
      }
      if (command.startsWith("plugin:event|")) return;
      if (command === "get_home_snapshot") {
        homeReads++;
        if (deferHome) return new Promise(resolve => homeWaiters.push(resolve));
        if (scopeScenario) return {
          lists: [{ id: scopeListId, title: "Scoped" }, { id: otherListId, title: "Other" }],
          pendingCount: scopeBoard({ kind: "all" }).today.count,
          aggregateEstSeconds: 0,
        };
        return { lists: [...lists], pendingCount: boardTasks.length, aggregateEstSeconds: 0 };
      }
      if (command === "get_preference_settings") return {
        general: { hideTaskTimes: false },
        focus: { scrollingTitle: false },
        celebration: { showSuccessScreen: scopeScenario },
      };
      if (command === "get_archived_lists_for_settings") return { lists: [], doneTasks: [], filterLists: [] };
      if (command === "get_list_board_snapshot") {
        if (scopeScenario) {
          const requested = args.listId
            ? { kind: "list", id: String(args.listId) } as ListBoardRequestTarget
            : { kind: "all" } as ListBoardRequestTarget;
          scopeBoardReads.push(requested.kind === "list" ? requested.id : null);
          return scopeBoard(requested);
        }
        return board(args.listId ? { kind: "list", id: String(args.listId) } : { kind: "all" });
      }
      if (command === "timer_session_snapshot") return scopeScenario ? scopeTimer : timer;
      if (command === "timer_resume" && scopeScenario) {
        scopeTimer = {
          ...scopeTimer,
          revision: scopeTimer.revision + 1,
          change: null,
          runtime: {
            ...scopeTimer.runtime,
            timer: { ...scopeTimer.runtime.timer, state: "running" },
          },
        };
        return scopeTimer;
      }
      if (command === "timer_extend" && scopeScenario) {
        scopeTimer = {
          ...scopeTimer,
          revision: scopeTimer.revision + 1,
          change: null,
          runtime: {
            ...scopeTimer.runtime,
            timer: {
              ...scopeTimer.runtime.timer,
              state: "overtime_running",
              countdown_remaining_ms: null,
              overtime_ms: 0,
            },
          },
        };
        return scopeTimer;
      }
      if (command === "timer_complete_task" && scopeScenario) {
        scopeCompleted = true;
        scopeTimer = {
          revision: scopeTimer.revision + 1,
          awaitingResume: false,
          change: { type: "task_completed", task_id: scopedLiveTask.id, closed_session_id: "scope-session" },
          runtime: {
            open_session_id: null,
            timer: {
              state: "idle", task_id: null, mode: null, work_elapsed_ms: 0, total_break_ms: 0,
              countdown_remaining_ms: null, overtime_ms: 0, break_kind: null, break_remaining_ms: null,
            },
          },
        };
        return scopeTimer;
      }
      if (command === "move_list_board_task" || command === "reorder_list_board_task") {
        dragCalls.push({command, ...args});
        const task = boardTasks.find(task => task.id === args.taskId)!;
        assert(task && args.listId === id && task.scheduledLocalDate === null, "invalid drag mutation");
        const lane = String(args.targetLane ?? args.sourceLane).replace("this_week", "thisWeek") as "backlog" | "thisWeek" | "today";
        taskLanes.set(task.id, lane);
        boardTasks = boardTasks.filter(other => other.id !== task.id);
        const before = args.beforeTaskId ? boardTasks.findIndex(other => other.id === args.beforeTaskId) : -1;
        boardTasks.splice(before < 0 ? boardTasks.length : before, 0, task);
        return;
      }
      if (command === "permanently_delete_list_board_task") {
        deleteCalls++;
        if (deleteFailure) throw new Error("controlled delete failure");
        return new Promise<void>(resolve => {
          deferredDelete = () => {
            boardTasks = boardTasks.filter(task => task.id !== args.taskId); resolve();
          };
        });
      }
      if (/^(create_list_from_editor|update_list_from_editor|duplicate_list_from_home|archive_list_from_settings|restore_list_from_settings|permanently_delete_list_from_settings)$/.test(command)) {
        if (mutationFailure) throw new Error("controlled persistence failure");
        if (command === "create_list_from_editor") lists.push({ id: "new", title: "New" });
        if (command === "update_list_from_editor") lists = lists.map(list => list.id === args.listId ? { ...list, title: "Renamed" } : list);
        if (command === "duplicate_list_from_home") lists.push({ id: "copy", title: "Independent copy" });
        if (command === "archive_list_from_settings" || command === "permanently_delete_list_from_settings") lists = lists.filter(list => list.id !== args.listId);
        if (command === "restore_list_from_settings") lists.push({ id: String(args.listId), title: "Restored" });
        return;
      }
      throw new Error("Unexpected native command: " + command);
    },
  };
  const root = createRoot(container);
  const renderFocus = (refreshKey = 0, presentationActive = true) => flushSync(() => root.render(
    <FocusPanel refreshKey={refreshKey} presentationActive={presentationActive}
      sharedTimerProjection={{ payload: timer, settled: true }} />));
  const selector = () => container.querySelector<HTMLSelectElement>('[data-focus-list-selector="true"]')!;
  const options = () => Array.from(selector().options).map(option => option.textContent);
  renderFocus(); await wait(); await wait();
  assert(options().includes("Original"), "initial active catalog missing");
  const request = { title: "New", color: null, iconUpload: null };
  const operations = [
    () => createListFromEditor(request), () => updateListFromEditor("new", request),
    () => duplicateListFromHome(id), () => archiveListFromSettings("copy"),
    () => restoreListFromSettings("copy"), () => permanentlyDeleteListFromSettings("copy"),
  ];
  for (const operation of operations) {
    const before = emissions; await operation(); await wait();
    assert(emissions === before + 1, "committed list mutation did not emit exactly once");
    assert(options().filter(label => label !== "All").join("|") === lists.map(list => list.title).join("|"), "committed catalog remained stale");
  }
  mutationFailure = true;
  const beforeFailure = emissions;
  let rejected = false; try { await createListFromEditor(request); } catch { rejected = true; }
  assert(rejected && emissions === beforeFailure, "failed persistence falsely invalidated/reported success");
  mutationFailure = false; deliveryFailure = true;
  await updateListFromEditor("new", request); // Commit must remain success if secondary broadcast fails.
  deliveryFailure = false;
  renderFocus(1, false); await wait(); renderFocus(2, true); await wait();
  assert(options().includes("Renamed"), "Focus entry did not reconcile missed hint");
  deferHome = true; await emitBoardInvalidated(); await emitBoardInvalidated();
  assert(homeWaiters.length === 2, "stale-response exercise did not produce two reads");
  const newest = { lists: [...lists, { id: "latest", title: "Latest catalog" }] };
  homeWaiters[1](newest); await wait(); homeWaiters[0]({ lists: [{ id, title: "Stale" }] }); await wait();
  assert(options().includes("Latest catalog") && !options().includes("Stale"), "older response overwrote committed catalog");
  deferHome = false;
  selector().value = id; selector().dispatchEvent(new Event("change", { bubbles: true })); await wait();
  await archiveListFromSettings(id); await wait(); await wait();
  assert(selector().value === "__all_lists__" && !options().includes("Original"), "archived selected list did not recover to All");
  await restoreListFromSettings(id); await wait();
  selector().value = id; selector().dispatchEvent(new Event("change", { bubbles: true })); await wait();
  await permanentlyDeleteListFromSettings(id); await wait(); await wait();
  assert(selector().value === "__all_lists__", "deleted selected list did not recover to All");
  const quietReads = homeReads; await wait(); await wait(); assert(homeReads === quietReads, "catalog polls without changes");

  const panel = container.querySelector<HTMLElement>('.focus-panel')!;
  const queue = container.querySelector<HTMLElement>('.focus-panel__queue')!;
  const header = container.querySelector<HTMLElement>('.focus-panel__topbar')!;
  const geometries = [];
  for (const zoom of [1, 1.25]) {
    panel.style.height = "700px"; panel.style.minHeight = "700px"; panel.style.zoom = String(zoom);
    queue.scrollTop = 0; await wait();
    const headerTop = header.getBoundingClientRect().top;
    assert(queue.scrollHeight > queue.clientHeight && queue.tabIndex === 0, "long queue has no accessible scroll region");
    queue.focus();
    assert(document.activeElement === queue, "queue cannot receive keyboard focus");
    queue.scrollTop = queue.scrollHeight; await wait();
    const articles = queue.querySelectorAll<HTMLElement>('article');
    const last = queue.querySelector<HTMLElement>('[data-focus-task-id="' + tasks[11].id + '"]')
      ?? articles[articles.length - 1];
    assert(last.getBoundingClientRect().bottom <= queue.getBoundingClientRect().bottom + 1, "last task/actions remain inaccessible");
    assert(header.getBoundingClientRect().top === headerTop, "scroll moved fixed header");
    const more = last.querySelector<HTMLButtonElement>('[data-focus-row-action="more"]')!;
    more.focus(); more.click(); await wait();
    const menuButtons = last.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    assert(menuButtons.length === 4, "last row menu controls missing");
    assert(
      Array.from(menuButtons, (button) => button.textContent?.trim()).join("|")
        === "Schedule|Change list|Duplicate|Delete",
      "last row menu order diverged from the Focus source grammar",
    );
    menuButtons[3].focus(); await wait();
    assert(menuButtons[3].getBoundingClientRect().bottom <= queue.getBoundingClientRect().bottom + 1,
      "last row menu action cannot be reached through focus scrolling");
    assert(header.getBoundingClientRect().top === headerTop, "menu navigation moved fixed header");
    more.click(); await wait();
    assert(queue.scrollWidth <= queue.clientWidth + 1 && getComputedStyle(queue).overflowY === "auto"
      && getComputedStyle(queue).overflowX === "hidden", "queue scroll/overflow bounds wrong "
      + JSON.stringify({ zoom, scrollWidth: queue.scrollWidth, clientWidth: queue.clientWidth, y: getComputedStyle(queue).overflowY,
        excess: Array.from(queue.querySelectorAll<HTMLElement>('*')).filter(node => node.getBoundingClientRect().right > queue.getBoundingClientRect().right + 1)
          .slice(0, 8).map(node => ({ tag: node.tagName, class: node.className, right: node.getBoundingClientRect().right, text: node.textContent?.slice(0, 40) })) }));
    geometries.push({ zoom, scrollHeight: queue.scrollHeight, clientHeight: queue.clientHeight, lastBottom: last.getBoundingClientRect().bottom });
  }
  panel.style.zoom = "1";
  // A disposed in-flight response must not become the next mount's catalog.
  deferHome = true; await emitBoardInvalidated();
  const disposedRead = homeWaiters[homeWaiters.length - 1];
  flushSync(() => root.render(<div>Disposed Focus</div>)); await wait();
  disposedRead({ lists: [{ id: "disposed", title: "Disposed" }] }); await wait(); deferHome = false;

  // Finding36 regression: the queue/list target must outlive the Panel subtree,
  // and Floating Done/success must compute Next Task from that target rather
  // than the global All-list board.
  lists = [{ id, title: "Original" }];
  function FocusScopeOwner({ visible }: { visible: boolean }) {
    const [ownedTarget, setOwnedTarget] = useState<ListBoardRequestTarget>({ kind: "all" });
    return visible ? (
      <FocusPanel
        target={ownedTarget}
        onTargetChange={setOwnedTarget}
        sharedTimerProjection={{ payload: timer, settled: true }}
      />
    ) : <div data-focus-scope-owner-hidden="true" />;
  }
  const renderScopeOwner = (visible: boolean) =>
    flushSync(() => root.render(<FocusScopeOwner visible={visible} />));
  renderScopeOwner(true); await wait(); await wait();
  selector().value = id; selector().dispatchEvent(new Event("change", { bubbles: true })); await wait(); await wait();
  assert(selector().value === id, "controlled Focus target did not commit selected list");
  renderScopeOwner(false); await wait();
  renderScopeOwner(true); await wait(); await wait();
  assert(selector().value === id, "coordinator-owned Focus target did not survive Panel remount");
  lists = [];
  await emitBoardInvalidated(); await wait(); await wait();
  assert(selector().value === "__all_lists__", "invalid controlled Focus target did not fall back through owner to All");

  scopeScenario = true;
  scopeCompleted = false;
  scopeBoardReads = [];
  delete container.dataset.scopeSuccessNextTaskId;
  scopeTimer = {
    revision: 50,
    awaitingResume: false,
    change: null,
    runtime: {
      open_session_id: "scope-session",
      timer: {
        state: "running", task_id: scopedLiveTask.id, mode: { kind: "count_up" },
        work_elapsed_ms: 12_000, total_break_ms: 0, countdown_remaining_ms: null,
        overtime_ms: 0, break_kind: null, break_remaining_ms: null,
      },
    },
  };
  flushSync(() => root.render(
    <FloatingTimerFoundation
      onReturnToPanel={() => {}}
      focusTarget={{ kind: "list", id: scopeListId }}
      sharedTimerProjection={{ payload: scopeTimer, settled: true }}
      presentationActive
      controlledExpanded
      onRequestExpanded={async () => {}}
      onCompletionSuccess={(state) => { container.dataset.scopeSuccessNextTaskId = state.nextTask?.id ?? ""; }}
    />,
  ));
  await wait(); await wait(); await wait();
  const scopedDone = container.querySelector<HTMLButtonElement>('[data-floating-action="done"]');
  if (!scopedDone || scopedDone.disabled) throw new Error("scoped Floating Done action unavailable");
  scopedDone.click();
  await wait(); await wait(); await wait(); await wait();
  const scopedSuccessNextTaskId = container.dataset.scopeSuccessNextTaskId;
  if (scopedSuccessNextTaskId === undefined) throw new Error("scoped completion success was not published");
  assert(scopedSuccessNextTaskId === scopedNextTask.id,
    "success Next Task escaped selected Focus queue: " + scopedSuccessNextTaskId);
  assert(scopedSuccessNextTaskId !== globalOldTask.id,
    "success Next Task selected global older task");
  assert(scopeBoardReads.filter(listId => listId === scopeListId).length >= 2,
    "Done/success did not refresh selected Focus target: " + JSON.stringify(scopeBoardReads));

  // Finding35 regression: a prior local success message must not survive the
  // authoritative automatic transition into Time's Up, and Floating must expose
  // the same Extend mutation already available in Panel.
  flushSync(() => root.render(<div data-finding35-reset="true" />)); await wait();
  scopeCompleted = false;
  scopeTimer = {
    revision: 70,
    awaitingResume: false,
    change: null,
    runtime: {
      open_session_id: "scope-session-time-up",
      timer: {
        state: "paused", task_id: scopedLiveTask.id,
        mode: { kind: "est_countdown", est_ms: 60_000 },
        work_elapsed_ms: 59_000, total_break_ms: 0, countdown_remaining_ms: 1_000,
        overtime_ms: 0, break_kind: null, break_remaining_ms: null,
      },
    },
  };
  const renderFinding35Floating = () => flushSync(() => root.render(
    <FloatingTimerFoundation
      onReturnToPanel={() => {}}
      focusTarget={{ kind: "list", id: scopeListId }}
      sharedTimerProjection={{ payload: scopeTimer, settled: true }}
      presentationActive
      controlledExpanded
      onRequestExpanded={async () => {}}
    />,
  ));
  renderFinding35Floating(); await wait(); await wait(); await wait();
  const resume = container.querySelector<HTMLButtonElement>('[data-floating-action="pause-resume"]');
  if (!resume || resume.disabled) throw new Error("finding35 Floating Resume action unavailable");
  resume.click(); await wait(); await wait(); await wait();
  assert(container.textContent?.includes("Task resumed."), "finding35 precondition did not publish resumed status");

  scopeTimer = {
    ...scopeTimer,
    revision: scopeTimer.revision + 1,
    runtime: {
      ...scopeTimer.runtime,
      timer: {
        ...scopeTimer.runtime.timer,
        state: "time_up",
        countdown_remaining_ms: 0,
        overtime_ms: 0,
      },
    },
  };
  renderFinding35Floating(); await wait(); await wait(); await wait();
  const timerReadout = container.querySelector<HTMLElement>('[data-floating-live-timer="true"]');
  const breakAction = container.querySelector<HTMLButtonElement>('[data-floating-action="break"]');
  const pauseAction = container.querySelector<HTMLButtonElement>('[data-floating-action="pause-resume"]');
  const skipAction = container.querySelector<HTMLButtonElement>('[data-floating-action="skip"]');
  const extendAction = container.querySelector<HTMLButtonElement>('[data-floating-action="extend"]');
  const doneAction = container.querySelector<HTMLButtonElement>('[data-floating-action="done"]');
  assert(container.querySelector<HTMLElement>('[data-floating-timer="foundation"]')?.dataset.floatingLiveState === "time_up",
    "finding35 Floating did not project authoritative Time's Up state");
  assert(timerReadout?.textContent?.trim() === "00:00" && timerReadout.getAttribute("aria-label") === "Time's Up",
    "finding35 Floating Time's Up readout mismatch");
  const timeUpActions = container.querySelectorAll<HTMLButtonElement>('[data-floating-action]');
  assert(Boolean(breakAction?.disabled) && pauseAction === null,
    "finding35 Time's Up retained a Pause/Resume slot instead of replacing it with Extend");
  assert(timeUpActions.length === 6,
    "finding35 Time's Up changed the fixed six-slot Floating action geometry");
  assert(Array.from(timeUpActions, action => action.dataset.floatingAction).join(",")
      === "break,notes,extend,skip,done,return-to-panel",
    "finding35 Time's Up changed the fixed Floating action-slot order");
  assert(Boolean(skipAction && !skipAction.disabled) && Boolean(doneAction && !doneAction.disabled)
      && Boolean(extendAction && !extendAction.disabled),
    "finding35 Time's Up did not expose Skip/Done/Extend");
  assert(!container.textContent?.includes("Task resumed."),
    "finding35 stale resumed status survived authoritative Time's Up");
  extendAction!.click(); await wait(); await wait(); await wait();
  assert(scopeTimer.runtime.timer.state === "overtime_running",
    "finding35 Floating Extend did not call authoritative timer_extend");
  assert(container.querySelector<HTMLElement>('[data-floating-timer="foundation"]')?.dataset.floatingLiveState === "overtime_running",
    "finding35 Floating Extend did not project overtime");
  assert(container.querySelector<HTMLButtonElement>('[data-floating-action="extend"]') === null
      && Boolean(container.querySelector<HTMLButtonElement>('[data-floating-action="pause-resume"]')),
    "finding35 overtime did not restore the ordinary Pause/Resume slot");
  const overtimeActions = container.querySelectorAll<HTMLButtonElement>('[data-floating-action]');
  assert(overtimeActions.length === 6,
    "finding35 overtime changed the fixed six-slot Floating action geometry");
  assert(Array.from(overtimeActions, action => action.dataset.floatingAction).join(",")
      === "break,notes,pause-resume,skip,done,return-to-panel",
    "finding35 overtime did not restore the ordinary Floating action-slot order");

  scopeTimer = {
    ...scopeTimer,
    revision: scopeTimer.revision + 1,
    runtime: {
      ...scopeTimer.runtime,
      timer: {
        ...scopeTimer.runtime.timer,
        state: "time_up",
        countdown_remaining_ms: 0,
        overtime_ms: 0,
      },
    },
  };
  flushSync(() => root.render(
    <FocusPanel
      target={{ kind: "list", id: scopeListId }}
      onTargetChange={() => {}}
      sharedTimerProjection={{ payload: scopeTimer, settled: true }}
      presentationActive
    />,
  ));
  await wait(); await wait(); await wait();
  const panelBreak = container.querySelector<HTMLButtonElement>('[data-focus-action="break"]');
  const panelPause = container.querySelector<HTMLButtonElement>('[data-focus-action="pause-resume"]');
  const panelSkip = container.querySelector<HTMLButtonElement>('[data-focus-action="skip"]');
  const panelExtend = container.querySelector<HTMLButtonElement>('[data-focus-action="extend"]');
  const panelDone = container.querySelector<HTMLButtonElement>('[data-focus-action="done"]');
  assert(Boolean(panelBreak?.disabled) && !panelPause
      && Boolean(panelSkip && !panelSkip.disabled) && Boolean(panelExtend && !panelExtend.disabled)
      && Boolean(panelDone && !panelDone.disabled)
      && container.querySelector('[data-focus-primary-slot="extend"]') !== null,
    "finding35 Panel Time's Up must replace Pause with actionable Extend in the stable slot");
  scopeScenario = false;

  // Production pointer handlers, real rendered hit testing/placeholder reflow,
  // and actual production mutation APIs. Synthetic events are renderer-level
  // regression evidence, not a substitute for native WebView2 acceptance.
  lists = [{ id, title: "Original" }, { id: "other", title: "Other" }];
  const scheduled = {...tasks[3], scheduledLocalDate: "2026-10-06"};
  const renderBoard = (key: string) => flushSync(() => root.render(<ListBoard key={key} target={{kind:"list",id}} />));
  const shell = (taskId: string) => container.querySelector<HTMLElement>('[data-board-drag-task="' + taskId + '"]')!;
  const sendPointer = (element: EventTarget, type: string, x: number, y: number, pointerId = 7) =>
    element.dispatchEvent(new PointerEvent(type, {bubbles:true, cancelable:true, isPrimary:true, pointerId,
      pointerType:"mouse", button:0, buttons:type === "pointerup" ? 0 : 1, clientX:x, clientY:y}));
  const lift = async (taskId: string, targetNode?: HTMLElement) => {
    const source = shell(taskId);
    source.scrollIntoView({block:"nearest"}); await wait();
    const bounds = source.getBoundingClientRect();
    const x = bounds.left + 7, y = bounds.top + 7;
    sendPointer(targetNode ?? source,"pointerdown",x,y); await wait();
    sendPointer(window,"pointermove",x+12,y+12); await wait();
    return {x:x+12,y:y+12};
  };
  const releaseAt = async (x: number,y: number) => {
    sendPointer(window,"pointermove",x,y); await wait();
    sendPointer(window,"pointerup",x,y); sendPointer(window,"pointerup",x,y);
    await wait(); await wait(); await wait();
  };
  for (const zoom of [1,1.25]) {
    boardTasks = [tasks[0],tasks[1],tasks[2],scheduled]; taskLanes.clear();
    container.style.zoom = String(zoom); renderBoard("pointer-"+zoom); await wait(); await wait();
    const initialIds = boardTasks.map(task => task.id).sort().join("|");
    const count = dragCalls.length;
    await lift(tasks[0].id);
    const preview = document.querySelector<HTMLElement>('.list-board-task-drag-preview')!;
    assert(preview?.inert && preview.getAttribute('aria-hidden') === 'true'
      && shell(tasks[0].id).dataset.taskDragging === 'true'
      && container.querySelector('[data-task-drop-placeholder]'), "pointer lift/reflow/accessibility missing");
    const backlog = container.querySelector<HTMLElement>('[data-board-drop-lane="backlog"]')!.getBoundingClientRect();
    await releaseAt(backlog.left+backlog.width/2,backlog.top+backlog.height/2);
    assert(dragCalls.length === count+1 && taskLanes.get(tasks[0].id) === 'backlog'
      && dragCalls[count].taskId === tasks[0].id && !document.querySelector('.list-board-task-drag-preview'), "cross-lane drop not exactly once/cleaned");
    await lift(tasks[0].id);
    const returningAnchor = shell(tasks[1].id);
    const returnBeforeScroll = returningAnchor.getBoundingClientRect();
    document.scrollingElement!.scrollTop += returnBeforeScroll.top + returnBeforeScroll.height / 3 - window.innerHeight / 2;
    await wait();
    const today = returningAnchor.getBoundingClientRect();
    await releaseAt(today.left+today.width/2,today.top+today.height/3);
    assert(dragCalls.length === count+2 && taskLanes.get(tasks[0].id) === 'today', "return move failed "
      + JSON.stringify({zoom,count,calls:dragCalls.slice(count),target:today.toJSON(),height:window.innerHeight}));
    await lift(tasks[0].id);
    const reorderBeforeScroll = shell(tasks[1].id).getBoundingClientRect();
    document.scrollingElement!.scrollTop += reorderBeforeScroll.top + reorderBeforeScroll.height * 2 / 3 - window.innerHeight / 2;
    await wait();
    const first = shell(tasks[1].id).getBoundingClientRect();
    await releaseAt(first.left+first.width/2,first.top+first.height*2/3);
    assert(dragCalls.length === count+3 && dragCalls[count+2].command === 'reorder_list_board_task'
      && dragCalls[count+2].beforeTaskId === tasks[2].id
      && laneTasks('today').map(task => task.id).join('|') === [tasks[1].id,tasks[0].id,tasks[2].id,scheduled.id].join('|'), "same-lane positional reorder failed "
        + JSON.stringify({zoom, count, calls:dragCalls.slice(count), first:first.toJSON()}));
    assert(boardTasks.map(task => task.id).sort().join('|') === initialIds
      && boardTasks.every(task => task.timeTakenSeconds === '0'), "drag changed identities/tracked time");
    await lift(tasks[0].id);
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})); await wait();
    assert(dragCalls.length === count+3 && !document.querySelector('.list-board-task-drag-preview')
      && !container.querySelector('[data-task-drop-placeholder]'), "Escape drag cancellation mutated or leaked");
    for (const cancellation of ['pointercancel','blur','outside']) {
      await lift(tasks[0].id);
      if (cancellation === 'outside') await releaseAt(-5,-5);
      else window.dispatchEvent(cancellation === 'pointercancel'
        ? new PointerEvent('pointercancel',{pointerId:7}) : new Event('blur'));
      await wait();
      assert(dragCalls.length === count+3 && !document.querySelector('.list-board-task-drag-preview'), cancellation+" drag cancellation mutated or leaked");
    }
    const titleButton = shell(tasks[0].id).querySelector<HTMLElement>('[data-task-title-control]')!;
    const point = await lift(tasks[0].id,titleButton); await releaseAt(point.x,point.y);
    assert(dragCalls.length === count+3 && !document.querySelector('.list-board-task-drag-preview'), "interactive title began drag");
    const scheduledPoint = await lift(scheduled.id); await releaseAt(scheduledPoint.x,scheduledPoint.y);
    assert(dragCalls.length === count+3, "scheduled task became draggable");
    const shortSource = shell(tasks[0].id), shortBounds = shortSource.getBoundingClientRect();
    sendPointer(shortSource,'pointerdown',shortBounds.left+7,shortBounds.top+7);
    sendPointer(window,'pointermove',shortBounds.left+10,shortBounds.top+9);
    sendPointer(window,'pointerup',shortBounds.left+10,shortBounds.top+9); await wait();
    assert(dragCalls.length === count+3 && !document.querySelector('.list-board-task-drag-preview'), "below-threshold pointer movement mutated task");
    await lift(tasks[0].id);
    await emitBoardInvalidated(); await wait(); await wait();
    assert(dragCalls.length === count+3 && !document.querySelector('.list-board-task-drag-preview'), "external snapshot did not cancel stale drag");
    await lift(tasks[0].id);
    flushSync(() => root.render(<div>Disposed board</div>)); await wait();
    assert(dragCalls.length === count+3 && !document.querySelector('.list-board-task-drag-preview'), "unmount did not cancel drag");
    renderBoard('keyboard-'+zoom); await wait(); await wait();
    shell(tasks[0].id).dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',altKey:true,bubbles:true,cancelable:true}));
    await wait(); await wait(); await wait();
    assert(dragCalls.length === count+4 && dragCalls[count+3].command === 'reorder_list_board_task'
      && laneTasks('today')[0].id === tasks[0].id, "keyboard reorder regressed after pointer replacement");
  }
  container.style.zoom = "1"; taskLanes.clear();

  // Real ListBoard delete authority, not a presentation-only imitation.
  lists = [{ id, title: "Original" }, { id: "other", title: "Other" }]; boardTasks = [tasks[0], tasks[1]];
  renderBoard("delete"); await wait(); await wait();
  const actionTrigger = () => container.querySelector<HTMLButtonElement>('[aria-label="Task actions"]')!;
  const menu = () => container.querySelector<HTMLElement>('[role="menu"][data-open="true"]')!;
  const openDelete = async () => {
    actionTrigger().click(); await wait();
    const cardMetadata = Array.from(container.querySelectorAll<HTMLElement>('[data-board-task="task-card"]')).map(card => ({
      id: card.dataset.taskId, text: card.querySelector('.list-board-task__meta')!.textContent,
      height: card.getBoundingClientRect().height,
      metadataTop: card.querySelector('.list-board-task__meta')!.getBoundingClientRect().top,
    }));
    assert(Array.from(menu().querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).map(button => button.textContent).join("|")
      === "Schedule|Change List|Duplicate|Delete", "source menu order differs");
    const deletion = Array.from(menu().querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(button => button.textContent === "Delete")!;
    deletion.click(); await wait();
    await new Promise<void>(resolve => setTimeout(resolve, 250));
    assert(menu() && menu().querySelector('[data-task-delete-confirm="inline"]'), "confirmation left source menu container");
    assert(menu().textContent?.includes("Schedule") && menu().textContent?.includes("Change List") && menu().textContent?.includes("Duplicate"), "source sibling rows disappeared");
    assert(menu().querySelector('svg'), "trash glyph missing");
    const popup = menu();
    const bounds = popup.getBoundingClientRect();
    for (let y = bounds.top + 8; y < bounds.bottom - 8; y += 8) {
      for (let x = bounds.left + 8; x < bounds.right - 8; x += 12) {
        const hit = document.elementFromPoint(x, y);
        assert(hit && popup.contains(hit), "retained menu is occluded at " + JSON.stringify({ x, y, hit: hit?.outerHTML.slice(0, 160) }));
      }
    }
    for (const before of cardMetadata) {
      const card = container.querySelector<HTMLElement>('[data-task-id="' + before.id + '"]')!;
      assert(card.querySelector('.list-board-task__meta')!.textContent === before.text,
        "delete confirmation removed underlying task metadata");
      assert(Math.abs(card.getBoundingClientRect().height - before.height) <= 1
        && Math.abs(card.querySelector('.list-board-task__meta')!.getBoundingClientRect().top - before.metadataTop) <= 1,
        "delete confirmation reflowed underlying task card");
      assert(Array.from(card.querySelectorAll<HTMLButtonElement>('[data-task-title-control="open"], [data-task-metric-control="open"], [data-task-schedule-control="open"], [data-task-completion-control="complete"]'))
        .every(button => button.disabled), "retained task controls remain interactive during confirmation");
    }
    assert(document.activeElement === menu().querySelector('[data-task-delete-control="confirm"]'), "confirm keyboard focus missing: "
      + document.activeElement?.outerHTML.slice(0, 220));
  };
  for (const zoom of [1, 1.25]) {
    container.style.zoom = String(zoom); await wait();
    await openDelete();
    menu().querySelector<HTMLButtonElement>('[data-task-delete-control="cancel"]')!.click(); await wait();
    assert(deleteCalls === 0 && boardTasks.length === 2 && menu().textContent?.includes("Delete"), "cancel mutated task or failed to restore Delete row");
    menu().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); await wait();
  }
  container.style.zoom = "1";
  await openDelete();
  menu().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); await wait();
  assert(deleteCalls === 0 && !menu() && document.activeElement === actionTrigger(), "Escape did not cancel/restore trigger focus");
  await openDelete();
  document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); await wait();
  assert(!menu() && deleteCalls === 0, "outside dismissal retained hidden confirmation or mutated task");
  await openDelete(); deleteFailure = true;
  menu().querySelector<HTMLButtonElement>('[data-task-delete-control="confirm"]')!.click(); await wait();
  assert(menu().querySelector('[role="alert"]') && boardTasks.length === 2, "delete failure lost menu/error or mutated identity");
  deleteFailure = false;
  const confirm = menu().querySelector<HTMLButtonElement>('[data-task-delete-control="confirm"]')!;
  confirm.click(); confirm.click(); await wait();
  assert(deleteCalls === 2 && confirm.disabled, "pending Confirm duplicated mutation");
  document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); await wait();
  assert(menu(), "pending destructive commit dismissed its feedback");
  deferredDelete!(); await wait(); await wait();
  assert(boardTasks.length === 1 && boardTasks[0].id === tasks[1].id, "confirmed delete did not preserve independent task identity");
  await openDelete(); // Leave the source comparison state visible in the capture.
  await new Promise<void>(resolve => setTimeout(resolve, 250));
  return { catalogCommittedCrud: true, catalogStaleResponsesRejected: true, catalogEntryReconciled: true,
    catalogSelectedRecovery: true, catalogNoPolling: true, catalogDisposedResponseIgnored: true,
    focusTargetRemountPreserved: true, focusInvalidTargetOwnerFallback: true, focusSuccessNextTaskScoped: true,
    queueLastRowReachable: true, queueMenuReachable: true, queueHeaderStable: true, queueNoHorizontalOverflow: true, queueGeometries: geometries,
    pointerDragCrossLane: true, pointerDragSameLane: true, pointerDragIdentityPreserved: true,
    pointerDragCancellationSafe: true, pointerDragThresholdSafe: true, pointerDragInteractiveGuard: true, pointerDragScheduledGuard: true, pointerDragCleanup: true, keyboardReorderPreserved: true,
    deleteMenuRetained: true, deleteMenuUnobscured: true, deleteCardMetadataStable: true, deleteCancelAndDismissSafe: true, deleteFailureRetrySafe: true,
    deletePendingExactlyOnce: true, deleteIndependentIdentityPreserved: true };
}
