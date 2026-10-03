import type { CSSProperties } from "react";
import "./reportsOverview.css";

export type ReportsMetric = {
  label: string;
  value: string;
  detail?: string | null;
};

export type ReportsChartDay = {
  id: string;
  label: string;
  taskSeconds: number;
  breakSeconds: number;
};

export type ReportsProductiveSummary = {
  hour: string;
  day: string;
  month: string;
};

export type ReportsChartSeries = "tasks" | "breaks" | "total";
export type ReportsChartVisibility = Record<ReportsChartSeries, boolean>;

export type ReportsPunctuality = {
  earlyPercent: number;
  latePercent: number;
};

export type ReportsListOption = {
  id: string | null;
  title: string;
  color?: string | null;
};

export type ReportsListTime = {
  id: string;
  title: string;
  color?: string | null;
  seconds: number;
};

export type ReportsDoneTask = {
  id: string;
  title: string;
  listTitle: string;
  completionLabel: string;
  timeTakenLabel: string;
  punctuality: "early" | "late" | "none";
  varianceLabel?: string | null;
};

export type ReportsCalendarMonth = {
  label: string;
  weeks: Array<Array<{ key: string; label: string; muted?: boolean; selected?: boolean; edge?: "start" | "end" }>>;
};

export type ReportsOverviewViewProps = {
  metrics: ReportsMetric[];
  chartDays: ReportsChartDay[];
  productive: ReportsProductiveSummary;
  timeByList: ReportsListTime[];
  doneTasks: ReportsDoneTask[];
  listLabel: string;
  selectedListIds: string[];
  listOptions: ReportsListOption[];
  rangeLabel: string;
  calendarMonths: ReportsCalendarMonth[];
  listFilterOpen?: boolean;
  datePickerOpen?: boolean;
  tooltipDayId?: string | null;
  visibleSeries?: ReportsChartVisibility;
  punctuality: ReportsPunctuality;
  onBack?: () => void;
  onToggleListSelection?: (listId: string | null) => void;
  onToggleListFilter?: () => void;
  onToggleDatePicker?: () => void;
  onToggleChartSeries?: (series: ReportsChartSeries) => void;
  onExport?: () => void;
};

