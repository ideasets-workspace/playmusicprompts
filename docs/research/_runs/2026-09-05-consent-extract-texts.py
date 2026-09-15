"""
extract-consent-texts.py — turns the captured PDFs/HTML of the 2026-09-05 consent research run
into plain-text siblings (*.txt) so that every cited number carries a file+line locator that the
parent can re-open. PDFs go through pypdf; HTML has tags stripped and whitespace normalised.
Also prints grep hits for the load-bearing terms used in the report.
"""
import glob
import html
import os
import re
import sys

from pypdf import PdfReader

SRC = r'C:\Berk\PlayMusicPrompts\docs\research\_sources'
GC = r'C:\Berk\PlayMusicPrompts\docs\external-api\google-consent'

def html_to_text(raw: str) -> str:
    raw = re.sub(r'(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>', ' ', raw)
    raw = re.sub(r'(?i)<br\s*/?>|</p>|</div>|</li>|</h\d>|</tr>|</section>|</article>', '\n', raw)
    raw = re.sub(r'(?s)<[^>]+>', ' ', raw)
    raw = html.unescape(raw)
    lines = [re.sub(r'[ \t\xa0]+', ' ', l).strip() for l in raw.splitlines()]
    return '\n'.join(l for l in lines if l)

def pdf_to_text(p: str) -> str:
    r = PdfReader(p)
    out = []
    for i, pg in enumerate(r.pages, 1):
        try:
            t = pg.extract_text() or ''
        except Exception as e:
            t = f'[[page {i} extract error {e}]]'
        out.append(f'=== PAGE {i} ===\n{t}')
    return '\n'.join(out)

targets = {
    f'{SRC}\\2026-09-05-consent-utz-2019-ccs-arxiv.pdf': 'pdf',
    f'{SRC}\\2026-09-05-consent-edpb-guidelines-2-2023-art53-v2.pdf': 'pdf',
    f'{SRC}\\2026-09-05-consent-jp-ppc-kojinkanren-2021-04-07.pdf': 'pdf',
    f'{GC}\\tag-platform-consent-mode-setup.html': 'html',
    f'{GC}\\google-eu-user-consent-policy-help.html': 'html',
    f'{GC}\\admob-android-privacy-ump.html': 'html',
    f'{GC}\\admob-ios-privacy-ump.html': 'html',
    f'{GC}\\admob-ios-privacy-idfa-att.html': 'html',
    f'{GC}\\admob-android-privacy-us-states.html': 'html',
    f'{GC}\\admob-ios-privacy-us-states.html': 'html',
    f'{GC}\\aws-cloudfront-adding-cloudfront-headers.html': 'html',
    f'{SRC}\\2026-09-05-consent-kvkk-kurul-2022-229-tr.html': 'html',
    f'{SRC}\\2026-09-05-consent-kvkk-ilke-karari-2026-347.html': 'html',
    f'{SRC}\\2026-09-05-consent-uk-duaa-2025-sch12-scheduleA1.html': 'html',
    f'{SRC}\\2026-09-05-consent-uk-duaa-2025-s112.html': 'html',
    f'{SRC}\\2026-09-05-consent-peer-spotify-cookies-policy.html': 'html',
    f'{SRC}\\2026-09-05-consent-peer-soundcloud-cookie-policy.html': 'html',
    f'{SRC}\\2026-09-05-consent-peer-suno-cookie-policy.html': 'html',
    f'{SRC}\\2026-09-05-consent-br-anpd-guia-cookies-launch.html': 'html',
    f'{SRC}\\2026-09-05-consent-au-oaic-tracking-pixels.html': 'html',
}

for p, kind in targets.items():
    if not os.path.exists(p):
        print('MISSING', p); continue
    txt = pdf_to_text(p) if kind == 'pdf' else html_to_text(open(p, 'rb').read().decode('utf-8', 'replace'))
    out = re.sub(r'\.(pdf|html)$', '.txt', p)
    open(out, 'w', encoding='utf-8').write(txt)
    print(f'{os.path.basename(out)} | {len(txt.splitlines())} lines | {os.path.getsize(out)} B')

