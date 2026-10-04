import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { AppShell } from "./AppShell";
import { FocusLiveActions } from "./FocusLiveActions";
import { SearchPalette } from "./SearchPalette";
import { FOCUS_IN_APP_SHORTCUT_EVENT, hasActiveModalShortcutBoundary } from "./inAppShortcuts";
import type { ListBoardTask } from "./listBoardApi";
import type { TimerSessionPayload } from "./timerSessionApi";

// Exercise real React handlers and Tauri callbacks; mock only native authority.
export async function runShortcutModalRegression(container: HTMLElement) {
  const assert = (value: unknown, message: string) => { if (!value) throw new Error("Modal shortcuts: " + message); };
  const wait = () => new Promise<void>(resolve => setTimeout(resolve, 30));
  const task: ListBoardTask = {
    id: "31111111-1111-4111-8111-111111111111", listId: "21111111-1111-4111-8111-111111111111",
    listTitle: "Test", listColor: null, title: "Modal isolation live task",
    estSeconds: null, timeTakenSeconds: "10", subtaskTotalCount: 0, subtaskCompletedCount: 0,
    scheduledLocalDate: null, scheduledLocalTime: null, isOverdue: false, completedAt: null,
  };
  const timer: TimerSessionPayload = {
    revision: 1, awaitingResume: false, change: null,
    runtime: { open_session_id: "41111111-1111-4111-8111-111111111111",
      timer: { state: "running", task_id: task.id, mode: { kind: "count_up" }, work_elapsed_ms: 10_000,
        total_break_ms: 0, countdown_remaining_ms: null, overtime_ms: 0, break_kind: null, break_remaining_ms: null } },
  };
  const calls: string[] = [];
  const callbacks = new Map<number, (event: unknown) => void>();
  const listeners = new Map<number, { event: string; handler: number }>();
  let callbackId = 0, notesRequests = 0, deferSnapshot = false;
  let releaseSnapshot: ((payload: TimerSessionPayload) => void) | undefined;
  const native = window as unknown as {
    __TAURI_INTERNALS__: { transformCallback: (callback: (event: unknown) => void) => number;
      invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> };
    __TAURI_EVENT_PLUGIN_INTERNALS__: { unregisterListener: (event: string, id: number) => void };
  };
  native.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener: (_event, id) => { listeners.delete(id); } };
  native.__TAURI_INTERNALS__ = {
    transformCallback(callback) { callbacks.set(++callbackId, callback); return callbackId; },
    async invoke(command, args = {}) {
      calls.push(command);
      if (command === "plugin:event|listen") {
        const id = Number(args.handler);
        listeners.set(id, { event: String(args.event), handler: id }); return id;
      }
      if (command.startsWith("plugin:event|")) return;
      if (command === "get_preference_settings") return {
        general: { hideTaskTimes: false }, focus: { defaultBreakSeconds: 600 }, celebration: { showSuccessScreen: false },
      };
      if (command === "get_home_snapshot") return { lists: [{ id: task.listId, title: "Test" }] };
      if (command === "get_list_board_snapshot") return {
        backlog: { tasks: [] }, thisWeek: { tasks: [] }, today: { tasks: [] }, done: { tasks: [] },
      };
      if (command === "get_archived_lists_for_settings") return { lists: [], doneTasks: [], filterLists: [] };
      if (command === "get_list_board_task_note") return { taskId: task.id, listId: task.listId, mutable: true, note: null };
      if (command === "timer_session_snapshot") return deferSnapshot
        ? new Promise<TimerSessionPayload>(resolve => { releaseSnapshot = resolve; }) : timer;
      if (command === "timer_pause") return {
        ...timer, revision: 2, runtime: { ...timer.runtime, timer: { ...timer.runtime.timer, state: "paused" } },
      };
      throw new Error("Unexpected native command: " + command);
    },
  };
  function key(target: HTMLElement, letter: string, greek = false, altKey = true) {
    const event = new KeyboardEvent("keydown", { key: greek ? "τ" : letter.toLowerCase(),
      code: "Key" + letter, ctrlKey: true, altKey, bubbles: true, cancelable: true });
    target.dispatchEvent(event); return event;
  }
  function addButton() {
    const button = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'))
      .find(candidate => candidate.textContent?.trim() === "Add task");
    assert(button, "real Add task button missing"); button!.focus();
    assert(document.activeElement === button, "modal button not focused"); return button!;
  }
  function escape(target: HTMLElement) {
    target.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  }
  function FocusFixture() {
    const [open, setOpen] = useState(true);
    return <main style={{ width: 340 }}>
      <FocusLiveActions task={task} target={{ kind: "all" }} timer={timer} fixtureMode={false}
        presentation="floating" onTimerPayload={() => {}}
        onEnsureNotesVisible={() => { notesRequests++; return false; }} />
      <SearchPalette open={open} initialMode="task-create" taskCreateOnly onRequestClose={() => setOpen(false)}
        onOpenList={() => {}} onOpenTask={() => {}} onAddList={() => {}} onGoReports={() => {}} onTaskCreated={() => {}} />
      <button id="after-modal">Focus after dialog</button>
    </main>;
  }
  const root = createRoot(container);
  flushSync(() => root.render(<FocusFixture />));
  await wait();
  addButton().click(); // Real form validation must remain local.
  await wait();
  const button = addButton(), baseline = calls.length;
  assert(hasActiveModalShortcutBoundary(), "active dialog not recognized");
  assert(Array.from(listeners.values()).some(listener => listener.event === FOCUS_IN_APP_SHORTCUT_EVENT),
    "real Focus event listener did not register");
  const actions = { B: "start-break", P: "pause-resume", S: "skip-task", F: "finish-task", N: "notes" };
  for (const greek of [false, true]) for (const letter of ["T", ...Object.keys(actions)]) {
    assert(key(button, letter, greek).defaultPrevented, "Focus modal left native action default available");
    for (const listener of listeners.values()) if (listener.event === FOCUS_IN_APP_SHORTCUT_EVENT) {
      callbacks.get(listener.handler)!({ event: listener.event, id: listener.handler,
        payload: letter === "T" ? "create-task" : actions[letter as keyof typeof actions] });
    }
    await wait();
  }
  for (const greek of [false, true]) {
    assert(key(button, "F", greek, false).defaultPrevented, "Focus modal left native Find available");
  }
  assert(calls.length === baseline && notesRequests === 0, "modal leaked keyboard/delivered action");
  const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
  button.dispatchEvent(enter);
  assert(!enter.defaultPrevented, "application routing consumed local Enter");
  escape(button); await wait();
  assert(!hasActiveModalShortcutBoundary(), "local Escape did not dismiss dialog");
  const after = document.querySelector<HTMLButtonElement>("#after-modal")!;
  after.focus(); key(after, "N"); await wait();
  assert(notesRequests === 1, "ordinary shortcut did not resume");
  const preparing = document.createElement("section");
  preparing.innerHTML = '<div role="dialog" aria-modal="true"><button>Preparing dialog</button></div>';
  document.body.append(preparing);
  for (const attribute of ["hidden", "inert", "aria-hidden"]) {
    preparing.setAttribute(attribute, attribute === "aria-hidden" ? "true" : "");
    assert(!hasActiveModalShortcutBoundary(), attribute + " preparation blocked active presentation");
    key(after, "N"); await wait(); preparing.removeAttribute(attribute);
  }
  preparing.style.display = "none";
  assert(!hasActiveModalShortcutBoundary(), "CSS-hidden preparation blocked input");
  preparing.remove();
  assert(notesRequests === 4, "inactive dialogs swallowed real shortcuts");
  key(after, "P"); await wait();
  assert(calls.filter(command => command === "timer_pause").length === 1, "post-modal Pause not delivered exactly once");
  flushSync(() => root.render(<AppShell fixtureMode homeContent={<button id="main-probe">Main shortcut target</button>} />));
  await wait();
  const main = document.querySelector<HTMLButtonElement>("#main-probe")!;
  main.focus(); key(main, "T"); await wait();
  const mainButton = addButton(), mainBaseline = calls.length;
  for (const greek of [false, true]) {
    for (const letter of ["T", "B", "P", "S", "F", "N"]) {
      assert(key(mainButton, letter, greek).defaultPrevented, "Main modal left native action default available");
    }
    assert(key(mainButton, "F", greek, false).defaultPrevented, "Main modal left native Find available");
  }
  await wait();
  assert(calls.length === mainBaseline, "Main modal delivered background command");
  assert(document.querySelector('[data-search-palette-mode="task-create"]'), "Ctrl+F changed modal mode");
  escape(mainButton); await wait(); main.focus();
  deferSnapshot = true; key(main, "B"); await wait();
  assert(releaseSnapshot, "Main did not read authority outside modal");
  key(main, "T"); await wait();
  const delivered = calls.filter(command => command === "plugin:event|emit_to").length;
  releaseSnapshot!(timer); await wait();
  assert(calls.filter(command => command === "plugin:event|emit_to").length === delivered,
    "pending Main snapshot delivered action after modal opened");
  deferSnapshot = false; escape(addButton()); await wait(); main.focus();
  key(main, "B"); await wait();
  assert(calls.filter(command => command === "plugin:event|emit_to").length === delivered + 1,
    "Main routing did not resume after dismissal");
  return { focusedButtonIsolated: true, deliveredEventsIsolated: true, localDialogKeysPreserved: true,
    inactiveModalIgnored: true, postModalAuthorityResumed: true, mainModalIsolated: true,
    pendingMainDeliveryIsolated: true, bothKeyboardLayouts: true, modalNativeDefaultsConsumed: true };
}
