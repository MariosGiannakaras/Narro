pub mod domain;
pub mod persistence;
pub mod timer;
pub mod scheduling;
pub mod recurrence;
pub mod windows;
pub mod notifications;
pub mod shortcuts;

use domain::{AppState, AppStatePayload};
use tauri::{Emitter, Manager, State};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};

#[tauri::command]
fn get_state(state: State<'_, AppState>) -> AppStatePayload {
    state.data.lock().unwrap().clone()
}

#[tauri::command]
fn toggle_timer(state: State<'_, AppState>, app_handle: tauri::AppHandle) -> AppStatePayload {
    let cloned_data = {
        let mut data = state.data.lock().unwrap();
        data.is_running = !data.is_running;
        if data.is_running && data.active_task.is_none() {
            data.active_task = Some("Implement Milestone 1".into());
        } else if !data.is_running {
            data.active_task = None;
        }
        data.clone()
    };

    let _ = app_handle.emit("state-changed", cloned_data.clone());
    cloned_data
}

#[tauri::command]
fn mutate_state(
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<AppStatePayload, String> {
    let cloned_data = {
        let mut data = state.data.lock().unwrap();
        data.counter += 1;
        data.active_task = Some(format!("Task mutation {}", data.counter));
        data.clone()
    };

    app_handle
        .emit("state-changed", cloned_data.clone())
        .map_err(|e| e.to_string())?;
    Ok(cloned_data)
}

fn show_and_focus(window: &tauri::WebviewWindow) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

fn build_main_window(app_handle: &tauri::AppHandle) -> Result<tauri::WebviewWindow, String> {
    tauri::WebviewWindowBuilder::new(
        app_handle,
        "main",
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("Narro Main")
    .inner_size(800.0, 600.0)
    .build()
    .map_err(|e| e.to_string())
}

async fn show_or_recreate_main(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        return show_and_focus(&window);
    }

    let window = build_main_window(&app_handle)?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

fn request_show_or_recreate_main(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        if let Err(error) = show_or_recreate_main(app_handle).await {
            eprintln!("Failed to show/recreate Narro main window: {error}");
        }
    });
}

#[tauri::command]
fn main_window_show(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("main window not found".into())
    }
}

#[tauri::command]
fn main_window_hide(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("main window not found".into())
    }
}

#[tauri::command]
fn main_window_focus(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.set_focus().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("main window not found".into())
    }
}

#[tauri::command]
fn main_window_destroy(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.destroy().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("main window not found".into())
    }
}

#[tauri::command]
fn main_window_close(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.close().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("main window not found".into())
    }
}

#[tauri::command]
async fn main_window_recreate(app_handle: tauri::AppHandle) -> Result<(), String> {
    if app_handle.get_webview_window("main").is_some() {
        return Err("main window already exists".into());
    }

    let window = build_main_window(&app_handle)?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn focus_surface_show(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("focusSurface") {
        window.show().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("focusSurface window not found".into())
    }
}

#[tauri::command]
fn focus_surface_hide(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("focusSurface") {
        window.hide().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("focusSurface window not found".into())
    }
}

#[tauri::command]
fn focus_surface_focus(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("focusSurface") {
        window.set_focus().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("focusSurface window not found".into())
    }
}

#[tauri::command]
fn focus_surface_mode_panel(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("focusSurface") {
        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 400.0,
                height: 700.0,
            }))
            .map_err(|e| e.to_string())?;
        window.set_always_on_top(false).map_err(|e| e.to_string())?;
        window.set_skip_taskbar(false).map_err(|e| e.to_string())?;
        window.show().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("focusSurface window not found".into())
    }
}

#[tauri::command]
fn focus_surface_mode_timer(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("focusSurface") {
        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 300.0,
                height: 100.0,
            }))
            .map_err(|e| e.to_string())?;
        window.set_always_on_top(true).map_err(|e| e.to_string())?;
        window.set_skip_taskbar(true).map_err(|e| e.to_string())?;
        window.show().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("focusSurface window not found".into())
    }
}

#[tauri::command]
fn list_windows(app_handle: tauri::AppHandle) -> Vec<String> {
    app_handle.webview_windows().keys().cloned().collect()
}

fn install_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let show_main = MenuItem::with_id(app, "show-main", "Show Narro", true, None::<&str>)?;
    let show_focus = MenuItem::with_id(
        app,
        "show-focus",
        "Show Focus Surface",
        true,
        None::<&str>,
    )?;
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
                if let Some(window) = app_handle.get_webview_window("focusSurface") {
                    if let Err(error) = show_and_focus(&window) {
                        eprintln!("Failed to show Narro focus surface: {error}");
                    }
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
            list_windows
        ])
        .setup(|app| {
            install_tray(app)?;

            // Minimal SQLite wireup (not full persistence yet, just opening it to prove migration works).
            let app_dir = app.path().app_data_dir().expect("Failed to get app_data_dir");
            std::fs::create_dir_all(&app_dir)?;
            let db_path = app_dir.join("narro.db");
            let mut conn = rusqlite::Connection::open(db_path)?;

            persistence::run_migrations(&mut conn)
                .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;

            // Prove SQLite works.
            let id = uuid::Uuid::new_v4().to_string();
            let now = chrono::Utc::now().to_rfc3339();
            conn.execute(
                "INSERT INTO _diagnostic_startup (id, started_at) VALUES (?1, ?2)",
                rusqlite::params![id, now],
            )?;

            println!("SQLite migration and insert successful. ID: {}", id);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
