/**
 * tools/screenshot.mjs — renders every mockup page at 375 / 768 / 1440 px with Playwright
 * (Chromium), records console errors and horizontal overflow, and writes PNGs + a JSON report
 * to ../verification/. This is the rules/02 + rules/14 "responsive proof" gate for the mockups.
 * Usage: node tools/screenshot.mjs [baseUrl]   (default http://127.0.0.1:4173)
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "verification");
const base = process.argv[2] ?? "http://127.0.0.1:4173";
const PAGES = ["index.html", "musics.html", "track.html", "login.html", "signup.html", "legal.html"];
const WIDTHS = [375, 768, 1440];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
const report = [];
for (const page of PAGES) {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 812 : 900 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const errors = [];
    p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    p.on("pageerror", (e) => errors.push(String(e)));
    const res = await p.goto(`${base}/${page}`, { waitUntil: "networkidle" }).catch((e) => ({ status: () => String(e) }));
    await p.waitForTimeout(1200); // let the 3D scene and fonts settle
    // scroll through the page so IntersectionObserver-driven reveals fire before the full-page capture
    await p.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await p.waitForTimeout(900);
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const smallTargets = await p.evaluate(() => [...document.querySelectorAll("a,button,input,[role=button]")].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24); }).map((el) => el.outerHTML.slice(0, 80)));
    const file = `${page.replace(".html", "")}-${width}.png`;
    await p.screenshot({ path: join(out, file), fullPage: width >= 768 });
    report.push({ page, width, status: typeof res?.status === "function" ? res.status() : res, horizontalOverflowPx: overflow, smallTargets: smallTargets.length, smallTargetSamples: smallTargets.slice(0, 3), consoleErrors: errors, screenshot: `verification/${file}` });
    console.log(`${page} @${width}: status ${report.at(-1).status} overflow ${overflow}px small-targets ${smallTargets.length} errors ${errors.length}`);
    await ctx.close();
  }
}
await browser.close();
await writeFile(join(out, "report.json"), JSON.stringify({ generatedAt: new Date().toISOString(), base, report }, null, 2));
console.log(`report → verification/report.json (${report.length} rows)`);
