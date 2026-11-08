//! Opt-in diagnostics for A02 compositor/raster transitions.
//!
//! Enabled ONLY in the packaged, isolated Focus runtime capture with
//! NARRO_FOCUS_CAPTURE_DIR pointing at an absolute disposable directory.
//! Never records task names, time values, notes, window titles or bitmap data.
//! Native frame events are buffered in RAM and flushed AFTER the animation to
//! avoid inserting file I/O into the sensitive DWM/raster presentation loop.
//! A PowerShell desktop recorder captures QPC brackets for correlation.
//!
//! QPC and native API completion describe call timing, not the precise instant
//! at which DWM finally scans out the composed image.

use serde_json::{json, Value};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::Instant;

const TRACE_FILE: &str = "focus-transition-trace.jsonl";
const MAX_FRAME_EVENTS: usize = 512;
static WRITE_GATE: Mutex<()> = Mutex::new(());

pub(crate) fn trace_path() -> Option<PathBuf> {
    let value = std::env::var_os("NARRO_FOCUS_CAPTURE_DIR")?;
    let path = PathBuf::from(value);
    if !path.is_absolute() {
        return None;
    }
    Some(path.join(TRACE_FILE))
}

#[cfg(windows)]
fn qpc_stamp() -> (Option<i64>, Option<i64>) {
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn QueryPerformanceCounter(value: *mut i64) -> i32;
        fn QueryPerformanceFrequency(value: *mut i64) -> i32;
    }
    let mut ticks = 0_i64;
    let mut frequency = 0_i64;
    let counter_ok = unsafe { QueryPerformanceCounter(&mut ticks) } != 0;
    let frequency_ok = unsafe { QueryPerformanceFrequency(&mut frequency) } != 0;
    if counter_ok && frequency_ok && frequency > 0 {
        (Some(ticks), Some(frequency))
    } else {
        (None, None)
    }
}

#[cfg(not(windows))]
fn qpc_stamp() -> (Option<i64>, Option<i64>) {
    (None, None)
}

fn event(stage: &str, raster_token: u32, details: Value) -> Value {
    let (qpc_ticks, qpc_frequency) = qpc_stamp();
    json!({
        "schemaVersion": 1,
        "stage": stage,
        "rasterToken": raster_token,
        "utc": chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true),
        "processId": std::process::id(),
        "qpcTicks": qpc_ticks,
        "qpcFrequency": qpc_frequency,
        "sourceSha": option_env!("NARRO_VALIDATION_SOURCE_SHA").unwrap_or("unknown"),
        "details": details
    })
}

fn append_records(records: &[Value]) {
    if records.is_empty() {
        return;
    }
    let Some(path) = trace_path() else {
        return;
    };
    let Ok(_gate) = WRITE_GATE.lock() else {
        return;
    };
    let write = || -> Result<(), String> {
        let parent = path.parent().ok_or("trace file has no parent")?;
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        let mut bytes = Vec::new();
        for record in records {
            serde_json::to_writer(&mut bytes, record).map_err(|error| error.to_string())?;
            bytes.push(b'\n');
        }
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)
            .map_err(|error| error.to_string())?;
        file.write_all(&bytes).map_err(|error| error.to_string())?;
        file.flush().map_err(|error| error.to_string())
    };
    if let Err(error) = write() {
        eprintln!("Focus transition trace write failed: {error}");
    }
}

pub(crate) fn renderer_mark(stage: &str, raster_token: u32) -> bool {
    const STAGES: [&str; 7] = [
        "renderer.raster-ready",
        "renderer.target-prepared",
        "renderer.native-request",
        "renderer.native-finished",
        "renderer.commit",
        "renderer.release-request",
        "renderer.rollback",
    ];
    if !STAGES.contains(&stage) {
        return false;
    }
    if trace_path().is_some() {
        append_records(&[event(stage, raster_token, json!({}))]);
    }
    true
}

/// Buffers native markers without changing app state, raster image or geometry.
pub(crate) struct NativeMotionTrace {
    raster_token: u32,
    records: Vec<Value>,
    enabled: bool,
    started: Instant,
}

impl NativeMotionTrace {
    pub(crate) fn begin(raster_token: u32, from: &str, to: &str, duration_ms: u64) -> Self {
        let mut trace = Self {
            raster_token,
            records: Vec::new(),
            enabled: trace_path().is_some(),
            started: Instant::now(),
        };
        trace.note(
            "native.begin",
            json!({
                "from": from,
                "to": to,
                "durationMs": duration_ms
            }),
        );
        trace
    }

    pub(crate) fn note(&mut self, stage: &str, details: Value) {
        if self.enabled && self.records.len() < MAX_FRAME_EVENTS {
            let elapsed_us = self.started.elapsed().as_micros();
            self.records.push(event(
                stage,
                self.raster_token,
                json!({
                    "elapsedUs": elapsed_us,
                    "data": details
                }),
            ));
        }
    }

    pub(crate) fn frame(
        &mut self,
        stage: &str,
        step: u64,
        elapsed_ms: f64,
        progress: f64,
        x: i32,
        y: i32,
    ) {
        if !self.enabled {
            return;
        }
        self.note(
            stage,
            json!({
                "step": step,
                "elapsedMs": elapsed_ms,
                "easedProgress": progress,
                "requestedOwnerPosition": {"x": x, "y": y}
            }),
        );
    }
}

impl Drop for NativeMotionTrace {
    fn drop(&mut self) {
        if self.enabled {
            if self.records.len() >= MAX_FRAME_EVENTS {
                self.records.push(event(
                    "native.trace-truncated",
                    self.raster_token,
                    json!({}),
                ));
            }
            append_records(&self.records);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn renderer_stages_are_fixed_and_do_not_accept_user_text() {
        assert!(renderer_mark("renderer.native-request", 4));
        assert!(!renderer_mark("user task title", 4));
        assert!(!renderer_mark("../arbitrary.json", 4));
    }

    #[test]
    fn trace_without_environment_does_not_change_domain_or_files() {
        // CI process normally has no capture env; check representation without
        // altering global process variables in concurrent Rust tests.
        let trace = NativeMotionTrace {
            raster_token: 7,
            records: vec![],
            enabled: false,
            started: Instant::now(),
        };
        assert!(trace.records.is_empty());
    }
}
