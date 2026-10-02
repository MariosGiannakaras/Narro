# M7 CI #809 final residual physical acceptance

Use only the CI #809 production artifact from Windows CI run `36865451660`.

## Candidate identity

- Artifact: `narro-m7-physical-windows-x64` (GitHub artifact id `11163439039`)
- ZIP SHA-256: `39ca0a91d7aa54be79ca35c509f82f25049a15a3fc4ffff199699eab309557a5`
- `narro.exe` SHA-256: `a4b8e163539f429769540480a7aa0b5db9ca6fa2c356d6742f78d687b5cb5675`
- Source: PR #208 exact head `d885a577c5e7f2e376ed1f6cf5e7f83146dfec58`, merged source `2767b3827670603d1ab259b6a843c2e0da82d85d`

## Accepted physical evidence — do not repeat

The complete CI #809 recording `2026-10-01 19-03-32.mp4` has now been
re-audited event-by-event as one synchronized 4480×1080 two-monitor canvas.

C4 is **PASS**. Accepted evidence includes:
- repeated Panel/Timer and compact/expanded continuity;
- PR #208 white-L/blank compositor correction;
- task/session/time continuity;
- no document/root scrollbar;
- Main `Blitz now` → existing Focus Panel;
- expanded Timer title/time;
- Main/Focus completion reconciliation;
- second launch while Main + active Timer are already alive, with no competing
  Narro UI/state afterward;
- idle `All Clear` T / Find-Timer no-op result.

C5 already physically accepts:
- real 125%↔100% mixed-DPI movement;
- edge/taskbar-constrained expansion;
- real display-removal/topology recovery;
- topmost over a maximized application.

Evidence:
- `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`
- `work-log/2026-10-02-chatgpt-m7-ci809-c4-closure.md`

## Only remaining M7 physical observation — saved placement across normal restart

- [ ] Keep/start one real active task so the Floating Timer is visible.
- [ ] Drag the Timer to an obvious safe non-default position.
- [ ] Quit Narro normally through tray **Quit Narro**.
- [ ] Relaunch the same exact CI #809 `narro.exe`.
- [ ] Reopen/show the Timer for the recovered/live task as applicable.
- [ ] Confirm the saved placement returns to a safe visible position and is not
      stranded/off-screen.

That is the entire remaining M7 recording. Do not repeat compositor, animations,
Blitz-now, shortcuts, DPI, topology, edge or topmost tests.

## Evidence rule

One short continuous recording is enough. If saved placement passes, C5 can be
reconciled and M7 closes. If it fails, keep recording long enough to show the
stable failed state and note the timestamp; only saved-placement behavior
reopens.
