# PA353 merged-main candidate verified; native recheck pending

PR [#353](https://github.com/MariosGiannakaras/Narro/pull/353) exact head `8bda5cc40be905c4a91506e0708d39e2770b4cde` passed [CI38558587191](https://github.com/MariosGiannakaras/Narro/actions/runs/38558587191) validation/fast/windows **3/3 SUCCESS**, then expected-head guarded squash merged as `a8d7c9050004eb9e8d21cfdf2652425016acf019`. **530/530** source/build/test/config blobs match the validated head, workflow unchanged; reuse under CI_VALIDATION_STRATEGY section7.

Five original artifacts and SHA/CRC receipts are [published](evidence/pa353-ci-20261014). Validation artifact `11892682382`, ZIP SHA-256 `91451a2473c2628754d72934c9a356da88cd649a67462a630e7063d1289a3759`, x64 EXE SHA-256 `8e2f9080a2868bd813ce95e9c58c301285f0913b37e7c8f789bea3e9da474d18`. Physical ZIP CRC3/3, visual CRC341/341, Focus runtime CRC90/90, frontend CRC86/86; provider digests match.

The candidate addresses PA351's two confirmed failures: Main→Focus separate pixel raster with Main geometry preserved, initial paint validation and cleanup/rollback; Reports chart/Done Tasks scrollbar suppression with keyboard reachability retained. Local full frontend preflight/build, targeted regressions and rustfmt passed. Local Rust compilation was NOT RUN due absent MSVC linker; exact Windows CI passed compiler/tests/Clippy.

**New corrected native acceptance 0/2**. Next: protected original-profile backup and fresh owned profile, one focused real dual-screen 60fps recording for PA02 normal/reduced Main entry and PA04 wheel/keyboard Reports scroll, aggregate frame/log review, evidence upload and restoration. OBS window screenshot helper timed out twice; a local gdigrab health capture proves both real monitors at4480×1080, so direct continuous desktop capture is available. This setup capture is private and is not acceptance evidence.

PA01–08 previous aggregate review8/8 and PA351 scoped PA06 sound/C5 PA07 remain historical/current where unchanged. Physical HDMI topology loss, MSI/true boot and unexercised branches stay OPEN/NOT RUN. Mandatory milestones3/10; M10 blocked; PA09/M11 excluded.
