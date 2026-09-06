use crate::domain::ids::{ListId, ReminderId, TaskId};
use crate::notifications::TASK_REMINDER_TITLE;
use crate::persistence::reminders::{get_reminder, ReminderStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use crate::persistence::{configure_connection, PersistenceError};
use crate::scheduling::{
    resolve_local_datetime_strict, validate_timezone_identifier, SchedulingError,
};
use chrono::{DateTime, NaiveDate, NaiveTime};
use rusqlite::{params, Connection, OpenFlags, OptionalExtension};
use serde::Serialize;
use std::fmt::{Display, Formatter};
use std::path::Path;

const ACCEPTANCE_LIST_TITLE: &str = "Narro reminder acceptance";
const ACCEPTANCE_TASK_TITLE: &str = "Reminder acceptance probe - expected once";

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ReminderAcceptanceProbe {
    pub list_id: ListId,
    pub task_id: TaskId,
    pub reminder_id: ReminderId,
    pub remind_local_date: String,
    pub remind_local_time: String,
    pub timezone: String,
    pub notification_title: &'static str,
    pub notification_body: String,
}

#[derive(Debug)]
pub enum ReminderAcceptanceError {
    Sqlite(rusqlite::Error),
    Persistence(PersistenceError),
    Scheduling(SchedulingError),
    Reminder(ReminderStoreError),
    Task(TaskStoreError),
    InvalidTimestamp,
    InvalidLocalDate,
    InvalidLocalTime,
    InvalidStoredReminderIdentity,
    PendingProbeExists(ReminderId),
    ListRankOverflow,
}

impl Display for ReminderAcceptanceError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "reminder acceptance SQLite failure: {error}"),
            Self::Persistence(error) => Display::fmt(error, formatter),
            Self::Scheduling(error) => Display::fmt(error, formatter),
            Self::Reminder(error) => Display::fmt(error, formatter),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::InvalidTimestamp => {
                formatter.write_str("reminder acceptance timestamp must be RFC 3339")
            }
            Self::InvalidLocalDate => {
                formatter.write_str("reminder acceptance local date must use YYYY-MM-DD")
            }
            Self::InvalidLocalTime => {
                formatter.write_str("reminder acceptance local time must use 24-hour HH:MM")
            }
            Self::InvalidStoredReminderIdentity => {
                formatter.write_str("stored reminder acceptance identity is not a valid UUID")
            }
            Self::PendingProbeExists(id) => write!(
                formatter,
                "reminder acceptance probe is already pending: {id}; wait for it to fire before scheduling another"
            ),
            Self::ListRankOverflow => formatter.write_str("reminder acceptance list rank overflow"),
        }
    }
}

