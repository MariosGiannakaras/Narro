import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { AppShell } from "./AppShell";
import { TaskCard, type TaskCardMetricEditor } from "./TaskCard";
import type { ListBoardTask } from "./listBoardApi";
import "./listBoard.css";
import "./taskMetricVisualFixture.css";

const searchParams = new URLSearchParams(window.location.search);
const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");

const noop = () => undefined;
const ignoreChange = (_value: string) => undefined;

function task(id: string, title: string): ListBoardTask {
  return {
    id,
    listId: "11111111-1111-4111-8111-111111111111",
    listTitle: "Work",
    listColor: "#48d6c5",
    title,
    estSeconds: 3600,
    timeTakenSeconds: "900",
    scheduledLocalDate: null,
    scheduledLocalTime: null,
    isOverdue: false,
    completedAt: null,
  };
}

function editor(metric: "estimate" | "time_taken", value: string): TaskCardMetricEditor {
  return {
    metric,
    value,
    pending: false,
    onChange: ignoreChange,
    onSubmit: noop,
    onCancel: noop,
  };
}

function MetricFixtureContent() {
  return (
    <section
      className="task-metric-visual-fixture"
      data-task-metric-visual-fixture="true"
      aria-labelledby="task-metric-visual-title"
    >
      <header className="task-metric-visual-fixture__header">
        <div>
          <p className="app-shell__eyebrow type-metadata">Task metrics</p>
          <h1 id="task-metric-visual-title" className="type-page-title">Display and paused editing</h1>
        </div>
        <p className="type-metadata">Production TaskCard · {theme}</p>
      </header>
      <div className="task-metric-visual-fixture__grid">
        <div className="task-metric-visual-fixture__item" data-task-metric-visual="display">
          <span className="type-metadata">DISPLAY</span>
          <TaskCard task={task("81111111-1111-4111-8111-111111111111", "Review sprint plan")} aggregateView={false} />
        </div>
        <div className="task-metric-visual-fixture__item" data-task-metric-visual="estimate-edit">
          <span className="type-metadata">LIVE PAUSED · EST EDIT</span>
          <TaskCard
            task={task("81111111-1111-4111-8111-111111111112", "Prepare project review")}
            aggregateView={false}
            liveState="paused"
            metricEditor={editor("estimate", "1:00:00")}
          />
        </div>
        <div className="task-metric-visual-fixture__item" data-task-metric-visual="time-taken-edit">
          <span className="type-metadata">LIVE OVERTIME PAUSED · TIME TAKEN EDIT</span>
          <TaskCard
            task={task("81111111-1111-4111-8111-111111111113", "Resolve final feedback")}
            aggregateView={false}
            liveState="overtime_paused"
            metricEditor={editor("time_taken", "0:15:00")}
          />
        </div>
      </div>
    </section>
  );
}

function Fixture() {
  return <AppShell fixtureMode homeContent={<MetricFixtureContent />} />;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Task metric fixture root is missing.");
flushSync(() => createRoot(rootElement).render(<Fixture />));

type Geometry = { width: number; height: number };
const geometry = (selector: string): Geometry => {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Task metric fixture selector is missing: ${selector}`);
  const rect = element.getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
};

const contract = {
  fixture: "task-metrics",
  theme,
  viewport: { width: 1280, height: 720 },
  displayCard: geometry('[data-task-metric-visual="display"] .list-board-task'),
  estimateCard: geometry('[data-task-metric-visual="estimate-edit"] .list-board-task'),
  timeTakenCard: geometry('[data-task-metric-visual="time-taken-edit"] .list-board-task'),
  displayTitleRow: geometry('[data-task-metric-visual="display"] .list-board-task__title-row'),
  estimateTitleRow: geometry('[data-task-metric-visual="estimate-edit"] .list-board-task__title-row'),
  timeTakenTitleRow: geometry('[data-task-metric-visual="time-taken-edit"] .list-board-task__title-row'),
  estimateActionSlot: geometry('[data-task-metric-visual="estimate-edit"] .list-board-task__action-slot'),
  timeTakenActionSlot: geometry('[data-task-metric-visual="time-taken-edit"] .list-board-task__action-slot'),
  estimateMeta: geometry('[data-task-metric-visual="estimate-edit"] .list-board-task__meta'),
  timeTakenMeta: geometry('[data-task-metric-visual="time-taken-edit"] .list-board-task__meta'),
  estimateInput: geometry('[data-task-metric-input="estimate"]'),
  timeTakenInput: geometry('[data-task-metric-input="time_taken"]'),
};

const contractNode = document.createElement("script");
contractNode.id = "task-metric-visual-contract";
contractNode.type = "application/json";
contractNode.textContent = JSON.stringify(contract);
document.body.append(contractNode);
document.documentElement.dataset.taskMetricFixtureReady = "true";
