# M1-M12 closure route

**Current corrected-source state (2026-11-09):** The [2026-11-08 D01–D05 findings](OPEN_M5_M9_DEEP_REVIEW_2026-11-08.md) were addressed in held [PR499](https://github.com/MariosGiannakaras/Narro/pull/499), descendant of PR437, at source `ae0447c4bebd49215f0c49eb8cd9acf0db8fc80c`. Exact [CI42632330444](https://github.com/MariosGiannakaras/Narro/actions/runs/42632330444) passed validation/fast/Windows **3/3**. The new physical-observer artifact id is `13683936109`, but its real Windows EXE/manifest/controller **has not yet been admitted locally**, and no D01–D04 native/physical outcome exists. See the [corrected-source PA case delta](PHYSICAL_ACCEPTANCE_NEW_RECORDING_BASELINE_2026-11-06.md#pr499-d01d05-corrected-source-physical-acceptance-delta); no M5–M9 checkbox or strict A/B gate was closed. The original 2026-11-08 audit and the older PR437/A/B software remain valid only in their original scope.

This is the current index for closing the existing milestones. HANDOFF owns the active operation and exact source/CI/artifact identities; TODO owns the original criteria. This index adds no milestone, feature backlog or acceptance result.

| Milestones | Present state | Required closure |
| --- | --- | --- |
| M1-M4 | Accepted within their recorded scopes | Preserve identity/persistence/timer/scheduling invariants. Reopen only a claim invalidated by replacement or demonstrated regression; do not restart the scaffold or old M1 harness campaign. |
| M5-M9 | OPEN:59 documentary acceptance rows,6/13/18/11/11 | Use the existing criterion-level [closure audit](M0_M9_IMPLEMENTATION_CLOSURE_AUDIT_2026-11-07.md). Implemented behavior is not missing code because native/source proof is open. Collect the missing proof, fix demonstrated failures, integrate accepted source and verify resulting-main inputs. |
| M10 | NOT STARTED; post-M9 user-review/approval hold | Close applicable M1-M9 source/native/parity and integration gates. Present the exact candidate/results and proposed M10 scope for explicit user approval. Then apply the M10 ledger and [validation strategy](CI_VALIDATION_STRATEGY.md), reusing valid evidence and testing invalidated claims. |
| M11 | DORMANT / separate explicit opt-in | If activated, follow the [live Blitzit protocol](BLITZIT_LIVE_REFERENCE_AUDIT.md), including whole-campaign acquisition/freeze before analysis/remediation. Ordinary offline source comparison does not activate M11. |
| M12 | DORMANT / separate explicit opt-in | If activated on a validated relevant candidate, follow [Narro user QA](NARRO_OPTIONAL_USER_QA.md). Its in-app scope does not replace OS, installer or hardware acceptance. |

The existing Final Comprehensive Review remains governed by TODO after the applicable preceding path. This maintenance request neither activates M10/M11/M12 nor closes a checkbox.

## Application sources and physical route

Current held sources are corrected default **PR499** (CI3/3, local physical admission NOT RUN), older default **PR437** (locally verified old-source candidate), and independent A/PR389 and B/PR419 (their own strict 8/8). Read [HANDOFF](../HANDOFF.md) for live head/build identities: the existing local VERIFIED_CANDIDATES.json predates PR499 and **must not be mistaken for PR499 admission**. PR431/436 supply upstream fixes within PR437/499's ancestry; PR418 is a design/source contract, not a physical runtime candidate. No source branch is merged or replaced by this documentation update.

1. Use the [fresh physical protocol](PHYSICAL_ACCEPTANCE_NEW_RECORDING_BASELINE_2026-11-06.md) and prepared local PhysicalChecks/START_HERE.md.
2. Recheck the selected live PR head against its verified package. Use that package's own controller, EXE and manifest. Preparation does not prove actual screen/input/trace health.
3. For corrected D01–D04 claims, **first locally admit the exact PR499 physical artifact** and execute its scoped native/physical delta; ordinary source-independent old PR437 cases may still use their own verified old artifact when their dependencies permit. Establish actual capture/input/trace health, nonzero movement for movement claims and PP44-F01 closed-history edit/delete/restart accounting. D05 is tooling-only and cannot create a physical PASS. Keep current HANDOFF priority without pausing unrelated dependency-ready cases.
4. A and B each require their own strict8/8 normal/reduced compositor acceptance. Functional routes, CI or another candidate cannot satisfy either hold.
5. Read observer index/brief/timeline, original video/actual PTS and relevant raw logs together before diagnosis. Performance uses the separate quiet package without observer/recorder.
6. Record PASS/FAIL/INCONCLUSIVE/NOT RUN by claim. Correct a real defect through scoped causal review/regression and invalidated revalidation. Integrate only after that source's holds clear, preserving newer main instructions.

All59 M5-M9 rows remain open; prepared artifacts are not physical PASS. The historical first Timer poison cause remains unknown; use the [timer risk contract](TIMER_PREPHYSICAL_RECOVERY_ACCEPTANCE_2026-10-25.md). The [PR431 cases](PR431_SCOPED_NATIVE_ACCEPTANCE_2026-10-27.md) retain detailed14-case requirements. The [A hold rationale](PR389_NATIVE_REVIEW_2026-10-21.md) records a historical native failure, not a new implementation order.

## Implementation that remains necessary

Retain Rust/domain/SQLite, migrations and compatibility tests, the persistent Focus host and actual coordinator/native owners, production frontend entrypoints, rendered fixtures/regressions, CI, observer/recovery and quiet-performance tools. Names such as Foundation, diagnostic or legacy data do not establish obsolescence. Original Blitzit assets and canonical findings/calibration remain protected requirements inputs.

Motion v4 is implemented on held candidates. It is not physical-accepted or necessarily integrated to main; do not implement another copy from the prototype. The [motion contract](NARRO_MOTION_V4_AND_UNIFIED_WINDOW_ROADMAP.md) preserves design and independent acceptance. A whole-application single-HWND rewrite and post-product feature ideas are not prerequisites for this closure route.

## Instructions and evidence hygiene

AI_START_HERE, AGENTS, ENGINEERING_QUALITY, AGENT_WORKFLOW, HANDOFF, STATUS, TODO and this index govern present sequencing. Source-finding/risk records explain requirements; dated work logs are evidence only. Retired kickoff prompts, duplicate tracker snapshots, closed cleanup metadata and old executable packets are recoverable in Git and are not executable instructions in the current checkout.

Compare authentic Blitzit originals with fresh Narro evidence. [Retention](EVIDENCE_RETENTION_POLICY.md) retires verified superseded/unneeded Narro captures and temporary outputs after named consumers are satisfied; keep active packets, current exact-build software and unpublished work. Never delete original Blitzit, claim missing hardware as PASS, or invent current restrictions from old chats.
