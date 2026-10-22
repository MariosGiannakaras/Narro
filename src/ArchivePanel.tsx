import { type KeyboardEvent as ReactKeyboardEvent, useRef, useState } from "react";
import { ArchivedDoneTasksPanel } from "./ArchivedDoneTasksPanel";
import { ArchivedListsPanel } from "./ArchivedListsPanel";
import type { ArchiveSnapshot, ArchivedListSummary } from "./listSettingsApi";
import "./archivePanel.css";

export type ArchiveTab = "lists" | "done";

type ArchivePanelProps = {
  fixtureTab?: ArchiveTab;
  fixtureLists?: ArchivedListSummary[];
  fixtureSnapshot?: ArchiveSnapshot;
  fixtureFilterOpen?: boolean;
  fixtureDeleteOpen?: boolean;
};

export function ArchivePanel({
  fixtureTab,
  fixtureLists,
  fixtureSnapshot,
  fixtureFilterOpen = false,
  fixtureDeleteOpen = false,
}: ArchivePanelProps) {
  const [activeTab, setActiveTab] = useState<ArchiveTab>(fixtureTab ?? "lists");
  const listsTabRef = useRef<HTMLButtonElement>(null);
  const doneTabRef = useRef<HTMLButtonElement>(null);

  function handleTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, from: ArchiveTab) {
    const next: ArchiveTab | null = event.key === "Home"
      ? "lists"
      : event.key === "End"
        ? "done"
        : event.key === "ArrowLeft" || event.key === "ArrowRight"
          ? from === "lists" ? "done" : "lists"
          : null;
    if (!next) return;
    event.preventDefault();
    setActiveTab(next);
    (next === "lists" ? listsTabRef : doneTabRef).current?.focus();
  }

  return (
    <section className="archive-panel" data-archive-panel="true" aria-labelledby="archive-panel-title">
      <header className="archive-panel__header">
        <div>
          <p className="archive-panel__eyebrow type-metadata">Archive</p>
          <h1 id="archive-panel-title" className="type-page-title">Archived items</h1>
        </div>
      </header>

      <div className="archive-panel__tabs" role="tablist" aria-label="Archive sections">
        <button
          ref={listsTabRef}
          type="button"
          id="archive-lists-tab"
          role="tab"
          tabIndex={activeTab === "lists" ? 0 : -1}
          aria-selected={activeTab === "lists"}
          aria-controls="archive-lists-tabpanel"
          className="archive-panel__tab motion-interactive"
          onKeyDown={(event) => handleTabKeyDown(event, "lists")}
          onClick={() => setActiveTab("lists")}
          data-archive-tab="lists"
        >
          Archived lists
        </button>
        <button
          ref={doneTabRef}
          type="button"
          id="archive-done-tab"
          role="tab"
          tabIndex={activeTab === "done" ? 0 : -1}
          aria-selected={activeTab === "done"}
          aria-controls="archive-done-tabpanel"
          className="archive-panel__tab motion-interactive"
          onKeyDown={(event) => handleTabKeyDown(event, "done")}
          onClick={() => setActiveTab("done")}
          data-archive-tab="done"
        >
          Archived done tasks
        </button>
      </div>

      <div id="archive-lists-tabpanel" role="tabpanel" aria-labelledby="archive-lists-tab"
        hidden={activeTab !== "lists"} tabIndex={activeTab === "lists" ? 0 : undefined}>
        {activeTab === "lists" ? (
          <ArchivedListsPanel fixtureLists={fixtureLists} embedded />
        ) : null}
      </div>
      <div id="archive-done-tabpanel" role="tabpanel" aria-labelledby="archive-done-tab"
        hidden={activeTab !== "done"} tabIndex={activeTab === "done" ? 0 : undefined}>
        {activeTab === "done" ? (
          <ArchivedDoneTasksPanel
            fixtureSnapshot={fixtureSnapshot}
            fixtureFilterOpen={fixtureFilterOpen}
            fixtureDeleteOpen={fixtureDeleteOpen}
          />
        ) : null}
      </div>
    </section>
  );
}
