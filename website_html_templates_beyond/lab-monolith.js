/** Living Monolith: articulated mineral architecture. Rendering, audio and camera belong to the host. */
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
    mlFront:{value:new Float32Array([-90,-90,-90,-90])}, mlFrontEnergy:{value:new Float32Array(4)},
    mlCoreOpen:{value:.2},mlTouch:{value:new THREE.Vector3()}
  };
  const common = `
    uniform float mlTime, mlBass, mlMid, mlTreble, mlEnergy, mlGlow, mlDepth, mlFocus, mlTurbulence,mlCoreOpen;
    uniform vec3 mlTouch;
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

  // A suspended twelve-leaf mineral iris is built as machinery with thickness, pivots and real
  // linkages. The canyon remains the environment; this is its articulated architectural heart.
  const mechanism=new THREE.Group();mechanism.name='living-mineral-iris';mechanism.position.set(0,2.3,-17.5);group.add(mechanism);
  const silver=physical({color:0x768b96,metalness:.93,roughness:.29,clearcoat:.3,iridescence:.13});
  const dynamicInstances=[];
  function coreInstances(name,geometry,material,count,parent=mechanism){
    const mesh=new THREE.InstancedMesh(geometry,material,count);mesh.name=name;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;parent.add(mesh);dynamicInstances.push(mesh);return mesh;
  }
  const bladeShape=new THREE.Shape();
  [[-.29,.18],[.35,.16],[.47,-.59],[.29,-1.05],[.11,-1.17],[.075,-2.66],[-.17,-2.38],[-.52,-.88],[-.43,-.25]].forEach(([x,y],i)=>i?bladeShape.lineTo(x,y):bladeShape.moveTo(x,y));bladeShape.closePath();
  const bladeGeometry=ownGeometry(new THREE.ExtrudeGeometry(bladeShape,{depth:.21,steps:1,bevelEnabled:true,bevelSize:.055,bevelThickness:.04,bevelSegments:1,curveSegments:1}));bladeGeometry.translate(0,0,-.105);
  const blades=coreInstances('twelve-articulated-iris-leaves',bladeGeometry,basalt,12);
  const bladeInlays=coreInstances('blade-bronze-inlays',box,bronze,12);
  const bladeLights=coreInstances('blade-light-etchings',box,lightMaterial,24);
  const frameBeams=coreInstances('layered-hexagonal-truss',slabGeometry,silver,18);
  const sockets=coreInstances('iris-pivot-sockets',ownGeometry(new THREE.CylinderGeometry(.19,.19,.30,12)),bronze,12);
  const struts=coreInstances('articulated-piston-barrels',ownGeometry(new THREE.CylinderGeometry(.072,.072,1,8)),shadow,12);
  const rods=coreInstances('articulated-piston-rods',ownGeometry(new THREE.CylinderGeometry(.030,.030,1,8)),silver,12);
  const teeth=coreInstances('machined-outer-lamellae',slabGeometry,bronze,72);
  const pins=coreInstances('precision-fastener-heads',ownGeometry(new THREE.CylinderGeometry(.051,.051,.052,8)),silver,72);
  const coreShards=coreInstances('fractured-central-crystal',slabGeometry,silver,9);
  const coreFaults=coreInstances('light-between-crystal-facets',box,lightMaterial,9);
  const foundation=new THREE.Group();foundation.name='suspended-core-foundation';group.add(foundation);
  const base= new THREE.Mesh(slabGeometry,plinthMaterial);base.position.set(0,-2.55,-17.5);base.scale.set(6.8,.65,5.3);foundation.add(base);
  const baseLayer=new THREE.Mesh(slabGeometry,basalt);baseLayer.position.set(0,-2.89,-17.5);baseLayer.scale.set(7.7,.22,5.9);foundation.add(baseLayer);
  const pedestal=new THREE.Mesh(slabGeometry,bronze);pedestal.position.set(0,-1.5,-18.5);pedestal.scale.set(.8,1.7,.9);foundation.add(pedestal);
  // Side pylons anchor the mechanism to the canyon without covering its central aperture.
  for(const side of [-1,1]){
    const anchor=new THREE.Mesh(slabGeometry,shadow);anchor.position.set(side*4.6,-.15,-19);anchor.scale.set(.65,7.1,1.15);anchor.rotation.z=-side*.08;foundation.add(anchor);
    const groove=new THREE.Mesh(box,lightMaterial);groove.position.set(side*4.6,-.1,-18.38);groove.scale.set(.026,5.0,.035);groove.rotation.z=-side*.08;foundation.add(groove);
  }

  // Sparse true depth integration through a bounded medium. Its low radiance ceiling preserves
  // the accepted material contrast. These shafts do not sample scene depth or claim shadowed fog.
  const shaftUniforms={...u,mkCamera:{value:new THREE.Vector3()},mkHalfBox:{value:new THREE.Vector3(9,12,24)},mkSteps:{value:28}};
  const shaftMaterial=new THREE.ShaderMaterial({uniforms:shaftUniforms,side:THREE.BackSide,transparent:true,depthWrite:false,depthTest:false,
    blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,blendSrcAlpha:THREE.ZeroFactor,blendDstAlpha:THREE.OneFactor,
    vertexShader:'varying vec3 mkExit;void main(){mkExit=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:common+`
      uniform vec3 mkCamera,mkHalfBox;uniform int mkSteps;varying vec3 mkExit;
      vec2 mkBox(vec3 ro,vec3 rd){vec3 safe=mix(vec3(-1.),vec3(1.),step(vec3(0.),rd))*max(abs(rd),vec3(.000001));vec3 a=(-mkHalfBox-ro)/safe,b=(mkHalfBox-ro)/safe;vec3 lo=min(a,b),hi=max(a,b);return vec2(max(max(lo.x,lo.y),lo.z),min(min(hi.x,hi.y),hi.z));}
      float mkBeam(vec3 p,vec3 a,vec3 b,float radius){vec3 axis=b-a;float t=clamp(dot(p-a,axis)/dot(axis,axis),0.0,1.0);float d=length(p-mix(a,b,t));float r=radius*(.52+t*.9)*(1.18-mlFocus*.45);return exp(-d*d/(r*r))*smoothstep(0.0,.09,t)*(1.0-smoothstep(.88,1.0,t));}
      void main(){
        vec3 rd=normalize(mkExit-mkCamera);vec2 hit=mkBox(mkCamera,rd);float start=max(hit.x,0.0),finish=hit.y;if(finish<=start)discard;
        float stride=(finish-start)/float(mkSteps),transmittance=1.0;vec3 radiance=vec3(0.0);
        for(int i=0;i<28;i++){if(i>=mkSteps)break;vec3 p=mkCamera+rd*(start+(float(i)+.5)*stride);
          float bend=sin(mlTime*.09+p.y*.16)*mlTurbulence*.18;
          float first=mkBeam(p,vec3(-6.7,11.0,-8.0),vec3(1.8,-10.5,6.0),.40);
          float second=mkBeam(p,vec3(6.5,11.6,-15.0),vec3(-1.4,-10.5,1.0),.57);
          float third=mkBeam(p+vec3(bend,0.,0.),vec3(-2.9,11.0,8.0),vec3(2.5,-11.0,-5.0),.25);
          float layering=.77+.23*sin(p.y*2.3+p.z*.29+mlTime*.16+mlMid*.45);
          float density=(first+second*.68+third*.72)*layering;
          float opacity=1.0-exp(-density*stride*.19*mlDepth);
          vec3 color=mix(mlPrimary,mlWarm,.18+second*.14);
          radiance+=transmittance*opacity*color*(.025+mlTreble*.006)*mlGlow;
          transmittance*=1.0-opacity;
        }
        gl_FragColor=vec4(min(radiance,vec3(.045)),0.0);
      }
    `});materials.add(shaftMaterial);
  const shafts=new THREE.Mesh(ownGeometry(new THREE.BoxGeometry(18,24,48)),shaftMaterial);shafts.name='layered-spatial-light-shafts';shafts.position.set(0,7,-22);shafts.renderOrder=3;shafts.frustumCulled=false;group.add(shafts);
  const shaftInverse=new THREE.Matrix4(),worldCamera=new THREE.Vector3();shafts.onBeforeRender=(_renderer,_scene,camera)=>{shaftInverse.copy(shafts.matrixWorld).invert();camera.getWorldPosition(worldCamera);shaftUniforms.mkCamera.value.copy(worldCamera).applyMatrix4(shaftInverse);};
  const scratch=new THREE.Vector3(),linkStart=new THREE.Vector3(),linkEnd=new THREE.Vector3(),linkMid=new THREE.Vector3(),linkDelta=new THREE.Vector3(),axisY=new THREE.Vector3(0,1,0),linkQuaternion=new THREE.Quaternion();
  const transform=new THREE.Object3D();
  const forms=new THREE.Vector3(1,0,0),touch={x:0,y:0,strength:0,serial:0};let form='silk',settings={...defaults},phase=0,updates=0,onsets=0,frontIndex=0,disposed=false,quality='auto';
  function matrix(mesh,index,x,y,z,sx,sy,sz,rx,ry,rz) {transform.position.set(x,y,z);transform.scale.set(sx,sy,sz);transform.rotation.set(rx,ry,rz);transform.updateMatrix();mesh.setMatrixAt(index,transform.matrix);}
  function linkage(mesh,index,start,end,radiusScale=1){linkDelta.copy(end).sub(start);const length=linkDelta.length();linkQuaternion.setFromUnitVectors(axisY,linkDelta.normalize());linkMid.copy(start).add(end).multiplyScalar(.5);transform.position.copy(linkMid);transform.quaternion.copy(linkQuaternion);transform.scale.set(radiusScale,length,radiusScale);transform.updateMatrix();mesh.setMatrixAt(index,transform.matrix);}
  function corePose(){
    let front=0;for(let i=0;i<4;i++){const d=(-17.5-u.mlFront.value[i])*.33;front+=Math.exp(-d*d)*u.mlFrontEnergy.value[i];}front=Math.min(front,1.6);
    const open=.20+touch.strength*.65+forms.y*.26+u.mlBass.value*.105+front*.12;
    u.mlCoreOpen.value=open;
    mechanism.rotation.set(touch.y*touch.strength*.23+forms.z*.11,touch.x*touch.strength*.30,Math.sin(phase*.08)*.035+forms.z*.12);
    mechanism.position.y=2.3+Math.sin(phase*.15)*.035+u.mlBass.value*.05;
    const radius=3.35*(.92+settings.spread*.08),turn=phase*.035;
    for(let i=0;i<12;i++){
      const rear=i>=6,serial=i%6,a=serial*Math.PI/3+(rear?Math.PI/6:0)+(rear?-turn*.55:turn),opening=(rear?-1:1)*open;
      const px=Math.cos(a)*radius,py=Math.sin(a)*radius,pz=rear?-.58:.30;
      const rz=a-Math.PI/2+opening,rx=(rear?-.16:.12)+forms.z*Math.sin(a)*.14;
      matrix(blades,i,px,py,pz,1,1,1,rx,0,rz);
      scratch.set(-.07,-1.13,.17).applyEuler(transform.rotation);
      matrix(bladeInlays,i,px+scratch.x,py+scratch.y,pz+scratch.z,.16,1.47,.035,rx,0,rz+.065);
      for(let side=0;side<2;side++){
        transform.rotation.set(rx,0,rz);scratch.set(side?-.20:.22,side?-.55:-1.15,.165).applyEuler(transform.rotation);
        matrix(bladeLights,i*2+side,px+scratch.x,py+scratch.y,pz+scratch.z,.016,side?.5:1.25,.025,rx,0,rz+(side?.11:-.10));
      }
      matrix(sockets,i,px,py,pz+.18,1,1,1,Math.PI/2,0,0);
      linkStart.set(Math.cos(a-.15)*(radius+.36),Math.sin(a-.15)*(radius+.36),rear?-.85:.60);
      linkEnd.set(px-Math.cos(a+opening)*1.06,py-Math.sin(a+opening)*1.06,pz+.21);
      scratch.copy(linkStart).lerp(linkEnd,.66);linkage(struts,i,linkStart,scratch);
      linkage(rods,i,linkStart,linkEnd);
    }
    for(let layer=0;layer<3;layer++)for(let side=0;side<6;side++){
      const index=layer*6+side,r=3.81+layer*.23,a=(side+.5)*Math.PI/3+(layer===1?Math.PI/6:0)+(layer===1?-turn*.32:turn*.15);
      matrix(frameBeams,index,Math.cos(a)*r,Math.sin(a)*r,-.98+layer*.51,r*.95,.13+layer*.015,.17,0,0,a+Math.PI/2);
    }
    for(let i=0;i<teeth.count;i++){
      const a=i/teeth.count*Math.PI*2+turn*.20,r=4.46+Math.sin(i*1.7)*.035;
      matrix(teeth,i,Math.cos(a)*r,Math.sin(a)*r,-.12,.115,.24+(i%3)*.08,.31,0,0,a-Math.PI/2);
    }
    for(let i=0;i<pins.count;i++){
      const a=i/pins.count*Math.PI*2+turn*.20,r=4.40;
      matrix(pins,i,Math.cos(a)*r,Math.sin(a)*r,.095,1,1,1,Math.PI/2,0,0);
    }
    for(let i=0;i<9;i++){
      const band=Math.floor(i/3),blade=i%3,a=blade*Math.PI*2/3+phase*.10*(band%2?-.6:1),r=.28+open*.27;
      const x=Math.cos(a)*r,y=(band-1)*.64,z=Math.sin(a)*r;
      matrix(coreShards,i,x,y,z,.40,1.13,.33,.18*Math.sin(a),a,(blade-1)*.12+forms.z*.13);
      matrix(coreFaults,i,x*.78,y,z*.78+.19,.032,.89,.032,0,a,(blade-1)*.12);
    }
    for(const mesh of dynamicInstances)mesh.instanceMatrix.needsUpdate=true;
  }
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
    corePose();
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
    teeth.count=pins.count=quality==='low'?36:72;shaftUniforms.mkSteps.value=quality==='low'?14:28;shafts.visible=settings.depth>0;
    dustGeometry.setDrawRange(0,Math.floor((quality==='low'?220:count)*read(look,'particles',0,1,1)));
    const pulseGain=read(look,'pulseGain',0,2,1);if(pulseGain===0)u.mlFrontEnergy.value.fill(0);
    if(frame.motion!==false) {
      const dt=bounded(frame.dt,0,.05*read(look,'motionSpeed',.1,2.5,1),0),ease=1-Math.exp(-dt*5);
      const contact=frame.touch||{},contactStrength=read(contact,'strength',0,1,0),touchEase=1-Math.exp(-dt*9);
      touch.x+=(read(contact,'x',-1,1,0)-touch.x)*touchEase;touch.y+=(read(contact,'y',-1,1,0)-touch.y)*touchEase;
      touch.strength+=(contactStrength-touch.strength)*touchEase;touch.serial=Math.floor(read(contact,'serial',0,Number.MAX_SAFE_INTEGER,0));
      u.mlTouch.value.set(touch.x,touch.y,touch.strength);
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
    diagnostics(){return{name:'Living Monolith',phase,updates,onsets,form,formBlend:forms.toArray(),settings:{...settings},quality,disposed,signals:{bass:u.mlBass.value,mid:u.mlMid.value,treble:u.mlTreble.value,energy:u.mlEnergy.value},fronts:Array.from(u.mlFront.value),frontEnergy:Array.from(u.mlFrontEnergy.value),touch:{...touch},coreOpening:u.mlCoreOpen.value,coreOrientation:mechanism.rotation.toArray(),shaftSteps:shaftUniforms.mkSteps.value,shaftVisible:shafts.visible,instances:architecture.count+distant.count+suspended.count+seams.count,mechanismInstances:dynamicInstances.reduce((total,mesh)=>total+mesh.count,0),motes:dustGeometry.drawRange.count,geometryResources:geometries.size,materialResources:materials.size,lighting:'PBR with inherited environment reflections, real scene lights and bounded unshadowed raymarched shafts',camera:'composed fixed environment'};},
    dispose(){if(disposed)return;disposed=true;for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();for(const mesh of [architecture,distant,suspended,seams,...dynamicInstances])mesh.dispose();for(const light of lights)light.dispose?.();group.clear();}
  };
}
