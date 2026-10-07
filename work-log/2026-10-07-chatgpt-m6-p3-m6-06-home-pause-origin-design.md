# 2026-10-07 — M6 P3-M6-06 Home pause-origin design

## Scope

Deep-analysis disposition for P3-M6-06 only. Canonical full Pass-3 VE-003 directly shows:

1. Focus Home exposes a visible `PAUSED` state before Focus exits;
2. later Blitz re-entry first exposes a paused transient;
3. running then resumes.

This record resolves the prior backend-policy ambiguity with a bounded design. It does not claim physical/source-parity PASS.

## Existing-authority findings

- `focus_surface_exit_to_main` is currently presentation-only: show/recreate Main, then hide Focus.
- `start_blitz` treats every non-idle timer with an open session/task as `AlreadyActive`; paused active work is not resumed.
- `TimerSessionPayload` already carries monotonic `revision`, exact `task_id` and exact `open_session_id`.
- every committed timer mutation is serialized by the authoritative `TimerService` / `TimerController` and increments the authoritative revision.
- explicit Pause/Resume are existing product actions; live EST / Time Taken editing also relies on intentional paused state.
- `waitForPresentedFrame()` already provides the finite two-`requestAnimationFrame` paint barrier used by Focus transition correctness.
- `focus-panel-requested` is emitted only by Blitz entry and is already deferred through Focus hydration/transition/resize boundaries.

## Selected bounded policy

Introduce a transient **Home pause lease**. It is provenance only, never a second timer authority.

A lease contains the exact timer identity created by Home:

- authoritative revision after the Home pause;
- task ID;
- open session ID.

### Home exit

- Home may create a lease only when the authoritative work timer is currently `running` or `overtime_running`.
- The pause must go through the existing TimerService/TimerController transition path.
- If the timer is already paused, idle, in break, Time's Up, or otherwise not a running work state, Home does not create a lease and does not invent a new transition.
- The Focus renderer applies the returned authoritative pause projection and waits the existing finite presented-frame barrier before invoking `focus_surface_exit_to_main`. This gives the source-confirmed visible `PAUSED` state a real frame opportunity rather than a timing delay.
- If Main/Focus exit fails after Home created the pause, recovery may call the same guarded lease resume. It must never blindly resume an arbitrary paused timer.

### Re-entry

- `start_blitz` remains unchanged: an active paused timer is still `AlreadyActive`. This is necessary so Focus can first reveal the source-confirmed paused transient.
- The normal Blitz presentation path targets/reveals Panel as it does today.
- After successful Blitz Panel entry, native presentation emits the existing `focus-panel-requested` event for both visible- and hidden-Focus entry paths.
- The persistent Focus coordinator waits for the Panel request to settle and then waits the existing presented-frame barrier.
- Only then it invokes guarded Home-lease resume.

### Guarded resume

Guard check and Resume must be serialized under the authoritative TimerService state lock. Resume is permitted only if current authoritative state still exactly matches:

- lease revision;
- lease task ID;
- lease open session ID;
- paused work state (`paused` or `overtime_paused`).

If any identity/revision/state differs, the lease is consumed/stale and the command is a no-op. This protects intentional user Pause and every intervening mutation.

Consequences:

- user Pause before Home: no lease, no auto-resume;
- Home pause followed by user mutation: revision changes, lease cannot auto-resume;
- Home pause followed by task/session replacement: identity mismatch, no auto-resume;
- process restart: transient lease is lost, so the timer remains paused conservatively;
- duplicate/replayed re-entry requests: lease is one-shot, so only the first exact match can resume;
- presentation/event failure: timer remains paused rather than risking untracked or unwanted running time.

## Implementation boundary

Preferred ownership:

- `TimerService`: transient lease + `pause_for_focus_home` and atomic `resume_focus_home_pause`.
- Tauri commands remain thin wrappers around that authority.
- `timerSessionApi.ts`: typed optional committed-mutation wrappers that invalidate board projection only when a mutation actually commits.
- `FocusPanel.tsx`: Home pause -> publish authoritative payload -> `waitForPresentedFrame` -> existing native Home exit; guarded rollback on exit failure.
- `FocusSurfaceCoordinator.tsx`: existing Blitz-only Panel-request handler becomes async, waits Panel settlement + `waitForPresentedFrame`, then invokes guarded resume and publishes returned payload.
- `present_focus_for_blitz`: hidden-Focus success/fallback paths emit the existing Panel request after Focus reveal so both native entry paths share the same resume handshake.

No new timer runtime, persisted pause-origin flag, polling loop, timeout-based visual delay, new Focus WebView or resume-all-paused behavior.

## Required validation

Rust:
- running Home pause creates exact lease and Paused payload;
- overtime running maps to overtime paused and can guarded-resume;
- already-paused/idle/break/time-up do not create a lease;
- exact lease resumes once;
- revision mismatch no-ops;
- task/session mismatch no-ops;
- lease is one-shot;
- normal explicit user mutations preserve their existing semantics.

Frontend/static:
- Home ordering is pause -> apply authoritative projection -> presented-frame barrier -> exit;
- exit failure uses guarded rollback, not plain resume;
- Blitz Panel request waits Panel settlement/frame before guarded resume;
- hidden and visible Blitz presentation paths both deliver the Panel request after reveal;
- no plain `timer_pause`/resume-all-paused logic is added to Start Blitz.

Physical/source:
- direct current-candidate Windows observation remains required to confirm visible `PAUSED` before exit and paused-transient -> running on re-entry.

## Disposition

P3-M6-06 moves from **PRODUCT/ENGINEERING POLICY AMBIGUITY** to **READY_FOR_FIX / BOUNDED HOME-PAUSE PROVENANCE DESIGN**.

This is not a guess about all paused timers. It implements only the source-confirmed Home lifecycle while preserving explicit user-pause ownership by exact authoritative provenance.
