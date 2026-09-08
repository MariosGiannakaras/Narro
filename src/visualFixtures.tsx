import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { AppShell } from "./AppShell";
import { HomeDashboard, type HomeListCardSnapshot, type HomeSnapshot } from "./HomeDashboard";
import { ListBoard } from "./ListBoard";
import type { ListBoardSnapshot, ListBoardTask } from "./listBoardApi";
import { ListEditorModal } from "./ListEditorModal";
import { TaskCard, type TaskCardFixtureState } from "./TaskCard";
import "./visualFixtures.css";

const searchParams = new URLSearchParams(window.location.search);
const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
const requestedFixture = searchParams.get("fixture");
const fixture = requestedFixture === "app-shell"
  || requestedFixture === "home"
  || requestedFixture === "list-card-states"
  || requestedFixture === "list-editor-create"
  || requestedFixture === "list-editor-edit"
  || requestedFixture === "list-board"
  || requestedFixture === "list-board-all"
  || requestedFixture === "task-card-states"
  ? requestedFixture
  : "foundation";
const captureViewport = { width: 1280, height: 720 } as const;
document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");

const homeFixtureSnapshot: HomeSnapshot = {
  pendingCount: 8,
  aggregateEstSeconds: 19800,
  lists: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Work",
      color: "#32c7b5",
      iconAsset: null,
      pendingCount: 5,
      aggregateEstSeconds: 12600,
      previewTasks: [
        { id: "21111111-1111-4111-8111-111111111111", title: "Prepare project review", estSeconds: 3600 },
        { id: "21111111-1111-4111-8111-111111111112", title: "Reply to client notes", estSeconds: 1800 },
        { id: "21111111-1111-4111-8111-111111111113", title: "Outline next sprint", estSeconds: 2700 },
      ],
    },
    {
      id: "11111111-1111-4111-8111-111111111112",
      title: "Personal",
      color: "#8bcf55",
      iconAsset: null,
      pendingCount: 3,
      aggregateEstSeconds: 7200,
      previewTasks: [
        { id: "21111111-1111-4111-8111-111111111114", title: "Book dentist appointment", estSeconds: 900 },
        { id: "21111111-1111-4111-8111-111111111115", title: "Plan weekend errands", estSeconds: 1800 },
      ],
    },
  ],
};

const interactionFixtureSnapshot: HomeSnapshot = {
  pendingCount: 4,
  aggregateEstSeconds: 133200,
  lists: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      title: "Study",
      color: "#48d6c5",
      iconAsset: null,
      pendingCount: 4,
      aggregateEstSeconds: 133200,
      previewTasks: [
        { id: "43333333-3333-4333-8333-333333333331", title: "Review chapter notes", estSeconds: 3600 },
        { id: "43333333-3333-4333-8333-333333333332", title: "Practice problem set", estSeconds: 5400 },
        { id: "43333333-3333-4333-8333-333333333333", title: "Prepare flash cards", estSeconds: 1800 },
        { id: "43333333-3333-4333-8333-333333333334", title: "Draft revision plan", estSeconds: 2700 },
      ],
    },
  ],
};

type BoardTaskPresentation = {
  timeTakenSeconds?: string;
  scheduledLocalDate?: string | null;
  scheduledLocalTime?: string | null;
  isOverdue?: boolean;
};

function boardTask(
  id: string,
  title: string,
  estSeconds: number | null,
  listTitle = "Work",
  listColor: string | null = "#48d6c5",
  completedAt: string | null = null,
  presentation: BoardTaskPresentation = {},
): ListBoardTask {
  return {
    id,
    listId: listTitle === "Personal"
      ? "11111111-1111-4111-8111-111111111112"
      : "11111111-1111-4111-8111-111111111111",
    listTitle,
    listColor,
    title,
    estSeconds,
    timeTakenSeconds: presentation.timeTakenSeconds ?? "0",
    scheduledLocalDate: presentation.scheduledLocalDate ?? null,
    scheduledLocalTime: presentation.scheduledLocalTime ?? null,
    isOverdue: presentation.isOverdue ?? false,
    completedAt,
  };
}

