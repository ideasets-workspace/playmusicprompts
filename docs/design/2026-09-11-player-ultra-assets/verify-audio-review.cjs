// Independent review: imports the production AudioRack and renders actual Web Audio output.
// Generated test signals exist only in this isolated verification browser.
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../..');
const {chromium} = require(path.join(root, 'docs/design/2026-09-09-html-mockups/tools/node_modules/playwright'));
const tracked = ['player-three-audio.js', 'player-three-sound-ui.js', 'player-three.js'];
const hashes = () => Object.fromEntries(tracked.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'website_html_templates', file))).digest('hex')]));
function rightOnlyWav() {
  const rate = 48000, count = rate * 3, bytes = Buffer.alloc(44 + count * 4);
  bytes.write('RIFF'); bytes.writeUInt32LE(36 + count * 4, 4); bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(2, 22);
  bytes.writeUInt32LE(rate, 24); bytes.writeUInt32LE(rate * 4, 28); bytes.writeUInt16LE(4, 32);
  bytes.writeUInt16LE(16, 34); bytes.write('data', 36); bytes.writeUInt32LE(count * 4, 40);
  for (let i = 0; i < count; i++) bytes.writeInt16LE(Math.round(10000 * Math.sin(2 * Math.PI * 1000 * i / rate)), 46 + i * 4);
  return bytes;
}
(async () => {
  const before = hashes(), errors = [];
  const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-unsafe-swiftshader', '--mute-audio']});
  const page = await browser.newPage({viewport: {width: 1504, height: 1048}});
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/player-three.html');
  await page.waitForFunction(() => window.PMP_PLAYER);
  const checks = await page.evaluate(async () => {
    const {AudioRack, sanitizeSound} = await import('./player-three-audio.js');
    const checks = [];
    const check = (name, pass, detail) => checks.push({name, pass, detail});
    async function render(rate, settings, type, amplitude = .95, events = []) {
      const context = new OfflineAudioContext(2, rate, rate);
      const rack = new AudioRack(context, settings);
      const source = context.createBufferSource(), buffer = context.createBuffer(2, rate, rate);
      for (let channel = 0; channel < 2; channel++) {
        const samples = buffer.getChannelData(channel);
        for (let i = 0; i < rate; i++) {
          const sine = amplitude * Math.sin(2 * Math.PI * 1000 * i / rate);
          if (type === 'sine') samples[i] = sine;
          if (type === 'impulse') samples[i] = i === Math.floor(rate * .5) ? amplitude : 0;
          if (type === 'burst' && i >= Math.floor(rate * .5) && i < Math.floor(rate * .51)) samples[i] = sine;
          if (type === 'pulse-train') samples[i] = i % 512 === 0 ? amplitude : 0;
          if (type === 'burst-train') samples[i] = i % Math.floor(rate * .03) < Math.floor(rate * .01) ? sine : 0;
        }
      }
      source.buffer = buffer; source.connect(rack.input); source.start();
      const suspended = events.map(event => context.suspend(event.time));
      const rendering = context.startRendering();
      for (let i = 0; i < events.length; i++) {
        await suspended[i]; rack.apply(events[i].settings); await context.resume();
      }
      const result = await rendering, samples = result.getChannelData(0);
      let peak = 0, at = 0;
      for (let i = 0; i < samples.length; i++) if (Math.abs(samples[i]) > peak) {peak = Math.abs(samples[i]); at = i;}
      const start = Math.floor(rate * .03), end = Math.floor(rate * .07);
      let energy = 0; for (let i = start; i < end; i++) energy += samples[i] ** 2;
      return {peak, peakAt: at, delaySamples: type === 'impulse' ? at - Math.floor(rate * .5) : undefined, startupRms: Math.sqrt(energy / (end - start))};
    }
    for (const rate of [44100, 48000, 96000]) {
      const original = await render(rate, {}, 'sine', .6);
      check(`Original startup remains transparent at ${rate}`, Math.abs(original.startupRms - .6 / Math.sqrt(2)) < 1e-5, original);
      let originalDelay;
      for (const dynamics of ['original', 'gentle', 'punch', 'night']) {
        for (const type of ['impulse', 'burst']) {
          const result = await render(rate, {dynamics}, type);
          check(`${dynamics} ${type} remains below full scale at ${rate}`, result.peak < 1 && result.peak > 0, result);
          if (type === 'impulse') {
            if (dynamics === 'original') originalDelay = result.delaySamples;
            else check(`${dynamics} delay aligns with Original at ${rate}`, result.delaySamples === originalDelay, result);
          }
        }
      }
      const modes = ['night', 'gentle', 'punch', 'original'];
      const events = Array.from({length: 25}, (_, i) => ({time: .2 + i * .02, settings: {dynamics: modes[i % modes.length]}}));
      for (const type of ['sine', 'pulse-train', 'burst-train']) {
        const result = await render(rate, {}, type, .95, events);
        check(`25 rapid dynamics reversals on ${type} at ${rate}`, result.peak < 1, result);
      }
      const boost = {eq: Array(10).fill(12), width: 2};
      const eqEvents = Array.from({length: 15}, (_, i) => ({time: .3 + i * .02, settings: i % 2 ? boost : {enabled: false}}));
      const result = await render(rate, boost, 'sine', .6, eqEvents);
      check(`Boosted EQ bypass rapid-reversal regression at ${rate}`, result.peak < .601, result);
    }
    const normalized = sanitizeSound(null);
    check('Null sound settings normalize safely', normalized.enabled && normalized.eq.every(value => value === 0) && normalized.width === 1, normalized);
    return checks;
  });
  await page.evaluate(() => localStorage.setItem('pmp.room.soundPresets', JSON.stringify([{id: 'malformed', name: 'Damaged preset', settings: null}, null, {id: 5, name: 'Bad identifier'}])));
  await page.reload(); await page.waitForFunction(() => window.PMP_PLAYER);
  await page.locator('#sound-toggle').click(); await page.locator('#tab-saved').click(); await page.locator('.preset-load').click();
  const preset = await page.evaluate(() => PMP_PLAYER.state.sound);
  checks.push({name: 'Malformed preset loads safely in actual UI', pass: preset.settings.width === 1 && preset.profiles.length === 1 && preset.settings.eq.every(value => value === 0), detail: preset});
  await page.keyboard.press('Escape');
  await page.locator('#audio-files').setInputFiles({name: 'Right channel verification.wav', mimeType: 'audio/wav', buffer: rightOnlyWav()});
  await page.waitForFunction(() => PMP_PLAYER.state.waveform === 320 && !PMP_PLAYER.state.paused);
  await page.waitForTimeout(300);
  const waveform = await page.evaluate(() => {
    const canvas = document.querySelector('#waveform'), pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let outside = 0;
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) if (Math.abs(y - canvas.height / 2) > 4 && pixels[(y * canvas.width + x) * 4 + 3]) outside++;
    return {pixelsOutsideCenter: outside, metrics: PMP_PLAYER.state.sound.metrics};
  });
  checks.push({name: 'Right-only stereo audio produces waveform energy', pass: waveform.pixelsOutsideCenter > 100 && waveform.metrics.rightDb > -30 && waveform.metrics.leftDb <= -90, detail: waveform});
  const after = hashes();
  checks.push({name: 'Reviewed production source did not change during test', pass: JSON.stringify(before) === JSON.stringify(after)});
  const result = {date: new Date().toISOString(), browser: await browser.version(), productionHashes: after, checks, errors, pass: errors.length === 0 && checks.every(check => check.pass)};
  fs.writeFileSync(path.join(__dirname, 'audio-review-checks.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({pass: result.pass, checks: checks.length, failures: checks.filter(check => !check.pass), errors, maximumProtectedPeak: Math.max(...checks.filter(check => check.detail?.peak).map(check => check.detail.peak))}));
  await browser.close();
  if (!result.pass) process.exitCode = 1;
})().catch(error => {console.error(error); process.exitCode = 1;});
