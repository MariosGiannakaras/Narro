use crate::domain::ids::RecurrenceRuleId;
use crate::domain::recurrence::RecurrenceRuleRecord;
use crate::persistence::recurrence::{get_recurrence_rule, RecurrenceStoreError};
use crate::persistence::{configure_connection, PersistenceError};
use crate::recurrence::{materialize_recurrence_week, MaterializationReport, RecurrenceError};
use chrono::{Datelike, Duration as ChronoDuration, Local, NaiveDate, SecondsFormat, Utc};
use jiff::{tz::TimeZone, Timestamp};
use rusqlite::Connection;
use std::fmt::{Display, Formatter};
use std::path::PathBuf;
use std::time::Duration;

const RECURRENCE_POLL_INTERVAL: Duration = Duration::from_secs(60);

#[derive(Debug)]
pub enum RuleOrchestrationError {
    Store(RecurrenceStoreError),
    Materialization(RecurrenceError),
    InvalidCurrentLocalDate(String),
    InvalidWatermark(String),
    InvalidTimezone(String),
    InvalidTimeTimezoneShape,
    TimezoneConversionFailed,
    DateArithmeticOverflow,
}

impl Display for RuleOrchestrationError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Store(error) => Display::fmt(error, formatter),
            Self::Materialization(error) => Display::fmt(error, formatter),
            Self::InvalidCurrentLocalDate(value) => {
                write!(formatter, "recurrence current local date is invalid: {value}")
            }
            Self::InvalidWatermark(value) => {
                write!(formatter, "recurrence materialization watermark is invalid: {value}")
            }
            Self::InvalidTimezone(value) => {
                write!(formatter, "recurrence timezone is invalid: {value}")
            }
            Self::InvalidTimeTimezoneShape => formatter.write_str(
                "recurrence local time and timezone must either both be present or both be absent",
            ),
            Self::TimezoneConversionFailed => {
                formatter.write_str("recurrence timezone conversion failed")
            }
            Self::DateArithmeticOverflow => {
                formatter.write_str("recurrence catch-up date arithmetic overflow")
            }
        }
    }
}

impl std::error::Error for RuleOrchestrationError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Store(error) => Some(error),
            Self::Materialization(error) => Some(error),
            _ => None,
        }
    }
}

impl From<RecurrenceStoreError> for RuleOrchestrationError {
    fn from(value: RecurrenceStoreError) -> Self {
        Self::Store(value)
    }
}

impl From<RecurrenceError> for RuleOrchestrationError {
    fn from(value: RecurrenceError) -> Self {
        Self::Materialization(value)
    }
}

#[derive(Debug)]
pub struct RuleOrchestrationFailure {
    pub recurrence_rule_id: RecurrenceRuleId,
    pub error: RuleOrchestrationError,
}

#[derive(Debug, Default)]
pub struct RecurrenceOrchestrationReport {
    pub active_rule_count: usize,
    pub successful_rule_count: usize,
    pub created_child_count: usize,
    pub existing_child_count: usize,
    pub failures: Vec<RuleOrchestrationFailure>,
}

#[derive(Debug)]
pub enum RecurrenceCycleError {
    Sqlite(rusqlite::Error),
    InvalidStoredRuleIdentity(String),
}

impl Display for RecurrenceCycleError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "recurrence active-rule query failed: {error}"),
            Self::InvalidStoredRuleIdentity(value) => {
                write!(formatter, "stored recurrence rule identity is invalid: {value}")
            }
        }
    }
}

impl std::error::Error for RecurrenceCycleError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::InvalidStoredRuleIdentity(_) => None,
        }
    }
}

impl From<rusqlite::Error> for RecurrenceCycleError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

#[derive(Debug)]
pub enum RecurrenceRuntimeStartError {
    Sqlite(rusqlite::Error),
    Persistence(PersistenceError),
    Thread(std::io::Error),
}

