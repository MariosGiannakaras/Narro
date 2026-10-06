# Findings28–34 targeted video-escalation reconciliation

Date: 2026-10-06

Status: **ANALYSIS COMPLETE / NO ADDITIONAL VIDEO PASS REQUIRED FOR CURRENT DISPOSITIONS**

Scope: analysis/disposition only. No Narro source/config/test correction is implemented by this record.

## Purpose

After findings28–34 received durable technical dispositions, the analysis was rechecked specifically against the question of whether any finding still required a targeted frame-by-frame/pixel-level pass over the captured Windows recordings before its disposition could be trusted.

The answer is **no for the current disposition stage**. This is not a claim that raw video was exhaustively reviewed in this chat, and it does not create any visual/source-parity PASS.

## Finding28 — post-drag keyboard rail

The unresolved question is not whether the rail was visually present: exact native UIA already proves real `HasKeyboardFocus=true` on the Alpha title while the rail action controls are absent, followed immediately by their presence after actual pointer hover.

Current source simultaneously declares `:focus-within` reveal semantics. A targeted video clip could visually illustrate the same contradiction, but it cannot reliably determine which runtime authority failed:

- DOM active-element ownership after drag;
- actual `:focus-within` match state;
- drag-shell `:focus-visible` state;
- computed opacity/visibility/pointer-events;
- remount/state churn between drag and keyboard traversal.

Those are runtime/DOM/computed-style questions. Therefore the correct next evidence remains the already-recorded deterministic regression/instrumentation. Additional frame inspection is not a prerequisite to the `NEEDS_REGRESSION_FIRST` disposition.

## Finding33 — large Notes Escape

The exact CI953 source explicitly routes large-Notes `Escape` to `closeLargePresentation()`, while two physical Windows paths (Main and Focus) retain the large dialog after real Escape with the contenteditable editor focused.

A targeted video clip might show whether there is visible close/reopen flicker, but that would still not establish whether:

- the keydown reached the shell;
- `event.key` matched;
- propagation was intercepted;
- `closeLargePresentation` executed;
- state changed and was immediately reprojected/reopened.

The already-routed runtime regression is stronger and directly observes those authorities. Therefore raw video is not required before keeping `NEEDS_REGRESSION_FIRST`.

## Finding33 — resize sub-observation

No video escalation is needed to decide whether the existing capture proved resize failure. The recorded pointer starts were materially inside the dialog rather than reliably on the UA-defined lower-right resize hit region:

- Main: start approximately 22 px left and 68 px above the shell corner;
- Focus: start approximately 12 px left and 50 px above the shell corner.

Unchanged bounds after those attempts do not establish a broken `resize: both` contract. A correctly targeted physical resize test, not more review of the same mistargeted attempt, is the appropriate evidence if that validation is still required.

## Findings29–32 and34

No additional video escalation is justified for their current dispositions:

- 29: physical input/UIA + source directly establishes missing Add Session modal focus/Escape ownership;
- 30: direct rendered Narro images and direct canonical SS-H17 comparison already establish the horizontal overflow defect;
- 31: the unresolved issue is requirement semantics, and canonical evidence explicitly does not establish Escape-cancel;
- 32: authoritative prior physical acceptance explicitly defines next-Panel-entry apply timing;
- 34: the relevant distinction is native global presentation shortcut versus modal-guarded domain actions, established in current product/behavior contracts and captured state preservation.

## Tool/evidence limit

The repository's raw MKV/MP4 binaries are retained and remain canonical evidence. In this chat the GitHub connector exposes their repository identity/metadata but does not materialize binary bytes for local decoding. This limitation did not force a weaker disposition because the remaining questions above are either already established by stronger native/rendered evidence or require runtime instrumentation rather than additional pixels.

Accordingly:

- do **not** claim that this chat performed a new frame-by-frame review of those binaries;
- do **not** repeat capture solely to obtain another visual view of the same facts;
- reopen the raw recording only if a later regression produces a conflict/ambiguity that the video can actually resolve, or for a separately required direct visual/source-parity gate.

## Result

Findings28–34 retain their previously recorded dispositions unchanged. This reconciliation closes only the question **"is an extra targeted video-forensic pass required before trusting those dispositions?"** with **NO**.

No milestone, physical, source-parity or visual-review counter advances from this record.
