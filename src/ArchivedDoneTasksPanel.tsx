import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import {
  getArchiveSnapshot,
  type ArchivedDoneTaskSummary,
  type ArchiveSnapshot,
} from "./listSettingsApi";
import "./archivePanel.css";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const ALL_LISTS = "all";

type ArchivedDoneTasksPanelProps = {
  fixtureSnapshot?: ArchiveSnapshot;
  fixtureFilterOpen?: boolean;
};

function taskAccent(color: string | null): CSSProperties | undefined {
  if (!color || !HEX_COLOR.test(color)) return undefined;
  return { "--archive-task-accent": color } as CSSProperties;
}

function formatTimeTaken(rawSeconds: string): string {
  const seconds = Number(rawSeconds);
  if (!Number.isSafeInteger(seconds) || seconds < 0) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}hr ${minutes}min`;
  if (hours > 0) return `${hours}hr`;
  return `${minutes}min`;
}

function formatCompletedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function ArchivedDoneTasksPanel({
  fixtureSnapshot,
  fixtureFilterOpen = false,
}: ArchivedDoneTasksPanelProps) {
  const [snapshot, setSnapshot] = useState<ArchiveSnapshot | null>(fixtureSnapshot ?? null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedListId, setSelectedListId] = useState(ALL_LISTS);
  const [filterOpen, setFilterOpen] = useState(fixtureFilterOpen);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (fixtureSnapshot) return;
    let disposed = false;
    void getArchiveSnapshot()
      .then((payload) => {
        if (!disposed) {
          setSnapshot(payload);
          setLoadError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setSnapshot(null);
          setLoadError(formatInvokeError(failure));
        }
      });
    return () => {
      disposed = true;
    };
  }, [fixtureSnapshot]);

  useEffect(() => {
    if (!filterOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setFilterOpen(false);
      filterButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filterOpen]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleTasks = useMemo(() => {
    const tasks = snapshot?.doneTasks ?? [];
    return tasks.filter((task) => {
      if (selectedListId !== ALL_LISTS && task.listId !== selectedListId) return false;
      if (!normalizedQuery) return true;
      return (
        task.title.toLocaleLowerCase().includes(normalizedQuery)
        || task.listTitle.toLocaleLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, selectedListId, snapshot]);

  const selectedList = snapshot?.filterLists.find((list) => list.id === selectedListId) ?? null;

  function selectList(listId: string) {
    setSelectedListId(listId);
    setFilterOpen(false);
    filterButtonRef.current?.focus();
  }

  return (
    <section
      className="archived-done-panel"
      data-archived-done-panel="true"
      aria-label="Archived done tasks"
    >
      <div className="archived-done-panel__controls">
        <label className="archived-done-panel__search">
          <span className="sr-only">Search archived done tasks</span>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search archived tasks"
            data-archive-search="true"
          />
        </label>

        <div className="archived-done-panel__filter">
          <button
            ref={filterButtonRef}
            type="button"
            className="archived-done-panel__filter-button motion-interactive"
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((value) => !value)}
            data-archive-list-filter="true"
          >
            <span>{selectedList?.title ?? "All Lists"}</span>
            <span aria-hidden="true">⌄</span>
          </button>
          {filterOpen ? (
            <div
              className="archived-done-panel__filter-menu"
              role="listbox"
              aria-label="Filter archived tasks by list"
              data-archive-filter-menu="true"
            >
              <button
                type="button"
                role="option"
                aria-selected={selectedListId === ALL_LISTS}
                onClick={() => selectList(ALL_LISTS)}
              >
                All Lists
              </button>
              {snapshot?.filterLists.map((list) => (
                <button
                  key={list.id}
                  type="button"
                  role="option"
                  aria-selected={selectedListId === list.id}
                  onClick={() => selectList(list.id)}
                >
                  <span
                    className="archived-done-panel__filter-dot"
                    style={taskAccent(list.color)}
                    aria-hidden="true"
                  />
                  {list.title}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {loadError ? <div className="archive-panel__error" role="alert">{loadError}</div> : null}

      {snapshot === null && !loadError ? (
        <div className="archive-panel__loading" role="status">Loading archived tasks…</div>
      ) : visibleTasks.length === 0 ? (
        <div className="archive-panel__empty" data-archived-done-empty="true">
          <span className="archive-panel__empty-icon" aria-hidden="true">✓</span>
          <strong>No Archived tasks found</strong>
          <span>
            {normalizedQuery || selectedListId !== ALL_LISTS
              ? "No archived done tasks match the current search and list filter."
              : "Completed tasks older than 60 days will appear here automatically."}
          </span>
        </div>
      ) : (
        <div className="archived-done-panel__items" data-archived-done-results="true">
          {visibleTasks.map((task: ArchivedDoneTaskSummary) => (
            <article
              key={task.id}
              className="archived-done-row"
              data-archived-task-id={task.id}
              style={taskAccent(task.listColor)}
            >
              <span className="archived-done-row__status" aria-hidden="true">✓</span>
              <div className="archived-done-row__copy">
                <h2 className="archived-done-row__title type-section-title">{task.title}</h2>
                <span className="type-metadata">
                  {task.listTitle} · Completed {formatCompletedDate(task.completedAt)}
                </span>
              </div>
              <span className="archived-done-row__time type-metadata">
                {formatTimeTaken(task.timeTakenSeconds)}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
