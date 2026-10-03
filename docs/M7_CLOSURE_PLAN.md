# M7 bounded closure plan

Status: current executable closure controller for Milestone 7.

This document supersedes historical “implementation order” text for deciding what remains before M7 can close. Historical design/physical evidence remains in the existing M7 docs and immutable work logs.

## What is already done

The single-`focusSurface` replacement architecture is implemented.

Exact head `440b172565d94fadb3e814559bec5f3b47e48012` passed Windows CI #803 with accepted:
- single-host architecture/runtime contracts;
- active-session packaged Focus capture;
- expanded Timer title/live-time correction;
- B5/B6 corrections;
- cross-window board invalidation;
- production-config physical artifact boundary;
- scheduling visual fixture;
- same-DPI Timer→Panel endpoint correction.

The remaining work is closure/observation, not another general M7 implementation audit.

## Five closure checkpoints

### C1 — Replacement architecture and behavior automation
**PASS**

Requires:
- one persistent `focusSurface`;
- no production split Timer WebView;
- authoritative timer/session continuity;
- B5/B6 behavior;
- cross-window projection contracts;
- frontend/Rust automated validation.

Evidence: CI #803 and prior corrective logs.

### C2 — Artifact validity and automated visual/runtime evidence
**PASS**

Requires:
- dedicated production-config physical build;
- no `runtimeVisual` activation in physical executable;
- packaged active-session capture;
- accepted compact/expanded/Panel visual geometry;
- no known automated visual/runtime regression.

Evidence: CI #803 artifacts and `work-log/2026-10-01-chatgpt-m7-ci803-production-artifact-acceptance.md`.

### C3 — Main integration
**PASS**

M7 implementation PR #192 merged as `1b68a602...`. Short-lived process-hardening PR #207 exact head `df6e548a...` passed Windows CI #806 (validation-gate + fast-gate + windows-candidate) and guarded-squash-merged as `aebc280d...`.

The integration token did not emit a push-triggered main run. Per repository CI policy, blob-level proof was used: merged main and exact-green #207 head have zero non-Markdown differences, so executable/build/test/workflow content is byte-identical to the validated tree.

Evidence: `work-log/2026-10-01-chatgpt-m7-c3-main-integration-closure.md`.

### C4 — Physical Gate 7 continuity/session acceptance
**PASS**

Accepted on the CI #809 production artifact through the complete two-monitor physical re-audit:
- active task/session;
- repeated Panel↔Timer;
- repeated compact↔expanded;
- same task/session/time continuity;
- no blank/pale/staging/stale/duplicated frames at the corrected PR #208 boundary;
- no document scrollbar;
- visible Main `Blitz now` → existing Focus Panel;
- idle/no-task Ctrl+Shift+T and Find Timer no-op (operator-context input identity with visible no-op result);
- second-launch single-instance ownership: primary Main + Timer visibly alive before the later `narro.exe` activation, with no competing Narro UI/state afterward;
- Main/Focus mutation reconciliation.

Evidence:
- `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`;
- `work-log/2026-10-02-chatgpt-m7-ci809-c4-closure.md`.

A future failure reopens only the evidenced behavior.

### C5 — Physical Gate 12/platform acceptance and tracking closure
**PHYSICAL RESTART PASS — final tracking/new-observation reconciliation OPEN**

Already physically accepted on CI #809:
- mixed-DPI 100%↔125% monitor crossing;
- edge/taskbar constrained placement;
- topology/hotplug recovery via real display removal and safe recovery;
- topmost over a maximized application.

Saved-placement restart is now physically **PASS** on the user-requested resulting-main CI #873 automatic-logging candidate, artifact `11268220111`, EXE SHA-256 `4fde3778720505705ac9c7f9b05a30cb70c26b02c09c6dec442775bc5c66637c`: real active compact Timer, qualifying 328 px movement, normal tray `Quit Narro`, new process on the same EXE, and visible exact `(1640,780)` restore with the same task/time recovered paused. Both native sessions and continuous two-monitor 60 fps capture are published in [the completed run](../work-log/2026-10-03-codex-m7-ci873-c5-completed.md).

Still required: final tracking/crosswalk/TODO reconciliation and disposition of the narrowly recorded additional CI #873 transient-content/label observations (`M7-OBS-20261003-01/02`). See [the visual review](../work-log/2026-10-03-codex-m7-ci873-c5-video-review.md). No further C5 physical restart is required without a relevant source change or new saved-placement failure. This is not a new general re-audit.

Evidence: `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`.

When C1–C5 are PASS, M7 closes. Do not invent another general re-audit between C4/C5 and closure unless new material evidence appears.

## Progress interpretation

The historical M7 top-level checklist remains useful capability history, but it is **not a count of separate remaining implementation projects** after the replacement.

For current execution, use C1–C5 as the closure controller. Do not restart already-automated-validated capabilities merely because their historical parent checkbox was reopened when the host architecture changed.

## Failure policy

- Automated failure: fix the exact source/test/build issue before merge.
- Physical failure after integration: create a narrow corrective PR from current `main`, validate/merge it, and repeat only the affected physical gate.
- Documentation mismatch: reconcile on `main`; do not reopen runtime work.
