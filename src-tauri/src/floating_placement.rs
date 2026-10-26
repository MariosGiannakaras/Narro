use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::floating_placement::SavedFloatingPlacement;
use crate::windows::{clamp_top_left, PhysicalPoint, PhysicalRect, PhysicalSize};
use std::sync::atomic::{AtomicBool, AtomicU64, AtomicUsize, Ordering};
use std::sync::Mutex;
use std::time::Duration;
use tauri::Manager;

const FOCUS_SURFACE_LABEL: &str = "focusSurface";
const MOVE_SETTLE_DELAY: Duration = Duration::from_millis(600);
static MOVE_REVISION: AtomicU64 = AtomicU64::new(0);
static MOVE_WORKER_ACTIVE: AtomicBool = AtomicBool::new(false);
static SAVE_SUSPENSIONS: AtomicUsize = AtomicUsize::new(0);
static USER_MOVE_START: Mutex<Option<PhysicalPoint>> = Mutex::new(None);
static USER_PLACEMENT_DIRTY: AtomicBool = AtomicBool::new(false);
// Timer position always lives in memory during a process. On a fresh launch,
// Preferences decide whether to restore an existing legacy/opt-in SQLite row.
// Neither mode removes legacy positions.
static SESSION_TIMER_PLACEMENT: Mutex<Option<SavedFloatingPlacement>> = Mutex::new(None);

fn session_timer_position() -> CommandResult<Option<SavedFloatingPlacement>> {
    SESSION_TIMER_PLACEMENT
        .lock()
        .map(|placement| placement.clone())
        .map_err(|error| placement_error("read session-only Timer position", error))
}

fn remember_position_after_restart(app_handle: &tauri::AppHandle) -> CommandResult<bool> {
    let connection = app_database(app_handle)?;
    persistence::preferences::get_preferences(&connection)
        .map(|record| {
            record.is_some_and(|record| record.payload.general.remember_timer_position_on_restart)
        })
        .map_err(|error| placement_error("read Timer restart-position preference", error))
}

fn effective_saved_placement(
    current_session: Option<SavedFloatingPlacement>,
    legacy: Option<SavedFloatingPlacement>,
    remember_after_restart: bool,
) -> Option<SavedFloatingPlacement> {
    current_session.or_else(|| if remember_after_restart { legacy } else { None })
}

fn timer_position_for_current_policy(
    app_handle: &tauri::AppHandle,
) -> CommandResult<Option<SavedFloatingPlacement>> {
    let session = session_timer_position()?;
    if session.is_some() {
        return Ok(session);
    }
    if !remember_position_after_restart(app_handle)? {
        return Ok(None);
    }
    let connection = app_database(app_handle)?;
    let previous = persistence::floating_placement::load(&connection)
        .map_err(|error| placement_error("load opted-in Timer position", error))?;
    Ok(effective_saved_placement(None, previous, true))
}

fn persist_session_placement_if_opted_in(
    app_handle: &tauri::AppHandle,
    saved: &SavedFloatingPlacement,
) -> CommandResult<()> {
    if remember_position_after_restart(app_handle)? {
        let connection = app_database(app_handle)?;
        persistence::floating_placement::save(
            &connection,
            saved,
            &chrono::Utc::now().to_rfc3339(),
        )
        .map_err(|error| placement_error("persist opted-in Timer position", error))?;
    }
    Ok(())
}

// Sync after the preference commits, including a Timer currently hidden.
// Without a user drag there is no new position to persist.
pub(crate) fn sync_session_position_on_preference_change(
    app_handle: &tauri::AppHandle,
) -> CommandResult<()> {
    if let Some(saved) = session_timer_position()? {
        persist_session_placement_if_opted_in(app_handle, &saved)?;
    }
    Ok(())
}

fn set_session_timer_position(placement: SavedFloatingPlacement) -> CommandResult<()> {
    let mut saved = SESSION_TIMER_PLACEMENT
        .lock()
        .map_err(|error| placement_error("update session-only Timer position", error))?;
    *saved = Some(placement);
    Ok(())
}


// OS recovery is temporary. Only a completed, non-cancelled interactive move
// may replace a remembered position on a monitor that is currently absent.
pub(crate) fn begin_user_timer_move(app: &tauri::AppHandle) {
    if crate::current_focus_surface_mode() != Some(crate::FocusSurfaceMode::Timer) {
        return;
    }
    let position = app
        .get_webview_window(FOCUS_SURFACE_LABEL)
        .and_then(|window| window.outer_position().ok())
        .map(|point| PhysicalPoint {
            x: point.x,
            y: point.y,
        });
    match USER_MOVE_START.lock() {
        Ok(mut start) => *start = position,
        Err(error) => eprintln!("Could not track interactive Timer move start: {error}"),
    }
}

pub(crate) fn finish_user_timer_move(app: &tauri::AppHandle) {
    let start = match USER_MOVE_START.lock() {
        Ok(mut value) => value.take(),
        Err(error) => {
            eprintln!("Could not finish interactive Timer move: {error}");
            return;
        }
    };
    if crate::current_focus_surface_mode() != Some(crate::FocusSurfaceMode::Timer) {
        return;
    }
    let end = app
        .get_webview_window(FOCUS_SURFACE_LABEL)
        .and_then(|window| window.outer_position().ok())
        .map(|point| PhysicalPoint {
            x: point.x,
            y: point.y,
        });
    if start.zip(end).is_some_and(|(start, end)| start != end) {
        USER_PLACEMENT_DIRTY.store(true, Ordering::Release);
        note_timer_moved(app);
    }
}

pub struct PlacementTransitionGuard;

pub fn suspend_saves() -> PlacementTransitionGuard {
    SAVE_SUSPENSIONS.fetch_add(1, Ordering::AcqRel);
    PlacementTransitionGuard
}

impl Drop for PlacementTransitionGuard {
    fn drop(&mut self) {
        SAVE_SUSPENSIONS.fetch_sub(1, Ordering::AcqRel);
    }
}

#[derive(Clone)]
struct WorkArea {
    name: Option<String>,
    rect: PhysicalRect,
    scale_factor: f64,
}

fn placement_error(context: &str, error: impl std::fmt::Display) -> CommandError {
    CommandError::new(
        "FLOATING_TIMER_PLACEMENT_FAILED",
        format!("{context}: {error}"),
    )
}

