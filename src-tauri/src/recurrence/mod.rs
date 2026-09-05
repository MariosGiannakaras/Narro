//! Deterministic recurrence occurrence computation and transactional child materialization.
//!
//! Milestone 4 deliberately keeps orchestration (startup/resume/date-change scans), Replace Existing
//! Tasks and detachment outside this module until those behaviors are implemented as separate slices.

use crate::domain::ids::{RecurrenceRuleId, TaskId};
use crate::domain::model::{PlanningLane, RecurrenceUnit, ScheduleKind};
use crate::domain::recurrence::RecurrenceRuleRecord;
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::recurrence::{get_recurrence_rule, RecurrenceStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use crate::scheduling::{
    resolve_local_datetime_strict, validate_timezone_identifier, SchedulingError,
};
use chrono::{DateTime, Datelike, Duration, NaiveDate, NaiveTime};
use rusqlite::{params, Connection, OptionalExtension, Transaction, TransactionBehavior};
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RecurrenceOccurrence {
    pub local_date: String,
    pub local_time: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MaterializationReport {
    pub recurrence_rule_id: RecurrenceRuleId,
    pub current_local_date: String,
    pub evaluated_occurrences: Vec<RecurrenceOccurrence>,
    pub created_child_ids: Vec<TaskId>,
    pub existing_child_ids: Vec<TaskId>,
}

#[derive(Debug)]
pub enum RecurrenceError {
    Sqlite(rusqlite::Error),
    Store(RecurrenceStoreError),
    Task(TaskStoreError),
    List(ListStoreError),
    InvalidTimestamp,
    InvalidCurrentLocalDate,
    InvalidRuleStartDate,
    InvalidRuleLocalTime,
    InvalidRuleTimeTimezoneShape,
    InvalidRuleTimezone,
    AmbiguousOccurrenceLocalDateTime,
    OccurrenceTimezoneResolutionFailed,
    DateArithmeticOverflow,
    RankOverflow,
    ParentArchived(TaskId),
    ParentCompleted(TaskId),
    ParentListArchived,
    ParentRuleLinkMismatch(TaskId),
    InvalidStoredOccurrenceChild,
}

impl Display for RecurrenceError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "recurrence materialization failed: {error}"),
            Self::Store(error) => Display::fmt(error, formatter),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::InvalidTimestamp => {
                formatter.write_str("recurrence materialization timestamp must be RFC 3339")
            }
            Self::InvalidCurrentLocalDate => {
                formatter.write_str("current recurrence local date must use YYYY-MM-DD")
            }
            Self::InvalidRuleStartDate => {
                formatter.write_str("recurrence rule start date must use YYYY-MM-DD")
            }
            Self::InvalidRuleLocalTime => {
                formatter.write_str("recurrence rule local time must use 24-hour HH:MM")
            }
            Self::InvalidRuleTimeTimezoneShape => formatter.write_str(
                "recurrence rule local time and timezone must either both be present or both be absent",
            ),
            Self::InvalidRuleTimezone => {
                formatter.write_str("recurrence rule timezone must be a known IANA identifier")
            }
            Self::AmbiguousOccurrenceLocalDateTime => formatter.write_str(
                "recurrence occurrence local datetime is ambiguous or nonexistent in its timezone",
            ),
            Self::OccurrenceTimezoneResolutionFailed => {
                formatter.write_str("recurrence occurrence timezone resolution failed")
            }
            Self::DateArithmeticOverflow => {
                formatter.write_str("recurrence date arithmetic overflow")
            }
            Self::RankOverflow => formatter.write_str("recurrence child ordering rank overflow"),
            Self::ParentArchived(id) => write!(formatter, "recurrence parent is archived: {id}"),
            Self::ParentCompleted(id) => write!(formatter, "recurrence parent is completed: {id}"),
            Self::ParentListArchived => formatter.write_str("recurrence parent list is archived"),
            Self::ParentRuleLinkMismatch(id) => write!(
                formatter,
                "recurrence parent task does not link to the materialized recurrence rule: {id}"
            ),
            Self::InvalidStoredOccurrenceChild => {
                formatter.write_str("stored recurrence occurrence child identity is invalid")
            }
        }
    }
}

