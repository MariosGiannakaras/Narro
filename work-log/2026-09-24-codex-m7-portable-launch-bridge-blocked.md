# M7 item 7 — exact portable launched; Computer Use bridge still blocked

Date: 2026-09-24 (Europe/Athens)
Agent/tool: Codex / GitHub CLI, local process inspection, Computer Use attempt
Milestone/item: M7 item 7, Windows motion checkpoint
Result: exact candidate running; **Codex Computer Use Windows test NOT RUN**

The user explicitly authorized terminating the older app and running the Desktop portable build. The Desktop `narro-m1-runtime-harness-windows-x64.zip` contained `narro.exe` with SHA-256 `d0c82a2fea79d4100ae4bb398207a1b2300ead7eec68071d291b6bc8de4c1fc0`, identical to the raw executable downloaded from resulting-main CI #477, run `35907803574`, artifact `10771699056`, source SHA `36a3f6f6a1ecd5249839100e1e1249305050fa07`.

The ZIP was extracted to `E:\SystemFiles\Desktop\narro-m7-item7-main-ci477-windows-x64`. The older installed process PID 13816 was terminated; a normal termination signal did not exit its tray/background process, so the explicit user authorization was used to terminate that PID. The portable executable was launched. Final process inspection showed one `narro.exe`, PID 5180, at `E:\SystemFiles\Desktop\narro-m7-item7-main-ci477-windows-x64\narro.exe`. PID/process state is transient and must be rechecked before testing.

Computer Use was retried after the user changed Codex's setting to cmd/native Windows. The active task still executes in WSL and passes `file:///mnt/c/users/mariosg/documents/codex/2026-09-24/continue-the-narro-implementation-from-github` as `sandboxCwd` to a Windows `node_repl.exe`; the tool rejects it before JavaScript or `sky.list_windows()` runs. The local Codex configuration currently says `runCodexInWindowsSubsystemForLinux = false`, but that change did not migrate this already-running task. The same WSL/Windows bridge failure is described in open upstream Codex issues [#29639](https://github.com/openai/codex/issues/29639) and [#34458](https://github.com/openai/codex/issues/34458). No custom helper or alternative Windows UI automation was used.

No screenshots or transition repetitions were obtained. The exact executable provenance gate is now prepared, but motion, right-side placement, normal-size overflow and session continuity remain untested on this build. `TODO.md` item 7 stays open; progress remains `6/10M || 4/5 | 6/14`; item 8 stays gated. A new native Windows Codex task should verify the running process and complete five repetitions of each user-requested flow via Computer Use, labeling the result **Codex Computer Use Windows test**.
