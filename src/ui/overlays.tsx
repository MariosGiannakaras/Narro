import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  computeAnchoredOverlayPosition,
  type OverlayPlacement,
  type OverlayPosition,
} from "./overlayGeometry";
import "./overlays.css";

const DEFAULT_GAP = 8;
const DEFAULT_VIEWPORT_PADDING = 8;
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type TriggerRef = (node: HTMLElement | null) => void;

interface AnchoredOverlayOptions {
  open: boolean;
  preferredPlacement: OverlayPlacement;
  gap?: number;
  viewportPadding?: number;
}

interface AnchoredOverlayState {
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
  setTriggerRef: TriggerRef;
  position: OverlayPosition | null;
}

function useAnchoredOverlay({
  open,
  preferredPlacement,
  gap = DEFAULT_GAP,
  viewportPadding = DEFAULT_VIEWPORT_PADDING,
}: AnchoredOverlayOptions): AnchoredOverlayState {
  const triggerRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<OverlayPosition | null>(null);

  const setTriggerRef = useCallback<TriggerRef>((node) => {
    triggerRef.current = node;
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const overlay = overlayRef.current;
    if (!trigger || !overlay) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();
    setPosition(
      computeAnchoredOverlayPosition(
        {
          top: triggerRect.top,
          right: triggerRect.right,
          bottom: triggerRect.bottom,
          left: triggerRect.left,
          width: triggerRect.width,
          height: triggerRect.height,
        },
        { width: overlayRect.width, height: overlayRect.height },
        { width: window.innerWidth, height: window.innerHeight },
        { preferredPlacement, gap, viewportPadding },
      ),
    );
  }, [gap, preferredPlacement, viewportPadding]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    updatePosition();

    const resizeObserver = new ResizeObserver(updatePosition);
    if (triggerRef.current) {
      resizeObserver.observe(triggerRef.current);
    }
    if (overlayRef.current) {
      resizeObserver.observe(overlayRef.current);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  return { triggerRef, overlayRef, setTriggerRef, position };
}

function overlayStyle(position: OverlayPosition | null): CSSProperties {
  if (!position) {
    return { top: 0, left: 0 };
  }

  return {
    top: position.top,
    left: position.left,
    transformOrigin: position.transformOrigin,
  };
}

function focusTrigger(triggerRef: React.MutableRefObject<HTMLElement | null>): void {
  window.requestAnimationFrame(() => triggerRef.current?.focus());
}

function useDismissableOverlay(
  open: boolean,
  triggerRef: React.MutableRefObject<HTMLElement | null>,
  overlayRef: React.MutableRefObject<HTMLDivElement | null>,
  onDismiss: (returnFocus: boolean) => void,
): void {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (triggerRef.current?.contains(target) || overlayRef.current?.contains(target)) {
        return;
      }
      onDismiss(false);
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      event.preventDefault();
      onDismiss(true);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDismiss, open, overlayRef, triggerRef]);
}

function useControllableOpen(
  controlledOpen: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange: ((open: boolean) => void) | undefined,
): [boolean, (open: boolean) => void] {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  return [open, setOpen];
}

export interface TooltipTriggerProps {
  ref: TriggerRef;
  "aria-describedby"?: string;
  onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: PointerEvent<HTMLElement>) => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface TooltipProps {
  children: (triggerProps: TooltipTriggerProps) => ReactNode;
  content: ReactNode;
  placement?: OverlayPlacement;
  intentDelayMs?: number;
}

