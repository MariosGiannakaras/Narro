//! Windows global-shortcut registration, conflict handling and trigger dispatch.

use serde::Serialize;
use std::ffi::c_void;
use std::fmt::{Display, Formatter};
use std::io;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc;
use std::sync::OnceLock;
use tauri::Manager;

use crate::domain::AppState;

const FOCUS_SURFACE_LABEL: &str = "focusSurface";
const SHORTCUT_LABEL: &str = "Ctrl+Alt+Shift+N";
const PRIMARY_HOTKEY_ID: i32 = 0x4e41;
const CONFLICT_PROBE_HOTKEY_ID: i32 = 0x4e42;
const SHORTCUT_SUBCLASS_ID: usize = 0x4e_41_52_53;

const MOD_ALT: u32 = 0x0001;
const MOD_CONTROL: u32 = 0x0002;
const MOD_SHIFT: u32 = 0x0004;
const MOD_NOREPEAT: u32 = 0x4000;
const SHORTCUT_MODIFIERS: u32 = MOD_ALT | MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT;
const VK_N: u32 = 0x4e;

const WM_HOTKEY: u32 = 0x0312;
const WM_NC_DESTROY: u32 = 0x0082;
const ERROR_HOTKEY_ALREADY_REGISTERED: i32 = 1409;

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

#[derive(Default)]
pub struct ShortcutRuntime {
    registered: AtomicBool,
}

impl ShortcutRuntime {
    pub fn new() -> Self {
        Self::default()
    }

    fn is_registered(&self) -> bool {
        self.registered.load(Ordering::Acquire)
    }

    fn set_registered(&self, registered: bool) {
        self.registered.store(registered, Ordering::Release);
    }

    fn status(&self) -> ShortcutRegistrationStatus {
        ShortcutRegistrationStatus {
            shortcut: SHORTCUT_LABEL,
            registered: self.is_registered(),
        }
    }
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutRegistrationStatus {
    pub shortcut: &'static str,
    pub registered: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutConflictProbe {
    pub shortcut: &'static str,
    pub conflict_detected: bool,
    pub source: &'static str,
    pub os_error_code: Option<i32>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ShortcutError {
    WindowUnavailable,
    ObserverAlreadyInitialized,
    ObserverInstallFailed(String),
    MainThreadDispatchFailed(String),
    MainThreadResponseFailed,
    RegistrationConflict { os_error_code: Option<i32> },
    RegistrationFailed { detail: String, os_error_code: Option<i32> },
    UnregisterFailed { detail: String, os_error_code: Option<i32> },
    ConflictProbeRequiresUnregistered,
    ConflictProbeUnexpectedFailure { detail: String, os_error_code: Option<i32> },
    ConflictProbeCleanupFailed(String),
}

impl Display for ShortcutError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::WindowUnavailable => formatter.write_str("focusSurface is unavailable for global shortcut registration"),
            Self::ObserverAlreadyInitialized => formatter.write_str("global shortcut observer was already initialized"),
            Self::ObserverInstallFailed(detail) => {
                write!(formatter, "failed to install global shortcut window observer: {detail}")
            }
            Self::MainThreadDispatchFailed(detail) => {
                write!(formatter, "failed to dispatch global shortcut operation to the Windows UI thread: {detail}")
            }
            Self::MainThreadResponseFailed => formatter.write_str("global shortcut UI-thread operation ended without returning a result"),
            Self::RegistrationConflict { os_error_code } => {
                write!(formatter, "global shortcut {SHORTCUT_LABEL} is unavailable because the key combination is already registered")?;
                if let Some(code) = os_error_code {
                    write!(formatter, " (Windows error {code})")?;
                }
                Ok(())
            }
            Self::RegistrationFailed { detail, os_error_code } => {
                write!(formatter, "failed to register global shortcut {SHORTCUT_LABEL}: {detail}")?;
                if let Some(code) = os_error_code {
                    write!(formatter, " (Windows error {code})")?;
                }
                Ok(())
            }
            Self::UnregisterFailed { detail, os_error_code } => {
                write!(formatter, "failed to unregister global shortcut {SHORTCUT_LABEL}: {detail}")?;
                if let Some(code) = os_error_code {
                    write!(formatter, " (Windows error {code})")?;
                }
                Ok(())
            }
            Self::ConflictProbeRequiresUnregistered => formatter.write_str(
                "unregister the Narro diagnostic shortcut before running the conflict probe",
            ),
            Self::ConflictProbeUnexpectedFailure { detail, os_error_code } => {
                write!(formatter, "global shortcut conflict probe failed unexpectedly: {detail}")?;
                if let Some(code) = os_error_code {
                    write!(formatter, " (Windows error {code})")?;
                }
                Ok(())
            }
            Self::ConflictProbeCleanupFailed(detail) => {
                write!(formatter, "global shortcut conflict probe cleanup failed: {detail}")
            }
        }
    }
}

