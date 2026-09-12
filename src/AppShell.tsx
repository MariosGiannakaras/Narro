import { type ReactNode, useEffect, useState } from "react";
import { ArchivedListsPanel } from "./ArchivedListsPanel";
import { formatInvokeError } from "./diagnosticApi";
import { HomeDashboard, type HomeListCardSnapshot } from "./HomeDashboard";
import { ListBoard } from "./ListBoard";
import type { ListBoardRequestTarget } from "./listBoardApi";
import { ListEditorModal } from "./ListEditorModal";
import {
  createListFromEditor,
  type ListEditorRequest,
  updateListFromEditor,
} from "./listEditorApi";
import { ListMutationConfirmDialog } from "./ListMutationConfirmDialog";
import { archiveListFromSettings } from "./listSettingsApi";
import { SearchPalette } from "./SearchPalette";
import "./appShell.css";

export type AppDestination =
  | "home"
  | "reports"
  | "create-list"
  | "all-lists"
  | "archived-lists"
  | "search"
  | "settings";

type AppShellProps = {
  children?: ReactNode;
  fixtureMode?: boolean;
  homeContent?: ReactNode;
};

type DestinationCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

type ListEditorState =
  | { mode: "create" }
  | { mode: "edit"; list: HomeListCardSnapshot };

const destinationCopy: Record<AppDestination, DestinationCopy> = {
  home: {
    eyebrow: "Planning",
    title: "Home",
    description: "Your Lists and planning workspace.",
  },
  reports: {
    eyebrow: "History",
    title: "Reports",
    description: "Local productivity reports will use this destination without changing the shell geometry.",
  },
  "create-list": {
    eyebrow: "Lists",
    title: "Create a new list",
    description: "Create a local list without leaving the Home workspace.",
  },
  "all-lists": {
    eyebrow: "Lists",
    title: "All my lists",
    description: "Tasks from active local lists share one planning board without becoming a persisted synthetic list.",
  },
  "archived-lists": {
    eyebrow: "Archive",
    title: "Archived lists",
    description: "Restore archived lists or permanently delete them after explicit confirmation.",
  },
  search: {
    eyebrow: "Find",
    title: "Search",
    description: "Search opens as a keyboard-first overlay rather than replacing the current workspace.",
  },
  settings: {
    eyebrow: "Preferences",
    title: "Settings",
    description: "Preferences will open from this stable utility position when their ordered milestone is implemented.",
  },
};

function NavButton({
  destination,
  activeDestination,
  label,
  onNavigate,
  className = "",
}: {
  destination: AppDestination;
  activeDestination: AppDestination;
  label: string;
  onNavigate: (destination: AppDestination) => void;
  className?: string;
}) {
  const active = destination === activeDestination;

  return (
    <button
      type="button"
      className={`app-shell__nav-button ${className}`.trim()}
      aria-current={active ? "page" : undefined}
      onClick={() => onNavigate(destination)}
    >
      {label}
    </button>
  );
}

