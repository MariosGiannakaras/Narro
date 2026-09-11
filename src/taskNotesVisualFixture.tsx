import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { AppShell } from "./AppShell";
import { TaskCard, type TaskCardNotes } from "./TaskCard";
import type { BoardTaskNoteSnapshot, ListBoardTask, NoteDocument } from "./listBoardApi";
import "./listBoard.css";
import "./taskNotesVisualFixture.css";

const searchParams = new URLSearchParams(window.location.search);
const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
const presentation = searchParams.get("presentation") === "large" ? "large" : "compact";
document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");

const LIST_ID = "21111111-1111-4111-8111-111111111111";
const EDITABLE_TASK_ID = "31111111-1111-4111-8111-111111111111";
const READONLY_TASK_ID = "31111111-1111-4111-8111-111111111112";
const DRAFT_MARKER = "Draft survives presentation changes.";

const documentFixture: NoteDocument = {
  blocks: [
    {
      kind: "paragraph",
      runs: [
        { text: "Review ", bold: true },
        { text: "launch notes", italic: true, link: "https://example.com/narro" },
        { text: " before publishing.", strikethrough: true },
      ],
    },
    {
      kind: "bullet_list",
      items: [
        { runs: [{ text: "Confirm copy" }] },
        { runs: [{ text: "Check accessibility", bold: true }] },
      ],
    },
    {
      kind: "numbered_list",
      items: [
        { runs: [{ text: "Ship local build" }] },
        { runs: [{ text: "Review reports" }] },
      ],
    },
  ],
};

const snapshots: Record<string, BoardTaskNoteSnapshot> = {
  [EDITABLE_TASK_ID]: {
    taskId: EDITABLE_TASK_ID,
    listId: LIST_ID,
    mutable: true,
    note: {
      taskId: EDITABLE_TASK_ID,
      editorFormatVersion: 1,
      document: documentFixture,
      updatedAt: "2026-09-11T09:00:00Z",
    },
  },
  [READONLY_TASK_ID]: {
    taskId: READONLY_TASK_ID,
    listId: LIST_ID,
    mutable: true,
    note: {
      taskId: READONLY_TASK_ID,
      editorFormatVersion: 1,
      document: documentFixture,
      updatedAt: "2026-09-11T09:00:00Z",
    },
  },
};

type TauriInternals = {
  invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
};

(window as unknown as { __TAURI_INTERNALS__: TauriInternals }).__TAURI_INTERNALS__ = {
  invoke: async (command, args) => {
    if (command === "get_list_board_task_note") {
      const taskId = String(args?.taskId ?? "");
      const snapshot = snapshots[taskId];
      if (!snapshot) throw new Error(`Unknown fixture task: ${taskId}`);
      return snapshot;
    }
    throw new Error(`Unexpected fixture invoke: ${command}`);
  },
};

function task(id: string, title: string): ListBoardTask {
  return {
    id,
    listId: LIST_ID,
    listTitle: "Work",
    listColor: "#48d6c5",
    title,
    estSeconds: 2700,
    timeTakenSeconds: "1260",
    scheduledLocalDate: null,
    scheduledLocalTime: null,
    isOverdue: false,
    completedAt: null,
  };
}

const noop = () => undefined;
const ignoreStatus = (_status: string, _error: string | null) => undefined;
const ignoreBlocked = (_message: string) => undefined;

function notes(readOnly: boolean): TaskCardNotes {
  return {
    expanded: true,
    canExpand: true,
    readOnly,
    onToggleExpanded: noop,
    onMutationStatus: ignoreStatus,
    onRefreshBlocked: ignoreBlocked,
  };
}

function NotesFixtureContent() {
  return (
    <section
      className="task-notes-visual-fixture"
      data-task-notes-visual-fixture="true"
      data-task-notes-presentation={presentation}
      aria-labelledby="task-notes-visual-title"
    >
      <header className="task-notes-visual-fixture__header">
        <div>
          <p className="app-shell__eyebrow type-metadata">Task notes</p>
          <h1 id="task-notes-visual-title" className="type-page-title">Rich editor and read-only viewer</h1>
        </div>
        <p className="type-metadata">Production TaskCard · {theme} · {presentation}</p>
      </header>
      <div className="task-notes-visual-fixture__grid">
        <div className="task-notes-visual-fixture__item" data-task-notes-visual="editable">
          <span className="type-metadata">INDIVIDUAL LIST · EDITABLE</span>
          <TaskCard
            task={task(EDITABLE_TASK_ID, "Prepare launch review")}
            aggregateView={false}
            notes={notes(false)}
          />
        </div>
        <div className="task-notes-visual-fixture__item" data-task-notes-visual="readonly">
          <span className="type-metadata">ALL LISTS · READ ONLY</span>
          <TaskCard
            task={task(READONLY_TASK_ID, "Review shared project notes")}
            aggregateView
            notes={notes(true)}
          />
        </div>
      </div>
    </section>
  );
}