fn app_database(app_handle: &tauri::AppHandle) -> CommandResult<rusqlite::Connection> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|error| placement_error("resolve app data directory", error))?;
    let connection = rusqlite::Connection::open(app_dir.join("narro.db"))
        .map_err(|error| placement_error("open Narro database", error))?;
    persistence::configure_connection(&connection)
        .map_err(|error| placement_error("configure Narro database", error))?;
    Ok(connection)
}

fn work_area(monitor: &tauri::window::Monitor) -> WorkArea {
    let area = monitor.work_area();
    WorkArea {
        name: monitor.name().cloned(),
        scale_factor: monitor.scale_factor(),
        rect: PhysicalRect {
            position: PhysicalPoint {
                x: area.position.x,
                y: area.position.y,
            },
            size: PhysicalSize {
                width: area.size.width,
                height: area.size.height,
            },
        },
    }
}

fn available_work_areas(app_handle: &tauri::AppHandle) -> CommandResult<Vec<WorkArea>> {
    let monitors = app_handle
        .available_monitors()
        .map_err(|error| placement_error("enumerate monitors", error))?;
    let areas: Vec<_> = monitors
        .iter()
        .map(work_area)
        .filter(|area| area.rect.size.width > 0 && area.rect.size.height > 0)
        .collect();
    if areas.is_empty() {
        return Err(placement_error("enumerate monitors", "no valid work area"));
    }
    Ok(areas)
}

fn primary_work_area(app_handle: &tauri::AppHandle) -> Option<WorkArea> {
    app_handle
        .primary_monitor()
        .ok()
        .flatten()
        .map(|monitor| work_area(&monitor))
        .filter(|area| area.rect.size.width > 0 && area.rect.size.height > 0)
}

fn intersection_area(left: PhysicalRect, right: PhysicalRect) -> u64 {
    let x1 = i64::from(left.position.x).max(i64::from(right.position.x));
    let y1 = i64::from(left.position.y).max(i64::from(right.position.y));
    let x2 = (i64::from(left.position.x) + i64::from(left.size.width))
        .min(i64::from(right.position.x) + i64::from(right.size.width));
    let y2 = (i64::from(left.position.y) + i64::from(left.size.height))
        .min(i64::from(right.position.y) + i64::from(right.size.height));
    (x2 - x1).max(0) as u64 * (y2 - y1).max(0) as u64
}

fn best_work_area_for_window<'a>(
    window: PhysicalRect,
    areas: &'a [WorkArea],
    fallback: &'a WorkArea,
) -> &'a WorkArea {
    areas
        .iter()
        .max_by_key(|area| intersection_area(window, area.rect))
        .filter(|area| intersection_area(window, area.rect) > 0)
        .unwrap_or(fallback)
}

fn fitted_outer_size(
    work_area: PhysicalRect,
    requested: PhysicalSize,
) -> CommandResult<PhysicalSize> {
    if work_area.size.width == 0 || work_area.size.height == 0 {
        return Err(placement_error(
            "fit resized Timer",
            "empty monitor work area",
        ));
    }
    if requested.width == 0 || requested.height == 0 {
        return Err(placement_error("fit resized Timer", "empty window size"));
    }
    Ok(PhysicalSize {
        width: requested.width.min(work_area.size.width),
        height: requested.height.min(work_area.size.height),
    })
}

fn timer_needs_dpi_size_recovery(
    actual: PhysicalSize,
    logical: tauri::LogicalSize<f64>,
    scale_factor: f64,
    work_area: PhysicalRect,
) -> CommandResult<bool> {
    if !scale_factor.is_finite() || scale_factor <= 0.0 {
        return Err(placement_error(
            "compare Timer DPI size",
            "invalid scale factor",
        ));
    }
    let expected_width = (logical.width * scale_factor).round() as u32;
    let expected_height = (logical.height * scale_factor).round() as u32;
    let expected = PhysicalSize {
        width: expected_width.min(work_area.size.width),
        height: expected_height.min(work_area.size.height),
    };
    // A normal outer frame can be a little larger than the requested content.
    // A monitor-DPI transition can instead shrink the whole WebView far below
    // the requested logical dimensions while still leaving it in the work area.
    let differs = |actual: u32, expected: u32| {
        u64::from(actual) * 100 < u64::from(expected) * 90
            || u64::from(actual) * 100 > u64::from(expected) * 115
    };
    Ok(differs(actual.width, expected.width) || differs(actual.height, expected.height))
}

pub fn ensure_fixed_focus_host_size(window: &tauri::WebviewWindow) -> CommandResult<bool> {
    let actual = current_outer_rect(window)?;
    let scale = window
        .scale_factor()
        .map_err(|error| placement_error("read Focus DPI before host-size check", error))?;
    if !scale.is_finite() || scale <= 0.0 {
        return Err(placement_error(
            "read Focus DPI before host-size check",
            "invalid scale",
        ));
    }
    // Only a real DPI/host-size mismatch should resize the persistent WebView.
    // Ordinary Panel/Timer and compact/expanded transitions leave its HWND alone.
    let expected = crate::timer_region::host_logical_size();
    let desired_width = (expected.width * scale).round() as u32;
    let desired_height = (expected.height * scale).round() as u32;
    let differs = |actual: u32, desired: u32| {
        u64::from(actual) * 100 < u64::from(desired) * 90
            || u64::from(actual) * 100 > u64::from(desired) * 115
    };
    if differs(actual.size.width, desired_width) || differs(actual.size.height, desired_height) {
        window
            .set_size(tauri::Size::Logical(expected))
            .map_err(|error| placement_error("restore fixed Focus host size", error))?;
        return Ok(true);
    }
    Ok(false)
}

fn current_outer_rect(window: &tauri::WebviewWindow) -> CommandResult<PhysicalRect> {
    let position = window
        .outer_position()
        .map_err(|error| placement_error("read Timer outer position", error))?;
    let size = window
        .outer_size()
        .map_err(|error| placement_error("read Timer outer size", error))?;
    Ok(PhysicalRect {
        position: PhysicalPoint {
            x: position.x,
            y: position.y,
        },
        size: PhysicalSize {
            width: size.width,
            height: size.height,
        },
    })
}

