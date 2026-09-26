pub mod autostart;
pub mod board_task_editor;
pub mod board_task_metrics;
pub mod board_task_mutation;
pub mod board_task_notes;
pub mod board_task_schedule;
pub mod board_task_subtasks;
pub mod domain;
pub mod error;
pub mod floating_placement;
pub mod focus_entry;
pub mod focus_preferences;
pub mod home_snapshot;
pub mod list_board;
pub mod list_editor;
pub mod list_settings;
pub mod notifications;
pub mod persistence;
pub mod recurrence;
pub mod recurrence_service;
pub mod reminder_acceptance;
pub mod reminder_service;
pub mod scheduling;
pub mod shortcuts;
pub mod shortcut_settings;
pub mod theme_settings;
pub mod timer;
pub mod timer_service;
pub mod windows;

use domain::{AppState, AppStatePayload};
use error::{CommandError, CommandResult};
use shortcuts::{ShortcutDiagnostics, ShortcutManager};
use std::fmt::Display;
use std::sync::atomic::{AtomicU8, Ordering as AtomicOrdering};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager, State};
use timer_service::{
    timer_complete_task, timer_extend, timer_finish_break, timer_pause, timer_resume,
    timer_session_snapshot, timer_set_estimate, timer_set_time_taken, timer_skip_break,
    timer_skip_task, timer_start_manual_break, timer_start_task, timer_switch_task, TimerService,
};
use windows::{
    focus_panel_edge_position, validate_work_area, FocusPanelSide, MonitorDescriptor,
    PhysicalPoint as GeometryPoint, PhysicalRect as GeometryRect, PhysicalSize as GeometrySize,
};

const MAIN_WINDOW_LABEL: &str = "main";
const FOCUS_SURFACE_LABEL: &str = "focusSurface";
const STATE_CHANGED_EVENT: &str = "state-changed";
const MAX_MONITOR_KEY_LEN: usize = 2048;
const FOCUS_SURFACE_MODE_UNKNOWN: u8 = 0;
const FOCUS_SURFACE_MODE_PANEL: u8 = 1;
const FOCUS_SURFACE_MODE_TIMER: u8 = 2;

static FOCUS_SURFACE_MODE_STATE: AtomicU8 = AtomicU8::new(FOCUS_SURFACE_MODE_UNKNOWN);

#[cfg(windows)]
mod focus_visual_hold;

#[cfg(not(windows))]
mod focus_visual_hold {
    use super::CommandResult;
    pub fn begin(_window: &tauri::WebviewWindow) -> CommandResult<()> {
        Ok(())
    }
    pub fn end() -> CommandResult<()> {
        Ok(())
    }
}

#[cfg(windows)]
mod focus_surface_prewarm {
    use super::{CommandError, CommandResult, FOCUS_SURFACE_LABEL};
    use std::ffi::c_void;
    use std::sync::atomic::{AtomicBool, Ordering};

    const GWL_EXSTYLE: i32 = -20;
    const WS_EX_LAYERED: isize = 0x0008_0000;
    const LWA_ALPHA: u32 = 0x0000_0002;

    static OWNS_LAYERED_STYLE: AtomicBool = AtomicBool::new(false);

    #[link(name = "user32")]
    extern "system" {
        fn GetWindowLongPtrW(hwnd: *mut c_void, index: i32) -> isize;
        fn SetWindowLongPtrW(hwnd: *mut c_void, index: i32, new_long: isize) -> isize;
        fn SetLayeredWindowAttributes(
            hwnd: *mut c_void,
            color_key: u32,
            alpha: u8,
            flags: u32,
        ) -> i32;
    }

    #[link(name = "kernel32")]
    extern "system" {
        fn GetLastError() -> u32;
        fn SetLastError(code: u32);
    }

    fn native_hwnd(window: &tauri::WebviewWindow) -> CommandResult<*mut c_void> {
        let hwnd = window.hwnd().map_err(|error| {
            CommandError::new(
                "FOCUS_SURFACE_PREWARM_FAILED",
                format!("failed to resolve {FOCUS_SURFACE_LABEL} HWND: {error}"),
            )
        })?;
        Ok(hwnd.0 as isize as *mut c_void)
    }

    fn read_extended_style(hwnd: *mut c_void) -> CommandResult<isize> {
        unsafe {
            SetLastError(0);
            let style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
            let error = GetLastError();
            if style == 0 && error != 0 {
                Err(CommandError::new(
                    "FOCUS_SURFACE_PREWARM_FAILED",
                    format!("GetWindowLongPtrW failed with Win32 error {error}"),
                ))
            } else {
                Ok(style)
            }
        }
    }

    fn write_extended_style(hwnd: *mut c_void, style: isize) -> CommandResult<()> {
        unsafe {
            SetLastError(0);
            let previous = SetWindowLongPtrW(hwnd, GWL_EXSTYLE, style);
            let error = GetLastError();
            if previous == 0 && error != 0 {
                Err(CommandError::new(
                    "FOCUS_SURFACE_PREWARM_FAILED",
                    format!("SetWindowLongPtrW failed with Win32 error {error}"),
                ))
            } else {
                Ok(())
            }
        }
    }

    fn set_layered_alpha(hwnd: *mut c_void, alpha: u8) -> CommandResult<()> {
        let result = unsafe { SetLayeredWindowAttributes(hwnd, 0, alpha, LWA_ALPHA) };
        if result == 0 {
            let error = unsafe { GetLastError() };
            Err(CommandError::new(
                "FOCUS_SURFACE_PREWARM_FAILED",
                format!("SetLayeredWindowAttributes({alpha}) failed with Win32 error {error}"),
            ))
        } else {
            Ok(())
        }
    }

    pub fn cloak(window: &tauri::WebviewWindow) -> CommandResult<()> {
        let hwnd = native_hwnd(window)?;
        let style = read_extended_style(hwnd)?;
        let added_layered_style = style & WS_EX_LAYERED == 0;

        if added_layered_style {
            write_extended_style(hwnd, style | WS_EX_LAYERED)?;
            OWNS_LAYERED_STYLE.store(true, Ordering::Release);
        }

        if let Err(error) = set_layered_alpha(hwnd, 0) {
            if added_layered_style {
                let _ = write_extended_style(hwnd, style);
                OWNS_LAYERED_STYLE.store(false, Ordering::Release);
            }
            return Err(error);
        }

        Ok(())
    }

