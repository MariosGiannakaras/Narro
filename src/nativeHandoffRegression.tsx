import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { FocusSurfaceCoordinator } from "./FocusSurfaceCoordinator";
import { ListBoard } from "./ListBoard";
import type { ListBoardSnapshot, ListBoardTask } from "./listBoardApi";
import type { TimerSessionPayload } from "./timerSessionApi";

// Real mounted components/CSS, replacing only native IPC. This is automated
// renderer proof, not physical Windows or exact-executable acceptance.
export async function runNativeHandoffRegression(container: HTMLElement) {
  const trace: unknown[] = [];
  let currentVariant = "board";
  const assert = (value: unknown, text: string) => { if (!value) throw new Error("RA handoff: " + text + JSON.stringify({currentVariant,trace})); };
  const wait = (ms = 30) => new Promise<void>(resolve => window.setTimeout(resolve, ms));
  const until = async (condition: () => unknown, text: string) => {
    const end = performance.now() + 4000;
    while (!condition() && performance.now() < end) await wait();
    assert(condition(), text);
  };
  const deferred = () => {
    let resolve!: () => void, reject!: (failure: Error) => void;
    const promise = new Promise<void>((a, b) => { resolve = a; reject = b; });
    return { promise, resolve, reject };
  };
  const listId = "a1111111-1111-4111-8111-111111111111";
  const tasks: ListBoardTask[] = [1, 2, 3].map(index => ({
    id: `b1111111-1111-4111-8111-${String(index).padStart(12, "0")}`,
    listId, listTitle: "RA regression", listColor: null, title: `RA task ${index}`,
    estSeconds: 600, timeTakenSeconds: "0", completedAt: null,
    scheduledLocalDate: null, scheduledLocalTime: null, isOverdue: false,
  }));
  let order = [...tasks], completed: ListBoardTask[] = [], crossLane = false, focus = false;
  const lane = (values: ListBoardTask[]) => ({ tasks: values, count: values.length, aggregateEstSeconds: values.length * 600 });
  const board = (): ListBoardSnapshot => ({
    target: { kind: "list", id: listId, title: "RA regression", color: null }, displayTimezone: "Europe/Athens",
    backlog: lane(focus ? [] : order.filter(t => !crossLane || t.id !== tasks[0].id)),
    thisWeek: lane(crossLane ? order.filter(t => t.id === tasks[0].id) : []),
    today: lane(focus ? order : []), done: lane(completed),
    todayCompletionCount: completed.length, thisWeekCompletionCount: 0, doneMonthCompletionCount: completed.length,
  });
  const requestedBoard = (args: Record<string, unknown>) => ({
    ...board(), target: args.listId ? board().target
      : { kind: "all_lists" as const, id: null, title: "All Lists", color: null },
  });
  let revision = 100;
  const idle = (): TimerSessionPayload => ({ revision: ++revision, awaitingResume: false, change: null,
    runtime: { open_session_id: null, timer: { state: "idle", task_id: null, mode: null,
      work_elapsed_ms: 0, total_break_ms: 0, countdown_remaining_ms: null, overtime_ms: 0,
      break_kind: null, break_remaining_ms: null, break_planned_ms: null } } });
  let timer = idle(), success = false, failComplete = false, holdRead = false;
  let failNext = false, failRead = false, failPrivateRead = false;
  let completionReplyDelivered = false, privateReadClaimed = false, parentReadCount = 0;
  let privateRead = deferred(), lateRead = deferred();
  let captureStaleNextRead = false;
  let completeCalls = 0, startCalls = 0, breakCalls = 0, writeCalls = 0;
  let completion = deferred(), write = deferred(), read = deferred();
  const callbacks = new Map<number, (event: unknown) => void>();
  const listeners = new Map<number, { event: string; handler: number }>();
  let serial = 0, dispatchingEvent = false;
  const native = window as unknown as {
    __TAURI_INTERNALS__: { transformCallback: (callback: (event: unknown) => void) => number;
      invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> };
    __TAURI_EVENT_PLUGIN_INTERNALS__: { unregisterListener: (event: string, id: number) => void };
  };
  const previousNative = native.__TAURI_INTERNALS__, previousEvents = native.__TAURI_EVENT_PLUGIN_INTERNALS__;
  const emit = (event: string, payload: unknown) => {
    dispatchingEvent = true;
    try {
      for (const listener of [...listeners.values()]) if (listener.event === event) {
        callbacks.get(listener.handler)?.({ event, id: listener.handler, payload });
      }
    } finally { dispatchingEvent = false; }
  };
  native.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener: (_event, id) => { listeners.delete(id); } };
  native.__TAURI_INTERNALS__ = {
    transformCallback(callback) { callbacks.set(++serial, callback); return serial; },
    async invoke(command, args = {}) {
      if (command === "plugin:event|listen") {
        const handler = Number(args.handler); listeners.set(handler, { event: String(args.event), handler }); return handler;
      }
      if (command === "plugin:event|emit") { emit(String(args.event), args.payload); return; }
      if (command.startsWith("plugin:event|")) return;
      if (command === "focus_surface_presentation_snapshot") return "panel";
      if (command === "get_home_snapshot") return { lists: [{ id: listId, title: "RA regression" }], pendingCount: order.length, aggregateEstSeconds: 600 };
      if (command === "get_archived_lists_for_settings") {
        // The real board API first awaits archive reconciliation. Hold reads
        // here, where emitted-listener context is still synchronous, so the
        // independent private read is deterministic in dev AND minified builds.
        if (holdRead) {
          if (success && completionReplyDelivered && !dispatchingEvent && !privateReadClaimed) {
            privateReadClaimed = true;
            if (failPrivateRead) throw new Error("controlled private success read failure");
            await privateRead.promise;
          } else { parentReadCount++; await read.promise; }
        }
        return { lists: [], doneTasks: [], filterLists: [] };
      }
      if (command === "get_focus_done_breaks") return [];
      if (command === "get_list_board_task_note") return { taskId: args.taskId, listId, mutable: true,
        note: { taskId: args.taskId, editorFormatVersion: 1, updatedAt: "2026-10-19T00:00:00Z",
          document: { blocks: [{ kind: "paragraph", runs: [{ text: "Draft must survive rejected completion" }] }] } } };
      if (command === "get_preference_settings") return { general: { hideTaskTimes: false },
        focus: { scrollingTitle: false, defaultBreakSeconds: 300 },
        celebration: { showSuccessScreen: success, successSoundEnabled: false, funGif: false } };
      if (command === "get_list_board_snapshot") {
        trace.push({currentVariant, holdRead, success, completionReplyDelivered,dispatchingEvent,privateReadClaimed});
        if (captureStaleNextRead) {
          captureStaleNextRead = false;
          const oldSnapshot = requestedBoard(args);
          await lateRead.promise;
          return oldSnapshot;
        }
        if (failRead && completed.length > 0) throw new Error("controlled committed refresh failure");
        return requestedBoard(args);
      }
      if (command === "timer_session_snapshot") return timer;
      if (command === "timer_start_task") {
        startCalls++;
        if (failNext && completed.length > 0) throw new Error("controlled next-start failure");
        const snapshot = idle(), taskId = String(args.taskId), sessionId = "session-" + revision;
        timer = { ...snapshot, change: { type: "started", task_id: taskId, session_id: sessionId },
          runtime: { ...snapshot.runtime, open_session_id: sessionId,
            timer: { ...snapshot.runtime.timer, state: "running", task_id: taskId, mode: { kind: "count_up" } } } };
        emit("timer-session-changed", timer); return timer;
      }
      if (command === "timer_complete_task") {
        completeCalls++;
        if (failComplete) { await completion.promise; return timer; }
        const finished = order.find(t => t.id === timer.runtime.timer.task_id)!;
        order = order.filter(t => t.id !== finished.id); completed.push({ ...finished, completedAt: "2026-10-19T00:00:00Z" });
        timer = { ...idle(), change: { type: "task_completed", task_id: finished.id, closed_session_id: "work" } };
        const result = timer;
        holdRead = true;
        // Event delivered BEFORE command reply and independently delayed reads.
        emit("timer-session-changed", result);
        await completion.promise; completionReplyDelivered = true; return result;
      }
      if (command === "timer_start_manual_break") { breakCalls++; throw new Error("untimed rest cannot start break"); }
      if (command === "move_list_board_task" || command === "reorder_list_board_task") {
        writeCalls++; await write.promise;
        crossLane = command === "move_list_board_task";
        if (!crossLane) { const moved = order.find(t => t.id === args.taskId)!; order = order.filter(t => t.id !== moved.id); order.push(moved); }
        holdRead = true; return;
      }
      throw new Error("Unexpected RA native command: " + command);
    },
  };
  const root = createRoot(container);
  const query = <T extends HTMLElement>(selector: string) => container.querySelector<T>(selector);
  const chooseTarget = async (value: string) => {
    query<HTMLButtonElement>('[data-focus-list-selector]')!.click();
    await until(() => query(`[data-focus-list-option="${value}"]`), "actual list picker opened");
    query<HTMLButtonElement>(`[data-focus-list-option="${value}"]`)!.click();
    await until(() => query<HTMLButtonElement>('[data-focus-list-selector]')?.dataset.focusSelectedTarget === value
      && query('[data-focus-surface-coordinator]')?.getAttribute("data-focus-target") === (value === "__all_lists__" ? "all" : `list:${value}`), "actual target projection settled");
    await wait();
  };
  let activeSuccessObserver: MutationObserver | null = null;
  const clear = async () => {
    activeSuccessObserver?.disconnect(); activeSuccessObserver = null;
    flushSync(() => root.render(<div />)); await wait();
  };
  let removalChecks = 0;
  const remove = Element.prototype.remove;
  try {
    Element.prototype.remove = function () {
      if (this.classList.contains("list-board-task-drag-preview")) {
        const real = query<HTMLElement>(`[data-board-drag-task="${tasks[0].id}"]`);
        assert(real && getComputedStyle(real).opacity !== "0" && real.getBoundingClientRect().height > 0,
          "preview removed before real production row became visible");
        removalChecks++;
      }
      remove.call(this);
    };
    for (const move of [true, false]) {
      focus = false; order = [...tasks]; completed = []; crossLane = false; holdRead = false;
      write = deferred(); read = deferred();
      flushSync(() => root.render(<ListBoard key={String(move)} target={{ kind: "list", id: listId }} />));
      await until(() => query('[data-board-reorder-enabled="true"]'), "Board reorder enabled");
      await wait();
      const shell = query<HTMLElement>(`[data-board-drag-task="${tasks[0].id}"]`)!;
      const bounds = shell.getBoundingClientRect();
      const pointer = (owner: EventTarget, type: string, x: number, y: number) => owner.dispatchEvent(new PointerEvent(type,
        { bubbles: true, cancelable: true, isPrimary: true, pointerId: 19, pointerType: "mouse", button: 0, buttons: type === "pointerup" ? 0 : 1, clientX: x, clientY: y }));
      pointer(shell, "pointerdown", bounds.left + 12, bounds.top + 12);
      pointer(window, "pointermove", bounds.left + 22, bounds.top + 22); await wait();
      assert(document.querySelector(".list-board-task-drag-preview"), "drag lifted");
      const destination = query<HTMLElement>(`[data-board-drop-lane="${move ? "thisWeek" : "backlog"}"]`)!;
      const target = destination.getBoundingClientRect();
      const x = target.left + target.width / 2, y = move ? target.top + 30 : target.bottom - 5;
      pointer(window, "pointermove", x, y); await wait();
      const count = writeCalls;
      pointer(window, "pointerup", x, y);
      await until(() => writeCalls === count + 1, "one drop dispatched " + JSON.stringify({move, x,y,target:target.toJSON(),hit:document.elementFromPoint(x,y)?.outerHTML.slice(0,180)}));
      assert(document.querySelector('.list-board-task-drag-preview'), "preview retained during write");
      write.resolve(); await wait();
      assert(document.querySelector('.list-board-task-drag-preview'), "preview retained during independent board read");
      holdRead = false; read.resolve();
      await until(() => !document.querySelector('.list-board-task-drag-preview'), "preview released after row commit");
      const ids = Array.from(container.querySelectorAll<HTMLElement>('[data-board-drag-task]')).map(node => node.dataset.boardDragTask);
      assert(ids.length === 3 && new Set(ids).size === 3, "unique final task IDs");
      if (!move) assert(order[2].id === tasks[0].id, "actual reorder changes position");
      await clear();
    }
    Element.prototype.remove = remove;
    for (const variant of ["off-next", "off-last", "on-rest", "on-next", "on-read-failed", "on-stale-read", "on-target-aba", "next-failed", "refresh-failed", "rejected"]) {
      currentVariant = variant; trace.length = 0;
      focus = true; success = variant.startsWith("on-"); failComplete = variant === "rejected";
      failNext = variant === "next-failed"; failRead = variant === "refresh-failed";
      failPrivateRead = variant === "on-read-failed";
      completionReplyDelivered = false; privateReadClaimed = false; parentReadCount = 0; privateRead = deferred(); lateRead = deferred(); captureStaleNextRead = false;
      order = variant === "on-next" ? [...tasks]
        : ["off-next", "on-read-failed", "on-stale-read", "on-target-aba", "next-failed", "refresh-failed"].includes(variant) ? tasks.slice(0, 2) : tasks.slice(0, 1);
      completed = []; timer = idle(); holdRead = false; read = deferred(); completion = deferred(); crossLane = false;
      flushSync(() => root.render(<FocusSurfaceCoordinator />));
      await until(() => query<HTMLButtonElement>('[data-focus-row-action="make-live"]')?.disabled === false, "make-live enabled");
      await chooseTarget(listId);
      query<HTMLButtonElement>('[data-focus-row-action="make-live"]')!.click();
      await until(() => query<HTMLButtonElement>('[data-focus-action="done"]')?.disabled === false, "Done enabled");
      if (variant === "on-stale-read") {
        captureStaleNextRead = true;
        emit("board-data-invalidated", null);
        await until(() => !captureStaleNextRead, "old parent read started before completion");
      }
      let rejectedDraft: HTMLElement | null = null;
      if (failComplete) {
        query<HTMLButtonElement>('[data-focus-action="notes"]')!.click();
        await until(() => query('[data-task-note-control="editor"]'), "notes editor opened before rejection");
        rejectedDraft = query<HTMLElement>('[data-task-note-control="editor"]')!;
        rejectedDraft.textContent = "Unsaved rejected-completion draft";
        rejectedDraft.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText" }));
      }
      const initialStarts = startCalls, initialCompletes = completeCalls;
      // Observe each actual DOM mutation delivery, including the FIRST success
      // commit. Polling after a later refresh hid the native next-row omission.
      const successCommits: { pending: boolean; remaining: string[]; done: string; count: string }[] = [];
      const observeSuccess = () => {
        if (!query('[data-focus-completion-success]')) return;
        successCommits.push({
          pending: Boolean(query('[data-focus-advance-summary="pending"]')),
          remaining: Array.from(container.querySelectorAll('[data-focus-task-row="remaining"]'))
            .map(row => row.textContent ?? ""),
          done: query('[data-focus-group="done"]')?.textContent ?? "",
          count: query('[data-focus-done-count]')?.textContent ?? "",
        });
      };
      const successObserver = new MutationObserver(observeSuccess);
      activeSuccessObserver = successObserver;
      successObserver.observe(container, { subtree: true, childList: true, attributes: true, characterData: true });
      query<HTMLButtonElement>('[data-focus-action="done"]')!.click();
      await until(() => completeCalls === initialCompletes + 1, "completion dispatched once");
      await wait(); await wait();
      if (!failComplete) assert(query('[data-focus-advance-phase="completing"]'), variant + " intent survives event before reply");
      else assert(rejectedDraft?.isConnected && query<HTMLButtonElement>('[data-focus-action="done"]')?.disabled,
        "before any committed event, live draft remains mounted with busy actions");
      assert(!query('[data-focus-live-card="false"]'), variant + " never generic idle during commit");
      assert(!Array.from(container.querySelectorAll('[data-focus-task-row="remaining"]')).some(row => row.textContent?.includes(tasks[0].title)), "completed task not re-offered");
      if (failComplete) {
        completion.reject(new Error("controlled uncommitted rejection"));
        await until(() => query('[role="alert"]')?.textContent?.includes("controlled uncommitted rejection"), "parent rejection feedback");
        assert(query('[data-focus-action="done"]') && startCalls === initialStarts, "rejected Done restores live task without start");
        assert(rejectedDraft?.isConnected && query('[data-task-note-control="editor"]') === rejectedDraft
          && rejectedDraft.textContent === "Unsaved rejected-completion draft", "uncommitted rejection must preserve the mounted notes draft");
      } else {
        completion.resolve(); await wait();
        if (success) {
          if (variant === "on-target-aba") {
            await until(() => privateReadClaimed, "old target private read in flight");
            holdRead = false; read.resolve();
            await chooseTarget("__all_lists__"); await chooseTarget(listId);
            privateRead.resolve(); await wait(); await wait();
            assert(!query('[data-focus-completion-success]'), "old target continuation cannot publish success after target ABA");
            assert(query('[data-focus-group="done"]')?.textContent?.includes(tasks[0].title), "ABA retains authoritative completed task");
            await clear(); continue;
          }
          if (!failPrivateRead) privateRead.resolve();
          await until(() => query('[data-focus-completion-success]'), "success private read independent of parent board read");
          await Promise.resolve();
          successObserver.disconnect();
          const firstSuccess = successCommits[0];
          assert(firstSuccess, "first success DOM commit observed");
          assert(parentReadCount > 0, "independent parent board remains held");
          if (failPrivateRead) {
            assert(firstSuccess.pending && firstSuccess.remaining.length === 0 && firstSuccess.done === "",
              "FIRST failed-read success commit must stay fail-closed, not expose stale board");
            assert(!query('[data-focus-task-row="remaining"]')
              && !query('[data-focus-group="done"]') && !query('[data-focus-group="scheduled"]')
              && query('[data-focus-advance-summary="pending"]'), "private read failure must hide stale queue/header/done without retrying Done");
          } else {
            assert(!firstSuccess.pending && firstSuccess.count.startsWith("1/")
              && firstSuccess.done.includes(tasks[0].title)
              && firstSuccess.remaining.length === order.length
              && order.every(task => firstSuccess.remaining.some(row => row.includes(task.title))),
            "FIRST success commit must expose every authoritative next row and ready summary: " + JSON.stringify(firstSuccess));
            assert(!Array.from(container.querySelectorAll('[data-focus-task-row="remaining"]')).some(row => row.textContent?.includes(tasks[0].title)), "success must never re-offer completed task while parent board read is held");
            assert(query('[data-focus-done-count]')?.textContent?.startsWith("1/"), "success header must use same postcompletion board");
            assert(query('[data-focus-group="done"]')?.textContent?.includes(tasks[0].title), "success Done rows must use same postcompletion board");
            if (variant === "on-stale-read") {
              lateRead.resolve(); await wait(); await wait();
              assert(query('[data-focus-done-count]')?.textContent?.startsWith("1/")
                && !Array.from(container.querySelectorAll('[data-focus-task-row="remaining"]')).some(row => row.textContent?.includes(tasks[0].title)), "late stale parent reply cannot undo adopted completion board");
            }
          }
        } else assert(query('[data-focus-live-card="advancing"]'), "pending retained through delayed board read");
        holdRead = false; read.resolve();
        if (failPrivateRead) await until(() => query('[data-focus-done-count]')?.textContent?.startsWith("1/")
          && query('[data-focus-group="done"]'), "private-read failure recovers only on authoritative board");
        if (variant === "refresh-failed") {
          await until(() => query('[data-focus-advance-phase="refresh-blocked"]'), "committed failure stays fail-closed");
          assert(completed.length === 1 && !query('[data-focus-action="done"]'), "committed Done cannot be offered for retry");
        } else if (variant === "next-failed") {
          await until(() => !query('[data-focus-live-card="advancing"]'), "partial commit reconciles");
          assert(timer.runtime.timer.task_id === null && completed.length === 1
            && container.textContent?.includes("next task could not start automatically"), "failed next never claims Running or rejects saved Done");
        } else if (success) {
          await until(() => query('[data-focus-completion-success]'), "actual success card replaces intent");
          assert(startCalls === initialStarts, "Success ON never automatic next");
          if (variant === "on-next") {
            query<HTMLButtonElement>('[data-focus-success-action="next-task"]')!.click();
            await until(() => query('[data-focus-live-card="true"]')?.textContent?.includes(tasks[1].title), "explicit success Next starts eligible task");
            assert(startCalls === initialStarts + 1 && completed.length === 1, "explicit Next exactly once");
            await clear();
            continue;
          }
          query<HTMLButtonElement>('[data-focus-success-action="take-break"]')!.click();
          await until(() => container.textContent?.includes("Break time."), "actual coordinator rest status");
          await wait(2500);
          assert(!container.textContent?.includes(`${tasks[0].title} is now live.`), "timeout cannot reveal obsolete live status");
          assert(timer.runtime.timer.task_id === null && breakCalls === 0, "rest stays untimed and idle");
        } else if (variant === "off-next") {
          await until(() => query('[data-focus-live-card="true"]')?.textContent?.includes(tasks[1].title), "next live with settled board");
          assert(startCalls === initialStarts + 1 && completed.length === 1, "one next start and one completion");
        } else {
          await until(() => query('[data-focus-live-card="false"]'), "honest settled empty view");
          assert(startCalls === initialStarts && timer.runtime.timer.task_id === null, "no phantom next start");
        }
      }
      successObserver.disconnect();
      await clear();
    }
    assert(removalChecks === 2, "both production pointer release boundaries observed");
    return { nativeHandoffBoardDOMCommit: true, nativeHandoffEventBeforeReply: true,
      nativeHandoffSuccessOnRestStatus: true, nativeHandoffUncommittedRejection: true,
      nativeHandoffExplicitNext: true, nativeHandoffPartialFailure: true,
      nativeHandoffSuccessBoardAtomic: true, nativeHandoffSuccessReadRecovery: true,
      nativeHandoffFirstSuccessCommit: true };
  } finally {
    activeSuccessObserver?.disconnect();
    Element.prototype.remove = remove;
    flushSync(() => root.unmount());
    native.__TAURI_INTERNALS__ = previousNative;
    native.__TAURI_EVENT_PLUGIN_INTERNALS__ = previousEvents;
  }
}
