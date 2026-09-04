from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if text.count(old) != 1:
        raise SystemExit(f"{path}: expected exactly one anchor, found {text.count(old)}")
    p.write_text(text.replace(old, new), encoding="utf-8")


def replace_region(path: str, start_marker: str, end_marker: str, replacement: str) -> None:
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    start = text.find(start_marker)
    end = text.find(end_marker, start)
    if start < 0 or end < 0:
        raise SystemExit(f"{path}: region markers not found")
    p.write_text(text[:start] + replacement + text[end:], encoding="utf-8")


Path("src-tauri/migrations/0004_timer_runtime_checkpoint.sql").write_text(
    """-- Migration 04: Durable timer-runtime recovery checkpoint\n"
    "-- The authoritative runtime checkpoint is stored only on the currently open session row.\n"
    "-- Closed historical sessions may retain their last checkpoint for diagnostics, but recovery\n"
    "-- always reads the single unfinished session selected by sessions_single_open_idx.\n\n"
    "ALTER TABLE sessions ADD COLUMN runtime_checkpoint_json TEXT;\n""",
    encoding="utf-8",
)

replace_once(
    "src-tauri/src/persistence/mod.rs",
    '        M::up(include_str!("../../migrations/0003_session_runtime.sql")),\n',
    '        M::up(include_str!("../../migrations/0003_session_runtime.sql")),\n'
    '        M::up(include_str!("../../migrations/0004_timer_runtime_checkpoint.sql")),\n',
)

