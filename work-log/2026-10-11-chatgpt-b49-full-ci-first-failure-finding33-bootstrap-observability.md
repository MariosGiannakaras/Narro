# 2026-10-11 — Exact #321 CI failed earlier Finding33 bootstrap; CDP/programming call-chain audit

## Ownership/progress

Live `main` before this checkpoint: `92ed9ab89967da777a5b73fb3ae553593454d57c`. User assigns all source/test/CI/PR/merges to ChatGPT; Codex only the intentionally paused later **physical** Windows tests. Continue the existing #321 branch `audit/20261011-b49-cdp-pixel-capture`; **10/11** post-audit source+CI PR units accepted, #321 and post-#321 Q12 still OPEN, M10 blocked, optional M11 dormant.

## Exact first causal red, not generic B49

[Run 38151014717](https://github.com/MariosGiannakaras/Narro/actions/runs/38151014717) on exact head `c7a12625797c0762ec3a8a7975007ce34963dacf`: validation **SUCCESS**, fast **SUCCESS**, Windows candidate **FAIL** at the first causal step `Capture Visual Regression Fixtures`, then `Upload Packaged Focus Runtime Visual Artifact` fails *downstream* because runtime packaging never ran. [Diagnostic ZIP 11706807006](https://github.com/MariosGiannakaras/Narro/actions/runs/38151014717/artifacts/11706807006) was downloaded and inspected; previous ordinary `task-notes-(large-)?(light|dark).html` snapshots in this **same** job were all ready and showed populated React roots. The failure is from **a separate later Edge launch** for interactive Finding33, not a regression assertion of #321's changed B49 screenshots.

Actual job lines 1395–1416:
```text
Finding33 fixture diagnostics: {
  "readyState": "interactive",
  "htmlDataset": {},
  "presentation": null,
  "activeOuterHtml": "<body>\n    <div id=\"root\"></div>\n  \n\n</body>",
  "keyTrace": []
}
Error: Timed out waiting for Finding33 large Notes fixture readiness
at scripts/test-finding33-large-notes-escape.mjs:45
```
No real Escape input was dispatched on this failed attempt. The proof is an **incomplete React startup**, not an observed Notes Escape/keyboard defect and not a demonstrated failure of B49's viewport fix. There was no captured module/network error in the old script, so the *proximate bootstrap failure mechanism remains UNKNOWN* until instrumented Windows CI.

## Detailed executable call-chain and missed instrumentation

1. GitHub Actions `windows-candidate`: locked npm/Rust and all Rust checks pass, runs `npm run test:visual-regression:windows` as one PowerShell chain.
2. `scripts/capture-visual-fixtures.ps1` starts `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`, waits only for `visual-fixtures.html` HTTP 200, then drives dozens of individual Edge `--screenshot --dump-dom` captures. Both normal and large Notes fixtures *successfully mounted* in this run.
3. Still under the same Vite preview process, `capture-visual-fixtures.ps1` calls **a new separate Node/Edge** `scripts/test-finding33-large-notes-escape.mjs` to test a real interactive keyboard Escape. Original driver checked only `fetch(pageUrl).ok` for the HTML document, then launched Edge *directly on* `task-notes-fixture.html?theme=dark&presentation=large`, then discovered debugger target, attached CDP, enabled Runtime/Page **after the initial page scripts had potentially already executed**, and polled a DOM dataset marker for 20s.
4. An HTTP 200 for HTML is insufficient: the Vite-built page dynamically requests a hashed `<script type="module" src="/assets/taskNotesFixture-….js">` and multiple modulepreloads. A missing/unserved module, JS exception, context/network cancellation, browser lifecycle issue, or renderer resource failure could leave `#root` empty. The old driver **never enabled Network/Log before navigation**, never recorded `Runtime.exceptionThrown`, and did not drain Edge's piped stderr; there was thus no authority to call this a product defect or mere flaky timing.
5. On a fully mounted page the driver's true functional requirements remain: programmatically focus the *real* production contenteditable, dispatch genuine CDP `Input.dispatchKeyEvent` Escape down/up, prove large→compact in DOM, editor node retained, capture-phase key trace includes Escape from editor in large mode, and focus restored to presentation control. These assertions were never reached on failed job. No changes to production `TaskNotes.tsx`, CSS, or JSX are warranted on existing evidence.

## Narrow CI-harness diagnostics and deterministic startup correction on original PR

Current head at this checkpoint `1d8ee1759f1f171439a44403b7d60cd81477ce58`, [new run 38152724519](https://github.com/MariosGiannakaras/Narro/actions/runs/38152724519) is **IN PROGRESS / NOT PASS**; intermediate head CI cancelled by concurrency, not accepted.

- `scripts/test-finding33-large-notes-escape.mjs`: verifies built module entry URL actually returns HTTP success (not merely the HTML document); launches headless Edge on `about:blank`, attaches its CDP listener **before navigation**; enables `Runtime`, `Page`, `Network`, `Log`, foregrounds real browser page, then performs one explicit `Page.navigate` and rejects CDP `errorText`. Records real network failed requests/status>=400, JavaScript exceptions and console errors, browser stderr; real failure preserves bounded `finding33-large-notes-escape-failure.json` with page/root/foreground/module resource state and original exception. Protects every CDP command with explicit 8s timeout and drains stderr rather than risking a full pipe. Still fails strict readiness and real keyboard assertions; **no retry, synthetic marker, disabled assertion, new product appearance or changed escape behavior**.
- `scripts/test-ui-task-notes-large.mjs`: preflight checks ordering of modules/Network/Runtime listeners **before Page.navigate** and preservation of actual `Input.dispatchKeyEvent`, focus and failure evidence.
- Main #321 B49 same-viewport correction from the previous slice is unchanged, but **not yet Windows-validated** because Finding33 halted the pipeline first.

**Validation truth:** implementation submitted to existing PR; full local Windows Edge/Rust validation **NOT RUN** from connector environment, local real Narro Chromium browser sandbox blocked `localhost`. Node/parser static checks are not counted as PASS unless actually run. GitHub first two gates/new Windows result must be inspected for exact new head before merge. Any further repair must follow the newly observable actual network/exception result, not speculate.

## Exact continuation

Inspect exact [run 38152724519](https://github.com/MariosGiannakaras/Narro/actions/runs/38152724519), confirm fast and Windows. If a new red, read first causal step/log and `finding33-large-notes-escape-failure.json` from actual run. If a real B49 visual failure occurs later, diagnose its exact contract/pixels separately; never conflate the two gates. Only after exact-head **validation/fast/windows 3/3** complete may #321 be expected-head guarded merged, followed by verification of **9/9** changed Git blobs (previously seven, this slice adds two harness/preflight paths). Then Q12 resulting-main actual production build/artifact ZIP+narro.exe+NSIS+MSI SHA256. Native/source parity and user-paused physical Codex gates remain OPEN.
