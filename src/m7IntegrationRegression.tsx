import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { useState } from "react";
import { FloatingTimerFoundation } from "./FloatingTimerFoundation";
import { FocusPanel } from "./FocusPanel";
import { FocusLiveSubtasks } from "./FocusLiveSubtasks";
import { ListBoard } from "./ListBoard";
import { AppShell } from "./AppShell";
import { BUILTIN_LIST_ICONS } from "./BuiltinListIcon";
import { createListFromEditor, updateListFromEditor, duplicateListFromHome } from "./listEditorApi";
import { archiveListFromSettings, restoreListFromSettings, permanentlyDeleteListFromSettings } from "./listSettingsApi";
import { emitBoardInvalidated } from "./boardInvalidation";
import type { BoardSubtask, ListBoardRequestTarget, ListBoardTask, ListBoardSnapshot } from "./listBoardApi";
import type { TimerSessionPayload } from "./timerSessionApi";

// Render production components and call production APIs; replace only native
// IPC/storage. Assertions cover observable results and adverse response order.
export async function runM7IntegrationRegression(container: HTMLElement) {
  const assert = (value: unknown, text: string) => { if (!value) throw new Error("M7 projection: " + text); };
  const wait = () => new Promise<void>(resolve => setTimeout(resolve, 25));
  const id = "21111111-1111-4111-8111-111111111111";
  let lists: Array<{ id: string; title: string; color?: string | null; iconAsset?: string | null; iconId?: string | null }> = [{ id, title: "Original" }];
  const tasks: ListBoardTask[] = Array.from({ length: 12 }, (_, index) => ({
    id: `31111111-1111-4111-8111-${String(index + 1).padStart(12, "0")}`,
    listId: id, listTitle: "Original", listColor: null, title: index === 11
      ? "M7 PR233 CI948 LongUnbrokenTitleForNarrowMetricAndQueuedBadgeValidation1234567890"
      : `Queue task ${index + 1} with long readable title`,
    estSeconds: null, timeTakenSeconds: "0", subtaskTotalCount: 0, subtaskCompletedCount: 0,
    scheduledLocalDate: null, scheduledLocalTime: null, isOverdue: false, completedAt: null,
    updatedAt: "2026-10-06T09:00:00Z",
  }));
  const timer: TimerSessionPayload = { revision: 1, awaitingResume: false, change: null,
    runtime: { open_session_id: null, timer: { state: "idle", task_id: null,
      mode: null, work_elapsed_ms: 0, total_break_ms: 0, countdown_remaining_ms: null,
      overtime_ms: 0, break_kind: null, break_remaining_ms: null, break_planned_ms: null } } };

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
        break_remaining_ms: null, break_planned_ms: null,
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
      thisWeekCompletionCount: 0,
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
    done: { tasks: [], count: 0, aggregateEstSeconds: 0 }, todayCompletionCount: 0, thisWeekCompletionCount: 0, doneMonthCompletionCount: 0,
  });
  const callbacks = new Map<number, (value: unknown) => void>();
  const listeners = new Map<number, { event: string; handler: number }>();
  let callbackId = 0, homeReads = 0, emissions = 0, mutationFailure = false, deliveryFailure = false;
  let deferHome = false, deferFocusBoardReads = false, deleteFailure = false, deleteCalls = 0;
  const focusBoardReadWaiters: Array<(value: ListBoardSnapshot) => void> = [];
  const focusBoardReadRejecters: Array<(failure: unknown) => void> = [];
  const homeWaiters: Array<(value: unknown) => void> = [];
  let deferredDelete: (() => void) | undefined;
  const dragCalls: Array<Record<string, unknown>> = [];
  const createCalls: Array<Record<string, unknown>> = [];
  const quickClearCalls: Array<Record<string, unknown>> = [];
  const ownedSubtasks: BoardSubtask[] = [];
  let subtaskCalls = 0, subtaskFail = false, subtaskRefreshFail = false;
  let releaseSubtask: (() => void) | undefined;
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
        if (subtaskRefreshFail) throw new Error("controlled committed subtask refresh failure");
        if (deferFocusBoardReads) return new Promise((resolve, reject) => {
          focusBoardReadWaiters.push(resolve as (value: ListBoardSnapshot) => void);
          focusBoardReadRejecters.push(reject);
        });
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
              countdown_remaining_ms: null, overtime_ms: 0, break_kind: null, break_remaining_ms: null, break_planned_ms: null,
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
      if (command === "get_list_board_task_schedule_editor") {
        const task = boardTasks.find(task => task.id === args.taskId)!;
        assert(task && task.listId === args.listId && task.scheduledLocalDate, "invalid quick-clear editor identity");
        return { taskId: task.id, listId: task.listId, updatedAt: task.updatedAt,
          schedule: { kind: "date_only", local_date: task.scheduledLocalDate },
          recurrenceParentTaskId: task.recurrenceParentTaskId ?? null, recurrence: null,
          deleteExistingEligibleCount: 0, protectedExistingCount: 0 };
      }
      if (command === "quick_clear_list_board_task_schedule") {
        const request = args.request as Record<string, unknown>;
        quickClearCalls.push(request);
        const task = boardTasks.find(task => task.id === request.taskId)!;
        assert(task && request.listId === task.listId && request.expectedUpdatedAt === task.updatedAt
          && request.expectedRecurrenceParentTaskId === (task.recurrenceParentTaskId ?? null)
          && (request.expectedSchedule as { local_date: string }).local_date === task.scheduledLocalDate
          && typeof request.fallbackDisplayTimezone === "string", "quick clear lost authoritative CAS/timezone arguments");
        boardTasks = boardTasks.map(other => other.id === task.id
          ? { ...other, scheduledLocalDate: null, scheduledLocalTime: null, updatedAt: "2026-10-06T09:01:00Z" } : other);
        return;
      }
      if (command === "get_list_board_task_subtasks") {
        return { taskId: args.taskId, listId: args.listId, mutable: true, subtasks: [...ownedSubtasks] };
      }
      if (command === "create_list_board_subtask") {
        subtaskCalls++;
        assert(args.taskId === tasks[0].id && args.listId === id, "subtask create lost parent identity");
        if (subtaskFail) throw new Error("controlled uncommitted subtask failure");
        return new Promise<BoardSubtask>(resolve => {
          releaseSubtask = () => {
            const child: BoardSubtask = { id: `child-${subtaskCalls}`, taskId: String(args.taskId),
              title: String(args.title), sortRank: ownedSubtasks.length, completedAt: null, updatedAt: "2026-10-16T00:00:00Z" };
            ownedSubtasks.push(child);
            boardTasks = boardTasks.map(task => task.id === child.taskId
              ? { ...task, subtaskTotalCount: ownedSubtasks.length } : task);
            resolve(child);
          };
        });
      }
      if (command === "create_list_board_task") {
        createCalls.push({ ...args });
        const created = {
          ...tasks[0],
          id: `61111111-1111-4111-8111-${String(createCalls.length).padStart(12, "0")}`,
          title: String(args.title),
          estSeconds: args.estSeconds as number | null,
        };
        taskLanes.set(created.id, String(args.lane).replace("this_week", "thisWeek") as "backlog" | "thisWeek" | "today");
        if (args.insertAtTop) boardTasks.unshift(created);
        else boardTasks.push(created);
        return created.id;
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
  // Exercise the real production shell CSS, rather than the separately bounded
  // screenshot fixture. Tall content must scroll inside Main and keep its nav.
  const shellHost = document.createElement("div");
  shellHost.style.cssText = "position:fixed;inset:0;z-index:10000";
  document.body.append(shellHost);
  const shellRoot = createRoot(shellHost);
  try {
    flushSync(() => shellRoot.render(<AppShell fixtureMode homeContent={
      <div style={{ height: 1800 }}>Long owned planning/report content</div>
    } />));
    const shell = shellHost.querySelector<HTMLElement>(".app-shell")!;
    shell.classList.remove("app-shell--fixture");
    await wait();
    const main = shell.querySelector<HTMLElement>(".app-shell__content")!;
    const nav = shell.querySelector<HTMLElement>(".app-shell__primary-nav")!;
    assert(shell.getBoundingClientRect().bottom <= innerHeight + 1
      && nav.getBoundingClientRect().bottom <= innerHeight + 1,
    "production shell expands beyond the Windows viewport and hides navigation");
    assert(main.scrollHeight > main.clientHeight && main.clientHeight > 0,
      "long content must retain an internal scroll owner");
    main.scrollTop = 120;
    assert(main.scrollTop === 120, "Main scrolling was disabled instead of contained");
    assert(getComputedStyle(main).scrollbarWidth === "none",
      "Main exposes native scrollbar chrome");
  } finally {
    flushSync(() => shellRoot.unmount());
    shellHost.remove();
  }
  const renderFocus = (refreshKey = 0, presentationActive = true) => flushSync(() => root.render(
    <FocusPanel refreshKey={refreshKey} presentationActive={presentationActive}
      sharedTimerProjection={{ payload: timer, settled: true }} />));
  const selector = () => container.querySelector<HTMLButtonElement>('[data-focus-list-selector="true"]')!;
  const selectedValue = () => selector().dataset.focusSelectedTarget;
  const options = () => {
    flushSync(() => selector().click());
    const names = Array.from(container.querySelectorAll<HTMLElement>('[data-focus-list-option] .board-list-picker__option-title'),
      option => option.textContent);
    flushSync(() => selector().click());
    return names;
  };
  const chooseList = (listId: string) => {
    flushSync(() => selector().click());
    const option = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-focus-list-option]'))
      .find(candidate => candidate.dataset.focusListOption === listId);
    if (!option) throw new Error(`Focus list option ${listId} unavailable`);
    flushSync(() => option.click());
  };
  // Native PA03: autofocus exposed the title but left Add/Cancel below the
  // compact Panel queue. Exercise the production form at its real700px height.
  const originalBoardTasks = boardTasks;
  const originalTimerRuntime = timer.runtime;
  const originalScroll = { x: window.scrollX, y: window.scrollY };
  boardTasks = tasks.slice(0, 3);
  timer.runtime = { ...timer.runtime, open_session_id: "add-geometry-session",
    timer: { ...timer.runtime.timer, state: "paused", task_id: tasks[0].id,
      mode: { kind: "est_countdown", est_ms: 120_000 }, work_elapsed_ms: 126_000,
      countdown_remaining_ms: -6_000, overtime_ms: 6_000 } };
  renderFocus(); await wait(); await wait();
  const addPanel = container.querySelector<HTMLElement>(".focus-panel")!;
  const originalPanelHeight = addPanel.style.height;
  const originalPanelMinHeight = addPanel.style.minHeight;
  addPanel.style.height = "700px";
  addPanel.style.minHeight = "700px";
  const addQueue = addPanel.querySelector<HTMLElement>(".focus-panel__queue")!;
  const addTrigger = addPanel.querySelector<HTMLButtonElement>('[data-focus-add-task="open"]')!;
  flushSync(() => addTrigger.click());
  await wait();
  const editor = addPanel.querySelector<HTMLFormElement>('[data-focus-add-task="editor"]')!;
  const editorBounds = editor.getBoundingClientRect();
  const queueBounds = addQueue.getBoundingClientRect();
  assert(editorBounds.top >= queueBounds.top - 1 && editorBounds.bottom <= queueBounds.bottom + 1,
    "Focus Add Task complete form must fit inside its visible queue after opening.");
  assert(document.activeElement === editor.querySelector('[data-focus-add-task-title="true"]'),
    "Revealing the whole Focus Add form must preserve title-input autofocus.");
  flushSync(() => editor.querySelector<HTMLButtonElement>('button[type="button"]')!.click());
  addPanel.style.height = originalPanelHeight;
  addPanel.style.minHeight = originalPanelMinHeight;
  addQueue.scrollTop = 0;
  boardTasks = originalBoardTasks;
  timer.runtime = originalTimerRuntime;
  flushSync(() => root.render(<div>Reset isolated Add geometry scenario</div>));
  window.scrollTo(originalScroll.x, originalScroll.y);
  renderFocus(); await wait(); await wait();
  assert(options().includes("Original"), "initial active catalog missing");
  // Q03: drive the REAL Focus list-picker React keyboard handlers while its
  // production component is mounted. Source-string assertions alone cannot
  // establish focus/ARIA behavior in an actual browser DOM.
  const keyboardOptionNodes = () => Array.from(
    container.querySelectorAll<HTMLButtonElement>('[data-focus-list-option]'));
  const keyOn = (element: HTMLElement, key: string) => {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    flushSync(() => element.dispatchEvent(event));
    return event;
  };
  selector().focus();
  const initialKeyboardOpen = keyOn(selector(), "ArrowDown");
  await wait();
  assert(initialKeyboardOpen.defaultPrevented && selector().getAttribute("aria-expanded") === "true",
    "Q03 Focus list trigger ArrowDown must open its ARIA listbox");
  assert(container.querySelector('[role="listbox"][aria-label="Choose Focus list"]') !== null,
    "Q03 keyboard-opened Focus selector must expose labeled listbox");
  const keyboardOptions = keyboardOptionNodes();
  assert(keyboardOptions.length === 2 && keyboardOptions[0].dataset.focusListOption === "__all_lists__"
    && keyboardOptions[1].dataset.focusListOption === id,
    "Q03 keyboard options must preserve the real saved-list identities");
  assert(keyboardOptions[0].getAttribute("aria-selected") === "true"
    && keyboardOptions[1].getAttribute("aria-selected") === "false"
    && document.activeElement === keyboardOptions[0],
    "Q03 opening a listbox must focus its current accessible selection");
  assert(keyOn(keyboardOptions[0], "End").defaultPrevented
    && document.activeElement === keyboardOptions[1],
    "Q03 End must focus last option");
  assert(keyOn(keyboardOptions[1], "Home").defaultPrevented
    && document.activeElement === keyboardOptions[0],
    "Q03 Home must focus first option");
  assert(keyOn(keyboardOptions[0], "ArrowUp").defaultPrevented
    && document.activeElement === keyboardOptions[1],
    "Q03 ArrowUp must wrap from first to last option");
  assert(keyOn(keyboardOptions[1], "ArrowDown").defaultPrevented
    && document.activeElement === keyboardOptions[0],
    "Q03 ArrowDown must wrap from last to first option");
  assert(keyOn(keyboardOptions[0], "Escape").defaultPrevented, "Q03 Escape must be handled");
  await wait();
  assert(selector().getAttribute("aria-expanded") === "false"
    && !container.querySelector('[role="listbox"]') && document.activeElement === selector(),
    "Q03 Escape must dismiss the menu and restore focus to the trigger");

  // Tab dismisses without hijacking the browser's natural next-focus action.
  assert(keyOn(selector(), "ArrowUp").defaultPrevented, "Q03 ArrowUp must open a closed listbox");
  await wait();
  assert(container.querySelector('[role="listbox"]') !== null, "Q03 ArrowUp listbox failed to open");
  keyOn(keyboardOptionNodes()[0], "Tab");
  await wait();
  assert(selector().getAttribute("aria-expanded") === "false"
    && !container.querySelector('[role="listbox"]'), "Q03 Tab must dismiss the listbox");

  // Existing native button click activation should update the controlled
  // selection and its accessibility state without changing component styling.
  chooseList(id); await wait();
  assert(selectedValue() === id && selector().getAttribute("aria-expanded") === "false",
    "Q03 selected saved-list identity must commit and close popup");
  keyOn(selector(), "ArrowDown"); await wait();
  const selectedKeyboardOption = keyboardOptionNodes().find(button => button.dataset.focusListOption === id);
  assert(selectedKeyboardOption?.getAttribute("aria-selected") === "true"
    && document.activeElement === selectedKeyboardOption,
    "Q03 reopen must focus the newly selected saved list");
  keyOn(selectedKeyboardOption!, "Escape"); await wait();
  chooseList("__all_lists__"); await wait();
  assert(selectedValue() === "__all_lists__",
    "Q03 restoring All Lists should preserve existing Focus catalog semantics");
  const request = { title: "New", color: null, iconUpload: null };
  const operations = [
    () => createListFromEditor(request), () => updateListFromEditor("new", request),
    () => duplicateListFromHome(id), () => archiveListFromSettings("copy"),
    () => restoreListFromSettings("copy"), () => permanentlyDeleteListFromSettings("copy"),
  ];
  for (const operation of operations) {
    const before = emissions; await operation(); await wait();
    assert(emissions === before + 1, "committed list mutation did not emit exactly once");
    assert(options().filter(label => label !== "All Lists").join("|") === lists.map(list => list.title).join("|"), "committed catalog remained stale");
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
  chooseList(id); await wait();
  await archiveListFromSettings(id); await wait(); await wait();
  assert(selectedValue() === "__all_lists__" && !options().includes("Original"), "archived selected list did not recover to All");
  await restoreListFromSettings(id); await wait();
  chooseList(id); await wait();
  await permanentlyDeleteListFromSettings(id); await wait(); await wait();
  assert(selectedValue() === "__all_lists__", "deleted selected list did not recover to All");
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

  // A03: resolve newer board invalidation before delayed initial board read.
  deferFocusBoardReads = true;
  renderFocus(10); await wait(); await wait();
  assert(focusBoardReadWaiters.length === 1, "A03 initial Focus board request must be deferred");
  await emitBoardInvalidated(); await wait(); await wait();
  assert(focusBoardReadWaiters.length === 2, "A03 invalidation must request a second board");
  const staleFocusBoard = board({ kind: "all" });
  const arriving = {
    ...tasks[1], id: "71111111-1111-4111-8111-111111111111",
    title: "A03 fresher committed queue item",
  };
  const freshFocusBoard = {
    ...staleFocusBoard,
    today: { ...staleFocusBoard.today, count: staleFocusBoard.today.count + 1,
      tasks: [arriving, ...staleFocusBoard.today.tasks] },
  };
  focusBoardReadWaiters[1](freshFocusBoard); await wait(); await wait();
  assert(container.textContent?.includes(arriving.title), "A03 new board was not rendered");
  focusBoardReadWaiters[0](staleFocusBoard); await wait(); await wait();
  assert(container.textContent?.includes(arriving.title),
    "A03 stale initial board overwrote newer event snapshot");
  // Q05: a stale *rejection* from the first Focus read is just as unsafe as
  // a stale success. The newer event read must keep its task AND clear any old
  // error even if an earlier IPC completes exceptionally afterward.
  const staleFailureIndex = focusBoardReadWaiters.length;
  flushSync(() => root.render(<div>A03 remount for stale-error inversion</div>)); await wait();
  renderFocus(11); await wait(); await wait();
  assert(focusBoardReadWaiters.length === staleFailureIndex + 1,
    "Q05 initial Focus board request must be delayed for stale-error inversion");
  await emitBoardInvalidated(); await wait(); await wait();
  assert(focusBoardReadWaiters.length === staleFailureIndex + 2,
    "Q05 newer Focus board invalidation must read a fresh snapshot");
  focusBoardReadWaiters[staleFailureIndex + 1](freshFocusBoard); await wait(); await wait();
  assert(container.textContent?.includes(arriving.title),
    "Q05 newer Focus snapshot was not rendered before stale rejection");
  focusBoardReadRejecters[staleFailureIndex](new Error("Q05 stale initial IPC must be ignored"));
  await wait(); await wait();
  assert(container.textContent?.includes(arriving.title)
    && !container.textContent?.includes("Q05 stale initial IPC must be ignored"),
    "Q05 late initial read error replaced newer Focus data or exposed obsolete error");
  deferFocusBoardReads = false;
  flushSync(() => root.render(<div>A03 finished</div>)); await wait();

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
  chooseList(id); await wait(); await wait();
  assert(selectedValue() === id, "controlled Focus target did not commit selected list");
  renderScopeOwner(false); await wait();
  renderScopeOwner(true); await wait(); await wait();
  assert(selectedValue() === id, "coordinator-owned Focus target did not survive Panel remount");
  lists = [];
  await emitBoardInvalidated(); await wait(); await wait();
  assert(selectedValue() === "__all_lists__", "invalid controlled Focus target did not fall back through owner to All");

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
        overtime_ms: 0, break_kind: null, break_remaining_ms: null, break_planned_ms: null,
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
        overtime_ms: 0, break_kind: null, break_remaining_ms: null, break_planned_ms: null,
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
  // B50 keeps five real controls and replaces Pause with Extend only at
  // Time's Up; the older six-control M7 acceptance assertion is obsolete.
  const panelActions = container.querySelectorAll<HTMLButtonElement>('[data-focus-action]');
  assert(panelActions.length === 5
      && Boolean(panelBreak?.disabled) && panelPause === null
      && Boolean(panelSkip && !panelSkip.disabled) && Boolean(panelExtend && !panelExtend.disabled)
      && Boolean(panelDone && !panelDone.disabled),
    "finding35/B50 Time's Up must expose five controls with Extend instead of Pause");
  scopeScenario = false;

  // Production pointer handlers, real rendered hit testing/placeholder reflow,
  // and actual production mutation APIs. Synthetic events are renderer-level
  // regression evidence, not a substitute for native WebView2 acceptance.
  lists = [{ id, title: "Original" }, { id: "other", title: "Other" }];
  const scheduled = {...tasks[3], scheduledLocalDate: "2026-10-06"};
  const renderBoard = (key: string) => flushSync(() => root.render(<ListBoard key={key} target={{kind:"list",id}} />));
  // Q18: actual mounted ListBoard initially requests a snapshot. A newer
  // cross-window board event can resolve before that old initial promise.
  // The initial read must never restore an obsolete two-task projection.
  const staleReadStart = focusBoardReadWaiters.length;
  boardTasks = [tasks[0], tasks[1]];
  const staleInitialBoard = board({kind: "list", id});
  deferFocusBoardReads = true;
  renderBoard("initial-event-inversion"); await wait(); await wait();
  assert(focusBoardReadWaiters.length === staleReadStart + 1,
    "Q18 real ListBoard initial request was not delayed");
  boardTasks = [tasks[0], tasks[1], tasks[2]];
  deferFocusBoardReads = false;
  await emitBoardInvalidated(); await wait(); await wait();
  assert(container.textContent?.includes(tasks[2].title),
    "Q18 new cross-window invalidation response was not rendered");
  focusBoardReadWaiters[staleReadStart](staleInitialBoard); await wait(); await wait();
  assert(container.textContent?.includes(tasks[2].title),
    "Q18 stale initial board read replaced the newer event snapshot");
  flushSync(() => root.render(<div data-q18-inversion-done="true" />)); await wait();
  boardTasks = [...tasks];
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

  // Source bottom ADD TASK keeps the form below the rows, but creates
  // newest-first. Exercise the real handler, inputs, refresh and repeated entry.
  boardTasks = [];
  renderBoard("source-create"); await wait(); await wait();
  const emptyLanes = Array.from(container.querySelectorAll<HTMLElement>('.list-board-lane__empty'));
  assert(emptyLanes.length === 4 && emptyLanes.every(lane => lane.textContent === "All Clear"),
    "source empty state is inconsistent across the four lanes");
  assert(!container.querySelector('[data-board-lane="Done"] [data-board-add-task]'), "Done incorrectly permits task creation");
  const startCreate = async (selector: string) => {
    container.querySelector<HTMLButtonElement>(selector)!.click(); await wait();
    const form = container.querySelector<HTMLFormElement>('[data-board-task-create="editor"]')!;
    assert(form && form.querySelector('label')?.textContent === "Title", "source Title label missing");
    return form;
  };
  const fillCreate = async (form: HTMLFormElement, title: string) => {
    const input = form.querySelector<HTMLInputElement>('[data-task-create-title]')!;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, title);
    input.dispatchEvent(new Event("input", { bubbles: true })); await wait();
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await wait(); await wait(); await wait();
    assert(input.value === "" && document.activeElement === input, "successful repeated entry lost cleared draft/focus");
    assert(form === container.querySelector('[data-board-task-create="editor"]'), "repeated create remounted the form");
  };
  const bottomForm = await startCreate('[data-board-add-task="today"]');
  await fillCreate(bottomForm, "Video");
  await fillCreate(bottomForm, "Record voice");
  const todayList = container.querySelector<HTMLElement>('[aria-label="Today tasks"]')!;
  const createdTitles = () => Array.from(todayList.querySelectorAll<HTMLElement>('[data-board-task="task-card"] .list-board-task__title')).map(node => node.textContent);
  assert(createdTitles().join("|") === "Record voice|Video", "bottom repeated create did not render newest-first");
  assert(bottomForm === todayList.lastElementChild, "bottom editor moved when the new task prepended");
  bottomForm.querySelector<HTMLButtonElement>('[data-task-create-cancel]')!.click(); await wait();
  const topForm = await startCreate('[data-board-add-task-top="today"]');
  await fillCreate(topForm, "Top entry");
  assert(topForm === todayList.firstElementChild && createdTitles()[0] === "Top entry", "explicit top entry lost its form or insertion position");
  topForm.querySelector<HTMLButtonElement>('[data-task-create-cancel]')!.click(); await wait();
  for (const lane of ["backlog", "thisWeek"]) {
    const form = await startCreate(`[data-board-add-task="${lane}"]`);
    await fillCreate(form, `${lane} entry`);
    form.querySelector<HTMLButtonElement>('[data-task-create-cancel]')!.click(); await wait();
  }
  assert(createCalls.length === 5 && createCalls.every(call => call.insertAtTop === true && call.listId === id),
    "Board create did not use the existing atomic prepend request exactly once per task");
  assert(boardTasks.length === 5 && new Set(boardTasks.map(task => task.id)).size === 5,
    "repeated Board create lost or aliased task identities");
  taskLanes.clear();

  // Exercise the actual Board menu, read/version check, dedicated native API,
  // event refresh and retained identity. Rust tests own the real SQLite lane
  // projection/atomicity; this mock never claims to prove that backend logic.
  boardTasks = [{ ...tasks[0], title: "Future scheduled task", scheduledLocalDate: "2026-12-18" }];
  taskLanes.set(tasks[0].id, "backlog");
  renderBoard("quick-clear"); await wait(); await wait();
  container.querySelector<HTMLButtonElement>('[aria-label="Task actions"]')!.click(); await wait();
  const quickX = container.querySelector<HTMLButtonElement>('[data-task-schedule-quick-remove] [role="menuitem"]')!;
  assert(quickX, "real scheduled menu omitted quick-X");
  quickX.click(); quickX.click(); await wait(); await wait(); await wait();
  assert(quickClearCalls.length === 1 && boardTasks.length === 1 && boardTasks[0].id === tasks[0].id
    && boardTasks[0].scheduledLocalDate === null && laneTasks("backlog")[0].id === tasks[0].id,
    "quick-X handler failed dedicated once-only command/refresh/identity path");
  container.querySelector<HTMLButtonElement>('[aria-label="Task actions"]')!.click(); await wait();
  assert(!container.querySelector('[data-task-schedule-quick-remove]'), "committed quick-X left stale scheduled controls");
  document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); await wait();
  taskLanes.clear();

  // Actual Board + shared TaskSubtasks, with deferred native commit and real
  // pending/refresh renders. An isolated synchronous fixture misses the blur.
  boardTasks = [tasks[0]];
  renderBoard("subtask-create-focus"); await wait(); await wait();
  container.querySelector<HTMLButtonElement>('[data-task-subtask-control="toggle"]')!.click(); await wait(); await wait();
  const subtaskInput = () => container.querySelector<HTMLInputElement>('[data-task-subtask-control="create-input"]')!;
  const submitChild = async (title: string, doubleSubmit = true) => {
    const input = subtaskInput(); input.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, title);
    input.dispatchEvent(new Event("input", { bubbles: true })); await wait();
    const form = input.form!;
    if (doubleSubmit) form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await wait();
    return input;
  };
  for (const title of ["First child", "Second child"]) {
    const calls = subtaskCalls;
    const input = await submitChild(title, title !== "First child");
    assert(input.disabled && subtaskCalls === calls + 1, "pending subtask duplicated native command or remained editable");
    releaseSubtask!(); await wait(); await wait(); await wait();
    assert(subtaskInput() === input && input.value === "" && !input.disabled && document.activeElement === input,
      "committed subtask create lost repeat-ready input/focus after authoritative refresh");
  }
  const clearInput = subtaskInput();
  const clearWidth = clearInput.getBoundingClientRect().width;
  const beforeClearCalls = subtaskCalls;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(clearInput, "Uncommitted draft");
  clearInput.dispatchEvent(new Event("input", { bubbles: true })); await wait();
  const clearButton = container.querySelector<HTMLButtonElement>('[data-task-subtask-control="cancel-create"]')!;
  const clearBounds = clearButton.getBoundingClientRect(), inputBounds = clearInput.getBoundingClientRect();
  assert(clearBounds.left >= inputBounds.left && clearBounds.right <= inputBounds.right,
    "subtask clear must remain inside its reserved input slot");
  clearButton.click(); await wait();
  assert(clearInput.value === "" && document.activeElement === clearInput && subtaskCalls === beforeClearCalls
    && clearInput.getBoundingClientRect().width === clearWidth, "subtask draft clear mutated storage or reflowed/lost input");
  subtaskFail = true;
  const failedInput = await submitChild("Retain failed draft"); await wait();
  assert(failedInput.value === "Retain failed draft" && !failedInput.disabled && document.activeElement === failedInput,
    "uncommitted failure lost editable draft/focus");
  subtaskFail = false;
  await submitChild("Navigation ownership");
  const elsewhere = document.createElement("button"); elsewhere.textContent = "Outside focus owner";
  document.body.append(elsewhere); elsewhere.focus();
  releaseSubtask!(); await wait(); await wait(); await wait();
  assert(document.activeElement === elsewhere, "completed native response stole explicitly moved focus");
  elsewhere.remove();
  await submitChild("Committed stale details");
  subtaskRefreshFail = true;
  releaseSubtask!(); await wait(); await wait(); await wait();
  assert(!subtaskInput() && document.activeElement !== failedInput
    && container.textContent?.includes("panel is stale"), "committed refresh failure refocused stale editing state");
  subtaskRefreshFail = false;
  // Dispose an outstanding request; its completion must not focus a new tree.
  renderBoard("subtask-disposal"); await wait(); await wait();
  container.querySelector<HTMLButtonElement>('[data-task-subtask-control="toggle"]')!.click(); await wait(); await wait();
  await submitChild("Disposed owner");
  flushSync(() => root.render(<button id="new-focus-owner">New owner</button>));
  const newOwner = container.querySelector<HTMLButtonElement>("#new-focus-owner")!; newOwner.focus();
  releaseSubtask!(); await wait(); await wait();
  assert(document.activeElement === newOwner, "disposed subtask response stole replacement focus");
  assert(new Set(ownedSubtasks.map(child => child.id)).size === ownedSubtasks.length,
    "subtask capture fixture lost independent child identities");

  // Actual option projection, approved icon/initial consumer, and scope owner.
  lists = [{ id, title: "Glyph list", color: "#48d6c5", iconId: BUILTIN_LIST_ICONS[0].id },
    { id: "badge-second", title: "Second", color: "#b7d96d" },
    { id: "badge-third", title: "Third", color: "#de8db3" }];
  function BadgeBoardHarness() {
    const [target, setTarget] = useState<ListBoardRequestTarget>({ kind: "list", id });
    return <ListBoard target={target} onTargetChange={setTarget} />;
  }
  flushSync(() => root.render(<BadgeBoardHarness />)); await wait(); await wait();
  const badgeTrigger = () => container.querySelector<HTMLButtonElement>('[aria-label="Planning list"]')!;
  assert(badgeTrigger().querySelector('.board-list-picker__badge svg'), "Board dropped authoritative built-in icon metadata");
  badgeTrigger().click(); await wait();
  const boardBadgeOptions = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="listbox"] [role="option"]'));
  assert(boardBadgeOptions.length === 4 && boardBadgeOptions[0].querySelectorAll('.board-list-picker__badge').length === 2
    && boardBadgeOptions[0].querySelector('.board-list-picker__remaining-count')?.textContent === "+1"
    && boardBadgeOptions[1].querySelector('.board-list-picker__badge svg')
    && boardBadgeOptions[2].querySelector('.board-list-picker__badge')?.textContent === "S",
    "Board listbox lost icon/initial/AllLists remaining-count grammar");
  for (const badge of container.querySelectorAll<HTMLElement>('.board-list-picker__badge')) {
    const rect = badge.getBoundingClientRect();
    assert(rect.width >= 18 && rect.height >= 18 && Math.abs(rect.width - rect.height) <= 1,
      "Board source badges regressed to dots or distorted images");
  }
  boardBadgeOptions[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
  assert(document.activeElement === boardBadgeOptions[0], "Board Home did not reach AllLists");
  boardBadgeOptions[0].click(); await wait(); await wait();
  assert(badgeTrigger().textContent?.includes("All Lists") && !container.querySelector('[data-board-add-task]'),
    "Board AllLists scope failed or permitted owned-list creation");
  badgeTrigger().click(); await wait();
  container.querySelectorAll<HTMLButtonElement>('[role="listbox"] [role="option"]')[1].click(); await wait(); await wait();
  assert(badgeTrigger().querySelector('.board-list-picker__badge svg') && container.querySelector('[data-board-add-task]'),
    "Board selected list/icon failed to return after AllLists");

  // Focus owns its toolbar and its minimal stylesheet; the shared input must
  // not depend on Board CSS specificity or reveal a second summary header.
  boardTasks = [tasks[0]];
  flushSync(() => root.render(<div style={{ width: 300 }}><FocusLiveSubtasks
    task={tasks[0]} target={{ kind: "list", id }} fixtureMode={false} /></div>));
  const boardOnlyStyles: Array<{ rule: CSSStyleRule; css: string }> = [];
  for (const sheet of Array.from(document.styleSheets)) for (const rule of Array.from(sheet.cssRules)) {
    if (rule instanceof CSSStyleRule && rule.selectorText.includes(".list-board-task__subtask")
      && !rule.selectorText.includes(".focus-panel__subtasks")) {
      boardOnlyStyles.push({ rule, css: rule.style.cssText });
      rule.style.cssText = "";
    }
  }
  assert(boardOnlyStyles.length > 0, "Focus isolation test did not remove any Board-only style dependency");
  try {
  container.querySelector<HTMLButtonElement>('[data-focus-subtask-control="toggle"]')!.click(); await wait(); await wait();
  const panelInput = await submitChild("Panel shared keyboard create");
  assert(panelInput.disabled, "Focus shared create did not acquire native pending");
  releaseSubtask!(); await wait(); await wait(); await wait();
  assert(subtaskInput() === panelInput && !panelInput.disabled && panelInput.value === "" && document.activeElement === panelInput,
    "Focus shared input lost repeat-ready focus after real authoritative refresh");
  const panelHeader = container.querySelector<HTMLElement>('[data-task-subtask-header]')!;
  assert(getComputedStyle(panelHeader).display === "none", "Focus revealed duplicate Board summary controls");
  const panelClear = container.querySelector<HTMLButtonElement>('[data-task-subtask-control="cancel-create"]')!.getBoundingClientRect();
  const panelBounds = panelInput.getBoundingClientRect();
  assert(panelClear.left >= panelBounds.left && panelClear.right <= panelBounds.right
    && panelClear.top >= panelBounds.top && panelClear.bottom <= panelBounds.bottom,
    "Focus scoped CSS displaced the shared in-field clear");
  } finally {
    for (const { rule, css } of boardOnlyStyles) rule.style.cssText = css;
  }

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
    const zoom = Number(container.style.zoom) || 1;
    // Layout dimensions exclude the menu's finite opening scale animation.
    const restingMenu = { width: menu().offsetWidth, height: menu().offsetHeight };
    for (const row of menu().querySelectorAll<HTMLElement>('[role="menuitem"]')) {
      const style = getComputedStyle(row);
      const height = row.getBoundingClientRect().height / zoom;
      assert(height >= 30 && height <= 36 && style.backgroundColor === "rgba(0, 0, 0, 0)",
        "source menu row uses raised/oversized button styling: " + JSON.stringify({ height, background: style.backgroundColor }));
    }
    const deletion = Array.from(menu().querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(button => button.textContent === "Delete")!;
    deletion.click(); await wait();
    await new Promise<void>(resolve => setTimeout(resolve, 250));
    assert(menu() && menu().querySelector('[data-task-delete-confirm="inline"]'), "confirmation left source menu container");
    const confirmationBounds = { width: menu().offsetWidth, height: menu().offsetHeight };
    assert(Math.abs(confirmationBounds.width - restingMenu.width) <= 1
      && Math.abs(confirmationBounds.height - restingMenu.height) <= 1,
      "inline confirmation changed source menu geometry: " + JSON.stringify({ before: restingMenu, after: confirmationBounds }));
    assert(menu().querySelectorAll('[role="separator"]').length === 1
      && getComputedStyle(menu().querySelector('[data-task-delete-confirm]')!).borderTopStyle === "none",
      "inline confirmation duplicated the destructive separator");
    const confirmStyle = getComputedStyle(menu().querySelector('[data-task-delete-control="confirm"]')!);
    const cancelStyle = getComputedStyle(menu().querySelector('[data-task-delete-control="cancel"]')!);
    assert(confirmStyle.backgroundColor === "rgba(0, 0, 0, 0)" && cancelStyle.backgroundColor === "rgba(0, 0, 0, 0)"
      && confirmStyle.color !== cancelStyle.color, "source inline confirm/cancel lost plain destructive/neutral styling");
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
  return { catalogCommittedCrud: true, catalogStaleResponsesRejected: true, focusBoardStaleResponsesRejected: true, catalogEntryReconciled: true,
    catalogSelectedRecovery: true, catalogNoPolling: true, catalogDisposedResponseIgnored: true,
    focusTargetRemountPreserved: true, focusInvalidTargetOwnerFallback: true, focusSuccessNextTaskScoped: true,
    queueLastRowReachable: true, queueMenuReachable: true, queueHeaderStable: true, queueNoHorizontalOverflow: true, queueGeometries: geometries,
    focusAddEditorFullyVisible: true, productionShellViewportContained: true,
    pointerDragCrossLane: true, pointerDragSameLane: true, pointerDragIdentityPreserved: true,
    pointerDragCancellationSafe: true, pointerDragThresholdSafe: true, pointerDragInteractiveGuard: true, pointerDragScheduledGuard: true, pointerDragCleanup: true, keyboardReorderPreserved: true,
    deleteMenuRetained: true, deleteMenuUnobscured: true, deleteCardMetadataStable: true, deleteCancelAndDismissSafe: true, deleteFailureRetrySafe: true,
    deletePendingExactlyOnce: true, deleteIndependentIdentityPreserved: true,
    sourceMenuCompactPlain: true, deleteConfirmationGeometryStable: true, sourceEmptyAllFourLanes: true,
    sourceCreateTitleLabel: true, sourceBottomCreateNewestFirst: true, sourceCreateFormPositionStable: true,
    sourceCreateIndependentIdentities: true, quickClearNativeCommandAndRefresh: true,
    subtaskRepeatFocusAfterNativeRefresh: true, subtaskFailureDraftAndFocus: true,
    subtaskExplicitFocusOwnership: true, subtaskStaleRefreshFailClosed: true, subtaskDisposedFocusSafe: true,
    boardListGlyphsAndScope: true, subtaskInFieldClearStable: true, focusSharedSubtaskInput: true };
}
