use crate::domain::ids::SessionId;
use crate::domain::sessions::{SessionKind, SessionSource};
use crate::persistence::sessions::{get_session, SessionStoreError};
use crate::timer::{TimerMode, TimerSnapshot, TimerStateKind};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use std::fmt::{Display, Formatter};

pub const TIMER_RUNTIME_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TimerRuntimeRecord {
    pub snapshot: TimerSnapshot,
    pub active_session_id: SessionId,
    pub checkpointed_at: String,
}

#[derive(Debug)]
pub enum TimerRuntimeStoreError {
    Sqlite(rusqlite::Error),
    Session(SessionStoreError),
    InvalidCheckpointTimestamp,
    UnsupportedSchemaVersion(i64),
    CorruptPayload(String),
    CorruptSessionId(String),
    IdleSnapshot,
    MissingTaskIdentity,
    MissingTimerMode,
    InvalidBreakShape,
    InvalidModeState,
    ActiveSessionClosed(SessionId),
    ActiveSessionNotFocus(SessionId),
    ActiveSessionKindMismatch {
        session_id: SessionId,
        expected: SessionKind,
        actual: SessionKind,
    },
    ActiveSessionTaskMismatch(SessionId),
    CheckpointBeforeSessionUpdate,
}

impl Display for TimerRuntimeStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "timer runtime persistence failed: {error}"),
            Self::Session(error) => Display::fmt(error, formatter),
            Self::InvalidCheckpointTimestamp => {
                formatter.write_str("timer runtime checkpoint timestamp must be RFC 3339")
            }
            Self::UnsupportedSchemaVersion(version) => {
                write!(formatter, "unsupported timer runtime checkpoint schema version: {version}")
            }
            Self::CorruptPayload(error) => {
                write!(formatter, "stored timer runtime checkpoint payload is invalid: {error}")
            }
            Self::CorruptSessionId(value) => {
                write!(formatter, "stored timer runtime session identity is invalid: {value}")
            }
            Self::IdleSnapshot => {
                formatter.write_str("idle timer snapshots are not persisted as active runtime checkpoints")
            }
            Self::MissingTaskIdentity => {
                formatter.write_str("active timer runtime checkpoint is missing its task identity")
            }
            Self::MissingTimerMode => {
                formatter.write_str("active timer runtime checkpoint is missing its timer mode")
            }
            Self::InvalidBreakShape => {
                formatter.write_str("timer runtime break fields do not match the timer state")
            }
            Self::InvalidModeState => {
                formatter.write_str("timer runtime state is inconsistent with its timer mode")
            }
            Self::ActiveSessionClosed(id) => {
                write!(formatter, "timer runtime references a closed session: {id}")
            }
            Self::ActiveSessionNotFocus(id) => {
                write!(formatter, "timer runtime references a non-focus session: {id}")
            }
            Self::ActiveSessionKindMismatch {
                session_id,
                expected,
                actual,
            } => write!(
                formatter,
                "timer runtime session kind mismatch for {session_id}: expected {expected:?}, found {actual:?}"
            ),
            Self::ActiveSessionTaskMismatch(id) => {
                write!(formatter, "timer runtime task does not match active session {id}")
            }
            Self::CheckpointBeforeSessionUpdate => formatter.write_str(
                "timer runtime checkpoint timestamp cannot precede the active session update",
            ),
        }
    }
}