impl std::error::Error for RecurrenceError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Store(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for RecurrenceError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<RecurrenceStoreError> for RecurrenceError {
    fn from(value: RecurrenceStoreError) -> Self {
        Self::Store(value)
    }
}

impl From<TaskStoreError> for RecurrenceError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for RecurrenceError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

fn parse_date(value: &str, error: RecurrenceError) -> Result<NaiveDate, RecurrenceError> {
    NaiveDate::parse_from_str(value.trim(), "%Y-%m-%d").map_err(|_| error)
}

fn parse_rule_time(value: &str) -> Result<NaiveTime, RecurrenceError> {
    NaiveTime::parse_from_str(value.trim(), "%H:%M")
        .map_err(|_| RecurrenceError::InvalidRuleLocalTime)
}

fn monday_of(date: NaiveDate) -> Result<NaiveDate, RecurrenceError> {
    date.checked_sub_signed(Duration::days(i64::from(
        date.weekday().num_days_from_monday(),
    )))
    .ok_or(RecurrenceError::DateArithmeticOverflow)
}

fn weekday_selected(mask: u8, date: NaiveDate) -> bool {
    let bit = 1_u8 << date.weekday().num_days_from_monday();
    mask & bit != 0
}

fn month_index(date: NaiveDate) -> i64 {
    i64::from(date.year()) * 12 + i64::from(date.month0())
}

fn is_occurrence_date(
    rule: &RecurrenceRuleRecord,
    start: NaiveDate,
    candidate: NaiveDate,
) -> Result<bool, RecurrenceError> {
    if candidate < start || rule.interval_count == 0 {
        return Ok(false);
    }
    let interval = i64::from(rule.interval_count);

    match rule.unit {
        RecurrenceUnit::Day => {
            let days = candidate.signed_duration_since(start).num_days();
            Ok(days % interval == 0)
        }
        RecurrenceUnit::Week => {
            let start_monday = monday_of(start)?;
            let candidate_monday = monday_of(candidate)?;
            let weeks = candidate_monday
                .signed_duration_since(start_monday)
                .num_days()
                / 7;
            Ok(weeks % interval == 0 && weekday_selected(rule.weekday_mask, candidate))
        }
        RecurrenceUnit::Month => {
            let months = month_index(candidate) - month_index(start);
            if months < 0 || months % interval != 0 {
                return Ok(false);
            }
            match rule.month_day {
                Some(day) => Ok(candidate.day() == u32::from(day)),
                None => Ok(weekday_selected(rule.weekday_mask, candidate)),
            }
        }
        RecurrenceUnit::Year => {
            let years = i64::from(candidate.year()) - i64::from(start.year());
            Ok(years >= 0
                && years % interval == 0
                && candidate.month() == start.month()
                && candidate.day() == start.day())
        }
    }
}

fn normalized_rule_schedule(
    rule: &RecurrenceRuleRecord,
    local_date: NaiveDate,
) -> Result<(ScheduleKind, String, Option<String>, Option<String>), RecurrenceError> {
    let local_date_text = local_date.format("%Y-%m-%d").to_string();
    match (rule.local_time.as_deref(), rule.timezone.as_deref()) {
        (None, None) => Ok((ScheduleKind::DateOnly, local_date_text, None, None)),
        (Some(local_time), Some(timezone)) => {
            let time = parse_rule_time(local_time)?;
            let timezone = validate_timezone_identifier(timezone)
                .map_err(|_| RecurrenceError::InvalidRuleTimezone)?;
            resolve_local_datetime_strict(local_date, time, &timezone)
                .map_err(|error| match error {
                    SchedulingError::InvalidTimezone(_) => RecurrenceError::InvalidRuleTimezone,
                    SchedulingError::AmbiguousLocalDateTime { .. } => {
                        RecurrenceError::AmbiguousOccurrenceLocalDateTime
                    }
                    _ => RecurrenceError::OccurrenceTimezoneResolutionFailed,
                })?;
            Ok((
                ScheduleKind::LocalDateTime,
                local_date_text,
                Some(time.format("%H:%M").to_string()),
                Some(timezone),
            ))
        }
        _ => Err(RecurrenceError::InvalidRuleTimeTimezoneShape),
    }
}

pub fn occurrences_for_materialization_week(
    rule: &RecurrenceRuleRecord,
    current_local_date: &str,
) -> Result<Vec<RecurrenceOccurrence>, RecurrenceError> {
    if !rule.is_active {
        return Ok(Vec::new());
    }

    let current = parse_date(
        current_local_date,
        RecurrenceError::InvalidCurrentLocalDate,
    )?;
    let start = parse_date(
        &rule.starts_local_date,
        RecurrenceError::InvalidRuleStartDate,
    )?;
    let week_start = monday_of(current)?;

    let mut occurrences = Vec::new();
    for day_offset in 0_i64..7 {
        let candidate = week_start
            .checked_add_signed(Duration::days(day_offset))
            .ok_or(RecurrenceError::DateArithmeticOverflow)?;
        if !is_occurrence_date(rule, start, candidate)? {
            continue;
        }
        let (_, local_date, local_time, _) = normalized_rule_schedule(rule, candidate)?;
        occurrences.push(RecurrenceOccurrence {
            local_date,
            local_time,
        });
    }
    Ok(occurrences)
}

fn validate_timestamp(value: &str) -> Result<(), RecurrenceError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| RecurrenceError::InvalidTimestamp)
}

