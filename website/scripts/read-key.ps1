$ErrorActionPreference = 'Stop'
$secretPath = Join-Path $PSScriptRoot '..\.secrets-owner\music-key.dpapi'
$secret = ConvertTo-SecureString ([IO.File]::ReadAllText($secretPath))
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
try { [Console]::Out.Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
