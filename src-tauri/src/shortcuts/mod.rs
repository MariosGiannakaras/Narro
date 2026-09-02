//! Windows global shortcut registration, trigger-state and conflict-handling boundary.

use serde::Serialize;
use std::ffi::c_void;
use std::fmt::{Display, Formatter};
use std::io;
use std::sync::{Mutex, MutexGuard, OnceLock};
use tauri::{Emitter, Manager};

const FOCUS_SURFACE_LABEL: &str = "focusSurface";
const SHORTCUT_EVENT: &str = "shortcut-state-changed";
const SHORTCUT_SUBCLASS_ID: usize = 0x4e_41_52_52_4f_53;
const PRIMARY_HOTKEY_ID: i32 = 0x4e41;
const CONFLICT_PROBE_HOTKEY_ID: i32 = 0x4e42;
const WM_HOTKEY: u32 = 0x0312;
const WM_NC_DESTROY: u32 = 0x0082;
const MOD_ALT: u32 = 0x0001;
const MOD_CONTROL: u32 = 0x0002;
const MOD_SHIFT: u32 = 0x0004;
const MOD_NOREPEAT: u32 = 0x4000;
const VK_F10: u32 = 0x79;
const ERROR_HOTKEY_ALREADY_REGISTERED: i32 = 1409;

pub const SHORTCUT_ACCELERATOR: &str = "Ctrl+Alt+Shift+F10";

const SHORTCUT_MODIFIERS: u32 = MOD_CONTROL | MOD_ALT | MOD_SHIFT | MOD_NOREPEAT;

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

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutStatus {
    pub accelerator: &'static str,
    pub registered: bool,
    pub trigger_count: u32,
    pub revision: u32,
}

impl Default for ShortcutStatus {
    fn default() -> Self {
        Self {
            accelerator: SHORTCUT_ACCELERATOR,
            registered: false,
            trigger_count: 0,
            revision: 0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ShortcutStateError {
    LockPoisoned,
    TriggerCountOverflow,
    RevisionOverflow,
}

impl Display for ShortcutStateError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(match self {
            Self::LockPoisoned => "shortcut state lock is poisoned",
            Self::TriggerCountOverflow => "shortcut trigger counter overflow",
            Self::RevisionOverflow => "shortcut state revision overflow",
        })
    }
}

impl std::error::Error for ShortcutStateError {}

#[derive(Default)]
pub struct ShortcutState {
    data: Mutex<ShortcutStatus>,
}

impl ShortcutState {
    pub fn new() -> Self {
        Self::default()
    }

    fn lock(&self) -> Result<MutexGuard<'_, ShortcutStatus>, ShortcutStateError> {
        self.data.lock().map_err(|_| ShortcutStateError::LockPoisoned)
    }

    pub fn snapshot(&self) -> Result<ShortcutStatus, ShortcutStateError> {
        Ok(self.lock()?.clone())
    }

    fn set_registered(&self, registered: bool) -> Result<ShortcutStatus, ShortcutStateError> {
        let mut data = self.lock()?;
        if data.registered == registered {
            return Ok(data.clone());
        }

        let revision = data
            .revision
            .checked_add(1)
            .ok_or(ShortcutStateError::RevisionOverflow)?;
        data.registered = registered;
        data.revision = revision;
        Ok(data.clone())
    }

