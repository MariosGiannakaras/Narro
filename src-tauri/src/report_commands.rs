use crate::domain::ids::{ListId, SessionId, TaskId};
use crate::domain::sessions::{SessionKind, SessionRecord, SessionSource};
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::sessions::{
    create_manual_work_session, delete_closed_session_if_expected, edit_closed_session_if_expected,
    SessionStoreError,
};
use crate::reporting::{
    report_history_snapshot, report_overview, ReportCompletedTaskRow, ReportCompletionTiming,
    ReportCompletionTimingKind, ReportDailySeriesPoint, ReportDoneTaskInsight,
    ReportHistorySnapshot, ReportOverview, ReportOverviewSummary, ReportProductiveSummary,
    ReportPunctualitySummary, ReportRange, ReportSessionRow, ReportTimeByListRow, ReportingError,
};
use crate::session_reporting::{
    load_sessions_report, load_task_sessions_detail, SessionsReportError, SessionsReportProjection,
    SessionsReportRow, SessionsReportSummary, TaskSessionsDetailProjection,
};
use rusqlite::Connection;
use serde::Serialize;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use tauri::Manager;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportRangePayload {
    pub start_at: String,
    pub end_at: String,
    pub list_ids: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportSessionPayload {
    pub id: String,
    pub task_id: Option<String>,
    pub task_title: Option<String>,
    pub list_id: Option<String>,
    pub list_title: Option<String>,
    pub kind: SessionKind,
    pub source: SessionSource,
    pub started_at: String,
    pub ended_at: String,
    pub duration_seconds: String,
    pub updated_at: String,
    pub task_archived: bool,
    pub list_archived: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportCompletedTaskPayload {
    pub task_id: String,
    pub list_id: String,
    pub task_title: String,
    pub list_title: String,
    pub est_seconds: Option<u32>,
    pub completed_at: String,
    pub time_taken_seconds: String,
    pub task_archived: bool,
    pub list_archived: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportHistoryPayload {
    pub range: ReportRangePayload,
    pub sessions: Vec<ReportSessionPayload>,
    pub completed_tasks: Vec<ReportCompletedTaskPayload>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportOverviewSummaryPayload {
    pub total_work_days: String,
    pub total_tasks_done: String,
    pub average_tasks_per_work_day: Option<f64>,
    pub total_time_seconds: String,
    pub average_time_per_work_day_seconds: Option<f64>,
    pub average_time_per_task_seconds: Option<f64>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportDailySeriesPointPayload {
    pub local_date: String,
    pub task_seconds: String,
    pub break_seconds: String,
    pub total_seconds: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportProductiveSummaryPayload {
    pub local_hour_start: Option<u8>,
    pub weekday_from_monday: Option<u8>,
    pub month_key: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportTimeByListRowPayload {
    pub list_id: String,
    pub list_title: String,
    pub work_seconds: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportCompletionTimingPayload {
    pub kind: ReportCompletionTimingKind,
    pub difference_seconds: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportDoneTaskInsightPayload {
    pub task: ReportCompletedTaskPayload,
    pub timing: Option<ReportCompletionTimingPayload>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportPunctualitySummaryPayload {
    pub early_seconds: String,
    pub late_seconds: String,
    pub early_percent: Option<f64>,
    pub late_percent: Option<f64>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportOverviewPayload {
    pub summary: ReportOverviewSummaryPayload,
    pub daily_series: Vec<ReportDailySeriesPointPayload>,
    pub productive: ReportProductiveSummaryPayload,
    pub time_by_list: Vec<ReportTimeByListRowPayload>,
    pub done_tasks: Vec<ReportDoneTaskInsightPayload>,
    pub punctuality: ReportPunctualitySummaryPayload,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportSessionsSummaryPayload {
    pub total_focus_seconds: String,
    pub total_tasks: String,
    pub total_sessions: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportSessionsRowPayload {
    pub session: ReportSessionPayload,
    pub task_session_ordinal: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportSessionsPayload {
    pub summary: ReportSessionsSummaryPayload,
    pub rows: Vec<ReportSessionsRowPayload>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportTaskSessionsDetailPayload {
    pub task_id: String,
    pub task_title: String,
    pub list_id: String,
    pub list_title: String,
    pub task_archived: bool,
    pub list_archived: bool,
    pub total_focus_seconds: String,
    pub total_sessions: String,
    pub rows: Vec<ReportSessionsRowPayload>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportSessionMutationPayload {
    pub id: String,
    pub task_id: Option<String>,
    pub kind: SessionKind,
    pub started_at: String,
    pub ended_at: Option<String>,
    pub duration_seconds: String,
    pub source: SessionSource,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportExportPayload {
    pub path: String,
    pub row_count: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportPdfExportPayload {
    pub path: String,
}

impl From<ReportRange> for ReportRangePayload {
    fn from(value: ReportRange) -> Self {
        Self {
            start_at: value.start_at,
            end_at: value.end_at,
            list_ids: value
                .list_ids
                .into_iter()
                .map(|id| id.to_string())
                .collect(),
        }
    }
}

impl From<ReportSessionRow> for ReportSessionPayload {
    fn from(value: ReportSessionRow) -> Self {
        Self {
            id: value.id.to_string(),
            task_id: value.task_id.map(|id| id.to_string()),
            task_title: value.task_title,
            list_id: value.list_id.map(|id| id.to_string()),
            list_title: value.list_title,
            kind: value.kind,
            source: value.source,
            started_at: value.started_at,
            ended_at: value.ended_at,
            duration_seconds: value.duration_seconds.to_string(),
            updated_at: value.updated_at,
            task_archived: value.task_archived,
            list_archived: value.list_archived,
        }
    }
}

impl From<ReportCompletedTaskRow> for ReportCompletedTaskPayload {
    fn from(value: ReportCompletedTaskRow) -> Self {
        Self {
            task_id: value.task_id.to_string(),
            list_id: value.list_id.to_string(),
            task_title: value.task_title,
            list_title: value.list_title,
            est_seconds: value.est_seconds,
            completed_at: value.completed_at,
            time_taken_seconds: value.time_taken_seconds.to_string(),
            task_archived: value.task_archived,
            list_archived: value.list_archived,
        }
    }
}

impl From<ReportHistorySnapshot> for ReportHistoryPayload {
    fn from(value: ReportHistorySnapshot) -> Self {
        Self {
            range: value.range.into(),
            sessions: value.sessions.into_iter().map(Into::into).collect(),
            completed_tasks: value.completed_tasks.into_iter().map(Into::into).collect(),
        }
    }
}

impl From<ReportOverviewSummary> for ReportOverviewSummaryPayload {
    fn from(value: ReportOverviewSummary) -> Self {
        Self {
            total_work_days: value.total_work_days.to_string(),
            total_tasks_done: value.total_tasks_done.to_string(),
            average_tasks_per_work_day: value.average_tasks_per_work_day,
            total_time_seconds: value.total_time_seconds.to_string(),
            average_time_per_work_day_seconds: value.average_time_per_work_day_seconds,
            average_time_per_task_seconds: value.average_time_per_task_seconds,
        }
    }
}

impl From<ReportDailySeriesPoint> for ReportDailySeriesPointPayload {
    fn from(value: ReportDailySeriesPoint) -> Self {
        Self {
            local_date: value.local_date,
            task_seconds: value.task_seconds.to_string(),
            break_seconds: value.break_seconds.to_string(),
            total_seconds: value.total_seconds.to_string(),
        }
    }
}

impl From<ReportProductiveSummary> for ReportProductiveSummaryPayload {
    fn from(value: ReportProductiveSummary) -> Self {
        Self {
            local_hour_start: value.local_hour_start,
            weekday_from_monday: value.weekday_from_monday,
            month_key: value.month_key,
        }
    }
}

impl From<ReportTimeByListRow> for ReportTimeByListRowPayload {
    fn from(value: ReportTimeByListRow) -> Self {
        Self {
            list_id: value.list_id.to_string(),
            list_title: value.list_title,
            work_seconds: value.work_seconds.to_string(),
        }
    }
}

impl From<ReportCompletionTiming> for ReportCompletionTimingPayload {
    fn from(value: ReportCompletionTiming) -> Self {
        Self {
            kind: value.kind,
            difference_seconds: value.difference_seconds.to_string(),
        }
    }
}

impl From<ReportDoneTaskInsight> for ReportDoneTaskInsightPayload {
    fn from(value: ReportDoneTaskInsight) -> Self {
        Self {
            task: value.task.into(),
            timing: value.timing.map(Into::into),
        }
    }
}

impl From<ReportPunctualitySummary> for ReportPunctualitySummaryPayload {
    fn from(value: ReportPunctualitySummary) -> Self {
        Self {
            early_seconds: value.early_seconds.to_string(),
            late_seconds: value.late_seconds.to_string(),
            early_percent: value.early_percent,
            late_percent: value.late_percent,
        }
    }
}

impl From<ReportOverview> for ReportOverviewPayload {
    fn from(value: ReportOverview) -> Self {
        Self {
            summary: value.summary.into(),
            daily_series: value.daily_series.into_iter().map(Into::into).collect(),
            productive: value.productive.into(),
            time_by_list: value.time_by_list.into_iter().map(Into::into).collect(),
            done_tasks: value.done_tasks.into_iter().map(Into::into).collect(),
            punctuality: value.punctuality.into(),
        }
    }
}

impl From<SessionsReportSummary> for ReportSessionsSummaryPayload {
    fn from(value: SessionsReportSummary) -> Self {
        Self {
            total_focus_seconds: value.total_focus_seconds.to_string(),
            total_tasks: value.total_tasks.to_string(),
            total_sessions: value.total_sessions.to_string(),
        }
    }
}

impl From<SessionsReportRow> for ReportSessionsRowPayload {
    fn from(value: SessionsReportRow) -> Self {
        Self {
            session: value.session.into(),
            task_session_ordinal: value.task_session_ordinal.map(|value| value.to_string()),
        }
    }
}

impl From<SessionsReportProjection> for ReportSessionsPayload {
    fn from(value: SessionsReportProjection) -> Self {
        Self {
            summary: value.summary.into(),
            rows: value.rows.into_iter().map(Into::into).collect(),
        }
    }
}

impl From<TaskSessionsDetailProjection> for ReportTaskSessionsDetailPayload {
    fn from(value: TaskSessionsDetailProjection) -> Self {
        Self {
            task_id: value.task_id.to_string(),
            task_title: value.task_title,
            list_id: value.list_id.to_string(),
            list_title: value.list_title,
            task_archived: value.task_archived,
            list_archived: value.list_archived,
            total_focus_seconds: value.total_focus_seconds.to_string(),
            total_sessions: value.total_sessions.to_string(),
            rows: value.rows.into_iter().map(Into::into).collect(),
        }
    }
}

impl From<SessionRecord> for ReportSessionMutationPayload {
    fn from(value: SessionRecord) -> Self {
        Self {
            id: value.id.to_string(),
            task_id: value.task_id.map(|id| id.to_string()),
            kind: value.kind,
            started_at: value.started_at,
            ended_at: value.ended_at,
            duration_seconds: value.duration_seconds.to_string(),
            source: value.source,
            created_at: value.created_at,
            updated_at: value.updated_at,
        }
    }
}

fn csv_cell(value: &str) -> String {
    format!("\"{}\"", value.replace('\"', "\"\""))
}

fn csv_user_text_cell(value: &str) -> String {
    let first_non_space = value.trim_start().chars().next();
    let safe = if matches!(first_non_space, Some('=' | '+' | '-' | '@')) {
        format!("'{value}")
    } else {
        value.to_owned()
    };
    csv_cell(&safe)
}

fn sessions_csv(payload: &ReportSessionsPayload) -> String {
    let mut csv = String::from(
        "\u{feff}\"Session\",\"Type\",\"Task\",\"List\",\"Started At\",\"Ended At\",\"Duration Seconds\",\"Source\"\r\n",
    );
    for row in &payload.rows {
        let session = &row.session;
        let values = [
            csv_cell(row.task_session_ordinal.as_deref().unwrap_or("")),
            csv_cell(session.kind.as_str()),
            csv_user_text_cell(session.task_title.as_deref().unwrap_or("")),
            csv_user_text_cell(session.list_title.as_deref().unwrap_or("")),
            csv_cell(&session.started_at),
            csv_cell(&session.ended_at),
            csv_cell(&session.duration_seconds),
            csv_cell(session.source.as_str()),
        ];
        csv.push_str(&values.join(","));
        csv.push_str("\r\n");
    }
    csv
}

fn export_range_date(value: &str) -> &str {
    value
        .get(..10)
        .filter(|candidate| {
            candidate
                .chars()
                .all(|character| character.is_ascii_digit() || character == '-')
        })
        .unwrap_or("range")
}

fn write_unique_export(
    directory: &Path,
    file_stem: &str,
    extension: &str,
    contents: &[u8],
) -> CommandResult<PathBuf> {
    fs::create_dir_all(directory).map_err(|error| {
        CommandError::new(
            "REPORT_EXPORT_FAILED",
            format!("failed to prepare the local export directory: {error}"),
        )
    })?;

    for suffix in 1..=9_999_u32 {
        let file_name = if suffix == 1 {
            format!("{file_stem}.{extension}")
        } else {
            format!("{file_stem}-{suffix}.{extension}")
        };
        let path = directory.join(file_name);
        match OpenOptions::new().write(true).create_new(true).open(&path) {
            Ok(mut file) => {
                file.write_all(contents).map_err(|error| {
                    CommandError::new(
                        "REPORT_EXPORT_FAILED",
                        format!("failed to write the local report export: {error}"),
                    )
                })?;
                file.flush().map_err(|error| {
                    CommandError::new(
                        "REPORT_EXPORT_FAILED",
                        format!("failed to finalize the local report export: {error}"),
                    )
                })?;
                return Ok(path);
            }
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => continue,
            Err(error) => {
                return Err(CommandError::new(
                    "REPORT_EXPORT_FAILED",
                    format!("failed to create the local report export: {error}"),
                ));
            }
        }
    }

    Err(CommandError::new(
        "REPORT_EXPORT_FAILED",
        "could not choose an unused local export filename",
    ))
}

fn app_database(app_handle: &tauri::AppHandle) -> CommandResult<Connection> {
    let app_dir: PathBuf = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "REPORT_COMMAND_FAILED",
            format!("failed to resolve Narro app-data directory for reports: {error}"),
        )
    })?;
    let connection = Connection::open(app_dir.join("narro.db")).map_err(|error| {
        CommandError::new(
            "REPORT_COMMAND_FAILED",
            format!("failed to open the Narro database for reports: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "REPORT_COMMAND_FAILED",
            format!("failed to configure the Narro database for reports: {error}"),
        )
    })?;
    Ok(connection)
}

fn parse_list_ids(raw: Vec<String>) -> CommandResult<Vec<ListId>> {
    let mut parsed = Vec::with_capacity(raw.len());
    for value in raw {
        let id = ListId::parse_str(&value)
            .map_err(|_| CommandError::invalid_argument("listIds", "must contain valid UUIDs"))?;
        if !parsed.contains(&id) {
            parsed.push(id);
        }
    }
    Ok(parsed)
}

fn parse_task_id(raw: &str) -> CommandResult<TaskId> {
    TaskId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument("taskId", "must be a valid UUID"))
}

fn parse_session_id(raw: &str) -> CommandResult<SessionId> {
    SessionId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument("sessionId", "must be a valid UUID"))
}

fn map_reporting_error(error: ReportingError) -> CommandError {
    match error {
        ReportingError::InvalidRangeTimestamp("start_at") => {
            CommandError::invalid_argument("startAt", "must be an RFC 3339 timestamp")
        }
        ReportingError::InvalidRangeTimestamp("end_at") => {
            CommandError::invalid_argument("endAt", "must be an RFC 3339 timestamp")
        }
        ReportingError::InvalidRangeTimestamp(_) => {
            CommandError::new("REPORT_READ_FAILED", error.to_string())
        }
        ReportingError::EmptyOrReversedRange => {
            CommandError::invalid_argument("endAt", "must be after startAt")
        }
        ReportingError::InvalidDisplayTimezone(_) => {
            CommandError::invalid_argument("displayTimezone", "must be a valid IANA timezone name")
        }
        _ => CommandError::new("REPORT_READ_FAILED", error.to_string()),
    }
}

fn map_sessions_report_error(error: SessionsReportError) -> CommandError {
    match error {
        SessionsReportError::Reporting(error) => map_reporting_error(error),
        other => CommandError::new("REPORT_READ_FAILED", other.to_string()),
    }
}

fn map_session_error(error: SessionStoreError) -> CommandError {
    match error {
        SessionStoreError::InvalidSessionTimestamp("started_at") => {
            CommandError::invalid_argument("startedAt", "must be an RFC 3339 timestamp")
        }
        SessionStoreError::InvalidSessionTimestamp("ended_at") => {
            CommandError::invalid_argument("endedAt", "must be an RFC 3339 timestamp")
        }
        SessionStoreError::InvalidSessionTimestamp(_) => {
            CommandError::new("REPORT_SESSION_MUTATION_FAILED", error.to_string())
        }
        SessionStoreError::EndBeforeStart => {
            CommandError::invalid_argument("endedAt", "must not precede startedAt")
        }
        SessionStoreError::DurationOverflow => {
            CommandError::invalid_argument("durationSeconds", "exceeds the supported range")
        }
        SessionStoreError::NotFound(_)
        | SessionStoreError::TaskNotFound(_)
        | SessionStoreError::StaleVersion { .. } => {
            CommandError::new("REPORT_SESSION_STALE", error.to_string())
        }
        SessionStoreError::OpenSessionMutation(_) => {
            CommandError::new("REPORT_SESSION_LIVE", error.to_string())
        }
        _ => CommandError::new("REPORT_SESSION_MUTATION_FAILED", error.to_string()),
    }
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_report_history(
    app_handle: tauri::AppHandle,
    start_at: String,
    end_at: String,
    list_ids: Vec<String>,
) -> CommandResult<ReportHistoryPayload> {
    let range = ReportRange {
        start_at,
        end_at,
        list_ids: parse_list_ids(list_ids)?,
    };
    let connection = app_database(&app_handle)?;
    report_history_snapshot(&connection, range)
        .map(Into::into)
        .map_err(map_reporting_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_report_overview(
    app_handle: tauri::AppHandle,
    start_at: String,
    end_at: String,
    list_ids: Vec<String>,
    display_timezone: String,
) -> CommandResult<ReportOverviewPayload> {
    let range = ReportRange {
        start_at,
        end_at,
        list_ids: parse_list_ids(list_ids)?,
    };
    let connection = app_database(&app_handle)?;
    report_overview(&connection, range, &display_timezone)
        .map(Into::into)
        .map_err(map_reporting_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_report_sessions(
    app_handle: tauri::AppHandle,
    start_at: String,
    end_at: String,
    list_ids: Vec<String>,
    show_break_sessions: bool,
) -> CommandResult<ReportSessionsPayload> {
    let range = ReportRange {
        start_at,
        end_at,
        list_ids: parse_list_ids(list_ids)?,
    };
    let connection = app_database(&app_handle)?;
    load_sessions_report(&connection, range, show_break_sessions)
        .map(Into::into)
        .map_err(map_sessions_report_error)
}

#[tauri::command(rename_all = "camelCase")]
pub async fn export_report_overview_pdf(
    window: tauri::WebviewWindow,
    app_handle: tauri::AppHandle,
    start_at: String,
    end_at: String,
) -> CommandResult<ReportPdfExportPayload> {
    if window.label() != "main" {
        return Err(CommandError::new(
            "REPORT_EXPORT_FAILED",
            "Overview PDF export is only available from the main Narro window",
        ));
    }

    let start = chrono::DateTime::parse_from_rfc3339(&start_at)
        .map_err(|_| CommandError::invalid_argument("startAt", "must be an RFC 3339 timestamp"))?;
    let end = chrono::DateTime::parse_from_rfc3339(&end_at)
        .map_err(|_| CommandError::invalid_argument("endAt", "must be an RFC 3339 timestamp"))?;
    if end <= start {
        return Err(CommandError::invalid_argument(
            "endAt",
            "must be after startAt",
        ));
    }

    let file_stem = format!(
        "narro-overview-{}-to-{}",
        export_range_date(&start_at),
        export_range_date(&end_at)
    );
    let pdf = crate::report_pdf::capture(window).await?;
    let download_directory = app_handle.path().download_dir().map_err(|error| {
        CommandError::new(
            "REPORT_EXPORT_FAILED",
            format!("failed to resolve the local Downloads directory: {error}"),
        )
    })?;
    let path = write_unique_export(&download_directory, &file_stem, "pdf", &pdf)?;

    Ok(ReportPdfExportPayload {
        path: path.to_string_lossy().into_owned(),
    })
}

#[tauri::command(rename_all = "camelCase")]
pub fn export_report_sessions_csv(
    app_handle: tauri::AppHandle,
    start_at: String,
    end_at: String,
    list_ids: Vec<String>,
    show_break_sessions: bool,
) -> CommandResult<ReportExportPayload> {
    let range = ReportRange {
        start_at,
        end_at,
        list_ids: parse_list_ids(list_ids)?,
    };
    let file_stem = format!(
        "narro-sessions-{}-to-{}",
        export_range_date(&range.start_at),
        export_range_date(&range.end_at)
    );
    let connection = app_database(&app_handle)?;
    let payload: ReportSessionsPayload =
        load_sessions_report(&connection, range, show_break_sessions)
            .map(Into::into)
            .map_err(map_sessions_report_error)?;
    let csv = sessions_csv(&payload);
    let download_directory = app_handle.path().download_dir().map_err(|error| {
        CommandError::new(
            "REPORT_EXPORT_FAILED",
            format!("failed to resolve the local Downloads directory: {error}"),
        )
    })?;
    let path = write_unique_export(&download_directory, &file_stem, "csv", csv.as_bytes())?;

    Ok(ReportExportPayload {
        path: path.to_string_lossy().into_owned(),
        row_count: payload.rows.len().to_string(),
    })
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_report_task_sessions(
    app_handle: tauri::AppHandle,
    task_id: String,
) -> CommandResult<ReportTaskSessionsDetailPayload> {
    let task_id = parse_task_id(&task_id)?;
    let connection = app_database(&app_handle)?;
    load_task_sessions_detail(&connection, task_id)
        .map(Into::into)
        .map_err(map_sessions_report_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn create_manual_report_session(
    app_handle: tauri::AppHandle,
    task_id: String,
    started_at: String,
    ended_at: String,
    duration_seconds: u32,
) -> CommandResult<ReportSessionMutationPayload> {
    let task_id = parse_task_id(&task_id)?;
    let mut connection = app_database(&app_handle)?;
    create_manual_work_session(
        &mut connection,
        task_id,
        &started_at,
        &ended_at,
        u64::from(duration_seconds),
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(Into::into)
    .map_err(map_session_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn edit_report_session(
    app_handle: tauri::AppHandle,
    session_id: String,
    expected_updated_at: String,
    started_at: String,
    ended_at: String,
    duration_seconds: u32,
) -> CommandResult<ReportSessionMutationPayload> {
    let session_id = parse_session_id(&session_id)?;
    let mut connection = app_database(&app_handle)?;
    edit_closed_session_if_expected(
        &mut connection,
        session_id,
        &expected_updated_at,
        &started_at,
        &ended_at,
        u64::from(duration_seconds),
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(Into::into)
    .map_err(map_session_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn delete_report_session(
    app_handle: tauri::AppHandle,
    session_id: String,
    expected_updated_at: String,
) -> CommandResult<ReportSessionMutationPayload> {
    let session_id = parse_session_id(&session_id)?;
    let mut connection = app_database(&app_handle)?;
    delete_closed_session_if_expected(&mut connection, session_id, &expected_updated_at)
        .map(Into::into)
        .map_err(map_session_error)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn overview_pdf_export_range_dates_are_filename_safe() {
        assert_eq!(export_range_date("2026-10-01T00:00:00+03:00"), "2026-10-01");
        assert_eq!(export_range_date("not-a-range"), "range");
    }

    #[test]
    fn report_argument_parsers_reject_invalid_identities() {
        assert_eq!(
            parse_list_ids(vec!["bad".into()]).unwrap_err().code,
            "INVALID_ARGUMENT"
        );
        let list_id = ListId::generate();
        assert_eq!(
            parse_list_ids(vec![list_id.to_string(), list_id.to_string()])
                .expect("deduplicate list filters"),
            vec![list_id]
        );
        assert_eq!(parse_task_id("bad").unwrap_err().code, "INVALID_ARGUMENT");
        assert_eq!(
            parse_session_id("bad").unwrap_err().code,
            "INVALID_ARGUMENT"
        );
    }

    #[test]
    fn report_errors_have_stable_read_and_mutation_classes() {
        assert_eq!(
            map_reporting_error(ReportingError::EmptyOrReversedRange).code,
            "INVALID_ARGUMENT"
        );
        assert_eq!(
            map_reporting_error(ReportingError::InvalidDisplayTimezone("Bad/Zone".into())).code,
            "INVALID_ARGUMENT"
        );

        let session_id = SessionId::generate();
        assert_eq!(
            map_session_error(SessionStoreError::OpenSessionMutation(session_id)).code,
            "REPORT_SESSION_LIVE"
        );
        assert_eq!(
            map_session_error(SessionStoreError::NotFound(session_id)).code,
            "REPORT_SESSION_STALE"
        );
        assert_eq!(
            map_session_error(SessionStoreError::StaleVersion {
                expected: "old".into(),
                actual: "new".into(),
            })
            .code,
            "REPORT_SESSION_STALE"
        );
    }

    #[test]
    fn overview_payload_serializes_u64_accounting_values_losslessly_as_strings() {
        let summary = ReportOverviewSummaryPayload::from(ReportOverviewSummary {
            total_work_days: u64::MAX,
            total_tasks_done: u64::MAX - 1,
            average_tasks_per_work_day: Some(1.5),
            total_time_seconds: u64::MAX - 2,
            average_time_per_work_day_seconds: Some(2.5),
            average_time_per_task_seconds: Some(3.5),
        });
        let value = serde_json::to_value(summary).expect("serialize overview summary");
        assert_eq!(
            value["totalWorkDays"],
            serde_json::Value::String(u64::MAX.to_string())
        );
        assert_eq!(
            value["totalTasksDone"],
            serde_json::Value::String((u64::MAX - 1).to_string())
        );
        assert_eq!(
            value["totalTimeSeconds"],
            serde_json::Value::String((u64::MAX - 2).to_string())
        );
    }

    #[test]
    fn sessions_payload_serializes_large_ordinals_losslessly_as_strings() {
        let row = ReportSessionsRowPayload {
            session: ReportSessionPayload {
                id: SessionId::generate().to_string(),
                task_id: Some(TaskId::generate().to_string()),
                task_title: Some("Task".into()),
                list_id: Some(ListId::generate().to_string()),
                list_title: Some("List".into()),
                kind: SessionKind::Work,
                source: SessionSource::Focus,
                started_at: "2026-09-30T10:00:00Z".into(),
                ended_at: "2026-09-30T11:00:00Z".into(),
                duration_seconds: "3600".into(),
                updated_at: "2026-09-30T11:00:00Z".into(),
                task_archived: false,
                list_archived: false,
            },
            task_session_ordinal: Some(u64::MAX.to_string()),
        };
        let value = serde_json::to_value(row).expect("serialize Sessions row");
        assert_eq!(
            value["taskSessionOrdinal"],
            serde_json::Value::String(u64::MAX.to_string())
        );
    }

    #[test]
    fn sessions_csv_is_utf8_excel_safe_and_preserves_break_semantics() {
        let work = ReportSessionsRowPayload {
            session: ReportSessionPayload {
                id: SessionId::generate().to_string(),
                task_id: Some(TaskId::generate().to_string()),
                task_title: Some("=SUM(1,2), \"quoted\"\nline".into()),
                list_id: Some(ListId::generate().to_string()),
                list_title: Some("@Planning".into()),
                kind: SessionKind::Work,
                source: SessionSource::Manual,
                started_at: "2026-09-30T10:00:00Z".into(),
                ended_at: "2026-09-30T11:00:00Z".into(),
                duration_seconds: "3600".into(),
                updated_at: "2026-09-30T11:00:00Z".into(),
                task_archived: false,
                list_archived: false,
            },
            task_session_ordinal: Some("3".into()),
        };
        let break_row = ReportSessionsRowPayload {
            session: ReportSessionPayload {
                id: SessionId::generate().to_string(),
                task_id: None,
                task_title: None,
                list_id: None,
                list_title: None,
                kind: SessionKind::Break,
                source: SessionSource::Focus,
                started_at: "2026-09-30T11:00:00Z".into(),
                ended_at: "2026-09-30T11:10:00Z".into(),
                duration_seconds: "600".into(),
                updated_at: "2026-09-30T11:10:00Z".into(),
                task_archived: false,
                list_archived: false,
            },
            task_session_ordinal: None,
        };
        let csv = sessions_csv(&ReportSessionsPayload {
            summary: ReportSessionsSummaryPayload {
                total_focus_seconds: "3600".into(),
                total_tasks: "1".into(),
                total_sessions: "2".into(),
            },
            rows: vec![work, break_row],
        });

        assert!(csv.starts_with('\u{feff}'));
        assert!(csv.contains("\"3\",\"work\""));
        assert!(csv.contains("\"'=SUM(1,2), \"\"quoted\"\"\nline\""));
        assert!(csv.contains("\"'@Planning\""));
        assert!(csv.contains("\"\",\"break\",\"\",\"\""));
        assert!(csv.ends_with("\r\n"));
    }

    #[test]
    fn report_payload_serializes_large_durations_losslessly_as_strings() {
        let payload = ReportSessionMutationPayload {
            id: SessionId::generate().to_string(),
            task_id: Some(TaskId::generate().to_string()),
            kind: SessionKind::Work,
            started_at: "2026-09-30T10:00:00Z".into(),
            ended_at: Some("2026-09-30T11:00:00Z".into()),
            duration_seconds: u64::MAX.to_string(),
            source: SessionSource::Edit,
            created_at: "2026-09-30T10:00:00Z".into(),
            updated_at: "2026-09-30T11:00:00Z".into(),
        };

        let value = serde_json::to_value(payload).expect("serialize report session payload");
        assert_eq!(
            value["durationSeconds"],
            serde_json::Value::String(u64::MAX.to_string())
        );
        assert!(value["taskId"].as_str().is_some());
    }
}
