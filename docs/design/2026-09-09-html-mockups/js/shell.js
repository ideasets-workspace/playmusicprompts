/**
 * js/shell.js — renders the shared application shell (navigation rail, top bar, persistent
 * player bar) into every page and wires their behaviour, so the six mockup pages share ONE
 * definition of the chrome (a change here changes all pages — rule 20: no duplicated constants
 * or markup). Each page only authors its <main>.
 *
 * Behaviour:
 *   - rail collapse state persists in localStorage (YouTube Music web remembers this too;
 *     measured 9to5google 2023-06-15) and the drawer opens/closes below 1024 px.
 *   - the player bar is constructed with the page's "now playing" track and persists across
 *     pages in production via the shared StreamEngineProvider (D-PMP-05).
 */
import { SAMPLE_TRACKS, STORAGE_KEYS } from "./constants.js";
import { PlayerBar } from "./player-bar.js";
import { CoverArt } from "./cover-art.js";
import { PlayerOrb, Reveal } from "./fx/motion.js";

/** Cover source for a track in this review build — see js/cover-art.js header for why. */
export const coverOf = (track, size = 512) => CoverArt.src(track, size);

export const ICONS = Object.freeze({
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/></svg>',
  musics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>',
  library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5v14M9 5v14M14 6l5 13"/></svg>',
  radio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z"/></svg>',
  heartFill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  collapse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zM20 6v12L9 12z"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM4 6v12l11-6z"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  queue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h10M4 18h7M19 15v6l3-3"/></svg>',
  volume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2zM19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 5 5L20 7"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 15V3m0 0L8 7m4-4 4 4"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>',
});

const NAV = [
  { href: "index.html", label: "Home", icon: "home" },
  { href: "musics.html", label: "Musics", icon: "musics" },
  { href: "library.html", label: "Your library", icon: "library" },
  { href: "stations.html", label: "Stations", icon: "radio" },
];

export class AppShell {
  /** @param {{ current: string, nowPlaying?: object, showPlayer?: boolean }} opts */
  constructor(opts) {
    this.opts = { showPlayer: true, ...opts };
    this.app = document.querySelector(".app");
    this.#renderRail();
    this.#renderTopbar();
    if (this.opts.showPlayer) this.#renderPlayer();
    this.#wire();
  }

