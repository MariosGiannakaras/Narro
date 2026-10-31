//! Native Windows window-management capability boundary used by Milestone 1 validation.

#[cfg(windows)]
mod topology;

#[cfg(windows)]
pub use topology::install_display_change_observer;
#[cfg(windows)]
pub(crate) use topology::{
    focus_interactive_move_active, suspend_focus_display_recovery, DisplayRecoveryGuard,
};
#[cfg(not(windows))]
pub(crate) fn focus_interactive_move_active() -> bool {
    false
}
#[cfg(not(windows))]
pub(crate) struct DisplayRecoveryGuard;
#[cfg(not(windows))]
pub(crate) fn suspend_focus_display_recovery() -> DisplayRecoveryGuard {
    DisplayRecoveryGuard
}

use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum FocusPanelSide {
    Left,
    Right,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct PhysicalPoint {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct PhysicalSize {
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct PhysicalRect {
    pub position: PhysicalPoint,
    pub size: PhysicalSize,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct MonitorDescriptor {
    pub key: String,
    pub index: usize,
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub friendly_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub desktop_preview_data_url: Option<String>,
    pub scale_factor: f64,
    pub position: PhysicalPoint,
    pub size: PhysicalSize,
    pub work_area: PhysicalRect,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WindowGeometryError {
    EmptyWorkArea,
    EmptyWindow,
    CoordinateOverflow,
}

impl Display for WindowGeometryError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(match self {
            Self::EmptyWorkArea => "monitor work area has zero width or height",
            Self::EmptyWindow => "window has zero width or height",
            Self::CoordinateOverflow => "computed window coordinate is outside the supported range",
        })
    }
}

impl std::error::Error for WindowGeometryError {}

fn axis_bounds(
    origin: i32,
    area_extent: u32,
    window_extent: u32,
) -> Result<(i32, i32), WindowGeometryError> {
    let usable_offset = area_extent.saturating_sub(window_extent);
    let maximum = i64::from(origin) + i64::from(usable_offset);
    let maximum = i32::try_from(maximum).map_err(|_| WindowGeometryError::CoordinateOverflow)?;
    Ok((origin, maximum))
}

fn intersection_area(left: PhysicalRect, right: PhysicalRect) -> u64 {
    let left_x1 = i64::from(left.position.x);
    let left_y1 = i64::from(left.position.y);
    let left_x2 = left_x1 + i64::from(left.size.width);
    let left_y2 = left_y1 + i64::from(left.size.height);

    let right_x1 = i64::from(right.position.x);
    let right_y1 = i64::from(right.position.y);
    let right_x2 = right_x1 + i64::from(right.size.width);
    let right_y2 = right_y1 + i64::from(right.size.height);

    let width = (left_x2.min(right_x2) - left_x1.max(right_x1)).max(0) as u64;
    let height = (left_y2.min(right_y2) - left_y1.max(right_y1)).max(0) as u64;
    width * height
}

pub fn validate_work_area(work_area: PhysicalRect) -> Result<(), WindowGeometryError> {
    if work_area.size.width == 0 || work_area.size.height == 0 {
        return Err(WindowGeometryError::EmptyWorkArea);
    }
    Ok(())
}

pub fn clamp_top_left(
    work_area: PhysicalRect,
    window_size: PhysicalSize,
    desired: PhysicalPoint,
) -> Result<PhysicalPoint, WindowGeometryError> {
    validate_work_area(work_area)?;
    if window_size.width == 0 || window_size.height == 0 {
        return Err(WindowGeometryError::EmptyWindow);
    }

    let (min_x, max_x) = axis_bounds(
        work_area.position.x,
        work_area.size.width,
        window_size.width,
    )?;
    let (min_y, max_y) = axis_bounds(
        work_area.position.y,
        work_area.size.height,
        window_size.height,
    )?;

    Ok(PhysicalPoint {
        x: desired.x.clamp(min_x, max_x),
        y: desired.y.clamp(min_y, max_y),
    })
}

pub fn focus_panel_edge_position(
    work_area: PhysicalRect,
    window_size: PhysicalSize,
    side: FocusPanelSide,
) -> Result<PhysicalPoint, WindowGeometryError> {
    validate_work_area(work_area)?;
    if window_size.width == 0 || window_size.height == 0 {
        return Err(WindowGeometryError::EmptyWindow);
    }

    let (left, right) = axis_bounds(
        work_area.position.x,
        work_area.size.width,
        window_size.width,
    )?;
    let desired = PhysicalPoint {
        x: match side {
            FocusPanelSide::Left => left,
            FocusPanelSide::Right => right,
        },
        y: work_area.position.y,
    };

    clamp_top_left(work_area, window_size, desired)
}

/** Insets an edge-anchored Panel without leaving the work area.
 * The inset is physical pixels, supplied by the DPI-aware native caller.
 * If a work area cannot fit two margins, preserve its safe geometry instead.
 */
pub fn focus_panel_inset_position(
    work_area: PhysicalRect,
    window_size: PhysicalSize,
    side: FocusPanelSide,
    inset_pixels: u32,
) -> Result<PhysicalPoint, WindowGeometryError> {
    let edge = focus_panel_edge_position(work_area, window_size, side)?;
    let inset_x =
        i32::try_from(inset_pixels.min(work_area.size.width.saturating_sub(window_size.width) / 2))
            .map_err(|_| WindowGeometryError::CoordinateOverflow)?;
    let inset_y = i32::try_from(
        inset_pixels.min(work_area.size.height.saturating_sub(window_size.height) / 2),
    )
    .map_err(|_| WindowGeometryError::CoordinateOverflow)?;
    let desired = PhysicalPoint {
        x: match side {
            FocusPanelSide::Left => edge.x.checked_add(inset_x),
            FocusPanelSide::Right => edge.x.checked_sub(inset_x),
        }
        .ok_or(WindowGeometryError::CoordinateOverflow)?,
        y: edge
            .y
            .checked_add(inset_y)
            .ok_or(WindowGeometryError::CoordinateOverflow)?,
    };
    clamp_top_left(work_area, window_size, desired)
}

/** Snap only near a genuine corner of the *visible* Timer, never the 700-DIP
 * persistent HWND. The Panel's physical inset is provided by the caller.
 * An oversized region cannot acquire a corner until display recovery fits it.
 */
pub fn timer_corner_snap_position(
    work_area: PhysicalRect,
    visible_size: PhysicalSize,
    proposed: PhysicalPoint,
    inset_pixels: u32,
    snap_radius_pixels: u32,
) -> Result<Option<PhysicalPoint>, WindowGeometryError> {
    validate_work_area(work_area)?;
    if visible_size.width == 0 || visible_size.height == 0 {
        return Err(WindowGeometryError::EmptyWindow);
    }
    if visible_size.width > work_area.size.width || visible_size.height > work_area.size.height {
        return Ok(None);
    }

    let (min_x, max_x) = axis_bounds(
        work_area.position.x,
        work_area.size.width,
        visible_size.width,
    )?;
    let (min_y, max_y) = axis_bounds(
        work_area.position.y,
        work_area.size.height,
        visible_size.height,
    )?;
    // Match the Panel inset and reduce it symmetrically on cramped work areas.
    let inset_x = i64::from(inset_pixels.min((work_area.size.width - visible_size.width) / 2));
    let inset_y = i64::from(inset_pixels.min((work_area.size.height - visible_size.height) / 2));
    let left = i64::from(min_x) + inset_x;
    let right = i64::from(max_x) - inset_x;
    let top = i64::from(min_y) + inset_y;
    let bottom = i64::from(max_y) - inset_y;
    let radius = i64::from(snap_radius_pixels);
    let near_anchor = |proposed: i32, low: i64, high: i64| -> Option<i64> {
        let low_distance = (i64::from(proposed) - low).abs();
        let high_distance = (i64::from(proposed) - high).abs();
        if low_distance <= radius && low_distance <= high_distance {
            Some(low)
        } else if high_distance <= radius {
            Some(high)
        } else {
            None
        }
    };
    let (Some(x), Some(y)) = (
        near_anchor(proposed.x, left, right),
        near_anchor(proposed.y, top, bottom),
    ) else {
        return Ok(None);
    };
    Ok(Some(PhysicalPoint {
        x: i32::try_from(x).map_err(|_| WindowGeometryError::CoordinateOverflow)?,
        y: i32::try_from(y).map_err(|_| WindowGeometryError::CoordinateOverflow)?,
    }))
}

pub fn recover_window_top_left(
    current_window: PhysicalRect,
    work_areas: &[PhysicalRect],
    fallback_work_area: PhysicalRect,
) -> Result<PhysicalPoint, WindowGeometryError> {
    validate_work_area(fallback_work_area)?;
    if current_window.size.width == 0 || current_window.size.height == 0 {
        return Err(WindowGeometryError::EmptyWindow);
    }

    let mut best_work_area = None;
    let mut best_intersection = 0;

    for work_area in work_areas {
        if validate_work_area(*work_area).is_err() {
            continue;
        }

        let overlap = intersection_area(current_window, *work_area);
        if overlap > best_intersection {
            best_intersection = overlap;
            best_work_area = Some(*work_area);
        }
    }

    let target_work_area = best_work_area.unwrap_or(fallback_work_area);
    clamp_top_left(
        target_work_area,
        current_window.size,
        current_window.position,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    const PANEL: PhysicalSize = PhysicalSize {
        width: 400,
        height: 700,
    };

    const PRIMARY_WORK_AREA: PhysicalRect = PhysicalRect {
        position: PhysicalPoint { x: 0, y: 0 },
        size: PhysicalSize {
            width: 1920,
            height: 1040,
        },
    };

    #[test]
    fn timer_snap_targets_each_corner_with_panel_inset_and_visible_height() {
        let area = PRIMARY_WORK_AREA;
        let compact = PhysicalSize {
            width: 340,
            height: 110,
        };
        let expanded = PhysicalSize {
            width: 340,
            height: 300,
        };
        for (proposed, expected) in [
            (
                PhysicalPoint { x: 34, y: 9 },
                PhysicalPoint { x: 16, y: 16 },
            ),
            (
                PhysicalPoint { x: 1550, y: 34 },
                PhysicalPoint { x: 1564, y: 16 },
            ),
            (
                PhysicalPoint { x: 12, y: 926 },
                PhysicalPoint { x: 16, y: 914 },
            ),
            (
                PhysicalPoint { x: 1582, y: 898 },
                PhysicalPoint { x: 1564, y: 914 },
            ),
        ] {
            assert_eq!(
                timer_corner_snap_position(area, compact, proposed, 16, 32),
                Ok(Some(expected))
            );
        }
        assert_eq!(
            timer_corner_snap_position(area, expanded, PhysicalPoint { x: 1560, y: 735 }, 16, 32,),
            Ok(Some(PhysicalPoint { x: 1564, y: 724 }))
        );
    }

    #[test]
    fn timer_snap_preserves_free_drag_near_edges_and_beyond_threshold() {
        let size = PhysicalSize {
            width: 340,
            height: 110,
        };
        for proposed in [
            PhysicalPoint { x: 16, y: 400 },
            PhysicalPoint { x: 400, y: 16 },
            PhysicalPoint { x: 49, y: 16 },
            PhysicalPoint { x: 16, y: 49 },
            PhysicalPoint { x: 500, y: 500 },
        ] {
            assert_eq!(
                timer_corner_snap_position(PRIMARY_WORK_AREA, size, proposed, 16, 32),
                Ok(None)
            );
        }
        assert_eq!(
            timer_corner_snap_position(
                PRIMARY_WORK_AREA,
                size,
                PhysicalPoint { x: 48, y: 48 },
                16,
                32,
            ),
            Ok(Some(PhysicalPoint { x: 16, y: 16 }))
        );
    }

    #[test]
    fn timer_snap_handles_negative_monitor_coordinates_and_scaled_insets() {
        let area = PhysicalRect {
            position: PhysicalPoint { x: -1600, y: -100 },
            size: PhysicalSize {
                width: 1600,
                height: 900,
            },
        };
        let size = PhysicalSize {
            width: 340,
            height: 300,
        };
        assert_eq!(
            timer_corner_snap_position(area, size, PhysicalPoint { x: -370, y: 463 }, 24, 48,),
            Ok(Some(PhysicalPoint { x: -364, y: 476 }))
        );
        assert_eq!(
            timer_corner_snap_position(area, size, PhysicalPoint { x: -1570, y: -85 }, 24, 48,),
            Ok(Some(PhysicalPoint { x: -1576, y: -76 }))
        );
    }

    #[test]
    fn timer_snap_handles_cramped_invalid_and_unrepresentable_areas() {
        let size = PhysicalSize {
            width: 340,
            height: 110,
        };
        let cramped = PhysicalRect {
            position: PhysicalPoint { x: 0, y: 0 },
            size: PhysicalSize {
                width: 354,
                height: 118,
            },
        };
        assert_eq!(
            timer_corner_snap_position(cramped, size, PhysicalPoint { x: 0, y: 0 }, 16, 32),
            Ok(Some(PhysicalPoint { x: 7, y: 4 }))
        );
        let smaller = PhysicalRect {
            position: PhysicalPoint { x: 0, y: 0 },
            size: PhysicalSize {
                width: 200,
                height: 100,
            },
        };
        assert_eq!(
            timer_corner_snap_position(smaller, size, PhysicalPoint { x: 0, y: 0 }, 16, 32),
            Ok(None)
        );
        assert_eq!(
            timer_corner_snap_position(
                PRIMARY_WORK_AREA,
                PhysicalSize {
                    width: 0,
                    height: 110
                },
                PhysicalPoint { x: 0, y: 0 },
                16,
                32,
            ),
            Err(WindowGeometryError::EmptyWindow)
        );
        let overflow = PhysicalRect {
            position: PhysicalPoint {
                x: i32::MAX - 5,
                y: 0,
            },
            size: PhysicalSize {
                width: 400,
                height: 400,
            },
        };
        assert_eq!(
            timer_corner_snap_position(overflow, size, overflow.position, 16, 32),
            Err(WindowGeometryError::CoordinateOverflow)
        );
    }

    #[test]
    fn panel_inset_respects_both_edges_and_top_on_primary_and_negative_monitors() {
        assert_eq!(
            focus_panel_inset_position(PRIMARY_WORK_AREA, PANEL, FocusPanelSide::Left, 16),
            Ok(PhysicalPoint { x: 16, y: 16 })
        );
        assert_eq!(
            focus_panel_inset_position(PRIMARY_WORK_AREA, PANEL, FocusPanelSide::Right, 16),
            Ok(PhysicalPoint { x: 1504, y: 16 })
        );
        let secondary = PhysicalRect {
            position: PhysicalPoint { x: -1920, y: -120 },
            size: PhysicalSize {
                width: 1920,
                height: 1080,
            },
        };
        assert_eq!(
            focus_panel_inset_position(secondary, PANEL, FocusPanelSide::Right, 20),
            Ok(PhysicalPoint { x: -420, y: -100 })
        );
    }

    #[test]
    fn panel_inset_gracefully_shrinks_when_window_nearly_fills_work_area() {
        let tight = PhysicalRect {
            position: PhysicalPoint { x: 100, y: 50 },
            size: PhysicalSize {
                width: 410,
                height: 710,
            },
        };
        assert_eq!(
            focus_panel_inset_position(tight, PANEL, FocusPanelSide::Left, 16),
            Ok(PhysicalPoint { x: 105, y: 55 })
        );
        assert_eq!(
            focus_panel_inset_position(tight, PANEL, FocusPanelSide::Right, 16),
            Ok(PhysicalPoint { x: 105, y: 55 })
        );
        let exactly_fits = PhysicalRect {
            position: PhysicalPoint { x: -900, y: 100 },
            size: PANEL,
        };
        assert_eq!(
            focus_panel_inset_position(exactly_fits, PANEL, FocusPanelSide::Right, 16),
            Ok(exactly_fits.position)
        );
    }

    #[test]
    fn positions_panel_at_left_edge() {
        assert_eq!(
            focus_panel_edge_position(PRIMARY_WORK_AREA, PANEL, FocusPanelSide::Left),
            Ok(PhysicalPoint { x: 0, y: 0 })
        );
    }

    #[test]
    fn positions_panel_at_right_edge() {
        assert_eq!(
            focus_panel_edge_position(PRIMARY_WORK_AREA, PANEL, FocusPanelSide::Right),
            Ok(PhysicalPoint { x: 1520, y: 0 })
        );
    }

    #[test]
    fn supports_monitors_with_negative_desktop_coordinates() {
        let work_area = PhysicalRect {
            position: PhysicalPoint { x: -1920, y: -120 },
            size: PhysicalSize {
                width: 1920,
                height: 1080,
            },
        };

        assert_eq!(
            focus_panel_edge_position(work_area, PANEL, FocusPanelSide::Right),
            Ok(PhysicalPoint { x: -400, y: -120 })
        );
    }

    #[test]
    fn oversized_window_stays_anchored_to_visible_work_area_origin() {
        let work_area = PhysicalRect {
            position: PhysicalPoint { x: 100, y: 50 },
            size: PhysicalSize {
                width: 320,
                height: 600,
            },
        };

        assert_eq!(
            focus_panel_edge_position(work_area, PANEL, FocusPanelSide::Right),
            Ok(PhysicalPoint { x: 100, y: 50 })
        );
    }

    #[test]
    fn clamp_keeps_desired_position_inside_work_area() {
        let work_area = PhysicalRect {
            position: PhysicalPoint { x: -1000, y: 100 },
            size: PhysicalSize {
                width: 1000,
                height: 900,
            },
        };

        assert_eq!(
            clamp_top_left(
                work_area,
                PhysicalSize {
                    width: 300,
                    height: 200,
                },
                PhysicalPoint { x: 500, y: -500 },
            ),
            Ok(PhysicalPoint { x: -300, y: 100 })
        );
    }

    #[test]
    fn recovery_keeps_fully_visible_window_unchanged() {
        let current = PhysicalRect {
            position: PhysicalPoint { x: 500, y: 200 },
            size: PhysicalSize {
                width: 800,
                height: 600,
            },
        };

        assert_eq!(
            recover_window_top_left(current, &[PRIMARY_WORK_AREA], PRIMARY_WORK_AREA),
            Ok(current.position)
        );
    }

    #[test]
    fn recovery_clamps_partially_offscreen_window_to_intersecting_monitor() {
        let secondary = PhysicalRect {
            position: PhysicalPoint { x: -1600, y: 0 },
            size: PhysicalSize {
                width: 1600,
                height: 900,
            },
        };
        let current = PhysicalRect {
            position: PhysicalPoint { x: -1750, y: 700 },
            size: PhysicalSize {
                width: 500,
                height: 400,
            },
        };

        assert_eq!(
            recover_window_top_left(current, &[PRIMARY_WORK_AREA, secondary], PRIMARY_WORK_AREA,),
            Ok(PhysicalPoint { x: -1600, y: 500 })
        );
    }

    #[test]
    fn recovery_prefers_monitor_with_largest_window_intersection() {
        let secondary = PhysicalRect {
            position: PhysicalPoint { x: 1920, y: 0 },
            size: PhysicalSize {
                width: 1920,
                height: 1040,
            },
        };
        let current = PhysicalRect {
            position: PhysicalPoint { x: 1700, y: 100 },
            size: PhysicalSize {
                width: 1000,
                height: 700,
            },
        };

        assert_eq!(
            recover_window_top_left(current, &[PRIMARY_WORK_AREA, secondary], PRIMARY_WORK_AREA,),
            Ok(PhysicalPoint { x: 1920, y: 100 })
        );
    }

    #[test]
    fn recovery_uses_fallback_when_previous_monitor_is_detached() {
        let detached_window = PhysicalRect {
            position: PhysicalPoint { x: 4200, y: 200 },
            size: PhysicalSize {
                width: 500,
                height: 700,
            },
        };

        assert_eq!(
            recover_window_top_left(detached_window, &[PRIMARY_WORK_AREA], PRIMARY_WORK_AREA,),
            Ok(PhysicalPoint { x: 1420, y: 200 })
        );
    }

    #[test]
    fn recovery_ignores_transient_invalid_work_area() {
        let invalid = PhysicalRect {
            position: PhysicalPoint { x: 1920, y: 0 },
            size: PhysicalSize {
                width: 0,
                height: 1040,
            },
        };
        let current = PhysicalRect {
            position: PhysicalPoint { x: 2500, y: 100 },
            size: PhysicalSize {
                width: 500,
                height: 500,
            },
        };

        assert_eq!(
            recover_window_top_left(current, &[invalid, PRIMARY_WORK_AREA], PRIMARY_WORK_AREA,),
            Ok(PhysicalPoint { x: 1420, y: 100 })
        );
    }

    #[test]
    fn rejects_empty_geometry() {
        let empty_area = PhysicalRect {
            position: PhysicalPoint { x: 0, y: 0 },
            size: PhysicalSize {
                width: 0,
                height: 100,
            },
        };
        assert_eq!(
            focus_panel_edge_position(empty_area, PANEL, FocusPanelSide::Left),
            Err(WindowGeometryError::EmptyWorkArea)
        );

        assert_eq!(
            focus_panel_edge_position(
                PRIMARY_WORK_AREA,
                PhysicalSize {
                    width: 0,
                    height: 1,
                },
                FocusPanelSide::Left,
            ),
            Err(WindowGeometryError::EmptyWindow)
        );
    }

    #[test]
    fn rejects_coordinate_overflow() {
        let work_area = PhysicalRect {
            position: PhysicalPoint { x: i32::MAX, y: 0 },
            size: PhysicalSize {
                width: 100,
                height: 100,
            },
        };

        assert_eq!(
            focus_panel_edge_position(
                work_area,
                PhysicalSize {
                    width: 1,
                    height: 1,
                },
                FocusPanelSide::Right,
            ),
            Err(WindowGeometryError::CoordinateOverflow)
        );
    }
}
