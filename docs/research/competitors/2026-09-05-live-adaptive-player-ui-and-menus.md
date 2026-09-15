FLOOR STATUS (R15.4) — BANNER LIFTED BY THE PARENT LANE d575a0b1 ON 2026-09-05 17:16 TRT AFTER RUN 3: the run-level floors are met and recorded in `2026-09-05-live-adaptive-player-functions-and-services.md` (top block and §L): captured-primary families 20/20 with the parent ruling that the TIDAL-authored App Store listing counts as TIDAL's own primary for the family count but does NOT verify TIDAL web pricing (C-09 stays [UNVERIFIED, contradicted]); academic [FULL] 6/5; every load-bearing claim flagged or ≥3-sourced. Named gaps for THIS file remain exactly as stated in its RUN 2 / RUN 3 sections. The banner line and reason that follow are RETAINED as history and SUPERSEDED by this block.

~~⚠️ UNVERIFIED RELAY — DO NOT CITE~~ (superseded 2026-09-05 17:16 TRT, see FLOOR STATUS above)

Banner reason (run 1, superseded): inherits the unmet academic-[FULL] floor of the run (3/5) and four guessed-locator violations recorded in the functions-and-services file (Standards ledger, Q-FAIL-1..4). No app-store screenshots or live app sessions were captured this session; every UI statement below is taken from first-party help/marketing/developer text or from press descriptions labelled PARTIAL. Nothing here is a rendered inspection.

# Standards ledger

See C:\Berk\PlayMusicPrompts\docs\research\competitors\2026-09-05-live-adaptive-player-functions-and-services.md for the full Standards ledger, Source register (S-/P-/A- ids), Query ledger and Claim ledger; ids are reused here. This file covers vertical 2 (live adaptive player) AND vertical 3 (catalogue & community: public track pages, like, playlists, share, embeds) because the same products carry both. Design-contract note (rules/14): everything below is KNOWLEDGE about competitor surfaces; no palette, type, spacing, grid or layout is proposed — those are OWNER-DECISION.

# Decision served

Screen inventory, navigation, queue presentation, now-playing anatomy, state handling, share sheets, embed players and track/profile/feed surfaces of competitors, so the three structurally divergent directions in docs\design-directions\2026-09-05-frontier-all-surfaces.md can be audited against the banned-skeleton inventory and the parity gap list.

# Outcome first

1. The 2026 Now Playing frontier on the majors is full-bleed artwork with overlaid controls (YouTube Music test, July 2026) and artwork/artist-image-derived page colour (Apple iOS 27 artist pages) — but the two move in opposite directions on colour theming: YouTube's test REMOVES artwork colour theming, Apple ADDS it [P-08, P-07 PARTIAL]. OWNER-DECISION for PMP.
2. Conversational steering lives INSIDE Now Playing on Spotify ("In Now Playing view, tap the chat window while something is playing"), with a tap-to-talk affordance and mood re-tap [S-04 FULL]. The AI-radio entrants put mode chips, a hold-to-talk mic and a spoken host on the same surface [S-16, S-22 PARTIAL]. PMP's Player has no steering surface (gap G-2).
3. Queue presentation: Spotify's Jam exposes a queue that guests can "see and rearrange", plus "Group Recommendations" with an affinity hint ("let you know if others in the Jam like those songs"), a QR-code join from the queue view on TV ("Queue & Jam"), and host settings inside the queue section [S-05 FULL]. PLAiR syncs one queue across devices via WebSocket [S-17 PARTIAL]. PMP's Queue is single-user.
4. Embed anatomy is standardised by Spotify: oEmbed returns `type: "rich"`, an iframe of default height 152 px, width 100 %, border-radius 12 px, `allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"`, thumbnail 300×300 [S-03 FULL]. PMP /t/<id> has OG/JSON-LD but no oEmbed/iframe (gap G-4).
5. Transition state is made visible: Apple shows a "Mixing" animation on Now Playing during AutoMix [P-05 PARTIAL]; Cadence fades a looping ambient pad into the first generated track "no waiting screen, no awkward silence" [S-18 PARTIAL]. PMP's T−90 s generation and buffer ≥2 have no visible state on evidence in CONTEXT-03 — a loading/prepared-state design gap.