fn next_backlog_rank(tx: &Transaction<'_>, list_id: &str) -> Result<i64, RecurrenceError> {
    let current: Option<i64> = tx.query_row(
        "SELECT MAX(sort_rank)
         FROM tasks
         WHERE list_id = ?1
           AND manual_lane = 'backlog'
           AND completed_at IS NULL
           AND archived_at IS NULL",
        [list_id],
        |row| row.get(0),
    )?;
    match current {
        Some(rank) if rank >= i64::from(u32::MAX) => Err(RecurrenceError::RankOverflow),
        Some(rank) => rank.checked_add(1).ok_or(RecurrenceError::RankOverflow),
        None => Ok(0),
    }
}

fn normalize_parent_as_backlog(
    tx: &Transaction<'_>,
    parent: &crate::domain::tasks::TaskRecord,
    now: &str,
) -> Result<(), RecurrenceError> {
    if parent.manual_lane == PlanningLane::Backlog && parent.schedule_kind == ScheduleKind::None {
        return Ok(());
    }

    let rank = if parent.manual_lane == PlanningLane::Backlog {
        i64::from(parent.sort_rank)
    } else {
        next_backlog_rank(tx, &parent.list_id.to_string())?
    };
    let changed = tx.execute(
        "UPDATE tasks
         SET manual_lane = 'backlog',
             sort_rank = ?1,
             schedule_kind = 'none',
             scheduled_local_date = NULL,
             scheduled_local_time = NULL,
             schedule_timezone = NULL,
             updated_at = ?2
         WHERE id = ?3
           AND completed_at IS NULL
           AND archived_at IS NULL",
        params![rank, now, parent.id.to_string()],
    )?;
    if changed != 1 {
        return Err(RecurrenceError::ParentRuleLinkMismatch(parent.id));
    }
    Ok(())
}

fn existing_occurrence_child(
    tx: &Transaction<'_>,
    rule_id: RecurrenceRuleId,
    occurrence: &RecurrenceOccurrence,
) -> Result<Option<TaskId>, RecurrenceError> {
    let child: Option<String> = tx
        .query_row(
            "SELECT child_task_id
             FROM recurrence_occurrences
             WHERE recurrence_rule_id = ?1
               AND occurrence_local_date = ?2
               AND COALESCE(occurrence_local_time, '') = COALESCE(?3, '')",
            params![
                rule_id.to_string(),
                occurrence.local_date,
                occurrence.local_time
            ],
            |row| row.get(0),
        )
        .optional()?;
    child
        .map(|value| {
            TaskId::parse_str(&value).map_err(|_| RecurrenceError::InvalidStoredOccurrenceChild)
        })
        .transpose()
}

