# Evidence retention policy (2026-10-30)

## Protected original Blitzit evidence

Never delete, overwrite or automatically prune original Blitzit screenshots, videos, transcripts, or canonical comparison assets, regardless of their directory. Classification is by actual provenance, not just a filename or folder.

## New user-directed retention scope (2026-10-31)

**Current instruction supersedes conservative blanket HOLD of old Narro-owned captures for checkout retention:** keep every **original Blitzit** media/canonical comparison irrespective of location; keep newest meaningful final Windows/native acquisition packets and source-acceptance case evidence actively required by current open PRs or genuinely unclosed recent physical gates. Retire outdated, superseded generated Narro CI/M7 capture packets as whole archived folders rather than file-by-file duplicate checks. This does **not** claim old FAIL/OPEN cases fixed, nor turn any recent native case into a PASS. Original historical claims/manifest references remain historical and their deleted blobs can be recovered from exact pre-deletion Git commits; old current-branch links to retired captures do not imply checkout presence. Never rewrite shared Git history, delete original Blitzit evidence, change live application source/config/tests or remove current Windows acceptance inputs. Each significant branch retirement requires exact path/prefix scope proof, guarded PR, resulting-main validation and a small durable recovery receipt. The **temporary live progress tracker** `docs/TEMP_EVIDENCE_DELETION_PROGRESS.md` is updated after every accepted batch and **deleted only at final whole-cleanup closure**; durable Git work log and policy remain. Historical fixed 700-item baseline stays historical; current retained/deleted numbers must be recalculated from actual paths as that baseline's members are removed. No remote Git-storage reclamation is implied by checkout deletion.

## New Narro captures

Save generated Narro videos, screenshots, diagnostic frames, ZIPs and logs outside tracked Git by default (for example in ignored `artifacts/`). Upload large evidence only if an active Windows acceptance gate, unresolved investigation, or other named consumer requires it. Every exception must identify the scenario, source commit, executable hash, PASS/FAIL/NOT RUN status, owner, and condition for retirement. A historical failure or success alone does not justify permanent retention.

Transient successful CI visual-capture artifacts should have explicit short retention; exact-build Windows executables and evidence needed for pending physical acceptance must remain available until that independent gate closes.

## Existing Narro history

Before removing tracked Narro media, check open PRs, pending native gates, tests, manifests, current documentation links and active uses. Preserve compact immutable findings and enough provenance to locate the prior Git commit. An original **Narro** video is not inherently permanent: when its exact build is superseded and no active physical gate, unresolved review, regression or source comparison needs the full recording, retire that original as well as disposable derived frames, with an exact Git recovery commit. Keep compact accepted results, selected visual evidence and provenance where needed. If a named review is OPEN or REVIEW_PENDING and the recording is still necessary to examine it, retain the recording until that need is demonstrably retired or replaced; age alone does not close a review. Do not treat original Blitzit sources as derivable or disposable.

Deleting files from current `main` reduces checkout burden, but not historical Git object size. Rewriting shared Git history or moving evidence to external storage requires its own verified migration, recovery plan and explicit decision. Ordinary cleanup must remain reversible and must not weaken tests or invent physical PASS.
