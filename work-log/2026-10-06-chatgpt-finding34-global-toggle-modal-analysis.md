# Finding34 — global Focus-toggle while Main modal is open

Date: 2026-10-06

Status: **ANALYZED / NO_FIX**

Scope: analysis/disposition only. No Narro runtime/source/test correction is implemented by this record.

## Finding

On exact CI953, Main had an active Add Task dialog with a populated draft and focus on the Add task button. Local/domain shortcuts were exercised under the modal guard. A real global `Ctrl+Shift+T` then transferred foreground to the existing Focus surface while the Main Add Task dialog remained open.

After Main was explicitly reactivated, physical Escape dismissed the Add Task dialog. The draft/modal was not converted into a task and no capture evidence shows timer/session/domain mutation caused by the global toggle.

The observation is real, but it is not a defect under the current shortcut contract.

## Exact evidence

- Candidate/source: CI953 / `38219e200fe3bec7309f8e03e72003184ca86d08`.
- Packet: `work-log/evidence/m7-ci953-continuous-20261005/`.
- Main HWND: `3213706`; Focus HWND: `7471826`; one Narro runtime/PID.
- 13:01:58Z: Add Task draft text is entered.
- 13:01:59Z: native focus is placed on the Main Add task button.
- physical `Ctrl+Alt+B/P/N` are exercised while the Main modal owns local interaction.
- 13:02:02.516Z: physical `Ctrl+Shift+T`.
- observation `main-modal-normal-en-Ctrl-Shift-T.json` still exposes the Add Task dialog and populated Task title/Add task controls after the global presentation toggle.
- 13:03:10.707Z: Main is explicitly reactivated from foreground Focus.
- 13:03:10.951Z: physical Escape.
- `main-modal-normal-en-escape.json` no longer exposes the Add Task dialog, showing the local dialog close path remains recoverable.

## Shortcut-class reconciliation

The modal shortcut correction already integrated for the M7 keyboard defect is scoped to **in-app/domain action shortcuts** and recognized browser defaults while an active modal owns interaction. Its purpose is to prevent background state mutation such as Break, Pause/Resume, Notes, Skip, Finish, Search/native Find, or delivered Focus action events.

`Ctrl+Shift+T` is a different authority:

- it is a native Windows `RegisterHotKey` / `WM_HOTKEY` global shortcut;
- its project name is **Alternate Focus Mode**;
- `docs/BEHAVIOR_MATRIX.md` defines `Focus active | Ctrl+Shift+T | Alternate focus presentation | Same session state`;
- the global-shortcut contract is intentionally usable outside Narro foreground, including from another application;
- the current preflight explicitly forbids timer/session mutations inside the native toggle handler.

The native handler checks authoritative active-Focus state, shows the one existing Focus host, records the trigger, and emits a presentation-toggle request. It does not call timer pause/resume/start or other domain mutations.

## Modal ownership assessment

The Main Add Task dialog remains modal **within Main**. Switching foreground to a separate native Narro Focus window through a system-wide presentation shortcut is not equivalent to allowing a background domain command to mutate state behind that dialog.

This is materially analogous to the user leaving the Main window via another native application/window: the Main modal remains pending and must still own Main interaction when Main is reactivated.

The capture confirms that behavior: the dialog remains present, then closes normally with Escape after Main regains foreground.

Suppressing `Ctrl+Shift+T` solely because a Main dialog exists would change an already-established global shortcut guarantee. It would also require cross-window DOM/modal state to gate a native hotkey that is deliberately designed to operate while other applications are foreground. No canonical/source evidence or current product requirement establishes that stronger suppression rule.

## Disposition

**NO_FIX**

Do not extend the active-modal in-app shortcut guard to suppress the native global Alternate Focus Mode shortcut based on finding34.

Keep the existing distinction:

- active modal blocks Narro in-app/domain actions that could execute behind the modal;
- global `Ctrl+Shift+T` may perform presentation-only switching while preserving the same authoritative session;
- returning to Main restores the still-pending modal context, where local Escape/Cancel semantics apply.

Reopen only if a future explicit product decision says that *all* Narro global presentation shortcuts must be disabled whenever any Narro window owns an active modal, or if evidence shows the global toggle loses/corrupts modal state or mutates domain/session authority.

## Non-effects

- No application source or tests changed.
- No CI/build/manual acceptance was run.
- No roadmap/milestone counter advances.
- This disposition does not weaken the already-corrected modal guard for domain/action shortcuts.
