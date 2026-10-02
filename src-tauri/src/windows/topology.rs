use super::{
    recover_window_top_left, validate_work_area, PhysicalPoint, PhysicalRect, PhysicalSize,
};
use crate::timer_service::TimerService;
use std::ffi::c_void;
use std::io;
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicUsize, Ordering};
use std::sync::OnceLock;
use tauri::Manager;

const FOCUS_SURFACE_LABEL: &str = "focusSurface";
const OBSERVED_WINDOW_LABELS: [&str; 1] = [FOCUS_SURFACE_LABEL];
const RECOVERABLE_WINDOW_LABELS: [&str; 1] = ["main"];
const DISPLAY_CHANGE_SUBCLASS_ID: usize = 0x4e_41_52_52_4f;
const WM_SETTING_CHANGE: u32 = 0x001a;
const WM_DISPLAY_CHANGE: u32 = 0x007e;
const WM_POWER_BROADCAST: u32 = 0x0218;
const WM_ENTERSIZEMOVE: u32 = 0x0231;
const WM_EXITSIZEMOVE: u32 = 0x0232;
const WM_DPICHANGED: u32 = 0x02e0;
const WM_NC_DESTROY: u32 = 0x0082;
const SPI_SETWORKAREA: usize = 0x002f;
const PBT_APM_SUSPEND: usize = 0x0004;
const PBT_APM_RESUME_CRITICAL: usize = 0x0006;
const PBT_APM_RESUME_SUSPEND: usize = 0x0007;
const PBT_APM_RESUME_AUTOMATIC: usize = 0x0012;
const USER_DEFAULT_SCREEN_DPI: u32 = 96;

type RawHwnd = *mut c_void;
type SubclassProc =
    Option<unsafe extern "system" fn(RawHwnd, u32, usize, isize, usize, usize) -> isize>;

#[link(name = "comctl32")]
unsafe extern "system" {
    #[link_name = "SetWindowSubclass"]
    fn set_window_subclass(
        hwnd: RawHwnd,
        subclass_proc: SubclassProc,
        subclass_id: usize,
        reference_data: usize,
    ) -> i32;

    #[link_name = "RemoveWindowSubclass"]
    fn remove_window_subclass(
        hwnd: RawHwnd,
        subclass_proc: SubclassProc,
        subclass_id: usize,
    ) -> i32;

    #[link_name = "DefSubclassProc"]
    fn def_subclass_proc(hwnd: RawHwnd, message: u32, wparam: usize, lparam: isize) -> isize;
}

#[link(name = "kernel32")]
unsafe extern "system" {
    #[link_name = "GetTickCount64"]
    fn get_tick_count_64() -> u64;
}

static DISPLAY_APP_HANDLE: OnceLock<tauri::AppHandle> = OnceLock::new();
static RECOVERY_PENDING: AtomicBool = AtomicBool::new(false);
static RECOVERY_DIRTY: AtomicBool = AtomicBool::new(false);
static INTERACTIVE_MOVE_ACTIVE: AtomicBool = AtomicBool::new(false);
static RECOVERY_SUSPENSIONS: AtomicUsize = AtomicUsize::new(0);
static DPI_REGION_REFRESH_PENDING: AtomicBool = AtomicBool::new(false);
static DPI_REGION_REFRESH_DIRTY: AtomicBool = AtomicBool::new(false);
static PENDING_DPI_X: AtomicU32 = AtomicU32::new(USER_DEFAULT_SCREEN_DPI);

pub(crate) struct DisplayRecoveryGuard;

pub(crate) fn suspend_focus_display_recovery() -> DisplayRecoveryGuard {
    RECOVERY_SUSPENSIONS.fetch_add(1, Ordering::AcqRel);
    DisplayRecoveryGuard
}

impl Drop for DisplayRecoveryGuard {
    fn drop(&mut self) {
        if RECOVERY_SUSPENSIONS.fetch_sub(1, Ordering::AcqRel) == 1
            && RECOVERY_DIRTY.load(Ordering::Acquire)
            && !INTERACTIVE_MOVE_ACTIVE.load(Ordering::Acquire)
        {
            schedule_display_recovery();
        }
    }
}