impl std::error::Error for TimerRuntimeStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Session(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for TimerRuntimeStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<SessionStoreError> for TimerRuntimeStoreError {
    fn from(value: SessionStoreError) -> Self {
        Self::Session(value)
    }
}

fn parse_timestamp(value: &str) -> Result<DateTime<chrono::FixedOffset>, TimerRuntimeStoreError> {
    DateTime::parse_from_rfc3339(value).map_err(|_| TimerRuntimeStoreError::InvalidCheckpointTimestamp)
}

fn validate_snapshot_shape(snapshot: &TimerSnapshot) -> Result<(), TimerRuntimeStoreError> {
    if snapshot.state == TimerStateKind::Idle {
        return Err(TimerRuntimeStoreError::IdleSnapshot);
    }
    if snapshot.task_id.is_none() {
        return Err(TimerRuntimeStoreError::MissingTaskIdentity);
    }
    let mode = snapshot.mode.ok_or(TimerRuntimeStoreError::MissingTimerMode)?;

    if snapshot.state == TimerStateKind::Break {
        if snapshot.break_kind.is_none() || snapshot.break_remaining_ms.is_none() {
            return Err(TimerRuntimeStoreError::InvalidBreakShape);
        }
    } else if snapshot.break_kind.is_some() || snapshot.break_remaining_ms.is_some() {
        return Err(TimerRuntimeStoreError::InvalidBreakShape);
    }

    match mode {
        TimerMode::CountUp => {
            if matches!(
                snapshot.state,
                TimerStateKind::TimeUp
                    | TimerStateKind::OvertimeRunning
                    | TimerStateKind::OvertimePaused
            ) {
                return Err(TimerRuntimeStoreError::InvalidModeState);
            }
            if snapshot.countdown_remaining_ms.is_some() && snapshot.state != TimerStateKind::Break {
                return Err(TimerRuntimeStoreError::InvalidModeState);
            }
        }
        TimerMode::EstCountdown { est_ms } => {
            if est_ms == 0 {
                return Err(TimerRuntimeStoreError::InvalidModeState);
            }
            if snapshot.state == TimerStateKind::TimeUp
                && (snapshot.work_elapsed_ms != est_ms || snapshot.overtime_ms != 0)
            {
                return Err(TimerRuntimeStoreError::InvalidModeState);
            }
            if matches!(
                snapshot.state,
                TimerStateKind::OvertimeRunning | TimerStateKind::OvertimePaused
            ) && snapshot.work_elapsed_ms < est_ms
            {
                return Err(TimerRuntimeStoreError::InvalidModeState);
            }
        }
        TimerMode::Pomodoro { work_ms, break_ms } => {
            if work_ms == 0 || break_ms == 0 {
                return Err(TimerRuntimeStoreError::InvalidModeState);
            }
            if matches!(
                snapshot.state,
                TimerStateKind::TimeUp
                    | TimerStateKind::OvertimeRunning
                    | TimerStateKind::OvertimePaused
            ) {
                return Err(TimerRuntimeStoreError::InvalidModeState);
            }
        }
    }

    Ok(())
}

fn validate_session_alignment(
    conn: &Connection,
    snapshot: &TimerSnapshot,
    active_session_id: SessionId,
    checkpointed_at: &str,
) -> Result<(), TimerRuntimeStoreError> {
    validate_snapshot_shape(snapshot)?;
    let checkpointed = parse_timestamp(checkpointed_at)?;
    let session = get_session(conn, active_session_id)?;
    if !session.is_open() {
        return Err(TimerRuntimeStoreError::ActiveSessionClosed(active_session_id));
    }
    if session.source != SessionSource::Focus {
        return Err(TimerRuntimeStoreError::ActiveSessionNotFocus(active_session_id));
    }

    let expected_kind = if snapshot.state == TimerStateKind::Break {
        SessionKind::Break
    } else {
        SessionKind::Work
    };
    if session.kind != expected_kind {
        return Err(TimerRuntimeStoreError::ActiveSessionKindMismatch {
            session_id: active_session_id,
            expected: expected_kind,
            actual: session.kind,
        });
    }

    let task_id = snapshot
        .task_id
        .ok_or(TimerRuntimeStoreError::MissingTaskIdentity)?;
    if session.task_id != Some(task_id) {
        return Err(TimerRuntimeStoreError::ActiveSessionTaskMismatch(
            active_session_id,
        ));
    }

    let session_updated = DateTime::parse_from_rfc3339(&session.updated_at)
        .map_err(|_| TimerRuntimeStoreError::CheckpointBeforeSessionUpdate)?;
    if checkpointed < session_updated {
        return Err(TimerRuntimeStoreError::CheckpointBeforeSessionUpdate);
    }
    Ok(())
}

pub fn save_timer_runtime(
    conn: &mut Connection,
    snapshot: &TimerSnapshot,
    active_session_id: SessionId,
    checkpointed_at: &str,
) -> Result<TimerRuntimeRecord, TimerRuntimeStoreError> {
    validate_snapshot_shape(snapshot)?;
    parse_timestamp(checkpointed_at)?;
    let payload = serde_json::to_string(snapshot)
        .map_err(|error| TimerRuntimeStoreError::CorruptPayload(error.to_string()))?;

    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    validate_session_alignment(&tx, snapshot, active_session_id, checkpointed_at)?;
    tx.execute(
        "INSERT INTO timer_runtime_checkpoint (
            id, schema_version, payload_json, active_session_id, checkpointed_at
         ) VALUES (1, ?1, ?2, ?3, ?4)
         ON CONFLICT(id) DO UPDATE SET
            schema_version = excluded.schema_version,
            payload_json = excluded.payload_json,
            active_session_id = excluded.active_session_id,
            checkpointed_at = excluded.checkpointed_at",
        params![
            i64::from(TIMER_RUNTIME_SCHEMA_VERSION),
            payload,
            active_session_id.to_string(),
            checkpointed_at
        ],
    )?;
    tx.commit()?;

    Ok(TimerRuntimeRecord {
        snapshot: snapshot.clone(),
        active_session_id,
        checkpointed_at: checkpointed_at.to_owned(),
    })
}

