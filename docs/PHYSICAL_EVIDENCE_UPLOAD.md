# Immediate evidence upload â€” user instruction 2026-11-09

Every physical recording must upload its complete frozen packet immediately after collection, before analysis or another recording. Upload video, all logs, actions, timeline, admission, indices, hashes and explicit coverage gaps. Analysis/quiet data must also be transferred after their safe completion. Upload is not physical acceptance.

The supervisor finalizer and CLI collect/recover invoke `scripts/upload-physical-evidence.py`. Python3.11+ and authenticated GitHub CLI with repository write access are required. Raw desktop recordings go to a **draft** release in MariosGiannakaras/Narro; never silently publish that draft on this public repository. No credentials enter archives. Files have a per-member SHA256 manifest; remote ZIP size/digest is verified, downloading to verify when the API lacks a digest. The local UPLOAD_RECEIPT identifies the remote release/asset and bytes. A failed transfer stays UPLOAD_PENDING; preserve local evidence and retry the uploader before continuing acquisition. Never represent local storage as uploaded.

Retry existing frozen evidence without launching Narro or a recorder:

Archive member timestamps and permissions are canonical, so extraction or filesystem metadata changes do not alter the archive identity. Only root-level `UPLOAD_RECEIPT.json` and `UPLOAD_STATUS.json` are delivery metadata excluded from the evidence manifest. Nested files with those names remain evidence. Identical evidence bytes reuse the existing verified asset; changed evidence bytes create a different identity. Retry checks cover delayed execution, status updates, changed filesystem timestamps and extraction/repackaging.

```powershell
python scripts/upload-physical-evidence.py --root '<FROZEN_SESSION>'
```

Previously admitted binaries/controllers are immutable and do not acquire this change retroactively. When using an old validated controller, immediately run this current uploader on its frozen output; do not replace the old controller inside an admitted package. Preserve all original coverage gaps, native holds and the existing retention safeguards. Remote draft releases remain temporary evidence with the same named consumer/retirement condition; do not delete local unique evidence merely because upload succeeded.

This explicit user instruction supersedes prior instructions saying not to upload raw captures automatically. It does not authorize new capture when the user has forbidden recording, or public publication of desktop content.
