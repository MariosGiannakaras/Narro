use crate::domain::ids::{ListId, TaskId};
use crate::domain::model::ScheduleKind;
use crate::domain::tasks::{TaskRecord, TaskSchedule};
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::preferences::{get_preferences, PreferenceStoreError};
use crate::persistence::tasks::{compact_bucket_ranks, get_task, next_bucket_rank, TaskStoreError};
use crate::scheduling::{
    resolve_local_datetime_strict, validate_timezone_identifier, SchedulingError,
};
use chrono::{DateTime, NaiveDate, NaiveTime};
use rusqlite::{params, Connection, TransactionBehavior};
use serde::Deserialize;
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum TaskScheduleEditError {
    Sqlite(rusqlite::Error),
    Task(TaskStoreError),
    List(ListStoreError),
    InvalidTimestamp,
    ArchivedTask(TaskId),
    CompletedTask(TaskId),
    ArchivedList(ListId),
    ExpectedListMismatch { expected: ListId, actual: ListId },
    ExpectedScheduleMismatch(TaskId),
    ExpectedTaskVersionMismatch(TaskId),
    ExpectedRecurrenceMismatch(TaskId),
    RecurrenceParent(TaskId),
    Preferences(PreferenceStoreError),
    Scheduling(SchedulingError),
    InvalidScheduleDate,
    InvalidScheduleTime,
    InvalidScheduleTimezone,
    AmbiguousScheduleLocalDateTime,
    ScheduleResolutionFailed,
}

impl Display for TaskScheduleEditError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "task schedule persistence failed: {error}"),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::InvalidTimestamp => formatter.write_str("task schedule mutation timestamp must be RFC 3339"),
            Self::ArchivedTask(id) => write!(formatter, "task is archived: {id}"),
            Self::CompletedTask(id) => write!(formatter, "task is completed: {id}"),
            Self::ArchivedList(id) => write!(formatter, "task list is archived: {id}"),
            Self::ExpectedListMismatch { expected, actual } => write!(
                formatter,
                "task list changed before the schedule edit committed: expected {expected}, actual {actual}"
            ),
            Self::ExpectedScheduleMismatch(id) => {
                write!(formatter, "task schedule changed before the edit committed: {id}")
            }
            Self::ExpectedTaskVersionMismatch(id) => write!(formatter, "task changed before quick schedule removal committed: {id}"),
            Self::ExpectedRecurrenceMismatch(id) => write!(formatter, "task recurrence changed before quick schedule removal committed: {id}"),
            Self::RecurrenceParent(id) => write!(formatter, "recurring parent cannot use quick schedule removal: {id}"),
            Self::Preferences(error) => Display::fmt(error, formatter),
            Self::Scheduling(error) => Display::fmt(error, formatter),
            Self::InvalidScheduleDate => formatter.write_str("scheduled local date must use YYYY-MM-DD"),
            Self::InvalidScheduleTime => formatter.write_str("scheduled local time must use 24-hour HH:MM"),
            Self::InvalidScheduleTimezone => formatter.write_str("scheduled timezone must be a known IANA timezone identifier"),
            Self::AmbiguousScheduleLocalDateTime => formatter.write_str(
                "scheduled local datetime is ambiguous or nonexistent in the selected timezone",
            ),
            Self::ScheduleResolutionFailed => formatter.write_str("scheduled local datetime could not be resolved"),
        }
    }
}

impl std::error::Error for TaskScheduleEditError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            Self::Preferences(error) => Some(error),
            Self::Scheduling(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for TaskScheduleEditError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<TaskStoreError> for TaskScheduleEditError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for TaskScheduleEditError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct NormalizedSchedule {
    kind: ScheduleKind,
    local_date: Option<String>,
    local_time: Option<String>,
    timezone: Option<String>,
}

fn validate_timestamp(value: &str) -> Result<(), TaskScheduleEditError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| TaskScheduleEditError::InvalidTimestamp)
}

fn normalize_local_date(value: &str) -> Result<String, TaskScheduleEditError> {
    let parsed = NaiveDate::parse_from_str(value.trim(), "%Y-%m-%d")
        .map_err(|_| TaskScheduleEditError::InvalidScheduleDate)?;
    Ok(parsed.format("%Y-%m-%d").to_string())
}

fn normalize_local_time(value: &str) -> Result<String, TaskScheduleEditError> {
    let parsed = NaiveTime::parse_from_str(value.trim(), "%H:%M")
        .map_err(|_| TaskScheduleEditError::InvalidScheduleTime)?;
    Ok(parsed.format("%H:%M").to_string())
}

