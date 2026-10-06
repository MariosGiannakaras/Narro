import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import type { HomeSnapshot } from "./HomeDashboard";
import {
  exportReportOverviewPdf,
  getReportOverview,
  type ReportOverview,
} from "./reportsApi";
import {
  ReportsOverviewView,
  type ReportsChartSeries,
  type ReportsChartVisibility,
  type ReportsDoneTask,
  type ReportsListOption,
  type ReportsListTime,
  type ReportsMetric,
} from "./ReportsOverviewView";
import {
  addReportMonths,
  buildReportCalendarMonths,
  defaultReportDateRange,
  formatProductiveHour,
  formatProductiveMonth,
  formatProductiveWeekday,
  formatReportCompletionDate,
  formatReportDayLabel,
  formatReportDuration,
  formatReportRangeLabel,
  normalizeReportDateRange,
  reportDateKeyInTimeZone,
  reportMonthStart,
  reportPresetRange,
  reportRangeRequestBounds,
  reportSecondsNumber,
  type ReportDatePreset,
  type ReportDateRange,
} from "./reportOverviewPresentation";
import { usePreferenceSettingsProjection } from "./usePreferenceSettingsProjection";

type ReportsOverviewProps = {
  onBack?: () => void;
  onOpenSessions?: () => void;
};

type DraftRangeState = {
  range: ReportDateRange;
  waitingForEnd: boolean;
};

function resolvedLocale(): string {
  return globalThis.navigator?.language || "en-US";
}

function resolvedSystemTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function waitForReportPrintLayout(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

function buildMetrics(overview: ReportOverview): ReportsMetric[] {
  const workDays = overview.summary.totalWorkDays;
  return [
    {
      label: "Total work days",
      value: workDays,
      detail: `${workDays} active ${workDays === "1" ? "day" : "days"}`,
    },
    {
      label: "Total tasks done",
      value: overview.summary.totalTasksDone,
      detail: overview.summary.averageTasksPerWorkDay === null
        ? null
        : `${overview.summary.averageTasksPerWorkDay.toFixed(1)} avg / active day`,
    },
    {
      label: "Total time worked",
      value: formatReportDuration(overview.summary.totalTimeSeconds),
      detail: overview.summary.averageTimePerWorkDaySeconds === null
        ? null
        : `${formatReportDuration(overview.summary.averageTimePerWorkDaySeconds)} avg / active day`,
    },
    {
      label: "Avg. Time per task",
      value: formatReportDuration(overview.summary.averageTimePerTaskSeconds),
      detail: "includes partial tasks",
    },
  ];
}

function doneTaskPresentation(
  overview: ReportOverview,
  locale: string,
  timeZone: string,
): ReportsDoneTask[] {
  return overview.doneTasks.map(({ task, timing }) => {
    const punctuality = timing?.kind === "early"
      ? "early"
      : timing?.kind === "late"
        ? "late"
        : timing?.kind === "on_time"
          ? "on_time"
          : "none";
    return {
      id: task.taskId,
      title: task.taskTitle,
      listTitle: task.listTitle,
      completionLabel: formatReportCompletionDate(task.completedAt, locale, timeZone),
      timeTakenLabel: formatReportDuration(task.timeTakenSeconds),
      punctuality,
      varianceLabel: timing === null
        ? null
        : timing.kind === "on_time"
          ? "On time"
          : `${formatReportDuration(timing.differenceSeconds)} ${timing.kind}`,
    };
  });
}

export function ReportsOverview({ onBack, onOpenSessions }: ReportsOverviewProps) {
  const locale = resolvedLocale();
  const preferences = usePreferenceSettingsProjection();
  const [home, setHome] = useState<HomeSnapshot | null>(null);
  const [homeError, setHomeError] = useState<string | null>(null);
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [exportPending, setExportPending] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [appliedRange, setAppliedRange] = useState<ReportDateRange | null>(null);
  const [draftRange, setDraftRange] = useState<DraftRangeState | null>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<string | null>(null);
  const [listFilterOpen, setListFilterOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState<ReportsChartVisibility>({
    tasks: true,
    breaks: true,
    total: true,
  });

  const timeZone = preferences.snapshot?.general.timezone || resolvedSystemTimeZone();

  useEffect(() => {
    let disposed = false;
    void invoke<HomeSnapshot>("get_home_snapshot")
      .then((payload) => {
        if (disposed) return;
        setHome(payload);
        setHomeError(null);
      })
      .catch((failure: unknown) => {
        if (!disposed) setHomeError(formatInvokeError(failure));
      });
    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!preferences.settled || appliedRange !== null) return;
    const todayKey = reportDateKeyInTimeZone(new Date(), timeZone);
    const initial = defaultReportDateRange(todayKey);
    setAppliedRange(initial);
    setDraftRange({ range: initial, waitingForEnd: false });
    setCalendarAnchor(reportMonthStart(initial.startDateKey));
  }, [appliedRange, preferences.settled, timeZone]);

  useEffect(() => {
    if (!appliedRange || !preferences.settled || preferences.error) return;
    let disposed = false;
    const bounds = reportRangeRequestBounds(appliedRange, timeZone);
    void getReportOverview({
      ...bounds,
      listIds: selectedListIds,
      displayTimezone: timeZone,
    })
      .then((payload) => {
        if (disposed) return;
        setOverview(payload);
        setReportError(null);
      })
      .catch((failure: unknown) => {
        if (!disposed) setReportError(formatInvokeError(failure));
      });
    return () => {
      disposed = true;
    };
  }, [appliedRange, preferences.error, preferences.settled, selectedListIds, timeZone]);

  const listOptions = useMemo<ReportsListOption[]>(() => [
    { id: null, title: "All Lists", color: null },
    ...(home?.lists.map((list) => ({
      id: list.id,
      title: list.title,
      color: list.color,
    })) ?? []),
  ], [home]);

  const listLabel = selectedListIds.length === 0
    ? "All Lists"
    : selectedListIds.length === 1
      ? listOptions.find((option) => option.id === selectedListIds[0])?.title ?? "Selected list"
      : `Selected ${selectedListIds.length} lists`;

  const selectedCalendarRange = draftRange?.range ?? appliedRange;
  const calendarMonths = useMemo(
    () => selectedCalendarRange && calendarAnchor
      ? buildReportCalendarMonths(calendarAnchor, selectedCalendarRange, locale)
      : [],
    [calendarAnchor, locale, selectedCalendarRange],
  );

  const toggleListSelection = (listId: string | null) => {
    if (listId === null) {
      setSelectedListIds([]);
      return;
    }
    setSelectedListIds((current) => current.includes(listId)
      ? current.filter((id) => id !== listId)
      : [...current, listId]);
  };

  const toggleDatePicker = () => {
    setDatePickerOpen((open) => {
      const next = !open;
      if (next && appliedRange) {
        setDraftRange({ range: appliedRange, waitingForEnd: false });
        setCalendarAnchor(reportMonthStart(appliedRange.startDateKey));
      }
      return next;
    });
  };

  const selectDatePreset = (preset: ReportDatePreset) => {
    const todayKey = reportDateKeyInTimeZone(new Date(), timeZone);
    const range = reportPresetRange(preset, todayKey);
    setDraftRange({ range, waitingForEnd: false });
    setCalendarAnchor(reportMonthStart(range.startDateKey));
  };

  const selectCalendarDay = (dateKey: string) => {
    setDraftRange((current) => {
      if (!current || !current.waitingForEnd) {
        return {
          range: { startDateKey: dateKey, endDateKey: dateKey },
          waitingForEnd: true,
        };
      }
      return {
        range: normalizeReportDateRange(current.range.startDateKey, dateKey),
        waitingForEnd: false,
      };
    });
  };

  const cancelDateRange = () => {
    if (appliedRange) {
      setDraftRange({ range: appliedRange, waitingForEnd: false });
      setCalendarAnchor(reportMonthStart(appliedRange.startDateKey));
    }
    setDatePickerOpen(false);
  };

  const applyDateRange = () => {
    if (!draftRange) return;
    setAppliedRange(draftRange.range);
    setDatePickerOpen(false);
  };

  const toggleChartSeries = (series: ReportsChartSeries) => {
    setVisibleSeries((current) => {
      const visibleCount = Object.values(current).filter(Boolean).length;
      if (current[series] && visibleCount === 1) return current;
      return { ...current, [series]: !current[series] };
    });
  };

  const exportOverviewPdf = async () => {
    if (!appliedRange || exportPending) return;

    const bounds = reportRangeRequestBounds(appliedRange, timeZone);
    setExportPending(true);
    setExportStatus(null);
    setExportError(null);
    setListFilterOpen(false);
    setDatePickerOpen(false);
    document.documentElement.dataset.reportPdfExport = "true";

    try {
      await waitForReportPrintLayout();
      const result = await exportReportOverviewPdf({
        startAt: bounds.startAt,
        endAt: bounds.endAt,
      });
      setExportStatus(`Saved PDF to ${result.path}`);
    } catch (failure: unknown) {
      setExportError(formatInvokeError(failure));
    } finally {
      delete document.documentElement.dataset.reportPdfExport;
      setExportPending(false);
    }
  };

  const blockingError = preferences.error || homeError || (overview === null ? reportError : null);
  if (blockingError) {
    return (
      <section className="reports-overview reports-overview--state" data-reports-overview-state="error" role="alert">
        <h1>Reports</h1>
        <p>Reports could not be loaded from local data.</p>
        <code>{blockingError}</code>
      </section>
    );
  }

  if (!preferences.settled || home === null || appliedRange === null || overview === null) {
    return (
      <section className="reports-overview reports-overview--state" data-reports-overview-state="loading" aria-live="polite">
        <h1>Reports</h1>
        <p>Loading local report history…</p>
      </section>
    );
  }

  const listColors = new Map(home.lists.map((list) => [list.id, list.color]));
  const timeByList: ReportsListTime[] = overview.timeByList.map((row) => ({
    id: row.listId,
    title: row.listTitle,
    color: listColors.get(row.listId) ?? null,
    seconds: reportSecondsNumber(row.workSeconds),
  }));

  return (
    <>
      {reportError ? (
        <p className="reports-overview__runtime-error" role="status">
          Latest report refresh failed: {reportError}
        </p>
      ) : null}
      {exportError ? (
        <p className="reports-overview__runtime-error" role="alert">
          PDF export failed: {exportError}
        </p>
      ) : exportStatus ? (
        <p className="reports-overview__export-status" role="status">
          {exportStatus}
        </p>
      ) : null}
      <ReportsOverviewView
        metrics={buildMetrics(overview)}
        chartDays={overview.dailySeries.map((day) => ({
          id: day.localDate,
          label: formatReportDayLabel(day.localDate, locale),
          taskSeconds: reportSecondsNumber(day.taskSeconds),
          breakSeconds: reportSecondsNumber(day.breakSeconds),
        }))}
        productive={{
          hour: formatProductiveHour(overview.productive.localHourStart, locale),
          day: formatProductiveWeekday(overview.productive.weekdayFromMonday, locale),
          month: formatProductiveMonth(overview.productive.monthKey, locale),
        }}
        timeByList={timeByList}
        doneTasks={doneTaskPresentation(overview, locale, timeZone)}
        listLabel={listLabel}
        selectedListIds={selectedListIds}
        listOptions={listOptions}
        rangeLabel={formatReportRangeLabel(appliedRange, locale)}
        calendarMonths={calendarMonths}
        listFilterOpen={listFilterOpen}
        datePickerOpen={datePickerOpen}
        visibleSeries={visibleSeries}
        punctuality={{
          earlyPercent: overview.punctuality.earlyPercent ?? 0,
          latePercent: overview.punctuality.latePercent ?? 0,
        }}
        exportDisabled={exportPending}
        exportPending={exportPending}
        sessionsDisabled={!onOpenSessions}
        onExport={() => void exportOverviewPdf()}
        onBack={onBack}
        onOpenSessions={onOpenSessions}
        onToggleListSelection={toggleListSelection}
        onToggleListFilter={() => setListFilterOpen((open) => !open)}
        onToggleDatePicker={toggleDatePicker}
        onToggleChartSeries={toggleChartSeries}
        onSelectDatePreset={selectDatePreset}
        onSelectCalendarDay={selectCalendarDay}
        onPreviousCalendarMonth={() => {
          setCalendarAnchor((current) => addReportMonths(current ?? reportMonthStart(appliedRange.startDateKey), -1));
        }}
        onNextCalendarMonth={() => {
          setCalendarAnchor((current) => addReportMonths(current ?? reportMonthStart(appliedRange.startDateKey), 1));
        }}
        onCancelDateRange={cancelDateRange}
        onApplyDateRange={applyDateRange}
      />
    </>
  );
}
