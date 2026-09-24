use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::floating_placement::SavedFloatingPlacement;
use crate::windows::{clamp_top_left, PhysicalPoint, PhysicalRect, PhysicalSize};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::time::Duration;
use tauri::Manager;

const FOCUS_SURFACE_LABEL: &str = "focusSurface";
const MOVE_SETTLE_DELAY: Duration = Duration::from_millis(600);
static MOVE_REVISION: AtomicU64 = AtomicU64::new(0);
static MOVE_WORKER_ACTIVE: AtomicBool = AtomicBool::new(false);
static SAVES_SUSPENDED: AtomicBool = AtomicBool::new(false);

pub struct PlacementTransitionGuard;

pub fn suspend_saves() -> PlacementTransitionGuard {
    SAVES_SUSPENDED.store(true, Ordering::Release);
    PlacementTransitionGuard
}

impl Drop for PlacementTransitionGuard {
    fn drop(&mut self) {
        SAVES_SUSPENDED.store(false, Ordering::Release);
    }
}

#[derive(Clone)]
struct WorkArea {
    name: Option<String>,
    rect: PhysicalRect,
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
    let size = window
        .outer_size()
        .map_err(|error| placement_error("read resized Timer outer size", error))?;
    let safe = position_after_resize(
        previous_window,
        PhysicalSize {
            width: size.width,
            height: size.height,
        },
        &areas,
        &fallback,
    )?;
    let current_position = window
        .outer_position()
        .map_err(|error| placement_error("read resized Timer position", error))?;
    if safe.x != current_position.x || safe.y != current_position.y {
        window
            .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: safe.x,
                y: safe.y,
            }))
            .map_err(|error| placement_error("move resized Timer into work area", error))?;
    }
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

pub fn save_if_timer_visible(app_handle: &tauri::AppHandle) -> CommandResult<bool> {
    if SAVES_SUSPENDED.load(Ordering::Acquire) {
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
    let position = window
        .outer_position()
        .map_err(|error| placement_error("read Timer position", error))?;
    let size = window
        .outer_size()
        .map_err(|error| placement_error("read Timer size", error))?;
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
    let areas = available_work_areas(app_handle)?;
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
    let connection = app_database(app_handle)?;
    persistence::floating_placement::save(&connection, &saved, &chrono::Utc::now().to_rfc3339())
        .map_err(|error| placement_error("save Timer position", error))?;
    Ok(true)
}

pub fn restore_for_timer(
    app_handle: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
) -> CommandResult<bool> {
    let connection = app_database(app_handle)?;
    let saved = persistence::floating_placement::load(&connection)
        .map_err(|error| placement_error("load Timer position", error))?;
    let Some(saved) = saved else {
        return Ok(false);
    };
    let areas = available_work_areas(app_handle)?;
    let fallback = primary_work_area(app_handle).unwrap_or_else(|| areas[0].clone());
    let selected = target_work_area(&saved, &areas, &fallback);
    let size = window
        .outer_size()
        .map_err(|error| placement_error("read resized Timer size", error))?;
    let restored = restored_position(
        &saved,
        selected.rect,
        PhysicalSize {
            width: size.width,
            height: size.height,
        },
    )?;
    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: restored.x,
            y: restored.y,
        }))
        .map_err(|error| placement_error("move Timer into visible work area", error))?;
    Ok(true)
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

pub fn note_timer_moved(app_handle: &tauri::AppHandle) {
    if crate::current_focus_surface_mode() != Some(crate::FocusSurfaceMode::Timer) {
        return;
    }
    MOVE_REVISION.fetch_add(1, Ordering::AcqRel);
    schedule_settled_save(app_handle.clone());
}

#[cfg(test)]
mod tests {
    use super::*;

    fn area(name: &str, x: i32, width: u32) -> WorkArea {
        WorkArea {
            name: Some(name.into()),
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
}
