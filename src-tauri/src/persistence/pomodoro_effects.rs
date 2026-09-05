use crate::domain::ids::SessionId;
use crate::persistence::sessions::{get_open_session, get_session, SessionStoreError};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PomodoroBoundaryEffectKind {
    BreakStarted,
    BreakFinished,
}

impl PomodoroBoundaryEffectKind {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::BreakStarted => "break_started",
            Self::BreakFinished => "break_finished",
        }
    }

    fn parse(value: &str) -> Option<Self> {
        match value {
            "break_started" => Some(Self::BreakStarted),
            "break_finished" => Some(Self::BreakFinished),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PomodoroBoundaryEffect {
    pub session_id: SessionId,
    pub kind: PomodoroBoundaryEffectKind,
    pub decided_at: String,
}

#[derive(Debug)]
pub enum PomodoroBoundaryEffectError {
    Sqlite(rusqlite::Error),
    Session(SessionStoreError),
    InvalidTimestamp,
    CorruptSessionId(String),
    CorruptKind(String),
    ConflictingDecision {
        session_id: SessionId,
        existing: PomodoroBoundaryEffectKind,
        attempted: PomodoroBoundaryEffectKind,
    },
    ClaimRace(SessionId),
}

impl Display for PomodoroBoundaryEffectError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "Pomodoro effect persistence failed: {error}"),
            Self::Session(error) => Display::fmt(error, formatter),
            Self::InvalidTimestamp => {
                formatter.write_str("Pomodoro effect timestamp must be RFC 3339")
            }
            Self::CorruptSessionId(value) => {
                write!(formatter, "stored Pomodoro effect session id is invalid: {value}")
            }
            Self::CorruptKind(value) => {
                write!(formatter, "stored Pomodoro effect kind is invalid: {value}")
            }
            Self::ConflictingDecision {
                session_id,
                existing,
                attempted,
            } => write!(
                formatter,
                "Pomodoro session {session_id} already has {existing:?}, cannot record {attempted:?}"
            ),
            Self::ClaimRace(session_id) => write!(
                formatter,
                "Pomodoro notification claim changed unexpectedly for session {session_id}"
            ),
        }
    }
}

impl std::error::Error for PomodoroBoundaryEffectError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Session(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for PomodoroBoundaryEffectError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<SessionStoreError> for PomodoroBoundaryEffectError {
    fn from(value: SessionStoreError) -> Self {
        Self::Session(value)
    }
}

fn validate_timestamp(value: &str) -> Result<(), PomodoroBoundaryEffectError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| PomodoroBoundaryEffectError::InvalidTimestamp)
}

pub fn ensure_boundary_decision(
    conn: &mut Connection,
    session_id: SessionId,
    kind: PomodoroBoundaryEffectKind,
    decided_at: &str,
) -> Result<bool, PomodoroBoundaryEffectError> {
    validate_timestamp(decided_at)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    get_session(&tx, session_id)?;

    let existing: Option<String> = tx
        .query_row(
            "SELECT effect_kind FROM pomodoro_boundary_effects WHERE session_id = ?1",
            [session_id.to_string()],
            |row| row.get(0),
        )
        .optional()?;

    if let Some(existing) = existing {
        let existing_kind = PomodoroBoundaryEffectKind::parse(&existing)
            .ok_or_else(|| PomodoroBoundaryEffectError::CorruptKind(existing.clone()))?;
        if existing_kind != kind {
            return Err(PomodoroBoundaryEffectError::ConflictingDecision {
                session_id,
                existing: existing_kind,
                attempted: kind,
            });
        }
        tx.commit()?;
        return Ok(false);
    }

    tx.execute(
        "INSERT INTO pomodoro_boundary_effects (
            session_id, effect_kind, decided_at, notification_claimed_at
         ) VALUES (?1, ?2, ?3, NULL)",
        params![session_id.to_string(), kind.as_str(), decided_at],
    )?;
    tx.commit()?;
    Ok(true)
}

pub fn awaiting_resume_for_open_work_session(
    conn: &Connection,
    session_id: SessionId,
) -> Result<bool, PomodoroBoundaryEffectError> {
    let awaiting: i64 = conn.query_row(
        "SELECT EXISTS(
            SELECT 1
            FROM sessions current
            JOIN sessions previous
              ON previous.ended_at = current.started_at
             AND previous.kind = 'break'
            JOIN pomodoro_boundary_effects effect
              ON effect.session_id = previous.id
             AND effect.effect_kind = 'break_finished'
            WHERE current.id = ?1
              AND current.kind = 'work'
              AND current.ended_at IS NULL
              AND current.updated_at = current.started_at
        )",
        [session_id.to_string()],
        |row| row.get(0),
    )?;
    Ok(awaiting == 1)
}

pub fn awaiting_resume_for_current_open_work_session(
    conn: &Connection,
) -> Result<bool, PomodoroBoundaryEffectError> {
    let Some(session) = get_open_session(conn)? else {
        return Ok(false);
    };
    awaiting_resume_for_open_work_session(conn, session.id)
}

pub fn claim_pending_notifications(
    conn: &mut Connection,
    claimed_at: &str,
) -> Result<Vec<PomodoroBoundaryEffect>, PomodoroBoundaryEffectError> {
    validate_timestamp(claimed_at)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let pending = {
        let mut statement = tx.prepare(
            "SELECT effect.session_id, effect.effect_kind, effect.decided_at
             FROM pomodoro_boundary_effects effect
             JOIN sessions source ON source.id = effect.session_id
             WHERE effect.notification_claimed_at IS NULL
               AND source.ended_at IS NOT NULL
               AND (
                 (effect.effect_kind = 'break_started' AND EXISTS(
                    SELECT 1 FROM sessions next
                    WHERE next.kind = 'break' AND next.started_at = source.ended_at
                 ))
                 OR
                 (effect.effect_kind = 'break_finished' AND EXISTS(
                    SELECT 1 FROM sessions next
                    WHERE next.kind = 'work' AND next.started_at = source.ended_at
                 ))
               )
             ORDER BY effect.decided_at, effect.session_id",
        )?;
        let rows = statement.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        })?;

        let mut pending = Vec::new();
        for row in rows {
            let (session_id, kind, decided_at) = row?;
            let session_id = SessionId::parse_str(&session_id)
                .map_err(|_| PomodoroBoundaryEffectError::CorruptSessionId(session_id))?;
            let kind = PomodoroBoundaryEffectKind::parse(&kind)
                .ok_or(PomodoroBoundaryEffectError::CorruptKind(kind))?;
            pending.push(PomodoroBoundaryEffect {
                session_id,
                kind,
                decided_at,
            });
        }
        pending
    };

    for effect in &pending {
        let changed = tx.execute(
            "UPDATE pomodoro_boundary_effects
             SET notification_claimed_at = ?1
             WHERE session_id = ?2 AND notification_claimed_at IS NULL",
            params![claimed_at, effect.session_id.to_string()],
        )?;
        if changed != 1 {
            return Err(PomodoroBoundaryEffectError::ClaimRace(effect.session_id));
        }
    }

    tx.commit()?;
    Ok(pending)
}
