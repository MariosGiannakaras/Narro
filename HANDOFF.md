# Handoff context

## Goal of this handoff
Provide the user with clear instructions to download and manually execute the M1 native runtime diagnostic harness, since agent environments cannot simulate Windows GUI behavior reliably.

## Completed
- Fixed 7 audit findings regarding window lifecycle edge cases and hidden states.
- Cleaned up the manual validation document (\docs/M1_WINDOWS_RUNTIME_VALIDATION.md\).
- Configured GitHub Actions to produce a downloadable Tauri installer artifact named \
arro-m1-runtime-harness-windows-x64\.
- Cleaned up CI to use \--locked\ and drop unnecessary \Cargo.lock\ re-uploading.

## Next Action Required (USER)
1. Go to the **Actions** tab of this repository.
2. Select the latest successful \Windows CI\ workflow run on \main\.
3. Scroll down and download the \
arro-m1-runtime-harness-windows-x64\ artifact.
4. Extract the zip file and run the installer (.exe or .msi) on a real Windows desktop.
5. Follow the step-by-step procedures in \docs/M1_WINDOWS_RUNTIME_VALIDATION.md\.
6. Record the PASS/FAIL results of each test.

## What Not To Do
- Do not build polished Narro UI until the native harness interactions actually pass on a real Windows machine.
- Do not check off any interactive UI/Windows \TODO.md\ item without physically validating it locally on Windows.
- Do not begin Milestone 2.
