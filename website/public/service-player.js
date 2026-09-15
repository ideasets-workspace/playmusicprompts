/* Main-player controls, system media keys and TV keys share one live transport. */
(() => {
  'use strict';
  const P=window.PMP,A=window.PMP_APP,ads=window.PMPAds,audio=P.audio;
  const originalPlay=P.actions.play,originalPrevious=P.actions.previous,originalNext=P.actions.next;
  const seekTo=time=>{if(!ads?.active&&Number.isFinite(time)&&Number.isFinite(audio.duration))audio.currentTime=Math.max(0,Math.min(audio.duration,time));};
  const transport={
    getAudio:()=>audio,
    toggle:()=>{ads?.userGesture(audio);if(ads?.active)return ads.toggle();if(P.state.nextWaiting){const session=window.PMPListening?.getState();window.PMPListening?.setPlayIntent(!session?.playing);return;}window.PMPListening?.setPlayIntent(audio.paused);return originalPlay();},
    play:()=>{ads?.userGesture(audio);if(ads?.active)return ads.resume();window.PMPListening?.setPlayIntent(true);if(P.state.nextWaiting)return;if(!P.state.current)return originalPlay();if(audio.paused)return audio.play().then(()=>P.syncMediaMetadata?.()).catch(()=>{window.PMPListening?.setPlayIntent(false);A.notify('Press play to listen.');});},
    pause:()=>{window.PMPListening?.setPlayIntent(false);return ads?.active?ads.pause():audio.pause();},
    next:()=>ads?.active?ads.skip():originalNext(),
    previous:()=>{ads?.cancel('previous');return originalPrevious();},
    seek:delta=>seekTo(audio.currentTime+delta),seekTo,
    stop:()=>{window.PMPListening?.setPlayIntent(false);ads?.cancel('stop');audio.pause();seekTo(0);},
    back:()=>{if(P.$('#modal')?.open){P.closeDialog();return true;}return false;}
  };
  P.actions.play=transport.toggle;P.actions.previous=transport.previous;P.actions.next=transport.next;
  window.PMPPlatform?.attach(transport);
  // Replace handlers installed by player.js; closures there bypass the current ad transport.
  if('mediaSession' in navigator){
    const handlers={play:transport.play,pause:transport.pause,stop:transport.stop,previoustrack:transport.previous,nexttrack:transport.next,
      seekto:event=>transport.seekTo(event.seekTime),seekbackward:event=>transport.seek(-(event.seekOffset??5)),seekforward:event=>transport.seek(event.seekOffset??5)};
    for(const [name,handler] of Object.entries(handlers))try{navigator.mediaSession.setActionHandler(name,handler);}catch{/* Browser may not expose every system control. */}
  }
  function syncMediaState(){if('mediaSession' in navigator)try{navigator.mediaSession.playbackState=ads?.active?(ads.getState().paused?'paused':'playing'):(audio.paused?'paused':'playing');}catch{}}
  ads?.configure({audio});
  document.addEventListener('click',()=>ads?.userGesture(audio),{capture:true});
  document.addEventListener('pmp:ads-state',syncMediaState);
  for(const event of ['play','pause','ended'])audio.addEventListener(event,syncMediaState);
  audio.addEventListener('volumechange',()=>ads?.setVolume(audio.muted?0:audio.volume));
  P.pageHooks.push(()=>window.PMPPlatform?.refresh());
})();
