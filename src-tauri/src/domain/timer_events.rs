use super::ids::{SessionId, TaskId};
use crate::timer::runtime::TimerRuntimeSnapshot;
use crate::timer::TimerStateKind;
use serde::{Deserialize, Serialize};

pub const TIMER_SESSION_EVENT_NAME: &str = "timer-session-changed";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimerSessionPayload {
    pub revision: u64,
    pub runtime: TimerRuntimeSnapshot,
    pub awaiting_resume: bool,
    pub change: Option<TimerSessionChange>,
}

impl TimerSessionPayload {
    pub fn snapshot(revision: u64, runtime: TimerRuntimeSnapshot) -> Self {
        Self {
            revision,
            runtime,
            awaiting_resume: false,
            change: None,
        }
    }

    pub fn changed(
        revision: u64,
        runtime: TimerRuntimeSnapshot,
        change: TimerSessionChange,
    ) -> Self {
        Self {
            revision,
            runtime,
            awaiting_resume: false,
            change: Some(change),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum TimerSessionChange {
    Started {
        task_id: TaskId,
        session_id: SessionId,
    },
    Paused,
    Resumed,
    Extended,
    ManualBreakStarted {
        closed_work_session_id: SessionId,
        break_session_id: SessionId,
    },
    BreakFinished {
        closed_break_session_id: SessionId,
        work_session_id: SessionId,
    },
    BreakSkipped {
        closed_break_session_id: SessionId,
        work_session_id: SessionId,
    },
    TaskCompleted {
        task_id: TaskId,
        closed_session_id: SessionId,
    },
    TaskSkipped {
        task_id: TaskId,
        closed_session_id: SessionId,
    },
    TaskSwitched {
        previous_task_id: TaskId,
        current_task_id: TaskId,
        previous_session_id: SessionId,
        current_session_id: SessionId,
    },
    TimeTakenRebased {
        task_id: TaskId,
        total_seconds: u64,
    },
    AutomaticBoundary {
        previous_state: TimerStateKind,
        current_state: TimerStateKind,
        closed_session_id: Option<SessionId>,
        opened_session_id: Option<SessionId>,
    },
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::timer::{TimerMode, TimerSnapshot};
    use uuid::Uuid;

    fn task_id() -> TaskId {
        TaskId::from_uuid(Uuid::parse_str("10000000-0000-0000-0000-000000000001").unwrap())
    }

    fn session_id() -> SessionId {
        SessionId::from_uuid(Uuid::parse_str("20000000-0000-0000-0000-000000000002").unwrap())
    }

    fn runtime() -> TimerRuntimeSnapshot {
        TimerRuntimeSnapshot {
            timer: TimerSnapshot {
                state: TimerStateKind::Paused,
                task_id: Some(task_id()),
                mode: Some(TimerMode::CountUp),
                work_elapsed_ms: 90_000,
                total_break_ms: 0,
                countdown_remaining_ms: None,
                overtime_ms: 0,
                break_kind: None,
                break_remaining_ms: None,
            },
            open_session_id: Some(session_id()),
        }
    }

    #[test]
    fn snapshot_payload_has_no_fake_transition() {
        let payload = TimerSessionPayload::snapshot(7, runtime());
        assert_eq!(payload.revision, 7);
        assert!(!payload.awaiting_resume);
        assert!(payload.change.is_none());
        assert_eq!(payload.runtime.timer.state, TimerStateKind::Paused);
    }

    #[test]
    fn event_contract_serializes_with_stable_camel_case_envelope_and_tagged_change() {
        let payload = TimerSessionPayload::changed(
            8,
            runtime(),
            TimerSessionChange::TimeTakenRebased {
                task_id: task_id(),
                total_seconds: 60,
            },
        );
        let value = serde_json::to_value(payload).unwrap();

        assert_eq!(value["revision"], 8);
        assert_eq!(value["awaitingResume"], false);
        assert_eq!(
            value["runtime"]["open_session_id"],
            session_id().to_string()
        );
        assert_eq!(value["change"]["type"], "time_taken_rebased");
        assert_eq!(value["change"]["task_id"], task_id().to_string());
        assert_eq!(value["change"]["total_seconds"], 60);
    }
}
