import {writeFileSync} from 'node:fs';
// Isolated local-browser verification only; this is a test signal, not music.
const rate=48000,length=rate*90,data=Buffer.alloc(44+length*2);
data.write('RIFF');data.writeUInt32LE(data.length-8,4);data.write('WAVEfmt ',8);data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(1,22);data.writeUInt32LE(rate,24);data.writeUInt32LE(rate*2,28);data.writeUInt16LE(2,32);data.writeUInt16LE(16,34);data.write('data',36);data.writeUInt32LE(length*2,40);
for(let i=0;i<length;i++){const t=i/rate;data.writeInt16LE(Math.round(4000*Math.sin(2*Math.PI*220*t)*(.65+.35*Math.sin(t*8))),44+i*2);}
writeFileSync(new URL('../verification/motion-check.wav',import.meta.url),data);
