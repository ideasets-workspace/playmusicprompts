@echo off
setlocal
set "PORT=4176"
cd /d "%~dp0"
set "PMP_NODE="
for /f "delims=" %%I in ('where node 2^>nul') do if not defined PMP_NODE set "PMP_NODE=%%I"
if not defined PMP_NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "PMP_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined PMP_NODE (
  echo Node.js is needed for the local preview. Install Node.js, then open this file again.
  pause
  exit /b 1
)
echo PlayMusicPrompts - local HTML preview
echo Open http://127.0.0.1:4176 in your browser.
echo Keep this window open while using the preview. Press Ctrl+C to stop.
start "" "http://127.0.0.1:4176"
"%PMP_NODE%" server.mjs
pause