# Screen inventory and navigation (per competitor, evidence-bound)

## Spotify [S-01, S-04, S-05 FULL]
- Screens named on first-party pages: Home (DJ entry point), Search (DJ via query "DJ"), Now Playing (chat window for DJ; Jam entry via current device), Queue (Jam settings: "Let others change what's playing", "Let others change volume on supported devices", "Automatically invite others to join a Jam on this device"), Connect/device picker (Jam invite, Bluetooth proximity toggle), TV "Queue & Jam" view with QR code and end-of-track QR notification, CarPlay/Android Auto Now Playing with "Jam" / "Queue & Jam" buttons and "View Guests" [S-04, S-05].
- DJ interaction anatomy: text box, tap-to-talk, personalised suggestion chips, "tap again to change the mood", DJ language setting via ⋯/⋮ [S-04].
- Share anatomy: Jam invite = QR code or "Share link"; phones within 1 m auto-join with Bluetooth; same-WiFi prompt [S-05].
- Embed anatomy: see Outcome 4; Embed creation menu allows background colour, height, width, podcast start point [S-02].
- States: "Not working?" checklist in help (Premium active, right speaker, invitation accepted, shared-volume support) — error-state vocabulary [S-05].

## Apple Music [S-06 FULL; P-05, P-07 PARTIAL]
- Now Playing: "Mixing" animation during AutoMix transitions [P-05]; lyrics view with Translation & Pronunciation control ("Show Translation" / "Show Pronunciation", option to hide original language) [P-05 sunnyluis/TUAW PARTIAL]; Sing: iPhone as microphone for Apple TV, real-time lyrics + visual effects [S-06].
- Library: pinned favourites at top (press: up to six) [S-06, P-05]; playlist folders (press).
- Settings path: Settings › Apps › Music › Song Transitions → AutoMix / Crossfade / Off [P-05].
- Artist page (iOS 27 beta): artist image blends into content, page colour derived from it; info/play/star buttons under the name; featured release in its own box; album pages refresh announced [P-07 PARTIAL].
- Lock Screen: animated album art full-screen (press) [P-05 PARTIAL].

## YouTube Music [P-08, P-09 PARTIAL]
- Now Playing test (July 2026): full-screen portrait cover art behind status and navigation bars; playback controls overlaid; action buttons more transparent; artwork colour theming removed; "reminiscent of Shorts" [P-08 RouteNote citing 9to5Google]. Search bar relocated to bottom; playlist sort filters [P-08 Ubergizmo]. Liquid Glass + Live Activities feature flags [P-09 Android Authority].

## Deezer [S-10 FULL]
- Offers page shows Monthly/Annual toggle, 4-column Free/Premium/Duo/Family compare matrix with feature rows; gift card entry points. App screens not opened — gap.

## SoundCloud [S-19 FULL]
- Plans page splits "For Artists & DJs" / "For Fans" tabs; creator tiers list quota rows (uploads, Boost, distribute, replace, AI Mastering). Track pages, comments-on-waveform, reposts, profiles NOT opened — gap for vertical 3 (declared).

## Endel [S-11 FULL]
- Four modes (Relax, Focus, Sleep, Activity) as the primary navigation; Soundscapes vs Scenarios (timed, three-phase); Autoplay one-button start; "each with their own generative visual"; Apple Watch standalone; Alexa voice entry ("Alexa, start Endel"); Apple TV / Fire TV full-screen animations; Mac app "streamlined and discreet interface"; web player with signature visuals; Discord community "Endel Bubble" [S-11].

## Brain.fm [S-12 FULL]
- Activity-first navigation: Focus / Sleep / Relaxation / Meditation → sub-modes (Deep Work, Creativity, Learning, Light Work, Motivation, Unwind, Destress, Recharge, Chill, Guided Sleep, Deep Sleep, Sleep And Wake, Wind Down, Power Nap, Guided, Unguided); pricing page with Monthly/Yearly cards and testimonial wall; "highest neural effect setting" named by a reviewer (intensity control exists) [S-12].

