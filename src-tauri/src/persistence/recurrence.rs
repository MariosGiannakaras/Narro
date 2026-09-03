use crate::domain::ids::{ListId, RecurrenceRuleId, TaskId};
use crate::domain::model::{DomainValueError, RecurrenceUnit};
use crate::domain::recurrence::{
    NewRecurrenceRuleInput, RecurrenceRuleRecord, UpdateRecurrenceRuleInput,
};
use crate::domain::tasks::TaskRecord;
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use chrono::{DateTime, NaiveDate, NaiveTime};
use rusqlite::{params, Connection, OptionalExtension, Row};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum RecurrenceStoreError {
    Sqlite(rusqlite::Error),
    Task(TaskStoreError),
    List(ListStoreError),
    InvalidTimestamp,
    InvalidInterval,
    InvalidWeekdayMask,
    InvalidMonthDay,
    InvalidPattern,
    InvalidStartDate,
    InvalidLocalTime,
    InvalidTimezone,
    InvalidTimeTimezoneShape,
    InvalidStoredIdentity(&'static str),
    InvalidStoredDomainValue(DomainValueError),
    InvalidStoredInteger(&'static str, i64),
    InvalidStoredBoolean(&'static str, i64),
    InvalidStoredRuleShape,
    NotFound(RecurrenceRuleId),
    AlreadyExists(TaskId),
    ParentArchived(TaskId),
    ParentCompleted(TaskId),
    ParentListArchived(ListId),
    ParentLinkMismatch(TaskId),
}

impl Display for RecurrenceStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "recurrence persistence failed: {error}"),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::InvalidTimestamp => {
                formatter.write_str("recurrence mutation timestamp must be RFC 3339")
            }
            Self::InvalidInterval => {
                formatter.write_str("recurrence interval must be greater than zero")
            }
            Self::InvalidWeekdayMask => {
                formatter.write_str("recurrence weekday mask must be between 0 and 127")
            }
            Self::InvalidMonthDay => {
                formatter.write_str("recurrence month day must be between 1 and 31")
            }
            Self::InvalidPattern => formatter
                .write_str("recurrence selector shape is invalid for the selected recurrence unit"),
            Self::InvalidStartDate => {
                formatter.write_str("recurrence start date must use YYYY-MM-DD")
            }
            Self::InvalidLocalTime => {
                formatter.write_str("recurrence local time must use 24-hour HH:MM")
            }
            Self::InvalidTimezone => formatter
                .write_str("recurrence timezone must be a non-empty local timezone identifier"),
            Self::InvalidTimeTimezoneShape => formatter.write_str(
                "recurrence local time and timezone must either both be present or both be absent",
            ),
            Self::InvalidStoredIdentity(kind) => {
                write!(formatter, "stored {kind} identity is not a valid UUID")
            }
            Self::InvalidStoredDomainValue(error) => Display::fmt(error, formatter),
            Self::InvalidStoredInteger(kind, value) => {
                write!(formatter, "stored recurrence {kind} is invalid: {value}")
            }
            Self::InvalidStoredBoolean(kind, value) => {
                write!(
                    formatter,
                    "stored recurrence {kind} boolean is invalid: {value}"
                )
            }
            Self::InvalidStoredRuleShape => {
                formatter.write_str("stored recurrence rule shape is invalid")
            }
            Self::NotFound(id) => write!(formatter, "recurrence rule not found: {id}"),
            Self::AlreadyExists(parent_id) => {
                write!(
                    formatter,
                    "task already has recurrence metadata: {parent_id}"
                )
            }
            Self::ParentArchived(id) => {
                write!(formatter, "recurrence parent task is archived: {id}")
            }
            Self::ParentCompleted(id) => {
                write!(formatter, "recurrence parent task is completed: {id}")
            }
            Self::ParentListArchived(id) => {
                write!(formatter, "recurrence parent list is archived: {id}")
            }
            Self::ParentLinkMismatch(id) => write!(
                formatter,
                "recurrence parent task link does not match recurrence rule: {id}"
            ),
        }
    }
}

