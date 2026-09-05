use crate::domain::ids::{ListId, TaskId};
use crate::domain::model::ScheduleKind;
use crate::domain::tasks::{SetTaskTimeTakenInput, TaskRecord, TaskSchedule};
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use crate::scheduling::{resolve_local_datetime_strict, validate_timezone_identifier, SchedulingError};
use chrono::{DateTime, NaiveDate, NaiveTime};
use rusqlite::{params, Connection, TransactionBehavior};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum TaskMetadataError {
    Sqlite(rusqlite::Error),
    Task(TaskStoreError),
    List(ListStoreError),
    InvalidTimestamp,
    ArchivedTask(TaskId),
    CompletedTask(TaskId),
    ArchivedList(ListId),
    LiveTaskRequiresRuntimeBoundary(TaskId),
    InvalidScheduleDate,
    InvalidScheduleTime,
    InvalidScheduleTimezone,
    AmbiguousScheduleLocalDateTime,
    ScheduleResolutionFailed,
    InvalidStoredTimeTaken(i64),
    TimeTakenOverflow,
}

impl Display for TaskMetadataError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "task metadata persistence failed: {error}"),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::InvalidTimestamp => {
                formatter.write_str("task metadata mutation timestamp must be RFC 3339")
            }
            Self::ArchivedTask(id) => write!(formatter, "task is archived: {id}"),
            Self::CompletedTask(id) => write!(formatter, "task is completed: {id}"),
            Self::ArchivedList(id) => write!(formatter, "task list is archived: {id}"),
            Self::LiveTaskRequiresRuntimeBoundary(id) => write!(
                formatter,
                "live task Time Taken must be edited through the paused timer runtime boundary: {id}"
            ),
            Self::InvalidScheduleDate => {
                formatter.write_str("scheduled local date must use YYYY-MM-DD")
            }
            Self::InvalidScheduleTime => {
                formatter.write_str("scheduled local time must use 24-hour HH:MM")
            }
            Self::InvalidScheduleTimezone => {
                formatter.write_str("scheduled timezone must be a known IANA timezone identifier")
            }
            Self::AmbiguousScheduleLocalDateTime => formatter.write_str(
                "scheduled local datetime is ambiguous or nonexistent in the selected timezone",
            ),
            Self::ScheduleResolutionFailed => {
                formatter.write_str("scheduled local datetime could not be resolved")
            }
            Self::InvalidStoredTimeTaken(value) => {
                write!(formatter, "stored task Time Taken is invalid: {value}")
            }
            Self::TimeTakenOverflow => formatter.write_str("task Time Taken arithmetic overflow"),
        }
    }
}

impl std::error::Error for TaskMetadataError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for TaskMetadataError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<TaskStoreError> for TaskMetadataError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for TaskMetadataError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

#[derive(Debug)]
struct NormalizedSchedule {
    kind: ScheduleKind,
    local_date: Option<String>,
    local_time: Option<String>,
    timezone: Option<String>,
}

fn validate_timestamp(value: &str) -> Result<(), TaskMetadataError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| TaskMetadataError::InvalidTimestamp)
}

fn normalize_local_date(value: &str) -> Result<String, TaskMetadataError> {
    let value = value.trim();
    let parsed = NaiveDate::parse_from_str(value, "%Y-%m-%d")
        .map_err(|_| TaskMetadataError::InvalidScheduleDate)?;
    Ok(parsed.format("%Y-%m-%d").to_string())
}

fn normalize_local_time(value: &str) -> Result<String, TaskMetadataError> {
    let value = value.trim();
    let parsed = NaiveTime::parse_from_str(value, "%H:%M")
        .map_err(|_| TaskMetadataError::InvalidScheduleTime)?;
    Ok(parsed.format("%H:%M").to_string())
}

fn normalize_timezone(value: &str) -> Result<String, TaskMetadataError> {
    validate_timezone_identifier(value).map_err(|_| TaskMetadataError::InvalidScheduleTimezone)
}

