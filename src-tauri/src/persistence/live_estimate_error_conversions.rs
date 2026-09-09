use crate::persistence::sessions::SessionStoreError;
use crate::persistence::timer_runtime::TimerRuntimeStoreError;
use crate::timer::runtime::{LiveEstimateEditError, TimerRuntimeError};
use crate::timer::TimerError;

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
