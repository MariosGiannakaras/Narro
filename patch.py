import sys

# 1. Update src-tauri/src/lib.rs
with open('src-tauri/src/lib.rs', 'r') as f:
    lib_rs = f.read()

# We replace the commands from mutate_state down to list_windows
commands_start = lib_rs.find('#[tauri::command]\nfn main_window_show')
commands_end = lib_rs.find('#[cfg_attr(mobile, tauri::mobile_entry_point)]')

new_commands = '''#[tauri::command]
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
fn main_window_recreate(app_handle: tauri::AppHandle) -> Result<(), String> {
    if app_handle.get_webview_window("main").is_none() {
        tauri::WebviewWindowBuilder::new(
            &app_handle,
            "main",
            tauri::WebviewUrl::App("index.html".into())
        )
        .title("Narro Main")
        .inner_size(800.0, 600.0)
        .build()
        .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("main window already exists".into())
    }
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
        window.set_size(tauri::Size::Logical(tauri::LogicalSize { width: 400.0, height: 700.0 })).map_err(|e| e.to_string())?;
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
        window.set_size(tauri::Size::Logical(tauri::LogicalSize { width: 300.0, height: 100.0 })).map_err(|e| e.to_string())?;
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

'''

lib_rs = lib_rs[:commands_start] + new_commands + lib_rs[commands_end:]

# Update generate_handler to include new commands
handler_old = '''        .invoke_handler(tauri::generate_handler![
            get_state,
            toggle_timer,
            mutate_state,
            main_window_show,
            main_window_hide,
            main_window_focus,
            main_window_destroy,
            main_window_recreate,
            focus_surface_mode_panel,
            focus_surface_mode_timer,
            list_windows
        ])'''
        
handler_new = '''        .invoke_handler(tauri::generate_handler![
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
        ])'''
lib_rs = lib_rs.replace(handler_old, handler_new)

with open('src-tauri/src/lib.rs', 'w') as f:
    f.write(lib_rs)

