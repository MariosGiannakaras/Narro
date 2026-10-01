# M7 CI #809 final residual physical acceptance

Use only the CI #809 production artifact from Windows CI run `36865451660`.

## Candidate identity

- Artifact: `narro-m7-physical-windows-x64` (GitHub artifact id `11163439039`)
- ZIP SHA-256: `39ca0a91d7aa54be79ca35c509f82f25049a15a3fc4ffff199699eab309557a5`
- `narro.exe` SHA-256: `a4b8e163539f429769540480a7aa0b5db9ca6fa2c356d6742f78d687b5cb5675`
- Source: PR #208 exact head `d885a577c5e7f2e376ed1f6cf5e7f83146dfec58`, merged source `2767b3827670603d1ab259b6a843c2e0da82d85d`

## Why this checklist is now short

The complete CI #809 recording `2026-10-01 19-03-32.mp4` was re-audited as
one synchronized two-monitor 4480×1080 canvas (1920 + 2560), not as a 50/50
single surface.

The corrected re-audit physically accepts:
- repeated compact↔expanded compositor continuity and the PR #208 white-L fix;
- active task/session/time continuity;
- no document/root scrollbar;
- Main `Blitz now` → existing Focus Panel;
- expanded Timer task/title/time;
- Focus/Main completion reconciliation;
- real 125%↔100% mixed-DPI movement;
- edge/taskbar-constrained expansion;
- real display-removal/topology recovery;
- topmost over a maximized application.

Do **not** repeat those tests.

The authoritative closure controller is `docs/M7_CLOSURE_PLAN.md`; the former
operational request for exactly two animations-Off cycles is not an independent
C4 closure checkpoint.

Durable audit:
`work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`.

## Final three observations only

### 1. Second-launch single-instance ownership — C4

- [ ] Start/keep Narro running from the exact CI #809 EXE.
- [ ] While that process is already alive, launch the same `narro.exe` again.
- [ ] Show Task Manager **Details** filtered to `narro.exe`, or another equally
      unequivocal process/runtime observation.
- [ ] Exactly one Narro application authority remains.
- [ ] No competing Narro window/runtime, SQLite/background authority or shortcut
      conflict appears.

### 2. Clean idle shortcut identities — C4

- [ ] Finish the active task and visibly reach `All Clear`.
- [ ] Make the next input auditable, e.g. type `TEST T` in Notepad, then press
      **Ctrl+Shift+T**.
- [ ] No placeholder/stale Timer appears.
- [ ] Type `TEST P` in Notepad, then press **Ctrl+Shift+P** (Find Timer).
- [ ] No Timer is surfaced and no stale-Timer attention pulse appears.

The marker is only to prove which otherwise invisible global shortcut was
actually pressed.

### 3. Saved placement across normal restart — C5

- [ ] With an active Timer, drag it to an obvious safe non-default position.
- [ ] Quit Narro normally through tray `Quit Narro`.
- [ ] Relaunch the same exact CI #809 `narro.exe`.
- [ ] Reopen/show the Timer for the live/recovered task as applicable.
- [ ] The saved placement returns to a safe visible position and is not stranded
      or off-screen.

## Evidence rule

One short continuous recording is enough. It does not need to repeat any other
M7 matrix item.

If all three pass, C4/C5 can be reconciled and M7 can close. If one fails, keep
recording long enough to show the stable failed state and note the timestamp;
only that exact behavior reopens.
