//! Finite Panel/Timer raster composition. Whole images share one envelope;
//! changing its height never crops semantic rows from the incoming Panel.
use crate::error::{CommandError, CommandResult};

pub(crate) struct Image {
    pub size: tauri::PhysicalSize<u32>,
    pub bgra: Vec<u8>,
}

#[cfg(windows)]
pub(crate) fn decode(png: &[u8], size: tauri::PhysicalSize<u32>) -> CommandResult<Image> {
    Ok(Image {
        size,
        bgra: crate::focus_frame_capture::compact_bgra(png, size.width, size.height)?,
    })
}
#[cfg(not(windows))]
pub(crate) fn decode(_: &[u8], _: tauri::PhysicalSize<u32>) -> CommandResult<Image> {
    Err(CommandError::new(
        "FOCUS_MODE_RASTER_FAILED",
        "mode raster requires Windows",
    ))
}

fn invalid() -> CommandError {
    CommandError::new(
        "FOCUS_MODE_RASTER_FAILED",
        "invalid transition image or geometry",
    )
}

fn byte_count(size: tauri::PhysicalSize<u32>) -> CommandResult<usize> {
    if size.width == 0 || size.height == 0 || size.width > 4096 || size.height > 4096 {
        return Err(invalid());
    }
    Ok(size.width as usize * size.height as usize * 4)
}

pub(crate) fn envelope(
    from_height: f64,
    to_height: f64,
    scale: f64,
    outer: tauri::PhysicalSize<u32>,
    progress: f64,
) -> CommandResult<tauri::PhysicalSize<u32>> {
    if !progress.is_finite()
        || !(0.0..=1.0).contains(&progress)
        || !scale.is_finite()
        || scale <= 0.0
        || !from_height.is_finite()
        || !to_height.is_finite()
        || from_height <= 0.0
        || to_height <= 0.0
    {
        return Err(invalid());
    }
    let visible = tauri::PhysicalSize {
        width: ((crate::timer_region::FOCUS_HOST_WIDTH_LOGICAL * scale).round() as u32)
            .min(outer.width),
        height: (((from_height + (to_height - from_height) * progress) * scale).round() as u32)
            .min(outer.height),
    };
    byte_count(visible)?;
    Ok(visible)
}

// Endpoint-preserving resampling keeps the bottom semantic row visible even
// when a tall Panel is represented inside a smaller intermediate envelope.
fn source_offset(image: &Image, destination: tauri::PhysicalSize<u32>, x: u32, y: u32) -> usize {
    let axis = |point: u32, output: u32, input: u32| {
        if output <= 1 {
            0
        } else {
            (u64::from(point) * u64::from(input - 1) / u64::from(output - 1)) as u32
        }
    };
    let sx = axis(x, destination.width, image.size.width);
    let sy = axis(y, destination.height, image.size.height);
    (sy as usize * image.size.width as usize + sx as usize) * 4
}

pub(crate) fn compose(
    outgoing: &Image,
    incoming: &Image,
    visible: tauri::PhysicalSize<u32>,
    progress: f64,
) -> CommandResult<Vec<u8>> {
    let count = byte_count(visible)?;
    if outgoing.bgra.len() != byte_count(outgoing.size)?
        || incoming.bgra.len() != byte_count(incoming.size)?
        || !progress.is_finite()
        || !(0.0..=1.0).contains(&progress)
    {
        return Err(invalid());
    }
    let incoming_weight = (progress * 256.0).round() as u32;
    let mut frame = vec![0; count];
    for y in 0..visible.height {
        for x in 0..visible.width {
            let old = source_offset(outgoing, visible, x, y);
            let new = source_offset(incoming, visible, x, y);
            let destination = (y as usize * visible.width as usize + x as usize) * 4;
            for channel in 0..3 {
                frame[destination + channel] = ((u32::from(outgoing.bgra[old + channel])
                    * (256 - incoming_weight)
                    + u32::from(incoming.bgra[new + channel]) * incoming_weight
                    + 128)
                    / 256) as u8;
            }
            frame[destination + 3] = 255;
        }
    }
    Ok(frame)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn intermediate_frame_contains_complete_bottom_row_instead_of_panel_crop() {
        let outgoing = Image {
            size: tauri::PhysicalSize::new(1, 1),
            bgra: vec![0, 0, 0, 255],
        };
        let incoming = Image {
            size: tauri::PhysicalSize::new(1, 3),
            bgra: vec![10, 10, 10, 255, 100, 100, 100, 255, 240, 240, 240, 255],
        };
        assert_eq!(
            compose(&outgoing, &incoming, tauri::PhysicalSize::new(1, 2), 0.5).unwrap(),
            [5, 5, 5, 255, 120, 120, 120, 255]
        );
    }
    #[test]
    fn exact_endpoints_and_cross_dpi_geometry_are_preserved() {
        let old = Image {
            size: tauri::PhysicalSize::new(1, 2),
            bgra: vec![10, 20, 30, 255, 40, 50, 60, 255],
        };
        let new = Image {
            size: tauri::PhysicalSize::new(1, 2),
            bgra: vec![70, 80, 90, 255, 100, 110, 120, 255],
        };
        assert_eq!(compose(&old, &new, old.size, 0.0).unwrap(), old.bgra);
        assert_eq!(compose(&old, &new, new.size, 1.0).unwrap(), new.bgra);
        for scale in [1.0, 1.25] {
            let outer = tauri::PhysicalSize::new(425, 875);
            let first = envelope(110.0, 700.0, scale, outer, 0.0).unwrap();
            let last = envelope(110.0, 700.0, scale, outer, 1.0).unwrap();
            assert_eq!(first.height, (110.0_f64 * scale).round() as u32);
            assert_eq!(last.height, (700.0_f64 * scale).round() as u32);
            assert_eq!(last.width, (340.0_f64 * scale).round() as u32);
        }
    }
    #[test]
    fn malformed_images_and_nonfinite_geometry_fail_before_native_allocation() {
        let malformed = Image {
            size: tauri::PhysicalSize::new(1, 1),
            bgra: vec![],
        };
        assert!(compose(&malformed, &malformed, malformed.size, 0.5).is_err());
        assert!(envelope(110.0, 700.0, f64::NAN, malformed.size, 0.5).is_err());
        assert!(envelope(110.0, 700.0, 1.0, malformed.size, 2.0).is_err());
    }
}
