import type { CSSProperties } from "react";
type ListOption = { id: string | null; color?: string | null };
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
export function ReportListBadges({ options, selectedListIds }: { options: readonly ListOption[]; selectedListIds: readonly string[] }) {
  const eligible = options.filter((option) => option.id !== null);
  const display = (selectedListIds.length ? eligible.filter((option) => option.id !== null && selectedListIds.includes(option.id)) : eligible).slice(0, 3);
  return (
    <span className="reports-overview__list-badges" data-report-list-badges="true" aria-hidden="true">
      {display.length ? display.map((option) => (
        <span key={option.id} className="reports-overview__list-badge"
          style={option.color && HEX_COLOR.test(option.color) ? { "--report-list-badge-color": option.color } as CSSProperties : undefined} />
      )) : <span className="reports-overview__list-badge" />}
    </span>
  );
}
