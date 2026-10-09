import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { BUILTIN_LIST_ICONS, BuiltinListIcon } from "./BuiltinListIcon";
import {
  colorAtWheel, hsvToRgb, nearestWheelPoint, wheelPointAt,
  type WheelPoint,
} from "./listSpectrumColor";

const WHEEL_SIZE = 184;
const HEX_DIGITS = /^[0-9a-f]{6}$/i;
const ICON_CATEGORIES = [
  "All", "Work", "Planning", "Technology", "Creative", "Personal",
  "Health", "Travel", "Food", "Finance", "Symbols",
] as const;

export function placeListEditorPopover(
  panel: HTMLElement,
  anchor: HTMLElement,
  dialog: HTMLElement,
) {
  const rect = anchor.getBoundingClientRect();
  const modal = dialog.getBoundingClientRect();
  const width = panel.offsetWidth;
  const height = panel.offsetHeight;
  const padding = 9;
  let left = rect.left;
  let top = rect.bottom + 8;
  if (window.innerWidth - modal.right >= width + 20) {
    left = modal.right + 9;
    top = rect.top - height / 2;
  } else if (modal.left >= width + 20) {
    left = modal.left - width - 9;
    top = rect.top - height / 2;
  } else {
    left = window.innerWidth - width - padding;
    top = rect.top - height / 2;
  }
  panel.style.left = `${Math.max(padding, Math.min(left, window.innerWidth - width - padding))}px`;
  panel.style.top = `${Math.max(padding, Math.min(top, window.innerHeight - height - padding))}px`;
}

function useAnchoredPanel(
  anchorRef: React.RefObject<HTMLButtonElement | null>,
  dialogRef: React.RefObject<HTMLDivElement | null>,
  panelRef: React.RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const update = () => {
      if (anchorRef.current && dialogRef.current && panelRef.current) {
        placeListEditorPopover(panelRef.current, anchorRef.current, dialogRef.current);
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef, dialogRef, panelRef]);
}

export function SpectrumColorPopover({
  color,
  onChange,
  anchorRef,
  dialogRef,
  panelId,
  onClose,
  saving,
}: {
  color: string;
  onChange: (value: string) => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  dialogRef: React.RefObject<HTMLDivElement | null>;
  panelId: string;
  onClose: () => void;
  saving: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const dragId = useRef<number | null>(null);
  const [hexInput, setHexInput] = useState(color.slice(1).toUpperCase());
  const wheelPoint = useMemo(() => nearestWheelPoint(color), [color]);
  const [exactWheelPoint, setExactWheelPoint] = useState<WheelPoint | null>(null);
  const point = exactWheelPoint ?? wheelPoint;
  useAnchoredPanel(anchorRef, dialogRef, panelRef);

  useEffect(() => { canvasRef.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const image = context.createImageData(WHEEL_SIZE, WHEEL_SIZE);
    const radius = WHEEL_SIZE * 0.485;
    for (let y = 0; y < WHEEL_SIZE; y++) {
      for (let x = 0; x < WHEEL_SIZE; x++) {
        const dx = x - (WHEEL_SIZE - 1) / 2;
        const dy = y - (WHEEL_SIZE - 1) / 2;
        const relativeRadius = Math.hypot(dx, dy) / radius;
        if (relativeRadius > 1) continue;
        const hue = ((Math.atan2(dy, dx) * 180 / Math.PI) + 450) % 360;
        const [r, g, b] = hsvToRgb(hue, Math.min(1, relativeRadius * 2),
          relativeRadius <= 0.5 ? 1 : 2 - 2 * relativeRadius);
        const index = (y * WHEEL_SIZE + x) * 4;
        image.data[index] = r;
        image.data[index + 1] = g;
        image.data[index + 2] = b;
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  }, []);

  useEffect(() => { setHexInput(color.slice(1).toUpperCase()); }, [color]);

  const changeWheel = (next: WheelPoint) => {
    if (saving) return;
    setExactWheelPoint(next);
    onChange(colorAtWheel(next));
  };
  const selectFromPointer = (event: PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * WHEEL_SIZE / bounds.width;
    const y = (event.clientY - bounds.top) * WHEEL_SIZE / bounds.height;
    changeWheel(wheelPointAt(x, y));
  };
  const onWheelKey = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const delta = event.shiftKey ? 1 : 4;
    const next = { ...point };
    if (event.key === "ArrowLeft") next.hue = (next.hue + 360 - delta) % 360;
    if (event.key === "ArrowRight") next.hue = (next.hue + delta) % 360;
    if (event.key === "ArrowUp") next.radius = Math.max(0, next.radius - 0.025);
    if (event.key === "ArrowDown") next.radius = Math.min(1, next.radius + 0.025);
    changeWheel(next);
  };
  const angle = (point.hue - 90) * Math.PI / 180;
  const distance = WHEEL_SIZE * 0.485 * point.radius;
  const valid = HEX_DIGITS.test(hexInput.trim());
  return createPortal(
    <section ref={panelRef} id={panelId} className="spectrum-popover motion-overlay"
      role="group" aria-label="Custom list color" data-custom-color-panel="true">
      <div className="spectrum-wheel">
        <canvas ref={canvasRef} width={WHEEL_SIZE} height={WHEEL_SIZE}
          tabIndex={saving ? -1 : 0} role="img"
          aria-label={`Spectrum wheel, ${color}. Left/right changes hue; up/down changes brightness.`}
          onPointerDown={(event) => {
            if (saving || (event.pointerType === "mouse" && event.button !== 0)) return;
            event.preventDefault();
            event.currentTarget.focus({ preventScroll: true });
            event.currentTarget.setPointerCapture(event.pointerId);
            dragId.current = event.pointerId;
            selectFromPointer(event);
          }}
          onPointerMove={(event) => {
            if (dragId.current === event.pointerId) selectFromPointer(event);
          }}
          onPointerUp={() => { dragId.current = null; }}
          onPointerCancel={() => { dragId.current = null; }}
          onKeyDown={onWheelKey}
        />
        <span className="spectrum-wheel__pin" aria-hidden="true"
          style={{ left: WHEEL_SIZE / 2 + Math.cos(angle) * distance,
            top: WHEEL_SIZE / 2 + Math.sin(angle) * distance,
            background: color } as CSSProperties} />
      </div>
      <label className="spectrum-hex" aria-invalid={!valid}>
        <span className="spectrum-hex__dot" style={{ background: color }} aria-hidden="true" />
        <span className="spectrum-hex__hash" aria-hidden="true">#</span>
        <input type="text" value={hexInput} maxLength={6} placeholder="RRGGBB"
          inputMode="text" autoComplete="off" spellCheck={false}
          aria-label="HEX color digits" aria-invalid={!valid} disabled={saving}
          onChange={(event) => {
            const next = event.target.value;
            setHexInput(next);
            if (HEX_DIGITS.test(next.trim())) {
              setExactWheelPoint(null);
              onChange(`#${next.trim().toLowerCase()}`);
            }
          }}
          onBlur={() => { if (!valid) setHexInput(color.slice(1).toUpperCase()); }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && valid) {
              event.preventDefault();
              onClose();
            } else if (event.key === "Enter") {
              event.preventDefault();
            }
          }}
        />
      </label>
      {!valid ? <span className="spectrum-error" role="status">Enter six HEX digits.</span> : null}
    </section>,
    document.body,
  );
}