    fn record_trigger(&self) -> Result<ShortcutStatus, ShortcutStateError> {
        let mut data = self.lock()?;
        if !data.registered {
            return Ok(data.clone());
        }

        let trigger_count = data
            .trigger_count
            .checked_add(1)
            .ok_or(ShortcutStateError::TriggerCountOverflow)?;
        let revision = data
            .revision
            .checked_add(1)
            .ok_or(ShortcutStateError::RevisionOverflow)?;
        data.trigger_count = trigger_count;
        data.revision = revision;
        Ok(data.clone())
    }
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ConflictProbeResult {
    pub accelerator: &'static str,
    pub conflict_detected: bool,
    pub os_error_code: Option<i32>,
}

#[derive(Debug)]
pub enum ShortcutError {
    State(ShortcutStateError),
    FocusSurfaceMissing,
    Hwnd(String),
    RegistrationConflict,
    RegistrationFailed(io::Error),
    UnregistrationFailed(io::Error),
    ConflictProbeRequiresRegistration,
    ConflictProbeUnexpectedSuccess,
    ConflictProbeUnexpectedFailure(io::Error),
    ObserverAlreadyInitialized,
    ObserverInstallFailed,
}

impl Display for ShortcutError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::State(error) => write!(formatter, "{error}"),
            Self::FocusSurfaceMissing => formatter.write_str("focusSurface does not exist"),
            Self::Hwnd(error) => write!(formatter, "resolve focusSurface HWND: {error}"),
            Self::RegistrationConflict => write!(
                formatter,
                "Windows reports {SHORTCUT_ACCELERATOR} is already registered"
            ),
            Self::RegistrationFailed(error) => {
                write!(formatter, "RegisterHotKey failed: {error}")
            }
            Self::UnregistrationFailed(error) => {
                write!(formatter, "UnregisterHotKey failed: {error}")
            }
            Self::ConflictProbeRequiresRegistration => formatter.write_str(
                "register the primary diagnostic shortcut before probing a conflict",
            ),
            Self::ConflictProbeUnexpectedSuccess => formatter.write_str(
                "Windows unexpectedly allowed the same accelerator to be registered twice",
            ),
            Self::ConflictProbeUnexpectedFailure(error) => {
                write!(formatter, "duplicate RegisterHotKey failed unexpectedly: {error}")
            }
            Self::ObserverAlreadyInitialized => {
                formatter.write_str("shortcut observer app handle was already initialized")
            }
            Self::ObserverInstallFailed => {
                formatter.write_str("SetWindowSubclass returned false for shortcut observer")
            }
        }
    }
}

impl std::error::Error for ShortcutError {}

impl From<ShortcutStateError> for ShortcutError {
    fn from(error: ShortcutStateError) -> Self {
        Self::State(error)
    }
}

static SHORTCUT_APP_HANDLE: OnceLock<tauri::AppHandle> = OnceLock::new();

fn focus_surface_hwnd(app_handle: &tauri::AppHandle) -> Result<RawHwnd, ShortcutError> {
    let window = app_handle
        .get_webview_window(FOCUS_SURFACE_LABEL)
        .ok_or(ShortcutError::FocusSurfaceMissing)?;
    let hwnd = window
        .hwnd()
        .map_err(|error| ShortcutError::Hwnd(error.to_string()))?;
    Ok(hwnd.0 as RawHwnd)
}

fn last_hotkey_error() -> io::Error {
    io::Error::last_os_error()
}

fn report_shortcut_state_change(app_handle: &tauri::AppHandle, status: &ShortcutStatus) {
    if let Err(error) = app_handle.emit(SHORTCUT_EVENT, status.clone()) {
        eprintln!(
            "Warning: shortcut state revision {} changed, but broadcast failed: {error}",
            status.revision
        );
    }
}

fn register_native(hwnd: RawHwnd, id: i32) -> Result<(), ShortcutError> {
    let result = unsafe { register_hot_key(hwnd, id, SHORTCUT_MODIFIERS, VK_F10) };
    if result != 0 {
        return Ok(());
    }

    let error = last_hotkey_error();
    if error.raw_os_error() == Some(ERROR_HOTKEY_ALREADY_REGISTERED) {
        Err(ShortcutError::RegistrationConflict)
    } else {
        Err(ShortcutError::RegistrationFailed(error))
    }
}

fn unregister_native(hwnd: RawHwnd, id: i32) -> Result<(), ShortcutError> {
    let result = unsafe { unregister_hot_key(hwnd, id) };
    if result != 0 {
        Ok(())
    } else {
        Err(ShortcutError::UnregistrationFailed(last_hotkey_error()))
    }
}

