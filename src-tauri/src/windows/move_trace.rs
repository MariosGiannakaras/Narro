//! Opt-in observation only: bounded nonblocking native move/position receipts.
//! No input, geometry mutation, task data, Timer locks or UI-thread file I/O.
use std::ffi::c_void;
use std::io::{self, Write};
use std::path::PathBuf;
use std::sync::{
    atomic::{AtomicU32, Ordering},
    mpsc, OnceLock,
};
use std::time::{Instant, SystemTime, UNIX_EPOCH};

const MAX_RECORDS: u32 = 2048;
const QUEUE_SIZE: usize = 256;
const ENV: &str = "NARRO_NATIVE_MOVE_TRACE_DIR";
#[derive(Clone, Copy)]
pub(super) enum Stage {
    Received,
    AfterSubclass,
    AfterSnap,
    AfterDefault,
}
impl Stage {
    fn label(self) -> &'static str {
        match self {
            Self::Received => "received",
            Self::AfterSubclass => "after_subclass",
            Self::AfterSnap => "after_snap",
            Self::AfterDefault => "after_default",
        }
    }
}
#[repr(C)]
#[derive(Clone, Copy, Default)]
struct Rect {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}
#[repr(C)]
#[derive(Clone, Copy, Default)]
struct Point {
    x: i32,
    y: i32,
}
#[repr(C)]
struct WindowPos {
    hwnd: *mut c_void,
    after: *mut c_void,
    x: i32,
    y: i32,
    cx: i32,
    cy: i32,
    flags: u32,
}
#[repr(C)]
#[derive(Default)]
struct Gui {
    size: u32,
    flags: u32,
    active: *mut c_void,
    focus: *mut c_void,
    capture: *mut c_void,
    menu: *mut c_void,
    moving: *mut c_void,
    caret: *mut c_void,
    caret_rect: Rect,
}
#[link(name = "user32")]
unsafe extern "system" {
    fn GetWindowRect(hwnd: *mut c_void, rect: *mut Rect) -> i32;
    fn GetWindowRgnBox(hwnd: *mut c_void, rect: *mut Rect) -> i32;
    fn GetCursorPos(point: *mut Point) -> i32;
    fn GetDpiForWindow(hwnd: *mut c_void) -> u32;
    fn GetWindowLongPtrW(hwnd: *mut c_void, index: i32) -> isize;
    fn GetWindowThreadProcessId(hwnd: *mut c_void, pid: *mut u32) -> u32;
    fn GetGUIThreadInfo(thread: u32, gui: *mut Gui) -> i32;
    fn SystemParametersInfoW(action: u32, param: u32, data: *mut c_void, flags: u32) -> i32;
}

