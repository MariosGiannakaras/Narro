import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Fragment,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import type {
  BoardTaskNote,
  NoteBlock,
  NoteDocument,
  NoteListItem,
  NoteTextRun,
} from "./listBoardApi";
import { Tooltip } from "./overlayPrimitives";
import "./taskNotes.css";

export type TaskNotesModel = {
  expanded: boolean;
  loading: boolean;
  error: string | null;
  mutable: boolean;
  note: BoardTaskNote | null;
  pending: boolean;
};

type TaskNotesProps = {
  taskTitle: string;
  model?: TaskNotesModel;
  canExpand: boolean;
  onToggleExpanded: () => void;
  onSave: (document: NoteDocument) => void;
  onDelete: () => void;
};

type InlineStyle = {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  link: string | null;
};

const EMPTY_NOTE: NoteDocument = {
  blocks: [{ kind: "paragraph", runs: [{ text: "" }] }],
};

function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return null;
  const normalized = value.trim();
  return /^https?:\/\//i.test(normalized) ? normalized : null;
}

function sameStyle(left: NoteTextRun, right: InlineStyle): boolean {
  return Boolean(left.bold) === right.bold
    && Boolean(left.italic) === right.italic
    && Boolean(left.strikethrough) === right.strikethrough
    && (left.link ?? null) === right.link;
}

function appendRun(runs: NoteTextRun[], text: string, style: InlineStyle) {
  if (text.length === 0) return;
  const previous = runs[runs.length - 1];
  if (previous && sameStyle(previous, style)) {
    previous.text += text;
    return;
  }
  runs.push({
    text,
    bold: style.bold || undefined,
    italic: style.italic || undefined,
    strikethrough: style.strikethrough || undefined,
    link: style.link,
  });
}

function readInlineNode(node: Node, style: InlineStyle, runs: NoteTextRun[]) {
  if (node.nodeType === Node.TEXT_NODE) {
    appendRun(runs, node.textContent ?? "", style);
    return;
  }
  if (!(node instanceof HTMLElement)) return;
  if (node.tagName === "BR") {
    appendRun(runs, "\n", style);
    return;
  }

  const next: InlineStyle = {
    bold: style.bold || node.tagName === "B" || node.tagName === "STRONG",
    italic: style.italic || node.tagName === "I" || node.tagName === "EM",
    strikethrough: style.strikethrough || node.tagName === "S" || node.tagName === "STRIKE",
    link: node.tagName === "A"
      ? safeExternalUrl(node.getAttribute("href"))
      : style.link,
  };
  node.childNodes.forEach((child) => readInlineNode(child, next, runs));
}

function readRuns(container: Node): NoteTextRun[] {
  const runs: NoteTextRun[] = [];
  const style: InlineStyle = {
    bold: false,
    italic: false,
    strikethrough: false,
    link: null,
  };
  container.childNodes.forEach((child) => readInlineNode(child, style, runs));
  return runs.length > 0 ? runs : [{ text: "" }];
}

function editorDocument(root: HTMLElement): NoteDocument {
  const blocks: NoteBlock[] = [];
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      blocks.push({ kind: "paragraph", runs: readRuns(node) });
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.tagName === "UL" || node.tagName === "OL") {
      const items: NoteListItem[] = Array.from(node.children)
        .filter((child) => child.tagName === "LI")
        .map((child) => ({ runs: readRuns(child) }));
      blocks.push({
        kind: node.tagName === "UL" ? "bullet_list" : "numbered_list",
        items: items.length > 0 ? items : [{ runs: [{ text: "" }] }],
      });
      return;
    }
    blocks.push({ kind: "paragraph", runs: readRuns(node) });
  });
  return { blocks: blocks.length > 0 ? blocks : EMPTY_NOTE.blocks };
}

function styledRun(run: NoteTextRun, content: ReactNode): ReactNode {
  let node = content;
  if (run.bold) node = <strong>{node}</strong>;
  if (run.italic) node = <em>{node}</em>;
  if (run.strikethrough) node = <s>{node}</s>;
  return node;
}

