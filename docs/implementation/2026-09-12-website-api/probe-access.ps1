param([switch]$DeveloperIdentity)
$ErrorActionPreference = 'Stop'
$pmpBase = 'https://music-api-636636169989.us-central1.run.app'
$pmpSDK = 'C:/Users/berke/AppData/Local/Google/Cloud SDK/google-cloud-sdk/bin/gcloud.cmd'
$pmpSecretPath = 'C:/Users/berke/playmusicprompts-website-api-key-2026-09-12.txt'
$pmpEvidence = Join-Path $PSScriptRoot $(if($DeveloperIdentity){'live-access.json'}else{'live-access-service-account.json'})
$pmpResult = [ordered]@{ at=[DateTime]::UtcNow.ToString('o'); base=$pmpBase; identity=$(if($DeveloperIdentity){'current gcloud developer identity'}else{'website-backend@playmusicprompts.iam.gserviceaccount.com'}); token=$false; probes=@() }
try {
  $pmpStart=[Diagnostics.ProcessStartInfo]::new()
  $pmpStart.FileName=$env:ComSpec
  $pmpStart.Arguments='/d /s /c ""'+$pmpSDK+'" auth print-identity-token --impersonate-service-account=website-backend@playmusicprompts.iam.gserviceaccount.com --audiences='+$pmpBase+' --include-email --quiet"'
  if($DeveloperIdentity){$pmpStart.Arguments='/d /s /c ""'+$pmpSDK+'" auth print-identity-token --quiet"'}
  $pmpStart.UseShellExecute=$false;$pmpStart.CreateNoWindow=$true
  $pmpStart.RedirectStandardOutput=$true;$pmpStart.RedirectStandardError=$true
  $pmpProcess=[Diagnostics.Process]::new();$pmpProcess.StartInfo=$pmpStart
  [void]$pmpProcess.Start()
  $pmpStdout=$pmpProcess.StandardOutput.ReadToEndAsync();$pmpStderr=$pmpProcess.StandardError.ReadToEndAsync()
  if(!$pmpProcess.WaitForExit(45000)){$pmpProcess.Kill();throw 'IDENTITY_TIMEOUT'}
  $pmpTokenExit=$pmpProcess.ExitCode
  $pmpOutputText=$pmpStdout.Result+"`n"+$pmpStderr.Result
  $pmpProcess.Dispose()
  $pmpToken = ($pmpOutputText -split "`n" | Where-Object { $_.Trim() -match '^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$' } | Select-Object -Last 1)
  if ($pmpTokenExit -ne 0 -or !$pmpToken) {
    $pmpSafeOutput=$pmpOutputText -replace 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+','[token redacted]' -replace 'pmp_[A-Za-z0-9_-]+','[key redacted]'
    $pmpResult.identityDetail=$pmpSafeOutput.Substring(0,[Math]::Min(1200,$pmpSafeOutput.Length))
    $pmpResult.failure = if($pmpOutputText -match 'PERMISSION_DENIED|Permission.*denied|iam.serviceAccounts'){ 'impersonation_permission' } elseif($pmpOutputText -match 'reauth|login|refresh.*credentials|invalid_grant'){ 'google_login_required' } elseif($pmpOutputText -match 'connect|network|resolve'){ 'network' } else { 'identity_command_failed' }
    throw 'IDENTITY_UNAVAILABLE'
  }
  $pmpResult.token = $true
  $pmpKey = [IO.File]::ReadAllText($pmpSecretPath).Trim()
  if ($pmpKey -notmatch '^pmp_[A-Za-z0-9_-]{43}$') { throw 'KEY_FORMAT' }
  $pmpResult.keyId = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($pmpKey))).Substring(0,12).ToLowerInvariant()
  foreach ($pmpProbe in @(@{name='health';path='/health';key=$false},@{name='capabilities';path='/v1/music/capabilities';key=$true})) {
    $pmpHeaders = @{Authorization="Bearer $($pmpToken.Trim())"}
    if($pmpProbe.key){$pmpHeaders['x-api-key']=$pmpKey}
    $pmpResponse = Invoke-WebRequest -Uri ($pmpBase+$pmpProbe.path) -Headers $pmpHeaders -TimeoutSec 45 -SkipHttpErrorCheck
    $pmpEntry = [ordered]@{name=$pmpProbe.name;status=[int]$pmpResponse.StatusCode;bytes=$pmpResponse.RawContentLength}
    if($pmpResponse.StatusCode -eq 200){
      $pmpBody = $pmpResponse.Content | ConvertFrom-Json
      if($pmpProbe.name -eq 'health'){$pmpEntry.body=$pmpBody}
      else {
        # This endpoint contains capability metadata, never credential values.
        if($pmpResponse.Content.Contains($pmpKey) -or $pmpResponse.Content.Contains($pmpToken.Trim())){throw 'RESPONSE_SECRET'}
        [IO.File]::WriteAllText((Join-Path $PSScriptRoot 'live-capabilities.json'),$pmpResponse.Content)
        $pmpEntry.success=$pmpBody.success;$pmpEntry.parameterCount=@($pmpBody.parameters).Count
        $pmpEntry.topLevel=@($pmpBody.PSObject.Properties.Name)
        $pmpEntry.auth=$pmpBody.auth
      }
    }
    $pmpResult.probes+=@($pmpEntry)
  }
} catch {
  if(!$pmpResult.Contains('failure')){$pmpResult.failure=if($_.Exception.Message -in @('KEY_FORMAT','RESPONSE_SECRET')){$_.Exception.Message}else{'probe_failed'}}
  $pmpResult.exceptionType=$_.Exception.GetType().Name
  $pmpSafeMessage=$_.Exception.Message -replace 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+','[token redacted]' -replace 'pmp_[A-Za-z0-9_-]+','[key redacted]'
  if($pmpKey){$pmpSafeMessage=$pmpSafeMessage.Replace($pmpKey,'[key redacted]')}
  $pmpResult.detail=$pmpSafeMessage.Substring(0,[Math]::Min(500,$pmpSafeMessage.Length))
} finally {
  $pmpKey=$null;$pmpToken=$null;$pmpTokenOutput=$null;$pmpOutputText=$null;$pmpHeaders=$null
  $pmpJSON=$pmpResult | ConvertTo-Json -Depth 10
  [IO.File]::WriteAllText($pmpEvidence,$pmpJSON)
  Write-Output $pmpJSON
}
