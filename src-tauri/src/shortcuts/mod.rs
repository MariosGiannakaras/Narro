//! Windows global-shortcut registration and conflict-handling capability boundary.

use crate::error::{CommandError, CommandResult};
use serde::Serialize;
use std::sync::Mutex;
use tauri::{Emitter, Manager};

pub const SHORTCUT_DIAGNOSTIC_EVENT: &str = "shortcut-diagnostic-changed";
pub const DEFAULT_SHORTCUT_CHORD: &str = "Ctrl+Shift+B";

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutErrorSnapshot {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutDiagnostics {
    pub observer_installed: bool,
    pub registered: bool,
    pub chord: String,
    pub trigger_count: u64,
    pub revision: u64,
    pub last_error: Option<ShortcutErrorSnapshot>,
}

#[derive(Debug, Default)]
struct ShortcutState {
    observer_installed: bool,
    registered: bool,
    trigger_count: u64,
    revision: u64,
    last_error: Option<ShortcutErrorSnapshot>,
}

#[derive(Debug, Default)]
pub struct ShortcutManager {
    state: Mutex<ShortcutState>,
}

impl ShortcutManager {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn snapshot(&self) -> CommandResult<ShortcutDiagnostics> {
        let state = self
            .state
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        Ok(snapshot_from_state(&state))
    }

    fn set_observer_installed(&self, installed: bool) -> CommandResult<ShortcutDiagnostics> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        if state.observer_installed == installed {
            return Ok(snapshot_from_state(&state));
        }

        let next_revision = checked_next_revision(&state)?;
        state.observer_installed = installed;
        state.revision = next_revision;
        Ok(snapshot_from_state(&state))
    }

    fn set_registered(&self, registered: bool) -> CommandResult<ShortcutDiagnostics> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        if state.registered == registered && state.last_error.is_none() {
            return Ok(snapshot_from_state(&state));
        }

        let next_revision = checked_next_revision(&state)?;
        state.registered = registered;
        state.last_error = None;
        state.revision = next_revision;
        Ok(snapshot_from_state(&state))
    }

    fn record_error(&self, error: &CommandError) -> CommandResult<ShortcutDiagnostics> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        let next_revision = checked_next_revision(&state)?;
        state.last_error = Some(ShortcutErrorSnapshot {
            code: error.code.to_owned(),
            message: error.message.clone(),
        });
        state.revision = next_revision;
        Ok(snapshot_from_state(&state))
    }

    fn record_trigger(&self) -> CommandResult<ShortcutDiagnostics> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        let next_trigger_count = state
            .trigger_count
            .checked_add(1)
            .ok_or_else(CommandError::shortcut_trigger_overflow)?;
        let next_revision = checked_next_revision(&state)?;
        state.trigger_count = next_trigger_count;
        state.revision = next_revision;
        Ok(snapshot_from_state(&state))
    }
}

fn snapshot_from_state(state: &ShortcutState) -> ShortcutDiagnostics {
    ShortcutDiagnostics {
        observer_installed: state.observer_installed,
        registered: state.registered,
        chord: DEFAULT_SHORTCUT_CHORD.to_owned(),
        trigger_count: state.trigger_count,
        revision: state.revision,
        last_error: state.last_error.clone(),
    }
}

fn checked_next_revision(state: &ShortcutState) -> CommandResult<u64> {
    state
        .revision
        .checked_add(1)
        .ok_or_else(CommandError::shortcut_revision_overflow)
}

fn report_shortcut_change(app_handle: &tauri::AppHandle, payload: &ShortcutDiagnostics) {
    if let Err(error) = app_handle.emit(SHORTCUT_DIAGNOSTIC_EVENT, payload.clone()) {
        eprintln!(
            "Warning: shortcut diagnostic revision {} committed, but broadcast failed: {error}",
            payload.revision
        );
    }
}

fn record_and_report_error(
    app_handle: &tauri::AppHandle,
    manager: &ShortcutManager,
    error: CommandError,
) -> CommandError {
    match manager.record_error(&error) {
        Ok(payload) => report_shortcut_change(app_handle, &payload),
        Err(state_error) => return state_error,
    }
    error
}