function Fixture() {
  return <AppShell fixtureMode homeContent={<NotesFixtureContent />} />;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Task notes fixture root is missing.");
flushSync(() => createRoot(rootElement).render(<Fixture />));

await new Promise<void>((resolve) => window.setTimeout(resolve, 80));

const requireElement = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Task notes fixture selector is missing: ${selector}`);
  return element;
};

let draftPreserved = true;
let editorNodePreserved = true;
if (presentation === "large") {
  const editor = requireElement<HTMLDivElement>(
    '[data-task-notes-visual="editable"] [data-task-note-control="editor"]',
  );
  const paragraph = editor.querySelector("p");
  if (!paragraph) throw new Error("Task notes editable paragraph is missing.");
  paragraph.append(` ${DRAFT_MARKER}`);
  editor.dispatchEvent(new InputEvent("input", {
    bubbles: true,
    inputType: "insertText",
    data: DRAFT_MARKER,
  }));
  await new Promise<void>((resolve) => window.setTimeout(resolve, 20));

  const presentationButton = requireElement<HTMLButtonElement>(
    '[data-task-notes-visual="editable"] [data-task-note-control="presentation"]',
  );
  presentationButton.click();
  await new Promise<void>((resolve) => window.setTimeout(resolve, 30));
  editorNodePreserved = document.querySelector('[data-task-note-control="editor"]') === editor;

  requireElement<HTMLButtonElement>(
    '[data-task-note-presentation="large"] [data-task-note-control="presentation"]',
  ).click();
  await new Promise<void>((resolve) => window.setTimeout(resolve, 30));
  editorNodePreserved = editorNodePreserved
    && document.querySelector('[data-task-note-control="editor"]') === editor;
  draftPreserved = editor.textContent?.includes(DRAFT_MARKER) ?? false;

  requireElement<HTMLButtonElement>(
    '[data-task-note-presentation="compact"] [data-task-note-control="presentation"]',
  ).click();
  await new Promise<void>((resolve) => window.setTimeout(resolve, 40));
  editorNodePreserved = editorNodePreserved
    && document.querySelector('[data-task-note-control="editor"]') === editor;
  draftPreserved = draftPreserved && (editor.textContent?.includes(DRAFT_MARKER) ?? false);

  if (!editorNodePreserved || !draftPreserved) {
    throw new Error("Large Notes presentation remounted the editor or discarded the unsaved draft.");
  }
}

type Geometry = { width: number; height: number };
const geometry = (selector: string): Geometry => {
  const rect = requireElement<HTMLElement>(selector).getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
};

const largeSurface = presentation === "large"
  ? requireElement<HTMLElement>('[data-task-note-presentation="large"]')
  : null;
const contract = {
  fixture: "task-notes",
  theme,
  presentation,
  viewport: { width: 1280, height: 720 },
  editableCard: geometry('[data-task-notes-visual="editable"] .list-board-task'),
  readonlyCard: geometry('[data-task-notes-visual="readonly"] .list-board-task'),
  editableTitleRow: geometry('[data-task-notes-visual="editable"] .list-board-task__title-row'),
  readonlyTitleRow: geometry('[data-task-notes-visual="readonly"] .list-board-task__title-row'),
  editableActionSlot: geometry('[data-task-notes-visual="editable"] .list-board-task__action-slot'),
  readonlyActionSlot: geometry('[data-task-notes-visual="readonly"] .list-board-task__action-slot'),
  editor: geometry('[data-task-notes-visual="editable"] [data-task-note-editor="true"]'),
  editorCanvas: geometry('[data-task-notes-visual="editable"] [data-task-note-control="editor"]'),
  readonlyViewer: geometry('[data-task-notes-visual="readonly"] [data-task-note-viewer="true"]'),
  explicitLinkControls: document.querySelectorAll('[data-task-note-control="open-link"]').length,
  formattingControls: document.querySelectorAll('[data-task-notes-visual="editable"] [data-task-note-control="format"]').length,
  presentationControls: document.querySelectorAll('[data-task-note-control="presentation"]').length,
  largeSurface: largeSurface ? geometry('[data-task-note-presentation="large"]') : null,
  largeDialog: Boolean(largeSurface?.matches('[role="dialog"][aria-modal="true"]')),
  resizablePresentation: largeSurface?.dataset.taskNoteResizable === "true",
  draftPreserved,
  editorNodePreserved,
};

const contractNode = document.createElement("script");
contractNode.id = "task-notes-visual-contract";
contractNode.type = "application/json";
contractNode.textContent = JSON.stringify(contract);
document.body.append(contractNode);
document.documentElement.dataset.taskNotesFixtureReady = "true";