fn current_visible_rect(
    window: &tauri::WebviewWindow,
    expanded: bool,
) -> CommandResult<PhysicalRect> {
    let outer = current_outer_rect(window)?;
    let visible = crate::timer_region::visible_size(
        window,
        crate::timer_region::timer_logical_size(expanded),
    )?;
    Ok(PhysicalRect {
        position: outer.position,
        size: PhysicalSize {
            width: visible.width,
            height: visible.height,
        },
    })
}

pub fn safe_position_for_timer_region(
    app_handle: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
    target_expanded: bool,
    preferred: Option<PhysicalPoint>,
) -> CommandResult<PhysicalPoint> {
    let current = current_visible_rect(window, crate::current_focus_surface_expanded())?;
    let areas = available_work_areas(app_handle)?;
    let fallback = primary_work_area(app_handle).unwrap_or_else(|| areas[0].clone());
    let selected = best_work_area_for_window(current, &areas, &fallback);
    let target = crate::timer_region::visible_size(
        window,
        crate::timer_region::timer_logical_size(target_expanded),
    )?;
    clamp_top_left(
        selected.rect,
        PhysicalSize {
            width: target.width,
            height: target.height,
        },
        preferred.unwrap_or(current.position),
    )
    .map_err(|error| placement_error("clamp clipped Timer to work area", error))
}

fn fit_window_outer_size(
    window: &tauri::WebviewWindow,
    work_area: PhysicalRect,
) -> CommandResult<PhysicalSize> {
    let requested = current_outer_rect(window)?.size;
    let fitted = fitted_outer_size(work_area, requested)?;
    if fitted != requested {
        window
            .set_size(tauri::Size::Physical(tauri::PhysicalSize {
                width: fitted.width,
                height: fitted.height,
            }))
            .map_err(|error| placement_error("fit Timer to work area", error))?;
    }
    let actual = current_outer_rect(window)?.size;
    if actual.width > work_area.size.width || actual.height > work_area.size.height {
        return Err(placement_error(
            "fit Timer to work area",
            "native window remained larger than the selected monitor work area",
        ));
    }
    Ok(actual)
}

fn position_window_if_needed(
    window: &tauri::WebviewWindow,
    desired: PhysicalPoint,
) -> CommandResult<()> {
    let current = window
        .outer_position()
        .map_err(|error| placement_error("read Timer position", error))?;
    if desired.x != current.x || desired.y != current.y {
        crate::focus_webview::set_physical_position(window, desired.x, desired.y)
            .map_err(|error| placement_error("move Timer into work area", error))?;
    }
    Ok(())
}

fn confirm_window_in_work_area(
    window: &tauri::WebviewWindow,
    work_area: PhysicalRect,
) -> CommandResult<PhysicalRect> {
    let current = current_outer_rect(window)?;
    if current.size.width > work_area.size.width || current.size.height > work_area.size.height {
        return Err(placement_error(
            "confirm Timer work-area placement",
            "native window is larger than the selected monitor work area",
        ));
    }
    let safe = clamp_top_left(work_area, current.size, current.position)
        .map_err(|error| placement_error("confirm Timer work-area placement", error))?;
    if safe != current.position {
        return Err(placement_error(
            "confirm Timer work-area placement",
            "native window remained outside the selected monitor work area",
        ));
    }
    Ok(current)
}

fn confirm_visible_window_in_work_area(
    window: &tauri::WebviewWindow,
    work_area: PhysicalRect,
    expanded: bool,
) -> CommandResult<PhysicalRect> {
    let current = current_visible_rect(window, expanded)?;
    let safe = clamp_top_left(work_area, current.size, current.position)
        .map_err(|error| placement_error("confirm clipped Timer placement", error))?;
    if safe != current.position {
        return Err(placement_error(
            "confirm clipped Timer placement",
            "visible Timer region remained outside the monitor work area",
        ));
    }
    Ok(current)
}

fn position_after_resize(
    previous_window: PhysicalRect,
    resized_size: PhysicalSize,
    areas: &[WorkArea],
    fallback: &WorkArea,
) -> CommandResult<PhysicalPoint> {
    let selected = best_work_area_for_window(previous_window, areas, fallback);
    clamp_top_left(selected.rect, resized_size, previous_window.position)
        .map_err(|error| placement_error("clamp resized Timer position", error))
}

pub fn keep_resized_timer_in_work_area(
    app_handle: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
    previous_window: PhysicalRect,
) -> CommandResult<()> {
    let areas = available_work_areas(app_handle)?;
    let fallback = primary_work_area(app_handle).unwrap_or_else(|| areas[0].clone());
    let selected = best_work_area_for_window(previous_window, &areas, &fallback);
    let actual = fit_window_outer_size(window, selected.rect)?;
    let safe = position_after_resize(previous_window, actual, &areas, &fallback)?;
    position_window_if_needed(window, safe)?;
    confirm_window_in_work_area(window, selected.rect)?;
    Ok(())
}

fn target_work_area<'a>(
    saved: &SavedFloatingPlacement,
    areas: &'a [WorkArea],
    fallback: &'a WorkArea,
) -> &'a WorkArea {
    if let Some(name) = saved.monitor_name.as_deref() {
        let mut matching = areas
            .iter()
            .filter(|area| area.name.as_deref() == Some(name));
        if let (Some(one), None) = (matching.next(), matching.next()) {
            return one;
        }
    }
    best_work_area_for_window(saved.work_area, areas, fallback)
}

fn preferred_monitor<'a>(
    saved: &SavedFloatingPlacement,
    areas: &'a [WorkArea],
) -> Option<&'a WorkArea> {
    let mut matches = areas
        .iter()
        .filter(|area| match saved.monitor_name.as_deref() {
            Some(name) => area.name.as_deref() == Some(name),
            None => area.rect == saved.work_area,
        });
    match (matches.next(), matches.next()) {
        (Some(one), None) => Some(one),
        _ => None,
    }
}

fn preserve_preferred_placement(
    saved: Option<&SavedFloatingPlacement>,
    areas: &[WorkArea],
    user_moved: bool,
) -> bool {
    !user_moved && saved.is_some_and(|saved| preferred_monitor(saved, areas).is_none())
}