impl std::error::Error for RecurrenceStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            Self::InvalidStoredDomainValue(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for RecurrenceStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<TaskStoreError> for RecurrenceStoreError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for RecurrenceStoreError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

#[derive(Debug)]
struct RawRecurrenceRule {
    id: String,
    parent_task_id: String,
    interval_count: i64,
    unit: String,
    weekday_mask: i64,
    month_day: Option<i64>,
    starts_local_date: String,
    local_time: Option<String>,
    timezone: Option<String>,
    replace_existing: i64,
    is_active: i64,
    last_materialized_local_date: Option<String>,
    created_at: String,
    updated_at: String,
}

#[derive(Debug)]
struct NormalizedRuleInput {
    interval_count: i64,
    unit: RecurrenceUnit,
    weekday_mask: u8,
    month_day: Option<u8>,
    starts_local_date: String,
    local_time: Option<String>,
    timezone: Option<String>,
    replace_existing: bool,
}

const RULE_COLUMNS: &str = "id, parent_task_id, interval_count, unit, weekday_mask, month_day, \
starts_local_date, local_time, timezone, replace_existing, is_active, \
last_materialized_local_date, created_at, updated_at";

fn raw_rule_from_row(row: &Row<'_>) -> rusqlite::Result<RawRecurrenceRule> {
    Ok(RawRecurrenceRule {
        id: row.get(0)?,
        parent_task_id: row.get(1)?,
        interval_count: row.get(2)?,
        unit: row.get(3)?,
        weekday_mask: row.get(4)?,
        month_day: row.get(5)?,
        starts_local_date: row.get(6)?,
        local_time: row.get(7)?,
        timezone: row.get(8)?,
        replace_existing: row.get(9)?,
        is_active: row.get(10)?,
        last_materialized_local_date: row.get(11)?,
        created_at: row.get(12)?,
        updated_at: row.get(13)?,
    })
}

fn validate_timestamp(value: &str) -> Result<(), RecurrenceStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| RecurrenceStoreError::InvalidTimestamp)
}

fn normalize_local_date(value: &str) -> Result<String, RecurrenceStoreError> {
    let value = value.trim();
    let parsed = NaiveDate::parse_from_str(value, "%Y-%m-%d")
        .map_err(|_| RecurrenceStoreError::InvalidStartDate)?;
    Ok(parsed.format("%Y-%m-%d").to_string())
}

fn normalize_local_time(value: &str) -> Result<String, RecurrenceStoreError> {
    let value = value.trim();
    let parsed = NaiveTime::parse_from_str(value, "%H:%M")
        .map_err(|_| RecurrenceStoreError::InvalidLocalTime)?;
    Ok(parsed.format("%H:%M").to_string())
}

fn normalize_timezone(value: &str) -> Result<String, RecurrenceStoreError> {
    let value = value.trim();
    if value.is_empty() || value.len() > 128 || value.chars().any(char::is_control) {
        return Err(RecurrenceStoreError::InvalidTimezone);
    }
    Ok(value.to_owned())
}

fn validate_pattern(
    unit: RecurrenceUnit,
    weekday_mask: u8,
    month_day: Option<u8>,
) -> Result<(), RecurrenceStoreError> {
    if weekday_mask > 127 {
        return Err(RecurrenceStoreError::InvalidWeekdayMask);
    }
    if month_day.is_some_and(|value| !(1..=31).contains(&value)) {
        return Err(RecurrenceStoreError::InvalidMonthDay);
    }

    let valid = match unit {
        RecurrenceUnit::Day | RecurrenceUnit::Year => weekday_mask == 0 && month_day.is_none(),
        RecurrenceUnit::Week => weekday_mask != 0 && month_day.is_none(),
        RecurrenceUnit::Month => (weekday_mask != 0) ^ month_day.is_some(),
    };
    if !valid {
        return Err(RecurrenceStoreError::InvalidPattern);
    }
    Ok(())
}

