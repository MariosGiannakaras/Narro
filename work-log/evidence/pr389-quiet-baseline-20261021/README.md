# PR389 quiet baseline — current main4786bbea

Actual source4786bbea/green resulting-mainCI39553189123 physical narro.exe SHA25608f289a556cc21065eb76ceee1fc0c27c61d626033e316f01b4017b86e55735c. Same copied paused fixture, runtime155.0.4283.62,100%DPI. Actual diagnostic setup enters compact Timer and destroys Main; unmodified native collector verifies Main HWND count0, same FocusHWND0x32033A, region340x110. CDP detached before samples. No screen recorder/preview during sampling. This setup is not pointer/UI or transition acceptance.

Unmodified run-m1-floating-performance-batch: **3/3 valid**,30s warmup+60s sampling/1s requested interval each, actual60.6–61s windows, zero process-tree churn. Median run-average CPU0.673%one core/0.056%total capacity, working set414.4MiB, private377.7MiB. These are all Narro+WebView2 descendant processes, not the whole desktop. Raw samples/CPU intervals, each native preflight and complete summaries retained. This baseline alone does not validate the candidate or establish a regression.

An initial setup using narro-m7-validation.exe was rejected by the collector's expected normal process-name precondition before any sample. Switched to the actual packaged narro.exe with identical digest; no collector edits, no result relabeling. Full validation-exe logs from that setup are included; no C5 PASS. Original personal profiles restored and DB hash identical; no owned Narro/recorder remains active.

Candidate comparison must use its exact green source package, same normal narro.exe process name/runtime/default compositor/profile and same collector parameters, after exercising the changed transition and allowing transient raster/watchdog cleanup. Three comparable runs required; keep performance acceptance OPEN until then.
