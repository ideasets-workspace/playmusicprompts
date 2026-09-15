import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createAudioFeatures} from '../../../website_html_templates/player-three-features.js';
const checks=[];
function test(name,fn){fn();checks.push(name);}
const bins=new Uint8Array(1024),step=(engine,extra={})=>engine.update({frequency:bins,sampleRate:48000,fftSize:2048,dt:1/60,active:true,audible:true,...extra});
test('True silence has no invented pulse or spectrum',()=>{const f=createAudioFeatures();bins.fill(0);for(let i=0;i<240;i++){const out=step(f);assert.equal(out.onset,false);assert.equal(out.pulse,0);assert.ok(out.spectrum.every(v=>v===0));}});
test('A sustained signal has no recurring fake beat',()=>{const f=createAudioFeatures();bins.fill(180);let onsets=0;for(let i=0;i<360;i++)onsets+=Number(step(f).onset);assert.equal(onsets,0);});
test('Separated real spectral attacks produce separate pulses',()=>{const f=createAudioFeatures();bins.fill(0);for(let i=0;i<60;i++)step(f);let onsets=0;for(let j=0;j<4;j++){bins.fill(220);for(let i=0;i<8;i++)onsets+=Number(step(f).onset);bins.fill(0);for(let i=0;i<37;i++)onsets+=Number(step(f).onset);}assert.equal(onsets,4);});
test('Rapid fluctuation respects transient refractory interval',()=>{const f=createAudioFeatures();bins.fill(0);for(let i=0;i<60;i++)step(f);let last=-Infinity;for(let i=0;i<120;i++){bins.fill(i%2?0:230);if(step(f).onset){assert.ok(i-last>=12);last=i;}}});
test('Pause and mute remove pulse and cannot generate new onset',()=>{const f=createAudioFeatures();bins.fill(0);for(let i=0;i<60;i++)step(f);bins.fill(220);assert.equal(step(f).onset,true);assert.equal(step(f,{active:false}).pulse,0);assert.equal(step(f,{audible:false}).onset,false);});
test('Response zero disables spectral excitation and pulse',()=>{const f=createAudioFeatures();bins.fill(0);for(let i=0;i<60;i++)step(f);bins.fill(255);for(let i=0;i<60;i++){const out=step(f,{reactivity:0});assert.equal(out.onset,false);assert.equal(out.pulse,0);assert.ok(out.spectrum.every(v=>v===0));}});
test('High frequencies map to a brighter spectral centroid than bass',()=>{const f=createAudioFeatures();bins.fill(0);bins.fill(200,2,12);let low;for(let i=0;i<180;i++)low=step(f).centroid;bins.fill(0);bins.fill(200,250,650);let high;for(let i=0;i<180;i++)high=step(f).centroid;assert.ok(high>low+.5);});
test('Silent spectrum decays rather than retaining a frozen signal',()=>{const f=createAudioFeatures();bins.fill(255);for(let i=0;i<60;i++)step(f);bins.fill(0);let out;for(let i=0;i<180;i++)out=step(f);assert.ok(out.spectrum.every(v=>v<.0001));});
test('Bad inputs and format changes stay bounded with a stable output buffer',()=>{const f=createAudioFeatures();let out=step(f),array=out.spectrum;for(const sampleRate of [NaN,8000,44100,96000]){out=step(f,{sampleRate,fftSize:NaN,dt:NaN,frequency:Float32Array.from([NaN,Infinity,-100,9999]),reactivity:NaN});assert.equal(out.spectrum,array);assert.ok(array.every(v=>Number.isFinite(v)&&v>=0&&v<=1));assert.ok(Number.isFinite(out.centroid));assert.equal(out.onset,false);}});
fs.writeFileSync(new URL('./feature-checks.json',import.meta.url),JSON.stringify({passed:checks.length,checks,scope:'Pure analyser-feature behavior; synthetic inputs are test fixtures, not product music or visual QA.'},null,2));
console.log(JSON.stringify({passed:checks.length,checks},null,2));
