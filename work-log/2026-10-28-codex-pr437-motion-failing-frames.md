# PR437 real Windows Panel→Timer failing frames

UTC 2026-10-28T09:36:24.882597+00:00

**CURRENT PR437 physical/motion review 2026-10-28:** [Full-resolution original-frame evidence](work-log/evidence/pr437-motion-review-20261028/README.md) upgrades J05 to **FAIL**: Panel→compact shows duplicate active title and timer at primary100% (~PTS233.50–233.60s) and LG125% (~PTS72.22s); LG active title/time also briefly blank around72.08–72.10. Same Focus HWND197988, reduced motion; no cause inferred or claim of recurrence across separately corrected builds. Preserve earlier endpoint/task-identity scoped PASS. The [four originals and monitor/data/repair packet](work-log/evidence/pr437-native-20261028/README.md) remains unchanged. Of 6 prepared scenarios: 4 exercised; **J01 FAIL, J05 FAIL; J02/J06 PARTIAL with explicit scoped PASS; J03/J04 hardware NOT RUN**. Separately investigate observed running Time Taken0 with runtime checkpoint361522ms; no data-loss conclusion. PR437 OPEN/unmerged exact2fc7881c/EXE2e6eeed8, CI40648025484 3/3; no source edit/new CI/merge. Personal profiles restored, owned app/recorders stopped; physical operator unavailable.

[Detailed original-frame analysis](evidence/pr437-motion-review-20261028/README.md). Source original media immutable and already uploaded; no new capture/code/CI/merge.
