import { useState } from "react";
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
};

export function ArchivePanel({
  fixtureTab,
  fixtureLists,
  fixtureSnapshot,
  fixtureFilterOpen = false,
}: ArchivePanelProps) {
  const [activeTab, setActiveTab] = useState<ArchiveTab>(fixtureTab ?? "lists");

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
          type="button"
          role="tab"
          aria-selected={activeTab === "lists"}
          aria-controls="archive-lists-tabpanel"
          className="archive-panel__tab motion-interactive"
          onClick={() => setActiveTab("lists")}
          data-archive-tab="lists"
        >
          Archived lists
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "done"}
          aria-controls="archive-done-tabpanel"
          className="archive-panel__tab motion-interactive"
          onClick={() => setActiveTab("done")}
          data-archive-tab="done"
        >
          Archived done tasks
        </button>
      </div>

      {activeTab === "lists" ? (
        <div id="archive-lists-tabpanel" role="tabpanel" aria-label="Archived lists">
          <ArchivedListsPanel fixtureLists={fixtureLists} embedded />
        </div>
      ) : (
        <div id="archive-done-tabpanel" role="tabpanel" aria-label="Archived done tasks">
          <ArchivedDoneTasksPanel
            fixtureSnapshot={fixtureSnapshot}
            fixtureFilterOpen={fixtureFilterOpen}
          />
        </div>
      )}
    </section>
  );
}
