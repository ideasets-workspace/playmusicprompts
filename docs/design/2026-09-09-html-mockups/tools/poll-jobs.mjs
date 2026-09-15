// tools/poll-jobs.mjs — diagnostic: print the terminal state of given job ids.
const key = process.env["SSM_CONTENT_API_KEY"];
const base = "https://i3ob0ck5m2.execute-api.eu-central-1.amazonaws.com/prod";
for (const id of process.argv.slice(2)) {
  const res = await fetch(`${base}/jobs/${id}`, { headers: { "x-api-key": key } });
  const b = await res.json().catch(() => ({}));
  const r = typeof b.result === "string" ? JSON.parse(b.result) : b.result;
  console.log(id.slice(0, 8), b.status, b.error ?? "", r?.url ?? "", r?.width ? `${r.width}x${r.height}` : "", b.durationSeconds ?? "");
}
