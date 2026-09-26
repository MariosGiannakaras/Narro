# Parity audit verification and roadmap reconciliation — 2026-09-26

## Source

User-supplied `NARRO_PARITY_AUDIT_FINDINGS_2026-09-26.md`, explicitly scoped to Narro and repository-local evidence.

## Live baseline inspected

Main at verification start:
`ea4de3fb7e3cb9e8791d0bd2d97d80b20ff3c98e`.

Open unfinished PR:
- #155 `M7: cover focus transitions with a temporary native visual hold`;
- exact head `2755d598ad2b13b974cda02760ebf44cd5e60b13`;
- exact-head CI #532 PASS;
- physical compositor validation NOT RUN.

PR #155 is preserved and not merged from CI alone.

## A1–A19 verification

All A findings remain applicable on current main:

1. **A1 confirmed** — Home list-card component supports `onDuplicate`, but AppShell does not wire it and no list-duplicate production command exists.
2. **A2 confirmed** — icon metadata is persisted/projected, Home and Archived Lists still render title initials; archived summary omits icon metadata entirely.
3. **A3 confirmed** — lane top action is a reserved placeholder; create API has no insertion-position semantics.
4. **A4 confirmed** — production inline create is title-only and backend create request has no EST.
5. **A5 confirmed** — Main board UI/API omits task completion/permanent delete although validated lower persistence/session semantics exist.
6. **A6 confirmed** — Done has `mutationLane: null`; pointer/keyboard completion into Done is absent.
7. **A7 confirmed** — All Lists disables safe per-task edits broadly (metrics, notes, subtasks/title/schedule) even though each projected task carries real `listId`; aggregate reorder may remain disabled.
8. **A8 confirmed** — Search matches titles but renders plain titles with no matched-substring highlighting path.
9. **A9 confirmed** — normal `main.tsx` mounts diagnostic `TimerSessionProjection` unconditionally; that component also owns the real Pomodoro awaiting-resume prompt, so the user-facing prompt must be split rather than deleted.
10. **A10 confirmed** — ordinary `FocusTaskRow` is presentation-only.
11. **A11 confirmed** — no Rocket/Make Live control on ordinary Focus rows.
12. **A12 confirmed** — Focus queue has no reorder interaction.
13. **A13 confirmed** — ordinary Focus rows lack delete/schedule/Notes/non-live completion mutations.
14. **A14 confirmed** — Focus `+ ADD TASK` remains disabled.
15. **A15 confirmed** — Focus Home button remains disabled.
16. **A16 confirmed** — TaskNotes uses `taskTitle` as context but does not mutate live title.
17. **A17 confirmed** — Rust exposes `timer_extend`, but renderer timer API and live action UI lack Extend.
18. **A18 confirmed** — Focus panel subtask branch supports stale-safe title editing; Floating Timer branch renders title as a non-editable span.
19. **A19 confirmed** — Done lane uses the generic task-count/EST header; no local-month completion count presentation exists.

## B/C classification

- B1 remains unresolved fidelity/product scope.
- B2/B3 remain visual parity questions.
- B4 remains a real product ambiguity: current Narro completes then attempts to auto-start the next eligible task. Do not silently change it.
- Intentional Narro deviations from audit section C remain binding.

## Roadmap consequence

The audit supplies new evidence that Gate E/M5 and Gate F/M6 did not cover all repository-documented production requirements. Their historical source/CI work remains valid, but acceptance is reopened with explicit reconciliation gates. Ordered work therefore returns to M5 reconciliation, then M6, then M7. This is evidence-driven reopening, not a restart/re-audit of already validated implementation.

## Validation

Documentation/tracking reconciliation only. No source behavior changed and no Windows CI should be triggered.
