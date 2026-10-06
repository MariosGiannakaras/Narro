# 2026-10-06 — M6 whole-Focus reconciliation checkpoint / PR241 active

## Scope

This checkpoint records the current whole-Focus canonical source/state reconciliation and the requested audit of preceding implementation PRs. It does not close M6, does not claim physical/source parity, and does not advance counters.

## Prior branch / PR audit

The recent source branches were checked against current `main`, their exact PR heads and exact-head Windows CI rather than inferred from closed state:

- PR236 / finding27: head `357706a1fe6d7143c046c64df2f336a236026a88`, Windows CI962 PASS.
- PR237 / finding07: head `74658f9c47bf808f8bf23c1726125c8a8b5cbb8f`, Windows CI967 PASS.
- PR238 / M9 Overview PDF: head `e584b5d5d40623a9e14b7180ecb5b117ad73ae03`, Windows CI971 PASS.
- PR239 / finding36 selected-list continuity: head `955a6e124130ae9abae9be3fff242f881abadfc5`, Windows CI976 PASS.
- PR240 / finding35 Time's Up Extend: head `94ea1ccdf7bbc8f00585370d799b077b8bad2ef9`, Windows CI983 PASS.

Current-main blob comparison found no lost correction. The only older-head blob differences are explained by later validated changes: `src-tauri/src/lib.rs` was subsequently extended by the PDF slice and the M7 integration regression was subsequently extended by finding35 while retaining finding36 coverage. No historical branch should be merged wholesale.

## Canonical M6 findings

### 1. Focus-local Quick Preferences — FIX_NOW, implementation active

Canonical current SS-H05 plus VE-003 establish a distinct Focus-local `Menu → Quick Preferences` surface. Current production still had the Focus gear as an explicitly non-mutating placeholder and legacy regressions required it to remain inactive. No current routing/exclusion justified that state.

PR241, branch `fix/m6-focus-quick-preferences`, exact head `57445875f7b04eae4d8b7e35fc8c0d5012899619`, implements only the source-evidenced subset:

- hide est/done times;
- screen cards with dimensions and selected accent treatment;
- Blitz Panel side;
- Pomodoros;
- timed alerts;
- notification alerts;
- success screen;
- nested Fun GIF.

The slice reuses `PreferenceSettingsRuntimeProvider` and the existing persisted preferences authority; it introduces no parallel native command/settings state. Back receives initial keyboard focus and Escape returns to Focus.

At this checkpoint Windows CI985/run `37472276330` is still running. Its `validation-gate` and `fast-gate` have PASSed, including the fast frontend/contract gate and Rust formatting. The Windows candidate job is not yet complete, so PR241 is **not merge-approved yet** and no full-CI PASS is claimed. Local checkout validation is NOT RUN because this execution container cannot resolve github.com.

### 2. Ordinary Focus queue action rail / overflow — FIX_NOW, next independent source slice

Full Pass-3 VE-003 is direct and newer than the PR158-era rail contract. It shows ordinary Focus hover as:

`Complete → Make Live → Subtasks → Notes → overflow`

and explicitly says this is surface-specific and differs from board lane-arrow grammar. Current production instead exposes Make Live + Move up + Move down + overflow, keeps Notes inside overflow, and has no ordinary-row direct Subtasks action.

VE-003 also gives the ordinary Focus overflow order:

`Schedule → Change list → Duplicate → Delete`

Current Focus overflow is `Notes → Schedule → Permanently delete`. Change List and Duplicate already have validated M5 domain/API authority and must be reused rather than reimplemented.

The next source slice should correct the visible rail and overflow while preserving Focus reorder capability through a source-compatible interaction rather than leaving non-source up/down buttons in the hover rail. Reuse existing Notes, subtask and M5 Change List/Duplicate boundaries. Do not silently change destructive semantics in the same slice: Focus delete confirmation has conflicting source/reliability evidence and needs its own explicit disposition.

### 3. Focus Home visible PAUSED transition — SOURCE-CONFIRMED / BACKEND-POLICY AMBIGUITY

Full Pass-3 VE-003 directly shows Home exposing `PAUSED` before Focus exits and a paused transient on later re-entry before running resumes. Historical PR158 deliberately made Home a presentation-only lifecycle path with no timer mutation.

A naive `timer_pause` correction is not safe: current native `start_blitz` treats any paused timer as already active and does not resume it. Therefore implementing only the visible pause would leave the task paused indefinitely on re-entry and could violate explicit user-pause intent if `start_blitz` were changed to resume all paused sessions.

Disposition for now: visible source behavior is confirmed, but hidden pause-origin/resume semantics are not. Do not invent a backend policy. Keep this open for stronger evidence or an explicit bounded design that can distinguish Home-induced pause from an intentional user pause without risking tracked-time correctness.

### 4. Board → Focus motion — REAL M6 SOURCE GAP / DESIGN REQUIRED

The canonical full Pass-3 VE-003 record says Board→Focus is a ~0.22 s shrink/translate **window morph, not a page fade**. Current PR229/P3-M6-01 implementation is a ~250 ms board fade. The current crosswalk/TODO incorrectly describe that fade as the observed source behavior even though the Pass-3 record says otherwise. No intentional reliability/Windows deviation was found in PR229's immutable closure record.

This is a real motion parity gap, but it should not be “fixed” with a cosmetic board CSS scale/fade. Narro currently has separate Main and retained `focusSurface` ownership, so a credible correction needs a bounded presentation/native design that preserves single-runtime/session authority, hidden/readiness gates, reduced-motion behavior and the solved Focus-surface continuity work. Keep the current state marked source-gap/validation-open until such a design is validated.

## Preserved validated work

Do not reopen or replace:

- PR239 selected-list continuity through success/Next Task;
- PR240 Time's Up Extend slot substitution;
- PR236 selected-monitor recovery source correction;
- PR237 nonblocking Home/list-board reads;
- PR229 Notes toolbar/URL and live-edge corrections except the specifically contradicted entry-motion row above.

Notes microphone/voice transcription remains explicitly outside the initial Narro scope and is not an M6 gap.

## Exact continuation

1. Inspect exact PR241 head CI985. If it fails, fix only the evidence-backed failure. If it passes, re-check live `main`, PR head and mergeability, then expected-head-guard merge and validate resulting main as required.
2. Reconcile tracking against the validated PR241 result without advancing M6 completion.
3. Implement the ordinary Focus rail/overflow gap as a separate bounded M6 source slice on the then-current authoritative `main`; preserve reorder through a source-compatible interaction and reuse existing domain boundaries.
4. Keep Home pause/resume semantics as explicit ambiguity and keep Board→Focus morph as a separate M6 source-design gap; do not paper over either with speculative behavior.
5. Physical/manual/source-comparison gates remain OPEN and deferred. M10 remains blocked.

Progress remains `3/10M || 0/3 | 17/18`.
