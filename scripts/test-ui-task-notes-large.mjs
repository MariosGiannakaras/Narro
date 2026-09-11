import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const notes = read("src/TaskNotes.tsx");
const css = read("src/taskNotes.css");
const fixture = read("src/taskNotesVisualFixture.tsx");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-task-note-captures.mjs");
const packageJson = read("package.json");

for (const [haystack, needle, label] of [
  [notes, "const [largePresentation, setLargePresentation] = useState(false);", "large Notes presentation state"],
  [notes, 'data-task-note-presentation={largePresentation ? "large" : "compact"}', "presentation marker"],
  [notes, 'data-task-note-resizable={largePresentation ? "true" : "false"}', "resizable presentation marker"],
  [notes, 'role={largePresentation ? "dialog" : undefined}', "large dialog semantics"],
  [notes, "aria-modal={largePresentation ? true : undefined}", "large modal semantics"],
  [notes, 'data-task-note-control="presentation"', "explicit presentation control"],
  [notes, 'aria-label={presentationLabel}', "presentation control accessible name"],
  [notes, 'aria-controls={presentationId}', "presentation control target binding"],
  [notes, 'aria-expanded={largePresentation}', "presentation expansion state"],
  [notes, 'if (event.key === "Escape")', "Escape close behavior"],
  [notes, 'if (event.key !== "Tab" || !editorShellRef.current) return;', "Tab containment behavior"],
  [notes, "presentationButtonRef.current?.focus()", "presentation focus restoration"],
  [notes, 'document.body.style.overflow = "hidden";', "background scroll lock"],
  [notes, "document.body.style.overflow = previousOverflow;", "background scroll restoration"],
  [notes, 'data-task-note-large-backdrop="true"', "large Notes backdrop"],
  [notes, "taskTitle={taskTitle}", "task identity/context passed to large editor"],
  [notes, "spellCheck", "native spellcheck hint retained on the shared editor"],
  [css, '.task-notes__editor-shell[data-task-note-presentation="large"]', "large Notes surface selector"],
  [css, "position: fixed;", "large Notes fixed presentation"],
  [css, "resize: both;", "pointer-resizable large Notes surface"],
  [css, "max-width: min(68rem, 92vw);", "large Notes viewport width bound"],
  [css, "max-height: 88vh;", "large Notes viewport height bound"],
  [css, "min-height: min(26rem, calc(100vh - 4rem));", "large Notes useful minimum height"],
  [css, "min-height: 18rem;", "large editing canvas minimum height"],
  [css, "max-height: none;", "large editing canvas compact cap removal"],
  [css, ".task-notes__large-backdrop[hidden]", "inactive backdrop removal"],
  [fixture, 'const presentation = searchParams.get("presentation") === "large" ? "large" : "compact";', "visual fixture presentation variant"],
  [fixture, 'presentationButton.click();', "production presentation activation in fixture"],
  [fixture, "resizablePresentation", "visual resizable contract"],
  [capture, 'task-notes-large-$theme', "Windows large Notes capture"],
  [validator, 'contract.presentation === "large"', "large Notes capture contract"],
  [validator, "contract.largeDialog === true", "large Notes dialog visual contract"],
  [validator, "contract.resizablePresentation === true", "large Notes resize visual contract"],
  [packageJson, '"test:ui-task-notes-large": "node scripts/test-ui-task-notes-large.mjs"', "large Notes preflight script"],
]) {
  requireText(haystack, needle, label);
}

const richEditorInvocations = notes.match(/<RichNoteEditor\b/g) ?? [];
if (richEditorInvocations.length !== 1) {
  throw new Error(`Large Notes must reuse one production RichNoteEditor invocation; found ${richEditorInvocations.length}.`);
}
const editorControls = notes.match(/data-task-note-control="editor"/g) ?? [];
if (editorControls.length !== 1) {
  throw new Error(`Large Notes must keep one mounted contentEditable editor; found ${editorControls.length}.`);
}
const editorShells = notes.match(/data-task-note-editor="true"/g) ?? [];
if (editorShells.length !== 1) {
  throw new Error(`Large Notes must keep one editor shell; found ${editorShells.length}.`);
}
const spellcheckHints = notes.match(/\bspellCheck\b/g) ?? [];
if (spellcheckHints.length !== 1) {
  throw new Error(`Large Notes must retain exactly one native spellcheck hint on the shared editor; found ${spellcheckHints.length}.`);
}

const richEditorStart = notes.indexOf("function RichNoteEditor(");
const validSnapshotStart = notes.indexOf("function validSnapshot(", richEditorStart);
if (richEditorStart < 0 || validSnapshotStart < 0) {
  throw new Error("Could not isolate RichNoteEditor for large-presentation checks.");
}
const richEditor = notes.slice(richEditorStart, validSnapshotStart);
for (const forbidden of [
  "getListBoardTaskNote(",
  "saveListBoardTaskNote(",
  "deleteListBoardTaskNote(",
  "openUrl(",
]) {
  if (richEditor.includes(forbidden)) {
    throw new Error(`Presentation-only RichNoteEditor absorbed authoritative/URL side effects: ${forbidden}`);
  }
}

const presentationStateIndex = richEditor.indexOf("const [largePresentation, setLargePresentation] = useState(false);");
const editorRefIndex = richEditor.indexOf('data-task-note-control="editor"');
if (presentationStateIndex < 0 || editorRefIndex < presentationStateIndex) {
  throw new Error("Large presentation must decorate the existing mounted editor rather than replace it.");
}

console.log("Large/resizable Notes presentation, single-editor draft, accessibility, spellcheck, and visual contracts passed.");
