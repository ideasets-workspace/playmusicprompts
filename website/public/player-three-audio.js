export const EQ_FREQUENCIES = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
export const SOUND_PROFILES = {
  flat: {name:'Original', eq:[0,0,0,0,0,0,0,0,0,0]},
  warm: {name:'Warm & full', eq:[1,3,3,2,1,0,0,-1,-1,-2]},
  clarity: {name:'Vocal clarity', eq:[-2,-2,-1,-2,0,2,3,2,1,0]},
  bass: {name:'Deep bass', eq:[4,5,4,2,0,-1,0,1,1,0]},
  electronic: {name:'Electronic', eq:[3,4,2,0,-1,0,1,2,3,2]},
  acoustic: {name:'Acoustic', eq:[-1,0,1,1,0,1,2,1,2,1]},
  cinematic: {name:'Cinematic', eq:[3,3,1,0,-1,0,2,2,2,1]},
  soft: {name:'Soft focus', eq:[0,1,1,0,0,-1,-2,-2,-3,-3]}
};
const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
export function sanitizeSound(value={}) {
  if(!value||typeof value!=='object')value={};
  return {enabled:value.enabled!==false,eq:EQ_FREQUENCIES.map((_,i)=>clamp(value.eq?.[i],-12,12,0)),
    width:clamp(value.width,0,2,1),balance:clamp(value.balance,-1,1,0),mono:!!value.mono,
    preamp:clamp(value.preamp,-12,6,0),autoHeadroom:value.autoHeadroom!==false,
    ambience:clamp(value.ambience,0,.4,0),room:['studio','hall','space'].includes(value.room)?value.room:'studio',
    dynamics:['original','gentle','punch','night'].includes(value.dynamics)?value.dynamics:'original'};
}
export class AudioRack {
  constructor(context,initialSettings={}) {
    this.context=context;this.nodes=[];this.impulses=new Map();this.currentRoom=null;
    const node=kind=>{const n=context[kind]();this.nodes.push(n);return n;};
    this.input=node('createGain');this.input.channelCount=2;this.input.channelCountMode='explicit';this.input.channelInterpretation='speakers';
    this.headroom=node('createGain');this.input.connect(this.headroom);
    let previous=this.headroom;
    this.filters=EQ_FREQUENCIES.map((frequency,i)=>{
      const n=node('createBiquadFilter');n.type=i===0?'lowshelf':i===9?'highshelf':'peaking';
      n.frequency.value=Math.min(frequency,context.sampleRate*.47);n.Q.value=1.05;
      previous.connect(n);previous=n;return n;
    });
    this.probes=this.filters.map(filter=>{const p=node('createBiquadFilter');p.type=filter.type;p.frequency.value=filter.frequency.value;p.Q.value=filter.Q.value;return p;});
    this.dry=node('createGain');this.wet=node('createGain');this.convolver=node('createConvolver');
    this.roomInput=node('createGain');this.roomInput.channelCount=2;this.roomInput.channelCountMode='explicit';
    previous.connect(this.dry);this.dry.connect(this.roomInput);previous.connect(this.convolver);this.convolver.connect(this.wet);this.wet.connect(this.roomInput);
    const split=context.createChannelSplitter(2),merge=context.createChannelMerger(2);this.nodes.push(split,merge);this.roomInput.connect(split);
    this.matrix=Array.from({length:4},()=>node('createGain'));
    // LL, RL, LR, RR: conventional M/S width, then independent balance attenuation.
    split.connect(this.matrix[0],0);split.connect(this.matrix[1],1);split.connect(this.matrix[2],0);split.connect(this.matrix[3],1);
    this.matrix[0].connect(merge,0,0);this.matrix[1].connect(merge,0,0);this.matrix[2].connect(merge,0,1);this.matrix[3].connect(merge,0,1);
    this.compressor=node('createDynamicsCompressor');merge.connect(this.compressor);
    this.dynamicsDelay=node('createDelay');this.dynamicsDelay.delayTime.value=Math.floor(context.sampleRate*.006)/context.sampleRate;merge.connect(this.dynamicsDelay);
    this.dynamicsDry=node('createGain');this.dynamicsWet=node('createGain');this.dynamicsTrim=node('createGain');this.dynamicsDelay.connect(this.dynamicsDry);this.compressor.connect(this.dynamicsTrim);this.dynamicsTrim.connect(this.dynamicsWet);
    this.volume=node('createGain');this.fade=node('createGain');this.dynamicsDry.connect(this.volume);this.dynamicsWet.connect(this.volume);this.volume.connect(this.fade);this.fade.connect(context.destination);
    const meterSplit=context.createChannelSplitter(2);this.nodes.push(meterSplit);this.fade.connect(meterSplit);
    this.analysers=[0,1].map(channel=>{const a=node('createAnalyser');a.fftSize=2048;a.minDecibels=-90;a.maxDecibels=-12;a.smoothingTimeConstant=.68;meterSplit.connect(a,channel);return a;});
    this.frequency=this.analysers.map(a=>new Uint8Array(a.frequencyBinCount));this.timeDomain=this.analysers.map(a=>new Float32Array(a.fftSize));this.bins=new Uint8Array(1024);
    this.responseFrequencies=Float32Array.from({length:512},(_,i)=>20*Math.pow(context.sampleRate*.47/20,i/511));
    this.magnitude=new Float32Array(512);this.phase=new Float32Array(512);this.response=new Float32Array(512);
    this.metrics={leftDb:-96,rightDb:-96,peakDb:-96,correlation:1,reduction:0,headroomDb:0,sampleRate:context.sampleRate};
    this.initializing=true;this.apply(sanitizeSound(initialSettings));this.initializing=false;
  }
  ramp(param,value,time=.035){const now=this.context.currentTime;param.cancelScheduledValues(now);param.setTargetAtTime(value,now,time);}
  impulse(room){
    if(this.impulses.has(room))return this.impulses.get(room);
    const seconds={studio:.7,hall:2.4,space:4.8}[room],rate=this.context.sampleRate;
    const buffer=this.context.createBuffer(2,Math.ceil(rate*seconds),rate);let seed=87173;
    const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/1073741823-1;};
    for(let c=0;c<2;c++){const samples=buffer.getChannelData(c);let smooth=0;for(let i=0;i<samples.length;i++){
      const t=i/rate,lead=.011+c*.004;if(t<lead)continue;
      smooth=smooth*.65+random()*.35;samples[i]=smooth*Math.exp(-6.5*t/seconds)*Math.min(1,(t-lead)*150);
    }for(const [delay,amplitude]of [[.025,.42],[.047,.27],[.083,.17]]){const p=Math.floor((delay+c*.003)*rate);if(p<samples.length)samples[p]+=amplitude;}}
    this.impulses.set(room,buffer);return buffer;
  }
  apply(value){
    this.settings=sanitizeSound(value);const s=this.settings,active=s.enabled;
    const now=this.context.currentTime,gains=active?s.eq:EQ_FREQUENCIES.map(()=>0);this.response.fill(1);
    const before=this.filters.map(f=>f.gain.value),previousWidth=this.effectiveWidth??1,previousPreamp=this.effectivePreamp??0;
    const transitionResponse=new Float32Array(512).fill(1);
    this.filters.forEach((filter,i)=>{const probe=this.probes[i];probe.gain.value=Math.max(before[i],gains[i]);probe.getFrequencyResponse(this.responseFrequencies,this.magnitude,this.phase);for(let j=0;j<512;j++)transitionResponse[j]*=this.magnitude[j];probe.gain.value=gains[i];probe.getFrequencyResponse(this.responseFrequencies,this.magnitude,this.phase);for(let j=0;j<512;j++)this.response[j]*=this.magnitude[j];});
    const width=active?(s.mono?0:s.width):1,balance=active?s.balance:0,wet=active?s.ambience:0;
    const responseDb=Math.max(0,...this.response.map(m=>20*Math.log10(Math.max(m,1e-8))));
    const preamp=active?s.preamp:0,reserve=active&&s.autoHeadroom?Math.max(0,responseDb+preamp+20*Math.log10(Math.max(1,width))+(wet>0?2:0)):0;
    const nextGain=10**((preamp-reserve)/20),transitionDb=Math.max(0,...transitionResponse.map(m=>20*Math.log10(Math.max(m,1e-8))));
    // Reserve transition headroom before moving filters. Release only after their exact ramps finish.
    const transitionReserve=Math.max(0,transitionDb+Math.max(0,preamp,previousPreamp)+20*Math.log10(Math.max(1,width,previousWidth))+(wet>0?2:0));
    const hold=active&&s.autoHeadroom||this.previousAutoHeadroom?Math.min(this.headroom.gain.value,nextGain,10**(-transitionReserve/20)):Math.min(this.headroom.gain.value,nextGain);
    const change=(param,target)=>{if(this.initializing){param.value=target;return;}const current=param.value;param.cancelScheduledValues(now);param.setValueAtTime(current,now);param.setValueAtTime(current,now+.006);param.linearRampToValueAtTime(target,now+.076);};
    if(this.initializing)this.headroom.gain.value=nextGain;else{const current=this.headroom.gain.value;this.headroom.gain.cancelScheduledValues(now);this.headroom.gain.setValueAtTime(current,now);this.headroom.gain.linearRampToValueAtTime(hold,now+.004);this.headroom.gain.setValueAtTime(hold,now+.082);this.headroom.gain.linearRampToValueAtTime(nextGain,now+.22);}
    this.filters.forEach((filter,i)=>change(filter.gain,gains[i]));this.metrics.headroomDb=reserve;
    this.effectiveWidth=width;this.effectivePreamp=preamp;this.previousAutoHeadroom=active&&s.autoHeadroom;
    const a=(1+width)/2,b=(1-width)/2,left=balance>0?1-balance:1,right=balance<0?1+balance:1;
    [a*left,b*left,b*right,a*right].forEach((v,i)=>change(this.matrix[i].gain,v));
    if(this.currentRoom!==s.room){this.convolver.buffer=this.impulse(s.room);this.currentRoom=s.room;}
    change(this.dry.gain,1-wet*.5);change(this.wet.gain,wet);
    const dynamics=active?s.dynamics:'original';const profiles={original:[0,0,1,.003,.25],gentle:[-18,12,2.2,.018,.25],punch:[-14,8,3,.03,.14],night:[-30,18,5,.008,.35]};
    if(this.initializing||this.currentDynamics!==dynamics){
      // Fixed output trims compensate native automatic makeup without flattening attacks.
      // Reserve the worst profile's trim before moving parameters, then release after settling.
      const target={original:1,gentle:.63,punch:.61,night:.31}[dynamics],trim=this.dynamicsTrim.gain;
      if(this.initializing)trim.value=target;else{const current=trim.value;trim.cancelScheduledValues(now);trim.setValueAtTime(current,now);trim.linearRampToValueAtTime(Math.min(current,.31),now+.004);trim.setValueAtTime(Math.min(current,.31),now+.082);trim.linearRampToValueAtTime(target,now+.22);}
      const p=profiles[dynamics];['threshold','knee','ratio','attack','release'].forEach((key,i)=>change(this.compressor[key],p[i]));
      change(this.dynamicsDry.gain,dynamics==='original'?1:0);change(this.dynamicsWet.gain,dynamics==='original'?0:1);
      this.currentDynamics=dynamics;
    }
  }
  setVolume(value,muted){const target=muted?0:Math.max(0,Math.min(1,value));if(!this.volumeInitialized){this.volume.gain.value=target;this.volumeInitialized=true;}else this.ramp(this.volume.gain,target,.02);}
  setFade(value){this.ramp(this.fade.gain,Math.max(0,Math.min(1,value)),.035);}
  scheduleFade(remaining,seconds){const now=this.context.currentTime,param=this.fade.gain,duration=Math.max(.01,seconds),level=Math.min(1,remaining/duration);param.cancelScheduledValues(now);param.setValueAtTime(level,now);if(remaining>duration)param.setValueAtTime(1,now+remaining-duration);param.linearRampToValueAtTime(0,now+Math.max(.01,remaining));}
  cancelFade(){const now=this.context.currentTime,param=this.fade.gain,current=param.value;param.cancelScheduledValues(now);param.setValueAtTime(current,now);param.linearRampToValueAtTime(1,now+.06);}
  read(){
    let dot=0,sumL=0,sumR=0,peak=0;
    this.analysers.forEach((a,i)=>{a.getByteFrequencyData(this.frequency[i]);a.getFloatTimeDomainData(this.timeDomain[i]);});
    for(let i=0;i<1024;i++)this.bins[i]=Math.max(this.frequency[0][i],this.frequency[1][i]);
    for(let i=0;i<2048;i++){const l=this.timeDomain[0][i],r=this.timeDomain[1][i];sumL+=l*l;sumR+=r*r;dot+=l*r;peak=Math.max(peak,Math.abs(l),Math.abs(r));}
    const db=v=>Math.max(-96,20*Math.log10(Math.max(v,1e-8)));
    Object.assign(this.metrics,{leftDb:db(Math.sqrt(sumL/2048)),rightDb:db(Math.sqrt(sumR/2048)),peakDb:db(peak),correlation:sumL*sumR>1e-12?dot/Math.sqrt(sumL*sumR):1,reduction:this.settings.enabled&&this.settings.dynamics!=='original'?this.compressor.reduction:0});
    return this.bins;
  }
  dispose(){this.nodes.forEach(n=>n.disconnect());this.impulses.clear();}
}
