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
pub mod preference_settings;
pub mod recurrence;
pub mod recurrence_service;
pub mod reminder_acceptance;
pub mod reminder_service;
pub mod scheduling;
pub mod shortcut_settings;
pub mod shortcuts;
pub mod theme_settings;
pub mod timer;
pub mod timer_region;
pub mod timer_service;
pub mod windows;

use domain::{AppState, AppStatePayload};
use error::{CommandError, CommandResult};
use shortcuts::{ShortcutDiagnostics, ShortcutManager};
use std::fmt::Display;
use std::sync::atomic::{AtomicBool, AtomicU8, Ordering as AtomicOrdering};
use std::sync::{Mutex, MutexGuard};
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
const FOCUS_SURFACE_PRESENTATION_CHANGED_EVENT: &str = "focus-surface-presentation-changed";
const MAX_MONITOR_KEY_LEN: usize = 2048;
const FOCUS_SURFACE_MODE_UNKNOWN: u8 = 0;
const FOCUS_SURFACE_MODE_PANEL: u8 = 1;
const FOCUS_SURFACE_MODE_TIMER: u8 = 2;

static FOCUS_SURFACE_MODE_STATE: AtomicU8 = AtomicU8::new(FOCUS_SURFACE_MODE_UNKNOWN);
static FLOATING_TIMER_EXPANDED: AtomicBool = AtomicBool::new(false);
static COMPACT_TIMER_ORIGIN: Mutex<Option<GeometryPoint>> = Mutex::new(None);
static FOCUS_PRESENTATION_GATE: Mutex<()> = Mutex::new(());

fn presentation_guard() -> CommandResult<MutexGuard<'static, ()>> {
    FOCUS_PRESENTATION_GATE.lock().map_err(|_| {
        CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            "Focus presentation gate is poisoned",
        )
    })
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum FocusSurfaceMode {
    Panel,
    Timer,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum FocusSurfacePresentation {
    Panel,
    TimerCompact,
    TimerExpanded,
}

impl FocusSurfacePresentation {
    fn mode(self) -> FocusSurfaceMode {
        match self {
            Self::Panel => FocusSurfaceMode::Panel,
            Self::TimerCompact | Self::TimerExpanded => FocusSurfaceMode::Timer,
        }
    }

    fn expanded(self) -> bool {
        matches!(self, Self::TimerExpanded)
    }

    fn event_name(self) -> &'static str {
        match self {
            Self::Panel => "panel",
            Self::TimerCompact => "timerCompact",
            Self::TimerExpanded => "timerExpanded",
        }
    }

    fn region(self) -> tauri::LogicalSize<f64> {
        match self {
            Self::Panel => timer_region::panel_logical_size(),
            Self::TimerCompact => timer_region::timer_logical_size(false),
            Self::TimerExpanded => timer_region::timer_logical_size(true),
        }
    }
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

fn record_focus_surface_presentation(presentation: FocusSurfacePresentation) {
    let mode_code = match presentation.mode() {
        FocusSurfaceMode::Panel => FOCUS_SURFACE_MODE_PANEL,
        FocusSurfaceMode::Timer => FOCUS_SURFACE_MODE_TIMER,
    };
    FOCUS_SURFACE_MODE_STATE.store(mode_code, AtomicOrdering::Release);
    FLOATING_TIMER_EXPANDED.store(presentation.expanded(), AtomicOrdering::Release);
}

pub(crate) fn current_focus_surface_mode() -> Option<FocusSurfaceMode> {
    match FOCUS_SURFACE_MODE_STATE.load(AtomicOrdering::Acquire) {
        FOCUS_SURFACE_MODE_PANEL => Some(FocusSurfaceMode::Panel),
        FOCUS_SURFACE_MODE_TIMER => Some(FocusSurfaceMode::Timer),
        _ => None,
    }
}

fn current_focus_surface_presentation() -> Option<FocusSurfacePresentation> {
    match current_focus_surface_mode() {
        Some(FocusSurfaceMode::Panel) => Some(FocusSurfacePresentation::Panel),
        Some(FocusSurfaceMode::Timer) => Some(if FLOATING_TIMER_EXPANDED.load(AtomicOrdering::Acquire) {
            FocusSurfacePresentation::TimerExpanded
        } else {
            FocusSurfacePresentation::TimerCompact
        }),
        None => None,
    }
}

fn parse_focus_surface_presentation(value: &str) -> CommandResult<FocusSurfacePresentation> {
    match value {
        "panel" => Ok(FocusSurfacePresentation::Panel),
        "timerCompact" => Ok(FocusSurfacePresentation::TimerCompact),
        "timerExpanded" => Ok(FocusSurfacePresentation::TimerExpanded),
        _ => Err(CommandError::new(
            "FOCUS_PRESENTATION_INVALID",
            format!("unsupported Focus presentation: {value}"),
        )),
    }
}

fn announce_focus_surface_presentation(
    app_handle: &tauri::AppHandle,
    presentation: FocusSurfacePresentation,
) {
    record_focus_surface_presentation(presentation);
    if let Err(error) = app_handle.emit(
        FOCUS_SURFACE_PRESENTATION_CHANGED_EVENT,
        presentation.event_name(),
    ) {
        eprintln!(
            "Focus presentation {} committed, but broadcast failed: {error}",
            presentation.event_name()
        );
    }
}

#[tauri::command]
fn focus_surface_presentation_snapshot() -> Option<&'static str> {
    current_focus_surface_presentation().map(FocusSurfacePresentation::event_name)
}

