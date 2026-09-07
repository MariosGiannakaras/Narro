import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const html = read("visual-fixtures.html");
const source = read("src/visualFixtures.tsx");
const css = read("src/visualFixtures.css");
const vite = read("vite.config.ts");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-visual-fixtures.mjs");

for (const baseline of ["tests/visual-fixtures/light.json", "tests/visual-fixtures/dark.json"]) {
  const parsed = JSON.parse(read(baseline));
  if (parsed.viewport?.width !== 1280 || parsed.viewport?.height !== 720) {
    throw new Error(`${baseline} must retain the deterministic 1280x720 viewport contract.`);
  }
}

for (const [haystack, needle, label] of [
  [html, '/src/visualFixtures.tsx', "fixture entry module"],
  [source, 'data-visual-fixture="foundation"', "foundation fixture identity"],
  [source, 'fixture === "app-shell"', "app-shell fixture selection"],
  [source, 'fixture === "home"', "Home fixture selection"],
  [source, 'homeContent={<ShellPlaceholderFixture />}', "app-shell fixture rendering without runtime IPC"],
  [source, 'fixtureSnapshot={homeFixtureSnapshot}', "deterministic Home fixture data"],
  [source, 'dataset.visualFixtureReady = "true"', "fixture ready signal"],
  [source, 'id = "visual-contract"', "serialized visual contract"],
  [source, 'data-timer-numerals="true"', "tabular timer coverage"],
  [css, "width: 48rem;", "fixed foundation panel width"],
  [css, "height: 30rem;", "fixed foundation panel height"],
  [css, ".visual-fixture-body .app-shell--fixture", "app-shell capture placement"],
  [vite, 'visualFixtures: "visual-fixtures.html"', "Vite fixture build input"],
  [capture, "--window-size=1280,720", "fixed Edge capture dimensions"],
  [capture, "--user-data-dir=", "isolated Edge profile"],
  [capture, "--screenshot=", "real screenshot capture"],
  [capture, "--dump-dom", "captured DOM output"],
  [capture, '$fixtures = @(', "fixture capture list"],
  [capture, '"app-shell"', "app-shell capture entry"],
  [capture, '"home"', "Home capture entry"],
  [capture, '$fixtureUrl = "$baseUrl/visual-fixtures.html?theme=$theme&fixture=$fixture"', "generic fixture Edge URL"],
  [capture, '$fixtureScreenshot = Join-Path $outputPath "$fixtureLabel.png"', "generic fixture screenshot artifact"],
  [validator, 'data-app-shell="main"', "captured app-shell identity validation"],
  [validator, 'data-home-dashboard="main"', "captured Home identity validation"],
  [validator, 'shell.shell?.width === 960 && shell.shell?.height === 560', "app-shell geometry validation"],
  [validator, "Home light/dark geometry differs", "Home theme geometry parity check"],
  [validator, "Captured visual fixture contracts: PASS", "captured contract validation"],
]) {
  requireText(haystack, needle, label);
}

console.log("Visual fixture harness contract checks passed.");
