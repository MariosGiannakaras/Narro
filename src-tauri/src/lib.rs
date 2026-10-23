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
mod focus_layered_raster;
mod focus_mode_raster;
mod focus_motion_v4_raster;
mod focus_transition_trace;
pub mod focus_preferences;
pub mod focus_webview;
pub mod home_snapshot;
pub mod list_board;
pub mod list_builtin_icons;
pub mod list_editor;
pub mod list_settings;
pub mod main_focus_morph;
mod main_focus_raster;
mod normal_shutdown;
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
use std::sync::atomic::{AtomicU32, AtomicU8, Ordering as AtomicOrdering};
use std::sync::{Condvar, Mutex, MutexGuard};
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

static FOCUS_SURFACE_PRESENTATION_STATE: AtomicU8 = AtomicU8::new(FOCUS_PRESENTATION_UNKNOWN);
static FOCUS_PRESENTATION_GATE: Mutex<()> = Mutex::new(());
static FOCUS_MODE_RASTER: Mutex<Option<FocusModeRaster>> = Mutex::new(None);
static FOCUS_RASTER_TOKEN: AtomicU32 = AtomicU32::new(1);
static FOCUS_RASTER_CHANGED: Condvar = Condvar::new();

struct FocusModeRaster {
    token: u32,
    target: FocusSurfacePresentation,
    snapshot: FocusNativeSnapshot,
    outgoing: focus_mode_raster::Image,
    v4_plate: Option<focus_mode_raster::Image>,
    v4_layout: Option<focus_motion_v4_raster::Layout>,
    hold: focus_layered_raster::Hold,
    native_committed: bool,
    _placement_guard: floating_placement::PlacementTransitionGuard,
    _display_guard: windows::DisplayRecoveryGuard,
}

fn mode_raster_guard() -> CommandResult<MutexGuard<'static, Option<FocusModeRaster>>> {
    FOCUS_MODE_RASTER.lock().map_err(|_| {
        CommandError::new("FOCUS_MODE_RASTER_FAILED", "Focus raster lease is poisoned")
    })
}

fn ensure_no_mode_raster() -> CommandResult<()> {
    if mode_raster_guard()?.is_some() {
        return Err(CommandError::new(
            "FOCUS_PRESENTATION_BUSY",
            "Focus mode transition is still pending",
        ));
    }
    Ok(())
}

// Never block the UI thread while waiting for a native presentation lock.
// Retry only the recoverable transient busy state; a poisoned gate is terminal.
fn retry_busy_focus_recovery<T>(
    mut acquire: impl FnMut() -> CommandResult<T>,
    mut backoff: impl FnMut(),
) -> CommandResult<T> {
    loop {
        match acquire() {
            Err(error) if error.code == "FOCUS_PRESENTATION_BUSY" => backoff(),
            result => return result,
        }
    }
}

#[cfg(test)]
mod focus_raster_watchdog_recovery_tests {
    use super::*;

    #[test]
    fn transient_presentation_contention_retries_until_recovery_can_proceed() {
        let mut tries = 0;
        let mut backoffs = 0;
        let recovered = retry_busy_focus_recovery(
            || {
                tries += 1;
                if tries <= 2 {
                    Err(CommandError::new("FOCUS_PRESENTATION_BUSY", "gate held"))
                } else {
                    Ok(17_u32)
                }
            },
            || backoffs += 1,
        )
        .expect("the watchdog must not abandon a still-live lease on transient contention");
        assert_eq!(recovered, 17);
        assert_eq!(tries, 3);
        assert_eq!(backoffs, 2);
    }

    #[test]
    fn nonbusy_recovery_failure_is_not_retried() {
        let mut backoffs = 0;
        let error = retry_busy_focus_recovery(
            || {
                Err::<(), _>(CommandError::new(
                    "FOCUS_PRESENTATION_FAILED",
                    "gate poisoned",
                ))
            },
            || backoffs += 1,
        )
        .expect_err("unrecoverable lock failures must not spin");
        assert_eq!(error.code, "FOCUS_PRESENTATION_FAILED");
        assert_eq!(backoffs, 0);
    }
}