struct Row {
    sequence: u32,
    utc_ms: u128,
    elapsed_us: u128,
    dropped: u32,
    stage: Stage,
    message: u32,
    wparam: usize,
    result: Option<isize>,
    snapped: Option<bool>,
    hwnd: usize,
    actual: Option<Rect>,
    proposed: Option<Rect>,
    position: Option<[i64; 5]>,
    cursor: Option<Point>,
    dpi: u32,
    style: isize,
    ex_style: isize,
    gui: Option<(u32, usize)>,
    region: Option<Rect>,
    drag_full: Option<bool>,
}
const HEADER:&str="sequence\tutc_ms\telapsed_us\tdropped_before\tstage\tmessage\twparam\tresult\tsnapped\thwnd\tactual_left\tactual_top\tactual_right\tactual_bottom\tproposed_left\tproposed_top\tproposed_right\tproposed_bottom\tposition_x\tposition_y\tposition_cx\tposition_cy\tposition_flags\tcursor_x\tcursor_y\tdpi\tstyle\tex_style\tgui_flags\tgui_move_hwnd\tregion_left\tregion_top\tregion_right\tregion_bottom\tdrag_full_windows\n";
fn optional<T: ToString>(value: Option<T>) -> String {
    value.map(|v| v.to_string()).unwrap_or_default()
}
fn rect_columns(out: &mut Vec<String>, value: Option<Rect>) {
    for n in value
        .map(|r| [r.left, r.top, r.right, r.bottom])
        .unwrap_or_default()
        .into_iter()
    {
        out.push(optional(value.map(|_| n)));
    }
}
impl Row {
    fn write(&self, out: &mut impl Write) -> io::Result<()> {
        let mut values = vec![
            self.sequence.to_string(),
            self.utc_ms.to_string(),
            self.elapsed_us.to_string(),
            self.dropped.to_string(),
            self.stage.label().into(),
            self.message.to_string(),
            self.wparam.to_string(),
            optional(self.result),
            optional(self.snapped.map(u8::from)),
            self.hwnd.to_string(),
        ];
        rect_columns(&mut values, self.actual);
        rect_columns(&mut values, self.proposed);
        for i in 0..5 {
            values.push(optional(self.position.map(|p| p[i])));
        }
        values.extend([
            optional(self.cursor.map(|p| p.x)),
            optional(self.cursor.map(|p| p.y)),
            self.dpi.to_string(),
            self.style.to_string(),
            self.ex_style.to_string(),
            optional(self.gui.map(|g| g.0)),
            optional(self.gui.map(|g| g.1)),
        ]);
        rect_columns(&mut values, self.region);
        values.push(optional(self.drag_full.map(u8::from)));
        writeln!(out, "{}", values.join("\t"))
    }
}
struct Trace {
    send: mpsc::SyncSender<Row>,
    attempts: AtomicU32,
    dropped: AtomicU32,
    started: Instant,
    drag_full: Option<bool>,
}
static TRACE: OnceLock<Option<Trace>> = OnceLock::new();
fn interested(message: u32) -> bool {
    matches!(
        message,
        0x0231 | 0x0232 | 0x0216 | 0x0046 | 0x0047 | 0x0003 | 0x0112 | 0x02e0
    )
}
fn initialize() -> Option<Trace> {
    let root = PathBuf::from(std::env::var_os(ENV)?);
    if !root.is_absolute() {
        eprintln!("Native move trace requires an absolute local directory");
        return None;
    }
    let (send, receive) = mpsc::sync_channel::<Row>(QUEUE_SIZE);
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .ok()?
        .as_millis();
    let path = root.join(format!(
        "native-move-{}-{timestamp}.tsv",
        std::process::id()
    ));
    // Only the writer thread creates/opens/writes files. A failed/full writer
    // never blocks, fails or changes the window's ordinary native processing.
    std::thread::Builder::new()
        .name("narro-native-move-trace".into())
        .spawn(move || {
            let write = || -> io::Result<()> {
                std::fs::create_dir_all(root)?;
                let mut file = std::fs::OpenOptions::new()
                    .write(true)
                    .create_new(true)
                    .open(path)?;
                file.write_all(HEADER.as_bytes())?;
                for row in receive {
                    row.write(&mut file)?;
                }
                Ok(())
            };
            if let Err(error) = write() {
                eprintln!("Native move trace writer failed: {error}");
            }
        })
        .ok()?;
    let mut drag_full = 0i32;
    let drag_full =
        if unsafe { SystemParametersInfoW(0x0026, 0, (&mut drag_full as *mut i32).cast(), 0) } != 0
        {
            Some(drag_full != 0)
        } else {
            None
        };
    Some(Trace {
        send,
        attempts: AtomicU32::new(0),
        dropped: AtomicU32::new(0),
        started: Instant::now(),
        drag_full,
    })
}