pub fn install(app: &tauri::App) {
    let manager = app.state::<ShortcutManager>();

    #[cfg(windows)]
    {
        if let Err(error) = native::install_observer(app) {
            let command_error = CommandError::shortcut_operation("install observer", error);
            let recorded = record_and_report_error(app.handle(), manager.inner(), command_error);
            eprintln!("Global shortcut observer unavailable: {recorded}");
            return;
        }

        match manager.set_observer_installed(true) {
            Ok(payload) => report_shortcut_change(app.handle(), &payload),
            Err(error) => {
                eprintln!("Global shortcut observer installed but state update failed: {error}");
                return;
            }
        }

        if let Err(error) = register_default(app.handle(), manager.inner()) {
            eprintln!("Global shortcut startup registration unavailable: {error}");
        }
    }

    #[cfg(not(windows))]
    {
        let error = CommandError::shortcut_unsupported_platform();
        let recorded = record_and_report_error(app.handle(), manager.inner(), error);
        eprintln!("Global shortcut capability unavailable: {recorded}");
    }
}

pub fn register_default(
    app_handle: &tauri::AppHandle,
    manager: &ShortcutManager,
) -> CommandResult<ShortcutDiagnostics> {
    let current = manager.snapshot()?;
    if current.registered {
        return Ok(current);
    }
    if !current.observer_installed {
        let error = CommandError::shortcut_observer_unavailable();
        return Err(record_and_report_error(app_handle, manager, error));
    }

    #[cfg(windows)]
    {
        let hwnd = native::focus_surface_hwnd(app_handle).map_err(|error| {
            record_and_report_error(
                app_handle,
                manager,
                CommandError::shortcut_operation("resolve focusSurface HWND", error),
            )
        })?;

        if let Err(error) = native::register_default(hwnd) {
            let mapped = map_register_error(error);
            return Err(record_and_report_error(app_handle, manager, mapped));
        }

        let payload = manager.set_registered(true)?;
        report_shortcut_change(app_handle, &payload);
        Ok(payload)
    }

    #[cfg(not(windows))]
    {
        let error = CommandError::shortcut_unsupported_platform();
        Err(record_and_report_error(app_handle, manager, error))
    }
}

pub fn unregister_default(
    app_handle: &tauri::AppHandle,
    manager: &ShortcutManager,
) -> CommandResult<ShortcutDiagnostics> {
    let current = manager.snapshot()?;
    if !current.registered {
        return Ok(current);
    }

    #[cfg(windows)]
    {
        let hwnd = native::focus_surface_hwnd(app_handle).map_err(|error| {
            record_and_report_error(
                app_handle,
                manager,
                CommandError::shortcut_operation("resolve focusSurface HWND", error),
            )
        })?;

        if let Err(error) = native::unregister_default(hwnd) {
            let mapped = CommandError::shortcut_operation("unregister", error);
            return Err(record_and_report_error(app_handle, manager, mapped));
        }

        let payload = manager.set_registered(false)?;
        report_shortcut_change(app_handle, &payload);
        Ok(payload)
    }

    #[cfg(not(windows))]
    {
        let error = CommandError::shortcut_unsupported_platform();
        Err(record_and_report_error(app_handle, manager, error))
    }
}

pub fn conflict_probe(
    app_handle: &tauri::AppHandle,
    manager: &ShortcutManager,
) -> CommandResult<()> {
    let current = manager.snapshot()?;
    if !current.registered {
        let error = CommandError::shortcut_not_registered();
        return Err(record_and_report_error(app_handle, manager, error));
    }

    #[cfg(windows)]
    {
        let hwnd = native::focus_surface_hwnd(app_handle).map_err(|error| {
            record_and_report_error(
                app_handle,
                manager,
                CommandError::shortcut_operation("resolve focusSurface HWND", error),
            )
        })?;

        match native::register_conflict_probe(hwnd) {
            Err(error) => {
                let mapped = map_register_error(error);
                Err(record_and_report_error(app_handle, manager, mapped))
            }
            Ok(()) => {
                let cleanup_result = native::unregister_conflict_probe(hwnd);
                if let Err(error) = cleanup_result {
                    let mapped = CommandError::shortcut_operation("cleanup conflict probe", error);
                    return Err(record_and_report_error(app_handle, manager, mapped));
                }

                let error = CommandError::shortcut_conflict_probe_unexpected_success();
                Err(record_and_report_error(app_handle, manager, error))
            }
        }
    }

    #[cfg(not(windows))]
    {
        let error = CommandError::shortcut_unsupported_platform();
        Err(record_and_report_error(app_handle, manager, error))
    }
}