    pub fn uncloak(window: &tauri::WebviewWindow) -> CommandResult<()> {
        let hwnd = native_hwnd(window)?;
        let style = read_extended_style(hwnd)?;
        if style & WS_EX_LAYERED == 0 {
            OWNS_LAYERED_STYLE.store(false, Ordering::Release);
            return Ok(());
        }

        set_layered_alpha(hwnd, 255)?;

        if OWNS_LAYERED_STYLE.swap(false, Ordering::AcqRel) {
            let current_style = read_extended_style(hwnd)?;
            write_extended_style(hwnd, current_style & !WS_EX_LAYERED)?;
        }

        Ok(())
    }
}

#[cfg(not(windows))]
mod focus_surface_prewarm {
    use super::CommandResult;

    pub fn cloak(_window: &tauri::WebviewWindow) -> CommandResult<()> {
        Ok(())
    }

    pub fn uncloak(_window: &tauri::WebviewWindow) -> CommandResult<()> {
        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum FocusSurfaceMode {
    Panel,
    Timer,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum FocusPanelPlacementIntent {
    Present,
    Prepare,
    Revalidate,
}

fn report_state_change(app_handle: &tauri::AppHandle, payload: &AppStatePayload) {
    if let Err(error) = app_handle.emit(STATE_CHANGED_EVENT, payload.clone()) {
        eprintln!(
            "Warning: authoritative state revision {} changed, but broadcast failed: {error}",
            payload.revision
        );
    }
}

#[tauri::command]
fn get_state(state: State<'_, AppState>) -> CommandResult<AppStatePayload> {
    state.snapshot().map_err(CommandError::from)
}

#[tauri::command]
fn get_home_snapshot(app_handle: tauri::AppHandle) -> CommandResult<home_snapshot::HomeSnapshot> {
    let app_dir = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "HOME_SNAPSHOT_FAILED",
            format!("failed to resolve Narro app-data directory for Home: {error}"),
        )
    })?;
    let database_path = app_dir.join("narro.db");
    let connection = rusqlite::Connection::open(&database_path).map_err(|error| {
        CommandError::new(
            "HOME_SNAPSHOT_FAILED",
            format!("failed to open the Narro database for Home: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "HOME_SNAPSHOT_FAILED",
            format!("failed to configure the Narro database for Home: {error}"),
        )
    })?;
    home_snapshot::load(&connection).map_err(|error| {
        CommandError::new(
            "HOME_SNAPSHOT_FAILED",
            format!("failed to read the Home snapshot: {error}"),
        )
    })
}

#[tauri::command]
fn toggle_timer(
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> CommandResult<AppStatePayload> {
    let payload = state.toggle_timer().map_err(CommandError::from)?;
    report_state_change(&app_handle, &payload);
    Ok(payload)
}

#[tauri::command]
fn mutate_state(
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> CommandResult<AppStatePayload> {
    let payload = state.increment_counter().map_err(CommandError::from)?;
    report_state_change(&app_handle, &payload);
    Ok(payload)
}

#[tauri::command]
fn send_test_notification(
    app_handle: tauri::AppHandle,
) -> CommandResult<notifications::NotificationTestResult> {
    notifications::send_test(&app_handle)
}

#[tauri::command(rename_all = "camelCase")]
fn schedule_reminder_acceptance_probe(
    app_handle: tauri::AppHandle,
    local_date: String,
    local_time: String,
    timezone: String,
) -> CommandResult<reminder_acceptance::ReminderAcceptanceProbe> {
    let app_dir = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "REMINDER_ACCEPTANCE_PROBE_FAILED",
            format!("failed to resolve Narro app-data directory for reminder acceptance: {error}"),
        )
    })?;
    let database_path = app_dir.join("narro.db");
    let now = chrono::Utc::now().to_rfc3339();

    reminder_acceptance::schedule_probe(&database_path, &local_date, &local_time, &timezone, &now)
        .map_err(|error| {
            CommandError::new(
                "REMINDER_ACCEPTANCE_PROBE_FAILED",
                format!("failed to persist reminder acceptance probe: {error}"),
            )
        })
}

#[tauri::command]
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
    shortcut_manager: State<'_, ShortcutManager>,
) -> CommandResult<ShortcutDiagnostics> {
    shortcut_manager.snapshot()
}

#[tauri::command]
fn global_shortcut_register(
    app_handle: tauri::AppHandle,
    shortcut_manager: State<'_, ShortcutManager>,
) -> CommandResult<ShortcutDiagnostics> {
    shortcuts::register_default(&app_handle, shortcut_manager.inner())
}

#[tauri::command]
fn global_focus_toggle_register(
    app_handle: tauri::AppHandle,
    shortcut_manager: State<'_, ShortcutManager>,
) -> CommandResult<ShortcutDiagnostics> {
    shortcuts::register_focus_toggle(&app_handle, shortcut_manager.inner())
}

#[tauri::command]
fn global_find_timer_register(
    app_handle: tauri::AppHandle,
    shortcut_manager: State<'_, ShortcutManager>,
) -> CommandResult<ShortcutDiagnostics> {
    shortcuts::register_find_timer(&app_handle, shortcut_manager.inner())
}

#[tauri::command]
fn global_shortcut_unregister(
    app_handle: tauri::AppHandle,
    shortcut_manager: State<'_, ShortcutManager>,
) -> CommandResult<ShortcutDiagnostics> {
    shortcuts::unregister_default(&app_handle, shortcut_manager.inner())
}

#[tauri::command]
fn global_shortcut_conflict_probe(
    app_handle: tauri::AppHandle,
    shortcut_manager: State<'_, ShortcutManager>,
) -> CommandResult<()> {
    shortcuts::conflict_probe(&app_handle, shortcut_manager.inner())
}

