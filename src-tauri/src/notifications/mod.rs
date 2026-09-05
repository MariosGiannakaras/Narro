//! Native Windows notification capability boundary.

use crate::error::{CommandError, CommandResult};
use serde::Serialize;

pub const TEST_NOTIFICATION_TITLE: &str = "Narro notification test";
pub const TEST_NOTIFICATION_BODY: &str =
    "Local Windows notification delivery is available while Narro is running.";
pub const POMODORO_BREAK_STARTED_TITLE: &str = "Pomodoro break started";
pub const POMODORO_BREAK_STARTED_BODY: &str =
    "Your work sprint is complete. Take a break.";
pub const POMODORO_BREAK_FINISHED_TITLE: &str = "Pomodoro break finished";
pub const POMODORO_BREAK_FINISHED_BODY: &str =
    "Your break is complete. Resume when you're ready.";

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTestResult {
    pub title: &'static str,
    pub body: &'static str,
    pub submitted: bool,
}

fn submit(app_handle: &tauri::AppHandle, title: &str, body: &str) -> CommandResult<()> {
    #[cfg(windows)]
    {
        use tauri_plugin_notification::NotificationExt;

        app_handle
            .notification()
            .builder()
            .title(title)
            .body(body)
            .show()
            .map_err(CommandError::notification_delivery)?;
        Ok(())
    }

    #[cfg(not(windows))]
    {
        let _ = (app_handle, title, body);
        Err(CommandError::notification_unsupported_platform())
    }
}

pub fn send_test(app_handle: &tauri::AppHandle) -> CommandResult<NotificationTestResult> {
    submit(
        app_handle,
        TEST_NOTIFICATION_TITLE,
        TEST_NOTIFICATION_BODY,
    )?;

    Ok(NotificationTestResult {
        title: TEST_NOTIFICATION_TITLE,
        body: TEST_NOTIFICATION_BODY,
        submitted: true,
    })
}

pub fn send_pomodoro_break_started(app_handle: &tauri::AppHandle) -> CommandResult<()> {
    submit(
        app_handle,
        POMODORO_BREAK_STARTED_TITLE,
        POMODORO_BREAK_STARTED_BODY,
    )
}

pub fn send_pomodoro_break_finished(app_handle: &tauri::AppHandle) -> CommandResult<()> {
    submit(
        app_handle,
        POMODORO_BREAK_FINISHED_TITLE,
        POMODORO_BREAK_FINISHED_BODY,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn notification_text_is_bounded_and_static() {
        for (title, body) in [
            (TEST_NOTIFICATION_TITLE, TEST_NOTIFICATION_BODY),
            (POMODORO_BREAK_STARTED_TITLE, POMODORO_BREAK_STARTED_BODY),
            (POMODORO_BREAK_FINISHED_TITLE, POMODORO_BREAK_FINISHED_BODY),
        ] {
            assert!(!title.is_empty());
            assert!(title.len() <= 80);
            assert!(!body.is_empty());
            assert!(body.len() <= 200);
        }
    }
}
