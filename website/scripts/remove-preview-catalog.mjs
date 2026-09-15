import fs from 'node:fs';
for(const file of ['index.html','explore.html','library.html','radio.html','login.html']){
  const name='public/'+file;let html=fs.readFileSync(name,'utf8');
  html=html.replace(/<article class="song-card\b[^>]*>[\s\S]*?<\/article>/g,'');
  if(file==='index.html')html=html.replace('<div class="song-grid five">','<div id="owned-discovery" class="song-grid five">');
  fs.writeFileSync(name,html);
}
