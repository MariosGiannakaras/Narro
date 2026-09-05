use crate::domain::ids::{ReminderId, TaskId};
use crate::domain::reminders::{NewReminderInput, ReminderRecord};
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use crate::scheduling::{
    resolve_local_datetime_strict, validate_timezone_identifier, SchedulingError,
};
use chrono::{DateTime, NaiveDate, NaiveTime};
use jiff::Timestamp;
use rusqlite::{params, Connection, OptionalExtension, Row};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum ReminderStoreError {
    Sqlite(rusqlite::Error),
    Task(TaskStoreError),
    List(ListStoreError),
    Scheduling(SchedulingError),
    InvalidTimestamp,
    InvalidLocalDate,
    InvalidLocalTime,
    InvalidStoredIdentity(&'static str),
    InvalidStoredTimestamp(&'static str),
    NotFound(ReminderId),
    TaskArchived(TaskId),
    TaskCompleted(TaskId),
    TaskListArchived,
    Terminal(ReminderId),
}

impl Display for ReminderStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "reminder persistence failed: {error}"),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::Scheduling(error) => Display::fmt(error, formatter),
            Self::InvalidTimestamp => {
                formatter.write_str("reminder mutation timestamp must be RFC 3339")
            }
            Self::InvalidLocalDate => {
                formatter.write_str("reminder local date must use YYYY-MM-DD")
            }
            Self::InvalidLocalTime => {
                formatter.write_str("reminder local time must use 24-hour HH:MM")
            }
            Self::InvalidStoredIdentity(kind) => {
                write!(formatter, "stored {kind} identity is not a valid UUID")
            }
            Self::InvalidStoredTimestamp(kind) => {
                write!(
                    formatter,
                    "stored reminder {kind} timestamp must be RFC 3339"
                )
            }
            Self::NotFound(id) => write!(formatter, "reminder not found: {id}"),
            Self::TaskArchived(id) => write!(formatter, "reminder task is archived: {id}"),
            Self::TaskCompleted(id) => write!(formatter, "reminder task is completed: {id}"),
            Self::TaskListArchived => formatter.write_str("reminder task list is archived"),
            Self::Terminal(id) => write!(formatter, "reminder is already terminal: {id}"),
        }
    }
}

impl std::error::Error for ReminderStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            Self::Scheduling(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for ReminderStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<TaskStoreError> for ReminderStoreError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for ReminderStoreError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

impl From<SchedulingError> for ReminderStoreError {
    fn from(value: SchedulingError) -> Self {
        Self::Scheduling(value)
    }
}

#[derive(Debug)]
struct RawReminder {
    id: String,
    task_id: String,
    remind_local_date: String,
    remind_local_time: String,
    timezone: String,
    fired_at: Option<String>,
    dismissed_at: Option<String>,
    created_at: String,
    updated_at: String,
}

const REMINDER_COLUMNS: &str = "id, task_id, remind_local_date, remind_local_time, timezone, \
fired_at, dismissed_at, created_at, updated_at";

fn raw_reminder_from_row(row: &Row<'_>) -> rusqlite::Result<RawReminder> {
    Ok(RawReminder {
        id: row.get(0)?,
        task_id: row.get(1)?,
        remind_local_date: row.get(2)?,
        remind_local_time: row.get(3)?,
        timezone: row.get(4)?,
        fired_at: row.get(5)?,
        dismissed_at: row.get(6)?,
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
    })
}

fn validate_timestamp(value: &str) -> Result<(), ReminderStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| ReminderStoreError::InvalidTimestamp)
}

fn validate_stored_timestamp(kind: &'static str, value: &str) -> Result<(), ReminderStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| ReminderStoreError::InvalidStoredTimestamp(kind))
}

fn normalize_schedule(
    local_date: &str,
    local_time: &str,
    timezone: &str,
) -> Result<(String, String, String, Timestamp), ReminderStoreError> {
    let local_date = NaiveDate::parse_from_str(local_date.trim(), "%Y-%m-%d")
        .map_err(|_| ReminderStoreError::InvalidLocalDate)?;
    let local_time = NaiveTime::parse_from_str(local_time.trim(), "%H:%M")
        .map_err(|_| ReminderStoreError::InvalidLocalTime)?;
    let timezone = validate_timezone_identifier(timezone)?;
    let instant = resolve_local_datetime_strict(local_date, local_time, &timezone)?;
    Ok((
        local_date.format("%Y-%m-%d").to_string(),
        local_time.format("%H:%M").to_string(),
        timezone,
        instant,
    ))
}

fn decode_reminder(raw: RawReminder) -> Result<ReminderRecord, ReminderStoreError> {
    let id = ReminderId::parse_str(&raw.id)
        .map_err(|_| ReminderStoreError::InvalidStoredIdentity("reminder"))?;
    let task_id = TaskId::parse_str(&raw.task_id)
        .map_err(|_| ReminderStoreError::InvalidStoredIdentity("reminder task"))?;
    let (remind_local_date, remind_local_time, timezone, _) = normalize_schedule(
        &raw.remind_local_date,
        &raw.remind_local_time,
        &raw.timezone,
    )?;
    if let Some(value) = raw.fired_at.as_deref() {
        validate_stored_timestamp("fired", value)?;
    }
    if let Some(value) = raw.dismissed_at.as_deref() {
        validate_stored_timestamp("dismissed", value)?;
    }
    validate_stored_timestamp("created", &raw.created_at)?;
    validate_stored_timestamp("updated", &raw.updated_at)?;

    Ok(ReminderRecord {
        id,
        task_id,
        remind_local_date,
        remind_local_time,
        timezone,
        fired_at: raw.fired_at,
        dismissed_at: raw.dismissed_at,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
    })
}

