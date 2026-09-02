use serde::Serialize;
use std::fmt::{Display, Formatter};

use crate::domain::StateError;

pub type CommandResult<T> = Result<T, CommandError>;

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CommandError {
    pub code: &'static str,
    pub message: String,
}

impl CommandError {
    pub fn new(code: &'static str, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
        }
    }

    pub fn window_not_found(label: &str) -> Self {
        Self::new(
            "WINDOW_NOT_FOUND",
            format!("window '{label}' does not exist"),
        )
    }

    pub fn window_already_exists(label: &str) -> Self {
        Self::new(
            "WINDOW_ALREADY_EXISTS",
            format!("window '{label}' already exists"),
        )
    }

    pub fn window_operation(label: &str, operation: &str, source: impl Display) -> Self {
        Self::new(
            "WINDOW_OPERATION_FAILED",
            format!("failed to {operation} window '{label}': {source}"),
        )
    }
}

impl Display for CommandError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        write!(formatter, "[{}] {}", self.code, self.message)
    }
}

impl std::error::Error for CommandError {}

impl From<StateError> for CommandError {
    fn from(error: StateError) -> Self {
        match error {
            StateError::LockPoisoned => Self::new(
                "STATE_LOCK_POISONED",
                "authoritative application state lock is poisoned",
            ),
            StateError::CounterOverflow => Self::new(
                "STATE_COUNTER_OVERFLOW",
                "diagnostic state counter reached its maximum value",
            ),
            StateError::RevisionOverflow => Self::new(
                "STATE_REVISION_OVERFLOW",
                "application state revision reached its maximum value",
            ),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn command_error_serializes_with_stable_shape() {
        let error = CommandError::window_not_found("main");
        let value = serde_json::to_value(error).expect("serialize command error");

        assert_eq!(value["code"], "WINDOW_NOT_FOUND");
        assert_eq!(value["message"], "window 'main' does not exist");
    }
}