const listBoardFixtureSnapshot: ListBoardSnapshot = {
  target: {
    kind: "list",
    id: "11111111-1111-4111-8111-111111111111",
    title: "Work",
    color: "#48d6c5",
  },
  displayTimezone: "Europe/Athens",
  backlog: {
    count: 2,
    aggregateEstSeconds: 5400,
    tasks: [
      boardTask("51111111-1111-4111-8111-111111111111", "Prepare quarterly outline", 3600),
      boardTask("51111111-1111-4111-8111-111111111112", "Review research notes", 1800),
    ],
  },
  thisWeek: {
    count: 2,
    aggregateEstSeconds: 4500,
    tasks: [
      boardTask("51111111-1111-4111-8111-111111111113", "Refine presentation", 2700),
      boardTask(
        "51111111-1111-4111-8111-111111111114",
        "Send project update",
        1800,
        "Work",
        "#48d6c5",
        null,
        { scheduledLocalDate: "2026-09-11" },
      ),
    ],
  },
  today: {
    count: 2,
    aggregateEstSeconds: 5400,
    tasks: [
      boardTask(
        "51111111-1111-4111-8111-111111111115",
        "Prepare project review",
        3600,
        "Work",
        "#48d6c5",
        null,
        { timeTakenSeconds: "900", scheduledLocalDate: "2026-09-07", isOverdue: true },
      ),
      boardTask(
        "51111111-1111-4111-8111-111111111116",
        "Reply to client notes",
        1800,
        "Work",
        "#48d6c5",
        null,
        { scheduledLocalDate: "2026-09-08", scheduledLocalTime: "18:00" },
      ),
    ],
  },
  done: {
    count: 1,
    aggregateEstSeconds: 1200,
    tasks: [
      boardTask(
        "51111111-1111-4111-8111-111111111117",
        "Confirm agenda",
        1200,
        "Work",
        "#48d6c5",
        "2026-09-08T09:00:00Z",
        { timeTakenSeconds: "1320" },
      ),
    ],
  },
};

const allListsBoardFixtureSnapshot: ListBoardSnapshot = {
  ...listBoardFixtureSnapshot,
  target: {
    kind: "all_lists",
    id: null,
    title: "All Lists",
    color: null,
  },
  backlog: {
    count: 2,
    aggregateEstSeconds: 4500,
    tasks: [
      boardTask("61111111-1111-4111-8111-111111111111", "Prepare quarterly outline", 3600),
      boardTask("61111111-1111-4111-8111-111111111112", "Plan weekend errands", 900, "Personal", "#b7d96d"),
    ],
  },
  thisWeek: {
    count: 2,
    aggregateEstSeconds: 5400,
    tasks: [
      boardTask("61111111-1111-4111-8111-111111111113", "Refine presentation", 2700),
      boardTask(
        "61111111-1111-4111-8111-111111111114",
        "Book dentist appointment",
        2700,
        "Personal",
        "#b7d96d",
        null,
        { scheduledLocalDate: "2026-09-12", scheduledLocalTime: "09:30" },
      ),
    ],
  },
  today: {
    count: 2,
    aggregateEstSeconds: 4500,
    tasks: [
      boardTask(
        "61111111-1111-4111-8111-111111111115",
        "Prepare project review",
        3600,
        "Work",
        "#48d6c5",
        null,
        { timeTakenSeconds: "900", scheduledLocalDate: "2026-09-07", isOverdue: true },
      ),
      boardTask("61111111-1111-4111-8111-111111111116", "Pick up groceries", 900, "Personal", "#b7d96d"),
    ],
  },
  done: {
    count: 2,
    aggregateEstSeconds: 2100,
    tasks: [
      boardTask(
        "61111111-1111-4111-8111-111111111117",
        "Confirm agenda",
        1200,
        "Work",
        "#48d6c5",
        "2026-09-08T09:00:00Z",
        { timeTakenSeconds: "1320" },
      ),
      boardTask(
        "61111111-1111-4111-8111-111111111118",
        "Morning walk",
        900,
        "Personal",
        "#b7d96d",
        "2026-09-08T08:30:00Z",
        { timeTakenSeconds: "840" },
      ),
    ],
  },
};

const editFixtureList: HomeListCardSnapshot = {
  ...homeFixtureSnapshot.lists[0],
  color: "#48d6c5",
  iconAsset: "list-icons/work.svg",
};