fn map_register_error(error: std::io::Error) -> CommandError {
    if error.raw_os_error() == Some(1409) {
        CommandError::shortcut_conflict(DEFAULT_SHORTCUT_CHORD)
    } else {
        CommandError::shortcut_operation("register", error)
    }
}

#[cfg(windows)]
mod native {
    use super::*;
    use std::ffi::c_void;
    use std::io;
    use std::sync::OnceLock;

    const FOCUS_SURFACE_LABEL: &str = "focusSurface";
    const DEFAULT_HOTKEY_ID: i32 = 0x4e41;
    const CONFLICT_PROBE_HOTKEY_ID: i32 = 0x4e42;
    const HOTKEY_SUBCLASS_ID: usize = 0x4e_41_52_52_4f_48_4b;
    const WM_HOTKEY: u32 = 0x0312;
    const WM_NC_DESTROY: u32 = 0x0082;
    const MOD_CONTROL: u32 = 0x0002;
    const MOD_SHIFT: u32 = 0x0004;
    const MOD_NOREPEAT: u32 = 0x4000;
    const VK_B: u32 = 0x42;

    type RawHwnd = *mut c_void;
    type SubclassProc =
        Option<unsafe extern "system" fn(RawHwnd, u32, usize, isize, usize, usize) -> isize>;

    #[link(name = "user32")]
    unsafe extern "system" {
        #[link_name = "RegisterHotKey"]
        fn register_hot_key(hwnd: RawHwnd, id: i32, modifiers: u32, virtual_key: u32) -> i32;

        #[link_name = "UnregisterHotKey"]
        fn unregister_hot_key(hwnd: RawHwnd, id: i32) -> i32;
    }

    #[link(name = "comctl32")]
    unsafe extern "system" {
        #[link_name = "SetWindowSubclass"]
        fn set_window_subclass(
            hwnd: RawHwnd,
            subclass_proc: SubclassProc,
            subclass_id: usize,
            reference_data: usize,
        ) -> i32;

        #[link_name = "RemoveWindowSubclass"]
        fn remove_window_subclass(
            hwnd: RawHwnd,
            subclass_proc: SubclassProc,
            subclass_id: usize,
        ) -> i32;

        #[link_name = "DefSubclassProc"]
        fn def_subclass_proc(hwnd: RawHwnd, message: u32, wparam: usize, lparam: isize) -> isize;
    }

    static SHORTCUT_APP_HANDLE: OnceLock<tauri::AppHandle> = OnceLock::new();

    pub fn install_observer(app: &tauri::App) -> Result<(), io::Error> {
        let hwnd = app
            .get_webview_window(FOCUS_SURFACE_LABEL)
            .ok_or_else(|| io::Error::other("focusSurface does not exist during shortcut setup"))?
            .hwnd()
            .map_err(|error| io::Error::other(format!("resolve focusSurface HWND: {error}")))?;

        SHORTCUT_APP_HANDLE
            .set(app.handle().clone())
            .map_err(|_| io::Error::other("shortcut app handle was already initialized"))?;

        let installed = unsafe {
            set_window_subclass(
                hwnd.0 as RawHwnd,
                Some(shortcut_subclass_proc),
                HOTKEY_SUBCLASS_ID,
                0,
            )
        };
        if installed == 0 {
            return Err(io::Error::other(
                "SetWindowSubclass returned false while installing shortcut observer",
            ));
        }

        Ok(())
    }

    pub fn focus_surface_hwnd(app_handle: &tauri::AppHandle) -> Result<RawHwnd, io::Error> {
        let window = app_handle
            .get_webview_window(FOCUS_SURFACE_LABEL)
            .ok_or_else(|| io::Error::other("focusSurface does not exist"))?;
        let hwnd = window
            .hwnd()
            .map_err(|error| io::Error::other(format!("resolve focusSurface HWND: {error}")))?;
        Ok(hwnd.0 as RawHwnd)
    }

    pub fn register_default(hwnd: RawHwnd) -> Result<(), io::Error> {
        register(hwnd, DEFAULT_HOTKEY_ID)
    }

    pub fn unregister_default(hwnd: RawHwnd) -> Result<(), io::Error> {
        unregister(hwnd, DEFAULT_HOTKEY_ID)
    }

    pub fn register_conflict_probe(hwnd: RawHwnd) -> Result<(), io::Error> {
        register(hwnd, CONFLICT_PROBE_HOTKEY_ID)
    }

    pub fn unregister_conflict_probe(hwnd: RawHwnd) -> Result<(), io::Error> {
        unregister(hwnd, CONFLICT_PROBE_HOTKEY_ID)
    }

