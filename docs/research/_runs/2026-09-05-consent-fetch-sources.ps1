# =============================================================================
# fetch-consent-sources.ps1 — bulk capture of DISCOVERED primary URLs for the
# 2026-09-05 country-based consent research run (PlayMusicPrompts).
# Every URL below was returned by a search this session (R4.3: none guessed).
# Output: raw bytes to the given path; a manifest line per file with
# url | http status | bytes | sha256 | fetch time (UTC) is appended to
# docs/research/_sources/2026-09-05-consent-fetch-manifest.tsv
# =============================================================================
$ErrorActionPreference = 'Continue'
$root = 'C:\Berk\PlayMusicPrompts'
$src  = Join-Path $root 'docs\research\_sources'
$gc   = Join-Path $root 'docs\external-api\google-consent'
$manifest = Join-Path $src '2026-09-05-consent-fetch-manifest.tsv'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PlayMusicPrompts-research/1.0'

$items = @(
  # --- Google / AWS official docs -> docs/external-api/google-consent ---
  @{u='https://developers.google.com/tag-platform/security/guides/consent'; f="$gc\tag-platform-consent-mode-setup.html"},
  @{u='https://www.google.com/about/company/user-consent-policy-help/'; f="$gc\google-eu-user-consent-policy-help.html"},
  @{u='https://developers.google.com/admob/android/privacy'; f="$gc\admob-android-privacy-ump.html"},
  @{u='https://developers.google.com/admob/android/privacy/us-iab-support'; f="$gc\admob-android-privacy-us-states.html"},
  @{u='https://developers.google.com/admob/ios/privacy/us-iab-support'; f="$gc\admob-ios-privacy-us-states.html"},
  @{u='https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/adding-cloudfront-headers.html'; f="$gc\aws-cloudfront-adding-cloudfront-headers.html"},
  # --- Legal / regulator primaries -> docs/research/_sources ---
  @{u='https://www.kvkk.gov.tr/Icerik/7275/2022-229'; f="$src\2026-09-05-consent-kvkk-kurul-2022-229-tr.html"},
  @{u='https://www.kvkk.gov.tr/Icerik/7408/Summary-of-the-Board-Decision-on-the-processing-of-personal-data-by-the-data-controller-operating-in-e-commerce-sector-through-cookies-used-by-the-websites-mobile-applications-'; f="$src\2026-09-05-consent-kvkk-kurul-2022-229-en.html"},
  @{u='https://www.kvkk.gov.tr/Icerik/8710/veri-sorumlulari-tarafindan-acik-riza-ve-aydinlatma-metinlerinin-ayri-ayri-duzenlenmesi-gerektigi-hakkinda-kisisel-verileri-koruma-kurulunun-18-02-2026-tarihli-ve-2026-347-sayili-ilke-kararina-iliskin-kamuoyu-duyurusu'; f="$src\2026-09-05-consent-kvkk-ilke-karari-2026-347.html"},
  @{u='https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf'; f="$src\2026-09-05-consent-edpb-guidelines-2-2023-art53-v2.pdf"},
  @{u='https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/'; f="$src\2026-09-05-consent-ico-storage-access-consent-in-practice.html"},
  @{u='https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/online-tracking/consent-or-pay/about-this-guidance/'; f="$src\2026-09-05-consent-ico-consent-or-pay-about.html"},
  @{u='https://govt.westlaw.com/calregs/Document/I9786D7609E0F11F09EBEE9819175B1F8'; f="$src\2026-09-05-consent-ccpa-regs-7025-opt-out-preference-signals.html"},
  @{u='https://oag.ca.gov/privacy/ccpa/gpc'; f="$src\2026-09-05-consent-ca-oag-gpc.html"},
  @{u='https://arxiv.org/abs/2001.02479'; f="$src\2026-09-05-consent-nouwens-2020-arxiv-abs.html"},
  @{u='https://dspace.mit.edu/bitstream/handle/1721.1/129999.2/3313831.3376321.pdf?sequence=6'; f="$src\2026-09-05-consent-nouwens-2020-chi-mit-dspace.pdf"},
  @{u='https://www.cnil.fr/sites/cnil/files/atoms/files/full_2022-12-02_v2.pdf'; f="$src\2026-09-05-consent-cnil-2022-12-02-consent-literature-review.pdf"}
)

foreach ($it in $items) {
  $status = ''; $bytes = 0; $sha = ''
  try {
    $r = Invoke-WebRequest -Uri $it.u -OutFile $it.f -UserAgent $ua -TimeoutSec 60 -MaximumRedirection 5 -PassThru
    $status = $r.StatusCode
  } catch {
    $status = 'ERR ' + ($_.Exception.Message -replace "`t|`n|`r",' ')
  }
  if (Test-Path $it.f) {
    $bytes = (Get-Item $it.f).Length
    $sha = (Get-FileHash $it.f -Algorithm SHA256).Hash
  }
  $line = "{0}`t{1}`t{2}`t{3}`t{4}`t{5}" -f $it.u, $it.f, $status, $bytes, $sha, (Get-Date).ToUniversalTime().ToString('o')
  Add-Content -Path $manifest -Value $line -Encoding UTF8
  Write-Output $line
}
