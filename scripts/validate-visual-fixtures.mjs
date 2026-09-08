import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
const themes = ["light", "dark"];
const expectedCapture = { width: 1280, height: 720 };
const homeGeometry = new Map();
const listCardStateGeometry = new Map();
const listEditorGeometry = new Map();
const listBoardGeometry = new Map();

function invariant(condition, message) {
  if (!condition) throw new Error(`Visual fixture validation failed: ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function validatePng(screenshotPath, label) {
  invariant(fs.existsSync(screenshotPath), `${label} screenshot is missing`);
  invariant(fs.statSync(screenshotPath).size > 10_000, `${label} screenshot is unexpectedly small`);

  const png = fs.readFileSync(screenshotPath);
  const pngHeader = png.subarray(0, 8);
  invariant(pngHeader.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), `${label} capture is not a PNG`);
  invariant(png.length >= 24, `${label} PNG is missing its IHDR dimensions`);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  invariant(width === expectedCapture.width && height === expectedCapture.height, `${label} screenshot dimensions are ${width}x${height}, expected ${expectedCapture.width}x${expectedCapture.height}`);
}

function readVisualContract(domPath, label) {
  invariant(fs.existsSync(domPath), `${label} captured DOM is missing`);
  const dom = fs.readFileSync(domPath, "utf8");
  invariant(dom.includes('data-visual-fixture-ready="true"'), `${label} fixture did not report ready state`);

  const match = dom.match(/<script id="visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(match, `${label} visual contract was not present in captured DOM`);
  return { dom, contract: JSON.parse(match[1]) };
}

function validateShellContract(shell, label, theme) {
  invariant(shell.theme === theme, `${label} contract theme differs`);
  invariant(shell.viewport?.width === expectedCapture.width && shell.viewport?.height === expectedCapture.height, `${label} viewport contract differs`);
  invariant(shell.shell?.width === 960 && shell.shell?.height === 560, `${label} shell geometry differs from 960x560 fixture contract`);
  invariant(shell.sidebar?.width === 208, `${label} sidebar width differs from 208px contract`);
  invariant(shell.primaryNav?.height === 56, `${label} primary navigation height differs from 56px contract`);
}

function validateListEditorFixture(theme, mode) {
  const fixtureName = `list-editor-${mode}`;
  const label = `${fixtureName}-${theme}`;
  const screenshotPath = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  validatePng(screenshotPath, label);

  const { dom, contract } = readVisualContract(domPath, label);
  invariant(contract.fixture === fixtureName, `${label} contract fixture identity differs`);
  validateShellContract(contract, label, theme);
  invariant(dom.includes('role="dialog"'), `${label} dialog role is missing`);
  invariant(dom.includes('aria-modal="true"'), `${label} aria-modal relationship is missing`);
  invariant(dom.includes('aria-label="Close list editor"'), `${label} close control label is missing`);
  invariant(dom.includes("UPLOAD AN ICON") || dom.includes("Current local icon retained"), `${label} icon-import state is missing`);
  invariant(dom.includes("jpg, png, svg"), `${label} accepted icon formats are missing`);
  invariant(dom.includes('role="radiogroup"'), `${label} color radiogroup is missing`);
  invariant(dom.includes('data-selected="true"'), `${label} selected color state is missing`);
  invariant(dom.includes('type="text"'), `${label} title input is missing`);
  invariant(dom.includes(">Cancel<"), `${label} Cancel action is missing`);

  if (mode === "create") {
    invariant(dom.includes("Create a new list"), `${label} create heading is missing`);
    invariant(dom.includes(">Create<"), `${label} Create action is missing`);
  } else {
    invariant(dom.includes("Edit list"), `${label} edit heading is missing`);
    invariant(dom.includes('value="Work"'), `${label} edit title is not prefilled`);
    invariant(dom.includes("Current local icon retained"), `${label} retained local icon state is missing`);
    invariant(dom.includes("Save changes"), `${label} Save changes action is missing`);
  }

  for (const [name, node] of [
    ["backdrop", contract.backdrop],
    ["modal", contract.modal],
    ["upload target", contract.upload],
    ["color swatches", contract.swatches],
    ["title input", contract.titleInput],
    ["Cancel", contract.cancel],
    ["submit", contract.submit],
  ]) {
    invariant(node?.width > 0 && node?.height > 0, `${label} ${name} has invalid geometry`);
  }

  invariant(
    contract.layoutViewport?.width > 0 && contract.layoutViewport?.height > 0,
    `${label} measured DOM layout viewport is missing or invalid`,
  );
  invariant(
    contract.backdrop.width === contract.layoutViewport.width,
    `${label} backdrop width is ${contract.backdrop.width}px; expected measured DOM layout viewport width ${contract.layoutViewport.width}px (PNG capture remains ${expectedCapture.width}px)`,
  );
  invariant(
    contract.backdrop.height === contract.layoutViewport.height,
    `${label} backdrop height is ${contract.backdrop.height}px; expected measured DOM layout viewport height ${contract.layoutViewport.height}px (PNG capture remains ${expectedCapture.height}px)`,
  );
  invariant(contract.modal.width <= 480, `${label} modal exceeds the 30rem width contract`);
  invariant(contract.upload.width === contract.upload.height, `${label} icon upload target is not circular geometry`);
  invariant(contract.cancel.height === contract.submit.height, `${label} footer actions differ in height`);

  listEditorGeometry.set(`${mode}-${theme}`, {
    modal: {
      width: contract.modal.width,
      height: contract.modal.height,
      borderRadius: contract.modal.borderRadius,
    },
    upload: contract.upload,
    swatches: contract.swatches,
    titleInput: contract.titleInput,
    cancel: contract.cancel,
    submit: contract.submit,
  });
}

function validateListBoardFixture(theme, aggregate) {
  const fixtureName = aggregate ? "list-board-all" : "list-board";
  const label = `${fixtureName}-${theme}`;
  const screenshotPath = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  validatePng(screenshotPath, label);

  const { dom, contract } = readVisualContract(domPath, label);
  invariant(contract.fixture === fixtureName, `${label} contract fixture identity differs`);
  validateShellContract(contract, label, theme);
  invariant(dom.includes('data-list-board="main"'), `${label} list-board identity is missing`);
  invariant(dom.includes('data-board-lane-count="4"'), `${label} four-lane contract is missing`);
  invariant(
    dom.includes(`data-board-target="${aggregate ? "all_lists" : "list"}"`),
    `${label} target identity differs`,
  );
  invariant(dom.includes('data-board-list-selector="true"'), `${label} confirmed board list selector is missing`);
  invariant(dom.includes('aria-label="Planning list"'), `${label} board list selector label is missing`);
  invariant(dom.includes(">All Lists<"), `${label} All Lists selector option is missing`);
  if (aggregate) {
    invariant(
      dom.includes('data-board-selected-target="__all_lists__"'),
      `${label} selector does not reflect the aggregate target`,
    );
  } else {
    invariant(
      dom.includes('data-board-selected-target="11111111-1111-4111-8111-111111111111"'),
      `${label} selector does not reflect the Work-list target`,
    );
    invariant(dom.includes(">Work<"), `${label} Work selector/list title is missing`);
  }

  const laneMarkers = ["Backlog", "This Week", "Today", "Done"].map((title) =>
    dom.indexOf(`data-board-lane="${title}"`),
  );
  invariant(laneMarkers.every((index) => index >= 0), `${label} one or more board lanes are missing`);
  invariant(
    laneMarkers.every((index, position) => position === 0 || index > laneMarkers[position - 1]),
    `${label} board lane order differs from Backlog / This Week / Today / Done`,
  );
  invariant(dom.includes('data-board-add-slot="reserved"'), `${label} future add-action geometry is not reserved`);
  invariant(dom.includes('data-completed="true"'), `${label} Done projection does not contain a completed task`);
  invariant(dom.includes("Est:"), `${label} lane/task estimate metadata is missing`);

  if (aggregate) {
    invariant(dom.includes("All Lists"), `${label} aggregate title is missing`);
    invariant(dom.includes('title="Work"'), `${label} Work origin label is missing`);
    invariant(dom.includes('title="Personal"'), `${label} Personal origin label is missing`);
  } else {
    invariant(dom.includes(">Work<"), `${label} individual list title is missing`);
  }

  for (const [name, node] of [
    ["board", contract.board],
    ["lanes", contract.lanes],
    ["first lane", contract.firstLane],
    ["first task", contract.firstTask],
  ]) {
    invariant(node?.width > 0 && node?.height > 0, `${label} ${name} has invalid geometry`);
  }
  invariant(contract.lanes.width <= contract.board.width, `${label} lane grid overflows board width`);
  invariant(contract.firstLane.borderRadius === "12px", `${label} lane radius differs from panel contract`);
  invariant(contract.firstTask.borderRadius === "12px", `${label} baseline task row radius differs from task-card contract`);

  listBoardGeometry.set(`${fixtureName}-${theme}`, {
    board: { width: contract.board.width, height: contract.board.height },
    lanes: { width: contract.lanes.width, height: contract.lanes.height },
    firstLane: {
      width: contract.firstLane.width,
      height: contract.firstLane.height,
      borderRadius: contract.firstLane.borderRadius,
    },
    firstTask: {
      width: contract.firstTask.width,
      height: contract.firstTask.height,
      borderRadius: contract.firstTask.borderRadius,
    },
  });
}

for (const theme of themes) {
  const screenshotPath = path.join(outputDirectory, `${theme}.png`);
  const domPath = path.join(outputDirectory, `${theme}.html`);
  const baselinePath = path.join(root, "tests", "visual-fixtures", `${theme}.json`);

  validatePng(screenshotPath, theme);
  const { contract: actual } = readVisualContract(domPath, theme);
  const expected = readJson(baselinePath);
  invariant(stableJson(actual) === stableJson(expected), `${theme} geometry/style contract differs from baseline\nExpected: ${JSON.stringify(expected, null, 2)}\nActual: ${JSON.stringify(actual, null, 2)}`);

  const shellLabel = `app-shell-${theme}`;
  const shellScreenshotPath = path.join(outputDirectory, `${shellLabel}.png`);
  const shellDomPath = path.join(outputDirectory, `${shellLabel}.html`);
  validatePng(shellScreenshotPath, shellLabel);

  const { dom: shellDom, contract: shell } = readVisualContract(shellDomPath, shellLabel);
  invariant(shellDom.includes('data-app-shell="main"'), `${shellLabel} app-shell identity is missing`);
  invariant(shellDom.includes('data-active-destination="home"'), `${shellLabel} default Home destination is missing`);
  invariant(shell.fixture === "app-shell", `${shellLabel} contract fixture identity differs`);
  validateShellContract(shell, shellLabel, theme);

  const homeLabel = `home-${theme}`;
  const homeScreenshotPath = path.join(outputDirectory, `${homeLabel}.png`);
  const homeDomPath = path.join(outputDirectory, `${homeLabel}.html`);
  validatePng(homeScreenshotPath, homeLabel);

  const { dom: homeDom, contract: home } = readVisualContract(homeDomPath, homeLabel);
  invariant(homeDom.includes('data-app-shell="main"'), `${homeLabel} app-shell identity is missing`);
  invariant(homeDom.includes('data-active-destination="home"'), `${homeLabel} active Home destination is missing`);
  invariant(homeDom.includes('data-home-dashboard="main"'), `${homeLabel} Home dashboard identity is missing`);
  invariant(homeDom.includes("Your Lists"), `${homeLabel} Your Lists heading is missing`);
  invariant(homeDom.includes("All Lists"), `${homeLabel} All Lists aggregate card is missing`);
  invariant(homeDom.includes("Work"), `${homeLabel} representative Work list card is missing`);
  invariant(homeDom.includes("Personal"), `${homeLabel} representative Personal list card is missing`);
  invariant(!homeDom.includes("Edit List"), `${homeLabel} must not expose callback-gated Edit List without a target`);
  invariant(!homeDom.includes('data-home-create-list="true"'), `${homeLabel} must not expose callback-gated Create List without a target`);
  invariant(home.fixture === "home", `${homeLabel} contract fixture identity differs`);
  validateShellContract(home, homeLabel, theme);
  invariant(home.home?.width > 0 && home.home?.height > 0, `${homeLabel} Home content has invalid geometry`);
  invariant(home.aggregateCard?.width > 0 && home.aggregateCard?.height > 0, `${homeLabel} aggregate card has invalid geometry`);
  invariant(home.listCard?.width > 0 && home.listCard?.height > 0, `${homeLabel} list card has invalid geometry`);
  invariant(home.aggregateCard?.borderRadius === home.listCard?.borderRadius, `${homeLabel} card radius contract diverges`);

  homeGeometry.set(theme, {
    home: { width: home.home.width, height: home.home.height },
    aggregateCard: { width: home.aggregateCard.width, height: home.aggregateCard.height },
    listCard: { width: home.listCard.width, height: home.listCard.height },
  });

  const stateLabel = `list-card-states-${theme}`;
  const stateScreenshotPath = path.join(outputDirectory, `${stateLabel}.png`);
  const stateDomPath = path.join(outputDirectory, `${stateLabel}.html`);
  validatePng(stateScreenshotPath, stateLabel);

  const { dom: stateDom, contract: state } = readVisualContract(stateDomPath, stateLabel);
  invariant(state.fixture === "list-card-states", `${stateLabel} contract fixture identity differs`);
  validateShellContract(state, stateLabel, theme);
  invariant(stateDom.includes('data-fixture-hovered="true"'), `${stateLabel} forced hover state is missing`);
  invariant(stateDom.includes(">Open<"), `${stateLabel} Open affordance is missing`);
  invariant(stateDom.includes("Edit List"), `${stateLabel} Edit List menu item is missing`);
  invariant(stateDom.includes("Duplicate"), `${stateLabel} Duplicate menu item is missing`);
  invariant(stateDom.includes("Archive List"), `${stateLabel} Archive List menu item is missing`);
  invariant(stateDom.includes('role="separator"'), `${stateLabel} overflow menu divider is missing`);
  invariant(stateDom.includes('data-open="true"'), `${stateLabel} overflow menu is not captured open`);
  invariant(stateDom.includes('data-home-create-list="true"'), `${stateLabel} Create List tile is missing`);
  invariant(stateDom.includes("CREATE LIST"), `${stateLabel} Create List label is missing`);

  for (const [name, node] of [
    ["rest card", state.restCard],
    ["interactive card", state.interactiveCard],
    ["Open button", state.openButton],
    ["Create List tile", state.createTile],
    ["overflow menu", state.menu],
  ]) {
    invariant(node?.width > 0 && node?.height > 0, `${stateLabel} ${name} has invalid geometry`);
  }

  invariant(state.restCard.width === state.interactiveCard.width, `${stateLabel} hover/menu state changed card width`);
  invariant(state.restCard.height === state.interactiveCard.height, `${stateLabel} hover/menu state changed card height`);
  invariant(state.restCard.width === state.createTile.width, `${stateLabel} Create List tile width diverges from list-card grid cell`);
  invariant(state.restCard.height === state.createTile.height, `${stateLabel} Create List tile height diverges from list-card grid cell`);
  invariant(state.restCard.borderRadius === state.interactiveCard.borderRadius, `${stateLabel} hover state changed card radius`);
  invariant(state.restCard.borderRadius === state.createTile.borderRadius, `${stateLabel} Create List tile radius diverges from card radius`);

  listCardStateGeometry.set(theme, {
    restCard: state.restCard,
    interactiveCard: state.interactiveCard,
    openButton: state.openButton,
    createTile: state.createTile,
    menu: state.menu,
  });

  validateListEditorFixture(theme, "create");
  validateListEditorFixture(theme, "edit");
  validateListBoardFixture(theme, false);
  validateListBoardFixture(theme, true);
}

invariant(
  stableJson(homeGeometry.get("light")) === stableJson(homeGeometry.get("dark")),
  "Home light/dark geometry differs; theme must preserve hierarchy and card sizing",
);

invariant(
  stableJson(listCardStateGeometry.get("light")) === stableJson(listCardStateGeometry.get("dark")),
  "List-card interaction-state light/dark geometry differs",
);

for (const mode of ["create", "edit"]) {
  invariant(
    stableJson(listEditorGeometry.get(`${mode}-light`)) === stableJson(listEditorGeometry.get(`${mode}-dark`)),
    `List editor ${mode} light/dark geometry differs`,
  );
}

for (const fixtureName of ["list-board", "list-board-all"]) {
  invariant(
    stableJson(listBoardGeometry.get(`${fixtureName}-light`))
      === stableJson(listBoardGeometry.get(`${fixtureName}-dark`)),
    `${fixtureName} light/dark geometry differs`,
  );
}

console.log("Captured visual fixture contracts: PASS");
