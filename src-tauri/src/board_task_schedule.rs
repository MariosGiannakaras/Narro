use crate::domain::ids::{ListId, RecurrenceRuleId, TaskId};
use crate::domain::model::RecurrenceUnit;
use crate::domain::recurrence::{
    NewRecurrenceRuleInput, RecurrenceRuleRecord, UpdateRecurrenceRuleInput,
};
use crate::domain::tasks::{TaskRecord, TaskSchedule};
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::lists::get_list;
use crate::persistence::recurrence::{
    create_recurrence_rule, delete_recurrence_rule_if_expected, get_recurrence_rule,
    update_recurrence_rule_if_expected, RecurrenceStoreError,
};
use crate::persistence::recurrence_replace::{
    replace_existing_tasks_if_expected, ReplaceExistingError,
};
use crate::persistence::task_schedule_edit::{
    update_task_schedule_if_expected, TaskScheduleEditError,
};
use crate::persistence::tasks::{get_task, TaskStoreError};
use crate::recurrence::materialize_recurrence_week;
use crate::scheduling::{
    resolve_schedule_shortcut, validate_timezone_identifier, ScheduleShortcut,
};
use chrono::{Local, NaiveDate, NaiveDateTime, NaiveTime, Utc};
use jiff::{tz::TimeZone, Timestamp};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardRecurrenceRule {
    pub id: String,
    pub interval_count: u32,
    pub unit: RecurrenceUnit,
    pub weekday_mask: u8,
    pub month_day: Option<u8>,
    pub starts_local_date: String,
    pub local_time: Option<String>,
    pub timezone: Option<String>,
    pub replace_existing: bool,
    pub is_active: bool,
    pub updated_at: String,
}

