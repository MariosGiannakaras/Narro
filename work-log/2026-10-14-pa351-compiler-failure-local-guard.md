# PA351 first compiler failure and corrected head — 2026-10-14

Failed exact run38517414879 / a89aea6a, first causal Windows step Check Rust: E0433 notifications/mod.rs43 unresolved log::warn! because log is not a direct Cargo dependency. Later packaged Focus artifact failure is downstream absence, not a separate UI defect. Complete original Windows job log retained at evidence/pa351-preflight/windows-first-failure.log.

Minimal source correction fa3ca8e063104ad1d0449d4bc6675bb29a8979a8 uses the existing eprintln native diagnostics, adds no dependency and preserves secondary-effect failure semantics. Notification delivery regression now checks external logging macro crates against Cargo dependencies; original failing log::warn would fail locally, even without MSVC. Narrow complete audio connector regression and Rust fmt PASS. Matching NER003 prevention strengthened; this is not physical or source-parity acceptance.

PR351 replacement exact Windows CI38519177394 IN_PROGRESS. Prior frontend95 checks remain valid for unchanged runtime/renderer paths and are rerun by CI. Fresh native0/3. Next exact3/3 + guarded merge/source proof, verified artifacts, isolated-profile dual-monitor capture using prepared E:/SystemFiles/Desktop/Narro-PA351-native-20261014. No new Narro launch/profile mutation/recording. Mandatory3/10/M10 blocked; M11/PA09 excluded.