#[tauri::command]
fn focus_surface_mode_snapshot() -> Option<&'static str> {
    current_focus_surface_mode().map(|mode| match mode {
        FocusSurfaceMode::Panel => "panel",
        FocusSurfaceMode::Timer => "timer",
    })
}

#[derive(Debug, Clone)]
struct FocusNativeSnapshot {
    presentation: FocusSurfacePresentation,
    position: tauri::PhysicalPosition<i32>,
    size: tauri::PhysicalSize<u32>,
    always_on_top: bool,
    compact_origin: Option<GeometryPoint>,
}

fn capture_focus_native_snapshot(window: &tauri::WebviewWindow) -> CommandResult<FocusNativeSnapshot> {
    let position = window.outer_position().map_err(|error| {
        map_window_error(FOCUS_SURFACE_LABEL, "read position before presentation change", error)
    })?;
    let size = window.inner_size().map_err(|error| {
        map_window_error(FOCUS_SURFACE_LABEL, "read size before presentation change", error)
    })?;
    let always_on_top = window.is_always_on_top().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read topmost state before presentation change",
            error,
        )
    })?;
    let compact_origin = *COMPACT_TIMER_ORIGIN.lock().map_err(|_| {
        CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            "Focus compact-position state is poisoned",
        )
    })?;
    Ok(FocusNativeSnapshot {
        presentation: current_focus_surface_presentation().unwrap_or(FocusSurfacePresentation::Panel),
        position,
        size,
        always_on_top,
        compact_origin,
    })
}

fn set_focus_position(
    window: &tauri::WebviewWindow,
    point: GeometryPoint,
    context: &'static str,
) -> CommandResult<()> {
    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: point.x,
            y: point.y,
        }))
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, context, error))
}

fn set_focus_presentation_attributes(
    window: &tauri::WebviewWindow,
    presentation: FocusSurfacePresentation,
) -> CommandResult<()> {
    let timer = presentation.mode() == FocusSurfaceMode::Timer;
    window
        .set_always_on_top(timer)
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "set always-on-top", error))?;
    window
        .set_skip_taskbar(timer)
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "set taskbar visibility", error))
}

fn restore_focus_native_snapshot(
    window: &tauri::WebviewWindow,
    snapshot: &FocusNativeSnapshot,
) -> CommandResult<()> {
    let mut failures = Vec::new();

    if let Err(error) = window
        .set_size(tauri::Size::Physical(snapshot.size))
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "restore host size", error))
    {
        failures.push(error);
    }
    if let Err(error) = window
        .set_position(tauri::Position::Physical(snapshot.position))
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "restore position", error))
    {
        failures.push(error);
    }
    if let Err(error) = timer_region::apply(window, snapshot.presentation.region()) {
        failures.push(error);
    }
    if let Err(error) = window
        .set_always_on_top(snapshot.always_on_top)
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "restore topmost state", error))
    {
        failures.push(error);
    }
    if let Err(error) = window
        .set_skip_taskbar(snapshot.presentation.mode() == FocusSurfaceMode::Timer)
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "restore taskbar state", error))
    {
        failures.push(error);
    }
    if let Ok(mut origin) = COMPACT_TIMER_ORIGIN.lock() {
        *origin = snapshot.compact_origin;
    } else {
        failures.push(CommandError::new(
            "FOCUS_PRESENTATION_RECOVERY_FAILED",
            "Focus compact-position state is poisoned during rollback",
        ));
    }

    if failures.is_empty() {
        Ok(())
    } else {
        Err(CommandError::new(
            "FOCUS_PRESENTATION_RECOVERY_FAILED",
            failures
                .iter()
                .map(ToString::to_string)
                .collect::<Vec<_>>()
                .join("; "),
        ))
    }
}

