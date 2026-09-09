use crate::persistence::sessions::SessionStoreError;
use crate::persistence::task_estimate_edit::TaskEstimateEditError;
use crate::persistence::task_time_taken_edit::TaskTimeTakenEditError;
use crate::persistence::tasks::TaskStoreError;
use crate::persistence::timer_runtime::TimerRuntimeStoreError;
use crate::timer::runtime::{LiveEstimateEditError, TimerRuntimeError};
use crate::timer::TimerError;

impl From<rusqlite::Error> for TaskEstimateEditError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Task(TaskStoreError::from(value))
    }
}

impl From<rusqlite::Error> for TaskTimeTakenEditError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Task(TaskStoreError::from(value))
    }
}

impl From<TimerError> for LiveEstimateEditError {
    fn from(value: TimerError) -> Self {
        Self::Runtime(TimerRuntimeError::from(value))
    }
}

impl From<SessionStoreError> for LiveEstimateEditError {
    fn from(value: SessionStoreError) -> Self {
        Self::Runtime(TimerRuntimeError::from(value))
    }
}

impl From<TimerRuntimeStoreError> for LiveEstimateEditError {
    fn from(value: TimerRuntimeStoreError) -> Self {
        Self::Runtime(TimerRuntimeError::from(value))
    }
}
