import {
  type FormEvent as ReactFormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { formatInvokeError } from "./diagnosticApi";
import { createListBoardTask, type PlanningLaneToken } from "./listBoardApi";
import {
  getSearchPaletteData,
  type SearchPaletteData,
  type SearchPaletteTaskResult,
} from "./searchPaletteApi";
import "./searchPalette.css";

export type SearchPaletteMode = "search" | "task-create";

type SearchPaletteProps = {
  open: boolean;
  onRequestClose: () => void;
  onOpenList: (listId: string) => void;
  onOpenTask: (task: SearchPaletteTaskResult) => void;
  onAddList: () => void;
  onGoReports: () => void;
  onTaskCreated: (listId: string, taskId: string) => void;
  fixtureData?: SearchPaletteData;
  initialQuery?: string;
  initialMode?: SearchPaletteMode;
};

const FOCUSABLE_SELECTOR = [
  "button:not(:disabled)",
  "input:not(:disabled)",
  "select:not(:disabled)",
  '[href]:not([aria-disabled="true"])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function normalized(value: string): string {
  return value.trim().toLowerCase();
}

function SearchIcon() {
  return (
    <svg className="search-palette__search-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SearchPalette({
  open,
  onRequestClose,
  onOpenList,
  onOpenTask,
  onAddList,
  onGoReports,
  onTaskCreated,
  fixtureData,
  initialQuery = "",
  initialMode = "search",
}: SearchPaletteProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quickTaskTitleRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const suppressFocusRestoreRef = useRef(false);

  const [mode, setMode] = useState<SearchPaletteMode>(initialMode);
  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState<SearchPaletteData | null>(fixtureData ?? null);
  const [loading, setLoading] = useState(open && !fixtureData);
  const [dataError, setDataError] = useState<string | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskListId, setQuickTaskListId] = useState("");
  const [quickTaskLane, setQuickTaskLane] = useState<PlanningLaneToken | "">("");
  const [quickTaskPending, setQuickTaskPending] = useState(false);
  const [quickTaskError, setQuickTaskError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    suppressFocusRestoreRef.current = false;
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setMode(initialMode);
    setQuery(initialQuery);
    setQuickTaskTitle("");
    setQuickTaskListId("");
    setQuickTaskLane("");
    setQuickTaskPending(false);
    setQuickTaskError(null);

    const animationFrame = window.requestAnimationFrame(() => {
      if (initialMode === "task-create") quickTaskTitleRef.current?.focus();
      else searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (!suppressFocusRestoreRef.current) previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [open, initialMode, initialQuery]);

  useEffect(() => {
    if (!open) return;
    if (fixtureData) {
      setData(fixtureData);
      setLoading(false);
      setDataError(null);
      return;
    }

    let disposed = false;
    setData(null);
    setLoading(true);
    setDataError(null);
    void getSearchPaletteData()
      .then((payload) => {
        if (!disposed) {
          setData(payload);
          setLoading(false);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setData(null);
          setLoading(false);
          setDataError(formatInvokeError(failure));
        }
      });

    return () => {
      disposed = true;
    };
  }, [open, fixtureData]);

  const queryToken = normalized(query);
  const matchingLists = useMemo(
    () => queryToken && data
      ? data.lists.filter((list) => normalized(list.title).includes(queryToken))
      : [],
    [data, queryToken],
  );
  const matchingTasks = useMemo(
    () => queryToken && data
      ? data.tasks.filter((task) => normalized(task.title).includes(queryToken))
      : [],
    [data, queryToken],
  );

  if (!open) return null;

  const dismiss = () => {
    suppressFocusRestoreRef.current = false;
    onRequestClose();
  };

  const transition = (action: () => void) => {
    suppressFocusRestoreRef.current = true;
    onRequestClose();
    action();
  };

  const optionElements = () => Array.from(
    dialogRef.current?.querySelectorAll<HTMLButtonElement>(
      '[data-search-palette-option="true"]:not(:disabled)',
    ) ?? [],
  );

  const moveOptionFocus = (direction: "next" | "previous") => {
    const options = optionElements();
    if (options.length === 0) return;
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex = direction === "next"
      ? (currentIndex < 0 ? 0 : (currentIndex + 1) % options.length)
      : (currentIndex < 0 ? options.length - 1 : (currentIndex - 1 + options.length) % options.length);
    options[nextIndex]?.focus();
  };

  const trapTab = (event: ReactKeyboardEvent<HTMLElement>) => {
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
    ).filter((element) => element.tabIndex >= 0 && !element.hasAttribute("disabled"));
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const onDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dismiss();
      return;
    }
    if (event.key === "Tab") {
      trapTab(event);
      return;
    }
    if (mode !== "search" || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;

    const target = event.target as HTMLElement;
    const fromSearchInput = target === searchInputRef.current;
    const fromOption = Boolean(target.closest('[data-search-palette-option="true"]'));
    if (!fromSearchInput && !fromOption) return;

    event.preventDefault();
    moveOptionFocus(event.key === "ArrowDown" ? "next" : "previous");
  };

  const submitQuickTask = async (event: ReactFormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (quickTaskPending) return;

    const title = quickTaskTitle.trim();
    if (!title) {
      setQuickTaskError("Task title must not be empty.");
      return;
    }
    if (!quickTaskListId) {
      setQuickTaskError("Choose the list that should own this task.");
      return;
    }
    if (!quickTaskLane) {
      setQuickTaskError("Choose Backlog, This Week, or Today.");
      return;
    }

    setQuickTaskPending(true);
    setQuickTaskError(null);
    let taskId: string;
    try {
      taskId = await createListBoardTask({
        listId: quickTaskListId,
        lane: quickTaskLane,
        title,
      });
    } catch (failure: unknown) {
      setQuickTaskPending(false);
      setQuickTaskError(formatInvokeError(failure));
      return;
    }

    suppressFocusRestoreRef.current = true;
    onRequestClose();
    onTaskCreated(quickTaskListId, taskId);
  };

  const renderSearchSurface = () => {
    const hasMatches = matchingLists.length > 0 || matchingTasks.length > 0;

    return (
      <>
        <h2 id="search-palette-title" className="search-palette__sr-only">Search Narro</h2>
        <div className="search-palette__query-row">
          <SearchIcon />
          <input
            ref={searchInputRef}
            className="search-palette__query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for tasks, lists"
            aria-label="Search tasks and lists"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="search-palette__shortcut" aria-label="Control F">Ctrl+F</kbd>
        </div>

        <div className="search-palette__body">
          {dataError ? (
            <div className="search-palette__error" role="alert">
              Local search data could not be loaded. {dataError}
            </div>
          ) : null}

          {queryToken ? (
            loading ? (
              <div className="search-palette__message" role="status">Searching local tasks and lists…</div>
            ) : hasMatches ? (
              <div className="search-palette__results" data-search-palette-results="true">
                {matchingLists.length > 0 ? (
                  <section aria-labelledby="search-palette-lists-title">
                    <h3 id="search-palette-lists-title" className="search-palette__section-title type-metadata">
                      Lists
                    </h3>
                    <div className="search-palette__option-list">
                      {matchingLists.map((list) => (
                        <button
                          key={list.id}
                          type="button"
                          className="search-palette__option motion-interactive"
                          data-search-palette-option="true"
                          data-search-result-kind="list"
                          onClick={() => transition(() => onOpenList(list.id))}
                        >
                          <span className="search-palette__option-icon" aria-hidden="true">L</span>
                          <span className="search-palette__option-copy">
                            <strong>{list.title}</strong>
                            <span>List</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                {matchingTasks.length > 0 ? (
                  <section aria-labelledby="search-palette-tasks-title">
                    <h3 id="search-palette-tasks-title" className="search-palette__section-title type-metadata">
                      Tasks
                    </h3>
                    <div className="search-palette__option-list">
                      {matchingTasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          className="search-palette__option motion-interactive"
                          data-search-palette-option="true"
                          data-search-result-kind="task"
                          data-search-task-id={task.id}
                          onClick={() => transition(() => onOpenTask(task))}
                        >
                          <span className="search-palette__option-icon" aria-hidden="true">✓</span>
                          <span className="search-palette__option-copy">
                            <strong>{task.title}</strong>
                            <span>{task.listTitle} · {task.lane}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            ) : (
              <div className="search-palette__message" data-search-palette-empty="true">
                No matching tasks or lists.
              </div>
            )
          ) : (
            <section aria-labelledby="search-palette-actions-title">
              <h3 id="search-palette-actions-title" className="search-palette__section-title type-metadata">
                Quick actions
              </h3>
              <div className="search-palette__option-list" data-search-palette-actions="true">
                <button
                  type="button"
                  className="search-palette__option motion-interactive"
                  data-search-palette-option="true"
                  onClick={() => {
                    setMode("task-create");
                    window.requestAnimationFrame(() => quickTaskTitleRef.current?.focus());
                  }}
                  disabled={loading || Boolean(dataError)}
                >
                  <span className="search-palette__option-icon" aria-hidden="true">+</span>
                  <span className="search-palette__option-copy"><strong>Add new task</strong></span>
                </button>
                <button
                  type="button"
                  className="search-palette__option motion-interactive"
                  data-search-palette-option="true"
                  onClick={() => transition(onAddList)}
                >
                  <span className="search-palette__option-icon" aria-hidden="true">+</span>
                  <span className="search-palette__option-copy"><strong>Add new list</strong></span>
                </button>
                <button
                  type="button"
                  className="search-palette__option motion-interactive"
                  data-search-palette-option="true"
                  onClick={() => transition(onGoReports)}
                >
                  <span className="search-palette__option-icon" aria-hidden="true">↗</span>
                  <span className="search-palette__option-copy"><strong>Go to Reports</strong></span>
                </button>
              </div>
              {loading ? <p className="search-palette__loading-hint type-metadata">Loading local task data…</p> : null}
            </section>
          )}
        </div>
      </>
    );
  };

  const renderQuickTask = () => (
    <>
      <header className="search-palette__task-header">
        <button
          type="button"
          className="search-palette__back motion-interactive"
          onClick={() => {
            setMode("search");
            setQuickTaskError(null);
            window.requestAnimationFrame(() => searchInputRef.current?.focus());
          }}
          disabled={quickTaskPending}
        >
          ← Back
        </button>
        <div>
          <p className="search-palette__eyebrow type-metadata">Quick action</p>
          <h2 id="search-palette-title" className="search-palette__task-title type-section-title">Add new task</h2>
        </div>
      </header>

      {loading ? (
        <div className="search-palette__message" role="status">Loading active lists…</div>
      ) : dataError ? (
        <div className="search-palette__error" role="alert">Active lists could not be loaded. {dataError}</div>
      ) : data && data.lists.length === 0 ? (
        <div className="search-palette__message">
          <strong>Create a list first.</strong>
          <span>Quick task creation requires an explicit active list.</span>
          <button type="button" className="motion-interactive" onClick={() => transition(onAddList)}>
            Add new list
          </button>
        </div>
      ) : (
        <form className="search-palette__task-form" onSubmit={(event) => void submitQuickTask(event)}>
          <label className="search-palette__field">
            <span>Task title</span>
            <input
              ref={quickTaskTitleRef}
              type="text"
              value={quickTaskTitle}
              onChange={(event) => setQuickTaskTitle(event.target.value)}
              disabled={quickTaskPending}
              autoComplete="off"
              data-search-task-field="title"
            />
          </label>
          <label className="search-palette__field">
            <span>List</span>
            <select
              value={quickTaskListId}
              onChange={(event) => setQuickTaskListId(event.target.value)}
              disabled={quickTaskPending}
              data-search-task-field="list"
            >
              <option value="">Choose a list</option>
              {data?.lists.map((list) => (
                <option key={list.id} value={list.id}>{list.title}</option>
              ))}
            </select>
          </label>
          <label className="search-palette__field">
            <span>Planning lane</span>
            <select
              value={quickTaskLane}
              onChange={(event) => setQuickTaskLane(event.target.value as PlanningLaneToken | "")}
              disabled={quickTaskPending}
              data-search-task-field="lane"
            >
              <option value="">Choose a lane</option>
              <option value="backlog">Backlog</option>
              <option value="this_week">This Week</option>
              <option value="today">Today</option>
            </select>
          </label>

          {quickTaskError ? <div className="search-palette__error" role="alert">{quickTaskError}</div> : null}

          <footer className="search-palette__task-footer">
            <button
              type="button"
              className="search-palette__secondary motion-interactive"
              onClick={() => setMode("search")}
              disabled={quickTaskPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="search-palette__primary motion-interactive"
              disabled={quickTaskPending}
            >
              {quickTaskPending ? "Adding…" : "Add task"}
            </button>
          </footer>
        </form>
      )}
    </>
  );

  return (
    <div
      className="search-palette-backdrop motion-overlay"
      data-search-palette-backdrop="true"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <section
        ref={dialogRef}
        className="search-palette motion-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-palette-title"
        data-search-palette="main"
        data-search-palette-mode={mode}
        onKeyDown={onDialogKeyDown}
      >
        {mode === "search" ? renderSearchSurface() : renderQuickTask()}
      </section>
    </div>
  );
}
