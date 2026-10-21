# Timer compositor A/B diagnostic

Same unchanged verified PR388 EXE, isolated copied fixture, actual native desktop. A default; B process-local --disable-gpu-compositing. No global runtime/OS configuration changes.

Sequence each: visible Panel -> compact -> expanded -> compact -> Panel; normal motion. Continuous gdigrab with watchdog and actual HWND geometry; CDP on production WebView2 supplies inputs/content receipts, not OS-keyboard/drag proof. Stop capture before analysis. Preserve failed attempts and restore original profiles/hash.

Open reused gates: M7 C26-28/C35/affected C19 only if sufficiently exercised; no Timer positioning/hotkey/HDMI/performance/source-parity PASS inferred. Existing M5/M6/M8 checks are not replayed.
