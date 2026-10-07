pub mod autostart;
mod blocking_read;
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
pub mod focus_frame_capture;
pub mod focus_frame_hold;
pub mod focus_preferences;
pub mod focus_webview;
pub mod home_snapshot;
pub mod list_board;
pub mod list_editor;
pub mod list_settings;
pub mod main_focus_morph;
pub mod notifications;
pub mod persistence;
pub mod preference_settings;
pub mod recurrence;
pub mod recurrence_service;
pub mod reminder_acceptance;
pub mod reminder_service;
pub mod report_commands;
mod report_pdf;
pub mod reporting;
pub mod scheduling;
pub mod session_reporting;
pub mod shortcut_settings;
pub mod shortcuts;
pub mod theme_settings;
pub mod timer;
pub mod timer_region;
pub mod timer_service;
pub mod validation_log;
pub mod windows;

use domain::{AppState, AppStatePayload};
use error::{CommandError, CommandResult};
use shortcuts::{ShortcutDiagnostics, ShortcutManager};
use std::fmt::Display;
use std::sync::atomic::{AtomicU8, Ordering as AtomicOrdering};
use std::sync::{Mutex, MutexGuard};
use std::time::Duration;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager, State};
use timer_service::{
    timer_complete_task, timer_extend, timer_finish_break, timer_pause, timer_pause_for_focus_home,
    timer_resume, timer_resume_focus_home_pause, timer_session_snapshot, timer_set_estimate,
    timer_set_time_taken, timer_skip_break, timer_skip_task, timer_start_manual_break,
    timer_start_task, timer_switch_task, TimerService,
};
use windows::{
    clamp_top_left, focus_panel_edge_position, validate_work_area, FocusPanelSide,
    MonitorDescriptor, PhysicalPoint as GeometryPoint, PhysicalRect as GeometryRect,
    PhysicalSize as GeometrySize,
};

const MAIN_WINDOW_LABEL: &str = "main";
const FOCUS_SURFACE_LABEL: &str = "focusSurface";
const STATE_CHANGED_EVENT: &str = "state-changed";
const FOCUS_SURFACE_PRESENTATION_CHANGED_EVENT: &str = "focus-surface-presentation-changed";
const FOCUS_PANEL_REQUEST_EVENT: &str = "focus-panel-requested";
const MAX_MONITOR_KEY_LEN: usize = 2048;
const FOCUS_PRESENTATION_UNKNOWN: u8 = 0;
const FOCUS_PRESENTATION_PANEL: u8 = 1;
const FOCUS_PRESENTATION_TIMER_COMPACT: u8 = 2;
const FOCUS_PRESENTATION_TIMER_EXPANDED: u8 = 3;
const FOCUS_POSITION_MOTION_STEP_MS: u64 = 16;
const FOCUS_POSITION_MOTION_MAX_MS: u64 = 1_000;
const BLITZ_MAIN_MORPH_MS: u64 = 220;
const FOCUS_CROSS_DPI_VIEWPORT_SETTLE_MS: u64 = 50;

static FOCUS_SURFACE_PRESENTATION_STATE: AtomicU8 = AtomicU8::new(FOCUS_PRESENTATION_UNKNOWN);
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
async fn get_home_snapshot(
    app_handle: tauri::AppHandle,
) -> CommandResult<home_snapshot::HomeSnapshot> {
    blocking_read::read("HOME_SNAPSHOT_FAILED", move || {
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
    })
    .await
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

const PRODUCTION_APP_IDENTIFIER: &str = "com.mariosg.Narro";
const M1_DIAGNOSTIC_APP_IDENTIFIER: &str = "com.mariosg.Narro.M1Diagnostic";

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct DiagnosticStoragePaths {
    identifier: String,
    app_data_dir: String,
    app_local_data_dir: String,
    isolation_pass: bool,
}

fn storage_path_matches_identifier(path: &std::path::Path, identifier: &str) -> bool {
    path.file_name()
        .and_then(std::ffi::OsStr::to_str)
        .is_some_and(|leaf| leaf.eq_ignore_ascii_case(identifier))
}

fn diagnostic_storage_isolation_pass(
    identifier: &str,
    app_data_dir: &std::path::Path,
    app_local_data_dir: &std::path::Path,
) -> bool {
    identifier.eq_ignore_ascii_case(M1_DIAGNOSTIC_APP_IDENTIFIER)
        && !identifier.eq_ignore_ascii_case(PRODUCTION_APP_IDENTIFIER)
        && storage_path_matches_identifier(app_data_dir, identifier)
        && storage_path_matches_identifier(app_local_data_dir, identifier)
}

#[tauri::command]
fn diagnostic_storage_paths(app_handle: tauri::AppHandle) -> CommandResult<DiagnosticStoragePaths> {
    let app_data_dir = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "DIAGNOSTIC_STORAGE_FAILED",
            format!("failed to resolve diagnostic app-data directory: {error}"),
        )
    })?;
    let app_local_data_dir = app_handle.path().app_local_data_dir().map_err(|error| {
        CommandError::new(
            "DIAGNOSTIC_STORAGE_FAILED",
            format!("failed to resolve diagnostic local app-data directory: {error}"),
        )
    })?;
    let identifier = app_handle.config().identifier.clone();
    let isolation_pass =
        diagnostic_storage_isolation_pass(&identifier, &app_data_dir, &app_local_data_dir);

    Ok(DiagnosticStoragePaths {
        identifier,
        app_data_dir: app_data_dir.to_string_lossy().into_owned(),
        app_local_data_dir: app_local_data_dir.to_string_lossy().into_owned(),
        isolation_pass,
    })
}

#[cfg(test)]
mod diagnostic_storage_tests {
    use super::{
        diagnostic_storage_isolation_pass, M1_DIAGNOSTIC_APP_IDENTIFIER, PRODUCTION_APP_IDENTIFIER,
    };
    use std::path::PathBuf;

    #[test]
    fn diagnostic_storage_requires_resolved_paths_to_use_diagnostic_namespace() {
        let roaming =
            PathBuf::from(r"C:\Users\NarroTest\AppData\Roaming\com.mariosg.Narro.M1Diagnostic");
        let local =
            PathBuf::from(r"C:\Users\NarroTest\AppData\Local\com.mariosg.Narro.M1Diagnostic");

        assert!(diagnostic_storage_isolation_pass(
            M1_DIAGNOSTIC_APP_IDENTIFIER,
            &roaming,
            &local
        ));
    }

    #[test]
    fn diagnostic_storage_rejects_production_identifier_even_with_matching_paths() {
        let roaming = PathBuf::from(r"C:\Users\NarroTest\AppData\Roaming\com.mariosg.Narro");
        let local = PathBuf::from(r"C:\Users\NarroTest\AppData\Local\com.mariosg.Narro");

        assert!(!diagnostic_storage_isolation_pass(
            PRODUCTION_APP_IDENTIFIER,
            &roaming,
            &local
        ));
    }

