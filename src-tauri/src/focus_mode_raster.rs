//! Finite Panel/Timer geometry with one pixel-preserving hierarchy per frame.
//! Clip natural content; only actual DPI/width changes may scale both axes.
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

// Pixel-center sampling uses the SAME width-derived scale on both axes.
// The changing visible height clips rows; it never compresses a whole Panel.
fn source_offset(image: &Image, destination: tauri::PhysicalSize<u32>, x: u32, y: u32) -> usize {
    let sample = |point: u32| {
        ((2 * u64::from(point) + 1) * u64::from(image.size.width)
            / (2 * u64::from(destination.width))) as u32
    };
    let sx = sample(x).min(image.size.width - 1);
    let sy = sample(y).min(image.size.height - 1);
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
    // Keep the outgoing endpoint exact. A growing envelope reveals the ready
    // incoming hierarchy; a shrinking one clips the outgoing hierarchy until
    // the final incoming handoff. Never manufacture a double text hierarchy
    // by crossblending captures or flatten semantic rows by vertical scaling.
    let growing = u64::from(incoming.size.height) * u64::from(outgoing.size.width)
        > u64::from(outgoing.size.height) * u64::from(incoming.size.width);
    let image = if progress >= 1.0 || (progress > 0.0 && growing) {
        incoming
    } else {
        outgoing
    };
    let scaled_height = (u64::from(image.size.height) * u64::from(visible.width)
        + u64::from(image.size.width) / 2)
        / u64::from(image.size.width);
    // Rounded DPI endpoints may duplicate the final pixel row, but an
    // uncovered extent is a failed transaction, not permission to stretch.
    if u64::from(visible.height) > scaled_height {
        return Err(invalid());
    }
    let mut frame = vec![0; count];
    for y in 0..visible.height {
        for x in 0..visible.width {
            let source = source_offset(image, visible, x, y);
            let destination = (y as usize * visible.width as usize + x as usize) * 4;
            frame[destination..destination + 3].copy_from_slice(&image.bgra[source..source + 3]);
            frame[destination + 3] = 255;
        }
    }
    Ok(frame)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn growing_frame_reveals_natural_rows_without_squeezing_or_ghost_text() {
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
            [10, 10, 10, 255, 100, 100, 100, 255]
        );
    }
    #[test]
    fn shrinking_frame_clips_one_hierarchy_until_atomic_final_handoff() {
        let outgoing = Image {
            size: tauri::PhysicalSize::new(1, 3),
            bgra: vec![10, 10, 10, 255, 100, 100, 100, 255, 240, 240, 240, 255],
        };
        let incoming = Image {
            size: tauri::PhysicalSize::new(1, 1),
            bgra: vec![80, 80, 80, 255],
        };
        for progress in [0.1, 0.5, 0.9] {
            assert_eq!(
                compose(
                    &outgoing,
                    &incoming,
                    tauri::PhysicalSize::new(1, 2),
                    progress
                )
                .unwrap(),
                outgoing.bgra[..8]
            );
        }
        assert_eq!(
            compose(&outgoing, &incoming, incoming.size, 1.0).unwrap(),
            incoming.bgra
        );
    }
    #[test]
    fn direction_uses_dpi_normalized_geometry_instead_of_raw_capture_height() {
        let outgoing = Image {
            size: tauri::PhysicalSize::new(1, 3),
            bgra: vec![10, 10, 10, 255, 100, 100, 100, 255, 240, 240, 240, 255],
        };
        // Higher-DPI compact pixels are physically taller than the outgoing
        // low-DPI sample, but their logical aspect is shorter, not growing.
        let incoming = Image {
            size: tauri::PhysicalSize::new(4, 4),
            bgra: [80, 80, 80, 255].repeat(16),
        };
        assert_eq!(
            compose(&outgoing, &incoming, tauri::PhysicalSize::new(1, 2), 0.5).unwrap(),
            outgoing.bgra[..8]
        );
    }
    #[test]
    fn dpi_width_scaling_preserves_square_pixel_proportions_and_rejects_uncovered_rows() {
        let image = Image {
            size: tauri::PhysicalSize::new(2, 2),
            bgra: vec![
                10, 10, 10, 255, 20, 20, 20, 255, 30, 30, 30, 255, 40, 40, 40, 255,
            ],
        };
        let frame = compose(&image, &image, tauri::PhysicalSize::new(4, 4), 0.5).unwrap();
        let gray: Vec<_> = frame
            .as_chunks::<4>()
            .0
            .iter()
            .map(|pixel| pixel[0])
            .collect();
        assert_eq!(
            gray,
            [10, 10, 20, 20, 10, 10, 20, 20, 30, 30, 40, 40, 30, 30, 40, 40]
        );
        assert!(compose(&image, &image, tauri::PhysicalSize::new(4, 5), 0.5).is_err());
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
