$ErrorActionPreference = 'Stop'
$sourcePath = 'C:\Users\berke\playmusicprompts-website-api-key-2026-09-12.txt'
$secretRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\.secrets-owner'))
$targetPath = Join-Path $secretRoot 'music-key.dpapi'
$raw = [IO.File]::ReadAllText($sourcePath).Trim()
if ($raw -notmatch '^pmp_[A-Za-z0-9_-]{43}$') { throw 'Invalid handoff key format' }
New-Item -ItemType Directory -Force -Path $secretRoot | Out-Null
$identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
if ($identity -match 'CodexSandbox') { throw 'Import must run under the application owner Windows account' }
& icacls.exe $secretRoot /inheritance:r /grant:r "${identity}:(OI)(CI)F" 'SYSTEM:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Directory permission failure' }
$encrypted = ConvertFrom-SecureString (ConvertTo-SecureString $raw -AsPlainText -Force)
[IO.File]::WriteAllText($targetPath, $encrypted)
$roundtrip = ConvertTo-SecureString ([IO.File]::ReadAllText($targetPath))
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($roundtrip)
try { if ([Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) -cne $raw) { throw 'Secret roundtrip mismatch' } }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
$raw = $null
Write-Output 'DPAPI import and roundtrip verified. Source removal is a separate exact-path operation.'