    #[test]
    fn diagnostic_storage_rejects_identifier_when_either_resolved_path_has_wrong_leaf() {
        let diagnostic_roaming =
            PathBuf::from(r"C:\Users\NarroTest\AppData\Roaming\com.mariosg.Narro.M1Diagnostic");
        let production_local = PathBuf::from(r"C:\Users\NarroTest\AppData\Local\com.mariosg.Narro");

        assert!(!diagnostic_storage_isolation_pass(
            M1_DIAGNOSTIC_APP_IDENTIFIER,
            &diagnostic_roaming,
            &production_local
        ));
    }
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

fn parse_persisted_monitor_name(monitor_key: &str) -> Option<String> {
    let mut parts = monitor_key.rsplitn(10, '|');

    let scale_bits = parts.next()?;
    if scale_bits.len() != 16 || u64::from_str_radix(scale_bits, 16).is_err() {
        return None;
    }
    parts.next()?.parse::<u32>().ok()?;
    parts.next()?.parse::<u32>().ok()?;
    parts.next()?.parse::<i32>().ok()?;
    parts.next()?.parse::<i32>().ok()?;
    parts.next()?.parse::<u32>().ok()?;
    parts.next()?.parse::<u32>().ok()?;
    parts.next()?.parse::<i32>().ok()?;
    parts.next()?.parse::<i32>().ok()?;

    let name = parts.next()?.to_owned();
    (!name.is_empty()).then_some(name)
}

fn compatible_monitor_descriptor_index(
    monitor_key: &str,
    descriptors: &[MonitorDescriptor],
) -> Option<usize> {
    let saved_name = parse_persisted_monitor_name(monitor_key)?;
    let mut compatible = descriptors
        .iter()
        .enumerate()
        .filter(|(_, descriptor)| descriptor.name.as_deref() == Some(saved_name.as_str()));
    let candidate = compatible.next()?.0;
    compatible.next().is_none().then_some(candidate)
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

    let monitors = enumerate_monitors(app_handle)?;
    let mut described = Vec::with_capacity(monitors.len());
    for (index, monitor) in monitors.into_iter().enumerate() {
        let descriptor = monitor_descriptor(index, &monitor)?;
        if descriptor.key == monitor_key {
            return Ok((monitor, descriptor));
        }
        described.push((monitor, descriptor));
    }

    let descriptors = described
        .iter()
        .map(|(_, descriptor)| descriptor.clone())
        .collect::<Vec<_>>();
    let Some(selected_index) = compatible_monitor_descriptor_index(monitor_key, &descriptors)
    else {
        return Err(CommandError::stale_monitor_selection());
    };
    Ok(described.swap_remove(selected_index))
}

#[cfg(test)]
mod monitor_selection_tests {
    use super::*;

    #[test]
    fn persisted_monitor_name_survives_dpi_work_area_and_geometry_changes() {
        let saved = r"\\.\DISPLAY1|0|0|1920|1080|0|0|1536|832|3ff4000000000000";
        assert_eq!(
            parse_persisted_monitor_name(saved).as_deref(),
            Some(r"\\.\DISPLAY1")
        );

        let moved_and_resized =
            r"\\.\DISPLAY1|-2560|120|2560|1440|-2560|120|2560|1400|3ff0000000000000";
        assert_eq!(
            parse_persisted_monitor_name(moved_and_resized).as_deref(),
            Some(r"\\.\DISPLAY1")
        );
    }

    #[test]
    fn malformed_or_unnamed_persisted_monitor_keys_have_no_compatibility_identity() {
        assert_eq!(parse_persisted_monitor_name("malformed-monitor-key"), None);
        assert_eq!(
            parse_persisted_monitor_name("|0|0|1920|1080|0|0|1920|1040|3ff0000000000000"),
            None
        );
    }

    fn descriptor(key: &str, name: Option<&str>, index: usize) -> MonitorDescriptor {
        MonitorDescriptor {
            key: key.to_owned(),
            index,
            name: name.map(str::to_owned),
            scale_factor: 1.0,
            position: GeometryPoint { x: 0, y: 0 },
            size: GeometrySize {
                width: 1920,
                height: 1080,
            },
            work_area: GeometryRect {
                position: GeometryPoint { x: 0, y: 0 },
                size: GeometrySize {
                    width: 1920,
                    height: 1040,
                },
            },
        }
    }

    #[test]
    fn durable_monitor_resolution_requires_unique_named_fallback() {
        let saved = r"\\.\DISPLAY1|0|0|1920|1080|0|0|1536|832|3ff4000000000000";
        let current = descriptor(
            r"\\.\DISPLAY1|-2560|120|2560|1440|-2560|120|2560|1400|3ff0000000000000",
            Some(r"\\.\DISPLAY1"),
            0,
        );
        assert_eq!(
            compatible_monitor_descriptor_index(saved, std::slice::from_ref(&current)),
            Some(0)
        );
        let duplicate = descriptor(
            r"\\.\DISPLAY1|1920|0|1920|1080|1920|0|1920|1040|3ff0000000000000",
            Some(r"\\.\DISPLAY1"),
            1,
        );
        assert_eq!(
            compatible_monitor_descriptor_index(saved, &[current.clone(), duplicate]),
            None
        );

        let different = descriptor(
            r"\\.\DISPLAY2|0|0|1920|1080|0|0|1920|1040|3ff0000000000000",
            Some(r"\\.\DISPLAY2"),
            0,
        );
        assert_eq!(
            compatible_monitor_descriptor_index(saved, &[different]),
            None
        );

        let unnamed_saved = "|0|0|1920|1080|0|0|1536|832|3ff0000000000000";
        let unnamed = descriptor("|0|0|1920|1080|0|0|1920|1040|3ff0000000000000", None, 0);
        assert_eq!(
            compatible_monitor_descriptor_index(unnamed_saved, &[unnamed]),
            None
        );
    }

    #[test]
    fn monitor_names_with_separators_remain_parseable() {
        let saved = r"DISPLAY|ALIAS|0|0|1920|1080|0|0|1536|832|3ff4000000000000";
        assert_eq!(
            parse_persisted_monitor_name(saved).as_deref(),
            Some("DISPLAY|ALIAS")
        );
    }
}

#[tauri::command]
fn list_monitors(app_handle: tauri::AppHandle) -> CommandResult<Vec<MonitorDescriptor>> {
    enumerate_monitors(&app_handle)?
        .iter()
        .enumerate()
        .map(|(index, monitor)| monitor_descriptor(index, monitor))
        .collect()
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct FocusPanelPlacementProbe {
    monitor: MonitorDescriptor,
    side: FocusPanelSide,
    expected_position: GeometryPoint,
    actual_position: GeometryPoint,
    actual_size: GeometrySize,
    visible: bool,
    presentation: String,
    edge_aligned: bool,
    fully_within_work_area: bool,
    pass: bool,
}

#[tauri::command(rename_all = "camelCase")]
fn focus_panel_placement_probe(
    app_handle: tauri::AppHandle,
    monitor_key: String,
    side: FocusPanelSide,
) -> CommandResult<FocusPanelPlacementProbe> {
    let (_monitor, descriptor) = resolve_monitor_by_key(&app_handle, &monitor_key)?;
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;

    let outer_position = window.outer_position().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read Focus Panel position for diagnostic probe",
            error,
        )
    })?;
    let outer_size = window.outer_size().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read Focus Panel size for diagnostic probe",
            error,
        )
    })?;
    let actual_position = GeometryPoint {
        x: outer_position.x,
        y: outer_position.y,
    };
    let actual_size = GeometrySize {
        width: outer_size.width,
        height: outer_size.height,
    };
    let expected_position = focus_panel_edge_position(descriptor.work_area, actual_size, side)
        .map_err(CommandError::window_geometry)?;
    let clamped_position = clamp_top_left(descriptor.work_area, actual_size, actual_position)
        .map_err(CommandError::window_geometry)?;
    let fits_work_area = actual_size.width <= descriptor.work_area.size.width
        && actual_size.height <= descriptor.work_area.size.height;
    let fully_within_work_area = fits_work_area && clamped_position == actual_position;
    let edge_aligned = actual_position == expected_position;
    let visible = window.is_visible().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read Focus Panel visibility for diagnostic probe",
            error,
        )
    })?;
    let presentation = current_focus_surface_presentation()
        .map(FocusSurfacePresentation::event_name)
        .unwrap_or("unknown")
        .to_owned();
    let pass = visible
        && presentation == FocusSurfacePresentation::Panel.event_name()
        && edge_aligned
        && fully_within_work_area;

    Ok(FocusPanelPlacementProbe {
        monitor: descriptor,
        side,
        expected_position,
        actual_position,
        actual_size,
        visible,
        presentation,
        edge_aligned,
        fully_within_work_area,
        pass,
    })
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
) -> CommandResult<(GeometryRect, f64, FocusPanelSide)> {
    let (selected_monitor_key, side) = load_focus_panel_placement_preferences(app_handle)?;
    let descriptor = match selected_monitor_key {
        Some(monitor_key) => resolve_monitor_by_key(app_handle, &monitor_key)?.1,
        None => {
            let monitor = app_handle
                .primary_monitor()
                .map_err(CommandError::monitor_enumeration)?
                .ok_or_else(CommandError::no_monitors_available)?;
            monitor_descriptor(0, &monitor)?
        }
    };
    Ok((descriptor.work_area, descriptor.scale_factor, side))
}

