/** Monolith: a composed architectural environment. Rendering, audio and camera belong to the host. */
export function createMonolithAsset(THREE) {
  const group = new THREE.Group(); group.name = 'monolith-environment';
  const geometries = new Set(), materials = new Set(), lights = [];
  const bounded = (value, min, max, fallback) => typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  const read = (source, key, min, max, fallback) => bounded(Object.getOwnPropertyDescriptor(source && typeof source === 'object' ? source : {}, key)?.value, min, max, fallback);
  const defaults = {form:'silk',flow:1,spread:1,turbulence:.6,glow:1,depth:.65,focus:.45};
  const u = {
    mlTime:{value:0}, mlBass:{value:0}, mlMid:{value:0}, mlTreble:{value:0}, mlEnergy:{value:0},
    mlGlow:{value:1}, mlDepth:{value:.65}, mlFocus:{value:.45}, mlTurbulence:{value:.6},
    mlPrimary:{value:new THREE.Color(0x91d7e4)}, mlSecondary:{value:new THREE.Color(0xb4a0e8)}, mlWarm:{value:new THREE.Color(0xf3d9b5)},
    mlFront:{value:new Float32Array([-90,-90,-90,-90])}, mlFrontEnergy:{value:new Float32Array(4)}
  };
  const common = `
    uniform float mlTime, mlBass, mlMid, mlTreble, mlEnergy, mlGlow, mlDepth, mlFocus, mlTurbulence;
    uniform vec3 mlPrimary, mlSecondary, mlWarm;
    uniform float mlFront[4], mlFrontEnergy[4];
    float mlWave(float depth) {
      float value = 0.0;
      for (int i=0; i<4; i++) {float p=(depth-mlFront[i])*.33; value+=exp(-p*p)*mlFrontEnergy[i];}
      return min(value,1.6);
    }
    vec3 mlMist(vec3 color, vec3 position) {
      float distanceFog=1.0-exp(-max(-position.z-1.0,0.0)*(.003+mlDepth*.014));
      vec3 mist=mix(mlPrimary,mlSecondary,.42)*(.020+mlDepth*.035);
      return mix(color,mist,min(distanceFog,.64));
    }
  `;
  const vertex = `
    varying vec3 mlPosition; varying vec2 mlUv;
    void main() {
      mlUv=uv; vec4 mlLocal=vec4(position,1.0);
      #ifdef USE_INSTANCING
        mlLocal=instanceMatrix*mlLocal;
      #endif
      vec4 mlWorld=modelMatrix*mlLocal; mlPosition=mlWorld.xyz;
      gl_Position=projectionMatrix*viewMatrix*mlWorld;
    }
  `;
  function shader(fragment, options={}) {
    const material=new THREE.ShaderMaterial({uniforms:u,vertexShader:vertex,fragmentShader:common+'\nvarying vec3 mlPosition; varying vec2 mlUv;\n'+fragment,...options});
    materials.add(material); return material;
  }
  function ownGeometry(geometry) {geometries.add(geometry);return geometry;}
  function add(name,geometry,material) {const mesh=new THREE.Mesh(ownGeometry(geometry),material);mesh.name=name;group.add(mesh);return mesh;}
  function physical(parameters) {
    // These are genuine PBR surfaces: the host's PMREM room environment and actual lights
    // drive the specular reflections. Only distance haze and tiny mineral seams are authored here.
    const material=new THREE.MeshPhysicalMaterial({color:0x334453,roughness:.34,metalness:.8,clearcoat:.42,clearcoatRoughness:.28,iridescence:.22,iridescenceIOR:1.35,iridescenceThicknessRange:[190,390],envMapIntensity:.62,...parameters});
    material.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms,u);
      shader.vertexShader='varying vec3 mlPosition;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
        vec4 mlWorld=vec4(transformed,1.0);
        #ifdef USE_INSTANCING
          mlWorld=instanceMatrix*mlWorld;
        #endif
        mlPosition=(modelMatrix*mlWorld).xyz;
      `);
      shader.fragmentShader=common+'\nvarying vec3 mlPosition;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
        float mlGrain=.97+.03*sin(mlPosition.y*177.0+sin(mlPosition.z*24.0));
        outgoingLight*=mlGrain;
        // A bounded mineral highlight curve retains the PBR reflection shape and its hue,
        // while reserving high-dynamic-range bloom for the actual luminous aperture/seams.
        float mlPeak=max(max(outgoingLight.r,outgoingLight.g),outgoingLight.b);
        outgoingLight*=.92/(.92+mlPeak);
        outgoingLight+=mlPrimary*mlWave(mlPosition.z)*.065*mlGlow;
        outgoingLight=mlMist(outgoingLight,mlPosition);
        #include <opaque_fragment>
      `);
    };
    material.customProgramCacheKey=()=> 'monolith-pbr-mineral-v2';materials.add(material);return material;
  }
  const basalt=physical({color:0x344d60,metalness:.82,roughness:.33});
  const shadow=physical({color:0x293242,roughness:.41,metalness:.73});
  const plinthMaterial=physical({color:0x243344,roughness:.30,metalness:.91,clearcoat:.58});
  const bronze=physical({color:0x746552,metalness:.87,roughness:.42,iridescence:.1});
  const lightMaterial=shader(`
    void main() {
      float depth=-mlPosition.z;
      float wave=mlWave(mlPosition.z);
      float current=.5+.5*sin(depth*.25-mlTime*.48+mlPosition.y*.18+mlMid*.7);
      vec3 color=mix(mlPrimary,mlWarm,.18+.12*current);
      color*=mlGlow*(.46+current*.30+wave*1.6+mlTreble*.12);
      gl_FragColor=vec4(mlMist(color,mlPosition),1.0);
    }
  `);
  // A beveled octagonal cross section makes actual broad faces and narrow polished shoulders.
  const shape=new THREE.Shape();
  const outline=[[-.5,-.5],[.32,-.5],[.5,-.32],[.5,.40],[.36,.5],[-.35,.5],[-.5,.34]];
  outline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
  const slabGeometry=ownGeometry(new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:1}));
  slabGeometry.translate(0,0,-.5); slabGeometry.computeBoundingSphere();
  const box=ownGeometry(new THREE.BoxGeometry(1,1,1));
  const architecture=new THREE.InstancedMesh(slabGeometry,basalt,36);architecture.name='monumental-inner-canyon';architecture.instanceMatrix.setUsage(THREE.DynamicDrawUsage);architecture.frustumCulled=false;group.add(architecture);
  const distant=new THREE.InstancedMesh(slabGeometry,shadow,36);distant.name='outer-strata';distant.instanceMatrix.setUsage(THREE.DynamicDrawUsage);distant.frustumCulled=false;group.add(distant);
  const suspended=new THREE.InstancedMesh(slabGeometry,basalt,16);suspended.name='suspended-tectonic-blocks';suspended.instanceMatrix.setUsage(THREE.DynamicDrawUsage);suspended.frustumCulled=false;group.add(suspended);
  const seams=new THREE.InstancedMesh(box,lightMaterial,36);seams.name='recessed-vertical-light-seams';seams.instanceMatrix.setUsage(THREE.DynamicDrawUsage);seams.frustumCulled=false;group.add(seams);
  const platforms=new THREE.Group();platforms.name='stepped-obsidian-ground';group.add(platforms);
  // The ground is a set of full surfaces with thickness and visible step risers, never a grid of lines.
  for(let i=0;i<9;i++) {
    const step=new THREE.Mesh(box,plinthMaterial);step.position.set((i%3-1)*.18,-4.2+i*.105,9-i*7.7);step.scale.set(19.2-i*.72,.68,8.8);platforms.add(step);
    const inset=new THREE.Mesh(box,lightMaterial);inset.position.set(i%2?3.15:-3.15,step.position.y+.347,step.position.z-3.84);inset.scale.set(4.3,.018,.026);platforms.add(inset);
  }
  const gate=new THREE.Group();gate.name='the-luminous-aperture';group.add(gate);
  for(const side of [-1,1]) {
    const slab=new THREE.Mesh(slabGeometry,bronze);slab.position.set(side*3.1,7,-47);slab.scale.set(3.5,25,4.8);slab.rotation.z=-side*.035;gate.add(slab);
    const edge=new THREE.Mesh(box,lightMaterial);edge.position.set(side*1.18,6.3,-44.5);edge.scale.set(.035,23,.1);gate.add(edge);
  }
  const lintel=new THREE.Mesh(slabGeometry,shadow);lintel.position.set(0,20,-47);lintel.scale.set(12,3,5);gate.add(lintel);
  const portal=add('depth-lit-aperture',new THREE.PlaneGeometry(4.8,27),shader(`
    void main() {
      vec2 p=mlUv-.5;
      float width=.044+(1.0-mlFocus)*.075;
      float core=exp(-p.x*p.x/(width*width));
      float edge=pow(max(0.0,1.0-abs(p.y)*2.0),.42);
      float silk=.89+.11*sin(mlPosition.y*.76+mlTime*.33+mlMid*.8);
      vec3 color=mix(mlPrimary,mlWarm,.40+core*.40);
      color*=core*edge*(1.30+mlBass*.27+mlWave(mlPosition.z)*.25)*mlGlow*silk;
      gl_FragColor=vec4(color,core*edge*.9);
    }
  `,{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));portal.position.set(0,7,-46.7);
  const sky=add('deep-spatial-haze',new THREE.PlaneGeometry(160,100),shader(`
    void main() {
      vec2 p=mlUv-.5;
      float horizon=exp(-pow((p.y+.20)*9.0,2.0));
      float opening=exp(-pow(p.x*11.0,2.0)-pow((p.y+.02)*3.8,2.0));
      float layers=.5+.5*sin(p.x*11.0+p.y*7.0+sin(p.y*29.0+mlTime*.015)*.2);
      vec3 color=mix(vec3(.006,.012,.021),mlSecondary*.033,clamp(p.y+.6,0.,1.));
      color+=mlPrimary*(horizon*.029+opening*.05)*( .3+mlDepth*.7);
      color+=mlSecondary*layers*.005*mlTurbulence;
      gl_FragColor=vec4(color,1.0);
    }
  `,{depthWrite:false}));sky.position.set(0,17,-62);sky.renderOrder=-20;
  // Real lights reveal broad face normals across the long environment, independently of near host lights.
  const fill=new THREE.HemisphereLight(0x97cddd,0x1b122b,.30);group.add(fill);lights.push(fill);
  const key=new THREE.DirectionalLight(0xc0eaf3,1.15);key.position.set(-11,17,4);key.target.position.set(0,1,-24);group.add(key,key.target);lights.push(key);
  const rim=new THREE.DirectionalLight(0xac91dd,.82);rim.position.set(13,8,-34);rim.target.position.set(-5,3,-18);group.add(rim,rim.target);lights.push(rim);
  const apertureLight=new THREE.PointLight(0xf9dfb7,110,34,2);apertureLight.position.set(0,4,-39);group.add(apertureLight);lights.push(apertureLight);
  let seed=17321;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const count=1000,positions=new Float32Array(count*3),seeds=new Float32Array(count);
  for(let i=0;i<count;i++){positions[i*3]=(random()-.5)*17;positions[i*3+1]=random()*17-3.5;positions[i*3+2]=9-random()*61;seeds[i]=random();}
  const dustGeometry=ownGeometry(new THREE.BufferGeometry());dustGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));dustGeometry.setAttribute('mlSeed',new THREE.BufferAttribute(seeds,1));
  const dustMaterial=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:common+`
      attribute float mlSeed; varying float mlAlpha;varying float mlColor;
      void main() {
        vec3 p=position; p.x+=sin(mlTime*.13+mlSeed*30.0)*(.10+mlTurbulence*.22);
        p.y+=sin(mlTime*.20+mlSeed*21.0)*.36;
        vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp((17.0+mlSeed*27.0)*(1.0+mlTreble*.5)/max(-mv.z,1.0),.65,3.4);
        mlAlpha=(.10+mlSeed*.35)*smoothstep(1.0,5.0,-mv.z)*(1.0-smoothstep(36.0,70.0,-mv.z));mlColor=mlSeed;
      }
    `,fragmentShader:common+`
      varying float mlAlpha;varying float mlColor;
      void main() {float r=length(gl_PointCoord-.5)*2.0;if(r>1.0)discard;
        vec3 color=mix(mlWarm,mlPrimary,mlColor)*mlGlow;
        gl_FragColor=vec4(color,exp(-r*r*4.0)*mlAlpha);
      }
    `});materials.add(dustMaterial);
  const dust=new THREE.Points(dustGeometry,dustMaterial);dust.name='airborne-mineral-motes';dust.frustumCulled=false;group.add(dust);
  const transform=new THREE.Object3D();
  const forms=new THREE.Vector3(1,0,0);let form='silk',settings={...defaults},phase=0,updates=0,onsets=0,frontIndex=0,disposed=false,quality='auto';
  function matrix(mesh,index,x,y,z,sx,sy,sz,rx,ry,rz) {transform.position.set(x,y,z);transform.scale.set(sx,sy,sz);transform.rotation.set(rx,ry,rz);transform.updateMatrix();mesh.setMatrixAt(index,transform.matrix);}
  function pose() {
    const expansion=settings.spread,nova=forms.y,helix=forms.z;
    for(let i=0;i<36;i++) {
      const row=Math.floor(i/2),side=i%2?1:-1,z=8-row*3.15;
      const seed=(row*13+side*3)%7, rhythm=Math.sin(row*1.72+side*.64);
      const shift=Math.sin(phase*.22+row*.39+side)*settings.turbulence*.10+u.mlBass.value*Math.sin(row*.63)*.14;
      const width=2.35+(row%4)*.46,height=12+(row%5)*1.5+rhythm*2;
      const x=side*(5.75+row*.075+rhythm*.45)*expansion+side*nova*(1.0+Math.sin(row*.72)*.6);
      const y=height*.5-3.5+shift+helix*Math.sin(row*.8+side)*1.4;
      const ry=side*(.14+rhythm*.085+nova*.30),rz=side*(.02+rhythm*.025)+helix*Math.sin(row*.67)*.10;
      matrix(architecture,i,x,y,z,width,height,1.3+(row%3)*.35,0,ry,rz);
      // Recessed light is deliberately asymmetric; it belongs to the architecture, not every edge.
      matrix(seams,i,x-side*width*.36,y-.2,z+.76,.030,height*.88,.06,0,ry,rz);
      matrix(distant,i,side*(10.2+row*.16)*expansion,8.8+rhythm*2+shift*.4,z-1.4,5.7,23+(row%3)*2,2.4,0,-side*.25,side*rhythm*.045);
    }
    for(let i=0;i<16;i++) {
      const side=i%2?1:-1,row=Math.floor(i/2),z=2-row*6.2;
      const reach=(5.2+Math.sin(i*3.2))*settings.spread-helix*1.6;
      matrix(suspended,i,side*reach,8.2+(i%3)*2.0+nova*1.2+Math.sin(phase*.16+i)*settings.turbulence*.16,z,5.0+helix*3.2,1.7+(i%3)*.6,2.7,0,side*.22,side*(.10+helix*.10));
    }
    for(const mesh of [architecture,distant,suspended,seams])mesh.instanceMatrix.needsUpdate=true;
    gate.scale.x=1+nova*.30;gate.rotation.z=helix*.055;
    portal.scale.x=1+nova*.30;
  }
  function update(frame={}) {
    if(disposed)return;
    const input=frame.labLook||{}, nextForm=Object.getOwnPropertyDescriptor(input,'form')?.value;
    const targetForm=['silk','nova','helix'].includes(nextForm)?nextForm:'silk';
    const changed=targetForm!==form;form=targetForm;
    settings={form,flow:read(input,'flow',0,2,1),spread:read(input,'spread',.6,1.5,1),turbulence:read(input,'turbulence',0,1.5,.6),glow:read(input,'glow',.2,1.8,1),depth:read(input,'depth',0,1,.65),focus:read(input,'focus',0,1,.45)};
    const look=frame.look||{};
    u.mlGlow.value=settings.glow*read(look,'particleGlow',.2,2,1);u.mlDepth.value=settings.depth;u.mlFocus.value=settings.focus;u.mlTurbulence.value=settings.turbulence;
    quality=['low','auto','high'].includes(frame.quality)?frame.quality:'auto';
    distant.count=quality==='low'?18:36;suspended.count=quality==='low'?8:16;
    dustGeometry.setDrawRange(0,Math.floor((quality==='low'?220:count)*read(look,'particles',0,1,1)));
    const pulseGain=read(look,'pulseGain',0,2,1);if(pulseGain===0)u.mlFrontEnergy.value.fill(0);
    if(frame.motion!==false) {
      const dt=bounded(frame.dt,0,.05*read(look,'motionSpeed',.1,2.5,1),0),ease=1-Math.exp(-dt*5);
      const targets=[form==='silk'?1:0,form==='nova'?1:0,form==='helix'?1:0];
      forms.x+=(targets[0]-forms.x)*ease;forms.y+=(targets[1]-forms.y)*ease;forms.z+=(targets[2]-forms.z)*ease;
      for(const [name,key] of [['mlBass','bass'],['mlMid','mid'],['mlTreble','treble'],['mlEnergy','energy']]) {
        const target=frame.active?bounded(frame[key],0,1.8,0):0;u[name].value+=(target-u[name].value)*ease;
      }
      phase+=dt*settings.flow;u.mlTime.value=phase;
      for(let i=0;i<4;i++){u.mlFront.value[i]+=dt*23;u.mlFrontEnergy.value[i]*=Math.exp(-dt*.45);}
      if(frame.active&&frame.onset&&pulseGain>0&&dt>0){u.mlFront.value[frontIndex]=-48;u.mlFrontEnergy.value[frontIndex]=(.6+bounded(frame.pulse,0,1,0)*.8)*pulseGain;frontIndex=(frontIndex+1)%4;onsets++;}
      updates++;
    } else if(changed) forms.set(form==='silk'?1:0,form==='nova'?1:0,form==='helix'?1:0);
    // A static edit is always applied, including when every automatic clock and envelope is held.
    pose();apertureLight.intensity=110*settings.glow*(.85+settings.focus*.45+u.mlBass.value*.13);
  }
  function setPalette(world={}) {
    if(disposed)return;
    const hex=(value,fallback)=>typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(0xffffff,Math.round(value))):fallback;
    // Keep the architecture's authored cool-white mineral material while changing the lighting world.
    u.mlPrimary.value.setHex(hex(world.rim,0x91d7e4)).lerp(new THREE.Color(0xaddef0),.36);
    u.mlSecondary.value.setHex(hex(world.light,0xb4a0e8)).lerp(new THREE.Color(0xb9a8d6),.3);
    key.color.copy(u.mlPrimary.value).lerp(new THREE.Color(0xffffff),.65);rim.color.copy(u.mlSecondary.value);fill.color.copy(u.mlPrimary.value).lerp(new THREE.Color(0xffffff),.35);
  }
  update({motion:false});
  return {group,update,setPalette,
    view:{target:[0,3.1,-20],direction:[0,.016,1],distance:32,aspectFit:false,minDistance:30,maxDistance:33,orbit:false,bloom:.35},
    diagnostics(){return{name:'Monolith',phase,updates,onsets,form,formBlend:forms.toArray(),settings:{...settings},quality,disposed,signals:{bass:u.mlBass.value,mid:u.mlMid.value,treble:u.mlTreble.value,energy:u.mlEnergy.value},fronts:Array.from(u.mlFront.value),frontEnergy:Array.from(u.mlFrontEnergy.value),instances:architecture.count+distant.count+suspended.count+seams.count,motes:dustGeometry.drawRange.count,geometryResources:geometries.size,materialResources:materials.size,lighting:'PBR with inherited environment reflections and real scene lights',camera:'composed fixed environment'};},
    dispose(){if(disposed)return;disposed=true;for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();for(const mesh of [architecture,distant,suspended,seams])mesh.dispose();for(const light of lights)light.dispose?.();group.clear();}
  };
}
