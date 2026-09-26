//! Windows global-shortcut registration and conflict-handling capability boundary.

use crate::error::{CommandError, CommandResult};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{Emitter, Manager};

pub const SHORTCUT_DIAGNOSTIC_EVENT: &str = "shortcut-diagnostic-changed";
pub const DEFAULT_SHORTCUT_CHORD: &str = "Ctrl+Shift+B";
pub const FOCUS_TOGGLE_CHORD: &str = "Ctrl+Shift+T";
pub const FOCUS_TOGGLE_EVENT: &str = "focus-surface-toggle-requested";
pub const FIND_TIMER_CHORD: &str = "Ctrl+Shift+P";
pub const FIND_TIMER_EVENT: &str = "focus-timer-find-requested";

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum GlobalShortcutKind {
    GoToNarro,
    ToggleFocusMode,
    FindFocusTimer,
}

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
    pub focus_toggle_registered: bool,
    pub focus_toggle_chord: String,
    pub focus_toggle_trigger_count: u64,
    pub focus_toggle_last_error: Option<ShortcutErrorSnapshot>,
    pub find_timer_registered: bool,
    pub find_timer_chord: String,
    pub find_timer_trigger_count: u64,
    pub find_timer_last_error: Option<ShortcutErrorSnapshot>,
}

#[derive(Debug, Default)]
struct ShortcutState {
    observer_installed: bool,
    registered: bool,
    trigger_count: u64,
    revision: u64,
    last_error: Option<ShortcutErrorSnapshot>,
    focus_toggle_registered: bool,
    focus_toggle_trigger_count: u64,
    focus_toggle_last_error: Option<ShortcutErrorSnapshot>,
    find_timer_registered: bool,
    find_timer_trigger_count: u64,
    find_timer_last_error: Option<ShortcutErrorSnapshot>,
}

#[derive(Debug, Default)]
pub struct ShortcutManager {
    state: Mutex<ShortcutState>,
    registration_gate: Mutex<()>,
}

#[cfg(windows)]
#[derive(Clone, Copy)]
enum FocusShortcutKind {
    Toggle,
    FindTimer,
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

    fn set_focus_toggle_registered(&self, registered: bool) -> CommandResult<ShortcutDiagnostics> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        if state.focus_toggle_registered == registered && state.focus_toggle_last_error.is_none() {
            return Ok(snapshot_from_state(&state));
        }

