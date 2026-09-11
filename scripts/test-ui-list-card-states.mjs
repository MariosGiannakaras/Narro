import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const component = read("src/HomeDashboard.tsx");
const css = read("src/homeDashboard.css");
const shell = read("src/AppShell.tsx");
const fixtures = read("src/visualFixtures.tsx");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-visual-fixtures.mjs");

for (const [haystack, needle, label] of [
  [component, "export type HomeListCardActions", "typed list-card action contract"],
  [component, "getListCardActions", "callback-gated list-card action provider"],
  [component, "onCreateList", "callback-gated Create List tile"],
  [component, "actions?.onOpen", "callback-gated Open affordance"],
  [component, "actions?.onEdit", "callback-gated Edit List menu item"],
  [component, "actions?.onDuplicate", "callback-gated Duplicate menu item"],
  [component, "actions?.onArchive", "callback-gated Archive List menu item"],
  [component, "More actions for ${card.title}", "accessible overflow trigger label"],
  [component, 'role="separator"', "overflow menu divider"],
  [component, 'data-home-create-list="true"', "Create List tile identity"],
  [component, 'className="home-list-card__open motion-interactive"', "Open overlay action"],
  [css, "grid-template-columns: 2rem minmax(0, 1fr) 2rem;", "fixed header action slot"],
  [css, "position: absolute;", "overlay positioning without layout insertion"],
  [css, '.home-list-card[data-fixture-hovered="true"] .home-list-card__open', "deterministic hover/Open fixture state"],
  [css, "pointer-events: none;", "rest-state Open pointer gating"],
  [css, "pointer-events: auto;", "hover/focus Open activation"],
  [css, "border: 1px dashed var(--color-accent-solid);", "Create List dashed outline"],
  [css, "linear-gradient(90deg, var(--color-accent-start), var(--color-accent-end))", "Open accent gradient"],
  [css, "@media (prefers-reduced-motion: reduce)", "reduced-motion interaction behavior"],
  [fixtures, 'fixture === "list-card-states"', "list-card visual fixture route"],
  [fixtures, "fixtureHoverListId", "forced hover fixture state"],
  [fixtures, "onOpen: fixtureAction", "fixture-only Open callback"],
  [fixtures, "onCreateList={fixtureAction}", "fixture-only Create List callback"],
  [fixtures, 'button[aria-label="More actions for Study"]', "deterministic overflow-menu opening"],
  [capture, '"list-card-states"', "real Edge list-card state capture"],
  [validator, "list-card-states", "captured list-card state validation"],
  [shell, "onOpen: () => openListBoard(list)", "real Open target after list-board implementation"],
  [shell, "onEdit: () => openEditList(list)", "real Edit List target after modal implementation"],
  [shell, "onArchive: () => requestArchive(list)", "real Archive List target after list-settings implementation"],
]) {
  requireText(haystack, needle, label);
}

if (shell.includes("onDuplicate: () =>")) {
  throw new Error("Runtime AppShell must not activate the still-deferred Duplicate list-card target.");
}

for (const forbidden of ["--motion-duration-interactive", "--motion-distance-interactive", "--color-text-muted"]) {
  if (css.includes(forbidden)) {
    throw new Error(`List-card styles must use only validated shared tokens; found ${forbidden}.`);
  }
}

if (!css.includes(".home-list-card:hover") || !css.includes(".home-list-card:focus-within")) {
  throw new Error("Keyboard focus must mirror pointer hover for list-card interaction presentation.");
}

console.log("List-card interaction-state contract checks passed.");