pub fn install_shortcut_observer(app: &tauri::App) -> Result<(), ShortcutError> {
    let app_handle = app.handle().clone();
    let hwnd = focus_surface_hwnd(&app_handle)?;

    SHORTCUT_APP_HANDLE
        .set(app_handle)
        .map_err(|_| ShortcutError::ObserverAlreadyInitialized)?;

    let installed = unsafe {
        set_window_subclass(
            hwnd,
            Some(shortcut_subclass_proc),
            SHORTCUT_SUBCLASS_ID,
            0,
        )
    };
    if installed == 0 {
        return Err(ShortcutError::ObserverInstallFailed);
    }

    Ok(())
}

pub fn status(state: &ShortcutState) -> Result<ShortcutStatus, ShortcutError> {
    state.snapshot().map_err(ShortcutError::from)
}

pub fn register(
    app_handle: &tauri::AppHandle,
    state: &ShortcutState,
) -> Result<ShortcutStatus, ShortcutError> {
    let snapshot = state.snapshot()?;
    if snapshot.registered {
        return Ok(snapshot);
    }

    let hwnd = focus_surface_hwnd(app_handle)?;
    register_native(hwnd, PRIMARY_HOTKEY_ID)?;

    match state.set_registered(true) {
        Ok(status) => {
            report_shortcut_state_change(app_handle, &status);
            Ok(status)
        }
        Err(error) => {
            if let Err(rollback_error) = unregister_native(hwnd, PRIMARY_HOTKEY_ID) {
                eprintln!(
                    "Shortcut state update failed after RegisterHotKey and rollback also failed: {rollback_error}"
                );
            }
            Err(error.into())
        }
    }
}

pub fn unregister(
    app_handle: &tauri::AppHandle,
    state: &ShortcutState,
) -> Result<ShortcutStatus, ShortcutError> {
    let snapshot = state.snapshot()?;
    if !snapshot.registered {
        return Ok(snapshot);
    }

    let hwnd = focus_surface_hwnd(app_handle)?;
    unregister_native(hwnd, PRIMARY_HOTKEY_ID)?;

    match state.set_registered(false) {
        Ok(status) => {
            report_shortcut_state_change(app_handle, &status);
            Ok(status)
        }
        Err(error) => {
            if let Err(rollback_error) = register_native(hwnd, PRIMARY_HOTKEY_ID) {
                eprintln!(
                    "Shortcut state update failed after UnregisterHotKey and rollback also failed: {rollback_error}"
                );
            }
            Err(error.into())
        }
    }
}