impl std::error::Error for ShortcutError {}

pub fn install_shortcut_observer(app: &tauri::App) -> Result<(), ShortcutError> {
    let focus_surface = app
        .get_webview_window(FOCUS_SURFACE_LABEL)
        .ok_or(ShortcutError::WindowUnavailable)?;
    let hwnd = focus_surface
        .hwnd()
        .map_err(|error| ShortcutError::ObserverInstallFailed(format!("resolve focusSurface HWND: {error}")))?;

    SHORTCUT_APP_HANDLE
        .set(app.handle().clone())
        .map_err(|_| ShortcutError::ObserverAlreadyInitialized)?;

    let installed = unsafe {
        set_window_subclass(
            hwnd.0 as RawHwnd,
            Some(shortcut_subclass_proc),
            SHORTCUT_SUBCLASS_ID,
            0,
        )
    };
    if installed == 0 {
        return Err(ShortcutError::ObserverInstallFailed(
            io::Error::last_os_error().to_string(),
        ));
    }

    Ok(())
}

unsafe extern "system" fn shortcut_subclass_proc(
    hwnd: RawHwnd,
    message: u32,
    wparam: usize,
    lparam: isize,
    subclass_id: usize,
    _reference_data: usize,
) -> isize {
    if message == WM_HOTKEY && wparam == PRIMARY_HOTKEY_ID as usize {
        schedule_shortcut_trigger();
    } else if message == WM_NC_DESTROY {
        cleanup_on_window_destroy(hwnd);
        let _ = unsafe { remove_window_subclass(hwnd, Some(shortcut_subclass_proc), subclass_id) };
    }

    unsafe { def_subclass_proc(hwnd, message, wparam, lparam) }
}

fn schedule_shortcut_trigger() {
    let Some(app_handle) = SHORTCUT_APP_HANDLE.get().cloned() else {
        eprintln!("Global shortcut fired before the Narro app handle was available");
        return;
    };

    tauri::async_runtime::spawn(async move {
        let state = app_handle.state::<AppState>();
        match state.record_global_shortcut_trigger() {
            Ok(payload) => crate::report_state_change(&app_handle, &payload),
            Err(error) => eprintln!("Failed to record global shortcut trigger: {error}"),
        }
    });
}

fn cleanup_on_window_destroy(hwnd: RawHwnd) {
    let Some(app_handle) = SHORTCUT_APP_HANDLE.get() else {
        return;
    };
    let runtime = app_handle.state::<ShortcutRuntime>();
    if runtime.is_registered() {
        let unregistered = unsafe { unregister_hot_key(hwnd, PRIMARY_HOTKEY_ID) };
        if unregistered == 0 {
            eprintln!(
                "Failed to unregister Narro global shortcut during focusSurface destruction: {}",
                io::Error::last_os_error()
            );
        } else {
            runtime.set_registered(false);
        }
    }
}

pub fn status(app_handle: &tauri::AppHandle) -> ShortcutRegistrationStatus {
    app_handle.state::<ShortcutRuntime>().status()
}

