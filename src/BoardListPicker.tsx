import { type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, useEffect, useId, useRef, useState } from "react";
import type { ListBoardRequestTarget } from "./listBoardApi";
import { ListIcon } from "./ListIcon";
import { listIconContrast } from "./listSpectrumColor";
import "./boardListPicker.css";

const ALL_LISTS = "__all_lists__";
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

type BoardListOption = {
  id: string;
  title: string;
  color: string | null;
  iconAsset?: string | null;
  iconId?: string | null;
};
type BoardListPickerProps = {
  selectedTarget: string;
  options: BoardListOption[];
  disabled: boolean;
  onTargetChange?: (target: ListBoardRequestTarget) => void;
  variant?: "board" | "focus";
};

function listAccent(color: string | null): CSSProperties | undefined {
  return color && HEX_COLOR.test(color)
    ? {
        "--board-list-accent": color,
        "--board-list-accent-foreground": listIconContrast(color),
      } as CSSProperties
    : undefined;
}

function ListBadge({ option, focus }: { option: BoardListOption; focus: boolean }) {
  return (
    <span
      className={focus ? "board-list-picker__badge board-list-picker__badge--focus" : "board-list-picker__badge"}
      style={listAccent(option.color)}
      aria-hidden="true"
    >
      {focus ? <ListIcon listId={option.id} iconAsset={option.iconAsset ?? null}
        iconId={option.iconId} fallback={option.title.trim().slice(0, 1).toUpperCase() || "•"}
        imageClassName="board-list-picker__badge-icon" /> : null}
    </span>
  );
}

function ListBadges({ options, focus }: { options: BoardListOption[]; focus: boolean }) {
  const shown = options.slice(0, focus ? 2 : 3);
  return (
    <span className="board-list-picker__all-badges" aria-hidden="true">
      {shown.map((option) => <ListBadge key={option.id} option={option} focus={focus} />)}
      {focus && options.length > shown.length ? (
        <span className="board-list-picker__remaining-count">+{options.length - shown.length}</span>
      ) : null}
    </span>
  );
}

export function BoardListPicker({ selectedTarget, options, disabled, onTargetChange, variant = "board" }: BoardListPickerProps) {
  const focus = variant === "focus";
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.id === selectedTarget);
  const items: BoardListOption[] = [{ id: ALL_LISTS, title: "All Lists", color: null }, ...options];

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const selectedOption = Array.from(menu?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
      .find((option) => option.getAttribute("aria-selected") === "true");
    (selectedOption ?? menu?.querySelector<HTMLButtonElement>('[role="option"]'))?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(id: string) {
    if (disabled || !onTargetChange) return;
    setOpen(false);
    onTargetChange(id === ALL_LISTS ? { kind: "all" } : { kind: "list", id });
    triggerRef.current?.focus();
  }

  function onOptionKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    const buttons = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    if (!buttons.length) return;
    const current = buttons.findIndex((button) => button === document.activeElement);
    let next: number;
    if (event.key === "ArrowDown") next = (current + 1) % buttons.length;
    else if (event.key === "ArrowUp") next = (current + buttons.length - 1) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[next]?.focus();
  }

  return (
    <div className={focus ? "board-list-picker board-list-picker--focus" : "board-list-picker"}
      data-board-list-selector="true" data-board-selected-target={selectedTarget} ref={rootRef}>
      {!focus ? <span className="board-list-picker__label type-metadata">List</span> : null}
      <button
        type="button"
        ref={triggerRef}
        className="board-list-picker__trigger motion-interactive"
        aria-label={focus ? "Focus list" : "Planning list"}
        data-focus-list-selector={focus ? "true" : undefined}
        data-focus-selected-target={focus ? selectedTarget : undefined}
        aria-haspopup="listbox"
        aria-controls={id}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            closeMenu();
          }
        }}
      >
        {selected ? <ListBadge option={selected} focus={focus} /> : <ListBadges options={options} focus={focus} />}
        <span className="board-list-picker__current">{selected?.title ?? "All Lists"}</span>
        <span aria-hidden="true">⌄</span>
      </button>
      {open && !disabled ? (
        <div className="board-list-picker__menu" id={id} role="listbox"
          aria-label={focus ? "Choose Focus list" : "Choose planning list"} ref={menuRef} onKeyDown={onOptionKeyDown}>
          {items.map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              className="board-list-picker__option motion-interactive"
              aria-selected={selectedTarget === option.id}
              data-focus-list-option={focus ? option.id : undefined}
              onClick={() => choose(option.id)}
            >
              {option.id === ALL_LISTS ? <ListBadges options={options} focus={focus} /> : <ListBadge option={option} focus={focus} />}
              <span className="board-list-picker__option-title">{option.title}</span>
              <span className="board-list-picker__check" aria-hidden="true">{selectedTarget === option.id ? "✓" : ""}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
