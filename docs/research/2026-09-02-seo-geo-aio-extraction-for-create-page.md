# SEO/GEO/AEO/AIO extraction for the /create page (recovered from subagent fabe03b7, 2026-09-02)

Sources read in full by the subagent: GeoMagics AEO evidence 2026-08-29; AIO engine surfaces & crawler contracts 2026-08-09; SEO frontier 2026-07-10; AIO engine source selection mechanics 2026-08-12.

All four files were read from disk in full this session (file 4, 148,935 chars, was read in three contiguous segments: lines 1–350, 350–598, 598–end). One limit up front: `c:\Berk\PlayMusicPrompts\.cursor\rules\berk-rank0.mdc`, named by CLAUDE.md as the governing law, does not exist at that path (measured: read returned "File not found"). Nothing below depends on it.

---

# PlayMusicPrompts — SEO / GEO / AEO / AIO extraction from Berk's four research files

**Source legend (absolute paths, used in every citation below):**

- **F1** = `C:\Berk\GeoMagics\docs\AEO\2026-08-29-aeo-geo-optimization-evidence.md`
- **F2** = `C:\Berk\GeoMagics\docs\research\apis\2026-08-09-aio-engine-surfaces-and-crawler-contracts.md`
- **F3** = `C:\Berk\GeoMagics\docs\number-one-program\research\2026-07-10-seo-frontier-for-number-one.md`
- **F4** = `C:\Berk\GeoMagics\docs\research\sota\2026-08-12-aio-engine-source-selection-mechanics.md`

Evidence labels are carried verbatim from the files: `[3+ verified]`, `[single-source official]`, `[UNVERIFIED]`, `SPLIT`, `CONTRADICTED`, etc. Anything I add that the files do not contain is marked **[NOT IN CORPUS]**.

**Governing frame the corpus imposes on the whole checklist:** F1 › "Executive decision" orders the work as four layers — (1) Eligibility, (2) Canonical truth, (3) Evidence/source influence, (4) Measurement — and says the automatable, highest-confidence work is eligibility and canonical accuracy, while content rewrites are "human-approved hypotheses" whose live-citation effect is engine-dependent. F4 › "Contradictions, corrections and gaps" C-01 adds: Google and Microsoft publish opposing tier-A guidance on chunking, schema, Q&A and writing-for-AI, so "a unified 'AI SEO checklist' is a product defect." The checklist below therefore names the engine scope of each item.

---

## A) Prioritized implementation checklist — single static product page (`/create`)

### P0 — Eligibility (crawl, index, snippet, access)

**1. `robots.txt` at the origin root, returning HTTP 200, with explicit per-purpose bot policy.**
- Artifact: a `robots.txt` on `www.playmusicprompts.com` (and, until it is retired, on the CloudFront host) that:
  - `Allow: /` for search/answer-surfacing agents: `Googlebot`, `Bingbot`, `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot` (see §B for the ALLOW list and rationale).
  - Makes an explicit owner decision on training crawlers (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `meta-externalagent`, `Applebot-Extended`). Blocking them does **not** block search/answer inclusion (see item 2 for the one exception — `Google-Extended` also scopes Gemini grounding).
  - Never returns 5xx: RFC 9309 treats a 5xx on `robots.txt` as **disallow-all**, and a 4xx as **allow-all**; token match is case-insensitive; longest matching rule wins; file ≤ 500 KiB; ≤ 5 redirect hops; cached up to 24 h.
- Source: F2 › "Angle 8 — Cross-cutting standards (RFC 9309, …)" (five mechanics, S29 `[FULL]`); F2 › "Synthesis — adopt / build / avoid › AVOID" ("Do not treat a robots.txt 4xx as … a 5xx as 'temporarily broken'"); F1 › "Intervention evidence matrix" row "Separate crawler-purpose controls" (Level A, `[3+ verified]`); F1 › "Rejected myths and tactics" row "Block the training bot to block search" (Reject).

**2. Decide `Google-Extended` deliberately — it is not a Search control, but it does scope Gemini grounding.**
- Artifact: a `User-agent: Google-Extended` block in `robots.txt` (it is a robots-only token; **no HTTP User-Agent string exists for it**, so it never appears in logs). For a page that wants to be cited in the Gemini app, **do not disallow it**. It has no effect on Google Search inclusion or AI Overviews.
- Source: F2 › "Angle 4 — Google" ("`Google-Extended`: a standalone robots.txt-only control token — no HTTP User-Agent string exists for it … scopes Gemini training + grounding-corpus inclusion and explicitly does not affect Search inclusion or ranking"); F2 › "Outcome first" item 4 ("scoped to Gemini training + grounding, NOT to AI Overviews"); F1 › "Platform controls and boundaries" row "Google `Google-Extended`".