## Mubert [S-14 FULL]
- Pricing page: Monthly/Annual toggle, 4 plan cards + long compare matrix (Limits & workflow / Export & audio quality / Generation & library / Track Editing / Licensing / Support); Track Editor is a non-real-time "prepare changes then generate" UI [S-14].

## Suno [S-13 FULL, prices unrendered]
- Pricing page: plan compare (SONG GENERATION / CREATION FEATURES / EDITING FEATURES / ACCESS), FAQ accordion; Suno Studio named; community feed/profile/trending NOT opened — gap.

## Entrants [PARTIAL]
- musen: "Press play" hero; Train Radio swipe onboarding; request by text/voice/picture; AI Host settings (voice, personality, frequency, off) [S-16].
- PLAiR: browse catalogue / ask DJ / voice or chat; 10-dimension search; shoutout recorder; multi-device remote; audio-reactive visualisations; "Mobile-first UI" listed as roadmap [S-17].
- Trending Music: mode chips (Balanced, My Library, Throwback, Discover, Energy); hold-mic; story-arc selector; one-line spoken reason per pick [S-22 marketing].
- Cadence: reasoning-chain panel (biometric input → mental-state scores → recommendation → override/feedback sliders); ambient pad → fade-in; API settings screen for LLM/music endpoints [S-18].
- Neurable: background colour = focus level (yellow / light blue / dark blue), Live Focus Timeline strip at bottom [S-23].

# Now-Playing anatomy — comparative table (evidence-bound)

| Element | Spotify | Apple Music | YouTube Music (test) | Endel | Cadence | PMP today (CONTEXT-03) |
|---|---|---|---|---|---|---|
| Artwork | video/Canvas on Premium [S-01] | animated art, Lock Screen [P-05] | full-bleed portrait behind bars [P-08] | generative visual per soundscape [S-11] | not stated | not stated in brief — OWNER-DECISION |
| Steering | chat window + talk + mood re-tap [S-04] | — | — | mode switch | reasoning chain + overrides [S-18] | none (gap G-2) |
| Transition state | — | "Mixing" badge [P-05] | — | continuous | ambient pad fade [S-18] | none visible (gap) |
| Queue | Jam shared queue, rearrange, group recs [S-05] | — | — | — | — | single-user, 1 heard + 2 prepared |
| Lyrics | — (not on pages) | translation + pronunciation + Sing [S-06] | — | n/a | n/a | n/a unless engine emits |
| Colour theming | — | artist-image-derived (iOS 27) [P-07] | REMOVED in test [P-08] | — | focus-colour (Neurable) [S-23] | OWNER-DECISION |
| System surfaces | CarPlay, Android Auto, TV, wearables, speakers [S-01, S-05] | Lock Screen animated art | Live Activities flagged [P-09] | Watch standalone, Alexa, TV, Mac, web [S-11] | background playback [S-18] | phone+tablet+web only |

# Empty / loading / error states — what competitors show
- Spotify help enumerates failure vocabulary for Jam (no Premium, wrong speaker, invitation not accepted, shared-volume unsupported) [S-05]; no first-party description of empty-queue or loading UI was found — NOT FOUND IN THE SEARCHED SCOPE.
- Cadence explicitly designs the first-load state (ambient pad, "no waiting screen") [S-18 PARTIAL].
- musen: "needs an internet connection" (no offline state) [S-16].
- No other competitor page opened documents empty/loading/error states — gap; rules/14 still requires PMP to design all seven states.

# Share sheets, track pages, profiles, feeds (vertical 3)
- Spotify: share link + QR for Jam; Embeds for track/album/artist/playlist/show/episode with oEmbed metadata (title, thumbnail 300×300, provider "Spotify") [S-02, S-03, S-05].
- Apple/Amazon/Deezer/Tidal/YouTube Music: share/track-page anatomy NOT opened this session — gap.
- SoundCloud/Suno/Udio community feeds, profiles, trending: NOT opened — gap (declared, not narrowed).
- PMP: /t/<id> landing with OG/JSON-LD, Web Share / share_plus, like, playlists [CONTEXT-03]. Parity items: oEmbed discovery link + iframe player (G-4); collaborative queue join via link/QR (G-1).

