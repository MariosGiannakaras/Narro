# Evidence inventory for later cleanup — 2026-11-01

User direction: audit only. Do not delete or move files. This is an inventory and reference-discovery checkpoint, **not a completed per-file deletion audit or a deletion allowlist**.

The frozen baseline is main `4fcd2fe084ecdc7b66cad5671da54d63e71aabe3`. `inventory.json` enumerates all 163 tracked families and seven root-level files beneath `work-log/evidence/`: 15,690 paths, 9,004,461,750 logical bytes. `paths.csv` inventories each of those Git paths, exact blob ID, and logical size. Every path is conservatively marked `REVIEW_REQUIRED` pending a specific evidence/consumer decision. `duplicate-blob-paths.json` groups all Git paths with identical blob IDs; identity is not a verified replacement or authorization to delete. Results are frozen at this exact main, not proof about later changes.

The automated scan finds literal family-name mentions in tracked Markdown in `docs/`, `work-log/` (excluding `work-log/evidence/**`), and HANDOFF/TODO/STATUS. It associates mentioning files with each family; 154 families have at least one such external document mention. The CSV also lists scanned Markdown documents containing a literal family-relative file path, when found. This is a discovery index, not proof that the references are current, required, complete, valid, or sufficient to decide retention. It misses aliases, implicit dependencies, non-Markdown consumers, media-internal content, evidence-internal links and untracked/external usage. A missing mention never implies a file is safe to delete. Prior reports must be read and exact path/provenance, current evidence needs, alternatives and user retention policy checked separately.

The previous 27-family / 4,065-path batch is included in this baseline. Its earlier destructive action was blocked by safety checks and must not be retried or bypassed. This inventory itself authorizes no deletion, and the current user requested no deletion. Existing accepted/failed Windows evidence and original Blitzit files remain unaffected.

Reproduce using `python audit_cleanup_inventory.py` in a checkout with Git and `origin/main` at the desired baseline; results change with the ref. Verify `main_sha` in the JSON before comparing runs. The script only reads tracked objects and writes its own local report files.

## Continuation

Review all families and non-evidence parts of the repository within the requested cleanup scope, distinguishing active or irreplaceable records, superseded duplicates and uncertain material. For each eventual proposed deletion establish exact paths/bytes, retained replacements or recovery plan, consumers and reasons, and produce a reviewable consolidated manifest. Preserve original Blitzit and latest meaningful final/native evidence. Update this report and the active handoff at checkpoints. No deletion until a later user instruction and any applicable safety review permits it.
