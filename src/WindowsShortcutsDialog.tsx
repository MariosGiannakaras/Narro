import { ActionIcon } from "./ActionIcon";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { WindowsShortcutSettingsPanel } from "./WindowsShortcutSettingsPanel";
import "./windowsShortcutsDialog.css";

type WindowsShortcutsDialogProps = {
  onRequestClose: () => void;
  /** Preview-only slot; production keeps authoritative native shortcut state. */
  settingsContent?: ReactNode;
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
export function WindowsShortcutsDialog({ onRequestClose, settingsContent }: WindowsShortcutsDialogProps) {
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

  // Async shortcut saves disable the focused checkbox. When Chromium moves
  // focus outside this modal, recover Escape/Tab without stealing input from
  // a newer modal or handling events already owned by an inner control.
  useEffect(() => {
    const recoverOrphanedKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || (event.key !== "Escape" && event.key !== "Tab")) return;
      const dialog = dialogRef.current;
      if (!dialog || (event.target instanceof Node && dialog.contains(event.target))) return;
      const activeDialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'))
        .filter((element) => !element.closest('[hidden], [inert], [aria-hidden="true"]')
          && element.getClientRects().length > 0);
      if (activeDialogs[activeDialogs.length - 1] !== dialog) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") {
        onRequestClose();
        return;
      }
      const elements = tabbableWithin(dialog);
      (event.shiftKey ? elements[elements.length - 1] : elements[0] ?? closeRef.current)
        ?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", recoverOrphanedKey);
    return () => window.removeEventListener("keydown", recoverOrphanedKey);
  }, [onRequestClose]);

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
            <ActionIcon name="close" />
          </button>
        </header>
        <div className="windows-shortcuts-dialog__scroll">
          {settingsContent ?? <WindowsShortcutSettingsPanel />}
        </div>
      </section>
    </div>
  );
}