    fn register(hwnd: RawHwnd, id: i32) -> Result<(), io::Error> {
        let registered = unsafe {
            register_hot_key(
                hwnd,
                id,
                MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT,
                VK_B,
            )
        };
        if registered == 0 {
            Err(io::Error::last_os_error())
        } else {
            Ok(())
        }
    }

    fn unregister(hwnd: RawHwnd, id: i32) -> Result<(), io::Error> {
        let unregistered = unsafe { unregister_hot_key(hwnd, id) };
        if unregistered == 0 {
            Err(io::Error::last_os_error())
        } else {
            Ok(())
        }
    }

    unsafe extern "system" fn shortcut_subclass_proc(
        hwnd: RawHwnd,
        message: u32,
        wparam: usize,
        lparam: isize,
        subclass_id: usize,
        _reference_data: usize,
    ) -> isize {
        if message == WM_HOTKEY && wparam == DEFAULT_HOTKEY_ID as usize {
            schedule_default_shortcut_trigger();
        } else if message == WM_NC_DESTROY {
            let _ = unsafe { unregister_hot_key(hwnd, DEFAULT_HOTKEY_ID) };
            let _ = unsafe { unregister_hot_key(hwnd, CONFLICT_PROBE_HOTKEY_ID) };
            let _ = unsafe {
                remove_window_subclass(hwnd, Some(shortcut_subclass_proc), subclass_id)
            };
        }

        unsafe { def_subclass_proc(hwnd, message, wparam, lparam) }
    }

    fn schedule_default_shortcut_trigger() {
        let Some(app_handle) = SHORTCUT_APP_HANDLE.get().cloned() else {
            eprintln!("Global shortcut fired before the Narro app handle was available");
            return;
        };

        tauri::async_runtime::spawn(async move {
            let trigger_handle = app_handle.clone();
            if let Err(error) = app_handle.run_on_main_thread(move || {
                let manager = trigger_handle.state::<ShortcutManager>();
                match manager.record_trigger() {
                    Ok(payload) => report_shortcut_change(&trigger_handle, &payload),
                    Err(error) => {
                        eprintln!("Global shortcut fired but diagnostic state update failed: {error}")
                    }
                }

                crate::request_show_or_recreate_main(trigger_handle.clone());
            }) {
                eprintln!("Failed to schedule global shortcut handling on the main thread: {error}");
            }
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn registration_state_changes_are_idempotent() {
        let manager = ShortcutManager::new();
        let initial = manager.snapshot().expect("initial shortcut state");
        assert_eq!(initial.revision, 0);
        assert!(!initial.registered);

        let registered = manager.set_registered(true).expect("register state");
        assert_eq!(registered.revision, 1);
        assert!(registered.registered);

        let repeated = manager.set_registered(true).expect("repeat register state");
        assert_eq!(repeated, registered);

        let unregistered = manager.set_registered(false).expect("unregister state");
        assert_eq!(unregistered.revision, 2);
        assert!(!unregistered.registered);

        let repeated = manager
            .set_registered(false)
            .expect("repeat unregister state");
        assert_eq!(repeated, unregistered);
    }

    #[test]
    fn trigger_count_and_revision_advance_together() {
        let manager = ShortcutManager::new();
        let first = manager.record_trigger().expect("first trigger");
        assert_eq!(first.trigger_count, 1);
        assert_eq!(first.revision, 1);

        let second = manager.record_trigger().expect("second trigger");
        assert_eq!(second.trigger_count, 2);
        assert_eq!(second.revision, 2);
    }

    #[test]
    fn conflict_error_mapping_uses_stable_code() {
        let error = map_register_error(std::io::Error::from_raw_os_error(1409));
        assert_eq!(error.code, "SHORTCUT_CONFLICT");
        assert!(error.message.contains(DEFAULT_SHORTCUT_CHORD));
    }

    #[test]
    fn recorded_failure_is_visible_in_authoritative_snapshot() {
        let manager = ShortcutManager::new();
        let conflict = CommandError::shortcut_conflict(DEFAULT_SHORTCUT_CHORD);
        let snapshot = manager.record_error(&conflict).expect("record conflict");

        assert_eq!(snapshot.revision, 1);
        assert_eq!(
            snapshot.last_error,
            Some(ShortcutErrorSnapshot {
                code: "SHORTCUT_CONFLICT".to_owned(),
                message: conflict.message,
            })
        );
    }
}