sessions_path = "src-tauri/src/persistence/sessions.rs"
replace_once(
    sessions_path,
    """fn open_focus_session(\n    conn: &mut Connection,\n    kind: SessionKind,\n    task_id: Option<TaskId>,\n    started_at: &str,\n) -> Result<SessionRecord, SessionStoreError> {""",
    """fn open_focus_session(\n    conn: &mut Connection,\n    kind: SessionKind,\n    task_id: Option<TaskId>,\n    started_at: &str,\n    runtime_checkpoint_json: Option<&str>,\n) -> Result<SessionRecord, SessionStoreError> {""",
)
replace_once(
    sessions_path,
    """        \"INSERT INTO sessions (\n            id, task_id, kind, started_at, ended_at, duration_seconds,\n            source, created_at, updated_at\n         ) VALUES (?1, ?2, ?3, ?4, NULL, 0, 'focus', ?4, ?4)\",\n        params![\n            id.to_string(),\n            task_id.map(|value| value.to_string()),\n            kind.as_str(),\n            started_at\n        ],""",
    """        \"INSERT INTO sessions (\n            id, task_id, kind, started_at, ended_at, duration_seconds,\n            source, created_at, updated_at, runtime_checkpoint_json\n         ) VALUES (?1, ?2, ?3, ?4, NULL, 0, 'focus', ?4, ?4, ?5)\",\n        params![\n            id.to_string(),\n            task_id.map(|value| value.to_string()),\n            kind.as_str(),\n            started_at,\n            runtime_checkpoint_json\n        ],""",
)
replace_region(
    sessions_path,
    "pub fn open_focus_work_session(",
    "pub fn get_session(",
    """pub fn open_focus_work_session(\n    conn: &mut Connection,\n    task_id: TaskId,\n    started_at: &str,\n) -> Result<SessionRecord, SessionStoreError> {\n    open_focus_session(conn, SessionKind::Work, Some(task_id), started_at, None)\n}\n\npub fn open_focus_work_session_with_runtime_checkpoint(\n    conn: &mut Connection,\n    task_id: TaskId,\n    started_at: &str,\n    runtime_checkpoint_json: &str,\n) -> Result<SessionRecord, SessionStoreError> {\n    open_focus_session(\n        conn,\n        SessionKind::Work,\n        Some(task_id),\n        started_at,\n        Some(runtime_checkpoint_json),\n    )\n}\n\npub fn open_focus_break_session(\n    conn: &mut Connection,\n    task_id: Option<TaskId>,\n    started_at: &str,\n) -> Result<SessionRecord, SessionStoreError> {\n    open_focus_session(conn, SessionKind::Break, task_id, started_at, None)\n}\n\npub fn open_focus_break_session_with_runtime_checkpoint(\n    conn: &mut Connection,\n    task_id: Option<TaskId>,\n    started_at: &str,\n    runtime_checkpoint_json: &str,\n) -> Result<SessionRecord, SessionStoreError> {\n    open_focus_session(\n        conn,\n        SessionKind::Break,\n        task_id,\n        started_at,\n        Some(runtime_checkpoint_json),\n    )\n}\n\n""",
)
replace_once(
    sessions_path,
    """pub fn get_open_session(conn: &Connection) -> Result<Option<SessionRecord>, SessionStoreError> {\n    load_open_session(conn)\n}\n\n""",
    """pub fn get_open_session(conn: &Connection) -> Result<Option<SessionRecord>, SessionStoreError> {\n    load_open_session(conn)\n}\n\npub fn get_session_runtime_checkpoint(\n    conn: &Connection,\n    id: SessionId,\n) -> Result<Option<String>, SessionStoreError> {\n    let value = conn\n        .query_row(\n            \"SELECT runtime_checkpoint_json FROM sessions WHERE id = ?1\",\n            [id.to_string()],\n            |row| row.get::<_, Option<String>>(0),\n        )\n        .optional()?;\n    value.ok_or(SessionStoreError::NotFound(id))\n}\n\n""",
)
replace_region(
    sessions_path,
    "pub fn checkpoint_open_session(",
    "pub fn close_session(",
    """fn checkpoint_open_session_inner(\n    conn: &mut Connection,\n    id: SessionId,\n    duration_seconds: u64,\n    now: &str,\n    runtime_checkpoint_json: Option<&str>,\n) -> Result<SessionRecord, SessionStoreError> {\n    validate_mutation_timestamp(now)?;\n    let duration_sql = duration_for_sql(duration_seconds)?;\n    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;\n    let current = load_session(&tx, id)?;\n    if !current.is_open() {\n        return Err(SessionStoreError::AlreadyClosed(id));\n    }\n    ensure_not_before_start(&current.started_at, now)?;\n    ensure_not_before_previous_update(&current.updated_at, now)?;\n    if duration_seconds < current.duration_seconds {\n        return Err(SessionStoreError::DurationDecreased {\n            stored_seconds: current.duration_seconds,\n            attempted_seconds: duration_seconds,\n        });\n    }\n\n    let changed = tx.execute(\n        \"UPDATE sessions\n         SET duration_seconds = ?1,\n             updated_at = ?2,\n             runtime_checkpoint_json = COALESCE(?4, runtime_checkpoint_json)\n         WHERE id = ?3 AND ended_at IS NULL\",\n        params![\n            duration_sql,\n            now,\n            id.to_string(),\n            runtime_checkpoint_json\n        ],\n    )?;\n    if changed != 1 {\n        return Err(SessionStoreError::AlreadyClosed(id));\n    }\n    let updated = load_session(&tx, id)?;\n    tx.commit()?;\n    Ok(updated)\n}\n\npub fn checkpoint_open_session(\n    conn: &mut Connection,\n    id: SessionId,\n    duration_seconds: u64,\n    now: &str,\n) -> Result<SessionRecord, SessionStoreError> {\n    checkpoint_open_session_inner(conn, id, duration_seconds, now, None)\n}\n\npub fn checkpoint_open_session_with_runtime_checkpoint(\n    conn: &mut Connection,\n    id: SessionId,\n    duration_seconds: u64,\n    now: &str,\n    runtime_checkpoint_json: &str,\n) -> Result<SessionRecord, SessionStoreError> {\n    checkpoint_open_session_inner(\n        conn,\n        id,\n        duration_seconds,\n        now,\n        Some(runtime_checkpoint_json),\n    )\n}\n\n""",
)
replace_region(
    sessions_path,
    "pub fn replace_open_focus_session(",
    "pub fn sessions_for_task(",
    """fn replace_open_focus_session_inner(\n    conn: &mut Connection,\n    current_id: SessionId,\n    current_duration_seconds: u64,\n    next_kind: SessionKind,\n    next_task_id: Option<TaskId>,\n    transitioned_at: &str,\n    next_runtime_checkpoint_json: Option<&str>,\n) -> Result<(SessionRecord, SessionRecord), SessionStoreError> {\n    validate_mutation_timestamp(transitioned_at)?;\n    if next_kind == SessionKind::Work && next_task_id.is_none() {\n        return Err(SessionStoreError::InvalidSessionShape);\n    }\n    let duration_sql = duration_for_sql(current_duration_seconds)?;\n    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;\n    let current = load_session(&tx, current_id)?;\n    if !current.is_open() {\n        return Err(SessionStoreError::AlreadyClosed(current_id));\n    }\n    ensure_not_before_start(&current.started_at, transitioned_at)?;\n    ensure_not_before_previous_update(&current.updated_at, transitioned_at)?;\n    if current_duration_seconds < current.duration_seconds {\n        return Err(SessionStoreError::DurationDecreased {\n            stored_seconds: current.duration_seconds,\n            attempted_seconds: current_duration_seconds,\n        });\n    }\n    if let Some(task_id) = next_task_id {\n        validate_focus_task(&tx, task_id)?;\n    }\n\n    let changed = tx.execute(\n        \"UPDATE sessions\n         SET ended_at = ?1, duration_seconds = ?2, updated_at = ?1\n         WHERE id = ?3 AND ended_at IS NULL\",\n        params![transitioned_at, duration_sql, current_id.to_string()],\n    )?;\n    if changed != 1 {\n        return Err(SessionStoreError::AlreadyClosed(current_id));\n    }\n\n    let next_id = SessionId::generate();\n    tx.execute(\n        \"INSERT INTO sessions (\n            id, task_id, kind, started_at, ended_at, duration_seconds,\n            source, created_at, updated_at, runtime_checkpoint_json\n         ) VALUES (?1, ?2, ?3, ?4, NULL, 0, 'focus', ?4, ?4, ?5)\",\n        params![\n            next_id.to_string(),\n            next_task_id.map(|value| value.to_string()),\n            next_kind.as_str(),\n            transitioned_at,\n            next_runtime_checkpoint_json\n        ],\n    )?;\n\n    let closed = load_session(&tx, current_id)?;\n    let opened = load_session(&tx, next_id)?;\n    tx.commit()?;\n    Ok((closed, opened))\n}\n\npub fn replace_open_focus_session(\n    conn: &mut Connection,\n    current_id: SessionId,\n    current_duration_seconds: u64,\n    next_kind: SessionKind,\n    next_task_id: Option<TaskId>,\n    transitioned_at: &str,\n) -> Result<(SessionRecord, SessionRecord), SessionStoreError> {\n    replace_open_focus_session_inner(\n        conn,\n        current_id,\n        current_duration_seconds,\n        next_kind,\n        next_task_id,\n        transitioned_at,\n        None,\n    )\n}\n\npub fn replace_open_focus_session_with_runtime_checkpoint(\n    conn: &mut Connection,\n    current_id: SessionId,\n    current_duration_seconds: u64,\n    next_kind: SessionKind,\n    next_task_id: Option<TaskId>,\n    transitioned_at: &str,\n    next_runtime_checkpoint_json: &str,\n) -> Result<(SessionRecord, SessionRecord), SessionStoreError> {\n    replace_open_focus_session_inner(\n        conn,\n        current_id,\n        current_duration_seconds,\n        next_kind,\n        next_task_id,\n        transitioned_at,\n        Some(next_runtime_checkpoint_json),\n    )\n}\n\n""",
)

