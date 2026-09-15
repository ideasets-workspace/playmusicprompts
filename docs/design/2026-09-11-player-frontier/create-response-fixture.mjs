import {writeFileSync} from 'node:fs';
// Diagnostic audio only: silence, low tones, distinct broad attacks, bright tones.
// This is never presented as a generated song or placed in the user's4173 library.
const rate=48000,seconds=32,count=rate*seconds,buffer=Buffer.alloc(44+count*2);
buffer.write('RIFF');buffer.writeUInt32LE(buffer.length-8,4);buffer.write('WAVEfmt ',8);
buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);
buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*2,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(count*2,40);
let seed=52141;
for(let i=0;i<count;i++){
 const t=i/rate,beat=t%.8,section=Math.floor(t/8),silence=t<2||t>30;
 seed=(Math.imul(seed,1664525)+1013904223)>>>0;
 const noise=seed/2147483648-1;
 const kick=Math.sin(2*Math.PI*(74*t-1.3*Math.exp(-beat*25)))*Math.exp(-beat*13)*.09;
 const transient=noise*Math.exp(-beat*36)*.065;
 const freq=[110,330,1760,660][section%4];
 const pad=(Math.sin(2*Math.PI*freq*t)+Math.sin(2*Math.PI*freq*1.5*t)*.4)*.018*(.6+.4*Math.sin(t*1.7));
 const sample=silence?0:(kick+transient+pad)*Math.min(1,(t-2)*20,(30-t)*20);
 buffer.writeInt16LE(Math.round(Math.max(-1,Math.min(1,sample))*32767),44+i*2);
}
writeFileSync(new URL('../../../website_html_templates/verification/scene-response-check.wav',import.meta.url),buffer);
console.log('Created32-second bounded diagnostic signal with real spectral attacks.');
