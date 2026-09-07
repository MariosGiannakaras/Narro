import { invoke } from "@tauri-apps/api/core";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import "./homeDashboard.css";

export type HomeTaskPreview = {
  id: string;
  title: string;
  estSeconds: number | null;
};

export type HomeListCardSnapshot = {
  id: string;
  title: string;
  color: string | null;
  iconAsset: string | null;
  previewTasks: HomeTaskPreview[];
  pendingCount: number;
  aggregateEstSeconds: number;
};

export type HomeSnapshot = {
  lists: HomeListCardSnapshot[];
  pendingCount: number;
  aggregateEstSeconds: number;
};

type HomeDashboardProps = {
  fixtureSnapshot?: HomeSnapshot;
  fixtureHour?: number;
};

type DisplayCard = {
  id: string;
  title: string;
  color: string | null;
  previewTasks: HomeTaskPreview[];
  pendingCount: number;
  aggregateEstSeconds: number;
  aggregate?: boolean;
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatEstimate(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function pendingLabel(count: number): string {
  return `${count} pending ${count === 1 ? "task" : "tasks"}`;
}

function safeAccent(color: string | null): CSSProperties | undefined {
  if (!color || !HEX_COLOR.test(color)) return undefined;
  return { "--home-list-accent": color } as CSSProperties;
}

function ListCard({ card }: { card: DisplayCard }) {
  const initial = card.aggregate ? "A" : card.title.trim().charAt(0).toUpperCase() || "L";

  return (
    <article
      className={`home-list-card${card.aggregate ? " home-list-card--aggregate" : ""}`}
      data-home-card={card.aggregate ? "all-lists" : "list"}
      style={safeAccent(card.color)}
    >
      <header className="home-list-card__header">
        <span className="home-list-card__icon" aria-hidden="true">{initial}</span>
        <h3 className="home-list-card__title">{card.title}</h3>
        <span className="home-list-card__action-slot" aria-hidden="true" />
      </header>

      <div className="home-list-card__preview" aria-label={`${card.title} task preview`}>
        {card.previewTasks.length > 0 ? (
          card.previewTasks.map((task) => (
            <div className="home-list-card__task" key={task.id}>
              <span className="home-list-card__task-dot" aria-hidden="true" />
              <span className="home-list-card__task-title">{task.title}</span>
              {task.estSeconds ? (
                <span className="home-list-card__task-est type-metadata">
                  {formatEstimate(task.estSeconds)}
                </span>
              ) : null}
            </div>
          ))
        ) : (
          <p className="home-list-card__empty">No pending task previews</p>
        )}
      </div>

      <footer className="home-list-card__footer type-metadata">
        <span>{pendingLabel(card.pendingCount)}</span>
        <span>Est: {formatEstimate(card.aggregateEstSeconds)}</span>
      </footer>
    </article>
  );
}

export function HomeDashboard({ fixtureSnapshot, fixtureHour }: HomeDashboardProps) {
  const [snapshot, setSnapshot] = useState<HomeSnapshot | null>(fixtureSnapshot ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fixtureSnapshot) return;

    let disposed = false;
    void invoke<HomeSnapshot>("get_home_snapshot")
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
  }, [fixtureSnapshot]);

  const greetingHour = fixtureHour ?? new Date().getHours();
  const aggregateCard = useMemo<DisplayCard | null>(() => {
    if (!snapshot || snapshot.lists.length === 0) return null;
    return {
      id: "all-lists",
      title: "All Lists",
      color: null,
      previewTasks: snapshot.lists.flatMap((list) => list.previewTasks).slice(0, 4),
      pendingCount: snapshot.pendingCount,
      aggregateEstSeconds: snapshot.aggregateEstSeconds,
      aggregate: true,
    };
  }, [snapshot]);

  return (
    <section className="home-dashboard" data-home-dashboard="main" aria-labelledby="home-title">
      <header className="home-dashboard__greeting">
        <p className="home-dashboard__eyebrow type-metadata">Home</p>
        <h1 id="home-title" className="home-dashboard__title type-page-title">
          {greetingForHour(greetingHour)}
        </h1>
        <p className="home-dashboard__subtitle">Plan the next work that deserves your attention.</p>
      </header>

      <section className="home-dashboard__lists" aria-labelledby="home-lists-title">
        <div className="home-dashboard__section-heading">
          <div>
            <h2 id="home-lists-title" className="type-section-title">Your Lists</h2>
            <p>Lists with your upcoming tasks</p>
          </div>
        </div>

        {error ? (
          <div className="home-dashboard__error" role="alert">
            Home data could not be loaded. {error}
          </div>
        ) : snapshot === null ? (
          <div className="home-dashboard__loading" role="status">Loading your local lists…</div>
        ) : snapshot.lists.length === 0 ? (
          <div className="home-dashboard__empty">
            <strong>No lists yet</strong>
            <span>Your local lists will appear here after you create one.</span>
          </div>
        ) : (
          <div className="home-dashboard__grid" data-home-list-count={snapshot.lists.length}>
            {aggregateCard ? <ListCard card={aggregateCard} /> : null}
            {snapshot.lists.map((list) => (
              <ListCard key={list.id} card={list} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