fn timer_visible_size_for_area(area: &WorkArea, expanded: bool) -> CommandResult<PhysicalSize> {
    if !area.scale_factor.is_finite() || area.scale_factor <= 0.0 {
        return Err(placement_error(
            "plan Timer placement",
            "invalid target monitor scale factor",
        ));
    }
    let logical = crate::timer_region::timer_logical_size(expanded);
    Ok(PhysicalSize {
        width: ((logical.width * area.scale_factor).round().max(1.0) as u32)
            .min(area.rect.size.width),
        height: ((logical.height * area.scale_factor).round().max(1.0) as u32)
            .min(area.rect.size.height),
    })
}

// With no current-process user placement, inherit the Panel origin.
// No Timer position is read from or written to persistent storage.
fn first_timer_position(
    work_area: PhysicalRect,
    visible_size: PhysicalSize,
    panel_origin: PhysicalPoint,
) -> CommandResult<PhysicalPoint> {
    clamp_top_left(work_area, visible_size, panel_origin)
        .map_err(|error| placement_error("clamp unpinned Timer to Panel origin", error))
}

pub(crate) fn has_effective_timer_position(app_handle: &tauri::AppHandle) -> CommandResult<bool> {
    timer_position_for_current_policy(app_handle).map(|position| position.is_some())
}

pub(crate) fn planned_timer_position(
    app_handle: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
    expanded: bool,
) -> CommandResult<PhysicalPoint> {
    let saved = timer_position_for_current_policy(app_handle)?;
    let areas = available_work_areas(app_handle)?;
    let fallback = primary_work_area(app_handle).unwrap_or_else(|| areas[0].clone());
    let current = current_visible_rect(window, expanded)?;
    let selected = match saved.as_ref() {
        Some(saved) => target_work_area(saved, &areas, &fallback),
        None => best_work_area_for_window(current, &areas, &fallback),
    };
    let target_size = timer_visible_size_for_area(selected, expanded)?;
    match saved.as_ref() {
        Some(saved) => restored_position(saved, selected.rect, target_size),
        None => first_timer_position(selected.rect, target_size, current.position),
    }
}

fn scaled_axis(
    saved_position: i32,
    saved_origin: i32,
    saved_area: u32,
    saved_window: u32,
    target_origin: i32,
    target_area: u32,
    target_window: u32,
) -> Result<i32, &'static str> {
    let saved_free = i64::from(saved_area.saturating_sub(saved_window));
    let target_free = i64::from(target_area.saturating_sub(target_window));
    let saved_offset = (i64::from(saved_position) - i64::from(saved_origin)).clamp(0, saved_free);
    let target_offset = if saved_free == 0 {
        0
    } else {
        (saved_offset * target_free + saved_free / 2) / saved_free
    };
    i32::try_from(i64::from(target_origin) + target_offset)
        .map_err(|_| "restored coordinate exceeds the supported range")
}

fn restored_position(
    saved: &SavedFloatingPlacement,
    target: PhysicalRect,
    current_size: PhysicalSize,
) -> CommandResult<PhysicalPoint> {
    // A presentation-size change does not change the user's chosen location.
    // Normalizing against the new free height here ratchets an expanded Timer
    // downward each time Panel returns to compact Timer on the same monitor.
    // Keep the saved top-left and only clamp what no longer fits; proportional
    // recovery remains appropriate when the actual work area has changed.
    if saved.work_area == target {
        return clamp_top_left(target, current_size, saved.position)
            .map_err(|error| placement_error("clamp unchanged-area position", error));
    }
    let desired = PhysicalPoint {
        x: scaled_axis(
            saved.position.x,
            saved.work_area.position.x,
            saved.work_area.size.width,
            saved.outer_size.width,
            target.position.x,
            target.size.width,
            current_size.width,
        )
        .map_err(|error| placement_error("restore horizontal position", error))?,
        y: scaled_axis(
            saved.position.y,
            saved.work_area.position.y,
            saved.work_area.size.height,
            saved.outer_size.height,
            target.position.y,
            target.size.height,
            current_size.height,
        )
        .map_err(|error| placement_error("restore vertical position", error))?,
    };
    clamp_top_left(target, current_size, desired)
        .map_err(|error| placement_error("clamp restored position", error))
}

// An automatic Panel → Timer transition is not a personal position. Once a
// genuine drag has occurred, its location is remembered for this process only.
fn should_remember_session_position(has_saved: bool, completed_user_move: bool) -> bool {
    has_saved || completed_user_move
}

pub fn save_if_timer_visible(app_handle: &tauri::AppHandle) -> CommandResult<bool> {
    remember_visible_timer_position(app_handle, false)
}

// A bounded capture harness can explicitly seed a non-user position, but this
// still only affects the current process. Production never uses that override.
pub(crate) fn seed_capture_timer_position(app_handle: &tauri::AppHandle) -> CommandResult<bool> {
    remember_visible_timer_position(app_handle, true)
}

fn remember_visible_timer_position(
    app_handle: &tauri::AppHandle,
    capture_seed: bool,
) -> CommandResult<bool> {
    if SAVE_SUSPENSIONS.load(Ordering::Acquire) != 0
        || crate::windows::focus_interactive_move_active()
    {
        return Ok(false);
    }
    if crate::current_focus_surface_mode() != Some(crate::FocusSurfaceMode::Timer) {
        return Ok(false);
    }
    let window = app_handle
        .get_webview_window(FOCUS_SURFACE_LABEL)
        .ok_or_else(|| CommandError::window_not_found(FOCUS_SURFACE_LABEL))?;
    if !window
        .is_visible()
        .map_err(|error| placement_error("read Timer visibility", error))?
    {
        return Ok(false);
    }
    let current_window = current_visible_rect(&window, crate::current_focus_surface_expanded())?;
    let areas = available_work_areas(app_handle)?;
    let previous = timer_position_for_current_policy(app_handle)?;
    let user_moved = USER_PLACEMENT_DIRTY.load(Ordering::Acquire);
    if !capture_seed && !should_remember_session_position(previous.is_some(), user_moved) {
        // Never pin the automatically inherited Panel position without an
        // actual completed native Timer drag in this application run.
        return Ok(false);
    }
    if preserve_preferred_placement(previous.as_ref(), &areas, user_moved) {
        return Ok(false);
    }
    let fallback = primary_work_area(app_handle).unwrap_or_else(|| areas[0].clone());
    let selected = best_work_area_for_window(current_window, &areas, &fallback);
    let safe = clamp_top_left(selected.rect, current_window.size, current_window.position)
        .map_err(|error| placement_error("clamp Timer position", error))?;
    let saved = SavedFloatingPlacement {
        version: SavedFloatingPlacement::VERSION,
        position: safe,
        outer_size: current_window.size,
        work_area: selected.rect,
        monitor_name: selected.name.clone(),
    };
    set_session_timer_position(saved.clone())?;
    persist_session_placement_if_opted_in(app_handle, &saved)?;
    USER_PLACEMENT_DIRTY.store(false, Ordering::Release);
    crate::validation_log::record_placement_saved(app_handle, &saved);
    Ok(true)
}

