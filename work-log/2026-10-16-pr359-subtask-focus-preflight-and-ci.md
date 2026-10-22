# PR359 subtask focus correction — 2026-10-16

[PR359](https://github.com/MariosGiannakaras/Narro/pull/359), exact source `7ee33be734f12ff970b822842ebd574857d92c3b`, [CI38856507685](https://github.com/MariosGiannakaras/Narro/actions/runs/38856507685) queued/running, **not yet accepted**. Branch `fix/m5-subtask-create-focus`, source checkout `E:\SystemFiles\Desktop\Narro-PA352`. Prior PR358 B70/Search2/2 scoped PASS and B46 EST reset remain accepted; original profiles restored, no OBS/Narro physical run active.

## Causal correction

Physical32/45/48/51/54 captures showed successful child persistence but no focused field. TaskSubtasks disables its input while the real Board/native mutation and authoritative refresh are pending; it previously had no completion focus recovery. Synchronous static fixtures did not exercise that blur.

The shared component records the initiating input/task only for an admitted nonempty create, synchronously rejects a second same-render submit, waits for pending/authoritative state to settle, and restores the still-connected enabled input without scrolling. Explicit focus/navigation outside the form cancels recovery. Closed/loading/error/read-only panels, changed owners and disposal clear intent. No polling/timers, persistence API, domain authority, native windows or CSS changed; document listeners exist only while expanded and are cleaned up. Shared Focus use is affected only in this create-focus behavior; its affected native keyboard path stays OPEN pending exact-build observation. M1 platform foundation and accepted unrelated gates are unchanged.

## Local validation

- TypeScript and production Vite build PASS.
- Full `preflight:frontend` PASS (including actual repository test chain and build). Existing CRLF-sensitive static contracts were run under temporary572-file LF normalization, with exact original bytes restored in finally; no normalized source was committed. Regenerated tracked icons restored to their preflight baseline; unrelated untracked generated icons preserved.
- Actual mounted production Board, real TaskSubtasks and actual API wrappers with controlled IPC: **4/4 light/dark × normal/reduced-motion variants PASS**, requiring all five new behavioral assertions. Tests cover consecutive native-deferred creates, immediate duplicate submit, native rejection/draft retry, intentional focus movement, failed committed refresh/stale panel, disposed owner/replacement focus, and child identity. Existing quick-clear/create/menu/drag/Focus/catalog assertions remain required.
- Red/green proof: same new actual-Board regression with original TaskSubtasks fails **`committed subtask create lost repeat-ready input/focus after authoritative refresh`**; corrected component passes4/4. An initial red harness put duplicate-submit assertion first and stopped before the focus assertion; the final harness uses a single first submit to isolate the physically observed focus failure, with duplicate admission tested on the second create. That controlled duplicate finding is not a claim of observed duplicate physical SQLite writes.
- The first red harness wrapper used check_output and failed to persist expected nonzero output; corrected runner always captures output and restores source in finally. A later retry found a closed browser, reopened only the local fixture browser, then completed the final recorded red/green proof. No source failure or CI retry is hidden.
- No Rust change; local native compilation remains NOT RUN due unavailable MSVC link.exe. Exact Windows CI retains all Rust/domain/package/visual gates and is required before integration.

[Local evidence](evidence/pr359-local-20261016/manifest.json). React skill review checked hook lifetime, listener cleanup, no extra renderer authority, no CSS/layout change, accessible/native focus ownership and typed refs. Existing NER-009/013 strengthened on main. Locked SpectrumCore/imageupload/218icons unchanged.

## Next operation

Read exact CI38856507685 on7ee33be7. If first gate fails, inspect its actual log and correct the causal issue on this same branch; do not weaken required behavioral assertions. If3/3 green, expected-head guarded squash merge, verify main source/build/test/config blobs and workflow equivalence under CI strategy7, obtain exact verified artifact and physically exercise only affected Board/Focus repeated-create paths in a prepared owned-profile session. Publish complete evidence and original-profile restoration before moving on. B12 is not physical PASS yet; B60 full header/source grammar and other M5–M9 residuals remain OPEN. M1–M4 remain4/10; M10blocked, M11dormant.