def grep(path, pat, n=6, width=260):
    if not os.path.exists(path): print('MISSING', path); return
    rx = re.compile(pat, re.I)
    hits = 0
    for i, l in enumerate(open(path, encoding='utf-8').read().splitlines(), 1):
        if rx.search(l):
            print(f'  L{i}: {l[:width]}'); hits += 1
            if hits >= n: break

print('\n=== UTZ ==='); grep(f'{SRC}\\2026-09-05-consent-utz-2019-ccs-arxiv.txt', r'80,?000|0\.16|83\.55|nudg|Limitations|German (news )?website', 8)
print('\n=== CONSENT MODE ==='); grep(f'{GC}\\tag-platform-consent-mode-setup.txt', r"region|wait_for_update|basic|advanced|ISO 3166|ads_data_redaction|Unspecified", 12)
print('\n=== EU UCP HELP ==='); grep(f'{GC}\\google-eu-user-consent-policy-help.txt', r'31 July 2024|Switzerland|CMP Partner|certified|legally required', 8)
print('\n=== UMP ANDROID ==='); grep(f'{GC}\\admob-android-privacy-ump.txt', r'every app launch|canRequestAds|debugGeography|DebugGeography|privacyOptionsRequirementStatus|API level', 10)
print('\n=== UMP US STATES ==='); grep(f'{GC}\\admob-android-privacy-us-states.txt', r'IABGPP|GPP|2\.1\.0|TFUA|RegulatedUSState', 8)
print('\n=== IDFA ==='); grep(f'{GC}\\admob-ios-privacy-idfa-att.txt', r'NSUserTrackingUsageDescription|before requesting|ATT|denies', 8)
print('\n=== CLOUDFRONT ==='); grep(f'{GC}\\aws-cloudfront-adding-cloudfront-headers.txt', r'CloudFront-Viewer-Country|originate from the AWS network|origin request policy|ISO 3166', 8)
print('\n=== DUAA SCH A1 ==='); grep(f'{SRC}\\2026-09-05-consent-uk-duaa-2025-sch12-scheduleA1.txt', r'statistical purposes|simple means of objecting|5\.2\.2026|Appearance|emergency', 8)
print('\n=== KVKK 2022/229 ==='); grep(f'{SRC}\\2026-09-05-consent-kvkk-kurul-2022-229-tr.txt', r'opt-in|varsayılan|idari para|TL', 6)
print('\n=== KVKK 2026/347 ==='); grep(f'{SRC}\\2026-09-05-consent-kvkk-ilke-karari-2026-347.txt', r'ayrı ayrı|18\.02\.2026|2026/347|Resmi Gazete', 6)
print('\n=== EDPB 2/2023 ==='); grep(f'{SRC}\\2026-09-05-consent-edpb-guidelines-2-2023-art53-v2.txt', r'7 October 2024|IP|unique identifier|pixel', 6)
print('\n=== SPOTIFY ==='); grep(f'{SRC}\\2026-09-05-consent-peer-spotify-cookies-policy.txt', r'cookie settings|Manage|strictly necessary|optional cookies|Cookie Preferences', 6)
print('\n=== SOUNDCLOUD ==='); grep(f'{SRC}\\2026-09-05-consent-peer-soundcloud-cookie-policy.txt', r'Consent Management Platform|by default|Cookie Manager', 6)
print('\n=== SUNO ==='); grep(f'{SRC}\\2026-09-05-consent-peer-suno-cookie-policy.txt', r'Global Privacy Control|GPC|do not fire|Cookie Settings|OneTrust', 6)
print('\n=== ANPD ==='); grep(f'{SRC}\\2026-09-05-consent-br-anpd-guia-cookies-launch.txt', r'18/10|consentimento|legítimo interesse|guia', 6)
print('\n=== OAIC ==='); grep(f'{SRC}\\2026-09-05-consent-au-oaic-tracking-pixels.txt', r'express opt-in|Opt-out mechanisms|APP 8|updated', 6)
