# 2026-09-26 — Blitzit video/transcript evidence ingestion setup

Repository evidence/tracking setup only. No Narro application source/UI implementation or validation was performed in this slice.

## Baseline

- repository main before this slice: `2047ab2a86174bbcec8af31b8fadce9961f68dae`;
- validated Narro source baseline remains `b1ff5910abec82272c4ee57479a44eb62248a88f`;
- roadmap completion remains 6/10 milestones;
- M7 PR #155 remains open/draft at `2755d598ad2b13b974cda02760ebf44cd5e60b13`; Windows CI #532 PASS; physical compositor validation NOT RUN; PR remains non-mergeable against newer main.

## Added evidence infrastructure

- raw upload root: `reference/original-blitzit-videos/`;
- user upload inbox: `reference/original-blitzit-videos/inbox/`;
- raw evidence/readme rules: `reference/original-blitzit-videos/README.md`;
- durable manifest/timestamped analysis: `docs/BLITZIT_VIDEO_EVIDENCE.md`;
- common inbox video formats configured for Git LFS through `.gitattributes`;
- transcripts/captions remain normal searchable/diffable Git text.

The user does not need to pre-classify, rename, trim, timestamp, or pair files before upload. Future analysis is responsible for cataloging and classification.

## Evidence semantics

Repository evidence precedence now recognizes user-supplied direct recordings alongside direct screenshots:

- recordings are primary evidence for actually visible interaction sequences, motion, transition ordering, transient states, and window behavior;
- screenshots/clear frames remain strongest for static visual detail;
- transcript/narration claims are distinct from direct observation;
- inference remains explicitly classified and may not be presented as observed source behavior.

`docs/BLITZIT_VIDEO_EVIDENCE.md` defines evidence classes, corpus manifest, timestamped observation format, finding register, milestone routing, and completion conditions.

## Roadmap/tracking changes

`TODO.md` now requires:

- relevant uploaded video/transcript evidence to be analyzed before an affected unfinished milestone closes when it can materially change acceptance;
- Focus Panel/Floating Timer/transition/expand-collapse evidence present before M7 closure to be treated as M7 evidence;
- complete post-M10 ingestion and cataloging of every uploaded video/transcript;
- timestamped UI/UX/motion/transient-state analysis;
- explicit routing of discrepancies, missing transfers, source conflicts, reliability issues, and UX findings;
- confirmation that no uploaded corpus item was silently skipped in the final comprehensive review.

`STATUS.md` records the inbox as READY and corpus analysis as NOT STARTED.

`HANDOFF.md` records the exact upload/analysis paths and continuation rule.

## Files changed

- `.gitattributes`
- `AGENTS.md`
- `TODO.md`
- `STATUS.md`
- `HANDOFF.md`
- `docs/RESEARCH_EVIDENCE.md`
- `docs/REFERENCES.md`
- `docs/INTERACTION_CAPTURE_GUIDE.md`
- `docs/BLITZIT_VIDEO_EVIDENCE.md`
- `reference/original-blitzit-videos/README.md`
- `reference/original-blitzit-videos/inbox/README.md`
- this immutable work log

## Validation

- application source/UI changes: **NONE**;
- application/UI validation: **NOT RUN / not applicable to this evidence/tracking slice**;
- repository planning verification: final branch diff must contain only evidence/tracking/config files and no application implementation files.

## Continuation

Merge this evidence/tracking setup.

Later, when the user uploads files to `reference/original-blitzit-videos/inbox/`:
1. inventory and pair/classify the corpus;
2. populate `docs/BLITZIT_VIDEO_EVIDENCE.md`;
3. analyze milestone-relevant evidence before closing the affected remaining milestone;
4. keep the complete corpus in scope for the post-M10 Final Comprehensive Review Stage.

M7 implementation itself remains untouched by this slice.