impl std::error::Error for ReminderAcceptanceError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Persistence(error) => Some(error),
            Self::Scheduling(error) => Some(error),
            Self::Reminder(error) => Some(error),
            Self::Task(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for ReminderAcceptanceError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<PersistenceError> for ReminderAcceptanceError {
    fn from(value: PersistenceError) -> Self {
        Self::Persistence(value)
    }
}

impl From<SchedulingError> for ReminderAcceptanceError {
    fn from(value: SchedulingError) -> Self {
        Self::Scheduling(value)
    }
}

impl From<ReminderStoreError> for ReminderAcceptanceError {
    fn from(value: ReminderStoreError) -> Self {
        Self::Reminder(value)
    }
}

impl From<TaskStoreError> for ReminderAcceptanceError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

fn normalized_schedule(
    local_date: &str,
    local_time: &str,
    timezone: &str,
) -> Result<(String, String, String), ReminderAcceptanceError> {
    let local_date = NaiveDate::parse_from_str(local_date.trim(), "%Y-%m-%d")
        .map_err(|_| ReminderAcceptanceError::InvalidLocalDate)?;
    let local_time = NaiveTime::parse_from_str(local_time.trim(), "%H:%M")
        .map_err(|_| ReminderAcceptanceError::InvalidLocalTime)?;
    let timezone = validate_timezone_identifier(timezone)?;
    resolve_local_datetime_strict(local_date, local_time, &timezone)?;

    Ok((
        local_date.format("%Y-%m-%d").to_string(),
        local_time.format("%H:%M").to_string(),
        timezone,
    ))
}

fn next_list_rank(conn: &Connection) -> Result<i64, ReminderAcceptanceError> {
    let current: Option<i64> = conn.query_row(
        "SELECT MAX(sort_rank) FROM lists WHERE archived_at IS NULL",
        [],
        |row| row.get(0),
    )?;

    match current {
        Some(rank) if rank >= i64::from(u32::MAX) => Err(ReminderAcceptanceError::ListRankOverflow),
        Some(rank) => Ok(rank + 1),
        None => Ok(0),
    }
}

fn pending_acceptance_probe(
    conn: &Connection,
) -> Result<Option<ReminderId>, ReminderAcceptanceError> {
    let stored_id: Option<String> = conn
        .query_row(
            "SELECT r.id
             FROM reminders r
             JOIN tasks t ON t.id = r.task_id
             JOIN lists l ON l.id = t.list_id
             WHERE l.title = ?1
               AND t.title = ?2
               AND r.fired_at IS NULL
               AND r.dismissed_at IS NULL
               AND t.completed_at IS NULL
               AND t.archived_at IS NULL
               AND l.archived_at IS NULL
             ORDER BY r.created_at DESC, r.id DESC
             LIMIT 1",
            params![ACCEPTANCE_LIST_TITLE, ACCEPTANCE_TASK_TITLE],
            |row| row.get(0),
        )
        .optional()?;

    stored_id
        .map(|value| {
            ReminderId::parse_str(&value)
                .map_err(|_| ReminderAcceptanceError::InvalidStoredReminderIdentity)
        })
        .transpose()
}

fn schedule_probe_in_connection(
    conn: &mut Connection,
    local_date: &str,
    local_time: &str,
    timezone: &str,
    now: &str,
) -> Result<ReminderAcceptanceProbe, ReminderAcceptanceError> {
    DateTime::parse_from_rfc3339(now).map_err(|_| ReminderAcceptanceError::InvalidTimestamp)?;
    let (local_date, local_time, timezone) = normalized_schedule(local_date, local_time, timezone)?;

    if let Some(reminder_id) = pending_acceptance_probe(conn)? {
        return Err(ReminderAcceptanceError::PendingProbeExists(reminder_id));
    }

    let list_id = ListId::generate();
    let task_id = TaskId::generate();
    let reminder_id = ReminderId::generate();

    let tx = conn.transaction()?;
    let list_rank = next_list_rank(&tx)?;
    tx.execute(
        "INSERT INTO lists (
            id, title, color, icon_asset, sort_rank, archived_at, created_at, updated_at
         ) VALUES (?1, ?2, NULL, NULL, ?3, NULL, ?4, ?4)",
        params![list_id.to_string(), ACCEPTANCE_LIST_TITLE, list_rank, now],
    )?;
    tx.execute(
        "INSERT INTO tasks (
            id, list_id, title, manual_lane, sort_rank, est_seconds,
            created_at, updated_at
         ) VALUES (?1, ?2, ?3, 'today', 0, NULL, ?4, ?4)",
        params![
            task_id.to_string(),
            list_id.to_string(),
            ACCEPTANCE_TASK_TITLE,
            now
        ],
    )?;
    tx.execute(
        "INSERT INTO reminders (
            id, task_id, remind_local_date, remind_local_time, timezone,
            fired_at, dismissed_at, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, NULL, NULL, ?6, ?6)",
        params![
            reminder_id.to_string(),
            task_id.to_string(),
            local_date,
            local_time,
            timezone,
            now
        ],
    )?;

    let task = get_task(&tx, task_id)?;
    let reminder = get_reminder(&tx, reminder_id)?;
    tx.commit()?;

    Ok(ReminderAcceptanceProbe {
        list_id,
        task_id,
        reminder_id,
        remind_local_date: reminder.remind_local_date,
        remind_local_time: reminder.remind_local_time,
        timezone: reminder.timezone,
        notification_title: TASK_REMINDER_TITLE,
        notification_body: task.title,
    })
}