fn record_focus_surface_presentation(presentation: FocusSurfacePresentation) {
    let state = match presentation {
        FocusSurfacePresentation::Panel => FOCUS_PRESENTATION_PANEL,
        FocusSurfacePresentation::TimerCompact => FOCUS_PRESENTATION_TIMER_COMPACT,
        FocusSurfacePresentation::TimerExpanded => FOCUS_PRESENTATION_TIMER_EXPANDED,
    };
    FOCUS_SURFACE_PRESENTATION_STATE.store(state, AtomicOrdering::Release);
}

fn current_focus_surface_presentation() -> Option<FocusSurfacePresentation> {
    match FOCUS_SURFACE_PRESENTATION_STATE.load(AtomicOrdering::Acquire) {
        FOCUS_PRESENTATION_PANEL => Some(FocusSurfacePresentation::Panel),
        FOCUS_PRESENTATION_TIMER_COMPACT => Some(FocusSurfacePresentation::TimerCompact),
        FOCUS_PRESENTATION_TIMER_EXPANDED => Some(FocusSurfacePresentation::TimerExpanded),
        _ => None,
    }
}

pub(crate) fn current_focus_surface_mode() -> Option<FocusSurfaceMode> {
    current_focus_surface_presentation().map(FocusSurfacePresentation::mode)
}

pub(crate) fn current_focus_surface_expanded() -> bool {
    matches!(
        current_focus_surface_presentation(),
        Some(FocusSurfacePresentation::TimerExpanded)
    )
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
    validation_log::record_presentation(app_handle, presentation.event_name());
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
}

fn capture_focus_native_snapshot(
    window: &tauri::WebviewWindow,
) -> CommandResult<FocusNativeSnapshot> {
    let position = window.outer_position().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read position before presentation change",
            error,
        )
    })?;
    let size = window.inner_size().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read size before presentation change",
            error,
        )
    })?;
    let always_on_top = window.is_always_on_top().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read topmost state before presentation change",
            error,
        )
    })?;
    Ok(FocusNativeSnapshot {
        presentation: current_focus_surface_presentation()
            .unwrap_or(FocusSurfacePresentation::Panel),
        position,
        size,
        always_on_top,
    })
}

fn set_focus_position(
    window: &tauri::WebviewWindow,
    point: GeometryPoint,
    context: &'static str,
) -> CommandResult<()> {
    let current = window.outer_position().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read Focus position before move",
            error,
        )
    })?;
    if current.x == point.x && current.y == point.y {
        return Ok(());
    }
    focus_webview::set_physical_position(window, point.x, point.y)
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

    if let Err(error) = focus_frame_hold::clear(window) {
        failures.push(error);
    }

    if let Err(error) = window
        .set_size(tauri::Size::Physical(snapshot.size))
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "restore host size", error))
    {
        failures.push(error);
    }
    if let Err(error) = set_focus_position(
        window,
        GeometryPoint {
            x: snapshot.position.x,
            y: snapshot.position.y,
        },
        "restore position",
    ) {
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

fn focus_panel_animation_size(
    current_outer: GeometrySize,
    work_area: GeometryRect,
    source_scale: f64,
    target_scale: f64,
) -> CommandResult<GeometrySize> {
    validate_work_area(work_area).map_err(CommandError::window_geometry)?;

    if (source_scale - target_scale).abs() <= 0.01 {
        let size = GeometrySize {
            width: current_outer.width.min(work_area.size.width),
            height: current_outer.height.min(work_area.size.height),
        };
        if size.width == 0 || size.height == 0 {
            return Err(CommandError::new(
                "FOCUS_PRESENTATION_FAILED",
                "current Focus host has no usable outer size for Panel animation",
            ));
        }
        return Ok(size);
    }

    focus_host_size_for_target_scale(work_area, target_scale)
}

fn focus_host_size_for_target_scale(
    work_area: GeometryRect,
    target_scale: f64,
) -> CommandResult<GeometrySize> {
    validate_work_area(work_area).map_err(CommandError::window_geometry)?;
    if !target_scale.is_finite() || target_scale <= 0.0 {
        return Err(CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            "selected monitor has an invalid DPI scale",
        ));
    }

    let desired = GeometrySize {
        width: ((timer_region::FOCUS_HOST_WIDTH_LOGICAL * target_scale)
            .round()
            .max(1.0) as u32)
            .min(work_area.size.width),
        height: ((timer_region::FOCUS_HOST_HEIGHT_LOGICAL * target_scale)
            .round()
            .max(1.0) as u32)
            .min(work_area.size.height),
    };
    if desired.width == 0 || desired.height == 0 {
        return Err(CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            "selected monitor has no usable work area for the Focus surface",
        ));
    }
    Ok(desired)
}

fn fit_focus_host_for_target_scale(
    window: &tauri::WebviewWindow,
    work_area: GeometryRect,
    target_scale: f64,
) -> CommandResult<GeometrySize> {
    let desired = focus_host_size_for_target_scale(work_area, target_scale)?;

    let outer = window
        .outer_size()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "read Focus host size", error))?;
    if outer.width != desired.width || outer.height != desired.height {
        window
            .set_size(tauri::Size::Physical(tauri::PhysicalSize {
                width: desired.width,
                height: desired.height,
            }))
            .map_err(|error| {
                map_window_error(
                    FOCUS_SURFACE_LABEL,
                    "set Focus host size for target monitor DPI",
                    error,
                )
            })?;
    }

    let actual = window
        .outer_size()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "confirm Focus host size", error))?;
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
    target_scale: f64,
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

    let actual_size = fit_focus_host_for_target_scale(window, work_area, target_scale)?;
    let final_position = focus_panel_edge_position(work_area, actual_size, side)
        .map_err(CommandError::window_geometry)?;
    set_focus_position(
        window,
        final_position,
        "position Focus Panel at monitor edge",
    )?;
    timer_region::apply_full_host(window)?;
    set_focus_presentation_attributes(window, FocusSurfacePresentation::Panel)
}

