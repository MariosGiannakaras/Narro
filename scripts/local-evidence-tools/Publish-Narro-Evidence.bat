@echo off
"C:\Users\MariosG\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -X utf8 "%~dp0Narro-Evidence-Tools\publish.py" %*
set "NARRO_PUBLISH_RESULT=%ERRORLEVEL%"
if not "%1"=="--no-pause" pause
exit /b %NARRO_PUBLISH_RESULT%