pub fn restore_for_timer(
    app_handle: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
    expanded: bool,
) -> CommandResult<bool> {
    let saved = timer_position_for_current_policy(app_handle)?;
    let areas = available_work_areas(app_handle)?;
    let fallback = primary_work_area(app_handle).unwrap_or_else(|| areas[0].clone());
    let current = current_visible_rect(window, expanded)?;
    let selected = match saved.as_ref() {
        Some(saved) => target_work_area(saved, &areas, &fallback),
        None => best_work_area_for_window(current, &areas, &fallback),
    };
    for pass in 0..2 {
        // The first placement can cross monitors and change the window's physical DPI size.
        // Read, fit, and position again on the selected monitor before the caller shows it.
        fit_window_outer_size(window, selected.rect)?;
        let visible = crate::timer_region::visible_size(
            window,
            crate::timer_region::timer_logical_size(expanded),
        )?;
        let actual_size = PhysicalSize {
            width: visible.width,
            height: visible.height,
        };
        let restored = match saved.as_ref() {
            Some(saved) => restored_position(saved, selected.rect, actual_size)?,
            None => first_timer_position(selected.rect, actual_size, current.position)?,
        };
        position_window_if_needed(window, restored)?;
        if pass == 0 {
            ensure_fixed_focus_host_size(window)?;
        }
    }
    let actual = confirm_visible_window_in_work_area(window, selected.rect, expanded)?;
    let expected_position = match saved.as_ref() {
        Some(saved) => restored_position(saved, selected.rect, actual.size)?,
        None => actual.position,
    };
    crate::validation_log::record_timer_restore(
        app_handle,
        saved.as_ref(),
        expected_position,
        actual,
        selected.rect,
    );
    Ok(saved.is_some())
}

pub fn revalidate_visible_timer_after_display_change(
    app_handle: &tauri::AppHandle,
) -> CommandResult<bool> {
    if crate::current_focus_surface_mode() != Some(crate::FocusSurfaceMode::Timer) {
        return Ok(false);
    }
    let window = app_handle
        .get_webview_window(FOCUS_SURFACE_LABEL)
        .ok_or_else(|| CommandError::window_not_found(FOCUS_SURFACE_LABEL))?;
    if !window
        .is_visible()
        .map_err(|error| placement_error("read Timer visibility", error))?
        || window
            .is_minimized()
            .map_err(|error| placement_error("read Timer minimized state", error))?
        || window
            .is_maximized()
            .map_err(|error| placement_error("read Timer maximized state", error))?
        || window
            .is_fullscreen()
            .map_err(|error| placement_error("read Timer fullscreen state", error))?
    {
        return Ok(false);
    }

    let areas = available_work_areas(app_handle)?;
    let fallback = primary_work_area(app_handle).unwrap_or_else(|| areas[0].clone());
    let expanded = crate::current_focus_surface_expanded();
    let previous_outer = current_outer_rect(&window)?;
    let previous = current_visible_rect(&window, expanded)?;
    let saved = timer_position_for_current_policy(app_handle)?;
    let preferred = if USER_PLACEMENT_DIRTY.load(Ordering::Acquire) {
        None
    } else {
        saved
            .as_ref()
            .and_then(|saved| preferred_monitor(saved, &areas))
    };
    let selected =
        preferred.unwrap_or_else(|| best_work_area_for_window(previous, &areas, &fallback));
    let desired = match (preferred, saved.as_ref()) {
        (Some(_), Some(saved)) => restored_position(
            saved,
            selected.rect,
            timer_visible_size_for_area(selected, expanded)?,
        )?,
        _ => previous.position,
    };
    let logical_size = crate::timer_region::host_logical_size();
    let scale_factor = window
        .scale_factor()
        .map_err(|error| placement_error("read Timer scale factor", error))?;
    let needs_dpi_resize = timer_needs_dpi_size_recovery(
        previous_outer.size,
        logical_size,
        scale_factor,
        selected.rect,
    )?;
    let planned_size = fitted_outer_size(selected.rect, previous_outer.size)?;
    let planned_position = clamp_top_left(selected.rect, previous.size, desired)
        .map_err(|error| placement_error("plan Timer display recovery", error))?;
    let needs_hide = needs_dpi_resize
        || planned_size != previous_outer.size
        || planned_position != previous.position;
    let previous_inner_size = if needs_hide {
        Some(
            window
                .inner_size()
                .map_err(|error| placement_error("read Timer inner size before recovery", error))?,
        )
    } else {
        None
    };
    let _guard = suspend_saves();
    if needs_hide {
        window
            .hide()
            .map_err(|error| placement_error("hide Timer for display recovery", error))?;
    }

    let recovery = (|| -> CommandResult<bool> {
        if needs_dpi_resize {
            window
                .set_size(tauri::Size::Logical(logical_size))
                .map_err(|error| {
                    placement_error("restore Timer logical size after DPI change", error)
                })?;
        }
        for pass in 0..2 {
            fit_window_outer_size(&window, selected.rect)?;
            let actual = crate::timer_region::visible_size(
                &window,
                crate::timer_region::timer_logical_size(expanded),
            )?;
            let actual_size = PhysicalSize {
                width: actual.width,
                height: actual.height,
            };
            let safe = clamp_top_left(selected.rect, actual_size, desired)
                .map_err(|error| placement_error("clamp Timer after display change", error))?;
            position_window_if_needed(&window, safe)?;
            if pass == 0 {
                ensure_fixed_focus_host_size(&window)?;
            }
        }
        crate::timer_region::apply(&window, crate::timer_region::timer_logical_size(expanded))?;
        if needs_hide {
            window
                .show()
                .map_err(|error| placement_error("show Timer after display recovery", error))?;
        }
        let final_rect = confirm_visible_window_in_work_area(&window, selected.rect, expanded)?;
        Ok(final_rect != previous)
    })();

    match recovery {
        Ok(changed) => Ok(changed),
        Err(error) => {
            let rollback = if let Some(previous_inner_size) = previous_inner_size {
                let size = window
                    .set_size(tauri::Size::Physical(previous_inner_size))
                    .map_err(|failure| placement_error("restore Timer size", failure));
                let position = crate::focus_webview::set_physical_position(
                    &window,
                    previous.position.x,
                    previous.position.y,
                )
                .map_err(|failure| placement_error("restore Timer position", failure));
                let region = crate::timer_region::apply(
                    &window,
                    crate::timer_region::timer_logical_size(expanded),
                );
                let visibility = window
                    .show()
                    .map_err(|failure| placement_error("restore Timer visibility", failure));
                let failures: Vec<_> = [size, position, region, visibility]
                    .into_iter()
                    .filter_map(Result::err)
                    .collect();
                if failures.is_empty() {
                    Ok(())
                } else {
                    Err(placement_error(
                        "restore Timer after display change",
                        failures
                            .iter()
                            .map(ToString::to_string)
                            .collect::<Vec<_>>()
                            .join("; "),
                    ))
                }
            } else {
                crate::focus_webview::set_physical_position(
                    &window,
                    previous.position.x,
                    previous.position.y,
                )
                .map_err(|failure| {
                    placement_error("restore Timer position after display change", failure)
                })
            };
            if let Err(rollback) = rollback {
                return Err(placement_error(
                    "recover Timer after display change",
                    format!("{error}; rollback failed: {rollback}"),
                ));
            }
            Err(error)
        }
    }
}

