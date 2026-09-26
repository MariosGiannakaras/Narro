# 2026-09-26 — normal Git video evidence correction

User clarified that Blitzit videos will be uploaded/committed as normal repository files and that missing videos/manual checks must not block independent implementation.

## Changes

- removed the repository Git LFS rules added for the video inbox;
- kept `reference/original-blitzit-videos/inbox/` and the durable video-analysis workflow intact;
- clarified that videos/transcripts use normal Git/repository upload;
- clarified that absent videos are not an implementation blocker;
- clarified that deferred manual Windows checks may remain open while independent evidence-backed source work continues.

## Scope

Tracking/evidence configuration only. No Narro application source/UI implementation changed.

## Continuation

Resume M7 from the existing repository checkpoint and PR #155. Videos/manual checks are reconciled when available or at the appropriate closure/final-review gate; they do not stop independent M7 source work.
