import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
} from "react";
import { WindowsShortcutSettingsPanel } from "./WindowsShortcutSettingsPanel";
import "./windowsShortcutsDialog.css";

type WindowsShortcutsDialogProps = {
  onRequestClose: () => void;
};

function tabbableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) =>
    !element.closest("[hidden], [inert]") && element.getClientRects().length > 0);
}

/**
 * Dedicated, closeable shortcuts surface from SS-C17.
 * Reuses the existing 3 global toggle controls and 7 fixed app-only bindings:
 * no additional shortcut registration/persistence authority is created here.
 */
export function WindowsShortcutsDialog({ onRequestClose }: WindowsShortcutsDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement : null;
    const oldBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = oldBodyOverflow;
      if (openerRef.current?.isConnected) openerRef.current.focus({ preventScroll: true });
    };
  }, []);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onRequestClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    // The inner dedicated dialog owns the keyboard focus, not the previously
    // active Preferences or Main shell.
    event.stopPropagation();
    const elements = tabbableWithin(dialogRef.current);
    if (!elements.length) {
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
  }

  return (
    <div
      className="windows-shortcuts-dialog__backdrop motion-modal"
      data-windows-shortcuts-dialog="true"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onRequestClose();
      }}
    >
      <section
        ref={dialogRef}
        className="windows-shortcuts-dialog__surface motion-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="windows-shortcuts-dialog-title"
        onKeyDown={handleKeyDown}
      >
        <header className="windows-shortcuts-dialog__heading">
          <h2 id="windows-shortcuts-dialog-title" className="type-page-title">
            Windows Shortcuts
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="windows-shortcuts-dialog__close motion-interactive"
            data-windows-shortcuts-close="true"
            aria-label="Close Windows Shortcuts"
            onClick={onRequestClose}
          >
            ×
          </button>
        </header>
        <div className="windows-shortcuts-dialog__scroll">
          <WindowsShortcutSettingsPanel />
        </div>
      </section>
    </div>
  );
}
