//! Experimental Motion v4: single-hierarchy, source-pixel shared-element
//! compositor for native Compact <-> Expanded Timer changes only.
//!
//! Uses a prepared clean background image, one outgoing title/timer source
//! and stage-gated complete action/row rectangles. It never combines two
//! complete text screenshots or changes session/persistence state.
use crate::error::{CommandError, CommandResult};
use crate::focus_mode_raster::{self, Image};

const TIMER_WIDTH: f64 = 340.0;
const TIMER_EXPANDED_HEIGHT: f64 = 300.0;
const MAX_ROWS: usize = 64;

#[derive(Clone, Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(crate) struct Rect {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}

#[derive(Clone, Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(crate) struct SharedRect {
    from: Rect,
    to: Rect,
}

#[derive(Clone, Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(crate) struct Layout {
    title: SharedRect,
    timer: SharedRect,
    toolbar: SharedRect,
    actions: Option<Rect>,
    rows: Vec<Rect>,
}

fn invalid(message: &str) -> CommandError {
    CommandError::new("FOCUS_MODE_RASTER_FAILED", message)
}

impl Rect {
    fn valid(&self) -> bool {
        [self.x, self.y, self.width, self.height]
            .iter()
            .all(|v| v.is_finite())
            && self.x >= 0.0
            && self.y >= 0.0
            && self.width > 0.0
            && self.height > 0.0
            && self.x + self.width <= TIMER_WIDTH
            && self.y + self.height <= 700.0
    }

    fn interpolate(&self, target: &Rect, progress: f64) -> Rect {
        let lerp = |a: f64, b: f64| a + (b - a) * progress;
        Rect {
            x: lerp(self.x, target.x),
            y: lerp(self.y, target.y),
            width: lerp(self.width, target.width),
            height: lerp(self.height, target.height),
        }
    }
}

fn intersects(a: &Rect, b: &Rect) -> bool {
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

fn distinct(rects: &[&Rect]) -> bool {
    rects
        .iter()
        .enumerate()
        .all(|(index, a)| rects[index + 1..].iter().all(|b| !intersects(a, b)))
}

impl Layout {
    pub(crate) fn validate(&self) -> CommandResult<()> {
        if self.rows.len() > MAX_ROWS
            || !self.title.from.valid()
            || !self.title.to.valid()
            || !self.timer.from.valid()
            || !self.timer.to.valid()
            || !self.toolbar.from.valid()
            || !self.toolbar.to.valid()
            || self.actions.as_ref().is_some_and(|rect| !rect.valid())
            || self.rows.iter().any(|rect| !rect.valid())
            || !distinct(&[&self.title.from, &self.timer.from, &self.toolbar.from])
            || !distinct(&[&self.title.to, &self.timer.to, &self.toolbar.to])
        {
            return Err(invalid(
                "invalid Motion v4 source/target measured DOM geometry",
            ));
        }
        Ok(())
    }

    /// Validate image-source limits before accepting the optional raster lease.
    /// Otherwise blit() could silently omit a clipped title or toolbar.
    pub(crate) fn validate_for_native(
        &self,
        from_height: f64,
        to_height: f64,
    ) -> CommandResult<()> {
        self.validate()?;
        let fits = |rect: &Rect, height: f64| rect.y + rect.height <= height;
        if !self.title.from.valid()
            || !self.title.to.valid()
            || !fits(&self.title.from, from_height)
            || !fits(&self.timer.from, from_height)
            || !fits(&self.toolbar.from, from_height)
            || !fits(&self.title.to, to_height)
            || !fits(&self.timer.to, to_height)
            || !fits(&self.toolbar.to, to_height)
            || self
                .actions
                .as_ref()
                .is_some_and(|rect| !fits(rect, TIMER_EXPANDED_HEIGHT))
            || self
                .rows
                .iter()
                .any(|rect| !fits(rect, TIMER_EXPANDED_HEIGHT))
        {
            return Err(invalid(
                "Motion v4 semantic pixels exceed source or target region",
            ));
        }
        // Actions/rows belong to the expanded image, even when collapsing.
        // Overlap would otherwise blend two independently captured semantic
        // sprites into one native rectangle in nondeterministic draw order.
        let (title, timer, toolbar) = if from_height > to_height {
            (&self.title.from, &self.timer.from, &self.toolbar.from)
        } else {
            (&self.title.to, &self.timer.to, &self.toolbar.to)
        };
        let mut expanded = vec![title, timer, toolbar];
        if let Some(actions) = &self.actions {
            expanded.push(actions);
        }
        expanded.extend(self.rows.iter());
        if !distinct(&expanded) {
            return Err(invalid("overlapping Motion v4 semantic pixel rectangles"));
        }
        Ok(())
    }
}

/// Panel↔Timer has two shared semantic sprites; the Panel has no Timer
/// subtask toolbar, so pretending that it does would overlay unrelated
/// source pixels. This is intentionally distinct from Timer-only Layout.
#[derive(Clone, Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(crate) struct PanelLayout {
    title: SharedRect,
    timer: SharedRect,
}
impl PanelLayout {
    pub(crate) fn validate_for_native(&self, from: f64, to: f64) -> CommandResult<()> {
        if !((from == 700.0 && (to == 110.0 || to == 300.0))
            || (to == 700.0 && (from == 110.0 || from == 300.0)))
            || !self.title.from.valid()
            || !self.title.to.valid()
            || !self.timer.from.valid()
            || !self.timer.to.valid()
            || intersects(&self.title.from, &self.timer.from)
            || intersects(&self.title.to, &self.timer.to)
            || self.title.from.y + self.title.from.height > from
            || self.timer.from.y + self.timer.from.height > from
            || self.title.to.y + self.title.to.height > to
            || self.timer.to.y + self.timer.to.height > to
        {
            return Err(invalid(
                "invalid Panel/Timer shared semantic native source geometry",
            ));
        }
        Ok(())
    }
}

