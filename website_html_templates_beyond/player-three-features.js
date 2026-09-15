// Visual features derived from the player's real post-processing analyser.
// Spectral flux finds transients; it does not estimate BPM or invent a beat clock.
export function createAudioFeatures() {
  const size=64, previous=new Float32Array(size), spectrum=new Float32Array(size);
  const edges=new Int32Array(size+1);
  const frame={spectrum,pulse:0,onset:false,centroid:0,flux:0};
  let format='',age=0,cooldown=0,meanFlux=0,variance=0;
  const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
  function update({frequency,sampleRate=48000,fftSize=2048,dt=1/60,active=false,audible=false,reactivity=1,smoothing=1}={}) {
    dt=Math.max(0,Math.min(.1,finite(dt)));
    const gain=Math.max(0,Math.min(2,finite(reactivity,1)));
    const enabled=active&&audible&&frequency?.length>0;
    const key=`${frequency?.length}:${sampleRate}:${fftSize}`;
    if(key!==format){
      format=key; previous.fill(0);age=0;meanFlux=variance=0;
      const rate=Math.max(1000,finite(sampleRate,48000));
      const maxHz=Math.min(16000,rate*.48),length=frequency?.length||1;
      for(let i=0;i<=size;i++)edges[i]=Math.max(0,Math.min(length-1,Math.floor(40*Math.pow(maxHz/40,i/size)*Math.max(32,finite(fftSize,2048))/rate)));
    }
    let flux=0,total=0,weighted=0;
    const response=Math.max(.25,Math.min(2.5,finite(smoothing,1)));
    const attack=1-Math.exp(-dt*24/response),release=1-Math.exp(-dt*7/response);
    for(let i=0;i<size;i++){
      let value=0;
      if(enabled){
        const from=edges[i],to=Math.max(from,edges[i+1]-1);
        for(let bin=from;bin<=to;bin++)value+=Math.max(0,Math.min(255,finite(frequency[bin])))/255;
        value/=to-from+1;
      }
      flux+=Math.max(0,value-previous[i]);previous[i]=value;
      total+=value;weighted+=value*i/(size-1);
      const target=Math.min(1,value*gain);
      spectrum[i]+=(target-spectrum[i])*(target>spectrum[i]?attack:release);
    }
    flux/=size;
    frame.onset=false;cooldown=Math.max(0,cooldown-dt);
    frame.pulse*=Math.exp(-dt*5.5);
    if(enabled){
      age+=dt;
      const threshold=Math.max(.011,meanFlux+Math.sqrt(Math.max(0,variance))*1.65);
      if(age>.18&&cooldown===0&&flux>threshold&&total/size>.035&&gain>0){
        frame.onset=true;frame.pulse=Math.min(1,Math.max(.3,flux/Math.max(.035,threshold*2))*gain);cooldown=.20;
      }
      const delta=flux-meanFlux,adapt=1-Math.exp(-dt*1.8);
      meanFlux+=delta*adapt;variance+=(delta*delta-variance)*adapt;
    }else{
      // No trailing recorded beat on pause, mute, empty queue or a fresh start.
      age=0;cooldown=0;meanFlux=variance=0;frame.pulse=0;
    }
    if(gain===0)frame.pulse=0;
    frame.centroid+=(total>.001?weighted/total-frame.centroid:-frame.centroid)*(1-Math.exp(-dt*6));
    frame.flux=enabled?flux:0;
    return frame;
  }
  return {update};
}
