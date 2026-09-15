// tools/probe-endpoint.mjs — diagnostic: create ONE job with the given body shape, poll it to a
// terminal state and print the result. Usage: node tools/probe-endpoint.mjs <shape> [endpointPath]
//   shapes: minimal | model | ratio | full
const key = process.env["SSM_CONTENT_API_KEY"];
const base = "https://i3ob0ck5m2.execute-api.eu-central-1.amazonaws.com/prod";
const path = process.argv[3] ?? "/create-image-vertex";
const P = "abstract violet light ribbon on black, 3d render, no text";
const shapes = {
  minimal: { prompt: P },
  model: { prompt: P, model: "gemini-3.1-flash-image" },
  legacy: { prompt: P, model: "imagen-4" },
  ratio: { prompt: P, model: "gemini-3.1-flash-image", aspect_ratio: "1:1", quality: "high", output_format: "jpeg" },
  full: { prompt: P, model: "gemini-3.1-flash-image", aspect_ratio: "1:1", quality: "high", output_format: "jpeg", compression_quality: 90, output_mime_type: "image/jpeg", sample_image_size: "1K", person_generation: "dont_allow", include_rai_reason: true, upscale: false, remove_background: false, seed: 101, platform: "web", asset_type: "thumbnail", negative_prompt: "text", count: 1 },
};
const body = shapes[process.argv[2] ?? "minimal"];
const res = await fetch(`${base}${path}`, { method: "POST", headers: { "x-api-key": key, "Content-Type": "application/json" }, body: JSON.stringify(body) });
const j = await res.json();
console.log("create", res.status, j.jobId ?? JSON.stringify(j));
if (!j.jobId) process.exit(1);
for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  const p = await fetch(`${base}/jobs/${j.jobId}`, { headers: { "x-api-key": key } });
  const q = await p.json();
  if (q.status === "COMPLETED") { const r = typeof q.result === "string" ? JSON.parse(q.result) : q.result; console.log("COMPLETED", q.durationSeconds, JSON.stringify(r).slice(0, 400)); process.exit(0); }
  if (q.status === "FAILED") { console.log("FAILED", q.durationSeconds, q.error); process.exit(1); }
}
console.log("timeout");