pub async fn register(
    app_handle: tauri::AppHandle,
) -> Result<ShortcutRegistrationStatus, ShortcutError> {
    run_on_ui_thread(app_handle, |handle| register_on_ui_thread(handle)).await
}

pub async fn unregister(
    app_handle: tauri::AppHandle,
) -> Result<ShortcutRegistrationStatus, ShortcutError> {
    run_on_ui_thread(app_handle, |handle| unregister_on_ui_thread(handle)).await
}

pub async fn probe_conflict(
    app_handle: tauri::AppHandle,
) -> Result<ShortcutConflictProbe, ShortcutError> {
    run_on_ui_thread(app_handle, |handle| probe_conflict_on_ui_thread(handle)).await
}

async fn run_on_ui_thread<T, F>(
    app_handle: tauri::AppHandle,
    operation: F,
) -> Result<T, ShortcutError>
where
    T: Send + 'static,
    F: FnOnce(&tauri::AppHandle) -> Result<T, ShortcutError> + Send + 'static,
{
    let (sender, receiver) = mpsc::sync_channel(1);
    let callback_handle = app_handle.clone();
    app_handle
        .run_on_main_thread(move || {
            let _ = sender.send(operation(&callback_handle));
        })
        .map_err(|error| ShortcutError::MainThreadDispatchFailed(error.to_string()))?;

    let received = tauri::async_runtime::spawn_blocking(move || receiver.recv())
        .await
        .map_err(|error| ShortcutError::MainThreadDispatchFailed(error.to_string()))?
        .map_err(|_| ShortcutError::MainThreadResponseFailed)?;
    received
}

fn focus_surface_hwnd(app_handle: &tauri::AppHandle) -> Result<RawHwnd, ShortcutError> {
    let window = app_handle
        .get_webview_window(FOCUS_SURFACE_LABEL)
        .ok_or(ShortcutError::WindowUnavailable)?;
    window
        .hwnd()
        .map(|hwnd| hwnd.0 as RawHwnd)
        .map_err(|error| ShortcutError::RegistrationFailed {
            detail: format!("resolve focusSurface HWND: {error}"),
            os_error_code: None,
        })
}

fn register_on_ui_thread(
    app_handle: &tauri::AppHandle,
) -> Result<ShortcutRegistrationStatus, ShortcutError> {
    let runtime = app_handle.state::<ShortcutRuntime>();
    if runtime.is_registered() {
        return Ok(runtime.status());
    }

    let hwnd = focus_surface_hwnd(app_handle)?;
    let registered = unsafe {
        register_hot_key(hwnd, PRIMARY_HOTKEY_ID, SHORTCUT_MODIFIERS, VK_N)
    };
    if registered == 0 {
        return Err(classify_registration_error(io::Error::last_os_error()));
    }

    runtime.set_registered(true);
    Ok(runtime.status())
}

fn unregister_on_ui_thread(
    app_handle: &tauri::AppHandle,
) -> Result<ShortcutRegistrationStatus, ShortcutError> {
    let runtime = app_handle.state::<ShortcutRuntime>();
    if !runtime.is_registered() {
        return Ok(runtime.status());
    }

    let hwnd = focus_surface_hwnd(app_handle)?;
    let unregistered = unsafe { unregister_hot_key(hwnd, PRIMARY_HOTKEY_ID) };
    if unregistered == 0 {
        let error = io::Error::last_os_error();
        return Err(ShortcutError::UnregisterFailed {
            detail: error.to_string(),
            os_error_code: error.raw_os_error(),
        });
    }

    runtime.set_registered(false);
    Ok(runtime.status())
}