        let next_revision = checked_next_revision(&state)?;
        state.focus_toggle_registered = registered;
        state.focus_toggle_last_error = None;
        state.revision = next_revision;
        Ok(snapshot_from_state(&state))
    }

    fn record_focus_toggle_error(
        &self,
        error: &CommandError,
    ) -> CommandResult<ShortcutDiagnostics> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        let next_revision = checked_next_revision(&state)?;
        state.focus_toggle_last_error = Some(ShortcutErrorSnapshot {
            code: error.code.to_owned(),
            message: error.message.clone(),
        });
        state.revision = next_revision;
        Ok(snapshot_from_state(&state))
    }

    fn record_focus_toggle_trigger(&self) -> CommandResult<ShortcutDiagnostics> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        let next_trigger_count = state
            .focus_toggle_trigger_count
            .checked_add(1)
            .ok_or_else(CommandError::shortcut_trigger_overflow)?;
        let next_revision = checked_next_revision(&state)?;
        state.focus_toggle_trigger_count = next_trigger_count;
        state.focus_toggle_last_error = None;
        state.revision = next_revision;
        Ok(snapshot_from_state(&state))
    }

    fn set_find_timer_registered(&self, registered: bool) -> CommandResult<ShortcutDiagnostics> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        if state.find_timer_registered == registered && state.find_timer_last_error.is_none() {
            return Ok(snapshot_from_state(&state));
        }
        let next_revision = checked_next_revision(&state)?;
        state.find_timer_registered = registered;
        state.find_timer_last_error = None;
        state.revision = next_revision;
        Ok(snapshot_from_state(&state))
    }

    fn record_find_timer_error(&self, error: &CommandError) -> CommandResult<ShortcutDiagnostics> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        let next_revision = checked_next_revision(&state)?;
        state.find_timer_last_error = Some(ShortcutErrorSnapshot {
            code: error.code.to_owned(),
            message: error.message.clone(),
        });
        state.revision = next_revision;
        Ok(snapshot_from_state(&state))
    }

    fn record_find_timer_trigger(&self) -> CommandResult<ShortcutDiagnostics> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        let next_count = state
            .find_timer_trigger_count
            .checked_add(1)
            .ok_or_else(CommandError::shortcut_trigger_overflow)?;
        let next_revision = checked_next_revision(&state)?;
        state.find_timer_trigger_count = next_count;
        state.find_timer_last_error = None;
        state.revision = next_revision;
        Ok(snapshot_from_state(&state))
    }

    #[cfg(windows)]
    fn register_focus_shortcut<Resource>(
        &self,
        kind: FocusShortcutKind,
        register: impl FnOnce() -> CommandResult<Resource>,
        unregister: impl FnOnce(Resource) -> CommandResult<()>,
    ) -> CommandResult<ShortcutDiagnostics> {
        // The native registration and its diagnostic snapshot must be one
        // serialized operation. Otherwise two retry calls can race and leave
        // a false conflict displayed after one of them successfully registers.
        let _gate = self
            .registration_gate
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        let result = (|| {
            let current = self.snapshot()?;
            let already_registered = match kind {
                FocusShortcutKind::Toggle => current.focus_toggle_registered,
                FocusShortcutKind::FindTimer => current.find_timer_registered,
            };
            if already_registered {
                return match kind {
                    FocusShortcutKind::Toggle => self.set_focus_toggle_registered(true),
                    FocusShortcutKind::FindTimer => self.set_find_timer_registered(true),
                };
            }
            if !current.observer_installed {
                return Err(CommandError::shortcut_observer_unavailable());
            }

            let resource = register()?;
            let updated = match kind {
                FocusShortcutKind::Toggle => self.set_focus_toggle_registered(true),
                FocusShortcutKind::FindTimer => self.set_find_timer_registered(true),
            };
            match updated {
                Ok(payload) => Ok(payload),
                Err(error) => match unregister(resource) {
                    Ok(()) => Err(error),
                    Err(rollback_error) => Err(CommandError::shortcut_operation(
                        "rollback registration",
                        format!("{error}; rollback failed: {rollback_error}"),
                    )),
                },
            }
        })();
        if let Err(error) = &result {
            match kind {
                FocusShortcutKind::Toggle => self.record_focus_toggle_error(error)?,
                FocusShortcutKind::FindTimer => self.record_find_timer_error(error)?,
            };
        }
        result
    }

    #[cfg(windows)]
    fn unregister_focus_shortcut<Resource>(
        &self,
        kind: FocusShortcutKind,
        unregister: impl FnOnce() -> CommandResult<Resource>,
        register: impl FnOnce(Resource) -> CommandResult<()>,
    ) -> CommandResult<ShortcutDiagnostics> {
        let _gate = self
            .registration_gate
            .lock()
            .map_err(|_| CommandError::shortcut_state_poisoned())?;
        let result = (|| {
            let current = self.snapshot()?;
            let registered = match kind {
                FocusShortcutKind::Toggle => current.focus_toggle_registered,
                FocusShortcutKind::FindTimer => current.find_timer_registered,
            };
            if !registered {
                return match kind {
                    FocusShortcutKind::Toggle => self.set_focus_toggle_registered(false),
                    FocusShortcutKind::FindTimer => self.set_find_timer_registered(false),
                };
            }

            let resource = unregister()?;
            let updated = match kind {
                FocusShortcutKind::Toggle => self.set_focus_toggle_registered(false),
                FocusShortcutKind::FindTimer => self.set_find_timer_registered(false),
            };
            match updated {
                Ok(payload) => Ok(payload),
                Err(error) => match register(resource) {
                    Ok(()) => Err(error),
                    Err(rollback_error) => Err(CommandError::shortcut_operation(
                        "rollback unregistration",
                        format!("{error}; rollback failed: {rollback_error}"),
                    )),
                },
            }
        })();
        if let Err(error) = &result {
            match kind {
                FocusShortcutKind::Toggle => self.record_focus_toggle_error(error)?,
                FocusShortcutKind::FindTimer => self.record_find_timer_error(error)?,
            };
        }
        result
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
        focus_toggle_registered: state.focus_toggle_registered,
        focus_toggle_chord: FOCUS_TOGGLE_CHORD.to_owned(),
        focus_toggle_trigger_count: state.focus_toggle_trigger_count,
        focus_toggle_last_error: state.focus_toggle_last_error.clone(),
        find_timer_registered: state.find_timer_registered,
        find_timer_chord: FIND_TIMER_CHORD.to_owned(),
        find_timer_trigger_count: state.find_timer_trigger_count,
        find_timer_last_error: state.find_timer_last_error.clone(),
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

fn record_and_report_focus_toggle_error(
    app_handle: &tauri::AppHandle,
    manager: &ShortcutManager,
    error: CommandError,
) -> CommandError {
    match manager.record_focus_toggle_error(&error) {
        Ok(payload) => report_shortcut_change(app_handle, &payload),
        Err(state_error) => return state_error,
    }
    error
}

fn record_and_report_find_timer_error(
    app_handle: &tauri::AppHandle,
    manager: &ShortcutManager,
    error: CommandError,
) -> CommandError {
    match manager.record_find_timer_error(&error) {
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
            let _ = record_and_report_focus_toggle_error(
                app.handle(),
                manager.inner(),
                CommandError::shortcut_observer_unavailable(),
            );
            let _ = record_and_report_find_timer_error(
                app.handle(),
                manager.inner(),
                CommandError::shortcut_observer_unavailable(),
            );
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
        if let Err(error) = register_focus_toggle(app.handle(), manager.inner()) {
            eprintln!("Focus toggle shortcut startup registration unavailable: {error}");
        }
        if let Err(error) = register_find_timer(app.handle(), manager.inner()) {
            eprintln!("Find Timer shortcut startup registration unavailable: {error}");
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

pub fn register_focus_toggle(
    app_handle: &tauri::AppHandle,
    manager: &ShortcutManager,
) -> CommandResult<ShortcutDiagnostics> {
    #[cfg(windows)]
    {
        let result = manager.register_focus_shortcut(
            FocusShortcutKind::Toggle,
            || {
                let hwnd = native::focus_surface_hwnd(app_handle).map_err(|error| {
                    CommandError::shortcut_operation("resolve focusSurface HWND", error)
                })?;
                native::register_focus_toggle(hwnd)
                    .map_err(|error| map_register_error_for_chord(error, FOCUS_TOGGLE_CHORD))?;
                Ok(hwnd)
            },
            |hwnd| {
                native::unregister_focus_toggle(hwnd).map_err(|error| {
                    CommandError::shortcut_operation("unregister focus toggle", error)
                })
            },
        );
        match result {
            Ok(payload) => {
                report_shortcut_change(app_handle, &payload);
                Ok(payload)
            }
            Err(error) => {
                if let Ok(payload) = manager.snapshot() {
                    report_shortcut_change(app_handle, &payload);
                }
                Err(error)
            }
        }
    }

    #[cfg(not(windows))]
    {
        let error = CommandError::shortcut_unsupported_platform();
        Err(record_and_report_focus_toggle_error(
            app_handle, manager, error,
        ))
    }
}

pub fn register_find_timer(
    app_handle: &tauri::AppHandle,
    manager: &ShortcutManager,
) -> CommandResult<ShortcutDiagnostics> {
    #[cfg(windows)]
    {
        let result = manager.register_focus_shortcut(
            FocusShortcutKind::FindTimer,
            || {
                let hwnd = native::focus_surface_hwnd(app_handle).map_err(|error| {
                    CommandError::shortcut_operation("resolve focusSurface HWND", error)
                })?;
                native::register_find_timer(hwnd)
                    .map_err(|error| map_register_error_for_chord(error, FIND_TIMER_CHORD))?;
                Ok(hwnd)
            },
            |hwnd| {
                native::unregister_find_timer(hwnd).map_err(|error| {
                    CommandError::shortcut_operation("unregister Find Timer", error)
                })
            },
        );
        match result {
            Ok(payload) => {
                report_shortcut_change(app_handle, &payload);
                Ok(payload)
            }
            Err(error) => {
                if let Ok(payload) = manager.snapshot() {
                    report_shortcut_change(app_handle, &payload);
                }
                Err(error)
            }
        }
    }

    #[cfg(not(windows))]
    {
        let error = CommandError::shortcut_unsupported_platform();
        Err(record_and_report_find_timer_error(
            app_handle, manager, error,
        ))
    }
}

pub fn unregister_focus_toggle(
    app_handle: &tauri::AppHandle,
    manager: &ShortcutManager,
) -> CommandResult<ShortcutDiagnostics> {
    #[cfg(windows)]
    {
        let result = manager.unregister_focus_shortcut(
            FocusShortcutKind::Toggle,
            || {
                let hwnd = native::focus_surface_hwnd(app_handle).map_err(|error| {
                    CommandError::shortcut_operation("resolve focusSurface HWND", error)
                })?;
                native::unregister_focus_toggle(hwnd).map_err(|error| {
                    CommandError::shortcut_operation("unregister focus toggle", error)
                })?;
                Ok(hwnd)
            },
            |hwnd| {
                native::register_focus_toggle(hwnd)
                    .map_err(|error| map_register_error_for_chord(error, FOCUS_TOGGLE_CHORD))
            },
        );
        match result {
            Ok(payload) => {
                report_shortcut_change(app_handle, &payload);
                Ok(payload)
            }
            Err(error) => {
                if let Ok(payload) = manager.snapshot() {
                    report_shortcut_change(app_handle, &payload);
                }
                Err(error)
            }
        }
    }

    #[cfg(not(windows))]
    {
        let error = CommandError::shortcut_unsupported_platform();
        Err(record_and_report_focus_toggle_error(
            app_handle, manager, error,
        ))
    }
}

pub fn unregister_find_timer(
    app_handle: &tauri::AppHandle,
    manager: &ShortcutManager,
) -> CommandResult<ShortcutDiagnostics> {
    #[cfg(windows)]
    {
        let result = manager.unregister_focus_shortcut(
            FocusShortcutKind::FindTimer,
            || {
                let hwnd = native::focus_surface_hwnd(app_handle).map_err(|error| {
                    CommandError::shortcut_operation("resolve focusSurface HWND", error)
                })?;
                native::unregister_find_timer(hwnd).map_err(|error| {
                    CommandError::shortcut_operation("unregister Find Timer", error)
                })?;
                Ok(hwnd)
            },
            |hwnd| {
                native::register_find_timer(hwnd)
                    .map_err(|error| map_register_error_for_chord(error, FIND_TIMER_CHORD))
            },
        );
        match result {
            Ok(payload) => {
                report_shortcut_change(app_handle, &payload);
                Ok(payload)
            }
            Err(error) => {
                if let Ok(payload) = manager.snapshot() {
                    report_shortcut_change(app_handle, &payload);
                }
                Err(error)
            }
        }
    }

    #[cfg(not(windows))]
    {
        let error = CommandError::shortcut_unsupported_platform();
        Err(record_and_report_find_timer_error(
            app_handle, manager, error,
        ))
    }
}

pub fn set_native_enabled(
    app_handle: &tauri::AppHandle,
    manager: &ShortcutManager,
    kind: GlobalShortcutKind,
    enabled: bool,
) -> CommandResult<ShortcutDiagnostics> {
    match (kind, enabled) {
        (GlobalShortcutKind::GoToNarro, true) => register_default(app_handle, manager),
        (GlobalShortcutKind::GoToNarro, false) => unregister_default(app_handle, manager),
        (GlobalShortcutKind::ToggleFocusMode, true) => register_focus_toggle(app_handle, manager),
        (GlobalShortcutKind::ToggleFocusMode, false) => unregister_focus_toggle(app_handle, manager),
        (GlobalShortcutKind::FindFocusTimer, true) => register_find_timer(app_handle, manager),
        (GlobalShortcutKind::FindFocusTimer, false) => unregister_find_timer(app_handle, manager),
    }
}

pub fn is_registered(snapshot: &ShortcutDiagnostics, kind: GlobalShortcutKind) -> bool {
    match kind {
        GlobalShortcutKind::GoToNarro => snapshot.registered,
        GlobalShortcutKind::ToggleFocusMode => snapshot.focus_toggle_registered,
        GlobalShortcutKind::FindFocusTimer => snapshot.find_timer_registered,
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
    map_register_error_for_chord(error, DEFAULT_SHORTCUT_CHORD)
}

fn map_register_error_for_chord(error: std::io::Error, chord: &str) -> CommandError {
    if error.raw_os_error() == Some(1409) {
        CommandError::shortcut_conflict(chord)
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
    const FOCUS_TOGGLE_HOTKEY_ID: i32 = 0x4e43;
    const FIND_TIMER_HOTKEY_ID: i32 = 0x4e44;
    const HOTKEY_SUBCLASS_ID: usize = 0x4e_41_52_52_4f_48_4b;
    const WM_HOTKEY: u32 = 0x0312;
    const WM_NC_DESTROY: u32 = 0x0082;
    const MOD_CONTROL: u32 = 0x0002;
    const MOD_SHIFT: u32 = 0x0004;
    const MOD_NOREPEAT: u32 = 0x4000;
    const VK_B: u32 = 0x42;
    const VK_T: u32 = 0x54;
    const VK_P: u32 = 0x50;

    pub(super) type RawHwnd = *mut c_void;
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

    pub(super) fn install_observer(app: &tauri::App) -> Result<(), io::Error> {
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

    pub(super) fn focus_surface_hwnd(app_handle: &tauri::AppHandle) -> Result<RawHwnd, io::Error> {
        let window = app_handle
            .get_webview_window(FOCUS_SURFACE_LABEL)
            .ok_or_else(|| io::Error::other("focusSurface does not exist"))?;
        let hwnd = window
            .hwnd()
            .map_err(|error| io::Error::other(format!("resolve focusSurface HWND: {error}")))?;
        Ok(hwnd.0 as RawHwnd)
    }

    pub(super) fn register_default(hwnd: RawHwnd) -> Result<(), io::Error> {
        register(hwnd, DEFAULT_HOTKEY_ID, VK_B)
    }

    pub(super) fn unregister_default(hwnd: RawHwnd) -> Result<(), io::Error> {
        unregister(hwnd, DEFAULT_HOTKEY_ID)
    }

    pub(super) fn register_conflict_probe(hwnd: RawHwnd) -> Result<(), io::Error> {
        register(hwnd, CONFLICT_PROBE_HOTKEY_ID, VK_B)
    }

    pub(super) fn register_focus_toggle(hwnd: RawHwnd) -> Result<(), io::Error> {
        register(hwnd, FOCUS_TOGGLE_HOTKEY_ID, VK_T)
    }

    pub(super) fn unregister_focus_toggle(hwnd: RawHwnd) -> Result<(), io::Error> {
        unregister(hwnd, FOCUS_TOGGLE_HOTKEY_ID)
    }

    pub(super) fn register_find_timer(hwnd: RawHwnd) -> Result<(), io::Error> {
        register(hwnd, FIND_TIMER_HOTKEY_ID, VK_P)
    }

    pub(super) fn unregister_find_timer(hwnd: RawHwnd) -> Result<(), io::Error> {
        unregister(hwnd, FIND_TIMER_HOTKEY_ID)
    }

    pub(super) fn unregister_conflict_probe(hwnd: RawHwnd) -> Result<(), io::Error> {
        unregister(hwnd, CONFLICT_PROBE_HOTKEY_ID)
    }

    fn register(hwnd: RawHwnd, id: i32, virtual_key: u32) -> Result<(), io::Error> {
        let registered = unsafe {
            register_hot_key(
                hwnd,
                id,
                MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT,
                virtual_key,
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
        } else if message == WM_HOTKEY && wparam == FOCUS_TOGGLE_HOTKEY_ID as usize {
            schedule_focus_toggle_trigger();
        } else if message == WM_HOTKEY && wparam == FIND_TIMER_HOTKEY_ID as usize {
            schedule_find_timer_trigger();
        } else if message == WM_NC_DESTROY {
            let _ = unsafe { unregister_hot_key(hwnd, DEFAULT_HOTKEY_ID) };
            let _ = unsafe { unregister_hot_key(hwnd, CONFLICT_PROBE_HOTKEY_ID) };
            let _ = unsafe { unregister_hot_key(hwnd, FOCUS_TOGGLE_HOTKEY_ID) };
            let _ = unsafe { unregister_hot_key(hwnd, FIND_TIMER_HOTKEY_ID) };
            let _ =
                unsafe { remove_window_subclass(hwnd, Some(shortcut_subclass_proc), subclass_id) };
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
                        eprintln!(
                            "Global shortcut fired but diagnostic state update failed: {error}"
                        )
                    }
                }

                crate::request_show_or_recreate_main(trigger_handle.clone());
            }) {
                eprintln!(
                    "Failed to schedule global shortcut handling on the main thread: {error}"
                );
            }
        });
    }

    fn schedule_focus_toggle_trigger() {
        let Some(app_handle) = SHORTCUT_APP_HANDLE.get().cloned() else {
            eprintln!("Focus toggle shortcut fired before the Narro app handle was available");
            return;
        };

        tauri::async_runtime::spawn(async move {
            let trigger_handle = app_handle.clone();
            if let Err(error) = app_handle.run_on_main_thread(move || {
                if crate::current_focus_surface_mode().is_none() {
                    return;
                }

                let manager = trigger_handle.state::<ShortcutManager>();
                let result = trigger_handle
                    .get_webview_window(FOCUS_SURFACE_LABEL)
                    .ok_or_else(|| CommandError::window_not_found(FOCUS_SURFACE_LABEL))
                    .and_then(|window| crate::show_and_focus(&window));
                if let Err(error) = result {
                    let recorded = record_and_report_focus_toggle_error(
                        &trigger_handle,
                        manager.inner(),
                        error,
                    );
                    eprintln!("Focus toggle shortcut could not show the surface: {recorded}");
                    return;
                }

                match manager.record_focus_toggle_trigger() {
                    Ok(payload) => {
                        report_shortcut_change(&trigger_handle, &payload);
                        if let Err(error) = trigger_handle
                            .emit(FOCUS_TOGGLE_EVENT, payload.focus_toggle_trigger_count)
                        {
                            let recorded = record_and_report_focus_toggle_error(
                                &trigger_handle,
                                manager.inner(),
                                CommandError::shortcut_operation("deliver focus toggle", error),
                            );
                            eprintln!("Focus toggle shortcut delivery failed: {recorded}");
                        }
                    }
                    Err(error) => eprintln!("Focus toggle shortcut state update failed: {error}"),
                }
            }) {
                eprintln!("Failed to schedule focus toggle shortcut on the main thread: {error}");
            }
        });
    }

    fn schedule_find_timer_trigger() {
        let Some(app_handle) = SHORTCUT_APP_HANDLE.get().cloned() else {
            eprintln!("Find Timer shortcut fired before the Narro app handle was available");
            return;
        };

        tauri::async_runtime::spawn(async move {
            let trigger_handle = app_handle.clone();
            if let Err(error) = app_handle.run_on_main_thread(move || {
                if crate::current_focus_surface_mode() != Some(crate::FocusSurfaceMode::Timer) {
                    return;
                }

                let manager = trigger_handle.state::<ShortcutManager>();
                let result = trigger_handle
                    .get_webview_window(FOCUS_SURFACE_LABEL)
                    .ok_or_else(|| CommandError::window_not_found(FOCUS_SURFACE_LABEL))
                    .and_then(|window| crate::show_and_focus(&window));
                if let Err(error) = result {
                    let recorded =
                        record_and_report_find_timer_error(&trigger_handle, manager.inner(), error);
                    eprintln!("Find Timer shortcut could not show the surface: {recorded}");
                    return;
                }

                match manager.record_find_timer_trigger() {
                    Ok(payload) => {
                        report_shortcut_change(&trigger_handle, &payload);
                        if let Err(error) =
                            trigger_handle.emit(FIND_TIMER_EVENT, payload.find_timer_trigger_count)
                        {
                            let recorded = record_and_report_find_timer_error(
                                &trigger_handle,
                                manager.inner(),
                                CommandError::shortcut_operation("deliver Find Timer", error),
                            );
                            eprintln!("Find Timer shortcut delivery failed: {recorded}");
                        }
                    }
                    Err(error) => eprintln!("Find Timer shortcut state update failed: {error}"),
                }
            }) {
                eprintln!("Failed to schedule Find Timer shortcut on the main thread: {error}");
            }
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(windows)]
    #[test]
    fn concurrent_focus_shortcut_retries_register_each_chord_once() {
        use std::sync::atomic::{AtomicUsize, Ordering};
        use std::sync::{Arc, Barrier};

        for kind in [FocusShortcutKind::Toggle, FocusShortcutKind::FindTimer] {
            let manager = Arc::new(ShortcutManager::new());
            manager
                .set_observer_installed(true)
                .expect("install observer");
            let start = Arc::new(Barrier::new(17));
            let attempts = Arc::new(AtomicUsize::new(0));
            std::thread::scope(|scope| {
                let mut workers = Vec::new();
                for _ in 0..16 {
                    let manager = Arc::clone(&manager);
                    let start = Arc::clone(&start);
                    let attempts = Arc::clone(&attempts);
                    workers.push(scope.spawn(move || {
                        start.wait();
                        manager.register_focus_shortcut(
                            kind,
                            || {
                                attempts.fetch_add(1, Ordering::SeqCst);
                                std::thread::yield_now();
                                Ok(())
                            },
                            |_| Ok(()),
                        )
                    }));
                }
                start.wait();
                for worker in workers {
                    let snapshot = worker.join().expect("retry thread").expect("registration");
                    assert!(match kind {
                        FocusShortcutKind::Toggle => snapshot.focus_toggle_registered,
                        FocusShortcutKind::FindTimer => snapshot.find_timer_registered,
                    });
                }
            });
            assert_eq!(attempts.load(Ordering::SeqCst), 1);
        }
    }

    #[cfg(windows)]
    #[test]
    fn focus_shortcut_conflict_retry_and_idempotent_retry_clear_diagnostics() {
        for (kind, chord) in [
            (FocusShortcutKind::Toggle, FOCUS_TOGGLE_CHORD),
            (FocusShortcutKind::FindTimer, FIND_TIMER_CHORD),
        ] {
            let manager = ShortcutManager::new();
            manager
                .set_observer_installed(true)
                .expect("install observer");
            let conflict = manager.register_focus_shortcut(
                kind,
                || Err::<(), _>(CommandError::shortcut_conflict(chord)),
                |_| panic!("failed native registration has nothing to roll back"),
            );
            assert_eq!(conflict.expect_err("conflict").code, "SHORTCUT_CONFLICT");
            let failed = manager.snapshot().expect("conflict snapshot");
            assert_eq!(
                match kind {
                    FocusShortcutKind::Toggle => failed.focus_toggle_last_error,
                    FocusShortcutKind::FindTimer => failed.find_timer_last_error,
                }
                .expect("recorded conflict")
                .code,
                "SHORTCUT_CONFLICT",
            );

            let registered = manager
                .register_focus_shortcut(kind, || Ok(()), |_| Ok(()))
                .expect("retry succeeds");
            assert!(match kind {
                FocusShortcutKind::Toggle => registered.focus_toggle_last_error.is_none(),
                FocusShortcutKind::FindTimer => registered.find_timer_last_error.is_none(),
            });
            let transient = CommandError::shortcut_operation("deliver", "temporary failure");
            match kind {
                FocusShortcutKind::Toggle => manager.record_focus_toggle_error(&transient),
                FocusShortcutKind::FindTimer => manager.record_find_timer_error(&transient),
            }
            .expect("record transient error");
            let already_registered = manager
                .register_focus_shortcut(
                    kind,
                    || -> CommandResult<()> {
                        panic!("idempotent retry must not touch native registration")
                    },
                    |_| Ok(()),
                )
                .expect("idempotent retry clears stale error");
            assert!(match kind {
                FocusShortcutKind::Toggle => already_registered.focus_toggle_last_error.is_none(),
                FocusShortcutKind::FindTimer => already_registered.find_timer_last_error.is_none(),
            });
        }
    }

    #[cfg(windows)]
    #[test]
    fn focus_shortcut_state_failure_rolls_back_native_registration() {
        use std::sync::atomic::{AtomicBool, Ordering};

        let manager = ShortcutManager::new();
        manager
            .set_observer_installed(true)
            .expect("install observer");
        manager.state.lock().expect("state lock").revision = u64::MAX;
        let native_registered = AtomicBool::new(false);
        let result = manager.register_focus_shortcut(
            FocusShortcutKind::Toggle,
            || {
                native_registered.store(true, Ordering::SeqCst);
                Ok(())
            },
            |_| {
                native_registered.store(false, Ordering::SeqCst);
                Ok(())
            },
        );
        assert_eq!(
            result.expect_err("revision overflow").code,
            "SHORTCUT_REVISION_OVERFLOW"
        );
        assert!(!native_registered.load(Ordering::SeqCst));
        assert!(
            !manager
                .snapshot()
                .expect("snapshot")
                .focus_toggle_registered
        );
    }

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

        let toggle_error = map_register_error_for_chord(
            std::io::Error::from_raw_os_error(1409),
            FOCUS_TOGGLE_CHORD,
        );
        assert_eq!(toggle_error.code, "SHORTCUT_CONFLICT");
        assert!(toggle_error.message.contains(FOCUS_TOGGLE_CHORD));
    }

    #[test]
    fn focus_toggle_registration_and_trigger_state_are_revisioned() {
        let manager = ShortcutManager::new();
        let initial = manager.snapshot().expect("initial shortcut state");
        assert!(!initial.focus_toggle_registered);
        assert_eq!(initial.focus_toggle_chord, FOCUS_TOGGLE_CHORD);

        let registered = manager
            .set_focus_toggle_registered(true)
            .expect("register focus toggle");
        assert!(registered.focus_toggle_registered);
        assert_eq!(registered.revision, 1);
        assert_eq!(
            manager
                .set_focus_toggle_registered(true)
                .expect("repeat registration"),
            registered,
        );

        let triggered = manager
            .record_focus_toggle_trigger()
            .expect("record focus toggle");
        assert_eq!(triggered.focus_toggle_trigger_count, 1);
        assert_eq!(triggered.revision, 2);
    }

    #[test]
    fn focus_toggle_error_is_visible_and_cleared_after_success() {
        let manager = ShortcutManager::new();
        let conflict = CommandError::shortcut_conflict(FOCUS_TOGGLE_CHORD);
        let failed = manager
            .record_focus_toggle_error(&conflict)
            .expect("record conflict");
        assert_eq!(failed.revision, 1);
        assert_eq!(
            failed
                .focus_toggle_last_error
                .as_ref()
                .map(|error| error.code.as_str()),
            Some("SHORTCUT_CONFLICT"),
        );

        let registered = manager
            .set_focus_toggle_registered(true)
            .expect("register after conflict clears");
        assert!(registered.focus_toggle_last_error.is_none());
        assert_eq!(registered.revision, 2);
    }

    #[test]
    fn find_timer_registration_and_trigger_are_revisioned() {
        let manager = ShortcutManager::new();
        let initial = manager.snapshot().expect("initial shortcut state");
        assert!(!initial.find_timer_registered);
        assert_eq!(initial.find_timer_chord, FIND_TIMER_CHORD);

        let registered = manager
            .set_find_timer_registered(true)
            .expect("register Find Timer");
        assert_eq!(registered.revision, 1);
        assert!(registered.find_timer_registered);
        let triggered = manager
            .record_find_timer_trigger()
            .expect("trigger Find Timer");
        assert_eq!(triggered.revision, 2);
        assert_eq!(triggered.find_timer_trigger_count, 1);

        let conflict = CommandError::shortcut_conflict(FIND_TIMER_CHORD);
        let failed = manager
            .record_find_timer_error(&conflict)
            .expect("record conflict");
        assert_eq!(
            failed
                .find_timer_last_error
                .as_ref()
                .map(|error| error.code.as_str()),
            Some("SHORTCUT_CONFLICT")
        );
        let recovered = manager
            .set_find_timer_registered(true)
            .expect("clear conflict");
        assert!(recovered.find_timer_last_error.is_none());
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
