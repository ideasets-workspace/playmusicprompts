// =============================================================================
// fetch-consent-sources.cjs — bulk capture of DISCOVERED primary URLs for the
// 2026-09-05 country-based consent research run (PlayMusicPrompts).
// Replaces the PowerShell fetcher whose Invoke-WebRequest -PassThru threw
// "Object reference not set" on every HTTPS target (recorded in the manifest).
// Every URL below was returned by a search this session (R4.3: none guessed).
// Output: raw bytes to the given path; a manifest line per file with
// url | path | http status | bytes | sha256 | fetch time (UTC) appended to
// docs/research/_sources/2026-09-05-consent-fetch-manifest.tsv
// =============================================================================
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = 'C:/Berk/PlayMusicPrompts';
const SRC = `${ROOT}/docs/research/_sources`;
const GC = `${ROOT}/docs/external-api/google-consent`;
const MANIFEST = `${SRC}/2026-09-05-consent-fetch-manifest.tsv`;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PlayMusicPrompts-research/1.0';

const items = [
  // --- Google / AWS / Apple official docs -> docs/external-api/google-consent ---
  ['https://developers.google.com/tag-platform/security/guides/consent', `${GC}/tag-platform-consent-mode-setup.html`],
  ['https://www.google.com/about/company/user-consent-policy-help/', `${GC}/google-eu-user-consent-policy-help.html`],
  ['https://developers.google.com/admob/android/privacy', `${GC}/admob-android-privacy-ump.html`],
  ['https://developers.google.com/admob/ios/privacy', `${GC}/admob-ios-privacy-ump.html`],
  ['https://developers.google.com/admob/ios/privacy/idfa', `${GC}/admob-ios-privacy-idfa-att.html`],
  ['https://developers.google.com/admob/android/privacy/us-iab-support', `${GC}/admob-android-privacy-us-states.html`],
  ['https://developers.google.com/admob/ios/privacy/us-iab-support', `${GC}/admob-ios-privacy-us-states.html`],
  ['https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/adding-cloudfront-headers.html', `${GC}/aws-cloudfront-adding-cloudfront-headers.html`],
  // --- Legal / regulator primaries -> docs/research/_sources ---
  ['https://www.kvkk.gov.tr/Icerik/7275/2022-229', `${SRC}/2026-09-05-consent-kvkk-kurul-2022-229-tr.html`],
  ['https://www.kvkk.gov.tr/Icerik/7408/Summary-of-the-Board-Decision-on-the-processing-of-personal-data-by-the-data-controller-operating-in-e-commerce-sector-through-cookies-used-by-the-websites-mobile-applications-', `${SRC}/2026-09-05-consent-kvkk-kurul-2022-229-en.html`],
  ['https://www.kvkk.gov.tr/Icerik/8710/veri-sorumlulari-tarafindan-acik-riza-ve-aydinlatma-metinlerinin-ayri-ayri-duzenlenmesi-gerektigi-hakkinda-kisisel-verileri-koruma-kurulunun-18-02-2026-tarihli-ve-2026-347-sayili-ilke-kararina-iliskin-kamuoyu-duyurusu', `${SRC}/2026-09-05-consent-kvkk-ilke-karari-2026-347.html`],
  ['https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf', `${SRC}/2026-09-05-consent-edpb-guidelines-2-2023-art53-v2.pdf`],
  ['https://www.edpb.europa.eu/system/files/documents/2023-02/edpb_03-2022_guidelines_on_deceptive_design_patterns_in_social_media_platform_interfaces_v2_en_0.pdf', `${SRC}/2026-09-05-consent-edpb-guidelines-03-2022-deceptive-design-v2.pdf`],
  ['https://eur-lex.europa.eu/eli/dir/2002/58', `${SRC}/2026-09-05-consent-eprivacy-2002-58-consolidated-eurlex.html`],
  ['https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/', `${SRC}/2026-09-05-consent-ico-storage-access-consent-in-practice.html`],
  ['https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/online-tracking/consent-or-pay/about-this-guidance/', `${SRC}/2026-09-05-consent-ico-consent-or-pay-about.html`],
  ['https://www.legislation.gov.uk/ukpga/2025/18/section/112/2026-02-05', `${SRC}/2026-09-05-consent-uk-duaa-2025-s112.html`],
  ['https://www.legislation.gov.uk/ukpga/2025/18/schedule/12', `${SRC}/2026-09-05-consent-uk-duaa-2025-sch12-scheduleA1.html`],
  ['https://www.gov.uk/government/publications/data-use-and-access-act-2025-factsheets/data-use-and-access-act-factsheet-pec-regulations', `${SRC}/2026-09-05-consent-uk-duaa-factsheet-pecr.html`],
  ['https://datenrecht.ch/wp-content/uploads/251007-EDOB-Cookie-Leitfaden-250122-vs-251007.pdf', `${SRC}/2026-09-05-consent-ch-edoeb-cookie-leitfaden-2025-10-07-redline.pdf`],
  ['https://govt.westlaw.com/calregs/Document/I9786D7609E0F11F09EBEE9819175B1F8', `${SRC}/2026-09-05-consent-ccpa-regs-7025-opt-out-preference-signals.html`],
  ['https://oag.ca.gov/privacy/ccpa/gpc', `${SRC}/2026-09-05-consent-ca-oag-gpc.html`],
  ['https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-emite-recomendacoes-para-adequacao-da-pratica-de-coleta-de-cookies-do-portal-gov.br', `${SRC}/2026-09-05-consent-br-anpd-recomendacoes-cookies-govbr.html`],
  ['https://www.gov.br/anpd/pt-br/assuntos/noticias-periodo-eleitoral/anpd-lanca-guia-orientativo-201ccookies-e-protecao-de-dados-pessoais201d', `${SRC}/2026-09-05-consent-br-anpd-guia-cookies-launch.html`],
  ['https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/organisations/tracking-pixels-and-privacy-obligations', `${SRC}/2026-09-05-consent-au-oaic-tracking-pixels.html`],
  ['https://www.ppc.go.jp/files/pdf/210407_kojinkannren.pdf', `${SRC}/2026-09-05-consent-jp-ppc-kojinkanren-2021-04-07.pdf`],
  ['https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/FAQ', `${SRC}/2026-09-05-consent-fr-cnil-cookies-faq.html`],
  ['https://www.aepd.es/guias/guia-cookies.pdf', `${SRC}/2026-09-05-consent-es-aepd-guia-cookies.pdf`],
  ['https://novidata.de/media/20211220_oh_telemedien.pdf', `${SRC}/2026-09-05-consent-de-dsk-oh-telemedien-2021.pdf`],
  ['https://www.cnil.fr/sites/cnil/files/atoms/files/full_2022-12-02_v2.pdf', `${SRC}/2026-09-05-consent-cnil-2022-12-02-consent-literature-review.pdf`],
  // --- Academic primaries ---
  ['https://arxiv.org/abs/2001.02479', `${SRC}/2026-09-05-consent-nouwens-2020-arxiv-abs.html`],
  ['https://arxiv.org/pdf/2001.02479', `${SRC}/2026-09-05-consent-nouwens-2020-arxiv.pdf`],
  ['https://arxiv.org/pdf/1909.02638', `${SRC}/2026-09-05-consent-utz-2019-ccs-arxiv.pdf`],
  ['https://petsymposium.org/2020/files/papers/issue2/popets-2020-0037.pdf', `${SRC}/2026-09-05-consent-machuletz-boehme-2020-popets.pdf`],
  ['https://doi.org/10.1145/3491102.3501985', `${SRC}/2026-09-05-consent-habib-2022-chi-doi.html`],
  ['https://www.mdpi.com/2071-1050/15/2/1231', `${SRC}/2026-09-05-consent-mdpi-2023-egov-cookie-interfaces-50-countries.html`],
  // --- Peer practice ---
  ['https://spotify.com/legal/cookies-policy/', `${SRC}/2026-09-05-consent-peer-spotify-cookies-policy.html`],
  ['https://m.soundcloud.com/pages/cookies', `${SRC}/2026-09-05-consent-peer-soundcloud-cookie-policy.html`],
  ['https://www.deezer.com/en/legal/personal-datas', `${SRC}/2026-09-05-consent-peer-deezer-personal-data.html`],
  ['https://suno.com/cookie-policy', `${SRC}/2026-09-05-consent-peer-suno-cookie-policy.html`],
];

async function fetchOne([url, file]) {
  let status = ''; let bytes = 0; let sha = '';
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 60000);
    const r = await fetch(url, { headers: { 'user-agent': UA, accept: '*/*' }, redirect: 'follow', signal: ctrl.signal });
    clearTimeout(t);
    status = String(r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, buf);
    bytes = buf.length;
    sha = crypto.createHash('sha256').update(buf).digest('hex');
  } catch (e) {
    status = 'ERR ' + String(e && e.message || e).replace(/\s+/g, ' ');
  }
  const line = [url, file, status, bytes, sha, new Date().toISOString()].join('\t');
  fs.appendFileSync(MANIFEST, line + '\n', 'utf8');
  console.log(line);
}

(async () => {
  // Sequential with small parallelism to avoid tripping rate limits on a single host.
  const queue = items.slice();
  const workers = Array.from({ length: 4 }, async () => { while (queue.length) await fetchOne(queue.shift()); });
  await Promise.all(workers);
})();
