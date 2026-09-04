use super::ids::{SessionId, TaskId};
use super::model::{SessionKind, SessionSource};
use serde::{Deserialize, Serialize};

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