Path("src-tauri/src/timer/recovery.rs").write_text(
    r'''use super::{RuntimeState, TimerEngine, TimerError, TimerMode, TimerSnapshot, TimerStateKind, WorkPhase, WorkRuntime};
use crate::domain::ids::TaskId;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

const RECOVERY_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub(crate) struct TimerRecoveryCheckpoint {
    pub(crate) schema_version: u32,
    pub(crate) task_id: TaskId,
    pub(crate) mode: TimerMode,
    pub(crate) state: TimerStateKind,
    pub(crate) work_elapsed_ms: u64,
    pub(crate) interval_work_ms: u64,
    pub(crate) total_break_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TimerRecoveryError {
    Timer(TimerError),
    UnsupportedSchemaVersion(u32),
    IdleCheckpoint,
    InvalidCheckpoint(&'static str),
}

impl Display for TimerRecoveryError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Timer(error) => Display::fmt(error, formatter),
            Self::UnsupportedSchemaVersion(version) => {
                write!(formatter, "unsupported timer recovery checkpoint version: {version}")
            }
            Self::IdleCheckpoint => formatter.write_str("idle timer state must not have a recovery checkpoint"),
            Self::InvalidCheckpoint(reason) => write!(formatter, "invalid timer recovery checkpoint: {reason}"),
        }
    }
}

impl std::error::Error for TimerRecoveryError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Timer(error) => Some(error),
            _ => None,
        }
    }
}

impl From<TimerError> for TimerRecoveryError {
    fn from(value: TimerError) -> Self {
        Self::Timer(value)
    }
}

impl TimerEngine {
    pub(crate) fn recovery_checkpoint(
        &self,
        now_ms: u64,
    ) -> Result<TimerRecoveryCheckpoint, TimerRecoveryError> {
        if let Some(previous_ms) = self.last_observed_ms {
            if now_ms < previous_ms {
                return Err(TimerError::ClockMovedBackwards {
                    previous_ms,
                    now_ms,
                }
                .into());
            }
        }

        let mut candidate = self.clone();
        candidate.advance_inner(now_ms)?;
        match &candidate.runtime {
            RuntimeState::Idle => Err(TimerRecoveryError::IdleCheckpoint),
            RuntimeState::Work(work) => Ok(TimerRecoveryCheckpoint {
                schema_version: RECOVERY_SCHEMA_VERSION,
                task_id: work.task_id,
                mode: work.mode,
                state: work.phase.state_kind(),
                work_elapsed_ms: work.projected_total(now_ms)?,
                interval_work_ms: work.projected_interval(now_ms)?,
                total_break_ms: candidate.committed_break_ms,
            }),
            RuntimeState::Break(break_runtime) => {
                let current_break_ms = break_runtime.projected_elapsed(now_ms)?;
                let total_break_ms = candidate
                    .committed_break_ms
                    .checked_add(current_break_ms)
                    .ok_or(TimerError::DurationOverflow)?;
                Ok(TimerRecoveryCheckpoint {
                    schema_version: RECOVERY_SCHEMA_VERSION,
                    task_id: break_runtime.resume_work.task_id,
                    mode: break_runtime.resume_work.mode,
                    state: TimerStateKind::Break,
                    work_elapsed_ms: break_runtime.resume_work.total_work_ms,
                    interval_work_ms: break_runtime.resume_work.interval_work_ms,
                    total_break_ms,
                })
            }
        }
    }

    pub(crate) fn restore_interrupted_paused(
        checkpoint: TimerRecoveryCheckpoint,
        now_ms: u64,
    ) -> Result<(Self, TimerSnapshot), TimerRecoveryError> {
        if checkpoint.schema_version != RECOVERY_SCHEMA_VERSION {
            return Err(TimerRecoveryError::UnsupportedSchemaVersion(
                checkpoint.schema_version,
            ));
        }
        checkpoint.mode.validate()?;
        if checkpoint.state == TimerStateKind::Idle {
            return Err(TimerRecoveryError::IdleCheckpoint);
        }
        if checkpoint.interval_work_ms > checkpoint.work_elapsed_ms {
            return Err(TimerRecoveryError::InvalidCheckpoint(
                "interval work exceeds total work",
            ));
        }

        let phase = recovered_phase(&checkpoint)?;
        let engine = Self {
            runtime: RuntimeState::Work(WorkRuntime {
                task_id: checkpoint.task_id,
                mode: checkpoint.mode,
                phase,
                total_work_ms: checkpoint.work_elapsed_ms,
                interval_work_ms: checkpoint.interval_work_ms,
                run_started_ms: None,
            }),
            committed_break_ms: checkpoint.total_break_ms,
            last_observed_ms: Some(now_ms),
        };
        let snapshot = engine.snapshot_inner(now_ms)?;
        Ok((engine, snapshot))
    }
}

fn recovered_phase(checkpoint: &TimerRecoveryCheckpoint) -> Result<WorkPhase, TimerRecoveryError> {
    match checkpoint.state {
        TimerStateKind::Running | TimerStateKind::Paused => validate_normal_paused(checkpoint),
        TimerStateKind::TimeUp => match checkpoint.mode {
            TimerMode::EstCountdown { est_ms } if checkpoint.work_elapsed_ms == est_ms => {
                Ok(WorkPhase::TimeUp)
            }
            _ => Err(TimerRecoveryError::InvalidCheckpoint(
                "Time's Up requires work exactly at the EST boundary",
            )),
        },
        TimerStateKind::OvertimeRunning | TimerStateKind::OvertimePaused => match checkpoint.mode {
            TimerMode::EstCountdown { est_ms } if checkpoint.work_elapsed_ms > est_ms => {
                Ok(WorkPhase::OvertimePaused)
            }
            _ => Err(TimerRecoveryError::InvalidCheckpoint(
                "overtime requires work beyond the EST boundary",
            )),
        },
        TimerStateKind::Break => match checkpoint.mode {
            TimerMode::EstCountdown { est_ms } if checkpoint.work_elapsed_ms > est_ms => {
                Ok(WorkPhase::OvertimePaused)
            }
            TimerMode::EstCountdown { est_ms } if checkpoint.work_elapsed_ms == est_ms => {
                Ok(WorkPhase::TimeUp)
            }
            _ => validate_normal_paused(checkpoint),
        },
        TimerStateKind::Idle => Err(TimerRecoveryError::IdleCheckpoint),
    }
}

fn validate_normal_paused(
    checkpoint: &TimerRecoveryCheckpoint,
) -> Result<WorkPhase, TimerRecoveryError> {
    match checkpoint.mode {
        TimerMode::CountUp => {
            if checkpoint.interval_work_ms != checkpoint.work_elapsed_ms {
                return Err(TimerRecoveryError::InvalidCheckpoint(
                    "count-up interval work must equal total work",
                ));
            }
        }
        TimerMode::EstCountdown { est_ms } => {
            if checkpoint.work_elapsed_ms >= est_ms {
                return Err(TimerRecoveryError::InvalidCheckpoint(
                    "normal EST state must remain before the EST boundary",
                ));
            }
            if checkpoint.interval_work_ms != checkpoint.work_elapsed_ms {
                return Err(TimerRecoveryError::InvalidCheckpoint(
                    "EST interval work must equal total work",
                ));
            }
        }
        TimerMode::Pomodoro { work_ms, .. } => {
            if checkpoint.interval_work_ms >= work_ms {
                return Err(TimerRecoveryError::InvalidCheckpoint(
                    "Pomodoro interval work must remain below its work boundary",
                ));
            }
        }
    }
    Ok(WorkPhase::Paused)
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    fn task() -> TaskId {
        TaskId::from_uuid(Uuid::from_u128(0x4000))
    }

    #[test]
    fn running_checkpoint_restores_paused_without_counting_downtime() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(), TimerMode::CountUp, 0).unwrap();
        let checkpoint = engine.recovery_checkpoint(5_000).unwrap();
        let (_, restored) = TimerEngine::restore_interrupted_paused(checkpoint, 500_000).unwrap();
        assert_eq!(restored.state, TimerStateKind::Paused);
        assert_eq!(restored.work_elapsed_ms, 5_000);
    }

    #[test]
    fn est_and_pomodoro_checkpoint_shapes_restore_safely() {
        let mut est = TimerEngine::new();
        est.start_task(task(), TimerMode::EstCountdown { est_ms: 5_000 }, 0)
            .unwrap();
        let at_limit = est.recovery_checkpoint(8_000).unwrap();
        let (_, restored_limit) = TimerEngine::restore_interrupted_paused(at_limit, 99_000).unwrap();
        assert_eq!(restored_limit.state, TimerStateKind::TimeUp);
        assert_eq!(restored_limit.work_elapsed_ms, 5_000);

        let mut pomodoro = TimerEngine::new();
        pomodoro
            .start_task(
                task(),
                TimerMode::Pomodoro {
                    work_ms: 2_000,
                    break_ms: 3_000,
                },
                0,
            )
            .unwrap();
        let on_break = pomodoro.recovery_checkpoint(2_500).unwrap();
        assert_eq!(on_break.state, TimerStateKind::Break);
        let (_, restored_break) = TimerEngine::restore_interrupted_paused(on_break, 99_000).unwrap();
        assert_eq!(restored_break.state, TimerStateKind::Paused);
        assert_eq!(restored_break.work_elapsed_ms, 2_000);
        assert_eq!(restored_break.countdown_remaining_ms, Some(2_000));
    }
}
''',
    encoding="utf-8",
)

