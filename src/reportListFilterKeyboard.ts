// Shared keyboard ownership for the two Reports multi-list filters.
// Selection stays open: toggling several named lists must not collapse the menu.
export type ReportListFilterKeyEvent = {
  key: string;
  preventDefault: () => void;
  stopPropagation: () => void;
};

export function handleReportListFilterKeyDown(
  event: ReportListFilterKeyEvent,
  menu: HTMLElement | null,
  focused: Element | null,
  trigger: HTMLButtonElement | null,
  close: () => void,
): void {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    close();
    trigger?.focus({ preventScroll: true });
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

  const options = Array.from(menu?.querySelectorAll<HTMLButtonElement>('button[role="option"]:not([disabled])') ?? []);
  if (options.length === 0) return;
  event.preventDefault();

  const index = options.indexOf(focused as HTMLButtonElement);
  const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
    : event.key === "ArrowDown" ? (index + 1) % options.length
      : index <= 0 ? options.length - 1 : index - 1;
  options[next].focus({ preventScroll: true });
  options[next].scrollIntoView({ block: "nearest" });
}
