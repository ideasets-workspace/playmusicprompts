/** Prism Passage: an inhabited, audio-reactive corridor. The host owns all rendering and timing. */
export function createLiquidAsset(THREE) {
  const group = new THREE.Group();
  group.name = 'prism-passage';
  const length = 112, sides = 8, bays = 56;
  const geometries = new Set(), materials = new Set();
  const uniforms = {
    uPhase: {value: 0}, uTravel: {value: 0}, uBass: {value: 0}, uMid: {value: 0},
    uTreble: {value: 0}, uEnergy: {value: 0}, uCentroid: {value: .35}, uIntensity: {value: .65},
    uLight: {value: new THREE.Color(0xb56aff)}, uRim: {value: new THREE.Color(0x58cced)},
    uTint: {value: new THREE.Color(0xa79cc1)},
    uWidth: {value: 1}, uTwist: {value: 1}, uGloss: {value: 1}, uParticleGlow: {value: 1},
    uFront: {value: new Float32Array([-24, -24, -24])},
    uFrontEnergy: {value: new Float32Array(3)}
  };
  const shaderCommon = `
    uniform float uPhase, uTravel, uBass, uMid, uTreble, uEnergy, uCentroid, uIntensity;
    uniform float uWidth, uTwist, uGloss, uParticleGlow;
    uniform vec3 uLight, uRim, uTint;
    uniform float uFront[3], uFrontEnergy[3];
    const float PI = 3.14159265359;
    vec2 corridorCenter(float d) {
      float bend = 1.0 - exp(-max(d, 0.0) * .055);
      return vec2(sin(d * .027 + uPhase * .045) * 4.5,
                  sin(d * .035 + .4 + uPhase * .025) * 1.8) * bend;
    }
    float corridorTwist(float d) { return (sin(d * .032 + uPhase * .032) * .26 + d * .009) * uTwist; }
    float corridorRadius(float d) { return (4.75 + .17 * sin(d * .08 - uPhase * .13) + uBass * .13) * uWidth; }
    vec3 corridorPoint(float d, float a, float radius) {
      a += corridorTwist(d);
      return vec3(corridorCenter(d) + vec2(cos(a), sin(a)) * radius, 4.0 - d);
    }
    float wave(float d) {
      float result = 0.0;
      for (int i = 0; i < 3; i++) {
        float q = (d - uFront[i]) * .27;
        result += exp(-q * q) * uFrontEnergy[i];
      }
      return min(result, 1.6);
    }
  `;
  const varyings = 'varying vec3 vLocal; varying vec3 vView; varying float vDepth; varying float vFacet; varying vec2 vPanel;';
  function shader(vertexShader, fragmentShader, options = {}) {
    const material = new THREE.ShaderMaterial({uniforms, vertexShader: shaderCommon + vertexShader,
      fragmentShader: shaderCommon + fragmentShader, ...options});
    materials.add(material);
    return material;
  }
  function mesh(name, geometry, material, kind = 'mesh') {
    geometries.add(geometry);
    const object = kind === 'lines' ? new THREE.LineSegments(geometry, material) : new THREE.Mesh(geometry, material);
    object.name = name;
    // Vertices are transformed onto the full corridor in the GPU; undeformed bounds are not meaningful.
    object.frustumCulled = false;
    group.add(object);
    return object;
  }

  // Every bay is split into four genuinely non-coplanar facets: the walls catch light as architecture,
  // while the continuous passage remains visible between the structural ribs.
  const shellPositions = [], shellDepth = [], shellAngle = [], shellRadius = [], shellFacet = [], shellUv = [];
  const shellSegments = 84;
  function addShellVertex(d, a, radialOffset, facet, u, v) {
    shellPositions.push(0, 0, 0); shellDepth.push(d); shellAngle.push(a); shellRadius.push(radialOffset);
    shellFacet.push(facet); shellUv.push(u, v);
  }
  for (let bay = 0; bay < shellSegments; bay++) for (let side = 0; side < sides; side++) {
    const d0 = bay / shellSegments * length, d1 = (bay + 1) / shellSegments * length;
    const a0 = side / sides * Math.PI * 2 + Math.PI / 8, a1 = (side + 1) / sides * Math.PI * 2 + Math.PI / 8;
    const corners = [[d0,a0,0,0,0],[d0,a1,0,1,0],[d1,a1,0,1,1],[d1,a0,0,0,1]];
    const facet = (side * .113 + (bay % 3) * .19) % 1;
    for (let edge = 0; edge < 4; edge++) {
      for (const p of [corners[edge], corners[(edge + 1) % 4], [(d0+d1)*.5,(a0+a1)*.5,-.30,.5,.5]]) {
        addShellVertex(p[0],p[1],p[2],facet,p[3],p[4]);
      }
    }
  }
  const shellGeometry = new THREE.BufferGeometry();
  shellGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shellPositions, 3));
  shellGeometry.setAttribute('aDepth', new THREE.Float32BufferAttribute(shellDepth, 1));
  shellGeometry.setAttribute('aAngle', new THREE.Float32BufferAttribute(shellAngle, 1));
  shellGeometry.setAttribute('aRadius', new THREE.Float32BufferAttribute(shellRadius, 1));
  shellGeometry.setAttribute('aFacet', new THREE.Float32BufferAttribute(shellFacet, 1));
  shellGeometry.setAttribute('aPanel', new THREE.Float32BufferAttribute(shellUv, 2));
  mesh('folded-black-chrome-architecture', shellGeometry, shader(`
    attribute float aDepth, aAngle, aRadius, aFacet; attribute vec2 aPanel;
    ${varyings}
    void main() {
      vDepth = aDepth; vFacet = aFacet; vPanel = aPanel;
      vLocal = corridorPoint(aDepth, aAngle, corridorRadius(aDepth) + aRadius);
      vView = (modelViewMatrix * vec4(vLocal, 1.0)).xyz;
      gl_Position = projectionMatrix * vec4(vView, 1.0);
    }
  `, `
    ${varyings}
    void main() {
      vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));
      vec3 eye = normalize(-vView);
      if (dot(n, eye) < 0.0) n = -n;
      vec3 reflected = reflect(-eye,n);
      float fresnel = pow(1.0-max(dot(n,eye),0.0),3.0);
      // Analytic studio strips produce localized glossy reflections with a continuous view response.
      // Both halves of the virtual studio remain reflective: a corridor mostly reflects toward -Z.
      // Broad, localized bands reveal the finish while the spaces between them remain black metal.
      float softbox = exp(-pow((reflected.y+.21)*uGloss/.145,2.0)) * (.7+.3*abs(reflected.z));
      float whiteStrip = exp(-pow((reflected.x-.46)*uGloss/.076,2.0));
      float rimStrip = exp(-pow((reflected.x+.63)*uGloss/.11,2.0));
      float grazing = pow(abs(dot(reflected,normalize(vec3(-.4,.78,.48)))),48.0*uGloss);
      float accent = .5+.5*sin(vFacet*6.0+reflected.y*3.0);
      vec3 spectral = mix(uLight,uRim,accent);
      float fineEdge = 1.0-smoothstep(.002,.011,min(vPanel.x,1.0-vPanel.x));
      float seam = 1.0-smoothstep(.003,.015,min(vPanel.y,1.0-vPanel.y));
      float iridescence = .5+.5*sin(dot(eye,n)*20.0+vDepth*.095);
      vec3 coating = mix(uLight,uRim,iridescence);
      float reflectionGate = .85+.15*cos(vDepth*.052);
      vec3 color = mix(vec3(.0018,.0030,.0060),uTint*.005,.22);
      color += mix(vec3(.60,.69,.83),spectral,.2)*softbox*.29*reflectionGate;
      color += mix(vec3(.78),uRim,.14)*whiteStrip*.39;
      color += spectral*rimStrip*.145+mix(vec3(.6),uLight,.15)*grazing*.27;
      color += coating*fresnel*(softbox+rimStrip)*.065;
      color += spectral*(fineEdge*.025+seam*.008)*(.45+uIntensity*.55);
      color += coating*wave(vDepth)*(.018+fineEdge*.16+fresnel*.065);
      color *= exp(-vDepth*.024);
      gl_FragColor = vec4(color, 1.0);
    }
  `, {side: THREE.DoubleSide}));

  // Sixteen continuous light guides: each structural corner has a primary rail and a dimmer inset.
  const railPositions=[], railDepth=[], railAngle=[], railOffset=[], railKind=[], railIndices=[];
  const railSegments=224, railCross=4;
  for (let side=0; side<sides; side++) for (let twin=0; twin<2; twin++) {
    const start=railPositions.length/3;
    for (let step=0; step<=railSegments; step++) for (let cross=0; cross<railCross; cross++) {
      const a = cross/railCross*Math.PI*2;
      railPositions.push(0,0,0); railDepth.push(step/railSegments*length);
      railAngle.push(side/sides*Math.PI*2+Math.PI/8+(twin ? .035 : -.035));
      railOffset.push(Math.cos(a)*.018,Math.sin(a)*.018); railKind.push(twin);
    }
    for (let step=0; step<railSegments; step++) for (let cross=0; cross<railCross; cross++) {
      const a=start+step*railCross+cross,b=start+step*railCross+(cross+1)%railCross,c=a+railCross,d=b+railCross;
      railIndices.push(a,c,b,b,c,d);
    }
  }
  const railGeometry=new THREE.BufferGeometry();
  railGeometry.setAttribute('position',new THREE.Float32BufferAttribute(railPositions,3));
  railGeometry.setAttribute('aDepth',new THREE.Float32BufferAttribute(railDepth,1));
  railGeometry.setAttribute('aAngle',new THREE.Float32BufferAttribute(railAngle,1));
  railGeometry.setAttribute('aOffset',new THREE.Float32BufferAttribute(railOffset,2));
  railGeometry.setAttribute('aKind',new THREE.Float32BufferAttribute(railKind,1));
  railGeometry.setIndex(railIndices);
  mesh('unbroken-spectral-guides',railGeometry,shader(`
    attribute float aDepth, aAngle, aKind; attribute vec2 aOffset;
    varying float vDepth, vKind;
    void main() {
      vDepth=aDepth; vKind=aKind;
      vec3 p=corridorPoint(aDepth,aAngle+aOffset.x/4.75,corridorRadius(aDepth)-.055+aOffset.y);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
    }
  `,`
    varying float vDepth, vKind;
    void main() {
      vec3 spectral=mix(uLight,uRim,vKind);
      float flow=.5+.5*sin(vDepth*.42+uTravel*.55+vKind*PI);
      float luminance=(.35+uIntensity*.9)*(vKind>.5 ? .56 : .95);
      luminance+=flow*.11+wave(vDepth)*.85+uTreble*.11;
      gl_FragColor=vec4(spectral*luminance*exp(-vDepth*.015),1.0);
    }
  `));

  // Each frame has dark, deep structural material and a recessed luminous face. GPU instancing keeps
  // the entire 56-bay structure in two draw calls. The camera travels through it without camera writes.
  function makeRibs(accent) {
    const source=new THREE.BoxGeometry(1,1,1);
    const geometry=new THREE.InstancedBufferGeometry().copy(source);
    source.dispose();
    const depths=[],angles=[],serials=[];
    for(let bay=0;bay<bays;bay++) for(let side=0;side<sides;side++) {
      depths.push(bay/bays*length); angles.push((side+.5)/sides*Math.PI*2+Math.PI/8); serials.push(bay%7);
    }
    geometry.setAttribute('aDepth',new THREE.InstancedBufferAttribute(new Float32Array(depths),1));
    geometry.setAttribute('aAngle',new THREE.InstancedBufferAttribute(new Float32Array(angles),1));
    geometry.setAttribute('aSerial',new THREE.InstancedBufferAttribute(new Float32Array(serials),1));
    geometry.instanceCount=depths.length;
    return mesh(accent?'recessed-prismatic-light-faces':'travelling-chrome-ribs',geometry,shader(`
      attribute float aDepth,aAngle,aSerial;
      varying float vDepth,vSerial; varying vec3 vNormal,vView;
      void main() {
        float d=mod(aDepth-uTravel+${length.toFixed(1)},${length.toFixed(1)});
        float a=aAngle+corridorTwist(d);
        vec2 radial=vec2(cos(a),sin(a)),tangent=vec2(-sin(a),cos(a));
        float radius=corridorRadius(d);
        float broad=mod(aSerial,7.0)<.5 ? 1.7 : 1.0;
        vec2 xy=corridorCenter(d)+radial*(radius*.9238795-${accent?'.145':'.065'}+position.y*${accent?'.023':'.115'}*broad);
        xy+=tangent*position.x*(2.0*radius*.3826834-${accent?'.27':'.035'});
        vec3 p=vec3(xy,4.0-d+position.z*${accent?'.029':'.21'}*broad);
        vNormal=normalMatrix*vec3(tangent*normal.x+radial*normal.y,normal.z);
        vView=(modelViewMatrix*vec4(p,1.0)).xyz;
        vDepth=d; vSerial=aSerial;
        gl_Position=projectionMatrix*vec4(vView,1.0);
      }
    `,`
      varying float vDepth,vSerial; varying vec3 vNormal,vView;
      void main() {
        float fade=smoothstep(0.0,1.0,vDepth)*(1.0-smoothstep(103.0,112.0,vDepth));
        vec3 spectral=mix(uLight,uRim,.5+.5*sin(vSerial*1.1+vDepth*.055));
        vec3 n=normalize(vNormal),eye=normalize(-vView);
        if(dot(n,eye)<0.0)n=-n;
        vec3 reflected=reflect(-eye,n);
        float spec=exp(-pow((reflected.y+.18)*uGloss/.11,2.0))+.36*exp(-pow((reflected.x-.42)*uGloss/.065,2.0));
        float glint=pow(abs(dot(reflected,normalize(vec3(.4,.7,.5)))),60.0*uGloss);
        ${accent ? `
          float emphasis=mod(vSerial,7.0)<.5 ? .76 : .23;
          vec3 color=spectral*(emphasis*(.3+uIntensity*.58)+wave(vDepth)*1.05+uMid*.065);
        ` : `
          vec3 color=mix(vec3(.003,.005,.008),uTint*.007,.25);
          color+=mix(vec3(.7),spectral,.25)*(spec*.30+glint*.42);
          color+=spectral*wave(vDepth)*.07;
        `}
        color*=exp(-vDepth*.020)*fade;
        gl_FragColor=vec4(color,1.0);
      }
    `));
  }
  makeRibs(false); makeRibs(true);

  // Peripheral motes are short world-space filaments, not screen overlays. Their speed follows the
  // same actual energy envelope as the architecture; no synthetic onset or beat is introduced.
  const streakPosition=[],streakDepth=[],streakAngle=[],streakRadius=[],streakEnd=[];
  let seed=28491;
  function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
  const streakCount=190;
  for(let i=0;i<streakCount;i++) {
    const d=random()*length,a=random()*Math.PI*2,r=2.8+random()*1.45;
    for(const end of [0,1]){streakPosition.push(0,0,0);streakDepth.push(d);streakAngle.push(a);streakRadius.push(r);streakEnd.push(end);}
  }
  const streakGeometry=new THREE.BufferGeometry();
  streakGeometry.setAttribute('position',new THREE.Float32BufferAttribute(streakPosition,3));
  streakGeometry.setAttribute('aDepth',new THREE.Float32BufferAttribute(streakDepth,1));
  streakGeometry.setAttribute('aAngle',new THREE.Float32BufferAttribute(streakAngle,1));
  streakGeometry.setAttribute('aRadius',new THREE.Float32BufferAttribute(streakRadius,1));
  streakGeometry.setAttribute('aEnd',new THREE.Float32BufferAttribute(streakEnd,1));
  const streaks=mesh('peripheral-flight-filaments',streakGeometry,shader(`
    attribute float aDepth,aAngle,aRadius,aEnd; varying float vDepth,vEnd;
    void main(){
      float d=mod(aDepth-uTravel*2.8+${length.toFixed(1)}*16.0,${length.toFixed(1)});
      vDepth=d;vEnd=aEnd;
      vec3 p=corridorPoint(d+aEnd*(.28+uEnergy*.75),aAngle,aRadius*uWidth);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
    }
  `,`
    varying float vDepth,vEnd;
    void main(){
      float fade=smoothstep(1.0,8.0,vDepth)*(1.0-smoothstep(70.0,112.0,vDepth));
      vec3 color=mix(uRim,vec3(.8),.2)*(.28+uTreble*.45)*(.3+uIntensity*.7);
      gl_FragColor=vec4(color*uParticleGlow,fade*(1.0-vEnd*.9));
    }
  `,{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),'lines');

  const diagnostics={name:'Prism Passage',drawCalls:5,triangles:0,vertices:0,updates:0,onsets:0,phase:0,travel:0,quality:'auto'};
  for(const object of group.children){
    diagnostics.vertices+=object.geometry.attributes.position.count;
    if(object.isMesh)diagnostics.triangles+=(object.geometry.index?.count??object.geometry.attributes.position.count)/3*(object.geometry.instanceCount??1);
  }
  let elapsed=0,travel=0,frontIndex=0,disposed=false;
  const bounded=(value,maximum=1)=>Math.max(0,Math.min(maximum,Number(value)||0));
  const setting=(look,key,min,max,fallback=1)=>typeof look?.[key]==='number'&&Number.isFinite(look[key])
    ? Math.max(min,Math.min(max,look[key])) : fallback;
  function update(frame={}) {
    if(disposed)return;
    uniforms.uIntensity.value=bounded(frame.intensity??.65);
    // Studio edits remain live while the pose is frozen. None of these reads advances audio or time.
    const look=frame.look;
    uniforms.uWidth.value=setting(look,'prismWidth',.8,1.3);
    uniforms.uTwist.value=setting(look,'prismTwist',0,2);
    uniforms.uGloss.value=setting(look,'prismGloss',.6,1.6);
    uniforms.uParticleGlow.value=setting(look,'particleGlow',.2,2);
    const speed=setting(look,'prismSpeed',0,2), density=setting(look,'particles',0,1);
    // Turning pulse response off is an explicit visual edit, including while Motion is off.
    if(look?.pulseGain===0)uniforms.uFrontEnergy.value.fill(0);
    const quality=['low','auto','high'].includes(frame.quality)?frame.quality:'auto';
    const visibleStreaks=Math.floor((quality==='low'?90:streakCount)*density);
    streakGeometry.setDrawRange(0,visibleStreaks*2);
    diagnostics.quality=quality;diagnostics.particles=visibleStreaks;
    diagnostics.look={width:uniforms.uWidth.value,twist:uniforms.uTwist.value,gloss:uniforms.uGloss.value,
      speed,particleGlow:uniforms.uParticleGlow.value,density};
    if(frame.motion===false)return;
    // The host has already scaled dt. Scale only its safety ceiling, never multiply time twice.
    const delta=bounded(frame.dt,.05*setting(look,'motionSpeed',.1,2.5)), ease=1-Math.exp(-delta*6), sounding=!!frame.active;
    for(const [name,key] of [['uBass','bass'],['uMid','mid'],['uTreble','treble'],['uEnergy','energy']]){
      const target=sounding?bounded(frame[key],1.8):0;
      uniforms[name].value+=(target-uniforms[name].value)*ease;
    }
    uniforms.uCentroid.value+=(bounded(frame.centroid??.35)-uniforms.uCentroid.value)*ease;
    elapsed+=delta;
    travel=(travel+delta*(.9+uniforms.uEnergy.value*4.4+uniforms.uBass.value*.6)*speed)%length;
    uniforms.uPhase.value=elapsed;uniforms.uTravel.value=travel;
    for(let i=0;i<3;i++){
      uniforms.uFront.value[i]-=delta*45;
      uniforms.uFrontEnergy.value[i]*=Math.exp(-delta*.36);
    }
    if(sounding&&frame.onset&&look?.pulseGain!==0){
      uniforms.uFront.value[frontIndex]=88;
      uniforms.uFrontEnergy.value[frontIndex]=.55+bounded(frame.pulse)*.75;
      frontIndex=(frontIndex+1)%3;diagnostics.onsets++;
    }
    diagnostics.updates++;diagnostics.phase=elapsed;diagnostics.travel=travel;
  }
  function setPalette(world={}){
    uniforms.uLight.value.setHex(world.light??0xb56aff);
    uniforms.uRim.value.setHex(world.rim??0x58cced);
    uniforms.uTint.value.setHex(world.tint??0xa79cc1);
  }
  group.userData.prism=diagnostics;
  return {group,update,setPalette,diagnostics,
    view:{target:[0,2.75,-18],direction:[0,0,1],distance:24.5,fitRadius:4.8,aspectFit:false,minDistance:22.5,maxDistance:25,orbit:false,bloom:.42},
    dispose(){if(disposed)return;disposed=true;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());group.clear();}
  };
}