replace_once(
    "src-tauri/src/timer/mod.rs",
    """mod lifecycle;\npub mod runtime;\npub use lifecycle::{TaskExitReason, TimerExit, TimerSwitchResult};\n""",
    """mod lifecycle;\nmod recovery;\npub mod runtime;\npub use lifecycle::{TaskExitReason, TimerExit, TimerSwitchResult};\npub use recovery::TimerRecoveryError;\npub(crate) use recovery::TimerRecoveryCheckpoint;\n""",
)

runtime_path = "src-tauri/src/timer/runtime.rs"
replace_once(
    runtime_path,
    """use super::{\n    TaskExitReason, TimerEngine, TimerError, TimerExit, TimerMode, TimerSnapshot, TimerStateKind,\n    TimerSwitchResult,\n};""",
    """use super::{\n    TaskExitReason, TimerEngine, TimerError, TimerExit, TimerMode, TimerRecoveryCheckpoint,\n    TimerRecoveryError, TimerSnapshot, TimerStateKind, TimerSwitchResult,\n};""",
)
replace_once(
    runtime_path,
    "use crate::domain::sessions::{SessionKind, SessionRecord};",
    "use crate::domain::sessions::{SessionKind, SessionRecord, SessionSource};",
)
replace_once(
    runtime_path,
    """use crate::persistence::sessions::{\n    checkpoint_open_session, close_session, open_focus_break_session, open_focus_work_session,\n    replace_open_focus_session, SessionStoreError,\n};""",
    """use crate::persistence::sessions::{\n    checkpoint_open_session_with_runtime_checkpoint, close_session, get_open_session,\n    get_session_runtime_checkpoint, open_focus_break_session_with_runtime_checkpoint,\n    open_focus_work_session_with_runtime_checkpoint,\n    replace_open_focus_session_with_runtime_checkpoint, SessionStoreError,\n};""",
)
replace_once(
    runtime_path,
    """pub enum TimerRuntimeError {\n    Timer(TimerError),\n    Session(SessionStoreError),\n    BindingMismatch,\n    DurationAccountingUnderflow,\n}""",
    """pub enum TimerRuntimeError {\n    Timer(TimerError),\n    Recovery(TimerRecoveryError),\n    Session(SessionStoreError),\n    CheckpointJson(serde_json::Error),\n    BindingMismatch,\n    MissingRuntimeCheckpoint(SessionId),\n    UnsupportedRecoverySession {\n        id: SessionId,\n        kind: SessionKind,\n        source: SessionSource,\n    },\n    RecoveryTaskMismatch {\n        session_id: SessionId,\n        session_task_id: Option<TaskId>,\n        checkpoint_task_id: TaskId,\n    },\n    DurationAccountingUnderflow,\n}""",
)
replace_once(
    runtime_path,
    """            Self::Timer(error) => Display::fmt(error, formatter),\n            Self::Session(error) => Display::fmt(error, formatter),\n            Self::BindingMismatch => formatter\n                .write_str(\"timer runtime and persisted open-session binding are inconsistent\"),\n            Self::DurationAccountingUnderflow => formatter\n                .write_str(\"timer runtime duration is lower than already-closed session duration\"),""",
    """            Self::Timer(error) => Display::fmt(error, formatter),\n            Self::Recovery(error) => Display::fmt(error, formatter),\n            Self::Session(error) => Display::fmt(error, formatter),\n            Self::CheckpointJson(error) => write!(formatter, \"timer runtime checkpoint JSON failed: {error}\"),\n            Self::BindingMismatch => formatter\n                .write_str(\"timer runtime and persisted open-session binding are inconsistent\"),\n            Self::MissingRuntimeCheckpoint(id) => {\n                write!(formatter, \"open focus session {id} has no durable timer checkpoint\")\n            }\n            Self::UnsupportedRecoverySession { id, kind, source } => write!(\n                formatter,\n                \"cannot recover open session {id}: kind={kind:?} source={source:?}\"\n            ),\n            Self::RecoveryTaskMismatch {\n                session_id,\n                session_task_id,\n                checkpoint_task_id,\n            } => write!(\n                formatter,\n                \"timer recovery task mismatch for session {session_id}: session={session_task_id:?} checkpoint={checkpoint_task_id}\"\n            ),\n            Self::DurationAccountingUnderflow => formatter\n                .write_str(\"timer runtime duration is lower than already-closed session duration\"),""",
)
replace_once(
    runtime_path,
    """            Self::Timer(error) => Some(error),\n            Self::Session(error) => Some(error),\n            _ => None,""",
    """            Self::Timer(error) => Some(error),\n            Self::Recovery(error) => Some(error),\n            Self::Session(error) => Some(error),\n            Self::CheckpointJson(error) => Some(error),\n            _ => None,""",
)
replace_once(
    runtime_path,
    """impl From<SessionStoreError> for TimerRuntimeError {\n    fn from(value: SessionStoreError) -> Self {\n        Self::Session(value)\n    }\n}\n""",
    """impl From<SessionStoreError> for TimerRuntimeError {\n    fn from(value: SessionStoreError) -> Self {\n        Self::Session(value)\n    }\n}\n\nimpl From<TimerRecoveryError> for TimerRuntimeError {\n    fn from(value: TimerRecoveryError) -> Self {\n        Self::Recovery(value)\n    }\n}\n\nimpl From<serde_json::Error> for TimerRuntimeError {\n    fn from(value: serde_json::Error) -> Self {\n        Self::CheckpointJson(value)\n    }\n}\n""",
)
replace_once(
    runtime_path,
    """    pub fn open_session_id(&self) -> Option<SessionId> {\n        self.binding.as_ref().map(|binding| binding.id)\n    }\n\n    pub fn start_task(""",
    r'''    pub fn open_session_id(&self) -> Option<SessionId> {
        self.binding.as_ref().map(|binding| binding.id)
    }

    pub fn recover_after_restart(
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<Option<(Self, TimerRuntimeSnapshot)>, TimerRuntimeError> {
        let Some(session) = get_open_session(conn)? else {
            return Ok(None);
        };
        if session.source != SessionSource::Focus {
            return Err(TimerRuntimeError::UnsupportedRecoverySession {
                id: session.id,
                kind: session.kind,
                source: session.source,
            });
        }
        let checkpoint_json = get_session_runtime_checkpoint(conn, session.id)?
            .ok_or(TimerRuntimeError::MissingRuntimeCheckpoint(session.id))?;
        let checkpoint: TimerRecoveryCheckpoint = serde_json::from_str(&checkpoint_json)?;
        if session.task_id != Some(checkpoint.task_id) {
            return Err(TimerRuntimeError::RecoveryTaskMismatch {
                session_id: session.id,
                session_task_id: session.task_id,
                checkpoint_task_id: checkpoint.task_id,
            });
        }
        match (session.kind, checkpoint.state) {
            (SessionKind::Work, TimerStateKind::Break)
            | (SessionKind::Break, TimerStateKind::Running)
            | (SessionKind::Break, TimerStateKind::Paused)
            | (SessionKind::Break, TimerStateKind::TimeUp)
            | (SessionKind::Break, TimerStateKind::OvertimeRunning)
            | (SessionKind::Break, TimerStateKind::OvertimePaused)
            | (_, TimerStateKind::Idle) => return Err(TimerRuntimeError::BindingMismatch),
            _ => {}
        }

        let (engine, snapshot) = TimerEngine::restore_interrupted_paused(checkpoint, now_ms)?;
        let checkpoint_json = encoded_checkpoint(&engine, now_ms)?;
        let total_work_seconds = seconds(snapshot.work_elapsed_ms);
        let total_break_seconds = seconds(snapshot.total_break_ms);

        let (binding, closed_work_seconds, closed_break_seconds) = match session.kind {
            SessionKind::Work => {
                let closed_work_seconds = total_work_seconds
                    .checked_sub(session.duration_seconds)
                    .ok_or(TimerRuntimeError::DurationAccountingUnderflow)?;
                checkpoint_open_session_with_runtime_checkpoint(
                    conn,
                    session.id,
                    session.duration_seconds,
                    wall_time,
                    &checkpoint_json,
                )?;
                (
                    SessionBinding::from_record(&session),
                    closed_work_seconds,
                    total_break_seconds,
                )
            }
            SessionKind::Break => {
                total_break_seconds
                    .checked_sub(session.duration_seconds)
                    .ok_or(TimerRuntimeError::DurationAccountingUnderflow)?;
                let (_, opened) = replace_open_focus_session_with_runtime_checkpoint(
                    conn,
                    session.id,
                    session.duration_seconds,
                    SessionKind::Work,
                    Some(snapshot.task_id.ok_or(TimerRuntimeError::BindingMismatch)?),
                    wall_time,
                    &checkpoint_json,
                )?;
                (
                    SessionBinding::from_record(&opened),
                    total_work_seconds,
                    total_break_seconds,
                )
            }
        };

        let runtime = Self {
            engine,
            binding: Some(binding),
            closed_work_seconds,
            closed_break_seconds,
            last_state: snapshot.state,
        };
        let runtime_snapshot = runtime.runtime_snapshot(snapshot);
        Ok(Some((runtime, runtime_snapshot)))
    }

    pub fn start_task(''',
)
replace_once(
    runtime_path,
    """        let snapshot = engine.start_task(task_id, mode, now_ms)?;\n        let session = open_focus_work_session(conn, task_id, wall_time)?;\n""",
    """        let snapshot = engine.start_task(task_id, mode, now_ms)?;\n        let checkpoint_json = encoded_checkpoint(&engine, now_ms)?;\n        let session = open_focus_work_session_with_runtime_checkpoint(\n            conn,\n            task_id,\n            wall_time,\n            &checkpoint_json,\n        )?;\n""",
)
for method in ["advance", "pause", "resume", "extend"]:
    old = "self.commit_candidate(conn, engine, snapshot, wall_time, " + ("checkpoint_same" if method == "advance" else "true") + ")"
    new = "self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, " + ("checkpoint_same" if method == "advance" else "true") + ")"
    replace_once(runtime_path, old, new)
