use super::ids::{ReminderId, TaskId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReminderRecord {
    pub id: ReminderId,
    pub task_id: TaskId,
    pub remind_local_date: String,
    pub remind_local_time: String,
    pub timezone: String,
    pub fired_at: Option<String>,
    pub dismissed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NewReminderInput {
    pub task_id: TaskId,
    pub remind_local_date: String,
    pub remind_local_time: String,
    pub timezone: String,
}
