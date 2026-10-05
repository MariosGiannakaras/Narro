Publish-Narro-Evidence.bat

Double-click to publish the currently prepared SHA256-verified evidence packet and HANDOFF/TODO/STATUS/audit-crosswalk to main. It excludes Narro source, tests, configuration and unrelated changes. No force/reset, build or CI is invoked.

A packet must first be prepared by the validation session with a frozen manifest and ready.json. If no prepared packet is waiting, the button clearly reports that and changes nothing. It cannot infer missing results, finalize an active OBS recording or publish arbitrary local code. --check verifies without commit/push. --no-pause is for automated invocation.

Successful remote verification is recorded in last-publication.json. A failed run stops safely with details in last-error.txt; prepared evidence remains for retry.

Reassemble.ps1 joins the latest multipart video, refuses existing output and verifies the whole-file hash. -MediaDirectory selects another downloaded video directory. Helpers are local Desktop tools and are not executable content in the evidence-only repository commit.
