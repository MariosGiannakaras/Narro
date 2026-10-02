use crate::persistence::floating_placement::SavedFloatingPlacement;
use crate::windows::{PhysicalPoint, PhysicalRect};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock};
use std::time::Instant;
use tauri::Manager;

const VALIDATION_EXE_STEM: &str = "narro-m7-validation";
const LOG_ROOT_NAME: &str = "Narro-M7-Logs";
const EVENT_SCHEMA_VERSION: u8 = 1;
const QUALIFYING_MOVE_PX: i64 = 64;
const RESTORE_TOLERANCE_PX: i64 = 2;

static ENABLED: OnceLock<bool> = OnceLock::new();
static STATE: OnceLock<Mutex<ValidationState>> = OnceLock::new();

#[derive(Debug)]
struct ValidationState {
    root: PathBuf,
    session_dir: PathBuf,
    session_id: String,
    started: Instant,
    sequence: u64,
    timer_baseline: Option<PhysicalPoint>,
    max_move_distance_sq: i64,
    last_saved: Option<SavedFloatingPlacement>,
    pending: Option<PendingC5>,
    restore_evaluated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PendingC5 {
    schema_version: u8,
    source_session_id: String,
    created_utc: String,
    saved_placement: SavedFloatingPlacement,
    topology_signature: String,
    max_move_distance_px: u64,
    qualifying_move: bool,
    source_sha: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct MonitorSnapshot {
    index: usize,
    name: Option<String>,
    scale_factor: f64,
    position: PhysicalPoint,
    size: crate::windows::PhysicalSize,
    work_area: PhysicalRect,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct FocusSnapshot {
    visible: bool,
    presentation: Option<String>,
    position: PhysicalPoint,
    outer_size: crate::windows::PhysicalSize,
    scale_factor: f64,
}

fn validation_executable() -> bool {
    std::env::current_exe()
        .ok()
        .and_then(|path| path.file_stem().map(|stem| stem.to_string_lossy().into_owned()))
        .is_some_and(|stem| stem.eq_ignore_ascii_case(VALIDATION_EXE_STEM))
}

pub fn enabled() -> bool {
    *ENABLED.get_or_init(validation_executable)
}

fn utc_now() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}

fn safe_stamp() -> String {
    chrono::Utc::now().format("%Y%m%d-%H%M%S%.3fZ").to_string()
}

fn append_json_line(path: &Path, value: &Value) -> Result<(), String> {
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|error| format!("open {}: {error}", path.display()))?;
    serde_json::to_writer(&mut file, value)
        .map_err(|error| format!("serialize {}: {error}", path.display()))?;
    file.write_all(b"\n")
        .map_err(|error| format!("append {}: {error}", path.display()))?;
    file.flush()
        .map_err(|error| format!("flush {}: {error}", path.display()))
}

fn write_json(path: &Path, value: &impl Serialize) -> Result<(), String> {
    let bytes = serde_json::to_vec_pretty(value)
        .map_err(|error| format!("serialize {}: {error}", path.display()))?;
    fs::write(path, bytes).map_err(|error| format!("write {}: {error}", path.display()))
}

fn create_log_root(app: &tauri::App) -> Result<PathBuf, String> {
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            let beside_exe = parent.join(LOG_ROOT_NAME);
            if fs::create_dir_all(&beside_exe).is_ok() {
                return Ok(beside_exe);
            }
        }
    }

    let fallback = app
        .path()
        .app_local_data_dir()
        .map_err(|error| format!("resolve local app-data fallback for validation logs: {error}"))?
        .join("m7-validation-logs");
    fs::create_dir_all(&fallback)
        .map_err(|error| format!("create validation log fallback {}: {error}", fallback.display()))?;
    Ok(fallback)
}

fn read_pending(root: &Path) -> Option<PendingC5> {
    let bytes = fs::read(root.join("pending-c5.json")).ok()?;
    serde_json::from_slice(&bytes).ok()
}