fn recovery_suspended(interactive_move: bool, explicit_suspensions: usize) -> bool {
    interactive_move || explicit_suspensions != 0
}

fn display_recovery_suspended() -> bool {
    recovery_suspended(
        INTERACTIVE_MOVE_ACTIVE.load(Ordering::Acquire),
        RECOVERY_SUSPENSIONS.load(Ordering::Acquire),
    )
}

pub fn install_display_change_observer(app: &tauri::App) -> Result<(), io::Error> {
    DISPLAY_APP_HANDLE.set(app.handle().clone()).map_err(|_| {
        io::Error::other("display/power observer app handle was already initialized")
    })?;

    let mut installed_hwnds = Vec::new();
    for label in OBSERVED_WINDOW_LABELS {
        let result = (|| -> Result<RawHwnd, io::Error> {
            let window = app.get_webview_window(label).ok_or_else(|| {
                io::Error::other(format!(
                    "{label} missing during display/power observer setup"
                ))
            })?;
            let hwnd = window
                .hwnd()
                .map_err(|error| io::Error::other(format!("resolve {label} HWND: {error}")))?;
            let raw_hwnd = hwnd.0 as isize as RawHwnd;
            if unsafe {
                set_window_subclass(
                    raw_hwnd,
                    Some(display_change_subclass_proc),
                    DISPLAY_CHANGE_SUBCLASS_ID,
                    0,
                )
            } == 0
            {
                return Err(io::Error::other(format!(
                    "SetWindowSubclass failed for {label} display/power observer"
                )));
            }
            Ok(raw_hwnd)
        })();
        match result {
            Ok(hwnd) => installed_hwnds.push(hwnd),
            Err(error) => {
                for hwnd in installed_hwnds {
                    unsafe {
                        remove_window_subclass(
                            hwnd,
                            Some(display_change_subclass_proc),
                            DISPLAY_CHANGE_SUBCLASS_ID,
                        );
                    }
                }
                return Err(error);
            }
        }
    }

    Ok(())
}

fn is_display_geometry_change(message: u32, wparam: usize) -> bool {
    message == WM_DISPLAY_CHANGE
        || message == WM_DPICHANGED
        || (message == WM_SETTING_CHANGE && wparam == SPI_SETWORKAREA)
}

fn dpi_x_from_wparam(wparam: usize) -> u32 {
    (wparam & 0xffff) as u32
}

fn dpi_scale(dpi: u32) -> Option<f64> {
    (dpi != 0).then_some(f64::from(dpi) / f64::from(USER_DEFAULT_SCREEN_DPI))
}

fn should_refresh_timer_region_for_interactive_dpi(
    message: u32,
    interactive_move: bool,
    explicit_suspensions: usize,
) -> bool {
    message == WM_DPICHANGED && interactive_move && explicit_suspensions == 0
}

fn is_power_resume_event(event: usize) -> bool {
    matches!(
        event,
        PBT_APM_RESUME_CRITICAL | PBT_APM_RESUME_SUSPEND | PBT_APM_RESUME_AUTOMATIC
    )
}

