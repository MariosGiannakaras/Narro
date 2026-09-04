use super::ids::{SessionId, TaskId};
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SessionKind {
    Work,
    Break,
}

impl SessionKind {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Work => "work",
            Self::Break => "break",
        }
    }
}

impl TryFrom<&str> for SessionKind {
    type Error = SessionDecodeError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "work" => Ok(Self::Work),
            "break" => Ok(Self::Break),
            _ => Err(SessionDecodeError::UnknownKind(value.to_owned())),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SessionSource {
    Focus,
    Manual,
    Edit,
}

impl SessionSource {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Focus => "focus",
            Self::Manual => "manual",
            Self::Edit => "edit",
        }
    }
}

impl TryFrom<&str> for SessionSource {
    type Error = SessionDecodeError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "focus" => Ok(Self::Focus),
            "manual" => Ok(Self::Manual),
            "edit" => Ok(Self::Edit),
            _ => Err(SessionDecodeError::UnknownSource(value.to_owned())),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionRecord {
    pub id: SessionId,
    pub task_id: Option<TaskId>,
    pub kind: SessionKind,
    pub started_at: String,
    pub ended_at: Option<String>,
    pub duration_seconds: u64,
    pub source: SessionSource,
    pub created_at: String,
    pub updated_at: String,
}

impl SessionRecord {
    pub const fn is_open(&self) -> bool {
        self.ended_at.is_none()
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SessionDecodeError {
    UnknownKind(String),
    UnknownSource(String),
}

impl Display for SessionDecodeError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::UnknownKind(value) => write!(formatter, "unknown session kind: {value}"),
            Self::UnknownSource(value) => write!(formatter, "unknown session source: {value}"),
        }
    }
}

impl std::error::Error for SessionDecodeError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn storage_tokens_round_trip() {
        for kind in [SessionKind::Work, SessionKind::Break] {
            assert_eq!(SessionKind::try_from(kind.as_str()).unwrap(), kind);
        }
        for source in [
            SessionSource::Focus,
            SessionSource::Manual,
            SessionSource::Edit,
        ] {
            assert_eq!(SessionSource::try_from(source.as_str()).unwrap(), source);
        }
    }
}
