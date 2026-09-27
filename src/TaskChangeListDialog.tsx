import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
} from "react";
import "./listMutationConfirmDialog.css";

export type TaskChangeListOption = {
  id: string;
  title: string;
};

type TaskChangeListDialogProps = {
  taskTitle: string;
  options: TaskChangeListOption[];
  selectedListId: string;
  pending?: boolean;
  error?: string | null;
  onSelectedListChange: (listId: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden"));
}

export function TaskChangeListDialog({
  taskTitle,
  options,
  selectedListId,
  pending = false,
  error = null,
  onSelectedListChange,
  onCancel,
  onConfirm,
}: TaskChangeListDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const selectedIsValid = options.some((option) => option.id === selectedListId);

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    selectRef.current?.focus();
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
      data-task-change-list-backdrop="true"
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
        data-task-change-list-dialog="true"
        onKeyDown={handleKeyDown}
      >
        <p className="list-confirm-dialog__eyebrow type-metadata">Change List</p>
        <h2 id={titleId} className="list-confirm-dialog__title type-section-title">
          Move {taskTitle}
        </h2>
        <p id={descriptionId} className="list-confirm-dialog__description">
          Move the same task to another active list. Its schedule and tracked history stay attached to the task.
        </p>
        <label className="list-confirm-dialog__field">
          <span className="type-metadata">Destination list</span>
          <select
            ref={selectRef}
            value={selectedListId}
            disabled={pending}
            aria-label="Destination list"
            data-task-change-list-select="true"
            onChange={(event) => onSelectedListChange(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>{option.title}</option>
            ))}
          </select>
        </label>
        {error ? <div className="list-confirm-dialog__error" role="alert">{error}</div> : null}
        <div className="list-confirm-dialog__actions">
          <button
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
            disabled={pending || !selectedIsValid}
            data-task-change-list-confirm="true"
            onClick={onConfirm}
          >
            {pending ? "Moving…" : "Move task"}
          </button>
        </div>
      </div>
    </div>
  );
}