fn apply_panel_native_after_animated_cross_dpi_move(
    window: &tauri::WebviewWindow,
    work_area: GeometryRect,
    target_scale: f64,
    side: FocusPanelSide,
    previous: FocusSurfacePresentation,
) -> CommandResult<()> {
    validate_work_area(work_area).map_err(CommandError::window_geometry)?;

    // Keep the previous Timer region while the fixed host adopts the target
    // monitor's physical DPI size. Every programmatic parent move now also
    // calls WebView2 NotifyParentWindowPositionChanged; the bounded settle
    // remains a conservative compositor guard because #684 physically proved
    // this clipped reveal path clean and no further physical retest is
    // currently available. The #679 capture proved that exposing the full
    // Panel earlier can reveal a stale viewport/browser scrollbars.
    let actual_size = fit_focus_host_for_target_scale(window, work_area, target_scale)?;
    let final_position = focus_panel_edge_position(work_area, actual_size, side)
        .map_err(CommandError::window_geometry)?;
    set_focus_position(
        window,
        final_position,
        "finish animated Focus Panel position at monitor edge",
    )?;
    timer_region::apply(window, previous.region())?;
    std::thread::sleep(Duration::from_millis(FOCUS_CROSS_DPI_VIEWPORT_SETTLE_MS));
    timer_region::apply_full_host(window)?;
    set_focus_presentation_attributes(window, FocusSurfacePresentation::Panel)
}

fn apply_timer_native(
    app_handle: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
    previous: FocusSurfacePresentation,
    target: FocusSurfacePresentation,
    compact_frame: Option<&[u8]>,
) -> CommandResult<()> {
    let expanded = target.expanded();

    if previous.mode() != FocusSurfaceMode::Timer {
        floating_placement::restore_for_timer(app_handle, window, expanded)?;
        timer_region::apply(window, target.region())?;
        return set_focus_presentation_attributes(window, target);
    }

    if previous.expanded() != expanded {
        // Expansion may clamp upward to keep the larger region visible. Keep
        // that safe origin on collapse rather than clipping then moving back
        // to a cached bottom-edge point, which CI911 physically lost for frames.
        let desired =
            floating_placement::safe_position_for_timer_region(app_handle, window, expanded, None)?;

        if expanded {
            // Move the still-compact visible rectangle first, then reveal the
            // prepainted lower controls.
            set_focus_position(window, desired, "move Timer before expanded region")?;
            timer_region::apply_without_redraw(window, target.region())?;
        } else {
            // Collapse in place after React presents its compact frame. The
            // position helper only moves if topology makes a new clamp needed.
            let hold = compact_frame
                .map(|frame| {
                    focus_frame_hold::begin(
                        window,
                        timer_region::visible_size(window, target.region())?,
                        frame,
                    )
                })
                .transpose()?;
            timer_region::apply_without_redraw(window, target.region())?;
            set_focus_position(window, desired, "keep safe compact Timer position")?;
            if let Some(hold) = hold {
                hold.commit();
            }
        }
    } else {
        timer_region::apply(window, target.region())?;
    }

    set_focus_presentation_attributes(window, target)
}

fn apply_focus_native_target(
    app_handle: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
    previous: FocusSurfacePresentation,
    target: FocusSurfacePresentation,
    compact_frame: Option<&[u8]>,
) -> CommandResult<()> {
    focus_frame_hold::clear(window)?;
    match target {
        FocusSurfacePresentation::Panel => preferred_focus_panel_work_area(app_handle).and_then(
            |(work_area, scale_factor, side)| {
                apply_panel_native(window, work_area, scale_factor, side)
            },
        ),
        FocusSurfacePresentation::TimerCompact | FocusSurfacePresentation::TimerExpanded => {
            apply_timer_native(app_handle, window, previous, target, compact_frame)
        }
    }
}

fn planned_focus_presentation_position(
    app_handle: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
    target: FocusSurfacePresentation,
) -> CommandResult<GeometryPoint> {
    match target {
        FocusSurfacePresentation::Panel => {
            let (work_area, scale_factor, side) = preferred_focus_panel_work_area(app_handle)?;
            let target_size = focus_host_size_for_target_scale(work_area, scale_factor)?;
            focus_panel_edge_position(work_area, target_size, side)
                .map_err(CommandError::window_geometry)
        }
        FocusSurfacePresentation::TimerCompact | FocusSurfacePresentation::TimerExpanded => {
            floating_placement::planned_timer_position(app_handle, window, target.expanded())
        }
    }
}

const FLUENT_POINT_TO_POINT_X1: f64 = 0.55;
const FLUENT_POINT_TO_POINT_Y1: f64 = 0.55;
const FLUENT_POINT_TO_POINT_X2: f64 = 0.0;
const FLUENT_POINT_TO_POINT_Y2: f64 = 1.0;

fn cubic_bezier_coordinate(t: f64, p1: f64, p2: f64) -> f64 {
    let one_minus_t = 1.0 - t;
    3.0 * one_minus_t * one_minus_t * t * p1 + 3.0 * one_minus_t * t * t * p2 + t * t * t
}

fn fluent_point_to_point_easing(progress: f64) -> f64 {
    if progress <= 0.0 {
        return 0.0;
    }
    if progress >= 1.0 {
        return 1.0;
    }

    // Windows Fluent "Existing Elements / Point to Point" easing:
    // cubic-bezier(0.55, 0.55, 0, 1). CSS timing functions map elapsed
    // progress through the Bezier x-axis, so solve x(t)=progress first and
    // then return y(t). Bisection is deterministic and monotonic here.
    let mut lower = 0.0;
    let mut upper = 1.0;
    for _ in 0..20 {
        let t = (lower + upper) * 0.5;
        let x = cubic_bezier_coordinate(t, FLUENT_POINT_TO_POINT_X1, FLUENT_POINT_TO_POINT_X2);
        if x < progress {
            lower = t;
        } else {
            upper = t;
        }
    }

    cubic_bezier_coordinate(
        (lower + upper) * 0.5,
        FLUENT_POINT_TO_POINT_Y1,
        FLUENT_POINT_TO_POINT_Y2,
    )
}

fn interpolate_focus_axis(start: i32, end: i32, step: u64, steps: u64) -> CommandResult<i32> {
    if steps == 0 || step > steps {
        return Err(CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            "position animation step is outside the eased motion range",
        ));
    }
    if step == 0 {
        return Ok(start);
    }
    if step == steps {
        return Ok(end);
    }

    let progress = step as f64 / steps as f64;
    let eased = fluent_point_to_point_easing(progress);
    let value = f64::from(start) + (f64::from(end) - f64::from(start)) * eased;
    let value = value.round();
    if value < f64::from(i32::MIN) || value > f64::from(i32::MAX) {
        return Err(CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            "animated Focus position exceeded supported coordinates",
        ));
    }
    Ok(value as i32)
}

fn interpolate_focus_extent(start: u32, end: u32, step: u64, steps: u64) -> CommandResult<u32> {
    let start = i32::try_from(start).map_err(|_| {
        CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            "animated window extent exceeds supported coordinates",
        )
    })?;
    let end = i32::try_from(end).map_err(|_| {
        CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            "animated window extent exceeds supported coordinates",
        )
    })?;
    let value = interpolate_focus_axis(start, end, step, steps)?;
    u32::try_from(value).map_err(|_| {
        CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            "animated window extent became negative",
        )
    })
}

fn interpolate_blitz_morph_rect(
    start: GeometryRect,
    target: GeometryRect,
    step: u64,
    steps: u64,
) -> CommandResult<GeometryRect> {
    Ok(GeometryRect {
        position: GeometryPoint {
            x: interpolate_focus_axis(start.position.x, target.position.x, step, steps)?,
            y: interpolate_focus_axis(start.position.y, target.position.y, step, steps)?,
        },
        size: GeometrySize {
            width: interpolate_focus_extent(start.size.width, target.size.width, step, steps)?,
            height: interpolate_focus_extent(start.size.height, target.size.height, step, steps)?,
        },
    })
}

