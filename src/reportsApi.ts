import { invoke } from "@tauri-apps/api/core";

export type ReportSessionKind = "work" | "break";
export type ReportSessionSource = "focus" | "manual" | "edit";

export type ReportRange = {
  startAt: string;
  endAt: string;
  listId: string | null;
};

export type ReportSession = {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  listId: string | null;
  listTitle: string | null;
  kind: ReportSessionKind;
  source: ReportSessionSource;
  startedAt: string;
  endedAt: string;
  durationSeconds: string;
  taskArchived: boolean;
  listArchived: boolean;
};

export type ReportCompletedTask = {
  taskId: string;
  listId: string;
  taskTitle: string;
  listTitle: string;
  estSeconds: number | null;
  completedAt: string;
  timeTakenSeconds: string;
  taskArchived: boolean;
  listArchived: boolean;
};

export type ReportHistory = {
  range: ReportRange;
  sessions: ReportSession[];
  completedTasks: ReportCompletedTask[];
};

export type ReportOverviewSummary = {
  totalWorkDays: string;
  totalTasksDone: string;
  averageTasksPerWorkDay: number | null;
  totalTimeSeconds: string;
  averageTimePerWorkDaySeconds: number | null;
  averageTimePerTaskSeconds: number | null;
};

export type ReportDailySeriesPoint = {
  localDate: string;
  taskSeconds: string;
  breakSeconds: string;
  totalSeconds: string;
};

export type ReportProductiveSummary = {
  localHourStart: number | null;
  weekdayFromMonday: number | null;
  monthKey: string | null;
};

export type ReportTimeByListRow = {
  listId: string;
  listTitle: string;
  workSeconds: string;
};

export type ReportCompletionTimingKind = "early" | "on_time" | "late";

export type ReportCompletionTiming = {
  kind: ReportCompletionTimingKind;
  differenceSeconds: string;
};

export type ReportDoneTaskInsight = {
  task: ReportCompletedTask;
  timing: ReportCompletionTiming | null;
};

export type ReportPunctualitySummary = {
  earlySeconds: string;
  lateSeconds: string;
  earlyPercent: number | null;
  latePercent: number | null;
};

export type ReportOverview = {
  summary: ReportOverviewSummary;
  dailySeries: ReportDailySeriesPoint[];
  productive: ReportProductiveSummary;
  timeByList: ReportTimeByListRow[];
  doneTasks: ReportDoneTaskInsight[];
  punctuality: ReportPunctualitySummary;
};

export type ReportSessionMutation = {
  id: string;
  taskId: string | null;
  kind: ReportSessionKind;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: string;
  source: ReportSessionSource;
  createdAt: string;
  updatedAt: string;
};

export type GetReportHistoryRequest = {
  startAt: string;
  endAt: string;
  listId: string | null;
};

export type GetReportOverviewRequest = {
  startAt: string;
  endAt: string;
  listId: string | null;
  displayTimezone: string;
};

export type CreateManualReportSessionRequest = {
  taskId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
};

export type EditReportSessionRequest = {
  sessionId: string;
  expectedUpdatedAt: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
};

export type DeleteReportSessionRequest = {
  sessionId: string;
  expectedUpdatedAt: string;
};

export function getReportHistory(request: GetReportHistoryRequest): Promise<ReportHistory> {
  return invoke<ReportHistory>("get_report_history", request);
}

export function getReportOverview(request: GetReportOverviewRequest): Promise<ReportOverview> {
  return invoke<ReportOverview>("get_report_overview", request);
}

export function createManualReportSession(
  request: CreateManualReportSessionRequest,
): Promise<ReportSessionMutation> {
  return invoke<ReportSessionMutation>("create_manual_report_session", request);
}

export function editReportSession(
  request: EditReportSessionRequest,
): Promise<ReportSessionMutation> {
  return invoke<ReportSessionMutation>("edit_report_session", request);
}

export function deleteReportSession(
  request: DeleteReportSessionRequest,
): Promise<ReportSessionMutation> {
  return invoke<ReportSessionMutation>("delete_report_session", request);
}