export function BuiltinIconPalette({
  selectedId,
  initial,
  onSelect,
  anchorRef,
  dialogRef,
  panelId,
  saving,
}: {
  selectedId: string | null;
  initial: string;
  onSelect: (id: string | null) => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  dialogRef: React.RefObject<HTMLDivElement | null>;
  panelId: string;
  saving: boolean;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  useAnchoredPanel(anchorRef, dialogRef, panelRef);
  useEffect(() => { searchRef.current?.focus({ preventScroll: true }); }, []);
  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return BUILTIN_LIST_ICONS.filter((icon) =>
      (category === "All" || icon.category === category)
      && (!term || `${icon.name} ${icon.id} ${icon.category}`.toLocaleLowerCase().includes(term)));
  }, [category, query]);
  const showLetter = category === "All"
    && (!query.trim() || "letter initial monogram".includes(query.trim().toLocaleLowerCase()));
  return createPortal(
    <section ref={panelRef} id={panelId} className="icon-popover motion-overlay"
      role="group" aria-label="Built-in list icons" data-list-icon-palette="true">
      <div className="icon-popover__heading">
        <p className="icon-popover__title">Choose a list icon</p>
        <span className="icon-popover__count" role="status" aria-live="polite">
          {visible.length + (showLetter ? 1 : 0)} / {BUILTIN_LIST_ICONS.length + 1}
        </span>
      </div>
      <input ref={searchRef} className="icon-popover__search"
        type="search" placeholder="Search icons…" aria-label="Search list icons"
        value={query} onChange={(event) => setQuery(event.target.value)}
        disabled={saving} autoComplete="off" />
      <div className="icon-popover__categories" role="group" aria-label="Icon categories">
        {ICON_CATEGORIES.map((item) => (
          <button key={item} type="button" className="icon-popover__category"
            aria-pressed={category === item} disabled={saving}
            onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="icon-popover__results">
        <div className="icon-popover__grid" role="group" aria-label="Choose an icon"
          onKeyDown={(event) => {
            const steps: Record<string, number> = {
              ArrowLeft: -1, ArrowRight: 1, ArrowUp: -5, ArrowDown: 5,
            };
            if (!(event.key in steps) && event.key !== "Home" && event.key !== "End") return;
            event.preventDefault();
            const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
            if (!buttons.length) return;
            const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
            const next = event.key === "Home" ? 0 : event.key === "End"
              ? buttons.length - 1 : (index + steps[event.key] + buttons.length) % buttons.length;
            buttons[next]?.focus({ preventScroll: true });
          }}>
          {showLetter ? (
            <button type="button" className="icon-popover__option" title="Use initial letter"
              aria-label="Use initial letter" aria-pressed={selectedId === null}
              onClick={() => onSelect(null)} disabled={saving}>
              <span className="icon-popover__initial">{initial}</span>
            </button>
          ) : null}
          {visible.map((icon) => (
            <button key={icon.id} type="button" className="icon-popover__option"
              title={icon.name} aria-label={icon.name}
              aria-pressed={icon.id === selectedId} disabled={saving}
              onClick={() => onSelect(icon.id)}>
              <BuiltinListIcon id={icon.id} />
            </button>
          ))}
        </div>
        {!visible.length && !showLetter
          ? <p className="icon-popover__empty">No matching icons.</p> : null}
      </div>
    </section>,
    document.body,
  );
}
