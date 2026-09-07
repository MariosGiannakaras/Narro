import {
  Children,
  cloneElement,
  isValidElement,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

const TOOLTIP_INTENT_DELAY_MS = 400;

type OverlayAlign = "start" | "end";

type TriggerElement = ReactElement<Record<string, unknown>>;

function mergeHandler<T>(
  existing: ((event: T) => void) | undefined,
  next: (event: T) => void,
): (event: T) => void {
  return (event) => {
    existing?.(event);
    next(event);
  };
}

function requireSingleElement(children: ReactNode, componentName: string): TriggerElement {
  const child = Children.only(children);
  if (!isValidElement<Record<string, unknown>>(child)) {
    throw new Error(`${componentName} requires exactly one React element as its trigger.`);
  }
  return child;
}

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const tooltipId = useId();
  const timeoutRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const trigger = requireSingleElement(children, "Tooltip");

  const clearPending = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const scheduleOpen = () => {
    clearPending();
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setOpen(true);
    }, TOOLTIP_INTENT_DELAY_MS);
  };

  const close = () => {
    clearPending();
    setOpen(false);
  };

  useEffect(() => close, []);

  const existingDescribedBy =
    typeof trigger.props["aria-describedby"] === "string"
      ? trigger.props["aria-describedby"]
      : undefined;

  const describedBy = existingDescribedBy
    ? `${existingDescribedBy} ${tooltipId}`
    : tooltipId;

  const enhancedTrigger = cloneElement(trigger, {
    "aria-describedby": describedBy,
    onPointerEnter: mergeHandler(
      trigger.props.onPointerEnter as ((event: ReactPointerEvent<HTMLElement>) => void) | undefined,
      scheduleOpen,
    ),
    onPointerLeave: mergeHandler(
      trigger.props.onPointerLeave as ((event: ReactPointerEvent<HTMLElement>) => void) | undefined,
      close,
    ),
    onFocus: mergeHandler(
      trigger.props.onFocus as ((event: FocusEvent<HTMLElement>) => void) | undefined,
      scheduleOpen,
    ),
    onBlur: mergeHandler(
      trigger.props.onBlur as ((event: FocusEvent<HTMLElement>) => void) | undefined,
      close,
    ),
    onKeyDown: mergeHandler(
      trigger.props.onKeyDown as ((event: KeyboardEvent<HTMLElement>) => void) | undefined,
      (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "Escape") {
          close();
        }
      },
    ),
  });

  return (
    <span className="overlay-anchor overlay-anchor--inline">
      {enhancedTrigger}
      <span
        id={tooltipId}
        role="tooltip"
        className="overlay-tooltip motion-overlay"
        data-open={open ? "true" : "false"}
      >
        {content}
      </span>
    </span>
  );
}

interface BaseOverlayProps {
  triggerLabel: string;
  trigger: ReactNode;
  children: ReactNode;
  align?: OverlayAlign;
}

export interface PopoverProps extends BaseOverlayProps {
  ariaLabel?: string;
}

export function Popover({
  triggerLabel,
  trigger,
  children,
  align = "start",
  ariaLabel,
}: PopoverProps) {
  const contentId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const closeAndRestoreFocus = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <span ref={rootRef} className="overlay-anchor">
      <button
        ref={triggerRef}
        type="button"
        className="overlay-trigger motion-interactive"
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.preventDefault();
            closeAndRestoreFocus();
          }
        }}
      >
        {trigger}
      </button>
      <div
        id={contentId}
        role="dialog"
        aria-label={ariaLabel ?? triggerLabel}
        className="overlay-popover motion-overlay"
        data-align={align}
        data-open={open ? "true" : "false"}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeAndRestoreFocus();
          }
        }}
      >
        {children}
      </div>
    </span>
  );
}

export interface MenuItemProps {
  children: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onSelect: () => void;
}

export function MenuItem({ children, disabled = false, destructive = false, onSelect }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className="overlay-menu__item motion-interactive"
      data-destructive={destructive ? "true" : "false"}
      disabled={disabled}
      tabIndex={-1}
      onClick={() => {
        if (!disabled) onSelect();
      }}
    >
      {children}
    </button>
  );
}

export interface MenuProps extends BaseOverlayProps {}

export function Menu({ triggerLabel, trigger, children, align = "start" }: MenuProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const focusMenuItem = (direction: "first" | "last") => {
    const items = menuRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="menuitem"]:not(:disabled)',
    );
    if (!items?.length) return;
    items[direction === "first" ? 0 : items.length - 1]?.focus();
  };

  const openMenu = (direction: "first" | "last" = "first") => {
    setOpen(true);
    window.requestAnimationFrame(() => focusMenuItem(direction));
  };

  const closeAndRestoreFocus = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [],
    );
    const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);

    if (event.key === "Escape") {
      event.preventDefault();
      closeAndRestoreFocus();
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
      return;
    }

    let nextIndex: number | null = null;
    if (event.key === "ArrowDown") nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    if (event.key === "ArrowUp") nextIndex = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;

    if (nextIndex !== null && items.length > 0) {
      event.preventDefault();
      items[nextIndex]?.focus();
    }
  };

  return (
    <span ref={rootRef} className="overlay-anchor">
      <button
        ref={triggerRef}
        type="button"
        className="overlay-trigger motion-interactive"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          if (open) closeAndRestoreFocus();
          else openMenu();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu("first");
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            openMenu("last");
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            closeAndRestoreFocus();
          }
        }}
      >
        {trigger}
      </button>
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-label={triggerLabel}
        className="overlay-menu motion-overlay"
        data-align={align}
        data-open={open ? "true" : "false"}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest('[role="menuitem"]:not(:disabled)')) {
            closeAndRestoreFocus();
          }
        }}
        onKeyDown={onMenuKeyDown}
      >
        {children}
      </div>
    </span>
  );
}