for old in [
    "self.commit_candidate(conn, engine, snapshot, wall_time, false)",
]:
    p = Path(runtime_path)
    text = p.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 3:
        raise SystemExit(f"{runtime_path}: expected 3 break commit anchors, found {count}")
    p.write_text(text.replace(old, "self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, false)"), encoding="utf-8")
replace_once(
    runtime_path,
    """        let (closed, opened) = replace_open_focus_session(\n            conn,\n            current.id,\n            current_duration,\n            SessionKind::Work,\n            Some(task_id),\n            wall_time,\n        )?;""",
    """        let checkpoint_json = encoded_checkpoint(&engine, now_ms)?;\n        let (closed, opened) = replace_open_focus_session_with_runtime_checkpoint(\n            conn,\n            current.id,\n            current_duration,\n            SessionKind::Work,\n            Some(task_id),\n            wall_time,\n            &checkpoint_json,\n        )?;""",
)
replace_once(
    runtime_path,
    """    fn commit_candidate(\n        &mut self,\n        conn: &mut Connection,\n        engine: TimerEngine,\n        snapshot: TimerSnapshot,\n        wall_time: &str,\n        checkpoint_same: bool,\n    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {""",
    """    fn commit_candidate(\n        &mut self,\n        conn: &mut Connection,\n        engine: TimerEngine,\n        snapshot: TimerSnapshot,\n        now_ms: u64,\n        wall_time: &str,\n        checkpoint_same: bool,\n    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {""",
)
replace_once(
    runtime_path,
    """            (None, Some(next)) => {\n                let opened = open_binding(conn, &next, wall_time)?;\n                self.binding = Some(SessionBinding::from_record(&opened));\n            }""",
    """            (None, Some(next)) => {\n                let checkpoint_json = encoded_checkpoint(&engine, now_ms)?;\n                let opened = open_binding(conn, &next, wall_time, &checkpoint_json)?;\n                self.binding = Some(SessionBinding::from_record(&opened));\n            }""",
)
replace_once(
    runtime_path,
    """                if checkpoint_same {\n                    let duration = self.open_duration_seconds(&snapshot, current.kind)?;\n                    checkpoint_open_session(conn, current.id, duration, wall_time)?;\n                }""",
    """                if checkpoint_same {\n                    let duration = self.open_duration_seconds(&snapshot, current.kind)?;\n                    let checkpoint_json = encoded_checkpoint(&engine, now_ms)?;\n                    checkpoint_open_session_with_runtime_checkpoint(\n                        conn,\n                        current.id,\n                        duration,\n                        wall_time,\n                        &checkpoint_json,\n                    )?;\n                }""",
)
replace_once(
    runtime_path,
    """                let (_, opened) = replace_open_focus_session(\n                    conn,\n                    current.id,\n                    duration,\n                    next.kind,\n                    next.task_id,\n                    wall_time,\n                )?;""",
    """                let checkpoint_json = encoded_checkpoint(&engine, now_ms)?;\n                let (_, opened) = replace_open_focus_session_with_runtime_checkpoint(\n                    conn,\n                    current.id,\n                    duration,\n                    next.kind,\n                    next.task_id,\n                    wall_time,\n                    &checkpoint_json,\n                )?;""",
)
replace_region(
    runtime_path,
    "fn open_binding(",
    "}",
    """fn encoded_checkpoint(\n    engine: &TimerEngine,\n    now_ms: u64,\n) -> Result<String, TimerRuntimeError> {\n    let checkpoint = engine.recovery_checkpoint(now_ms)?;\n    serde_json::to_string(&checkpoint).map_err(TimerRuntimeError::from)\n}\n\nfn open_binding(\n    conn: &mut Connection,\n    binding: &SessionBinding,\n    wall_time: &str,\n    runtime_checkpoint_json: &str,\n) -> Result<SessionRecord, TimerRuntimeError> {\n    match binding.kind {\n        SessionKind::Work => open_focus_work_session_with_runtime_checkpoint(\n            conn,\n            binding.task_id.ok_or(TimerRuntimeError::BindingMismatch)?,\n            wall_time,\n            runtime_checkpoint_json,\n        )\n        .map_err(TimerRuntimeError::from),\n        SessionKind::Break => open_focus_break_session_with_runtime_checkpoint(\n            conn,\n            binding.task_id,\n            wall_time,\n            runtime_checkpoint_json,\n        )\n        .map_err(TimerRuntimeError::from),\n    }\n}""",
)

