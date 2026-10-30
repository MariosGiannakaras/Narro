# Evidence retention policy (2026-10-30)

## Protected original Blitzit evidence

Never delete, overwrite or automatically prune original Blitzit screenshots, videos, transcripts, or canonical comparison assets, regardless of their directory. Classification is by actual provenance, not just a filename or folder.

## New Narro captures

Save generated Narro videos, screenshots, diagnostic frames, ZIPs and logs outside tracked Git by default (for example in ignored `artifacts/`). Upload large evidence only if an active Windows acceptance gate, unresolved investigation, or other named consumer requires it. Every exception must identify the scenario, source commit, executable hash, PASS/FAIL/NOT RUN status, owner, and condition for retirement. A historical failure or success alone does not justify permanent retention.

Transient successful CI visual-capture artifacts should have explicit short retention; exact-build Windows executables and evidence needed for pending physical acceptance must remain available until that independent gate closes.

## Existing Narro history

Before removing tracked Narro media, check open PRs, pending native gates, tests, manifests, current documentation links and active uses. Preserve compact immutable findings and enough provenance to locate the prior Git commit. An original **Narro** video is not inherently permanent: when its exact build is superseded and no active physical gate, unresolved review, regression or source comparison needs the full recording, retire that original as well as disposable derived frames, with an exact Git recovery commit. Keep compact accepted results, selected visual evidence and provenance where needed. If a named review is OPEN or REVIEW_PENDING and the recording is still necessary to examine it, retain the recording until that need is demonstrably retired or replaced; age alone does not close a review. Do not treat original Blitzit sources as derivable or disposable.

Deleting files from current `main` reduces checkout burden, but not historical Git object size. Rewriting shared Git history or moving evidence to external storage requires its own verified migration, recovery plan and explicit decision. Ordinary cleanup must remain reversible and must not weaken tests or invent physical PASS.