fn normalize_time_and_timezone(
    local_time: Option<String>,
    timezone: Option<String>,
) -> Result<(Option<String>, Option<String>), RecurrenceStoreError> {
    match (local_time, timezone) {
        (None, None) => Ok((None, None)),
        (Some(local_time), Some(timezone)) => Ok((
            Some(normalize_local_time(&local_time)?),
            Some(normalize_timezone(&timezone)?),
        )),
        _ => Err(RecurrenceStoreError::InvalidTimeTimezoneShape),
    }
}

fn normalize_rule_input(
    interval_count: u32,
    unit: RecurrenceUnit,
    weekday_mask: u8,
    month_day: Option<u8>,
    starts_local_date: String,
    local_time: Option<String>,
    timezone: Option<String>,
    replace_existing: bool,
) -> Result<NormalizedRuleInput, RecurrenceStoreError> {
    if interval_count == 0 {
        return Err(RecurrenceStoreError::InvalidInterval);
    }
    validate_pattern(unit, weekday_mask, month_day)?;
    let starts_local_date = normalize_local_date(&starts_local_date)?;
    let (local_time, timezone) = normalize_time_and_timezone(local_time, timezone)?;

    Ok(NormalizedRuleInput {
        interval_count: i64::from(interval_count),
        unit,
        weekday_mask,
        month_day,
        starts_local_date,
        local_time,
        timezone,
        replace_existing,
    })
}

fn decode_bool(kind: &'static str, value: i64) -> Result<bool, RecurrenceStoreError> {
    match value {
        0 => Ok(false),
        1 => Ok(true),
        _ => Err(RecurrenceStoreError::InvalidStoredBoolean(kind, value)),
    }
}

fn decode_rule(raw: RawRecurrenceRule) -> Result<RecurrenceRuleRecord, RecurrenceStoreError> {
    let id = RecurrenceRuleId::parse_str(&raw.id)
        .map_err(|_| RecurrenceStoreError::InvalidStoredIdentity("recurrence rule"))?;
    let parent_task_id = TaskId::parse_str(&raw.parent_task_id)
        .map_err(|_| RecurrenceStoreError::InvalidStoredIdentity("recurrence parent task"))?;
    let interval_count = u32::try_from(raw.interval_count)
        .ok()
        .filter(|value| *value > 0)
        .ok_or(RecurrenceStoreError::InvalidStoredInteger(
            "interval",
            raw.interval_count,
        ))?;
    let unit = RecurrenceUnit::try_from(raw.unit.as_str())
        .map_err(RecurrenceStoreError::InvalidStoredDomainValue)?;
    let weekday_mask = u8::try_from(raw.weekday_mask)
        .ok()
        .filter(|value| *value <= 127)
        .ok_or(RecurrenceStoreError::InvalidStoredInteger(
            "weekday mask",
            raw.weekday_mask,
        ))?;
    let month_day = raw
        .month_day
        .map(|value| {
            u8::try_from(value)
                .ok()
                .filter(|day| (1..=31).contains(day))
                .ok_or(RecurrenceStoreError::InvalidStoredInteger(
                    "month day",
                    value,
                ))
        })
        .transpose()?;
    validate_pattern(unit, weekday_mask, month_day)
        .map_err(|_| RecurrenceStoreError::InvalidStoredRuleShape)?;

    let starts_local_date = normalize_local_date(&raw.starts_local_date)
        .map_err(|_| RecurrenceStoreError::InvalidStoredRuleShape)?;
    let (local_time, timezone) = normalize_time_and_timezone(raw.local_time, raw.timezone)
        .map_err(|_| RecurrenceStoreError::InvalidStoredRuleShape)?;
    let last_materialized_local_date = raw
        .last_materialized_local_date
        .map(|value| {
            normalize_local_date(&value).map_err(|_| RecurrenceStoreError::InvalidStoredRuleShape)
        })
        .transpose()?;

    Ok(RecurrenceRuleRecord {
        id,
        parent_task_id,
        interval_count,
        unit,
        weekday_mask,
        month_day,
        starts_local_date,
        local_time,
        timezone,
        replace_existing: decode_bool("replace_existing", raw.replace_existing)?,
        is_active: decode_bool("is_active", raw.is_active)?,
        last_materialized_local_date,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
    })
}

