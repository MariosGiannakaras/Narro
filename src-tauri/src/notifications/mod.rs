//! Native Windows notification capability boundary.

use crate::error::{CommandError, CommandResult};
use serde::Serialize;

pub const TEST_NOTIFICATION_TITLE: &str = "Narro notification test";
pub const TEST_NOTIFICATION_BODY: &str =
    "Local Windows notification delivery is available while Narro is running.";

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct NotificationTestResult {
    pub title: &'static str,
    pub body: &'static str,
    pub submitted: bool,
}

pub fn send_test(app_handle: &tauri::AppHandle) -> CommandResult<NotificationTestResult> {
    #[cfg(windows)]
    {
        use tauri_plugin_notification::NotificationExt;

        app_handle
            .notification()
            .builder()
            .title(TEST_NOTIFICATION_TITLE)
            .body(TEST_NOTIFICATION_BODY)
            .show()
            .map_err(CommandError::notification_delivery)?;

        Ok(NotificationTestResult {
            title: TEST_NOTIFICATION_TITLE,
            body: TEST_NOTIFICATION_BODY,
            submitted: true,
        })
    }

    #[cfg(not(windows))]
    {
        let _ = app_handle;
        Err(CommandError::notification_unsupported_platform())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn diagnostic_notification_text_is_bounded_and_static() {
        assert!(!TEST_NOTIFICATION_TITLE.is_empty());
        assert!(TEST_NOTIFICATION_TITLE.len() <= 80);
        assert!(!TEST_NOTIFICATION_BODY.is_empty());
        assert!(TEST_NOTIFICATION_BODY.len() <= 200);
    }
}
