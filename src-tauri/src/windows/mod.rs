//! Native Windows window-management capability boundary used by Milestone 1 validation.

#[cfg(windows)]
mod topology;

#[cfg(windows)]
pub use topology::install_display_change_observer;

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
            recover_window_top_left(
                current,
                &[PRIMARY_WORK_AREA, secondary],
                PRIMARY_WORK_AREA,
            ),
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
            recover_window_top_left(
                current,
                &[PRIMARY_WORK_AREA, secondary],
                PRIMARY_WORK_AREA,
            ),
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
            recover_window_top_left(
                detached_window,
                &[PRIMARY_WORK_AREA],
                PRIMARY_WORK_AREA,
            ),
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
            recover_window_top_left(
                current,
                &[invalid, PRIMARY_WORK_AREA],
                PRIMARY_WORK_AREA,
            ),
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
