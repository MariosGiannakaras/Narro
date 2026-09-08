import { type CSSProperties, useEffect, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import {
  getListBoardSnapshot,
  type ListBoardLane,
  type ListBoardRequestTarget,
  type ListBoardSnapshot,
  type ListBoardTask,
} from "./listBoardApi";
import "./listBoard.css";

type ListBoardProps = {
  target: ListBoardRequestTarget;
  fixtureSnapshot?: ListBoardSnapshot;
};

type LaneKey = "backlog" | "thisWeek" | "today" | "done";

const LANES: Array<{ key: LaneKey; title: string }> = [
  { key: "backlog", title: "Backlog" },
  { key: "thisWeek", title: "This Week" },
  { key: "today", title: "Today" },
  { key: "done", title: "Done" },
];

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function formatEstimate(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function safeListAccent(color: string | null): CSSProperties | undefined {
  if (!color || !HEX_COLOR.test(color)) return undefined;
  return { "--list-board-task-accent": color } as CSSProperties;
}

function BoardTaskRow({ task, aggregateView }: { task: ListBoardTask; aggregateView: boolean }) {
  return (
    <article
      className="list-board-task"
      data-board-task="baseline"
      data-task-id={task.id}
      data-completed={task.completedAt ? "true" : "false"}
      style={safeListAccent(task.listColor)}
    >
      <div className="list-board-task__title-row">
        <span className="list-board-task__marker" aria-hidden="true" />
        <span className="list-board-task__title">{task.title}</span>
      </div>
      <div className="list-board-task__meta type-metadata">
        {aggregateView ? (
          <span className="list-board-task__list" title={task.listTitle}>
            {task.listTitle}
          </span>
        ) : null}
        <span className="list-board-task__est">Est: {formatEstimate(task.estSeconds ?? 0)}</span>
      </div>
    </article>
  );
}

function BoardLane({
  lane,
  title,
  aggregateView,
}: {
  lane: ListBoardLane;
  title: string;
  aggregateView: boolean;
}) {
  return (
    <section className="list-board-lane" data-board-lane={title} aria-labelledby={`list-board-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <header className="list-board-lane__header">
        <div>
          <h2 id={`list-board-${title.replace(/\s+/g, "-").toLowerCase()}`} className="type-section-title">
            {title}
          </h2>
          <span className="list-board-lane__count type-metadata">
            {lane.count} {lane.count === 1 ? "task" : "tasks"}
          </span>
        </div>
        <span className="list-board-lane__est type-metadata">
          Est: {formatEstimate(lane.aggregateEstSeconds)}
        </span>
      </header>

      <div className="list-board-lane__reserved-action" aria-hidden="true" data-board-add-slot="reserved" />

      <div className="list-board-lane__tasks" role="list" aria-label={`${title} tasks`}>
        {lane.tasks.length > 0 ? (
          lane.tasks.map((task) => (
            <div role="listitem" key={task.id}>
              <BoardTaskRow task={task} aggregateView={aggregateView} />
            </div>
          ))
        ) : (
          <div className="list-board-lane__empty type-metadata">No tasks</div>
        )}
      </div>

      <div className="list-board-lane__reserved-action list-board-lane__reserved-action--bottom" aria-hidden="true" data-board-add-slot="reserved" />
    </section>
  );
}

export function ListBoard({ target, fixtureSnapshot }: ListBoardProps) {
  const [snapshot, setSnapshot] = useState<ListBoardSnapshot | null>(fixtureSnapshot ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fixtureSnapshot) {
      setSnapshot(fixtureSnapshot);
      setError(null);
      return;
    }

    let disposed = false;
    setSnapshot(null);
    setError(null);
    void getListBoardSnapshot(target)
      .then((payload) => {
        if (!disposed) {
          setSnapshot(payload);
          setError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setSnapshot(null);
          setError(formatInvokeError(failure));
        }
      });

    return () => {
      disposed = true;
    };
  }, [fixtureSnapshot, target.kind, target.kind === "list" ? target.id : null]);

  if (error) {
    return (
      <section className="list-board list-board--message" data-list-board="error" role="alert">
        <strong>List board could not be loaded.</strong>
        <span>{error}</span>
      </section>
    );
  }

  if (!snapshot) {
    return (
      <section className="list-board list-board--message" data-list-board="loading" role="status">
        Loading your local planning board…
      </section>
    );
  }

  const aggregateView = snapshot.target.kind === "all_lists";

  return (
    <section className="list-board" data-list-board="main" data-board-target={snapshot.target.kind} aria-labelledby="list-board-title">
      <header className="list-board__header">
        <div className="list-board__identity">
          <span
            className="list-board__accent"
            aria-hidden="true"
            style={safeListAccent(snapshot.target.color)}
          />
          <div>
            <p className="list-board__eyebrow type-metadata">Planning</p>
            <h1 id="list-board-title" className="list-board__title type-page-title">
              {snapshot.target.title}
            </h1>
          </div>
        </div>
        <p className="list-board__helper">
          {aggregateView
            ? "Tasks from your active lists, organized into one planning view."
            : "Plan this list across Backlog, This Week, Today, and Done."}
        </p>
      </header>

      <div className="list-board__lanes" data-board-lane-count={LANES.length}>
        {LANES.map(({ key, title }) => (
          <BoardLane
            key={key}
            lane={snapshot[key]}
            title={title}
            aggregateView={aggregateView}
          />
        ))}
      </div>
    </section>
  );
}
