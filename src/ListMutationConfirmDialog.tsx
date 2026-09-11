import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
} from "react";
import "./listMutationConfirmDialog.css";

export type ListMutationConfirmAction = "archive" | "delete";

type ListMutationConfirmDialogProps = {
  action: ListMutationConfirmAction;
  listTitle: string;
  pending?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
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
}: ListMutationConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const isDelete = action === "delete";
  const heading = isDelete ? `Permanently delete ${listTitle}?` : `Archive ${listTitle}?`;
  const description = isDelete
    ? "This permanently removes the archived list and its tasks. This action cannot be undone."
    : "The list leaves your active workspace, but its tasks and history stay preserved and can be restored later.";
  const confirmLabel = isDelete ? "Permanently delete" : "Archive list";

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();
    return () => openerRef.current?.focus();
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
        aria-describedby={descriptionId}
        data-list-confirm-action={action}
        onKeyDown={handleKeyDown}
      >
        <p className="list-confirm-dialog__eyebrow type-metadata">
          {isDelete ? "Permanent deletion" : "Archive list"}
        </p>
        <h2 id={titleId} className="list-confirm-dialog__title type-section-title">{heading}</h2>
        <p id={descriptionId} className="list-confirm-dialog__description">{description}</p>

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
            {pending ? "Saving…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
