// A single pointer owns a world gesture. The existing render loop samples it.
export function createWorldTouch(canvas,{onGesture=()=>{},eventRoot=globalThis}={}){
 let requested=false,available=false,motion=true,pointer=null,disposed=false;
 let targetX=0,targetY=0,x=0,y=0,strength=0,serial=0;
 const frame={x:0,y:0,strength:0,active:false,serial:0};
 const enabled=()=>requested&&available&&motion&&!disposed;
 const bound=n=>Number.isFinite(n)?Math.max(-1,Math.min(1,n)):0;
 function coordinate(event){const r=canvas.getBoundingClientRect();if(r.width<=0||r.height<=0)return false;targetX=bound((event.clientX-r.left)/r.width*2-1);targetY=bound(1-(event.clientY-r.top)/r.height*2);return true;}
 function finish(event){if(pointer===null||event?.pointerId!==undefined&&event.pointerId!==pointer)return;const old=pointer;pointer=null;try{if(canvas.hasPointerCapture(old))canvas.releasePointerCapture(old);}catch{}onGesture();}
 function down(event){if(!enabled()||pointer!==null||event.isPrimary===false||event.button!==0||!coordinate(event))return;pointer=event.pointerId;serial++;x=targetX;y=targetY;try{canvas.setPointerCapture(pointer);}catch{}event.preventDefault();event.stopImmediatePropagation();onGesture();}
 function move(event){if(pointer!==event.pointerId||!enabled())return;if(coordinate(event)){event.preventDefault();event.stopImmediatePropagation();}}
 function up(event){if(pointer!==event.pointerId)return;event.preventDefault();event.stopImmediatePropagation();finish(event);}
 function refresh(){if(!enabled()){finish();strength=0;}canvas.classList.toggle('world-touch-enabled',enabled());}
 const options={capture:true,passive:false};
 for(const [name,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',finish]])canvas.addEventListener(name,fn,options);
 eventRoot.addEventListener?.('blur',finish);eventRoot.addEventListener?.('pagehide',finish);
 return{
  setEnabled(value){requested=!!value;refresh();},setAvailable(value){available=!!value;refresh();},setMotion(value){motion=!!value;refresh();},
  get state(){return{requested,available,motion,enabled:enabled(),active:pointer!==null,x,y,strength,serial};},
  sample(dt){const step=Math.min(.05,Math.max(0,Number.isFinite(dt)?dt:0));if(enabled()){const ease=1-Math.exp(-step*18);x+=(targetX-x)*ease;y+=(targetY-y)*ease;strength+=((pointer===null?0:1)-strength)*(1-Math.exp(-step*(pointer===null?5:14)));if(strength<.0001)strength=0;}else strength=0;Object.assign(frame,{x,y,strength,active:enabled()&&pointer!==null,serial});return frame;},
  reset(){finish();strength=0;},
  dispose(){if(disposed)return;finish();disposed=true;refresh();for(const [name,fn]of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',finish]])canvas.removeEventListener(name,fn,options);eventRoot.removeEventListener?.('blur',finish);eventRoot.removeEventListener?.('pagehide',finish);}
 };
}