fn monitor_snapshots(app_handle: &tauri::AppHandle) -> Vec<MonitorSnapshot> {
    app_handle
        .available_monitors()
        .unwrap_or_default()
        .into_iter()
        .enumerate()
        .map(|(index, monitor)| {
            let position = monitor.position();
            let size = monitor.size();
            let work = monitor.work_area();
            MonitorSnapshot {
                index,
                name: monitor.name().cloned(),
                scale_factor: monitor.scale_factor(),
                position: PhysicalPoint {
                    x: position.x,
                    y: position.y,
                },
                size: crate::windows::PhysicalSize {
                    width: size.width,
                    height: size.height,
                },
                work_area: PhysicalRect {
                    position: PhysicalPoint {
                        x: work.position.x,
                        y: work.position.y,
                    },
                    size: crate::windows::PhysicalSize {
                        width: work.size.width,
                        height: work.size.height,
                    },
                },
            }
        })
        .collect()
}

fn topology_signature(monitors: &[MonitorSnapshot]) -> String {
    let mut parts: Vec<String> = monitors
        .iter()
        .map(|monitor| {
            format!(
                "{}|{}|{}|{}|{}|{}|{}|{}|{}|{:016x}",
                monitor.name.as_deref().unwrap_or_default(),
                monitor.position.x,
                monitor.position.y,
                monitor.size.width,
                monitor.size.height,
                monitor.work_area.position.x,
                monitor.work_area.position.y,
                monitor.work_area.size.width,
                monitor.work_area.size.height,
                monitor.scale_factor.to_bits()
            )
        })
        .collect();
    parts.sort_unstable();
    parts.join("\n")
}

fn focus_snapshot(app_handle: &tauri::AppHandle) -> Option<FocusSnapshot> {
    let window = app_handle.get_webview_window("focusSurface")?;
    let position = window.outer_position().ok()?;
    let size = window.outer_size().ok()?;
    let visible = window.is_visible().ok()?;
    let scale_factor = window.scale_factor().ok()?;
    Some(FocusSnapshot {
        visible,
        presentation: crate::current_focus_surface_presentation()
            .map(|presentation| presentation.event_name().to_string()),
        position: PhysicalPoint {
            x: position.x,
            y: position.y,
        },
        outer_size: crate::windows::PhysicalSize {
            width: size.width,
            height: size.height,
        },
        scale_factor,
    })
}

fn record_event(app_handle: &tauri::AppHandle, event: &str, details: Value) {
    if !enabled() {
        return;
    }

    let monitors = monitor_snapshots(app_handle);
    let focus = focus_snapshot(app_handle);
    let timestamp_utc = utc_now();
    let Some(lock) = STATE.get() else {
        eprintln!("M7 validation log event before logger initialization: {event}");
        return;
    };
    let Ok(mut state) = lock.lock() else {
        eprintln!("M7 validation logger lock poisoned while recording {event}");
        return;
    };

    state.sequence = state.sequence.saturating_add(1);
    let value = json!({
        "schemaVersion": EVENT_SCHEMA_VERSION,
        "sequence": state.sequence,
        "timestampUtc": timestamp_utc,
        "elapsedMs": state.started.elapsed().as_millis(),
        "sessionId": state.session_id.as_str(),
        "processId": std::process::id(),
        "sourceSha": option_env!("NARRO_VALIDATION_SOURCE_SHA").unwrap_or("unknown"),
        "event": event,
        "focus": focus,
        "monitors": monitors,
        "details": details
    });
    if let Err(error) = append_json_line(&state.session_dir.join("events.jsonl"), &value) {
        eprintln!("M7 validation logging failed: {error}");
    }
}

fn result_document(
    status: &str,
    reason: &str,
    state: &ValidationState,
    extra: Value,
) -> Value {
    json!({
        "schemaVersion": EVENT_SCHEMA_VERSION,
        "test": "M7-C5-saved-placement-restart",
        "status": status,
        "reason": reason,
        "generatedUtc": utc_now(),
        "sourceSha": option_env!("NARRO_VALIDATION_SOURCE_SHA").unwrap_or("unknown"),
        "currentSessionId": state.session_id.as_str(),
        "pendingSourceSessionId": state.pending.as_ref().map(|pending| pending.source_session_id.as_str()),
        "metrics": extra
    })
}