fn normalize_timezone(value: &str) -> Result<String, TaskScheduleEditError> {
    validate_timezone_identifier(value).map_err(|_| TaskScheduleEditError::InvalidScheduleTimezone)
}

fn validate_resolvable_local_datetime(
    local_date: &str,
    local_time: &str,
    timezone: &str,
) -> Result<(), TaskScheduleEditError> {
    let date = NaiveDate::parse_from_str(local_date, "%Y-%m-%d")
        .map_err(|_| TaskScheduleEditError::InvalidScheduleDate)?;
    let time = NaiveTime::parse_from_str(local_time, "%H:%M")
        .map_err(|_| TaskScheduleEditError::InvalidScheduleTime)?;
    resolve_local_datetime_strict(date, time, timezone)
        .map(|_| ())
        .map_err(|error| match error {
            SchedulingError::InvalidTimezone(_) => TaskScheduleEditError::InvalidScheduleTimezone,
            SchedulingError::AmbiguousLocalDateTime { .. } => {
                TaskScheduleEditError::AmbiguousScheduleLocalDateTime
            }
            SchedulingError::InvalidLocalDate(_) => TaskScheduleEditError::InvalidScheduleDate,
            SchedulingError::InvalidLocalTime(_) => TaskScheduleEditError::InvalidScheduleTime,
            _ => TaskScheduleEditError::ScheduleResolutionFailed,
        })
}

fn normalize_schedule(schedule: TaskSchedule) -> Result<NormalizedSchedule, TaskScheduleEditError> {
    match schedule {
        TaskSchedule::None => Ok(NormalizedSchedule {
            kind: ScheduleKind::None,
            local_date: None,
            local_time: None,
            timezone: None,
        }),
        TaskSchedule::DateOnly { local_date } => Ok(NormalizedSchedule {
            kind: ScheduleKind::DateOnly,
            local_date: Some(normalize_local_date(&local_date)?),
            local_time: None,
            timezone: None,
        }),
        TaskSchedule::LocalDateTime {
            local_date,
            local_time,
            timezone,
        } => {
            let local_date = normalize_local_date(&local_date)?;
            let local_time = normalize_local_time(&local_time)?;
            let timezone = normalize_timezone(&timezone)?;
            validate_resolvable_local_datetime(&local_date, &local_time, &timezone)?;
            Ok(NormalizedSchedule {
                kind: ScheduleKind::LocalDateTime,
                local_date: Some(local_date),
                local_time: Some(local_time),
                timezone: Some(timezone),
            })
        }
    }
}

fn normalized_schedule_from_task(
    task: &TaskRecord,
) -> Result<NormalizedSchedule, TaskScheduleEditError> {
    match task.schedule_kind {
        ScheduleKind::None => {
            if task.scheduled_local_date.is_some()
                || task.scheduled_local_time.is_some()
                || task.schedule_timezone.is_some()
            {
                return Err(TaskScheduleEditError::ExpectedScheduleMismatch(task.id));
            }
            Ok(NormalizedSchedule {
                kind: ScheduleKind::None,
                local_date: None,
                local_time: None,
                timezone: None,
            })
        }
        ScheduleKind::DateOnly => {
            let local_date = task
                .scheduled_local_date
                .as_deref()
                .ok_or(TaskScheduleEditError::ExpectedScheduleMismatch(task.id))?;
            if task.scheduled_local_time.is_some() || task.schedule_timezone.is_some() {
                return Err(TaskScheduleEditError::ExpectedScheduleMismatch(task.id));
            }
            Ok(NormalizedSchedule {
                kind: ScheduleKind::DateOnly,
                local_date: Some(normalize_local_date(local_date)?),
                local_time: None,
                timezone: None,
            })
        }
        ScheduleKind::LocalDateTime => {
            let local_date = task
                .scheduled_local_date
                .as_deref()
                .ok_or(TaskScheduleEditError::ExpectedScheduleMismatch(task.id))?;
            let local_time = task
                .scheduled_local_time
                .as_deref()
                .ok_or(TaskScheduleEditError::ExpectedScheduleMismatch(task.id))?;
            let timezone = task
                .schedule_timezone
                .as_deref()
                .ok_or(TaskScheduleEditError::ExpectedScheduleMismatch(task.id))?;
            Ok(NormalizedSchedule {
                kind: ScheduleKind::LocalDateTime,
                local_date: Some(normalize_local_date(local_date)?),
                local_time: Some(normalize_local_time(local_time)?),
                timezone: Some(normalize_timezone(timezone)?),
            })
        }
    }
}

