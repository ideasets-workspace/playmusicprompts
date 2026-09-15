import * as THREE from 'three';
import {createSceneCollection} from './player-three-models.js';
import {createAudioFeatures} from './player-three-features.js';
import {getWorld} from './player-three-worlds.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {createOpticsPass} from './player-three-optics.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {VISUAL_DEFAULTS,sanitizeVisualSettings} from './player-three-visual-settings.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export function createListeningRoom(host,onError){
  let look={...VISUAL_DEFAULTS},performanceLook={optics:{dispersion:0,streak:0,grain:0},camera:{mode:'still',amount:.35}};
  let cameraPhase=0,cameraZoomFactor=1,cameraRoll=0,cameraUserUntil=0,cameraHandback=1;const cameraOffset=new THREE.Vector3(),captureRequests=new Set();
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setClearColor(0x09090f);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);
  const transitionCanvas=document.createElement('canvas');transitionCanvas.setAttribute('aria-hidden','true');
  Object.assign(transitionCanvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',display:'none'});host.append(transitionCanvas);
  let transitionAnimation=null,pendingModel=null;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x09090f);scene.fog=new THREE.FogExp2(0x09090f,.057);scene.environmentIntensity=.38;
  const camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(5.2,3.8,9.8);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,2.1,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=6;controls.maxDistance=17;controls.minPolarAngle=.55;controls.maxPolarAngle=1.53;controls.rotateSpeed=.5;controls.zoomSpeed=.6;controls.enableZoom=matchMedia('(pointer:fine)').matches;
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
  const hemi=new THREE.HemisphereLight(0xbcb1ef,0x100a1c,.6);scene.add(hemi);
  const key=new THREE.DirectionalLight(0xe6dfff,1.6);key.position.set(3,8,4);scene.add(key);
  const purple=new THREE.PointLight(0xaf70ff,35,16,2);purple.position.set(-3,3,2);scene.add(purple);
  const cyan=new THREE.PointLight(0x63dfed,24,15,2);cyan.position.set(3,2,-2);scene.add(cyan);
  const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.55,.65,.8);composer.addPass(bloom);
  const grade=new ShaderPass({name:'ListeningRoomGrade',uniforms:{tDiffuse:{value:null},saturation:{value:1},vignette:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D tDiffuse;uniform float saturation;uniform float vignette;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.2126,.7152,.0722));c.rgb=max(vec3(0.),mix(vec3(l),c.rgb,saturation));vec2 p=(vUv-.5)*1.4142;c.rgb*=1.-vignette*smoothstep(.12,1.,dot(p,p));gl_FragColor=c;}'});
  grade.enabled=false;composer.addPass(grade);const optics=createOpticsPass();composer.addPass(optics.pass);composer.addPass(new OutputPass());
  const reflector=new Reflector(new THREE.PlaneGeometry(60,60),{clipBias:.003,textureWidth:768,textureHeight:768,color:0x34303e});reflector.rotation.x=-Math.PI/2;reflector.position.y=-.12;scene.add(reflector);
  reflector.material.uniforms.reflectionStrength={value:1};
  reflector.material.fragmentShader=reflector.material.fragmentShader.replace('uniform vec3 color;','uniform vec3 color;\nuniform float reflectionStrength;').replace('blendOverlay( base.rgb, color )','blendOverlay( base.rgb, color ) * reflectionStrength');
  const metal=new THREE.MeshStandardMaterial({color:0x282333,metalness:.95,roughness:.27});
  const dark=new THREE.MeshStandardMaterial({color:0x09070e,metalness:.88,roughness:.22});
  const lilac=new THREE.MeshStandardMaterial({color:0xd4b6ff,emissive:0xb56aff,emissiveIntensity:2.2,metalness:.5,roughness:.25});
  const ice=new THREE.MeshStandardMaterial({color:0xb3f5ff,emissive:0x58cced,emissiveIntensity:1.4,metalness:.3,roughness:.3});
  const deck=new THREE.Group();scene.add(deck);
  function cylinder(radius,height,y,material){const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius+.035,height,128),material);m.position.y=y;deck.add(m);return m;}
  cylinder(2.62,.18,.03,metal);cylinder(2.54,.035,.139,lilac);cylinder(2.56,.095,.20,dark);cylinder(2.40,.025,.258,metal);
  for(const radius of [2.3,2.21,2.12]){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.006,8,128),ice);ring.rotation.x=Math.PI/2;ring.position.y=.276;deck.add(ring);}
  const sculpture=new THREE.Group();sculpture.position.y=2.75;sculpture.rotation.y=-.15;scene.add(sculpture);
  const shell=new THREE.Mesh(new THREE.TorusGeometry(1.78,.16,32,192),metal);sculpture.add(shell);
  const ring1=new THREE.Mesh(new THREE.TorusGeometry(1.88,.023,12,192),lilac);ring1.position.z=.015;sculpture.add(ring1);
  const ring2=new THREE.Mesh(new THREE.TorusGeometry(1.615,.016,10,192),ice);ring2.position.z=.04;sculpture.add(ring2);
  const backing=new THREE.Mesh(new THREE.CylinderGeometry(1.61,1.61,.13,128),dark);backing.rotation.x=Math.PI/2;sculpture.add(backing);
  const art=new THREE.TextureLoader().load('assets/stations.png');art.colorSpace=THREE.SRGBColorSpace;art.repeat.set(1/3,1);art.offset.set(0,0);art.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const expandedArt=new THREE.TextureLoader().load('assets/worlds-six-atlas.png');expandedArt.colorSpace=THREE.SRGBColorSpace;expandedArt.anisotropy=art.anisotropy;
  const artMaterial=new THREE.MeshBasicMaterial({map:art,color:0xa79cc1});
  const face=new THREE.Mesh(new THREE.CircleGeometry(1.48,128),artMaterial);face.position.z=.078;sculpture.add(face);
  const glass=new THREE.Mesh(new THREE.CircleGeometry(1.49,128),new THREE.MeshPhysicalMaterial({color:0xa0a4c7,metalness:.35,roughness:.05,transparent:true,opacity:.1,clearcoat:1,depthWrite:false}));glass.position.z=.087;sculpture.add(glass);
  const grooves=new THREE.Group();for(let i=0;i<13;i++){const g=new THREE.Mesh(new THREE.TorusGeometry(.61+i*.062,.0018,4,128),new THREE.MeshBasicMaterial({color:0xd5c8f9,transparent:true,opacity:.095}));g.position.z=.096;grooves.add(g);}sculpture.add(grooves);
  const hub=new THREE.Mesh(new THREE.TorusGeometry(.26,.009,8,64),lilac);hub.position.z=.10;sculpture.add(hub);
  const hubDisc=new THREE.Mesh(new THREE.CircleGeometry(.248,48),new THREE.MeshStandardMaterial({color:0x11101a,metalness:.9,roughness:.2}));hubDisc.position.z=.11;sculpture.add(hubDisc);
  const pin=new THREE.Mesh(new THREE.SphereGeometry(.048,16,12),metal);pin.position.z=.145;sculpture.add(pin);
  const rotor=new THREE.Group();rotor.add(face,grooves,hubDisc,pin);sculpture.add(rotor);
  const marker=new THREE.Mesh(new THREE.BoxGeometry(.015,.16,.01),ice);marker.position.set(.37,.03,.115);marker.rotation.z=-.25;rotor.add(marker);
  const spectrum=new THREE.InstancedMesh(new THREE.BoxGeometry(.022,1,.027),lilac,160);spectrum.instanceMatrix.setUsage(THREE.DynamicDrawUsage);sculpture.add(spectrum);
  const dummy=new THREE.Object3D();const amplitudes=new Float32Array(160);const magnitudes=new Float32Array(160),recordAmplitudes=new Float32Array(160),visualSpectrum=new Float32Array(64);let recordEnergy=0;
  const orbitGroup=new THREE.Group();sculpture.add(orbitGroup);
  for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(2.24+i*.18,.008,8,192),i===1?ice:lilac);ring.rotation.set(.3+i*.4,.25+i*.5,.12+i*.5);orbitGroup.add(ring);}orbitGroup.visible=false;
  const flow=new THREE.Group();scene.add(flow);flow.visible=false;
  const flowLines=[];for(let j=0;j<20;j++){const positions=new Float32Array(100*3);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:j%3?0xae82ee:0x6ed8eb,transparent:true,opacity:.18+j/55}));flow.add(line);flowLines.push(line);}
  const particlesGeometry=new THREE.BufferGeometry(),particleCount=400;const particlePositions=new Float32Array(particleCount*3);let seed=1189;function random(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
  for(let i=0;i<particleCount;i++){particlePositions[i*3]=(random()-.5)*18;particlePositions[i*3+1]=random()*9+.4;particlePositions[i*3+2]=(random()-.5)*12-3;}
  particlesGeometry.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));
  const dust=new THREE.Points(particlesGeometry,new THREE.PointsMaterial({color:0xbca1e5,size:.016,transparent:true,opacity:.45,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(dust);
  const architecture=new THREE.Group();scene.add(architecture);
  for(let i=0;i<6;i++){const col=new THREE.Mesh(new THREE.BoxGeometry(.085,12,.6),dark);col.position.set((i-2.5)*3.8,4,-5-Math.abs(i-2.5)*.5);architecture.add(col);}
  const arch=new THREE.Mesh(new THREE.TorusGeometry(6,.14,16,120,Math.PI),metal);arch.position.set(0,.5,-5);architecture.add(arch);
  const beam=new THREE.Mesh(new THREE.TorusGeometry(6.2,.008,8,120,Math.PI),ice);beam.position.copy(arch.position);architecture.add(beam);
  let motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,intensity=.65,quality='auto',form='halo',frequency=null,sampleRate=48000,fftSize=2048,active=false,audible=false,spin=true,rpm=8,spinVelocity=0,autoOrbit=false,reactivity=1,weather='stars',disposed=false,lost=false,frames=0,energy=0,phase=0,last=performance.now(),lastRender=0,autoLow=false,slowFrames=0,started=performance.now();
  let currentWorld='night',model='record';
  const collection=createSceneCollection(scene),features=createAudioFeatures(),recordFog=scene.fog;
  function showModel(){const record=model==='record';sculpture.visible=deck.visible=architecture.visible=dust.visible=record;scene.fog=record?recordFog:null;reflector.visible=record&&quality!=='low'&&!autoLow;orbitGroup.visible=record&&form==='orbit';flow.visible=record&&form==='wave';spectrum.visible=record&&form!=='wave';controls.enableRotate=collection.view?.orbit!==false;controls.minPolarAngle=record?.55:.05;controls.maxPolarAngle=record?1.53:Math.PI-.05;}
  function applyModel(id){model=collection.select(id);diagnostics.model=model;host.dataset.scene=model;showModel();reset();}
  function changeScene(){
    if(pendingModel===null)return;
    transitionAnimation?.cancel();transitionCanvas.style.display='none';
    if(motion&&frames>1){
      // Capture the outgoing real render once. Audio and analyser continue while this
      // frame dissolves over the incoming world; no second permanent WebGL context.
      composer.render();transitionCanvas.width=renderer.domElement.width;transitionCanvas.height=renderer.domElement.height;
      transitionCanvas.getContext('2d').drawImage(renderer.domElement,0,0);
      transitionCanvas.style.display='block';
      const animation=transitionCanvas.animate([{opacity:1},{opacity:0}],{duration:650,easing:'cubic-bezier(.22,.7,.2,1)',fill:'forwards'});
      transitionAnimation=animation;animation.finished.then(()=>{if(transitionAnimation===animation)transitionCanvas.style.display='none';}).catch(()=>{});
    }
    const next=pendingModel;pendingModel=null;applyModel(next);
  }
  const diagnostics={ready:true,frames:0,energy:0,peak:0,quality:'auto',form:'halo',motion,webgl:true,revision:THREE.REVISION};
  let framedAspect=0;function setSize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const ratio=quality==='low'||autoLow?1:Math.min(devicePixelRatio,quality==='high'?2:1.5);renderer.setPixelRatio(ratio);renderer.setSize(w,h);composer.setPixelRatio(ratio);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(Math.abs(framedAspect-camera.aspect)>.02){framedAspect=camera.aspect;reset();}bloom.enabled=quality!=='low'&&!autoLow;reflector.visible=model==='record'&&quality!=='low'&&!autoLow;}
  function undoCameraPerformance(){camera.position.sub(cameraOffset);cameraOffset.set(0,0,0);camera.zoom/=cameraZoomFactor;cameraZoomFactor=1;camera.rotation.z-=cameraRoll;cameraRoll=0;camera.updateProjectionMatrix();}
  function cameraGesture(){undoCameraPerformance();cameraUserUntil=performance.now()+5000;cameraHandback=0;}
  controls.addEventListener('start',cameraGesture);controls.addEventListener('end',cameraGesture);
  function choreographCamera(dt,time){
    if(motion&&active){cameraPhase+=dt;if(time>=cameraUserUntil)cameraHandback=Math.min(1,cameraHandback+dt);}
    const {mode}=performanceLook.camera;const amount=performanceLook.camera.amount*cameraHandback;if(mode==='still'||amount===0)return;
    if(mode==='breathe'||collection.view?.orbit===false){cameraZoomFactor=1+Math.sin(cameraPhase*.29)*amount*.07;camera.zoom*=cameraZoomFactor;camera.updateProjectionMatrix();if(mode==='arc'){cameraRoll=Math.sin(cameraPhase*.19)*amount*.035;camera.rotation.z+=cameraRoll;}}
    else{const offset=camera.position.clone().sub(controls.target),desired=offset.clone().applyAxisAngle(new THREE.Vector3(0,1,0),Math.sin(cameraPhase*.19)*amount*.22);desired.y+=Math.sin(cameraPhase*.27)*amount*.16;cameraOffset.copy(desired).sub(offset);camera.position.add(cameraOffset);camera.lookAt(controls.target);}
  }
  const resize=new ResizeObserver(setSize);resize.observe(host);setSize();
  function reset(){
    undoCameraPerformance();
    const aspect=host.clientWidth/Math.max(1,host.clientHeight),view=collection.view;
    camera.zoom=view?.aspectFit===false?look.framing:1;camera.updateProjectionMatrix();
    if(model==='record'){
      const distance=Math.max(10.8,3.25/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*aspect))/look.framing;
      controls.target.set(0,2.25,0);camera.position.set(4.6,1.7,10).normalize().multiplyScalar(distance).add(controls.target);controls.maxDistance=Math.max(25,distance*1.7);controls.minDistance=distance*.55;
    }else{
      const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
      const fit=view?.aspectFit===false?0:Math.max((view?.fitRadius??3.2)/tangent,(view?.fitWidth??view?.fitRadius??3.2)/(tangent*aspect));
      const distance=THREE.MathUtils.clamp(Math.max(view?.distance??10,fit)/(view?.aspectFit===false?1:look.framing),view?.minDistance??0,Math.max(view?.maxDistance??Infinity,fit));controls.target.fromArray(view?.target??[0,2.75,0]);camera.position.fromArray(view?.direction??[.1,.04,1]).normalize().multiplyScalar(distance).add(controls.target);
      controls.minDistance=view?.minDistance??distance*.65;controls.maxDistance=Math.max(view?.maxDistance??distance*1.7,distance);
    }
    controls.update();
  }reset();
  function tick(time){if(disposed)return;requestAnimationFrame(tick);if(lost||document.hidden)return;const limit=quality==='low'||autoLow?32:16;if(time-lastRender<limit)return;const dt=Math.min(.05,(time-last)/1000);last=time;lastRender=time;
    undoCameraPerformance();changeScene();
    const visualDt=dt*look.motionSpeed;
    let sum=0,peak=0,bass=0,mid=0,treble=0,bassCount=0,midCount=0,trebleCount=0;for(let i=0;i<160;i++){const hz=45*Math.pow(16000/45,i/159),bin=Math.min((frequency?.length||1)-1,Math.round(hz*fftSize/sampleRate));const v=active&&audible&&frequency?frequency[bin]/255:0;magnitudes[i]=v;sum+=v;peak=Math.max(peak,v);amplitudes[i]+=(v-amplitudes[i])*Math.min(1,dt*(v>amplitudes[i]?14:7)/look.smoothing);if(hz<250){bass+=amplitudes[i];bassCount++;}else if(hz<2000){mid+=amplitudes[i];midCount++;}else{treble+=amplitudes[i];trebleCount++;}}
    const signalBass=bass/bassCount,signalMid=mid/midCount,signalTreble=treble/trebleCount;
    bass=bass/bassCount*reactivity*look.bassGain;mid=mid/midCount*reactivity*look.midGain;treble=treble/trebleCount*reactivity*look.trebleGain;
    energy+=(sum/160-energy)*Math.min(1,dt*8/look.smoothing);if(motion){phase+=visualDt;recordEnergy=energy*reactivity*(look.bassGain+look.midGain+look.trebleGain)/3;for(let i=0;i<160;i++){const hz=45*Math.pow(16000/45,i/159);recordAmplitudes[i]=amplitudes[i]*reactivity*(hz<250?look.bassGain:hz<2000?look.midGain:look.trebleGain);}}
    if(model==='record'){for(let i=0;i<160;i++){const a=i/160*Math.PI*2;const v=recordAmplitudes[i];const length=.035+v*.61*look.recordSpectrum;const radius=1.98+length/2;dummy.position.set(Math.sin(a)*radius,Math.cos(a)*radius,0);dummy.rotation.set(0,0,-a);dummy.scale.set(1,length,1);dummy.updateMatrix();spectrum.setMatrixAt(i,dummy.matrix);}spectrum.instanceMatrix.needsUpdate=true;}
    if(motion){sculpture.position.y=2.75+Math.sin(phase*.45)*.045;orbitGroup.rotation.y=phase*.08;orbitGroup.rotation.z=phase*.03;dust.rotation.y=phase*.006;}
    const targetSpin=motion&&active?(model==='record'?(spin?rpm:0):8)*Math.PI*2/60:0;spinVelocity+=(targetSpin-spinVelocity)*(1-Math.exp(-dt*3.2));if(!motion)spinVelocity=0;if(Math.abs(spinVelocity)<.0001)spinVelocity=0;if(model==='record')rotor.rotation.z-=spinVelocity*visualDt;controls.autoRotate=motion&&autoOrbit&&active&&controls.enableRotate;controls.autoRotateSpeed=look.orbitSpeed;
    if(motion&&(weather==='ember'||weather==='rain')){const positions=particlesGeometry.attributes.position;for(let i=0;i<particleCount;i++){let y=positions.getY(i)+visualDt*(weather==='rain'?-3.2:.6);if(y<.1)y=9;if(y>9)y=.1;positions.setY(i,y);}positions.needsUpdate=true;}
    const reactive=recordEnergy;lilac.emissiveIntensity=.85+intensity*1.5+reactive*1.1;ice.emissiveIntensity=.8+intensity*.8+reactive*.4;purple.intensity=20+intensity*18+reactive*15;bloom.strength=(model==='record'?.2+intensity*.65:(collection.view?.bloom??.4)*(.55+intensity*.7))*look.bloom;
    const musical=features.update({frequency,sampleRate,fftSize,dt,active,audible,reactivity,smoothing:look.smoothing});
    for(let i=0;i<64;i++){const hz=40*Math.pow(Math.min(16000,sampleRate*.48)/40,i/64);visualSpectrum[i]=musical.spectrum[i]*(hz<250?look.bassGain:hz<2000?look.midGain:look.trebleGain); }
    collection.update({time:phase,dt:visualDt,bass,mid,treble,energy:recordEnergy,motion,intensity,active,spinVelocity,...musical,spectrum:visualSpectrum,pulse:musical.pulse*look.pulseGain,onset:look.pulseGain>0&&musical.onset,look,quality:autoLow?'low':quality});
    if(model==='record'&&form==='wave'){for(let j=0;j<flowLines.length;j++){const p=flowLines[j].geometry.attributes.position;for(let i=0;i<100;i++){const x=(i/99-.5)*11;const v=recordAmplitudes[Math.min(159,Math.floor(i/99*159))]*look.recordSpectrum;p.setXYZ(i,x,.45+j*.085+Math.sin(x*.8+j*.18+phase*.4)*(.05+v*.7),1+j*.11);}p.needsUpdate=true;} }
    controls.update(visualDt);choreographCamera(visualDt,time);optics.update({...performanceLook.optics,time:phase,motion,quality:autoLow?'low':quality});composer.render();
    for(const request of captureRequests){if(request.encoding)continue;request.encoding=true;const settle=(blob,error)=>{if(!captureRequests.delete(request))return;clearTimeout(request.timeout);if(error||!blob)request.reject(error||new Error('This browser could not save the frame.'));else request.resolve(blob);};try{renderer.domElement.toBlob(blob=>settle(blob),'image/png');}catch(error){settle(null,error);}}
    frames++;Object.assign(diagnostics,{frames,energy,peak,bass,mid,treble,model,bloomAvailable:bloom.enabled,collection:collection.diagnostics,spinAngle:rotor.rotation.z,spinVelocity,rpm,spin,autoOrbit,cameraAzimuth:controls.getAzimuthalAngle(),world:currentWorld,reactivity,look:{...look},signals:{bass:signalBass,mid:signalMid,treble:signalTreble,energy,pulse:musical.pulse,centroid:musical.centroid},performance:{...performanceLook,cameraPhase}});
    if(quality==='auto'&&!autoLow&&time-started>4000&&frames>30){if(dt>.04)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);if(slowFrames>100){autoLow=true;setSize();diagnostics.adaptiveBattery=true;}}
  }requestAnimationFrame(tick);
  function loss(e){e.preventDefault();lost=true;diagnostics.webgl=false;onError('The 3D scene paused. Your music can keep playing. Reload to restore the scene.');}renderer.domElement.addEventListener('webglcontextlost',loss);
  return{diagnostics,setVisualSettings(value,{continuous=false}={}){const previous=look;look=sanitizeVisualSettings(value);renderer.toneMappingExposure=look.exposure;bloom.radius=look.bloomRadius;grade.uniforms.saturation.value=look.saturation;grade.uniforms.vignette.value=look.vignette;grade.enabled=look.saturation!==1||look.vignette!==0;recordFog.density=look.recordFog;reflector.material.uniforms.reflectionStrength.value=look.recordReflect;particlesGeometry.setDrawRange(0,Math.round(particleCount*look.particles));dust.material.opacity=.45*look.particleGlow;if(previous.framing!==look.framing){if(continuous){undoCameraPerformance();if(collection.view?.aspectFit===false)camera.zoom=look.framing;else {const offset=camera.position.clone().sub(controls.target),distance=THREE.MathUtils.clamp(offset.length()*previous.framing/look.framing,controls.minDistance,controls.maxDistance);camera.position.copy(offset.normalize().multiplyScalar(distance).add(controls.target));}camera.updateProjectionMatrix();}else reset();}},
  setPerformance(value={}){const o=value.optics||{},c=value.camera||{},bound=n=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;performanceLook={optics:{dispersion:bound(o.dispersion),streak:bound(o.streak),grain:bound(o.grain)},camera:{mode:['still','breathe','arc'].includes(c.mode)?c.mode:'still',amount:bound(c.amount)}};},
  captureFrame(){if(disposed||lost)return Promise.reject(new Error('The scene is not ready to capture.'));return new Promise((resolve,reject)=>{const request={resolve,reject,timeout:null};request.timeout=setTimeout(()=>{captureRequests.delete(request);reject(new Error('Keep the player visible, then try saving the frame again.'));},6000);captureRequests.add(request);});},setModel(id){if(id===model&&pendingModel===null)return;if(frames<2||!motion){pendingModel=null;applyModel(id);}else pendingModel=id;},setAudio(data,rate,size,isPlaying,isAudible=true){frequency=data;sampleRate=rate;fftSize=size;active=isPlaying;audible=isAudible;},setWorld(id){const w=getWorld(id);currentWorld=w.id;weather=w.weather;collection.setPalette(w);const texture=w.rows===1?art:expandedArt;texture.repeat.set(1/3,1/w.rows);texture.offset.set(w.column/3,w.rows===1?0:(1-w.row)/2);artMaterial.map=texture;lilac.emissive.setHex(w.light);ice.emissive.setHex(w.rim);artMaterial.color.setHex(w.tint);purple.color.setHex(w.light);cyan.color.setHex(w.rim);dust.material.color.setHex(w.light);dust.material.size=weather==='ember'?.025:weather==='rain'?.021:.016;for(const l of flowLines)l.material.color.setHex(w.light);},setSpin(value,speed){spin=!!value;rpm=Math.max(0,Math.min(45,Number(speed)||0));},setAutoOrbit(value){autoOrbit=!!value;},setReactivity(value){reactivity=Math.max(0,Math.min(2,Number(value)||0));},setForm(value){form=value;diagnostics.form=value;showModel();},setMotion(value){motion=value;diagnostics.motion=value;if(!motion){transitionAnimation?.cancel();transitionCanvas.style.display='none';changeScene();}},setIntensity(value){intensity=value;},setQuality(value){quality=value;autoLow=false;slowFrames=0;diagnostics.quality=value;setSize();},reset,dispose(){disposed=true;for(const request of captureRequests){clearTimeout(request.timeout);request.reject(new Error('The listening room closed before capture.'));}captureRequests.clear();transitionAnimation?.cancel();transitionCanvas.remove();resize.disconnect();controls.dispose();collection.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});art.dispose();expandedArt.dispose();env.dispose();reflector.getRenderTarget().dispose();grade.dispose();optics.dispose();bloom.dispose();composer.dispose();renderer.dispose();}};
}