#[derive(Clone, Copy)]
struct PixelRect {
    x: usize,
    y: usize,
    w: usize,
    h: usize,
}

fn pixels(rect: &Rect, image: &Image) -> Option<PixelRect> {
    if !rect.valid() {
        return None;
    }
    let scale = f64::from(image.size.width) / TIMER_WIDTH;
    // Round the outer edges, not origin and extent independently: two
    // half-pixel round-ups can make a perfectly fitting rectangle overflow
    // by one pixel at 125%/150% DPI.
    let x = (rect.x * scale).round() as usize;
    let y = (rect.y * scale).round() as usize;
    let right = ((rect.x + rect.width) * scale).round() as usize;
    let bottom = ((rect.y + rect.height) * scale).round() as usize;
    let w = right.checked_sub(x)?;
    let h = bottom.checked_sub(y)?;
    if w == 0 || h == 0 {
        return None;
    }
    if x.checked_add(w)? > image.size.width as usize
        || y.checked_add(h)? > image.size.height as usize
    {
        return None;
    }
    Some(PixelRect { x, y, w, h })
}

/// Even optional staged frames must reject malformed decoded sources before
/// blit() performs unchecked hot-path BGRA indexing. Legacy compose validates
/// both sources; the v4 intermediate path previously bypassed that check.
fn validate_source_image(image: &Image) -> CommandResult<()> {
    let width = image.size.width as usize;
    let height = image.size.height as usize;
    let expected = width
        .checked_mul(height)
        .and_then(|count| count.checked_mul(4));
    if width == 0
        || height == 0
        || width > 4096
        || height > 4096
        || expected != Some(image.bgra.len())
    {
        return Err(invalid(
            "invalid Motion v4 decoded raster size or pixel buffer",
        ));
    }
    Ok(())
}