fn arm_mode_raster_watchdog(app: tauri::AppHandle, token: u32) {
    // Finish/rollback wakes this one-shot worker immediately. Renderer loss
    // cannot retain bitmap memory or display/placement suspensions forever.
    std::thread::spawn(move || {
        let Ok(raster) = FOCUS_MODE_RASTER.lock() else {
            return;
        };
        let waited =
            FOCUS_RASTER_CHANGED.wait_timeout_while(raster, Duration::from_secs(8), |active| {
                active.as_ref().is_some_and(|lease| lease.token == token)
            });
        let Ok((raster, expiry)) = waited else {
            return;
        };
        let expired =
            expiry.timed_out() && raster.as_ref().is_some_and(|lease| lease.token == token);
        drop(raster);
        if !expired {
            return;
        }
        // A native presentation can still own the gate at the exact expiry
        // instant. Retrying off the UI thread is essential: returning on
        // WouldBlock here would orphan the sole raster lease indefinitely.
        let _presentation_guard = match retry_busy_focus_recovery(presentation_guard, || {
            std::thread::sleep(Duration::from_millis(50))
        }) {
            Ok(guard) => guard,
            Err(error) => {
                eprintln!("Focus raster watchdog cannot acquire recovery gate: {error}");
                return;
            }
        };
        let Ok(mut raster) = mode_raster_guard() else {
            return;
        };
        if !raster.as_ref().is_some_and(|lease| lease.token == token) {
            return;
        }
        let lease = raster.take().expect("checked owned lease");
        if let Ok(window) = get_window(&app, FOCUS_SURFACE_LABEL) {
            if let Err(error) =
                restore_focus_native_snapshot_protected(&window, &lease.snapshot, Some(&lease))
            {
                eprintln!("Expired Focus raster native recovery failed: {error}");
            }
            announce_focus_surface_presentation(&app, lease.snapshot.presentation);
        }
        drop(lease);
        eprintln!(
            "Focus mode raster expired before renderer acknowledgement; native recovery attempted"
        );
        FOCUS_RASTER_CHANGED.notify_all();
    });
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct FocusPanelRequestPayload {
    resume_nonce: Option<String>,
}

fn presentation_guard() -> CommandResult<MutexGuard<'static, ()>> {
    // A synchronous UI command must not wait on a worker that needs that same
    // UI thread to present its raster. Reject contention instead of deadlocking.
    FOCUS_PRESENTATION_GATE
        .try_lock()
        .map_err(|error| match error {
            std::sync::TryLockError::WouldBlock => CommandError::new(
                "FOCUS_PRESENTATION_BUSY",
                "Another Focus native transaction is pending",
            ),
            std::sync::TryLockError::Poisoned(_) => CommandError::new(
                "FOCUS_PRESENTATION_FAILED",
                "Focus presentation gate is poisoned",
            ),
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
    focus_frame_hold::clear(window)?;
    focus_layered_raster::clear(window)?;
    restore_focus_native_snapshot_protected(window, snapshot, None)
}

fn restore_focus_native_snapshot_protected(
    window: &tauri::WebviewWindow,
    snapshot: &FocusNativeSnapshot,
    raster: Option<&FocusModeRaster>,
) -> CommandResult<()> {
    let mut failures = Vec::new();

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
    // Adopt the restored monitor DPI before restoring its exact physical size.
    if let Err(error) = window
        .set_size(tauri::Size::Physical(snapshot.size))
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "restore host size", error))
    {
        failures.push(error);
    }
    if let Some(raster) = raster {
        if let Err(error) = raster
            .hold
            .replace_transition_frame(raster.outgoing.size, raster.outgoing.bgra.clone())
        {
            failures.push(error);
        }
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

/// Motion v4 Focus-only ease: mirror src/focusMotionV4.ts smoothstep.
fn focus_motion_v4_easing(progress: f64) -> f64 {
    debug_assert!(progress.is_finite());
    let t = progress.clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

#[cfg(test)]
mod focus_motion_v4_easing_tests {
    use super::focus_motion_v4_easing;

    #[test]
    fn smoothstep_matches_renderer_contract_at_quarter_samples() {
        for (elapsed, expected) in [
            (0.0, 0.0),
            (0.25, 0.15625),
            (0.5, 0.5),
            (0.75, 0.84375),
            (1.0, 1.0),
        ] {
            assert!((focus_motion_v4_easing(elapsed) - expected).abs() < 1e-12);
        }
        assert_eq!(focus_motion_v4_easing(-1.0), 0.0);
        assert_eq!(focus_motion_v4_easing(2.0), 1.0);
    }

    #[test]
    fn smoothstep_is_bounded_and_monotonic_for_native_frame_steps() {
        let mut previous = 0.0;
        for step in 0..=100 {
            let current = focus_motion_v4_easing(f64::from(step) / 100.0);
            assert!(current >= previous && current <= 1.0);
            previous = current;
        }
        assert_eq!(previous, 1.0);
    }
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
    raster: &main_focus_raster::Raster,
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

    let begun = std::time::Instant::now();
    loop {
        let elapsed = (begun.elapsed().as_millis() as u64).min(duration_ms);
        raster.set_rect(interpolate_blitz_morph_rect(
            start,
            target,
            elapsed,
            duration_ms,
        )?)?;
        if elapsed == duration_ms {
            break;
        }
        let after_paint = begun.elapsed().as_millis() as u64;
        let next = main_focus_morph::next_frame_deadline(
            after_paint,
            duration_ms,
            FOCUS_POSITION_MOTION_STEP_MS,
        );
        let sleep = next.saturating_sub(after_paint);
        if sleep != 0 {
            std::thread::sleep(Duration::from_millis(sleep));
        }
    }
    Ok(())
}

fn render_mode_raster_frame(
    window: &tauri::WebviewWindow,
    lease: &FocusModeRaster,
    incoming: &focus_mode_raster::Image,
    progress: f64,
) -> CommandResult<()> {
    let scale = window
        .scale_factor()
        .map_err(|e| map_window_error(FOCUS_SURFACE_LABEL, "read transition DPI", e))?;
    let outer = window
        .outer_size()
        .map_err(|e| map_window_error(FOCUS_SURFACE_LABEL, "read transition host envelope", e))?;
    let visible = focus_mode_raster::envelope(
        lease.snapshot.presentation.region().height,
        lease.target.region().height,
        scale,
        outer,
        progress,
    )?;
    let frame = if let (Some(plate), Some(layout)) = (&lease.v4_plate, &lease.v4_layout) {
        // Experimental B-only semantic raster staging. A/PR389 continues to
        // use the exact original one-hierarchy compositor.
        focus_motion_v4_raster::compose(
            &lease.outgoing, incoming, plate, visible, progress,
            lease.target == FocusSurfacePresentation::TimerExpanded, layout,
        )?
    } else {
        focus_mode_raster::compose(&lease.outgoing, incoming, visible, progress)?
    };
    lease.hold.replace_transition_frame(visible, frame)
}

fn animate_focus_surface_presentation_internal(
    app_handle: &tauri::AppHandle,
    target: FocusSurfacePresentation,
    duration_ms: u64,
    raster_token: u32,
    incoming_png: Vec<u8>,
    incoming_size: tauri::PhysicalSize<u32>,
) -> CommandResult<()> {
    let _presentation_guard = presentation_guard()?;
    if duration_ms == 0 || duration_ms > FOCUS_POSITION_MOTION_MAX_MS {
        return Err(CommandError::invalid_argument(
            "durationMs",
            "invalid finite Focus motion duration",
        ));
    }
    let window = get_window(app_handle, FOCUS_SURFACE_LABEL)?;
    let mut raster = mode_raster_guard()?;
    let lease = raster.as_mut().ok_or_else(|| {
        CommandError::new("FOCUS_MODE_RASTER_FAILED", "mode raster was not prepared")
    })?;
    if lease.token != raster_token
        || lease.target != target
        || lease.native_committed
        || current_focus_surface_presentation() != Some(lease.snapshot.presentation)
    {
        return Err(CommandError::new(
            "FOCUS_MODE_RASTER_FAILED",
            "stale mode raster transaction",
        ));
    }
    let incoming = focus_mode_raster::decode(&incoming_png, incoming_size)?;
    let mut trace = focus_transition_trace::NativeMotionTrace::begin(
        raster_token,
        lease.snapshot.presentation.event_name(),
        target.event_name(),
        duration_ms,
    );
    let _save_guard = floating_placement::suspend_saves();
    let _display_recovery_guard = windows::suspend_focus_display_recovery();
    let target_position = if target == FocusSurfacePresentation::Panel {
        let (area, target_scale, side) = preferred_focus_panel_work_area(app_handle)?;
        let current = window.outer_size().map_err(|e| {
            map_window_error(FOCUS_SURFACE_LABEL, "read Panel animation outer size", e)
        })?;
        let source_scale = window.scale_factor().map_err(|e| {
            map_window_error(FOCUS_SURFACE_LABEL, "read Panel animation source DPI", e)
        })?;
        let size = focus_panel_animation_size(
            GeometrySize {
                width: current.width,
                height: current.height,
            },
            area,
            source_scale,
            target_scale,
        )?;
        focus_panel_edge_position(area, size, side).map_err(CommandError::window_geometry)?
    } else if lease.snapshot.presentation.mode() == FocusSurfaceMode::Timer {
        // Timer-only changes retain the current safe origin. Saved placement
        // restoration belongs to entering Timer from Panel, not every resize.
        floating_placement::safe_position_for_timer_region(
            app_handle,
            &window,
            target.expanded(),
            None,
        )?
    } else {
        planned_focus_presentation_position(app_handle, &window, target)?
    };
    let start = lease.snapshot.position;
    let started = std::time::Instant::now();
    let steps = duration_ms.div_ceil(FOCUS_POSITION_MOTION_STEP_MS).max(1);
    for step in 0..=steps {
        let deadline = Duration::from_millis(duration_ms * step / steps);
        if let Some(remaining) = deadline.checked_sub(started.elapsed()) {
            std::thread::sleep(remaining);
        }
        // One measured timeline owns position, visible envelope and complete
        // raster content. Work spent presenting a frame is not added as sleep.
        let elapsed = (started.elapsed().as_secs_f64() / (duration_ms as f64 / 1000.0)).min(1.0);
        let progress = focus_motion_v4_easing(elapsed);
        let axis = |from: i32, to: i32| -> CommandResult<i32> {
            let value = f64::from(from) + (f64::from(to) - f64::from(from)) * progress;
            if value < f64::from(i32::MIN) || value > f64::from(i32::MAX) {
                return Err(CommandError::new(
                    "FOCUS_MODE_RASTER_FAILED",
                    "transition position overflow",
                ));
            }
            Ok(value.round() as i32)
        };
        let desired = GeometryPoint {
            x: axis(start.x, target_position.x)?,
            y: axis(start.y, target_position.y)?,
        };
        let elapsed_ms = started.elapsed().as_secs_f64() * 1000.0;
        trace.frame("native.before-raster", step, elapsed_ms, progress, desired.x, desired.y);
        render_mode_raster_frame(&window, lease, &incoming, progress)?;
        // Mirror focus_mode_raster::compose's source choice for diagnosis.
        // This logs the selected raster hierarchy, not compositor scanout.
        let growing = u64::from(incoming.size.height) * u64::from(lease.outgoing.size.width)
            > u64::from(lease.outgoing.size.height) * u64::from(incoming.size.width);
        let source = if lease.v4_plate.is_some() && lease.v4_layout.is_some()
            && progress > 0.0 && progress < 1.0
        {
            "motion-v4-composite"
        } else if progress >= 1.0 || (progress > 0.0 && growing) {
            "incoming"
        } else {
            "outgoing"
        };
        trace.note("native.raster-source", serde_json::json!({
            "step": step,
            "source": source
        }));
        trace.frame("native.after-raster", step, elapsed_ms, progress, desired.x, desired.y);
        set_focus_position(&window, desired, "move protected Focus host")?;
        trace.frame("native.after-move", step, elapsed_ms, progress, desired.x, desired.y);
        if progress >= 1.0 {
            break;
        }
    }
    set_focus_position(&window, target_position, "finish protected Focus position")?;
    // The raster still covers WebView2 while the exceptional target-DPI host
    // correction settles. Ordinary same-DPI presentation changes never resize.
    if target == FocusSurfacePresentation::Panel {
        let (area, scale, side) = preferred_focus_panel_work_area(app_handle)?;
        let size = fit_focus_host_for_target_scale(&window, area, scale)?;
        let final_position =
            focus_panel_edge_position(area, size, side).map_err(CommandError::window_geometry)?;
        set_focus_position(
            &window,
            final_position,
            "finish protected Panel DPI placement",
        )?;
    } else if lease.snapshot.presentation.mode() != FocusSurfaceMode::Timer {
        floating_placement::restore_for_timer(app_handle, &window, target.expanded())?;
    }
    render_mode_raster_frame(&window, lease, &incoming, 1.0)?;
    set_focus_presentation_attributes(&window, target)?;
    lease.native_committed = true;
    trace.note("native.committed", serde_json::json!({ "target": target.event_name() }));
    announce_focus_surface_presentation(app_handle, target);
    Ok(())
}

fn apply_focus_surface_presentation_internal(
    app_handle: &tauri::AppHandle,
    target: FocusSurfacePresentation,
    compact_frame: Option<&[u8]>,
) -> CommandResult<()> {
    let _presentation_guard = presentation_guard()?;
    ensure_no_mode_raster()?;
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
            | "timer-compact-to-expanded-start"
            | "timer-expanded"
            | "timer-expanded-to-compact-start"
            | "timer-compact-returned"
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
            | "timer-compact-to-expanded-start"
            | "timer-expanded"
            | "timer-expanded-to-compact-start"
            | "timer-compact-returned"
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
fn focus_transition_trace_mark(
    window: tauri::WebviewWindow,
    stage: String,
    raster_token: Option<u32>,
) -> CommandResult<()> {
    if window.label() != FOCUS_SURFACE_LABEL {
        return Err(CommandError::invalid_argument("stage", "Focus renderer required"));
    }
    if !focus_transition_trace::renderer_mark(&stage, raster_token.unwrap_or_default()) {
        return Err(CommandError::invalid_argument("stage", "unrecognized trace phase"));
    }
    Ok(())
}

#[tauri::command(rename_all = "camelCase")]
async fn focus_surface_prepare_mode_raster(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
    presentation: String,
) -> CommandResult<u32> {
    if window.label() != FOCUS_SURFACE_LABEL {
        return Err(CommandError::new(
            "FOCUS_MODE_RASTER_FAILED",
            "mode raster requires the Focus renderer",
        ));
    }
    let target = parse_focus_surface_presentation(&presentation)?;
    let snapshot = capture_focus_native_snapshot(&window)?;
    if snapshot.presentation == target {
        return Err(CommandError::invalid_argument(
            "presentation",
            "raster requires a distinct Focus presentation",
        ));
    }
    let visible = timer_region::visible_size(&window, snapshot.presentation.region())?;
    let png = focus_frame_capture::capture(window.clone()).await?;
    tauri::async_runtime::spawn_blocking(move || {
        let _presentation_guard = presentation_guard()?;
        let mut raster = mode_raster_guard()?;
        if raster.is_some() {
            return Err(CommandError::new(
                "FOCUS_MODE_RASTER_FAILED",
                "another mode raster is pending",
            ));
        }
        let current = capture_focus_native_snapshot(&window)?;
        if current.presentation != snapshot.presentation
            || current.position != snapshot.position
            || current.size != snapshot.size
        {
            return Err(CommandError::new(
                "FOCUS_MODE_RASTER_FAILED",
                "Focus moved or changed while capturing outgoing pixels",
            ));
        }
        let outgoing = focus_mode_raster::decode(&png, visible)?;
        if snapshot.presentation.mode() == FocusSurfaceMode::Timer {
            if let Err(error) = floating_placement::save_if_timer_visible(&app_handle) {
                eprintln!("Could not save Timer placement before protected Panel return: {error}");
            }
        }
        focus_frame_hold::clear(&window)?;
        let hold = focus_layered_raster::begin_mode_transition(&window, visible, &png)?;
        let token = FOCUS_RASTER_TOKEN.fetch_add(1, AtomicOrdering::Relaxed);
        *raster = Some(FocusModeRaster {
            token,
            target,
            snapshot,
            outgoing,
            v4_plate: None,
            v4_layout: None,
            hold,
            native_committed: false,
            _placement_guard: floating_placement::suspend_saves(),
            _display_guard: windows::suspend_focus_display_recovery(),
        });
        drop(raster);
        arm_mode_raster_watchdog(app_handle, token);
        Ok(token)
    })
    .await
    .map_err(|error| CommandError::new("FOCUS_MODE_RASTER_FAILED", error.to_string()))?
}

/// Optional experimental B-only cleanplate, captured while the original
/// raster hold protects the live WebView. Any preparation failure leaves the
/// original compositor functional; the caller restores the DOM immediately.
#[tauri::command(rename_all = "camelCase")]
async fn focus_surface_prepare_v4_plate(
    window: tauri::WebviewWindow,
    raster_token: u32,
    layout: focus_motion_v4_raster::Layout,
) -> CommandResult<()> {
    if window.label() != FOCUS_SURFACE_LABEL {
        return Err(CommandError::new(
            "FOCUS_MODE_RASTER_FAILED", "Motion v4 requires the Focus renderer",
        ));
    }
    layout.validate()?;
    let extent = timer_region::visible_size(
        &window, FocusSurfacePresentation::TimerExpanded.region(),
    )?;
    let png = focus_frame_capture::capture(window).await?;
    tauri::async_runtime::spawn_blocking(move || {
        let plate = focus_mode_raster::decode(&png, extent)?;
        let mut raster = mode_raster_guard()?;
        let lease = raster.as_mut().ok_or_else(|| {
            CommandError::new("FOCUS_MODE_RASTER_FAILED", "no raster lease for Motion v4")
        })?;
        if lease.token != raster_token
            || lease.native_committed
            || lease.snapshot.presentation.mode() != FocusSurfaceMode::Timer
            || lease.target.mode() != FocusSurfaceMode::Timer
            || lease.v4_plate.is_some()
        {
            return Err(CommandError::new(
                "FOCUS_MODE_RASTER_FAILED", "stale or incompatible Motion v4 lease",
            ));
        }
        layout.validate_for_native(
            lease.snapshot.presentation.region().height,
            lease.target.region().height,
        )?;
        lease.v4_plate = Some(plate);
        lease.v4_layout = Some(layout);
        Ok(())
    })
    .await
    .map_err(|error| CommandError::new("FOCUS_MODE_RASTER_FAILED", error.to_string()))?
}

#[tauri::command(rename_all = "camelCase")]
async fn focus_surface_animate_presentation(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
    presentation: String,
    duration_ms: u64,
    raster_token: u32,
) -> CommandResult<()> {
    if window.label() != FOCUS_SURFACE_LABEL {
        return Err(CommandError::new(
            "FOCUS_MODE_RASTER_FAILED",
            "mode raster requires the Focus renderer",
        ));
    }
    let target = parse_focus_surface_presentation(&presentation)?;
    let incoming_size = timer_region::visible_size(&window, target.region())?;
    // CapturePreview sees complete DOM client pixels behind the GDI child;
    // parent region clipping and desktop/caption pixels are not the source.
    let incoming_png = focus_frame_capture::capture(window).await?;
    tauri::async_runtime::spawn_blocking(move || {
        animate_focus_surface_presentation_internal(
            &app_handle,
            target,
            duration_ms,
            raster_token,
            incoming_png,
            incoming_size,
        )
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
async fn focus_surface_finish_mode_raster(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
    raster_token: u32,
    rollback: bool,
) -> CommandResult<()> {
    if window.label() != FOCUS_SURFACE_LABEL {
        return Err(CommandError::new(
            "FOCUS_MODE_RASTER_FAILED",
            "mode raster requires the Focus renderer",
        ));
    }
    // Capture only after the renderer's two-paint publication barrier. Decode
    // validates its final DPI geometry before exposing live target pixels.
    let final_png = if rollback {
        None
    } else {
        Some(focus_frame_capture::capture(window.clone()).await?)
    };
    tauri::async_runtime::spawn_blocking(move || {
        let _presentation_guard = presentation_guard()?;
        let mut raster = mode_raster_guard()?;
        let lease = raster.as_mut().ok_or_else(|| {
            CommandError::new("FOCUS_MODE_RASTER_FAILED", "no mode raster to finish")
        })?;
        if lease.token != raster_token {
            return Err(CommandError::new(
                "FOCUS_MODE_RASTER_FAILED",
                "stale mode raster release",
            ));
        }
        if rollback {
            // Caller first paints the previous React view under protection.
            // Keep the raster until native rollback has restored geometry.
            let snapshot = lease.snapshot.clone();
            restore_focus_native_snapshot_protected(&window, &snapshot, Some(lease))?;
            announce_focus_surface_presentation(&app_handle, snapshot.presentation);
            lease.target = snapshot.presentation;
            lease.native_committed = true;
            // Rollback geometry is stage one. Caller paints at this restored
            // DPI, then requests the same validated forward release barrier.
            return Ok(());
        } else {
            if !lease.native_committed || current_focus_surface_presentation() != Some(lease.target)
            {
                return Err(CommandError::new(
                    "FOCUS_MODE_RASTER_FAILED",
                    "raster cannot release before native commit",
                ));
            }
            let visible = timer_region::visible_size(&window, lease.target.region())?;
            let final_image =
                focus_mode_raster::decode(final_png.as_ref().expect("forward capture"), visible)?;
            lease
                .hold
                .replace_transition_frame(visible, final_image.bgra)?;
        }
        lease.hold.release()?;
        *raster = None;
        FOCUS_RASTER_CHANGED.notify_all();
        Ok(())
    })
    .await
    .map_err(|error| CommandError::new("FOCUS_MODE_RASTER_FAILED", error.to_string()))?
}

#[tauri::command(rename_all = "camelCase")]
fn position_focus_panel(
    app_handle: tauri::AppHandle,
    monitor_key: String,
    side: FocusPanelSide,
) -> CommandResult<()> {
    let _presentation_guard = presentation_guard()?;
    ensure_no_mode_raster()?;
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
    let resume_nonce = app_handle
        .state::<TimerService>()
        .focus_home_pause_nonce()?
        .map(|nonce| nonce.to_string());
    app_handle
        .emit(
            FOCUS_PANEL_REQUEST_EVENT,
            FocusPanelRequestPayload { resume_nonce },
        )
        .map_err(|error| {
            CommandError::new(
                "FOCUS_PRESENTATION_FAILED",
                format!("failed to request Focus Panel after Blitz reveal: {error}"),
            )
        })
}

fn recover_main_after_blitz_reveal_failure(
    main: &tauri::WebviewWindow,
    focus: &tauri::WebviewWindow,
    primary: CommandError,
) -> CommandError {
    if let Err(main_recovery) = show_and_focus(main) {
        return CommandError::new(
            "FOCUS_PRESENTATION_RECOVERY_FAILED",
            format!("{primary}; Main recovery failed: {main_recovery}"),
        );
    }
    if let Err(focus_recovery) = focus.hide() {
        return CommandError::new(
            "FOCUS_PRESENTATION_RECOVERY_FAILED",
            format!("{primary}; Focus rollback failed: {focus_recovery}"),
        );
    }
    primary
}

fn recover_after_blitz_raster_failure(
    main: &tauri::WebviewWindow,
    focus: &tauri::WebviewWindow,
    raster: &mut main_focus_raster::Raster,
    primary: CommandError,
) -> CommandError {
    // Always attempt both cleanup and visible-window recovery. An early `?`
    // here can leave Main hidden or skip Focus rollback when Win32 cleanup
    // itself fails; the raster watchdog is only the final safety net.
    let cleanup = raster.release().err();
    let recovery = recover_main_after_blitz_reveal_failure(main, focus, primary);
    match cleanup {
        Some(cleanup) => CommandError::new(
            "FOCUS_PRESENTATION_RECOVERY_FAILED",
            format!("{recovery}; Board raster cleanup failed: {cleanup}"),
        ),
        None => recovery,
    }
}

fn show_focus_after_blitz_entry(
    app_handle: &tauri::AppHandle,
    main: &tauri::WebviewWindow,
    focus: &tauri::WebviewWindow,
) -> CommandResult<()> {
    if let Err(error) = show_and_focus(focus) {
        return Err(recover_main_after_blitz_reveal_failure(main, focus, error));
    }
    if let Err(error) = main.hide() {
        let error = map_window_error(MAIN_WINDOW_LABEL, "hide after Blitz entry", error);
        return Err(recover_main_after_blitz_reveal_failure(main, focus, error));
    }
    if let Err(error) = request_blitz_panel_after_reveal(app_handle) {
        return Err(recover_main_after_blitz_reveal_failure(main, focus, error));
    }
    Ok(())
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
    let raster = match main_focus_raster::Raster::begin(&main, main_snapshot, visible, &frame) {
        Ok(raster) => raster,
        Err(error) => {
            eprintln!("Blitz pixel popup failed; using direct Focus handoff: {error}");
            return show_focus_after_blitz_entry(&app_handle, &main, &focus);
        }
    };

    // The outgoing pixels are a separate finite native popup. Main itself is
    // never resized, so WebView2 cannot recompose a clipped sidebar during the
    // move. The popup is unowned so hiding Main does not hide the pixels.
    if let Err(error) = main.hide() {
        drop(raster);
        let error = map_window_error(MAIN_WINDOW_LABEL, "hide for Blitz pixel morph", error);
        return Err(recover_main_after_blitz_reveal_failure(
            &main, &focus, error,
        ));
    }
    let transition = match tauri::async_runtime::spawn_blocking(move || {
        let result =
            animate_main_focus_rect(&raster, main_snapshot, focus_target, BLITZ_MAIN_MORPH_MS);
        (result, raster)
    })
    .await
    {
        Ok(result) => result,
        Err(error) => {
            let error = CommandError::new(
                "FOCUS_PRESENTATION_FAILED",
                format!("Board-to-Focus pixel morph worker failed: {error}"),
            );
            return Err(recover_main_after_blitz_reveal_failure(
                &main, &focus, error,
            ));
        }
    };
    let (transition, mut raster) = transition;

    if let Err(error) = transition {
        if let Err(cleanup) = raster.release() {
            return Err(recover_main_after_blitz_reveal_failure(
                &main,
                &focus,
                CommandError::new(
                    "FOCUS_PRESENTATION_RECOVERY_FAILED",
                    format!("Board pixel morph failed: {error}; raster cleanup failed: {cleanup}"),
                ),
            ));
        }
        eprintln!("Board pixel morph failed; using direct Focus handoff: {error}");
        return show_focus_after_blitz_entry(&app_handle, &main, &focus);
    }

    // Keep the complete outgoing Board available until the already-prepared
    // Focus host has an opaque compositor frame at the destination.
    if let Err(error) = main_focus_morph::reveal_opaque(&focus) {
        return Err(recover_after_blitz_raster_failure(
            &main,
            &focus,
            &mut raster,
            error,
        ));
    }
    raster
        .release()
        .map_err(|error| recover_main_after_blitz_reveal_failure(&main, &focus, error))?;

    if let Err(error) = request_blitz_panel_after_reveal(&app_handle) {
        return Err(recover_main_after_blitz_reveal_failure(
            &main, &focus, error,
        ));
    }
    Ok(())
}

pub(crate) fn revalidate_open_focus_panel_after_display_change(
    app_handle: &tauri::AppHandle,
) -> CommandResult<bool> {
    if current_focus_surface_mode() != Some(FocusSurfaceMode::Panel) {
        return Ok(false);
    }

    let _presentation_guard = presentation_guard()?;
    if mode_raster_guard()?.is_some() {
        return Ok(false);
    }
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
    if mode_raster_guard()?.is_some() {
        return Ok(false);
    }
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
    if mode_raster_guard()?.is_some() {
        return Ok(false);
    }
    floating_placement::revalidate_visible_timer_after_display_change(app_handle)
}

#[cfg(test)]
mod focus_position_motion_tests {
    use super::{
        focus_panel_animation_size, interpolate_blitz_morph_rect, interpolate_focus_axis,
        GeometryPoint, GeometryRect, GeometrySize,
    };

    #[test]
    fn contending_ui_presentation_command_returns_busy_without_waiting_for_worker() {
        let owner = super::FOCUS_PRESENTATION_GATE.lock().unwrap();
        let error = super::presentation_guard().unwrap_err();
        assert_eq!(error.code, "FOCUS_PRESENTATION_BUSY");
        drop(owner);
        assert!(super::presentation_guard().is_ok());
    }

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
                normal_shutdown::request_normal_exit(app_handle);
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
            board_task_schedule::quick_clear_list_board_task_schedule,
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
            list_settings::permanently_delete_archived_done_task_from_settings,
            theme_settings::get_theme_preference,
            theme_settings::set_theme_preference,
            preference_settings::get_preference_settings,
            preference_settings::update_preference_settings,
            report_commands::get_report_history,
            report_commands::get_focus_done_breaks,
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
            notifications::sound::drain_notification_sounds,
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
            focus_surface_prepare_mode_raster,
            focus_surface_prepare_v4_plate,
            focus_transition_trace_mark,
            focus_surface_animate_presentation,
            focus_surface_finish_mode_raster,
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