fn write_result(state: &ValidationState, status: &str, reason: &str, extra: Value) {
    let value = result_document(status, reason, state, extra);
    for path in [
        state.root.join("m7-c5-latest-result.json"),
        state.session_dir.join("m7-c5-result.json"),
    ] {
        if let Err(error) = write_json(&path, &value) {
            eprintln!("M7 validation result write failed: {error}");
        }
    }
    if status != "PENDING" {
        if let Err(error) = write_json(&state.root.join("m7-c5-last-terminal-result.json"), &value) {
            eprintln!("M7 validation terminal-result write failed: {error}");
        }
    }
    if status == "PASS" {
        if let Err(error) = write_json(&state.root.join("m7-c5-last-pass.json"), &value) {
            eprintln!("M7 validation PASS archive write failed: {error}");
        }
    }
}

fn write_readme(root: &Path) {
    let path = root.join("README.txt");
    if path.is_file() {
        return;
    }
    let text = "Narro M7 validation logs\r\n\r\nThis folder is created automatically only when narro-m7-validation.exe runs.\r\nUpload the latest session-* folder plus m7-c5-latest-result.json for debugging.\r\nevents.jsonl contains technical window/monitor/persistence events with timestamps.\r\nNo task titles, notes, list names, task descriptions, telemetry, or cloud uploads are recorded.\r\nPASS requires a qualifying Timer drag, normal tray Quit, a new process/session, unchanged monitor topology, and a successful saved-position restore.\r\nFAIL means the recorded persistence/restore data contradicts the expected placement.\r\nINCONCLUSIVE means required evidence was missing or the topology changed during the restart test.\r\n";
    let _ = fs::write(path, text);
}

pub fn initialize(app: &tauri::App) -> Result<(), String> {
    if !enabled() {
        return Ok(());
    }
    if STATE.get().is_some() {
        return Ok(());
    }

    let root = create_log_root(app)?;
    write_readme(&root);
    let session_id = uuid::Uuid::new_v4().to_string();
    let session_dir = root.join(format!("session-{}-{}", safe_stamp(), std::process::id()));
    fs::create_dir_all(&session_dir)
        .map_err(|error| format!("create validation session {}: {error}", session_dir.display()))?;
    let pending = read_pending(&root);
    let state = ValidationState {
        root: root.clone(),
        session_dir: session_dir.clone(),
        session_id: session_id.clone(),
        started: Instant::now(),
        sequence: 0,
        timer_baseline: None,
        max_move_distance_sq: 0,
        last_saved: None,
        pending,
        restore_evaluated: false,
    };
    STATE
        .set(Mutex::new(state))
        .map_err(|_| "M7 validation logger was initialized concurrently".to_string())?;

    let metadata = json!({
        "schemaVersion": EVENT_SCHEMA_VERSION,
        "sessionId": session_id,
        "startedUtc": utc_now(),
        "processId": std::process::id(),
        "sourceSha": option_env!("NARRO_VALIDATION_SOURCE_SHA").unwrap_or("unknown"),
        "executableName": std::env::current_exe()
            .ok()
            .and_then(|path| path.file_name().map(|name| name.to_string_lossy().into_owned()))
            .unwrap_or_else(|| "unknown".to_string()),
        "privacy": {
            "localOnly": true,
            "recordsTaskContent": false,
            "recordsNotes": false,
            "recordsListNames": false,
            "uploadsAutomatically": false
        }
    });
    write_json(&session_dir.join("session.json"), &metadata)?;
    fs::write(
        root.join("LATEST.txt"),
        format!(
            "{}\r\n",
            session_dir
                .file_name()
                .and_then(|name| name.to_str())
                .unwrap_or("session-unknown")
        ),
    )
    .map_err(|error| format!("write validation LATEST.txt: {error}"))?;

    let app_handle = app.handle().clone();
    record_event(&app_handle, "validation-start", json!({ "logRoot": root.file_name().and_then(|name| name.to_str()) }));
    if let Some(lock) = STATE.get() {
        if let Ok(state) = lock.lock() {
            if state.pending.is_some() {
                write_result(
                    &state,
                    "PENDING",
                    "waiting-for-timer-restore-after-restart",
                    json!({}),
                );
            } else {
                write_result(
                    &state,
                    "PENDING",
                    "waiting-for-qualifying-timer-drag",
                    json!({ "qualifyingMoveThresholdPx": QUALIFYING_MOVE_PX }),
                );
            }
        }
    }
    Ok(())
}

