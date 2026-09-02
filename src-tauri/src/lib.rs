pub mod domain;
pub mod error;
pub mod notifications;
pub mod persistence;
pub mod recurrence;
pub mod scheduling;
pub mod shortcuts;
pub mod timer;
pub mod windows;

use domain::{AppState, AppStatePayload};
use error::{CommandError, CommandResult};
use std::fmt::Display;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager, State};
use windows::{
    focus_panel_edge_position, validate_work_area, FocusPanelSide, MonitorDescriptor,
    PhysicalPoint as GeometryPoint, PhysicalRect as GeometryRect, PhysicalSize as GeometrySize,
};

const MAIN_WINDOW_LABEL: &str = "main";
const FOCUS_SURFACE_LABEL: &str = "focusSurface";
const STATE_CHANGED_EVENT: &str = "state-changed";
const MAX_MONITOR_KEY_LEN: usize = 2048;

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

fn configure_focus_surface_mode(
    window: &tauri::WebviewWindow,
    mode: FocusSurfaceMode,
) -> CommandResult<()> {
    let (width, height, always_on_top, skip_taskbar) = match mode {
        FocusSurfaceMode::Panel => (400.0, 700.0, false, false),
        FocusSurfaceMode::Timer => (300.0, 100.0, true, true),
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
    window
        .show()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "show", error))?;
    Ok(())
}

#[tauri::command(rename_all = "camelCase")]
fn position_focus_panel(
    app_handle: tauri::AppHandle,
    monitor_key: String,
    side: FocusPanelSide,
) -> CommandResult<()> {
    let (_monitor, descriptor) = resolve_monitor_by_key(&app_handle, &monitor_key)?;
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;

    // Move into the target work area before applying logical panel geometry so Windows/WebView2
    // can use the target monitor's DPI. The final edge position is computed from the actual
    // physical outer size after the resize.
    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: descriptor.work_area.position.x,
            y: descriptor.work_area.position.y,
        }))
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "move to target monitor", error))?;

    configure_focus_surface_mode(&window, FocusSurfaceMode::Panel)?;

    let window_size = window
        .outer_size()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "read outer size", error))?;
    let final_position = focus_panel_edge_position(
        descriptor.work_area,
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
    window
        .set_focus()
        .map_err(|error| map_window_error(FOCUS_SURFACE_LABEL, "focus", error))?;
    Ok(())
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

fn request_show_or_recreate_main(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        if let Err(error) = show_or_recreate_main(app_handle).await {
            eprintln!("Failed to show or recreate Narro main window: {error}");
        }
    });
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

enum FocusSurfaceMode {
    Panel,
    Timer,
}

#[tauri::command]
fn focus_surface_mode_panel(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    configure_focus_surface_mode(&window, FocusSurfaceMode::Panel)
}

#[tauri::command]
fn focus_surface_mode_timer(app_handle: tauri::AppHandle) -> CommandResult<()> {
    let window = get_window(&app_handle, FOCUS_SURFACE_LABEL)?;
    configure_focus_surface_mode(&window, FocusSurfaceMode::Timer)
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

fn initialize_persistence(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
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
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let result = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            get_state,
            toggle_timer,
            mutate_state,
            main_window_show,
            main_window_hide,
            main_window_focus,
            main_window_destroy,
            main_window_close,
            main_window_recreate,
            focus_surface_show,
            focus_surface_hide,
            focus_surface_focus,
            focus_surface_mode_panel,
            focus_surface_mode_timer,
            list_windows,
            list_monitors,
            position_focus_panel
        ])
        .setup(|app| {
            install_tray(app)?;
            initialize_persistence(app)?;
            Ok(())
        })
        .run(tauri::generate_context!());

    if let Err(error) = result {
        eprintln!("Fatal Narro runtime error: {error}");
        std::process::exit(1);
    }
}