impl From<RecurrenceRuleRecord> for BoardRecurrenceRule {
    fn from(value: RecurrenceRuleRecord) -> Self {
        Self {
            id: value.id.to_string(),
            interval_count: value.interval_count,
            unit: value.unit,
            weekday_mask: value.weekday_mask,
            month_day: value.month_day,
            starts_local_date: value.starts_local_date,
            local_time: value.local_time,
            timezone: value.timezone,
            replace_existing: value.replace_existing,
            is_active: value.is_active,
            updated_at: value.updated_at,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardTaskScheduleEditorSnapshot {
    pub task_id: String,
    pub list_id: String,
    pub schedule: TaskSchedule,
    pub recurrence_parent_task_id: Option<String>,
    pub recurrence: Option<BoardRecurrenceRule>,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardRecurrenceDraft {
    pub interval_count: u32,
    pub unit: RecurrenceUnit,
    pub weekday_mask: u8,
    pub month_day: Option<u8>,
    pub starts_local_date: String,
    pub local_time: Option<String>,
    pub timezone: Option<String>,
    pub replace_existing: bool,
}

impl BoardRecurrenceDraft {
    fn create_input(self, parent_task_id: TaskId) -> NewRecurrenceRuleInput {
        NewRecurrenceRuleInput {
            parent_task_id,
            interval_count: self.interval_count,
            unit: self.unit,
            weekday_mask: self.weekday_mask,
            month_day: self.month_day,
            starts_local_date: self.starts_local_date,
            local_time: self.local_time,
            timezone: self.timezone,
            replace_existing: self.replace_existing,
        }
    }

    fn update_input(self) -> UpdateRecurrenceRuleInput {
        UpdateRecurrenceRuleInput {
            interval_count: self.interval_count,
            unit: self.unit,
            weekday_mask: self.weekday_mask,
            month_day: self.month_day,
            starts_local_date: self.starts_local_date,
            local_time: self.local_time,
            timezone: self.timezone,
            replace_existing: self.replace_existing,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardRecurrenceMutationResult {
    pub materialization_warning: Option<String>,
}

fn app_database(app_handle: &tauri::AppHandle) -> CommandResult<Connection> {
    let app_dir: PathBuf = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "TASK_SCHEDULE_FAILED",
            format!("failed to resolve Narro app-data directory for task scheduling: {error}"),
        )
    })?;
    let connection = Connection::open(app_dir.join("narro.db")).map_err(|error| {
        CommandError::new(
            "TASK_SCHEDULE_FAILED",
            format!("failed to open the Narro database for task scheduling: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "TASK_SCHEDULE_FAILED",
            format!("failed to configure the Narro database for task scheduling: {error}"),
        )
    })?;
    Ok(connection)
}

fn parse_task_id(argument: &str, raw: &str) -> CommandResult<TaskId> {
    TaskId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_list_id(argument: &str, raw: &str) -> CommandResult<ListId> {
    ListId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_rule_id(argument: &str, raw: &str) -> CommandResult<RecurrenceRuleId> {
    RecurrenceRuleId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn task_schedule(task: &TaskRecord) -> CommandResult<TaskSchedule> {
    match task.schedule_kind.as_str() {
        "none" if task.scheduled_local_date.is_none()
            && task.scheduled_local_time.is_none()
            && task.schedule_timezone.is_none() => Ok(TaskSchedule::None),
        "date_only" if task.scheduled_local_time.is_none() && task.schedule_timezone.is_none() => {
            let local_date = task.scheduled_local_date.clone().ok_or_else(|| {
                CommandError::new("TASK_SCHEDULE_CORRUPT", "stored date-only schedule has no local date")
            })?;
            Ok(TaskSchedule::DateOnly { local_date })
        }
        "local_datetime" => {
            let local_date = task.scheduled_local_date.clone().ok_or_else(|| {
                CommandError::new("TASK_SCHEDULE_CORRUPT", "stored local schedule has no local date")
            })?;
            let local_time = task.scheduled_local_time.clone().ok_or_else(|| {
                CommandError::new("TASK_SCHEDULE_CORRUPT", "stored local schedule has no local time")
            })?;
            let timezone = task.schedule_timezone.clone().ok_or_else(|| {
                CommandError::new("TASK_SCHEDULE_CORRUPT", "stored local schedule has no timezone")
            })?;
            Ok(TaskSchedule::LocalDateTime {
                local_date,
                local_time,
                timezone,
            })
        }
        _ => Err(CommandError::new(
            "TASK_SCHEDULE_CORRUPT",
            "stored task schedule fields are inconsistent",
        )),
    }
}

fn validate_task_binding(
    connection: &Connection,
    task_id: TaskId,
    expected_list_id: ListId,
) -> CommandResult<TaskRecord> {
    let task = get_task(connection, task_id)
        .map_err(|error| CommandError::new("TASK_SCHEDULE_STALE", error.to_string()))?;
    if task.list_id != expected_list_id {
        return Err(CommandError::new(
            "TASK_SCHEDULE_STALE",
            format!(
                "task list changed before scheduling: expected {expected_list_id}, actual {}",
                task.list_id
            ),
        ));
    }
    if task.archived_at.is_some() || task.completed_at.is_some() {
        return Err(CommandError::new(
            "TASK_SCHEDULE_NOT_ALLOWED",
            "completed or archived tasks cannot be scheduled",
        ));
    }
    let list = get_list(connection, task.list_id)
        .map_err(|error| CommandError::new("TASK_SCHEDULE_STALE", error.to_string()))?;
    if list.archived_at.is_some() {
        return Err(CommandError::new(
            "TASK_SCHEDULE_NOT_ALLOWED",
            "tasks in archived lists cannot be scheduled",
        ));
    }
    Ok(task)
}

fn map_schedule_error(error: TaskScheduleEditError) -> CommandError {
    match error {
        TaskScheduleEditError::ExpectedListMismatch { .. }
        | TaskScheduleEditError::ExpectedScheduleMismatch(_)
        | TaskScheduleEditError::Task(TaskStoreError::NotFound(_)) => {
            CommandError::new("TASK_SCHEDULE_STALE", error.to_string())
        }
        TaskScheduleEditError::InvalidScheduleDate => {
            CommandError::invalid_argument("schedule.localDate", error.to_string())
        }
        TaskScheduleEditError::InvalidScheduleTime => {
            CommandError::invalid_argument("schedule.localTime", error.to_string())
        }
        TaskScheduleEditError::InvalidScheduleTimezone
        | TaskScheduleEditError::AmbiguousScheduleLocalDateTime
        | TaskScheduleEditError::ScheduleResolutionFailed => {
            CommandError::invalid_argument("schedule.timezone", error.to_string())
        }
        TaskScheduleEditError::ArchivedTask(_)
        | TaskScheduleEditError::CompletedTask(_)
        | TaskScheduleEditError::ArchivedList(_) => {
            CommandError::new("TASK_SCHEDULE_NOT_ALLOWED", error.to_string())
        }
        _ => CommandError::new("TASK_SCHEDULE_FAILED", error.to_string()),
    }
}

fn validate_recurrence_timezone(draft: &BoardRecurrenceDraft) -> CommandResult<()> {
    match (draft.local_time.as_deref(), draft.timezone.as_deref()) {
        (None, None) => Ok(()),
        (Some(_), Some(timezone)) => validate_timezone_identifier(timezone)
            .map(|_| ())
            .map_err(|error| CommandError::invalid_argument("recurrence.timezone", error.to_string())),
        _ => Err(CommandError::invalid_argument(
            "recurrence.timezone",
            "recurrence local time and timezone must both be provided or both be omitted",
        )),
    }
}

fn map_recurrence_error(error: RecurrenceStoreError) -> CommandError {
    match error {
        RecurrenceStoreError::InvalidInterval
        | RecurrenceStoreError::InvalidWeekdayMask
        | RecurrenceStoreError::InvalidMonthDay
        | RecurrenceStoreError::InvalidPattern
        | RecurrenceStoreError::InvalidStartDate
        | RecurrenceStoreError::InvalidLocalTime
        | RecurrenceStoreError::InvalidTimezone
        | RecurrenceStoreError::InvalidTimeTimezoneShape => {
            CommandError::invalid_argument("recurrence", error.to_string())
        }
        RecurrenceStoreError::NotFound(_)
        | RecurrenceStoreError::ExpectedVersionMismatch(_)
        | RecurrenceStoreError::ParentLinkMismatch(_)
        | RecurrenceStoreError::Task(TaskStoreError::NotFound(_)) => {
            CommandError::new("TASK_RECURRENCE_STALE", error.to_string())
        }
        RecurrenceStoreError::ParentArchived(_)
        | RecurrenceStoreError::ParentCompleted(_)
        | RecurrenceStoreError::ParentListArchived(_) => {
            CommandError::new("TASK_RECURRENCE_NOT_ALLOWED", error.to_string())
        }
        RecurrenceStoreError::AlreadyExists(_) => {
            CommandError::new("TASK_RECURRENCE_STALE", error.to_string())
        }
        _ => CommandError::new("TASK_RECURRENCE_FAILED", error.to_string()),
    }
}

fn map_replace_existing_error(error: ReplaceExistingError) -> CommandError {
    match error {
        ReplaceExistingError::Store(error) => map_recurrence_error(error),
        other => CommandError::new("TASK_RECURRENCE_FAILED", other.to_string()),
    }
}

fn current_local_date_for_rule(rule: &RecurrenceRuleRecord) -> Result<String, String> {
    match (rule.local_time.as_deref(), rule.timezone.as_deref()) {
        (None, None) => Ok(Local::now().date_naive().format("%Y-%m-%d").to_string()),
        (Some(_), Some(timezone)) => {
            let zone = TimeZone::get(timezone).map_err(|error| error.to_string())?;
            Ok(zone.to_datetime(Timestamp::now()).date().to_string())
        }
        _ => Err("recurrence local time/timezone shape is inconsistent".to_owned()),
    }
}

fn materialize_after_commit(
    connection: &mut Connection,
    rule: &RecurrenceRuleRecord,
) -> Option<String> {
    let current_local_date = match current_local_date_for_rule(rule) {
        Ok(value) => value,
        Err(error) => return Some(error),
    };
    let now = Utc::now().to_rfc3339();
    materialize_recurrence_week(connection, rule.id, &current_local_date, &now)
        .err()
        .map(|error| error.to_string())
}

fn local_now(timezone: &str) -> CommandResult<NaiveDateTime> {
    let timezone = validate_timezone_identifier(timezone)
        .map_err(|error| CommandError::invalid_argument("timezone", error.to_string()))?;
    let zone = TimeZone::get(&timezone)
        .map_err(|error| CommandError::invalid_argument("timezone", error.to_string()))?;
    let local = zone.to_datetime(Timestamp::now());
    let date_text = local.date().to_string();
    let time_text = local.time().to_string();
    let date = NaiveDate::parse_from_str(&date_text, "%Y-%m-%d")
        .map_err(|_| CommandError::new("TASK_SCHEDULE_FAILED", "could not resolve local schedule date"))?;
    let minute_text = time_text.get(0..5).ok_or_else(|| {
        CommandError::new("TASK_SCHEDULE_FAILED", "could not resolve local schedule time")
    })?;
    let time = NaiveTime::parse_from_str(minute_text, "%H:%M")
        .map_err(|_| CommandError::new("TASK_SCHEDULE_FAILED", "could not resolve local schedule time"))?;
    Ok(date.and_time(time))
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_list_board_task_schedule_editor(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
) -> CommandResult<BoardTaskScheduleEditorSnapshot> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let connection = app_database(&app_handle)?;
    let task = validate_task_binding(&connection, task_id, list_id)?;
    let recurrence = match task.recurrence_rule_id {
        Some(rule_id) => Some(
            get_recurrence_rule(&connection, rule_id)
                .map_err(map_recurrence_error)?
                .into(),
        ),
        None => None,
    };
    Ok(BoardTaskScheduleEditorSnapshot {
        task_id: task.id.to_string(),
        list_id: task.list_id.to_string(),
        schedule: task_schedule(&task)?,
        recurrence_parent_task_id: task.recurrence_parent_task_id.map(|id| id.to_string()),
        recurrence,
    })
}

#[tauri::command(rename_all = "camelCase")]
pub fn resolve_list_board_schedule_shortcut(
    shortcut: ScheduleShortcut,
    timezone: String,
) -> CommandResult<TaskSchedule> {
    let now_local = local_now(&timezone)?;
    resolve_schedule_shortcut(shortcut, now_local, &timezone)
        .map_err(|error| CommandError::invalid_argument("shortcut", error.to_string()))
}

#[tauri::command(rename_all = "camelCase")]
pub fn update_list_board_task_schedule(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    expected_schedule: TaskSchedule,
    schedule: TaskSchedule,
) -> CommandResult<()> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let mut connection = app_database(&app_handle)?;
    update_task_schedule_if_expected(
        &mut connection,
        task_id,
        list_id,
        expected_schedule,
        schedule,
        &Utc::now().to_rfc3339(),
    )
    .map(|_| ())
    .map_err(map_schedule_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn save_list_board_task_recurrence(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    expected_rule_id: Option<String>,
    expected_rule_updated_at: Option<String>,
    recurrence: BoardRecurrenceDraft,
) -> CommandResult<BoardRecurrenceMutationResult> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    validate_recurrence_timezone(&recurrence)?;
    let mut connection = app_database(&app_handle)?;
    let task = validate_task_binding(&connection, task_id, list_id)?;

    if task.recurrence_parent_task_id.is_some() {
        return Err(CommandError::new(
            "TASK_RECURRENCE_NOT_ALLOWED",
            "generated recurrence occurrences cannot become nested recurrence parents",
        ));
    }

    let current_rule_id = task.recurrence_rule_id;
    let expected_rule_id = expected_rule_id
        .as_deref()
        .map(|raw| parse_rule_id("expectedRuleId", raw))
        .transpose()?;
    if current_rule_id != expected_rule_id {
        return Err(CommandError::new(
            "TASK_RECURRENCE_STALE",
            "task recurrence changed before the edit committed",
        ));
    }

    let rule = match expected_rule_id {
        None => {
            if expected_rule_updated_at.is_some() {
                return Err(CommandError::invalid_argument(
                    "expectedRuleUpdatedAt",
                    "must be null when creating recurrence",
                ));
            }
            create_recurrence_rule(
                &mut connection,
                recurrence.create_input(task_id),
                &Utc::now().to_rfc3339(),
            )
            .map_err(map_recurrence_error)?
        }
        Some(rule_id) => {
            let expected_updated_at = expected_rule_updated_at.as_deref().ok_or_else(|| {
                CommandError::invalid_argument(
                    "expectedRuleUpdatedAt",
                    "must be provided when updating recurrence",
                )
            })?;
            let current = get_recurrence_rule(&connection, rule_id).map_err(map_recurrence_error)?;
            if current.parent_task_id != task_id || current.updated_at != expected_updated_at {
                return Err(CommandError::new(
                    "TASK_RECURRENCE_STALE",
                    "recurrence rule changed before the edit committed",
                ));
            }
            let input = recurrence.update_input();
            if input.replace_existing {
                replace_existing_tasks_if_expected(
                    &mut connection,
                    rule_id,
                    expected_updated_at,
                    input,
                    &Utc::now().to_rfc3339(),
                )
                .map(|report| report.updated_rule)
                .map_err(map_replace_existing_error)?
            } else {
                update_recurrence_rule_if_expected(
                    &mut connection,
                    rule_id,
                    expected_updated_at,
                    input,
                    &Utc::now().to_rfc3339(),
                )
                .map_err(map_recurrence_error)?
            }
        }
    };

    let warning = materialize_after_commit(&mut connection, &rule);
    Ok(BoardRecurrenceMutationResult {
        materialization_warning: warning,
    })
}

#[tauri::command(rename_all = "camelCase")]
pub fn remove_list_board_task_recurrence(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    expected_rule_id: String,
    expected_rule_updated_at: String,
) -> CommandResult<()> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let rule_id = parse_rule_id("expectedRuleId", &expected_rule_id)?;
    let mut connection = app_database(&app_handle)?;
    let task = validate_task_binding(&connection, task_id, list_id)?;
    if task.recurrence_rule_id != Some(rule_id) {
        return Err(CommandError::new(
            "TASK_RECURRENCE_STALE",
            "task recurrence changed before removal",
        ));
    }
    let rule = get_recurrence_rule(&connection, rule_id).map_err(map_recurrence_error)?;
    if rule.parent_task_id != task_id || rule.updated_at != expected_rule_updated_at {
        return Err(CommandError::new(
            "TASK_RECURRENCE_STALE",
            "recurrence rule changed before removal",
        ));
    }
    delete_recurrence_rule_if_expected(
        &mut connection,
        rule_id,
        &expected_rule_updated_at,
        &Utc::now().to_rfc3339(),
    )
    .map_err(map_recurrence_error)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::create_task;

    const T0: &str = "2026-09-09T16:00:00Z";

    fn fixture() -> (Connection, ListId, TaskId) {
        let mut conn = Connection::open_in_memory().unwrap();
        run_migrations(&mut conn).unwrap();
        let list = create_list(
            &mut conn,
            NewListInput {
                title: "Work".into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .unwrap();
        let task = create_task(
            &mut conn,
            NewTaskInput {
                list_id: list.id,
                title: "Schedule me".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T0,
        )
        .unwrap();
        (conn, list.id, task.id)
    }

    #[test]
    fn editor_snapshot_rejects_stale_list_binding() {
        let (conn, _list_id, task_id) = fixture();
        let stale = validate_task_binding(&conn, task_id, ListId::generate()).unwrap_err();
        assert_eq!(stale.code, "TASK_SCHEDULE_STALE");
    }

    #[test]
    fn recurrence_timezone_validation_reuses_known_iana_boundary() {
        let valid = BoardRecurrenceDraft {
            interval_count: 1,
            unit: RecurrenceUnit::Week,
            weekday_mask: 1,
            month_day: None,
            starts_local_date: "2026-09-14".into(),
            local_time: Some("09:00".into()),
            timezone: Some("Europe/Athens".into()),
            replace_existing: false,
        };
        validate_recurrence_timezone(&valid).unwrap();

        let invalid = BoardRecurrenceDraft {
            timezone: Some("Not/AZone".into()),
            ..valid
        };
        assert!(validate_recurrence_timezone(&invalid).is_err());
    }
}
