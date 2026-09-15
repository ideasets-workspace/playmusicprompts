import {Vector2} from 'three';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';

// Input and output are linear HDR. OutputPass owns tone mapping and display encoding.
const shader={
  name:'ListeningRoomOptics',
  uniforms:{
    tDiffuse:{value:null},
    uResolution:{value:new Vector2(1,1)},
    uDispersion:{value:0},uStreak:{value:0},uGrain:{value:0},
    uFrame:{value:0},uTaps:{value:8}
  },
  vertexShader:/* glsl */`
    varying vec2 vUv;
    void main(){
      vUv=uv;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }
  `,
  fragmentShader:/* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uDispersion,uStreak,uGrain,uFrame,uTaps;
    varying vec2 vUv;

    vec2 safeUv(vec2 p){
      vec2 edge=0.5/uResolution;
      return clamp(p,edge,vec2(1.0)-edge);
    }
    float directorLuma(vec3 c){return dot(c,vec3(0.2126,0.7152,0.0722));}
    vec3 highlights(vec2 p){
      vec3 c=max(texture2D(tDiffuse,safeUv(p)).rgb,vec3(0.0));
      float gate=smoothstep(0.55,1.4,directorLuma(c));
      float inside=step(0.0,p.x)*step(p.x,1.0)*step(0.0,p.y)*step(p.y,1.0);
      return min(c,vec3(8.0))*gate*inside;
    }
    float grainHash(vec2 p){
      vec3 q=fract(vec3(p.xyx)*0.1031);
      q+=dot(q,q.yzx+33.33);
      return fract((q.x+q.y)*q.z);
    }

    void main(){
      vec4 original=texture2D(tDiffuse,vUv);
      vec3 color=original.rgb;
      if(uDispersion>0.0){
        vec2 radial=(vUv-0.5)*2.0;
        float edgeFalloff=dot(radial,radial)*0.5;
        vec2 separation=radial*edgeFalloff*(0.003*uDispersion);
        color.r=texture2D(tDiffuse,safeUv(vUv+separation)).r;
        color.b=texture2D(tDiffuse,safeUv(vUv-separation)).b;
      }
      if(uStreak>0.0){
        vec3 flare=vec3(0.0);
        float weights=0.0;
        // Fixed shader ceiling with a uniform 4/8 pair budget; low quality retains the effect.
        for(int i=1;i<=8;i++){
          if(float(i)>uTaps)break;
          float fraction=float(i)/uTaps;
          float distanceUv=0.085*fraction*fraction;
          vec2 offset=vec2(distanceUv,0.0);
          float weight=exp(-2.5*fraction);
          flare+=(highlights(vUv+offset)+highlights(vUv-offset))*weight;
          weights+=2.0*weight;
        }
        color+=flare/max(weights,0.0001)*(0.32*uStreak);
      }
      if(uGrain>0.0){
        vec2 cell=floor(vUv*uResolution);
        float noise=grainHash(cell+vec2(uFrame*13.17,uFrame*7.31))-0.5;
        float luma=max(directorLuma(color),0.0);
        float shadowGate=smoothstep(0.005,0.12,luma);
        float amplitude=0.045*sqrt(min(luma,1.0)+0.002);
        color=max(vec3(0.0),color+noise*amplitude*shadowGate*uGrain);
      }
      gl_FragColor=vec4(color,original.a);
    }
  `
};

function bounded(value){return typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;}
function pixels(value){return typeof value==='number'&&Number.isFinite(value)?Math.max(1,Math.min(32768,value)):1;}

export function createOpticsPass(){
  const pass=new ShaderPass(shader),uniforms=pass.uniforms;
  pass.enabled=false;
  pass.material.depthTest=false;
  pass.material.depthWrite=false;
  let disposed=false;

  // EffectComposer calls this with actual render-target pixels, including its pixel ratio.
  pass.setSize=(width,height)=>{
    if(!disposed)uniforms.uResolution.value.set(pixels(width),pixels(height));
  };
  const render=pass.render.bind(pass);
  pass.render=(renderer,writeBuffer,readBuffer,...args)=>{
    if(disposed)return;
    // Also honor a custom-sized input buffer when another pass or capture path changes it.
    if(readBuffer?.width>0&&readBuffer?.height>0)pass.setSize(readBuffer.width,readBuffer.height);
    render(renderer,writeBuffer,readBuffer,...args);
  };

  function update({dispersion=0,streak=0,grain=0,time,motion=true,quality='auto'}={}){
    if(disposed)return;
    uniforms.uDispersion.value=bounded(dispersion);
    uniforms.uStreak.value=bounded(streak);
    uniforms.uGrain.value=bounded(grain);
    uniforms.uTaps.value=quality==='low'?4:8;
    if(motion!==false&&typeof time==='number'&&Number.isFinite(time)){
      // A finite 24-frame film cadence avoids numerical drift over very long sessions.
      uniforms.uFrame.value=Math.floor((Math.max(0,time)%(4096/24))*24);
    }
    pass.enabled=uniforms.uDispersion.value>0||uniforms.uStreak.value>0||uniforms.uGrain.value>0;
  }

  const free=pass.dispose.bind(pass);
  function dispose(){
    if(disposed)return;
    disposed=true;pass.enabled=false;uniforms.tDiffuse.value=null;free();
  }
  pass.dispose=dispose;
  return {pass,update,dispose};
}