fn insert_occurrence_child(
    tx: &Transaction<'_>,
    rule: &RecurrenceRuleRecord,
    parent: &crate::domain::tasks::TaskRecord,
    occurrence: &RecurrenceOccurrence,
    now: &str,
) -> Result<TaskId, RecurrenceError> {
    let local_date = parse_date(
        &occurrence.local_date,
        RecurrenceError::InvalidCurrentLocalDate,
    )?;
    let (schedule_kind, local_date, local_time, timezone) =
        normalized_rule_schedule(rule, local_date)?;
    let rank = next_backlog_rank(tx, &parent.list_id.to_string())?;
    let child_id = TaskId::generate();

    tx.execute(
        "INSERT INTO tasks (
            id, list_id, title, manual_lane, sort_rank, est_seconds,
            schedule_kind, scheduled_local_date, scheduled_local_time, schedule_timezone,
            recurrence_parent_task_id, created_at, updated_at
         ) VALUES (?1, ?2, ?3, 'backlog', ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?11)",
        params![
            child_id.to_string(),
            parent.list_id.to_string(),
            parent.title,
            rank,
            parent.est_seconds.map(i64::from),
            schedule_kind.as_str(),
            local_date,
            local_time,
            timezone,
            parent.id.to_string(),
            now
        ],
    )?;

    tx.execute(
        "INSERT INTO recurrence_occurrences (
            child_task_id, recurrence_rule_id, occurrence_local_date,
            occurrence_local_time, created_at
         ) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            child_id.to_string(),
            rule.id.to_string(),
            occurrence.local_date,
            occurrence.local_time,
            now
        ],
    )?;
    Ok(child_id)
}

