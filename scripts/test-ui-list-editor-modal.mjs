import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const rust = read("src-tauri/src/list_editor.rs");
const lib = read("src-tauri/src/lib.rs");
const modal = read("src/ListEditorModal.tsx");
const popovers = read("src/ListEditorPopovers.tsx");
const spectrum = read("src/listSpectrumColor.ts");
const builtinIcons = read("src/BuiltinListIcon.tsx");
const lists = read("src-tauri/src/persistence/lists.rs");
const migrations = read("src-tauri/src/persistence/mod.rs");
const css = read("src/listEditorModal.css");
const api = read("src/listEditorApi.ts");
const shell = read("src/AppShell.tsx");
const home = read("src/HomeDashboard.tsx");
const fixtures = read("src/visualFixtures.tsx");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-visual-fixtures.mjs");

for (const [haystack, needle, label] of [
  [rust, "create_list_with_builtin_icon(", "atomic builtin selection in M2 create-list persistence boundary"],
  [rust, "update_list_with_builtin_icon(", "atomic typed icon change in M2 list update boundary"],
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
  [rust, ") -> CommandResult<()> {", "success-only command return contract"],
  [rust, ".map(|_| ())", "internal record hidden from renderer command boundary"],
  [lib, "pub mod list_editor;", "list editor module registration"],
  [lib, "list_editor::create_list_from_editor,", "create command handler registration"],
  [lib, "list_editor::update_list_from_editor,", "update command handler registration"],
  [api, 'invoke<void>("create_list_from_editor"', "success-only frontend create IPC"],
  [api, 'invoke<void>("update_list_from_editor"', "success-only frontend update IPC"],
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
  [modal, 'Pick a list color', "current-source color label"],
  [modal, 'placeholder="Enter your list title"', "current-source list title placeholder"],
  [modal, 'data-custom-color-trigger="true"', "custom/multicolor first swatch"],
  [modal, "<SpectrumColorPopover", "canvas-based anchored color picker"],
  [popovers, 'width={WHEEL_SIZE} height={WHEEL_SIZE}', "184px canvas actual pixel backing"],
  [popovers, "onPointerDown", "pointer selection"],
  [popovers, "onWheelKey", "accessible keyboard hue and brightness"],
  [popovers, 'aria-invalid={!valid}', "invalid HEX feedback"],
  [popovers, 'if (HEX_DIGITS.test(next.trim()))', "only valid HEX updates selected list color"],
  [spectrum, "nearestWheelPoint", "non-invertible HSV approximation is display only"],
  [spectrum, "colorAtWheel", "2D HSV wheel owns pointer color"],
  [modal, "setColor(colorAtOpen.current)", "Escape restores picker opening color"],
  [modal, "fileInputRef.current?.click()", "only upload circle opens native picker"],
  [modal, "<BuiltinIconPalette", "single modal-owned searchable local icon palette"],
  [popovers, "BUILTIN_LIST_ICONS.filter", "local category/search filtering"],
  [popovers, 'aria-label="Search list icons"', "accessible named icon search"],
  [popovers, "ArrowLeft: -1, ArrowRight: 1, ArrowUp: -5, ArrowDown: 5", "icon-grid keyboard navigation"],
  [builtinIcons, "BuiltinListIcon", "single shared trusted renderer"],
  [rust, "InvalidIconSelection", "typed backend rejection of ambiguous or untrusted icon selection"],
  [rust, "cleanup_icon(app_dir, previous)", "old owned file cleanup only after success"],
  [lists, "icon_id = ?4", "durable independent icon ID persistence"],
  [lists, "source.icon_id", "duplicate preserves builtin icon identity"],
  [migrations, "0011_builtin_list_icons.sql", "migrates existing list DB without losing uploads"],
  [css, '.list-editor-modal__swatch--custom', "signature multicolor entry"],
  [css, '.spectrum-popover', "compact anchored color picker surface"],
  [css, '.icon-popover__grid', "bounded five-column icon palette"],
  [css, 'box-shadow: 0 14px 35px rgba(0, 0, 0, 0.48), 0 2px 8px rgba(0, 0, 0, 0.18);', "approved final Spectrum and icon palette flyout shadow"],
  [css, 'var(--color-accent-start)', "calibrated shared palette rather than screenshot-assumed hex"],
  [modal, 'type="radio"', "color radio controls"],
  [modal, 'data-selected={selected ? "true" : "false"}', "selected swatch state"],
  [modal, 'type="text"', "list title input"],
  [modal, "Cancel", "Cancel action"],
  [modal, 'mode === "create" ? "Create" : "Save changes"', "create/edit submit state"],
  [css, "position: fixed;", "viewport modal backdrop"],
  [css, "border-radius: var(--radius-modal);", "shared modal radius token"],
  [css, "background: linear-gradient(90deg, var(--color-accent-start), var(--color-accent-end));", "accent submit action"],
  [css, "@media (prefers-reduced-motion: reduce)", "reduced-motion modal behavior"],
  [shell, 'destination === "create-list"', "Create-list nav opens modal"],
  [shell, "onCreateList={openCreateList}", "Home Create tile opens modal"],
  [shell, "onEdit: () => openEditList(list)", "real Edit List card target"],
  [shell, "onOpen: () => openListBoard(list)", "real Open target after board implementation"],
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

if (api.includes("PersistedList")) {
  throw new Error("List editor IPC must not expose a renderer-owned persisted-list serialization contract.");
}

if (shell.includes("onDuplicate: () =>")) {
  throw new Error("Create/Edit List modal slice must not activate the still-deferred Duplicate runtime card target.");
}

for (const forbidden of ["--color-text-muted", "--motion-duration-interactive", "--motion-distance-interactive"]) {
  if (css.includes(forbidden)) {
    throw new Error(`List editor modal must use validated shared tokens only; found ${forbidden}.`);
  }
}

if (modal.includes("<img src={initialList")) {
  throw new Error("Stored icon paths must not be rendered directly as browser image sources.");
}

console.log("Create/Edit List modal contract checks passed.");
