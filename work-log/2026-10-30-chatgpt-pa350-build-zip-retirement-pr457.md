# PR457 — retired superseded PR350 CI ZIP build artifacts (2026-10-30)

**Owner:** ChatGPT evidence checkout cleanup. **Action:** merged archival-only allowlisted deletion. No Narro source/config/test/CI/Windows operation.

## Verified identity and delta

- Base latest `main`: `b240bc3798dc721a5611baa55be0221b364c3601` (full tree `97d65811cfc293bccd1b03e7b25295d5fb3c03d3`).
- [PR457](https://github.com/MariosGiannakaras/Narro/pull/457), branch `cleanup/retire-pa350-build-zips-20261030`, head `7f07d3dcb7634eccb255e2bc5e79e576e3d14199`.
- Expected-head-guarded squash merge: **`39accb8f9b4e03f2ccd60f207ec71b39778cb220`**. Post-merge `main` HEAD matched it, PR reports merged.
- GitHub exact base→head and base→resulting-main comparisons both show **only the five removed ZIPs below**, with zero added/modified files:

| Original path under `work-log/evidence/pa350-exact-head/` | Git blob SHA | Bytes |
| --- | --- | ---: |
| `fast-frontend-dist.zip` | `5da71d2c0794d5331c948dd2991dacd1d3cc4e01` | 347,042 |
| `focus-runtime.zip` | `49a316ad80e4cd54ef319463deb86e138b5acaae` | 2,493,063 |
| `physical.zip` | `9fe33207929de2701471749f37d106fc9f6b959c` | 15,507,217 |
| `validation.zip` | `bde7c58c10ac33cb9beb862191dcf13b10bdd3cc` | 5,732,459 |
| `visual.zip` | `348010416ff29742933ad414ce5630c5536af975` | 5,649,052 |
| **Total: 5 files** | | **29,728,833** |

**Recovery:** All five original blobs and paths are available at the exact undeleted base commit `b240bc3798dc721a5611baa55be0221b364c3601`; original byte SHA256/size is recorded in retained `work-log/evidence/pa350-exact-head/checkpoint.json`. No Git history rewrite, LFS migration or rewrite of dated references. Git historical storage has **not** been reduced; current checkout size has.

## Consumer decision

This is historical **Narro** PR350 / exact source `4b183470b6e90abfb8f2cb717e931e17531a0d0d`, merged `0f606bc34a0618914f0dac321d2ba54cd26de529`, CI38464889855 historical **3/3 SUCCESS** as recorded in [PA350 report](../docs/WINDOWS_PA350_NATIVE_REPORT_2026-10-14.md), EXE SHA256 `6c780f13e564c11251c56f516f01fbb59727e83294a09868ae2617376babb964`. PA350's actual failure findings were subsequently exercised and dispositioned by PA351–356; [final PA01–08 report](../docs/WINDOWS_PA01_08_FINAL_2026-10-15.md) retains the independent case-by-case native results and limitations. The PR350 ZIPs are old build products, **not** current exact-build artifacts for PR389/419/431/436/437 or the missing PA-01–09 cases.

Retained and verified **9/9** files in `pa350-exact-head/` after deletion: `CAPTURE_ORDER.md`, `checkpoint.json`, `fast-frontend-dist.verification.json`, `focus-runtime.verification.json`, `main-source-proof.json`, `new-rendered-regressions-verification.json`, `physical.verification.json`, `validation.verification.json`, `visual.verification.json`. Other PA350 native recordings/manifests/review data and immutable reports untouched. Direct tree identities after merge: `reference/` `46dea0c640cbfc17003acf439d96f503a5c39410`, `src/` `715f8a0acc5bab9a170d3c55d683f3dcb64d0e90`, `src-tauri/` `d15e3d16751fee44dc494b406235e482011022c5`, `tests/` `229d81ddd95bfae21db7c05e60452e02ca1a0709` — identical to pre-deletion.

**Explicitly held:** CI944 46-minute original remains **HOLD** because recording was not completely reviewed and its old C4/queued-title visibility gaps require consumer decisions; CI950, CI953, capture57 unresolved review/originals; protected original Blitzit evidence irrespective of location; PA351–356 accepted native original recordings; PR389/419 native-before-merge 8/8 and PR437 current M5/M7 physical evidence; unreviewed mixed ZIPs. No inference of obsolete status based solely on age, size or extension.

## Validation and boundaries

- Exact GitHub compare **PASS**: 5/5 allowlisted removals only at both PR head and merged main.
- Exact post-merge folder check **PASS**: 9 retained metadata/provenance files; original ZIPs absent.
- Protected source/test/reference Git tree identity **PASS**.
- Source/CI changes **NONE**. PR commit and merge use `[skip ci]`; new Windows CI **NOT RUN** and physical Windows acceptance **NOT RUN**. No new feature, Blitzit parity or milestone PASS.
- Cumulative PR445–457 checkout retirement: **19,301 paths / 5,585,897,016 logical bytes** (prior PR445–456 19,296 / 5,556,168,183).

**ONE NEXT:** Continue independent consumer-level review of the next historical Narro media/ZIP family; retire full media only when unique-content consumers are demonstrably superseded, under a recoverable exact-path PR. Otherwise HOLD and select another family. Keep M1–M4 4/10 accepted, M5–M9 OPEN, M10 user approval hold, M11/M12 dormant.