unsafe extern "system" fn display_change_subclass_proc(
    hwnd: RawHwnd,
    message: u32,
    wparam: usize,
    lparam: isize,
    subclass_id: usize,
    _reference_data: usize,
) -> isize {
    if message == WM_ENTERSIZEMOVE {
        INTERACTIVE_MOVE_ACTIVE.store(true, Ordering::Release);
        crate::diagnostic_trace::record(
            "windows_enter_size_move",
            serde_json::json!({ "message": message }),
        );
    } else if message == WM_EXITSIZEMOVE {
        INTERACTIVE_MOVE_ACTIVE.store(false, Ordering::Release);
        crate::diagnostic_trace::record(
            "windows_exit_size_move",
            serde_json::json!({
                "message": message,
                "recoveryDirty": RECOVERY_DIRTY.load(Ordering::Acquire),
            }),
        );
        if RECOVERY_DIRTY.load(Ordering::Acquire) {
            schedule_display_recovery();
        }
    } else if message == WM_DPICHANGED {
        let interactive_move = INTERACTIVE_MOVE_ACTIVE.load(Ordering::Acquire);
        let explicit_suspensions = RECOVERY_SUSPENSIONS.load(Ordering::Acquire);
        let dpi_x = dpi_x_from_wparam(wparam);
        crate::diagnostic_trace::record(
            "windows_dpi_changed",
            serde_json::json!({
                "message": message,
                "dpiX": dpi_x,
                "scaleFactor": dpi_scale(dpi_x),
                "interactiveMove": interactive_move,
                "recoverySuspensions": explicit_suspensions,
            }),
        );
        if should_refresh_timer_region_for_interactive_dpi(
            message,
            interactive_move,
            explicit_suspensions,
        ) {
            schedule_focus_region_refresh_for_dpi(dpi_x);
        }
        // Keep the existing full recovery dirty while an interactive move is
        // active. It will resize/reposition the fixed host only after
        // WM_EXITSIZEMOVE, so recovery cannot fight the user's drag.
        schedule_display_recovery();
    } else if is_display_geometry_change(message, wparam) {
        let kind = if message == WM_DISPLAY_CHANGE {
            "display-change"
        } else {
            "work-area-change"
        };
        crate::diagnostic_trace::record(
            "windows_display_geometry_changed",
            serde_json::json!({
                "kind": kind,
                "message": message,
                "wparam": wparam,
                "lparam": lparam,
            }),
        );
        schedule_display_recovery();
    } else if message == WM_POWER_BROADCAST {
        handle_power_broadcast(wparam);
        if is_power_resume_event(wparam) {
            schedule_display_recovery();
        }
    } else if message == WM_NC_DESTROY {
        INTERACTIVE_MOVE_ACTIVE.store(false, Ordering::Release);
        let _ = unsafe {
            remove_window_subclass(hwnd, Some(display_change_subclass_proc), subclass_id)
        };
    }

    unsafe { def_subclass_proc(hwnd, message, wparam, lparam) }
}

fn handle_power_broadcast(event: usize) {
    if !matches!(
        event,
        PBT_APM_SUSPEND
            | PBT_APM_RESUME_CRITICAL
            | PBT_APM_RESUME_SUSPEND
            | PBT_APM_RESUME_AUTOMATIC
    ) {
        return;
    }

    let Some(app_handle) = DISPLAY_APP_HANDLE.get() else {
        eprintln!("Windows power event arrived before the Narro app handle was available");
        return;
    };
    let power_tick_ms = unsafe { get_tick_count_64() };
    let timer_service = app_handle.state::<TimerService>();
    let result = if event == PBT_APM_SUSPEND {
        timer_service.handle_power_suspend(app_handle, power_tick_ms)
    } else {
        timer_service.handle_power_resume(app_handle, power_tick_ms)
    };
    if let Err(error) = result {
        eprintln!("Windows power-event timer handling failed: {error}");
    }
}

