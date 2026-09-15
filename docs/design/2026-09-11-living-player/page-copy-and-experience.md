# PlayMusicPrompts — the living player

English page copy and experience design, 11 September 2026.

This is the copy specification accompanying the revised page visual. Playback, generation, and adaptation below describe intended interaction states; this document does not establish that a deployed application implements them. Berk accepted the revised page with “süper” and asked for a larger prompt area on 11 September 2026. The original visual direction is his explicitly accepted V4.

## The page

| Element | Exact English copy |
| --- | --- |
| Brand | PlayMusicPrompts |
| Brand signature | CREATE · CONTROL · FEEL |
| Search placeholder | Search songs, stations, and moods |
| Account action | Sign in |
| Navigation | Create / Explore / Radio / Library |
| Hero, line 1 | Create your music. |
| Hero, line 2 | Shape what’s next. |
| Supporting copy | Describe a sound. Create a song. Let your listening shape what comes next. |
| Prompt label, including accessible label | Describe your music |
| Empty prompt placeholder | What do you want to hear? A mood, a memory, a sound… |
| Filled prompt in the visual | A peaceful night drive. Warm ’80s synths. No vocals. |
| Prompt assistance | Enhance |
| Prompt assistance explanation | Add musical detail to your description. You can edit every word. |
| First selector | Genre / Electronic |
| Second selector | Mood / Peaceful |
| Third selector | Instrument / Synth |
| Fourth selector | Scene / Night drive |
| Fifth selector | Era / 1980s |
| Sixth selector | Vocals / Instrumental |
| Energy control | Energy |
| Energy endpoints | Calm / Intense |
| Primary action | Create & Play |
| Full parameter access | All controls |
| Secondary action | Play something for me |
| Secondary action explanation | Start with a song from the library. |
| View switch | Classic / World |
| Browsing filters | Genre / Era |
| Featured station | Night Drive |
| Featured station, playing state | Now playing |
| Other stations | Deep Focus / Afterglow |
| World navigation hint | Drag to explore |
| Discovery row | Find your next mood |
| Discovery action | Explore all |
| Five example cover titles | After Hours / Violet Hour / Coastline / Distant Lights / Last Ferry |

The secondary action appears below the dominant creation button as a quiet but clearly actionable link. Its explanation is available on focus or in the entry sheet, not another permanent paragraph. The six selectors stay closed and spacious; their value lists appear only when opened. The energy slider stays continuous. The lower artwork row keeps the accepted visual coherence; genre, era, and mood exploration is available through browsing rather than adding a wall of chips.

### Prompt field revision — 11 September

Latest image: [Expanded prompt preview](C:/Berk/PlayMusicPrompts/docs/design/2026-09-11-living-player/page-desktop-prompt-expanded.png).

The prompt is a spacious multiline writing area, approximately four text lines tall at rest, rather than a single-line field. Keep the existing prompt wording, with natural wrapping and room for a longer description. Place Enhance in its own bottom-right tool area so it does not consume the writing width. Preserve the six selectors, energy slider and both starting actions below it. Allow the page to become taller instead of shrinking text or the player. Intended implementation: grow with the text up to eight visible lines, then use internal scrolling. This behavior is specified for implementation; a static image only demonstrates the expanded resting layout.

## The player

| Element or state | Exact English copy | Display condition |
| --- | --- | --- |
| Example playing title | Night Drive | Illustrative title in the visual |
| Generated-song origin | Made for you | Track was actually created for this session |
| Catalog-song origin | From the library | Existing catalog track |
| Radio origin | From {stationName} | Track belongs to the selected station |
| Continuation switch | Keep it going | Available once a listening session exists |
| Switch explanation | Keep creating new songs as I listen. | Switch detail, tooltip, or first-use explanation |
| Adaptation explanation | What you play and skip helps shape the next song. | First activation; not repeated on each skip |
| Continuation enabled confirmation | On. New songs will follow this one. | Only after enabling continuation succeeds |
| Continuation disabled confirmation | Off. New songs won’t be added automatically. | Disable automatic refills; preserve current audio and manually queued songs |
| Next generation active | Creating what’s next… | Confirmed active generation |
| Next song prepared | Next song ready | Confirmed playable prepared song |
| Queue action | Up next | Opens the same session's queue |
| Queue sections | Now playing / Up next / Recently played | Corresponding data exists |
| No queued successor | Nothing queued yet | No prepared successor; not a generation failure by itself |
| Preserve song | Save song |
| Song saved | Saved to your library |
| Undo saved state | Remove from library |
| Share action | Share song |
| Copy action | Copy link |
| Successful copy | Link copied |

The reference visual depicts a song already playing, continuation enabled, and a successor ready. It must therefore show a pause control, an enabled continuation switch, and a ready status. Initial entry instead shows an idle player; ready, creating, and error messages never appear simultaneously for the same item.

Player icon labels: **Play, Pause, Previous song, Next song, Shuffle, Repeat, Seek, Volume, Mute, Unmute, Up next, Expand player, Close player.** The previous/repeat controls operate on playable songs already in the session. Browsing and changing Classic/World never start a second player. Prepared alternatives stay out of the casual first-song presentation.

## Creation and recovery

