# M7 RISK-F009 single-instance CI resolver reconciliation

Date: 2026-10-01

## Scope

PR #206 (`fix/runtime-single-instance`) adds the official Tauri single-instance boundary before all persistence/background/shortcut authority initialization.

The functional implementation did not change during this sequence; CI exposed formatting/test-parser/lockfile validation issues one at a time.

## CI evidence chain

- #779: failed only `cargo fmt --check`. Applied rustfmt-only source formatting.
- #780: frontend failed only the new static single-instance contract because its callback boundary parser depended on pre-rustfmt `}))` formatting. The test was corrected to delimit the callback at `.on_window_event`.
- #781: frontend, new single-instance contract and rustfmt passed. `cargo check --locked` rejected the manually assembled Cargo.lock.
- #782: same result after replacing the added Windows family with the plugin tag's older lock family; still `cargo check --locked` only.
- #783: intentional diagnostic resolver run. Strict `--locked` was temporarily removed solely to let the same Windows Cargo 1.98.1 resolver update the working-tree lock and print `git diff -- src-tauri/Cargo.lock`, then the job intentionally exited non-zero.

The Cargo-generated diff was exactly one line in the pre-existing `windows-targets 0.52.6` dependency list:

```
- "windows_i686_gnullvm",
+ "windows_i686_gnullvm 0.52.6",
```

No other dependency/version/checksum changed.

## Current candidate

- Applied the exact resolver-produced one-line lock change.
- Restored `package.json` `check:rust` to strict:
  `cargo check --manifest-path src-tauri/Cargo.toml --locked`
- Current exact PR #206 head:
  `ab1e89fcabc7b8385016a738603d41002f9c3b14`
- Windows CI #784 / run `36780624064`: queued at checkpoint creation.

Do not merge #206 until #784 passes at this exact head. On PASS, merge with expected-head guard and validate the resulting main source with a full Windows CI because Cargo.toml/Cargo.lock changed.

No roadmap/milestone counter advances from this corrective validation sequence.