fn schedule_settled_save(app_handle: tauri::AppHandle) {
    if MOVE_WORKER_ACTIVE.swap(true, Ordering::AcqRel) {
        return;
    }
    std::thread::spawn(move || loop {
        let observed = MOVE_REVISION.load(Ordering::Acquire);
        std::thread::sleep(MOVE_SETTLE_DELAY);
        if MOVE_REVISION.load(Ordering::Acquire) != observed {
            continue;
        }
        let save_handle = app_handle.clone();
        if let Err(error) = app_handle.run_on_main_thread(move || {
            if MOVE_REVISION.load(Ordering::Acquire) == observed {
                if let Err(error) = save_if_timer_visible(&save_handle) {
                    eprintln!("Could not persist settled Floating Timer position: {error}");
                }
            }
        }) {
            eprintln!("Could not schedule settled Floating Timer position save: {error}");
        }
        MOVE_WORKER_ACTIVE.store(false, Ordering::Release);
        if MOVE_REVISION.load(Ordering::Acquire) != observed {
            schedule_settled_save(app_handle.clone());
        }
        break;
    });
}

pub fn note_timer_moved(app_handle: &tauri::AppHandle) -> bool {
    if SAVE_SUSPENSIONS.load(Ordering::Acquire) != 0
        || crate::current_focus_surface_mode() != Some(crate::FocusSurfaceMode::Timer)
    {
        return false;
    }
    MOVE_REVISION.fetch_add(1, Ordering::AcqRel);
    schedule_settled_save(app_handle.clone());
    true
}

#[cfg(test)]
mod tests {
    #[test]
    fn restart_opt_in_distinguishes_prior_disk_state_from_current_run_drag() {
        let legacy = SavedFloatingPlacement {
            version: SavedFloatingPlacement::VERSION,
            position: PhysicalPoint { x: 300, y: 140 },
            outer_size: PhysicalSize {
                width: 340,
                height: 110,
            },
            work_area: PhysicalRect {
                position: PhysicalPoint { x: 0, y: 0 },
                size: PhysicalSize {
                    width: 1920,
                    height: 1040,
                },
            },
            monitor_name: Some("Primary".into()),
        };
        assert!(effective_saved_placement(None, Some(legacy.clone()), false).is_none());
        assert_eq!(
            effective_saved_placement(Some(legacy.clone()), None, false)
                .expect("session drag")
                .position,
            legacy.position,
        );
        assert_eq!(
            effective_saved_placement(None, Some(legacy.clone()), true)
                .expect("opted-in restore")
                .position,
            legacy.position,
        );
        let recent = SavedFloatingPlacement {
            position: PhysicalPoint { x: 710, y: 210 },
            ..legacy.clone()
        };
        assert_eq!(
            effective_saved_placement(Some(recent.clone()), Some(legacy), true)
                .expect("session overrides disk")
                .position,
            recent.position,
        );
    }

    #[test]
    fn unpinned_timer_inherits_panel_origin_on_launch_and_clamps_when_needed() {
        let left = PhysicalRect {
            position: PhysicalPoint { x: -1920, y: -120 },
            size: PhysicalSize {
                width: 1920,
                height: 980,
            },
        };
        let compact = PhysicalSize {
            width: 340,
            height: 110,
        };
        let panel = PhysicalPoint { x: -1904, y: -104 };
        assert_eq!(
            first_timer_position(left, compact, panel).expect("follow Panel"),
            panel,
        );
        let constrained = PhysicalRect {
            position: PhysicalPoint { x: 0, y: 0 },
            size: PhysicalSize {
                width: 400,
                height: 200,
            },
        };
        assert_eq!(
            first_timer_position(constrained, compact, PhysicalPoint { x: 390, y: 194 })
                .expect("safe clamp"),
            PhysicalPoint { x: 60, y: 90 },
        );
    }

    #[test]
    fn no_drag_keeps_timer_unpinned_during_current_process() {
        assert!(!should_remember_session_position(false, false));
        // A completed interactive drag — not an Escape-cancelled attempt —
        // is the first event allowed to establish a session-only Timer position.
        assert!(should_remember_session_position(false, true));
        assert!(should_remember_session_position(true, false));
        assert!(should_remember_session_position(true, true));
    }