impl Display for RecurrenceRuntimeStartError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "open recurrence orchestration database: {error}"),
            Self::Persistence(error) => Display::fmt(error, formatter),
            Self::Thread(error) => write!(formatter, "start recurrence orchestration thread: {error}"),
        }
    }
}

impl std::error::Error for RecurrenceRuntimeStartError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Persistence(error) => Some(error),
            Self::Thread(error) => Some(error),
        }
    }
}

impl From<rusqlite::Error> for RecurrenceRuntimeStartError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<PersistenceError> for RecurrenceRuntimeStartError {
    fn from(value: PersistenceError) -> Self {
        Self::Persistence(value)
    }
}

fn parse_date(value: &str) -> Result<NaiveDate, ()> {
    NaiveDate::parse_from_str(value.trim(), "%Y-%m-%d").map_err(|_| ())
}

fn monday_of(date: NaiveDate) -> Result<NaiveDate, RuleOrchestrationError> {
    date.checked_sub_signed(ChronoDuration::days(i64::from(
        date.weekday().num_days_from_monday(),
    )))
    .ok_or(RuleOrchestrationError::DateArithmeticOverflow)
}

fn catch_up_dates(
    rule: &RecurrenceRuleRecord,
    current_local_date: &str,
) -> Result<Vec<String>, RuleOrchestrationError> {
    let current = parse_date(current_local_date).map_err(|_| {
        RuleOrchestrationError::InvalidCurrentLocalDate(current_local_date.to_owned())
    })?;
    let Some(watermark) = rule.last_materialized_local_date.as_deref() else {
        return Ok(vec![current.format("%Y-%m-%d").to_string()]);
    };
    let watermark_date = parse_date(watermark)
        .map_err(|_| RuleOrchestrationError::InvalidWatermark(watermark.to_owned()))?;
    let watermark_week = monday_of(watermark_date)?;
    let current_week = monday_of(current)?;

    if current_week <= watermark_week {
        return Ok(vec![current.format("%Y-%m-%d").to_string()]);
    }

    let mut dates = Vec::new();
    let mut cursor = watermark_week
        .checked_add_signed(ChronoDuration::days(7))
        .ok_or(RuleOrchestrationError::DateArithmeticOverflow)?;
    while cursor < current_week {
        dates.push(cursor.format("%Y-%m-%d").to_string());
        cursor = cursor
            .checked_add_signed(ChronoDuration::days(7))
            .ok_or(RuleOrchestrationError::DateArithmeticOverflow)?;
    }
    dates.push(current.format("%Y-%m-%d").to_string());
    Ok(dates)
}

fn local_date_for_rule_at(
    rule: &RecurrenceRuleRecord,
    timestamp: Timestamp,
    system_local_date: NaiveDate,
) -> Result<String, RuleOrchestrationError> {
    match (rule.local_time.as_deref(), rule.timezone.as_deref()) {
        (None, None) => Ok(system_local_date.format("%Y-%m-%d").to_string()),
        (Some(_), Some(timezone)) => {
            let zone = TimeZone::get(timezone)
                .map_err(|_| RuleOrchestrationError::InvalidTimezone(timezone.to_owned()))?;
            let date = zone.to_datetime(timestamp).date().to_string();
            let parsed = parse_date(&date)
                .map_err(|_| RuleOrchestrationError::TimezoneConversionFailed)?;
            Ok(parsed.format("%Y-%m-%d").to_string())
        }
        _ => Err(RuleOrchestrationError::InvalidTimeTimezoneShape),
    }
}

fn active_rule_ids(conn: &Connection) -> Result<Vec<RecurrenceRuleId>, RecurrenceCycleError> {
    let mut statement = conn.prepare("SELECT id FROM recurrence_rules WHERE is_active = 1 ORDER BY id")?;
    let values = statement.query_map([], |row| row.get::<_, String>(0))?;
    let mut ids = Vec::new();
    for value in values {
        let value = value?;
        ids.push(
            RecurrenceRuleId::parse_str(&value)
                .map_err(|_| RecurrenceCycleError::InvalidStoredRuleIdentity(value))?,
        );
    }
    Ok(ids)
}

