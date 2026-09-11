import { createRoot } from "react-dom/client";
import "./App.css";
import { AppShell } from "./AppShell";
import { ArchivedListsPanel } from "./ArchivedListsPanel";
import { HomeDashboard, type HomeSnapshot } from "./HomeDashboard";
import { ListMutationConfirmDialog } from "./ListMutationConfirmDialog";
import type { ArchivedListSummary } from "./listSettingsApi";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "dark" ? "dark" : "light";
const requestedMode = params.get("mode");
const mode = requestedMode === "archived" || requestedMode === "delete" ? requestedMode : "archive";
document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");

const activeSnapshot: HomeSnapshot = {
  pendingCount: 4,
  aggregateEstSeconds: 5400,
  lists: [
    {
      id: "81111111-1111-4111-8111-111111111111",
      title: "Study",
      color: "#48d6c5",
      iconAsset: null,
      pendingCount: 4,
      aggregateEstSeconds: 5400,
      previewTasks: [
        { id: "82111111-1111-4111-8111-111111111111", title: "Review chapter notes", estSeconds: 3600 },
        { id: "82111111-1111-4111-8111-111111111112", title: "Practice problem set", estSeconds: 1800 },
      ],
    },
  ],
};

const archivedLists: ArchivedListSummary[] = [
  {
    id: "83111111-1111-4111-8111-111111111111",
    title: "Old project",
    color: "#48d6c5",
    archivedAt: "2026-09-11T18:00:00Z",
  },
  {
    id: "83111111-1111-4111-8111-111111111112",
    title: "Reading backlog",
    color: "#b7d96d",
    archivedAt: "2026-09-10T18:00:00Z",
  },
];

const fixtureAction = () => undefined;

function FixtureSurface() {
  if (mode === "archive") {
    return (
      <>
        <AppShell
          fixtureMode
          homeContent={<HomeDashboard fixtureSnapshot={activeSnapshot} fixtureHour={20} />}
        />
        <ListMutationConfirmDialog
          action="archive"
          listTitle="Study"
          onCancel={fixtureAction}
          onConfirm={fixtureAction}
        />
      </>
    );
  }

  return (
    <>
      <AppShell
        fixtureMode
        homeContent={<ArchivedListsPanel fixtureLists={archivedLists} />}
      />
      {mode === "delete" ? (
        <ListMutationConfirmDialog
          action="delete"
          listTitle="Old project"
          onCancel={fixtureAction}
          onConfirm={fixtureAction}
        />
      ) : null}
    </>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("List settings fixture root is missing.");
createRoot(root).render(<FixtureSurface />);
window.requestAnimationFrame(() => {
  document.documentElement.dataset.listSettingsFixtureReady = "true";
});
