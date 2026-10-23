import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import type { HomeSnapshot } from "./HomeDashboard";
import {
  createManualReportSession,
  deleteReportSession,
  editReportSession,
  exportReportSessionsCsv,
  getReportSessions,
  getReportTaskSessions,
  type ReportSessions,
  type ReportSessionsRow,
  type ReportTaskSessionsDetail,
} from "./reportsApi";
import {
  addReportMonths,
  buildReportCalendarMonths,
  defaultReportDateRange,
  formatReportDuration,
  formatReportRangeLabel,
  normalizeReportDateRange,
  reportDateKeyInTimeZone,
  reportMonthStart,
  reportPresetRange,
  reportRangeRequestBounds,
  reportSessionDurationSeconds,
  reportTimestampInputParts,
  zonedReportDateTimeIso,
  type ReportDatePreset,
  type ReportDateRange,
} from "./reportOverviewPresentation";
import {
  ReportAddSessionDialog,
  ReportTaskSessionsDialog,
  ReportsSessionsView,
  type ReportsAddSessionDraft,
  type ReportsSessionGroup,
  type ReportsSessionViewRow,
  type ReportsTaskDetailView,
} from "./ReportsSessionsView";
import { getSearchPaletteData, type SearchPaletteData } from "./searchPaletteApi";
import { usePreferenceSettingsProjection } from "./usePreferenceSettingsProjection";

type ReportsSessionsProps = {
  onBack?: () => void;
  onOpenOverview: () => void;
};

type DraftRangeState = {
  range: ReportDateRange;
  waitingForEnd: boolean;
};

type AddDraftState = Omit<ReportsAddSessionDraft, "durationLabel">;

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

function sessionDateLabel(timestamp: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone,
  }).format(new Date(timestamp));
}

function sessionTimeLabel(timestamp: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(timestamp));
}

function sessionRowView(
  row: ReportSessionsRow,
  locale: string,
  timeZone: string,
  listColors: Map<string, string | null>,
): ReportsSessionViewRow {
  const session = row.session;
  const startParts = reportTimestampInputParts(session.startedAt, timeZone);
  const endParts = reportTimestampInputParts(session.endedAt, timeZone);
  return {
    id: session.id,
    taskId: session.taskId,
    taskTitle: session.kind === "break" ? "Break" : session.taskTitle ?? "Unknown task",
    listTitle: session.listTitle,
    listColor: session.listId ? listColors.get(session.listId) ?? null : null,
    kind: session.kind,
    ordinalLabel: session.kind === "work" && row.taskSessionOrdinal
      ? `Session ${row.taskSessionOrdinal.padStart(2, "0")}`
      : null,
    dateKey: startParts.dateKey,
    dateLabel: sessionDateLabel(session.startedAt, locale, timeZone),
    startLabel: sessionTimeLabel(session.startedAt, locale, timeZone),
    endLabel: sessionTimeLabel(session.endedAt, locale, timeZone),
    endTimeValue: endParts.timeKey,
    durationLabel: formatReportDuration(session.durationSeconds),
    updatedAt: session.updatedAt,
  };
}

function groupRows(rows: ReportsSessionViewRow[]): ReportsSessionGroup[] {
  const groups = new Map<string, ReportsSessionGroup>();
  for (const row of rows) {
    const existing = groups.get(row.dateKey);
    if (existing) existing.rows.push(row);
    else groups.set(row.dateKey, { dateKey: row.dateKey, label: row.dateLabel, rows: [row] });
  }
  return [...groups.values()];
}

function makeAddDraft(timeZone: string, taskId = ""): AddDraftState {
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000);
  const start = reportTimestampInputParts(now.toISOString(), timeZone);
  const end = reportTimestampInputParts(later.toISOString(), timeZone);
  return {
    taskId,
    dateKey: start.dateKey,
    startTime: start.timeKey,
    endTime: end.dateKey === start.dateKey ? end.timeKey : "23:59",
  };
}