pub fn probe_conflict(
    app_handle: &tauri::AppHandle,
    state: &ShortcutState,
) -> Result<ConflictProbeResult, ShortcutError> {
    if !state.snapshot()?.registered {
        return Err(ShortcutError::ConflictProbeRequiresRegistration);
    }

    let hwnd = focus_surface_hwnd(app_handle)?;
    let result = unsafe {
        register_hot_key(
            hwnd,
            CONFLICT_PROBE_HOTKEY_ID,
            SHORTCUT_MODIFIERS,
            VK_F10,
        )
    };

    if result != 0 {
        if let Err(error) = unregister_native(hwnd, CONFLICT_PROBE_HOTKEY_ID) {
            eprintln!("Failed to roll back unexpected conflict-probe registration: {error}");
        }
        return Err(ShortcutError::ConflictProbeUnexpectedSuccess);
    }

    let error = last_hotkey_error();
    if error.raw_os_error() == Some(ERROR_HOTKEY_ALREADY_REGISTERED) {
        Ok(ConflictProbeResult {
            accelerator: SHORTCUT_ACCELERATOR,
            conflict_detected: true,
            os_error_code: error.raw_os_error(),
        })
    } else {
        Err(ShortcutError::ConflictProbeUnexpectedFailure(error))
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
    if message == WM_HOTKEY && wparam == PRIMARY_HOTKEY_ID as usize {
        schedule_trigger_recording();
    } else if message == WM_NC_DESTROY {
        let _ = unsafe { remove_window_subclass(hwnd, Some(shortcut_subclass_proc), subclass_id) };
    }

    unsafe { def_subclass_proc(hwnd, message, wparam, lparam) }
}

fn schedule_trigger_recording() {
    let Some(app_handle) = SHORTCUT_APP_HANDLE.get().cloned() else {
        eprintln!("Global shortcut fired before Narro shortcut observer initialization completed");
        return;
    };

    tauri::async_runtime::spawn(async move {
        let state = app_handle.state::<ShortcutState>();
        match state.record_trigger() {
            Ok(status) => report_shortcut_state_change(&app_handle, &status),
            Err(error) => eprintln!("Failed to record global shortcut trigger: {error}"),
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    #[test]
    fn registration_state_is_idempotent_and_versioned() {
        let state = ShortcutState::new();

        let registered = state.set_registered(true).expect("register state");
        assert!(registered.registered);
        assert_eq!(registered.revision, 1);

        let repeated = state.set_registered(true).expect("repeat register state");
        assert_eq!(repeated, registered);

        let unregistered = state.set_registered(false).expect("unregister state");
        assert!(!unregistered.registered);
        assert_eq!(unregistered.revision, 2);

        let repeated = state
            .set_registered(false)
            .expect("repeat unregister state");
        assert_eq!(repeated, unregistered);
    }

    #[test]
    fn trigger_is_ignored_when_unregistered() {
        let state = ShortcutState::new();
        let status = state.record_trigger().expect("record trigger");
        assert_eq!(status.trigger_count, 0);
        assert_eq!(status.revision, 0);
    }

    #[test]
    fn registered_trigger_increments_count_and_revision() {
        let state = ShortcutState::new();
        state.set_registered(true).expect("register state");

        let first = state.record_trigger().expect("first trigger");
        assert_eq!(first.trigger_count, 1);
        assert_eq!(first.revision, 2);

        let second = state.record_trigger().expect("second trigger");
        assert_eq!(second.trigger_count, 2);
        assert_eq!(second.revision, 3);
    }

    #[test]
    fn trigger_overflow_does_not_partially_mutate_state() {
        let state = ShortcutState::new();
        {
            let mut data = state.data.lock().expect("shortcut state lock");
            data.registered = true;
            data.trigger_count = u32::MAX;
            data.revision = 17;
        }

        assert_eq!(
            state.record_trigger(),
            Err(ShortcutStateError::TriggerCountOverflow)
        );
        let snapshot = state.snapshot().expect("snapshot after overflow");
        assert_eq!(snapshot.trigger_count, u32::MAX);
        assert_eq!(snapshot.revision, 17);
    }

    #[test]
    fn revision_overflow_does_not_partially_mutate_registration() {
        let state = ShortcutState::new();
        {
            let mut data = state.data.lock().expect("shortcut state lock");
            data.registered = false;
            data.revision = u32::MAX;
        }

        assert_eq!(
            state.set_registered(true),
            Err(ShortcutStateError::RevisionOverflow)
        );
        let snapshot = state.snapshot().expect("snapshot after overflow");
        assert!(!snapshot.registered);
        assert_eq!(snapshot.revision, u32::MAX);
    }

    #[test]
    fn poisoned_lock_returns_explicit_error() {
        let state = Arc::new(ShortcutState::new());
        let poisoned = Arc::clone(&state);
        let join = std::thread::spawn(move || {
            let _guard = poisoned.data.lock().expect("shortcut state lock before poison");
            panic!("intentional poison for test");
        })
        .join();

        assert!(join.is_err());
        assert_eq!(state.snapshot(), Err(ShortcutStateError::LockPoisoned));
    }
}
