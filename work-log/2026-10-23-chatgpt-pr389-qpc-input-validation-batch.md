# PR389 A02 QPC input-validation correction (2026-10-23)

**Owner:** ChatGPT, all non-physical analysis/code/tests/CI. **Branch:** `fix/m7-pixel-preserving-composition` / draft [PR389](https://github.com/MariosGiannakaras/Narro/pull/389). **Exact source head:** `2b79a20993f7520272edb44cc9b96b27d5f6ca84`; parent baseline was `88baa42b02e79999d8b93f592ace9829c9ee1a88`. Source edits confined to `scripts/analyze-focus-compositor-trace.mjs` and `scripts/test-focus-compositor-trace.mjs`.

## Reason and correction

The analyzer previously coerced `captureQpcBefore`, `captureQpcAfter` and `captureQpcFrequency` with `Number(...)` before validation. `Number(null)` and `Number("")` yield zero, permitting absent/empty measurement fields to be mistakenly interpreted as QPC timestamps or frequencies. Corrupted frame brackets therefore could be correlated to native phases rather than rejected, potentially biasing a ghost-frame diagnosis. New input checks require real finite JSON numbers and unchanged native/Windows QPC frequency consistency. Regression covers null, empty, numeric strings, undefined, NaN and Infinity separately for each field.

The analyzer's offline CLI JSON format, native marker/event/trace code, timer session, HWND compositor, performance path and personal data are **unchanged**. Actual Windows PowerShell capture emits native numeric Stopwatch timestamps. This is data-integrity protection, NOT an observed native A02 compositor fix.

## Validation and boundaries

New exact head 3/3 validation/fast/Windows candidate CI **NOT VERIFIED**: the connected GitHub Actions query returned no matching PR-triggered run for the new SHA when checked. Local Node or Windows execution in this chat **NOT RUN** (no repository checkout/network-connected Windows runner available). New packaged EXE **NOT VERIFIED**; new native A02/normal+reduced 8-case physical **NOT RUN**. Historical ccb70a92 3/3 and video-scoped A02 FAIL remain dated and are not reusable for this source; `PHYSICAL_BEFORE_MERGE` stays.

**One next physical prerequisite after CI:** exact SHA+manifest+binary verification in disposable Windows test profile, then real user-click Compact→Expanded 60fps/QPC capture, first failing frame classification and native root repair if evidenced. [Guide](https://github.com/MariosGiannakaras/Narro/blob/fix/m7-pixel-preserving-composition/docs/M7_A02_QPC_TRACE.md). [Canonical current handoff](../HANDOFF.md).
