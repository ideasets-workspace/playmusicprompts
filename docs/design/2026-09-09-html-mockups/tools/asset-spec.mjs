/**
 * tools/asset-spec.mjs — the constants and the exact prompts behind every generated asset.
 *
 * Kept separate from the generator (rule 20: constants live in their own file and are
 * wired in) so that a reviewer can read WHAT was asked of the image model without
 * reading HOW the HTTP flow works, and so that the prompts are versioned as deliverables
 * (rule 23 §4: "the prompt actually sent is recorded next to the asset").
 *
 * Every request field below is one the contract lists for image-vertex
 * (ssm-content-asset-generation-api_v5.md L1476-1506, read this session). Fields the
 * contract marks "accepted but ignored" (L1457-1458) are omitted on purpose.
 *
 * Visual language (owner decisions on record, never the agent's taste):
 *   - BLACK / dark, interactive, 3D — Berk, 2026-09-09 09:49 (DECISIONS.md D-PMP-08)
 *   - brand gradient #E62BA4 -> #B014D5 -> #5805E4 -> #0A0FE6 -> #0075FA and logo
 *     palette #7F00FF / #0000FF / #FF00FF / #00FFFF — measured from his own /create CTA
 *     and logo, approved in D-PMP-06 (the palette was approved; the layout was rejected)
 *   - no people, no readable text, no logos in the artwork (person_generation dont_allow;
 *     negative prompts) so nothing in a mockup can be mistaken for a real artist or brand.
 */

export const ASSET_API = Object.freeze({
  // MEASURED 2026-09-09 07:0x–07:2x (+03), tools/probe-endpoint.mjs, minimal {prompt} body, each
  // job polled to its terminal state:
  //   v2pjhwhk0m… (v5 doc L209)  → HTTP 500 at the gateway for every shape (4/4)
  //   i3ob0ck5m2… (credentials.md) → 202 + job; then per worker:
  //     /create-image-vertex   FAILED 0.8 s "Internal server error" (crashes before Vertex; 13/13 jobs)
  //     /create-image-openai   FAILED 429 credit_balance_exhausted            (billing — Berk)
  //     /create-image-fal, -flux FAILED 403 "Exhausted balance" (fal.ai)       (billing — Berk)
  //     /create-image-stability FAILED 402 payment_required                     (billing — Berk)
  //     /create-image-luma     FAILED 400 "Insufficient credits"               (billing — Berk)
  //     /create-image-kling    FAILED 429 "Account balance not enough"         (billing — Berk)
  //     /create-image-runway   COMPLETED 22.8 s, 1280x720 jpg, 360,758 B      ← the working provider
  // Rule 23 names the Vertex endpoint; it is down server-side, so the same Ideasets API's Runway
  // provider is used and the deviation is reported to Berk with a veto path (rule 28 Art. 2).
  baseUrl: "https://i3ob0ck5m2.execute-api.eu-central-1.amazonaws.com/prod",
  imagePath: "/create-image-runway",
  jobsPath: "/jobs",
});

// v5 L261-266: 2 s for the first 10 s, 5 s until 60 s, then 10 s; hard ceiling 15 min.
export const ASSET_JOBS = Object.freeze({
  phase1IntervalMs: 2_000,
  phase1UntilMs: 10_000,
  phase2IntervalMs: 5_000,
  phase2UntilMs: 60_000,
  phase3IntervalMs: 10_000,
  maxPollMs: 900_000,
  // MEASURED 2026-09-09: 9 concurrent creates -> the worker Lambda was cold
  // ("CodeArtifactUserPendingException: Lambda is initializing your function") and the rest
  // were throttled ("TooManyRequestsException: Rate Exceeded"); job_creator marks such jobs
  // FAILED without retrying. So: one job at a time, and a transient FAILED is retried.
  concurrency: 1,
  maxAttempts: 4,
  retryBackoffMs: 15_000,
  transientErrorPatterns: ["Lambda is initializing", "Rate Exceeded", "TooManyRequests", "Internal server error"],
});

const BRAND_PALETTE_PROSE =
  "colour palette strictly: near-black background (#050308), deep violet #5805E4, electric magenta #E62BA4, " +
  "ultraviolet #7F00FF, electric cyan #00FFFF accents, cobalt #0A0FE6 depths";

