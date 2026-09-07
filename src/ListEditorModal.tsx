import {
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { HomeListCardSnapshot } from "./HomeDashboard";
import type { ListEditorRequest } from "./listEditorApi";
import "./listEditorModal.css";

const MAX_ICON_BYTES = 1_048_576;
const COLOR_SWATCHES = [
  "#48d6c5",
  "#b7d96d",
  "#5da7e8",
  "#8a78dc",
  "#e0a34d",
  "#df716b",
] as const;

export type ListEditorMode = "create" | "edit";

type ListEditorModalProps = {
  mode: ListEditorMode;
  initialList?: HomeListCardSnapshot;
  onRequestClose: () => void;
  onSave: (request: ListEditorRequest) => Promise<void>;
};

type SelectedIcon = {
  file: File;
  previewUrl: string;
};

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

async function validateIconFile(file: File): Promise<string | null> {
  if (file.size === 0) return "The selected icon is empty.";
  if (file.size > MAX_ICON_BYTES) return "Icons must be 1 MiB or smaller.";

  const extension = extensionOf(file.name);
  if (!["jpg", "jpeg", "png", "svg"].includes(extension)) {
    return "Choose a JPG, PNG, or SVG image.";
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (extension === "png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (bytes.length < signature.length || !signature.every((value, index) => bytes[index] === value)) {
      return "The selected file is not a valid PNG image.";
    }
  }
  if ((extension === "jpg" || extension === "jpeg")
    && (bytes.length < 3 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff)) {
    return "The selected file is not a valid JPG image.";
  }
  if (extension === "svg") {
    const text = new TextDecoder().decode(bytes).trimStart().toLowerCase();
    const hasSvgRoot = text.startsWith("<svg") || (text.startsWith("<?xml") && text.includes("<svg"));
    const unsafe = text.includes("<script") || text.includes("javascript:") || text.includes("<!doctype");
    if (!hasSvgRoot || unsafe) return "The selected SVG cannot be used as a list icon.";
  }

  return null;
}

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden"));
}

export function ListEditorModal({
  mode,
  initialList,
  onRequestClose,
  onSave,
}: ListEditorModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [title, setTitle] = useState(initialList?.title ?? "");
  const [color, setColor] = useState(initialList?.color ?? COLOR_SWATCHES[0]);
  const [selectedIcon, setSelectedIcon] = useState<SelectedIcon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const heading = mode === "create" ? "Create a new list" : "Edit list";
  const submitLabel = mode === "create" ? "Create" : "Save changes";
  const retainedIcon = Boolean(mode === "edit" && initialList?.iconAsset && !selectedIcon);

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    titleInputRef.current?.focus();
    return () => openerRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedIcon) URL.revokeObjectURL(selectedIcon.previewUrl);
    };
  }, [selectedIcon]);

  const normalizedTitle = title.trim();
  const canSubmit = normalizedTitle.length > 0 && !saving;
  const iconLabel = useMemo(() => {
    if (selectedIcon) return selectedIcon.file.name;
    if (retainedIcon) return "Current local icon retained";
    return "UPLOAD AN ICON";
  }, [retainedIcon, selectedIcon]);

  function requestClose() {
    if (!saving) onRequestClose();
  }

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
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

  async function handleIconChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = await validateIconFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (selectedIcon) URL.revokeObjectURL(selectedIcon.previewUrl);
    setSelectedIcon({ file, previewUrl: URL.createObjectURL(file) });
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError(null);
    try {
      const iconUpload = selectedIcon
        ? {
            filename: selectedIcon.file.name,
            bytes: Array.from(new Uint8Array(await selectedIcon.file.arrayBuffer())),
          }
        : null;
      await onSave({ title: normalizedTitle, color, iconUpload });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
      setSaving(false);
    }
  }

  return (
    <div
      className="list-editor-backdrop motion-modal"
      data-list-editor-backdrop="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialogRef}
        className="list-editor-modal motion-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-list-editor-mode={mode}
        onKeyDown={handleDialogKeyDown}
      >
        <button
          type="button"
          className="list-editor-modal__close motion-interactive"
          aria-label="Close list editor"
          onClick={requestClose}
          disabled={saving}
        >
          ×
        </button>

        <header className="list-editor-modal__header">
          <p className="list-editor-modal__eyebrow type-metadata">Lists</p>
          <h2 id={titleId} className="list-editor-modal__title type-page-title">{heading}</h2>
          <p id={descriptionId} className="list-editor-modal__description">
            Choose a local icon, color, and title. Changes are saved only after local persistence succeeds.
          </p>
        </header>

        <form className="list-editor-modal__form" onSubmit={handleSubmit}>
          <label className="list-editor-modal__upload motion-interactive">
            <input
              className="list-editor-modal__file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml"
              onChange={handleIconChange}
              disabled={saving}
            />
            <span className="list-editor-modal__upload-circle" aria-hidden="true">
              {selectedIcon ? <img src={selectedIcon.previewUrl} alt="" /> : <span>+</span>}
            </span>
            <span className="list-editor-modal__upload-label">{iconLabel}</span>
            <span className="list-editor-modal__upload-formats type-metadata">(jpg, png, svg · max 1 MiB)</span>
          </label>

          <fieldset className="list-editor-modal__colors">
            <legend className="type-metadata">List color</legend>
            <div className="list-editor-modal__swatches" role="radiogroup" aria-label="List color">
              {COLOR_SWATCHES.map((swatch) => {
                const selected = color.toLowerCase() === swatch;
                return (
                  <label
                    key={swatch}
                    className="list-editor-modal__swatch"
                    style={{ "--list-editor-swatch": swatch } as CSSProperties}
                    data-selected={selected ? "true" : "false"}
                    aria-label={`Color ${swatch}`}
                  >
                    <input
                      type="radio"
                      name="list-color"
                      value={swatch}
                      checked={selected}
                      onChange={() => setColor(swatch)}
                      disabled={saving}
                    />
                    <span aria-hidden="true">{selected ? "✓" : ""}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="list-editor-modal__field">
            <span className="type-metadata">Title</span>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoComplete="off"
              spellCheck
              required
              disabled={saving}
              aria-invalid={normalizedTitle.length === 0 && title.length > 0 ? "true" : undefined}
            />
          </label>

          {error ? <div className="list-editor-modal__error" role="alert">{error}</div> : null}

          <footer className="list-editor-modal__footer">
            <button
              type="button"
              className="list-editor-modal__cancel motion-interactive"
              onClick={requestClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="list-editor-modal__submit motion-interactive"
              disabled={!canSubmit}
            >
              {saving ? "Saving…" : submitLabel}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
