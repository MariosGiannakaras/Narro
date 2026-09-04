use super::ids::{SessionId, TaskId};
use serde::{Deserialize, Serialize};

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

    pub const fn parse(value: &str) -> Option<Self> {
        match value {
            "work" => Some(Self::Work),
            "break" => Some(Self::Break),
            _ => None,
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

    pub const fn parse(value: &str) -> Option<Self> {
        match value {
            "focus" => Some(Self::Focus),
            "manual" => Some(Self::Manual),
            "edit" => Some(Self::Edit),
            _ => None,
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct NewSessionInput {
    pub task_id: Option<TaskId>,
    pub kind: SessionKind,
    pub source: SessionSource,
}

impl NewSessionInput {
    pub const fn focus_work(task_id: TaskId) -> Self {
        Self {
            task_id: Some(task_id),
            kind: SessionKind::Work,
            source: SessionSource::Focus,
        }
    }

    pub const fn focus_break(task_id: Option<TaskId>) -> Self {
        Self {
            task_id,
            kind: SessionKind::Break,
            source: SessionSource::Focus,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn storage_tokens_are_stable() {
        assert_eq!(SessionKind::Work.as_str(), "work");
        assert_eq!(SessionKind::Break.as_str(), "break");
        assert_eq!(SessionKind::parse("work"), Some(SessionKind::Work));
        assert_eq!(SessionKind::parse("unknown"), None);

        assert_eq!(SessionSource::Focus.as_str(), "focus");
        assert_eq!(SessionSource::Manual.as_str(), "manual");
        assert_eq!(SessionSource::Edit.as_str(), "edit");
        assert_eq!(SessionSource::parse("edit"), Some(SessionSource::Edit));
        assert_eq!(SessionSource::parse("unknown"), None);
    }

    #[test]
    fn focus_work_requires_an_explicit_task_identity_by_construction() {
        let task_id = TaskId::from_uuid(Uuid::from_u128(7));
        let input = NewSessionInput::focus_work(task_id);
        assert_eq!(input.task_id, Some(task_id));
        assert_eq!(input.kind, SessionKind::Work);
        assert_eq!(input.source, SessionSource::Focus);
    }
}
