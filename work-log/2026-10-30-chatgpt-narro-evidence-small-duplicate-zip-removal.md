# Narro evidence cleanup — duplicate native log ZIPs (2026-10-30)

Owner: ChatGPT. Scope: repository housekeeping only, source/config/tests/runtime untouched. Base main `01ae74ff13d8940aedd9562cdea2cb8d1ac543d1`. Separate prevention policy PR #445.

The following obsolete Narro test-run convenience archives were removed from the cleanup branch, each already accompanied by the retained, readable `Narro-M7-Logs/` folder in the same evidence package:

| Removed path, relative to `work-log/evidence/` | Size (bytes) | Git blob SHA | Retained counterpart |
| --- | ---: | --- | --- |
| `m7-ci932-20261004/Narro-M7-Logs.zip` | 19,496 | `e4364c363878207781604b1e52c7f5eda643b261` | `m7-ci932-20261004/Narro-M7-Logs/` |
| `m7-ci936-20261004/Narro-M7-Logs.zip` | 28,479 | `f92fea60616a12f79720a0d53f057489a2ac4018` | `m7-ci936-20261004/Narro-M7-Logs/` |
| `m7-ci948-20261004/Narro-M7-Logs.zip` | 9,239 | `86a1f2494bf134068b0a4abd326131dba9ff7ffe` | `m7-ci948-20261004/Narro-M7-Logs/` |

Combined logical removal: 57,214 bytes and 3 tracked files. Original Blitzit media: **0 modified**. Historical references to these ZIP convenience artifacts now refer to the original base commit, not current-tree files; original content is recoverable by exact blob or `01ae74ff` checkout. Associated README/manifest/history and unpacked logs remain unmodified. This is not evidence that the complete packages are permanently deletable.

Validation: exact GitHub path and SHA presence in base commit checked; retained counterparts confirmed in Git tree. Windows/CI/runtime tests NOT RUN for evidence-only deletion; no physical acceptance claim. Next action: finish independent retention-policy CI PR #445 and inventory large derived frames and active consumers before any further media deletion. Do not rewrite Git history. The attempted larger extracted-frame cleanup was **not committed**.
