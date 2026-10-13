import type { ReactNode } from "react";

/**
 * Offline vector action icons, following the thin rounded geometry observable
 * in the retained Blitzit v2.6.69 Focus Panel / Floating Timer screenshots.
 * This is NOT the approved 218-item List Editor icon catalogue.
 *
 * Icon names describe the *action*, not an absolute window or CSS direction:
 * chevrons disclose, minimize enters the small Timer, maximize restores Panel.
 */
export type UiActionIconName =
  | "chevron-down" | "chevron-up" | "chevron-left" | "chevron-right"
  | "chevrons-left" | "chevrons-right"
  | "arrow-left" | "arrow-right" | "arrow-up" | "arrow-down" | "arrow-up-right"
  | "minimize" | "maximize" | "list" | "file-text" | "ellipsis"
  | "settings" | "home" | "x" | "check";

export function UiActionIcon({
  name,
  size = 16,
  className,
}: {
  name: UiActionIconName;
  size?: number;
  className?: string;
}) {
  let shape: ReactNode;
  switch (name) {
    case "chevron-down": shape = <path d="m6 9 6 6 6-6" />; break;
    case "chevron-up": shape = <path d="m18 15-6-6-6 6" />; break;
    case "chevron-left": shape = <path d="m15 18-6-6 6-6" />; break;
    case "chevron-right": shape = <path d="m9 18 6-6-6-6" />; break;
    case "chevrons-left": shape = <><path d="m11 17-5-5 5-5" /><path d="m18 17-5-5 5-5" /></>; break;
    case "chevrons-right": shape = <><path d="m6 17 5-5-5-5" /><path d="m13 17 5-5-5-5" /></>; break;
    case "arrow-left": shape = <><path d="m12 19-7-7 7-7" /><path d="M5 12h14" /></>; break;
    case "arrow-right": shape = <><path d="m12 5 7 7-7 7" /><path d="M19 12H5" /></>; break;
    case "arrow-up": shape = <><path d="m5 12 7-7 7 7" /><path d="M12 5v14" /></>; break;
    case "arrow-down": shape = <><path d="m5 12 7 7 7-7" /><path d="M12 19V5" /></>; break;
    case "arrow-up-right": shape = <><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>; break;
    case "minimize":
      shape = <><path d="m21 3-6 6" /><path d="M15 3v6h6" /><path d="m3 21 6-6" /><path d="M9 21v-6H3" /></>;
      break;
    case "maximize":
      shape = <><path d="m15 9 6-6" /><path d="M15 3h6v6" /><path d="m9 15-6 6" /><path d="M3 15v6h6" /></>;
      break;
    case "list": shape = <><path d="M9 6h12M9 12h12M9 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth="3" /></>; break;
    case "file-text": shape = <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>; break;
    case "ellipsis": shape = <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>; break;
    case "settings": shape = <><path d="M12 2.5a1.5 1.5 0 0 1 1.5 1.5l.3 1.1a7.4 7.4 0 0 1 1.6.9l1.1-.35a1.5 1.5 0 0 1 1.9.55l1 1.7a1.5 1.5 0 0 1-.4 2l-.85.77a8 8 0 0 1 0 1.8l.85.77a1.5 1.5 0 0 1 .4 2l-1 1.7a1.5 1.5 0 0 1-1.9.55l-1.1-.35a7.4 7.4 0 0 1-1.6.9L13.5 20a1.5 1.5 0 0 1-3 0l-.3-1.1a7.4 7.4 0 0 1-1.6-.9l-1.1.35a1.5 1.5 0 0 1-1.9-.55l-1-1.7a1.5 1.5 0 0 1 .4-2l.85-.77a8 8 0 0 1 0-1.8L5 10.75a1.5 1.5 0 0 1-.4-2l1-1.7a1.5 1.5 0 0 1 1.9-.55l1.1.35a7.4 7.4 0 0 1 1.6-.9L10.5 4A1.5 1.5 0 0 1 12 2.5Z" transform="translate(0 -1)" /><circle cx="12" cy="11" r="2.5" /></>; break;
    case "home": shape = <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>; break;
    case "x": shape = <path d="M18 6 6 18M6 6l12 12" />; break;
    case "check": shape = <path d="m5 12 4 4L19 6" />; break;
  }
  return (
    <svg
      className={className}
      data-ui-action-icon={name}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, verticalAlign: "middle" }}
    >
      {shape}
    </svg>
  );
}