fn get_window(app_handle: &tauri::AppHandle, label: &str) -> CommandResult<tauri::WebviewWindow> {
    app_handle
        .get_webview_window(label)
        .ok_or_else(|| CommandError::window_not_found(label))
}

fn map_window_error(label: &str, operation: &str, error: impl Display) -> CommandError {
    CommandError::window_operation(label, operation, error)
}

fn show_and_focus(window: &tauri::WebviewWindow) -> CommandResult<()> {
    let label = window.label();
    window
        .show()
        .map_err(|error| map_window_error(label, "show", error))?;
    window
        .set_focus()
        .map_err(|error| map_window_error(label, "focus", error))?;
    Ok(())
}

fn enumerate_monitors(app_handle: &tauri::AppHandle) -> CommandResult<Vec<tauri::window::Monitor>> {
    let monitors = app_handle
        .available_monitors()
        .map_err(CommandError::monitor_enumeration)?;
    if monitors.is_empty() {
        return Err(CommandError::no_monitors_available());
    }
    Ok(monitors)
}

fn monitor_work_area(monitor: &tauri::window::Monitor) -> GeometryRect {
    let area = monitor.work_area();
    GeometryRect {
        position: GeometryPoint {
            x: area.position.x,
            y: area.position.y,
        },
        size: GeometrySize {
            width: area.size.width,
            height: area.size.height,
        },
    }
}

fn monitor_descriptor(
    index: usize,
    monitor: &tauri::window::Monitor,
) -> CommandResult<MonitorDescriptor> {
    let position = monitor.position();
    let size = monitor.size();
    let work_area = monitor_work_area(monitor);
    let scale_factor = monitor.scale_factor();

    if size.width == 0 || size.height == 0 {
        return Err(CommandError::invalid_monitor_descriptor(
            index,
            "monitor resolution has zero width or height",
        ));
    }
    if !scale_factor.is_finite() || scale_factor <= 0.0 {
        return Err(CommandError::invalid_monitor_descriptor(
            index,
            "scale factor must be positive and finite",
        ));
    }
    validate_work_area(work_area)
        .map_err(|error| CommandError::invalid_monitor_descriptor(index, error))?;

    let name = monitor.name().cloned();
    let key = format!(
        "{}|{}|{}|{}|{}|{}|{}|{}|{}|{:016x}",
        name.as_deref().unwrap_or_default(),
        position.x,
        position.y,
        size.width,
        size.height,
        work_area.position.x,
        work_area.position.y,
        work_area.size.width,
        work_area.size.height,
        scale_factor.to_bits(),
    );

    Ok(MonitorDescriptor {
        key,
        index,
        name,
        scale_factor,
        position: GeometryPoint {
            x: position.x,
            y: position.y,
        },
        size: GeometrySize {
            width: size.width,
            height: size.height,
        },
        work_area,
    })
}

fn resolve_monitor_by_key(
    app_handle: &tauri::AppHandle,
    monitor_key: &str,
) -> CommandResult<(tauri::window::Monitor, MonitorDescriptor)> {
    if monitor_key.is_empty() {
        return Err(CommandError::invalid_argument(
            "monitorKey",
            "must be non-empty",
        ));
    }
    if monitor_key.len() > MAX_MONITOR_KEY_LEN {
        return Err(CommandError::invalid_argument(
            "monitorKey",
            "exceeds the maximum supported length",
        ));
    }

    for (index, monitor) in enumerate_monitors(app_handle)?.into_iter().enumerate() {
        let descriptor = monitor_descriptor(index, &monitor)?;
        if descriptor.key == monitor_key {
            return Ok((monitor, descriptor));
        }
    }

    Err(CommandError::stale_monitor_selection())
}

#[tauri::command]
fn list_monitors(app_handle: tauri::AppHandle) -> CommandResult<Vec<MonitorDescriptor>> {
    enumerate_monitors(&app_handle)?
        .iter()
        .enumerate()
        .map(|(index, monitor)| monitor_descriptor(index, monitor))
        .collect()
}

fn load_focus_panel_placement_preferences(
    app_handle: &tauri::AppHandle,
) -> CommandResult<(Option<String>, FocusPanelSide)> {
    let app_dir = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "FOCUS_PANEL_PLACEMENT_FAILED",
            format!(
                "failed to resolve Narro app-data directory for Focus Panel placement: {error}"
            ),
        )
    })?;
    let connection = rusqlite::Connection::open(app_dir.join("narro.db")).map_err(|error| {
        CommandError::new(
            "FOCUS_PANEL_PLACEMENT_FAILED",
            format!("failed to open the Narro database for Focus Panel placement: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "FOCUS_PANEL_PLACEMENT_FAILED",
            format!("failed to configure the Narro database for Focus Panel placement: {error}"),
        )
    })?;
    let preferences = persistence::preferences::get_preferences(&connection)
        .map_err(|error| {
            CommandError::new(
                "FOCUS_PANEL_PLACEMENT_FAILED",
                format!("failed to read Focus Panel placement preferences: {error}"),
            )
        })?
        .map(|record| record.payload)
        .unwrap_or_default();
    let side = match preferences.general.focus_panel_side {
        domain::preferences::FocusPanelSide::Left => FocusPanelSide::Left,
        domain::preferences::FocusPanelSide::Right => FocusPanelSide::Right,
    };
    Ok((preferences.general.selected_monitor_key, side))
}

fn preferred_focus_panel_work_area(
    app_handle: &tauri::AppHandle,
) -> CommandResult<(GeometryRect, FocusPanelSide)> {
    let (selected_monitor_key, side) = load_focus_panel_placement_preferences(app_handle)?;
    let work_area = match selected_monitor_key {
        Some(monitor_key) => {
            resolve_monitor_by_key(app_handle, &monitor_key)?
                .1
                .work_area
        }
        None => {
            let monitor = app_handle
                .primary_monitor()
                .map_err(CommandError::monitor_enumeration)?
                .ok_or_else(CommandError::no_monitors_available)?;
            monitor_descriptor(0, &monitor)?.work_area
        }
    };
    Ok((work_area, side))
}