# Application to PMP surfaces (knowledge → audit items, not design decisions)
- Player: add a steering surface (text + voice + chips) inside Now Playing; make the T−90 s generation and prepared-take state visible (Apple "Mixing", Cadence fade-in patterns are prior art); decide colour-theming direction explicitly (the frontier is split).
- Queue: expose the 1-heard/2-prepared model as a first-class view; evaluate shared queue with host controls and link/QR/proximity join (Spotify Jam anatomy).
- Catalogue/share: implement oEmbed + iframe for /t/<id> with the field set Spotify publishes; keep OG/JSON-LD.
- Tablet/web: competitors opened publish almost nothing about tablet layouts (Endel Mac/TV and Spotify TV "Queue & Jam" are the only large-screen evidence) — PMP tablet layout is OWNER-DECISION with no parity constraint measured here.

# FOLLOW-UP RUN 2 (2026-09-05, appended) — tablet layouts, repaired feature rows, unswept-seed UI rows. Ledgers in functions-and-services.md §A–F.

## Tablet layouts (item 5 of the parent's order) — per service, first-party or NOT FOUND
| Service | Structural moves measured from a first-party document | Evidence |
|---|---|---|
| **Spotify** (iOS + Android tablets, 2026-04-16 newsroom, Nicole Burrow, Head of Design) | (1) **Adaptive orientation** — the interface "reconfigures—not just resizes" between portrait and landscape; (2) **collapsible sidebar** that hosts interactive, scrollable browse/discover content *beside* playback and expands "for deeper focus"; (3) **parallel browsing** — media plays on one side while library/recommendations occupy the other; (4) **"Switch to Video" toggle front and center**; (5) **bottom navigation bar retained** for main pages plus a **collapsible side drawer** for profile and settings — i.e. a hybrid bottom-tabs + sidebar shell, explicitly "not simply scaling up mobile components" | `…spotify-tablet-newsroom-2026-04-16.html` (159,810 B) read; 9to5Mac 2026-04-16 secondary (`…9to5mac-spotify-ipad-2026-04-16.html`) captured, not read |
| Apple Music (iPad) | NOT FOUND this run — App Store iPad screenshots not opened; the captured Apple pages (product page, newsroom) describe features (AutoMix, Lyrics Translation, Lyrics Pronunciation, Sing, library pins), not iPad layout | `…apple-music-product-page.html`, `…apple-newsroom-2025-06-services-fall.html` |
| YouTube Music (tablet) | NOT FOUND this run — help 6313529 lists features (Samples tab, Music Tuner, queuing, repeat, unlimited skipping, background play on Premium), no layout | `…youtube-music-help-6313529.html` |
| Amazon Music (tablet) | NOT FOUND this run (no capture) | — |
| TIDAL (iPad) | NOT FOUND this run (no capture; tidal.com pricing returned an empty body in run 1) | — |
| Deezer (tablet) | NOT FOUND this run (no capture) | — |
Reading for PMP: the only first-party tablet spec in the corpus (Spotify, 2026-04) is a *two-pane, orientation-reconfiguring shell with the now-playing surface persistent on one side*. Parity floor for the PMP tablet Player/Queue: ≥ that. Beyond it (OWNER-DECISION, not measured anywhere): a queue pane that shows the *generation state* of the two prepared takes — a surface no competitor needs because none generates.

## Repaired first-party feature rows (R4.3 repair)
- **Apple Music** (newsroom 2025-06, read): AutoMix = DJ-style transitions "using time stretching and beat matching"; Lyrics Translation and Lyrics Pronunciation inside the lyrics view; Sing on iPhone as a mic/karaoke surface; pinning favourites to the top of Library. Player-relevant gap for PMP: PMP has no cross-take transition engine yet (takes are generated, so beat-matched hand-off between takes is possible at generation time, not only at playback — a beyond-parity move).
- **YouTube Music** (help 6313529, read): ad-supported tier keeps on-demand play, queue, repeat and *unlimited skipping*; Premium adds background play, ad-free, audio-only mode, downloads; "Samples" vertical-video discovery tab and "Music Tuner" are named product surfaces. Note for PMP's ad design: YouTube does not gate skipping on the free tier.