export function Tooltip({
  children,
  content,
  placement = "top",
  intentDelayMs = 400,
}: TooltipProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const openTimerRef = useRef<number | null>(null);
  const { triggerRef, overlayRef, setTriggerRef, position } = useAnchoredOverlay({
    open,
    preferredPlacement: placement,
  });

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearOpenTimer, [clearOpenTimer]);

  const scheduleOpen = useCallback(() => {
    clearOpenTimer();
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      setOpen(true);
    }, Math.max(0, intentDelayMs));
  }, [clearOpenTimer, intentDelayMs]);

  const close = useCallback(() => {
    clearOpenTimer();
    setOpen(false);
  }, [clearOpenTimer]);

  const triggerProps: TooltipTriggerProps = {
    ref: setTriggerRef,
    "aria-describedby": open ? tooltipId : undefined,
    onPointerEnter: () => scheduleOpen(),
    onPointerLeave: () => {
      clearOpenTimer();
      if (document.activeElement !== triggerRef.current) {
        setOpen(false);
      }
    },
    onFocus: () => {
      clearOpenTimer();
      setOpen(true);
    },
    onBlur: () => close(),
    onKeyDown: (event) => {
      if (event.key === "Escape") {
        close();
      }
    },
  };

  return (
    <>
      {children(triggerProps)}
      {open
        ? createPortal(
            <div
              ref={overlayRef}
              id={tooltipId}
              role="tooltip"
              className="ui-overlay ui-tooltip"
              data-placement={position?.placement ?? placement}
              data-unmeasured={position ? undefined : "true"}
              style={overlayStyle(position)}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export interface PopoverTriggerProps {
  ref: TriggerRef;
  "aria-haspopup": "dialog";
  "aria-expanded": boolean;
  "aria-controls"?: string;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface PopoverProps {
  children: (triggerProps: PopoverTriggerProps) => ReactNode;
  content: ReactNode;
  ariaLabel: string;
  placement?: OverlayPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({
  children,
  content,
  ariaLabel,
  placement = "bottom",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: PopoverProps) {
  const generatedId = useId();
  const contentId = `popover-${generatedId}`;
  const [open, setOpen] = useControllableOpen(controlledOpen, defaultOpen, onOpenChange);
  const { triggerRef, overlayRef, setTriggerRef, position } = useAnchoredOverlay({
    open,
    preferredPlacement: placement,
  });

  const dismiss = useCallback(
    (returnFocus: boolean) => {
      setOpen(false);
      if (returnFocus) {
        focusTrigger(triggerRef);
      }
    },
    [setOpen, triggerRef],
  );
  useDismissableOverlay(open, triggerRef, overlayRef, dismiss);

  useEffect(() => {
    if (!open) {
      return;
    }
    const focusable = overlayRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable ?? overlayRef.current)?.focus();
  }, [open, overlayRef]);

  const triggerProps: PopoverTriggerProps = {
    ref: setTriggerRef,
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    "aria-controls": open ? contentId : undefined,
    onClick: () => setOpen(!open),
    onKeyDown: (event) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        dismiss(true);
      }
    },
  };

  return (
    <>
      {children(triggerProps)}
      {open
        ? createPortal(
            <div
              ref={overlayRef}
              id={contentId}
              role="dialog"
              aria-label={ariaLabel}
              tabIndex={-1}
              className="ui-overlay ui-popover"
              data-placement={position?.placement ?? placement}
              data-unmeasured={position ? undefined : "true"}
              style={overlayStyle(position)}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export interface MenuTriggerProps {
  ref: TriggerRef;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls"?: string;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface MenuItemSpec {
  id: string;
  label: ReactNode;
  disabled?: boolean;
  tone?: "default" | "destructive";
  separatorBefore?: boolean;
  onSelect: () => void;
}

export interface MenuProps {
  children: (triggerProps: MenuTriggerProps) => ReactNode;
  items: readonly MenuItemSpec[];
  ariaLabel: string;
  placement?: OverlayPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function firstEnabledIndex(items: readonly MenuItemSpec[]): number {
  return items.findIndex((item) => !item.disabled);
}

function lastEnabledIndex(items: readonly MenuItemSpec[]): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index].disabled) {
      return index;
    }
  }
  return -1;
}

function nextEnabledIndex(
  items: readonly MenuItemSpec[],
  currentIndex: number,
  direction: 1 | -1,
): number {
  if (items.length === 0) {
    return -1;
  }

  for (let offset = 1; offset <= items.length; offset += 1) {
    const candidate = (currentIndex + direction * offset + items.length) % items.length;
    if (!items[candidate].disabled) {
      return candidate;
    }
  }

  return -1;
}

export function Menu({
  children,
  items,
  ariaLabel,
  placement = "bottom",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: MenuProps) {
  const generatedId = useId();
  const menuId = `menu-${generatedId}`;
  const [open, setOpen] = useControllableOpen(controlledOpen, defaultOpen, onOpenChange);
  const [activeIndex, setActiveIndex] = useState(() => firstEnabledIndex(items));
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { triggerRef, overlayRef, setTriggerRef, position } = useAnchoredOverlay({
    open,
    preferredPlacement: placement,
  });

  const dismiss = useCallback(
    (returnFocus: boolean) => {
      setOpen(false);
      if (returnFocus) {
        focusTrigger(triggerRef);
      }
    },
    [setOpen, triggerRef],
  );
  useDismissableOverlay(open, triggerRef, overlayRef, dismiss);

  useEffect(() => {
    if (!open) {
      return;
    }
    itemRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  useEffect(() => {
    if (activeIndex >= 0 && !items[activeIndex]?.disabled) {
      return;
    }
    setActiveIndex(firstEnabledIndex(items));
  }, [activeIndex, items]);

  const openAt = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setOpen(true);
    },
    [setOpen],
  );

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((current) => nextEnabledIndex(items, current, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((current) => nextEnabledIndex(items, current, -1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(firstEnabledIndex(items));
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(lastEnabledIndex(items));
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        dismiss(true);
        break;
      default:
        break;
    }
  };

  const triggerProps: MenuTriggerProps = {
    ref: setTriggerRef,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    onClick: () => {
      if (open) {
        dismiss(true);
      } else {
        openAt(firstEnabledIndex(items));
      }
    },
    onKeyDown: (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        openAt(firstEnabledIndex(items));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        openAt(lastEnabledIndex(items));
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        dismiss(true);
      }
    },
  };

  return (
    <>
      {children(triggerProps)}
      {open
        ? createPortal(
            <div
              ref={overlayRef}
              id={menuId}
              role="menu"
              aria-label={ariaLabel}
              className="ui-overlay ui-menu"
              data-placement={position?.placement ?? placement}
              data-unmeasured={position ? undefined : "true"}
              style={overlayStyle(position)}
              onKeyDown={handleMenuKeyDown}
            >
              {items.map((item, index) => (
                <div key={item.id}>
                  {item.separatorBefore ? <div role="separator" className="ui-menu__separator" /> : null}
                  <button
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={index === activeIndex ? 0 : -1}
                    disabled={item.disabled}
                    aria-disabled={item.disabled || undefined}
                    className="ui-menu__item"
                    data-active={index === activeIndex ? "true" : undefined}
                    data-tone={item.tone ?? "default"}
                    onPointerMove={() => {
                      if (!item.disabled) {
                        setActiveIndex(index);
                      }
                    }}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => {
                      if (item.disabled) {
                        return;
                      }
                      item.onSelect();
                      dismiss(true);
                    }}
                  >
                    {item.label}
                  </button>
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
