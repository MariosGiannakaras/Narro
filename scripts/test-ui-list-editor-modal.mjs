import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const rust = read("src-tauri/src/list_editor.rs");
const lib = read("src-tauri/src/lib.rs");
const modal = read("src/ListEditorModal.tsx");
const css = read("src/listEditorModal.css");
const api = read("src/listEditorApi.ts");
const shell = read("src/AppShell.tsx");
const home = read("src/HomeDashboard.tsx");
const fixtures = read("src/visualFixtures.tsx");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-visual-fixtures.mjs");

for (const [haystack, needle, label] of [
  [rust, "create_list(", "reuse of M2 create-list persistence boundary"],
  [rust, "update_list(", "reuse of M2 update-list persistence boundary"],
  [rust, 'const ICON_DIRECTORY: &str = "list-icons";', "app-owned list icon directory"],
  [rust, "const MAX_ICON_BYTES: usize = 1_048_576;", "backend icon size cap"],
  [rust, "validate_icon_bytes", "backend icon content validation"],
  [rust, 'lower.contains("<script")', "scripted SVG rejection"],
  [rust, 'lower.contains("javascript:")', "javascript SVG rejection"],
  [rust, "resolve_owned_icon", "owned-relative icon cleanup guard"],
  [rust, "cleanup_icon(app_dir, relative);", "new-icon rollback cleanup"],
  [rust, '"LIST_EDITOR_INVALID_INPUT"', "typed validation failure code"],
  [rust, '"LIST_EDITOR_NOT_FOUND"', "typed missing-list failure code"],
  [rust, "pub fn create_list_from_editor", "renderer create command"],
  [rust, "pub fn update_list_from_editor", "renderer update command"],
  [lib, "pub mod list_editor;", "list editor module registration"],
  [lib, "list_editor::create_list_from_editor,", "create command handler registration"],
  [lib, "list_editor::update_list_from_editor,", "update command handler registration"],
  [api, 'invoke<PersistedList>("create_list_from_editor"', "typed frontend create IPC"],
  [api, 'invoke<PersistedList>("update_list_from_editor"', "typed frontend update IPC"],
  [modal, 'role="dialog"', "dialog semantics"],
  [modal, 'aria-modal="true"', "modal semantics"],
  [modal, 'aria-label="Close list editor"', "accessible close control"],
  [modal, 'event.key === "Escape"', "Escape dismissal"],
  [modal, 'event.key !== "Tab"', "Tab focus trap"],
  [modal, "openerRef.current?.focus()", "focus restoration"],
  [modal, '.jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml', "icon file filter"],
  [modal, "MAX_ICON_BYTES = 1_048_576", "frontend icon size guard"],
  [modal, "validateIconFile", "frontend icon validation before preview"],
  [modal, "URL.createObjectURL(file)", "local icon preview"],
  [modal, 'role="radiogroup"', "color radiogroup"],
  [modal, 'type="radio"', "color radio controls"],
  [modal, 'data-selected={selected ? "true" : "false"}', "selected swatch state"],
  [modal, 'type="text"', "list title input"],
  [modal, ">Cancel<", "Cancel action"],
  [modal, 'mode === "create" ? "Create" : "Save changes"', "create/edit submit state"],
  [css, "position: fixed;", "viewport modal backdrop"],
  [css, "border-radius: var(--radius-modal);", "shared modal radius token"],
  [css, "background: linear-gradient(90deg, var(--color-accent-start), var(--color-accent-end));", "accent submit action"],
  [css, "@media (prefers-reduced-motion: reduce)", "reduced-motion modal behavior"],
  [shell, 'destination === "create-list"', "Create-list nav opens modal"],
  [shell, "onCreateList={openCreateList}", "Home Create tile opens modal"],
  [shell, "onEdit: () => openEditList(list)", "real Edit List card target"],
  [shell, "await createListFromEditor(request);", "persistence-backed create"],
  [shell, "await updateListFromEditor(editorState.list.id, request);", "persistence-backed edit"],
  [shell, "setHomeRefreshKey((value) => value + 1);", "post-commit Home refresh"],
  [home, "refreshKey = 0", "Home refresh key"],
  [home, "[fixtureSnapshot, refreshKey]", "Home snapshot reload dependency"],
  [fixtures, 'fixture === "list-editor-create"', "Create modal fixture route"],
  [fixtures, 'fixture === "list-editor-edit"', "Edit modal fixture route"],
  [capture, '"list-editor-create"', "Create modal Edge capture"],
  [capture, '"list-editor-edit"', "Edit modal Edge capture"],
  [validator, "validateListEditorFixture", "captured modal validation"],
]) {
  requireText(haystack, needle, label);
}

for (const forbidden of [
  "onOpen: () =>",
  "onDuplicate: () =>",
  "onArchive: () =>",
]) {
  if (shell.includes(forbidden)) {
    throw new Error(`Create/Edit List modal slice must not activate a later runtime card target: ${forbidden}`);
  }
}

for (const forbidden of ["--color-text-muted", "--motion-duration-interactive", "--motion-distance-interactive"]) {
  if (css.includes(forbidden)) {
    throw new Error(`List editor modal must use validated shared tokens only; found ${forbidden}.`);
  }
}

if (modal.includes("initialList?.iconAsset") && modal.includes("<img src={initialList")) {
  throw new Error("Stored icon paths must not be rendered directly as browser image sources.");
}

console.log("Create/Edit List modal contract checks passed.");
