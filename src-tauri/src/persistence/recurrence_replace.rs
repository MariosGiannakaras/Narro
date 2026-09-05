use crate::domain::ids::{RecurrenceRuleId, TaskId};
use crate::domain::model::RecurrenceUnit;
use crate::domain::recurrence::{RecurrenceRuleRecord, UpdateRecurrenceRuleInput};
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::recurrence::{get_recurrence_rule, RecurrenceStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use crate::scheduling::{validate_timezone_identifier, SchedulingError};
use chrono::{DateTime, NaiveDate, NaiveTime};
use rusqlite::{params, Connection, TransactionBehavior};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ReplaceExistingReport {
    pub updated_rule: RecurrenceRuleRecord,
    pub removed_child_ids: Vec<TaskId>,
    pub detached_modified_child_ids: Vec<TaskId>,
}

#[derive(Debug)]
pub enum ReplaceExistingError {
    Sqlite(rusqlite::Error),
    Store(RecurrenceStoreError),
    Task(TaskStoreError),
    List(ListStoreError),
    Scheduling(SchedulingError),
    ReplaceFlagRequired,
    InvalidTimestamp,
    InvalidInterval,
    InvalidPattern,
    InvalidStartDate,
    InvalidLocalTime,
    InvalidTimeTimezoneShape,
    ParentArchived(TaskId),
    ParentCompleted(TaskId),
    ParentListArchived,
    ParentRuleLinkMismatch(TaskId),
    InvalidStoredChildIdentity,
}

impl Display for ReplaceExistingError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "replace-existing recurrence failed: {error}"),
            Self::Store(error) => Display::fmt(error, formatter),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::Scheduling(error) => Display::fmt(error, formatter),
            Self::ReplaceFlagRequired => formatter.write_str(
                "replace-existing recurrence requires replace_existing to be explicitly enabled",
            ),
            Self::InvalidTimestamp => {
                formatter.write_str("replace-existing timestamp must be RFC 3339")
            }
            Self::InvalidInterval => {
                formatter.write_str("recurrence interval must be greater than zero")
            }
            Self::InvalidPattern => {
                formatter.write_str("recurrence selector shape is invalid for the selected unit")
            }
            Self::InvalidStartDate => {
                formatter.write_str("recurrence start date must use YYYY-MM-DD")
            }
            Self::InvalidLocalTime => {
                formatter.write_str("recurrence local time must use 24-hour HH:MM")
            }
            Self::InvalidTimeTimezoneShape => formatter.write_str(
                "recurrence local time and timezone must either both be present or both be absent",
            ),
            Self::ParentArchived(id) => write!(formatter, "recurrence parent is archived: {id}"),
            Self::ParentCompleted(id) => write!(formatter, "recurrence parent is completed: {id}"),
            Self::ParentListArchived => formatter.write_str("recurrence parent list is archived"),
            Self::ParentRuleLinkMismatch(id) => write!(
                formatter,
                "recurrence parent task does not link to the replaced recurrence rule: {id}"
            ),
            Self::InvalidStoredChildIdentity => {
                formatter.write_str("stored recurrence child identity is invalid")
            }
        }
    }
}

