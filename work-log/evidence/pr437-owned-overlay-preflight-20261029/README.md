# J05 correction preflight and normal-motion capability

Source candidate `1dd54ed8c3144498a2aaedaa9d59e2caa13731c7`, PR437. `frontend-final.log` and result JSON record the complete local frontend gate, including production build. Rust formatting passed separately; local native execution was NOT RUN (MSVC linker absent). Exact Windows CI40862716381 remains the authoritative native build/test gate, pending at publication. These files establish no physical visual PASS.

The other four JSON receipts belong to the separate old-build `41e8ff8a`/EXE3c14067a environment-capability session, not the corrected candidate. Enabling actual Windows client-area animation before a fresh process launch yielded `reduced=false`; original animation flag and hash-identical personal profile were restored. This permits the subsequent normal-motion physical protocol; it does not accept that motion or transfer old physical results to changed source.

Only the explicitly listed validation/capability receipts are published. No personal database, browser profile or private protection ledger is included. See [current correction scope](../../2026-10-29-codex-j05-owned-overlay-source-preflight.md) and [historical causal comparison](../pr437-causal-transition-20261029/README.md).