function FoundationFixtureSurface() {
  return (
    <main className="visual-fixture" data-visual-fixture="foundation">
      <section className="visual-fixture__card">
        <div>
          <h1 className="visual-fixture__title type-section-title">Foundation fixture</h1>
          <p className="visual-fixture__meta type-metadata">Stable geometry · {theme} theme</p>
        </div>
        <p className="visual-fixture__timer type-live-timer" data-timer-numerals="true">12:34</p>
        <button type="button" className="visual-fixture__button motion-interactive">Primary action</button>
      </section>

      <section className="visual-fixture__states" aria-label="Semantic state colors">
        <div className="visual-fixture__swatch visual-fixture__swatch--accent" aria-label="Accent" />
        <div className="visual-fixture__swatch visual-fixture__swatch--success" aria-label="Success" />
        <div className="visual-fixture__swatch visual-fixture__swatch--warning" aria-label="Warning" />
        <div className="visual-fixture__swatch visual-fixture__swatch--destructive" aria-label="Destructive" />
      </section>
    </main>
  );
}

function ShellPlaceholderFixture() {
  return (
    <section className="app-shell__placeholder" aria-labelledby="app-shell-page-title">
      <p className="app-shell__eyebrow type-metadata">Planning</p>
      <h1 id="app-shell-page-title" className="app-shell__page-title type-page-title">Home</h1>
      <p className="app-shell__description">Stable shell geometry fixture.</p>
    </section>
  );
}

const fixtureAction = () => undefined;
const fixtureSave = async () => undefined;

function ListEditorFixture({ mode }: { mode: "create" | "edit" }) {
  return (
    <>
      <AppShell
        fixtureMode
        homeContent={<HomeDashboard fixtureSnapshot={homeFixtureSnapshot} fixtureHour={20} />}
      />
      <ListEditorModal
        mode={mode}
        initialList={mode === "edit" ? editFixtureList : undefined}
        onRequestClose={fixtureAction}
        onSave={fixtureSave}
      />
    </>
  );
}

function ListBoardFixture({ aggregate }: { aggregate: boolean }) {
  const snapshot = aggregate ? allListsBoardFixtureSnapshot : listBoardFixtureSnapshot;
  return (
    <AppShell
      fixtureMode
      homeContent={
        <ListBoard
          target={aggregate ? { kind: "all" } : { kind: "list", id: snapshot.target.id! }}
          fixtureSnapshot={snapshot}
        />
      }
    />
  );
}

const taskCardFixtureStates: TaskCardFixtureState[] = [
  "normal",
  "action_revealed",
  "scheduled",
  "overdue",
  "done",
  "inline_create",
  "notes_expanded",
  "subtasks_expanded",
  "paused_editable",
  "destructive_confirm",
];

function stateLabel(state: TaskCardFixtureState): string {
  return state.replace(/_/g, " ");
}

function taskForFixtureState(state: TaskCardFixtureState, index: number): ListBoardTask {
  const base = boardTask(
    `71111111-1111-4111-8111-1111111111${String(index).padStart(2, "0")}`,
    state === "inline_create" ? "New task" : `Task card · ${stateLabel(state)}`,
    3600,
    "Work",
    "#48d6c5",
    state === "done" ? "2026-09-08T09:00:00Z" : null,
    { timeTakenSeconds: state === "done" ? "2700" : "900" },
  );

  if (state === "scheduled") {
    return { ...base, scheduledLocalDate: "2026-09-09", scheduledLocalTime: "14:30" };
  }
  if (state === "overdue") {
    return { ...base, scheduledLocalDate: "2026-09-07", isOverdue: true };
  }
  return base;
}

function TaskCardStatesFixture() {
  return (
    <AppShell
      fixtureMode
      homeContent={
        <section className="task-card-state-fixture" data-task-card-state-fixture="true" aria-labelledby="task-card-state-title">
          <header className="task-card-state-fixture__header">
            <p className="app-shell__eyebrow type-metadata">Task cards</p>
            <h1 id="task-card-state-title" className="type-page-title">State model</h1>
          </header>
          <div className="task-card-state-fixture__grid">
            {taskCardFixtureStates.map((state, index) => (
              <div key={state} className="task-card-state-fixture__item" data-task-card-fixture={state}>
                <span className="task-card-state-fixture__label type-metadata">{stateLabel(state)}</span>
                <TaskCard task={taskForFixtureState(state, index)} aggregateView fixtureState={state} />
              </div>
            ))}
          </div>
        </section>
      }
    />
  );
}

