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

export type CreateReportManualSessionRequest = {
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

export function createReportManualSession(
  request: CreateReportManualSessionRequest,
): Promise<ReportSessionMutation> {
  return invoke<ReportSessionMutation>("create_report_manual_session", request);
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
