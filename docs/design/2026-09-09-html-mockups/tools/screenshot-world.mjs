/**
 * tools/screenshot-world.mjs — renders world/index.html at each of the four stations (camera
 * progress 0, 1/3, 2/3, 1) at 1440 and 375 px, recording console errors and WebGL availability.
 * Usage: node tools/screenshot-world.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "verification");
const base = process.argv[2] ?? "http://127.0.0.1:4173";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
const report = [];
for (const width of [1440, 375]) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 812 : 900 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); }); p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(`${base}/world/index.html`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  for (let s = 0; s < 5; s++) {
    await p.click(`.w-dot[data-go="${s}"]`);
    await p.waitForTimeout(2600); // camera lerp settles (progressLerp .06 ≈ 60 frames)
    const active = await p.evaluate(() => document.body.dataset.station);
    const file = `world-s${s}-${width}.png`;
    await p.screenshot({ path: join(out, file) });
    report.push({ width, station: s, activeStation: active, screenshot: `verification/${file}` });
    console.log(`world s${s} @${width}: active=${active} errors=${errors.length}`);
  }
  report.push({ width, consoleErrors: errors, webgl: await p.evaluate(() => document.getElementById("world").dataset.webgl ?? "ok") });
  await ctx.close();
}
await browser.close();
await writeFile(join(out, "report-world.json"), JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2));
console.log("report → verification/report-world.json");