fn orchestrate_rule(
    conn: &mut Connection,
    rule_id: RecurrenceRuleId,
    current_local_date: &str,
    now: &str,
) -> Result<Vec<MaterializationReport>, RuleOrchestrationError> {
    let rule = get_recurrence_rule(conn, rule_id)?;
    let dates = catch_up_dates(&rule, current_local_date)?;
    let mut reports = Vec::with_capacity(dates.len());
    for date in dates {
        reports.push(materialize_recurrence_week(conn, rule_id, &date, now)?);
    }
    Ok(reports)
}

fn orchestrate_cycle_at(
    conn: &mut Connection,
    timestamp: Timestamp,
    system_local_date: NaiveDate,
    now: &str,
) -> Result<RecurrenceOrchestrationReport, RecurrenceCycleError> {
    let rule_ids = active_rule_ids(conn)?;
    let mut report = RecurrenceOrchestrationReport {
        active_rule_count: rule_ids.len(),
        ..RecurrenceOrchestrationReport::default()
    };

    for rule_id in rule_ids {
        let result = (|| -> Result<Vec<MaterializationReport>, RuleOrchestrationError> {
            let rule = get_recurrence_rule(conn, rule_id)?;
            let current_local_date = local_date_for_rule_at(&rule, timestamp, system_local_date)?;
            orchestrate_rule(conn, rule_id, &current_local_date, now)
        })();

        match result {
            Ok(reports) => {
                report.successful_rule_count += 1;
                for materialization in reports {
                    report.created_child_count += materialization.created_child_ids.len();
                    report.existing_child_count += materialization.existing_child_ids.len();
                }
            }
            Err(error) => report.failures.push(RuleOrchestrationFailure {
                recurrence_rule_id: rule_id,
                error,
            }),
        }
    }

    Ok(report)
}

fn orchestrate_cycle(
    conn: &mut Connection,
    now: &str,
) -> Result<RecurrenceOrchestrationReport, RecurrenceCycleError> {
    orchestrate_cycle_at(conn, Timestamp::now(), Local::now().date_naive(), now)
}

