use crate::domain::ids::{ListId, SessionId, TaskId};
use crate::domain::sessions::{SessionKind, SessionRecord, SessionSource};
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::sessions::{
    create_manual_work_session, delete_closed_session_if_expected,
    edit_closed_session_if_expected, SessionStoreError,
};
use crate::reporting::{
    report_history_snapshot, ReportCompletedTaskRow, ReportHistorySnapshot, ReportRange,
    ReportSessionRow, ReportingError,
};
use rusqlite::Connection;
use serde::Serialize;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportRangeDto {
    pub start_at: String,
    pub end_at: String,
    pub list_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportSessionDto {
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
    pub task_archived: bool,
    pub list_archived: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportCompletedTaskDto {
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
pub struct ReportHistoryDto {
    pub range: ReportRangeDto,
    pub sessions: Vec<ReportSessionDto>,
    pub completed_tasks: Vec<ReportCompletedTaskDto>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportSessionMutationDto {
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

impl From<ReportSessionRow> for ReportSessionDto {
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
            task_archived: value.task_archived,
            list_archived: value.list_archived,
        }
    }
}

impl From<ReportCompletedTaskRow> for ReportCompletedTaskDto {
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

impl From<ReportHistorySnapshot> for ReportHistoryDto {
    fn from(value: ReportHistorySnapshot) -> Self {
        Self {
            range: ReportRangeDto {
                start_at: value.range.start_at,
                end_at: value.range.end_at,
                list_id: value.range.list_id.map(|id| id.to_string()),
            },
            sessions: value
                .sessions
                .into_iter()
                .map(ReportSessionDto::from)
                .collect(),
            completed_tasks: value
                .completed_tasks
                .into_iter()
                .map(ReportCompletedTaskDto::from)
                .collect(),
        }
    }
}

impl From<SessionRecord> for ReportSessionMutationDto {
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

fn app_database(app_handle: &tauri::AppHandle) -> CommandResult<Connection> {
    let app_dir: PathBuf = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "REPORT_DATABASE_FAILED",
            format!("failed to resolve Narro app-data directory for Reports: {error}"),
        )
    })?;
    let connection = Connection::open(app_dir.join("narro.db")).map_err(|error| {
        CommandError::new(
            "REPORT_DATABASE_FAILED",
            format!("failed to open the Narro database for Reports: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "REPORT_DATABASE_FAILED",
            format!("failed to configure the Narro database for Reports: {error}"),
        )
    })?;
    Ok(connection)
}

fn parse_list_id(raw: &str) -> CommandResult<ListId> {
    ListId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument("listId", "must be a valid UUID"))
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
        ReportingError::InvalidRangeTimestamp(field) => {
            let argument = if field == "start_at" { "startAt" } else { "endAt" };
            CommandError::invalid_argument(argument, "must be an RFC 3339 timestamp")
        }
        ReportingError::EmptyOrReversedRange => {
            CommandError::invalid_argument("endAt", "must be later than startAt")
        }
        error @ ReportingError::Sqlite(_) => {
            CommandError::new("REPORT_HISTORY_READ_FAILED", error.to_string())
        }
        error => CommandError::new("REPORT_HISTORY_INVALID_STORED_DATA", error.to_string()),
    }
}

fn map_session_error(error: SessionStoreError) -> CommandError {
    match error {
        SessionStoreError::InvalidSessionTimestamp(field) => {
            let argument = if field == "started_at" {
                "startedAt"
            } else {
                "endedAt"
            };
            CommandError::invalid_argument(argument, "must be an RFC 3339 timestamp")
        }
        SessionStoreError::EndBeforeStart => {
            CommandError::invalid_argument("endedAt", "must not be earlier than startedAt")
        }
        SessionStoreError::DurationOverflow => CommandError::invalid_argument(
            "durationSeconds",
            "exceeds the supported local session range",
        ),
        error @ SessionStoreError::TaskNotFound(_) => {
            CommandError::new("REPORT_SESSION_TASK_NOT_FOUND", error.to_string())
        }
        error @ SessionStoreError::OpenSessionMutation(_) => {
            CommandError::new("REPORT_SESSION_LIVE", error.to_string())
        }
        error @ (SessionStoreError::StaleVersion { .. }
        | SessionStoreError::TimestampBeforePreviousUpdate) => {
            CommandError::new("REPORT_SESSION_STALE", error.to_string())
        }
        error @ SessionStoreError::NotFound(_) => {
            CommandError::new("REPORT_SESSION_NOT_FOUND", error.to_string())
        }
        error => CommandError::new("REPORT_SESSION_MUTATION_FAILED", error.to_string()),
    }
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_report_history(
    app_handle: tauri::AppHandle,
    start_at: String,
    end_at: String,
    list_id: Option<String>,
) -> CommandResult<ReportHistoryDto> {
    let list_id = list_id.as_deref().map(parse_list_id).transpose()?;
    let connection = app_database(&app_handle)?;
    report_history_snapshot(
        &connection,
        ReportRange {
            start_at,
            end_at,
            list_id,
        },
    )
    .map(ReportHistoryDto::from)
    .map_err(map_reporting_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn create_report_manual_session(
    app_handle: tauri::AppHandle,
    task_id: String,
    started_at: String,
    ended_at: String,
    duration_seconds: u32,
) -> CommandResult<ReportSessionMutationDto> {
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
    .map(ReportSessionMutationDto::from)
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
) -> CommandResult<ReportSessionMutationDto> {
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
    .map(ReportSessionMutationDto::from)
    .map_err(map_session_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn delete_report_session(
    app_handle: tauri::AppHandle,
    session_id: String,
    expected_updated_at: String,
) -> CommandResult<ReportSessionMutationDto> {
    let session_id = parse_session_id(&session_id)?;
    let mut connection = app_database(&app_handle)?;
    delete_closed_session_if_expected(&mut connection, session_id, &expected_updated_at)
        .map(ReportSessionMutationDto::from)
        .map_err(map_session_error)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn command_identity_parsers_use_invalid_argument_code() {
        assert_eq!(parse_list_id("not-a-uuid").unwrap_err().code, "INVALID_ARGUMENT");
        assert_eq!(parse_task_id("not-a-uuid").unwrap_err().code, "INVALID_ARGUMENT");
        assert_eq!(
            parse_session_id("not-a-uuid").unwrap_err().code,
            "INVALID_ARGUMENT"
        );
    }

    #[test]
    fn reporting_range_errors_have_stable_renderer_codes() {
        assert_eq!(
            map_reporting_error(ReportingError::InvalidRangeTimestamp("start_at")).code,
            "INVALID_ARGUMENT"
        );
        assert_eq!(
            map_reporting_error(ReportingError::EmptyOrReversedRange).code,
            "INVALID_ARGUMENT"
        );
        assert_eq!(
            map_reporting_error(ReportingError::CorruptDuration(-1)).code,
            "REPORT_HISTORY_INVALID_STORED_DATA"
        );
    }

    #[test]
    fn report_session_mutation_errors_distinguish_live_stale_and_missing() {
        let id = SessionId::generate();
        assert_eq!(
            map_session_error(SessionStoreError::OpenSessionMutation(id)).code,
            "REPORT_SESSION_LIVE"
        );
        assert_eq!(
            map_session_error(SessionStoreError::StaleVersion {
                expected: "a".into(),
                actual: "b".into(),
            })
            .code,
            "REPORT_SESSION_STALE"
        );
        assert_eq!(
            map_session_error(SessionStoreError::NotFound(id)).code,
            "REPORT_SESSION_NOT_FOUND"
        );
    }
}