    #[test]
    fn temporary_disconnect_preserves_preference_and_reconnect_restores_it() {
        let primary = area("primary", 0, 2560);
        let secondary = area("LG", -1920, 1920);
        let saved = SavedFloatingPlacement {
            version: SavedFloatingPlacement::VERSION,
            position: PhysicalPoint { x: -1185, y: 398 },
            outer_size: PhysicalSize {
                width: 425,
                height: 138,
            },
            work_area: secondary.rect,
            monitor_name: Some("LG".into()),
        };
        assert!(preserve_preferred_placement(
            Some(&saved),
            std::slice::from_ref(&primary),
            false
        ));
        assert!(preferred_monitor(&saved, std::slice::from_ref(&primary)).is_none());
        let reconnected = [primary.clone(), secondary];
        let monitor = preferred_monitor(&saved, &reconnected).expect("LG returns");
        assert_eq!(
            restored_position(&saved, monitor.rect, saved.outer_size).expect("restore"),
            saved.position
        );
        // A genuine completed move on fallback explicitly supersedes the old target.
        assert!(!preserve_preferred_placement(
            Some(&saved),
            std::slice::from_ref(&primary),
            true
        ));
        assert!(!preserve_preferred_placement(None, &reconnected, false));
    }

    #[test]
    fn ambiguous_monitor_identity_is_never_an_automatic_return_target() {
        let first = area("duplicate", 0, 1920);
        let second = area("duplicate", -1920, 1920);
        let saved = SavedFloatingPlacement {
            version: SavedFloatingPlacement::VERSION,
            position: PhysicalPoint { x: 100, y: 100 },
            outer_size: PhysicalSize {
                width: 340,
                height: 110,
            },
            work_area: first.rect,
            monitor_name: Some("duplicate".into()),
        };
        assert!(preferred_monitor(&saved, &[first, second]).is_none());
    }
    #[test]
    fn bottom_edge_expansion_and_collapse_retain_the_new_safe_origin() {
        for (width, compact_height, expanded_height, x) in
            [(340, 110, 300, 800), (425, 138, 375, -1462)]
        {
            let area = PhysicalRect {
                position: PhysicalPoint {
                    x: if x < 0 { -1920 } else { 0 },
                    y: 0,
                },
                size: PhysicalSize {
                    width: if x < 0 { 1920 } else { 2560 },
                    height: 1080,
                },
            };
            let compact = PhysicalSize {
                width,
                height: compact_height,
            };
            let expanded = PhysicalSize {
                width,
                height: expanded_height,
            };
            let mut current = PhysicalPoint {
                x,
                y: 1080 - compact_height as i32,
            };
            let safe = PhysicalPoint {
                x,
                y: 1080 - expanded_height as i32,
            };
            for _ in 0..6 {
                current = clamp_top_left(area, expanded, current).expect("fit expanded edge");
                assert_eq!(current, safe);
                current = clamp_top_left(area, compact, current).expect("collapse in place");
                assert_eq!(current, safe);
            }
        }
    }
    use super::*;

    fn area(name: &str, x: i32, width: u32) -> WorkArea {
        WorkArea {
            name: Some(name.into()),
            scale_factor: 1.0,
            rect: PhysicalRect {
                position: PhysicalPoint { x, y: 0 },
                size: PhysicalSize {
                    width,
                    height: 1040,
                },
            },
        }
    }

    #[test]
    fn repeated_expanded_panel_compact_restore_keeps_unchanged_area_position() {
        for (scale, x, y) in [(1.0, 800, 205), (1.25, -1462, 333)] {
            let work_area = PhysicalRect {
                position: PhysicalPoint {
                    x: if x < 0 { -1920 } else { 0 },
                    y: 0,
                },
                size: PhysicalSize {
                    width: if x < 0 { 1920 } else { 2560 },
                    height: 1080,
                },
            };
            let compact = PhysicalSize {
                width: (340.0 * scale) as u32,
                height: (110.0_f64 * scale).round() as u32,
            };
            let expanded = PhysicalSize {
                width: compact.width,
                height: (300.0 * scale) as u32,
            };
            let original = PhysicalPoint { x, y };
            let mut position = original;
            // Each Panel transition saves the outgoing expanded visible region;
            // returning to Timer requests compact geometry, just as in CI911.
            for _ in 0..6 {
                let saved = SavedFloatingPlacement {
                    version: SavedFloatingPlacement::VERSION,
                    position,
                    outer_size: expanded,
                    work_area,
                    monitor_name: Some("same-display".into()),
                };
                position = restored_position(&saved, work_area, compact).expect("restore compact");
                assert_eq!(position, original);
            }
        }
    }

    #[test]
    fn unchanged_area_size_or_dpi_change_only_clamps_unsafe_edges() {
        let work_area = area("same-display", 0, 1920).rect;
        let saved = SavedFloatingPlacement {
            version: SavedFloatingPlacement::VERSION,
            position: PhysicalPoint { x: 1580, y: 930 },
            outer_size: PhysicalSize {
                width: 340,
                height: 110,
            },
            work_area,
            monitor_name: Some("same-display".into()),
        };
        let larger = PhysicalSize {
            width: 425,
            height: 375,
        };
        let clamped = restored_position(&saved, work_area, larger).expect("fit larger region");
        assert_eq!(clamped, PhysicalPoint { x: 1495, y: 665 });
        let saved_larger = SavedFloatingPlacement {
            position: clamped,
            outer_size: larger,
            ..saved
        };
        assert_eq!(
            restored_position(
                &saved_larger,
                work_area,
                PhysicalSize {
                    width: 340,
                    height: 110
                }
            )
            .expect("return compact without a new move"),
            clamped,
        );
    }

    #[test]
    fn restores_relative_position_after_resolution_change() {
        let saved = SavedFloatingPlacement {
            version: 1,
            position: PhysicalPoint { x: 1580, y: 930 },
            outer_size: PhysicalSize {
                width: 340,
                height: 110,
            },
            work_area: area("primary", 0, 1920).rect,
            monitor_name: Some("primary".into()),
        };
        let target = area("primary", 0, 1280).rect;
        assert_eq!(
            restored_position(
                &saved,
                target,
                PhysicalSize {
                    width: 340,
                    height: 110
                }
            )
            .expect("restore"),
            PhysicalPoint { x: 940, y: 930 }
        );
    }