**3. CDN/WAF must not challenge or deny AI search crawlers; verify against published IP lists, not only UA strings.**
- Artifact: CloudFront/WAF allow rules for the published IP ranges of `OAI-SearchBot`, `PerplexityBot`/`Perplexity-User`, Anthropic bots (`https://claude.com/crawling/bots.json`, 20 IPv4 prefixes as of 2026-05-01), Google (`common-crawlers.json` + rDNS); Bing verified via reverse→forward DNS to `search.msn.com` (Bing publishes no IP list). No bot-challenge pages (the corpus itself records `help.openai.com` being unreadable behind a Cloudflare challenge — the same failure mode applied to your page would make it invisible).
- Source: F2 › "Angle 1 — OpenAI" (per-bot IP JSON endpoints); F2 › "Angle 2 — Anthropic bots" (bots.json, 20 prefixes); F2 › "Angle 3 — Perplexity" ("WAF guidance recommends checking the published IP ranges in addition to the UA string"); F2 › "Contradictions, gaps, and blind spots" item 2 (Bing DNS verification); F4 › "G3 — OpenAI" ("ensure your site host and/or content delivery network allows traffic from our published IP addresses", `[PARTIAL — primary-URL capture]`); F1 › "Intervention evidence matrix" row "Crawl, index, and snippet eligibility audit" ("no accidental WAF denial").
- Risk note: F2 › "Angle 7" — Cloudflare will default-block `Training` and `Agent` bots on ad-bearing pages for new domains from 2026-09-15. Not applicable while on CloudFront; becomes applicable if the domain is ever fronted by Cloudflare.

**4. One canonical URL; the CloudFront hostname must not remain an indexable duplicate.**
- Artifact: `<link rel="canonical" href="https://www.playmusicprompts.com/create">` on the page; 301 from `d28uu9ks0hpij4.cloudfront.net/*` to the custom domain once live (or at minimum canonical pointing at the custom domain). The corpus names "working canonical URLs" and "canonical/redirect" checks as P0 eligibility diagnostics; it does not specify the tag syntax (tag syntax is a web standard, **[NOT IN CORPUS]**).
- Source: F1 › "Intervention evidence matrix" row "Crawl, index, and snippet eligibility audit" (prerequisites: "working canonical URLs … canonical/redirect"); F1 › "Causal test design" step 2 ("crawlable, indexable, canonical").

**5. Indexable and snippet-eligible: no `noindex`, no `nosnippet`, no `max-snippet:0`, no `data-nosnippet` on answer content, no `NOARCHIVE`/`NOCACHE`.**
- Artifact: audit of `<meta name="robots">` and `X-Robots-Tag` (and the whole `<body>` — Google processes robots meta found outside `<head>`). Google's eligibility gate for AI Overviews/AI Mode is exactly "indexed and eligible to be shown in Google Search with a snippet"; the snippet controls are the documented way to *limit* AI use, so leaving them off is the affirmative action. Bing: `data-nosnippet` excludes sections from AI summaries; `NOARCHIVE`/`NOCACHE` semantics extend to Copilot/Bing Chat.
- Source: F4 › "G1 — Google" rows "Index dependence + snippet eligibility (the hard gate)" and "Snippet/quotation limitation" (S-01/S-02 `[FULL]`); F3 › "1. What changed in Google Search, March–July 2026" ("Mar 24, 2026 — Google processes robots meta tags found outside `<head>`"); F1 › "Platform controls and boundaries" row "Preview controls"; F1 › "Unique official platform behaviors" S05 (Bing `data-nosnippet`); F2 › "Angle 5" (NOARCHIVE/NOCACHE for Copilot).

**6. Google Search Console: verify the property and confirm the "Search generative AI" control is Include (default).**
- Artifact: GSC property for `www.playmusicprompts.com`; check the Search generative AI control state. The newer Google guide adds this as a second eligibility condition beyond Search technical requirements; propagation 1–2 days. Also enables the Generative AI performance report (impressions in AI Overviews/AI Mode; **no clicks; not in the API**).
- Source: F4 › "G1 — Google" rows "Index dependence…" ("a site must be included in Search generative AI features in Search Console to be eligible") and "The exclusion control"; F4 › "Contradictions…" C-02 (both pages must be checked; feature-detect); F3 › "1. … Search Console — the AI reporting shift" (report launched 2026-06-03; no AIO clicks; not in Search Analytics API); F2 › "SUPERSESSION NOTES — 2026-08-12" (contradiction resolved).

**7. All answer content in the initial HTML — not injected by JavaScript, not in tabs/accordions, not only in images, not in PDFs.**
- Artifact: the answer blocks, product facts, pricing and how-to text present in server-delivered HTML; any collapsible UI must still ship the text in the DOM; alt text on images carrying facts. Google: content processed in JS "as long as it isn't blocked" but "more complex"; Microsoft: "Don't hide important answers in tabs or expandable menus: AI systems may not render hidden content"; F3 relays a prior finding that no major AI crawler executes JS (relayed, not re-verified in these files).
- Source: F4 › "THE FOLKLORE GRADING TABLE" F-18 (CONTRADICTED — the risk is real; two owners) and F-19 (Google on JavaScript); F4 › "G2.b Publisher-side mechanics" row "Named anti-patterns"; F3 › "2.1 Rendering parity" ("no major AI crawler executes JS (Vercel/MERJ, 500M fetches)" — cited by F3 from a prior doc not in this corpus).

