# Original Blitzit video evidence

This directory is the durable repository location for user-supplied original Blitzit recordings and their transcripts.

## Upload location

Upload new raw files to:

`reference/original-blitzit-videos/inbox/`

The user does **not** need to rename, classify, trim, timestamp, or organize files before upload. Videos and transcripts may be mixed together in the inbox. Preserve original filenames when practical.

## What belongs here

Accepted raw evidence includes:

- full Blitzit walkthroughs;
- short interaction captures;
- screen recordings showing UI/UX, animations, transitions, window behavior, menus, dialogs, loading/error/empty states, or edge cases;
- transcripts or captions in `.txt`, `.md`, `.srt`, `.vtt`, or similar text formats;
- accompanying notes that explain the recording, source/version, context, or what the speaker is demonstrating.

Do not place Narro-owned shipping assets here.

## Evidence handling rule

Raw uploads are source evidence. Do not silently edit, overwrite, recompress, or replace them during analysis. If derived clips, extracted frames, measurements, or annotations are later needed, create them separately and preserve traceability back to the original filename and timestamps.

The canonical analysis/index document is:

- `docs/BLITZIT_VIDEO_EVIDENCE.md`

The interaction-analysis methodology is:

- `docs/INTERACTION_CAPTURE_GUIDE.md`

Visual/source precedence and interpretation remain governed by:

- `docs/RESEARCH_EVIDENCE.md`
- `docs/SOURCE_AUDIT.md`
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `AGENTS.md`

## Video file storage

Videos in this inbox are intended to be committed/uploaded as normal repository files. No Git LFS requirement applies.

Keep original source files intact where practical. If GitHub itself rejects an individual file because of a platform file-size limit, record that transport limitation rather than silently recompressing or altering the evidence.

## Future processing

When the corpus is ready, an implementation/research agent should:

1. inventory every raw video/transcript pair or related group;
2. compute/record stable file identity metadata when useful;
3. identify source version/date/environment when visible or supplied;
4. create timestamped observations for UI structure, behavior, animation, motion, timing, transient states, window behavior, accessibility cues, errors, and edge cases;
5. distinguish direct observation from transcript claims, inference, and Narro design recommendations;
6. compare relevant findings with current Narro behavior and existing Blitzit evidence;
7. feed milestone-relevant findings into the active milestone before it closes when the evidence already exists;
8. feed the complete corpus into the required final comprehensive review after Milestone 10;
9. record all durable findings in `docs/BLITZIT_VIDEO_EVIDENCE.md` and any affected specs/tracking files.

No analysis is considered complete merely because the raw file exists in this directory.
