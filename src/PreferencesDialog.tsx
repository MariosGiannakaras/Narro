import { type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useEffect, useRef } from "react";
import "./preferencesDialog.css";

type PreferencesDialogProps = {
  onRequestClose: () => void;
  children: ReactNode;
};

function interactiveDescendants(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.closest("[hidden], [inert]") && element.getClientRects().length > 0);
}

export function PreferencesDialog({ onRequestClose, children }: PreferencesDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const existingOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = existingOverflow;
      openerRef.current?.focus();
    };
  }, []);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onRequestClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const elements = interactiveDescendants(dialogRef.current);
    if (elements.length === 0) {
      event.preventDefault();
      return;
    }
    const first = elements[0];
    const last = elements[elements.length - 1];
    const current = document.activeElement;
    if (!(current instanceof HTMLElement) || !dialogRef.current.contains(current)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="preferences-dialog__backdrop motion-modal"
      data-preferences-dialog="true"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onRequestClose();
      }}
    >
      <section
        ref={dialogRef}
        className="preferences-dialog__surface motion-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-settings-title"
        onKeyDown={handleKeyDown}
      >
        <div className="preferences-dialog__closebar">
          <button
            ref={closeRef}
            type="button"
            className="preferences-dialog__close motion-interactive"
            aria-label="Close Preferences"
            data-preferences-close="true"
            onClick={onRequestClose}
          >
            ×
          </button>
        </div>
        <div className="preferences-dialog__scroll">{children}</div>
      </section>
    </div>
  );
}
