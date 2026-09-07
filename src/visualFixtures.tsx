import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { AppShell } from "./AppShell";
import { HomeDashboard, type HomeListCardSnapshot, type HomeSnapshot } from "./HomeDashboard";
import { ListEditorModal } from "./ListEditorModal";
import "./visualFixtures.css";

const searchParams = new URLSearchParams(window.location.search);
const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
const requestedFixture = searchParams.get("fixture");
const fixture = requestedFixture === "app-shell"
  || requestedFixture === "home"
  || requestedFixture === "list-card-states"
  || requestedFixture === "list-editor-create"
  || requestedFixture === "list-editor-edit"
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

const editFixtureList: HomeListCardSnapshot = {
  ...homeFixtureSnapshot.lists[0],
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
    <AppShell
      fixtureMode
      homeContent={<HomeDashboard fixtureSnapshot={homeFixtureSnapshot} fixtureHour={20} />}
    >
      <ListEditorModal
        mode={mode}
        initialList={mode === "edit" ? editFixtureList : undefined}
        onRequestClose={fixtureAction}
        onSave={fixtureSave}
      />
    </AppShell>
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

const shellContract = () => ({
  shell: readVisualNode(".app-shell", ["width", "height", "backgroundColor"]),
  sidebar: readVisualNode(".app-shell__sidebar", ["width", "height", "backgroundColor"]),
  workspace: readVisualNode(".app-shell__workspace", ["width", "height", "backgroundColor"]),
  primaryNav: readVisualNode(".app-shell__primary-nav", ["height", "backgroundColor"]),
});

const modalContract = () => ({
  ...shellContract(),
  backdrop: readVisualNode(".list-editor-backdrop", ["width", "height", "backgroundColor"]),
  modal: readVisualNode(".list-editor-modal", ["width", "height", "backgroundColor", "borderRadius"]),
  upload: readVisualNode(".list-editor-modal__upload-circle", ["width", "height", "borderRadius"]),
  swatches: readVisualNode(".list-editor-modal__swatches", ["width", "height"]),
  titleInput: readVisualNode('.list-editor-modal__field input[type="text"]', ["width", "height", "borderRadius"]),
  cancel: readVisualNode(".list-editor-modal__cancel", ["width", "height", "borderRadius"]),
  submit: readVisualNode(".list-editor-modal__submit", ["width", "height", "borderRadius"]),
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
