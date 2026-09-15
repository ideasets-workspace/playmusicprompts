/**
 * tools/generate-assets.mjs — real visual asset generation for the HTML design mockups.
 *
 * WHY THIS FILE EXISTS
 *   Rule 23 (ideasets-content-asset-generation-api-law): every image used on a Berk
 *   surface is produced through the SSM Content Asset Generation API's Vertex
 *   endpoint — never a stock file, never a placeholder gradient pretending to be art.
 *   This script generates the hero background and the catalogue cover artworks that
 *   the mockups under ../ display, and writes a manifest next to them so every asset
 *   is reproducible (the exact prompt, model and parameters that produced it).
 *
 * CONTRACT SOURCE (read from disk this session, rule 23 §2)
 *   ssm-content-generation-api/ssm-content-asset-generation-api_v5.md
 *     - "Frontend .env.local (EXACT values to use)" (L206-213): base URL + key env name
 *     - "ARCHITECTURE — How Every Request Flows" (L223-306): POST /create-image-vertex
 *       with header x-api-key -> 202 { jobId, status, poll_url }; poll GET /jobs/{jobId}
 *       -> { status: PENDING|PROCESSING|COMPLETED|FAILED, result: { url, urls?, width?, height? } };
 *       poll cadence 2 s (first 10 s) -> 5 s (next 50 s) -> 10 s; max 15 min.
 *     - "1.1 image-vertex" (L1440-1560): parameter table. Documented-ignored parameters
 *       (guidance_scale, add_watermark, enhance_prompt, language_code, safety_setting —
 *       "accepted but ignored", L1457-1458) are deliberately NOT sent. negative_prompt is
 *       folded into the prompt by the worker (L1457) and IS sent. Models: the live family is
 *       gemini-3-pro-image (highest fidelity, hero) and gemini-3.1-flash-image (covers).
 *
 * SECRETS
 *   The API key is read from the environment variable SSM_CONTENT_API_KEY and is never
 *   written to this file, the manifest, or any log line.
 *
 * USAGE (PowerShell):
 *   $env:SSM_CONTENT_API_KEY = "<key>"; node tools/generate-assets.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ASSET_API, ASSET_JOBS, HERO_ASSET, COVER_ASSETS } from "./asset-spec.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "assets");

const apiKey = process.env["SSM_CONTENT_API_KEY"];
if (!apiKey) {
  console.error("SSM_CONTENT_API_KEY is not set in the environment; refusing to run without credentials.");
  process.exit(2);
}

/** POST one generation job; returns the 202 job envelope. */
async function createJob(spec) {
  const res = await fetch(`${ASSET_API.baseUrl}${ASSET_API.imagePath}`, {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(spec.request),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status !== 202 && res.status !== 200) {
    throw new Error(`create ${spec.id}: HTTP ${res.status} ${JSON.stringify(body)}`);
  }
  return body;
}

/** Poll one job with the documented cadence until COMPLETED or FAILED. */
async function pollJob(jobId) {
  const started = Date.now();
  while (Date.now() - started < ASSET_JOBS.maxPollMs) {
    const elapsed = Date.now() - started;
    const interval =
      elapsed < ASSET_JOBS.phase1UntilMs ? ASSET_JOBS.phase1IntervalMs
      : elapsed < ASSET_JOBS.phase2UntilMs ? ASSET_JOBS.phase2IntervalMs
      : ASSET_JOBS.phase3IntervalMs;
    await new Promise((r) => setTimeout(r, interval));
    const res = await fetch(`${ASSET_API.baseUrl}${ASSET_API.jobsPath}/${jobId}`, {
      headers: { "x-api-key": apiKey },
    });
    const body = await res.json().catch(() => ({}));
    if (body.status === "COMPLETED") return body;
    if (body.status === "FAILED") throw new Error(`job ${jobId} FAILED: ${body.error ?? "no error text"}`);
  }
  throw new Error(`job ${jobId} timed out after ${ASSET_JOBS.maxPollMs} ms`);
}

/** Download the CDN result to disk and return byte size. */
async function download(url, filePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: HTTP ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  await writeFile(filePath, bytes);
  return bytes.length;
}

async function runOnce(spec) {
  const t0 = Date.now();
  const job = await createJob(spec);
  const jobId = job.jobId ?? job.job_id;
  console.log(`[${spec.id}] job ${jobId} created (HTTP 202)`);
  const done = await pollJob(jobId);
  const result = typeof done.result === "string" ? JSON.parse(done.result) : done.result;
  const url = result.url ?? result.public_url ?? result.urls?.[0];
  const ext = (new URL(url).pathname.match(/\.(\w+)$/) ?? [, "jpg"])[1];
  const file = join(outDir, `${spec.id}.${ext}`);
  const bytes = await download(url, file);
  console.log(`[${spec.id}] COMPLETED ${result.width ?? result.ratio ?? "?"} ${bytes} B in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return { id: spec.id, jobId, cdnUrl: url, file: `assets/${spec.id}.${ext}`, bytes, width: result.width ?? null, height: result.height ?? null, ratio: result.ratio ?? null, model: result.model ?? spec.request.model, request: spec.request, elapsedSeconds: (Date.now() - t0) / 1000 };
}

/** Retry only the documented-transient failure classes; anything else fails immediately. */
async function run(spec) {
  for (let attempt = 1; attempt <= ASSET_JOBS.maxAttempts; attempt++) {
    try {
      return await runOnce(spec);
    } catch (err) {
      const msg = String(err);
      const transient = ASSET_JOBS.transientErrorPatterns.some((p) => msg.includes(p));
      if (!transient || attempt === ASSET_JOBS.maxAttempts) throw err;
      console.log(`[${spec.id}] attempt ${attempt} transient failure (${msg.slice(0, 90)}…) — retrying in ${ASSET_JOBS.retryBackoffMs / 1000} s`);
      await new Promise((r) => setTimeout(r, ASSET_JOBS.retryBackoffMs));
    }
  }
  throw new Error("unreachable");
}

await mkdir(outDir, { recursive: true });
const specs = [HERO_ASSET, ...COVER_ASSETS];
// Sequential by measurement (ASSET_JOBS.concurrency = 1): concurrent creates were throttled.
const settled = [];
for (const spec of specs) {
  try { settled.push({ status: "fulfilled", value: await run(spec) }); }
  catch (reason) { settled.push({ status: "rejected", reason }); }
}
const manifest = {
  generatedAt: new Date().toISOString(),
  endpoint: `${ASSET_API.baseUrl}${ASSET_API.imagePath}`,
  contract: "ssm-content-generation-api/ssm-content-asset-generation-api_v5.md §1.7 image-runway (Vertex worker measured down 2026-09-09; see asset-spec.mjs ASSET_API)",
  results: settled.map((s, i) => s.status === "fulfilled" ? s.value : { id: specs[i].id, failed: true, error: String(s.reason) }),
};
await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
const failed = manifest.results.filter((r) => r.failed);
console.log(`\n${specs.length - failed.length}/${specs.length} assets generated; manifest written to assets/manifest.json`);
if (failed.length) { console.error("FAILED:", failed.map((f) => `${f.id}: ${f.error}`).join("\n")); process.exit(1); }
