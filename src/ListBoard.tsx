import { invoke } from "@tauri-apps/api/core";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import type { HomeSnapshot } from "./HomeDashboard";
import {
  getListBoardSnapshot,
  type ListBoardLane,
  type ListBoardRequestTarget,
  type ListBoardSnapshot,
} from "./listBoardApi";
import { TaskCard } from "./TaskCard";
import "./listBoard.css";

type ListBoardProps = {
  target: ListBoardRequestTarget;
  fixtureSnapshot?: ListBoardSnapshot;
  onTargetChange?: (target: ListBoardRequestTarget) => void;
};

type LaneKey = "backlog" | "thisWeek" | "today" | "done";

type ListBoardOption = {
  id: string;
  title: string;
};

const LANES: Array<{ key: LaneKey; title: string }> = [
  { key: "backlog", title: "Backlog" },
  { key: "thisWeek", title: "This Week" },
  { key: "today", title: "Today" },
  { key: "done", title: "Done" },
];

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const ALL_LISTS_VALUE = "__all_lists__";

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

function BoardLane({
  lane,
  title,
  aggregateView,
}: {
  lane: ListBoardLane;
  title: string;
  aggregateView: boolean;
}) {
  const headingId = `list-board-${title.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <section className="list-board-lane" data-board-lane={title} aria-labelledby={headingId}>
      <header className="list-board-lane__header">
        <div>
          <h2 id={headingId} className="type-section-title">
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
              <TaskCard task={task} aggregateView={aggregateView} />
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

function fixtureOptions(snapshot: ListBoardSnapshot | undefined): ListBoardOption[] {
  if (!snapshot || snapshot.target.kind !== "list" || !snapshot.target.id) return [];
  return [{ id: snapshot.target.id, title: snapshot.target.title }];
}

export function ListBoard({ target, fixtureSnapshot, onTargetChange }: ListBoardProps) {
  const [snapshot, setSnapshot] = useState<ListBoardSnapshot | null>(fixtureSnapshot ?? null);
  const [error, setError] = useState<string | null>(null);
  const [listOptions, setListOptions] = useState<ListBoardOption[]>(() => fixtureOptions(fixtureSnapshot));

  useEffect(() => {
    if (fixtureSnapshot) {
      setSnapshot(fixtureSnapshot);
      setError(null);
      setListOptions(fixtureOptions(fixtureSnapshot));
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

  useEffect(() => {
    if (fixtureSnapshot) return;

    let disposed = false;
    void invoke<HomeSnapshot>("get_home_snapshot")
      .then((home) => {
        if (!disposed) {
          setListOptions(home.lists.map((list) => ({ id: list.id, title: list.title })));
        }
      })
      .catch(() => {
        if (!disposed) setListOptions([]);
      });

    return () => {
      disposed = true;
    };
  }, [fixtureSnapshot]);

  const selectorOptions = useMemo(() => {
    const options = [...listOptions];
    if (
      snapshot?.target.kind === "list"
      && snapshot.target.id
      && !options.some((option) => option.id === snapshot.target.id)
    ) {
      options.push({ id: snapshot.target.id, title: snapshot.target.title });
    }
    return options;
  }, [listOptions, snapshot]);

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
  const selectedTarget = aggregateView ? ALL_LISTS_VALUE : snapshot.target.id ?? ALL_LISTS_VALUE;

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

        <div className="list-board__controls">
          <label
            className="list-board__selector"
            data-board-list-selector="true"
            data-board-selected-target={selectedTarget}
          >
            <span className="type-metadata">List</span>
            <select
              value={selectedTarget}
              onChange={(event) => {
                if (!onTargetChange) return;
                const value = event.target.value;
                onTargetChange(
                  value === ALL_LISTS_VALUE
                    ? { kind: "all" }
                    : { kind: "list", id: value },
                );
              }}
              disabled={!onTargetChange}
              aria-label="Planning list"
            >
              <option value={ALL_LISTS_VALUE}>All Lists</option>
              {selectorOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.title}</option>
              ))}
            </select>
          </label>
          <p className="list-board__helper">
            {aggregateView
              ? "Tasks from your active lists, organized into one planning view."
              : "Plan this list across Backlog, This Week, Today, and Done."}
          </p>
        </div>
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