fn record_focus_surface_mode(mode: FocusSurfaceMode) {
    let mode_code = match mode {
        FocusSurfaceMode::Panel => FOCUS_SURFACE_MODE_PANEL,
        FocusSurfaceMode::Timer => FOCUS_SURFACE_MODE_TIMER,
    };
    FOCUS_SURFACE_MODE_STATE.store(mode_code, AtomicOrdering::Release);
}

fn current_focus_surface_mode() -> Option<FocusSurfaceMode> {
    match FOCUS_SURFACE_MODE_STATE.load(AtomicOrdering::Acquire) {
        FOCUS_SURFACE_MODE_PANEL => Some(FocusSurfaceMode::Panel),
        FOCUS_SURFACE_MODE_TIMER => Some(FocusSurfaceMode::Timer),
        _ => None,
    }
}

#[tauri::command]
fn focus_surface_mode_snapshot() -> Option<&'static str> {
    match current_focus_surface_mode() {
        Some(FocusSurfaceMode::Panel) => Some("panel"),
        Some(FocusSurfaceMode::Timer) => Some("timer"),
        None => None,
    }
}

fn apply_focus_surface_mode(
    window: &tauri::WebviewWindow,
    mode: FocusSurfaceMode,
) -> CommandResult<()> {
    let (width, height, always_on_top, skip_taskbar) = match mode {
        FocusSurfaceMode::Panel => (400.0, 700.0, false, false),
        FocusSurfaceMode::Timer => (340.0, 110.0, true, true),
    };

    window
        .set_size(tauri::Size::Logical(tauri::LogicalSize { width, height }))
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "resize", error))?;
    window
        .set_always_on_top(always_on_top)
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "set always-on-top", error))?;
    window
        .set_skip_taskbar(skip_taskbar)
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "set taskbar visibility", error))?;
    Ok(())
}

fn configure_focus_surface_mode_visibility(
    window: &tauri::WebviewWindow,
    mode: FocusSurfaceMode,
    reveal_after_configuration: bool,
) -> CommandResult<()> {
    let _placement_guard = floating_placement::suspend_saves();
    let previous_mode = current_focus_surface_mode();
    let was_visible = window
        .is_visible()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "read visibility", error))?;
    let previous_size = window.inner_size().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read size before mode transition",
            error,
        )
    })?;
    let previous_position = window.outer_position().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read position before mode transition",
            error,
        )
    })?;
    let previous_topmost = window.is_always_on_top().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read topmost state before mode transition",
            error,
        )
    })?;

    if was_visible {
        window.hide().map_err(|error| {
            map_window_error(FOCUS_SURFACE_LABEL, "hide for mode transition", error)
        })?;
    }

    let transition = (|| -> CommandResult<()> {
        apply_focus_surface_mode(window, mode)?;
        if mode == FocusSurfaceMode::Timer {
            floating_placement::restore_for_timer(window.app_handle(), window)?;
        }
        if reveal_after_configuration {
            window
                .show()
                .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "show", error))?;
        }
        Ok(())
    })();

    if let Err(error) = transition {
        let results = [
            window
                .set_size(tauri::Size::Physical(previous_size))
                .map_err(|failure| {
                    map_window_error(
                        FOCUS_SURFACE_LABEL,
                        "restore size after mode failure",
                        failure,
                    )
                }),
            window
                .set_position(tauri::Position::Physical(previous_position))
                .map_err(|failure| {
                    map_window_error(
                        FOCUS_SURFACE_LABEL,
                        "restore position after mode failure",
                        failure,
                    )
                }),
            window
                .set_always_on_top(previous_topmost)
                .map_err(|failure| {
                    map_window_error(
                        FOCUS_SURFACE_LABEL,
                        "restore topmost state after mode failure",
                        failure,
                    )
                }),
            window
                .set_skip_taskbar(previous_mode == Some(FocusSurfaceMode::Timer))
                .map_err(|failure| {
                    map_window_error(
                        FOCUS_SURFACE_LABEL,
                        "restore taskbar state after mode failure",
                        failure,
                    )
                }),
            if was_visible {
                window.show()
            } else {
                window.hide()
            }
            .map_err(|failure| {
                map_window_error(
                    FOCUS_SURFACE_LABEL,
                    "restore visibility after mode failure",
                    failure,
                )
            }),
        ];
        let failures: Vec<_> = results.into_iter().filter_map(Result::err).collect();
        if !failures.is_empty() {
            return Err(CommandError::new(
                "FOCUS_SURFACE_MODE_RECOVERY_FAILED",
                format!(
                    "{error}; rollback failed: {}",
                    failures
                        .iter()
                        .map(ToString::to_string)
                        .collect::<Vec<_>>()
                        .join("; ")
                ),
            ));
        }
        return Err(error);
    }

    if reveal_after_configuration {
        record_focus_surface_mode(mode);
    }
    Ok(())
}

fn configure_focus_surface_mode(
    window: &tauri::WebviewWindow,
    mode: FocusSurfaceMode,
) -> CommandResult<()> {
    configure_focus_surface_mode_visibility(window, mode, true)
}

fn prepare_focus_surface_mode(
    window: &tauri::WebviewWindow,
    mode: FocusSurfaceMode,
) -> CommandResult<()> {
    configure_focus_surface_mode_visibility(window, mode, false)
}