fn fit_focus_host_on_current_monitor(
    window: &tauri::WebviewWindow,
    work_area: GeometryRect,
) -> CommandResult<GeometrySize> {
    validate_work_area(work_area).map_err(CommandError::window_geometry)?;
    floating_placement::ensure_fixed_focus_host_size(window)?;

    let outer = window.outer_size().map_err(|error| {
        map_window_error(FOCUS_SURFACE_LABEL, "read Focus host size", error)
    })?;
    let fitted = GeometrySize {
        width: outer.width.min(work_area.size.width),
        height: outer.height.min(work_area.size.height),
    };
    if fitted.width == 0 || fitted.height == 0 {
        return Err(CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            "selected monitor has no usable work area for the Focus surface",
        ));
    }
    if fitted.width != outer.width || fitted.height != outer.height {
        window
            .set_size(tauri::Size::Physical(tauri::PhysicalSize {
                width: fitted.width,
                height: fitted.height,
            }))
            .map_err(|error| {
                map_window_error(
                    FOCUS_SURFACE_LABEL,
                    "fit Focus host to constrained work area",
                    error,
                )
            })?;
    }
    let actual = window.outer_size().map_err(|error| {
        map_window_error(FOCUS_SURFACE_LABEL, "confirm Focus host size", error)
    })?;
    if actual.width > work_area.size.width || actual.height > work_area.size.height {
        return Err(CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            "Focus host remained larger than the selected monitor work area",
        ));
    }
    Ok(GeometrySize {
        width: actual.width,
        height: actual.height,
    })
}

fn apply_panel_native(
    window: &tauri::WebviewWindow,
    work_area: GeometryRect,
    side: FocusPanelSide,
) -> CommandResult<()> {
    validate_work_area(work_area).map_err(CommandError::window_geometry)?;

    // Moving the fixed host onto the target monitor first lets WebView2/Windows
    // adopt that monitor's DPI before the exceptional host-size correction.
    let current = window.outer_size().map_err(|error| {
        map_window_error(FOCUS_SURFACE_LABEL, "read Focus host staging size", error)
    })?;
    let staging_size = GeometrySize {
        width: current.width.min(work_area.size.width),
        height: current.height.min(work_area.size.height),
    };
    let staging = focus_panel_edge_position(work_area, staging_size, side)
        .map_err(CommandError::window_geometry)?;
    set_focus_position(window, staging, "stage Focus Panel on target monitor")?;

    let actual_size = fit_focus_host_on_current_monitor(window, work_area)?;
    let final_position = focus_panel_edge_position(work_area, actual_size, side)
        .map_err(CommandError::window_geometry)?;
    set_focus_position(window, final_position, "position Focus Panel at monitor edge")?;
    timer_region::apply(window, timer_region::panel_logical_size())?;
    set_focus_presentation_attributes(window, FocusSurfacePresentation::Panel)
}

