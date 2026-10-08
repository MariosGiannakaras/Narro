import { type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, useEffect, useId, useRef, useState } from "react";
import type { ListBoardRequestTarget } from "./listBoardApi";
import "./boardListPicker.css";

const ALL_LISTS = "__all_lists__";
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

type BoardListOption = { id: string; title: string; color: string | null };
type BoardListPickerProps = {
  selectedTarget: string;
  options: BoardListOption[];
  disabled: boolean;
  onTargetChange?: (target: ListBoardRequestTarget) => void;
};

function listAccent(color: string | null): CSSProperties | undefined {
  return color && HEX_COLOR.test(color)
    ? { "--board-list-accent": color } as CSSProperties
    : undefined;
}

export function BoardListPicker({ selectedTarget, options, disabled, onTargetChange }: BoardListPickerProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.id === selectedTarget);
  const items = [{ id: ALL_LISTS, title: "All Lists", color: null }, ...options];

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
    <div className="board-list-picker" data-board-list-selector="true" data-board-selected-target={selectedTarget} ref={rootRef}>
      <span className="board-list-picker__label type-metadata">List</span>
      <button
        type="button"
        ref={triggerRef}
        className="board-list-picker__trigger motion-interactive"
        aria-label="Planning list"
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
        {selected ? <span className="board-list-picker__badge" style={listAccent(selected.color)} aria-hidden="true" /> : (
          <span className="board-list-picker__all-badges" aria-hidden="true">
            {options.slice(0, 3).map((option) => (
              <span key={option.id} className="board-list-picker__badge" style={listAccent(option.color)} />
            ))}
          </span>
        )}
        <span className="board-list-picker__current">{selected?.title ?? "All Lists"}</span>
        <span aria-hidden="true">⌄</span>
      </button>
      {open && !disabled ? (
        <div className="board-list-picker__menu" id={id} role="listbox" aria-label="Choose planning list" ref={menuRef} onKeyDown={onOptionKeyDown}>
          {items.map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              className="board-list-picker__option motion-interactive"
              aria-selected={selectedTarget === option.id}
              onClick={() => choose(option.id)}
            >
              {option.id === ALL_LISTS ? (
                <span className="board-list-picker__all-badges" aria-hidden="true">
                  {options.slice(0, 3).map((list) => (
                    <span key={list.id} className="board-list-picker__badge" style={listAccent(list.color)} />
                  ))}
                </span>
              ) : <span className="board-list-picker__badge" style={listAccent(option.color)} aria-hidden="true" />}
              <span className="board-list-picker__option-title">{option.title}</span>
              <span className="board-list-picker__check" aria-hidden="true">{selectedTarget === option.id ? "✓" : ""}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
