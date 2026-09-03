use super::ids::{ListId, RecurrenceRuleId, TaskId};
use super::model::{PlanningLane, ScheduleKind};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskRecord {
    pub id: TaskId,
    pub list_id: ListId,
    pub title: String,
    pub manual_lane: PlanningLane,
    pub sort_rank: u32,
    pub est_seconds: Option<u32>,
    pub manual_time_adjustment_seconds: i64,
    pub schedule_kind: ScheduleKind,
    pub scheduled_local_date: Option<String>,
    pub scheduled_local_time: Option<String>,
    pub schedule_timezone: Option<String>,
    pub recurrence_rule_id: Option<RecurrenceRuleId>,
    pub recurrence_parent_task_id: Option<TaskId>,
    pub completed_at: Option<String>,
    pub archived_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NewTaskInput {
    pub list_id: ListId,
    pub title: String,
    pub manual_lane: PlanningLane,
    pub est_seconds: Option<u32>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UpdateTaskInput {
    pub title: String,
    pub est_seconds: Option<u32>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskDestination {
    pub list_id: ListId,
    pub manual_lane: PlanningLane,
}
