use crate::domain::ids::{SessionId, TaskId};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TimedAlertEffect {
    pub run_id: SessionId,
    pub task_id: TaskId,
    pub boundary_seconds: u64,
    pub decided_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct TimedAlertCursor {
    run_id: SessionId,
    interval_seconds: u64,
    next_boundary_seconds: u64,
    last_observed_work_seconds: u64,
    was_enabled: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TimedAlertObservation {
    pub task_id: TaskId,
    pub seed_run_id: SessionId,
    pub work_elapsed_seconds: u64,
    pub enabled: bool,
    pub interval_seconds: u64,
    pub reset_run: bool,
}

#[derive(Debug)]
pub enum TimedAlertEffectError {
    Sqlite(rusqlite::Error),
    InvalidTimestamp,
    InvalidInterval,
    DurationOverflow,
    WorkElapsedMovedBackwards {
        previous_seconds: u64,
        observed_seconds: u64,
    },
    CorruptRunId(String),
    CorruptTaskId(String),
    CorruptDuration(i64),
    ClaimRace {
        run_id: SessionId,
        boundary_seconds: u64,
    },
}

impl Display for TimedAlertEffectError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "timed-alert effect persistence failed: {error}"),
            Self::InvalidTimestamp => formatter.write_str("timed-alert timestamp must be RFC 3339"),
            Self::InvalidInterval => formatter.write_str("timed-alert interval must be greater than zero"),
            Self::DurationOverflow => formatter.write_str("timed-alert duration arithmetic overflowed"),
            Self::WorkElapsedMovedBackwards {
                previous_seconds,
                observed_seconds,
            } => write!(
                formatter,
                "authoritative work elapsed moved backwards within one timed-alert run: previous={previous_seconds}s observed={observed_seconds}s"
            ),
            Self::CorruptRunId(value) => write!(formatter, "stored timed-alert run id is invalid: {value}"),
            Self::CorruptTaskId(value) => write!(formatter, "stored timed-alert task id is invalid: {value}"),
            Self::CorruptDuration(value) => write!(formatter, "stored timed-alert duration is invalid: {value}"),
            Self::ClaimRace {
                run_id,
                boundary_seconds,
            } => write!(
                formatter,
                "timed-alert claim changed unexpectedly for run {run_id} boundary {boundary_seconds}s"
            ),
        }
    }
}

impl std::error::Error for TimedAlertEffectError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for TimedAlertEffectError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

fn validate_timestamp(value: &str) -> Result<(), TimedAlertEffectError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| TimedAlertEffectError::InvalidTimestamp)
}

fn sql_duration(value: u64) -> Result<i64, TimedAlertEffectError> {
    i64::try_from(value).map_err(|_| TimedAlertEffectError::DurationOverflow)
}

fn stored_duration(value: i64) -> Result<u64, TimedAlertEffectError> {
    u64::try_from(value).map_err(|_| TimedAlertEffectError::CorruptDuration(value))
}

fn next_boundary(
    work_elapsed_seconds: u64,
    interval_seconds: u64,
) -> Result<u64, TimedAlertEffectError> {
    work_elapsed_seconds
        .checked_add(interval_seconds)
        .ok_or(TimedAlertEffectError::DurationOverflow)
}

fn load_cursor(
    conn: &Connection,
    task_id: TaskId,
) -> Result<Option<TimedAlertCursor>, TimedAlertEffectError> {
    let raw = conn
        .query_row(
            "SELECT run_id, interval_seconds, next_boundary_seconds,
                    last_observed_work_seconds, was_enabled
             FROM timed_alert_runs
             WHERE task_id = ?1",
            [task_id.to_string()],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, i64>(1)?,
                    row.get::<_, i64>(2)?,
                    row.get::<_, i64>(3)?,
                    row.get::<_, i64>(4)?,
                ))
            },
        )
        .optional()?;

    raw.map(
        |(run_id, interval_seconds, next_boundary_seconds, last_observed, was_enabled)| {
            let parsed_run_id = SessionId::parse_str(&run_id)
                .map_err(|_| TimedAlertEffectError::CorruptRunId(run_id.clone()))?;
            Ok(TimedAlertCursor {
                run_id: parsed_run_id,
                interval_seconds: stored_duration(interval_seconds)?,
                next_boundary_seconds: stored_duration(next_boundary_seconds)?,
                last_observed_work_seconds: stored_duration(last_observed)?,
                was_enabled: was_enabled == 1,
            })
        },
    )
    .transpose()
}

