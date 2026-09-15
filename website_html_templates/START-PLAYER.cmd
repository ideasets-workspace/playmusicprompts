@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -Command "try { $pmpResponse = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:4173/player-three.html' -TimeoutSec 2; if ($pmpResponse.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if not errorlevel 1 (
  start "" "http://127.0.0.1:4173/player-three.html"
  exit /b 0
)
set "PMP_NODE="
for /f "delims=" %%I in ('where node 2^>nul') do if not defined PMP_NODE set "PMP_NODE=%%I"
if not defined PMP_NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "PMP_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined PMP_NODE (
  echo Node.js is needed for the local preview. Install Node.js, then open this file again.
  pause
  exit /b 1
)
echo PlayMusicPrompts - The Listening Room
echo Open http://127.0.0.1:4173/player-three.html in your browser.
echo Keep this window open while listening. Press Ctrl+C to stop.
"%PMP_NODE%" server.mjs --open-player
pause
