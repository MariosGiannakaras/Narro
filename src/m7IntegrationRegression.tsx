import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { FocusPanel } from "./FocusPanel";
import { ListBoard } from "./ListBoard";
import { createListFromEditor, updateListFromEditor, duplicateListFromHome } from "./listEditorApi";
import { archiveListFromSettings, restoreListFromSettings, permanentlyDeleteListFromSettings } from "./listSettingsApi";
import { emitBoardInvalidated } from "./boardInvalidation";
import type { ListBoardTask, ListBoardSnapshot } from "./listBoardApi";
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
    listId: id, listTitle: "Original", listColor: null, title: `Queue task ${index + 1} with long readable title`,
    estSeconds: null, timeTakenSeconds: "0", subtaskTotalCount: 0, subtaskCompletedCount: 0,
    scheduledLocalDate: null, scheduledLocalTime: null, isOverdue: false, completedAt: null,
  }));
  const timer: TimerSessionPayload = { revision: 1, awaitingResume: false, change: null,
    runtime: { open_session_id: null, timer: { state: "idle", task_id: null,
      mode: null, work_elapsed_ms: 0, total_break_ms: 0, countdown_remaining_ms: null,
      overtime_ms: 0, break_kind: null, break_remaining_ms: null } } };
  let boardTasks = [...tasks];
  const board = (target: { kind: string; id?: string }): ListBoardSnapshot => ({
    target: target.kind === "list" ? { kind: "list", id: target.id!, title: "Original", color: null }
      : { kind: "all_lists", id: null, title: "All Lists", color: null },
    displayTimezone: "Europe/Athens",
    backlog: { tasks: [], count: 0, aggregateEstSeconds: 0 },
    thisWeek: { tasks: [], count: 0, aggregateEstSeconds: 0 },
    today: { tasks: boardTasks, count: boardTasks.length, aggregateEstSeconds: 0 },
    done: { tasks: [], count: 0, aggregateEstSeconds: 0 }, todayCompletionCount: 0, doneMonthCompletionCount: 0,
  });
  const callbacks = new Map<number, (value: unknown) => void>();
  const listeners = new Map<number, { event: string; handler: number }>();
  let callbackId = 0, homeReads = 0, emissions = 0, mutationFailure = false, deliveryFailure = false;
  let deferHome = false, deleteFailure = false, deleteCalls = 0;
  const homeWaiters: Array<(value: unknown) => void> = [];
  let deferredDelete: (() => void) | undefined;
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
        return { lists: [...lists], pendingCount: boardTasks.length, aggregateEstSeconds: 0 };
      }
      if (command === "get_preference_settings") return {
        general: { hideTaskTimes: false }, focus: { scrollingTitle: false }, celebration: { showSuccessScreen: false },
      };
      if (command === "get_archived_lists_for_settings") return { lists: [], doneTasks: [], filterLists: [] };
      if (command === "get_list_board_snapshot") return board(args.listId
        ? { kind: "list", id: String(args.listId) } : { kind: "all" });
      if (command === "timer_session_snapshot") return timer;
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
    assert(menuButtons.length === 3, "last row menu controls missing");
    menuButtons[2].focus(); await wait();
    assert(menuButtons[2].getBoundingClientRect().bottom <= queue.getBoundingClientRect().bottom + 1,
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

  // Real ListBoard delete authority, not a presentation-only imitation.
  lists = [{ id, title: "Original" }, { id: "other", title: "Other" }]; boardTasks = [tasks[0], tasks[1]];
  flushSync(() => root.render(<ListBoard target={{ kind: "list", id }} />)); await wait(); await wait();
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
    assert(menu() && menu().querySelector('[data-task-delete-confirm="inline"]'), "confirmation left source menu container");
    assert(menu().textContent?.includes("Schedule") && menu().textContent?.includes("Change List") && menu().textContent?.includes("Duplicate"), "source sibling rows disappeared");
    assert(menu().querySelector('svg'), "trash glyph missing");
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
    queueLastRowReachable: true, queueMenuReachable: true, queueHeaderStable: true, queueNoHorizontalOverflow: true, queueGeometries: geometries,
    deleteMenuRetained: true, deleteCardMetadataStable: true, deleteCancelAndDismissSafe: true, deleteFailureRetrySafe: true,
    deletePendingExactlyOnce: true, deleteIndependentIdentityPreserved: true };
}