impl std::error::Error for ReplaceExistingError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Store(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            Self::Scheduling(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for ReplaceExistingError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<RecurrenceStoreError> for ReplaceExistingError {
    fn from(value: RecurrenceStoreError) -> Self {
        Self::Store(value)
    }
}

impl From<TaskStoreError> for ReplaceExistingError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for ReplaceExistingError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

impl From<SchedulingError> for ReplaceExistingError {
    fn from(value: SchedulingError) -> Self {
        Self::Scheduling(value)
    }
}

#[derive(Debug)]
struct NormalizedReplacement {
    interval_count: i64,
    unit: RecurrenceUnit,
    weekday_mask: u8,
    month_day: Option<u8>,
    starts_local_date: String,
    local_time: Option<String>,
    timezone: Option<String>,
}

fn normalize_replacement(
    input: &UpdateRecurrenceRuleInput,
) -> Result<NormalizedReplacement, ReplaceExistingError> {
    if !input.replace_existing {
        return Err(ReplaceExistingError::ReplaceFlagRequired);
    }
    if input.interval_count == 0 {
        return Err(ReplaceExistingError::InvalidInterval);
    }
    if input.month_day.is_some_and(|day| !(1..=31).contains(&day)) {
        return Err(ReplaceExistingError::InvalidPattern);
    }

    let valid_pattern = match input.unit {
        RecurrenceUnit::Day | RecurrenceUnit::Year => {
            input.weekday_mask == 0 && input.month_day.is_none()
        }
        RecurrenceUnit::Week => input.weekday_mask != 0 && input.month_day.is_none(),
        RecurrenceUnit::Month => (input.weekday_mask != 0) ^ input.month_day.is_some(),
    };
    if !valid_pattern {
        return Err(ReplaceExistingError::InvalidPattern);
    }

    let starts_local_date = NaiveDate::parse_from_str(input.starts_local_date.trim(), "%Y-%m-%d")
        .map_err(|_| ReplaceExistingError::InvalidStartDate)?
        .format("%Y-%m-%d")
        .to_string();

    let (local_time, timezone) = match (input.local_time.as_deref(), input.timezone.as_deref()) {
        (None, None) => (None, None),
        (Some(local_time), Some(timezone)) => {
            let local_time = NaiveTime::parse_from_str(local_time.trim(), "%H:%M")
                .map_err(|_| ReplaceExistingError::InvalidLocalTime)?
                .format("%H:%M")
                .to_string();
            let timezone = validate_timezone_identifier(timezone)?;
            (Some(local_time), Some(timezone))
        }
        _ => return Err(ReplaceExistingError::InvalidTimeTimezoneShape),
    };

    Ok(NormalizedReplacement {
        interval_count: i64::from(input.interval_count),
        unit: input.unit,
        weekday_mask: input.weekday_mask,
        month_day: input.month_day,
        starts_local_date,
        local_time,
        timezone,
    })
}

fn parse_child_id(value: String) -> Result<TaskId, ReplaceExistingError> {
    TaskId::parse_str(&value).map_err(|_| ReplaceExistingError::InvalidStoredChildIdentity)
}

fn has_owned_history(
    tx: &rusqlite::Transaction<'_>,
    child_id: TaskId,
) -> Result<bool, ReplaceExistingError> {
    let child_id = child_id.to_string();
    let exists: i64 = tx.query_row(
        "SELECT EXISTS(
            SELECT 1 FROM subtasks WHERE task_id = ?1
            UNION ALL SELECT 1 FROM task_notes WHERE task_id = ?1
            UNION ALL SELECT 1 FROM reminders WHERE task_id = ?1
            UNION ALL SELECT 1 FROM sessions WHERE task_id = ?1
            UNION ALL SELECT 1 FROM task_timer_preferences WHERE task_id = ?1
         )",
        [child_id],
        |row| row.get(0),
    )?;
    Ok(exists == 1)
}

pub fn replace_existing_tasks(
    conn: &mut Connection,
    rule_id: RecurrenceRuleId,
    input: UpdateRecurrenceRuleInput,
    now: &str,
) -> Result<ReplaceExistingReport, ReplaceExistingError> {
    DateTime::parse_from_rfc3339(now).map_err(|_| ReplaceExistingError::InvalidTimestamp)?;
    let normalized = normalize_replacement(&input)?;

    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = get_recurrence_rule(&tx, rule_id)?;
    let parent = get_task(&tx, current.parent_task_id)?;
    if parent.archived_at.is_some() {
        return Err(ReplaceExistingError::ParentArchived(parent.id));
    }
    if parent.completed_at.is_some() {
        return Err(ReplaceExistingError::ParentCompleted(parent.id));
    }
    let list = get_list(&tx, parent.list_id)?;
    if list.archived_at.is_some() {
        return Err(ReplaceExistingError::ParentListArchived);
    }
    if parent.recurrence_rule_id != Some(rule_id) {
        return Err(ReplaceExistingError::ParentRuleLinkMismatch(parent.id));
    }

    let mut statement = tx.prepare(
        "SELECT t.id, t.completed_at, t.archived_at, t.created_at, t.updated_at,
                t.manual_time_adjustment_seconds
         FROM recurrence_occurrences ro
         JOIN tasks t ON t.id = ro.child_task_id
         WHERE ro.recurrence_rule_id = ?1
           AND t.recurrence_parent_task_id = ?2
         ORDER BY ro.occurrence_local_date, COALESCE(ro.occurrence_local_time, ''), t.id",
    )?;
    let rows = statement.query_map(
        params![rule_id.to_string(), parent.id.to_string()],
        |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, Option<String>>(1)?,
                row.get::<_, Option<String>>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, i64>(5)?,
            ))
        },
    )?;
    let candidates: Vec<_> = rows.collect::<Result<_, _>>()?;
    drop(statement);

    let mut removed_child_ids = Vec::new();
    let mut detached_modified_child_ids = Vec::new();

    for (raw_id, completed_at, archived_at, created_at, updated_at, manual_adjustment) in
        candidates
    {
        let child_id = parse_child_id(raw_id)?;
        if completed_at.is_some() || archived_at.is_some() {
            continue;
        }

        let pristine = created_at == updated_at
            && manual_adjustment == 0
            && !has_owned_history(&tx, child_id)?;
        if pristine {
            let deleted = tx.execute(
                "DELETE FROM tasks
                 WHERE id = ?1
                   AND recurrence_parent_task_id = ?2
                   AND completed_at IS NULL
                   AND archived_at IS NULL",
                params![child_id.to_string(), parent.id.to_string()],
            )?;
            if deleted == 1 {
                removed_child_ids.push(child_id);
            } else {
                return Err(ReplaceExistingError::ParentRuleLinkMismatch(parent.id));
            }
        } else {
            let detached = tx.execute(
                "UPDATE tasks
                 SET recurrence_parent_task_id = NULL, updated_at = ?1
                 WHERE id = ?2
                   AND recurrence_parent_task_id = ?3
                   AND completed_at IS NULL
                   AND archived_at IS NULL",
                params![now, child_id.to_string(), parent.id.to_string()],
            )?;
            if detached != 1 {
                return Err(ReplaceExistingError::ParentRuleLinkMismatch(parent.id));
            }
            tx.execute(
                "DELETE FROM recurrence_occurrences
                 WHERE child_task_id = ?1 AND recurrence_rule_id = ?2",
                params![child_id.to_string(), rule_id.to_string()],
            )?;
            detached_modified_child_ids.push(child_id);
        }
    }

    let changed = tx.execute(
        "UPDATE recurrence_rules
         SET interval_count = ?1,
             unit = ?2,
             weekday_mask = ?3,
             month_day = ?4,
             starts_local_date = ?5,
             local_time = ?6,
             timezone = ?7,
             replace_existing = 1,
             last_materialized_local_date = NULL,
             updated_at = ?8
         WHERE id = ?9",
        params![
            normalized.interval_count,
            normalized.unit.as_str(),
            i64::from(normalized.weekday_mask),
            normalized.month_day.map(i64::from),
            normalized.starts_local_date,
            normalized.local_time,
            normalized.timezone,
            now,
            rule_id.to_string()
        ],
    )?;
    if changed != 1 {
        return Err(ReplaceExistingError::Store(
            RecurrenceStoreError::NotFound(rule_id),
        ));
    }
    tx.execute(
        "UPDATE tasks SET updated_at = ?1 WHERE id = ?2",
        params![now, parent.id.to_string()],
    )?;

    let updated_rule = get_recurrence_rule(&tx, rule_id)?;
    tx.commit()?;

    Ok(ReplaceExistingReport {
        updated_rule,
        removed_child_ids,
        detached_modified_child_ids,
    })
}