function EditableRun({ run }: { run: NoteTextRun }) {
  const content = styledRun(run, run.text);
  const link = safeExternalUrl(run.link);
  return link ? <a href={link}>{content}</a> : <>{content}</>;
}

function EditableDocument({ document }: { document: NoteDocument }) {
  return document.blocks.map((block, blockIndex) => {
    if (block.kind === "paragraph") {
      return (
        <p key={`p-${blockIndex}`}>
          {block.runs.map((run, index) => <EditableRun key={index} run={run} />)}
        </p>
      );
    }
    const Tag = block.kind === "bullet_list" ? "ul" : "ol";
    return (
      <Tag key={`${block.kind}-${blockIndex}`}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>
            {item.runs.map((run, index) => <EditableRun key={index} run={run} />)}
          </li>
        ))}
      </Tag>
    );
  });
}

function NoteRun({ run, onOpenError }: { run: NoteTextRun; onOpenError: (message: string | null) => void }) {
  const content = styledRun(run, run.text);
  const link = safeExternalUrl(run.link);
  if (!link) return <>{content}</>;
  return (
    <button
      type="button"
      className="task-notes__link"
      data-task-note-control="open-link"
      title={link}
      onClick={() => {
        onOpenError(null);
        void openUrl(link).catch(() => onOpenError("The saved link could not be opened."));
      }}
    >
      {content}
    </button>
  );
}

function NoteViewer({ document }: { document: NoteDocument }) {
  const [openError, setOpenError] = useState<string | null>(null);
  return (
    <div className="task-notes__viewer" data-task-note-viewer="true">
      {document.blocks.map((block, blockIndex) => {
        const runs = (item: NoteListItem | { runs: NoteTextRun[] }) => item.runs.map((run, index) => (
          <Fragment key={index}><NoteRun run={run} onOpenError={setOpenError} /></Fragment>
        ));
        if (block.kind === "paragraph") {
          return <p key={`p-${blockIndex}`}>{runs(block)}</p>;
        }
        const Tag = block.kind === "bullet_list" ? "ul" : "ol";
        return (
          <Tag key={`${block.kind}-${blockIndex}`}>
            {block.items.map((item, index) => <li key={index}>{runs(item)}</li>)}
          </Tag>
        );
      })}
      {openError ? <span className="task-notes__error type-metadata" role="alert">{openError}</span> : null}
    </div>
  );
}