fn position_focus_panel_in_work_area(
    app_handle: &tauri::AppHandle,
    work_area: GeometryRect,
    side: FocusPanelSide,
    intent: FocusPanelPlacementIntent,
) -> CommandResult<()> {
    validate_work_area(work_area).map_err(CommandError::window_geometry)?;
    let presentation_transition = matches!(
        intent,
        FocusPanelPlacementIntent::Present | FocusPanelPlacementIntent::Prepare
    );
    let previous_mode = current_focus_surface_mode();
    if presentation_transition && previous_mode == Some(FocusSurfaceMode::Timer) {
        if let Err(error) = floating_placement::save_if_timer_visible(app_handle) {
            eprintln!("Could not save Floating Timer position before Panel return: {error}");
        }
    }
    let _placement_guard = presentation_transition.then(floating_placement::suspend_saves);
    let window = get_window(app_handle, FOCUS_SURFACE_LABEL)?;
    let recovery_snapshot = if presentation_transition {
        Some((
            window.inner_size().map_err(|error| {
                map_window_error(
                    FOCUS_SURFACE_LABEL,
                    "read size before Panel transition",
                    error,
                )
            })?,
            window
                .outer_position()
                .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "read position", error))?,
            window.is_always_on_top().map_err(|error| {
                map_window_error(
                    FOCUS_SURFACE_LABEL,
                    "read topmost state before Panel transition",
                    error,
                )
            })?,
            window
                .is_visible()
                .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "read visibility", error))?,
        ))
    } else {
        None
    };
    let hide_for_transition = recovery_snapshot
        .as_ref()
        .is_some_and(|(_, _, _, was_visible)| *was_visible);

    if hide_for_transition {
        window.hide().map_err(|error| {
            map_window_error(FOCUS_SURFACE_LABEL, "hide for panel transition", error)
        })?;
    }

    let placement_result = (|| -> CommandResult<()> {
        // Stage on the target monitor at the configured Panel edge rather than the raw
        // work-area origin. This still lets Windows/WebView2 resolve the target-monitor DPI
        // before logical resize, but if hide/show compositor latency exposes one frame, the
        // window is already on the correct edge instead of flashing on the opposite side.
        let staging_size = window
            .outer_size()
            .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "read staging size", error))?;
        let staging_position = focus_panel_edge_position(
            work_area,
            GeometrySize {
                width: staging_size.width,
                height: staging_size.height,
            },
            side,
        )
        .map_err(CommandError::window_geometry)?;

        window
            .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: staging_position.x,
                y: staging_position.y,
            }))
            .map_err(|error| {
                map_window_error(FOCUS_SURFACE_LABEL, "stage on target panel edge", error)
            })?;

        apply_focus_surface_mode(&window, FocusSurfaceMode::Panel)?;

        let window_size = window
            .outer_size()
            .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "read outer size", error))?;
        let final_position = focus_panel_edge_position(
            work_area,
            GeometrySize {
                width: window_size.width,
                height: window_size.height,
            },
            side,
        )
        .map_err(CommandError::window_geometry)?;

        window
            .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: final_position.x,
                y: final_position.y,
            }))
            .map_err(|error| {
                map_window_error(FOCUS_SURFACE_LABEL, "position at monitor edge", error)
            })?;

        Ok(())
    })();

    if let Err(error) = placement_result {
        if let Some((previous_size, previous_position, previous_topmost, was_visible)) =
            recovery_snapshot
        {
            let results = [
                window
                    .set_size(tauri::Size::Physical(previous_size))
                    .map_err(|failure| {
                        map_window_error(
                            FOCUS_SURFACE_LABEL,
                            "restore size after Panel transition failure",
                            failure,
                        )
                    }),
                window
                    .set_position(tauri::Position::Physical(previous_position))
                    .map_err(|failure| {
                        map_window_error(
                            FOCUS_SURFACE_LABEL,
                            "restore position after Panel transition failure",
                            failure,
                        )
                    }),
                window
                    .set_always_on_top(previous_topmost)
                    .map_err(|failure| {
                        map_window_error(
                            FOCUS_SURFACE_LABEL,
                            "restore topmost state after Panel transition failure",
                            failure,
                        )
                    }),
                window
                    .set_skip_taskbar(previous_mode == Some(FocusSurfaceMode::Timer))
                    .map_err(|failure| {
                        map_window_error(
                            FOCUS_SURFACE_LABEL,
                            "restore taskbar state after Panel transition failure",
                            failure,
                        )
                    }),
                if was_visible {
                    window.show()
                } else {
                    window.hide()
                }
                .map_err(|failure| {
                    map_window_error(
                        FOCUS_SURFACE_LABEL,
                        "restore visibility after Panel transition failure",
                        failure,
                    )
                }),
            ];
            let failures: Vec<_> = results.into_iter().filter_map(Result::err).collect();
            if !failures.is_empty() {
                return Err(CommandError::new(
                    "FOCUS_SURFACE_MODE_RECOVERY_FAILED",
                    format!(
                        "{error}; Panel rollback failed: {}",
                        failures
                            .iter()
                            .map(ToString::to_string)
                            .collect::<Vec<_>>()
                            .join("; ")
                    ),
                ));
            }
        }
        return Err(error);
    }

    if intent == FocusPanelPlacementIntent::Present {
        window
            .show()
            .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "show", error))?;
        record_focus_surface_mode(FocusSurfaceMode::Panel);
        window
            .set_focus()
            .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "focus", error))?;
    }
    Ok(())
}

#[tauri::command(rename_all = "camelCase")]
fn position_focus_panel(
    app_handle: tauri::AppHandle,
    monitor_key: String,
    side: FocusPanelSide,
) -> CommandResult<()> {
    let (_monitor, descriptor) = resolve_monitor_by_key(&app_handle, &monitor_key)?;
    position_focus_panel_in_work_area(
        &app_handle,
        descriptor.work_area,
        side,
        FocusPanelPlacementIntent::Present,
    )
}

#[tauri::command]
fn prepare_focus_panel(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let (work_area, side) = preferred_focus_panel_work_area(&app_handle)?;
    position_focus_panel_in_work_area(
        &app_handle,
        work_area,
        side,
        FocusPanelPlacementIntent::Prepare,
    )
}

#[tauri::command]
fn prewarm_focus_surface(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    focus_surface_prewarm::cloak(&window)?;
    if let Err(error) = window.show() {
        let show_error = map_window_error(FOCUS_SURFACE_LABEL, "show transparent prewarm", error);
        if let Err(cleanup_error) = focus_surface_prewarm::uncloak(&window) {
            return Err(CommandError::new(
                "FOCUS_SURFACE_PREWARM_RECOVERY_FAILED",
                format!("{show_error}; prewarm cleanup also failed: {cleanup_error}"),
            ));
        }
        return Err(show_error);
    }
    Ok(())
}

#[tauri::command]
fn begin_focus_visual_hold(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    focus_visual_hold::begin(&window)
}

