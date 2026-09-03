use crate::domain::ids::{ListId, TaskId};
use crate::domain::model::ScheduleKind;
use crate::domain::tasks::{SetTaskTimeTakenInput, TaskRecord, TaskSchedule};
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use chrono::{DateTime, NaiveDate, NaiveTime};
use rusqlite::{params, Connection};
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
    InvalidScheduleDate,
    InvalidScheduleTime,
    InvalidScheduleTimezone,
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
            Self::InvalidScheduleDate => {
                formatter.write_str("scheduled local date must use YYYY-MM-DD")
            }
            Self::InvalidScheduleTime => {
                formatter.write_str("scheduled local time must use 24-hour HH:MM")
            }
            Self::InvalidScheduleTimezone => formatter
                .write_str("scheduled timezone must be a non-empty local timezone identifier"),
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
    let value = value.trim();
    if value.is_empty() || value.len() > 128 || value.chars().any(char::is_control) {
        return Err(TaskMetadataError::InvalidScheduleTimezone);
    }
    Ok(value.to_owned())
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
        } => Ok(NormalizedSchedule {
            kind: ScheduleKind::LocalDateTime,
            local_date: Some(normalize_local_date(&local_date)?),
            local_time: Some(normalize_local_time(&local_time)?),
            timezone: Some(normalize_timezone(&timezone)?),
        }),
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

pub fn task_time_taken_seconds(conn: &Connection, id: TaskId) -> Result<u64, TaskMetadataError> {
    let task = get_task(conn, id)?;
    let persisted = persisted_work_seconds(conn, id)?;
    let effective = persisted
        .checked_add(task.manual_time_adjustment_seconds)
        .ok_or(TaskMetadataError::TimeTakenOverflow)?;
    if effective < 0 {
        return Err(TaskMetadataError::InvalidStoredTimeTaken(effective));
    }
    u64::try_from(effective).map_err(|_| TaskMetadataError::TimeTakenOverflow)
}

pub fn set_task_time_taken(
    conn: &mut Connection,
    id: TaskId,
    input: SetTaskTimeTakenInput,
    now: &str,
) -> Result<TaskRecord, TaskMetadataError> {
    validate_timestamp(now)?;
    let desired = i64::from(input.total_seconds);
    let tx = conn.transaction()?;
    validate_task_context(&tx, id, true)?;
    let persisted = persisted_work_seconds(&tx, id)?;
    let adjustment = desired
        .checked_sub(persisted)
        .ok_or(TaskMetadataError::TimeTakenOverflow)?;

    let changed = tx.execute(
        "UPDATE tasks
         SET manual_time_adjustment_seconds = ?1, updated_at = ?2
         WHERE id = ?3 AND archived_at IS NULL",
        params![adjustment, now, id.to_string()],
    )?;
    if changed != 1 {
        return Err(TaskMetadataError::ArchivedTask(id));
    }

    let updated = get_task(&tx, id)?;
    tx.commit()?;
    Ok(updated)
}