fn animate_main_focus_rect(
    window: &tauri::WebviewWindow,
    start: GeometryRect,
    target: GeometryRect,
    duration_ms: u64,
) -> CommandResult<()> {
    if duration_ms == 0 || duration_ms > FOCUS_POSITION_MOTION_MAX_MS {
        return Err(CommandError::invalid_argument(
            "durationMs",
            format!("must be between 1 and {FOCUS_POSITION_MOTION_MAX_MS} milliseconds"),
        ));
    }

    let steps = duration_ms.div_ceil(FOCUS_POSITION_MOTION_STEP_MS).max(1);
    let mut elapsed_ms = 0_u64;
    for step in 1..=steps {
        let target_elapsed_ms = duration_ms * step / steps;
        let sleep_ms = target_elapsed_ms.saturating_sub(elapsed_ms);
        if sleep_ms != 0 {
            std::thread::sleep(Duration::from_millis(sleep_ms));
        }
        elapsed_ms = target_elapsed_ms;
        main_focus_morph::set_outer_rect(
            window,
            interpolate_blitz_morph_rect(start, target, step, steps)?,
        )?;
    }
    Ok(())
}

fn animate_focus_position(
    window: &tauri::WebviewWindow,
    target: GeometryPoint,
    duration_ms: u64,
) -> CommandResult<()> {
    if duration_ms == 0 || duration_ms > FOCUS_POSITION_MOTION_MAX_MS {
        return Err(CommandError::invalid_argument(
            "durationMs",
            format!("must be between 1 and {FOCUS_POSITION_MOTION_MAX_MS} milliseconds"),
        ));
    }

    let start = window.outer_position().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read Focus position before animated transition",
            error,
        )
    })?;
    if start.x == target.x && start.y == target.y {
        return Ok(());
    }

    let steps = duration_ms.div_ceil(FOCUS_POSITION_MOTION_STEP_MS).max(1);
    let mut elapsed_ms = 0_u64;
    for step in 1..=steps {
        let target_elapsed_ms = duration_ms * step / steps;
        let sleep_ms = target_elapsed_ms.saturating_sub(elapsed_ms);
        if sleep_ms != 0 {
            std::thread::sleep(Duration::from_millis(sleep_ms));
        }
        elapsed_ms = target_elapsed_ms;
        let point = GeometryPoint {
            x: interpolate_focus_axis(start.x, target.x, step, steps)?,
            y: interpolate_focus_axis(start.y, target.y, step, steps)?,
        };
        set_focus_position(window, point, "animate Focus presentation position")?;
    }
    Ok(())
}

fn animate_focus_surface_presentation_internal(
    app_handle: &tauri::AppHandle,
    target: FocusSurfacePresentation,
    duration_ms: u64,
) -> CommandResult<()> {
    let _presentation_guard = presentation_guard()?;
    let window = get_window(app_handle, FOCUS_SURFACE_LABEL)?;
    let previous = current_focus_surface_presentation().unwrap_or(FocusSurfacePresentation::Panel);
    if previous == target {
        return Ok(());
    }
    if previous.mode() == target.mode() {
        return Err(CommandError::invalid_argument(
            "presentation",
            "animated Focus presentation is only valid for Panel/Timer mode transitions",
        ));
    }

    focus_frame_hold::clear(&window)?;

    let snapshot = capture_focus_native_snapshot(&window)?;
    if previous.mode() == FocusSurfaceMode::Timer && target == FocusSurfacePresentation::Panel {
        if let Err(error) = floating_placement::save_if_timer_visible(app_handle) {
            eprintln!(
                "Could not save Floating Timer position before animated Panel return: {error}"
            );
        }
    }

    let _save_guard = floating_placement::suspend_saves();
    let _display_recovery_guard = windows::suspend_focus_display_recovery();
    let transition = (|| -> CommandResult<()> {
        let source_scale = window.scale_factor().map_err(|error| {
            map_window_error(
                FOCUS_SURFACE_LABEL,
                "read Focus scale before animated transition",
                error,
            )
        })?;
        let panel_target = if target == FocusSurfacePresentation::Panel {
            Some(preferred_focus_panel_work_area(app_handle)?)
        } else {
            None
        };
        let cross_dpi_panel_return = panel_target
            .map(|(_, target_scale, _)| (source_scale - target_scale).abs() > 0.01)
            .unwrap_or(false);
        let target_position = match panel_target {
            Some((work_area, target_scale, side)) => {
                let current_outer = window.outer_size().map_err(|error| {
                    map_window_error(
                        FOCUS_SURFACE_LABEL,
                        "read Focus outer size for Panel animation target",
                        error,
                    )
                })?;
                let target_size = focus_panel_animation_size(
                    GeometrySize {
                        width: current_outer.width,
                        height: current_outer.height,
                    },
                    work_area,
                    source_scale,
                    target_scale,
                )?;
                focus_panel_edge_position(work_area, target_size, side)
                    .map_err(CommandError::window_geometry)?
            }
            None => planned_focus_presentation_position(app_handle, &window, target)?,
        };

        if previous == FocusSurfacePresentation::Panel && target.mode() == FocusSurfaceMode::Timer {
            // #679 moved the transparent 340x700 host before reducing the
            // native region, leaving a tall outlined tail under the compact
            // Timer for several frames. Clip to the already-prepared target
            // presentation before the finite native position motion begins.
            timer_region::apply(&window, target.region())?;
        } else if previous.mode() == FocusSurfaceMode::Timer
            && target == FocusSurfacePresentation::Panel
            && !cross_dpi_panel_return
        {
            // Same-DPI return keeps the continuous Panel reveal used by the
            // normal Gate 7 transition.
            timer_region::apply_full_host(&window)?;
        }

        animate_focus_position(&window, target_position, duration_ms)?;

        match panel_target {
            Some((work_area, target_scale, side)) if cross_dpi_panel_return => {
                apply_panel_native_after_animated_cross_dpi_move(
                    &window,
                    work_area,
                    target_scale,
                    side,
                    previous,
                )
            }
            _ => apply_focus_native_target(app_handle, &window, previous, target, None),
        }
    })();

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

fn apply_focus_surface_presentation_internal(
    app_handle: &tauri::AppHandle,
    target: FocusSurfacePresentation,
    compact_frame: Option<&[u8]>,
) -> CommandResult<()> {
    let _presentation_guard = presentation_guard()?;
    let window = get_window(app_handle, FOCUS_SURFACE_LABEL)?;
    let previous = current_focus_surface_presentation().unwrap_or(FocusSurfacePresentation::Panel);

    // Re-presenting an already committed Panel is not a no-op: the
    // focusSurface normally starts hidden in Panel state, and each explicit
    // Panel presentation must honor the latest selected-monitor/side
    // preferences before it becomes visible.
    //
    // A visible Timer same-presentation request is a no-op so a user's current
    // dragged position is preserved. A hidden Timer must instead restore its
    // saved visible rectangle against the *current* monitor topology before it
    // is shown again; otherwise a disconnected monitor can strand it off-screen.
    if previous == target && target != FocusSurfacePresentation::Panel {
        let visible = window
            .is_visible()
            .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "read visibility", error))?;
        if visible {
            return Ok(());
        }

        let snapshot = capture_focus_native_snapshot(&window)?;
        let _save_guard = floating_placement::suspend_saves();
        let recovery =
            floating_placement::restore_for_timer(app_handle, &window, target.expanded())
                .and_then(|_| timer_region::apply(&window, target.region()))
                .and_then(|_| set_focus_presentation_attributes(&window, target));
        if let Err(error) = recovery {
            return match restore_focus_native_snapshot(&window, &snapshot) {
                Ok(()) => Err(error),
                Err(rollback) => Err(CommandError::new(
                    "FOCUS_PRESENTATION_RECOVERY_FAILED",
                    format!("{error}; rollback failed: {rollback}"),
                )),
            };
        }
        return Ok(());
    }

    let snapshot = capture_focus_native_snapshot(&window)?;

    if previous.mode() == FocusSurfaceMode::Timer && target == FocusSurfacePresentation::Panel {
        if let Err(error) = floating_placement::save_if_timer_visible(app_handle) {
            eprintln!("Could not save Floating Timer position before Panel return: {error}");
        }
    }
    let _save_guard = floating_placement::suspend_saves();

    let transition =
        apply_focus_native_target(app_handle, &window, previous, target, compact_frame);

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
fn focus_runtime_capture_checkpoint(phase: String, snapshot: String) -> CommandResult<()> {
    let output_directory = std::env::var_os("NARRO_FOCUS_CAPTURE_DIR").ok_or_else(|| {
        CommandError::new(
            "FOCUS_RUNTIME_CAPTURE_DISABLED",
            "packaged Focus runtime capture is not enabled",
        )
    })?;
    if !matches!(
        phase.as_str(),
        "panel"
            | "panel-to-timer-start"
            | "timer-compact"
            | "timer-expanded"
            | "timer-to-panel-start"
            | "panel-returned"
            | "complete"
    ) {
        return Err(CommandError::new(
            "FOCUS_RUNTIME_CAPTURE_INVALID_PHASE",
            "unsupported packaged Focus runtime capture phase",
        ));
    }
    let directory = std::path::PathBuf::from(output_directory);
    std::fs::create_dir_all(&directory).map_err(|error| {
        CommandError::new(
            "FOCUS_RUNTIME_CAPTURE_WRITE_FAILED",
            format!("could not create capture directory: {error}"),
        )
    })?;
    let path = directory.join(format!("checkpoint-{phase}.json"));
    std::fs::write(&path, snapshot).map_err(|error| {
        CommandError::new(
            "FOCUS_RUNTIME_CAPTURE_WRITE_FAILED",
            format!("could not write {}: {error}", path.display()),
        )
    })
}