pub fn record_single_instance_attempt(app_handle: &tauri::AppHandle) {
    if !enabled() {
        return;
    }
    record_event(app_handle, "second-launch-forwarded", json!({}));
}

pub fn record_presentation(app_handle: &tauri::AppHandle, presentation: &str) {
    if !enabled() {
        return;
    }
    let position = focus_snapshot(app_handle).map(|snapshot| snapshot.position);
    if presentation.starts_with("timer") {
        if let (Some(position), Some(lock)) = (position, STATE.get()) {
            if let Ok(mut state) = lock.lock() {
                state.timer_baseline.get_or_insert(position);
            }
        }
    }
    record_event(
        app_handle,
        "focus-presentation",
        json!({ "presentation": presentation }),
    );
}

pub fn record_timer_move(
    app_handle: &tauri::AppHandle,
    position: PhysicalPoint,
    accepted_for_persistence: bool,
) {
    if !enabled() {
        return;
    }
    let mut metrics = json!({
        "current": position,
        "acceptedForPersistence": accepted_for_persistence
    });
    if accepted_for_persistence {
        if let Some(lock) = STATE.get() {
            if let Ok(mut state) = lock.lock() {
                let baseline = *state.timer_baseline.get_or_insert(position);
                let dx = i64::from(position.x) - i64::from(baseline.x);
                let dy = i64::from(position.y) - i64::from(baseline.y);
                let distance_sq = dx.saturating_mul(dx).saturating_add(dy.saturating_mul(dy));
                state.max_move_distance_sq = state.max_move_distance_sq.max(distance_sq);
                let max_distance = integer_sqrt(state.max_move_distance_sq) as u64;
                metrics = json!({
                    "baseline": baseline,
                    "current": position,
                    "acceptedForPersistence": true,
                    "maxMoveDistancePx": max_distance,
                    "qualifyingMove": max_distance >= QUALIFYING_MOVE_PX as u64
                });
                if max_distance >= QUALIFYING_MOVE_PX as u64 {
                    write_result(
                        &state,
                        "PENDING",
                        "qualifying-drag-recorded-waiting-for-tray-quit",
                        metrics.clone(),
                    );
                }
            }
        }
    }
    record_event(app_handle, "focus-window-moved", metrics);
}

pub fn record_focus_close_requested(app_handle: &tauri::AppHandle) {
    if !enabled() {
        return;
    }
    record_event(app_handle, "focus-close-requested", json!({}));
}

pub fn record_placement_saved(
    app_handle: &tauri::AppHandle,
    saved: &SavedFloatingPlacement,
) {
    if !enabled() {
        return;
    }
    if let Some(lock) = STATE.get() {
        if let Ok(mut state) = lock.lock() {
            state.last_saved = Some(saved.clone());
        }
    }
    record_event(
        app_handle,
        "timer-placement-saved",
        json!({ "savedPlacement": saved }),
    );
}

pub fn record_tray_quit_requested(app_handle: &tauri::AppHandle) {
    if !enabled() {
        return;
    }
    record_event(app_handle, "tray-quit-requested", json!({}));
}

