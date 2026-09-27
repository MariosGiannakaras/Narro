# Blitzit uploaded video corpus — initial ingestion and Narro reconciliation

Date: 2026-09-27  
Agent: ChatGPT  
Scope: repository evidence/reconciliation only; no Narro application source changes

## Starting state

- GitHub main when the corpus was discovered: `93f3e07bcc6c877412349b7a861502f47d0e96da`.
- Validated application source baseline remains `699b6ac46bcc6ebcabbcded21f929a7b32018b42`; later evidence/tracking commits do not replace it.
- Roadmap remains 6/10 complete; M8 remains 5/8 top-level validated.
- M7 source remains 9/14 top-level validated with the deferred physical/manual Windows matrix OPEN.
- No implementation PR was open at recovery.

## Corpus inventory

`reference/original-blitzit-videos/inbox/` contains:

- 19 MP4 files;
- 19 same-basename SRT files;
- 38/38 raw files inventoried;
- 19/19 pairs established;
- 0 unpaired videos;
- 0 unpaired transcripts.

Dedicated coverage is recorded in `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md`.

Final initial-ingestion counters:

- 19/19 pair analyses complete;
- 19/19 Narro comparisons/reconciliations complete;
- 19/19 final dispositions complete.

Detailed timestamped evidence, evidence classes and dispositions are in `docs/BLITZIT_VIDEO_EVIDENCE.md`.

## Direct video access / temporary analysis plumbing

The GitHub connector could read SRT text but could not expose MP4 repository blobs as UTF-8. To avoid falsely treating transcript review as VIDEO-DIRECT evidence, a branch-only temporary GitHub Actions workflow packaged the already-committed raw corpus as an artifact.

Evidence:

- workflow branch: `evidence/blitzit-video-analysis-20260927`;
- workflow run: `36323720511` — SUCCESS;
- artifact: `blitzit-video-transcript-corpus`;
- artifact id: `10932789030`;
- artifact digest: `sha256:29668f8fb2ab235a8463a12a371ded721801e66e9ff4536999ab802dd64550b9`;
- videos were then inspected frame/timeline-wise with ffmpeg/ffprobe in the analysis environment.

The temporary workflow was deleted from the branch at commit `90171b7d4279aaebc89a7e6a2a71c2615a5198e4`; it is not part of the PR diff and must not reach main.

## Material findings

### VE-F001 — EST title parsing resolved

VE-002 directly shows a supported terminal duration being parsed into EST while the saved visible title loses the parsed suffix. This resolves the earlier exact-title-normalization ambiguity and is routed into the active M8 preference/runtime slice.

### VE-F002 — completion success-screen progression partially resolved

VE-003 directly shows that with success screen enabled:

1. Done commits the completion and presents success UI;
2. `Next Task` and `Take a Break` are visible choices;
3. the next task becomes live only after explicit `Next Task`.

This does not resolve the success-screen-disabled progression. It also does not show the post-click timer/session semantics of `Take a Break`; that transition must not be invented.

### VE-F003 — task Change List / Duplicate promoted to current direct behavior

VE-005 directly shows task overflow actions `Schedule`, `Change List`, `Duplicate`, and `Delete`.

Current Narro production exposes schedule/delete/reorder but not task Change List/Duplicate. Durable task-duplicate semantics already exist in M2. This is therefore a narrow confirmed post-validation correction on a previously validated M5 surface, not a reason to reopen or re-audit M5 wholesale.

It is ordered before unrelated M8 Preferences work in `TODO.md`.

### VE-F004 — Notes URL auto-open remains an intentional Narro deviation

VE-010 corroborates Blitzit's live-transition URL auto-open behavior. Narro's explicit pointer/keyboard activation rule remains binding because it avoids surprise navigation/timer coupling.

### VE-F005 — recurrence detached-child coexistence clarified

VE-017 describes intentionally retaining detached existing children and later generating tasks from a new recurrence. Narro must distinguish intentional independent-child coexistence from accidental duplicate occurrence generation; idempotent materialization remains mandatory.

### VE-F006 — Reports/Sessions routed to M9

VE-011/012/015 reinforce session-ledger-derived report metrics, filters and session editing. They do not front-run M8. VE-015 shows an Export PDF control while narration says it was still coming soon, so UI presence is not treated as proof of functional availability.

### VE-F007 — Panel→Floating motion evidence

VE-003 supports only a coarse ~0.2–0.3 s visible resize/reposition estimate. Exact easing is not established. Deferred M7 physical Windows checks remain OPEN/NOT RUN.

### VE-F008 — Preferences hierarchy corroborated

VE-014 directly corroborates nested Pomodoro/alert/celebration children and hide-times hover disclosure. These feed the existing active M8 Preferences slice.

### VE-F009 — source live-subtask limitation not copied

VE-013/019 describe a Blitzit limitation around adding the first subtask while live. Narro's validated more-complete local behavior remains intentional and must not regress.

## Repository updates

Updated/created on the evidence branch:

- `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md`
- `docs/BLITZIT_VIDEO_EVIDENCE.md`
- `docs/RESEARCH_EVIDENCE.md`
- `docs/PRODUCT_SPEC.md`
- `docs/BEHAVIOR_MATRIX.md`
- `docs/UI_UX_SPEC.md`
- `docs/SOURCE_AUDIT.md`
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `TODO.md`
- `STATUS.md`
- `HANDOFF.md` (same evidence slice)

Evidence PR: #172, initially opened at head `90171b7d4279aaebc89a7e6a2a71c2615a5198e4`. The exact final PR head must be read/validated after this tracking commit.

## Validation

- Corpus pair inventory: PASS — 19 MP4 / 19 SRT / 19 pairs / 0 unpaired.
- Direct frame/timeline access: PASS through artifact run `36323720511`.
- Pair-level analysis/reconciliation/disposition: PASS — 19/19 each.
- Application build/test/Windows CI: NOT RUN / NOT REQUIRED for this evidence-only slice; no application source/config/build semantics were changed.
- Deferred M7 physical checks: OPEN / NOT RUN; not promoted by source-video evidence.

## Continuation

1. Validate and merge PR #172 at its exact final head with an expected-head guard.
2. Confirm the resulting main diff is evidence/tracking only and does not replace the validated application source baseline.
3. Start the narrow VE-F003 source correction: current task-menu Change List + Duplicate using existing authoritative persistence/domain boundaries, focused regression coverage and Windows CI.
4. After that validated correction, resume the active M8 Preferences source slice with VE-F001/VE-F002/VE-F008 incorporated.
