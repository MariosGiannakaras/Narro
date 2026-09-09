import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { TaskScheduleDialog } from "./TaskScheduleDialog";
import type { TaskScheduleEditorSnapshot } from "./taskScheduleApi";
import "./taskScheduleDialog.css";
import "./taskScheduleVisualFixture.css";

const searchParams = new URLSearchParams(window.location.search);
const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");

const taskId = "91111111-1111-4111-8111-111111111111";
const listId = "11111111-1111-4111-8111-111111111111";
const snapshot: TaskScheduleEditorSnapshot = {
  taskId,
  listId,
  schedule: {
    kind: "local_datetime",
    local_date: "2026-09-10",
    local_time: "15:30",
    timezone: "Europe/Athens",
  },
  recurrenceParentTaskId: null,
  recurrence: {
    id: "a1111111-1111-4111-8111-111111111111",
    intervalCount: 2,
    unit: "week",
    weekdayMask: 5,
    monthDay: null,
    startsLocalDate: "2026-09-14",
    localTime: "09:30",
    timezone: "Europe/Athens",
    replaceExisting: true,
    isActive: true,
    updatedAt: "2026-09-09T16:00:00Z",
  },
};

type TauriInternalsMock = {
  invoke: (command: string, args?: unknown) => Promise<unknown>;
};

(window as unknown as { __TAURI_INTERNALS__: TauriInternalsMock }).__TAURI_INTERNALS__ = {
  invoke: async (command) => {
    if (command === "get_list_board_task_schedule_editor") return snapshot;
    throw new Error(`Unexpected scheduling visual fixture command: ${command}`);
  },
};

const noop = () => undefined;
const committed = async () => undefined;

function Fixture() {
  return (
    <main className="task-schedule-visual-fixture" data-task-schedule-visual-fixture="true">
      <section className="task-schedule-visual-fixture__context" aria-hidden="true">
        <p className="type-metadata">Planning · Work</p>
        <h1 className="type-page-title">Scheduling editor regression fixture</h1>
        <div className="task-schedule-visual-fixture__columns">
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>
      <TaskScheduleDialog
        taskId={taskId}
        listId={listId}
        taskTitle="Plan release coordination"
        displayTimezone="Europe/Athens"
        onClose={noop}
        onCommitted={committed}
      />
    </main>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Task scheduling fixture root is missing.");
flushSync(() => createRoot(rootElement).render(<Fixture />));

async function waitForReady(): Promise<void> {
  const deadline = performance.now() + 5_000;
  while (performance.now() < deadline) {
    if (document.querySelector('[data-task-schedule-state="ready"]')) return;
    await new Promise<void>((resolve) => window.setTimeout(resolve, 10));
  }
  throw new Error("Task scheduling visual fixture did not reach ready state.");
}

await waitForReady();
await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

type Geometry = { x: number; y: number; width: number; height: number };
const geometry = (selector: string): Geometry => {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Task scheduling fixture selector is missing: ${selector}`);
  const rect = element.getBoundingClientRect();
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
};

const contract = {
  fixture: "task-scheduling",
  theme,
  viewport: { width: 1280, height: 720 },
  dialog: geometry(".task-schedule-dialog"),
  header: geometry(".task-schedule-dialog__header"),
  scheduleSection: geometry("#task-schedule-section-title"),
  recurrenceSection: geometry("#task-recurrence-section-title"),
  shortcuts: geometry(".task-schedule-dialog__shortcuts"),
  replaceExisting: geometry('[data-task-recurrence-control="replace-existing"]'),
  footer: geometry(".task-schedule-dialog__footer"),
};

const contractNode = document.createElement("script");
contractNode.id = "task-schedule-visual-contract";
contractNode.type = "application/json";
contractNode.textContent = JSON.stringify(contract);
document.body.append(contractNode);
document.documentElement.dataset.taskScheduleFixtureReady = "true";
