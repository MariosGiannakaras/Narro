from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    if text.count(old) != 1:
        raise SystemExit(f"expected exactly one marker in {path}: {old!r}")
    file.write_text(text.replace(old, new, 1), encoding="utf-8")


cargo = "src-tauri/Cargo.toml"
replace_once(
    cargo,
    'tauri-plugin-notification = "2.4.0"\n',
    'tauri-plugin-notification = "2.4.0"\ntauri-plugin-autostart = "2.5.1"\n',
)

autostart_dir = Path("src-tauri/src/autostart")
autostart_dir.mkdir(parents=True, exist_ok=True)
(autostart_dir / "mod.rs").write_text(r'''use serde::Serialize;

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
''', encoding="utf-8")

error_path = "src-tauri/src/error.rs"
marker = '''    pub fn notification_unsupported_platform() -> Self {
        Self::new(
            "NOTIFICATION_UNSUPPORTED_PLATFORM",
            "the current local notification capability is implemented only for Windows",
        )
    }
'''
replacement = marker + '''
    pub fn autostart_query(source: impl Display) -> Self {
        Self::new(
            "AUTOSTART_QUERY_FAILED",
            format!("failed to query Windows autostart registration: {source}"),
        )
    }

    pub fn autostart_enable(source: impl Display) -> Self {
        Self::new(
            "AUTOSTART_ENABLE_FAILED",
            format!("failed to enable Windows autostart: {source}"),
        )
    }

    pub fn autostart_disable(source: impl Display) -> Self {
        Self::new(
            "AUTOSTART_DISABLE_FAILED",
            format!("failed to disable Windows autostart: {source}"),
        )
    }

    pub fn autostart_state_mismatch(expected: bool, observed: bool) -> Self {
        let expected_state = if expected { "enabled" } else { "disabled" };
        let observed_state = if observed { "enabled" } else { "disabled" };
        Self::new(
            "AUTOSTART_STATE_MISMATCH",
            format!(
                "Windows autostart operation completed without the requested state: expected {expected_state}, observed {observed_state}"
            ),
        )
    }

    pub fn autostart_unsupported_platform() -> Self {
        Self::new(
            "AUTOSTART_UNSUPPORTED_PLATFORM",
            "the current autostart capability is implemented only for Windows",
        )
    }
'''
replace_once(error_path, marker, replacement)

lib_path = "src-tauri/src/lib.rs"
replace_once(lib_path, "pub mod domain;\n", "pub mod autostart;\npub mod domain;\n")
replace_once(
    lib_path,
    '''#[tauri::command]
fn global_shortcut_status(
''',
    '''#[tauri::command]
fn autostart_status(app_handle: tauri::AppHandle) -> CommandResult<autostart::AutostartStatus> {
    autostart::status(&app_handle)
}

#[tauri::command]
fn autostart_enable(app_handle: tauri::AppHandle) -> CommandResult<autostart::AutostartStatus> {
    autostart::enable(&app_handle)
}

#[tauri::command]
fn autostart_disable(app_handle: tauri::AppHandle) -> CommandResult<autostart::AutostartStatus> {
    autostart::disable(&app_handle)
}

#[tauri::command]
fn global_shortcut_status(
''',
)
replace_once(
    lib_path,
    "            send_test_notification,\n            global_shortcut_status,\n",
    "            send_test_notification,\n            autostart_status,\n            autostart_enable,\n            autostart_disable,\n            global_shortcut_status,\n",
)
replace_once(
    lib_path,
    "        .plugin(tauri_plugin_notification::init())\n",
    "        .plugin(tauri_plugin_notification::init())\n        .plugin(tauri_plugin_autostart::init(\n            tauri_plugin_autostart::MacosLauncher::LaunchAgent,\n            None,\n        ))\n",
)

app_path = "src/App.tsx"
replace_once(
    app_path,
    '''type NotificationTestResult = {
  title: string;
  body: string;
  submitted: boolean;
};
''',
    '''type NotificationTestResult = {
  title: string;
  body: string;
  submitted: boolean;
};

type AutostartStatus = {
  enabled: boolean;
  changed: boolean;
};
''',
)
replace_once(
    app_path,
    "  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);\n",
    "  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);\n  const [autostartStatus, setAutostartStatus] = useState<AutostartStatus | null>(null);\n",
)
replace_once(
    app_path,
    "    void refreshWindows();\n    void refreshMonitors();\n",
    "    void refreshAutostartStatus();\n    void refreshWindows();\n    void refreshMonitors();\n",
)
replace_once(
    app_path,
    '''  async function runWindowCommand(command: DiagnosticCommand) {
''',
    '''  async function refreshAutostartStatus() {
    try {
      const result = await invoke<AutostartStatus>("autostart_status");
      setAutostartStatus(result);
      setError(null);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
    }
  }

  async function setAutostartEnabled(enabled: boolean) {
    try {
      const result = await invoke<AutostartStatus>(
        enabled ? "autostart_enable" : "autostart_disable",
      );
      setAutostartStatus(result);
      setError(null);
    } catch (failure: unknown) {
      setError(formatInvokeError(failure));
      await refreshAutostartStatus();
    }
  }

  async function runWindowCommand(command: DiagnosticCommand) {
''',
)
notification_block = '''          <p>
            Command success means the notification was submitted to the Windows notification
            backend; visual delivery still requires physical validation. Use an installed build for
            canonical Narro app identity.
          </p>
'''
autostart_block = notification_block + '''
          <hr />
          <h2>Windows Autostart Diagnostics</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(autostartStatus, null, 2)}
          </pre>
          <button onClick={() => void refreshAutostartStatus()}>Refresh Autostart Status</button>
          <button
            disabled={autostartStatus?.enabled === true}
            onClick={() => void setAutostartEnabled(true)}
          >
            Enable Autostart
          </button>
          <button
            disabled={autostartStatus?.enabled !== true}
            onClick={() => void setAutostartEnabled(false)}
          >
            Disable Autostart
          </button>
          <p>
            Enable/disable commands verify the resulting Windows registration state. Actual launch
            on the next sign-in or reboot remains a physical Windows validation step.
          </p>
'''
replace_once(app_path, notification_block, autostart_block)
