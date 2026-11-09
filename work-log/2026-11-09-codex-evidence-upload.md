# Physical evidence delivery — 2026-11-09

User explicitly requires immediate upload after every safely frozen recording; no further recording in this transfer-only task. All8 existing session packets plus campaign analysis/quiet data uploaded as9 ZIP assets,684,870,152B total, each remote size/SHA256 verified. Original incomplete tails, sampling gaps and bounded manual analysis remain explicit; no new physical PASS follows.

Draft release (maintainer access, no public desktop publication): https://github.com/MariosGiannakaras/Narro/releases/tag/untagged-18d1c42aad4c1212a1fe

Download EVIDENCE_UPLOAD_INDEX.json first; each ZIP contains its file/hash manifest. Local counterpart: Narro Project/PhysicalEvidence/EVIDENCE_UPLOAD_INDEX.json. No raw evidence was committed to Git. All current video/log/action/timeline/admission/index/source-map/analysis/quiet files are included; retired obsolete derivatives are not resurrected.

Workflow PR500: https://github.com/MariosGiannakaras/Narro/pull/500 — full local frontend preflight, physical lifecycle tests, artifact manifest tests and3 upload tests PASS; exact-head validation/fast PASS, Windows candidate pending at publication. Automatic supervisor/collect/recover upload is not integrated until that PR merges. Old admitted controllers stay immutable: run the standalone uploader immediately after collection. Upload failures remain UPLOAD_PENDING and preserve local evidence. Source PR499 and independent compositor/native holds remain separate.
