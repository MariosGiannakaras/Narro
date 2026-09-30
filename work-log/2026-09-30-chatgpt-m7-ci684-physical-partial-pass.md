# M7 CI #684 physical retest — observed fixes pass, formal batch incomplete

Date: 2026-09-30

## Exact build provenance

- PR: #192 `plan/m7-single-focus`
- Exact source head: `274cf727f4d5b693904c2ff10f3835224368c4e8`
- Windows CI: #684 / run `36640613105` — PASS
- Runtime artifact id: `11066497568`
- Runtime artifact digest: `sha256:490940fd2becb63355725b420f3ac8079b3929f9287693a847bd3a2b4fc8b4f5`

## Physical recording

- File: `2026-09-30 02-02-23.mp4`
- SHA-256: `72360756a44ab94ac95aaf245beeadf1069fc91385268b68853bb17f570fd412`
- H.264, 4480×1080, 60 fps
- Duration: 37.516667 s
- Both displays are visible. The Timer geometry on the scaled display is approximately 425×138 physical px compact and 425×375 physical px expanded, matching 340×110 and 340×300 logical at 125%.

## Gate 7 observations

Observed behavior on the exact #684 build is materially corrected versus CI #679:

- Three Panel→Timer transitions are visible (around 14.4 s, 25.3 s and 34.3 s).
- In all three, the target Timer region is clipped before native position motion. The #679 transparent/full-height 340×700 host/outline does not trail under the compact Timer.
- No opaque white/blank host, saved-position teleport, overlapping second Focus surface or loading flash was observed.
- Two complete Panel→Timer→Panel cycles are present. The recording ends after the third Panel→Timer transition, so the strict requirement of at least three complete Panel→Timer→Panel cycles is not yet satisfied.

Disposition: **observed defect signature fixed; formal Gate 7 acceptance remains OPEN only because the minimum complete-cycle count is short by one**.

## Compact / expanded observations

- Two complete compact Expand→Collapse cycles are visible on the 125% display (approximately 17.7→19.0 s and 19.6→20.7 s).
- Additional expansion paths are visible later, but they transition to Panel before another Collapse.
- No stale expanded lower tail, blank host or browser scrollbar flash was observed.

Disposition: **observed compact/expanded behavior is clean; formal batch requirement remains OPEN because only two complete Expand→Collapse cycles are present**.

## Gate 12 observations

The #679 cross-DPI stale viewport/browser-scrollbar failure did not recur.

- Timer runs on the 125% display at approximately 425×138 compact and 425×375 expanded.
- Cross-DPI Timer→Panel return occurs around 22.8–23.1 s.
- During final target settlement, the previous Timer-height native region remains clipped for roughly the intended bounded 50 ms interval (clearest approximately 23.033–23.067 s), then the full Panel is revealed by about 23.083 s.
- No stale narrow WebView viewport and no horizontal/vertical browser scrollbar flash was observed inside Narro.
- The visible scrollbar/title controls behind the moving window are the underlying Windows Settings window, not Narro/WebView scrollbars.
- A same-DPI Timer→Panel path around 32.7–33.2 s is also clean.
- One ordinary continuous cross-monitor drag is visible around 26.7–27.3 s without repeated push/snap-back. In this recording the direction is from the 125% display to the 100% display; the strict protocol specifically asks for an ordinary drag **to** the 125% display, so that exact subcase remains unrecorded.

Disposition: **the #679 Gate 12 failure signature is not reproduced and the corrective 50 ms settle behaves as intended, but formal Gate 12 acceptance remains OPEN until a drag to the 125% display is captured**.

## Session continuity

The same task/session `fas` remains active. The visible timer advances from about 01:18 around 12 s to about 01:40 around 34 s without reset, duplicate session or independent time jump.

## Required minimal follow-up

No source change is justified by this recording.

A short supplemental exact-#684 recording is sufficient if it shows:

1. one additional complete Panel→Timer→Panel cycle;
2. one additional complete compact Expand→Collapse cycle;
3. one ordinary drag from the 100% display to the 125% display, with compact/expanded geometry there;
4. return to Panel with no stale viewport or browser scrollbar flash;
5. the same task/session/time continuity during that clip.

After those missing protocol items pass, Gate 7 and Gate 12 may be closed and guarded merge/resulting-main validation can proceed.

No roadmap/current-slice counters advance from this partial physical evidence.