## Unswept-seed UI rows (item 3)
| Seed | Player / queue / share / embed surface facts from first-party pages | Evidence |
|---|---|---|
| Udio | create / extend / remix / inpaint / edit produce **pairs of two songs**; 32-s and 130-s length classes are the two generation units the UI exposes | `…udio-help-credits.html` |
| Google Flow Music (ex-Riffusion) | homepage "Explore" section as discovery; model selectors Instrument / Ghostwriter / Producer; playlists, music videos, "spaces", "Memories", custom "Google Flows" | `…riffusion-plans-doc.html` |
| Boomplay (web) | top nav: Music · Home · Trending · New · Artists · Videos · Playlists · Charts · Genres · Library (Add Playlist, Favourites, My Playlists) · Buzz · Podcast; embed dialog sizes Default / Desktop 300×600 / Mobile 300×250, HTML5, WordPress; web player caps privileges vs app ("many privileges … only available in the Boomplay App") | `…boomplay-benefits.html` |
| Bandcamp | artist page carries an embeddable player and fan collection/wishlist surfaces (sizes not captured) | `…bandcamp-artists.html` |
| Yandex Music | "Моя волна" (My Wave) endless personal stream is the primary player surface; multi-account (4) and 10-device sharing in the plan; AI-companion feature named (translation mine) | `…yandex-music-subscription-types.html` |
| Splice | no consumer player; DAW-integrated browser (Ableton Live 12.3+, Studio One Pro 7, Pro Tools 2025.6+) | `…splice-plans.html` |
| Calm, Headspace, Audiomack, Pandora, QQ Music, NetEase, Anghami | UI facts NOT FOUND first-party this run (403 / 406 / 404 / JS shells / no capture — exact URLs in functions-and-services.md §C) | — |

Banner status after this run: KEPT — see functions-and-services.md §F.

# FOLLOW-UP RUN 3 (2026-09-05, appended) — iPad layouts from the App Store listings, IMAGE-BACKED. Ledgers in functions-and-services.md §G–§L.

Method: listing HTML captured (`_sources/2026-09-05-comp-player-appstore-<app>-us-ipad.html`, URLs discovered by search, `?platform=ipad`), distinct ≥1286-px screenshot assets counted from the HTML, the first two screenshots per app downloaded as PNG (`_sources/2026-09-05-comp-player-ipad-shot-<app>-{1,2}.png`) and opened with the image reader. "Structural moves" below are what is visible in those two images plus the listing text; screenshots 3–5 were not opened.