pub fn set_task_schedule(
    conn: &mut Connection,
    id: TaskId,
    schedule: TaskSchedule,
    now: &str,
) -> Result<TaskRecord, TaskMetadataError> {
    validate_timestamp(now)?;
    let schedule = normalize_schedule(schedule)?;
    let tx = conn.transaction()?;
    validate_task_context(&tx, id, false)?;

    let changed = tx.execute(
        "UPDATE tasks
         SET schedule_kind = ?1,
             scheduled_local_date = ?2,
             scheduled_local_time = ?3,
             schedule_timezone = ?4,
             updated_at = ?5
         WHERE id = ?6 AND completed_at IS NULL AND archived_at IS NULL",
        params![
            schedule.kind.as_str(),
            schedule.local_date,
            schedule.local_time,
            schedule.timezone,
            now,
            id.to_string()
        ],
    )?;
    if changed != 1 {
        return Err(TaskMetadataError::CompletedTask(id));
    }

    let updated = get_task(&tx, id)?;
    tx.commit()?;
    Ok(updated)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::ids::SessionId;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::{archive_list, create_list};
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{archive_task, complete_task, create_task, get_task};

    const T1: &str = "2026-09-03T14:00:00Z";
    const T2: &str = "2026-09-03T14:01:00Z";
    const T3: &str = "2026-09-03T14:02:00Z";

    fn migrated() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("migrate database");
        conn
    }

    fn task_fixture(conn: &mut Connection) -> TaskRecord {
        let list = create_list(
            conn,
            NewListInput {
                title: "Inbox".into(),
                color: None,
                icon_asset: None,
            },
            T1,
        )
        .expect("create list");
        create_task(
            conn,
            NewTaskInput {
                list_id: list.id,
                title: "Metadata task".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(1800),
            },
            T1,
        )
        .expect("create task")
    }

    fn insert_session(conn: &Connection, task_id: TaskId, kind: &str, seconds: i64) {
        conn.execute(
            "INSERT INTO sessions (
                id, task_id, kind, started_at, ended_at,
                duration_seconds, source, created_at, updated_at
             ) VALUES (?1, ?2, ?3, ?4, ?4, ?5, 'focus', ?4, ?4)",
            params![
                SessionId::generate().to_string(),
                task_id.to_string(),
                kind,
                T1,
                seconds
            ],
        )
        .expect("insert session fixture");
    }

    #[test]
    fn time_taken_is_work_sessions_plus_normalized_manual_adjustment() {
        let mut conn = migrated();
        let task = task_fixture(&mut conn);
        insert_session(&conn, task.id, "work", 120);
        insert_session(&conn, task.id, "work", 180);
        insert_session(&conn, task.id, "break", 900);

        assert_eq!(
            task_time_taken_seconds(&conn, task.id).expect("initial Time Taken"),
            300
        );

        let lowered = set_task_time_taken(
            &mut conn,
            task.id,
            SetTaskTimeTakenInput { total_seconds: 240 },
            T2,
        )
        .expect("lower Time Taken");
        assert_eq!(lowered.manual_time_adjustment_seconds, -60);
        assert_eq!(task_time_taken_seconds(&conn, task.id).unwrap(), 240);

        let raised = set_task_time_taken(
            &mut conn,
            task.id,
            SetTaskTimeTakenInput { total_seconds: 420 },
            T3,
        )
        .expect("raise Time Taken");
        assert_eq!(raised.manual_time_adjustment_seconds, 120);
        assert_eq!(task_time_taken_seconds(&conn, task.id).unwrap(), 420);

        let sessions: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM sessions WHERE task_id = ?1",
                [task.id.to_string()],
                |row| row.get(0),
            )
            .expect("count sessions");
        assert_eq!(sessions, 3, "manual edit must not rewrite session history");
    }

    #[test]
    fn completed_task_time_taken_can_be_corrected_without_reopening() {
        let mut conn = migrated();
        let task = task_fixture(&mut conn);
        insert_session(&conn, task.id, "work", 300);
        complete_task(&mut conn, task.id, T2).expect("complete task");

        let corrected = set_task_time_taken(
            &mut conn,
            task.id,
            SetTaskTimeTakenInput { total_seconds: 240 },
            T3,
        )
        .expect("correct completed task history");
        assert!(corrected.completed_at.is_some());
        assert_eq!(corrected.manual_time_adjustment_seconds, -60);
        assert_eq!(task_time_taken_seconds(&conn, task.id).unwrap(), 240);
    }

    #[test]
    fn schedule_transitions_are_atomic_and_clear_non_applicable_fields() {
        let mut conn = migrated();
        let task = task_fixture(&mut conn);

        let date_only = set_task_schedule(
            &mut conn,
            task.id,
            TaskSchedule::DateOnly {
                local_date: " 2026-09-04 ".into(),
            },
            T2,
        )
        .expect("set date-only schedule");
        assert_eq!(date_only.schedule_kind, ScheduleKind::DateOnly);
        assert_eq!(
            date_only.scheduled_local_date.as_deref(),
            Some("2026-09-04")
        );
        assert!(date_only.scheduled_local_time.is_none());
        assert!(date_only.schedule_timezone.is_none());

        let timed = set_task_schedule(
            &mut conn,
            task.id,
            TaskSchedule::LocalDateTime {
                local_date: "2026-09-05".into(),
                local_time: "09:30".into(),
                timezone: " Europe/Athens ".into(),
            },
            T3,
        )
        .expect("set timed schedule");
        assert_eq!(timed.schedule_kind, ScheduleKind::LocalDateTime);
        assert_eq!(timed.scheduled_local_date.as_deref(), Some("2026-09-05"));
        assert_eq!(timed.scheduled_local_time.as_deref(), Some("09:30"));
        assert_eq!(timed.schedule_timezone.as_deref(), Some("Europe/Athens"));

        let cleared =
            set_task_schedule(&mut conn, task.id, TaskSchedule::None, T3).expect("clear schedule");
        assert_eq!(cleared.schedule_kind, ScheduleKind::None);
        assert!(cleared.scheduled_local_date.is_none());
        assert!(cleared.scheduled_local_time.is_none());
        assert!(cleared.schedule_timezone.is_none());
    }

    #[test]
    fn invalid_schedule_is_rejected_before_existing_state_changes() {
        let mut conn = migrated();
        let task = task_fixture(&mut conn);
        set_task_schedule(
            &mut conn,
            task.id,
            TaskSchedule::DateOnly {
                local_date: "2026-09-04".into(),
            },
            T2,
        )
        .expect("seed schedule");

        for invalid in [
            TaskSchedule::DateOnly {
                local_date: "2026-02-30".into(),
            },
            TaskSchedule::LocalDateTime {
                local_date: "2026-09-04".into(),
                local_time: "25:00".into(),
                timezone: "Europe/Athens".into(),
            },
            TaskSchedule::LocalDateTime {
                local_date: "2026-09-04".into(),
                local_time: "09:00".into(),
                timezone: "   ".into(),
            },
        ] {
            assert!(set_task_schedule(&mut conn, task.id, invalid, T3).is_err());
            let stored = get_task(&conn, task.id).expect("reload unchanged task");
            assert_eq!(stored.schedule_kind, ScheduleKind::DateOnly);
            assert_eq!(stored.scheduled_local_date.as_deref(), Some("2026-09-04"));
            assert!(stored.scheduled_local_time.is_none());
            assert!(stored.schedule_timezone.is_none());
        }
    }

    #[test]
    fn schedule_rejects_completed_and_archived_contexts() {
        let mut conn = migrated();
        let completed = task_fixture(&mut conn);
        complete_task(&mut conn, completed.id, T2).expect("complete task");
        assert!(matches!(
            set_task_schedule(&mut conn, completed.id, TaskSchedule::None, T3),
            Err(TaskMetadataError::CompletedTask(id)) if id == completed.id
        ));

        let mut conn = migrated();
        let archived_task = task_fixture(&mut conn);
        archive_task(&mut conn, archived_task.id, T2).expect("archive task");
        assert!(matches!(
            set_task_time_taken(
                &mut conn,
                archived_task.id,
                SetTaskTimeTakenInput { total_seconds: 60 },
                T3,
            ),
            Err(TaskMetadataError::ArchivedTask(id)) if id == archived_task.id
        ));

        let mut conn = migrated();
        let archived_list_task = task_fixture(&mut conn);
        archive_list(&mut conn, archived_list_task.list_id, T2).expect("archive list");
        assert!(matches!(
            set_task_schedule(&mut conn, archived_list_task.id, TaskSchedule::None, T3),
            Err(TaskMetadataError::ArchivedList(id)) if id == archived_list_task.list_id
        ));
    }
}
