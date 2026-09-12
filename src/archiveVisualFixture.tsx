import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { AppShell } from "./AppShell";
import { ArchivePanel, type ArchiveTab } from "./ArchivePanel";
import type { ArchiveSnapshot, ArchivedListSummary } from "./listSettingsApi";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "dark" ? "dark" : "light";
const requestedMode = params.get("mode");
const mode = ["lists-empty", "done-empty", "done-filter", "done-results"].includes(requestedMode ?? "")
  ? requestedMode!
  : "lists-empty";

document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");

const filterLists = [
  { id: "a1111111-1111-4111-8111-111111111111", title: "Work", color: "#48d6c5" },
  { id: "a1111111-1111-4111-8111-111111111112", title: "Study", color: "#b7d96d" },
];

const populatedSnapshot: ArchiveSnapshot = {
  lists: [],
  filterLists,
  doneTasks: [
    {
      id: "a2111111-1111-4111-8111-111111111111",
      listId: filterLists[0].id,
      listTitle: "Work",
      listColor: "#48d6c5",
      title: "Ship quarterly planning notes",
      completedAt: "2026-06-20T08:30:00Z",
      archivedAt: "2026-08-20T08:30:01Z",
      timeTakenSeconds: "4500",
    },
    {
      id: "a2111111-1111-4111-8111-111111111112",
      listId: filterLists[1].id,
      listTitle: "Study",
      listColor: "#b7d96d",
      title: "Review distributed systems chapter",
      completedAt: "2026-06-18T18:00:00Z",
      archivedAt: "2026-08-18T18:00:01Z",
      timeTakenSeconds: "2700",
    },
  ],
};

const emptySnapshot: ArchiveSnapshot = {
  lists: [],
  filterLists,
  doneTasks: [],
};

const emptyLists: ArchivedListSummary[] = [];

function FixtureSurface() {
  const tab: ArchiveTab = mode.startsWith("done-") ? "done" : "lists";
  const snapshot = mode === "done-results" ? populatedSnapshot : emptySnapshot;
  return (
    <AppShell
      fixtureMode
      homeContent={(
        <ArchivePanel
          fixtureTab={tab}
          fixtureLists={emptyLists}
          fixtureSnapshot={snapshot}
          fixtureFilterOpen={mode === "done-filter"}
        />
      )}
    />
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Archive fixture root is missing.");
flushSync(() => {
  createRoot(root).render(<FixtureSurface />);
});
document.documentElement.dataset.archiveFixtureReady = "true";
