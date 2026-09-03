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

    pub fn invalid_argument(argument: &str, reason: impl Display) -> Self {
        Self::new(
            "INVALID_ARGUMENT",
            format!("invalid command argument '{argument}': {reason}"),
        )
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

    pub fn monitor_enumeration(source: impl Display) -> Self {
        Self::new(
            "MONITOR_ENUMERATION_FAILED",
            format!("failed to enumerate Windows monitors: {source}"),
        )
    }

    pub fn no_monitors_available() -> Self {
        Self::new(
            "NO_MONITORS_AVAILABLE",
            "Windows reported no available monitors",
        )
    }

    pub fn invalid_monitor_descriptor(index: usize, reason: impl Display) -> Self {
        Self::new(
            "MONITOR_DESCRIPTOR_INVALID",
            format!("monitor {index} reported invalid geometry or scale data: {reason}"),
        )
    }

    pub fn stale_monitor_selection() -> Self {
        Self::new(
            "MONITOR_SELECTION_STALE",
            "the selected monitor is no longer present in the current display topology; refresh monitors and retry",
        )
    }

    pub fn window_geometry(source: impl Display) -> Self {
        Self::new(
            "WINDOW_GEOMETRY_INVALID",
            format!("cannot compute a safe focus-surface position: {source}"),
        )
    }

    pub fn shortcut_state_poisoned() -> Self {
        Self::new(
            "SHORTCUT_STATE_LOCK_POISONED",
            "global shortcut diagnostic state lock is poisoned",
        )
    }

    pub fn shortcut_revision_overflow() -> Self {
        Self::new(
            "SHORTCUT_REVISION_OVERFLOW",
            "global shortcut diagnostic revision reached its maximum value",
        )
    }

    pub fn shortcut_trigger_overflow() -> Self {
        Self::new(
            "SHORTCUT_TRIGGER_OVERFLOW",
            "global shortcut trigger counter reached its maximum value",
        )
    }

    pub fn shortcut_observer_unavailable() -> Self {
        Self::new(
            "SHORTCUT_OBSERVER_UNAVAILABLE",
            "global shortcut message observer is unavailable; registration cannot be enabled safely",
        )
    }

    pub fn shortcut_not_registered() -> Self {
        Self::new(
            "SHORTCUT_NOT_REGISTERED",
            "the default global shortcut must be registered before running the deterministic conflict probe",
        )
    }

    pub fn shortcut_conflict(chord: &str) -> Self {
        Self::new(
            "SHORTCUT_CONFLICT",
            format!(
                "global shortcut '{chord}' is already registered and cannot be claimed by Narro"
            ),
        )
    }

    pub fn shortcut_operation(operation: &str, source: impl Display) -> Self {
        Self::new(
            "SHORTCUT_OPERATION_FAILED",
            format!("global shortcut {operation} failed: {source}"),
        )
    }

    pub fn shortcut_conflict_probe_unexpected_success() -> Self {
        Self::new(
            "SHORTCUT_CONFLICT_PROBE_UNEXPECTED_SUCCESS",
            "the deterministic duplicate-shortcut conflict probe unexpectedly registered a second identical hotkey",
        )
    }

    pub fn shortcut_unsupported_platform() -> Self {
        Self::new(
            "SHORTCUT_UNSUPPORTED_PLATFORM",
            "the current global shortcut capability is implemented only for Windows",
        )
    }

    pub fn notification_delivery(source: impl Display) -> Self {
        Self::new(
            "NOTIFICATION_DELIVERY_FAILED",
            format!("failed to submit the local Windows notification: {source}"),
        )
    }

    pub fn notification_unsupported_platform() -> Self {
        Self::new(
            "NOTIFICATION_UNSUPPORTED_PLATFORM",
            "the current local notification capability is implemented only for Windows",
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

    #[test]
    fn invalid_argument_error_does_not_echo_unbounded_input_value() {
        let error = CommandError::invalid_argument("monitorKey", "must be non-empty");
        assert_eq!(error.code, "INVALID_ARGUMENT");
        assert_eq!(
            error.message,
            "invalid command argument 'monitorKey': must be non-empty"
        );
    }

    #[test]
    fn stale_monitor_selection_has_actionable_stable_code() {
        let error = CommandError::stale_monitor_selection();
        assert_eq!(error.code, "MONITOR_SELECTION_STALE");
        assert!(error.message.contains("refresh monitors"));
    }

    #[test]
    fn shortcut_conflict_has_stable_machine_code() {
        let error = CommandError::shortcut_conflict("Ctrl+Shift+B");
        assert_eq!(error.code, "SHORTCUT_CONFLICT");
        assert!(error.message.contains("Ctrl+Shift+B"));
    }

    #[test]
    fn notification_delivery_has_stable_machine_code() {
        let error = CommandError::notification_delivery("backend unavailable");
        assert_eq!(error.code, "NOTIFICATION_DELIVERY_FAILED");
        assert!(error.message.contains("backend unavailable"));
    }
}
