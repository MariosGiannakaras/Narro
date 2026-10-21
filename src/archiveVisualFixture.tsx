import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { AppShell } from "./AppShell";
import { ArchivePanel, type ArchiveTab } from "./ArchivePanel";
import type { ArchiveSnapshot, ArchivedListSummary } from "./listSettingsApi";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "dark" ? "dark" : "light";
const requestedMode = params.get("mode");
const mode = ["lists-empty", "done-empty", "done-filter", "done-results", "done-delete-confirm"].includes(requestedMode ?? "")
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
      updatedAt: "2026-08-20T08:30:01Z",
      timeTakenSeconds: "4500",
      hasNote: true,
    },
    {
      id: "a2111111-1111-4111-8111-111111111112",
      listId: filterLists[1].id,
      listTitle: "Study",
      listColor: "#b7d96d",
      title: "Review distributed systems chapter",
      completedAt: "2026-06-18T18:00:00Z",
      archivedAt: "2026-08-18T18:00:01Z",
      updatedAt: "2026-08-18T18:00:01Z",
      timeTakenSeconds: "2700",
      hasNote: false,
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
  const snapshot = mode === "done-results" || mode === "done-delete-confirm" ? populatedSnapshot : emptySnapshot;
  return (
    <AppShell
      fixtureMode
      homeContent={(
        <ArchivePanel
          fixtureTab={tab}
          fixtureLists={emptyLists}
          fixtureSnapshot={snapshot}
          fixtureFilterOpen={mode === "done-filter"}
          fixtureDeleteOpen={mode === "done-delete-confirm"}
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
if (mode === "lists-empty" || mode === "done-empty") {
  // Exercise the real tab keyboard handler and React focus ownership in Edge,
  // restoring the starting tab before the screenshot is captured.
  const from: ArchiveTab = mode === "lists-empty" ? "lists" : "done";
  const to: ArchiveTab = from === "lists" ? "done" : "lists";
  const first = document.querySelector<HTMLButtonElement>('[data-archive-tab="' + from + '"]');
  const second = document.querySelector<HTMLButtonElement>('[data-archive-tab="' + to + '"]');
  if (!first || !second) throw new Error("Archive keyboard fixture tabs missing");
  first.focus();
  flushSync(() => first.dispatchEvent(new KeyboardEvent("keydown", {
    key: "ArrowRight", bubbles: true, cancelable: true,
  })));
  const advanced = second.getAttribute("aria-selected") === "true"
    && second.tabIndex === 0 && document.activeElement === second;
  flushSync(() => second.dispatchEvent(new KeyboardEvent("keydown", {
    key: "ArrowLeft", bubbles: true, cancelable: true,
  })));
  const restored = first.getAttribute("aria-selected") === "true"
    && first.tabIndex === 0 && second.tabIndex === -1 && document.activeElement === first;
  const listsButton = document.querySelector<HTMLButtonElement>('[data-archive-tab="lists"]');
  const doneButton = document.querySelector<HTMLButtonElement>('[data-archive-tab="done"]');
  if (!listsButton || !doneButton) throw new Error("Archive keyboard Home/End fixture tabs missing");
  flushSync(() => first.dispatchEvent(new KeyboardEvent("keydown", {
    key: "Home", bubbles: true, cancelable: true,
  })));
  const homeSelected = listsButton.getAttribute("aria-selected") === "true"
    && document.activeElement === listsButton;
  flushSync(() => listsButton.dispatchEvent(new KeyboardEvent("keydown", {
    key: "End", bubbles: true, cancelable: true,
  })));
  const endSelected = doneButton.getAttribute("aria-selected") === "true"
    && document.activeElement === doneButton;
  flushSync(() => doneButton.dispatchEvent(new KeyboardEvent("keydown", {
    key: from === "lists" ? "Home" : "End", bubbles: true, cancelable: true,
  })));
  const endpointRestored = first.getAttribute("aria-selected") === "true"
    && document.activeElement === first;
  const activePanel = document.getElementById("archive-" + from + "-tabpanel");
  const inactivePanel = document.getElementById("archive-" + to + "-tabpanel");
  const passed = advanced && restored && homeSelected && endSelected && endpointRestored
    && activePanel !== null && inactivePanel !== null
    && !activePanel.hidden && inactivePanel.hidden;
  document.documentElement.dataset.archiveTabsKeyboardPass = String(passed);
  if (!passed) throw new Error("Archive tabs must wrap keyboard arrows and retain focus/panel identity");
}
document.documentElement.dataset.archiveFixtureReady = "true";