fn get_raw_rule(
    conn: &Connection,
    id: RecurrenceRuleId,
) -> Result<Option<RawRecurrenceRule>, RecurrenceStoreError> {
    let sql = format!("SELECT {RULE_COLUMNS} FROM recurrence_rules WHERE id = ?1");
    conn.query_row(&sql, [id.to_string()], raw_rule_from_row)
        .optional()
        .map_err(RecurrenceStoreError::from)
}

fn get_raw_rule_for_parent(
    conn: &Connection,
    parent_task_id: TaskId,
) -> Result<Option<RawRecurrenceRule>, RecurrenceStoreError> {
    let sql = format!("SELECT {RULE_COLUMNS} FROM recurrence_rules WHERE parent_task_id = ?1");
    conn.query_row(&sql, [parent_task_id.to_string()], raw_rule_from_row)
        .optional()
        .map_err(RecurrenceStoreError::from)
}

fn validate_parent_context(
    conn: &Connection,
    parent_task_id: TaskId,
    allow_completed: bool,
) -> Result<TaskRecord, RecurrenceStoreError> {
    let task = get_task(conn, parent_task_id)?;
    if task.archived_at.is_some() {
        return Err(RecurrenceStoreError::ParentArchived(parent_task_id));
    }
    if !allow_completed && task.completed_at.is_some() {
        return Err(RecurrenceStoreError::ParentCompleted(parent_task_id));
    }
    let list = get_list(conn, task.list_id)?;
    if list.archived_at.is_some() {
        return Err(RecurrenceStoreError::ParentListArchived(task.list_id));
    }
    Ok(task)
}

fn validate_parent_link(
    conn: &Connection,
    rule: &RecurrenceRuleRecord,
    allow_completed: bool,
) -> Result<TaskRecord, RecurrenceStoreError> {
    let task = validate_parent_context(conn, rule.parent_task_id, allow_completed)?;
    if task.recurrence_rule_id != Some(rule.id) {
        return Err(RecurrenceStoreError::ParentLinkMismatch(
            rule.parent_task_id,
        ));
    }
    Ok(task)
}

pub fn get_recurrence_rule(
    conn: &Connection,
    id: RecurrenceRuleId,
) -> Result<RecurrenceRuleRecord, RecurrenceStoreError> {
    decode_rule(get_raw_rule(conn, id)?.ok_or(RecurrenceStoreError::NotFound(id))?)
}

pub fn recurrence_rule_for_parent(
    conn: &Connection,
    parent_task_id: TaskId,
) -> Result<Option<RecurrenceRuleRecord>, RecurrenceStoreError> {
    let Some(raw) = get_raw_rule_for_parent(conn, parent_task_id)? else {
        return Ok(None);
    };
    let rule = decode_rule(raw)?;
    let task = get_task(conn, parent_task_id)?;
    if task.recurrence_rule_id != Some(rule.id) {
        return Err(RecurrenceStoreError::ParentLinkMismatch(parent_task_id));
    }
    Ok(Some(rule))
}

pub fn create_recurrence_rule(
    conn: &mut Connection,
    input: NewRecurrenceRuleInput,
    now: &str,
) -> Result<RecurrenceRuleRecord, RecurrenceStoreError> {
    validate_timestamp(now)?;
    let normalized = normalize_rule_input(
        input.interval_count,
        input.unit,
        input.weekday_mask,
        input.month_day,
        input.starts_local_date,
        input.local_time,
        input.timezone,
        input.replace_existing,
    )?;

    let tx = conn.transaction()?;
    let parent = validate_parent_context(&tx, input.parent_task_id, false)?;
    if parent.recurrence_rule_id.is_some()
        || get_raw_rule_for_parent(&tx, input.parent_task_id)?.is_some()
    {
        return Err(RecurrenceStoreError::AlreadyExists(input.parent_task_id));
    }

    let id = RecurrenceRuleId::generate();
    tx.execute(
        "INSERT INTO recurrence_rules (
            id, parent_task_id, interval_count, unit, weekday_mask, month_day,
            starts_local_date, local_time, timezone, replace_existing,
            is_active, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 1, ?11, ?11)",
        params![
            id.to_string(),
            input.parent_task_id.to_string(),
            normalized.interval_count,
            normalized.unit.as_str(),
            i64::from(normalized.weekday_mask),
            normalized.month_day.map(i64::from),
            normalized.starts_local_date,
            normalized.local_time,
            normalized.timezone,
            if normalized.replace_existing { 1 } else { 0 },
            now
        ],
    )?;

    let linked = tx.execute(
        "UPDATE tasks
         SET recurrence_rule_id = ?1, updated_at = ?2
         WHERE id = ?3
           AND recurrence_rule_id IS NULL
           AND completed_at IS NULL
           AND archived_at IS NULL",
        params![id.to_string(), now, input.parent_task_id.to_string()],
    )?;
    if linked != 1 {
        return Err(RecurrenceStoreError::ParentLinkMismatch(
            input.parent_task_id,
        ));
    }

    let created = get_recurrence_rule(&tx, id)?;
    validate_parent_link(&tx, &created, false)?;
    tx.commit()?;
    Ok(created)
}

