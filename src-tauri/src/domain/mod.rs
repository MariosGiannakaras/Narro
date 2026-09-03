pub mod ids;
pub mod lists;
pub mod model;
pub mod notes;
pub mod preferences;
pub mod recurrence;
pub mod subtasks;
pub mod tasks;

use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};
use std::sync::{Mutex, MutexGuard};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Default)]
pub struct AppStatePayload {
    pub active_task: Option<String>,
    pub is_running: bool,
    pub counter: u32,
    pub revision: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StateError {
    LockPoisoned,
    CounterOverflow,
    RevisionOverflow,
}

impl Display for StateError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        let message = match self {
            Self::LockPoisoned => "authoritative application state lock is poisoned",
            Self::CounterOverflow => "diagnostic state counter overflow",
            Self::RevisionOverflow => "application state revision overflow",
        };
        formatter.write_str(message)
    }
}

impl std::error::Error for StateError {}

#[derive(Default)]
pub struct AppState {
    data: Mutex<AppStatePayload>,
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }

    fn lock(&self) -> Result<MutexGuard<'_, AppStatePayload>, StateError> {
        self.data.lock().map_err(|_| StateError::LockPoisoned)
    }

    pub fn snapshot(&self) -> Result<AppStatePayload, StateError> {
        Ok(self.lock()?.clone())
    }

    pub fn toggle_timer(&self) -> Result<AppStatePayload, StateError> {
        let mut data = self.lock()?;
        let revision = data
            .revision
            .checked_add(1)
            .ok_or(StateError::RevisionOverflow)?;

        data.is_running = !data.is_running;
        if data.is_running && data.active_task.is_none() {
            data.active_task = Some("Implement Milestone 1".into());
        } else if !data.is_running {
            data.active_task = None;
        }
        data.revision = revision;
        Ok(data.clone())
    }

    pub fn increment_counter(&self) -> Result<AppStatePayload, StateError> {
        let mut data = self.lock()?;
        let counter = data
            .counter
            .checked_add(1)
            .ok_or(StateError::CounterOverflow)?;
        let revision = data
            .revision
            .checked_add(1)
            .ok_or(StateError::RevisionOverflow)?;

        data.counter = counter;
        data.active_task = Some(format!("Task mutation {counter}"));
        data.revision = revision;
        Ok(data.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    #[test]
    fn state_mutations_are_versioned() {
        let state = AppState::new();

        let running = state.toggle_timer().expect("toggle timer");
        assert!(running.is_running);
        assert_eq!(running.revision, 1);

        let mutated = state.increment_counter().expect("increment counter");
        assert_eq!(mutated.counter, 1);
        assert_eq!(mutated.revision, 2);
        assert_eq!(mutated.active_task.as_deref(), Some("Task mutation 1"));
    }

    #[test]
    fn counter_overflow_does_not_partially_mutate_state() {
        let state = AppState::new();
        {
            let mut data = state.data.lock().expect("state lock");
            data.counter = u32::MAX;
            data.revision = 7;
            data.active_task = Some("before".into());
        }

        assert_eq!(state.increment_counter(), Err(StateError::CounterOverflow));
        let snapshot = state.snapshot().expect("snapshot after overflow");
        assert_eq!(snapshot.counter, u32::MAX);
        assert_eq!(snapshot.revision, 7);
        assert_eq!(snapshot.active_task.as_deref(), Some("before"));
    }

    #[test]
    fn revision_overflow_does_not_partially_mutate_state() {
        let state = Arc::new(AppState::new());
        {
            let mut data = state.data.lock().expect("state lock");
            data.counter = 41;
            data.revision = u32::MAX;
            data.active_task = Some("before".into());
        }

        assert_eq!(state.increment_counter(), Err(StateError::RevisionOverflow));
        let snapshot = state.snapshot().expect("snapshot after overflow");
        assert_eq!(snapshot.counter, 41);
        assert_eq!(snapshot.revision, u32::MAX);
        assert_eq!(snapshot.active_task.as_deref(), Some("before"));
    }

    #[test]
    fn poisoned_lock_returns_explicit_state_error() {
        let state = Arc::new(AppState::new());
        let poisoned = Arc::clone(&state);
        let join = std::thread::spawn(move || {
            let _guard = poisoned.data.lock().expect("state lock before poison");
            panic!("intentional poison for test");
        })
        .join();

        assert!(join.is_err());
        assert_eq!(state.snapshot(), Err(StateError::LockPoisoned));
    }
}
