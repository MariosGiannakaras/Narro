import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const notes = read("src/TaskNotes.tsx");
const packageJson = read("package.json");

const richEditorStart = notes.indexOf("function RichNoteEditor(");
const validSnapshotStart = notes.indexOf("function validSnapshot(", richEditorStart);
if (richEditorStart < 0 || validSnapshotStart < 0) {
  throw new Error("Could not isolate RichNoteEditor for spellcheck checks.");
}
const richEditor = notes.slice(richEditorStart, validSnapshotStart);

const viewerStart = notes.indexOf("function NoteViewer(");
const toolbarStart = notes.indexOf("function ToolbarButton(", viewerStart);
if (viewerStart < 0 || toolbarStart < 0) {
  throw new Error("Could not isolate the read-only NoteViewer for spellcheck checks.");
}
const viewer = notes.slice(viewerStart, toolbarStart);

for (const [haystack, needle, label] of [
  [richEditor, "contentEditable={!pending}", "editable Notes contentEditable binding"],
  [richEditor, "spellCheck", "native user-agent spellcheck hint"],
  [richEditor, 'data-task-note-control="editor"', "production Notes editor marker"],
  [richEditor, "onSave(editorDocument(root));", "unchanged structural NoteDocument serialization boundary"],
  [packageJson, '"test:ui-task-notes-spellcheck": "node scripts/test-ui-task-notes-spellcheck.mjs"', "spellcheck preflight script"],
  [packageJson, "validate-task-note-spellcheck-captures.mjs", "captured DOM spellcheck validator"],
]) {
  requireText(haystack, needle, label);
}

const spellcheckHints = notes.match(/\bspellCheck\b/g) ?? [];
if (spellcheckHints.length !== 1) {
  throw new Error(`Notes must opt into native spellcheck at exactly one production surface; found ${spellcheckHints.length}.`);
}

const editorControls = notes.match(/data-task-note-control="editor"/g) ?? [];
if (editorControls.length !== 1) {
  throw new Error(`Spellcheck must remain attached to the one mounted Notes editor; found ${editorControls.length} editor controls.`);
}

if (viewer.includes("spellCheck") || viewer.includes("contentEditable")) {
  throw new Error("Read-only saved-note viewers must not become editable spellcheck surfaces.");
}

for (const forbidden of [
  "autoCorrect=",
  "fetch(",
  "XMLHttpRequest",
  "axios",
  "getListBoardTaskNote(",
  "saveListBoardTaskNote(",
  "deleteListBoardTaskNote(",
  "openUrl(",
]) {
  if (richEditor.includes(forbidden)) {
    throw new Error(`Native spellcheck editor must remain presentation/editor-only; found ${forbidden}.`);
  }
}

for (const dependency of ["spellchecker", "hunspell", "nspell", "cspell", "languagetool"]) {
  if (packageJson.toLowerCase().includes(`\"${dependency}\"`)) {
    throw new Error(`Native spellcheck must not add custom spelling dependency ${dependency}.`);
  }
}

console.log("Native WebView/browser Notes spellcheck contract checks passed.");
