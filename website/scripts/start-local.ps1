$ErrorActionPreference = 'Stop'
$appPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$privatePath = Join-Path $appPath '.state'
$entryPath = Join-Path $appPath 'server\main.mjs'
$pidPath = Join-Path $privatePath 'server.pid'
$portNumber = if ($env:PORT) { [int]$env:PORT } else { 4177 }
$baseUrl = if ($env:PMP_ORIGIN) { $env:PMP_ORIGIN } else { "http://127.0.0.1:$portNumber" }
if ($env:NODE_ENV -eq 'production') { throw 'Use the reviewed production service manager for production.' }
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$version = & $nodePath -p 'process.versions.node'
if ($version -notmatch '^24\.' -or [version]$version -lt [version]'24.13.0') { throw 'Node.js 24.13 or newer within the 24.x release is required.' }
if (!(Test-Path -LiteralPath (Join-Path $appPath 'node_modules'))) { throw 'Install the locked dependencies with npm ci in website first.' }
New-Item -ItemType Directory -Path $privatePath -Force | Out-Null
if (Test-Path -LiteralPath $pidPath) {
  $recordedPid = [int]([IO.File]::ReadAllText($pidPath).Trim())
  $existingProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $recordedPid" -ErrorAction SilentlyContinue
  if ($existingProcess -and $existingProcess.Name -eq 'node.exe' -and $existingProcess.CommandLine.Contains($entryPath)) {
    try { $health = Invoke-RestMethod -Uri "$baseUrl/healthz" -TimeoutSec 3 } catch { throw 'The recorded application process is still running but not responding. Inspect the private server logs before restarting it.' }
    if ($health.application -ne 'PlayMusicPrompts') { throw 'The configured port does not identify this application.' }
    Write-Output "Already running: $baseUrl/index.html"
    exit 0
  }
}
$started = Start-Process -FilePath $nodePath -ArgumentList @(('"' + $entryPath + '"')) -WorkingDirectory $appPath -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $privatePath 'server.stdout.log') -RedirectStandardError (Join-Path $privatePath 'server.stderr.log')
[IO.File]::WriteAllText($pidPath, [string]$started.Id)
for ($attempt = 0; $attempt -lt 15; $attempt++) {
  Start-Sleep -Milliseconds 400
  $started.Refresh()
  if ($started.HasExited) { throw 'The application stopped during startup. Read website/.state/server.stderr.log; no existing service was stopped.' }
  try {
    $health = Invoke-RestMethod -Uri "$baseUrl/healthz" -TimeoutSec 2
    if ($health.application -eq 'PlayMusicPrompts') { Write-Output "Running: $baseUrl/index.html"; exit 0 }
  } catch { if ($attempt -eq 14) { throw 'Startup health did not respond. Inspect the private server logs.' } }
}