fn apply_timer_native(
    app_handle: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
    previous: FocusSurfacePresentation,
    target: FocusSurfacePresentation,
) -> CommandResult<()> {
    let expanded = target.expanded();

    if previous.mode() != FocusSurfaceMode::Timer {
        floating_placement::restore_for_timer(app_handle, window, expanded)?;
        timer_region::apply(window, target.region())?;
        *COMPACT_TIMER_ORIGIN.lock().map_err(|_| {
            CommandError::new(
                "FOCUS_PRESENTATION_FAILED",
                "Focus compact-position state is poisoned",
            )
        })? = None;
        return set_focus_presentation_attributes(window, target);
    }

    if previous.expanded() != expanded {
        let previous_position = window.outer_position().map_err(|error| {
            map_window_error(
                FOCUS_SURFACE_LABEL,
                "read Timer position before region change",
                error,
            )
        })?;
        let previous_point = GeometryPoint {
            x: previous_position.x,
            y: previous_position.y,
        };
        let compact_origin = *COMPACT_TIMER_ORIGIN.lock().map_err(|_| {
            CommandError::new(
                "FOCUS_PRESENTATION_FAILED",
                "Focus compact-position state is poisoned",
            )
        })?;
        let desired = floating_placement::safe_position_for_timer_region(
            app_handle,
            window,
            expanded,
            if expanded { None } else { compact_origin },
        )?;

        if expanded {
            // Move the still-compact visible rectangle first, then reveal the
            // prepainted lower controls.
            set_focus_position(window, desired, "move Timer before expanded region")?;
            timer_region::apply(window, target.region())?;
            *COMPACT_TIMER_ORIGIN.lock().map_err(|_| {
                CommandError::new(
                    "FOCUS_PRESENTATION_FAILED",
                    "Focus compact-position state is poisoned",
                )
            })? = Some(previous_point);
        } else {
            // Clip first so no expanded pixels are exposed while returning to
            // the compact origin.
            timer_region::apply(window, target.region())?;
            set_focus_position(window, desired, "restore compact Timer position")?;
            *COMPACT_TIMER_ORIGIN.lock().map_err(|_| {
                CommandError::new(
                    "FOCUS_PRESENTATION_FAILED",
                    "Focus compact-position state is poisoned",
                )
            })? = None;
        }
    } else {
        timer_region::apply(window, target.region())?;
    }

    set_focus_presentation_attributes(window, target)
}

fn apply_focus_surface_presentation_internal(
    app_handle: &tauri::AppHandle,
    target: FocusSurfacePresentation,
) -> CommandResult<()> {
    let _presentation_guard = presentation_guard()?;
    let window = get_window(app_handle, FOCUS_SURFACE_LABEL)?;
    let previous = current_focus_surface_presentation().unwrap_or(FocusSurfacePresentation::Panel);

    if previous == target {
        return Ok(());
    }

    let snapshot = capture_focus_native_snapshot(&window)?;
    let _save_guard = floating_placement::suspend_saves();

    if previous.mode() == FocusSurfaceMode::Timer && target == FocusSurfacePresentation::Panel {
        if let Err(error) = floating_placement::save_if_timer_visible(app_handle) {
            eprintln!("Could not save Floating Timer position before Panel return: {error}");
        }
    }

    let transition = match target {
        FocusSurfacePresentation::Panel => {
            let (work_area, side) = preferred_focus_panel_work_area(app_handle)?;
            apply_panel_native(&window, work_area, side)
        }
        FocusSurfacePresentation::TimerCompact | FocusSurfacePresentation::TimerExpanded => {
            apply_timer_native(app_handle, &window, previous, target)
        }
    };

    if let Err(error) = transition {
        return match restore_focus_native_snapshot(&window, &snapshot) {
            Ok(()) => Err(error),
            Err(recovery) => Err(CommandError::new(
                "FOCUS_PRESENTATION_RECOVERY_FAILED",
                format!("{error}; rollback failed: {recovery}"),
            )),
        };
    }

    announce_focus_surface_presentation(app_handle, target);
    Ok(())
}

#[tauri::command(rename_all = "camelCase")]
fn focus_surface_apply_presentation(
    app_handle: tauri::AppHandle,
    presentation: String,
) -> CommandResult<()> {
    let target = parse_focus_surface_presentation(&presentation)?;
    apply_focus_surface_presentation_internal(&app_handle, target)
}

#[tauri::command(rename_all = "camelCase")]
fn position_focus_panel(
    app_handle: tauri::AppHandle,
    monitor_key: String,
    side: FocusPanelSide,
) -> CommandResult<()> {
    let _presentation_guard = presentation_guard()?;
    let (_monitor, descriptor) = resolve_monitor_by_key(&app_handle, &monitor_key)?;
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    let snapshot = capture_focus_native_snapshot(&window)?;

    if current_focus_surface_mode() == Some(FocusSurfaceMode::Timer) {
        if let Err(error) = floating_placement::save_if_timer_visible(&app_handle) {
            eprintln!("Could not save Floating Timer position before Panel placement: {error}");
        }
    }

    if let Err(error) = apply_panel_native(&window, descriptor.work_area, side) {
        return match restore_focus_native_snapshot(&window, &snapshot) {
            Ok(()) => Err(error),
            Err(recovery) => Err(CommandError::new(
                "FOCUS_PRESENTATION_RECOVERY_FAILED",
                format!("{error}; rollback failed: {recovery}"),
            )),
        };
    }

    announce_focus_surface_presentation(&app_handle, FocusSurfacePresentation::Panel);
    Ok(())
}

