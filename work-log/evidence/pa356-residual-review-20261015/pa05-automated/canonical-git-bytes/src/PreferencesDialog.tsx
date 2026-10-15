import { ActionIcon } from "./ActionIcon";
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

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement> | KeyboardEvent) => {
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

  useEffect(() => {
    // Disabling a focused preference while its async save commits can leave
    // Chromium focus on body. Such keys never bubble through this section.
    // Recover only this active modal's orphaned input; child popovers keep
    // their own Escape/Tab behavior and a newer modal must never be dismissed.
    const recoverOrphanedKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" && event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (event.defaultPrevented || !dialog || (event.target instanceof Node && dialog.contains(event.target))) return;
      const activeDialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'))
        .filter((element) => !element.closest('[hidden], [inert], [aria-hidden="true"]') && element.getClientRects().length > 0);
      if (activeDialogs[activeDialogs.length - 1] !== dialog) return;
      handleKeyDown(event);
    };
    window.addEventListener("keydown", recoverOrphanedKey);
    return () => window.removeEventListener("keydown", recoverOrphanedKey);
  }, [onRequestClose]);

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
            <ActionIcon name="close" />
          </button>
        </div>
        <div className="preferences-dialog__scroll">{children}</div>
      </section>
    </div>
  );
}
