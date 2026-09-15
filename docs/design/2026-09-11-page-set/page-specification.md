# PlayMusicPrompts — Login and navigation pages

Design preview set, 11 September 2026. Berk approved the expanded-prompt home and requested the other pages one by one. Create is the approved home at `C:/Berk/PlayMusicPrompts/docs/design/2026-09-11-living-player/page-desktop-prompt-expanded.png`; do not replace it with a new interpretation.

## Shared contract

- Produce four separate desktop images: Login, Explore, Radio, Library, in that order. These are design previews, not implemented routes.
- Preserve the exact recognizable PlayMusicPrompts logo, black architectural environment, violet/magenta/cyan luminous glass, generous typography and artwork-led discovery.
- Explore, Radio and Library use the same left rail, topbar, and persistent single player. Rail order is Create / Explore / Radio / Library; only the current page is selected.
- Search: **Search songs, stations, and moods**. Guest header action: **Sign in**. Library's populated preview shows an authenticated state via an account avatar, without invented identity details.
- Keep the illustrated playing state consistent across navigation: **Night Drive**, **Made for you**, pause button, waveform **01:24 / 03:48**, **Keep it going** enabled, **Next song ready**. A static screenshot is not proof of real audio, generation, readiness or account data.
- No fabricated popularity counts, fake social proof, pricing, credits, technical implementation text or unsupported world-first claims in the UI. Titles and artwork are illustrative design content, not an assertion of production catalog inventory.
- No composer repeated on every page. Each page needs a distinct primary task and content hierarchy.
- Inspect every image for text accuracy, composition, visible controls, active navigation, and state consistency before proceeding to the next page.

## 1. Login

Purpose: return to saved music or create an account without making sign-in a listening gate. Preserve the music world's visual identity in a focused two-column layout: evocative 3D art and short benefit statement left, generous sign-in card right. Use the exact header logo and **Back to music**. The main browsing rail and global search are omitted in this focused auth view. The existing bottom player remains when arriving during playback; on direct arrival with no active session it is absent. The visual depicts the former.

| Element | Exact copy |
| --- | --- |
| Left headline | Your music. / Always with you. |
| Left supporting text | Save the songs you love. Pick up on any device. |
| Form headline | Welcome back. |
| Form supporting text | Sign in to save and revisit your music. |
| Provider actions | Continue with Google / Continue with Amazon / Continue with Apple |
| Divider | or use your email |
| Email label and placeholder | Email / you@example.com |
| Password label and placeholder | Password / Enter your password |
| Password toggle accessible labels | Show password / Hide password |
| Recovery action | Forgot password? |
| Primary action | Sign in |
| Account creation | New here? Create an account |
| Guest return | Continue without an account |
| Footer links | Privacy / Terms / Help |

Account-provider provenance: the explicit Google/Amazon + own-database direction is recorded in `docs/research/2026-09-03-auth-slice-f-user-management-google-amazon-oidc.md`; `.claude/memory/playmusicprompts_status_07092026.md:18` records credentials + Google/Amazon/Apple in the then-current sign-in page. This design retains that provider set without claiming the integrations were tested today. No minimum-password creation rule belongs in the sign-in placeholder.

Sign-in states: **Signing you in…**; **Check your email and password, then try again.**; **Sign-in was cancelled. Choose a sign-in method to continue.**; **We couldn’t sign you in. Try again.** Successful sign-in returns to the intended destination and preserves the current queue. Forgot-password entry: **Reset your password**, **Enter your email to receive a reset link.**, **Send reset link**; response **If an account uses this email, you’ll receive a reset link.** These recovery messages belong to their respective states, not the main screenshot. No credentials are entered or submitted during design work.

## 2. Explore

Purpose: discover existing songs without writing a prompt. A spacious gallery of genre artwork is the main content, followed by a smaller song row. Explore is selected in the rail. Guest state retains Sign in. Browsing a category never starts playback by itself. Do not repeat the composer here.

| Element | Exact copy |
| --- | --- |
| Eyebrow | EXPLORE |
| Headline | Find your next sound. |
| Supporting text | Explore songs by genre, mood, and era. |
| Primary action | Play something for me |
| Category heading | Start with a sound |
| Category tabs | Genres / Moods / Eras |
| Selected category tab | Genres |
| Six featured genre cards | Pop / Electronic / Hip-Hop / Rock / R&B / Latin |
| Genre expansion | Browse all genres |
| Song row heading | Songs to explore |
| Song expansion | View all songs |
| Song titles | After Hours / Violet Hour / Coastline / Distant Lights / Last Ferry |
| Song menu | Play song / Play next / Save song |

