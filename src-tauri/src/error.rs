use serde::Serialize;
use std::fmt::{Display, Formatter};

use crate::domain::StateError;
use crate::shortcuts::{ShortcutError, ShortcutStateError};

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

impl From<ShortcutError> for CommandError {
    fn from(error: ShortcutError) -> Self {
        match error {
            ShortcutError::State(state_error) => match state_error {
                ShortcutStateError::LockPoisoned => Self::new(
                    "SHORTCUT_STATE_LOCK_POISONED",
                    "global shortcut state lock is poisoned",
                ),
                ShortcutStateError::TriggerCountOverflow => Self::new(
                    "SHORTCUT_TRIGGER_COUNT_OVERFLOW",
                    "global shortcut trigger count reached its maximum value",
                ),
                ShortcutStateError::RevisionOverflow => Self::new(
                    "SHORTCUT_STATE_REVISION_OVERFLOW",
                    "global shortcut state revision reached its maximum value",
                ),
            },
            ShortcutError::FocusSurfaceMissing => Self::new(
                "SHORTCUT_HOST_WINDOW_MISSING",
                "focusSurface does not exist, so the Windows global shortcut cannot be managed",
            ),
            ShortcutError::Hwnd(source) => Self::new(
                "SHORTCUT_HOST_WINDOW_FAILED",
                format!("failed to access the focusSurface native window: {source}"),
            ),
            ShortcutError::RegistrationConflict => Self::new(
                "SHORTCUT_REGISTRATION_CONFLICT",
                "Windows reports the diagnostic global shortcut is already registered by another owner",
            ),
            ShortcutError::RegistrationFailed(source) => Self::new(
                "SHORTCUT_REGISTRATION_FAILED",
                format!("Windows failed to register the diagnostic global shortcut: {source}"),
            ),
            ShortcutError::UnregistrationFailed(source) => Self::new(
                "SHORTCUT_UNREGISTRATION_FAILED",
                format!("Windows failed to unregister the diagnostic global shortcut: {source}"),
            ),
            ShortcutError::ConflictProbeRequiresRegistration => Self::new(
                "SHORTCUT_NOT_REGISTERED",
                "register the diagnostic global shortcut before probing duplicate-registration conflict handling",
            ),
            ShortcutError::ConflictProbeUnexpectedSuccess => Self::new(
                "SHORTCUT_CONFLICT_PROBE_INVALID",
                "Windows unexpectedly allowed the same global shortcut accelerator to be registered twice",
            ),
            ShortcutError::ConflictProbeUnexpectedFailure(source) => Self::new(
                "SHORTCUT_CONFLICT_PROBE_FAILED",
                format!("duplicate global shortcut registration failed with an unexpected Windows error: {source}"),
            ),
            ShortcutError::ObserverAlreadyInitialized => Self::new(
                "SHORTCUT_OBSERVER_ALREADY_INITIALIZED",
                "global shortcut observer was initialized more than once",
            ),
            ShortcutError::ObserverInstallFailed => Self::new(
                "SHORTCUT_OBSERVER_INSTALL_FAILED",
                "Windows rejected installation of the global shortcut message observer",
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
    fn shortcut_conflict_maps_to_stable_actionable_code() {
        let error = CommandError::from(ShortcutError::RegistrationConflict);
        assert_eq!(error.code, "SHORTCUT_REGISTRATION_CONFLICT");
        assert!(error.message.contains("already registered"));
    }

    #[test]
    fn shortcut_state_error_maps_without_losing_failure_class() {
        let error = CommandError::from(ShortcutError::State(
            ShortcutStateError::TriggerCountOverflow,
        ));
        assert_eq!(error.code, "SHORTCUT_TRIGGER_COUNT_OVERFLOW");
    }
}
