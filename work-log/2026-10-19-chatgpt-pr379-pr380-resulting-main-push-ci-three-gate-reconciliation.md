# 2026-10-19 — PR379 and PR380 exact resulting-main push CI recovered and verified

**Owner:** ChatGPT, independent read-only CI reconciliation while Codex owns original recording/video analysis. No code/config/test changes, no new CI triggered, no physical Windows actions, no changes to the protected List Editor. Current main when checked `3b982ff2d4a23663d7607661cb26fec5eb1ea5dd` includes later documentation-only commits. The previously reported "post-merge CI NOT VERIFIED" reflected a limitation of the `fetch_commit_workflow_runs` connector that **filters to PR-triggered runs**; it is superseded by a correctly filtered authorized GitHub Actions repository run-list API GET, **not** by speculation about workflow configuration.

## Exact, independently sourced evidence

| PR | Resulting squash merge SHA | Exact GitHub Actions event=push head SHA | Verified resulting-main run | Validation / fast / Windows |
| --- | --- | --- | --- | --- |
| [#379](https://github.com/MariosGiannakaras/Narro/pull/379) | `1c3080fbdfeae5004a0b5e98b20be86b08b72625` | **same** | [39158157890](https://github.com/MariosGiannakaras/Narro/actions/runs/39158157890), `completed/success`, 2026-10-18T19:18:23Z | **3/3 SUCCESS** exact SHA |
| [#380](https://github.com/MariosGiannakaras/Narro/pull/380) | `b2b3d6be2f1e258e8561910cbc19f163d84048b1` | **same** | [39162030233](https://github.com/MariosGiannakaras/Narro/actions/runs/39162030233), `completed/success`, 2026-10-18T20:09:39Z | **3/3 SUCCESS** exact SHA |

The authenticated generic GitHub REST repository action collection `GET https://api.github.com/repos/MariosGiannakaras/Narro/actions/runs?head_sha=<exact merge SHA>&per_page=12` returned **one matching run per merge**, with `event:push`, exact SHA and `status:completed/conclusion:success`. We then **independently queried each run's jobs**: `validation-gate`, `fast-gate`, `windows-candidate` all `completed/success`, zero failed steps. This closes these **two narrow resulting-main CI identity/results questions**; don't alter historical failed earlier candidate runs.

**Actual resulting-main CI artifacts, GitHub published metadata (not independently redownloaded ZIP bytes):**

- PR379 run39158157890: `narro-m7-physical-windows-x64` ID **12148870056**, size15672509, GitHub SHA256 `6f4720a23212d54ad37824047b19dcee3c997746fe8cc91d04be18703b7f475a`; `narro-m5-visual-regression` ID **12147799173**, GitHub SHA256 `010ba5650e6bec9067d727e12e3226deffa2568bcd988616261457fd5cf6300e`; `narro-m7-validation-windows-x64` ID12148865129; `narro-m7-focus-runtime-visual` ID12148665104; `narro-m1-diagnostic-windows-x64` ID12148467487; `narro-fast-frontend-dist` ID12147591883.
- PR380 run39162030233: `narro-m7-physical-windows-x64` ID **12149816511**, size15676197, GitHub SHA256 `258b519efc811f6c668aba127e322e3595b4dad45110ceac3b275a2746765f36`; `narro-m5-visual-regression` ID **12149885429**, GitHub SHA256 `a2f3c429e9ff7be827722d1a928e9052d74028e93fdf9d2467f42867ba334145`; `narro-m7-validation-windows-x64` ID12149303295; `narro-m7-focus-runtime-visual` ID12150190108; `narro-m1-diagnostic-windows-x64` ID12150325298; `narro-fast-frontend-dist` ID12149122763. Artifacts reported present and not expired when queried.

## Boundaries and handoff

Exact PR head CI3/3 and already recorded changed-file Git blob identity remain distinct from the **now verified resulting-main push CI3/3**. These checks prove release/build pipeline success **for those merged trees**, not actual installed Windows GUI PA, live Blitzit version parity, current personal user's installation, or M5–M9 milestone closure. Do not require an unnecessary duplicate CI solely to prove these two merge results. Keep current Codex video analysis owner and ongoing 44/100 registered CI953 media review unchanged. All M10/M11/M12 and other-owner PR344 restrictions remain. When updating canonical trackers at a safe cross-agent boundary, supersede only the two obsolete `NOT VERIFIED` CI assertions with exact links/SHAs and leave all other historical FAIL and native OPEN untouched.