pub fn record_tray_quit_completed(
    app_handle: &tauri::AppHandle,
    placement_saved: bool,
    save_error: Option<&str>,
) {
    if !enabled() {
        return;
    }
    record_event(
        app_handle,
        "tray-quit-placement-save-complete",
        json!({
            "placementSaved": placement_saved,
            "saveError": save_error
        }),
    );

    let monitors = monitor_snapshots(app_handle);
    let topology = topology_signature(&monitors);
    let Some(lock) = STATE.get() else {
        return;
    };
    let Ok(mut state) = lock.lock() else {
        return;
    };
    let max_distance = integer_sqrt(state.max_move_distance_sq) as u64;
    let qualifying_move = max_distance >= QUALIFYING_MOVE_PX as u64;

    let Some(saved) = state.last_saved.clone().filter(|_| placement_saved) else {
        write_result(
            &state,
            "INCONCLUSIVE",
            "tray-quit-did-not-produce-a-visible-timer-placement-save",
            json!({
                "maxMoveDistancePx": max_distance,
                "saveError": save_error
            }),
        );
        return;
    };

    let pending = PendingC5 {
        schema_version: EVENT_SCHEMA_VERSION,
        source_session_id: state.session_id.clone(),
        created_utc: utc_now(),
        saved_placement: saved,
        topology_signature: topology,
        max_move_distance_px: max_distance,
        qualifying_move,
        source_sha: option_env!("NARRO_VALIDATION_SOURCE_SHA").unwrap_or("unknown").to_string(),
    };
    if let Err(error) = write_json(&state.root.join("pending-c5.json"), &pending) {
        eprintln!("M7 validation pending-state write failed: {error}");
        write_result(
            &state,
            "INCONCLUSIVE",
            "could-not-persist-cross-restart-validation-state",
            json!({ "error": error }),
        );
        return;
    }
    state.pending = Some(pending);
    write_result(
        &state,
        "PENDING",
        if qualifying_move {
            "normal-tray-quit-recorded-waiting-for-restart-and-timer-restore"
        } else {
            "tray-quit-recorded-but-drag-was-not-large-enough-for-automatic-pass"
        },
        json!({
            "maxMoveDistancePx": max_distance,
            "qualifyingMoveThresholdPx": QUALIFYING_MOVE_PX,
            "qualifyingMove": qualifying_move
        }),
    );
}

pub fn record_timer_restore(
    app_handle: &tauri::AppHandle,
    loaded_saved: Option<&SavedFloatingPlacement>,
    expected_position: PhysicalPoint,
    actual_rect: PhysicalRect,
    target_work_area: PhysicalRect,
) {
    if !enabled() {
        return;
    }
    record_event(
        app_handle,
        "timer-placement-restored",
        json!({
            "loadedSavedPlacement": loaded_saved,
            "expectedPosition": expected_position,
            "actualVisibleRect": actual_rect,
            "targetWorkArea": target_work_area
        }),
    );

    let monitors = monitor_snapshots(app_handle);
    let current_topology = topology_signature(&monitors);
    let Some(lock) = STATE.get() else {
        return;
    };
    let Ok(mut state) = lock.lock() else {
        return;
    };
    if state.restore_evaluated {
        return;
    }
    let Some(pending) = state.pending.clone() else {
        return;
    };
    if pending.source_session_id == state.session_id {
        return;
    }
    state.timer_baseline.get_or_insert(actual_rect.position);
    state.restore_evaluated = true;

    let current_source_sha = option_env!("NARRO_VALIDATION_SOURCE_SHA").unwrap_or("unknown");
    let (status, reason) = if pending.source_sha != current_source_sha {
        (
            "INCONCLUSIVE",
            "validation-executable-source-changed-between-quit-and-restart",
        )
    } else if !pending.qualifying_move {
        (
            "INCONCLUSIVE",
            "pre-quit-drag-did-not-meet-the-automatic-validation-distance-threshold",
        )
    } else if current_topology != pending.topology_signature {
        (
            "INCONCLUSIVE",
            "monitor-topology-changed-between-quit-and-restart",
        )
    } else if loaded_saved != Some(&pending.saved_placement) {
        (
            "FAIL",
            "persisted-placement-loaded-after-restart-does-not-match-the-placement-saved-at-quit",
        )
    } else if !position_within_tolerance(expected_position, actual_rect.position) {
        (
            "FAIL",
            "restored-timer-position-does-not-match-the-placement-engine-expected-position",
        )
    } else if !rect_within(target_work_area, actual_rect) {
        (
            "FAIL",
            "restored-timer-visible-region-is-outside-the-target-work-area",
        )
    } else {
        (
            "PASS",
            "qualifying-drag-normal-tray-quit-new-process-and-safe-saved-placement-restore-all-recorded",
        )
    };

    write_result(
        &state,
        status,
        reason,
        json!({
            "sourceSessionId": pending.source_session_id.as_str(),
            "restoreSessionId": state.session_id.as_str(),
            "maxMoveDistancePx": pending.max_move_distance_px,
            "savedPlacement": &pending.saved_placement,
            "loadedSavedPlacement": loaded_saved,
            "expectedPosition": expected_position,
            "actualPosition": actual_rect.position,
            "positionTolerancePx": RESTORE_TOLERANCE_PX,
            "targetWorkArea": target_work_area,
            "topologyUnchanged": current_topology == pending.topology_signature.as_str(),
            "sourceShaUnchanged": pending.source_sha.as_str() == current_source_sha
        }),
    );
    let _ = fs::remove_file(state.root.join("pending-c5.json"));
    state.pending = None;
}