fn schedule_focus_region_refresh_for_dpi(dpi_x: u32) {
    let Some(scale_factor) = dpi_scale(dpi_x) else {
        return;
    };
    crate::diagnostic_trace::record(
        "dpi_region_refresh_requested",
        serde_json::json!({
            "dpiX": dpi_x,
            "scaleFactor": scale_factor,
        }),
    );

    PENDING_DPI_X.store(dpi_x, Ordering::Release);
    DPI_REGION_REFRESH_DIRTY.store(true, Ordering::Release);
    if DPI_REGION_REFRESH_PENDING.swap(true, Ordering::AcqRel) {
        return;
    }

    let Some(app_handle) = DISPLAY_APP_HANDLE.get().cloned() else {
        DPI_REGION_REFRESH_DIRTY.store(false, Ordering::Release);
        DPI_REGION_REFRESH_PENDING.store(false, Ordering::Release);
        eprintln!("Focus DPI region refresh arrived before the Narro app handle was available");
        return;
    };

    tauri::async_runtime::spawn(async move {
        let refresh_handle = app_handle.clone();
        if let Err(error) = app_handle.run_on_main_thread(move || {
            DPI_REGION_REFRESH_DIRTY.store(false, Ordering::Release);
            let latest_dpi = PENDING_DPI_X.load(Ordering::Acquire);
            let latest_scale = dpi_scale(latest_dpi).unwrap_or(scale_factor);

            match crate::refresh_open_timer_region_for_dpi_change(&refresh_handle, latest_scale) {
                Ok(changed) => crate::diagnostic_trace::record(
                    "dpi_region_refresh_applied",
                    serde_json::json!({
                        "dpiX": latest_dpi,
                        "scaleFactor": latest_scale,
                        "changed": changed,
                    }),
                ),
                Err(error) => {
                    crate::diagnostic_trace::record(
                        "dpi_region_refresh_failed",
                        serde_json::json!({
                            "dpiX": latest_dpi,
                            "scaleFactor": latest_scale,
                            "error": error.to_string(),
                        }),
                    );
                    eprintln!("Floating Timer DPI-region refresh failed: {error}");
                }
            }

            DPI_REGION_REFRESH_PENDING.store(false, Ordering::Release);
            if DPI_REGION_REFRESH_DIRTY.load(Ordering::Acquire) {
                schedule_focus_region_refresh_for_dpi(PENDING_DPI_X.load(Ordering::Acquire));
            }
        }) {
            DPI_REGION_REFRESH_PENDING.store(false, Ordering::Release);
            eprintln!("Failed to schedule Focus DPI-region refresh on the main thread: {error}");
        }
    });
}