function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}hr`;
  return `${hours}hr ${minutes}min`;
}

function chartStyle(day: ReportsChartDay, maximum: number): CSSProperties {
  const taskPercent = maximum <= 0 ? 0 : Math.max(1.5, (day.taskSeconds / maximum) * 100);
  const breakPercent = maximum <= 0 ? 0 : Math.max(1.5, (day.breakSeconds / maximum) * 100);
  const totalPercent = maximum <= 0 ? 0 : Math.max(1.5, ((day.taskSeconds + day.breakSeconds) / maximum) * 100);
  return {
    "--report-task-height": `${taskPercent}%`,
    "--report-break-height": `${breakPercent}%`,
    "--report-total-height": `${totalPercent}%`,
  } as CSSProperties;
}

function ReportChart({
  days,
  tooltipDayId,
  visibleSeries,
  onToggleSeries,
}: {
  days: ReportsChartDay[];
  tooltipDayId?: string | null;
  visibleSeries: ReportsChartVisibility;
  onToggleSeries?: (series: ReportsChartSeries) => void;
}) {
  const maximum = Math.max(1, ...days.map((day) => day.taskSeconds + day.breakSeconds));

  return (
    <section className="reports-overview__chart-card" aria-labelledby="reports-productivity-title">
      <div className="reports-overview__section-heading">
        <div>
          <p className="reports-overview__section-kicker">Productivity</p>
          <h2 id="reports-productivity-title">Time by day</h2>
        </div>
        <button type="button" className="reports-overview__chart-menu" aria-label="Chart options">•••</button>
      </div>

      <div className="reports-overview__chart" aria-label="Daily Tasks, Breaks and Total session time">
        {days.map((day) => {
          const total = day.taskSeconds + day.breakSeconds;
          const tooltipOpen = tooltipDayId === day.id;
          return (
            <div
              key={day.id}
              className="reports-overview__chart-day"
              style={chartStyle(day, maximum)}
              data-report-chart-day={day.id}
            >
              <button
                type="button"
                className="reports-overview__chart-hit"
                aria-label={`${day.label}: Tasks ${formatDuration(day.taskSeconds)}, Breaks ${formatDuration(day.breakSeconds)}, Total ${formatDuration(total)}`}
                aria-describedby={tooltipOpen ? `report-tooltip-${day.id}` : undefined}
              >
                <span
                  className="reports-overview__chart-bars"
                  aria-hidden="true"
                  data-visible-series-count={Object.values(visibleSeries).filter(Boolean).length}
                >
                  {visibleSeries.tasks ? <span className="reports-overview__chart-bar reports-overview__chart-bar--tasks" /> : null}
                  {visibleSeries.breaks ? <span className="reports-overview__chart-bar reports-overview__chart-bar--breaks" /> : null}
                  {visibleSeries.total ? <span className="reports-overview__chart-bar reports-overview__chart-bar--total" /> : null}
                </span>
                <span className="reports-overview__chart-label">{day.label}</span>
              </button>

              {tooltipOpen ? (
                <div
                  id={`report-tooltip-${day.id}`}
                  className="reports-overview__chart-tooltip"
                  role="tooltip"
                  data-report-chart-tooltip="true"
                >
                  <strong>{day.label}</strong>
                  <span><i className="reports-overview__legend-dot reports-overview__legend-dot--tasks" />TASKS: {formatDuration(day.taskSeconds)}</span>
                  <span><i className="reports-overview__legend-dot reports-overview__legend-dot--breaks" />BREAKS: {formatDuration(day.breakSeconds)}</span>
                  <span><i className="reports-overview__legend-dot reports-overview__legend-dot--total" />TOTAL: {formatDuration(total)}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="reports-overview__legend" aria-label="Chart legend">
        {([
          ["tasks", "Tasks"],
          ["breaks", "Breaks"],
          ["total", "Total"],
        ] as const).map(([series, label]) => (
          <button
            type="button"
            key={series}
            aria-pressed={visibleSeries[series]}
            onClick={() => onToggleSeries?.(series)}
          >
            <i className={`reports-overview__legend-dot reports-overview__legend-dot--${series}`} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function DateRangePicker({ months }: { months: ReportsCalendarMonth[] }) {
  return (
    <div
      className="reports-overview__date-popover"
      role="dialog"
      aria-label="Choose report date range"
      data-report-date-picker="true"
    >
      <div className="reports-overview__date-presets" aria-label="Date presets">
        {["Today", "Yesterday", "This week", "Last 30 days", "Last 60 days", "Last 90 days"].map((preset) => (
          <button type="button" key={preset}>{preset}</button>
        ))}
      </div>

      <div className="reports-overview__calendars">
        {months.slice(0, 2).map((month) => (
          <section className="reports-overview__calendar" key={month.label} aria-label={month.label}>
            <header>
              <button type="button" aria-label={`Previous month from ${month.label}`}>‹</button>
              <strong>{month.label}</strong>
              <button type="button" aria-label={`Next month from ${month.label}`}>›</button>
            </header>
            <div className="reports-overview__weekdays" aria-hidden="true">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="reports-overview__calendar-days">
              {month.weeks.flat().map((day) => (
                <button
                  type="button"
                  key={day.key}
                  className={[
                    day.muted ? "is-muted" : "",
                    day.selected ? "is-selected" : "",
                    day.edge ? `is-${day.edge}` : "",
                  ].filter(Boolean).join(" ")}
                  aria-pressed={day.selected || undefined}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </section>
        ))}

        <footer className="reports-overview__date-actions">
          <button type="button" className="reports-overview__date-cancel">Cancel</button>
          <button type="button" className="reports-overview__date-apply">Apply</button>
        </footer>
      </div>
    </div>
  );
}

export function ReportsOverviewView({
  metrics,
  chartDays,
  productive,
  timeByList,
  doneTasks,
  listLabel,
  selectedListIds,
  listOptions,
  rangeLabel,
  calendarMonths,
  listFilterOpen = false,
  datePickerOpen = false,
  tooltipDayId = null,
  visibleSeries = { tasks: true, breaks: true, total: true },
  punctuality,
  onBack,
  onToggleListSelection,
  onToggleListFilter,
  onToggleDatePicker,
  onToggleChartSeries,
  onExport,
}: ReportsOverviewViewProps) {
  const totalListSeconds = timeByList.reduce((total, item) => total + Math.max(0, item.seconds), 0);
  let listCursor = 0;
  const listSegments = timeByList.map((item) => {
    const start = totalListSeconds > 0 ? (listCursor / totalListSeconds) * 100 : 0;
    listCursor += Math.max(0, item.seconds);
    const end = totalListSeconds > 0 ? (listCursor / totalListSeconds) * 100 : start;
    return `${item.color ?? "var(--color-accent-solid)"} ${start}% ${end}%`;
  });
  const listDonutStyle = {
    "--report-list-donut": listSegments.length
      ? `conic-gradient(${listSegments.join(", ")})`
      : "conic-gradient(var(--color-surface-interactive) 0 100%)",
  } as CSSProperties;

  const doneGroups = Array.from(
    doneTasks.reduce((groups, task) => {
      const existing = groups.get(task.completionLabel);
      if (existing) existing.push(task);
      else groups.set(task.completionLabel, [task]);
      return groups;
    }, new Map<string, ReportsDoneTask[]>()),
  );

  return (
    <section className="reports-overview" data-reports-overview="true" aria-labelledby="reports-overview-title">
      <header className="reports-overview__header">
        <div className="reports-overview__title-row">
          <button type="button" className="reports-overview__back" onClick={onBack}>‹ Back</button>
          <h1 id="reports-overview-title">Reports</h1>
        </div>
        <button type="button" className="reports-overview__export" onClick={onExport}>⇩ Export PDF</button>
      </header>

      <div className="reports-overview__tabs" role="tablist" aria-label="Reports">
        <button type="button" role="tab" aria-selected="true">Overview</button>
        <button type="button" role="tab" aria-selected="false">Sessions <span>Beta</span></button>
      </div>

      <div className="reports-overview__filters">
        <div className="reports-overview__filter-anchor">
          <button
            type="button"
            className="reports-overview__filter-button"
            aria-haspopup="listbox"
            aria-expanded={listFilterOpen}
            onClick={onToggleListFilter}
            data-report-list-filter="true"
          >
            <span className="reports-overview__list-glyph" aria-hidden="true">N</span>
            {listLabel}
            <span aria-hidden="true">⌄</span>
          </button>
          {listFilterOpen ? (
            <div
              className="reports-overview__list-menu"
              role="listbox"
              aria-multiselectable="true"
              aria-label="Filter reports by list"
              data-report-list-menu="true"
            >
              {listOptions.map((option) => {
                const selected = option.id === null
                  ? selectedListIds.length === 0
                  : selectedListIds.includes(option.id);
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    key={option.id ?? "all"}
                    onClick={() => onToggleListSelection?.(option.id)}
                  >
                    <span className="reports-overview__list-check" aria-hidden="true">{selected ? "✓" : ""}</span>
                    <i style={{ backgroundColor: option.color ?? "var(--color-accent-solid)" }} aria-hidden="true" />
                    {option.title}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="reports-overview__date-anchor">
          <button
            type="button"
            className="reports-overview__range-button"
            aria-haspopup="dialog"
            aria-expanded={datePickerOpen}
            onClick={onToggleDatePicker}
            data-report-date-range="true"
          >
            <span aria-hidden="true">▣</span>
            {rangeLabel}
          </button>
          {datePickerOpen ? <DateRangePicker months={calendarMonths} /> : null}
        </div>
      </div>

      <div className="reports-overview__metrics" data-report-summary-metrics="true">
        {metrics.slice(0, 4).map((metric) => (
          <article className="reports-overview__metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            {metric.detail ? <small>{metric.detail}</small> : null}
          </article>
        ))}
      </div>

      <ReportChart
        days={chartDays}
        tooltipDayId={tooltipDayId}
        visibleSeries={visibleSeries}
        onToggleSeries={onToggleChartSeries}
      />

      <div className="reports-overview__productive-grid" data-report-productive-cards="true">
        {[
          ["Most Productive hour", productive.hour],
          ["Most Productive day", productive.day],
          ["Most Productive month", productive.month],
        ].map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="reports-overview__lower-grid" data-report-lower-panels="true">
        <section className="reports-overview__panel" aria-labelledby="reports-time-by-list-title">
          <div className="reports-overview__panel-heading reports-overview__panel-heading--time-list">
            <h2 id="reports-time-by-list-title">Time By List</h2>
            <span>Total Time: <strong>{formatDuration(totalListSeconds)}</strong></span>
          </div>
          {timeByList.length ? (
            <div className="reports-overview__list-time" data-report-list-donut="true">
              <div className="reports-overview__list-donut" style={listDonutStyle} aria-hidden="true">
                <span>{formatDuration(totalListSeconds)}</span>
              </div>
              <div className="reports-overview__list-time-legend">
                {timeByList.map((item) => {
                  const percent = totalListSeconds > 0 ? (item.seconds / totalListSeconds) * 100 : 0;
                  return (
                    <div className="reports-overview__list-time-row" key={item.id}>
                      <span className="reports-overview__list-time-name">
                        <i style={{ backgroundColor: item.color ?? "var(--color-accent-solid)" }} aria-hidden="true" />
                        {item.title}
                      </span>
                      <strong>{formatDuration(item.seconds)}</strong>
                      <span>{Math.round(percent)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="reports-overview__empty">No report on the selected date range</p>
          )}
        </section>

        <section className="reports-overview__panel" aria-labelledby="reports-done-title">
          <div className="reports-overview__panel-heading reports-overview__panel-heading--done">
            <h2 id="reports-done-title">Done Tasks</h2>
            <div className="reports-overview__punctuality" aria-label="Completion punctuality">
              <span className="is-early">● Early {punctuality.earlyPercent.toFixed(2)}%</span>
              <span className="is-late">● Late {punctuality.latePercent.toFixed(2)}%</span>
            </div>
          </div>
          <div className="reports-overview__punctuality-bar" aria-hidden="true">
            <i className="is-early" style={{ width: `${Math.max(0, Math.min(100, punctuality.earlyPercent))}%` }} />
            <i className="is-late" style={{ width: `${Math.max(0, Math.min(100, punctuality.latePercent))}%` }} />
          </div>
          {doneTasks.length ? (
            <div className="reports-overview__done-list">
              {doneGroups.map(([completionLabel, tasks]) => (
                <section className="reports-overview__done-group" key={completionLabel} data-report-done-group="true">
                  <header>
                    <strong>{completionLabel}</strong>
                    <span>{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span>
                  </header>
                  {tasks.map((task) => (
                    <article className="reports-overview__done-row" key={task.id}>
                      <div>
                        <strong>{task.title}</strong>
                        <span>{task.listTitle}</span>
                      </div>
                      <div className="reports-overview__done-metrics">
                        {task.punctuality !== "none" ? (
                          <span className={task.punctuality === "early" ? "is-early" : "is-late"}>
                            {task.varianceLabel}
                          </span>
                        ) : <span>No Est</span>}
                        <span>Time Taken {task.timeTakenLabel}</span>
                      </div>
                    </article>
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <p className="reports-overview__empty">No completed tasks in this range</p>
          )}
        </section>
      </div>
    </section>
  );
}