fn integer_sqrt(value: i64) -> i64 {
    if value <= 0 {
        return 0;
    }
    (value as f64).sqrt().round() as i64
}

fn position_within_tolerance(expected: PhysicalPoint, actual: PhysicalPoint) -> bool {
    (i64::from(expected.x) - i64::from(actual.x)).abs() <= RESTORE_TOLERANCE_PX
        && (i64::from(expected.y) - i64::from(actual.y)).abs() <= RESTORE_TOLERANCE_PX
}

fn rect_within(area: PhysicalRect, rect: PhysicalRect) -> bool {
    let left = i64::from(rect.position.x);
    let top = i64::from(rect.position.y);
    let right = left + i64::from(rect.size.width);
    let bottom = top + i64::from(rect.size.height);
    let area_left = i64::from(area.position.x);
    let area_top = i64::from(area.position.y);
    let area_right = area_left + i64::from(area.size.width);
    let area_bottom = area_top + i64::from(area.size.height);
    left >= area_left && top >= area_top && right <= area_right && bottom <= area_bottom
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validation_activation_requires_explicit_validation_executable_name_contract() {
        assert_eq!(VALIDATION_EXE_STEM, "narro-m7-validation");
        assert_eq!(LOG_ROOT_NAME, "Narro-M7-Logs");
    }

    #[test]
    fn restore_tolerance_accepts_small_native_rounding_only() {
        let expected = PhysicalPoint { x: 400, y: 200 };
        assert!(position_within_tolerance(
            expected,
            PhysicalPoint { x: 402, y: 198 }
        ));
        assert!(!position_within_tolerance(
            expected,
            PhysicalPoint { x: 403, y: 200 }
        ));
    }

    #[test]
    fn visible_rect_must_remain_inside_work_area() {
        let area = PhysicalRect {
            position: PhysicalPoint { x: 0, y: 0 },
            size: crate::windows::PhysicalSize {
                width: 1920,
                height: 1040,
            },
        };
        assert!(rect_within(
            area,
            PhysicalRect {
                position: PhysicalPoint { x: 1500, y: 800 },
                size: crate::windows::PhysicalSize {
                    width: 340,
                    height: 110,
                },
            }
        ));
        assert!(!rect_within(
            area,
            PhysicalRect {
                position: PhysicalPoint { x: 1800, y: 800 },
                size: crate::windows::PhysicalSize {
                    width: 340,
                    height: 110,
                },
            }
        ));
    }
}