fn schedule_display_recovery() {
    RECOVERY_DIRTY.store(true, Ordering::Release);
    let suspended = display_recovery_suspended();
    crate::diagnostic_trace::record(
        "display_recovery_requested",
        serde_json::json!({
            "suspended": suspended,
            "interactiveMove": INTERACTIVE_MOVE_ACTIVE.load(Ordering::Acquire),
            "explicitSuspensions": RECOVERY_SUSPENSIONS.load(Ordering::Acquire),
        }),
    );
    if suspended {
        return;
    }
    if RECOVERY_PENDING.swap(true, Ordering::AcqRel) {
        return;
    }

    let Some(app_handle) = DISPLAY_APP_HANDLE.get().cloned() else {
        RECOVERY_DIRTY.store(false, Ordering::Release);
        RECOVERY_PENDING.store(false, Ordering::Release);
        eprintln!("Display topology changed before the Narro app handle was available");
        return;
    };

    tauri::async_runtime::spawn(async move {
        let recovery_handle = app_handle.clone();
        if let Err(error) = app_handle.run_on_main_thread(move || {
            crate::record_diagnostic_runtime_snapshot(
                &recovery_handle,
                "display-recovery-before",
            );
            // This pass observes the latest topology at execution time. If another display
            // event arrives while recovery is running, RECOVERY_DIRTY becomes true again and
            // schedules a follow-up pass after the current one releases RECOVERY_PENDING.
            RECOVERY_DIRTY.store(false, Ordering::Release);
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

            match crate::revalidate_open_focus_panel_after_display_change(&recovery_handle) {
                Ok(true) => {
                    println!("Display topology recovery revalidated the open Focus Panel");
                }
                Ok(false) => {}
                Err(error) => eprintln!(
                    "Focus Panel selected-monitor revalidation failed after visible-area recovery: {error}"
                ),
            }

            let timer_recovery_ok = match crate::revalidate_open_timer_after_display_change(
                &recovery_handle,
            ) {
                Ok(true) => {
                    println!("Display topology recovery resized or moved the open Timer");
                    true
                }
                Ok(false) => true,
                Err(error) => {
                    eprintln!("Floating Timer visible-area recovery failed after display change: {error}");
                    false
                }
            };

            if timer_recovery_ok {
                if let Err(error) = crate::floating_placement::save_if_timer_visible(&recovery_handle) {
                    crate::diagnostic_trace::record(
                        "display_recovery_timer_save_failed",
                        serde_json::json!({ "error": error.to_string() }),
                    );
                    eprintln!("Floating Timer placement revalidation failed after display change: {error}");
                }
            }

            crate::record_diagnostic_runtime_snapshot(
                &recovery_handle,
                "display-recovery-after",
            );
            crate::diagnostic_trace::record(
                "display_recovery_completed",
                serde_json::json!({ "timerRecoveryOk": timer_recovery_ok }),
            );
            RECOVERY_PENDING.store(false, Ordering::Release);
            if RECOVERY_DIRTY.load(Ordering::Acquire) {
                schedule_display_recovery();
            }
        }) {
            RECOVERY_PENDING.store(false, Ordering::Release);
            eprintln!("Failed to schedule display topology recovery on the main thread: {error}");
        }
    });
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
    let monitors = app_handle.available_monitors().map_err(|error| {
        io::Error::other(format!("enumerate monitors after display change: {error}"))
    })?;

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
        .ok_or_else(|| {
            io::Error::other("Windows reported no valid work area after display change")
        })?;

    let mut moved_labels = Vec::new();
    let mut failures = Vec::new();

    for label in RECOVERABLE_WINDOW_LABELS {
        // focusSurface uses presentation-aware visible-region recovery below;
        // this generic pass is intentionally limited to ordinary windows.
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
    let recovered_position =
        recover_window_top_left(current_window, work_areas, fallback_work_area)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn display_geometry_messages_schedule_recovery() {
        assert!(is_display_geometry_change(WM_DISPLAY_CHANGE, 0));
        assert!(is_display_geometry_change(WM_DPICHANGED, 0));
        assert!(is_display_geometry_change(
            WM_SETTING_CHANGE,
            SPI_SETWORKAREA
        ));
    }

    #[test]
    fn dpi_message_extracts_monitor_scale() {
        let packed = usize::from(120_u16) | (usize::from(120_u16) << 16);
        assert_eq!(dpi_x_from_wparam(packed), 120);
        assert_eq!(dpi_scale(120), Some(1.25));
        assert_eq!(dpi_scale(96), Some(1.0));
        assert_eq!(dpi_scale(0), None);
    }

    #[test]
    fn interactive_dpi_refresh_skips_programmatic_moves() {
        assert!(should_refresh_timer_region_for_interactive_dpi(
            WM_DPICHANGED,
            true,
            0
        ));
        assert!(!should_refresh_timer_region_for_interactive_dpi(
            WM_DPICHANGED,
            false,
            0
        ));
        assert!(!should_refresh_timer_region_for_interactive_dpi(
            WM_DPICHANGED,
            true,
            1
        ));
        assert!(!should_refresh_timer_region_for_interactive_dpi(
            WM_DISPLAY_CHANGE,
            true,
            0
        ));
    }

    #[test]
    fn unrelated_window_messages_do_not_schedule_display_recovery() {
        assert!(!is_display_geometry_change(WM_SETTING_CHANGE, 0));
        assert!(!is_display_geometry_change(WM_POWER_BROADCAST, 0));
        assert!(!is_display_geometry_change(WM_ENTERSIZEMOVE, 0));
        assert!(!is_display_geometry_change(WM_EXITSIZEMOVE, 0));
        assert!(!is_display_geometry_change(WM_NC_DESTROY, 0));
    }

    #[test]
    fn interactive_or_programmatic_moves_defer_display_recovery() {
        assert!(recovery_suspended(true, 0));
        assert!(recovery_suspended(false, 1));
        assert!(recovery_suspended(true, 1));
        assert!(!recovery_suspended(false, 0));
    }

    #[test]
    fn native_move_loop_messages_are_distinct_from_geometry_notifications() {
        assert_eq!(WM_ENTERSIZEMOVE, 0x0231);
        assert_eq!(WM_EXITSIZEMOVE, 0x0232);
        assert_ne!(WM_ENTERSIZEMOVE, WM_DPICHANGED);
        assert_ne!(WM_EXITSIZEMOVE, WM_DPICHANGED);
    }

    #[test]
    fn only_resume_power_events_request_display_revalidation() {
        assert!(!is_power_resume_event(PBT_APM_SUSPEND));
        assert!(is_power_resume_event(PBT_APM_RESUME_CRITICAL));
        assert!(is_power_resume_event(PBT_APM_RESUME_SUSPEND));
        assert!(is_power_resume_event(PBT_APM_RESUME_AUTOMATIC));
    }
}
