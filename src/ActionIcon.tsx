/** A single, offline, stroke-based visual language for Narro action controls.
 * Decorative SVG only: the button retains its existing accessible name,
 * click handler, keyboard behavior and focus owner.
 * Separate from the approved 218-icon List Editor catalogue.
 */
export type ActionIconName =
  | "chevron-down" | "chevron-up" | "chevron-left" | "chevron-right"
  | "chevrons-left" | "chevrons-right"
  | "panel-to-timer" | "timer-to-panel" | "expand" | "shrink"
  | "arrow-left" | "arrow-right" | "arrow-up" | "arrow-down"
  | "plus" | "close" | "check" | "circle" | "more"
  | "list" | "notes" | "settings" | "home" | "rocket"
  | "calendar" | "download" | "undo" | "redo" | "trash";

export function ActionIcon({ name, size = 16 }: { name: ActionIconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    focusable: "false" as const,
    style: { display: "inline-block", flexShrink: 0, verticalAlign: "middle" } as const,
  };
  switch (name) {
    case "chevron-down": return <svg {...common}><path d="m6 9 6 6 6-6" /></svg>;
    case "chevron-up": return <svg {...common}><path d="m6 15 6-6 6 6" /></svg>;
    case "chevron-left": return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>;
    case "chevron-right": return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>;
    case "chevrons-left": return <svg {...common}><path d="m11 17-5-5 5-5m7 10-5-5 5-5" /></svg>;
    case "chevrons-right": return <svg {...common}><path d="m6 17 5-5-5-5m7 10 5-5-5-5" /></svg>;
    // Distinct, mirrored window-state icons rather than font-dependent diagonal arrows.
    case "panel-to-timer":
    case "shrink": return <svg {...common}><path d="m14 10 7-7m-5 0h5v5M10 14l-7 7m0-5v5h5" /></svg>;
    case "timer-to-panel":
    case "expand": return <svg {...common}><path d="M8 3H3v5m0-5 7 7m6 11h5v-5m0 5-7-7" /></svg>;
    case "arrow-left": return <svg {...common}><path d="m12 19-7-7 7-7M5 12h14" /></svg>;
    case "arrow-right": return <svg {...common}><path d="m12 5 7 7-7 7M19 12H5" /></svg>;
    case "arrow-up": return <svg {...common}><path d="m5 12 7-7 7 7M12 19V5" /></svg>;
    case "arrow-down": return <svg {...common}><path d="m19 12-7 7-7-7M12 5v14" /></svg>;
    case "plus": return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "close": return <svg {...common}><path d="M18 6 6 18M6 6l12 12" /></svg>;
    case "check": return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case "circle": return <svg {...common}><circle cx="12" cy="12" r="9" /></svg>;
    case "more": return <svg {...common}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>;
    case "list": return <svg {...common}><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" strokeWidth="3" /></svg>;
    case "notes": return <svg {...common}><path d="M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7" /></svg>;
    case "settings": return <svg {...common}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="m19.4 15 .1.1 1.4 1.1-1.5 2.6-1.7-.7a8 8 0 0 1-2.2 1.2l-.3 1.8h-3l-.3-1.8a8 8 0 0 1-2.2-1.2l-1.7.7-1.5-2.6 1.4-1.1a8 8 0 0 1 0-2.6l-1.4-1.1 1.5-2.6 1.7.7a8 8 0 0 1 2.2-1.2l.3-1.8h3l.3 1.8a8 8 0 0 1 2.2 1.2l1.7-.7 1.5 2.6-1.4 1.1a8 8 0 0 1 0 2.6" transform="translate(-1.5 -1.5)" /></svg>;
    case "home": return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM9 21v-8h6v8" /></svg>;
    case "rocket": return <svg {...common}><path d="M5 16c-2 1-2 4-2 5 1 0 4 0 5-2M9 15l-2-2c0-4 6-10 14-10 0 8-6 14-10 14l-2-2Zm6-6h.01M7 13l-4-1 3-5 4-1m4 11 1 4 5-3 1-4" /></svg>;
    case "calendar": return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>;
    case "download": return <svg {...common}><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4" /></svg>;
    case "undo": return <svg {...common}><path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-2" /></svg>;
    case "redo": return <svg {...common}><path d="m15 14 5-5-5-5m5 5H10a6 6 0 0 0 0 12h2" /></svg>;
    case "trash": return <svg {...common}><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7" /></svg>;
  }
}
