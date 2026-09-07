import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const shell = read("src/AppShell.tsx");
const css = read("src/appShell.css");
const app = read("src/App.tsx");

for (const [haystack, needle, label] of [
  [shell, 'data-app-shell="main"', "shell identity"],
  [shell, 'aria-label="List navigation"', "list navigation landmark"],
  [shell, 'aria-label="Primary"', "primary navigation landmark"],
  [shell, 'aria-label="Utilities"', "utility action group"],
  [shell, 'label="+ Create new list"', "create-list entry"],
  [shell, 'label="All my lists"', "all-lists entry"],
  [shell, 'label="Archived lists"', "archive entry"],
  [shell, 'label="Home"', "Home primary destination"],
  [shell, 'label="Reports"', "Reports primary destination"],
  [shell, 'label="Search"', "Search utility destination"],
  [shell, 'label="Settings"', "Settings utility destination"],
  [shell, 'aria-current={active ? "page" : undefined}', "active-page semantics"],
  [css, "grid-template-columns: 13rem minmax(0, 1fr);", "stable sidebar geometry"],
  [css, "grid-template-rows: 4rem minmax(0, 1fr) 3.5rem;", "stable workspace geometry"],
  [css, '.app-shell__nav-button[aria-current="page"]', "active navigation state"],
  [css, "@media (prefers-reduced-motion: reduce)", "reduced-motion shell behavior"],
  [app, 'get("diagnostics") === "1"', "explicit diagnostic-mode gate"],
  [app, "if (diagnosticMode) {", "diagnostic-only startup probes"],
  [app, "<AppShell>", "product shell as default main surface"],
]) {
  requireText(haystack, needle, label);
}

if (/Narro Diagnostic - Main Window/.test(app)) {
  throw new Error("The default main product surface must not retain the old diagnostic heading.");
}

console.log("App shell/navigation contract checks passed.");
