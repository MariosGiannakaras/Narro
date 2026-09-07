import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
const themes = ["light", "dark"];
const expectedCapture = { width: 1280, height: 720 };
const homeGeometry = new Map();

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
}

invariant(
  stableJson(homeGeometry.get("light")) === stableJson(homeGeometry.get("dark")),
  "Home light/dark geometry differs; theme must preserve hierarchy and card sizing",
);

console.log("Captured visual fixture contracts: PASS");
