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
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const TOOLTIP_INTENT_DELAY_MS = 400;

type OverlayAlign = "start" | "end";
type TooltipAlign = "start" | "center" | "end";
type TooltipPlacement = "top" | "bottom";

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
  align?: TooltipAlign;
  placement?: TooltipPlacement;
  boundarySelector?: string;
}

export function Tooltip({
  content,
  children,
  align = "center",
  placement = "top",
  boundarySelector,
}: TooltipProps) {
  const tooltipId = useId();
  const timeoutRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const trigger = requireSingleElement(children, "Tooltip");

  useLayoutEffect(() => {
    // Closed, mounted tooltips can otherwise enlarge a narrow card's scroll area.
    if (!boundarySelector) return;
    const anchor = anchorRef.current;
    const tooltip = tooltipRef.current;
    const boundary = anchor?.closest<HTMLElement>(boundarySelector);
    if (!anchor || !tooltip || !boundary) return;
    const place = () => {
      const bounds = boundary.getBoundingClientRect();
      const origin = anchor.getBoundingClientRect();
      // Rects include ancestor zoom/scale; offsetWidth and CSS insets do not.
      // Keep one coordinate system so a mixed-scale row cannot enlarge its
      // scroll container with even a closed, mounted tooltip.
      const scale = boundary.offsetWidth > 0 && bounds.width > 0
        ? bounds.width / boundary.offsetWidth : 1;
      const inset = 4 * scale;
      // The bound is for the complete tooltip, including its padding/border.
      // Focus rows do not inherit the planning board's border-box reset.
      tooltip.style.boxSizing = "border-box";
      tooltip.style.maxWidth = `${Math.max(0, (bounds.width - 2 * inset) / scale)}px`;
      const width = tooltip.offsetWidth * scale;
      const preferred = align === "start" ? origin.left
        : align === "end" ? origin.right - width : origin.left + (origin.width - width) / 2;
      const left = Math.max(bounds.left + inset, Math.min(preferred, bounds.right - inset - width));
      tooltip.style.insetInlineStart = `${(left - origin.left) / scale}px`;
      tooltip.style.insetInlineEnd = "auto";
      tooltip.style.setProperty("--tooltip-translate-x", "0px");

      // Bounded tooltips must remain usable for visible rows even when their
      // preferred side has no viewport room. Compare the actual CSS geometry
      // on both sides and keep whichever placement produces less vertical
      // overflow; this preserves the requested side whenever it already fits.
      const verticalOverflow = (rect: DOMRect) =>
        Math.max(0, -rect.top) + Math.max(0, rect.bottom - window.innerHeight);
      tooltip.dataset.placement = placement;
      const preferredRect = tooltip.getBoundingClientRect();
      const preferredOverflow = verticalOverflow(preferredRect);
      if (preferredOverflow > 0) {
        const alternatePlacement: TooltipPlacement = placement === "top" ? "bottom" : "top";
        tooltip.dataset.placement = alternatePlacement;
        const alternateOverflow = verticalOverflow(tooltip.getBoundingClientRect());
        if (alternateOverflow >= preferredOverflow) {
          tooltip.dataset.placement = placement;
        }
      }
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(boundary);
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [open, align, placement, boundarySelector, content]);

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
    <span ref={anchorRef} className="overlay-anchor overlay-anchor--inline">
      {enhancedTrigger}
      <span
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        className="overlay-tooltip motion-overlay"
        data-open={open ? "true" : "false"}
        data-align={align}
        data-placement={placement}
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
  closeOnSelect?: boolean;
}

export function MenuItem({ children, disabled = false, destructive = false, onSelect, closeOnSelect = true }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      data-menu-close-on-select={closeOnSelect ? "true" : "false"}
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

export interface MenuProps extends BaseOverlayProps {
  onDismiss?: () => void;
  dismissDisabled?: boolean;
}

export function Menu({ triggerLabel, trigger, children, align = "start", onDismiss, dismissDisabled = false }: MenuProps) {
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
    if (dismissDisabled) return;
    setOpen(false);
    onDismiss?.();
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!dismissDisabled && !rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onDismiss?.();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, dismissDisabled, onDismiss]);

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
      if (dismissDisabled) { event.preventDefault(); return; }
      setOpen(false);
      onDismiss?.();
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
          const item = target.closest('[role="menuitem"]:not(:disabled)');
          if (item && item.getAttribute("data-menu-close-on-select") !== "false") {
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
