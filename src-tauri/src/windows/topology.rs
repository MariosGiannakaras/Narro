use super::{recover_window_top_left, validate_work_area, PhysicalPoint, PhysicalRect, PhysicalSize};
use std::io;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::OnceLock;
use tauri::Manager;
use windows_sys::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
use windows_sys::Win32::UI::Shell::{DefSubclassProc, RemoveWindowSubclass, SetWindowSubclass};
use windows_sys::Win32::UI::WindowsAndMessaging::{WM_DISPLAYCHANGE, WM_NCDESTROY};

const FOCUS_SURFACE_LABEL: &str = "focusSurface";
const RECOVERABLE_WINDOW_LABELS: [&str; 2] = ["main", FOCUS_SURFACE_LABEL];
const DISPLAY_CHANGE_SUBCLASS_ID: usize = 0x4e_41_52_52_4f;

static DISPLAY_APP_HANDLE: OnceLock<tauri::AppHandle> = OnceLock::new();
static RECOVERY_PENDING: AtomicBool = AtomicBool::new(false);

pub fn install_display_change_observer(app: &tauri::App) -> Result<(), io::Error> {
    let focus_surface = app
        .get_webview_window(FOCUS_SURFACE_LABEL)
        .ok_or_else(|| io::Error::other("focusSurface does not exist during display observer setup"))?;
    let hwnd = focus_surface
        .hwnd()
        .map_err(|error| io::Error::other(format!("resolve focusSurface HWND: {error}")))?;

    DISPLAY_APP_HANDLE
        .set(app.handle().clone())
        .map_err(|_| io::Error::other("display observer app handle was already initialized"))?;

    let raw_hwnd = hwnd.0 as HWND;
    let installed = unsafe {
        SetWindowSubclass(
            raw_hwnd,
            Some(display_change_subclass_proc),
            DISPLAY_CHANGE_SUBCLASS_ID,
            0,
        )
    };
    if installed == 0 {
        return Err(io::Error::other(
            "SetWindowSubclass returned false while installing display observer",
        ));
    }

    Ok(())
}

unsafe extern "system" fn display_change_subclass_proc(
    hwnd: HWND,
    message: u32,
    wparam: WPARAM,
    lparam: LPARAM,
    subclass_id: usize,
    _reference_data: usize,
) -> LRESULT {
    if message == WM_DISPLAYCHANGE {
        schedule_display_recovery();
    } else if message == WM_NCDESTROY {
        let _ = unsafe {
            RemoveWindowSubclass(hwnd, Some(display_change_subclass_proc), subclass_id)
        };
    }

    unsafe { DefSubclassProc(hwnd, message, wparam, lparam) }
}

fn schedule_display_recovery() {
    if RECOVERY_PENDING.swap(true, Ordering::AcqRel) {
        return;
    }

    let Some(app_handle) = DISPLAY_APP_HANDLE.get().cloned() else {
        RECOVERY_PENDING.store(false, Ordering::Release);
        eprintln!("Display topology changed before the Narro app handle was available");
        return;
    };

    let recovery_handle = app_handle.clone();
    if let Err(error) = app_handle.run_on_main_thread(move || {
        match recover_visible_windows(&recovery_handle) {
            Ok(moved_labels) if !moved_labels.is_empty() => {
                println!(
                    "Display topology recovery moved window(s): {}",
                    moved_labels.join(", ")
                );
            }
            Ok(_) => {}
            Err(error) => eprintln!("Display topology recovery failed: {error}"),
        }
        RECOVERY_PENDING.store(false, Ordering::Release);
    }) {
        RECOVERY_PENDING.store(false, Ordering::Release);
        eprintln!("Failed to schedule display topology recovery: {error}");
    }
}

fn monitor_work_area(monitor: &tauri::window::Monitor) -> PhysicalRect {
    let work_area = monitor.work_area();
    PhysicalRect {
        position: PhysicalPoint {
            x: work_area.position.x,
            y: work_area.position.y,
        },
        size: PhysicalSize {
            width: work_area.size.width,
            height: work_area.size.height,
        },
    }
}

fn recover_visible_windows(app_handle: &tauri::AppHandle) -> Result<Vec<&'static str>, io::Error> {
    let monitors = app_handle
        .available_monitors()
        .map_err(|error| io::Error::other(format!("enumerate monitors after display change: {error}")))?;

    let work_areas: Vec<_> = monitors
        .iter()
        .map(monitor_work_area)
        .filter(|work_area| validate_work_area(*work_area).is_ok())
        .collect();
    let fallback_work_area = app_handle
        .primary_monitor()
        .ok()
        .flatten()
        .map(|monitor| monitor_work_area(&monitor))
        .filter(|work_area| validate_work_area(*work_area).is_ok())
        .or_else(|| work_areas.first().copied())
        .ok_or_else(|| io::Error::other("Windows reported no valid work area after display change"))?;

    let mut moved_labels = Vec::new();
    let mut failures = Vec::new();

    for label in RECOVERABLE_WINDOW_LABELS {
        let Some(window) = app_handle.get_webview_window(label) else {
            continue;
        };

        match recover_window(&window, &work_areas, fallback_work_area) {
            Ok(true) => moved_labels.push(label),
            Ok(false) => {}
            Err(error) => failures.push(format!("{label}: {error}")),
        }
    }

    if failures.is_empty() {
        Ok(moved_labels)
    } else {
        Err(io::Error::other(failures.join("; ")))
    }
}

fn recover_window(
    window: &tauri::WebviewWindow,
    work_areas: &[PhysicalRect],
    fallback_work_area: PhysicalRect,
) -> Result<bool, String> {
    let minimized = window
        .is_minimized()
        .map_err(|error| format!("read minimized state: {error}"))?;
    let maximized = window
        .is_maximized()
        .map_err(|error| format!("read maximized state: {error}"))?;
    let fullscreen = window
        .is_fullscreen()
        .map_err(|error| format!("read fullscreen state: {error}"))?;
    if minimized || maximized || fullscreen {
        return Ok(false);
    }

    let position = window
        .outer_position()
        .map_err(|error| format!("read outer position: {error}"))?;
    let size = window
        .outer_size()
        .map_err(|error| format!("read outer size: {error}"))?;
    let current_window = PhysicalRect {
        position: PhysicalPoint {
            x: position.x,
            y: position.y,
        },
        size: PhysicalSize {
            width: size.width,
            height: size.height,
        },
    };
    let recovered_position = recover_window_top_left(
        current_window,
        work_areas,
        fallback_work_area,
    )
    .map_err(|error| format!("compute visible position: {error}"))?;

    if recovered_position == current_window.position {
        return Ok(false);
    }

    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: recovered_position.x,
            y: recovered_position.y,
        }))
        .map_err(|error| format!("move into visible work area: {error}"))?;
    Ok(true)
}
