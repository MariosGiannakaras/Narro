use super::ids::{SessionId, TaskId};
use serde::{Deserialize, Serialize};

pub const TIMED_ALERT_EFFECT_EVENT_NAME: &str = "timed-alert-effect";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimedAlertEffectPayload {
    pub run_id: SessionId,
    pub task_id: TaskId,
    pub boundary_seconds: u64,
    pub decided_at: String,
}
