use serde::Serialize;

use crate::error::{CommandError, CommandResult};

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct AutostartStatus {
    pub enabled: bool,
    pub changed: bool,
}

impl AutostartStatus {
    fn observed(enabled: bool) -> Self {
        Self {
            enabled,
            changed: false,
        }
    }

    fn changed(enabled: bool) -> Self {
        Self {
            enabled,
            changed: true,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum TransitionPlan {
    Noop,
    Enable,
    Disable,
}

fn plan_transition(current: bool, target: bool) -> TransitionPlan {
    match (current, target) {
        (false, true) => TransitionPlan::Enable,
        (true, false) => TransitionPlan::Disable,
        _ => TransitionPlan::Noop,
    }
}

fn verify_postcondition(expected: bool, observed: bool) -> CommandResult<()> {
    if expected == observed {
        Ok(())
    } else {
        Err(CommandError::autostart_state_mismatch(expected, observed))
    }
}

#[cfg(windows)]
fn set_enabled(app_handle: &tauri::AppHandle, target: bool) -> CommandResult<AutostartStatus> {
    use tauri_plugin_autostart::ManagerExt;

    let manager = app_handle.autolaunch();
    let current = manager
        .is_enabled()
        .map_err(CommandError::autostart_query)?;

    match plan_transition(current, target) {
        TransitionPlan::Noop => Ok(AutostartStatus::observed(current)),
        TransitionPlan::Enable => {
            manager.enable().map_err(CommandError::autostart_enable)?;
            let observed = manager
                .is_enabled()
                .map_err(CommandError::autostart_query)?;
            verify_postcondition(true, observed)?;
            Ok(AutostartStatus::changed(observed))
        }
        TransitionPlan::Disable => {
            manager.disable().map_err(CommandError::autostart_disable)?;
            let observed = manager
                .is_enabled()
                .map_err(CommandError::autostart_query)?;
            verify_postcondition(false, observed)?;
            Ok(AutostartStatus::changed(observed))
        }
    }
}

pub fn status(app_handle: &tauri::AppHandle) -> CommandResult<AutostartStatus> {
    #[cfg(windows)]
    {
        use tauri_plugin_autostart::ManagerExt;

        let enabled = app_handle
            .autolaunch()
            .is_enabled()
            .map_err(CommandError::autostart_query)?;
        Ok(AutostartStatus::observed(enabled))
    }

    #[cfg(not(windows))]
    {
        let _ = app_handle;
        Err(CommandError::autostart_unsupported_platform())
    }
}

pub fn enable(app_handle: &tauri::AppHandle) -> CommandResult<AutostartStatus> {
    #[cfg(windows)]
    {
        set_enabled(app_handle, true)
    }

    #[cfg(not(windows))]
    {
        let _ = app_handle;
        Err(CommandError::autostart_unsupported_platform())
    }
}

pub fn disable(app_handle: &tauri::AppHandle) -> CommandResult<AutostartStatus> {
    #[cfg(windows)]
    {
        set_enabled(app_handle, false)
    }

    #[cfg(not(windows))]
    {
        let _ = app_handle;
        Err(CommandError::autostart_unsupported_platform())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn transition_plan_is_idempotent() {
        assert_eq!(plan_transition(false, false), TransitionPlan::Noop);
        assert_eq!(plan_transition(true, true), TransitionPlan::Noop);
        assert_eq!(plan_transition(false, true), TransitionPlan::Enable);
        assert_eq!(plan_transition(true, false), TransitionPlan::Disable);
    }

    #[test]
    fn postcondition_mismatch_is_structured_failure() {
        let error = verify_postcondition(true, false).expect_err("mismatch must fail");
        assert_eq!(error.code, "AUTOSTART_STATE_MISMATCH");
        assert!(error.message.contains("expected enabled"));
    }

    #[test]
    fn status_serializes_with_stable_shape() {
        let value = serde_json::to_value(AutostartStatus::changed(true))
            .expect("serialize autostart status");
        assert_eq!(value["enabled"], true);
        assert_eq!(value["changed"], true);
    }
}