export function AppShell({ children, fixtureMode = false, homeContent }: AppShellProps) {
  const [activeDestination, setActiveDestination] = useState<AppDestination>("home");
  const [boardTarget, setBoardTarget] = useState<ListBoardRequestTarget | null>(null);
  const [editorState, setEditorState] = useState<ListEditorState | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<HomeListCardSnapshot | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [homeRefreshKey, setHomeRefreshKey] = useState(0);
  const copy = destinationCopy[activeDestination];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !event.ctrlKey
        || event.altKey
        || event.shiftKey
        || event.key.toLowerCase() !== "f"
      ) return;

      event.preventDefault();
      if (editorState || archiveTarget) return;
      setSearchOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editorState, archiveTarget]);

  function openCreateList() {
    setSearchOpen(false);
    setEditorState({ mode: "create" });
  }

  function openEditList(list: HomeListCardSnapshot) {
    setSearchOpen(false);
    setEditorState({ mode: "edit", list });
  }

  function requestArchive(list: HomeListCardSnapshot) {
    setSearchOpen(false);
    setArchiveTarget(list);
    setArchiveError(null);
  }

  function openBoardTarget(target: ListBoardRequestTarget) {
    setSearchOpen(false);
    setBoardTarget(target);
    setActiveDestination("all-lists");
  }

  function openAllListsBoard() {
    openBoardTarget({ kind: "all" });
  }

  function openListBoard(list: HomeListCardSnapshot) {
    openBoardTarget({ kind: "list", id: list.id });
  }

  function handleNavigate(destination: AppDestination) {
    if (destination === "search") {
      setSearchOpen(true);
      return;
    }
    if (destination === "create-list") {
      openCreateList();
      return;
    }
    if (destination === "all-lists") {
      openAllListsBoard();
      return;
    }
    setSearchOpen(false);
    setBoardTarget(null);
    setActiveDestination(destination);
  }

  async function saveList(request: ListEditorRequest) {
    if (!editorState) return;
    try {
      if (editorState.mode === "create") {
        await createListFromEditor(request);
      } else {
        await updateListFromEditor(editorState.list.id, request);
      }
    } catch (failure) {
      throw new Error(formatInvokeError(failure));
    }

    setEditorState(null);
    setBoardTarget(null);
    setActiveDestination("home");
    setHomeRefreshKey((value) => value + 1);
  }

  async function confirmArchive() {
    if (!archiveTarget || archivePending) return;
    setArchivePending(true);
    setArchiveError(null);
    try {
      await archiveListFromSettings(archiveTarget.id);
      setArchiveTarget(null);
      setHomeRefreshKey((value) => value + 1);
    } catch (failure) {
      setArchiveError(formatInvokeError(failure));
    } finally {
      setArchivePending(false);
    }
  }

  const runtimeHome = homeContent ?? (
    <HomeDashboard
      refreshKey={homeRefreshKey}
      onOpenAllLists={openAllListsBoard}
      onCreateList={openCreateList}
      getListCardActions={(list) => ({
        onOpen: () => openListBoard(list),
        onEdit: () => openEditList(list),
        onArchive: () => requestArchive(list),
      })}
    />
  );

  return (
    <>
      <div
        className={`app-shell${fixtureMode ? " app-shell--fixture" : ""}`}
        data-app-shell="main"
        data-active-destination={activeDestination}
      >
        <aside className="app-shell__sidebar" aria-label="List navigation">
          <div className="app-shell__brand" aria-label="Narro">
            <span className="app-shell__brand-mark" aria-hidden="true">N</span>
            <span className="app-shell__brand-name">Narro</span>
          </div>

          <nav className="app-shell__list-nav" aria-label="Lists">
            <NavButton
              destination="create-list"
              activeDestination={activeDestination}
              label="+ Create new list"
              onNavigate={handleNavigate}
              className="app-shell__nav-button--create"
            />
            <div className="app-shell__divider" aria-hidden="true" />
            <NavButton
              destination="all-lists"
              activeDestination={activeDestination}
              label="All my lists"
              onNavigate={handleNavigate}
            />
            <NavButton
              destination="archived-lists"
              activeDestination={activeDestination}
              label="Archived lists"
              onNavigate={handleNavigate}
            />
          </nav>
        </aside>

        <section className="app-shell__workspace">
          <header className="app-shell__topbar">
            <div className="app-shell__topbar-spacer" aria-hidden="true" />
            <div className="app-shell__utilities" aria-label="Utilities">
              <NavButton
                destination="search"
                activeDestination={activeDestination}
                label="Search"
                onNavigate={handleNavigate}
                className="app-shell__utility-button"
              />
              <NavButton
                destination="settings"
                activeDestination={activeDestination}
                label="Settings"
                onNavigate={handleNavigate}
                className="app-shell__utility-button"
              />
            </div>
          </header>

          <main className="app-shell__content" id="main-content" tabIndex={-1}>
            {boardTarget ? (
              <ListBoard target={boardTarget} onTargetChange={openBoardTarget} />
            ) : activeDestination === "home" ? (
              runtimeHome
            ) : activeDestination === "archived-lists" ? (
              <ArchivedListsPanel />
            ) : (
              <section className="app-shell__placeholder" aria-labelledby="app-shell-page-title">
                <p className="app-shell__eyebrow type-metadata">{copy.eyebrow}</p>
                <h1 id="app-shell-page-title" className="app-shell__page-title type-page-title">
                  {copy.title}
                </h1>
                <p className="app-shell__description">{copy.description}</p>
              </section>
            )}

            {children}
          </main>

          <nav className="app-shell__primary-nav" aria-label="Primary">
            <NavButton
              destination="home"
              activeDestination={activeDestination}
              label="Home"
              onNavigate={handleNavigate}
              className="app-shell__primary-button"
            />
            <NavButton
              destination="reports"
              activeDestination={activeDestination}
              label="Reports"
              onNavigate={handleNavigate}
              className="app-shell__primary-button"
            />
          </nav>
        </section>
      </div>

      {editorState ? (
        <ListEditorModal
          mode={editorState.mode}
          initialList={editorState.mode === "edit" ? editorState.list : undefined}
          onRequestClose={() => setEditorState(null)}
          onSave={saveList}
        />
      ) : null}

      {archiveTarget ? (
        <ListMutationConfirmDialog
          action="archive"
          listTitle={archiveTarget.title}
          pending={archivePending}
          error={archiveError}
          onCancel={() => {
            if (!archivePending) {
              setArchiveTarget(null);
              setArchiveError(null);
            }
          }}
          onConfirm={() => void confirmArchive()}
        />
      ) : null}

      <SearchPalette
        open={searchOpen}
        onRequestClose={() => setSearchOpen(false)}
        onOpenList={(listId) => openBoardTarget({ kind: "list", id: listId })}
        onOpenTask={(task) => openBoardTarget({ kind: "list", id: task.listId })}
        onAddList={openCreateList}
        onGoReports={() => {
          setSearchOpen(false);
          setBoardTarget(null);
          setActiveDestination("reports");
        }}
        onTaskCreated={(listId, _taskId) => {
          setHomeRefreshKey((value) => value + 1);
          openBoardTarget({ kind: "list", id: listId });
        }}
      />
    </>
  );
}