Path("src-tauri/tests/timer_runtime_recovery.rs").write_text(
    r'''use narro_lib::domain::ids::{ListId, TaskId};
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::sessions::SessionKind;
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::sessions::{get_open_session, get_session_runtime_checkpoint, sessions_for_task};
use narro_lib::persistence::task_metadata::task_time_taken_seconds;
use narro_lib::persistence::tasks::create_task;
use narro_lib::timer::runtime::TimerRuntime;
use narro_lib::timer::{TimerMode, TimerStateKind};
use rusqlite::Connection;

const T0: &str = "2026-09-04T18:00:00Z";
const T5: &str = "2026-09-04T18:00:05Z";
const T6: &str = "2026-09-04T18:00:06Z";
const RESTART: &str = "2026-09-04T19:00:00Z";
const AFTER_RESTART: &str = "2026-09-04T19:00:02Z";

fn fixture() -> (Connection, TaskId) {
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
            title: "Recoverable".into(),
            manual_lane: PlanningLane::Today,
            est_seconds: Some(1_800),
        },
        T0,
    )
    .expect("create task");
    (conn, task.id)
}

#[test]
fn running_restart_recovers_last_durable_work_paused_with_same_session() {
    let (mut conn, task_id) = fixture();
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
        .unwrap();
    runtime.pause(&mut conn, 5_000, T5).unwrap();
    runtime.resume(&mut conn, 6_000, T6).unwrap();
    let before_crash = get_open_session(&conn).unwrap().unwrap();
    assert_eq!(before_crash.duration_seconds, 5);
    assert!(get_session_runtime_checkpoint(&conn, before_crash.id)
        .unwrap()
        .is_some());

    runtime.advance(&mut conn, 9_000, "2026-09-04T18:00:09Z").unwrap();
    drop(runtime);

    let (mut recovered, snapshot) = TimerRuntime::recover_after_restart(&mut conn, 500_000, RESTART)
        .unwrap()
        .expect("recover open runtime");
    assert_eq!(snapshot.timer.state, TimerStateKind::Paused);
    assert_eq!(snapshot.timer.work_elapsed_ms, 5_000);
    assert_eq!(snapshot.open_session_id, Some(before_crash.id));
    assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 5);

    recovered.resume(&mut conn, 500_000, RESTART).unwrap();
    let finished = recovered
        .finish_task(&mut conn, 502_000, AFTER_RESTART)
        .unwrap();
    assert_eq!(finished.timer.work_elapsed_ms, 7_000);
    assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 7);
}

#[test]
fn time_up_checkpoint_recovers_as_time_up_without_counting_downtime() {
    let (mut conn, task_id) = fixture();
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(
            &mut conn,
            task_id,
            TimerMode::EstCountdown { est_ms: 10_000 },
            0,
            T0,
        )
        .unwrap();
    let time_up = runtime
        .advance(&mut conn, 12_000, "2026-09-04T18:00:12Z")
        .unwrap();
    assert_eq!(time_up.timer.state, TimerStateKind::TimeUp);
    drop(runtime);

    let (recovered, snapshot) = TimerRuntime::recover_after_restart(&mut conn, 900_000, RESTART)
        .unwrap()
        .expect("recover time-up runtime");
    assert_eq!(snapshot.timer.state, TimerStateKind::TimeUp);
    assert_eq!(snapshot.timer.work_elapsed_ms, 10_000);
    assert_eq!(snapshot.timer.countdown_remaining_ms, Some(0));
    assert_eq!(recovered.snapshot(1_000_000).unwrap().timer.work_elapsed_ms, 10_000);
}

#[test]
fn break_restart_closes_break_row_and_returns_to_paused_work() {
    let (mut conn, task_id) = fixture();
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
        .unwrap();
    runtime
        .start_manual_break(&mut conn, 30_000, 5_000, T5)
        .unwrap();
    let break_row = get_open_session(&conn).unwrap().unwrap();
    assert_eq!(break_row.kind, SessionKind::Break);
    drop(runtime);

    let (_recovered, snapshot) = TimerRuntime::recover_after_restart(&mut conn, 500_000, RESTART)
        .unwrap()
        .expect("recover interrupted break");
    assert_eq!(snapshot.timer.state, TimerStateKind::Paused);
    assert_eq!(snapshot.timer.work_elapsed_ms, 5_000);
    let open = get_open_session(&conn).unwrap().unwrap();
    assert_eq!(open.kind, SessionKind::Work);
    assert_ne!(open.id, break_row.id);

    let sessions = sessions_for_task(&conn, task_id).unwrap();
    assert_eq!(sessions.len(), 3);
    assert_eq!(sessions[0].kind, SessionKind::Work);
    assert_eq!(sessions[0].duration_seconds, 5);
    assert_eq!(sessions[1].kind, SessionKind::Break);
    assert_eq!(sessions[1].duration_seconds, 0);
    assert_eq!(sessions[2].kind, SessionKind::Work);
    assert!(sessions[2].is_open());
}

#[test]
fn pomodoro_break_restart_preserves_completed_work_and_resets_next_interval() {
    let (mut conn, task_id) = fixture();
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(
            &mut conn,
            task_id,
            TimerMode::Pomodoro {
                work_ms: 2_000,
                break_ms: 10_000,
            },
            0,
            T0,
        )
        .unwrap();
    let on_break = runtime
        .advance(&mut conn, 2_500, "2026-09-04T18:00:02.500Z")
        .unwrap();
    assert_eq!(on_break.timer.state, TimerStateKind::Break);
    drop(runtime);

    let (_recovered, snapshot) = TimerRuntime::recover_after_restart(&mut conn, 500_000, RESTART)
        .unwrap()
        .expect("recover Pomodoro break");
    assert_eq!(snapshot.timer.state, TimerStateKind::Paused);
    assert_eq!(snapshot.timer.work_elapsed_ms, 2_000);
    assert_eq!(snapshot.timer.countdown_remaining_ms, Some(2_000));
    assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 2);
}

#[test]
fn open_session_without_checkpoint_is_rejected_explicitly() {
    let (mut conn, task_id) = fixture();
    narro_lib::persistence::sessions::open_focus_work_session(&mut conn, task_id, T0)
        .expect("create legacy open focus row");
    let error = TimerRuntime::recover_after_restart(&mut conn, 500_000, RESTART)
        .expect_err("missing durable checkpoint must be explicit");
    assert!(matches!(
        error,
        narro_lib::timer::runtime::TimerRuntimeError::MissingRuntimeCheckpoint(_)
    ));
}
''',
    encoding="utf-8",
)

print("M3 runtime recovery patch applied")