#[tauri::command]
fn end_focus_visual_hold() -> CommandResult<()> {
    focus_visual_hold::end()
}

#[tauri::command]
fn clear_focus_surface_prewarm(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    focus_surface_prewarm::uncloak(&window)
}

#[tauri::command]
fn reveal_focus_panel(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    window
        .show()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "reveal Panel", error))?;
    focus_surface_prewarm::uncloak(&window)?;
    window
        .set_focus()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "focus revealed Panel", error))?;
    record_focus_surface_mode(FocusSurfaceMode::Panel);
    Ok(())
}

#[tauri::command]
fn present_focus_panel(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let (work_area, side) = preferred_focus_panel_work_area(&app_handle)?;
    position_focus_panel_in_work_area(
        &app_handle,
        work_area,
        side,
        FocusPanelPlacementIntent::Present,
    )
}

#[tauri::command]
fn prepare_floating_timer(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    prepare_focus_surface_mode(&window, FocusSurfaceMode::Timer)
}

#[tauri::command]
fn reveal_floating_timer(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    window
        .show()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "reveal Timer", error))?;
    focus_surface_prewarm::uncloak(&window)?;
    record_focus_surface_mode(FocusSurfaceMode::Timer);
    Ok(())
}

#[tauri::command]
fn present_floating_timer(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    configure_focus_surface_mode(&window, FocusSurfaceMode::Timer)
}

fn restore_floating_timer_after_failed_resize(
    window: &tauri::WebviewWindow,
    previous_size: tauri::PhysicalSize<u32>,
    previous_position: tauri::PhysicalPosition<i32>,
    was_visible: bool,
) -> CommandResult<()> {
    let size_result = window
        .set_size(tauri::Size::Physical(previous_size))
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "restore Timer size", error));
    let position_result = window
        .set_position(tauri::Position::Physical(previous_position))
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "restore Timer position", error));
    let visibility_result = if was_visible {
        window.show().map_err(|error| {
            map_window_error(FOCUS_SURFACE_LABEL, "restore Timer visibility", error)
        })
    } else {
        Ok(())
    };

    let errors: Vec<_> = [size_result, position_result, visibility_result]
        .into_iter()
        .filter_map(Result::err)
        .collect();
    if errors.is_empty() {
        Ok(())
    } else {
        Err(CommandError::new(
            "FLOATING_TIMER_RESIZE_RECOVERY_FAILED",
            errors
                .iter()
                .map(ToString::to_string)
                .collect::<Vec<_>>()
                .join("; "),
        ))
    }
}

#[tauri::command(rename_all = "camelCase")]
fn set_floating_timer_expanded(app_handle: tauri::AppHandle, expanded: bool) -> CommandResult<()> {
    if current_focus_surface_mode() != Some(FocusSurfaceMode::Timer) {
        return Err(CommandError::new(
            "FOCUS_SURFACE_MODE_CONFLICT",
            "Floating Timer expansion is available only while the focus surface is in Timer mode",
        ));
    }

    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    let was_visible = window.is_visible().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read Timer visibility before resize",
            error,
        )
    })?;
    let previous_size = window.inner_size().map_err(|error| {
        map_window_error(FOCUS_SURFACE_LABEL, "read Timer size before resize", error)
    })?;
    let previous_position = window.outer_position().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read Timer position before resize",
            error,
        )
    })?;
    let previous_outer_size = window.outer_size().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read Timer outer size before resize",
            error,
        )
    })?;
    let previous_window = GeometryRect {
        position: GeometryPoint {
            x: previous_position.x,
            y: previous_position.y,
        },
        size: GeometrySize {
            width: previous_outer_size.width,
            height: previous_outer_size.height,
        },
    };

    if was_visible {
        window.hide().map_err(|error| {
            map_window_error(FOCUS_SURFACE_LABEL, "hide Timer for resize", error)
        })?;
    }

    let height = if expanded { 300.0 } else { 110.0 };
    let resize_result = window
        .set_size(tauri::Size::Logical(tauri::LogicalSize {
            width: 340.0,
            height,
        }))
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "resize expanded Timer", error));

    if let Err(error) = resize_result {
        if let Err(recovery_error) = restore_floating_timer_after_failed_resize(
            &window,
            previous_size,
            previous_position,
            was_visible,
        ) {
            return Err(CommandError::new(
                "FLOATING_TIMER_RESIZE_RECOVERY_FAILED",
                format!("{error}; recovery failed: {recovery_error}"),
            ));
        }
        return Err(error);
    }

    if let Err(error) =
        floating_placement::keep_resized_timer_in_work_area(&app_handle, &window, previous_window)
    {
        if let Err(recovery_error) = restore_floating_timer_after_failed_resize(
            &window,
            previous_size,
            previous_position,
            was_visible,
        ) {
            return Err(CommandError::new(
                "FLOATING_TIMER_RESIZE_RECOVERY_FAILED",
                format!("{error}; recovery failed: {recovery_error}"),
            ));
        }
        return Err(error);
    }

    if was_visible {
        if let Err(error) = window.show().map_err(|error| {
            map_window_error(FOCUS_SURFACE_LABEL, "show Timer after resize", error)
        }) {
            if let Err(recovery_error) = restore_floating_timer_after_failed_resize(
                &window,
                previous_size,
                previous_position,
                was_visible,
            ) {
                return Err(CommandError::new(
                    "FLOATING_TIMER_RESIZE_RECOVERY_FAILED",
                    format!("{error}; recovery failed: {recovery_error}"),
                ));
            }
            return Err(error);
        }
    }

    Ok(())
}

pub(crate) fn revalidate_open_focus_panel_after_display_change(
    app_handle: &tauri::AppHandle,
) -> CommandResult<bool> {
    if current_focus_surface_mode() != Some(FocusSurfaceMode::Panel) {
        return Ok(false);
    }

    let window = get_window(app_handle, FOCUS_SURFACE_LABEL)?;
    let visible = window
        .is_visible()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "read visibility", error))?;
    if !visible {
        return Ok(false);
    }

    let (work_area, side) = preferred_focus_panel_work_area(app_handle)?;
    position_focus_panel_in_work_area(
        app_handle,
        work_area,
        side,
        FocusPanelPlacementIntent::Revalidate,
    )?;
    Ok(true)
}