fn validate_task_context(
    conn: &Connection,
    task_id: TaskId,
    expected_list_id: ListId,
) -> Result<TaskRecord, TaskScheduleEditError> {
    let task = get_task(conn, task_id)?;
    if task.archived_at.is_some() {
        return Err(TaskScheduleEditError::ArchivedTask(task_id));
    }
    if task.completed_at.is_some() {
        return Err(TaskScheduleEditError::CompletedTask(task_id));
    }
    if task.list_id != expected_list_id {
        return Err(TaskScheduleEditError::ExpectedListMismatch {
            expected: expected_list_id,
            actual: task.list_id,
        });
    }
    let list = get_list(conn, task.list_id)?;
    if list.archived_at.is_some() {
        return Err(TaskScheduleEditError::ArchivedList(task.list_id));
    }
    Ok(task)
}

pub fn update_task_schedule_if_expected(
    conn: &mut Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    expected_schedule: TaskSchedule,
    schedule: TaskSchedule,
    now: &str,
) -> Result<TaskRecord, TaskScheduleEditError> {
    validate_timestamp(now)?;
    let expected_schedule = normalize_schedule(expected_schedule)?;
    let schedule = normalize_schedule(schedule)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = validate_task_context(&tx, task_id, expected_list_id)?;
    if normalized_schedule_from_task(&current)? != expected_schedule {
        return Err(TaskScheduleEditError::ExpectedScheduleMismatch(task_id));
    }

    let changed = tx.execute(
        "UPDATE tasks
         SET schedule_kind = ?1,
             scheduled_local_date = ?2,
             scheduled_local_time = ?3,
             schedule_timezone = ?4,
             updated_at = ?5
         WHERE id = ?6
           AND list_id = ?7
           AND completed_at IS NULL
           AND archived_at IS NULL",
        params![
            schedule.kind.as_str(),
            schedule.local_date,
            schedule.local_time,
            schedule.timezone,
            now,
            task_id.to_string(),
            expected_list_id.to_string(),
        ],
    )?;
    if changed != 1 {
        return Err(TaskScheduleEditError::ExpectedScheduleMismatch(task_id));
    }

    let updated = get_task(&tx, task_id)?;
    tx.commit()?;
    Ok(updated)
}

/// Quick-X keeps the task in its authoritative visible lane. Generic date
/// editing retains its separate manual-lane contract.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuickClearTaskScheduleRequest {
    pub task_id: TaskId,
    pub list_id: ListId,
    pub expected_schedule: TaskSchedule,
    pub expected_updated_at: String,
    pub expected_recurrence_parent_task_id: Option<TaskId>,
    pub fallback_display_timezone: String,
}