fn write_cursor(
    conn: &Connection,
    task_id: TaskId,
    cursor: &TimedAlertCursor,
    now: &str,
) -> Result<(), TimedAlertEffectError> {
    conn.execute(
        "INSERT INTO timed_alert_runs (
            task_id, run_id, interval_seconds, next_boundary_seconds,
            last_observed_work_seconds, was_enabled, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(task_id) DO UPDATE SET
            run_id = excluded.run_id,
            interval_seconds = excluded.interval_seconds,
            next_boundary_seconds = excluded.next_boundary_seconds,
            last_observed_work_seconds = excluded.last_observed_work_seconds,
            was_enabled = excluded.was_enabled,
            updated_at = excluded.updated_at",
        params![
            task_id.to_string(),
            cursor.run_id.to_string(),
            sql_duration(cursor.interval_seconds)?,
            sql_duration(cursor.next_boundary_seconds)?,
            sql_duration(cursor.last_observed_work_seconds)?,
            if cursor.was_enabled { 1_i64 } else { 0_i64 },
            now,
        ],
    )?;
    Ok(())
}

pub fn observe_timed_alert_run(
    conn: &mut Connection,
    observation: TimedAlertObservation,
    now: &str,
) -> Result<usize, TimedAlertEffectError> {
    validate_timestamp(now)?;
    let TimedAlertObservation {
        task_id,
        seed_run_id,
        work_elapsed_seconds,
        enabled,
        interval_seconds,
        reset_run,
    } = observation;
    if interval_seconds == 0 {
        return Err(TimedAlertEffectError::InvalidInterval);
    }

    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let cursor = load_cursor(&tx, task_id)?;

    if reset_run || cursor.is_none() {
        tx.execute(
            "DELETE FROM timed_alert_effects WHERE task_id = ?1",
            [task_id.to_string()],
        )?;
        write_cursor(
            &tx,
            task_id,
            &TimedAlertCursor {
                run_id: seed_run_id,
                interval_seconds,
                next_boundary_seconds: next_boundary(work_elapsed_seconds, interval_seconds)?,
                last_observed_work_seconds: work_elapsed_seconds,
                was_enabled: enabled,
            },
            now,
        )?;
        tx.commit()?;
        return Ok(0);
    }

    let cursor = cursor.expect("cursor checked above");
    if work_elapsed_seconds < cursor.last_observed_work_seconds {
        return Err(TimedAlertEffectError::WorkElapsedMovedBackwards {
            previous_seconds: cursor.last_observed_work_seconds,
            observed_seconds: work_elapsed_seconds,
        });
    }

    if !enabled || !cursor.was_enabled || cursor.interval_seconds != interval_seconds {
        write_cursor(
            &tx,
            task_id,
            &TimedAlertCursor {
                run_id: cursor.run_id,
                interval_seconds,
                next_boundary_seconds: next_boundary(work_elapsed_seconds, interval_seconds)?,
                last_observed_work_seconds: work_elapsed_seconds,
                was_enabled: enabled,
            },
            now,
        )?;
        tx.commit()?;
        return Ok(0);
    }

    let mut boundary = cursor.next_boundary_seconds;
    let mut inserted = 0usize;
    while boundary <= work_elapsed_seconds {
        let changed = tx.execute(
            "INSERT INTO timed_alert_effects (
                run_id, task_id, boundary_seconds, decided_at, claimed_at
             ) VALUES (?1, ?2, ?3, ?4, NULL)
             ON CONFLICT(run_id, boundary_seconds) DO NOTHING",
            params![
                cursor.run_id.to_string(),
                task_id.to_string(),
                sql_duration(boundary)?,
                now,
            ],
        )?;
        inserted += changed;
        boundary = boundary
            .checked_add(interval_seconds)
            .ok_or(TimedAlertEffectError::DurationOverflow)?;
    }

    write_cursor(
        &tx,
        task_id,
        &TimedAlertCursor {
            run_id: cursor.run_id,
            interval_seconds,
            next_boundary_seconds: boundary,
            last_observed_work_seconds: work_elapsed_seconds,
            was_enabled: enabled,
        },
        now,
    )?;
    tx.commit()?;
    Ok(inserted)
}

pub fn retire_timed_alert_run(
    conn: &mut Connection,
    task_id: TaskId,
) -> Result<(), TimedAlertEffectError> {
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    tx.execute(
        "DELETE FROM timed_alert_effects WHERE task_id = ?1",
        [task_id.to_string()],
    )?;
    tx.execute(
        "DELETE FROM timed_alert_runs WHERE task_id = ?1",
        [task_id.to_string()],
    )?;
    tx.commit()?;
    Ok(())
}

