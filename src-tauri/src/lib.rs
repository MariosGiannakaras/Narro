pub mod domain;
pub mod persistence;
pub mod timer;
pub mod scheduling;
pub mod recurrence;
pub mod windows;
pub mod notifications;
pub mod shortcuts;

use domain::{AppState, AppStatePayload};
use tauri::{Manager, State};

#[tauri::command]
fn get_state(state: State<'_, AppState>) -> AppStatePayload {
    state.data.lock().unwrap().clone()
}

#[tauri::command]
fn toggle_timer(state: State<'_, AppState>, app_handle: tauri::AppHandle) -> AppStatePayload {
    let mut data = state.data.lock().unwrap();
    data.is_running = !data.is_running;
    if data.is_running && data.active_task.is_none() {
        data.active_task = Some("Implement Milestone 1".into());
    } else if !data.is_running {
        data.active_task = None;
    }
    
    let cloned_data = data.clone();
    // Notify all windows of state change
    let _ = app_handle.emit("state-changed", cloned_data.clone());
    
    cloned_data
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![get_state, toggle_timer])
        .setup(|app| {
            // Minimal SQLite wireup (not full persistence yet, just opening it to prove migration works)
            // We'll create a local db in AppData
            let app_dir = app.path().app_data_dir().unwrap();
            std::fs::create_dir_all(&app_dir).unwrap();
            let db_path = app_dir.join("narro.db");
            let mut conn = rusqlite::Connection::open(db_path).unwrap();
            
            persistence::run_migrations(&mut conn).unwrap();

            // Prove SQLite works
            let id = uuid::Uuid::new_v4().to_string();
            let now = chrono::Utc::now().to_rfc3339();
            conn.execute("INSERT INTO _diagnostic_startup (id, started_at) VALUES (?1, ?2)", rusqlite::params![id, now]).unwrap();
            
            println!("SQLite migration and insert successful. ID: {}", id);
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
