# Finding30 — direct SS-H17 bounded-picker source comparison

Date: 2026-10-07

Status: **SCOPED SOURCE_PARITY_PASS / PHYSICAL WINDOWS OPEN**

No application source changed in this slice.

## Canonical source evidence

- Canonical screenshot: `SS-H17`.
- Repository path: `reference/original-blitzit-screenshots/help-v2x-sessions-add-session-task-picker-open.png`.
- Git blob: `4359d7bf1b0c4c04e64cd9e7d1ca8fe7f4fd964a`.
- Pass-3 state: SOURCE_COMPLETE.
- Calibration state: SYSTEM_REFERENCE.

Direct inspection establishes the Finding30-relevant source grammar:
- Add Session task picker is width-bounded;
- task rows are one line;
- list identity remains contained at the right;
- there is no horizontal scrollbar / horizontally scrollable task surface.

The screenshot does not contain an equivalently extreme unbroken title, so no exact source ellipsis threshold is claimed.

## Exact Narro evidence

Implementation candidate:
- PR246 exact head: `7b47aacea282d5307633d0596f15e229b0c0feb2`;
- Windows CI1020/run: `37615461397` full PASS;
- merge: `dfefc9bf22837ce90be396217bae505b4dc61418`;
- resulting-main source/test blobs: 6/6 identical to the validated head.

Visual artifact:
- artifact: `narro-m5-visual-regression`;
- artifact id: `11480187815`;
- artifact digest: `sha256:c0fb393303e0bc0d139a1700f1c7f643b9979828c655c27106751804952da61d`;
- compared screenshot: `reports-sessions-add-dark.png`;
- screenshot size: 1280×720;
- screenshot SHA-256: `04a85c20c67ed5bce683c6f5e2313881ee56ee71618eceb4d02a419fb2e678f2`.

The exact-head screenshot visibly shows:
- Recent Tasks contained inside the Add Session surface;
- one-line task rows;
- right-side list identity labels kept inside the row;
- no horizontal scrollbar;
- the intentionally extreme unbroken Finding30 fixture truncated rather than widening the picker.

The same candidate's rendered validator also asserts `scrollWidth <= clientWidth + 1` for the long-title fixture.

## Disposition

**Finding30 scoped source parity PASS.**

The implementation now matches the canonical behavior relevant to this finding: the picker remains bounded and does not become a horizontally scrolling surface under long/unbroken content.

This does **not** close:
- broad Reports/Sessions visual parity;
- unrelated differences in Add Session composition/styling;
- actual packaged-Windows physical acceptance.

Those gates remain independently OPEN and must not inherit this scoped PASS.

Progress counters do not advance from this finding-level source comparison.
