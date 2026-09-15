$ErrorActionPreference = 'Stop'
$sdkPath = 'C:\Users\berke\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd'
$start = New-Object Diagnostics.ProcessStartInfo
$start.FileName = $env:ComSpec
$start.Arguments = '/d /s /c ""' + $sdkPath + '" auth print-identity-token --quiet"'
$start.UseShellExecute = $false
$start.CreateNoWindow = $true
$start.RedirectStandardOutput = $true
$start.RedirectStandardError = $true
$process = New-Object Diagnostics.Process
$process.StartInfo = $start
[void]$process.Start()
$stdout = $process.StandardOutput.ReadToEndAsync()
$stderr = $process.StandardError.ReadToEndAsync()
if (-not $process.WaitForExit(45000)) { $process.Kill(); throw 'Identity refresh timed out' }
$value = $stdout.Result.Trim()
$tokenMatches = [regex]::Matches($value, '(?m)^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\s*$')
if ($process.ExitCode -ne 0 -or $tokenMatches.Count -ne 1) {
  $reason = (($stderr.Result -split "`r?`n") | Where-Object { $_ -match 'ERROR|Error:|not recognized|cannot find' } | Select-Object -Last 1)
  $reason = [string]$reason -replace 'pmp_[A-Za-z0-9_-]+','[redacted]' -replace '[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+','[redacted]'
  throw ('Identity refresh unavailable: ' + $reason)
}
[Console]::Out.Write($tokenMatches[0].Value.Trim())
