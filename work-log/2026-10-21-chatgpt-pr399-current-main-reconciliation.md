# 2026-10-21 — PR399 current-main reconciliation without duplicated Archive implementation

**Owner / task:** ChatGPT source owner, resume actual archive keyboard-tab PR399 after prior CI audit and UI batches merged. User instructed: continue actual work, never idle-wait for ~20-minute Windows CI.

## Proven live state at resume
- CI guardrails PR400 already **merged** as `0b905e83f4f94030624d3081e8d2d64ce13787f7`, exact head `91d57218b43acf78237f58fdf6aa8ba1181ab941`, Windows `39662181572` **3/3 SUCCESS**, CI Learning `39662184582` **SUCCESS**, previous agent documented **4/4 main blob equality**. Main push `39671104853` was **CANCELLED** after newer pushes, not PASS.
- Archive read recovery/touch PR398 **merged** `d2e3d2821c9ad09cb09a2725243be0bff4d689ee`, exact head `68b0bb37fe259e0ba034bafd1e4ccbaa53eb1c53`, Windows `39652817019` 3/3 SUCCESS and 6/6 main blob identity. List accessibility PR394 **merged** `8e06f36bef0c854451559140526f8c4c6f97e88c`, Windows `39653120399` 3/3 SUCCESS and 3/3 main blob identity.
- PR399 previous head `4a8dd09ec08ed57ed7d5bb3085f9e970d758e944` was **unmergeable** after newer main/UI merges; CI run `39655462745` initially failed the unrelated Preferences dark runtime-readiness capture, and its attempt 2 was eventually CANCELLED when the head was advanced; neither establishes PR399 acceptance.
- Main checked at source reconciliation: `4c471f68ce186adae99b14bd7b45e1edd925224c` with Git tree `c8e3bcf4765d12fd250b96399cde203476ae961a`.

## Corrected active implementation
- Read exact current-main versus old PR399 source blobs for all **nine** changed paths. Four were already **byte-identical** to PR398-accepted main: `scripts/test-archive-read-retry.mjs`, `src/ArchivedDoneTasksPanel.tsx`, `src/archivePanel.css`, `src/archivedListsPanel.css`. The other five carried only the deliberately unique Archive keyboard/focus and guidance changes.
- Constructed a Git tree from **latest main's full tree**, replacing **only five** named blob entries with prior PR399 source: `src/ArchivePanel.tsx`, `src/archiveVisualFixture.tsx`, `src/ArchivedListsPanel.tsx`, `scripts/test-ui-archives.mjs`, `scripts/validate-archive-captures.mjs`.
- Created two-parent merge commit `a9e479f52586fe364fa3ce640d11358ac25f1e05` (first parent old PR399, second latest accepted main), fast-forward updated the existing `fix/archive-retry-on-read-failure-20261021` branch **with expected-head guard**, no force update, no duplicate PR.
- Verified live PR399 **OPEN / MERGEABLE**, exact head `a9e479f52586fe364fa3ce640d11358ac25f1e05`, five-file change list, compare current-main -> head **ahead / zero behind**, GitHub Windows CI new exact-head run `39673179963` **RUNNING/NOT YET ACCEPTED** at last observed checkpoint.
- Updated PR body to remove superseded dependency instructions: PR398 is merged and no longer blocks independently; only the current CI result/guarded merge remains.
- Main Windows push run `39671526638` was still **IN PROGRESS** when listed; not asserted PASS.

## Safety and dependencies
- This is a **source-and-CI** claim only; native Windows/manual/Blitzit source parity **NOT RUN/NOT PROVEN**. PR389 genuine 4/8 failing compositor transitions remain separate. Physical PA-01–09 OPEN/NOT RUN; no optional M11/M12 activation. Spectrum Core Create/Edit List picker, image upload and 218 offline icons unchanged.
- Historical failed/cancelled CI attempts must not be counted as PASS for the replacement head. Do not wait in a tight status-poll loop or merge before 3/3 exact-head SUCCESS.

**ONE NEXT ACTION:** Check run `39673179963` only after it has had a realistic opportunity to complete, classify first failed job/step if failed or (only after actual 3/3 PASS) expected-head guarded merge PR399 and verify the five resulting-main changed blobs plus appropriate main validation. Do not repeat discovery/rebase/PR creation.
