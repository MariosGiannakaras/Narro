import {
  type ChangeEvent, type CSSProperties, type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent, useEffect, useId, useRef, useState,
} from "react";
import type { HomeListCardSnapshot } from "./HomeDashboard";
import type { ListEditorRequest } from "./listEditorApi";
import { BuiltinListIcon, isBuiltinListIconId } from "./BuiltinListIcon";
import { ListIcon } from "./ListIcon";
import { BuiltinIconPalette, SpectrumColorPopover } from "./ListEditorPopovers";
import { listIconContrast } from "./listSpectrumColor";
import "./listEditorModal.css";

const MAX_ICON_BYTES = 1_048_576;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const COLOR_SWATCHES = [
  "#48d6c5", "#b7d96d", "#5da7e8", "#8a78dc", "#e0a34d", "#df716b",
] as const;

export type ListEditorMode = "create" | "edit";
type ListEditorModalProps = {
  mode: ListEditorMode;
  initialList?: HomeListCardSnapshot;
  onRequestClose: () => void;
  onSave: (request: ListEditorRequest) => Promise<void>;
};
type IconDraft =
  | { kind: "keep" }
  | { kind: "letter" }
  | { kind: "builtin"; id: string }
  | { kind: "upload"; file: File; previewUrl: string };

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


