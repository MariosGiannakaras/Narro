# Finding33 — CI1024 behavioral PASS, cleanup-only correction

Date: 2026-10-07

PR247 prior head: `7ed6de40cf8fa1b015dc0b27b2e21ca35b325838`  
Windows CI1024/run: `37627894300`

## Behavioral result

The new real Edge/contenteditable regression executed and printed:

`Finding33 large Notes real Edge Escape regression: PASS`

Therefore the rendered Edge DOM path proved all intended assertions:
- the production contenteditable editor owned focus;
- a real CDP Escape reached the production large Notes shell from that editor;
- presentation changed from large to compact;
- the shared editor remained mounted;
- focus returned to the presentation control.

This is a behavioral PASS for the browser/contenteditable authority. It does not erase the CI953 physical Main/Focus Escape no-op; instead it narrows the unresolved boundary toward Tauri/WebView/physical behavior.

## CI failure after PASS

The process then failed in final cleanup:
- Windows retained a transient lock on the temporary Edge profile;
- synchronous recursive removal raised `EPERM`;
- PowerShell therefore treated the otherwise-passed driver as exit code 1.

No behavioral assertion failed.

## Correction

PR247 head `8f921d7063f78a51ea4e42b0e102c96cfe8ef8e3` changes only the temporary profile cleanup to use Node recursive removal retries:

`maxRetries: 8, retryDelay: 125`

No production Notes source, CSS, persistence, resize behavior, or regression assertions changed.

Exact-head CI1025/run `37630032472` is active.

Finding33 resize remains **not established**.

Progress remains `3/10M || 0/3 | 17/18`.
