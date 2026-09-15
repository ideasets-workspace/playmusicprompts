# Google Publisher Tag (GPT) — official documentation, downloaded 2026-09-05

Downloaded for W8 (banner slot on THE STREAM, Berk's item 8 web half) under the
EXTERNAL API INTEGRATIONS LAW: fetch the platform's own docs first, record source,
declared version/date, fetch date and byte size, then develop against the document.

| File | Source URL | Declared date (from the document) | Fetched (UTC) | Size |
| --- | --- | --- | --- | --- |
| gpt-reference.html | https://developers.google.com/publisher-tag/reference | "Last updated 2026-09-01 UTC" | 2026-09-05T18:19:46Z | 1,273,759 B |
| gpt-get-started.html | https://developers.google.com/publisher-tag/guides/get-started | (page carries the same footer convention; date not re-extracted) | 2026-09-05T18:19:47Z | 80,459 B |
| gpt-ad-sizes.html | https://developers.google.com/publisher-tag/guides/ad-sizes | (as above) | 2026-09-05T18:19:48Z | 92,513 B |
| gpt-ad-best-practices.html | https://developers.google.com/publisher-tag/guides/ad-best-practices | (as above) | 2026-09-05T18:19:49Z | 82,913 B |
| gpt-publisher-console.html | https://developers.google.com/publisher-tag/guides/publisher-console | (as above) | 2026-09-05T18:19:49Z | 82,839 B |
| gpt.js | https://securepubads.g.doubleclick.net/tag/js/gpt.js | (library, no date) | 2026-09-05T18:19:50Z | 126,385 B |

## What the code uses, traced to the document (read this session)

- Loader and command queue — get-started: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous">`, `window.googletag = window.googletag || { cmd: [] }`, `googletag.cmd.push(() => { … })`.
- Slot definition — get-started: `googletag.defineSlot(adUnitPath, size, divId).addService(googletag.pubads())`; `googletag.enableServices()`; `googletag.display(divId)`.
- Responsive sizes — ad-sizes: `googletag.sizeMapping().addSize([viewportW, viewportH], [[w, h], …]).build()` then `slot.defineSizeMapping(mapping)`; the guide's own example maps `[1024, 768] → [[750,200],[728,90]]` and `[640, 480] → [300,250]`.
- Privacy — reference `PrivacySettingsConfig`: `googletag.pubads().setPrivacySettings({ limitedAds, nonPersonalizedAds, restrictDataProcessing })` — `limitedAds` "Enables serving to run in limited ads mode to aid in publisher regulatory compliance needs"; `nonPersonalizedAds` likewise.
- Empty slots — reference `collapseEmptyDivs()`; render outcome — reference `events.SlotRenderEndedEvent` (`isEmpty`).

## Owner-held value

The ad unit path (`/<networkCode>/<unit>`) comes from Berk's own Ad Manager network. It is read from the
environment variable `ADS_WEB_BANNER_UNIT` on the server and served through `/api/ads/policy`; until it is
set the banner slot renders nothing and records the boundary as DECLINED `no-banner-unit` — no sample unit,
no placeholder creative (the get-started page's `/6355419/...` path is Google's demo network, not ours).