function VisualFixtureSurface() {
  if (fixture === "app-shell") {
    return <AppShell fixtureMode homeContent={<ShellPlaceholderFixture />} />;
  }
  if (fixture === "home") {
    return (
      <AppShell
        fixtureMode
        homeContent={<HomeDashboard fixtureSnapshot={homeFixtureSnapshot} fixtureHour={20} />}
      />
    );
  }
  if (fixture === "list-card-states") {
    return (
      <AppShell
        fixtureMode
        homeContent={
          <HomeDashboard
            fixtureSnapshot={interactionFixtureSnapshot}
            fixtureHour={20}
            fixtureHoverListId="33333333-3333-4333-8333-333333333333"
            getListCardActions={() => ({
              onOpen: fixtureAction,
              onEdit: fixtureAction,
              onDuplicate: fixtureAction,
              onArchive: fixtureAction,
            })}
            onCreateList={fixtureAction}
          />
        }
      />
    );
  }
  if (fixture === "list-editor-create") return <ListEditorFixture mode="create" />;
  if (fixture === "list-editor-edit") return <ListEditorFixture mode="edit" />;
  if (fixture === "list-board") return <ListBoardFixture aggregate={false} />;
  if (fixture === "list-board-all") return <ListBoardFixture aggregate />;
  if (fixture === "task-card-states") return <TaskCardStatesFixture />;
  return <FoundationFixtureSurface />;
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Visual fixture root is missing.");
}

flushSync(() => {
  createRoot(rootElement).render(<VisualFixtureSurface />);
});

if (fixture === "list-card-states") {
  const menuTrigger = document.querySelector<HTMLButtonElement>('button[aria-label="More actions for Study"]');
  if (!menuTrigger) throw new Error("List-card state fixture menu trigger is missing.");
  flushSync(() => menuTrigger.click());
}

type VisualContractNode = {
  width?: number;
  height?: number;
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  fontSize?: string;
  lineHeight?: string;
  fontVariantNumeric?: string;
};

function readVisualNode(selector: string, fields: Array<keyof VisualContractNode>): VisualContractNode {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`Visual fixture selector is missing: ${selector}`);
  }

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  const values: VisualContractNode = {};

  for (const field of fields) {
    if (field === "width") values.width = Math.round(rect.width);
    if (field === "height") values.height = Math.round(rect.height);
    if (field === "backgroundColor") values.backgroundColor = style.backgroundColor;
    if (field === "color") values.color = style.color;
    if (field === "borderRadius") values.borderRadius = style.borderRadius;
    if (field === "fontSize") values.fontSize = style.fontSize;
    if (field === "lineHeight") values.lineHeight = style.lineHeight;
    if (field === "fontVariantNumeric") values.fontVariantNumeric = style.fontVariantNumeric;
  }

  return values;
}

function readLayoutViewport() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

const shellContract = () => ({
  shell: readVisualNode(".app-shell", ["width", "height", "backgroundColor"]),
  sidebar: readVisualNode(".app-shell__sidebar", ["width", "height", "backgroundColor"]),
  workspace: readVisualNode(".app-shell__workspace", ["width", "height", "backgroundColor"]),
  primaryNav: readVisualNode(".app-shell__primary-nav", ["height", "backgroundColor"]),
});

const modalContract = () => ({
  ...shellContract(),
  layoutViewport: readLayoutViewport(),
  backdrop: readVisualNode(".list-editor-backdrop", ["width", "height", "backgroundColor"]),
  modal: readVisualNode(".list-editor-modal", ["width", "height", "backgroundColor", "borderRadius"]),
  upload: readVisualNode(".list-editor-modal__upload-circle", ["width", "height", "borderRadius"]),
  swatches: readVisualNode(".list-editor-modal__swatches", ["width", "height"]),
  titleInput: readVisualNode('.list-editor-modal__field input[type="text"]', ["width", "height", "borderRadius"]),
  cancel: readVisualNode(".list-editor-modal__cancel", ["width", "height", "borderRadius"]),
  submit: readVisualNode(".list-editor-modal__submit", ["width", "height", "borderRadius"]),
});

const boardContract = () => ({
  ...shellContract(),
  board: readVisualNode(".list-board", ["width", "height"]),
  lanes: readVisualNode(".list-board__lanes", ["width", "height"]),
  firstLane: readVisualNode(".list-board-lane", ["width", "height", "backgroundColor", "borderRadius"]),
  firstTask: readVisualNode(".list-board-task", ["width", "height", "backgroundColor", "borderRadius"]),
});

