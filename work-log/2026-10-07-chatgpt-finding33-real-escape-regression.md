# Finding33 — real Edge contenteditable Escape regression

Date: 2026-10-07

Status: **REGRESSION ACTIVE / NO PRODUCTION FIX**

PR: #247  
Branch: `test/finding33-large-notes-real-escape`  
Exact head: `7ed6de40cf8fa1b015dc0b27b2e21ca35b325838`  
Windows CI: CI1024/run `37627894300` active.

## Why this slice exists

CI953 physical evidence reproduced Escape leaving large Notes open in both Main and Focus while the contenteditable editor held real keyboard focus. Current `TaskNotes.tsx` already handles Escape on the large editor shell, so another production listener would be speculative.

The existing source/static tests and fixture-generated synthetic Escape path are not enough to distinguish a browser/contenteditable event-path failure from a Tauri/WebView/physical boundary.

## Regression design

The PR is test-only and does not alter `TaskNotes.tsx`, Notes CSS, persistence, resize behavior, or product semantics.

It:
- reuses `task-notes-fixture.html?theme=dark&presentation=large`;
- runs while the existing visual fixture preview is already active;
- launches headless Microsoft Edge through CDP;
- focuses the actual production `contenteditable` editor;
- attaches a capture-phase key trace to the production large Notes shell;
- dispatches a real browser Escape key;
- asserts that Escape reaches the shell from the focused editor;
- asserts large→compact transition;
- asserts the same editor remains mounted;
- asserts focus restoration to the presentation control;
- writes `artifacts/visual-regression/finding33-large-notes-escape.json`.

The driver is invoked only from the full Windows visual capture scope. Existing `test:ui-task-notes-large` source guards ensure the driver/wiring cannot silently disappear.

## Acceptance boundary

- PASS: rendered Edge/contenteditable Escape path is correct; the CI953 discrepancy remains outside that browser-DOM path and must be routed toward Tauri/WebView/physical validation rather than a blind `TaskNotes` patch.
- FAIL: inspect the exact key trace/presentation state and correct only the evidenced browser/runtime authority.
- Finding33 resize remains **not established** and is not part of this PR.

Progress remains `3/10M || 0/3 | 17/18`.