pub fn load_timer_runtime(
    conn: &Connection,
) -> Result<Option<TimerRuntimeRecord>, TimerRuntimeStoreError> {
    let stored: Option<(i64, String, String, String)> = conn
        .query_row(
            "SELECT schema_version, payload_json, active_session_id, checkpointed_at
             FROM timer_runtime_checkpoint WHERE id = 1",
            [],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
        )
        .optional()?;
    let Some((schema_version, payload, session_id, checkpointed_at)) = stored else {
        return Ok(None);
    };
    if schema_version != i64::from(TIMER_RUNTIME_SCHEMA_VERSION) {
        return Err(TimerRuntimeStoreError::UnsupportedSchemaVersion(
            schema_version,
        ));
    }
    let snapshot: TimerSnapshot = serde_json::from_str(&payload)
        .map_err(|error| TimerRuntimeStoreError::CorruptPayload(error.to_string()))?;
    let active_session_id = SessionId::parse_str(&session_id)
        .map_err(|_| TimerRuntimeStoreError::CorruptSessionId(session_id.clone()))?;
    validate_session_alignment(
        conn,
        &snapshot,
        active_session_id,
        &checkpointed_at,
    )?;

    Ok(Some(TimerRuntimeRecord {
        snapshot,
        active_session_id,
        checkpointed_at,
    }))
}

pub fn clear_timer_runtime(conn: &mut Connection) -> Result<bool, TimerRuntimeStoreError> {
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let changed = tx.execute("DELETE FROM timer_runtime_checkpoint WHERE id = 1", [])?;
    tx.commit()?;
    Ok(changed == 1)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::sessions::{close_session, open_focus_break_session, open_focus_work_session};
    use crate::persistence::tasks::create_task;
    use crate::timer::{TimerEngine, TimerMode};

    const T0: &str = "2026-09-04T14:00:00Z";
    const T1: &str = "2026-09-04T14:00:05Z";

    fn fixture() -> (Connection, crate::domain::ids::TaskId) {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let list = create_list(
            &mut conn,
            NewListInput {
                title: "Inbox".into(),
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
                title: "Focus".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(60),
            },
            T0,
        )
        .expect("create task");
        (conn, task.id)
    }

    #[test]
    fn active_work_runtime_round_trips_and_restores_paused() {
        let (mut conn, task_id) = fixture();
        let session = open_focus_work_session(&mut conn, task_id, T0).expect("open work");
        let mut engine = TimerEngine::new();
        engine.start_task(task_id, TimerMode::CountUp, 0).unwrap();
        let snapshot = engine.advance(5_000).unwrap();
        save_timer_runtime(&mut conn, &snapshot, session.id, T1).expect("save runtime");

        let stored = load_timer_runtime(&conn)
            .expect("load runtime")
            .expect("runtime exists");
        assert_eq!(stored.snapshot, snapshot);
        assert_eq!(stored.active_session_id, session.id);

        let restored = TimerEngine::restore_snapshot_paused(&stored.snapshot, 100_000).unwrap();
        let recovered = restored.snapshot(200_000).unwrap();
        assert_eq!(recovered.state, TimerStateKind::Paused);
        assert_eq!(recovered.work_elapsed_ms, 5_000);
    }

    #[test]
    fn break_runtime_requires_an_open_break_row_for_the_same_task() {
        let (mut conn, task_id) = fixture();
        let work = open_focus_work_session(&mut conn, task_id, T0).expect("open work");
        close_session(&mut conn, work.id, 4, T1).expect("close work");
        let break_session =
            open_focus_break_session(&mut conn, Some(task_id), T1).expect("open break");
        let mut engine = TimerEngine::new();
        engine.start_task(task_id, TimerMode::CountUp, 0).unwrap();
        let snapshot = engine.start_manual_break(10_000, 4_000).unwrap();

        save_timer_runtime(&mut conn, &snapshot, break_session.id, T1)
            .expect("save break runtime");
        assert!(load_timer_runtime(&conn).unwrap().is_some());
    }

    #[test]
    fn session_kind_mismatch_is_rejected_without_overwriting_existing_checkpoint() {
        let (mut conn, task_id) = fixture();
        let session = open_focus_work_session(&mut conn, task_id, T0).expect("open work");
        let mut engine = TimerEngine::new();
        engine.start_task(task_id, TimerMode::CountUp, 0).unwrap();
        let work_snapshot = engine.advance(5_000).unwrap();
        save_timer_runtime(&mut conn, &work_snapshot, session.id, T1).unwrap();

        let break_snapshot = engine.start_manual_break(10_000, 5_000).unwrap();
        assert!(matches!(
            save_timer_runtime(&mut conn, &break_snapshot, session.id, T1),
            Err(TimerRuntimeStoreError::ActiveSessionKindMismatch { .. })
        ));
        let persisted = load_timer_runtime(&conn).unwrap().unwrap();
        assert_eq!(persisted.snapshot, work_snapshot);
    }

    #[test]
    fn clearing_runtime_is_idempotent() {
        let (mut conn, task_id) = fixture();
        let session = open_focus_work_session(&mut conn, task_id, T0).expect("open work");
        let mut engine = TimerEngine::new();
        let snapshot = engine.start_task(task_id, TimerMode::CountUp, 0).unwrap();
        save_timer_runtime(&mut conn, &snapshot, session.id, T0).unwrap();
        assert!(clear_timer_runtime(&mut conn).unwrap());
        assert!(!clear_timer_runtime(&mut conn).unwrap());
        assert!(load_timer_runtime(&conn).unwrap().is_none());
    }
}