pub(super) fn record(
    hwnd: *mut c_void,
    message: u32,
    wparam: usize,
    lparam: isize,
    stage: Stage,
    result: Option<isize>,
    snapped: Option<bool>,
) {
    if !interested(message) {
        return;
    }
    let Some(trace) = TRACE.get_or_init(initialize) else {
        return;
    };
    let Ok(sequence) = trace
        .attempts
        .fetch_update(Ordering::Relaxed, Ordering::Relaxed, |n| {
            if n < MAX_RECORDS {
                Some(n + 1)
            } else {
                None
            }
        })
    else {
        return;
    };
    let mut actual = Rect::default();
    let actual = (unsafe { GetWindowRect(hwnd, &mut actual) } != 0).then_some(actual);
    let mut region = Rect::default();
    let region = (unsafe { GetWindowRgnBox(hwnd, &mut region) } != 0).then_some(region);
    let proposed = if message == 0x0216 && lparam != 0 {
        Some(unsafe { *(lparam as *const Rect) })
    } else {
        None
    };
    let position = if matches!(message, 0x0046 | 0x0047) && lparam != 0 {
        let p = unsafe { &*(lparam as *const WindowPos) };
        Some([
            i64::from(p.x),
            i64::from(p.y),
            i64::from(p.cx),
            i64::from(p.cy),
            i64::from(p.flags),
        ])
    } else {
        None
    };
    let mut cursor = Point::default();
    let cursor = (unsafe { GetCursorPos(&mut cursor) } != 0).then_some(cursor);
    let mut gui = Gui {
        size: std::mem::size_of::<Gui>() as u32,
        ..Gui::default()
    };
    let thread = unsafe { GetWindowThreadProcessId(hwnd, std::ptr::null_mut()) };
    let gui = (unsafe { GetGUIThreadInfo(thread, &mut gui) } != 0)
        .then_some((gui.flags, gui.moving as usize));
    let row = Row {
        sequence: sequence + 1,
        utc_ms: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or_default(),
        elapsed_us: trace.started.elapsed().as_micros(),
        dropped: trace.dropped.load(Ordering::Relaxed),
        stage,
        message,
        wparam,
        result,
        snapped,
        hwnd: hwnd as usize,
        actual,
        proposed,
        position,
        cursor,
        dpi: unsafe { GetDpiForWindow(hwnd) },
        style: unsafe { GetWindowLongPtrW(hwnd, -16) },
        ex_style: unsafe { GetWindowLongPtrW(hwnd, -20) },
        gui,
        region,
        drag_full: trace.drag_full,
    };
    if trace.send.try_send(row).is_err() {
        let _ = trace
            .dropped
            .fetch_update(Ordering::Relaxed, Ordering::Relaxed, |n| n.checked_add(1));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn scope_contains_native_move_chain_but_no_idle_mouse_or_timer_polling() {
        for m in [0x231, 0x232, 0x216, 0x46, 0x47, 3, 0x112, 0x2e0] {
            assert!(interested(m));
        }
        for m in [0xf, 0x113, 0x200, 0x201, 0x20] {
            assert!(!interested(m));
        }
    }
    #[test]
    fn bounded_queue_is_nonblocking_when_full_or_disconnected() {
        let (tx, rx) = mpsc::sync_channel(1);
        tx.try_send(1).unwrap();
        assert!(matches!(tx.try_send(2), Err(mpsc::TrySendError::Full(2))));
        drop(rx);
        assert!(matches!(
            tx.try_send(3),
            Err(mpsc::TrySendError::Disconnected(3))
        ));
    }
    #[test]
    fn numeric_receipt_preserves_negative_rects_and_missing_values_without_task_data() {
        let row = Row {
            sequence: 1,
            utc_ms: 2,
            elapsed_us: 3,
            dropped: 0,
            stage: Stage::AfterSnap,
            message: 0x216,
            wparam: 0,
            result: Some(1),
            snapped: Some(true),
            hwnd: 4,
            actual: Some(Rect {
                left: -445,
                top: 20,
                right: -20,
                bottom: 895,
            }),
            proposed: None,
            position: None,
            cursor: Some(Point { x: -672, y: 37 }),
            dpi: 120,
            style: 0,
            ex_style: 8,
            gui: Some((2, 4)),
            region: None,
            drag_full: Some(true),
        };
        let mut out = Vec::new();
        row.write(&mut out).unwrap();
        let text = String::from_utf8(out).unwrap();
        let fields: Vec<_> = text.trim_end_matches('\n').split('\t').collect();
        assert_eq!(fields.len(), HEADER.trim_end().split('\t').count());
        assert_eq!(&fields[10..14], ["-445", "20", "-20", "895"]);
        assert_eq!(&fields[14..18], ["", "", "", ""]);
        assert_eq!(fields[28], "2");
        assert_eq!(fields[34], "1");
    }
}
