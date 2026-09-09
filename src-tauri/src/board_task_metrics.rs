use crate::domain::ids::{ListId, TaskId};
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::task_estimate_edit::{
    update_non_live_task_estimate_if_expected, TaskEstimateEditError,
};
use crate::persistence::task_metadata::TaskMetadataError;
use crate::persistence::task_time_taken_edit::{
    set_non_live_task_time_taken_if_expected, TaskTimeTakenEditError,
};
use crate::persistence::tasks::TaskStoreError;
use rusqlite::Connection;
use std::path::PathBuf;
use tauri::Manager;

fn app_database(app_handle: &tauri::AppHandle) -> CommandResult<Connection> {
    let app_dir: PathBuf = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "TASK_METRIC_EDIT_FAILED",
            format!("failed to resolve Narro app-data directory for task metric editing: {error}"),
        )
    })?;
    let connection = Connection::open(app_dir.join("narro.db")).map_err(|error| {
        CommandError::new(
            "TASK_METRIC_EDIT_FAILED",
            format!("failed to open the Narro database for task metric editing: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "TASK_METRIC_EDIT_FAILED",
            format!("failed to configure the Narro database for task metric editing: {error}"),
        )
    })?;
    Ok(connection)
}

fn parse_list_id(argument: &str, raw: &str) -> CommandResult<ListId> {
    ListId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_task_id(argument: &str, raw: &str) -> CommandResult<TaskId> {
    TaskId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_expected_total(raw: &str) -> CommandResult<u64> {
    raw.parse::<u64>().map_err(|_| {
        CommandError::invalid_argument(
            "expectedTotalSeconds",
            "must be a non-negative whole-second decimal string",
        )
    })
}

fn map_estimate_error(error: TaskEstimateEditError) -> CommandError {
    match error {
        TaskEstimateEditError::Task(TaskStoreError::InvalidEstimate) => {
            CommandError::invalid_argument("estSeconds", "must be greater than zero when provided")
        }
        TaskEstimateEditError::ExpectedListMismatch { .. }
        | TaskEstimateEditError::ExpectedEstimateMismatch(_)
        | TaskEstimateEditError::StaleWrite(_)
        | TaskEstimateEditError::Task(TaskStoreError::NotFound(_))
        | TaskEstimateEditError::Task(TaskStoreError::ListNotFound(_))
        | TaskEstimateEditError::Task(TaskStoreError::ListArchived(_)) => {
            CommandError::new("TASK_ESTIMATE_EDIT_STALE", error.to_string())
        }
        TaskEstimateEditError::LiveTaskRequiresRuntimeBoundary(_) => {
            CommandError::new("TASK_ESTIMATE_EDIT_LIVE", error.to_string())
        }
        TaskEstimateEditError::Task(TaskStoreError::ArchivedTask(_)) => {
            CommandError::new("TASK_ESTIMATE_EDIT_NOT_ALLOWED", error.to_string())
        }
        _ => CommandError::new("TASK_ESTIMATE_EDIT_FAILED", error.to_string()),
    }
}

fn map_time_taken_error(error: TaskTimeTakenEditError) -> CommandError {
    match error {
        TaskTimeTakenEditError::ExpectedListMismatch { .. }
        | TaskTimeTakenEditError::ExpectedTimeTakenMismatch { .. }
        | TaskTimeTakenEditError::Task(TaskStoreError::NotFound(_))
        | TaskTimeTakenEditError::Task(TaskStoreError::ListNotFound(_))
        | TaskTimeTakenEditError::Task(TaskStoreError::ListArchived(_)) => {
            CommandError::new("TASK_TIME_TAKEN_EDIT_STALE", error.to_string())
        }
        TaskTimeTakenEditError::LiveTaskRequiresRuntimeBoundary(_) => {
            CommandError::new("TASK_TIME_TAKEN_EDIT_LIVE", error.to_string())
        }
        TaskTimeTakenEditError::Metadata(TaskMetadataError::ArchivedTask(_))
        | TaskTimeTakenEditError::Metadata(TaskMetadataError::ArchivedList(_))
        | TaskTimeTakenEditError::Task(TaskStoreError::ArchivedTask(_)) => {
            CommandError::new("TASK_TIME_TAKEN_EDIT_NOT_ALLOWED", error.to_string())
        }
        _ => CommandError::new("TASK_TIME_TAKEN_EDIT_FAILED", error.to_string()),
    }
}

#[tauri::command(rename_all = "camelCase")]
pub fn update_list_board_task_estimate(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    expected_est_seconds: Option<u32>,
    est_seconds: Option<u32>,
) -> CommandResult<()> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    if est_seconds == Some(0) {
        return Err(CommandError::invalid_argument(
            "estSeconds",
            "must be greater than zero when provided",
        ));
    }
    let mut connection = app_database(&app_handle)?;
    update_non_live_task_estimate_if_expected(
        &mut connection,
        task_id,
        list_id,
        expected_est_seconds,
        est_seconds,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(|_| ())
    .map_err(map_estimate_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn update_list_board_task_time_taken(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    expected_total_seconds: String,
    total_seconds: u32,
) -> CommandResult<()> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let expected_total_seconds = parse_expected_total(&expected_total_seconds)?;
    let mut connection = app_database(&app_handle)?;
    set_non_live_task_time_taken_if_expected(
        &mut connection,
        task_id,
        list_id,
        expected_total_seconds,
        total_seconds,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(|_| ())
    .map_err(map_time_taken_error)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn expected_time_taken_parser_rejects_negative_fractional_and_non_numeric_values() {
        for value in ["-1", "1.5", "abc", ""] {
            let error = parse_expected_total(value).expect_err("invalid total must fail");
            assert_eq!(error.code, "INVALID_ARGUMENT");
        }
        assert_eq!(parse_expected_total("0").unwrap(), 0);
        assert_eq!(
            parse_expected_total("18446744073709551615").unwrap(),
            u64::MAX
        );
    }
}