const taskCardStatesContract = () => ({
  ...shellContract(),
  gallery: readVisualNode(".task-card-state-fixture__grid", ["width", "height"]),
  normalCard: readVisualNode('[data-task-card-fixture="normal"] .list-board-task', ["width", "height", "borderRadius"]),
  actionCard: readVisualNode('[data-task-card-fixture="action_revealed"] .list-board-task', ["width", "height", "borderRadius"]),
  normalTitleRow: readVisualNode('[data-task-card-fixture="normal"] .list-board-task__title-row', ["width", "height"]),
  actionTitleRow: readVisualNode('[data-task-card-fixture="action_revealed"] .list-board-task__title-row', ["width", "height"]),
  actionSlot: readVisualNode('[data-task-card-fixture="action_revealed"] .list-board-task__action-slot', ["width", "height"]),
  notesCard: readVisualNode('[data-task-card-fixture="notes_expanded"] .list-board-task', ["width", "height"]),
  subtasksCard: readVisualNode('[data-task-card-fixture="subtasks_expanded"] .list-board-task', ["width", "height"]),
  destructiveCard: readVisualNode('[data-task-card-fixture="destructive_confirm"] .list-board-task', ["width", "height"]),
});

const visualContract = fixture === "app-shell"
  ? {
      fixture,
      theme,
      viewport: captureViewport,
      canvas: readVisualNode("body", ["backgroundColor", "color"]),
      ...shellContract(),
    }
  : fixture === "home"
    ? {
        fixture,
        theme,
        viewport: captureViewport,
        canvas: readVisualNode("body", ["backgroundColor", "color"]),
        ...shellContract(),
        home: readVisualNode(".home-dashboard", ["width", "height"]),
        aggregateCard: readVisualNode('[data-home-card="all-lists"]', ["width", "height", "backgroundColor", "borderRadius"]),
        listCard: readVisualNode('[data-home-card="list"]', ["width", "height", "backgroundColor", "borderRadius"]),
      }
    : fixture === "list-card-states"
      ? {
          fixture,
          theme,
          viewport: captureViewport,
          canvas: readVisualNode("body", ["backgroundColor", "color"]),
          ...shellContract(),
          restCard: readVisualNode('[data-home-card="all-lists"]', ["width", "height", "borderRadius"]),
          interactiveCard: readVisualNode('[data-list-id="33333333-3333-4333-8333-333333333333"]', ["width", "height", "borderRadius"]),
          openButton: readVisualNode(".home-list-card__open", ["width", "height"]),
          createTile: readVisualNode('[data-home-create-list="true"]', ["width", "height", "borderRadius"]),
          menu: readVisualNode('.overlay-menu[data-open="true"]', ["width", "height", "borderRadius"]),
        }
      : fixture === "list-editor-create" || fixture === "list-editor-edit"
        ? {
            fixture,
            theme,
            viewport: captureViewport,
            canvas: readVisualNode("body", ["backgroundColor", "color"]),
            ...modalContract(),
          }
        : fixture === "list-board" || fixture === "list-board-all"
          ? {
              fixture,
              theme,
              viewport: captureViewport,
              canvas: readVisualNode("body", ["backgroundColor", "color"]),
              ...boardContract(),
            }
          : fixture === "task-card-states"
            ? {
                fixture,
                theme,
                viewport: captureViewport,
                canvas: readVisualNode("body", ["backgroundColor", "color"]),
                ...taskCardStatesContract(),
              }
            : {
                theme,
                viewport: captureViewport,
                canvas: readVisualNode("body", ["backgroundColor", "color"]),
                panel: readVisualNode(".visual-fixture", ["width", "height", "backgroundColor", "borderRadius"]),
                card: readVisualNode(".visual-fixture__card", ["width", "height", "backgroundColor", "borderRadius"]),
                button: readVisualNode(".visual-fixture__button", ["width", "height", "backgroundColor", "color", "borderRadius"]),
                timer: readVisualNode(".visual-fixture__timer", ["color", "fontSize", "lineHeight", "fontVariantNumeric"]),
              };

const contractNode = document.createElement("script");
contractNode.id = "visual-contract";
contractNode.type = "application/json";
contractNode.textContent = JSON.stringify(visualContract);
document.body.append(contractNode);
document.documentElement.dataset.visualFixtureReady = "true";
