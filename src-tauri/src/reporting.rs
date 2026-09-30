use crate::domain::ids::{ListId, SessionId, TaskId};
use crate::domain::sessions::{SessionKind, SessionSource};
use chrono::{DateTime, Datelike, FixedOffset, NaiveDate};
use jiff::{tz::TimeZone, Timestamp};
use rusqlite::{Connection, Row};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashMap, HashSet};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportRange {
    pub start_at: String,
    pub end_at: String,
    pub list_id: Option<ListId>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportSessionRow {
    pub id: SessionId,
    pub task_id: Option<TaskId>,
    pub task_title: Option<String>,
    pub list_id: Option<ListId>,
    pub list_title: Option<String>,
    pub kind: SessionKind,
    pub source: SessionSource,
    pub started_at: String,
    pub ended_at: String,
    pub duration_seconds: u64,
    pub task_archived: bool,
    pub list_archived: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportCompletedTaskRow {
    pub task_id: TaskId,
    pub list_id: ListId,
    pub task_title: String,
    pub list_title: String,
    pub est_seconds: Option<u32>,
    pub completed_at: String,
    pub time_taken_seconds: u64,
    pub task_archived: bool,
    pub list_archived: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportHistorySnapshot {
    pub range: ReportRange,
    pub sessions: Vec<ReportSessionRow>,
    pub completed_tasks: Vec<ReportCompletedTaskRow>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReportOverviewSummary {
    pub total_work_days: u64,
    pub total_tasks_done: u64,
    pub average_tasks_per_work_day: Option<f64>,
    pub total_time_seconds: u64,
    pub average_time_per_work_day_seconds: Option<f64>,
    pub average_time_per_task_seconds: Option<f64>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportDailySeriesPoint {
    pub local_date: String,
    pub task_seconds: u64,
    pub break_seconds: u64,
    pub total_seconds: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportProductiveSummary {
    pub local_hour_start: Option<u8>,
    pub weekday_from_monday: Option<u8>,
    pub month_key: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportTimeByListRow {
    pub list_id: ListId,
    pub list_title: String,
    pub work_seconds: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReportCompletionTimingKind {
    Early,
    OnTime,
    Late,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportCompletionTiming {
    pub kind: ReportCompletionTimingKind,
    pub difference_seconds: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportDoneTaskInsight {
    pub task: ReportCompletedTaskRow,
    pub timing: Option<ReportCompletionTiming>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReportPunctualitySummary {
    pub early_seconds: u64,
    pub late_seconds: u64,
    pub early_percent: Option<f64>,
    pub late_percent: Option<f64>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReportOverview {
    pub summary: ReportOverviewSummary,
    pub daily_series: Vec<ReportDailySeriesPoint>,
    pub productive: ReportProductiveSummary,
    pub time_by_list: Vec<ReportTimeByListRow>,
    pub done_tasks: Vec<ReportDoneTaskInsight>,
    pub punctuality: ReportPunctualitySummary,
}

#[derive(Debug)]
pub enum ReportingError {
    Sqlite(rusqlite::Error),
    InvalidRangeTimestamp(&'static str),
    EmptyOrReversedRange,
    CorruptIdentity { field: &'static str, value: String },
    CorruptToken { field: &'static str, value: String },
    CorruptTimestamp { field: &'static str, value: String },
    CorruptDuration(i64),
    CorruptEstimate(i64),
    CorruptTimeTaken(i64),
    TimeTakenOverflow,
    AggregationOverflow,
    InvalidDisplayTimezone(String),
    TimezoneConversionFailed(String),
    MissingJoinedTask(SessionId),
    MissingJoinedList(TaskId),
}

impl Display for ReportingError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "reporting query failed: {error}"),
            Self::InvalidRangeTimestamp(field) => {
                write!(formatter, "report {field} must be an RFC 3339 timestamp")
            }
            Self::EmptyOrReversedRange => {
                formatter.write_str("report range end must be after its start")
            }
            Self::CorruptIdentity { field, value } => {
                write!(
                    formatter,
                    "stored report {field} identity is invalid: {value}"
                )
            }
            Self::CorruptToken { field, value } => {
                write!(formatter, "stored report {field} token is invalid: {value}")
            }
            Self::CorruptTimestamp { field, value } => {
                write!(
                    formatter,
                    "stored report {field} timestamp is invalid: {value}"
                )
            }
            Self::CorruptDuration(value) => {
                write!(
                    formatter,
                    "stored report session duration is invalid: {value}"
                )
            }
            Self::CorruptEstimate(value) => {
                write!(formatter, "stored report task estimate is invalid: {value}")
            }
            Self::CorruptTimeTaken(value) => {
                write!(
                    formatter,
                    "stored report task time taken is invalid: {value}"
                )
            }
            Self::TimeTakenOverflow => formatter.write_str("report task time taken overflowed"),
            Self::AggregationOverflow => formatter.write_str("report aggregation overflowed"),
            Self::InvalidDisplayTimezone(value) => {
                write!(formatter, "report display timezone is invalid: {value}")
            }
            Self::TimezoneConversionFailed(value) => {
                write!(formatter, "report timezone conversion failed: {value}")
            }
            Self::MissingJoinedTask(id) => {
                write!(formatter, "report session task is missing: {id}")
            }
            Self::MissingJoinedList(id) => {
                write!(formatter, "report task list is missing for task: {id}")
            }
        }
    }
}

impl std::error::Error for ReportingError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for ReportingError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

struct ValidatedRange {
    start: DateTime<FixedOffset>,
    end: DateTime<FixedOffset>,
}

fn validate_range(range: &ReportRange) -> Result<ValidatedRange, ReportingError> {
    let start = DateTime::parse_from_rfc3339(&range.start_at)
        .map_err(|_| ReportingError::InvalidRangeTimestamp("start_at"))?;
    let end = DateTime::parse_from_rfc3339(&range.end_at)
        .map_err(|_| ReportingError::InvalidRangeTimestamp("end_at"))?;
    if end <= start {
        return Err(ReportingError::EmptyOrReversedRange);
    }
    Ok(ValidatedRange { start, end })
}

fn parse_stored_timestamp(
    field: &'static str,
    value: &str,
) -> Result<DateTime<FixedOffset>, ReportingError> {
    DateTime::parse_from_rfc3339(value).map_err(|_| ReportingError::CorruptTimestamp {
        field,
        value: value.to_owned(),
    })
}

fn parse_session_id(value: String) -> Result<SessionId, ReportingError> {
    SessionId::parse_str(&value).map_err(|_| ReportingError::CorruptIdentity {
        field: "session",
        value,
    })
}

fn parse_task_id(field: &'static str, value: String) -> Result<TaskId, ReportingError> {
    TaskId::parse_str(&value).map_err(|_| ReportingError::CorruptIdentity { field, value })
}

fn parse_list_id(value: String) -> Result<ListId, ReportingError> {
    ListId::parse_str(&value).map_err(|_| ReportingError::CorruptIdentity {
        field: "list",
        value,
    })
}

#[derive(Debug)]
struct RawSessionRow {
    id: String,
    task_id: Option<String>,
    task_title: Option<String>,
    list_id: Option<String>,
    list_title: Option<String>,
    kind: String,
    source: String,
    started_at: String,
    ended_at: String,
    duration_seconds: i64,
    task_archived_at: Option<String>,
    list_archived_at: Option<String>,
}

fn raw_session_row(row: &Row<'_>) -> rusqlite::Result<RawSessionRow> {
    Ok(RawSessionRow {
        id: row.get(0)?,
        task_id: row.get(1)?,
        task_title: row.get(2)?,
        list_id: row.get(3)?,
        list_title: row.get(4)?,
        kind: row.get(5)?,
        source: row.get(6)?,
        started_at: row.get(7)?,
        ended_at: row.get(8)?,
        duration_seconds: row.get(9)?,
        task_archived_at: row.get(10)?,
        list_archived_at: row.get(11)?,
    })
}

fn decode_session_row(
    raw: RawSessionRow,
    validated: &ValidatedRange,
) -> Result<Option<ReportSessionRow>, ReportingError> {
    let id = parse_session_id(raw.id)?;
    let started = parse_stored_timestamp("session.started_at", &raw.started_at)?;
    parse_stored_timestamp("session.ended_at", &raw.ended_at)?;
    if started < validated.start || started >= validated.end {
        return Ok(None);
    }

    let kind = SessionKind::parse(&raw.kind).ok_or_else(|| ReportingError::CorruptToken {
        field: "session.kind",
        value: raw.kind.clone(),
    })?;
    let source = SessionSource::parse(&raw.source).ok_or_else(|| ReportingError::CorruptToken {
        field: "session.source",
        value: raw.source.clone(),
    })?;
    if raw.duration_seconds < 0 {
        return Err(ReportingError::CorruptDuration(raw.duration_seconds));
    }

    let task_id = raw
        .task_id
        .map(|value| parse_task_id("task", value))
        .transpose()?;
    let list_id = raw.list_id.map(parse_list_id).transpose()?;
    if kind == SessionKind::Work && task_id.is_none() {
        return Err(ReportingError::MissingJoinedTask(id));
    }
    if task_id.is_some()
        && (raw.task_title.is_none() || list_id.is_none() || raw.list_title.is_none())
    {
        return Err(ReportingError::MissingJoinedTask(id));
    }

    Ok(Some(ReportSessionRow {
        id,
        task_id,
        task_title: raw.task_title,
        list_id,
        list_title: raw.list_title,
        kind,
        source,
        started_at: raw.started_at,
        ended_at: raw.ended_at,
        duration_seconds: u64::try_from(raw.duration_seconds)
            .map_err(|_| ReportingError::CorruptDuration(raw.duration_seconds))?,
        task_archived: raw.task_archived_at.is_some(),
        list_archived: raw.list_archived_at.is_some(),
    }))
}

#[derive(Debug)]
struct RawCompletedTaskRow {
    task_id: String,
    list_id: String,
    task_title: String,
    list_title: String,
    est_seconds: Option<i64>,
    completed_at: String,
    manual_adjustment_seconds: i64,
    work_seconds: i64,
    task_archived_at: Option<String>,
    list_archived_at: Option<String>,
}

fn raw_completed_task_row(row: &Row<'_>) -> rusqlite::Result<RawCompletedTaskRow> {
    Ok(RawCompletedTaskRow {
        task_id: row.get(0)?,
        list_id: row.get(1)?,
        task_title: row.get(2)?,
        list_title: row.get(3)?,
        est_seconds: row.get(4)?,
        completed_at: row.get(5)?,
        manual_adjustment_seconds: row.get(6)?,
        work_seconds: row.get(7)?,
        task_archived_at: row.get(8)?,
        list_archived_at: row.get(9)?,
    })
}

fn decode_completed_task_row(
    raw: RawCompletedTaskRow,
    validated: &ValidatedRange,
) -> Result<Option<ReportCompletedTaskRow>, ReportingError> {
    let completed = parse_stored_timestamp("task.completed_at", &raw.completed_at)?;
    if completed < validated.start || completed >= validated.end {
        return Ok(None);
    }

    let task_id = parse_task_id("task", raw.task_id)?;
    let list_id = parse_list_id(raw.list_id)?;
    let est_seconds = match raw.est_seconds {
        Some(value) if value > 0 => {
            Some(u32::try_from(value).map_err(|_| ReportingError::CorruptEstimate(value))?)
        }
        Some(value) => return Err(ReportingError::CorruptEstimate(value)),
        None => None,
    };
    if raw.work_seconds < 0 {
        return Err(ReportingError::CorruptTimeTaken(raw.work_seconds));
    }
    let effective = raw
        .work_seconds
        .checked_add(raw.manual_adjustment_seconds)
        .ok_or(ReportingError::TimeTakenOverflow)?;
    if effective < 0 {
        return Err(ReportingError::CorruptTimeTaken(effective));
    }

    Ok(Some(ReportCompletedTaskRow {
        task_id,
        list_id,
        task_title: raw.task_title,
        list_title: raw.list_title,
        est_seconds,
        completed_at: raw.completed_at,
        time_taken_seconds: u64::try_from(effective)
            .map_err(|_| ReportingError::TimeTakenOverflow)?,
        task_archived: raw.task_archived_at.is_some(),
        list_archived: raw.list_archived_at.is_some(),
    }))
}

fn report_sessions(
    conn: &Connection,
    range: &ReportRange,
    validated: &ValidatedRange,
) -> Result<Vec<ReportSessionRow>, ReportingError> {
    let list_filter = range.list_id.map(|id| id.to_string());
    let mut statement = conn.prepare(
        "SELECT
            s.id,
            s.task_id,
            t.title,
            t.list_id,
            l.title,
            s.kind,
            s.source,
            s.started_at,
            s.ended_at,
            s.duration_seconds,
            t.archived_at,
            l.archived_at
         FROM sessions s
         LEFT JOIN tasks t ON t.id = s.task_id
         LEFT JOIN lists l ON l.id = t.list_id
         WHERE s.ended_at IS NOT NULL
           AND (?1 IS NULL OR t.list_id = ?1)
         ORDER BY s.started_at, s.id",
    )?;
    let rows = statement.query_map([list_filter.as_deref()], raw_session_row)?;
    let mut result = Vec::new();
    for row in rows {
        if let Some(decoded) = decode_session_row(row?, validated)? {
            result.push(decoded);
        }
    }
    Ok(result)
}

fn report_completed_tasks(
    conn: &Connection,
    range: &ReportRange,
    validated: &ValidatedRange,
) -> Result<Vec<ReportCompletedTaskRow>, ReportingError> {
    let list_filter = range.list_id.map(|id| id.to_string());
    let mut statement = conn.prepare(
        "SELECT
            t.id,
            t.list_id,
            t.title,
            l.title,
            t.est_seconds,
            t.completed_at,
            t.manual_time_adjustment_seconds,
            COALESCE(SUM(CASE WHEN s.kind = 'work' THEN s.duration_seconds ELSE 0 END), 0),
            t.archived_at,
            l.archived_at
         FROM tasks t
         JOIN lists l ON l.id = t.list_id
         LEFT JOIN sessions s ON s.task_id = t.id
         WHERE t.completed_at IS NOT NULL
           AND (?1 IS NULL OR t.list_id = ?1)
         GROUP BY
            t.id, t.list_id, t.title, l.title, t.est_seconds, t.completed_at,
            t.manual_time_adjustment_seconds, t.archived_at, l.archived_at
         ORDER BY t.completed_at, t.id",
    )?;
    let rows = statement.query_map([list_filter.as_deref()], raw_completed_task_row)?;
    let mut result = Vec::new();
    for row in rows {
        if let Some(decoded) = decode_completed_task_row(row?, validated)? {
            result.push(decoded);
        }
    }
    Ok(result)
}

pub fn report_history_snapshot(
    conn: &Connection,
    range: ReportRange,
) -> Result<ReportHistorySnapshot, ReportingError> {
    let validated = validate_range(&range)?;
    let sessions = report_sessions(conn, &range, &validated)?;
    let completed_tasks = report_completed_tasks(conn, &range, &validated)?;
    Ok(ReportHistorySnapshot {
        range,
        sessions,
        completed_tasks,
    })
}

#[derive(Debug, Clone)]
struct LocalSessionBucket {
    date: String,
    month: String,
    hour: u8,
    weekday_from_monday: u8,
}

fn resolve_report_timezone(value: &str) -> Result<TimeZone, ReportingError> {
    let normalized = value.trim();
    if normalized.is_empty()
        || normalized.len() > 128
        || normalized.chars().any(char::is_control)
    {
        return Err(ReportingError::InvalidDisplayTimezone(value.to_owned()));
    }
    TimeZone::get(normalized)
        .map_err(|_| ReportingError::InvalidDisplayTimezone(value.to_owned()))
}

fn local_session_bucket(
    started_at: &str,
    timezone: &TimeZone,
) -> Result<LocalSessionBucket, ReportingError> {
    let timestamp = started_at
        .parse::<Timestamp>()
        .map_err(|_| ReportingError::CorruptTimestamp {
            field: "session.started_at",
            value: started_at.to_owned(),
        })?;
    let local = timezone.to_datetime(timestamp);
    let date = local.date().to_string();
    let parsed_date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|_| ReportingError::TimezoneConversionFailed(date.clone()))?;
    let local_text = local.to_string();
    let hour = local_text
        .get(11..13)
        .and_then(|value| value.parse::<u8>().ok())
        .filter(|value| *value < 24)
        .ok_or_else(|| ReportingError::TimezoneConversionFailed(local_text.clone()))?;
    Ok(LocalSessionBucket {
        month: date.chars().take(7).collect(),
        date,
        hour,
        weekday_from_monday: parsed_date.weekday().num_days_from_monday() as u8,
    })
}

fn checked_aggregate_add(target: &mut u64, value: u64) -> Result<(), ReportingError> {
    *target = target
        .checked_add(value)
        .ok_or(ReportingError::AggregationOverflow)?;
    Ok(())
}

fn ratio(numerator: u64, denominator: u64) -> Option<f64> {
    if denominator == 0 {
        None
    } else {
        Some((numerator as f64) / (denominator as f64))
    }
}

fn completion_timing(task: &ReportCompletedTaskRow) -> Option<ReportCompletionTiming> {
    let estimate = u64::from(task.est_seconds?);
    let taken = task.time_taken_seconds;
    Some(if taken < estimate {
        ReportCompletionTiming {
            kind: ReportCompletionTimingKind::Early,
            difference_seconds: estimate - taken,
        }
    } else if taken > estimate {
        ReportCompletionTiming {
            kind: ReportCompletionTimingKind::Late,
            difference_seconds: taken - estimate,
        }
    } else {
        ReportCompletionTiming {
            kind: ReportCompletionTimingKind::OnTime,
            difference_seconds: 0,
        }
    })
}

/// Aggregates authoritative closed-session durations into local report buckets.
///
/// Session duration remains the accounting authority. Calendar buckets use the
/// local date/hour containing each session start instead of reconstructing
/// duration from wall-clock elapsed time, which may include excluded sleep or
/// other lifecycle gaps.
pub fn overview_from_history(
    history: &ReportHistorySnapshot,
    display_timezone: &str,
) -> Result<ReportOverview, ReportingError> {
    let timezone = resolve_report_timezone(display_timezone)?;
    let mut active_dates = HashSet::<String>::new();
    let mut daily = BTreeMap::<String, (u64, u64)>::new();
    let mut total_time_seconds = 0_u64;
    let mut work_by_task = HashMap::<String, u64>::new();
    let mut work_by_hour = HashMap::<u8, u64>::new();
    let mut work_sessions_by_weekday = HashMap::<u8, (u64, u64)>::new();
    let mut work_by_month = HashMap::<String, u64>::new();
    let mut work_by_list = HashMap::<String, (ListId, String, u64)>::new();

    for session in &history.sessions {
        let bucket = local_session_bucket(&session.started_at, &timezone)?;
        active_dates.insert(bucket.date.clone());
        checked_aggregate_add(&mut total_time_seconds, session.duration_seconds)?;

        let day = daily.entry(bucket.date).or_insert((0, 0));
        match session.kind {
            SessionKind::Work => {
                checked_aggregate_add(&mut day.0, session.duration_seconds)?;

                let task_id = session
                    .task_id
                    .ok_or(ReportingError::MissingJoinedTask(session.id))?;
                let task_total = work_by_task.entry(task_id.to_string()).or_insert(0);
                checked_aggregate_add(task_total, session.duration_seconds)?;

                let hour_total = work_by_hour.entry(bucket.hour).or_insert(0);
                checked_aggregate_add(hour_total, session.duration_seconds)?;

                let weekday = work_sessions_by_weekday
                    .entry(bucket.weekday_from_monday)
                    .or_insert((0, 0));
                weekday.0 = weekday
                    .0
                    .checked_add(1)
                    .ok_or(ReportingError::AggregationOverflow)?;
                checked_aggregate_add(&mut weekday.1, session.duration_seconds)?;

                let month_total = work_by_month.entry(bucket.month).or_insert(0);
                checked_aggregate_add(month_total, session.duration_seconds)?;

                let list_id = session
                    .list_id
                    .ok_or(ReportingError::MissingJoinedTask(session.id))?;
                let list_title = session
                    .list_title
                    .as_ref()
                    .ok_or(ReportingError::MissingJoinedTask(session.id))?;
                let list = work_by_list
                    .entry(list_id.to_string())
                    .or_insert((list_id, list_title.clone(), 0));
                checked_aggregate_add(&mut list.2, session.duration_seconds)?;
            }
            SessionKind::Break => {
                checked_aggregate_add(&mut day.1, session.duration_seconds)?;
            }
        }
    }

    let total_work_days = u64::try_from(active_dates.len())
        .map_err(|_| ReportingError::AggregationOverflow)?;
    let total_tasks_done = u64::try_from(history.completed_tasks.len())
        .map_err(|_| ReportingError::AggregationOverflow)?;
    let tracked_task_count = u64::try_from(work_by_task.len())
        .map_err(|_| ReportingError::AggregationOverflow)?;
    let total_work_seconds = work_by_task
        .values()
        .try_fold(0_u64, |total, seconds| {
            total
                .checked_add(*seconds)
                .ok_or(ReportingError::AggregationOverflow)
        })?;

    let daily_series = daily
        .into_iter()
        .map(|(local_date, (task_seconds, break_seconds))| {
            let total_seconds = task_seconds
                .checked_add(break_seconds)
                .ok_or(ReportingError::AggregationOverflow)?;
            Ok(ReportDailySeriesPoint {
                local_date,
                task_seconds,
                break_seconds,
                total_seconds,
            })
        })
        .collect::<Result<Vec<_>, ReportingError>>()?;

    let productive_hour = work_by_hour
        .into_iter()
        .max_by(|left, right| {
            left.1
                .cmp(&right.1)
                .then_with(|| right.0.cmp(&left.0))
        })
        .map(|(hour, _)| hour);

    let productive_day = work_sessions_by_weekday
        .into_iter()
        .max_by(|left, right| {
            left.1
                .0
                .cmp(&right.1.0)
                .then_with(|| left.1.1.cmp(&right.1.1))
                .then_with(|| right.0.cmp(&left.0))
        })
        .map(|(weekday, _)| weekday);

    let productive_month = work_by_month
        .into_iter()
        .max_by(|left, right| {
            left.1
                .cmp(&right.1)
                .then_with(|| right.0.cmp(&left.0))
        })
        .map(|(month, _)| month);

    let mut time_by_list = work_by_list
        .into_values()
        .map(|(list_id, list_title, work_seconds)| ReportTimeByListRow {
            list_id,
            list_title,
            work_seconds,
        })
        .collect::<Vec<_>>();
    time_by_list.sort_by(|left, right| {
        right
            .work_seconds
            .cmp(&left.work_seconds)
            .then_with(|| left.list_title.cmp(&right.list_title))
            .then_with(|| left.list_id.to_string().cmp(&right.list_id.to_string()))
    });

    let mut early_seconds = 0_u64;
    let mut late_seconds = 0_u64;
    let done_tasks = history
        .completed_tasks
        .iter()
        .cloned()
        .map(|task| {
            let timing = completion_timing(&task);
            if let Some(timing) = &timing {
                match timing.kind {
                    ReportCompletionTimingKind::Early => {
                        checked_aggregate_add(&mut early_seconds, timing.difference_seconds)?;
                    }
                    ReportCompletionTimingKind::Late => {
                        checked_aggregate_add(&mut late_seconds, timing.difference_seconds)?;
                    }
                    ReportCompletionTimingKind::OnTime => {}
                }
            }
            Ok(ReportDoneTaskInsight { task, timing })
        })
        .collect::<Result<Vec<_>, ReportingError>>()?;

    let punctuality_total = early_seconds
        .checked_add(late_seconds)
        .ok_or(ReportingError::AggregationOverflow)?;

    Ok(ReportOverview {
        summary: ReportOverviewSummary {
            total_work_days,
            total_tasks_done,
            average_tasks_per_work_day: ratio(total_tasks_done, total_work_days),
            total_time_seconds,
            average_time_per_work_day_seconds: ratio(total_time_seconds, total_work_days),
            average_time_per_task_seconds: ratio(total_work_seconds, tracked_task_count),
        },
        daily_series,
        productive: ReportProductiveSummary {
            local_hour_start: productive_hour,
            weekday_from_monday: productive_day,
            month_key: productive_month,
        },
        time_by_list,
        done_tasks,
        punctuality: ReportPunctualitySummary {
            early_seconds,
            late_seconds,
            early_percent: ratio(early_seconds, punctuality_total).map(|value| value * 100.0),
            late_percent: ratio(late_seconds, punctuality_total).map(|value| value * 100.0),
        },
    })
}

pub fn report_overview(
    conn: &Connection,
    range: ReportRange,
    display_timezone: &str,
) -> Result<ReportOverview, ReportingError> {
    let history = report_history_snapshot(conn, range)?;
    overview_from_history(&history, display_timezone)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn snapshot_session(
        task_id: Option<TaskId>,
        list_id: Option<ListId>,
        list_title: Option<&str>,
        kind: SessionKind,
        started_at: &str,
        duration_seconds: u64,
    ) -> ReportSessionRow {
        ReportSessionRow {
            id: SessionId::generate(),
            task_id,
            task_title: task_id.map(|_| "Task".to_owned()),
            list_id,
            list_title: list_title.map(str::to_owned),
            kind,
            source: SessionSource::Focus,
            started_at: started_at.to_owned(),
            ended_at: started_at.to_owned(),
            duration_seconds,
            task_archived: false,
            list_archived: false,
        }
    }

    fn completed_snapshot_task(
        task_id: TaskId,
        list_id: ListId,
        title: &str,
        est_seconds: Option<u32>,
        time_taken_seconds: u64,
        completed_at: &str,
    ) -> ReportCompletedTaskRow {
        ReportCompletedTaskRow {
            task_id,
            list_id,
            task_title: title.to_owned(),
            list_title: "Metrics".to_owned(),
            est_seconds,
            completed_at: completed_at.to_owned(),
            time_taken_seconds,
            task_archived: false,
            list_archived: false,
        }
    }

    #[test]
    fn overview_metrics_follow_official_session_derived_definitions() {
        let list_id = ListId::generate();
        let first = TaskId::generate();
        let second = TaskId::generate();
        let partial = TaskId::generate();
        let history = ReportHistorySnapshot {
            range: ReportRange {
                start_at: "2026-09-01T00:00:00Z".into(),
                end_at: "2026-10-01T00:00:00Z".into(),
                list_id: None,
            },
            sessions: vec![
                snapshot_session(
                    Some(first),
                    Some(list_id),
                    Some("Metrics"),
                    SessionKind::Work,
                    "2026-09-07T09:00:00Z",
                    3_600,
                ),
                snapshot_session(
                    Some(first),
                    Some(list_id),
                    Some("Metrics"),
                    SessionKind::Break,
                    "2026-09-07T10:00:00Z",
                    900,
                ),
                snapshot_session(
                    Some(second),
                    Some(list_id),
                    Some("Metrics"),
                    SessionKind::Work,
                    "2026-09-08T09:00:00Z",
                    1_800,
                ),
                snapshot_session(
                    Some(partial),
                    Some(list_id),
                    Some("Metrics"),
                    SessionKind::Work,
                    "2026-09-08T11:00:00Z",
                    600,
                ),
            ],
            completed_tasks: vec![
                completed_snapshot_task(
                    first,
                    list_id,
                    "First",
                    Some(4_000),
                    3_600,
                    "2026-09-07T12:00:00Z",
                ),
                completed_snapshot_task(
                    second,
                    list_id,
                    "Second",
                    Some(1_200),
                    1_800,
                    "2026-09-08T12:00:00Z",
                ),
            ],
        };

        let overview = overview_from_history(&history, "UTC").expect("aggregate overview");
        assert_eq!(overview.summary.total_work_days, 2);
        assert_eq!(overview.summary.total_tasks_done, 2);
        assert_eq!(overview.summary.average_tasks_per_work_day, Some(1.0));
        assert_eq!(overview.summary.total_time_seconds, 6_900);
        assert_eq!(
            overview.summary.average_time_per_work_day_seconds,
            Some(3_450.0)
        );
        assert_eq!(
            overview.summary.average_time_per_task_seconds,
            Some(2_000.0)
        );
        assert_eq!(overview.daily_series.len(), 2);
        assert_eq!(overview.daily_series[0].task_seconds, 3_600);
        assert_eq!(overview.daily_series[0].break_seconds, 900);
        assert_eq!(overview.daily_series[0].total_seconds, 4_500);
        assert_eq!(overview.productive.local_hour_start, Some(9));
        assert_eq!(overview.productive.weekday_from_monday, Some(0));
        assert_eq!(overview.productive.month_key.as_deref(), Some("2026-09"));
        assert_eq!(overview.time_by_list.len(), 1);
        assert_eq!(overview.time_by_list[0].work_seconds, 6_000);
    }

    #[test]
    fn overview_punctuality_stacks_early_and_late_variance_and_omits_no_est_tasks() {
        let list_id = ListId::generate();
        let early = TaskId::generate();
        let late = TaskId::generate();
        let on_time = TaskId::generate();
        let no_est = TaskId::generate();
        let history = ReportHistorySnapshot {
            range: ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: None,
            },
            sessions: Vec::new(),
            completed_tasks: vec![
                completed_snapshot_task(early, list_id, "Early", Some(3_600), 1_800, T1),
                completed_snapshot_task(late, list_id, "Late", Some(3_600), 7_200, T2),
                completed_snapshot_task(on_time, list_id, "On time", Some(900), 900, T3),
                completed_snapshot_task(no_est, list_id, "No EST", None, 600, T4),
            ],
        };

        let overview = overview_from_history(&history, "UTC").expect("aggregate punctuality");
        assert_eq!(overview.punctuality.early_seconds, 1_800);
        assert_eq!(overview.punctuality.late_seconds, 3_600);
        let early_percent = overview
            .punctuality
            .early_percent
            .expect("early percentage");
        let late_percent = overview
            .punctuality
            .late_percent
            .expect("late percentage");
        assert!((early_percent - (100.0 / 3.0)).abs() < 1e-9);
        assert!((late_percent - (200.0 / 3.0)).abs() < 1e-9);
        assert_eq!(
            overview.done_tasks[0].timing.as_ref().map(|value| value.kind),
            Some(ReportCompletionTimingKind::Early)
        );
        assert_eq!(
            overview.done_tasks[1].timing.as_ref().map(|value| value.kind),
            Some(ReportCompletionTimingKind::Late)
        );
        assert_eq!(
            overview.done_tasks[2].timing.as_ref().map(|value| value.kind),
            Some(ReportCompletionTimingKind::OnTime)
        );
        assert!(overview.done_tasks[3].timing.is_none());
    }

    #[test]
    fn overview_groups_session_starts_in_display_timezone_across_dst_fallback() {
        let list_id = ListId::generate();
        let task_id = TaskId::generate();
        let history = ReportHistorySnapshot {
            range: ReportRange {
                start_at: "2026-11-01T00:00:00Z".into(),
                end_at: "2026-11-02T12:00:00Z".into(),
                list_id: None,
            },
            sessions: vec![
                snapshot_session(
                    Some(task_id),
                    Some(list_id),
                    Some("Metrics"),
                    SessionKind::Work,
                    "2026-11-01T05:30:00Z",
                    1_200,
                ),
                snapshot_session(
                    Some(task_id),
                    Some(list_id),
                    Some("Metrics"),
                    SessionKind::Work,
                    "2026-11-01T06:30:00Z",
                    1_800,
                ),
                snapshot_session(
                    Some(task_id),
                    Some(list_id),
                    Some("Metrics"),
                    SessionKind::Break,
                    "2026-11-02T05:30:00Z",
                    300,
                ),
            ],
            completed_tasks: Vec::new(),
        };

        let overview =
            overview_from_history(&history, "America/New_York").expect("timezone aggregation");
        assert_eq!(overview.summary.total_work_days, 2);
        assert_eq!(overview.productive.local_hour_start, Some(1));
        assert_eq!(overview.daily_series[0].local_date, "2026-11-01");
        assert_eq!(overview.daily_series[0].task_seconds, 3_000);
        assert_eq!(overview.daily_series[1].local_date, "2026-11-02");
        assert_eq!(overview.daily_series[1].break_seconds, 300);
    }

    #[test]
    fn overview_zero_session_completion_does_not_divide_by_zero_or_invent_productive_time() {
        let list_id = ListId::generate();
        let task_id = TaskId::generate();
        let history = ReportHistorySnapshot {
            range: ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: None,
            },
            sessions: Vec::new(),
            completed_tasks: vec![completed_snapshot_task(
                task_id,
                list_id,
                "Marked done",
                Some(600),
                0,
                T1,
            )],
        };

        let overview = overview_from_history(&history, "UTC").expect("zero-session overview");
        assert_eq!(overview.summary.total_work_days, 0);
        assert_eq!(overview.summary.total_tasks_done, 1);
        assert_eq!(overview.summary.average_tasks_per_work_day, None);
        assert_eq!(overview.summary.average_time_per_work_day_seconds, None);
        assert_eq!(overview.summary.average_time_per_task_seconds, None);
        assert_eq!(overview.productive.local_hour_start, None);
        assert_eq!(overview.productive.weekday_from_monday, None);
        assert_eq!(overview.productive.month_key, None);
        assert_eq!(
            overview.done_tasks[0].timing.as_ref().map(|value| value.kind),
            Some(ReportCompletionTimingKind::Early)
        );
        assert_eq!(
            overview.done_tasks[0]
                .timing
                .as_ref()
                .map(|value| value.difference_seconds),
            Some(600)
        );
    }

    #[test]
    fn overview_rejects_invalid_display_timezone_before_aggregation() {
        let history = ReportHistorySnapshot {
            range: ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: None,
            },
            sessions: Vec::new(),
            completed_tasks: Vec::new(),
        };

        assert!(matches!(
            overview_from_history(&history, "Not/A_Real_Zone"),
            Err(ReportingError::InvalidDisplayTimezone(_))
        ));
    }


    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{archive_task, permanently_delete_task};
    use rusqlite::{params, Connection};

    const START: &str = "2026-09-30T00:00:00Z";
    const END: &str = "2026-10-01T00:00:00Z";
    const T0: &str = "2026-09-30T09:00:00Z";
    const T1: &str = "2026-09-30T10:00:00Z";
    const T2: &str = "2026-09-30T11:00:00Z";
    const T3: &str = "2026-09-30T12:00:00Z";
    const T4: &str = "2026-09-30T13:00:00Z";

    fn migrated() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open report database");
        run_migrations(&mut conn).expect("migrate report database");
        conn
    }

    fn create_test_list(conn: &mut Connection, title: &str) -> ListId {
        create_list(
            conn,
            NewListInput {
                title: title.into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create report list")
        .id
    }

    fn create_test_task(
        conn: &mut Connection,
        list_id: ListId,
        title: &str,
        est: Option<u32>,
    ) -> TaskId {
        crate::persistence::tasks::create_task(
            conn,
            NewTaskInput {
                list_id,
                title: title.into(),
                manual_lane: PlanningLane::Today,
                est_seconds: est,
            },
            T0,
        )
        .expect("create report task")
        .id
    }

    fn insert_session(
        conn: &Connection,
        task_id: Option<TaskId>,
        kind: &str,
        started_at: &str,
        duration_seconds: i64,
    ) {
        conn.execute(
            "INSERT INTO sessions (
                id, task_id, kind, started_at, ended_at, duration_seconds,
                source, created_at, updated_at
             ) VALUES (?1, ?2, ?3, ?4, ?4, ?5, 'focus', ?4, ?4)",
            params![
                SessionId::generate().to_string(),
                task_id.map(|id| id.to_string()),
                kind,
                started_at,
                duration_seconds,
            ],
        )
        .expect("insert report session");
    }

    #[test]
    fn report_range_and_list_filter_project_closed_history_without_mutating_state() {
        let mut conn = migrated();
        let alpha = create_test_list(&mut conn, "Alpha");
        let beta = create_test_list(&mut conn, "Beta");
        let alpha_task = create_test_task(&mut conn, alpha, "Alpha task", Some(900));
        let beta_task = create_test_task(&mut conn, beta, "Beta task", None);

        insert_session(&conn, Some(alpha_task), "work", T1, 600);
        insert_session(&conn, Some(alpha_task), "break", T2, 120);
        insert_session(&conn, None, "break", T3, 60);
        insert_session(&conn, Some(beta_task), "work", T4, 300);
        insert_session(&conn, Some(alpha_task), "work", "2026-09-29T23:59:59Z", 30);

        conn.execute(
            "UPDATE tasks SET completed_at = ?1 WHERE id IN (?2, ?3)",
            params![T4, alpha_task.to_string(), beta_task.to_string()],
        )
        .expect("complete report tasks");

        let all = report_history_snapshot(
            &conn,
            ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: None,
            },
        )
        .expect("all-list report");
        assert_eq!(all.sessions.len(), 4);
        assert_eq!(all.completed_tasks.len(), 2);
        assert!(all.sessions.iter().any(|row| row.task_id.is_none()));

        let alpha_only = report_history_snapshot(
            &conn,
            ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: Some(alpha),
            },
        )
        .expect("alpha report");
        assert_eq!(alpha_only.sessions.len(), 2);
        assert!(alpha_only
            .sessions
            .iter()
            .all(|row| row.list_id == Some(alpha)));
        assert_eq!(alpha_only.completed_tasks.len(), 1);
        assert_eq!(alpha_only.completed_tasks[0].task_id, alpha_task);
    }

    #[test]
    fn archived_history_remains_reportable_and_permanent_task_delete_removes_it() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Archived");
        let task_id = create_test_task(&mut conn, list_id, "Historical", Some(600));
        insert_session(&conn, Some(task_id), "work", T1, 480);
        conn.execute(
            "UPDATE tasks SET completed_at = ?1 WHERE id = ?2",
            params![T2, task_id.to_string()],
        )
        .expect("complete historical task");

        archive_task(&mut conn, task_id, T3).expect("archive historical task");
        conn.execute(
            "UPDATE lists SET archived_at = ?1 WHERE id = ?2",
            params![T3, list_id.to_string()],
        )
        .expect("archive historical list");

        let archived = report_history_snapshot(
            &conn,
            ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: None,
            },
        )
        .expect("archived report");
        assert_eq!(archived.sessions.len(), 1);
        assert_eq!(archived.completed_tasks.len(), 1);
        assert!(archived.sessions[0].task_archived);
        assert!(archived.sessions[0].list_archived);
        assert!(archived.completed_tasks[0].task_archived);
        assert!(archived.completed_tasks[0].list_archived);

        permanently_delete_task(&mut conn, task_id).expect("permanently delete task");
        let after_delete = report_history_snapshot(
            &conn,
            ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: None,
            },
        )
        .expect("post-delete report");
        assert!(after_delete.sessions.is_empty());
        assert!(after_delete.completed_tasks.is_empty());
    }

    #[test]
    fn completed_task_time_taken_uses_work_sessions_plus_manual_adjustment_and_excludes_breaks() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Metrics");
        let task_id = create_test_task(&mut conn, list_id, "Measured", Some(900));
        insert_session(&conn, Some(task_id), "work", T1, 300);
        insert_session(&conn, Some(task_id), "break", T2, 120);
        insert_session(&conn, Some(task_id), "work", T3, 420);
        conn.execute(
            "UPDATE tasks
             SET completed_at = ?1, manual_time_adjustment_seconds = -60
             WHERE id = ?2",
            params![T4, task_id.to_string()],
        )
        .expect("complete measured task");

        let report = report_history_snapshot(
            &conn,
            ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: None,
            },
        )
        .expect("metrics report");
        assert_eq!(report.completed_tasks.len(), 1);
        let task = &report.completed_tasks[0];
        assert_eq!(task.est_seconds, Some(900));
        assert_eq!(task.time_taken_seconds, 660);
    }

    #[test]
    fn invalid_or_reversed_ranges_fail_before_report_projection() {
        let conn = migrated();
        assert!(matches!(
            report_history_snapshot(
                &conn,
                ReportRange {
                    start_at: "not-a-date".into(),
                    end_at: END.into(),
                    list_id: None,
                },
            ),
            Err(ReportingError::InvalidRangeTimestamp("start_at"))
        ));
        assert!(matches!(
            report_history_snapshot(
                &conn,
                ReportRange {
                    start_at: END.into(),
                    end_at: START.into(),
                    list_id: None,
                },
            ),
            Err(ReportingError::EmptyOrReversedRange)
        ));
    }
}
