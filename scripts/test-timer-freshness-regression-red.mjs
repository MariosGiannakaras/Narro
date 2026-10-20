// Regression-first proof for the UNRESOLVED C26-C28/C35 native stale-pixel
// failure. Intentionally NOT registered in npm preflight: the final assertion
// is RED until an evidence-backed incoming-frame guard actually exists.
// Execute manually: node --test scripts/test-timer-freshness-regression-red.mjs
// Never weaken this to an rAF count, a compile check, or a Win32 redraw toggle.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");
const native = read("src-tauri/src/lib.rs");
const region = read("src-tauri/src/timer_region.rs");
const hold = read("src-tauri/src/focus_frame_hold.rs");
const capture = read("src-tauri/src/focus_frame_capture.rs");
const timer = read("src/FloatingTimerFoundation.tsx");
const coordinator = read("src/FocusSurfaceCoordinator.tsx");
const frame = read("src/presentationFrame.ts");
const proof = JSON.parse(read("work-log/evidence/capture57-analysis-20261020/m7-transitions/proof-index.json"));

function between(source, from, to) {
  const start = source.indexOf(from);
  assert.ok(start >= 0, "source contract owner not found: " + from);
  const end = source.indexOf(to, start + from.length);
  assert.ok(end > start, "source contract boundary not found: " + to);
  return source.slice(start, end);
}

const nativeTimer = between(native, "fn apply_timer_native(", "fn apply_focus_native_target(");
const expandNative = between(nativeTimer, "        if expanded {", "        } else {");
const coordinatorResize = between(coordinator,
  "  const requestTimerExpanded = useCallback(", "\n  useEffect(() => {");

test("original actual native proof has eight retained decoded intervals and BOTH motion modes", () => {
  assert.equal(proof.intervals.length, 8);
  assert.equal(proof.intervals.reduce((sum, row) => sum + row.decodedFrames, 0), 1099);
  for (const prefix of ["normal-", "reduced-"]) {
    for (const action of ["panel-to-timer", "timer-to-panel", "expand", "collapse"]) {
      assert.ok(proof.intervals.some(row => row.interval === prefix + action),
        "missing physical frame interval: " + prefix + action);
    }
  }
  for (const frame of proof.proof) {
    assert.match(frame.pixelsSha256, /^[0-9a-f]{64}$/);
    assert.match(frame.copiedPngSha256, /^[0-9a-f]{64}$/);
  }
});

test("existing native/renderer safety owners must remain unchanged by any experimental Timer fix", () => {
  assert.match(native, /fn apply_focus_native_target\(/);
  assert.match(native, /focus_frame_hold::clear\(window\)\?/);
  assert.match(nativeTimer, /timer_region::apply_without_redraw\(window, target\.region\(\)\)\?/);
  assert.match(region, /apply_physical\(window, visible_size\(window, logical\)\?, false\)/,
    "do not recreate historical forced-redraw blank frame defect");
  assert.match(hold, /pub\(crate\) fn begin_mode_transition\(/,
    "existing Panel-Timer finite raster generation/rollback owner cannot be silently deleted");
  assert.match(capture, /CapturePreview\(/,
    "WebView2 pixels, not desktop/GDI caption frames, are required");
  assert.match(frame, /requestAnimationFrame\(/);
  assert.match(timer, /await waitForPresentedFrame\(\)/,
    "source prepaint still happens, but is NOT a compositor acknowledgment");
});

test("RED: newly uncovered Timer expanded area must be protected by a verified current-generation raster before SetWindowRgn", () => {
  // Both the source and the failure proof show that double-rAF can precede a
  // stale backing store. Bare SetWindowRgn(FALSE) cannot certify freshness.
  // The expansion branch has neither the Timer-to-Timer raster hold nor an
  // identity-validated incoming renderer snapshot/lease.
  const hasFreshFullFrameGuard =
    /focus_frame_hold::begin_mode_transition\(|focus_frame_hold::begin\(/.test(expandNative)
    && /focus_frame_capture::capture\(|captureCompactTimerFrame\(/.test(
      nativeTimer + coordinatorResize);
  assert.ok(hasFreshFullFrameGuard,
    "C26–C28/C35 RED: expansion changes native visible region without verified incoming pixels protected by a finite raster lease. Add a generation-verified, bounded incoming-frame protocol before this can pass; do NOT satisfy it with a no-op marker, rAF delay or redraw=true.");
});