pub fn update_recurrence_rule(
    conn: &mut Connection,
    id: RecurrenceRuleId,
    input: UpdateRecurrenceRuleInput,
    now: &str,
) -> Result<RecurrenceRuleRecord, RecurrenceStoreError> {
    validate_timestamp(now)?;
    let normalized = normalize_rule_input(
        input.interval_count,
        input.unit,
        input.weekday_mask,
        input.month_day,
        input.starts_local_date,
        input.local_time,
        input.timezone,
        input.replace_existing,
    )?;

    let tx = conn.transaction()?;
    let current = get_recurrence_rule(&tx, id)?;
    validate_parent_link(&tx, &current, false)?;

    let changed = tx.execute(
        "UPDATE recurrence_rules
         SET interval_count = ?1,
             unit = ?2,
             weekday_mask = ?3,
             month_day = ?4,
             starts_local_date = ?5,
             local_time = ?6,
             timezone = ?7,
             replace_existing = ?8,
             updated_at = ?9
         WHERE id = ?10",
        params![
            normalized.interval_count,
            normalized.unit.as_str(),
            i64::from(normalized.weekday_mask),
            normalized.month_day.map(i64::from),
            normalized.starts_local_date,
            normalized.local_time,
            normalized.timezone,
            if normalized.replace_existing { 1 } else { 0 },
            now,
            id.to_string()
        ],
    )?;
    if changed != 1 {
        return Err(RecurrenceStoreError::NotFound(id));
    }
    tx.execute(
        "UPDATE tasks SET updated_at = ?1 WHERE id = ?2",
        params![now, current.parent_task_id.to_string()],
    )?;

    let updated = get_recurrence_rule(&tx, id)?;
    tx.commit()?;
    Ok(updated)
}

pub fn set_recurrence_rule_active(
    conn: &mut Connection,
    id: RecurrenceRuleId,
    is_active: bool,
    now: &str,
) -> Result<RecurrenceRuleRecord, RecurrenceStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_recurrence_rule(&tx, id)?;
    validate_parent_link(&tx, &current, !is_active)?;
    if current.is_active == is_active {
        drop(tx);
        return Ok(current);
    }

    let changed = tx.execute(
        "UPDATE recurrence_rules SET is_active = ?1, updated_at = ?2 WHERE id = ?3",
        params![if is_active { 1 } else { 0 }, now, id.to_string()],
    )?;
    if changed != 1 {
        return Err(RecurrenceStoreError::NotFound(id));
    }
    tx.execute(
        "UPDATE tasks SET updated_at = ?1 WHERE id = ?2",
        params![now, current.parent_task_id.to_string()],
    )?;

    let updated = get_recurrence_rule(&tx, id)?;
    tx.commit()?;
    Ok(updated)
}