| Product | iPad screenshots in listing | Evidence class | Structural moves observed |
|---|---|---|---|
| **Apple Music** (id1108187390) | **4**, all **landscape 1286×964** — the only listing shot in landscape | IMAGE-BACKED (shots 1–2 opened) | Shot 1 (Home): **persistent left sidebar** (Edit / Search · Home · New · Radio / Library ▾ / Pins ▾ with three pinned items / Recently Added · Artists · Albums · Songs · Downloaded / Playlists; account row at the bottom) + **content pane** ("Top Picks for You" large cards, "Recently Played" row) + a **floating mini-player bar docked bottom-centre over the content** (shuffle · ⏮ · ⏸ · ⏭ · repeat · artwork+title/artist · ⋯ · lyrics · queue). Shot 2 (Playlist Playground, iOS 26): **two-pane editor** — left track list with + / ≡ handles, right column "Customize playlist?" text field with mic + "Suggested Songs · Preview and add to playlist" list, top-right undo/redo/⋯/✓ toolbar; background is blurred artwork colour. No full-screen Now Playing shown in the two shots opened. |
| **YouTube Music** (id1017492454) | **5**, portrait 1286×1714 | IMAGE-BACKED (shots 1–2 opened) | Shot 1 (Now Playing): **single-column phone-shaped layout on the tablet canvas** — chevron-down top-left, **Song / Video segmented toggle top-centre**, ⋮ top-right, large square artwork with margin (not edge-to-edge), title/artist, action-chip row (👍 68K / 👎 · 💬 1.9K · Save · Share · Download · Radio), timeline 0:47 / 4:23, shuffle · ⏮ · ▶ · ⏭ · repeat, bottom sheet tabs **UP NEXT · LYRICS · RELATED**. **No sidebar, no split view, queue is a swipe-up sheet** — consistent with the 9to5Google note that the iPad app lacks the Android-tablet two-column queue (search result, not captured). Shot 2 ("Create your own radio station"): artist chips, "Artist variety" Low/Medium/High segmented control, "Music discovery" three dials Familiar / Blend / Discover, "Filters" chips (Popular · Deep cuts · New releases · Pump-up · Chill · Upbeat · Downbeat · Focus), Done button. |
| **Amazon Music** (id510855668) | **5**, portrait 1286×1714 | IMAGE-BACKED (shots 1–2 opened) | Shot 1 (Home): **MUSIC / PODCASTS segmented toggle top-centre**, bell left, gear right; full-width **hero station card** ("STATION · My Soundtrack · Based on Taylor Swift and more…" with play button) over artist imagery; horizontal shelves (Playlists for you · Top Playlists · Podcasts You May Like) each with SEE MORE. Single column. Shot 2 (podcast Now Playing): **full-screen blurred-artwork background**, centred square art, "About" chip, title + heart, timeline, ↺15 · ▶ · ↻30. Now-playing is full-screen, not a pane. |
| **TIDAL** (id913943275) | **4**, portrait 1286×1714 | IMAGE-BACKED (shots 1–2 opened) | Shot 1 (Now Playing): "PLAYING FROM · Lavender Haze (Acoustic Version)" context label, large square artwork, title/artist, heart · share · ⋯, timeline with a **"MAX" quality badge** centred under the scrubber (1:32 / −4:12). Single column, black. Shot 2 (Home): "Videos" shelf with WATCH-labelled 16:9 cards ("The Warning on RISING", "SwaVay on RISING"), "Custom mixes for you · VIEW ALL" shelf with Video Mix 1–4 cards. Listing copy: "Try TIDAL free for 30 days", "TIDAL Connect". |
| **Deezer** (id292738169) | **5**, portrait 1286×1714 | IMAGE-BACKED (shots 1–2 opened) — shot 1 is a **marketing illustration**, not UI | Shot 1: illustrated hand holding a phone ("LIVE THE MUSIC") — no real layout. Shot 2 ("Recommendations just for you"): **Flow Moods / Genres** — two overlapping wheels (Moods: Love · Party · Focus · Melancholy; Genres: Pop · K-pop · Rap · Electronic · Rock · R&B) with "Flow" at each centre, bottom pill "More discoveries" (wand + heart). Rendered at phone proportions inside the tablet frame. |

Reading for PMP (knowledge, not a design decision): of the five, **only Apple Music ships a tablet-native shell in its iPad screenshots** (sidebar + content pane + docked mini-player, landscape, two-pane editors); YouTube Music, Amazon Music, TIDAL and Deezer present portrait, single-column, phone-proportioned surfaces on the iPad canvas, and Deezer's first iPad screenshot is not even a screenshot. Together with Spotify's 2026-04 newsroom spec (RUN 2), the tablet parity floor is therefore two products (Apple, Spotify) with a persistent side surface and a docked/side now-playing; the other four set no higher bar. OWNER-DECISION remains everything about PMP's own tablet layout; the measured fact is that a two-pane shell with the generation state of the two prepared takes visible would already exceed 4 of the 6 measured competitors. Visual claims here are limited to what the two opened images show; shots 3–5 per app were not opened — "visual: unverified" for those.

## Item-4 retries and item-1 captures (UI facts): Amazon FAQ and help pages, SoundCloud plans page, Deezer offer pages and QQ Music pages captured this run carry plan/feature text, not screen anatomy — no new UI rows beyond the table above. TIDAL, Pandora, Calm, Anghami first-party pages: ACCESS FAILURE (403 / JS shell / 403 / 406), UI facts NOT capturable this run.

Banner status after RUN 3: KEPT — functions-and-services.md §L (captured-primary families 19/20 strict; 20/20 only if the TIDAL-authored App Store listing is accepted as TIDAL's primary — parent's call).

NOT TO COPY — UNDERSTAND WHAT LIES FAR BEYOND AND BUILD IT