fn smoothstep(t: f64) -> f64 {
    let t = t.clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

fn reveal(value: f64, start: f64, end: f64) -> f64 {
    smoothstep((value - start) / (end - start))
}

fn blit(
    frame: &mut [u8],
    visible: tauri::PhysicalSize<u32>,
    source: &Image,
    source_rect: &Rect,
    destination_rect: &Rect,
    alpha: f64,
) {
    if alpha <= 0.0 {
        return;
    }
    let Some(src) = pixels(source_rect, source) else {
        return;
    };
    // The current native frame may clip below a full row or the endpoint.
    // Destination geometry is scaled from the current DPI-consistent width.
    let scale = f64::from(visible.width) / TIMER_WIDTH;
    let dx = (destination_rect.x * scale).round() as isize;
    let dy = (destination_rect.y * scale).round() as isize;
    let right = ((destination_rect.x + destination_rect.width) * scale).round() as isize;
    let bottom = ((destination_rect.y + destination_rect.height) * scale).round() as isize;
    let dw = (right - dx).max(0) as usize;
    let dh = (bottom - dy).max(0) as usize;
    if dw == 0 || dh == 0 {
        return;
    }
    let width = visible.width as usize;
    let height = visible.height as usize;
    for py in 0..dh {
        let y = dy + py as isize;
        if y < 0 || y >= height as isize {
            continue;
        }
        let sy = src.y + (py * src.h / dh).min(src.h - 1);
        for px in 0..dw {
            let x = dx + px as isize;
            if x < 0 || x >= width as isize {
                continue;
            }
            let sx = src.x + (px * src.w / dw).min(src.w - 1);
            let source_at = (sy * source.size.width as usize + sx) * 4;
            let target_at = (y as usize * width + x as usize) * 4;
            for channel in 0..3 {
                let original = f64::from(frame[target_at + channel]);
                let replacement = f64::from(source.bgra[source_at + channel]);
                frame[target_at + channel] =
                    (original + (replacement - original) * alpha).round() as u8;
            }
            frame[target_at + 3] = 255;
        }
    }
}

/// The caller passes native-eased [0,1] progress, matching the TS Motion v4
/// smoothstep sample. All frames are one precomposed BGRA hierarchy.
pub(crate) fn compose(
    outgoing: &Image,
    incoming: &Image,
    plate: &Image,
    visible: tauri::PhysicalSize<u32>,
    eased: f64,
    expanding: bool,
    layout: &Layout,
) -> CommandResult<Vec<u8>> {
    layout.validate()?;
    validate_source_image(outgoing)?;
    validate_source_image(incoming)?;
    validate_source_image(plate)?;
    if !eased.is_finite() || !(0.0..=1.0).contains(&eased) {
        return Err(invalid("invalid native Motion v4 progress"));
    }
    if eased <= 0.0 || eased >= 1.0 {
        // Only endpoints need legacy raster composition; allocating a
        // discarded full image at every intermediate frame adds A02
        // compositor deadline pressure without changing visible pixels.
        return focus_mode_raster::compose(outgoing, incoming, visible, eased);
    }
    let mut frame = focus_mode_raster::compose(plate, plate, visible, eased)?;
    let from_title = layout.title.from.interpolate(&layout.title.to, eased);
    let from_timer = layout.timer.from.interpolate(&layout.timer.to, eased);
    let from_toolbar = layout.toolbar.from.interpolate(&layout.toolbar.to, eased);
    blit(
        &mut frame,
        visible,
        outgoing,
        &layout.title.from,
        &from_title,
        1.0,
    );
    blit(
        &mut frame,
        visible,
        outgoing,
        &layout.timer.from,
        &from_timer,
        1.0,
    );
    blit(
        &mut frame,
        visible,
        outgoing,
        &layout.toolbar.from,
        &from_toolbar,
        1.0,
    );

    let expanded_amount = if expanding { eased } else { 1.0 - eased };
    let actions_alpha = reveal(expanded_amount, 0.24, 0.49);
    let expanded_source = if expanding { incoming } else { outgoing };
    if let Some(actions) = &layout.actions {
        blit(
            &mut frame,
            visible,
            expanded_source,
            actions,
            actions,
            actions_alpha,
        );
    }
    let logical_visible = f64::from(visible.height) * TIMER_WIDTH / f64::from(visible.width);
    for (index, row) in layout.rows.iter().enumerate() {
        let bottom = row.y + row.height;
        let fits = if bottom >= TIMER_EXPANDED_HEIGHT {
            if bottom == TIMER_EXPANDED_HEIGHT && logical_visible >= TIMER_EXPANDED_HEIGHT {
                1.0
            } else {
                0.0
            }
        } else {
            reveal(
                logical_visible,
                bottom,
                (bottom + 8.0).min(TIMER_EXPANDED_HEIGHT),
            )
        };
        let stagger = index.min(4) as f64;
        let details = reveal(
            expanded_amount,
            0.44 + stagger * 0.07,
            0.73 + stagger * 0.06,
        );
        blit(
            &mut frame,
            visible,
            expanded_source,
            row,
            row,
            fits * details,
        );
    }
    Ok(frame)
}

/// Panel↔Timer stages native-captured *clean backgrounds*, not a blend
/// of two full screenshots containing duplicate title/time glyphs. During
/// motion exactly one outgoing title and one clock sprite traverse the
/// measured source→target anchors. Both endpoint images remain byte-exact.
pub(crate) fn compose_panel(
    outgoing: &Image,
    incoming: &Image,
    from_plate: &Image,
    to_plate: &Image,
    visible: tauri::PhysicalSize<u32>,
    eased: f64,
    layout: &PanelLayout,
) -> CommandResult<Vec<u8>> {
    validate_source_image(outgoing)?;
    validate_source_image(incoming)?;
    validate_source_image(from_plate)?;
    validate_source_image(to_plate)?;
    if from_plate.size != outgoing.size || to_plate.size != incoming.size {
        return Err(invalid(
            "Panel Motion v4 cleanplates have stale native DPI or region geometry",
        ));
    }
    let from_height =
        f64::from(outgoing.size.height) * TIMER_WIDTH / f64::from(outgoing.size.width);
    let to_height = f64::from(incoming.size.height) * TIMER_WIDTH / f64::from(incoming.size.width);
    // Geometry is measured in logical pixels, but the source DPI can be 125%.
    // Use a half-pixel allowance for round-to-physical-edge endpoints.
    if (from_height - 700.0).abs() < 0.6 {
        layout.validate_for_native(
            700.0,
            if (to_height - 300.0).abs() < 0.6 {
                300.0
            } else if (to_height - 110.0).abs() < 0.6 {
                110.0
            } else {
                return Err(invalid("invalid Panel-to-Timer target region"));
            },
        )?;
    } else if (to_height - 700.0).abs() < 0.6 {
        layout.validate_for_native(
            if (from_height - 300.0).abs() < 0.6 {
                300.0
            } else if (from_height - 110.0).abs() < 0.6 {
                110.0
            } else {
                return Err(invalid("invalid Timer-to-Panel source region"));
            },
            700.0,
        )?;
    } else {
        return Err(invalid(
            "Panel v4 only supports real Panel/Timer transitions",
        ));
    }
    if !eased.is_finite() || !(0.0..=1.0).contains(&eased) {
        return Err(invalid("invalid Panel Motion v4 progress"));
    }
    if eased <= 0.0 || eased >= 1.0 {
        return focus_mode_raster::compose(outgoing, incoming, visible, eased);
    }
    // The taller cleanplate owns the entire intermediate envelope. The
    // shorter view is physically clipped to its real source/target extent.
    // Blending two *fully resampled* screenshots would ghost the short
    // Timer shell below its 110px boundary during Panel contraction.
    let expanding = to_height > from_height;
    let (full_plate, short_plate, opacity, short_height) = if expanding {
        (to_plate, from_plate, 1.0 - eased, from_height)
    } else {
        (from_plate, to_plate, eased, to_height)
    };
    let mut frame = focus_mode_raster::compose(full_plate, full_plate, visible, eased)?;
    let short_rect = Rect {
        x: 0.0,
        y: 0.0,
        width: TIMER_WIDTH,
        height: short_height,
    };
    blit(
        &mut frame,
        visible,
        short_plate,
        &short_rect,
        &short_rect,
        opacity,
    );
    blit(
        &mut frame,
        visible,
        outgoing,
        &layout.title.from,
        &layout.title.from.interpolate(&layout.title.to, eased),
        1.0,
    );
    blit(
        &mut frame,
        visible,
        outgoing,
        &layout.timer.from,
        &layout.timer.from.interpolate(&layout.timer.to, eased),
        1.0,
    );
    Ok(frame)
}

#[cfg(test)]
mod tests {
    use super::*;
    fn image(height: u32, byte: u8) -> Image {
        Image {
            size: tauri::PhysicalSize::new(340, height),
            bgra: [byte, byte, byte, 255].repeat((340 * height) as usize),
        }
    }
    fn rect(x: f64, y: f64, width: f64, height: f64) -> Rect {
        Rect {
            x,
            y,
            width,
            height,
        }
    }
    fn layout() -> Layout {
        Layout {
            title: SharedRect {
                from: rect(10.0, 10.0, 30.0, 14.0),
                to: rect(30.0, 12.0, 30.0, 14.0),
            },
            timer: SharedRect {
                from: rect(260.0, 10.0, 60.0, 14.0),
                to: rect(250.0, 12.0, 60.0, 14.0),
            },
            toolbar: SharedRect {
                from: rect(10.0, 70.0, 280.0, 28.0),
                to: rect(10.0, 92.0, 280.0, 28.0),
            },
            actions: Some(rect(10.0, 38.0, 280.0, 20.0)),
            rows: vec![
                rect(12.0, 140.0, 290.0, 36.0),
                rect(12.0, 264.0, 290.0, 36.0),
            ],
        }
    }
    #[test]
    fn panel_shared_pixels_use_one_semantic_source_and_exact_endpoints() {
        let panel = image(700, 11);
        let compact = image(110, 22);
        let panel_plate = image(700, 33);
        let compact_plate = image(110, 44);
        let l = PanelLayout {
            title: SharedRect {
                from: rect(10.0, 76.0, 120.0, 20.0),
                to: rect(10.0, 10.0, 120.0, 20.0),
            },
            timer: SharedRect {
                from: rect(220.0, 76.0, 100.0, 20.0),
                to: rect(220.0, 10.0, 100.0, 20.0),
            },
        };
        l.validate_for_native(700.0, 110.0).unwrap();
        assert!(
            compose_panel(
                &panel,
                &compact,
                &image(300, 33),
                &compact_plate,
                panel.size,
                0.5,
                &l
            )
            .is_err(),
            "mismatched captured source DPI must fail"
        );
        assert!(
            compose_panel(
                &panel,
                &compact,
                &panel_plate,
                &image(300, 44),
                panel.size,
                0.5,
                &l
            )
            .is_err(),
            "mismatched captured target region must fail"
        );
        assert_eq!(
            compose_panel(
                &panel,
                &compact,
                &panel_plate,
                &compact_plate,
                panel.size,
                0.0,
                &l
            )
            .unwrap(),
            panel.bgra
        );
        assert_eq!(
            compose_panel(
                &panel,
                &compact,
                &panel_plate,
                &compact_plate,
                compact.size,
                1.0,
                &l
            )
            .unwrap(),
            compact.bgra
        );
        let frame = compose_panel(
            &panel,
            &compact,
            &panel_plate,
            &compact_plate,
            tauri::PhysicalSize::new(340, 405),
            0.5,
            &l,
        )
        .unwrap();
        let channel = |x: usize, y: usize| frame[(y * 340 + x) * 4];
        assert_eq!(
            channel(15, 43),
            11,
            "one outgoing title is at its measured interpolated anchor"
        );
        assert_eq!(
            channel(15, 130),
            33,
            "the source Panel title does not remain in the clean background"
        );
        assert_eq!(
            channel(15, 11),
            39,
            "the target Timer title does not exist as a duplicate sprite"
        );
        // Reverse direction: a short source cannot leak its text-free
        // pixels into the newly exposed Panel region below 110px either.
        let reverse = PanelLayout {
            title: SharedRect {
                from: l.title.to.clone(),
                to: l.title.from.clone(),
            },
            timer: SharedRect {
                from: l.timer.to.clone(),
                to: l.timer.from.clone(),
            },
        };
        let expanding_frame = compose_panel(
            &compact,
            &panel,
            &compact_plate,
            &panel_plate,
            tauri::PhysicalSize::new(340, 405),
            0.5,
            &reverse,
        )
        .unwrap();
        assert_eq!(
            expanding_frame[(130 * 340 + 15) * 4],
            33,
            "the short Compact cleanplate never bleeds below 110px into the Panel",
        );
        let mut invalid_layout = l;
        invalid_layout.timer.to.x = 40.0;
        assert!(invalid_layout.validate_for_native(700.0, 110.0).is_err());
    }

    #[test]
    fn overlapping_semantic_sprite_regions_are_rejected_before_paint() {
        let mut l = layout();
        l.title.to = rect(245.0, 12.0, 30.0, 14.0);
        assert!(l.validate().is_err(), "target title and timer overlap");
        let mut l = layout();
        l.rows = vec![
            rect(12.0, 140.0, 290.0, 36.0),
            rect(12.0, 145.0, 290.0, 36.0),
        ];
        assert!(l.validate_for_native(110.0, 300.0).is_err());
    }

    #[test]
    fn malformed_intermediate_source_fails_without_bgra_out_of_bounds() {
        let mut truncated = image(110, 11);
        truncated.bgra.truncate(3);
        let target = image(300, 22);
        let plate = image(300, 33);
        assert!(compose(
            &truncated,
            &target,
            &plate,
            tauri::PhysicalSize::new(340, 205),
            0.5,
            true,
            &layout()
        )
        .is_err());
        let mut truncated_plate = image(300, 33);
        truncated_plate.bgra.truncate(5);
        assert!(compose(
            &image(110, 11),
            &target,
            &truncated_plate,
            tauri::PhysicalSize::new(340, 205),
            0.5,
            true,
            &layout()
        )
        .is_err());
        let mut target = image(300, 22);
        target.bgra.clear();
        assert!(compose(
            &image(110, 11),
            &target,
            &plate,
            tauri::PhysicalSize::new(340, 205),
            0.5,
            true,
            &layout()
        )
        .is_err());
    }

    #[test]
    fn high_dpi_half_pixel_edges_stay_inside_image() {
        let high_dpi = Image {
            size: tauri::PhysicalSize::new(425, 375),
            bgra: vec![255; 425 * 375 * 4],
        };
        // Both halves round up if measured independently at 1.25x.
        let exactly_fitting = rect(0.4, 4.0, 339.6, 10.0);
        let measured = pixels(&exactly_fitting, &high_dpi).unwrap();
        assert_eq!(measured.x + measured.w, 425);
        let cropped = rect(0.0, 298.0, 340.0, 4.0);
        assert!(pixels(&cropped, &high_dpi).is_none());
    }

    #[test]
    fn source_and_target_rasters_are_byte_exact() {
        let old = image(110, 11);
        let new = image(300, 22);
        let plate = image(300, 33);
        assert_eq!(
            compose(&old, &new, &plate, old.size, 0.0, true, &layout()).unwrap(),
            old.bgra
        );
        assert_eq!(
            compose(&old, &new, &plate, new.size, 1.0, true, &layout()).unwrap(),
            new.bgra
        );
    }
    #[test]
    fn mid_expansion_uses_clean_plate_and_one_outgoing_semantic_source() {
        let old = image(110, 11);
        let new = image(300, 22);
        let plate = image(300, 33);
        let visible = tauri::PhysicalSize::new(340, 205);
        let frame = compose(&old, &new, &plate, visible, 0.5, true, &layout()).unwrap();
        // Background cannot accidentally crossfade two screenshot titles.
        let sample = |x: usize, y: usize| frame[(y * 340 + x) * 4];
        assert_eq!(sample(1, 1), 33);
        assert_eq!(sample(20, 20), 11);
        assert_eq!(sample(55, 21), 33);
        assert_eq!(frame.len(), 340 * 205 * 4);
    }
    #[test]
    fn partial_row_is_not_painted_and_collapse_uses_exact_compact_endpoint() {
        let compact = image(110, 11);
        let expanded = image(300, 22);
        let plate = image(300, 33);
        let visible = tauri::PhysicalSize::new(340, 160);
        let intermediate =
            compose(&compact, &expanded, &plate, visible, 0.3, true, &layout()).unwrap();
        let first_row = (150_usize * 340 + 15) * 4;
        assert_eq!(intermediate[first_row], 33); // First row bottom 176: no partial text.
        assert_eq!(
            compose(
                &expanded,
                &compact,
                &plate,
                compact.size,
                1.0,
                false,
                &layout()
            )
            .unwrap(),
            compact.bgra
        );
    }

    #[test]
    fn invalid_geometry_cannot_escape_bounded_native_pixels() {
        let mut l = layout();
        l.title.from.x = f64::NAN;
        assert!(l.validate().is_err());
        let mut l = layout();
        l.toolbar.from = rect(0.0, 105.0, 20.0, 15.0);
        assert!(l.validate_for_native(110.0, 300.0).is_err());
        let mut l = layout();
        l.rows = vec![rect(12.0, 280.0, 290.0, 30.0)];
        assert!(l.validate_for_native(110.0, 300.0).is_err());
        let mut l = layout();
        l.rows = vec![rect(0.0, 0.0, 1.0, 1.0); 65];
        assert!(l.validate().is_err());
    }
}