export function ReportsSessions({ onBack, onOpenOverview }: ReportsSessionsProps) {
  const locale = resolvedLocale();
  const preferences = usePreferenceSettingsProjection();
  const timeZone = preferences.snapshot?.general.timezone || resolvedSystemTimeZone();

  const [home, setHome] = useState<HomeSnapshot | null>(null);
  const [searchData, setSearchData] = useState<SearchPaletteData | null>(null);
  const [sessions, setSessions] = useState<ReportSessions | null>(null);
  // Render rows only for the request that produced them. A previously accepted
  // filter's rows must not be relabelled as a newly committed filter.
  const [sessionsRequestKey, setSessionsRequestKey] = useState<string | null>(null);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [showBreakSessions, setShowBreakSessions] = useState(true);
  const [appliedRange, setAppliedRange] = useState<ReportDateRange | null>(null);
  const [draftRange, setDraftRange] = useState<DraftRangeState | null>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<string | null>(null);
  const [listFilterOpen, setListFilterOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const [initialReadAttempt, setInitialReadAttempt] = useState(0);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [sessionsReadAttempt, setSessionsReadAttempt] = useState(0);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const detailOpenerRef = useRef<HTMLElement | null>(null);
  const [detail, setDetail] = useState<ReportTaskSessionsDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  // Filter effects and post-commit refreshes compete for the same view state.
  // Share one read generation per projection, regardless of who requested it.
  const sessionsReadRevisionRef = useRef(0);
  const detailReadRevisionRef = useRef(0);
  // A committed mutation may resume on a closure from a *previous render*.
  // Reject old-filter/old-detail requests before they claim a newer generation.
  const sessionsActiveRequestKeyRef = useRef<string | null>(null);
  const detailActiveTaskIdRef = useRef<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const addOpenerRef = useRef<HTMLElement | null>(null);
  const [addDraft, setAddDraft] = useState<AddDraftState>(() => makeAddDraft(timeZone));
  const [mutationPendingId, setMutationPendingId] = useState<string | null>(null);
  // Shared synchronous owner for Add, Edit and Delete. React pending state alone
  // cannot exclude a second keyboard/pointer event or a competing write.
  const sessionMutationInFlightRef = useRef(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [exportPending, setExportPending] = useState(false);
  // CSV export writes a new local file; a second pre-render event must not duplicate it.
  const exportInFlightRef = useRef(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    void Promise.all([
      invoke<HomeSnapshot>("get_home_snapshot"),
      getSearchPaletteData(),
    ])
      .then(([homePayload, searchPayload]) => {
        if (disposed) return;
        setHome(homePayload);
        setSearchData(searchPayload);
        setReadError(null);
      })
      .catch((failure: unknown) => {
        if (!disposed) setReadError(formatInvokeError(failure));
      });
    return () => { disposed = true; };
  }, [initialReadAttempt]);

  useEffect(() => {
    if (!preferences.settled || appliedRange !== null) return;
    const todayKey = reportDateKeyInTimeZone(new Date(), timeZone);
    const initial = defaultReportDateRange(todayKey);
    setAppliedRange(initial);
    setDraftRange({ range: initial, waitingForEnd: false });
    setCalendarAnchor(reportMonthStart(initial.startDateKey));
    setAddDraft(makeAddDraft(timeZone));
  }, [appliedRange, preferences.settled, timeZone]);

  const currentRequest = useCallback(() => {
    if (!appliedRange) return null;
    return {
      ...reportRangeRequestBounds(appliedRange, timeZone),
      listIds: selectedListIds,
      showBreakSessions,
    };
  }, [appliedRange, selectedListIds, showBreakSessions, timeZone]);

  const refreshSessions = useCallback(async () => {
    const request = currentRequest();
    if (!request) return null;
    const requestKey = JSON.stringify(request);
    if (sessionsActiveRequestKeyRef.current !== requestKey) return null;
    const revision = ++sessionsReadRevisionRef.current;
    try {
      const payload = await getReportSessions(request);
      if (revision !== sessionsReadRevisionRef.current
        || sessionsActiveRequestKeyRef.current !== requestKey) return null;
      setSessions(payload);
      setSessionsRequestKey(requestKey);
      setRefreshError(null);
      return payload;
    } catch (failure: unknown) {
      // A superseded mutation refresh must not report a failure over a newer filter.
      if (revision !== sessionsReadRevisionRef.current
        || sessionsActiveRequestKeyRef.current !== requestKey) return null;
      throw failure;
    }
  }, [currentRequest]);

  // A new filter is authoritative at its committed DOM boundary, *before*
  // the passive effect starts its IPC read. Publishing this in useEffect left
  // a frame where an old post-mutation refresh could claim the new view.
  // Never change refs during render: an aborted concurrent render cannot
  // invalidate the currently committed request.
  const committedSessionsRequest = currentRequest();
  const committedSessionsRequestKey = committedSessionsRequest
    ? JSON.stringify(committedSessionsRequest) : null;
  useLayoutEffect(() => {
    if (sessionsActiveRequestKeyRef.current !== committedSessionsRequestKey) {
      sessionsActiveRequestKeyRef.current = committedSessionsRequestKey;
      ++sessionsReadRevisionRef.current;
      // Do not expose a previous filter's read error under a new selection.
      setRefreshError(null);
    }
  }, [committedSessionsRequestKey]);

  useEffect(() => {
    if (!preferences.settled || preferences.error) return;
    let disposed = false;
    const request = currentRequest();
    sessionsActiveRequestKeyRef.current = request ? JSON.stringify(request) : null;
    if (!request) return;
    const revision = ++sessionsReadRevisionRef.current;
    void getReportSessions(request)
      .then((payload) => {
        if (disposed || revision !== sessionsReadRevisionRef.current) return;
        setSessions(payload);
        setSessionsRequestKey(JSON.stringify(request));
        setRefreshError(null);
      })
      .catch((failure: unknown) => {
        if (!disposed && revision === sessionsReadRevisionRef.current) {
          setRefreshError(formatInvokeError(failure));
        }
      });
    return () => { disposed = true; };
  }, [currentRequest, preferences.error, preferences.settled, sessionsReadAttempt]);

  const refreshDetail = useCallback(async (taskId = detailTaskId) => {
    if (!taskId) {
      ++detailReadRevisionRef.current;
      setDetail(null);
      return null;
    }
    if (detailActiveTaskIdRef.current !== taskId) return null;
    const revision = ++detailReadRevisionRef.current;
    try {
      const payload = await getReportTaskSessions({ taskId });
      if (revision !== detailReadRevisionRef.current
        || detailActiveTaskIdRef.current !== taskId) return null;
      setDetail(payload);
      setDetailError(null);
      return payload;
    } catch (failure: unknown) {
      if (revision !== detailReadRevisionRef.current
        || detailActiveTaskIdRef.current !== taskId) return null;
      throw failure;
    }
  }, [detailTaskId]);

  // Closing or switching task detail commits before its passive fetch runs.
  // Invalidate an old mutation result at that committed selection boundary.
  useLayoutEffect(() => {
    if (detailActiveTaskIdRef.current !== detailTaskId) {
      detailActiveTaskIdRef.current = detailTaskId;
      ++detailReadRevisionRef.current;
    }
  }, [detailTaskId]);

  useEffect(() => {
    detailActiveTaskIdRef.current = detailTaskId;
    const revision = ++detailReadRevisionRef.current;
    if (!detailTaskId) {
      setDetail(null);
      setDetailError(null);
      return;
    }
    let disposed = false;
    void getReportTaskSessions({ taskId: detailTaskId })
      .then((payload) => {
        if (!disposed && revision === detailReadRevisionRef.current
          && detailActiveTaskIdRef.current === detailTaskId) {
          setDetail(payload);
          setDetailError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed && revision === detailReadRevisionRef.current
          && detailActiveTaskIdRef.current === detailTaskId) {
          setDetailError(formatInvokeError(failure));
        }
      });
    return () => { disposed = true; };
  }, [detailTaskId]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const listColors = useMemo(
    () => new Map(home?.lists.map((list) => [list.id, list.color] as const) ?? []),
    [home],
  );
  const listOptions = useMemo(() => [
    { id: null, title: "All Lists", color: null },
    ...(home?.lists.map((list) => ({ id: list.id, title: list.title, color: list.color })) ?? []),
  ], [home]);
  const listLabel = selectedListIds.length === 0
    ? "All Lists"
    : selectedListIds.length === 1
      ? listOptions.find((option) => option.id === selectedListIds[0])?.title ?? "Selected list"
      : `Selected ${selectedListIds.length} lists`;

  const sessionsForCurrentRequest = sessionsRequestKey === committedSessionsRequestKey ? sessions : null;
  const groups = useMemo(
    () => groupRows((sessionsForCurrentRequest?.rows ?? []).map((row) => sessionRowView(row, locale, timeZone, listColors))),
    [listColors, locale, sessionsForCurrentRequest, timeZone],
  );

  const detailView = useMemo<ReportsTaskDetailView | null>(() => {
    // Closing or switching a task must unmount its old modal in the same
    // committed render, not wait for passive read cleanup.
    if (!detail || detailTaskId !== detail.taskId) return null;
    return {
      taskId: detail.taskId,
      taskTitle: detail.taskTitle,
      listTitle: detail.listTitle,
      listColor: listColors.get(detail.listId) ?? null,
      totalTime: formatReportDuration(detail.totalFocusSeconds),
      totalSessions: detail.totalSessions,
      rows: detail.rows.map((row) => sessionRowView(row, locale, timeZone, listColors)),
    };
  }, [detail, detailTaskId, listColors, locale, timeZone]);

  const selectedCalendarRange = draftRange?.range ?? appliedRange;
  const calendarMonths = useMemo(
    () => selectedCalendarRange && calendarAnchor
      ? buildReportCalendarMonths(calendarAnchor, selectedCalendarRange, locale)
      : [],
    [calendarAnchor, locale, selectedCalendarRange],
  );

  const addDraftView = useMemo<ReportsAddSessionDraft>(() => {
    let durationLabel = "—";
    try {
      const startedAt = zonedReportDateTimeIso(addDraft.dateKey, addDraft.startTime, timeZone);
      const endedAt = zonedReportDateTimeIso(addDraft.dateKey, addDraft.endTime, timeZone);
      const duration = reportSessionDurationSeconds(startedAt, endedAt);
      durationLabel = duration === null ? "Invalid range" : formatReportDuration(duration);
    } catch {
      durationLabel = "Invalid range";
    }
    return { ...addDraft, durationLabel };
  }, [addDraft, timeZone]);

  const afterMutation = async (message: string, taskId?: string | null) => {
    const refreshes: Array<Promise<unknown>> = [refreshSessions()];
    if (detailTaskId && (!taskId || taskId === detailTaskId)) {
      refreshes.push(refreshDetail(detailTaskId));
    }
    const results = await Promise.allSettled(refreshes);
    const refreshFailure = results.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (refreshFailure) {
      setRefreshError(
        `${message} Authoritative report data could not refresh: ${formatInvokeError(refreshFailure.reason)}`,
      );
      return;
    }
    setRefreshError(null);
    setFeedback(message);
  };

  const commitEndTime = async (row: ReportsSessionViewRow, endTime: string): Promise<boolean> => {
    const raw = sessionsForCurrentRequest?.rows.find((candidate) => candidate.session.id === row.id)?.session
      ?? detail?.rows.find((candidate) => candidate.session.id === row.id)?.session;
    if (mutationPendingId || sessionMutationInFlightRef.current) return false;
    if (!raw) {
      setMutationError("Session changed before the edit could be prepared. Refresh and try again.");
      return false;
    }

    sessionMutationInFlightRef.current = true;
    setMutationPendingId(row.id);
    setMutationError(null);
    try {
      const endDate = reportTimestampInputParts(raw.endedAt, timeZone).dateKey;
      const endedAt = zonedReportDateTimeIso(endDate, endTime, timeZone);
      const durationSeconds = reportSessionDurationSeconds(raw.startedAt, endedAt);
      if (durationSeconds === null) {
        setMutationError("End time must be after the session start time.");
        return false;
      }
      await editReportSession({
        sessionId: raw.id,
        expectedUpdatedAt: raw.updatedAt,
        startedAt: raw.startedAt,
        endedAt,
        durationSeconds,
      });
      await afterMutation("Session updated!", raw.taskId);
      return true;
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
      return false;
    } finally {
      sessionMutationInFlightRef.current = false;
      setMutationPendingId(null);
    }
  };

  const deleteSession = async (row: ReportsSessionViewRow) => {
    const raw = sessionsForCurrentRequest?.rows.find((candidate) => candidate.session.id === row.id)?.session
      ?? detail?.rows.find((candidate) => candidate.session.id === row.id)?.session;
    if (!raw || mutationPendingId || sessionMutationInFlightRef.current) return;
    sessionMutationInFlightRef.current = true;
    setMutationPendingId(row.id);
    setMutationError(null);
    try {
      await deleteReportSession({ sessionId: raw.id, expectedUpdatedAt: raw.updatedAt });
      await afterMutation("Session deleted.", raw.taskId);
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
    } finally {
      sessionMutationInFlightRef.current = false;
      setMutationPendingId(null);
    }
  };

  const openAddSession = (taskId = "", opener?: HTMLElement) => {
    addOpenerRef.current = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setMutationError(null);
    setAddDraft(makeAddDraft(timeZone, taskId));
    setAddOpen(true);
  };

  const commitAddSession = async () => {
    if (!addDraft.taskId || mutationPendingId || sessionMutationInFlightRef.current) return;
    sessionMutationInFlightRef.current = true;
    setMutationPendingId("add");
    setMutationError(null);
    try {
      const startedAt = zonedReportDateTimeIso(addDraft.dateKey, addDraft.startTime, timeZone);
      const endedAt = zonedReportDateTimeIso(addDraft.dateKey, addDraft.endTime, timeZone);
      const durationSeconds = reportSessionDurationSeconds(startedAt, endedAt);
      if (durationSeconds === null) {
        setMutationError("End time must be after the session start time.");
        return;
      }
      await createManualReportSession({
        taskId: addDraft.taskId,
        startedAt,
        endedAt,
        durationSeconds,
      });
      setAddOpen(false);
      await afterMutation("Session added successfully!", addDraft.taskId);
    } catch (failure: unknown) {
      setMutationError(formatInvokeError(failure));
    } finally {
      sessionMutationInFlightRef.current = false;
      setMutationPendingId(null);
    }
  };

  const exportSessions = async () => {
    if (exportPending || exportInFlightRef.current) return;
    const request = currentRequest();
    if (!request) return;

    exportInFlightRef.current = true;
    setExportPending(true);
    setExportError(null);
    try {
      const result = await exportReportSessionsCsv(request);
      setFeedback(`Sessions CSV exported locally to ${result.path}`);
    } catch (failure: unknown) {
      setExportError(formatInvokeError(failure));
    } finally {
      exportInFlightRef.current = false;
      setExportPending(false);
    }
  };

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
        return { range: { startDateKey: dateKey, endDateKey: dateKey }, waitingForEnd: true };
      }
      return { range: normalizeReportDateRange(current.range.startDateKey, dateKey), waitingForEnd: false };
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

  const blockingError = preferences.error || readError || (sessionsForCurrentRequest === null ? refreshError : null);
  if (blockingError) {
    return (
      <section className="reports-overview reports-overview--state" data-reports-sessions-state="error" role="alert">
        <h1>Reports</h1>
        <p>Sessions could not be loaded from local data.</p>
        <code>{blockingError}</code>
        {(readError || (sessionsForCurrentRequest === null && refreshError)) ? (
          <button type="button" className="motion-interactive" data-reports-sessions-retry="true"
            onClick={() => {
              if (readError) {
                setReadError(null);
                setHome(null);
                setSearchData(null);
                setInitialReadAttempt((attempt) => attempt + 1);
              }
              if (sessionsForCurrentRequest === null && refreshError) {
                setRefreshError(null);
                setSessionsReadAttempt((attempt) => attempt + 1);
              }
            }}>
            Retry loading sessions
          </button>
        ) : null}
        <button type="button" className="motion-interactive" onClick={onBack}>Back</button>
      </section>
    );
  }

  if (!preferences.settled || home === null || appliedRange === null || sessionsForCurrentRequest === null) {
    return (
      <section className="reports-overview reports-overview--state" data-reports-sessions-state="loading" aria-live="polite">
        <h1>Reports</h1>
        <p>Loading local session history…</p>
      </section>
    );
  }

  return (
    <>
      {refreshError ? <p className="reports-overview__runtime-error" role="status">{refreshError}</p> : null}
      {mutationError ? <p className="reports-overview__runtime-error" role="alert">{mutationError}</p> : null}
      {detailError ? <p className="reports-overview__runtime-error" role="alert">{detailError}</p> : null}
      {exportError ? <p className="reports-overview__runtime-error" role="alert">{exportError}</p> : null}
      {feedback ? <div className="reports-sessions__toast" role="status">{feedback}</div> : null}

      <ReportsSessionsView
        summary={{
          totalTime: formatReportDuration(sessionsForCurrentRequest.summary.totalFocusSeconds),
          totalTasks: sessionsForCurrentRequest.summary.totalTasks,
          totalSessions: sessionsForCurrentRequest.summary.totalSessions,
        }}
        groups={groups}
        listLabel={listLabel}
        selectedListIds={selectedListIds}
        listOptions={listOptions}
        rangeLabel={formatReportRangeLabel(appliedRange, locale)}
        calendarMonths={calendarMonths}
        showBreakSessions={showBreakSessions}
        listFilterOpen={listFilterOpen}
        datePickerOpen={datePickerOpen}
        pendingSessionId={mutationPendingId}
        exportPending={exportPending}
        onBack={onBack}
        onOpenOverview={onOpenOverview}
        onOpenAddSession={(opener) => openAddSession("", opener)}
        onExport={() => void exportSessions()}
        onToggleBreakSessions={() => setShowBreakSessions((visible) => !visible)}
        onToggleListFilter={() => setListFilterOpen((open) => !open)}
        onToggleListSelection={toggleListSelection}
        onToggleDatePicker={toggleDatePicker}
        onSelectDatePreset={selectDatePreset}
        onSelectCalendarDay={selectCalendarDay}
        onPreviousCalendarMonth={() => setCalendarAnchor((current) => addReportMonths(current ?? reportMonthStart(appliedRange.startDateKey), -1))}
        onNextCalendarMonth={() => setCalendarAnchor((current) => addReportMonths(current ?? reportMonthStart(appliedRange.startDateKey), 1))}
        onPreviousCalendarYear={() => setCalendarAnchor((current) => addReportMonths(current ?? reportMonthStart(appliedRange.startDateKey), -12))}
        onNextCalendarYear={() => setCalendarAnchor((current) => addReportMonths(current ?? reportMonthStart(appliedRange.startDateKey), 12))}
        onCancelDateRange={cancelDateRange}
        onApplyDateRange={applyDateRange}
        onCommitEndTime={commitEndTime}
        onOpenDetail={(taskId) => {
          detailOpenerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          setDetailTaskId(taskId);
        }}
        onDelete={(row) => void deleteSession(row)}
      />

      {detailView ? (
        <ReportTaskSessionsDialog
          detail={detailView}
          covered={addOpen}
          returnFocusTarget={detailOpenerRef.current}
          pendingSessionId={mutationPendingId}
          onClose={() => setDetailTaskId(null)}
          onAddSession={(taskId, opener) => openAddSession(taskId, opener)}
          onCommitEndTime={commitEndTime}
          onDelete={(row) => void deleteSession(row)}
        />
      ) : null}

      {addOpen ? (
        <ReportAddSessionDialog
          returnFocusTarget={addOpenerRef.current}
          tasks={searchData?.tasks ?? []}
          draft={addDraftView}
          pending={mutationPendingId === "add"}
          error={mutationError}
          onDraftChange={({ durationLabel: _durationLabel, ...next }) => setAddDraft(next)}
          onClose={() => {
            if (mutationPendingId !== "add" && !sessionMutationInFlightRef.current) setAddOpen(false);
          }}
          onCommit={() => void commitAddSession()}
        />
      ) : null}
    </>
  );
}