| Situation | Exact English copy | Action or behavior |
| --- | --- | --- |
| No description or selected sound | Add a description or choose a sound to begin. | Focus the composer; promptless listening remains available |
| Generating the first song | Creating your song… | Preserve the prompt and controls |
| Creating while another song plays | Creating your next song… | Keep the current song playing; insert the result next in the same queue |
| Optional listening during creation | Listen while it’s being created | Explicit action starts a suitable catalog track in the same player |
| Cancel request | Cancel creation | Available while the request can be cancelled |
| Cancellation confirmed | Creation cancelled. Your description is still here. | Never discard user input |
| Generated song awaits a play gesture | Your song is ready | Button: Play song |
| Generated song ready while another track plays | Your song is up next | Play automatically at the next transition; optional action: Play now |
| Generation failed | We couldn’t create your song. Try again. | Button: Try again; preserve input |
| Next generation failed, current track still playing | We couldn’t create the next song. | Actions: Try again / Play from the library |
| Skip pressed with no prepared successor, generation active | The next song is still being created. | Only when generation is confirmed active; action: Play from the library |
| Skip pressed with no prepared successor or active generation | Nothing queued yet | Action: Play from the library; do not invent an in-progress creation |
| Actual audio buffering | Loading audio… | Do not describe this as music creation |
| Network lost | You’re offline. Reconnect to continue. | Keep any locally playable audio available |
| Song unavailable | This song is unavailable. | Action: Play another |
| No search results | No matches yet. Try a different song, station, or mood. | Action: Clear search |
| Empty library | Make room for your favorites. | Body: Save a song to find it here. Action: Explore music |
| Audio ad is playing | Advertisement | Display only for an actual ad |

No fabricated countdown, percentage, instant-generation promise, readiness signal, or “world first” claim. Create & Play starts the first generated song when ready if nothing is playing. When a song is already playing, it inserts the new result next in the same queue and plays it at the transition without requiring another decision. It does not interrupt the current song unless the listener chooses Play now. Where the browser requires another gesture, show Play song.

## Controls when opened

| Surface | Exact English copy |
| --- | --- |
| Generic selector search | Search {category} |
| Clear an individual choice | Clear selection |
| Genre panel | Choose your genre |
| Mood panel | Set the mood |
| Instrument panel | Choose an instrument |
| Scene panel | Set the scene |
| Era panel | Choose an era |
| Vocal panel | Choose your vocals |
| Vocal modes | Instrumental / With vocals |
| Vocal-language field | Singing language |
| Lyrics field | Lyrics |
| Lyrics modes | Create lyrics for me / Use my lyrics |
| Lyrics input placeholder | Add the words you want sung… |
| Full controls title | Shape every detail |
| Full controls introduction | Fine-tune your sound. Your description stays editable. |
| Full controls search | Find a control |
| Control groups | Sound & style / Rhythm & energy / Voice & lyrics / Song structure / Production / Output |
| Restore defaults | Reset controls |
| Finish editing | Apply changes |
| Return to composer | Back to your music |
| Enhanced prompt action | Use this version |
| Reject enhancement | Keep my original |
| Restore previous prompt | Undo enhancement |

Selecting values updates the visible, editable description. Enhancement must preserve the listener's intent and offer the original wording. Vocal and lyrics controls appear when With vocals is selected, with supported options supplied by the real engine contract. All controls remains the entry to the complete engine parameter set; these group headings do not replace or narrow that set. The image is not evidence of full parameter integration.

## The experience from arrival to continuation

1. **Start with an intention.** The large headline and one dominant Create & Play action establish that a song can be made. The prompt is immediately available; the six research-informed selectors are optional ways to describe the sound. Sign-in stays secondary.
2. **Or start by listening.** Play something for me starts an existing catalog song; the user can also choose a station, genre, or era. The interface identifies the track's real origin.
3. **Make the first song.** The actual generation state replaces the creation action. The user's words remain visible. A catalog listening option can occupy the wait without a second audio player.
4. **Hear one song.** Prepared alternatives are an internal continuity mechanism. The listener sees the song that is playing, its controls, and the option to continue.
5. **Choose to continue.** Keep it going opts into generating more music. Its first-use explanation connects listening and skipping to the next song. It is off by default for a newly generated single song; the mockup shows a later session after activation. Turning it off disables automatic refills while preserving the current song and any songs the listener explicitly queued.
6. **Shape the continuation.** Next song plays an available successor and informs future generation. A skip alone does not claim to know why a person skipped. Optional feedback in Up next uses Less like this / More like this. It never blocks the skip action.
7. **Move through one experience.** World, Classic, artwork, and radios share the persistent player. The queue gives access to the current song, available upcoming music, and listening history.

Mobile: retain the same copy and actions, stack composer and station artwork, use the accepted bottom navigation pattern and a compact persistent player; open the full player for waveform and continuation controls. Tablet: keep composer and stations adjacent when space permits. These are layout requirements for later implementation; this delivery contains the desktop visual only.

## Provenance and scope

- User's current request: revise the accepted page with all wording and the experience.
- Approved base image: `C:/Users/berke/.codex/generated_images/01a08f44-2156-7a82-b212-e405fc4376a0/exec-6dec45be-b3d4-4b77-a18d-a154b3cd88cd.png`.
- Founder export: `C:/Users/berke/Downloads/play_music_promps_cursor_project_memory_11092026.md`, especially lines 93–103 (three hidden alternatives and continuation), 127 (creating and playing the moment), and 10208–10212 (promptless catalog entry).
- Product decisions: `.claude/memory/DECISIONS.md`, D-PMP-08, 09 and 10 (dark 3D visual, one shell/player and exact logo).
- Input research: `docs/research/2026-08-29-simple-player-input-taxonomy-and-values.md`, interpreted with the limitations already established in this conversation. Category candidates are not presented as a verified universal popularity ranking.
- New headline, microcopy and detailed interaction treatments are this design proposal, not falsely attributed to Berk or presented as approved implementation.