#[tauri::command(rename_all = "camelCase")]
fn focus_runtime_capture_acknowledged(phase: String) -> CommandResult<bool> {
    let output_directory = std::env::var_os("NARRO_FOCUS_CAPTURE_DIR").ok_or_else(|| {
        CommandError::new(
            "FOCUS_RUNTIME_CAPTURE_DISABLED",
            "packaged Focus runtime capture is not enabled",
        )
    })?;
    if !matches!(
        phase.as_str(),
        "panel"
            | "panel-to-timer-start"
            | "timer-compact"
            | "timer-expanded"
            | "timer-to-panel-start"
            | "panel-returned"
    ) {
        return Err(CommandError::new(
            "FOCUS_RUNTIME_CAPTURE_INVALID_PHASE",
            "unsupported packaged Focus runtime capture acknowledgement phase",
        ));
    }
    Ok(std::path::PathBuf::from(output_directory)
        .join(format!("ack-{phase}.ready"))
        .is_file())
}

#[tauri::command]
fn focus_runtime_capture_seed_timer_placement(app_handle: tauri::AppHandle) -> CommandResult<()> {
    if std::env::var_os("NARRO_FOCUS_CAPTURE_DIR").is_none() {
        return Err(CommandError::new(
            "FOCUS_RUNTIME_CAPTURE_DISABLED",
            "packaged Focus runtime capture is not enabled",
        ));
    }
    if current_focus_surface_mode() != Some(FocusSurfaceMode::Timer) {
        return Err(CommandError::new(
            "FOCUS_RUNTIME_CAPTURE_INVALID_PHASE",
            "Timer placement can only be seeded while Timer presentation is active",
        ));
    }

    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    let current = window.outer_position().map_err(|error| {
        map_window_error(FOCUS_SURFACE_LABEL, "read capture seed position", error)
    })?;
    let preferred = GeometryPoint {
        x: current.x.saturating_sub(280),
        y: current.y.saturating_add(80),
    };
    let target = floating_placement::safe_position_for_timer_region(
        &app_handle,
        &window,
        false,
        Some(preferred),
    )?;
    if target.x == current.x && target.y == current.y {
        return Err(CommandError::new(
            "FOCUS_RUNTIME_CAPTURE_SEED_FAILED",
            "hosted runner work area could not provide a distinct Timer capture position",
        ));
    }

    focus_webview::set_physical_position(&window, target.x, target.y).map_err(|error| {
        map_window_error(FOCUS_SURFACE_LABEL, "seed capture Timer position", error)
    })?;
    if !floating_placement::save_if_timer_visible(&app_handle)? {
        return Err(CommandError::new(
            "FOCUS_RUNTIME_CAPTURE_SEED_FAILED",
            "seeded Timer position was not persisted through the production placement path",
        ));
    }
    Ok(())
}

#[tauri::command(rename_all = "camelCase")]
fn focus_surface_apply_presentation(
    app_handle: tauri::AppHandle,
    presentation: String,
    compact_frame: Option<Vec<u8>>,
) -> CommandResult<()> {
    let target = parse_focus_surface_presentation(&presentation)?;
    if compact_frame.is_some() && target != FocusSurfacePresentation::TimerCompact {
        return Err(CommandError::new(
            "FOCUS_FRAME_CAPTURE_FAILED",
            "compact frame is only valid for compact Timer",
        ));
    }
    apply_focus_surface_presentation_internal(&app_handle, target, compact_frame.as_deref())
}

#[tauri::command]
async fn focus_surface_capture_compact_frame(
    window: tauri::WebviewWindow,
) -> CommandResult<Vec<u8>> {
    if window.label() != FOCUS_SURFACE_LABEL
        || current_focus_surface_presentation() != Some(FocusSurfacePresentation::TimerExpanded)
    {
        return Err(CommandError::new(
            "FOCUS_FRAME_CAPTURE_FAILED",
            "capture requires the expanded Focus host",
        ));
    }
    focus_frame_capture::capture(window).await
}

#[tauri::command(rename_all = "camelCase")]
async fn focus_surface_animate_presentation(
    app_handle: tauri::AppHandle,
    presentation: String,
    duration_ms: u64,
) -> CommandResult<()> {
    let target = parse_focus_surface_presentation(&presentation)?;
    tauri::async_runtime::spawn_blocking(move || {
        animate_focus_surface_presentation_internal(&app_handle, target, duration_ms)
    })
    .await
    .map_err(|error| {
        CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            format!("animated Focus transition worker failed: {error}"),
        )
    })?
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
    let _save_guard = floating_placement::suspend_saves();

    if let Err(error) =
        apply_panel_native(&window, descriptor.work_area, descriptor.scale_factor, side)
    {
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
    apply_focus_surface_presentation_internal(&app_handle, FocusSurfacePresentation::Panel, None)?;
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    window
        .show()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "show Focus Panel", error))?;
    window
        .set_focus()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "focus Focus Panel", error))
}

fn request_blitz_panel_after_reveal(app_handle: &tauri::AppHandle) -> CommandResult<()> {
    app_handle
        .emit(FOCUS_PANEL_REQUEST_EVENT, true)
        .map_err(|error| {
            CommandError::new(
                "FOCUS_PRESENTATION_FAILED",
                format!("failed to request Focus Panel after Blitz reveal: {error}"),
            )
        })
}