pub fn materialize_recurrence_week(
    conn: &mut Connection,
    rule_id: RecurrenceRuleId,
    current_local_date: &str,
    now: &str,
) -> Result<MaterializationReport, RecurrenceError> {
    validate_timestamp(now)?;
    let current = parse_date(
        current_local_date,
        RecurrenceError::InvalidCurrentLocalDate,
    )?;
    let current_text = current.format("%Y-%m-%d").to_string();

    let rule = get_recurrence_rule(conn, rule_id)?;
    let occurrences = occurrences_for_materialization_week(&rule, &current_text)?;
    let mut report = MaterializationReport {
        recurrence_rule_id: rule_id,
        current_local_date: current_text.clone(),
        evaluated_occurrences: occurrences.clone(),
        created_child_ids: Vec::new(),
        existing_child_ids: Vec::new(),
    };

    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let rule = get_recurrence_rule(&tx, rule_id)?;
    let parent = get_task(&tx, rule.parent_task_id)?;
    if parent.archived_at.is_some() {
        return Err(RecurrenceError::ParentArchived(parent.id));
    }
    if parent.completed_at.is_some() {
        return Err(RecurrenceError::ParentCompleted(parent.id));
    }
    let list = get_list(&tx, parent.list_id)?;
    if list.archived_at.is_some() {
        return Err(RecurrenceError::ParentListArchived);
    }
    if parent.recurrence_rule_id != Some(rule.id) {
        return Err(RecurrenceError::ParentRuleLinkMismatch(parent.id));
    }

    if !rule.is_active {
        tx.commit()?;
        return Ok(report);
    }

    normalize_parent_as_backlog(&tx, &parent, now)?;
    let parent = get_task(&tx, parent.id)?;

    for occurrence in &occurrences {
        if let Some(child_id) = existing_occurrence_child(&tx, rule.id, occurrence)? {
            report.existing_child_ids.push(child_id);
            continue;
        }
        report.created_child_ids.push(insert_occurrence_child(
            &tx,
            &rule,
            &parent,
            occurrence,
            now,
        )?);
    }

    tx.execute(
        "UPDATE recurrence_rules
         SET last_materialized_local_date = CASE
                 WHEN last_materialized_local_date IS NULL OR last_materialized_local_date < ?1
                 THEN ?1 ELSE last_materialized_local_date END,
             updated_at = ?2
         WHERE id = ?3",
        params![current_text, now, rule.id.to_string()],
    )?;
    tx.commit()?;
    Ok(report)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::ids::RecurrenceRuleId;

    fn rule(
        unit: RecurrenceUnit,
        interval_count: u32,
        weekday_mask: u8,
        month_day: Option<u8>,
        start: &str,
    ) -> RecurrenceRuleRecord {
        RecurrenceRuleRecord {
            id: RecurrenceRuleId::generate(),
            parent_task_id: TaskId::generate(),
            interval_count,
            unit,
            weekday_mask,
            month_day,
            starts_local_date: start.into(),
            local_time: None,
            timezone: None,
            replace_existing: false,
            is_active: true,
            last_materialized_local_date: None,
            created_at: "2026-09-01T00:00:00Z".into(),
            updated_at: "2026-09-01T00:00:00Z".into(),
        }
    }

    fn dates(values: &[RecurrenceOccurrence]) -> Vec<&str> {
        values.iter().map(|value| value.local_date.as_str()).collect()
    }

    #[test]
    fn daily_rule_materializes_each_due_day_in_current_monday_week() {
        let rule = rule(RecurrenceUnit::Day, 1, 0, None, "2026-09-07");
        let occurrences =
            occurrences_for_materialization_week(&rule, "2026-09-07").expect("daily occurrences");
        assert_eq!(
            dates(&occurrences),
            vec![
                "2026-09-07",
                "2026-09-08",
                "2026-09-09",
                "2026-09-10",
                "2026-09-11",
                "2026-09-12",
                "2026-09-13"
            ]
        );
    }

    #[test]
    fn weekday_preset_uses_monday_through_friday_bits() {
        let rule = rule(RecurrenceUnit::Week, 1, 0b0011111, None, "2026-09-07");
        let occurrences =
            occurrences_for_materialization_week(&rule, "2026-09-09").expect("weekday occurrences");
        assert_eq!(
            dates(&occurrences),
            vec![
                "2026-09-07",
                "2026-09-08",
                "2026-09-09",
                "2026-09-10",
                "2026-09-11"
            ]
        );
    }

    #[test]
    fn interval_week_rule_skips_non_qualifying_week() {
        let rule = rule(RecurrenceUnit::Week, 2, 0b0000001, None, "2026-09-07");
        assert!(occurrences_for_materialization_week(&rule, "2026-09-14")
            .expect("off week")
            .is_empty());
        assert_eq!(
            dates(
                &occurrences_for_materialization_week(&rule, "2026-09-21")
                    .expect("qualifying week")
            ),
            vec!["2026-09-21"]
        );
    }

    #[test]
    fn monthly_calendar_date_and_monthly_weekdays_are_deterministic() {
        let date_rule = rule(RecurrenceUnit::Month, 1, 0, Some(10), "2026-09-10");
        assert_eq!(
            dates(
                &occurrences_for_materialization_week(&date_rule, "2026-10-05")
                    .expect("monthly date")
            ),
            vec!["2026-10-10"]
        );

        let weekday_rule = rule(
            RecurrenceUnit::Month,
            1,
            0b0000101,
            None,
            "2026-09-01",
        );
        assert_eq!(
            dates(
                &occurrences_for_materialization_week(&weekday_rule, "2026-10-05")
                    .expect("monthly weekdays")
            ),
            vec!["2026-10-05", "2026-10-07"]
        );
    }

    #[test]
    fn yearly_february_29_rule_skips_non_leap_year() {
        let rule = rule(RecurrenceUnit::Year, 1, 0, None, "2024-02-29");
        assert!(occurrences_for_materialization_week(&rule, "2025-02-24")
            .expect("non leap year")
            .is_empty());
        assert_eq!(
            dates(
                &occurrences_for_materialization_week(&rule, "2028-02-28")
                    .expect("leap year")
            ),
            vec!["2028-02-29"]
        );
    }

    #[test]
    fn timed_dst_gap_fails_closed_before_any_materialization() {
        let mut rule = rule(RecurrenceUnit::Week, 1, 0b1000000, None, "2026-03-02");
        rule.local_time = Some("02:30".into());
        rule.timezone = Some("America/New_York".into());
        assert!(matches!(
            occurrences_for_materialization_week(&rule, "2026-03-02"),
            Err(RecurrenceError::AmbiguousOccurrenceLocalDateTime)
        ));
    }
}
