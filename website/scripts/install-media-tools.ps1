[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Pinned Windows dependency, linked by https://ffmpeg.org/download.html.
# Verification is distributor checksum + actual executable version, not an
# independent binary/source reproducibility or vulnerability-free guarantee.
$mediaVersion = '9.0.1'
$mediaArchiveUrl = 'https://www.gyan.dev/ffmpeg/builds/packages/ffmpeg-9.0.1-essentials_build.zip'
$mediaChecksumUrl = "$mediaArchiveUrl.sha256"
$mediaExpectedSha = 'fec81ae03971d9dd4be3ebe02e263bd2ec1d789483f931bdba5f5715e65da2e9'
$mediaWebsiteRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$mediaToolsRoot = [IO.Path]::GetFullPath((Join-Path $mediaWebsiteRoot '.state/tools'))
$mediaArchivePath = Join-Path $mediaToolsRoot "ffmpeg-$mediaVersion-essentials_build.zip"
$mediaExtractRoot = Join-Path $mediaToolsRoot "gyan-$mediaVersion"
$mediaPackageRoot = Join-Path $mediaExtractRoot "ffmpeg-$mediaVersion-essentials_build"

function Assert-MediaPath([string]$MediaPath) {
    $mediaFullPath = [IO.Path]::GetFullPath($MediaPath)
    $mediaPrefix = $mediaToolsRoot.TrimEnd('\','/') + [IO.Path]::DirectorySeparatorChar
    if ($mediaFullPath -ne $mediaToolsRoot -and -not $mediaFullPath.StartsWith($mediaPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Media dependency path escapes website/.state/tools.' }
    $mediaCursor = $mediaFullPath
    while ($mediaCursor -and $mediaCursor.Length -ge $mediaWebsiteRoot.Length) {
        if (Test-Path -LiteralPath $mediaCursor) {
            $mediaItem = Get-Item -LiteralPath $mediaCursor -Force
            if ($mediaItem.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Media dependency path includes a reparse point.' }
        }
        $mediaCursor = [IO.Path]::GetDirectoryName($mediaCursor)
    }
    return $mediaFullPath
}

function Get-MediaDownload([string]$MediaUrl, [string]$MediaDestination, [long]$MediaMaxBytes) {
    $null = Assert-MediaPath $MediaDestination
    $mediaHandler = [Net.Http.HttpClientHandler]::new()
    $mediaHandler.AllowAutoRedirect = $false
    $mediaClient = [Net.Http.HttpClient]::new($mediaHandler)
    $mediaClient.Timeout = [TimeSpan]::FromMinutes(8)
    $mediaTimer = [Threading.CancellationTokenSource]::new([TimeSpan]::FromMinutes(8))
    $mediaResponse = $null
    try {
        $mediaUri = [Uri]$MediaUrl
        for ($mediaRedirect = 0; $mediaRedirect -lt 5; $mediaRedirect++) {
            if ($mediaUri.Scheme -ne 'https' -or $mediaUri.Host -ne 'www.gyan.dev' -or $mediaUri.UserInfo -or -not $mediaUri.IsDefaultPort) { throw 'Unexpected media distributor URL.' }
            $mediaResponse = $mediaClient.GetAsync($mediaUri, [Net.Http.HttpCompletionOption]::ResponseHeadersRead, $mediaTimer.Token).GetAwaiter().GetResult()
            if ([int]$mediaResponse.StatusCode -ge 300 -and [int]$mediaResponse.StatusCode -lt 400) {
                if (-not $mediaResponse.Headers.Location) { throw 'Missing dependency redirect target.' }
                $mediaUri = [Uri]::new($mediaUri, $mediaResponse.Headers.Location)
                $mediaResponse.Dispose(); $mediaResponse = $null
                continue
            }
            $mediaResponse.EnsureSuccessStatusCode() | Out-Null
            break
        }
        if (-not $mediaResponse) { throw 'Too many media dependency redirects.' }
        $mediaDeclaredSize = $mediaResponse.Content.Headers.ContentLength
        if ($null -ne $mediaDeclaredSize -and $mediaDeclaredSize -gt $MediaMaxBytes) { throw 'Dependency exceeds download size bound.' }
        $mediaInput = $mediaResponse.Content.ReadAsStreamAsync($mediaTimer.Token).GetAwaiter().GetResult()
        $mediaOutput = [IO.File]::Open($MediaDestination, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
        try {
            $mediaBuffer = [byte[]]::new(65536)
            [long]$mediaTotalBytes = 0
            while (($mediaRead = $mediaInput.ReadAsync($mediaBuffer, 0, $mediaBuffer.Length, $mediaTimer.Token).GetAwaiter().GetResult()) -gt 0) {
                $mediaTotalBytes += $mediaRead
                if ($mediaTotalBytes -gt $MediaMaxBytes) { throw 'Dependency exceeds streaming size bound.' }
                $mediaOutput.Write($mediaBuffer, 0, $mediaRead)
            }
            if ($mediaTotalBytes -eq 0 -or ($null -ne $mediaDeclaredSize -and $mediaTotalBytes -ne $mediaDeclaredSize)) { throw 'Dependency download is empty or truncated.' }
            $mediaOutput.Flush($true)
        } finally { $mediaOutput.Dispose(); $mediaInput.Dispose() }
    } finally { if ($mediaResponse) { $mediaResponse.Dispose() }; $mediaTimer.Dispose(); $mediaClient.Dispose(); $mediaHandler.Dispose() }
}

$null = Assert-MediaPath $mediaToolsRoot
$null = New-Item -ItemType Directory -Path $mediaToolsRoot -Force
$mediaChecksumPath = Join-Path $mediaToolsRoot ("checksum-" + [Guid]::NewGuid().ToString('N') + '.txt')
Get-MediaDownload $mediaChecksumUrl $mediaChecksumPath 4096
$mediaPublishedSha = (Get-Content -LiteralPath $mediaChecksumPath -Raw).Trim().ToLowerInvariant()
if ($mediaPublishedSha -ne $mediaExpectedSha) { throw 'Pinned checksum differs from the distributor checksum. Inspect the new release before changing the pin.' }

if (-not (Test-Path -LiteralPath $mediaArchivePath)) {
    $mediaPartialArchive = Join-Path $mediaToolsRoot ("download-" + [Guid]::NewGuid().ToString('N') + '.part')
    Get-MediaDownload $mediaArchiveUrl $mediaPartialArchive 157286400
    if ((Get-FileHash -LiteralPath $mediaPartialArchive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $mediaExpectedSha) { throw 'Downloaded media archive checksum mismatch.' }
    $null = Assert-MediaPath $mediaArchivePath
    Move-Item -LiteralPath $mediaPartialArchive -Destination $mediaArchivePath
}
$mediaArchiveHash = (Get-FileHash -LiteralPath $mediaArchivePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($mediaArchiveHash -ne $mediaExpectedSha) { throw 'Existing media archive checksum mismatch.' }
$mediaArchiveSize = (Get-Item -LiteralPath $mediaArchivePath).Length

Add-Type -AssemblyName System.IO.Compression.FileSystem
$mediaZip = [IO.Compression.ZipFile]::OpenRead($mediaArchivePath)
$mediaExpectedBinaryHashes = @{}
try {
    if ($mediaZip.Entries.Count -gt 2000) { throw 'Unexpected number of archive entries.' }
    [long]$mediaExpandedBytes = 0
    foreach ($mediaEntry in $mediaZip.Entries) {
        $mediaEntryName = $mediaEntry.FullName.Replace('\','/')
        if ($mediaEntryName.StartsWith('/') -or $mediaEntryName.Contains(':') -or $mediaEntryName.Split('/') -contains '..') { throw 'Unsafe archive entry path.' }
        $mediaEntryMode = ($mediaEntry.ExternalAttributes -shr 16) -band 0xF000
        if ($mediaEntryMode -eq 0xA000) { throw 'Archive contains a symbolic link.' }
        $null = Assert-MediaPath (Join-Path $mediaExtractRoot $mediaEntryName)
        $mediaExpandedBytes += $mediaEntry.Length
        if ($mediaExpandedBytes -gt 536870912) { throw 'Expanded archive exceeds the size bound.' }
        if ($mediaEntryName -in @("ffmpeg-$mediaVersion-essentials_build/bin/ffmpeg.exe", "ffmpeg-$mediaVersion-essentials_build/bin/ffprobe.exe")) {
            $mediaEntryStream = $mediaEntry.Open()
            $mediaHasher = [Security.Cryptography.SHA256]::Create()
            try { $mediaExpectedBinaryHashes[[IO.Path]::GetFileName($mediaEntryName)] = [Convert]::ToHexString($mediaHasher.ComputeHash($mediaEntryStream)).ToLowerInvariant() }
            finally { $mediaHasher.Dispose(); $mediaEntryStream.Dispose() }
        }
    }
} finally { $mediaZip.Dispose() }
if ($mediaExpectedBinaryHashes.Count -ne 2) { throw 'Pinned archive does not contain the expected executable pair.' }

if (-not (Test-Path -LiteralPath $mediaExtractRoot)) {
    $null = Assert-MediaPath $mediaExtractRoot
    [IO.Compression.ZipFile]::ExtractToDirectory($mediaArchivePath, $mediaExtractRoot)
}
$mediaFfmpegPath = Assert-MediaPath (Join-Path $mediaPackageRoot 'bin/ffmpeg.exe')
$mediaFfprobePath = Assert-MediaPath (Join-Path $mediaPackageRoot 'bin/ffprobe.exe')
$mediaFfmpegHash = (Get-FileHash -LiteralPath $mediaFfmpegPath -Algorithm SHA256).Hash.ToLowerInvariant()
$mediaFfprobeHash = (Get-FileHash -LiteralPath $mediaFfprobePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($mediaFfmpegHash -ne $mediaExpectedBinaryHashes['ffmpeg.exe'] -or $mediaFfprobeHash -ne $mediaExpectedBinaryHashes['ffprobe.exe']) { throw 'Installed media executables differ from the verified archive.' }
$mediaFfmpegVersionOutput = & $mediaFfmpegPath -version
if ($LASTEXITCODE -ne 0) { throw 'FFmpeg version execution failed.' }
$mediaFfmpegVersion = $mediaFfmpegVersionOutput[0]
$mediaFfprobeVersionOutput = & $mediaFfprobePath -version
if ($LASTEXITCODE -ne 0) { throw 'FFprobe version execution failed.' }
$mediaFfprobeVersion = $mediaFfprobeVersionOutput[0]
if ($mediaFfmpegVersion -notmatch '^ffmpeg version 9\.0\.1(?:-|\s)' -or $mediaFfprobeVersion -notmatch '^ffprobe version 9\.0\.1(?:-|\s)') { throw 'Executable versions do not match the pinned release.' }

$mediaEvidence = [ordered]@{
    checkedAt = [DateTime]::UtcNow.ToString('o')
    ffmpegDownloadIndex = 'https://ffmpeg.org/download.html'
    distributorPage = 'https://www.gyan.dev/ffmpeg/builds/'
    archiveUrl = $mediaArchiveUrl
    checksumUrl = $mediaChecksumUrl
    version = $mediaVersion
    archiveSha256 = $mediaArchiveHash
    publishedSha256 = $mediaPublishedSha
    archiveSizeBytes = $mediaArchiveSize
    expandedSizeBytes = $mediaExpandedBytes
    ffmpeg = @{ path = $mediaFfmpegPath; version = $mediaFfmpegVersion; sha256 = $mediaFfmpegHash; matchesVerifiedArchive = $true }
    ffprobe = @{ path = $mediaFfprobePath; version = $mediaFfprobeVersion; sha256 = $mediaFfprobeHash; matchesVerifiedArchive = $true }
    verificationBoundary = 'HTTPS distributor checksum and actual executable versions verified; not independently reproducible-build, upstream PGP binary-signature or vulnerability-free proof.'
}
$mediaEvidencePath = Assert-MediaPath (Join-Path $mediaToolsRoot "ffmpeg-$mediaVersion-verification.json")
[IO.File]::WriteAllText($mediaEvidencePath, ($mediaEvidence | ConvertTo-Json -Depth 10), [Text.UTF8Encoding]::new($false))

# Merge only the two executable paths. Preserve every other existing setting.
$mediaConfigPath = Join-Path $mediaWebsiteRoot '.state/runtime.local.json'
$mediaConfig = if (Test-Path -LiteralPath $mediaConfigPath) { Get-Content -LiteralPath $mediaConfigPath -Raw | ConvertFrom-Json -AsHashtable } else { @{} }
$mediaConfig['ffmpegPath'] = $mediaFfmpegPath
$mediaConfig['ffprobePath'] = $mediaFfprobePath
$mediaConfigTemp = Join-Path $mediaWebsiteRoot ('.state/runtime.local.' + [Guid]::NewGuid().ToString('N') + '.tmp')
[IO.File]::WriteAllText($mediaConfigTemp, ($mediaConfig | ConvertTo-Json -Depth 50), [Text.UTF8Encoding]::new($false))
[IO.File]::Move($mediaConfigTemp, $mediaConfigPath, $true)

$mediaEvidence | ConvertTo-Json -Depth 10
