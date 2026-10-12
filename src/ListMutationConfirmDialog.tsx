import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
} from "react";
import "./listMutationConfirmDialog.css";

export type ListMutationConfirmAction = "archive" | "delete" | "delete-done-task";

type ListMutationConfirmDialogProps = {
  action: ListMutationConfirmAction;
  listTitle: string;
  pending?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  onReturnFocus?: () => void;
};

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden"));
}

export function ListMutationConfirmDialog({
  action,
  listTitle,
  pending = false,
  error = null,
  onCancel,
  onConfirm,
  onReturnFocus,
}: ListMutationConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const warningId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const isDelete = action !== "archive";
  const isDoneTaskDelete = action === "delete-done-task";
  const heading = isDoneTaskDelete
    ? "Permanently delete this task?"
    : isDelete ? `Permanently delete ${listTitle}?` : `Archive ${listTitle}?`;
  const description = isDoneTaskDelete
    ? `“${listTitle}” and its saved information will be permanently removed.`
    : isDelete
      ? "This permanently removes the archived list and its tasks. This action cannot be undone."
      : "The list leaves your active workspace, but its tasks and history stay preserved and can be restored later.";
  const confirmLabel = isDoneTaskDelete ? "Delete task permanently" : isDelete ? "Permanently delete" : "Archive list";

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();
    return () => {
      if (openerRef.current?.isConnected) openerRef.current.focus();
      else onReturnFocus?.();
    };
  }, []);

  function requestCancel() {
    if (!pending) onCancel();
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      requestCancel();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = focusableElements(dialogRef.current);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="list-confirm-backdrop motion-modal"
      data-list-confirm-backdrop="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="list-confirm-dialog motion-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={isDoneTaskDelete ? `${descriptionId} ${warningId}` : descriptionId}
        data-list-confirm-action={action}
        onKeyDown={handleKeyDown}
      >
        <p className="list-confirm-dialog__eyebrow type-metadata">
          {isDelete ? "Permanent deletion" : "Archive list"}
        </p>
        <h2 id={titleId} className="list-confirm-dialog__title type-section-title">{heading}</h2>
        <p id={descriptionId} className="list-confirm-dialog__description">{description}</p>
        {isDoneTaskDelete ? (
          <div id={warningId} className="list-confirm-dialog__irreversible" data-archived-done-delete-warning="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3 2 21h20L12 3Z" />
              <path d="M12 9v5" />
              <path d="M12 18h.01" />
            </svg>
            <span>Notes, subtasks, reminders, tracked sessions and their Reports / export history will also be deleted. This cannot be undone.</span>
          </div>
        ) : null}

        {error ? <div className="list-confirm-dialog__error" role="alert">{error}</div> : null}

        <div className="list-confirm-dialog__actions">
          <button
            ref={cancelRef}
            type="button"
            className="list-confirm-dialog__cancel motion-interactive"
            disabled={pending}
            onClick={requestCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="list-confirm-dialog__confirm motion-interactive"
            data-destructive={isDelete ? "true" : "false"}
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? (isDoneTaskDelete ? "Deleting…" : "Saving…") : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
