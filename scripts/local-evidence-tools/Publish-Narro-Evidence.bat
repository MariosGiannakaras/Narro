@echo off
set "NARRO_PUBLISH_SCRIPT=%~dp0Narro-Evidence-Tools\publish.py"
if not exist "%NARRO_PUBLISH_SCRIPT%" set "NARRO_PUBLISH_SCRIPT=%~dp0publish.py"
"C:\Users\MariosG\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -X utf8 "%NARRO_PUBLISH_SCRIPT%" %*
set "NARRO_PUBLISH_RESULT=%ERRORLEVEL%"
if not "%1"=="--no-pause" pause
exit /b %NARRO_PUBLISH_RESULT%