fn show_focus_after_blitz_entry(
    app_handle: &tauri::AppHandle,
    main: &tauri::WebviewWindow,
    focus: &tauri::WebviewWindow,
) -> CommandResult<()> {
    show_and_focus(focus)?;
    if let Err(error) = main.hide() {
        eprintln!(
            "Focus Panel is visible, but Main could not be hidden after Blitz entry: {error}"
        );
    }
    request_blitz_panel_after_reveal(app_handle)
}

fn restore_main_after_blitz_morph(
    main: &tauri::WebviewWindow,
    snapshot: GeometryRect,
) -> CommandResult<()> {
    let mut failures = Vec::new();
    if let Err(error) = main_focus_morph::set_outer_rect(main, snapshot) {
        failures.push(error);
    }
    if let Err(error) = focus_frame_hold::clear(main) {
        failures.push(error);
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

#[tauri::command(rename_all = "camelCase")]
async fn present_focus_for_blitz(
    app_handle: tauri::AppHandle,
    reduced_motion: bool,
) -> CommandResult<()> {
    let focus = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    let visible = focus.is_visible().map_err(|error| {
        map_window_error(
            FOCUS_SURFACE_LABEL,
            "read Focus visibility for Blitz entry",
            error,
        )
    })?;

    if visible {
        // Preserve the existing visible-surface coordinator path. The native
        // Board morph is only for the ordinary hidden-Focus entry from Main.
        focus.set_focus().map_err(|error| {
            map_window_error(FOCUS_SURFACE_LABEL, "focus existing Blitz surface", error)
        })?;
        return request_blitz_panel_after_reveal(&app_handle);
    }

    // Prepare the retained hidden Focus host at its authoritative Panel target
    // before touching Main. No intermediate Focus renderer state is exposed.
    apply_focus_surface_presentation_internal(&app_handle, FocusSurfacePresentation::Panel, None)?;

    let main = get_window(&app_handle, MAIN_WINDOW_LABEL)?;
    if reduced_motion
        || !main_focus_morph::supported()
        || !main_focus_morph::safe_restored_state(&main)?
    {
        return show_focus_after_blitz_entry(&app_handle, &main, &focus);
    }

    let main_snapshot = main_focus_morph::capture_outer_rect(&main)?;
    let focus_target = main_focus_morph::capture_outer_rect(&focus)?;
    let visible = main.inner_size().map_err(|error| {
        map_window_error(
            MAIN_WINDOW_LABEL,
            "read Main client size before Blitz morph",
            error,
        )
    })?;

    let frame = match focus_frame_capture::capture(main.clone()).await {
        Ok(frame) => frame,
        Err(error) => {
            eprintln!("Blitz Main pixel capture failed; using direct Focus handoff: {error}");
            return show_focus_after_blitz_entry(&app_handle, &main, &focus);
        }
    };
    let hold = match focus_frame_hold::begin(&main, visible, &frame) {
        Ok(hold) => hold,
        Err(error) => {
            eprintln!("Blitz Main raster hold failed; using direct Focus handoff: {error}");
            return show_focus_after_blitz_entry(&app_handle, &main, &focus);
        }
    };

    let worker_main = main.clone();
    let transition = match tauri::async_runtime::spawn_blocking(move || {
        animate_main_focus_rect(
            &worker_main,
            main_snapshot,
            focus_target,
            BLITZ_MAIN_MORPH_MS,
        )
    })
    .await
    {
        Ok(result) => result,
        Err(error) => Err(CommandError::new(
            "FOCUS_PRESENTATION_FAILED",
            format!("Board-to-Focus morph worker failed: {error}"),
        )),
    };

    if let Err(error) = transition {
        let recovery = restore_main_after_blitz_morph(&main, main_snapshot);
        drop(hold);
        return match recovery {
            Ok(()) => {
                eprintln!("Board-to-Focus morph failed; using direct Focus handoff: {error}");
                show_focus_after_blitz_entry(&app_handle, &main, &focus)
            }
            Err(recovery) => Err(CommandError::new(
                "FOCUS_PRESENTATION_RECOVERY_FAILED",
                format!("{error}; Main rollback failed: {recovery}"),
            )),
        };
    }

    if let Err(error) = main.hide() {
        let recovery = restore_main_after_blitz_morph(&main, main_snapshot);
        drop(hold);
        return match recovery {
            Ok(()) => {
                eprintln!(
                    "Could not hide Main at the Board-to-Focus morph endpoint; using direct Focus handoff: {error}"
                );
                show_focus_after_blitz_entry(&app_handle, &main, &focus)
            }
            Err(recovery) => Err(CommandError::new(
                "FOCUS_PRESENTATION_RECOVERY_FAILED",
                format!("{error}; Main rollback failed: {recovery}"),
            )),
        };
    }

    // Match the source-backed handoff: once the frozen Main reaches the Focus
    // target, remove Main from view, restore its exact user geometry while it
    // is hidden, clear the finite raster, then reveal the prepared Focus host.
    if let Err(recovery) = restore_main_after_blitz_morph(&main, main_snapshot) {
        drop(hold);
        let visibility_recovery = show_and_focus(&main);
        return match visibility_recovery {
            Ok(()) => Err(recovery),
            Err(visibility) => Err(CommandError::new(
                "FOCUS_PRESENTATION_RECOVERY_FAILED",
                format!("{recovery}; Main visibility recovery failed: {visibility}"),
            )),
        };
    }
    drop(hold);

    if let Err(error) = show_and_focus(&focus) {
        let _ = focus.hide();
        return match show_and_focus(&main) {
            Ok(()) => Err(error),
            Err(recovery) => Err(CommandError::new(
                "FOCUS_PRESENTATION_RECOVERY_FAILED",
                format!("{error}; restored Main could not be shown: {recovery}"),
            )),
        };
    }

    request_blitz_panel_after_reveal(&app_handle)
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
    let (work_area, scale_factor, side) = preferred_focus_panel_work_area(app_handle)?;
    if let Err(error) = apply_panel_native(&window, work_area, scale_factor, side) {
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

pub(crate) fn refresh_open_timer_region_for_dpi_change(
    app_handle: &tauri::AppHandle,
    scale_factor: f64,
) -> CommandResult<bool> {
    if current_focus_surface_mode() != Some(FocusSurfaceMode::Timer) {
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

    let presentation =
        current_focus_surface_presentation().unwrap_or(FocusSurfacePresentation::TimerCompact);
    focus_frame_hold::clear(&window)?;
    timer_region::apply_with_scale(&window, presentation.region(), scale_factor)?;
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

#[cfg(test)]
mod focus_position_motion_tests {
    use super::{
        focus_panel_animation_size, interpolate_blitz_morph_rect, interpolate_focus_axis,
        GeometryPoint, GeometryRect, GeometrySize,
    };

    #[test]
    fn same_dpi_panel_animation_uses_actual_outer_host_size() {
        let work_area = GeometryRect {
            position: GeometryPoint { x: 0, y: 0 },
            size: GeometrySize {
                width: 1_024,
                height: 768,
            },
        };
        let size = focus_panel_animation_size(
            GeometrySize {
                width: 356,
                height: 709,
            },
            work_area,
            1.0,
            1.0,
        )
        .expect("same-DPI animation size");

        assert_eq!(size.width, 356);
        assert_eq!(size.height, 709);
    }

    #[test]
    fn cross_dpi_panel_animation_keeps_target_scale_host_size() {
        let work_area = GeometryRect {
            position: GeometryPoint { x: 0, y: 0 },
            size: GeometrySize {
                width: 1_920,
                height: 1_080,
            },
        };
        let size = focus_panel_animation_size(
            GeometrySize {
                width: 356,
                height: 709,
            },
            work_area,
            1.0,
            1.25,
        )
        .expect("cross-DPI animation size");

        assert_eq!(size.width, 425);
        assert_eq!(size.height, 875);
    }

    #[test]
    fn fluent_point_to_point_motion_preserves_exact_endpoints() {
        assert_eq!(interpolate_focus_axis(10, 110, 0, 10).expect("start"), 10);
        assert_eq!(interpolate_focus_axis(10, 110, 10, 10).expect("end"), 110);
    }

    #[test]
    fn fluent_point_to_point_motion_covers_distance_early_then_settles() {
        let early = interpolate_focus_axis(0, 1000, 1, 10).expect("early");
        let midpoint = interpolate_focus_axis(0, 1000, 5, 10).expect("midpoint");
        let late = interpolate_focus_axis(0, 1000, 9, 10).expect("late");
        assert!((100..=130).contains(&early));
        assert!(midpoint > 900);
        assert!(late > 990);
    }

    #[test]
    fn blitz_board_morph_interpolates_position_and_size_to_exact_target() {
        let start = GeometryRect {
            position: GeometryPoint { x: 120, y: 80 },
            size: GeometrySize {
                width: 1_000,
                height: 700,
            },
        };
        let target = GeometryRect {
            position: GeometryPoint { x: 1_580, y: 0 },
            size: GeometrySize {
                width: 340,
                height: 700,
            },
        };
        assert_eq!(
            interpolate_blitz_morph_rect(start, target, 0, 14).expect("start"),
            start,
        );
        let middle = interpolate_blitz_morph_rect(start, target, 7, 14).expect("middle");
        assert!(middle.position.x > start.position.x);
        assert!(middle.size.width < start.size.width);
        assert_eq!(
            interpolate_blitz_morph_rect(start, target, 14, 14).expect("target"),
            target,
        );
    }

    #[test]
    fn eased_position_motion_is_monotonic_for_forward_and_reverse_travel() {
        let mut forward = i32::MIN;
        let mut reverse = i32::MAX;
        for step in 0..=17 {
            let next_forward = interpolate_focus_axis(-1200, 2400, step, 17).expect("forward step");
            let next_reverse = interpolate_focus_axis(2400, -1200, step, 17).expect("reverse step");
            assert!(next_forward >= forward);
            assert!(next_reverse <= reverse);
            forward = next_forward;
            reverse = next_reverse;
        }
    }
}

fn build_main_window(app_handle: &tauri::AppHandle) -> CommandResult<tauri::WebviewWindow> {
    tauri::WebviewWindowBuilder::new(
        app_handle,
        MAIN_WINDOW_LABEL,
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("Narro Main")
    .inner_size(800.0, 600.0)
    .disable_drag_drop_handler()
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

pub(crate) fn show_current_focus_surface(app_handle: &tauri::AppHandle) -> CommandResult<()> {
    let presentation =
        current_focus_surface_presentation().unwrap_or(FocusSurfacePresentation::Panel);
    apply_focus_surface_presentation_internal(app_handle, presentation, None)?;
    let window = get_window(app_handle, FOCUS_SURFACE_LABEL)?;
    show_and_focus(&window)
}

#[tauri::command]
fn focus_surface_show(app_handle: tauri::AppHandle) -> CommandResult<()> {
    show_current_focus_surface(&app_handle)
}

#[tauri::command]
fn focus_surface_hide(app_handle: tauri::AppHandle) -> CommandResult<()> {
    if let Err(error) = floating_placement::save_if_timer_visible(&app_handle) {
        eprintln!("Could not save Floating Timer position before hide: {error}");
    }
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    focus_frame_hold::clear(&window)?;
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
    apply_focus_surface_presentation_internal(&app_handle, FocusSurfacePresentation::Panel, None)?;
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    show_and_focus(&window)
}

#[tauri::command]
fn focus_surface_mode_timer(app_handle: tauri::AppHandle) -> CommandResult<()> {
    apply_focus_surface_presentation_internal(
        &app_handle,
        FocusSurfacePresentation::TimerCompact,
        None,
    )?;
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
                if let Err(error) = show_current_focus_surface(app_handle) {
                    eprintln!("Failed to show Narro focus surface: {error}");
                }
            } else if event.id() == "quit" {
                validation_log::record_tray_quit_requested(app_handle);
                let save_result = floating_placement::save_if_timer_visible(app_handle);
                let (placement_saved, save_error) = match &save_result {
                    Ok(saved) => (*saved, None),
                    Err(error) => (false, Some(error.to_string())),
                };
                if let Err(error) = save_result {
                    eprintln!("Could not save Floating Timer position before exit: {error}");
                }
                validation_log::record_tray_quit_completed(
                    app_handle,
                    placement_saved,
                    save_error.as_deref(),
                );
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
    let identifier = app.config().identifier.as_str();
    if identifier.eq_ignore_ascii_case(M1_DIAGNOSTIC_APP_IDENTIFIER)
        && !storage_path_matches_identifier(&app_dir, identifier)
    {
        return Err(startup_error(
            "validate diagnostic app data isolation",
            format!(
                "resolved app-data directory {} does not end in diagnostic identifier {}",
                app_dir.display(),
                identifier
            ),
        )
        .into());
    }
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
        .plugin(tauri_plugin_single_instance::init(
            |app_handle, _argv, _cwd| {
                validation_log::record_single_instance_attempt(app_handle);
                request_show_or_recreate_main(app_handle.clone());
            },
        ))
        .on_window_event(|window, event| {
            if window.label() == FOCUS_SURFACE_LABEL
                && current_focus_surface_mode() == Some(FocusSurfaceMode::Timer)
            {
                match event {
                    tauri::WindowEvent::Moved(position) => {
                        let accepted_for_persistence =
                            floating_placement::note_timer_moved(window.app_handle());
                        validation_log::record_timer_move(
                            window.app_handle(),
                            GeometryPoint {
                                x: position.x,
                                y: position.y,
                            },
                            accepted_for_persistence,
                        );
                    }
                    tauri::WindowEvent::CloseRequested { .. } => {
                        validation_log::record_focus_close_requested(window.app_handle());
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
            report_commands::get_report_history,
            report_commands::get_report_overview,
            report_commands::export_report_overview_pdf,
            report_commands::get_report_sessions,
            report_commands::export_report_sessions_csv,
            report_commands::get_report_task_sessions,
            report_commands::create_manual_report_session,
            report_commands::edit_report_session,
            report_commands::delete_report_session,
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
            timer_pause_for_focus_home,
            timer_resume_focus_home_pause,
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
            diagnostic_storage_paths,
            focus_surface_show,
            focus_surface_hide,
            focus_surface_focus,
            focus_surface_presentation_snapshot,
            focus_runtime_capture_checkpoint,
            focus_runtime_capture_acknowledged,
            focus_runtime_capture_seed_timer_placement,
            focus_surface_apply_presentation,
            focus_surface_capture_compact_frame,
            focus_surface_animate_presentation,
            focus_surface_mode_snapshot,
            focus_surface_mode_panel,
            focus_surface_mode_timer,
            list_windows,
            list_monitors,
            focus_panel_placement_probe,
            position_focus_panel,
            present_focus_panel,
            present_focus_for_blitz
        ])
        .setup(|app| {
            validation_log::initialize(app)
                .map_err(|error| startup_error("initialize M7 validation logging", error))?;
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