fn build_main_window(app_handle: &tauri::AppHandle) -> CommandResult<tauri::WebviewWindow> {
    tauri::WebviewWindowBuilder::new(
        app_handle,
        MAIN_WINDOW_LABEL,
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("Narro Main")
    .inner_size(800.0, 600.0)
    .build()
    .map_err(|error| map_window_error(MAIN_WINDOW_LABEL, "create", error))
}

async fn show_or_recreate_main(app_handle: tauri::AppHandle) -> CommandResult<()> {
    if let Some(window) = app_handle.get_webview_window(MAIN_WINDOW_LABEL) {
        return show_and_focus(&window);
    }

    let window = build_main_window(&app_handle)?;
    window
        .set_focus()
        .map_err(|error| map_window_error(MAIN_WINDOW_LABEL, "focus", error))?;
    Ok(())
}

pub(crate) fn request_show_or_recreate_main(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        if let Err(error) = show_or_recreate_main(app_handle).await {
            eprintln!("Failed to show or recreate Narro main window: {error}");
        }
    });
}

#[tauri::command]
async fn focus_surface_exit_to_main(app_handle: tauri::AppHandle) -> CommandResult<()> {
    show_or_recreate_main(app_handle.clone()).await?;
    focus_surface_hide(app_handle)
}

#[tauri::command]
fn main_window_show(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, MAIN_WINDOW_LABEL)?;
    window
        .show()
        .map_err(|error| map_window_error(MAIN_WINDOW_LABEL, "show", error))
}

#[tauri::command]
fn main_window_hide(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, MAIN_WINDOW_LABEL)?;
    window
        .hide()
        .map_err(|error| map_window_error(MAIN_WINDOW_LABEL, "hide", error))
}

#[tauri::command]
fn main_window_focus(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, MAIN_WINDOW_LABEL)?;
    window
        .set_focus()
        .map_err(|error| map_window_error(MAIN_WINDOW_LABEL, "focus", error))
}

#[tauri::command]
fn main_window_destroy(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, MAIN_WINDOW_LABEL)?;
    window
        .destroy()
        .map_err(|error| map_window_error(MAIN_WINDOW_LABEL, "destroy", error))
}

#[tauri::command]
fn main_window_close(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, MAIN_WINDOW_LABEL)?;
    window
        .close()
        .map_err(|error| map_window_error(MAIN_WINDOW_LABEL, "close", error))
}

#[tauri::command]
async fn main_window_recreate(app_handle: tauri::AppHandle) -> CommandResult<()> {
    if app_handle.get_webview_window(MAIN_WINDOW_LABEL).is_some() {
        return Err(CommandError::window_already_exists(MAIN_WINDOW_LABEL));
    }

    let window = build_main_window(&app_handle)?;
    window
        .set_focus()
        .map_err(|error| map_window_error(MAIN_WINDOW_LABEL, "focus", error))?;
    Ok(())
}

#[tauri::command]
fn focus_surface_show(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    window
        .show()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "show", error))
}

#[tauri::command]
fn focus_surface_hide(app_handle: tauri::AppHandle) -> CommandResult<()> {
    if let Err(error) = floating_placement::save_if_timer_visible(&app_handle) {
        eprintln!("Could not save Floating Timer position before hide: {error}");
    }
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    window
        .hide()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "hide", error))
}

#[tauri::command]
fn focus_surface_focus(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    window
        .set_focus()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "focus", error))
}

#[tauri::command]
fn focus_surface_mode_panel(app_handle: tauri::AppHandle) -> CommandResult<()> {
    if let Err(error) = floating_placement::save_if_timer_visible(&app_handle) {
        eprintln!("Could not save Floating Timer position before Panel mode: {error}");
    }
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    configure_focus_surface_mode(&window, FocusSurfaceMode::Panel)
}

#[tauri::command]
fn focus_surface_mode_timer(app_handle: tauri::AppHandle) -> CommandResult<()> {
    present_floating_timer(app_handle)
}

#[tauri::command]
fn list_windows(app_handle: tauri::AppHandle) -> Vec<String> {
    let mut labels: Vec<_> = app_handle.webview_windows().keys().cloned().collect();
    labels.sort_unstable();
    labels
}

fn install_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let show_main = MenuItem::with_id(app, "show-main", "Show Narro", true, None::<&str>)?;
    let show_focus =
        MenuItem::with_id(app, "show-focus", "Show Focus Surface", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Narro", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_main, &show_focus, &quit])?;

    TrayIconBuilder::with_id("narro-tray")
        .icon(tauri::include_image!("./icons/narro-tray-64.png"))
        .tooltip("Narro")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app_handle, event| {
            if event.id() == "show-main" {
                request_show_or_recreate_main(app_handle.clone());
            } else if event.id() == "show-focus" {
                match get_window(app_handle, FOCUS_SURFACE_LABEL) {
                    Ok(window) => {
                        if let Err(error) = show_and_focus(&window) {
                            eprintln!("Failed to show Narro focus surface: {error}");
                        }
                    }
                    Err(error) => eprintln!("Failed to show Narro focus surface: {error}"),
                }
            } else if event.id() == "quit" {
                if let Err(error) = floating_placement::save_if_timer_visible(app_handle) {
                    eprintln!("Could not save Floating Timer position before exit: {error}");
                }
                app_handle.exit(0);
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                request_show_or_recreate_main(tray.app_handle().clone());
            }
        })
        .build(app)?;

    Ok(())
}

fn startup_error(context: &str, source: impl Display) -> std::io::Error {
    std::io::Error::other(format!("{context}: {source}"))
}