pub fn install_background_orchestration(
    database_path: PathBuf,
) -> Result<(), RecurrenceRuntimeStartError> {
    let connection = Connection::open(database_path)?;
    configure_connection(&connection)?;

    std::thread::Builder::new()
        .name("narro-recurrence-orchestration".to_owned())
        .spawn(move || {
            let mut connection = connection;
            loop {
                let now = Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true);
                match orchestrate_cycle(&mut connection, &now) {
                    Ok(report) => {
                        for failure in report.failures {
                            eprintln!(
                                "Recurrence rule {} orchestration failed and will retry on a later cycle: {}",
                                failure.recurrence_rule_id, failure.error
                            );
                        }
                    }
                    Err(error) => {
                        eprintln!("Recurrence orchestration cycle failed and will retry: {error}");
                    }
                }
                std::thread::sleep(RECURRENCE_POLL_INTERVAL);
            }
        })
        .map(|_| ())
        .map_err(RecurrenceRuntimeStartError::Thread)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::{PlanningLane, RecurrenceUnit};
    use crate::domain::recurrence::NewRecurrenceRuleInput;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::recurrence::create_recurrence_rule;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{complete_task, create_task};
    use rusqlite::params;

    const T0: &str = "2026-08-01T06:00:00Z";
    const T1: &str = "2026-09-07T06:00:00Z";
    const T2: &str = "2026-09-09T06:00:00Z";
    const T3: &str = "2026-09-21T06:00:00Z";

    fn migrated() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("migrate database");
        conn
    }

    fn add_weekly_rule(
        conn: &mut Connection,
        title: &str,
        starts_local_date: &str,
        local_time: Option<&str>,
        timezone: Option<&str>,
    ) -> (crate::domain::ids::TaskId, RecurrenceRuleId) {
        let list = create_list(
            conn,
            NewListInput {
                title: format!("List {title}"),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list");
        let parent = create_task(
            conn,
            NewTaskInput {
                list_id: list.id,
                title: title.into(),
                manual_lane: PlanningLane::Backlog,
                est_seconds: None,
            },
            T0,
        )
        .expect("create parent");
        let rule = create_recurrence_rule(
            conn,
            NewRecurrenceRuleInput {
                parent_task_id: parent.id,
                interval_count: 1,
                unit: RecurrenceUnit::Week,
                weekday_mask: 0b0000001,
                month_day: None,
                starts_local_date: starts_local_date.into(),
                local_time: local_time.map(str::to_owned),
                timezone: timezone.map(str::to_owned),
                replace_existing: false,
            },
            T0,
        )
        .expect("create recurrence rule");
        (parent.id, rule.id)
    }

    fn occurrence_count(conn: &Connection, rule_id: RecurrenceRuleId) -> i64 {
        conn.query_row(
            "SELECT COUNT(*) FROM recurrence_occurrences WHERE recurrence_rule_id = ?1",
            [rule_id.to_string()],
            |row| row.get(0),
        )
        .expect("count occurrences")
    }

    fn watermark(conn: &Connection, rule_id: RecurrenceRuleId) -> Option<String> {
        conn.query_row(
            "SELECT last_materialized_local_date FROM recurrence_rules WHERE id = ?1",
            [rule_id.to_string()],
            |row| row.get(0),
        )
        .expect("read watermark")
    }

    fn timestamp(value: &str) -> Timestamp {
        value.parse().expect("parse test timestamp")
    }

    #[test]
    fn first_startup_materializes_current_week_without_historical_backfill() {
        let mut conn = migrated();
        let (_, rule_id) = add_weekly_rule(&mut conn, "Weekly", "2026-08-03", None, None);

        let report = orchestrate_cycle_at(
            &mut conn,
            timestamp(T1),
            NaiveDate::from_ymd_opt(2026, 9, 7).unwrap(),
            T1,
        )
        .expect("orchestrate startup");
        assert_eq!(report.active_rule_count, 1);
        assert_eq!(report.successful_rule_count, 1);
        assert_eq!(report.created_child_count, 1);
        assert!(report.failures.is_empty());
        assert_eq!(occurrence_count(&conn, rule_id), 1);
        assert_eq!(watermark(&conn, rule_id).as_deref(), Some("2026-09-07"));
    }

    #[test]
    fn repeated_pass_and_same_week_date_change_remain_idempotent() {
        let mut conn = migrated();
        let (_, rule_id) = add_weekly_rule(&mut conn, "Weekly", "2026-09-07", None, None);
        let monday = NaiveDate::from_ymd_opt(2026, 9, 7).unwrap();
        let wednesday = NaiveDate::from_ymd_opt(2026, 9, 9).unwrap();

        orchestrate_cycle_at(&mut conn, timestamp(T1), monday, T1).unwrap();
        let repeated = orchestrate_cycle_at(&mut conn, timestamp(T1), monday, T1).unwrap();
        assert_eq!(repeated.created_child_count, 0);
        assert_eq!(repeated.existing_child_count, 1);

        let changed = orchestrate_cycle_at(&mut conn, timestamp(T2), wednesday, T2).unwrap();
        assert_eq!(changed.created_child_count, 0);
        assert_eq!(changed.existing_child_count, 1);
        assert_eq!(occurrence_count(&conn, rule_id), 1);
        assert_eq!(watermark(&conn, rule_id).as_deref(), Some("2026-09-09"));
    }

    #[test]
    fn missed_weeks_are_caught_up_in_order_without_duplicates() {
        let mut conn = migrated();
        let (_, rule_id) = add_weekly_rule(&mut conn, "Weekly", "2026-09-07", None, None);

        orchestrate_cycle_at(
            &mut conn,
            timestamp(T1),
            NaiveDate::from_ymd_opt(2026, 9, 7).unwrap(),
            T1,
        )
        .unwrap();
        let caught_up = orchestrate_cycle_at(
            &mut conn,
            timestamp(T3),
            NaiveDate::from_ymd_opt(2026, 9, 21).unwrap(),
            T3,
        )
        .expect("catch up missed weeks");

        assert_eq!(caught_up.created_child_count, 2);
        assert_eq!(occurrence_count(&conn, rule_id), 3);
        assert_eq!(watermark(&conn, rule_id).as_deref(), Some("2026-09-21"));

        let repeated = orchestrate_cycle_at(
            &mut conn,
            timestamp(T3),
            NaiveDate::from_ymd_opt(2026, 9, 21).unwrap(),
            T3,
        )
        .unwrap();
        assert_eq!(repeated.created_child_count, 0);
        assert_eq!(occurrence_count(&conn, rule_id), 3);
    }

    #[test]
    fn one_broken_rule_does_not_block_other_active_rules() {
        let mut conn = migrated();
        let (bad_parent_id, bad_rule_id) =
            add_weekly_rule(&mut conn, "Broken", "2026-09-07", None, None);
        let (_, good_rule_id) = add_weekly_rule(&mut conn, "Good", "2026-09-07", None, None);
        complete_task(&mut conn, bad_parent_id, T1).expect("complete broken parent");

        let report = orchestrate_cycle_at(
            &mut conn,
            timestamp(T1),
            NaiveDate::from_ymd_opt(2026, 9, 7).unwrap(),
            T1,
        )
        .expect("cycle itself remains valid");

        assert_eq!(report.active_rule_count, 2);
        assert_eq!(report.successful_rule_count, 1);
        assert_eq!(report.failures.len(), 1);
        assert_eq!(report.failures[0].recurrence_rule_id, bad_rule_id);
        assert_eq!(occurrence_count(&conn, bad_rule_id), 0);
        assert_eq!(occurrence_count(&conn, good_rule_id), 1);
    }

    #[test]
    fn timed_rules_resolve_current_date_in_their_own_timezone() {
        let mut conn = migrated();
        let (_, athens_rule_id) = add_weekly_rule(
            &mut conn,
            "Athens",
            "2026-09-07",
            Some("09:00"),
            Some("Europe/Athens"),
        );
        let (_, new_york_rule_id) = add_weekly_rule(
            &mut conn,
            "New York",
            "2026-09-07",
            Some("09:00"),
            Some("America/New_York"),
        );
        let instant = timestamp("2026-09-07T22:30:00Z");
        let system_date = NaiveDate::from_ymd_opt(2026, 9, 7).unwrap();

        let athens = get_recurrence_rule(&conn, athens_rule_id).unwrap();
        let new_york = get_recurrence_rule(&conn, new_york_rule_id).unwrap();
        assert_eq!(
            local_date_for_rule_at(&athens, instant, system_date).unwrap(),
            "2026-09-08"
        );
        assert_eq!(
            local_date_for_rule_at(&new_york, instant, system_date).unwrap(),
            "2026-09-07"
        );
    }

    #[test]
    fn active_rule_discovery_rejects_corrupt_stored_identity() {
        let mut conn = migrated();
        let list = create_list(
            &mut conn,
            NewListInput {
                title: "Corrupt".into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .unwrap();
        let parent = create_task(
            &mut conn,
            NewTaskInput {
                list_id: list.id,
                title: "Parent".into(),
                manual_lane: PlanningLane::Backlog,
                est_seconds: None,
            },
            T0,
        )
        .unwrap();
        conn.execute(
            "INSERT INTO recurrence_rules (
                id, parent_task_id, interval_count, unit, weekday_mask, starts_local_date,
                replace_existing, is_active, created_at, updated_at
             ) VALUES ('not-a-uuid', ?1, 1, 'day', 0, '2026-09-07', 0, 1, ?2, ?2)",
            params![parent.id.to_string(), T0],
        )
        .unwrap();

        assert!(matches!(
            active_rule_ids(&conn),
            Err(RecurrenceCycleError::InvalidStoredRuleIdentity(value)) if value == "not-a-uuid"
        ));
    }
}
