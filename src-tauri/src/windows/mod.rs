//! Native Windows window-management capability boundary used by Milestone 1 validation.

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

#[cfg(test)]
mod tests {
    use super::*;

    const PANEL: PhysicalSize = PhysicalSize {
        width: 400,
        height: 700,
    };

    #[test]
    fn positions_panel_at_left_edge() {
        let work_area = PhysicalRect {
            position: PhysicalPoint { x: 0, y: 0 },
            size: PhysicalSize {
                width: 1920,
                height: 1040,
            },
        };

        assert_eq!(
            focus_panel_edge_position(work_area, PANEL, FocusPanelSide::Left),
            Ok(PhysicalPoint { x: 0, y: 0 })
        );
    }

    #[test]
    fn positions_panel_at_right_edge() {
        let work_area = PhysicalRect {
            position: PhysicalPoint { x: 0, y: 0 },
            size: PhysicalSize {
                width: 1920,
                height: 1040,
            },
        };

        assert_eq!(
            focus_panel_edge_position(work_area, PANEL, FocusPanelSide::Right),
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

        let valid_area = PhysicalRect {
            position: PhysicalPoint { x: 0, y: 0 },
            size: PhysicalSize {
                width: 100,
                height: 100,
            },
        };
        assert_eq!(
            focus_panel_edge_position(
                valid_area,
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
            position: PhysicalPoint {
                x: i32::MAX,
                y: 0,
            },
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
