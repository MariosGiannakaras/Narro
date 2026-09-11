import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");

function invariant(condition, message) {
  if (!condition) throw new Error(`Task note spellcheck capture validation failed: ${message}`);
}

function markedTag(dom, marker, label) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = dom.match(new RegExp(`<[^>]*${escaped}[^>]*>`, "i"));
  invariant(match, `${label} is missing ${marker}`);
  return match[0];
}

for (const presentation of ["compact", "large"]) {
  for (const theme of ["light", "dark"]) {
    const label = presentation === "compact"
      ? `task-notes-${theme}`
      : `task-notes-large-${theme}`;
    const domPath = path.join(outputDirectory, `${label}.html`);
    invariant(fs.existsSync(domPath), `${label} captured DOM is missing`);

    const dom = fs.readFileSync(domPath, "utf8");
    const editorTag = markedTag(dom, 'data-task-note-control="editor"', label);
    invariant(/\bcontenteditable="true"/i.test(editorTag), `${label} production Notes editor is not editable`);
    invariant(/\bspellcheck="true"/i.test(editorTag), `${label} production Notes editor did not opt into native spellcheck`);

    const spellcheckHints = dom.match(/\bspellcheck="true"/gi) ?? [];
    invariant(spellcheckHints.length === 1, `${label} expected exactly one native spellcheck surface, found ${spellcheckHints.length}`);

    const viewerTags = dom.match(/<[^>]*data-task-note-viewer="true"[^>]*>/gi) ?? [];
    invariant(viewerTags.length >= 1, `${label} read-only saved-note viewer is missing`);
    for (const viewerTag of viewerTags) {
      invariant(!/\bspellcheck=/i.test(viewerTag), `${label} read-only viewer unexpectedly has spellcheck`);
      invariant(!/\bcontenteditable=/i.test(viewerTag), `${label} read-only viewer unexpectedly became editable`);
    }

    invariant(
      dom.includes(`data-task-note-presentation="${presentation}"`),
      `${label} presentation marker differs`,
    );
  }
}

console.log("Task note native spellcheck captured DOM contracts: PASS");