Genre tiles open genre results and carry a directional arrow rather than song play controls. The broader genre selector also offers Country, Jazz, Classical, Metal, Indie, K-Pop, Afrobeats, Reggae, Folk, Lo-Fi, Funk, Blues, Bollywood and C-Pop as category candidates from the project research; the six featured tiles are editorial choices, not a global popularity ranking. The Moods tab offers Focus, Sleep, Chill, Workout, Party, Love, Night drive and Feel good. The Eras tab offers 60s, 70s, 80s, 90s, 2000s and 2010s. Other tab layouts are specified here, not falsely shown as verified responsive or interactive states.

Filtered results copy: **Songs for {category}**, **Clear filters**, **No songs match these filters yet. Try another sound.** The primary random-listening action plays an existing song in the shared player and keeps track origin visible. Direct Play song replaces the current selection only after the explicit play action; Play next inserts after the current song. Plain navigation leaves Night Drive playing.

## 3. Radio

Purpose: enter a continuing station. Radio is selected in the same shell. Give the stations the largest visual presence: three illuminated portals in an immersive stage. Deep Focus is the featured available station, while Night Drive remains the currently playing station beside it. The player changes only when the user presses a station's play action.

| Element | Exact copy |
| --- | --- |
| Eyebrow | RADIO |
| Headline | Find your station. / Stay in the music. |
| Supporting text | Choose a mood. Settle into a station that keeps playing. |
| Featured station | Deep Focus |
| Featured description | Ambient textures. Space to think. |
| Featured metadata | Ambient · Instrumental |
| Primary action | Play Deep Focus |
| Adjacent current station | Night Drive |
| Current station status | Now playing |
| Third station | Afterglow |
| Filters | Mood / Genre / Era |
| Lower collection | More stations |
| Additional stations | Slow Mornings / Deep Rest / Full Energy |
| Collection action | Browse all stations |
| Inactive station action | Play station |
| Active station action | Pause station |

Station information may say **A mix of existing songs and new music created for this station.** only when that station is actually configured for both. Do not use “Live,” invented listener counts or personalization badges. No double player and no automatic switch when the Radio navigation item is opened. The screenshot is before the user presses Play Deep Focus, so the bottom player and Night Drive portal still agree.

Radio states: **Starting your station…**, **Playing {stationName}**, **We couldn’t start this station. Try again.**, **No stations match these filters.**, **Clear filters**. A station's persistence and future generation must be reflected by real session state, not a permanent fake ready indicator. In this illustrative ready screenshot, **Next song ready** is intentionally a selected state.

## 4. Library

Purpose: return to saved songs, generated songs, and playlists. The populated visual depicts a signed-in account without using fabricated personal identity or statistics. Replace Sign in with a neutral account avatar (accessible label **Account**). Library is selected in the rail. The saved collection occupies the page; no large unrelated marketing panel.

| Element | Exact copy |
| --- | --- |
| Headline | Your library. |
| Supporting text | The songs you save. The music you create. |
| Primary action | Play saved songs |
| Secondary action | New playlist |
| Tabs | Saved songs / Your creations / Playlists |
| Selected tab | Saved songs |
| Local search | Search saved songs |
| Sort | Recently saved |
| Six song cards | Night Drive / After Hours / Violet Hour / Coastline / Distant Lights / Last Ferry |
| Current song badge | Now playing |
| Song menu | Play song / Play next / Add to playlist / Remove from library |

Night Drive is the current saved song, with a filled saved-heart icon matching the persistent player's saved state. All six visible items under Saved songs are songs, not mixed playlist cards. Other tab states: Your creations contains generated tracks and can show **Create a song** when empty; Playlists contains playlist covers with **Play playlist**, **Open playlist**, **Rename playlist**. Do not invent song counts or save dates in the screenshot. New playlist opens **Name your playlist**, field **Playlist name**, actions **Create playlist** / **Cancel**; it does not silently start playback.

Guest library state: **Keep your music close.** / **Sign in to save songs and build your library.**, with **Sign in** and **Explore music**. The current player remains available. Empty signed-in saved list: **Make room for your favorites.** / **Save a song to find it here.** / **Explore music**. Empty playlists: **Give your favorites a home.** / **Create your first playlist.** / **New playlist**. Search miss: **No saved songs match your search.** / **Clear search**. Remove action confirms **Removed from your library** with **Undo** after successful mutation; removal does not interrupt the current song.

## Set-wide interaction notes and verification scope

Login returns to the intended destination, never an obsolete dashboard. The shared player persists through Explore, Radio and Library and through auth when a listening session exists. The current song is not restarted on navigation. Genre/mood/era browsing, station choice and personal collections remain distinct.

Mobile and tablet should retain these labels, actions and single-player state with stacked content and the approved compact navigation. This delivery supplies desktop images and the complete page-copy contract; it does not verify auth providers, responsive rendering, actual catalog/account contents or playback in a browser.