const COMMON_NEGATIVE =
  "Strictly no text, no letters, no words, no typography, no watermark, no logo, no signature, no people, " +
  "no faces, no hands, no human figures, no literal musical instruments, not cartoon, not flat vector, " +
  "not clip art; avoid low contrast, washed-out greys, daylight, white or beige backgrounds and pastels.";
// Runway gen4_image has no negative_prompt field (§1.7), so the exclusions are folded into the prompt text.

/**
 * Hero: the homepage's full-bleed background behind the prompt. It must read as a
 * SOUND FIELD in 3D — the visual language the FieldStop canvas will animate live —
 * so the still image and the later WebGL scene feel like one material.
 */
export const HERO_ASSET = Object.freeze({
  id: "hero-sound-field",
  request: {
    prompt:
      "Ultra-detailed cinematic 3D render of an abstract sound field floating in deep black space: " +
      "thousands of luminous glass-like particles arranged into concentric wave rings and a slow " +
      "volumetric ribbon of light that reads as a frozen audio waveform, seen from a low three-quarter angle " +
      "with dramatic depth of field. Physically-based materials: iridescent glass, thin-film interference, " +
      "subsurface glow. Lighting: single violet key light from upper left, magenta rim light, faint cyan " +
      "bounce; volumetric fog catching the beams; no visible light source. " + BRAND_PALETTE_PROSE + ". " +
      "Composition: the ribbon sweeps from lower-left to upper-right leaving the left third calm and dark " +
      "for interface text; horizon-less, infinite black. Photoreal octane-render quality, sharp " +
      "particles, soft bokeh in the far field. " + COMMON_NEGATIVE,
    model: "gen4_image",   // §1.7: gen4_image (standard) — turbo requires reference_images we do not have
    ratio: "1920:1080",    // §1.7 allowed ratio list; the hero is 16:9 full-bleed
    seed: 20260909,
  },
});

/**
 * Catalogue covers: one per real genre/mood family that the live vocabulary carries
 * (genre ids confirmed against GET /api/music/capabilities on 2026-09-07 — see
 * docs/research/2026-09-07-music-catalogue-browse-category-demand.md). Square, so they
 * sit in the same cover slot on the player bar, the stream rows and the /t page.
 */
function cover(id, subject, seed) {
  return Object.freeze({
    id,
    request: {
      prompt:
        `Square album artwork, abstract 3D render: ${subject}. ` +
        "Photoreal materials, volumetric lighting, dramatic contrast against a near-black background, " +
        BRAND_PALETTE_PROSE + " with the scene's own accent as noted. Centre-weighted composition with " +
        "breathing room at the edges so the artwork survives a rounded-corner crop. Octane-render quality. " + COMMON_NEGATIVE,
      model: "gen4_image",
      ratio: "1080:1080",  // §1.7 allowed square ratio
      seed,
    },
  });
}

export const COVER_ASSETS = Object.freeze([
  cover("cover-lofi-night", "a rain-soaked night city seen through a glass pane, neon violet and magenta reflections smeared into soft vertical streaks, a warm amber window as the single accent, lo-fi hip-hop mood", 101),
  cover("cover-cinematic-orchestral", "a colossal dark concert-hall vault dissolving into cosmic dust, gold-leaf accents on black marble, cinematic orchestral epic mood, god rays", 102),
  cover("cover-ambient-sleep", "slow translucent silk waves drifting over an infinite black ocean under a violet moon, ambient sleep and calm mood, ultra soft focus", 103),
  cover("cover-90s-rock", "a shattered chrome sphere frozen mid-explosion with magenta and cyan sparks, gritty analog film grain, 1990s alternative rock energy", 104),
  cover("cover-jazz-night", "smoky midnight blue room with a single cobalt spotlight cone on an empty velvet stage, gold dust in the air, late-night small-combo jazz mood", 105),
  cover("cover-synthwave", "an endless neon grid horizon receding into black, a low violet sun with horizontal scanline cuts, retro synthwave mood, chrome reflections", 106),
  cover("cover-turkish-acoustic", "sunset warmth folded into dark: hand-carved wooden geometry and copper filigree emerging from black, deep red and amber accents, Anatolian acoustic warmth", 107),
  cover("cover-classical-piano", "a single obsidian-black grand-piano-like monolith form in a pool of still water reflecting a violet nebula, minimalist classical piano solitude", 108),
]);