#[tauri::command]
fn present_focus_panel(app_handle: tauri::AppHandle) -> CommandResult<()> {
    apply_focus_surface_presentation_internal(&app_handle, FocusSurfacePresentation::Panel)?;
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    window
        .show()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "show Focus Panel", error))?;
    window
        .set_focus()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "focus Focus Panel", error))
}

pub(crate) fn revalidate_open_focus_panel_after_display_change(
    app_handle: &tauri::AppHandle,
) -> CommandResult<bool> {
    if current_focus_surface_mode() != Some(FocusSurfaceMode::Panel) {
        return Ok(false);
    }

    let _presentation_guard = presentation_guard()?;
    let window = get_window(app_handle, FOCUS_SURFACE_LABEL)?;
    if !window
        .is_visible()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "read visibility", error))?
    {
        return Ok(false);
    }

    let snapshot = capture_focus_native_snapshot(&window)?;
    let (work_area, side) = preferred_focus_panel_work_area(app_handle)?;
    if let Err(error) = apply_panel_native(&window, work_area, side) {
        return match restore_focus_native_snapshot(&window, &snapshot) {
            Ok(()) => Err(error),
            Err(recovery) => Err(CommandError::new(
                "FOCUS_PRESENTATION_RECOVERY_FAILED",
                format!("{error}; rollback failed: {recovery}"),
            )),
        };
    }
    Ok(true)
}

pub(crate) fn revalidate_open_timer_after_display_change(
    app_handle: &tauri::AppHandle,
) -> CommandResult<bool> {
    if current_focus_surface_mode() != Some(FocusSurfaceMode::Timer) {
        return Ok(false);
    }
    let _presentation_guard = presentation_guard()?;
    floating_placement::revalidate_visible_timer_after_display_change(app_handle)
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
    apply_focus_surface_presentation_internal(&app_handle, FocusSurfacePresentation::Panel)?;
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    show_and_focus(&window)
}

#[tauri::command]
fn focus_surface_mode_timer(app_handle: tauri::AppHandle) -> CommandResult<()> {
    apply_focus_surface_presentation_internal(&app_handle, FocusSurfacePresentation::TimerCompact)?;
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    show_and_focus(&window)
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
            if window.label() == FLOATING_TIMER_LABEL {
                match event {
                    tauri::WindowEvent::Moved(_) => {
                        if floating_placement::note_timer_moved(window.app_handle())
                            && FLOATING_TIMER_EXPANDED.load(AtomicOrdering::Acquire)
                        {
                            if let Ok(mut origin) = COMPACT_TIMER_ORIGIN.lock() {
                                *origin = None;
                            }
                        }
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
            board_task_mutation::change_list_board_task,
            board_task_mutation::duplicate_list_board_task,
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
            preference_settings::get_preference_settings,
            preference_settings::update_preference_settings,
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
            focus_surface_presentation_snapshot,
            focus_surface_apply_presentation,
            focus_surface_mode_snapshot,
            focus_surface_mode_panel,
            focus_surface_mode_timer,
            list_windows,
            list_monitors,
            position_focus_panel,
            present_focus_panel
        ])
        .setup(|app| {
            let focus = get_window(app.handle(), FOCUS_SURFACE_LABEL)?;
            floating_placement::ensure_fixed_focus_host_size(&focus)?;
            timer_region::apply(&focus, timer_region::panel_logical_size())?;
            focus
                .set_always_on_top(false)
                .map_err(|error| startup_error("initialize Focus topmost state", error))?;
            focus
                .set_skip_taskbar(false)
                .map_err(|error| startup_error("initialize Focus taskbar state", error))?;
            record_focus_surface_presentation(FocusSurfacePresentation::Panel);
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