fn validate_resolvable_local_datetime(
    local_date: &str,
    local_time: &str,
    timezone: &str,
) -> Result<(), TaskMetadataError> {
    let date = NaiveDate::parse_from_str(local_date, "%Y-%m-%d")
        .map_err(|_| TaskMetadataError::InvalidScheduleDate)?;
    let time = NaiveTime::parse_from_str(local_time, "%H:%M")
        .map_err(|_| TaskMetadataError::InvalidScheduleTime)?;
    resolve_local_datetime_strict(date, time, timezone)
        .map(|_| ())
        .map_err(|error| match error {
            SchedulingError::InvalidTimezone(_) => TaskMetadataError::InvalidScheduleTimezone,
            SchedulingError::AmbiguousLocalDateTime { .. } => {
                TaskMetadataError::AmbiguousScheduleLocalDateTime
            }
            SchedulingError::InvalidLocalDate(_) => TaskMetadataError::InvalidScheduleDate,
            SchedulingError::InvalidLocalTime(_) => TaskMetadataError::InvalidScheduleTime,
            _ => TaskMetadataError::ScheduleResolutionFailed,
        })
}

fn normalize_schedule(schedule: TaskSchedule) -> Result<NormalizedSchedule, TaskMetadataError> {
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

fn validate_task_context(
    conn: &Connection,
    id: TaskId,
    allow_completed: bool,
) -> Result<TaskRecord, TaskMetadataError> {
    let task = get_task(conn, id)?;
    if task.archived_at.is_some() {
        return Err(TaskMetadataError::ArchivedTask(id));
    }
    if !allow_completed && task.completed_at.is_some() {
        return Err(TaskMetadataError::CompletedTask(id));
    }

    let list = get_list(conn, task.list_id)?;
    if list.archived_at.is_some() {
        return Err(TaskMetadataError::ArchivedList(task.list_id));
    }
    Ok(task)
}

fn persisted_work_seconds(conn: &Connection, id: TaskId) -> Result<i64, TaskMetadataError> {
    let total: i64 = conn.query_row(
        "SELECT COALESCE(SUM(duration_seconds), 0)
         FROM sessions
         WHERE task_id = ?1 AND kind = 'work'",
        [id.to_string()],
        |row| row.get(0),
    )?;
    if total < 0 {
        return Err(TaskMetadataError::InvalidStoredTimeTaken(total));
    }
    Ok(total)
}

pub fn set_task_est(
    conn: &mut Connection,
    id: TaskId,
    est_seconds: Option<u32>,
    now: &str,
) -> Result<TaskRecord, TaskMetadataError> {
    validate_timestamp(now)?;
    validate_task_context(conn, id, false)?;
    conn.execute(
        "UPDATE tasks SET est_seconds = ?1, updated_at = ?2 WHERE id = ?3",
        params![est_seconds.map(i64::from), now, id.to_string()],
    )?;
    get_task(conn, id).map_err(Into::into)
}

pub fn set_task_time_taken(
    conn: &mut Connection,
    id: TaskId,
    input: SetTaskTimeTakenInput,
    now: &str,
) -> Result<TaskRecord, TaskMetadataError> {
    validate_timestamp(now)?;
    validate_task_context(conn, id, false)?;
    let has_open_session: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM sessions WHERE task_id = ?1 AND ended_at IS NULL)",
        [id.to_string()],
        |row| row.get(0),
    )?;
    if has_open_session {
        return Err(TaskMetadataError::LiveTaskRequiresRuntimeBoundary(id));
    }
    let persisted = persisted_work_seconds(conn, id)?;
    let requested = i64::try_from(input.time_taken_seconds)
        .map_err(|_| TaskMetadataError::TimeTakenOverflow)?;
    let adjustment = requested
        .checked_sub(persisted)
        .ok_or(TaskMetadataError::TimeTakenOverflow)?;
    conn.execute(
        "UPDATE tasks SET manual_time_adjustment_seconds = ?1, updated_at = ?2 WHERE id = ?3",
        params![adjustment, now, id.to_string()],
    )?;
    get_task(conn, id).map_err(Into::into)
}