fn active_task(conn: &Connection, task_id: TaskId) -> Result<(), ReminderStoreError> {
    let task = get_task(conn, task_id)?;
    if task.archived_at.is_some() {
        return Err(ReminderStoreError::TaskArchived(task.id));
    }
    if task.completed_at.is_some() {
        return Err(ReminderStoreError::TaskCompleted(task.id));
    }
    let list = get_list(conn, task.list_id)?;
    if list.archived_at.is_some() {
        return Err(ReminderStoreError::TaskListArchived);
    }
    Ok(())
}

pub fn create_reminder(
    conn: &mut Connection,
    input: NewReminderInput,
    now: &str,
) -> Result<ReminderRecord, ReminderStoreError> {
    validate_timestamp(now)?;
    active_task(conn, input.task_id)?;
    let (local_date, local_time, timezone, _) = normalize_schedule(
        &input.remind_local_date,
        &input.remind_local_time,
        &input.timezone,
    )?;
    let id = ReminderId::generate();
    conn.execute(
        "INSERT INTO reminders (
            id, task_id, remind_local_date, remind_local_time, timezone,
            fired_at, dismissed_at, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, NULL, NULL, ?6, ?6)",
        params![
            id.to_string(),
            input.task_id.to_string(),
            local_date,
            local_time,
            timezone,
            now
        ],
    )?;
    get_reminder(conn, id)
}

pub fn get_reminder(
    conn: &Connection,
    reminder_id: ReminderId,
) -> Result<ReminderRecord, ReminderStoreError> {
    let raw = conn
        .query_row(
            &format!("SELECT {REMINDER_COLUMNS} FROM reminders WHERE id = ?1"),
            [reminder_id.to_string()],
            raw_reminder_from_row,
        )
        .optional()?
        .ok_or(ReminderStoreError::NotFound(reminder_id))?;
    decode_reminder(raw)
}

pub fn list_task_reminders(
    conn: &Connection,
    task_id: TaskId,
) -> Result<Vec<ReminderRecord>, ReminderStoreError> {
    let mut statement = conn.prepare(&format!(
        "SELECT {REMINDER_COLUMNS}
         FROM reminders
         WHERE task_id = ?1
         ORDER BY remind_local_date, remind_local_time, id"
    ))?;
    let rows = statement.query_map([task_id.to_string()], raw_reminder_from_row)?;
    rows.map(|row| decode_reminder(row?)).collect()
}

pub fn pending_due_reminders(
    conn: &Connection,
    now: &str,
) -> Result<Vec<ReminderRecord>, ReminderStoreError> {
    validate_timestamp(now)?;
    let now_instant: Timestamp = now
        .parse()
        .map_err(|_| ReminderStoreError::InvalidTimestamp)?;
    let mut statement = conn.prepare(&format!(
        "SELECT r.{}, r.{}, r.{}, r.{}, r.{}, r.{}, r.{}, r.{}, r.{}
         FROM reminders r
         JOIN tasks t ON t.id = r.task_id
         JOIN lists l ON l.id = t.list_id
         WHERE r.fired_at IS NULL
           AND r.dismissed_at IS NULL
           AND t.completed_at IS NULL
           AND t.archived_at IS NULL
           AND l.archived_at IS NULL",
        "id",
        "task_id",
        "remind_local_date",
        "remind_local_time",
        "timezone",
        "fired_at",
        "dismissed_at",
        "created_at",
        "updated_at"
    ))?;
    let rows = statement.query_map([], raw_reminder_from_row)?;
    let mut due = Vec::new();
    for row in rows {
        let reminder = decode_reminder(row?)?;
        let (_, _, _, instant) = normalize_schedule(
            &reminder.remind_local_date,
            &reminder.remind_local_time,
            &reminder.timezone,
        )?;
        if instant <= now_instant {
            due.push((instant, reminder));
        }
    }
    due.sort_by(|(left_instant, left), (right_instant, right)| {
        left_instant
            .cmp(right_instant)
            .then_with(|| left.id.to_string().cmp(&right.id.to_string()))
    });
    Ok(due.into_iter().map(|(_, reminder)| reminder).collect())
}

pub fn mark_reminder_fired(
    conn: &mut Connection,
    reminder_id: ReminderId,
    now: &str,
) -> Result<ReminderRecord, ReminderStoreError> {
    validate_timestamp(now)?;
    let changed = conn.execute(
        "UPDATE reminders
         SET fired_at = ?1, updated_at = ?1
         WHERE id = ?2
           AND fired_at IS NULL
           AND dismissed_at IS NULL",
        params![now, reminder_id.to_string()],
    )?;
    if changed == 1 {
        return get_reminder(conn, reminder_id);
    }
    let existing = get_reminder(conn, reminder_id)?;
    if existing.fired_at.is_some() {
        return Ok(existing);
    }
    Err(ReminderStoreError::Terminal(reminder_id))
}

pub fn dismiss_reminder(
    conn: &mut Connection,
    reminder_id: ReminderId,
    now: &str,
) -> Result<ReminderRecord, ReminderStoreError> {
    validate_timestamp(now)?;
    let changed = conn.execute(
        "UPDATE reminders
         SET dismissed_at = ?1, updated_at = ?1
         WHERE id = ?2
           AND fired_at IS NULL
           AND dismissed_at IS NULL",
        params![now, reminder_id.to_string()],
    )?;
    if changed == 1 {
        return get_reminder(conn, reminder_id);
    }
    let existing = get_reminder(conn, reminder_id)?;
    if existing.dismissed_at.is_some() {
        return Ok(existing);
    }
    Err(ReminderStoreError::Terminal(reminder_id))
}