export function ListEditorModal({ mode, initialList, onRequestClose, onSave }: ListEditorModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const customColorId = useId();
  const iconPaletteId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customColorButtonRef = useRef<HTMLButtonElement>(null);
  const iconPaletteButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const colorAtOpen = useRef(initialList?.color ?? COLOR_SWATCHES[0]);
  const savingRef = useRef(false);
  const [title, setTitle] = useState(initialList?.title ?? "");
  const [color, setColor] = useState(initialList?.color ?? COLOR_SWATCHES[0]);
  const [customColorOpen, setCustomColorOpen] = useState(false);
  const [iconPaletteOpen, setIconPaletteOpen] = useState(false);
  const [iconDraft, setIconDraft] = useState<IconDraft>(
    mode === "edit" ? { kind: "keep" } : { kind: "letter" },
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const heading = mode === "create" ? "Create a new list" : "Edit list";
  const submitLabel = mode === "create" ? "Create" : "Save changes";
  const initial = Array.from(title.trim())[0]?.toLocaleUpperCase() || "L";
  const retainedIcon = mode === "edit" && Boolean(initialList?.iconAsset) && iconDraft.kind === "keep";
  const builtinIconId = iconDraft.kind === "builtin" ? iconDraft.id
    : iconDraft.kind === "keep" && initialList?.iconId && isBuiltinListIconId(initialList.iconId)
      ? initialList.iconId : null;
  const iconLabel = iconDraft.kind === "upload" ? iconDraft.file.name
    : retainedIcon ? "Current local icon retained" : "UPLOAD AN ICON";
  const normalizedTitle = title.trim();
  const canSubmit = normalizedTitle.length > 0 && !saving;
  const isPresetColor = COLOR_SWATCHES.some((preset) => preset === color.toLowerCase());
  const previewColor = HEX_COLOR.test(color) ? color : COLOR_SWATCHES[0];

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    titleInputRef.current?.focus();
    return () => openerRef.current?.focus();
  }, []);

  // The blob URL belongs to exactly one draft; changing selection or cancelling
  // revokes it, but never modifies the already-persisted uploaded file.
  useEffect(() => () => {
    if (iconDraft.kind === "upload") URL.revokeObjectURL(iconDraft.previewUrl);
  }, [iconDraft]);

  // A body-portaled popup is still part of the one modal focus owner.
  useEffect(() => {
    if (!customColorOpen && !iconPaletteOpen) return;
    const closePopover = (revert: boolean) => {
      if (customColorOpen) {
        if (revert) setColor(colorAtOpen.current);
        setCustomColorOpen(false);
        customColorButtonRef.current?.focus({ preventScroll: true });
      } else {
        setIconPaletteOpen(false);
        iconPaletteButtonRef.current?.focus({ preventScroll: true });
      }
    };
    const outside = (event: PointerEvent) => {
      const anchor = customColorOpen ? customColorButtonRef.current : iconPaletteButtonRef.current;
      const panel = document.getElementById(customColorOpen ? customColorId : iconPaletteId);
      if (!anchor?.contains(event.target as Node) && !panel?.contains(event.target as Node)) {
        if (customColorOpen) setCustomColorOpen(false);
        else setIconPaletteOpen(false);
      }
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (!saving) closePopover(customColorOpen);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const panel = document.getElementById(customColorOpen ? customColorId : iconPaletteId);
      const elements = [
        ...focusableElements(dialogRef.current),
        ...(panel ? focusableElements(panel) : []),
      ].filter((item) => item.getClientRects().length > 0);
      if (!elements.length) return;
      const index = elements.indexOf(document.activeElement as HTMLElement);
      if (index < 0) {
        event.preventDefault();
        elements[event.shiftKey ? elements.length - 1 : 0]?.focus();
      } else if (event.shiftKey && index === 0) {
        event.preventDefault();
        elements[elements.length - 1]?.focus();
      } else if (!event.shiftKey && index === elements.length - 1) {
        event.preventDefault();
        elements[0]?.focus();
      }
    };
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [customColorOpen, iconPaletteOpen, customColorId, iconPaletteId, saving]);

  function requestClose() {
    if (!savingRef.current) onRequestClose();
  }
  function closeColorPicker() {
    setCustomColorOpen(false);
    customColorButtonRef.current?.focus({ preventScroll: true });
  }
  function openColorPicker() {
    if (savingRef.current) return;
    setIconPaletteOpen(false);
    colorAtOpen.current = color;
    setCustomColorOpen(true);
  }
  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    // Popover-owning Escape/Tab are intercepted above in native capture.
    if (customColorOpen || iconPaletteOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const elements = focusableElements(dialogRef.current);
    if (!elements.length) return;
    if (event.shiftKey && document.activeElement === elements[0]) {
      event.preventDefault();
      elements[elements.length - 1]?.focus();
    } else if (!event.shiftKey && document.activeElement === elements[elements.length - 1]) {
      event.preventDefault();
      elements[0]?.focus();
    }
  }
  async function handleIconChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || savingRef.current) return;
    const validationError = await validateIconFile(file);
    if (savingRef.current) return;
    if (validationError) {
      setError(validationError);
      return;
    }
    setIconDraft({ kind: "upload", file, previewUrl: URL.createObjectURL(file) });
    setIconPaletteOpen(false);
    setError(null);
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setCustomColorOpen(false);
    setIconPaletteOpen(false);
    setError(null);
    try {
      const iconSelection = iconDraft.kind === "upload"
        ? {
            kind: "upload" as const,
            filename: iconDraft.file.name,
            bytes: Array.from(new Uint8Array(await iconDraft.file.arrayBuffer())),
          }
        : iconDraft.kind === "builtin" ? { kind: "builtin" as const, id: iconDraft.id }
          : iconDraft.kind === "keep" ? { kind: "keep" as const }
            : { kind: "letter" as const };
      await onSave({ title: normalizedTitle, color, iconUpload: null, iconSelection });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="list-editor-backdrop motion-modal" data-list-editor-backdrop="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}>
      <div ref={dialogRef} className="list-editor-modal motion-modal" role="dialog"
        aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}
        data-list-editor-mode={mode} onKeyDown={handleDialogKeyDown}>
        <button type="button" className="list-editor-modal__close motion-interactive"
          aria-label="Close list editor" onClick={requestClose} disabled={saving}>×</button>
        <header className="list-editor-modal__header">
          <p className="list-editor-modal__eyebrow type-metadata">Lists</p>
          <h2 id={titleId} className="list-editor-modal__title type-page-title">{heading}</h2>
          <p id={descriptionId} className="list-editor-modal__description">
            Choose a local icon, color, and title. Changes are saved only after local persistence succeeds.
          </p>
        </header>
        <form className="list-editor-modal__form" onSubmit={handleSubmit}>
          <div className="list-editor-modal__upload">
            <input ref={fileInputRef} className="list-editor-modal__file-input"
              type="file" tabIndex={-1}
              accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml"
              aria-label="Choose a list icon"
              onChange={(event) => void handleIconChange(event)} disabled={saving} />
            <button type="button" className="list-editor-modal__upload-circle motion-interactive"
              aria-label="Upload a list icon" disabled={saving}
              style={{
                "--selected-list-color": previewColor,
                "--list-preview-contrast": listIconContrast(previewColor),
              } as CSSProperties}
              onClick={() => fileInputRef.current?.click()}>
              {iconDraft.kind === "upload" ? <img src={iconDraft.previewUrl} alt="" />
                : builtinIconId ? <BuiltinListIcon id={builtinIconId} />
                  : retainedIcon && initialList
                    ? <ListIcon listId={initialList.id} iconAsset={initialList.iconAsset}
                        fallback={initial} imageClassName="list-editor-modal__upload-image" />
                    : <span>{initial}</span>}
            </button>
            <span className="list-editor-modal__upload-label">{iconLabel}</span>
            <span className="list-editor-modal__upload-formats type-metadata">
              (jpg, png, svg · max 1 MiB)
            </span>
          </div>
          <fieldset className="list-editor-modal__colors">
            <legend className="type-metadata">Pick a list color</legend>
            <div className="list-editor-modal__color-options">
              <button ref={customColorButtonRef} type="button"
                className="list-editor-modal__swatch list-editor-modal__swatch--custom motion-interactive"
                aria-label="Pick a custom list color" aria-controls={customColorId}
                aria-expanded={customColorOpen} data-custom-color-trigger="true"
                data-selected={!isPresetColor ? "true" : "false"}
                onClick={() => customColorOpen ? closeColorPicker() : openColorPicker()}
                disabled={saving}>
                <span aria-hidden="true">{!isPresetColor ? "✓" : "+"}</span>
              </button>
              <div className="list-editor-modal__swatches" role="radiogroup" aria-label="Preset list colors">
                {COLOR_SWATCHES.map((swatch) => {
                  const selected = color.toLowerCase() === swatch;
                  return (
                    <label key={swatch} className="list-editor-modal__swatch"
                      style={{ "--list-editor-swatch": swatch } as CSSProperties}
                      data-selected={selected ? "true" : "false"} aria-label={`Color ${swatch}`}>
                      <input type="radio" name="list-color" value={swatch} checked={selected}
                        disabled={saving} onChange={() => { setColor(swatch); setCustomColorOpen(false); }} />
                      <span aria-hidden="true">{selected ? "✓" : ""}</span>
                    </label>
                  );
                })}
              </div>
              <button ref={iconPaletteButtonRef} type="button"
                className="list-editor-modal__swatch list-editor-modal__swatch--icons motion-interactive"
                aria-label="Choose a built-in list icon" aria-controls={iconPaletteId}
                aria-expanded={iconPaletteOpen} data-selected={builtinIconId ? "true" : "false"}
                onClick={() => {
                  if (savingRef.current) return;
                  setCustomColorOpen(false);
                  setIconPaletteOpen((value) => !value);
                }}
                disabled={saving}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </button>
            </div>
          </fieldset>
          {customColorOpen && !saving ? (
            <SpectrumColorPopover color={color} onChange={setColor}
              anchorRef={customColorButtonRef} dialogRef={dialogRef}
              panelId={customColorId} onClose={closeColorPicker} saving={saving} />
          ) : null}
          {iconPaletteOpen && !saving ? (
            <BuiltinIconPalette selectedId={builtinIconId} initial={initial}
              onSelect={(id) => {
                setIconDraft(id ? { kind: "builtin", id } : { kind: "letter" });
                setIconPaletteOpen(false);
                iconPaletteButtonRef.current?.focus({ preventScroll: true });
              }}
              anchorRef={iconPaletteButtonRef} dialogRef={dialogRef}
              panelId={iconPaletteId} saving={saving} />
          ) : null}
          <label className="list-editor-modal__field">
            <span className="type-metadata">Title</span>
            <input ref={titleInputRef} type="text" value={title}
              onChange={(event) => setTitle(event.target.value)} autoComplete="off"
              placeholder="Enter your list title" spellCheck required disabled={saving}
              aria-invalid={normalizedTitle.length === 0 && title.length > 0 ? "true" : undefined} />
          </label>
          {error ? <div className="list-editor-modal__error" role="alert">{error}</div> : null}
          <footer className="list-editor-modal__footer">
            <button type="button" className="list-editor-modal__cancel motion-interactive"
              onClick={requestClose} disabled={saving}>Cancel</button>
            <button type="submit" className="list-editor-modal__submit motion-interactive"
              disabled={!canSubmit}>{saving ? "Saving…" : submitLabel}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