pub fn set_task_schedule(
    conn: &mut Connection,
    id: TaskId,
    schedule: TaskSchedule,
    now: &str,
) -> Result<TaskRecord, TaskMetadataError> {
    validate_timestamp(now)?;
    validate_task_context(conn, id, false)?;
    let schedule = normalize_schedule(schedule)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    tx.execute(
        "UPDATE tasks
         SET schedule_kind = ?1,
             scheduled_local_date = ?2,
             scheduled_local_time = ?3,
             schedule_timezone = ?4,
             updated_at = ?5
         WHERE id = ?6",
        params![
            schedule.kind.as_str(),
            schedule.local_date,
            schedule.local_time,
            schedule.timezone,
            now,
            id.to_string()
        ],
    )?;
    tx.commit()?;
    get_task(conn, id).map_err(Into::into)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::{run_migrations, tasks::create_task};

    const T0: &str = "2026-09-04T10:00:00Z";
    const T1: &str = "2026-09-04T10:01:00Z";

    fn setup() -> (Connection, TaskId) {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let list = create_list(
            &mut conn,
            NewListInput {
                title: "Metadata".into(),
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
                title: "Task".into(),
                manual_lane: PlanningLane::Backlog,
                est_seconds: None,
            },
            T0,
        )
        .expect("create task");
        (conn, task.id)
    }

    #[test]
    fn schedule_metadata_normalizes_without_converting_date_only_values() {
        let (mut conn, task_id) = setup();
        let date_only = set_task_schedule(
            &mut conn,
            task_id,
            TaskSchedule::DateOnly {
                local_date: " 2026-09-04 ".into(),
            },
            T1,
        )
        .expect("set date-only schedule");
        assert_eq!(date_only.scheduled_local_date.as_deref(), Some("2026-09-04"));
        assert!(date_only.scheduled_local_time.is_none());
        assert!(date_only.schedule_timezone.is_none());

        let timed = set_task_schedule(
            &mut conn,
            task_id,
            TaskSchedule::LocalDateTime {
                local_date: " 2026-09-04 ".into(),
                local_time: " 13:30 ".into(),
                timezone: " Europe/Athens ".into(),
            },
            T1,
        )
        .expect("set timed schedule");
        assert_eq!(timed.scheduled_local_date.as_deref(), Some("2026-09-04"));
        assert_eq!(timed.scheduled_local_time.as_deref(), Some("13:30"));
        assert_eq!(timed.schedule_timezone.as_deref(), Some("Europe/Athens"));
    }

    #[test]
    fn invalid_timezone_and_dst_ambiguity_are_rejected_before_mutation() {
        let (mut conn, task_id) = setup();
        let before = get_task(&conn, task_id).expect("load initial task");

        assert!(matches!(
            set_task_schedule(
                &mut conn,
                task_id,
                TaskSchedule::LocalDateTime {
                    local_date: "2026-09-04".into(),
                    local_time: "13:30".into(),
                    timezone: "Europe/Atlantis".into(),
                },
                T1,
            ),
            Err(TaskMetadataError::InvalidScheduleTimezone)
        ));
        assert!(matches!(
            set_task_schedule(
                &mut conn,
                task_id,
                TaskSchedule::LocalDateTime {
                    local_date: "2026-03-08".into(),
                    local_time: "02:30".into(),
                    timezone: "America/New_York".into(),
                },
                T1,
            ),
            Err(TaskMetadataError::AmbiguousScheduleLocalDateTime)
        ));
        assert!(matches!(
            set_task_schedule(
                &mut conn,
                task_id,
                TaskSchedule::LocalDateTime {
                    local_date: "2026-11-01".into(),
                    local_time: "01:30".into(),
                    timezone: "America/New_York".into(),
                },
                T1,
            ),
            Err(TaskMetadataError::AmbiguousScheduleLocalDateTime)
        ));

        let after = get_task(&conn, task_id).expect("reload unchanged task");
        assert_eq!(after.id, before.id);
        assert_eq!(after.schedule_kind, ScheduleKind::None);
        assert!(after.scheduled_local_date.is_none());
        assert!(after.scheduled_local_time.is_none());
        assert!(after.schedule_timezone.is_none());
    }
}
