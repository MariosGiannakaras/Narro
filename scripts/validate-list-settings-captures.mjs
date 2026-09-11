import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");

function invariant(condition, message) {
  if (!condition) throw new Error(`List settings capture validation failed: ${message}`);
}

function read(label) {
  const file = path.join(outputDirectory, `${label}.html`);
  invariant(fs.existsSync(file), `${label} captured DOM is missing`);
  const dom = fs.readFileSync(file, "utf8");
  invariant(dom.includes('data-list-settings-fixture-ready="true"'), `${label} fixture did not reach ready state`);
  return dom;
}

for (const theme of ["light", "dark"]) {
  const archive = read(`list-settings-archive-${theme}`);
  invariant(archive.includes('data-list-confirm-action="archive"'), `${theme} archive confirmation is missing`);
  invariant(archive.includes('role="dialog"'), `${theme} archive confirmation lacks dialog semantics`);
  invariant(archive.includes('aria-modal="true"'), `${theme} archive confirmation lacks modal semantics`);
  invariant(archive.includes("Archive list"), `${theme} archive confirmation action is missing`);

  const archived = read(`list-settings-archived-${theme}`);
  invariant(archived.includes('data-archived-lists-panel="true"'), `${theme} archived-list panel is missing`);
  invariant((archived.match(/data-archived-list-id=/g) ?? []).length === 2, `${theme} archived fixture must render two list identities`);
  invariant(archived.includes("Restore"), `${theme} Restore action is missing`);
  invariant(archived.includes("Permanently delete"), `${theme} permanent-delete action is missing`);
  invariant(!archived.includes("Archived done tasks"), `${theme} item 24 must not absorb the later archived-done-task surface`);

  const deletion = read(`list-settings-delete-${theme}`);
  invariant(deletion.includes('data-archived-lists-panel="true"'), `${theme} delete confirmation lost archived context`);
  invariant(deletion.includes('data-list-confirm-action="delete"'), `${theme} delete confirmation is missing`);
  invariant(deletion.includes('role="dialog"'), `${theme} delete confirmation lacks dialog semantics`);
  invariant(deletion.includes("This action cannot be undone."), `${theme} permanent-delete warning is missing`);
  invariant(deletion.includes("Permanently delete"), `${theme} permanent-delete confirm action is missing`);
}

console.log("List settings captured DOM contracts: PASS");
