import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const srcRoot = path.join(root, "src");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r\n/g, "\n");
}

function walkSource(directory) {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkSource(absolute));
    } else if (/\.(?:ts|tsx)$/.test(entry.name)) {
      results.push(absolute);
    }
  }
  return results;
}

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

function relative(absolute) {
  return path.relative(root, absolute).replaceAll(path.sep, "/");
}

const sourceFiles = walkSource(srcRoot);
const sourceEntries = sourceFiles.map((absolute) => [relative(absolute), fs.readFileSync(absolute, "utf8").replace(/\r\n/g, "\n")]);
const openerImportFiles = sourceEntries
  .filter(([, source]) => source.includes('@tauri-apps/plugin-opener'))
  .map(([file]) => file);
const openUrlCalls = sourceEntries.flatMap(([file, source]) =>
  Array.from(source.matchAll(/\bopenUrl\s*\(/g), () => file),
);

if (openerImportFiles.length !== 1 || openerImportFiles[0] !== "src/TaskNotes.tsx") {
  throw new Error(`Production opener access must remain isolated to src/TaskNotes.tsx; found ${openerImportFiles.join(", ") || "none"}.`);
}
if (openUrlCalls.length !== 1 || openUrlCalls[0] !== "src/TaskNotes.tsx") {
  throw new Error(`Production openUrl must have exactly one TaskNotes call site; found ${openUrlCalls.join(", ") || "none"}.`);
}

const notes = read("src/TaskNotes.tsx");
const notesCss = read("src/taskNotes.css");
const noteRunStart = notes.indexOf("function NoteRun(");
const noteViewerStart = notes.indexOf("function NoteViewer(", noteRunStart);
if (noteRunStart < 0 || noteViewerStart < 0) {
  throw new Error("Could not isolate the saved-note URL activation component.");
}
const noteRun = notes.slice(noteRunStart, noteViewerStart);

for (const [needle, label] of [
  ['type="button"', "native keyboard/pointer button semantics"],
  ['data-task-note-control="open-link"', "saved-link note control marker"],
  ['data-note-url-activation="explicit"', "explicit URL activation marker"],
  ['aria-label={`Open saved note link: ${run.text || link}`}', "saved-link accessible name"],
  ["onClick={() => {", "explicit saved-link click handler"],
  ["void openUrl(link).catch", "external opener call inside explicit handler"],
]) {
  requireText(noteRun, needle, label);
}

const clickHandler = noteRun.indexOf("onClick={() => {");
const openCall = noteRun.indexOf("void openUrl(link).catch");
if (openCall < clickHandler) {
  throw new Error("Saved note URL opening must remain downstream of the explicit button click handler.");
}

requireText(notes, "return /^https?:\\/\\//i.test(normalized) ? normalized : null;", "http/https-only note URL validation");
requireText(notes, 'if (target.closest("a")) event.preventDefault();', "editor anchor navigation suppression");
requireText(notesCss, ".task-notes__link:focus-visible", "keyboard focus-visible saved-link styling");

for (const forbidden of ["useEffect", "useLayoutEffect", "autoFocus"]) {
  if (noteRun.includes(forbidden)) {
    throw new Error(`Saved-note URL activation must not be effect/focus driven; found ${forbidden} in NoteRun.`);
  }
}

const transitionFiles = [
  "src/focus.tsx",
  "src/TimerSessionProjection.tsx",
  "src/timerSessionApi.ts",
  "src/App.tsx",
  "src/ListBoard.tsx",
  "src/TaskCard.tsx",
];
const forbiddenTransitionSideEffects = [
  "@tauri-apps/plugin-opener",
  "openUrl(",
  "window.open(",
  "location.assign(",
  "location.replace(",
  "location.href",
];
for (const file of transitionFiles) {
  const source = read(file);
  for (const forbidden of forbiddenTransitionSideEffects) {
    if (source.includes(forbidden)) {
      throw new Error(`Focus/live transition surface ${file} must not open note URLs; found ${forbidden}.`);
    }
  }
}

const lazyLoadGuard = notes.indexOf("if (!expanded) return;");
const taskNoteEffectStart = notes.lastIndexOf("useEffect(() => {", lazyLoadGuard);
const taskNoteEffectEnd = notes.indexOf("}, [expanded, taskId, listId]);", lazyLoadGuard);
if (lazyLoadGuard < 0 || taskNoteEffectStart < 0 || taskNoteEffectEnd < 0) {
  throw new Error("Could not isolate the task-note lazy-load effect.");
}
const taskNoteEffect = notes.slice(taskNoteEffectStart, taskNoteEffectEnd);
for (const forbidden of forbiddenTransitionSideEffects) {
  if (taskNoteEffect.includes(forbidden)) {
    throw new Error(`Task-note lazy load must remain URL-side-effect free; found ${forbidden}.`);
  }
}

console.log("Note URL explicit-activation and focus no-auto-launch contract checks passed.");