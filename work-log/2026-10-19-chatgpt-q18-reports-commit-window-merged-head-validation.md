# 2026-10-19 — Q18 Reports committed-selection read ownership, PR383 exact-head validated and guarded merge

**Owner:** ChatGPT, independent M9 source correctness after Codex final 18-stream report and completed RA01/RA02 code/CI. **No new physical Windows installation/interaction, recording, user AppData modification, M11/M12, or protected Spectrum Core picker/image upload/218 icons changes.** PR344 remains separately owned. Q18 was an independent source-admitted timing window, **not a reported native film failure**.

## Causal boundary and smallest correction

PR324 already guarded delayed Reports session/detail responses once a later passive `useEffect` owned the new query. Actual `ReportsSessions.tsx` before this PR published active session request key and detail task ID only in passive effects: after React committed filter B or task B and before passive effects, a previously running A post-mutation refresh could still match the active A key/read revision and publish obsolete A data. This is a source-causal **async ownership gap**; no new installed-user reproduction is claimed.

PR383 adds synchronous `useLayoutEffect` commit-boundary publication for both session request and detail task identity and bumps their respective read revisions **only on identity change**, preventing discarded concurrent React renders from invalidating a still-current view. Passive effects remain the sole query producers and all same-filter edits, errors, CSS, CSV/PDF and report persistence semantics are untouched.

`scripts/test-reports-commit-window.mjs` executes the actual extracted production filter and detail callbacks with deferred native results. Specifically covers A reads settling after B commit but before B passive fetch, obsolete A callback issuing no new IPC, aborted B render having no effect, stable same-filter rerender not invalidating a valid read, and committed detail close rejecting old A result. This is a deterministic React phase-order *simulation* using real source callbacks, **not an actual mounted-browser or native physical test**. Existing PR324 production-callback regression continues running through `scripts/test-reports-read-producers.mjs`, and no assertions were weakened.

## Exact PR evidence

- [PR383](https://github.com/MariosGiannakaras/Narro/pull/383), branch `fix/m9-q18-reports-commit-identity-20261019`, validated head `6d0ebc4de2223476b2ff33ecb1ea7ba4faca540b`.
- [PR Windows CI39222357460](https://github.com/MariosGiannakaras/Narro/actions/runs/39222357460): `validation-gate` SUCCESS, `fast-gate` SUCCESS, `windows-candidate` SUCCESS **3/3 exact-head**. Actual fast job log confirms `Q18 actual Reports read owners: post-commit/pre-passive, aborted render, same filter and closed detail: PASS` and existing Reports production contracts PASS. No passed statuses inferred solely from a running run.
- Expected-head guarded GitHub squash merge: `9b59d730156252553cafd49b1baecc20fc9bbd8b`, API returned `merged:true`; branch base had independent documentation-only commits, but PR remained conflict-free. Three changed files have head=merge=current-main identical Git blobs (**3/3**) as verified immediately after merge:
- `scripts/test-reports-commit-window.mjs` SHA `2f2ce2de847476263706e73cd83fd391137a2c09`.
- `scripts/test-reports-read-producers.mjs` SHA `0d8e0d8c67279c11872a241fc3ab29dcbd593e57`.
- `src/ReportsSessions.tsx` SHA `0cb93e5e8086c2d83a8820e603cf03bfb44e4428`.

## Remaining validation and limits at publication

Exact resulting-main `event:push` [run39225416010](https://github.com/MariosGiannakaras/Narro/actions/runs/39225416010) was **QUEUED** at initial merge evidence with head `9b59d730156252553cafd49b1baecc20fc9bbd8b`. **Do NOT claim resulting-main CI PASS until jobs are examined.** After it finishes confirm 3/3 and artifact identity; create separate immutable completion addendum and reconcile top-level HANDOFF/STATUS/TODO. RA01/RA02 last confirmed combined interactive 60fps native physical cases **NOT RUN**, and Blitzit source exact motion/pixel parity separate. Mandatory M1–M4 accepted **4/10**, M5–M10 not yet accepted, no optional milestones activated.

**One next action:** inspect exact run39225416010 `validation`, `fast`, `Windows` jobs; if green, accept technical result and update current native protocol executable identity, without claiming native PASS or repeating Codex raw-media analysis. If fail, inspect the first job/step logs and fix only an evidenced cause in the same issue ownership.