function ToolbarButton({
  label,
  children,
  disabled,
  onAction,
}: {
  label: string;
  children: ReactNode;
  disabled: boolean;
  onAction: () => void;
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        className="task-notes__toolbar-button motion-interactive"
        data-task-note-control="format"
        aria-label={label}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onAction}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function RichNoteEditor({
  initialDocument,
  pending,
  onSave,
}: {
  initialDocument: NoteDocument;
  pending: boolean;
  onSave: (document: NoteDocument) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [dirty, setDirty] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);

  const selectionInsideEditor = () => {
    const selection = window.getSelection();
    const root = editorRef.current;
    return Boolean(root && selection?.anchorNode && root.contains(selection.anchorNode));
  };

  const command = (name: string, value?: string) => {
    const root = editorRef.current;
    if (!root || pending) return;
    if (!selectionInsideEditor()) root.focus();
    document.execCommand(name, false, value);
    setDirty(true);
    setEditorError(null);
  };

  const addLink = () => {
    if (!selectionInsideEditor()) {
      setEditorError("Select note text before adding a link.");
      return;
    }
    const raw = window.prompt("Link URL (http or https)", "https://");
    if (raw === null) return;
    const link = safeExternalUrl(raw);
    if (!link) {
      setEditorError("Links must start with http:// or https://.");
      return;
    }
    command("createLink", link);
  };

  const save = () => {
    const root = editorRef.current;
    if (!root || pending) return;
    onSave(editorDocument(root));
  };

  return (
    <div className="task-notes__editor-shell" data-task-note-editor="true">
      <div className="task-notes__toolbar" role="toolbar" aria-label="Note formatting">
        <ToolbarButton label="Bold" disabled={pending} onAction={() => command("bold")}><strong>B</strong></ToolbarButton>
        <ToolbarButton label="Italic" disabled={pending} onAction={() => command("italic")}><em>I</em></ToolbarButton>
        <ToolbarButton label="Strikethrough" disabled={pending} onAction={() => command("strikeThrough")}><s>S</s></ToolbarButton>
        <ToolbarButton label="Bulleted list" disabled={pending} onAction={() => command("insertUnorderedList")}>•</ToolbarButton>
        <ToolbarButton label="Numbered list" disabled={pending} onAction={() => command("insertOrderedList")}>1.</ToolbarButton>
        <ToolbarButton label="Add link" disabled={pending} onAction={addLink}>↗</ToolbarButton>
        <ToolbarButton label="Undo" disabled={pending} onAction={() => command("undo")}>↶</ToolbarButton>
        <ToolbarButton label="Redo" disabled={pending} onAction={() => command("redo")}>↷</ToolbarButton>
      </div>
      <div
        ref={editorRef}
        className="task-notes__editor"
        contentEditable={!pending}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Task note"
        data-task-note-control="editor"
        onInput={() => {
          setDirty(true);
          setEditorError(null);
        }}
        onClick={(event: ReactMouseEvent<HTMLDivElement>) => {
          const target = event.target as Element;
          if (target.closest("a")) event.preventDefault();
        }}
      >
        <EditableDocument document={initialDocument} />
      </div>
      <div className="task-notes__editor-footer">
        <span className="type-metadata">{dirty ? "Unsaved changes" : "Saved content loaded"}</span>
        <button
          type="button"
          className="task-notes__save motion-interactive"
          data-task-note-control="save"
          disabled={pending}
          onClick={save}
        >
          {pending ? "Saving…" : "Save note"}
        </button>
      </div>
      {editorError ? <span className="task-notes__error type-metadata" role="alert">{editorError}</span> : null}
    </div>
  );
}

export function TaskNotes({
  taskTitle,
  model,
  canExpand,
  onToggleExpanded,
  onSave,
  onDelete,
}: TaskNotesProps) {
  const expanded = Boolean(model?.expanded);
  const note = model?.note ?? null;
  const editable = Boolean(model?.mutable);
  const initialDocument = note?.document ?? EMPTY_NOTE;

  return (
    <div
      className="task-notes"
      data-task-notes={expanded ? "expanded" : "collapsed"}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="task-notes__trigger motion-interactive"
        data-task-note-control="toggle"
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} notes for ${taskTitle}`}
        disabled={!canExpand}
        draggable={false}
        onClick={onToggleExpanded}
      >
        <span>{note ? "Notes" : "Add notes"}</span>
        <span aria-hidden="true">{expanded ? "⌃" : "⌄"}</span>
      </button>

      {expanded && model ? (
        <div className="task-notes__panel" data-task-note-panel="true">
          {model.loading ? (
            <span className="type-metadata" role="status">Loading notes…</span>
          ) : model.error ? (
            <span className="task-notes__error type-metadata" role="alert">{model.error}</span>
          ) : (
            <>
              {editable ? (
                <RichNoteEditor
                  key={note?.updatedAt ?? "new-note"}
                  initialDocument={initialDocument}
                  pending={model.pending}
                  onSave={onSave}
                />
              ) : note ? (
                <NoteViewer document={note.document} />
              ) : (
                <span className="task-notes__empty type-metadata">No notes yet.</span>
              )}

              {editable && note ? (
                <div className="task-notes__saved-preview">
                  <div className="task-notes__saved-preview-heading type-metadata">
                    <span>Saved note</span>
                    <button
                      type="button"
                      className="task-notes__delete motion-interactive"
                      data-task-note-control="delete"
                      disabled={model.pending}
                      onClick={onDelete}
                    >Delete</button>
                  </div>
                  <NoteViewer document={note.document} />
                </div>
              ) : null}

              {!editable ? (
                <span className="task-notes__readonly type-metadata">All Lists shows Notes as read-only.</span>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
