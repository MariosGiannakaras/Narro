//! Native Windows notification capability boundary.

use crate::error::{CommandError, CommandResult};
use serde::Serialize;

pub const TEST_NOTIFICATION_TITLE: &str = "Narro notification test";
pub const TEST_NOTIFICATION_BODY: &str =
    "Local Windows notification delivery is available while Narro is running.";
pub const POMODORO_BREAK_STARTED_TITLE: &str = "Pomodoro break started";
pub const POMODORO_BREAK_STARTED_BODY: &str = "Your work sprint is complete. Take a break.";
pub const POMODORO_BREAK_FINISHED_TITLE: &str = "Pomodoro break finished";
pub const POMODORO_BREAK_FINISHED_BODY: &str = "Your break is complete. Resume when you're ready.";
pub const TASK_REMINDER_TITLE: &str = "Task reminder";
const MAX_NOTIFICATION_BODY_CHARS: usize = 200;

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTestResult {
    pub title: &'static str,
    pub body: &'static str,
    pub submitted: bool,
}

fn bounded_body(value: &str) -> String {
    value.chars().take(MAX_NOTIFICATION_BODY_CHARS).collect()
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
    submit(app_handle, TEST_NOTIFICATION_TITLE, TEST_NOTIFICATION_BODY)?;

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

pub fn send_task_reminder(app_handle: &tauri::AppHandle, task_title: &str) -> CommandResult<()> {
    let body = bounded_body(task_title);
    submit(app_handle, TASK_REMINDER_TITLE, &body)
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
            assert!(body.len() <= MAX_NOTIFICATION_BODY_CHARS);
        }
        assert!(!TASK_REMINDER_TITLE.is_empty());
        assert!(TASK_REMINDER_TITLE.len() <= 80);
    }

    #[test]
    fn task_reminder_body_truncates_by_character_without_splitting_unicode() {
        let input = "α".repeat(MAX_NOTIFICATION_BODY_CHARS + 5);
        let body = bounded_body(&input);
        assert_eq!(body.chars().count(), MAX_NOTIFICATION_BODY_CHARS);
        assert_eq!(body, "α".repeat(MAX_NOTIFICATION_BODY_CHARS));
    }
}
