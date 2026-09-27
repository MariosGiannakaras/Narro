# Blitzit UI/UX video forensic pass — checkpoint 1

Date: 2026-09-27  
Agent: ChatGPT  
Scope: evidence/research only; no Narro application source changes

## Why this slice exists

The initial video corpus ingestion completed 19/19 product-behavior analyses, but the user clarified that the required video work must cover the full user interface: functionality, text, inputs, animations, micro-animations, micro-interactions and overall UI/UX.

The earlier 19/19 label therefore must not be interpreted as exhaustive UI/UX forensics.

## Source baseline

- GitHub main at branch start: `e63662e90e58f0ca77ded0590282d740ff3c5424`.
- Validated application source baseline remains `699b6ac46bcc6ebcabbcded21f929a7b32018b42`.
- This evidence branch does not change application source.
- Open source PR #170 remains separate and must not be treated as validated/merged by this evidence work.

## Direct-media access

Reused the already-recorded GitHub Actions corpus artifact:
- artifact id `10932789030`
- artifact name `blitzit-video-transcript-corpus`
- digest previously recorded as `sha256:29668f8fb2ab235a8463a12a371ded721801e66e9ff4536999ab802dd64550b9`

The archive contains all 19 MP4 + 19 SRT files and was inspected locally with ffmpeg/ffprobe/OpenCV.

## Work completed in this checkpoint

Deep UI/UX forensic pass completed for 12/19 pairs:
- VE-002, VE-003, VE-005, VE-007, VE-009, VE-010, VE-011, VE-012, VE-013, VE-014, VE-015, VE-016.

Analysis included:
- broad timeline sampling to locate UI states;
- denser sampling around task hover/menu, scheduling, Preferences, Notes, Subtasks, Time's Up/Extend, Reports/Sessions and Focus/Floating transitions;
- transcript cross-check for copy/behavior context;
- separation of direct source UI from Narro design defaults and tutorial cuts.

## Material new findings

### Panel → Floating Timer

The uninterrupted VE-003 sequence permits a stronger measurement than the initial pass:
- visible transformation duration is approximately **0.27 s** at 60 fps;
- the same focus window progressively changes geometry;
- source footage exposes a clipped/sparse intermediate-content phase.

Disposition:
- preserve the continuous ~quarter-second transformation character as fidelity evidence;
- treat exposed clipping/blank intermediate content as a source artifact, not a fidelity requirement.

### Task hover/menu anatomy

VE-005 directly confirms:
- completion affordance at the left on hover;
- compact right-side action cluster;
- stable card context;
- narrow anchored overflow menu;
- menu order Schedule / Change List / Duplicate / Delete;
- destructive red treatment.

This strengthens both visual fidelity evidence and the existing VE-F003 functional correction.

### Success-screen hierarchy

VE-003 directly shows:
- completed/struck-through title retained;
- large success message/media area;
- dominant gradient `Next Task` CTA;
- subordinate `Take a Break`;
- bottom EST/Taken metrics;
- remaining queue preserved below.

### Preferences anatomy

VE-014 confirms:
- right-side vertically scrollable drawer;
- monitor card;
- segmented controls;
- mint active toggles;
- section dividers;
- in-place nested controls;
- sound selector + preview/volume affordance family.

Exact nested animation durations remain unmeasurable where tutorial edits intervene.

## Documentation created

- `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md`
- `docs/BLITZIT_UI_UX_VIDEO_TRACKER.md`

## Validation

- corpus availability: PASS — 19 MP4 + 19 SRT present in reused artifact;
- deep forensic pair counter: 12/19;
- application build/tests: NOT RUN / NOT REQUIRED — evidence/docs only;
- M7 physical Windows acceptance: remains OPEN / NOT RUN;
- initial functional video tracker: remains 19/19 complete and is not downgraded.

## Continuation

Continue the seven remaining deep UI/UX pairs in the exact order in `docs/BLITZIT_UI_UX_VIDEO_TRACKER.md`.

After 19/19 deep UI/UX completion:
1. reconcile `docs/UI_UX_SPEC.md` so measured source motion is separated from Narro design timings;
2. route any genuinely new discrepancies to the correct milestone;
3. do not reopen validated reliability improvements merely because source footage shows a weaker behavior;
4. only then return to the next source implementation action unless the user changes priority again.
