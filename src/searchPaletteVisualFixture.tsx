import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { AppShell } from "./AppShell";
import { HomeDashboard, type HomeSnapshot } from "./HomeDashboard";
import { SearchPalette, type SearchPaletteMode } from "./SearchPalette";
import type { SearchPaletteData } from "./searchPaletteApi";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "dark" ? "dark" : "light";
const requestedMode = params.get("mode");
const mode = requestedMode === "results"
  || requestedMode === "no-results"
  || requestedMode === "task-create"
  ? requestedMode
  : "empty";

document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");

const homeSnapshot: HomeSnapshot = {
  pendingCount: 5,
  aggregateEstSeconds: 9000,
  lists: [
    {
      id: "91111111-1111-4111-8111-111111111111",
      title: "Project Atlas",
      color: "#48d6c5",
      iconAsset: null,
      pendingCount: 3,
      aggregateEstSeconds: 5400,
      previewTasks: [
        { id: "92111111-1111-4111-8111-111111111111", title: "Draft project update", estSeconds: 1800 },
      ],
    },
    {
      id: "91111111-1111-4111-8111-111111111112",
      title: "Study",
      color: "#b7d96d",
      iconAsset: null,
      pendingCount: 2,
      aggregateEstSeconds: 3600,
      previewTasks: [
        { id: "92111111-1111-4111-8111-111111111112", title: "Review chapter notes", estSeconds: 3600 },
      ],
    },
  ],
};

const searchData: SearchPaletteData = {
  lists: homeSnapshot.lists.map((list) => ({ id: list.id, title: list.title })),
  tasks: [
    {
      id: "92111111-1111-4111-8111-111111111111",
      listId: "91111111-1111-4111-8111-111111111111",
      listTitle: "Project Atlas",
      title: "Draft project update",
      lane: "Today",
    },
    {
      id: "92111111-1111-4111-8111-111111111112",
      listId: "91111111-1111-4111-8111-111111111112",
      listTitle: "Study",
      title: "Review chapter notes",
      lane: "This Week",
    },
    {
      id: "92111111-1111-4111-8111-111111111113",
      listId: "91111111-1111-4111-8111-111111111111",
      listTitle: "Project Atlas",
      title: "Archive project receipts",
      lane: "Backlog",
    },
  ],
};

const initialMode: SearchPaletteMode = mode === "task-create" ? "task-create" : "search";
const initialQuery = mode === "results" ? "project" : mode === "no-results" ? "unfindable" : "";
const fixtureAction = () => undefined;

function FixtureSurface() {
  return (
    <>
      <AppShell
        fixtureMode
        homeContent={<HomeDashboard fixtureSnapshot={homeSnapshot} fixtureHour={10} />}
      />
      <SearchPalette
        open
        fixtureData={searchData}
        initialMode={initialMode}
        initialQuery={initialQuery}
        onRequestClose={fixtureAction}
        onOpenList={fixtureAction}
        onOpenTask={fixtureAction}
        onAddList={fixtureAction}
        onGoReports={fixtureAction}
        onTaskCreated={fixtureAction}
      />
    </>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Search palette fixture root is missing.");
flushSync(() => {
  createRoot(root).render(<FixtureSurface />);
});
document.documentElement.dataset.searchPaletteFixtureReady = "true";