pub fn claim_pending_timed_alerts(
    conn: &mut Connection,
    claimed_at: &str,
) -> Result<Vec<TimedAlertEffect>, TimedAlertEffectError> {
    validate_timestamp(claimed_at)?;
    let pending = read_pending_timed_alerts(conn)?;
    if pending.is_empty() {
        return Ok(Vec::new());
    }

    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let pending = read_pending_timed_alerts(&tx)?;
    for effect in &pending {
        let changed = tx.execute(
            "UPDATE timed_alert_effects
             SET claimed_at = ?1
             WHERE run_id = ?2
               AND boundary_seconds = ?3
               AND claimed_at IS NULL",
            params![
                claimed_at,
                effect.run_id.to_string(),
                sql_duration(effect.boundary_seconds)?,
            ],
        )?;
        if changed != 1 {
            return Err(TimedAlertEffectError::ClaimRace {
                run_id: effect.run_id,
                boundary_seconds: effect.boundary_seconds,
            });
        }
    }
    tx.commit()?;
    Ok(pending)
}

fn read_pending_timed_alerts(
    conn: &Connection,
) -> Result<Vec<TimedAlertEffect>, TimedAlertEffectError> {
    let mut statement = conn.prepare(
        "SELECT effect.run_id, effect.task_id, effect.boundary_seconds, effect.decided_at
         FROM timed_alert_effects effect
         JOIN timed_alert_runs run
           ON run.task_id = effect.task_id
          AND run.run_id = effect.run_id
         WHERE effect.claimed_at IS NULL
         ORDER BY effect.decided_at, effect.boundary_seconds",
    )?;
    let rows = statement.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, i64>(2)?,
            row.get::<_, String>(3)?,
        ))
    })?;

    let mut effects = Vec::new();
    for row in rows {
        let (run_id, task_id, boundary_seconds, decided_at) = row?;
        let parsed_run_id = SessionId::parse_str(&run_id)
            .map_err(|_| TimedAlertEffectError::CorruptRunId(run_id))?;
        let parsed_task_id = TaskId::parse_str(&task_id)
            .map_err(|_| TimedAlertEffectError::CorruptTaskId(task_id))?;
        effects.push(TimedAlertEffect {
            run_id: parsed_run_id,
            task_id: parsed_task_id,
            boundary_seconds: stored_duration(boundary_seconds)?,
            decided_at,
        });
    }
    Ok(effects)
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
    use rusqlite::Connection;

    const T0: &str = "2026-09-28T08:00:00Z";
    const T1: &str = "2026-09-28T08:20:00Z";

    macro_rules! observe {
        ($conn:expr, $task:expr, $run:expr, $elapsed:expr, $enabled:expr, $interval:expr, $reset:expr, $now:expr) => {
            observe_timed_alert_run(
                $conn,
                TimedAlertObservation {
                    task_id: $task,
                    seed_run_id: $run,
                    work_elapsed_seconds: $elapsed,
                    enabled: $enabled,
                    interval_seconds: $interval,
                    reset_run: $reset,
                },
                $now,
            )
        };
    }

    fn fixture() -> (Connection, TaskId, SessionId) {
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
                title: "Alert task".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T0,
        )
        .expect("create task");
        (conn, task.id, SessionId::generate())
    }

    #[test]
    fn delayed_observation_materializes_each_boundary_once() {
        let (mut conn, task_id, run_id) = fixture();
        observe!(&mut conn, task_id, run_id, 0, true, 60, true, T0).unwrap();

        assert_eq!(
            observe!(&mut conn, task_id, run_id, 190, true, 60, false, T1).unwrap(),
            3
        );
        assert_eq!(
            observe!(&mut conn, task_id, run_id, 190, true, 60, false, T1).unwrap(),
            0
        );

        let pending = claim_pending_timed_alerts(&mut conn, T1).unwrap();
        assert_eq!(
            pending
                .iter()
                .map(|effect| effect.boundary_seconds)
                .collect::<Vec<_>>(),
            vec![60, 120, 180]
        );
        assert!(claim_pending_timed_alerts(&mut conn, T1)
            .unwrap()
            .is_empty());
    }

    #[test]
    fn unchanged_work_elapsed_does_not_advance_alert_progress() {
        let (mut conn, task_id, run_id) = fixture();
        observe!(&mut conn, task_id, run_id, 0, true, 60, true, T0).unwrap();
        observe!(&mut conn, task_id, run_id, 59, true, 60, false, T1).unwrap();

        for _ in 0..3 {
            assert_eq!(
                observe!(&mut conn, task_id, run_id, 59, true, 60, false, T1).unwrap(),
                0
            );
        }
        assert!(claim_pending_timed_alerts(&mut conn, T1)
            .unwrap()
            .is_empty());
    }

    #[test]
    fn enabling_or_changing_interval_does_not_backfill_old_work() {
        let (mut conn, task_id, run_id) = fixture();
        observe!(&mut conn, task_id, run_id, 0, false, 60, true, T0).unwrap();
        observe!(&mut conn, task_id, run_id, 120, false, 60, false, T1).unwrap();
        observe!(&mut conn, task_id, run_id, 120, true, 60, false, T1).unwrap();
        assert_eq!(
            observe!(&mut conn, task_id, run_id, 179, true, 60, false, T1).unwrap(),
            0
        );
        assert_eq!(
            observe!(&mut conn, task_id, run_id, 180, true, 60, false, T1).unwrap(),
            1
        );

        observe!(&mut conn, task_id, run_id, 180, true, 30, false, T1).unwrap();
        assert_eq!(
            observe!(&mut conn, task_id, run_id, 209, true, 30, false, T1).unwrap(),
            0
        );
        assert_eq!(
            observe!(&mut conn, task_id, run_id, 210, true, 30, false, T1).unwrap(),
            1
        );
    }

    #[test]
    fn resetting_run_retires_old_pending_effects() {
        let (mut conn, task_id, first_run) = fixture();
        observe!(&mut conn, task_id, first_run, 0, true, 60, true, T0).unwrap();
        observe!(&mut conn, task_id, first_run, 60, true, 60, false, T1).unwrap();

        let second_run = SessionId::generate();
        observe!(&mut conn, task_id, second_run, 0, true, 60, true, T1).unwrap();

        assert!(claim_pending_timed_alerts(&mut conn, T1)
            .unwrap()
            .is_empty());
        assert_eq!(
            observe!(&mut conn, task_id, second_run, 60, true, 60, false, T1).unwrap(),
            1
        );
    }

    #[test]
    fn cursor_survives_database_reopen_and_delayed_observation_stays_idempotent() {
        use std::fs;
        use uuid::Uuid;

        let path =
            std::env::temp_dir().join(format!("narro-timed-alert-recovery-{}.db", Uuid::new_v4()));
        let task_id;
        let run_id = SessionId::generate();

        {
            let mut conn = Connection::open(&path).expect("open timed-alert recovery database");
            run_migrations(&mut conn).expect("migrate timed-alert recovery database");
            let list = create_list(
                &mut conn,
                NewListInput {
                    title: "Recovery".into(),
                    color: None,
                    icon_asset: None,
                },
                T0,
            )
            .expect("create recovery list");
            let task = create_task(
                &mut conn,
                NewTaskInput {
                    list_id: list.id,
                    title: "Recovery alert".into(),
                    manual_lane: PlanningLane::Today,
                    est_seconds: None,
                },
                T0,
            )
            .expect("create recovery task");
            task_id = task.id;

            observe!(&mut conn, task_id, run_id, 0, true, 60, true, T0).expect("seed alert run");
            observe!(&mut conn, task_id, run_id, 59, true, 60, false, T0)
                .expect("persist pre-boundary cursor");
        }

        {
            let mut conn = Connection::open(&path).expect("reopen timed-alert recovery database");
            crate::persistence::configure_connection(&conn).expect("configure reopened database");

            assert_eq!(
                observe!(&mut conn, task_id, run_id, 120, true, 60, false, T1)
                    .expect("catch up delayed alert boundaries"),
                2
            );
            assert_eq!(
                observe!(&mut conn, task_id, run_id, 120, true, 60, false, T1)
                    .expect("repeat delayed observation"),
                0
            );

            let pending = claim_pending_timed_alerts(&mut conn, T1)
                .expect("claim recovered timed alert effects");
            assert_eq!(
                pending
                    .iter()
                    .map(|effect| effect.boundary_seconds)
                    .collect::<Vec<_>>(),
                vec![60, 120]
            );
        }

        fs::remove_file(path).expect("remove timed-alert recovery database");
    }

    #[test]
    fn retiring_run_removes_pending_effects_and_cursor() {
        let (mut conn, task_id, run_id) = fixture();
        observe!(&mut conn, task_id, run_id, 0, true, 60, true, T0).unwrap();
        observe!(&mut conn, task_id, run_id, 60, true, 60, false, T1).unwrap();

        retire_timed_alert_run(&mut conn, task_id).expect("retire timed-alert run");

        assert!(claim_pending_timed_alerts(&mut conn, T1)
            .unwrap()
            .is_empty());
        assert!(load_cursor(&conn, task_id).unwrap().is_none());
    }
}