**8. Keep the HTML payload small; Googlebot has a documented fetch cap.**
- Artifact: page HTML well under 15 MB (trivial for this page; check no inlined base64 audio/images). 
- Source: F2 › "Angle 4 — Google" ("a 15 MB fetch limit, ETag caching", S11 `[FULL]`); F3 › "1." ("Feb 3, 2026 — Googlebot file-size limit precision updated … content beyond the byte cap is not processed").

**9. XML sitemap with a truthful `lastmod`; IndexNow to Bing on real changes.**
- Artifact: `/sitemap.xml` listing `/create` (and any other real URLs) with `lastmod` updated **only on substantive edits**; `robots.txt` `Sitemap:` line; IndexNow key file + POST on change (HTTP 200 = "received", not indexed; 202 = key pending; 10,000 URLs/POST). Bing names IndexNow as the mechanism that "helps ensure that AI systems reference the most current version of a page."
- Source: F1 › "Intervention evidence matrix" row "Genuine substantive freshness" (Level A; "Changing dates without substantive edits is not a freshness lever"); F1 › source register O23/O24; F2 › "Angle 5 — Microsoft Copilot + Bing + IndexNow" (status semantics; "change-propagation telemetry, never a ranking tactic"); F4 › "G2.b" row "Freshness mechanism (an actual publisher lever)"; F4 › "Synthesis › ADOPT" AD-5.

**10. Bing Webmaster Tools: verify and use the AI Performance report + "grounding queries".**
- Artifact: BWT property; read Total Citations / cited pages / grounding-queries sample. Microsoft states these counts are **not** rank, authority, or placement. This is the only first-party window onto fan-out query text on any engine. Bing also powers ChatGPT search/Copilot surfaces per F3.
- Source: F4 › "G2.b" rows "Grounding query ≠ user query" and "What the citation metric is NOT" (S-07 `[FULL]`); F4 › "Synthesis › ADOPT" AD-4; F1 › "Platform controls and boundaries" row "Bing AI Performance"; F3 › "4.2" ("Bing powers ChatGPT search + Copilot").

### P0 — Canonical truth (facts and structured data)

**11. A single canonical fact set, and identical facts everywhere on the page and in markup.**
- Artifact: one internal registry (name "PlayMusicPrompts", aliases, logo, founder/owner, contact, product description, price/availability ("free", "no login"), policies, output format/duration/limits) and a check that visible copy, `<title>`, meta description, OG tags and JSON-LD all agree. Google's stated AI-features best practice: "structured data matches the visible text on the page." Microsoft: "Reduce ambiguity across formats: align text, images, and video so they consistently represent the same entities."
- Source: F1 › "Intervention evidence matrix" row "Canonical brand fact registry" (P0; the field list); F4 › "G1 — Google" row "Source-quality signals"; F4 › "FOLKLORE…" F-10 (entity consistency SUPPORTED; "strongest-mechanism lever in the table"; Wikidata-specific claim UNTESTED).

**12. JSON-LD: `Organization` + a product-type entity, accurate, visible-content-matching, validated — expectation: understanding/rich-result eligibility, NOT an AI-citation lever.**
- Artifact: `<script type="application/ld+json">` with `@type: Organization` (name, url, logo, `sameAs` to real profiles, contact) and the product entity. The corpus supports `Organization` and `Product` as the vocabulary (Schema.org O26: "unambiguous identity, no ranking claim") and Microsoft names FAQ/HowTo/Product/Review/Article. **The corpus does not enumerate required properties per type** — any specific property list beyond name/url/logo/sameAs/price/availability is **[NOT IN CORPUS]**. Whether `SoftwareApplication`/`WebApplication` is the better type for a web tool is **[NOT IN CORPUS]**. Google: "there's no special schema.org markup you need to add"; label the AI-visibility effect `[UNVERIFIED]`.
- Source: F1 › "Intervention evidence matrix" row "Accurate visible structured data" (Level A for understanding; "No special 'AI schema'"; treatment: "label AI visibility effect `[UNVERIFIED]`"); F1 › "Claims triangulated…" C04; F1 › "Material unresolved claims" U02; F4 › "FOLKLORE…" F-02 (SPLIT: Google not required / Microsoft "structured data that machines can interpret with confidence"); F4 › "G1" mythbusting quote "Overfocusing on structured data".

**13. If an FAQ block is used: real questions, real answers, no expectation of a rich result, no expectation of citation lift.**
- Artifact: optionally `FAQPage` JSON-LD mirroring a visible Q&A section. FAQ rich results were removed May 7, 2026 (docs removed June 15, 2026). The only study that measured Q&A formatting found the opposite sign for absorption (−5.74% in F1's A4 summary; "Q&A format shows the opposite direction" in F4's A6). Microsoft says assistants "can often lift these pairs word for word" — a liftability claim, not an influence claim. Do **not** convert the page into Q&A.
- Source: F3 › "1." ("FAQ rich result fully killed … FAQPage schema no longer yields a SERP rich result"); F1 › "A4 — Zhang, He, and Yao" (genre: Q&A −5.74%); F1 › "Rejected myths" row "Convert all pages to FAQ/Q&A…"; F4 › "FOLKLORE…" F-05 (CONTRADICTED as an absorption lever · SPLIT as advice); F4 › "Contradictions…" C-06.