fn initialize_persistence(
    app: &tauri::App,
) -> Result<rusqlite::Connection, Box<dyn std::error::Error>> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| startup_error("resolve app data directory", error))?;
    std::fs::create_dir_all(&app_dir)
        .map_err(|error| startup_error("create app data directory", error))?;

    let db_path = app_dir.join("narro.db");
    let mut connection = rusqlite::Connection::open(&db_path)
        .map_err(|error| startup_error("open Narro SQLite database", error))?;
    persistence::run_migrations(&mut connection)
        .map_err(|error| startup_error("run Narro database migrations", error))?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    connection
        .execute(
            "INSERT INTO _diagnostic_startup (id, started_at) VALUES (?1, ?2)",
            rusqlite::params![id, now],
        )
        .map_err(|error| startup_error("write diagnostic startup record", error))?;

    println!("SQLite migration and diagnostic startup insert succeeded. ID: {id}");
    Ok(connection)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let result = tauri::Builder::default()
        .on_window_event(|window, event| {
            if window.label() == FOCUS_SURFACE_LABEL {
                match event {
                    tauri::WindowEvent::Moved(_) => {
                        floating_placement::note_timer_moved(window.app_handle());
                    }
                    tauri::WindowEvent::CloseRequested { .. } => {
                        if let Err(error) =
                            floating_placement::save_if_timer_visible(window.app_handle())
                        {
                            eprintln!(
                                "Could not save Floating Timer position before close: {error}"
                            );
                        }
                    }
                    _ => {}
                }
            }
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .manage(AppState::new())
        .manage(ShortcutManager::new())
        .invoke_handler(tauri::generate_handler![
            get_state,
            get_home_snapshot,
            focus_entry::start_blitz,
            focus_preferences::get_focus_scrolling_title_preference,
            list_board::get_list_board_snapshot,
            board_task_editor::create_list_board_task,
            board_task_editor::update_list_board_task_title,
            board_task_metrics::update_list_board_task_estimate,
            board_task_metrics::update_list_board_task_time_taken,
            board_task_schedule::get_list_board_task_schedule_editor,
            board_task_schedule::resolve_list_board_schedule_shortcut,
            board_task_schedule::update_list_board_task_schedule,
            board_task_schedule::save_list_board_task_recurrence,
            board_task_schedule::remove_list_board_task_recurrence,
            board_task_notes::get_list_board_task_note,
            board_task_notes::save_list_board_task_note,
            board_task_notes::delete_list_board_task_note,
            board_task_subtasks::get_list_board_task_subtasks,
            board_task_subtasks::create_list_board_subtask,
            board_task_subtasks::update_list_board_subtask_title,
            board_task_subtasks::set_list_board_subtask_completion,
            board_task_subtasks::reorder_list_board_subtasks,
            board_task_subtasks::delete_list_board_subtask,
            board_task_mutation::reorder_list_board_task,
            board_task_mutation::move_list_board_task,
            board_task_mutation::complete_list_board_task,
            board_task_mutation::permanently_delete_list_board_task,
            list_editor::create_list_from_editor,
            list_editor::update_list_from_editor,
            list_editor::duplicate_list_from_home,
            list_editor::get_list_icon_asset,
            list_settings::get_archived_lists_for_settings,
            list_settings::archive_list_from_settings,
            list_settings::restore_list_from_settings,
            list_settings::permanently_delete_list_from_settings,
            theme_settings::get_theme_preference,
            theme_settings::set_theme_preference,
            toggle_timer,
            mutate_state,
            send_test_notification,
            schedule_reminder_acceptance_probe,
            autostart_status,
            autostart_enable,
            autostart_disable,
            global_shortcut_status,
            global_shortcut_register,
            global_focus_toggle_register,
            global_find_timer_register,
            global_shortcut_unregister,
            global_shortcut_conflict_probe,
            shortcut_settings::get_global_shortcut_settings,
            shortcut_settings::set_global_shortcut_enabled,
            timer_session_snapshot,
            timer_start_task,
            timer_pause,
            timer_resume,
            timer_extend,
            timer_start_manual_break,
            timer_finish_break,
            timer_skip_break,
            timer_complete_task,
            timer_skip_task,
            timer_switch_task,
            timer_set_estimate,
            timer_set_time_taken,
            focus_surface_exit_to_main,
            main_window_show,
            main_window_hide,
            main_window_focus,
            main_window_destroy,
            main_window_close,
            main_window_recreate,
            focus_surface_show,
            focus_surface_hide,
            focus_surface_focus,
            focus_surface_mode_snapshot,
            focus_surface_mode_panel,
            focus_surface_mode_timer,
            prepare_floating_timer,
            prewarm_focus_surface,
            begin_focus_visual_hold,
            end_focus_visual_hold,
            clear_focus_surface_prewarm,
            reveal_floating_timer,
            present_floating_timer,
            set_floating_timer_expanded,
            list_windows,
            list_monitors,
            position_focus_panel,
            prepare_focus_panel,
            reveal_focus_panel,
            present_focus_panel
        ])
        .setup(|app| {
            install_tray(app)?;
            let mut connection = initialize_persistence(app)?;
            let shortcut_preferences = shortcut_settings::load_from_connection(
                &mut connection,
                &chrono::Utc::now().to_rfc3339(),
            )
            .map_err(|error| startup_error("load global shortcut preferences", error))?;
            let background_database_path = connection
                .path()
                .filter(|path| !path.is_empty())
                .map(std::path::PathBuf::from)
                .ok_or_else(|| {
                    startup_error(
                        "resolve background runtime database path",
                        "SQLite connection has no durable path",
                    )
                })?;
            let timer_service = TimerService::recover(connection)
                .map_err(|error| startup_error("recover authoritative timer runtime", error))?;
            app.manage(timer_service);
            recurrence_service::install_background_orchestration(background_database_path.clone())
                .map_err(|error| startup_error("start recurrence orchestration runtime", error))?;
            reminder_service::install_background_delivery(
                app.handle().clone(),
                background_database_path,
            )
            .map_err(|error| startup_error("start reminder delivery runtime", error))?;
            timer_service::install_background_advance(app.handle().clone());
            #[cfg(windows)]
            windows::install_display_change_observer(app)
                .map_err(|error| startup_error("install display topology observer", error))?;
            shortcuts::install(app, &shortcut_preferences);
            Ok(())
        })
        .run(tauri::generate_context!());

    if let Err(error) = result {
        eprintln!("Fatal Narro runtime error: {error}");
        std::process::exit(1);
    }
}
