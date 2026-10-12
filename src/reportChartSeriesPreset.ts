/**
 * Narro-local, read-only chart visibility presets.
 * Original Blitzit ellipsis actions have not been observed.
 * At least one series is always visible; no report aggregation or persistence changes.
 */
export type ReportChartPreset = "all" | "tasks" | "breaks" | "total";

export function reportChartSeriesPreset(preset: ReportChartPreset): Record<"tasks" | "breaks" | "total", boolean> {
  return {
    tasks: preset === "all" || preset === "tasks",
    breaks: preset === "all" || preset === "breaks",
    total: preset === "all" || preset === "total",
  };
}
