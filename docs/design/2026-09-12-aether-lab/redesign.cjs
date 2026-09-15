const fs=require('node:fs');const root='website_html_templates_lab/';
let html=fs.readFileSync(root+'player-three.html','utf8');
html=html.replace('Aether Lab — PlayMusicPrompts','Beyond — PlayMusicPrompts Lab').replace('<link rel="stylesheet" href="lab-aether.css">','<link rel="stylesheet" href="lab-aether.css"><link rel="stylesheet" href="lab-immersive.css">');
html=html.replace('AETHER LAB · 001','BEYOND / THE LISTENING LAB');
html=html.replace('<a class="back-link" href="index.html"><span aria-hidden="true">↗</span> Back to Create</a>','<button class="lab-import import-trigger">Bring your sound <span aria-hidden="true">↗</span></button>');
const start=html.indexOf('  <section class="intro"'),end=html.indexOf('  <section class="stage"',start);
html=html.slice(0,start)+`  <section class="intro" aria-labelledby="room-heading">
    <div class="eyebrow"><span class="tiny-line"></span><span id="lab-world-category">01 / THE LIVING OCEAN</span></div>
    <h1 id="room-heading">Tidal<span>.</span></h1>
    <p class="lede" id="lab-world-line">Somewhere between sound and infinity.</p>
    <button class="lab-tune" id="lab-tune">Shape this world <span aria-hidden="true">↗</span></button>
  </section>
  <nav class="lab-worlds" aria-label="Immersive worlds">
    <div class="lab-worlds-heading"><span>CHOOSE YOUR ELSEWHERE</span><span>03 WORLDS</span></div>
    <div class="lab-world-options">
      <button data-lab-scene="tidal" aria-pressed="true"><span class="lab-world-art lab-art-tidal" aria-hidden="true"></span><span><small>01 / OCEAN</small><strong>Tidal</strong></span><i aria-hidden="true">↗</i></button>
      <button data-lab-scene="monolith" aria-pressed="false"><span class="lab-world-art lab-art-monolith" aria-hidden="true"></span><span><small>02 / ARCHITECTURE</small><strong>Monolith</strong></span><i aria-hidden="true">↗</i></button>
      <button data-lab-scene="aether" aria-pressed="false"><span class="lab-world-art lab-art-aether" aria-hidden="true"></span><span><small>03 / COSMOS</small><strong>Aether</strong></span><i aria-hidden="true">↗</i></button>
    </div>
  </nav>
  <div class="lab-palette"><button class="browse-worlds" id="worlds-toggle" aria-controls="worlds-panel" aria-expanded="false"><span class="lab-palette-dot" aria-hidden="true"></span><span>Change the atmosphere</span><span aria-hidden="true">↗</span></button><p class="selected-world" id="selected-world">Now in Nightfall</p></div>
`+html.slice(end);
html=html.replace('READY FOR YOUR SOUND','YOUR WORLD IS READY');
html=html.replace('<span>Scene</span><strong id="scene-choice-name">Record</strong>','<span>Collection</span><strong id="scene-choice-name">Tidal</strong>');
html=html.replace('<span class="overline" id="track-origin">YOUR NEXT OBSESSION</span><h2 id="track-title">Make this moment yours.</h2><span id="track-detail">Add a song to begin</span>','<span class="overline" id="track-origin">YOUR SOUND. YOUR UNIVERSE.</span><h2 id="track-title">Every world starts with a song.</h2><span id="track-detail">Drop your music anywhere to begin</span>');
fs.writeFileSync(root+'player-three.html',html);
const lp='memory/lanes/three-lab-20260912/task-ledgers/2026-09-12.json',ledger=JSON.parse(fs.readFileSync(lp));
const task=ledger.tasks.find(x=>x.task_id==='LAB-02');task.status='OPEN';task.exact_next_action='Replace rejected object-effect approach with full-screen3environment player; render each real environment and repair gaps';task.owner_feedback='Initial visual acceptance FAILED: same player plus one simpleeffect. Revision2 governs current deliverable.';task.scope='Completely redesigned labfrontstage; Tidal/Monolith/Aether immersiveenvironments; realaudio and coordinatedcontrols/Director';
task.subwork=['New full-screen player layout','Tidal ocean environment','Monolith architectural environment','Aether surrounding cosmic environment','Three-world navigation and control/Director integration','Actual first GPU render for every world and defect repair'].map((objective,i)=>({id:'LAB-02-'+(i+1),objective,status:'OPEN'}));
fs.writeFileSync(lp,JSON.stringify(ledger,null,2));
fs.appendFileSync('memory/REQUIREMENTS.md','\nREQ-AETHER-LAB revision2 — OPEN. Owner rejected initialsameplayer/simpleeffect. Now full-screennewplayer with3immersiveenvironments; preserveoriginal227files. Contract:docs/design/2026-09-12-aether-lab/revision-2.md.\n');
fs.appendFileSync('memory/STATE.md','\nLAB-02 revision2 ACTIVE afterowner rejectedinitialvisual. Newfrontstage+Tidal/Monolith/Aether environments underway; originalreadonly.\n');
