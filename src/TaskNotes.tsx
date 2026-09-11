import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Fragment,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { formatInvokeError } from "./diagnosticApi";
import {
  deleteListBoardTaskNote,
  getListBoardTaskNote,
  saveListBoardTaskNote,
  type BoardTaskNoteSnapshot,
  type NoteBlock,
  type NoteDocument,
  type NoteListItem,
  type NoteTextRun,
} from "./listBoardApi";
import { Tooltip } from "./overlayPrimitives";
import "./taskNotes.css";

type TaskNotesProps = {
  taskId: string;
  listId: string;
  taskTitle: string;
  expanded: boolean;
  canExpand: boolean;
  readOnly: boolean;
  onToggleExpanded: () => void;
  onMutationStatus: (status: string, error: string | null) => void;
  onRefreshBlocked: (message: string) => void;
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

function baseInlineStyle(): InlineStyle {
  return {
    bold: false,
    italic: false,
    strikethrough: false,
    link: null,
  };
}

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
  container.childNodes.forEach((child) => readInlineNode(child, baseInlineStyle(), runs));
  return runs.length > 0 ? runs : [{ text: "" }];
}

function readSingleNode(node: Node): NoteTextRun[] {
  const runs: NoteTextRun[] = [];
  readInlineNode(node, baseInlineStyle(), runs);
  return runs.length > 0 ? runs : [{ text: "" }];
}

function editorDocument(root: HTMLElement): NoteDocument {
  const blocks: NoteBlock[] = [];
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      blocks.push({ kind: "paragraph", runs: readSingleNode(node) });
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

function NoteRun({
  run,
  onOpenError,
}: {
  run: NoteTextRun;
  onOpenError: (message: string | null) => void;
}) {
  const content = styledRun(run, run.text);
  const link = safeExternalUrl(run.link);
  if (!link) return <>{content}</>;
  return (
    <button
      type="button"
      className="task-notes__link"
      data-task-note-control="open-link"
      data-note-url-activation="explicit"
      aria-label={`Open saved note link: ${run.text || link}`}
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

function validSnapshot(
  payload: BoardTaskNoteSnapshot,
  taskId: string,
  listId: string,
): boolean {
  return payload.taskId === taskId && payload.listId === listId;
}

export function TaskNotes({
  taskId,
  listId,
  taskTitle,
  expanded,
  canExpand,
  readOnly,
  onToggleExpanded,
  onMutationStatus,
  onRefreshBlocked,
}: TaskNotesProps) {
  const [snapshot, setSnapshot] = useState<BoardTaskNoteSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [locallyBlocked, setLocallyBlocked] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    let disposed = false;
    setLoading(true);
    setPanelError(null);
    setLocallyBlocked(false);
    void getListBoardTaskNote(taskId, listId)
      .then((payload) => {
        if (disposed) return;
        if (!validSnapshot(payload, taskId, listId)) {
          setSnapshot(null);
          setPanelError("Authoritative note details did not match this task. Reopen the board before editing.");
          setLoading(false);
          return;
        }
        setSnapshot(payload);
        setPanelError(null);
        setLoading(false);
      })
      .catch((failure: unknown) => {
        if (disposed) return;
        setSnapshot(null);
        setPanelError(formatInvokeError(failure));
        setLoading(false);
      });
    return () => {
      disposed = true;
    };
  }, [expanded, taskId, listId]);

  const refreshAfterCommit = async () => {
    const payload = await getListBoardTaskNote(taskId, listId);
    if (!validSnapshot(payload, taskId, listId)) {
      throw new Error("authoritative note refresh returned a mismatched task/list identity");
    }
    setSnapshot(payload);
    setPanelError(null);
  };

  const handleCommittedRefreshFailure = (failure: unknown) => {
    const detail = formatInvokeError(failure);
    const message = `Note change was saved, but authoritative task details could not refresh. ${detail} Switch lists or reopen this board before making more task changes.`;
    setLocallyBlocked(true);
    setPanelError("Notes changed, but this panel is stale. Reopen the board before editing again.");
    onRefreshBlocked(message);
  };

  const saveNote = async (document: NoteDocument) => {
    if (!snapshot || !snapshot.mutable || readOnly || pending || locallyBlocked) return;
    setPending(true);
    setPanelError(null);
    onMutationStatus("", null);
    try {
      await saveListBoardTaskNote({
        taskId,
        listId,
        expectedUpdatedAt: snapshot.note?.updatedAt ?? null,
        document,
      });
    } catch (failure: unknown) {
      const detail = formatInvokeError(failure);
      setPanelError(detail);
      onMutationStatus("Could not save task note.", detail);
      setPending(false);
      return;
    }

    onMutationStatus("Task note saved.", null);
    try {
      await refreshAfterCommit();
    } catch (failure: unknown) {
      handleCommittedRefreshFailure(failure);
    } finally {
      setPending(false);
    }
  };

  const deleteNote = async () => {
    const current = snapshot?.note;
    if (!snapshot?.mutable || readOnly || !current || pending || locallyBlocked) return;
    setPending(true);
    setPanelError(null);
    onMutationStatus("", null);
    try {
      await deleteListBoardTaskNote({
        taskId,
        listId,
        expectedUpdatedAt: current.updatedAt,
      });
    } catch (failure: unknown) {
      const detail = formatInvokeError(failure);
      setPanelError(detail);
      onMutationStatus("Could not delete task note.", detail);
      setPending(false);
      return;
    }

    onMutationStatus("Task note deleted.", null);
    try {
      await refreshAfterCommit();
    } catch (failure: unknown) {
      handleCommittedRefreshFailure(failure);
    } finally {
      setPending(false);
    }
  };

  const note = snapshot?.note ?? null;
  const editable = Boolean(snapshot?.mutable) && !readOnly && !locallyBlocked;
  const initialDocument = note?.document ?? EMPTY_NOTE;

  return (
    <div
      className="task-notes"
      data-task-notes={expanded ? "expanded" : "collapsed"}
      data-task-note-task-id={taskId}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="task-notes__trigger motion-interactive"
        data-task-note-control="toggle"
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} notes for ${taskTitle}`}
        disabled={pending || (!expanded && !canExpand)}
        draggable={false}
        onClick={onToggleExpanded}
      >
        <span>{note ? "Notes" : "Add notes"}</span>
        <span aria-hidden="true">{expanded ? "⌃" : "⌄"}</span>
      </button>

      {expanded ? (
        <div className="task-notes__panel" data-task-note-panel="true">
          {loading ? (
            <span className="type-metadata" role="status">Loading notes…</span>
          ) : panelError && !snapshot ? (
            <span className="task-notes__error type-metadata" role="alert">{panelError}</span>
          ) : snapshot ? (
            <>
              {editable ? (
                <RichNoteEditor
                  key={note?.updatedAt ?? "new-note"}
                  initialDocument={initialDocument}
                  pending={pending}
                  onSave={(document) => void saveNote(document)}
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
                      disabled={pending}
                      onClick={() => void deleteNote()}
                    >Delete</button>
                  </div>
                  <NoteViewer document={note.document} />
                </div>
              ) : null}

              {readOnly ? (
                <span className="task-notes__readonly type-metadata">All Lists shows Notes as read-only.</span>
              ) : locallyBlocked ? (
                <span className="task-notes__readonly type-metadata">Reload this board before editing Notes again.</span>
              ) : null}

              {panelError ? <span className="task-notes__error type-metadata" role="alert">{panelError}</span> : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
