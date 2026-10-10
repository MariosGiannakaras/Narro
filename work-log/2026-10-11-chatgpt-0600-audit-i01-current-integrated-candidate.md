# 2026-10-11 — S0 frozen comprehensive audit I01, combined current main source/Windows production artifact boundary

## Classification and exact outcome

**I01 REVIEW COMPLETE / COMBINED_SOURCE_IDENTIFIED / LATEST_COMBINED_WINDOWS_CI_NOT_VERIFIED / LATEST_ZIP_EXE_HASH_NOT_RUN / NATIVE_PHYSICAL_USER_PAUSED.** This **closes one audit evidence-review unit**, NOT the Windows candidate build acceptance and NOT a mandatory milestone. **S0 audit 70/70 = 19/19 PR review + 50/50 frozen Markdown + I01 1/1 reviewed** with explicitly unclosed validation requirements. All new source/test fixes and CI were held until after this audit completion per user instruction. Historical PRs may have exact-head automated PASS and code blobs validated without validating the final combined current main executable.

GitHub source: `MariosGiannakaras/Narro`, current main top immediately before I01 log `02219cd3d4db82ce74a9525e0e996ffb4ac2a065`; zero open PRs. **Last executable merged-main source snapshot** `7df50f61064d56a61baf9906cc606dbaa740d2c5` (guarded squash merge #320). GitHub compare `7df50f61... → main`: **53 ahead, 0 behind, 16 changed paths ALL documentation**, zero differences under `src/`, `scripts/`, `package.json` or `.github/`. Therefore it is correct to use `7df50f61...` as newest integrated source/test tree at this checkpoint, while documentation progresses. No source/config or test modifications performed in I01.

## Exact independently validated PR and artifact provenance

| Artifact provenance | Exact head and CI | What that supports | What it does NOT support |
|---|---|---|---|
| #316 A01–A10 historical integrated | Head `edebaa4d1e7f44d95e8dc7730062ae185a7fc6fc`, merge `1bd24411e159b8a1e5d8e51c97e005d7163a1c34`, run [38066478586](https://github.com/MariosGiannakaras/Narro/actions/runs/38066478586) all validation/fast/windows-candidate SUCCESS, production ZIP artifact **11675827068** | Then-combined A01–A10 test-wiring/full candidate PASS; 2/2 PR changed Git blobs match resulting main | Source changes from #317–#320 were not in its packaged binary. No current native ZIP/EXE hash or current physical proof. |
| #319 A13 Focus selector actual ellipsis | Head `c3197deca21f4761d55243de901381c5f299804d`, merge `4ff95925fd8c2216198809210e5188f879f7023b`, run [38072910111](https://github.com/MariosGiannakaras/Narro/actions/runs/38072910111) all three SUCCESS, native production candidate artifact **11679146292**, actual correct light/dark popup PNG artifact **11679005142** | Exact Focus-only constrained CSS + geometry/ellipsis fixture/test and real light/dark static evidence; 3/3 PR source Git blob equal corresponding merged main | Its earlier PR-head package does not contain #320 CSV/PDF export guard/test changes; not newest combined source. |
| #320 A14 Reports CSV/PDF single-flight | Head `67814cf144ac0e60d9e146f8485cffc56724914e`, merge `7df50f61064d56a61baf9906cc606dbaa740d2c5`, run [38077203921](https://github.com/MariosGiannakaras/Narro/actions/runs/38077203921) all validation/fast/windows-candidate SUCCESS, production-config ZIP artifact **11680205014** (reported GitHub artifact 15,328,859 bytes, not actual downloaded-byte verified here); other artifact `narro-m5-visual-regression` **11679264268** | #320's five changed source/test files identical between exact accepted head, merge commit and current `main`, plus good individual exact-head Windows CI; real TypeScript AST-extracted CSV/PDF handler VM regression executes mock IPC, not native real file writes | PR320's packaged ZIP at **PR head** does **not** contain #319's CSS + visual-fixture/test correction. It is NOT the integrated latest `main` build. Artifact size is not ZIP SHA256. |

**Direct Git blob proof of missing #319 changes in #320 artifact head**, all three files fetched at #319 tested head, #320 tested head, resulting merge and latest main:

| Path | #319 accepted blob == integrated `7df50f` == latest main | #320 PR head blob, different |
|---|---|---|
| `src/boardListPicker.css` | `6abe55891c47dd33c7246eec7484e50297e534e5` | `58e2087fb189889a032f141302d8802b79fc1642` |
| `src/focusPanelVisualFixture.tsx` | `4d21ec8434a542e8e857856a82412791a4863241` | `02a3831de8f8e4300dd0b273df9f20e91edfa772` |
| `scripts/validate-focus-panel-captures.mjs` | `3ef83e18876ebd37ff8bf9ed96b2661b4d9d19cd` | `ef639ffa7c40c87a8188b053fd1e89ea75d5bfe9` |

**Direct Git blob proof of #320 acceptance into integrated main**, all five match exact #320 head, merged #320 commit, and latest main:

- `src/ReportsOverview.tsx`: `7559b394abc6701613f96e455f398e096acf8462`
- `src/ReportsSessions.tsx`: `6cd5cc2661dbe330197a8235af9b92b3db126919`
- `scripts/test-reports-csv-export-single-flight.mjs`: `2fc00088b2ccc40a8bf50fcc5f9b644ab7fb8490`
- `scripts/test-ui-reports-overview-runtime.mjs`: `f7ea03714fafcc893f3925455cdc2d90bf4c155b`
- `scripts/test-ui-reports-sessions.mjs`: `354cdc6c0715573c99b3e8ae57867a6178075bbb`

GitHub compare `#316 resulting merge 1bd24411... → #320 resulting merge 7df50f61...`: **44 ahead**, 13 modified executable/test file paths plus documentation, demonstrating post-#316 material combined differences. Exact comparison `#320 tested PR HEAD → #320 resulting merge` is divergent (PR-head branch predated #319), and #319 CSS/test blobs are among differences. **Separate successful PR CI cannot establish a single CI run for the final union.**

## Validated vs NOT RUN claims

**Supported:** exact individual #316/#319/#320 three-job Windows CI is green and guarded resulting-main source blobs match; final merged `main` **contains both #319 and #320** (8/8 independent changed-path spot checks plus GitHub compare of only doc changes since latest executable merge); accepted original #319 light/dark Edge popup has real ellipsis and bounded geometry. Frontend preflight registration script in `scripts/test-merged-prephysical-ci-coverage.mjs` from #316 was previously accepted; the current union was not rerun here. All source/CI A01–A14 individual campaign accepted **14/14**.

**OPEN/NOT RUN:** No verified GitHub Actions run/production artifact with **both #319 and #320 merged source** was established using currently available connector evidence. `fetch_commit_workflow_runs` is limited to pull-request-triggered runs and returned no run for merge `7df50f61`, therefore **absence of a main-push CI run globally is NOT conclusively proven**. The last fully proven packaged candidates correspond to mutually non-equivalent PR heads. Latest integrated `main` **ZIP SHA256 NOT RUN**, uncompressed `narro.exe` SHA256 **NOT RUN**, NSIS/MSI current hashes **NOT RUN** (old #301 exact artifact hashes are version-specific and cannot be copied); latest full combined Windows executable validated PASS **NOT ESTABLISHED**. No local Node/Rust/PowerShell, new CI, physical desktop startup, real file export, Blink/Edge end-to-end simultaneous owner, native compositor motion, OS alert/audio or direct current-version Blitzit source parity was executed in this evidence-only I01 review. Never invent metrics, job outcomes or ZIP hashes.

**Physical gates remain USER-PAUSED / OPEN:** C4 Timer→Panel same-HWND continuous motion (previous physical FAIL), M6 initial Board→Focus morph/hover/action reveal/success, Finding35 current native compact/expanded Time's Up, Finding29 native pending Add Session focus ownership, Finding27 monitor/DPI recovery, M8 actual Windows OS notifications/sounds. M1–M9 relevant source visual parity independent; mandatory roadmap **3/10** fully accepted, M10 blocked, optional M11 strictly dormant.

## Exact post-audit action and precedence

The user ordered **full audit FIRST**, then batch evidence-backed fixes and necessary CI. With this I01 finding and ledger now **70/70 reviews**, the constraint deferring new CI and fixes until audit end has been satisfied, *without* falsely claiming latest native build PASS. Existing **Q12** in `docs/AUDIT_2026-10-10_POST_AUDIT_ACTION_QUEUE.md` owns the **one latest combined-resulting-main Windows CI/production candidate plus real ZIP/EXE hash task**; clarify it must include at least exact current #319 and #320 blobs. Prefer addressing **Q01** false screenshot focused-state PASS and **Q02** Next Task/Take a Break same-render ownership in narrow deterministic PR(s) before the final expensive *combined* build, if dependencies allow; use targeted tests then exact-head Windows CI, expected-head guarded merges, resulting-main check. Revalidate final union with a current source candidate rather than reusing older #316/#319/#320 binaries. If no available tool can dispatch/push relevant CI, record that as a concrete tool blocker, not a claimed PASS; do not manufacture a source no-op solely to start CI. Only user explicitly reactivates physical Codex.