pub fn schedule_probe(
    database_path: &Path,
    local_date: &str,
    local_time: &str,
    timezone: &str,
    now: &str,
) -> Result<ReminderAcceptanceProbe, ReminderAcceptanceError> {
    let mut connection =
        Connection::open_with_flags(database_path, OpenFlags::SQLITE_OPEN_READ_WRITE)?;
    configure_connection(&connection)?;
    schedule_probe_in_connection(&mut connection, local_date, local_time, timezone, now)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::persistence::reminders::{mark_reminder_fired, pending_due_reminders};
    use crate::persistence::run_migrations;

    const NOW: &str = "2026-09-06T19:30:00Z";

    fn fixture() -> Connection {
        let mut connection = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut connection).expect("migrate database");
        connection
    }

    fn row_count(connection: &Connection, table: &str) -> i64 {
        let sql = format!("SELECT COUNT(*) FROM {table}");
        connection
            .query_row(&sql, [], |row| row.get(0))
            .expect("count diagnostic fixture rows")
    }

    #[test]
    fn probe_creates_real_pending_reminder_visible_to_due_query() {
        let mut connection = fixture();
        let probe = schedule_probe_in_connection(
            &mut connection,
            "2026-09-06",
            "22:32",
            "Europe/Athens",
            NOW,
        )
        .expect("create acceptance probe");

        assert_eq!(probe.notification_title, TASK_REMINDER_TITLE);
        assert_eq!(probe.notification_body, ACCEPTANCE_TASK_TITLE);
        assert_eq!(probe.remind_local_date, "2026-09-06");
        assert_eq!(probe.remind_local_time, "22:32");
        assert_eq!(probe.timezone, "Europe/Athens");
        assert_eq!(row_count(&connection, "lists"), 1);
        assert_eq!(row_count(&connection, "tasks"), 1);
        assert_eq!(row_count(&connection, "reminders"), 1);

        assert!(pending_due_reminders(&connection, "2026-09-06T19:31:59Z")
            .expect("query before due instant")
            .is_empty());
        let due = pending_due_reminders(&connection, "2026-09-06T19:32:00Z")
            .expect("query at due instant");
        assert_eq!(due.len(), 1);
        assert_eq!(due[0].id, probe.reminder_id);
        assert_eq!(due[0].task_id, probe.task_id);
    }

    #[test]
    fn repeated_probe_is_rejected_while_the_first_reminder_is_pending() {
        let mut connection = fixture();
        let first = schedule_probe_in_connection(
            &mut connection,
            "2026-09-06",
            "22:32",
            "Europe/Athens",
            NOW,
        )
        .expect("create first acceptance probe");

        let error = schedule_probe_in_connection(
            &mut connection,
            "2026-09-06",
            "22:34",
            "Europe/Athens",
            "2026-09-06T19:31:00Z",
        )
        .expect_err("second pending probe must be rejected");

        assert!(matches!(
            error,
            ReminderAcceptanceError::PendingProbeExists(id) if id == first.reminder_id
        ));
        assert_eq!(row_count(&connection, "lists"), 1);
        assert_eq!(row_count(&connection, "tasks"), 1);
        assert_eq!(row_count(&connection, "reminders"), 1);
    }

    #[test]
    fn a_new_probe_can_be_scheduled_after_the_previous_one_is_fired() {
        let mut connection = fixture();
        let first = schedule_probe_in_connection(
            &mut connection,
            "2026-09-06",
            "22:32",
            "Europe/Athens",
            NOW,
        )
        .expect("create first acceptance probe");
        mark_reminder_fired(&mut connection, first.reminder_id, "2026-09-06T19:32:00Z")
            .expect("mark first acceptance probe fired");

        let second = schedule_probe_in_connection(
            &mut connection,
            "2026-09-06",
            "22:34",
            "Europe/Athens",
            "2026-09-06T19:33:00Z",
        )
        .expect("create replacement acceptance probe after terminal first probe");

        assert_ne!(second.reminder_id, first.reminder_id);
        assert_eq!(row_count(&connection, "lists"), 2);
        assert_eq!(row_count(&connection, "tasks"), 2);
        assert_eq!(row_count(&connection, "reminders"), 2);
    }

    #[test]
    fn failed_reminder_insert_rolls_back_list_and_task_setup() {
        let mut connection = fixture();
        connection
            .execute_batch(
                "CREATE TRIGGER reject_acceptance_reminder
                 BEFORE INSERT ON reminders
                 BEGIN
                   SELECT RAISE(ABORT, 'forced reminder insert failure');
                 END;",
            )
            .expect("install deterministic failure trigger");

        let error = schedule_probe_in_connection(
            &mut connection,
            "2026-09-06",
            "22:32",
            "Europe/Athens",
            NOW,
        )
        .expect_err("forced reminder insert must fail");
        assert!(matches!(error, ReminderAcceptanceError::Sqlite(_)));
        assert_eq!(row_count(&connection, "lists"), 0);
        assert_eq!(row_count(&connection, "tasks"), 0);
        assert_eq!(row_count(&connection, "reminders"), 0);
    }

    #[test]
    fn invalid_timezone_is_rejected_before_any_rows_are_written() {
        let mut connection = fixture();
        let error = schedule_probe_in_connection(
            &mut connection,
            "2026-09-06",
            "22:32",
            "Not/A_Real_Timezone",
            NOW,
        )
        .expect_err("invalid timezone must fail");

        assert!(matches!(error, ReminderAcceptanceError::Scheduling(_)));
        assert_eq!(row_count(&connection, "lists"), 0);
        assert_eq!(row_count(&connection, "tasks"), 0);
        assert_eq!(row_count(&connection, "reminders"), 0);
    }
}