pub fn quick_clear_task_schedule_if_expected(
    conn: &mut Connection,
    request: QuickClearTaskScheduleRequest,
    now: &str,
) -> Result<TaskRecord, TaskScheduleEditError> {
    validate_timestamp(now)?;
    let instant = now
        .parse()
        .map_err(|_| TaskScheduleEditError::InvalidTimestamp)?;
    let expected = normalize_schedule(request.expected_schedule)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = validate_task_context(&tx, request.task_id, request.list_id)?;
    if expected.kind == ScheduleKind::None || normalized_schedule_from_task(&current)? != expected {
        return Err(TaskScheduleEditError::ExpectedScheduleMismatch(current.id));
    }
    if current.updated_at != request.expected_updated_at {
        return Err(TaskScheduleEditError::ExpectedTaskVersionMismatch(
            current.id,
        ));
    }
    if current.recurrence_rule_id.is_some() {
        return Err(TaskScheduleEditError::RecurrenceParent(current.id));
    }
    if current.recurrence_parent_task_id != request.expected_recurrence_parent_task_id {
        return Err(TaskScheduleEditError::ExpectedRecurrenceMismatch(
            current.id,
        ));
    }
    let has_open_session: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM sessions WHERE task_id = ?1 AND ended_at IS NULL)",
        [current.id.to_string()],
        |row| row.get(0),
    )?;
    if has_open_session {
        return Err(TaskStoreError::ActiveSession(current.id).into());
    }
    // Preference, task and rank decisions belong to the same writer snapshot.
    let selected = get_preferences(&tx)
        .map_err(TaskScheduleEditError::Preferences)?
        .and_then(|record| record.payload.general.timezone)
        .filter(|value| !value.trim().is_empty());
    let timezone = selected
        .as_deref()
        .unwrap_or(&request.fallback_display_timezone);
    let lane = crate::scheduling::effective_planning_lane_at(&current, instant, timezone)
        .map_err(TaskScheduleEditError::Scheduling)?;
    let changed_lane = lane != current.manual_lane;
    let rank = if changed_lane {
        next_bucket_rank(&tx, current.list_id, lane)?
    } else {
        i64::from(current.sort_rank)
    };
    let changed = tx.execute(
        "UPDATE tasks SET schedule_kind = 'none', scheduled_local_date = NULL,
             scheduled_local_time = NULL, schedule_timezone = NULL,
             manual_lane = ?1, sort_rank = ?2, updated_at = ?3
         WHERE id = ?4 AND list_id = ?5 AND completed_at IS NULL AND archived_at IS NULL",
        params![
            lane.as_str(),
            rank,
            now,
            current.id.to_string(),
            current.list_id.to_string()
        ],
    )?;
    if changed != 1 {
        return Err(TaskScheduleEditError::ExpectedTaskVersionMismatch(
            current.id,
        ));
    }
    if changed_lane {
        compact_bucket_ranks(&tx, current.list_id, current.manual_lane, now)?;
    }
    let updated = get_task(&tx, current.id)?;
    tx.commit()?;
    Ok(updated)
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
    const T1: &str = "2026-09-09T16:01:00Z";

    fn fixture() -> (Connection, ListId, TaskId) {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let list = create_list(
            &mut conn,
            NewListInput {
                title: "Work".into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list");
        let task = create_task(
            &mut conn,
            NewTaskInput {
                list_id: list.id,
                title: "Schedule target".into(),
                manual_lane: PlanningLane::Backlog,
                est_seconds: Some(900),
            },
            T0,
        )
        .expect("create task");
        (conn, list.id, task.id)
    }

    #[test]
    fn date_only_schedule_preserves_identity_lane_and_non_schedule_metadata() {
        let (mut conn, list_id, task_id) = fixture();
        let before = get_task(&conn, task_id).unwrap();
        let updated = update_task_schedule_if_expected(
            &mut conn,
            task_id,
            list_id,
            TaskSchedule::None,
            TaskSchedule::DateOnly {
                local_date: "2026-09-12".into(),
            },
            T1,
        )
        .expect("set date-only schedule");

        assert_eq!(updated.id, before.id);
        assert_eq!(updated.list_id, before.list_id);
        assert_eq!(updated.manual_lane, before.manual_lane);
        assert_eq!(updated.title, before.title);
        assert_eq!(updated.est_seconds, before.est_seconds);
        assert_eq!(
            updated.manual_time_adjustment_seconds,
            before.manual_time_adjustment_seconds
        );
        assert_eq!(updated.schedule_kind, ScheduleKind::DateOnly);
        assert_eq!(updated.scheduled_local_date.as_deref(), Some("2026-09-12"));
        assert!(updated.scheduled_local_time.is_none());
        assert!(updated.schedule_timezone.is_none());
    }

    #[test]
    fn stale_schedule_cannot_overwrite_newer_schedule() {
        let (mut conn, list_id, task_id) = fixture();
        update_task_schedule_if_expected(
            &mut conn,
            task_id,
            list_id,
            TaskSchedule::None,
            TaskSchedule::DateOnly {
                local_date: "2026-09-10".into(),
            },
            T1,
        )
        .unwrap();

        let stale = update_task_schedule_if_expected(
            &mut conn,
            task_id,
            list_id,
            TaskSchedule::None,
            TaskSchedule::DateOnly {
                local_date: "2026-09-11".into(),
            },
            T1,
        );
        assert!(matches!(
            stale,
            Err(TaskScheduleEditError::ExpectedScheduleMismatch(id)) if id == task_id
        ));
        assert_eq!(
            get_task(&conn, task_id)
                .unwrap()
                .scheduled_local_date
                .as_deref(),
            Some("2026-09-10")
        );
    }

    #[test]
    fn ambiguous_or_nonexistent_local_time_is_rejected_before_write() {
        let (mut conn, list_id, task_id) = fixture();
        let result = update_task_schedule_if_expected(
            &mut conn,
            task_id,
            list_id,
            TaskSchedule::None,
            TaskSchedule::LocalDateTime {
                local_date: "2026-03-29".into(),
                local_time: "03:30".into(),
                timezone: "Europe/Athens".into(),
            },
            T1,
        );
        assert!(matches!(
            result,
            Err(TaskScheduleEditError::AmbiguousScheduleLocalDateTime)
        ));
        assert_eq!(
            get_task(&conn, task_id).unwrap().schedule_kind,
            ScheduleKind::None
        );
    }
}
