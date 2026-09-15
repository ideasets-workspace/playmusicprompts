const fs=require('node:fs'),old='docs/design/2026-09-12-aether-lab/',dir='docs/design/2026-09-12-beyond-living/';
let host=fs.readFileSync(old+'host-check.mjs','utf8').replaceAll('website_html_templates_lab','website_html_templates_beyond');
host=host.replace("import assert from 'node:assert/strict';","import assert from 'node:assert/strict';\nimport {createWorldTouch} from '../../../website_html_templates_beyond/world-touch.js';");
host=host.replace("'THREE','AETHER_DEFAULTS'","'createWorldTouch','THREE','AETHER_DEFAULTS'").replace("['createSceneCollection','createAudioFeatures'","['createWorldTouch','createSceneCollection','createAudioFeatures'");
host=host.replace('const deps={THREE:', 'const deps={createWorldTouch,THREE:');
host=host.replace('return {width:1,height:1,style:{}','return {classList:{toggle(){}},getBoundingClientRect(){return {left:0,top:0,width:1280,height:720};},width:1,height:1,style:{}');
fs.writeFileSync(dir+'host-check.mjs',host);
let controls=fs.readFileSync(old+'lab-controls-check.mjs','utf8').replaceAll('website_html_templates_lab','website_html_templates_beyond').replaceAll('pmp.lab.','pmp.beyond.').replaceAll('pmp-lab-local-audio','pmp-beyond-local-audio').replaceAll('4175','4176');
fs.writeFileSync(dir+'lab-controls-check.mjs',controls);