  #renderRail() {
    const rail = document.querySelector(".rail");
    const playlists = SAMPLE_TRACKS.slice(0, 5);
    rail.innerHTML = `
      <a class="brand" href="index.html" aria-label="PlayMusicPrompts home">
        <span class="brand-mark" aria-hidden="true"></span>
        <span class="brand-name">PlayMusicPrompts<small>Music Creation OS</small></span>
      </a>
      <nav class="nav-group" aria-label="Primary">
        ${NAV.map((n) => `<a class="nav-link" href="${n.href}" ${n.href === this.opts.current ? 'aria-current="page"' : ""}>${ICONS[n.icon]}<span>${n.label}</span></a>`).join("")}
      </nav>
      <div class="nav-group">
        <div class="nav-title eyebrow">Playlists</div>
        <a class="nav-link" href="#" data-action="new-playlist">${ICONS.plus}<span>New playlist</span></a>
        <a class="nav-link" href="#">${ICONS.heart}<span>Liked</span><span class="count">42</span></a>
        ${playlists.map((t) => `<a class="nav-link" href="track.html"><img class="thumb" src="${coverOf(t, 64)}" alt=""><span>${t.title}</span></a>`).join("")}
      </div>
      <div class="rail-foot">
        <button class="nav-link rail-toggle" type="button" data-action="collapse" aria-label="Collapse navigation">${ICONS.collapse}<span>Collapse</span></button>
      </div>`;
  }

  #renderTopbar() {
    const bar = document.querySelector(".topbar");
    bar.innerHTML = `
      <button class="icon-btn drawer-btn" type="button" data-action="drawer" aria-label="Open navigation" aria-controls="rail" aria-expanded="false">${ICONS.menu}</button>
      <div class="tabs" role="tablist" aria-label="Browse">
        ${["For you", "Trending", "New"].map((t, i) => `<button class="tab" role="tab" aria-selected="${i === 0}">${t}</button>`).join("")}
      </div>
      <label class="search">${ICONS.search}<input type="search" placeholder="Search genres, moods, prompts…" aria-label="Search"><kbd>/</kbd></label>
      <a class="avatar" href="login.html" aria-label="Sign in">B</a>`;
  }

  #renderPlayer() {
    const track = this.opts.nowPlaying ?? SAMPLE_TRACKS[0];
    const trackWithCover = { ...track, cover: coverOf(track, 128) };
    const el = document.createElement("footer");
    el.className = "player"; el.setAttribute("aria-label", "Player");
    el.innerHTML = `
      <div class="p-now">
        <span class="p-cover-wrap"><img class="p-cover" alt=""></span>
        <div class="p-meta"><div class="p-title"></div><div class="p-sub"></div></div>
      </div>
      <div class="p-transport" role="group" aria-label="Transport">
        <button class="icon-btn" type="button" data-action="shuffle" aria-label="Shuffle">${ICONS.shuffle}</button>
        <button class="icon-btn" type="button" data-action="prev" aria-label="Previous">${ICONS.prev}</button>
        <button class="p-play" type="button" data-action="play" aria-label="Play"><span data-icon="play">${ICONS.play}</span><span data-icon="pause">${ICONS.pause}</span></button>
        <button class="icon-btn" type="button" data-action="next" aria-label="Next">${ICONS.next}</button>
        <button class="icon-btn" type="button" data-action="repeat" aria-label="Repeat">${ICONS.repeat}</button>
      </div>
      <div class="p-scrub">
        <span class="p-time" data-role="t-cur">0:00</span>
        <div class="p-wave">
          <canvas aria-hidden="true"></canvas>
          <input type="range" min="0" max="100" step="1" value="0" data-role="seek" aria-label="Seek">
          <span class="p-focus" aria-hidden="true"></span>
        </div>
        <span class="p-time" data-role="t-dur">0:00</span>
      </div>
      <div class="p-actions">
        <button class="icon-btn" type="button" data-action="like" aria-label="Like" aria-pressed="false">${ICONS.heart}</button>
        <button class="icon-btn" type="button" data-action="queue" aria-label="Queue">${ICONS.queue}</button>
        <div class="p-vol"><button class="icon-btn" type="button" aria-label="Mute">${ICONS.volume}</button><input type="range" min="0" max="100" value="80" aria-label="Volume"></div>
        <button class="icon-btn" type="button" data-action="expand" aria-label="Full player">${ICONS.expand}</button>
      </div>`;
    document.body.appendChild(el);
    this.player = new PlayerBar(el, trackWithCover);
    // the cover becomes a rotating 3D orb, beat-locked to the track's measured BPM
    this.orb = new PlayerOrb(el.querySelector(".p-cover-wrap"), { bpm: track.bpm ?? 100 });
    el.querySelector("[data-action='play']").addEventListener("click", () => this.orb.setPlaying(this.player.clock.playing));
  }

  /** Entrance reveals for any page section marked data-reveal (called after page content renders). */
  reveal() { Reveal.attachAll(); }

  #wire() {
    if (localStorage.getItem(STORAGE_KEYS.railCollapsed) === "1") this.app.dataset.rail = "collapsed";
    document.querySelector("[data-action='collapse']")?.addEventListener("click", () => {
      const collapsed = this.app.dataset.rail === "collapsed";
      this.app.dataset.rail = collapsed ? "expanded" : "collapsed";
      localStorage.setItem(STORAGE_KEYS.railCollapsed, collapsed ? "0" : "1");
    });
    const drawerBtn = document.querySelector("[data-action='drawer']");
    drawerBtn?.addEventListener("click", () => {
      const open = this.app.dataset.drawer === "open";
      this.app.dataset.drawer = open ? "closed" : "open";
      drawerBtn.setAttribute("aria-expanded", String(!open));
    });
    this.app.addEventListener("click", (e) => { if (e.target === this.app && this.app.dataset.drawer === "open") { this.app.dataset.drawer = "closed"; drawerBtn?.setAttribute("aria-expanded", "false"); } });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !/input|textarea/i.test(document.activeElement?.tagName ?? "")) { e.preventDefault(); document.querySelector(".search input")?.focus(); }
      if (e.key === "Escape" && this.app.dataset.drawer === "open") { this.app.dataset.drawer = "closed"; drawerBtn?.setAttribute("aria-expanded", "false"); }
    });
  }
}