**14. Genuine publication/updated dates, visible and structured, all agreeing.**
- Artifact: a visible "Published / Last updated" line plus `datePublished`/`dateModified` in JSON-LD and the sitemap `lastmod`, all the same real date, changed only on substantive edits. F3's leak table notes Google extracts three dates (`bylineDate` / `syntacticDate` / `semanticDate`) — mismatch = "freshness confusion." Cosmetic date bumps are explicitly rejected.
- Source: F1 › source register O13 ("Byline and publication dates — genuine dates and consistency"); F1 › "Contradictions preserved" item 4 (Freshness: "substantive updates only; block cosmetic date changes"); F1 › "Rejected myths" row "Change the displayed date to look fresh"; F3 › "1.1 … Named signals" row "bylineDate / syntacticDate / semanticDate"; F4 › "FOLKLORE…" F-09 (visible-date form UNTESTED).

**15. E-E-A-T surface: real author/owner, real contact, real editorial/ownership statement — for transparency, with AI-citation lift marked `[UNVERIFIED]`.**
- Artifact: an "About / Who built this" block naming the actual maker, a working contact, and a plain statement of how outputs are generated (first-hand experience with the product). No invented experts or credentials.
- Source: F1 › "Intervention evidence matrix" row "Authorship, expertise, review, and sourcing" (Level A for quality, D for AI citation causality; "no invented experts"); F1 › "Material unresolved claims" U05; F1 › source register O12 (Google "Helpful, reliable, people-first content"); F1 › "Rejected myths" row "Authorship/bylines guarantee citations" (`[UNVERIFIED]`).

### P1 — Content shape (human-approved hypotheses; engine-scoped)

