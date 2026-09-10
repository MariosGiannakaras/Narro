import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { AppShell } from "./AppShell";
import { TaskCard, type TaskCardSubtasks } from "./TaskCard";
import type { BoardSubtask, ListBoardTask } from "./listBoardApi";
import "./listBoard.css";
import "./taskSubtasksVisualFixture.css";

const searchParams = new URLSearchParams(window.location.search);
const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");

const noop = () => undefined;
const ignoreValue = (_value: string) => undefined;
const ignoreSubtask = (_subtask: BoardSubtask) => undefined;
const ignoreMove = (_subtask: BoardSubtask, _direction: "up" | "down") => undefined;

function task(id: string, title: string, completedAt: string | null = null): ListBoardTask {
  return {
    id,
    listId: "11111111-1111-4111-8111-111111111111",
    listTitle: "Work",
    listColor: "#48d6c5",
    title,
    estSeconds: 3600,
    timeTakenSeconds: "900",
    subtaskTotalCount: 3,
    subtaskCompletedCount: 2,
    scheduledLocalDate: null,
    scheduledLocalTime: null,
    isOverdue: false,
    completedAt,
  };
}

const subtasks: BoardSubtask[] = [
  {
    id: "91111111-1111-4111-8111-111111111111",
    taskId: "81111111-1111-4111-8111-111111111111",
    title: "Collect references",
    sortRank: 0,
    completedAt: "2026-09-10T09:01:00Z",
    updatedAt: "2026-09-10T09:01:00Z",
  },
  {
    id: "91111111-1111-4111-8111-111111111112",
    taskId: "81111111-1111-4111-8111-111111111111",
    title: "Draft outline",
    sortRank: 1,
    completedAt: "2026-09-10T09:02:00Z",
    updatedAt: "2026-09-10T09:02:00Z",
  },
  {
    id: "91111111-1111-4111-8111-111111111113",
    taskId: "81111111-1111-4111-8111-111111111111",
    title: "Review final copy",
    sortRank: 2,
    completedAt: null,
    updatedAt: "2026-09-10T09:03:00Z",
  },
];

function reparent(items: BoardSubtask[], taskId: string): BoardSubtask[] {
  return items.map((subtask) => ({ ...subtask, taskId }));
}

function controller(
  taskId: string,
  mutable: boolean,
  editor: { id: string; expectedTitle: string; value: string } | null = null,
): TaskCardSubtasks {
  return {
    model: {
      expanded: true,
      loading: false,
      error: null,
      mutable,
      subtasks: reparent(subtasks, taskId),
      createValue: mutable ? "Add launch checklist" : "",
      editor,
      pending: false,
    },
    canExpand: true,
    onToggleExpanded: noop,
    onCreateValueChange: ignoreValue,
    onCreate: noop,
    onStartEdit: ignoreSubtask,
    onEditValueChange: ignoreValue,
    onSaveEdit: noop,
    onCancelEdit: noop,
    onToggleCompleted: ignoreSubtask,
    onMove: ignoreMove,
    onDelete: ignoreSubtask,
  };
}

function SubtasksFixtureContent() {
  const mutableTask = task(
    "81111111-1111-4111-8111-111111111111",
    "Prepare project review",
  );
  const editingTask = task(
    "81111111-1111-4111-8111-111111111112",
    "Finalize launch brief",
  );
  const completedTask = task(
    "81111111-1111-4111-8111-111111111113",
    "Archive completed research",
    "2026-09-10T09:30:00Z",
  );

  return (
    <section
      className="task-subtasks-visual-fixture"
      data-task-subtasks-visual-fixture="true"
      aria-labelledby="task-subtasks-visual-title"
    >
      <header className="task-subtasks-visual-fixture__header">
        <div>
          <p className="app-shell__eyebrow type-metadata">Task subtasks</p>
          <h1 id="task-subtasks-visual-title" className="type-page-title">Expanded, editing, read-only</h1>
        </div>
        <p className="type-metadata">Production TaskCard · {theme}</p>
      </header>
      <div className="task-subtasks-visual-fixture__grid">
        <div className="task-subtasks-visual-fixture__item" data-task-subtasks-visual="expanded">
          <span className="type-metadata">ACTIVE · EXPANDED</span>
          <TaskCard
            task={mutableTask}
            aggregateView={false}
            subtasks={controller(mutableTask.id, true)}
          />
        </div>
        <div className="task-subtasks-visual-fixture__item" data-task-subtasks-visual="editing">
          <span className="type-metadata">ACTIVE · TITLE EDIT</span>
          <TaskCard
            task={editingTask}
            aggregateView={false}
            subtasks={controller(editingTask.id, true, {
              id: subtasks[2].id,
              expectedTitle: subtasks[2].title,
              value: "Review final copy",
            })}
          />
        </div>
        <div className="task-subtasks-visual-fixture__item" data-task-subtasks-visual="readonly">
          <span className="type-metadata">DONE · READ ONLY</span>
          <TaskCard
            task={completedTask}
            aggregateView={false}
            subtasks={controller(completedTask.id, false)}
          />
        </div>
      </div>
    </section>
  );
}

function Fixture() {
  return <AppShell fixtureMode homeContent={<SubtasksFixtureContent />} />;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Task subtasks fixture root is missing.");
flushSync(() => createRoot(rootElement).render(<Fixture />));

type Geometry = { width: number; height: number };
const geometry = (selector: string): Geometry => {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Task subtasks fixture selector is missing: ${selector}`);
  const rect = element.getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
};

const contract = {
  fixture: "task-subtasks",
  theme,
  viewport: { width: 1280, height: 720 },
  expandedCard: geometry('[data-task-subtasks-visual="expanded"] .list-board-task'),
  editingCard: geometry('[data-task-subtasks-visual="editing"] .list-board-task'),
  readonlyCard: geometry('[data-task-subtasks-visual="readonly"] .list-board-task'),
  expandedTitleRow: geometry('[data-task-subtasks-visual="expanded"] .list-board-task__title-row'),
  editingTitleRow: geometry('[data-task-subtasks-visual="editing"] .list-board-task__title-row'),
  readonlyTitleRow: geometry('[data-task-subtasks-visual="readonly"] .list-board-task__title-row'),
  expandedActionSlot: geometry('[data-task-subtasks-visual="expanded"] .list-board-task__action-slot'),
  editingActionSlot: geometry('[data-task-subtasks-visual="editing"] .list-board-task__action-slot'),
  readonlyActionSlot: geometry('[data-task-subtasks-visual="readonly"] .list-board-task__action-slot'),
  expandedPanel: geometry('[data-task-subtasks-visual="expanded"] [data-task-subtask-panel="true"]'),
  editingInput: geometry('[data-task-subtasks-visual="editing"] [data-task-subtask-control="title-input"]'),
};

const contractNode = document.createElement("script");
contractNode.id = "task-subtasks-visual-contract";
contractNode.type = "application/json";
contractNode.textContent = JSON.stringify(contract);
document.body.append(contractNode);
document.documentElement.dataset.taskSubtasksFixtureReady = "true";