    #[test]
    fn missing_monitor_falls_back_to_primary_work_area() {
        let saved = SavedFloatingPlacement {
            version: 1,
            position: PhysicalPoint { x: -450, y: 500 },
            outer_size: PhysicalSize {
                width: 340,
                height: 110,
            },
            work_area: area("removed", -1920, 1920).rect,
            monitor_name: Some("removed".into()),
        };
        let primary = area("primary", 0, 1920);
        let areas = vec![primary.clone()];
        let selected = target_work_area(&saved, &areas, &primary);
        assert_eq!(selected.rect, primary.rect);
        let restored = restored_position(&saved, selected.rect, saved.outer_size).expect("restore");
        assert!(restored.x >= 0);
        assert!(restored.x <= 1580);
    }

    #[test]
    fn expansion_near_taskbar_moves_up_on_the_same_monitor() {
        let primary = area("primary", 0, 1920);
        let secondary = area("secondary", 1920, 1920);
        let previous = PhysicalRect {
            position: PhysicalPoint { x: 3400, y: 930 },
            size: PhysicalSize {
                width: 340,
                height: 110,
            },
        };
        assert_eq!(
            position_after_resize(
                previous,
                PhysicalSize {
                    width: 340,
                    height: 300,
                },
                &[primary.clone(), secondary],
                &primary,
            )
            .expect("expanded position"),
            PhysicalPoint { x: 3400, y: 740 }
        );
    }

    #[test]
    fn oversized_expansion_fits_short_secondary_work_area_before_clamping() {
        let primary = area("primary", 0, 1920);
        let secondary = WorkArea {
            name: Some("secondary".into()),
            scale_factor: 1.25,
            rect: PhysicalRect {
                position: PhysicalPoint { x: -1200, y: 80 },
                size: PhysicalSize {
                    width: 1200,
                    height: 680,
                },
            },
        };
        let previous = PhysicalRect {
            position: PhysicalPoint { x: -900, y: 520 },
            size: PhysicalSize {
                width: 850,
                height: 275,
            },
        };
        let fitted = fitted_outer_size(
            secondary.rect,
            PhysicalSize {
                width: 850,
                height: 750,
            },
        )
        .expect("fit high-DPI expanded size");
        assert_eq!(
            fitted,
            PhysicalSize {
                width: 850,
                height: 680
            }
        );
        assert_eq!(
            position_after_resize(previous, fitted, &[primary.clone(), secondary], &primary)
                .expect("clamp to secondary"),
            PhysicalPoint { x: -900, y: 80 }
        );
    }

    #[test]
    fn mixed_dpi_timer_shrink_requires_logical_size_recovery() {
        let secondary = PhysicalRect {
            position: PhysicalPoint { x: -1920, y: 0 },
            size: PhysicalSize {
                width: 1920,
                height: 1080,
            },
        };
        let logical = tauri::LogicalSize {
            width: 340.0,
            height: 110.0,
        };
        assert!(timer_needs_dpi_size_recovery(
            PhysicalSize {
                width: 271,
                height: 75,
            },
            logical,
            1.25,
            secondary,
        )
        .expect("detect observed DPI shrink"));
        assert!(!timer_needs_dpi_size_recovery(
            PhysicalSize {
                width: 425,
                height: 138,
            },
            logical,
            1.25,
            secondary,
        )
        .expect("keep correctly sized Timer"));
    }

    #[test]
    fn fitted_small_work_area_is_not_misclassified_as_dpi_shrink() {
        let short_area = PhysicalRect {
            position: PhysicalPoint { x: 0, y: 0 },
            size: PhysicalSize {
                width: 250,
                height: 200,
            },
        };
        assert!(!timer_needs_dpi_size_recovery(
            PhysicalSize {
                width: 250,
                height: 200,
            },
            tauri::LogicalSize {
                width: 340.0,
                height: 300.0,
            },
            1.5,
            short_area,
        )
        .expect("keep work-area-fitted Timer"));
    }

    #[test]
    fn oversized_width_and_height_fit_tiny_work_area() {
        let area = PhysicalRect {
            position: PhysicalPoint { x: 0, y: 0 },
            size: PhysicalSize {
                width: 600,
                height: 500,
            },
        };
        assert_eq!(
            fitted_outer_size(
                area,
                PhysicalSize {
                    width: 1020,
                    height: 900,
                }
            )
            .expect("fit both axes"),
            area.size
        );
    }

    #[test]
    fn disconnected_monitor_fits_open_expanded_timer_on_primary() {
        let primary = WorkArea {
            name: Some("primary".into()),
            scale_factor: 1.0,
            rect: PhysicalRect {
                position: PhysicalPoint { x: 40, y: 20 },
                size: PhysicalSize {
                    width: 600,
                    height: 500,
                },
            },
        };
        let old_secondary_window = PhysicalRect {
            position: PhysicalPoint { x: -1100, y: 700 },
            size: PhysicalSize {
                width: 1020,
                height: 900,
            },
        };
        let areas = [primary.clone()];
        let selected = best_work_area_for_window(old_secondary_window, &areas, &primary);
        let fitted = fitted_outer_size(selected.rect, old_secondary_window.size)
            .expect("fit after disconnect");
        assert_eq!(fitted, primary.rect.size);
        assert_eq!(
            clamp_top_left(selected.rect, fitted, old_secondary_window.position).expect("recover"),
            primary.rect.position
        );
    }

    #[test]
    fn saved_position_uses_fitted_collapsed_size_on_shorter_work_area() {
        let saved = SavedFloatingPlacement {
            version: SavedFloatingPlacement::VERSION,
            position: PhysicalPoint { x: 980, y: 700 },
            outer_size: PhysicalSize {
                width: 850,
                height: 750,
            },
            work_area: PhysicalRect {
                position: PhysicalPoint { x: 0, y: 0 },
                size: PhysicalSize {
                    width: 1920,
                    height: 1080,
                },
            },
            monitor_name: Some("primary".into()),
        };
        let shorter = PhysicalRect {
            position: PhysicalPoint { x: 0, y: 40 },
            size: PhysicalSize {
                width: 900,
                height: 200,
            },
        };
        let fitted = fitted_outer_size(
            shorter,
            PhysicalSize {
                width: 850,
                height: 275,
            },
        )
        .expect("fit reopened Timer");
        assert_eq!(fitted.height, 200);
        assert_eq!(
            restored_position(&saved, shorter, fitted).expect("restore within shorter area"),
            PhysicalPoint { x: 46, y: 40 }
        );
    }
}