pub fn delete_recurrence_rule(
    conn: &mut Connection,
    id: RecurrenceRuleId,
    now: &str,
) -> Result<(), RecurrenceStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_recurrence_rule(&tx, id)?;
    validate_parent_link(&tx, &current, true)?;

    tx.execute(
        "UPDATE tasks
         SET recurrence_parent_task_id = NULL, updated_at = ?1
         WHERE recurrence_parent_task_id = ?2",
        params![now, current.parent_task_id.to_string()],
    )?;
    let deleted = tx.execute(
        "DELETE FROM recurrence_rules WHERE id = ?1",
        [id.to_string()],
    )?;
    if deleted != 1 {
        return Err(RecurrenceStoreError::NotFound(id));
    }
    tx.execute(
        "UPDATE tasks SET updated_at = ?1 WHERE id = ?2",
        params![now, current.parent_task_id.to_string()],
    )?;

    let parent = get_task(&tx, current.parent_task_id)?;
    if parent.recurrence_rule_id.is_some() {
        return Err(RecurrenceStoreError::ParentLinkMismatch(
            current.parent_task_id,
        ));
    }
    tx.commit()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::{archive_list, create_list};
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{complete_task, create_task};

    const T1: &str = "2026-09-03T15:00:00Z";
    const T2: &str = "2026-09-03T15:01:00Z";
    const T3: &str = "2026-09-03T15:02:00Z";
    const T4: &str = "2026-09-03T15:03:00Z";

    fn migrated() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("migrate database");
        conn
    }

    fn create_parent(conn: &mut Connection) -> TaskRecord {
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
                title: "Recurring parent".into(),
                manual_lane: PlanningLane::Backlog,
                est_seconds: None,
            },
            T1,
        )
        .expect("create parent task")
    }

    fn weekly(parent_task_id: TaskId) -> NewRecurrenceRuleInput {
        NewRecurrenceRuleInput {
            parent_task_id,
            interval_count: 2,
            unit: RecurrenceUnit::Week,
            weekday_mask: 0b0010001,
            month_day: None,
            starts_local_date: "2026-09-07".into(),
            local_time: Some("09:30".into()),
            timezone: Some("Europe/Athens".into()),
            replace_existing: false,
        }
    }

    #[test]
    fn create_update_disable_and_delete_keep_parent_link_consistent() {
        let mut conn = migrated();
        let parent = create_parent(&mut conn);
        let rule = create_recurrence_rule(&mut conn, weekly(parent.id), T2)
            .expect("create recurrence rule");

        assert!(rule.is_active);
        assert_eq!(
            get_task(&conn, parent.id)
                .expect("load linked parent")
                .recurrence_rule_id,
            Some(rule.id)
        );
        assert_eq!(
            recurrence_rule_for_parent(&conn, parent.id)
                .expect("load rule by parent")
                .expect("parent should have rule")
                .id,
            rule.id
        );

        let updated = update_recurrence_rule(
            &mut conn,
            rule.id,
            UpdateRecurrenceRuleInput {
                interval_count: 1,
                unit: RecurrenceUnit::Month,
                weekday_mask: 0,
                month_day: Some(15),
                starts_local_date: "2026-09-15".into(),
                local_time: None,
                timezone: None,
                replace_existing: true,
            },
            T3,
        )
        .expect("update recurrence rule");
        assert_eq!(updated.unit, RecurrenceUnit::Month);
        assert_eq!(updated.month_day, Some(15));
        assert!(updated.replace_existing);

        let disabled = set_recurrence_rule_active(&mut conn, rule.id, false, T3)
            .expect("disable recurrence rule");
        assert!(!disabled.is_active);

        delete_recurrence_rule(&mut conn, rule.id, T4).expect("delete recurrence rule");
        assert!(recurrence_rule_for_parent(&conn, parent.id)
            .expect("query deleted parent rule")
            .is_none());
        assert!(get_task(&conn, parent.id)
            .expect("load detached parent")
            .recurrence_rule_id
            .is_none());
    }

    #[test]
    fn invalid_rule_shapes_are_rejected_before_write() {
        let mut conn = migrated();
        let parent = create_parent(&mut conn);

        let mut invalid = weekly(parent.id);
        invalid.interval_count = 0;
        assert!(matches!(
            create_recurrence_rule(&mut conn, invalid, T2),
            Err(RecurrenceStoreError::InvalidInterval)
        ));

        let mut invalid = weekly(parent.id);
        invalid.weekday_mask = 0;
        assert!(matches!(
            create_recurrence_rule(&mut conn, invalid, T2),
            Err(RecurrenceStoreError::InvalidPattern)
        ));

        let mut invalid = weekly(parent.id);
        invalid.unit = RecurrenceUnit::Month;
        invalid.month_day = Some(10);
        assert!(matches!(
            create_recurrence_rule(&mut conn, invalid, T2),
            Err(RecurrenceStoreError::InvalidPattern)
        ));

        let mut invalid = weekly(parent.id);
        invalid.timezone = None;
        assert!(matches!(
            create_recurrence_rule(&mut conn, invalid, T2),
            Err(RecurrenceStoreError::InvalidTimeTimezoneShape)
        ));

        assert!(recurrence_rule_for_parent(&conn, parent.id)
            .expect("query parent rule after rejected writes")
            .is_none());
    }

    #[test]
    fn duplicate_rule_for_parent_is_rejected() {
        let mut conn = migrated();
        let parent = create_parent(&mut conn);
        create_recurrence_rule(&mut conn, weekly(parent.id), T2)
            .expect("create first recurrence rule");

        assert!(matches!(
            create_recurrence_rule(&mut conn, weekly(parent.id), T3),
            Err(RecurrenceStoreError::AlreadyExists(id)) if id == parent.id
        ));
    }

    #[test]
    fn completed_parent_may_disable_but_not_create_or_reenable_rule() {
        let mut conn = migrated();
        let parent = create_parent(&mut conn);
        let rule = create_recurrence_rule(&mut conn, weekly(parent.id), T2)
            .expect("create recurrence rule");
        complete_task(&mut conn, parent.id, T3).expect("complete parent task");

        let disabled = set_recurrence_rule_active(&mut conn, rule.id, false, T4)
            .expect("completed parent may disable rule");
        assert!(!disabled.is_active);
        assert!(matches!(
            set_recurrence_rule_active(&mut conn, rule.id, true, T4),
            Err(RecurrenceStoreError::ParentCompleted(id)) if id == parent.id
        ));
    }

    #[test]
    fn archived_parent_list_blocks_rule_mutation() {
        let mut conn = migrated();
        let parent = create_parent(&mut conn);
        let rule = create_recurrence_rule(&mut conn, weekly(parent.id), T2)
            .expect("create recurrence rule");
        archive_list(&mut conn, parent.list_id, T3).expect("archive parent list");

        assert!(matches!(
            set_recurrence_rule_active(&mut conn, rule.id, false, T4),
            Err(RecurrenceStoreError::ParentListArchived(id)) if id == parent.list_id
        ));
    }

    #[test]
    fn delete_detaches_generated_children_and_preserves_child_task() {
        let mut conn = migrated();
        let parent = create_parent(&mut conn);
        let rule = create_recurrence_rule(&mut conn, weekly(parent.id), T2)
            .expect("create recurrence rule");
        let child = create_task(
            &mut conn,
            NewTaskInput {
                list_id: parent.list_id,
                title: "Generated child".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T2,
        )
        .expect("create child task");
        conn.execute(
            "UPDATE tasks SET recurrence_parent_task_id = ?1 WHERE id = ?2",
            params![parent.id.to_string(), child.id.to_string()],
        )
        .expect("link child to parent");
        conn.execute(
            "INSERT INTO recurrence_occurrences (
                child_task_id, recurrence_rule_id, occurrence_local_date, created_at
             ) VALUES (?1, ?2, '2026-09-07', ?3)",
            params![child.id.to_string(), rule.id.to_string(), T2],
        )
        .expect("insert occurrence metadata");

        delete_recurrence_rule(&mut conn, rule.id, T4).expect("delete recurrence metadata");

        let detached = get_task(&conn, child.id).expect("child task must remain");
        assert_eq!(detached.recurrence_parent_task_id, None);
        let occurrence_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM recurrence_occurrences", [], |row| {
                row.get(0)
            })
            .expect("count occurrence metadata");
        assert_eq!(occurrence_count, 0);
    }
}