**16. Answer-first, self-contained passages at the top of every section.**
- Artifact: the first 1–2 sentences under each heading must fully answer the heading's question with the entity named (e.g., "PlayMusicPrompts turns a text prompt into an AI-generated music track in the browser; no account is required."). Microsoft's stated eligibility properties: "one- to two-sentence responses" and "self-contained phrasing: sentences that make sense even when pulled out of context." This is the one content property supported from four directions (Microsoft tier A; Power of Noise near-query answer-bearingness; A6 "reusable support units"; GEO's quotation/statistic units). **Do not adopt a word count** ("40–60 words", "under 180 words per section") — tier C only.
- Source: F4 › "G2.b" row "Snippability"; F4 › "FOLKLORE…" F-17 (SUPPORTED as a property · UNTESTED as a word count); F4 › "Stage 3 — Reranking, chunking, and context allocation" (last paragraph); F4 › "Synthesis › ADOPT" AD-9; F1 › "Intervention evidence matrix" row "Evidence-rich answer passages" ("answer-first summary, definitions, comparisons, methods, caveats, authentic evidence").

**17. Headings as "chapter titles"; question-shaped H2s allowed but not multiplied.**
- Artifact: descriptive H2/H3s that name the slice of content (Microsoft's worked replacement: "Learn More" → "What Makes This Dishwasher Quieter Than Most Models?"). Google endorses headings for humans and disclaims writing for the machine. **Do not** create a heading/section per imaginable query variant — Google names targeting fan-out queries at scale as a scaled-content-abuse spam violation.
- Source: F4 › "FOLKLORE…" F-04 (SPLIT) and F-15 (fan-out farming "violates Google's scaled content abuse spam policy"); F4 › "G1" anti-fan-out clause; F4 › "G2.b" row "Structure recommendations".

**18. Non-commodity content: original, first-hand material that a competitor cannot copy.**
- Artifact: real example prompts with their real generated outputs (embedded audio + transcript/description in text), observed generation times, model/parameter facts, honest limitations. Google's worked contrast: "'7 Tips for First-Time Homebuyers'" (commodity) vs "'Why We Waived the Inspection…'" (non-commodity). F3's Information-Gain patent frames the same thing algorithmically: score = information beyond what the user's previously viewed documents contain.
- Source: F4 › "G1 — Google" row "Source-quality signals" (S-02 `[FULL]`); F3 › "1." ("May 15, 2026 — new AI-optimization guide … 'non-commodity content'"); F3 › "3.1 Information Gain" (patent US20200349181A1, PROVEN).

**19. Evidence genres that measured higher influence: definitions, numbers, comparisons, how-to steps (and code, if relevant).**
- Artifact: a definition block ("What is a music prompt?"), a numbers block (track length, formats, generation time — real measurements), a comparison table (prompt styles → outcomes; or vs. manual composition), a numbered how-to. Observational genre deltas: code +76.88%, numbers +61.55%, definitions +57.33%, comparison +55.28%, how-to +41.20%, Q&A −5.74%. Not causal; the study is quarantined for numbers in F4.
- Source: F1 › "A4 — Zhang, He, and Yao, Citation Selection to Citation Absorption" (genre differences; limitations: "influence score is constructed"); F4

- Source (cont.): F4 › "A6 — Zhang, He, Yao" (quarantined; "definitions/statistics/comparisons/procedures create 'reusable support units'"); F1 › "Intervention evidence matrix" row "Evidence-rich answer passages" (Level B, human-approved P1).

**20. Authentic statistics, quotations and outbound citations to primaries — favourable for a new/low-ranked site, harmful for an incumbent.**
- Artifact: real measured numbers (with method), real quotations (e.g., from the model provider's documentation), and outbound links to the primary sources the page relies on. GEO Table 2: Cite Sources −30.3 (top-ranked bucket) → +115.1 (lowest); Quotation −22.9 → +99.7; Statistics −20.6 → +97.9. PlayMusicPrompts is a new site, so the measured sign is positive — but the metric is a within-answer share on a simulated engine, not selection probability. Fabricated evidence is rejected outright.
- Source: F4 › "A1 — Aggarwal et al." Table 2 and "(5) Concrete application" (incumbency condition); F4 › "FOLKLORE…" F-06/F-07/F-08; F1 › "A1 — Aggarwal et al." (30–40% position-adjusted gains; keyword stuffing ~10% worse on Perplexity); F1 › "Rejected myths" row "Add citations, numbers, or quotations whether or not real"; F4 › "G2.b" ("anchor claims in measurable facts", "42 dB dishwasher").

**21. Complete product facts on-page: price, specifications, evidence, deep coverage, query-term match.**
- Artifact: an explicit spec block — price ("Free"), login requirement ("None"), input (prompt length limits), output (format, duration, sample rate if real), supported genres/languages, generation time, usage rights. In the controlled two-document citation study, price inclusion, specifications, evidence, deep coverage and query-term matching were significant in ≥4 of 6 models (odds ratios wide/unstable — direction only).
- Source: F1 › "A3 — Vishwakarma, Kumar, and Jamidar, What Gets Cited" (factors; "Extreme odds ratios … make magnitude transfer unsafe"); F1 › "Claims triangulated…" C09.

**22. Lists and tables as reusable segments; no walls of text; no decorative symbols; sparing em dashes.**
- Artifact: bullet/numbered lists for steps and features, an HTML `<table>` for specs/comparison, short paragraphs; remove decorative arrows/glyphs from copy. Microsoft (tier A) recommends these; the AI-ranking effect is `[UNVERIFIED]` per F1 — adopt as UX/extractability quality.
- Source: F4 › "G2.b" rows "Structure recommendations" and "Named anti-patterns" ("Be cautious with em dashes"); F1 › "Intervention evidence matrix" row "Clear headings, tables, and concise sections" (`[UNVERIFIED]` for ranking); F1 › "Material unresolved claims" U03.

**23. Depth signal (observational only): high-influence pages were long and heavily structured.**
- Artifact: enough real content to cover the topic — top vs bottom influence quartiles averaged 1,943 vs 170 words, 10.59 vs 0.85 headings, 47.49 vs 8.34 paragraphs. Google: "There's no ideal page length." Treat as a correlation, not a target; never pad.
- Source: F1 › "A4 — Zhang, He, and Yao" (quartile figures); F4 › "G1" mythbusting ("There's no ideal page length"); F1 › "Contradictions preserved" item 3 (Structure).

**24. Brand-entity clarity: the name "PlayMusicPrompts" used identically everywhere; product named in the first sentence.**
- Artifact: exact same brand string in `<title>`, H1, first paragraph, OG tags, JSON-LD `name`, footer, and any external profiles (`sameAs`). In the EMNLP 2024 study, "GPT-4 Turbo and Llama 3 are heavily influenced by their latent knowledge of product names" — the entity outweighed page text and position.
- Source: F4 › "A5 — Pfrommer et al." result and "(5)(c)"; F4 › "FOLKLORE…" F-10.

**25. Title and meta description: title matches the target query phrasing; no keyword stuffing; no long-tail variant farming.**
- Artifact: `<title>` beginning with the entity + primary intent (leak signals `titlematchScore`, `numTokens` truncation cap); meta description plain and factual. Keyword stuffing was the worst GEO method (17.8, below baseline) and Google says you need not "capture every variation."
- Source: F3 › "1.1 … Named signals" row "titlematchScore / avgTermWeight / numTokens"; F4 › "FOLKLORE…" F-13 (CONTRADICTED, twice); F4 › "G2.b" ("Avoid keyword stuffing" in descriptions).

**26. `og:image` and image metadata for preferred-image selection; alt text carrying facts.**
- Artifact: `<meta property="og:image">` pointing at a real, representative image; descriptive alt text; no fact that exists only in an image.
- Source: F3 › "1." ("Mar 2, 2026 — image-SEO best practices now recommend `og:image` + metadata"); F4 › "FOLKLORE…" F-18 ("Avoid putting key information only in images").

**27. Semantic HTML + ARIA for agent browsers (Atlas, Google browser agents).**
- Artifact: `<main>`, `<nav>`, `<form>` with a `<label>`-ed prompt `<textarea>`, a real `<button>` (not a styled `<div>`), `aria-label`s where visual-only, sensible heading order. OpenAI Atlas "uses ARIA tags … to interpret page structure" (`[PARTIAL — primary-URL capture]`); Google's agents inspect "the DOM structure" and "the accessibility tree."
- Source: F2 › "Angle 1 — OpenAI" (ARIA sentence, status `[3P, primary unreachable]` → upgraded to `[PARTIAL — primary-URL capture]` in F2 › "SUPERSESSION NOTES"); F4 › "G1" row "Agentic surface (2026 addition)".

**28. Performance: field INP p75 ≤ 200 ms (good; > 500 ms poor). Other CWV thresholds are outside this corpus.**
- Artifact: INP measured in the field (web-vitals attribution build / LoAF) — the generate-button handler and any audio player must not block the main thread. LCP/CLS numeric thresholds: **[NOT IN CORPUS]** — F3 explicitly defers "CWV thresholds" to a prior document not among the four.
- Source: F3 › "2.2 INP field-attribution to specific scripts (LoAF)" ("p75 thresholds 200ms good / 500ms poor"); F3 header note ("does not re-derive … CWV thresholds").

**29. `hreflang` — only if a second language version exists.**
- Artifact: none while the page is English-only. If a Turkish page is added: separate URL, native-language copy, reciprocal `hreflang` (return-tag reciprocity), `x-default`. Translation alone does not guarantee parity.
- Source: F1 › "Intervention evidence matrix" row "English/Turkish localization and local sources" (Level A/C; reciprocal hreflang); F1 › "Claims triangulated…" C08; F3 › "2.6 hreflang at scale" (return-tag reciprocity). `x-default` specifically: **[NOT IN CORPUS]**.

**30. `llms.txt` — optional, zero expected effect; do not spend effort beyond a minimal file.**
- Artifact: at most a short `/llms.txt` with the page's canonical URL and one-paragraph description. Google Search "doesn't use" it (verbatim, June 2026). No tier-A confirmation or denial from OpenAI/Anthropic/Perplexity/Microsoft/xAI. F1 puts it at P3 "off by default"; the only reason to ship one is that it is cheap and harmless.
- Source: F1 › "Intervention evidence matrix" row "`llms.txt`" and "Unique official platform behaviors" S01; F2 › "Angle 4" (verbatim Google sentence; Lighthouse 13.3 audit divergence); F3 › "1." (June 15, 2026); F4 › "FOLKLORE…" F-01 (CONTRADICTED for Google · UNTESTED-FOLKLORE elsewhere).

**31. Spam-policy hygiene specific to 2026.**
- Artifact: no `history.pushState` back-button trapping; no hidden text or prompt-injection strings; no scaled query-variant pages; no cosmetic date changes; no fabricated stats/reviews. Spam policies now explicitly apply to generative-AI responses in Google Search.
- Source: F3 › "1." ("Apr 13, 2026 — back-button hijacking"; "Spam policies explicitly extended to apply to generative-AI responses"); F4 › "A5 — Pfrommer et al." (injection is a boundary, not a lever); F1 › "Rejected myths and tactics" (full table).

**32. Measurement stance for the page (so no one later claims "it worked" without evidence).**
- Artifact: GSC Generative AI report + BWT AI Performance + server-log classification of AI bot hits (UA token + IP/rDNS verification, training vs search vs user-fetch separated) + repeated prompt sampling across engines with intervals. Four states: NOT_SEARCHED · SEARCHED_NOT_SELECTED · LISTED · INFLUENCED. A single run is not decision-grade.
- Source: F4 › "Committed recommendation"; F4 › "Synthesis › BUILD" BD-1/BD-2; F1 › "Claims triangulated…" C06; F1 › "A7 — Sielinski" (CIs often 3–6 pp); F3 › "2.4 AI-bot log analytics".

---

## B) AI crawler user-agents and their documented contracts (from F2, with F4 cross-references)

**Honesty note on "verbatim UA strings":** F2 records the exact **tokens** for every engine and states that S1/S8/S12 carry "exact UA strings", but the full `Mozilla/5.0 (compatible; …)` strings are **not transcribed into the file**. Verbatim strings present in the corpus are only: `meta-externalagent/1.1`, `meta-externalfetcher/1.1`, and the Google UCP agent `User-Agent` prefix `Google/U…`. Everything else below is the documented token. Retrieval date for all of F2: 2026-08-09; F2 sets a 4–8 week freshness horizon — re-verify at the listed URLs before shipping. (F2 › "Living-update watchlist and supersession state".)

| Engine | Token | Purpose (owner's framing) | Robots contract | Verification | Source |
|---|---|---|---|---|---|
| OpenAI | `OAI-SearchBot` | ChatGPT search discovery / citation surfacing | Honors robots.txt; ~24 h propagation of robots changes; documented `robots.txt` marker variant of UA | per-bot IP JSON (`openai.com/searchbot.json` returned HTTP 500 to F2's fetcher — access failure, not absence) | F2 › "Angle 1 — OpenAI"; F4 › "G3" ("to be included … allow OAI-Searchbot … allow traffic from our published IP addresses") |
| OpenAI | `ChatGPT-User` | User-triggered fetch | "robots.txt rules may not apply" | IP JSON | F2 › "Angle 1"; F2 › "Outcome first" item 3 |
| OpenAI | `GPTBot` | Model-training crawl | Honors robots.txt | IP JSON | F2 › "Angle 1" |
| OpenAI | `OAI-AdsBot` | Ad landing-page quality check | — | IP JSON | F2 › "Angle 1" |
| Anthropic | `Claude-SearchBot` | Search-quality / indexing | Honors robots.txt and `Crawl-delay`; never bypasses CAPTCHAs; blocking "reduces retrieval/search visibility" | `https://claude.com/crawling/bots.json` (20 IPv4 prefixes, 2026-05-01) | F2 › "Angle 2 — Anthropic bots" |
| Anthropic | `Claude-User` | User-triggered fetch | Honors robots.txt (per S5); blocking reduces retrieval | bots.json | F2 › "Angle 2" |
| Anthropic | `ClaudeBot` | Training crawl | Honors robots.txt | bots.json | F2 › "Angle 2" |
| Anthropic (deprecated) | `Claude-Web`, `anthropic-ai` | Legacy tokens | flagged `deprecated_token=True` in F2's classifier | — | F2 › "Angle 2" |
| Perplexity | `PerplexityBot` | "surface and link websites in search results"; "not used to crawl content for AI foundation models" | Honors robots.txt; owner recommends allowing it **and** permitting published IP ranges; changes take "up to 24 hours" | `perplexity.com/perplexitybot.json` | F2 › "Angle 3 — Perplexity"; F4 › "G5 — Perplexity" |
| Perplexity | `Perplexity-User` | User-triggered fetch | "**generally ignores robots.txt rules**" (verbatim, confirmed in two independent sessions) | `perplexity.com/perplexity-user.json` | F2 › "Angle 3"; F4 › "G5" |
| Google | `Googlebot` | Search crawl **and** AI Overviews/AI Mode grounding (same index) | robots.txt for Googlebot is "**the** control" for AI-in-Search | UA + rDNS + `common-crawlers.json` | F2 › "Angle 4 — Google"; F4 › "G1" |
| Google | `Google-Extended` | Gemini training + grounding corpus | **robots.txt token only — no UA string**; does not affect Search/AI Overviews | n/a (never in logs) | F2 › "Angle 4"; F1 › "Platform controls" |
| Google | `GoogleOther`, `Storebot-Google`, `Google-CloudVertexBot` | Other Google crawlers (research/shopping/Vertex) | Standard robots | `common-crawlers.json` | F2 › "Angle 4" |
| Google | `Google-Agent` (2026-03-20), `Google-GeminiNotebook` (2026-07-16) | New agent/fetcher names | **UNKNOWN whether UA or robots-only token** — F2 leaves this open | — | F2 › "Contradictions, gaps…" item 7 |
| Google (UCP) | `User-Agent` beginning `Google/U…` + `UCP-Agent-Profile` header; `Google-UCP-Prober` | Commerce agent | Requires `/.well-known/ucp` — not relevant to this page | — | F2 › "Angle 7" |
| Microsoft | `Bingbot` | Classic search **and** Copilot grounding (single identity; no AI-specific token exists) | Honors robots.txt; `data-nosnippet`, `NOARCHIVE`/`NOCACHE` control AI-summary use | **No IP list** — reverse→forward DNS to `search.msn.com` | F2 › "Angle 5"; F2 › "Contradictions, gaps…" item 2 |
| Meta | `meta-externalagent/1.1` | General fetch / training | Honors robots (24 h cache) | — | F2 › "Angle 6" |
| Meta | `meta-externalfetcher/1.1` | User-triggered fetch | "may bypass robots.txt rules" | — | F2 › "Angle 6" |
| Meta | `facebookexternalhit` | Link preview | "integrity-bypass behavior" | — | F2 › "Angle 6" |
| Apple / Common Crawl | `Applebot-Extended`, `CCBot` | Training opt-out tokens | Referenced only in F2's robots generator set; no contract text quoted | — | F2 › "Angle 4" (shipped-code correction paragraph) |
| xAI / Grok | **none** | Referred to only as "xAI Web Crawler" in a training PDF | No robots token, no IP list, no crawler page | — | F2 › "Angle 6"; F2 › "SUPERSESSION NOTES" (re-confirmed; "xAI publishes IP ranges" falsified); `xAI-SearchBot` string is `[UNVERIFIED]` |

**ALLOW list for a page that wants to be cited (robots.txt + WAF):**
`Googlebot`, `Bingbot`, `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, `Google-Extended` (if Gemini-app grounding is wanted), plus their published IP ranges. Training crawlers (`GPTBot`, `ClaudeBot`, `CCBot`, `meta-externalagent`, `Applebot-Extended`) are an owner choice with **no documented effect on search/answer inclusion**. Do not rely on `Disallow` to stop `Perplexity-User`, `ChatGPT-User` or `meta-externalfetcher` — three owners say it may not apply. (F2 › "Outcome first" items 1 and 3; F2 › "Synthesis › ADOPT/AVOID"; F4 › "FOLKLORE…" F-20.)

---

## C) Answer-first shape, citation-likelihood factors, freshness — as copy/structure rules

**Answer-first / passage shape**
1. Every section opens with a 1–2 sentence, self-contained answer that names the entity — "sentences that make sense even when pulled out of context." (F4 › "G2.b" › "Snippability"; F4 › F-17.)
2. Write the *passage* to be answer-bearing, not merely on-topic: topically close, answer-free passages measurably degrade the answer and push engines toward abstention. (F4 › "A2 — Cuconasu et al." › "(5)"; F4 › "Contradictions…" C-07; F4 › "G2.a" abstention table.)
3. Make each passage robust to unknown chunking and unknown context position — the only publisher-side property that survives both. (F4 › "Stage 3" last paragraph; F4 › "What is structurally unknowable" U-5/U-6.)
4. Prefer evidence containers over Q&A wrappers: definition, measured number, comparison, procedure. (F1 › "A4"; F4 › "A6" › "(3)".)
5. Clarity/fluency is supported (15–30% in GEO); authoritative tone is not. (F4 › F-14; F1 › "A1".)
6. Headings describe the slice; lists/tables hold reusable segments; no hidden content; no walls of text. (F4 › "G2.b".)
7. Do not write "for AI" as a separate register (Google), do not multiply variants (spam policy), do not print word-count or fan-out-count targets (tier C only). (F4 › "G1" mythbusting; F4 › F-15, F-17.)

**Citation-likelihood factors the files support (direction only, never magnitude)**
- Eligibility first: indexed + snippet-eligible + not excluded in Search Console; crawler and IP allowed. Retrieval eligibility and source relevance outrank any rewrite (C-SEO Bench: the position/relevance control beat nearly every content method). (F1 › "A6 — Puerto et al."; F1 › C01/C02.)
- Query-term match, price, specifications, evidence, deep coverage, recent timestamps — significant in ≥4/6 models in a controlled two-document setting. (F1 › "A3".)
- Authentic statistics / quotations / outbound citations — positive for low-ranked sources, negative for top-ranked. (F4 › "A1" Table 2.)
- Known entity: brand-name latent knowledge dominated content and position for some models. (F4 › "A5".)
- Corroboration: the grounding index "must detect and represent conflict"; facts contradicted elsewhere invite abstention; acquiring inauthentic mentions is disclaimed by Google. (F4 › "G2.a"; F4 › F-11.)
- What the listed count does not mean: listed sources ⊋ influencing sources; Bing's citation count "does not indicate ranking, authority, or the role of any page." (F4 › "Outcome first" item 3; F4 › K-05.)

**Freshness signals**
- Real material change → truthful `lastmod` → IndexNow notification (Bing) → recrawl (Google: "several days to several months"). (F4 › F-09; F1 › row "Genuine substantive freshness".)
- "Stale facts can directly produce wrong answers"; staleness is a documented abstention cause — keep price/features/limits current. (F4 › "G2.a" table row "Freshness".)
- Visible and structured dates must be genuine and agree with each other; a visible "Updated:" bump alone is untested and cosmetic bumps are rejected. (F1 › "Contradictions preserved" 4; F3 › three-date leak signal; F4 › F-09.)
- Anthropic searches when the request concerns "current prices, rates … information about specific organizations, people, or products that might have changed" — current product facts on the page are what such a search would look for. (F4 › "G4 — Anthropic" row "Retrieval activation".)

---

## D) Unverified, contradictory, or risky items (kept separate)

**Contradictions preserved in the corpus**
- Google vs Microsoft on chunking, schema, Q&A and writing-for-AI — both tier A, both current; F4 says a unified checklist is a product defect. (F4 › C-01; F1 › "Contradictions preserved" 1.)
- Google's two eligibility pages disagree ("no additional technical requirements" vs "In addition … included in Search generative AI features in Search Console") — resolved as a rolling product change; check both. (F4 › C-02.)
- Q&A formatting: Microsoft "lift word for word" vs A6 "opposite direction" vs Google "not required." (F4 › C-06; F1 › "Contradictions preserved" 3.)
- GEO "+40%" vs the same paper's negative values for top-ranked sources. (F4 › C-04.)
- Structure: observational length/heading correlations vs Google "no ideal page length" vs C-SEO inconsistent structure effects. (F1 › "Contradictions preserved" 3.)
- Search Console AI reporting was described two ways across Google pages; resolved 2026-08-12 (dedicated Generative AI report launched 2026-06-03, data also in "Web" type). (F2 › "SUPERSESSION NOTES".)

**`[UNVERIF