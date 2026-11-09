import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/ListEditorModal.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: {
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2022,
}}).outputText;
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1]).buffer;
const invalidPng = new Uint8Array([5, 4, 3, 2, 1, 0, 5, 4, 3]).buffer;
const flush = async () => { for (let i = 0; i < 24; i++) await Promise.resolve(); };
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function uploaded(name, request) {
  return { name, size: 9, arrayBuffer: () => request.promise };
}
const builtinPalette = () => null;
const jsx = (type, props) => ({ type, props });
function find(node, predicate) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = find(child, predicate);
      if (match) return match;
    }
    return null;
  }
  if (predicate(node)) return node;
  return find(node.props?.children, predicate);
}
function mountEditor() {
  const slots = [], refs = [], effects = [], queued = [], saved = [], created = [], revoked = [];
  let slot = 0, ref = 0, effect = 0, closed = 0;
  let tree;
  const react = {
    useId: () => "test-id",
    useRef(initial) {
      const index = ref++;
      if (!(index in refs)) refs[index] = { current: initial };
      return refs[index];
    },
    useState(initial) {
      const index = slot++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], next => {
        slots[index] = typeof next === "function" ? next(slots[index]) : next;
      }];
    },
    useEffect(callback, deps) {
      const index = effect++;
      const old = effects[index];
      if (!old || !deps || deps.some((value, i) => !Object.is(old.deps?.[i], value))) {
        queued.push({ index, callback, deps });
      }
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require(id) {
      if (id === "react") return react;
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (id === "./ActionIcon") return { ActionIcon: () => null };
      if (id === "./BuiltinListIcon") return { BuiltinListIcon: () => null, isBuiltinListIconId: () => true };
      if (id === "./ListIcon") return { ListIcon: () => null };
      if (id === "./ListEditorPopovers") return {
        BuiltinIconPalette: builtinPalette, SpectrumColorPopover: () => null,
      };
      if (id === "./listSpectrumColor") return { listIconContrast: () => "#fff" };
      if (id.endsWith(".css")) return {};
      throw Error("unexpected import: " + id);
    },
    HTMLElement: class {},
    TextDecoder,
    document: {
      activeElement: null,
      addEventListener() {},
      removeEventListener() {},
      getElementById() { return null; },
    },
    URL: {
      createObjectURL(file) {
        const result = "blob:owned-" + (created.length + 1);
        created.push({ file, url: result });
        return result;
      },
      revokeObjectURL(url) { revoked.push(url); },
    },
  }, { filename: "ListEditorModal.transpiled.cjs" });
  function render() {
    slot = 0; ref = 0; effect = 0; queued.length = 0;
    tree = module.exports.ListEditorModal({
      mode: "create",
      onRequestClose: () => { closed++; },
      onSave: async request => { saved.push(request); },
    });
    for (const next of queued) {
      effects[next.index]?.cleanup?.();
      effects[next.index] = { deps: next.deps, cleanup: next.callback() };
    }
    return tree;
  }
  function fileChange(file) {
    const input = find(tree, node => node.type === "input" && node.props?.type === "file");
    assert(input, "actual upload input must exist");
    input.props.onChange({ target: { files: [file], value: file.name } });
  }
  function setTitle() {
    find(tree, node => node.type === "input" && node.props?.placeholder === "Enter your list title")
      .props.onChange({ target: { value: "Regression list" } });
    render();
  }
  async function save() {
    const form = find(tree, node => node.type === "form");
    return form.props.onSubmit({ preventDefault() {} });
  }
  function chooseLetter() {
    const button = find(tree, node => node.type === "button"
      && node.props?.["aria-label"] === "Choose a built-in list icon");
    button.props.onClick();
    render();
    const palette = find(tree, node => node.type === builtinPalette);
    assert(palette, "existing builtin palette must be rendered");
    palette.props.onSelect(null);
    render();
  }
  function close() {
    const button = find(tree, node => node.type === "button"
      && node.props?.["aria-label"] === "Close list editor");
    button.props.onClick();
    for (const entry of effects) entry?.cleanup?.();
  }
  render();
  setTitle();
  return {
    fileChange, render, save, chooseLetter, close, saved, created, revoked,
    get closed() { return closed; },
    get text() {
      return JSON.stringify(tree, (key, value) => typeof value === "function" ? undefined : value);
    },
  };
}

// A selected file is not a persistable draft until validation has completed.
// An immediate Save through the OLD rendered form must still be rejected.
{
  const h = mountEditor();
  const first = deferred();
  h.fileChange(uploaded("chosen.png", first));
  await h.save();
  assert.equal(h.saved.length, 0, "Save during unresolved validation must not commit the old letter");
  h.render();
  assert.match(h.text, /Saving|Create/);
  first.resolve(png);
  await flush();
  h.render();
  await h.save();
  assert.equal(h.saved.length, 1);
  assert.equal(h.saved[0].iconSelection.kind, "upload");
  assert.equal(h.saved[0].iconSelection.filename, "chosen.png");
  assert.deepEqual(Array.from(h.saved[0].iconSelection.bytes.slice(0, 8)),
    Array.from(new Uint8Array(png).slice(0, 8)));
}

// Completion order cannot change which upload the user most recently chose.
{
  const h = mountEditor();
  const old = deferred(), latest = deferred();
  h.fileChange(uploaded("older.png", old));
  h.fileChange(uploaded("newest.png", latest));
  latest.resolve(png);
  await flush();
  h.render();
  old.resolve(png);
  await flush();
  h.render();
  assert.equal(h.created.length, 1, "superseded completion must not own a blob URL");
  await h.save();
  assert.equal(h.saved.length, 1);
  assert.equal(h.saved[0].iconSelection.filename, "newest.png");
}

// A newer INVALID file supersedes an older valid read. It must not silently
// accept the previous selection, nor let the stale read replace the error.
{
  const h = mountEditor();
  const old = deferred(), latest = deferred();
  h.fileChange(uploaded("older.png", old));
  h.fileChange(uploaded("invalid.png", latest));
  latest.resolve(invalidPng);
  await flush();
  old.resolve(png);
  await flush();
  h.render();
  assert.match(h.text, /not a valid PNG/);
  await h.save();
  assert.equal(h.saved.length, 0);
  assert.equal(h.created.length, 0);
  h.chooseLetter();
  await h.save();
  assert.equal(h.saved[0].iconSelection.kind, "letter", "explicit correction permits retry");
}

// Builtin selection invalidates the pending read and releases the old upload
// preview when it is no longer the selected draft.
{
  const h = mountEditor();
  const first = deferred(), pending = deferred();
  h.fileChange(uploaded("accepted.png", first));
  first.resolve(png);
  await flush();
  h.render();
  h.fileChange(uploaded("obsolete.png", pending));
  h.chooseLetter();
  pending.resolve(png);
  await flush();
  h.render();
  assert.equal(h.created.length, 1);
  assert.deepEqual(h.revoked, ["blob:owned-1"]);
  await h.save();
  assert.equal(h.saved[0].iconSelection.kind, "letter");
}

// A modal closed during file reading cannot publish a late preview or leak a
// blob URL after its state and ownership have been disposed.
{
  const h = mountEditor();
  const pending = deferred();
  h.fileChange(uploaded("after-close.png", pending));
  h.close();
  pending.resolve(png);
  await flush();
  assert.equal(h.closed, 1);
  assert.equal(h.created.length, 0);
  assert.equal(h.saved.length, 0);
}

console.log("Actual List editor callbacks: validation/save, latest selection, invalid correction, blob release and disposal PASS");