fn probe_conflict_on_ui_thread(
    app_handle: &tauri::AppHandle,
) -> Result<ShortcutConflictProbe, ShortcutError> {
    let runtime = app_handle.state::<ShortcutRuntime>();
    if runtime.is_registered() {
        return Err(ShortcutError::ConflictProbeRequiresUnregistered);
    }

    let hwnd = focus_surface_hwnd(app_handle)?;
    let probe_registered = unsafe {
        register_hot_key(
            hwnd,
            CONFLICT_PROBE_HOTKEY_ID,
            SHORTCUT_MODIFIERS,
            VK_N,
        )
    };
    if probe_registered == 0 {
        let error = io::Error::last_os_error();
        if error.raw_os_error() == Some(ERROR_HOTKEY_ALREADY_REGISTERED) {
            return Ok(ShortcutConflictProbe {
                shortcut: SHORTCUT_LABEL,
                conflict_detected: true,
                source: "external-or-system",
                os_error_code: error.raw_os_error(),
            });
        }
        return Err(ShortcutError::ConflictProbeUnexpectedFailure {
            detail: error.to_string(),
            os_error_code: error.raw_os_error(),
        });
    }

    let primary_registered = unsafe {
        register_hot_key(hwnd, PRIMARY_HOTKEY_ID, SHORTCUT_MODIFIERS, VK_N)
    };
    let primary_error = if primary_registered == 0 {
        Some(io::Error::last_os_error())
    } else {
        None
    };

    let mut cleanup_failures = Vec::new();
    if primary_registered != 0 && unsafe { unregister_hot_key(hwnd, PRIMARY_HOTKEY_ID) } == 0 {
        cleanup_failures.push(format!(
            "primary probe registration: {}",
            io::Error::last_os_error()
        ));
    }
    if unsafe { unregister_hot_key(hwnd, CONFLICT_PROBE_HOTKEY_ID) } == 0 {
        cleanup_failures.push(format!("conflict probe registration: {}", io::Error::last_os_error()));
    }
    if !cleanup_failures.is_empty() {
        return Err(ShortcutError::ConflictProbeCleanupFailed(
            cleanup_failures.join("; "),
        ));
    }

    match primary_error {
        Some(error) if error.raw_os_error() == Some(ERROR_HOTKEY_ALREADY_REGISTERED) => {
            Ok(ShortcutConflictProbe {
                shortcut: SHORTCUT_LABEL,
                conflict_detected: true,
                source: "deterministic-self-probe",
                os_error_code: error.raw_os_error(),
            })
        }
        Some(error) => Err(ShortcutError::ConflictProbeUnexpectedFailure {
            detail: error.to_string(),
            os_error_code: error.raw_os_error(),
        }),
        None => Ok(ShortcutConflictProbe {
            shortcut: SHORTCUT_LABEL,
            conflict_detected: false,
            source: "unexpected-registration-success",
            os_error_code: None,
        }),
    }
}

fn classify_registration_error(error: io::Error) -> ShortcutError {
    let os_error_code = error.raw_os_error();
    if os_error_code == Some(ERROR_HOTKEY_ALREADY_REGISTERED) {
        ShortcutError::RegistrationConflict { os_error_code }
    } else {
        ShortcutError::RegistrationFailed {
            detail: error.to_string(),
            os_error_code,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn runtime_registration_state_is_explicit() {
        let runtime = ShortcutRuntime::new();
        assert_eq!(
            runtime.status(),
            ShortcutRegistrationStatus {
                shortcut: SHORTCUT_LABEL,
                registered: false,
            }
        );

        runtime.set_registered(true);
        assert!(runtime.status().registered);
        runtime.set_registered(false);
        assert!(!runtime.status().registered);
    }

    #[test]
    fn windows_hotkey_conflict_has_distinct_error() {
        assert_eq!(
            classify_registration_error(io::Error::from_raw_os_error(
                ERROR_HOTKEY_ALREADY_REGISTERED,
            )),
            ShortcutError::RegistrationConflict {
                os_error_code: Some(ERROR_HOTKEY_ALREADY_REGISTERED),
            }
        );
    }

    #[test]
    fn non_conflict_registration_failure_preserves_os_error_code() {
        let error = classify_registration_error(io::Error::from_raw_os_error(5));
        assert!(matches!(
            error,
            ShortcutError::RegistrationFailed {
                os_error_code: Some(5),
                ..
            }
        ));
    }
}
