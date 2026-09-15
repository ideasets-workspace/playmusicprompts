/* Tidal — a composed ocean world. The host owns the renderer, camera and clock. */
export function createTidalAsset(THREE) {
  const group = new THREE.Group(); group.name = 'Tidal';
  const finite = (v, d, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : d));
  const forms = ['silk', 'nova', 'helix'];
  const defaults = {form: 'silk', flow: 1, spread: 1, turbulence: .6, glow: 1, depth: .65, focus: .45, journey: false};
  let settings = {...defaults}, clock = 0, phase = 0, updates = 0, eventCount = 0, eventIndex = 0, disposed = false, low = false;
  const events = new Float32Array(6).fill(-100), powers = new Float32Array(6);
  const weights = new THREE.Vector3(1, 0, 0), targetWeights = new THREE.Vector3(1, 0, 0);
  const uniforms = {
    tdTime: {value: 0}, tdClock: {value: 0}, tdBass: {value: 0}, tdMid: {value: 0}, tdTreble: {value: 0}, tdEnergy: {value: 0},
    tdSpread: {value: 1}, tdTurbulence: {value: .6}, tdGlow: {value: 1}, tdDepth: {value: .65}, tdFocus: {value: .45},
    tdDetail: {value: 1}, tdWeights: {value: weights}, tdEvents: {value: events}, tdPowers: {value: powers},
    tdCamera: {value: new THREE.Vector3()}, tdPrimary: {value: new THREE.Color(0xb56aff)}, tdSecondary: {value: new THREE.Color(0x58cced)}
  };
  const common = /* glsl */`
    uniform float tdTime, tdClock, tdBass, tdMid, tdTreble, tdEnergy;
    uniform float tdSpread, tdTurbulence, tdGlow, tdDepth, tdFocus, tdDetail;
    uniform vec3 tdWeights, tdCamera, tdPrimary, tdSecondary;
    uniform float tdEvents[6], tdPowers[6];
    const float TD_PI = 3.14159265359;
    float tdHash(vec2 p) {
      vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));
      q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);
    }
    float tdNoise(vec2 p) {
      vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(tdHash(i),tdHash(i+vec2(1.,0.)),f.x),mix(tdHash(i+vec2(0.,1.)),tdHash(i+1.),f.x),f.y);
    }
    float tdFbm(vec2 p) {
      float s=0., a=.57;
      for(int j=0;j<TD_NOISE;j++){s+=a*tdNoise(p); p=mat2(1.67,1.21,-1.21,1.67)*p+3.17;a*=.46;}
      return s;
    }
    vec3 tdSunDirection() {return normalize(vec3(.28,.139,-1.));}
    vec3 tdHorizon() {return mix(vec3(.12,.075,.105),tdPrimary*.20+.022,.7);}
    vec3 tdSky(vec3 rd) {
      float up=max(rd.y,0.);
      vec3 horizon=tdHorizon();
      vec3 color=mix(horizon,vec3(.0015,.004,.013)+tdPrimary*.005,1.-exp(-up*7.));
      vec3 sun=tdSunDirection();
      float angle=acos(clamp(dot(rd,sun),-1.,1.));
      vec3 warm=mix(vec3(1.,.40,.15),tdPrimary*.8+vec3(.35,.16,.08),.48);
      float halo=exp(-angle*angle*24.);
      color+=warm*halo*.24*tdGlow;
      float disc=1.-smoothstep(.092,.094,angle);
      vec3 moon=normalize(sun+vec3(-.005,.002,0.));
      float moonAngle=acos(clamp(dot(rd,moon),-1.,1.));
      float eclipse=1.-smoothstep(.0855,.087,moonAngle);
      color+=warm*disc*2.8*tdGlow;
      color=mix(color,vec3(.003,.004,.012)+tdPrimary*.008,eclipse);
      float corona=exp(-pow((angle-.094)*130.,2.));
      color+=mix(warm,vec3(1.,.84,.57),.5)*corona*.42*tdGlow*(1.+tdTreble*.24);
      // Long, stratified veils pass behind the eclipse, with a lifted auroral edge.
      vec2 cloudP=vec2(atan(rd.x,-rd.z)*3.6+tdTime*.008,rd.y*12.);
      float cloud=tdFbm(cloudP+vec2(tdFbm(cloudP*.7),0.));
      float veil=smoothstep(.42,.70,cloud)*smoothstep(.015,.055,rd.y)*(1.-smoothstep(.23,.39,rd.y));
      color=mix(color,tdPrimary*.075+vec3(.012,.016,.026),veil*(.24+tdWeights.y*.40));
      float curtainHeight=.24+.10*sin(rd.x*3.5+tdTime*.026)+.06*sin(rd.x*8.-tdTime*.018);
      float curtain=exp(-pow((rd.y-curtainHeight)*16.,2.));
      float folds=.35+.65*pow(tdNoise(vec2(rd.x*28.+tdTime*.013,2.)),3.);
      color+=mix(tdSecondary,tdPrimary,smoothstep(.1,.48,rd.y))*curtain*folds*.035*tdDepth*(.7+tdMid);
      // Three depth layers form a distant, irregular coastline; no object-space grid.
      float az=atan(rd.x,-rd.z);
      for(int j=0;j<3;j++) {
        float layer=float(j), ridge=.008+layer*.003;
        ridge+=(.010+layer*.004)*pow(tdFbm(vec2(az*(9.+layer*4.)+layer*27.,3.)),1.5);
        ridge+=.024*exp(-pow((az+.43+layer*.045)*7.,2.))+.015*exp(-pow((az-.71)*11.,2.));
        float mountain=1.-smoothstep(ridge-.0008,ridge+.0008,rd.y);
        vec3 mountainColor=mix(horizon*.50,vec3(.006,.014,.026),layer*.24);
        color=mix(color,mountainColor,mountain*smoothstep(-.035,-.003,rd.y));
      }
      // Sparse fixed stars. Their position does not crawl when animation is paused.
      vec2 starUV=vec2(az,asin(clamp(rd.y,-1.,1.)))*170.;
      vec2 cell=floor(starUV), q=fract(starUV)-.5;
      float star=pow(max(0.,1.-length(q)*5.),5.)*step(.991,tdHash(cell));
      color+=vec3(.53,.65,.82)*star*smoothstep(.18,.48,rd.y)*tdDetail;
      return max(color,vec3(0.));
    }
    // The same differentiable wave field drives displacement and reflection normals.
    // Each component carries its analytic x/z derivatives, avoiding normal-map swimming.
    vec3 tdSurface(vec2 xz) {
      vec3 s=vec3(0.);
      float storm=tdWeights.y, current=tdWeights.z;
      float lengthScale=1./tdSpread;
      float swell=(.11+tdTurbulence*.14+storm*.21)*(1.+tdBass*.65);
      for(int j=0;j<TD_WAVES;j++) {
        float i=float(j), angle=.38+i*2.399963+current*.7*sin(i*1.7);
        vec2 direction=vec2(cos(angle),sin(angle));
        float k=(.49*pow(1.53,i))*lengthScale;
        float amp=swell*pow(.54,i);
        float p=dot(xz,direction)*k+tdTime*(.75+sqrt(k)*.88)*(mod(i,2.)<.5?1.:-1.);
        float wave=sin(p), slope=cos(p);
        s+=vec3(wave,direction*k*slope)*amp;
      }
      vec2 eddy=xz-vec2(0.,-8.);float radius=max(length(eddy),.05);
      vec2 radial=eddy/radius, angular=vec2(-eddy.y,eddy.x)/max(dot(eddy,eddy),.0025);
      float eddyAzimuth=dot(eddy,eddy)>.00001?atan(eddy.y,eddy.x):0.;
      float eddyPhase=radius*.88-eddyAzimuth*2.+tdTime*.52;
      float eddyEnvelope=exp(-radius*radius*.004)*.24*current;
      s.x+=sin(eddyPhase)*eddyEnvelope;
      s.yz+=eddyEnvelope*(cos(eddyPhase)*(radial*.88-angular*2.)-sin(eddyPhase)*eddy*.008);
      // Bass onsets write six bounded, expanding interference fronts across the water.
      for(int j=0;j<6;j++) {
        float age=tdClock-tdEvents[j], valid=step(0.,age)*(1.-smoothstep(5.,8.,age));
        vec2 origin=vec2(sin(float(j)*2.7)*9.,-6.-float(j)*3.);
        vec2 delta=xz-origin;float radius=max(length(delta),.001), ring=radius-age*4.5;
        float env=exp(-ring*ring*.42)*valid*tdPowers[j]*.055;
        float p=ring*3.8;
        s.x+=sin(p)*env;
        s.yz+=(delta/radius)*(cos(p)*3.8-sin(p)*ring*.84)*env;
      }
      // A differentiable safety envelope keeps even maximum-signal storm crests
      // below the composed camera, and applies the exact derivative to the normal.
      float bounded=2./(1.+exp(-2.*s.x/.92))-1.;
      s.yz*=1.-bounded*bounded;s.x=bounded*.92;
      return s;
    }
    vec3 tdNormal(vec2 xz) {
      vec3 s=tdSurface(xz);
      float small=(.018+tdTurbulence*.038+tdWeights.y*.055)*(1.+tdTreble*.34);
      for(int j=0;j<TD_MICRO;j++) {
        float i=float(j), k=7.3+i*5.1;vec2 d=vec2(cos(i*2.3+.3),sin(i*2.3+.3));
        float p=dot(xz,d)*k+tdTime*(1.7+i*.4);
        s.yz+=d*cos(p)*small/(1.+i*.5);
      }
      return normalize(vec3(-s.y,1.,-s.z));
    }
  `;
  const skyVertex = 'varying vec3 tdPoint;void main(){tdPoint=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
  const skyFragment = common + /* glsl */`
    varying vec3 tdPoint;
    void main(){gl_FragColor=vec4(tdSky(normalize(tdPoint-tdCamera)),1.);}
  `;
  const waterVertex = common + /* glsl */`
    varying vec3 tdPoint;
    void main(){tdPoint=position;tdPoint.y+=tdSurface(position.xz).x;gl_Position=projectionMatrix*modelViewMatrix*vec4(tdPoint,1.);}
  `;
  const waterFragment = common + /* glsl */`
    varying vec3 tdPoint;
    void main(){
      vec3 eye=normalize(tdCamera-tdPoint), n=tdNormal(tdPoint.xz);
      vec3 reflection=reflect(-eye,n); reflection.y=abs(reflection.y);
      float facing=max(dot(eye,n),.0), fresnel=.022+.978*pow(1.-facing,5.);
      vec3 reflected=tdSky(reflection);
      vec3 sea=mix(vec3(.002,.013,.022),tdSecondary*.034,.45);
      float subsurface=pow(max(dot(normalize(vec3(-.2,.2,-1.)),-eye),0.),4.)*max(0.,tdPoint.y+1.52);
      vec3 color=sea*(.55+.6*facing)+reflected*(.40+.60*fresnel);
      color+=tdSecondary*subsurface*.012*(1.+tdBass);
      float glint=pow(max(dot(reflection,tdSunDirection()),0.),mix(220.,950.,tdFocus));
      color+=mix(tdPrimary,vec3(1.,.67,.36),.64)*glint*(.22+.7*tdGlow);
      // Broken luminous filigree follows the moving crests, never a regular wire grid.
      float crest=tdSurface(tdPoint.xz).x;
      float filament=exp(-pow((crest-.13-tdWeights.y*.10)*31.,2.));
      float breakup=smoothstep(.53,.78,tdFbm(tdPoint.xz*2.2+vec2(tdTime*.05,0.)));
      float farFade=exp(-length(tdPoint.xz-tdCamera.xz)*.075);
      color+=tdSecondary*filament*breakup*farFade*(.13+tdTreble*.30+tdEnergy*.09)*tdGlow*tdDetail;
      float distanceToEye=length(tdPoint-tdCamera);
      float fog=1.-exp(-pow(distanceToEye*(.013+tdDepth*.013),1.6));
      fog=max(fog,smoothstep(40.,60.,distanceToEye));
      // Extinction converges to the actual background ray, hiding the finite mesh
      // boundary at the authored horizon instead of exposing a rectangular ocean.
      color=mix(color,tdSky(-eye),fog);
      gl_FragColor=vec4(max(color,vec3(0.)),1.);
    }
  `;
  const materials = [], geometries = [];
  const makeMaterial = (isLow, vertexShader, fragmentShader, side = THREE.FrontSide) => {
    const material = new THREE.ShaderMaterial({uniforms, vertexShader, fragmentShader, side, toneMapped: false,
      defines: {TD_WAVES: isLow ? 5 : 8, TD_NOISE: isLow ? 2 : 3, TD_MICRO: isLow ? 2 : 4}});
    materials.push(material); return material;
  };
  const skyHigh = makeMaterial(false, skyVertex, skyFragment, THREE.BackSide), skyLow = makeMaterial(true, skyVertex, skyFragment, THREE.BackSide);
  skyHigh.depthWrite = skyLow.depthWrite = false;
  const waterHigh = makeMaterial(false, waterVertex, waterFragment), waterLow = makeMaterial(true, waterVertex, waterFragment);
  const skyGeometry = new THREE.SphereGeometry(68, 48, 24); geometries.push(skyGeometry);
  const sky = new THREE.Mesh(skyGeometry, skyHigh); sky.name = 'Tidal sky'; sky.renderOrder = -20; sky.frustumCulled = false;
  const waterGeometry = segments => {const g = new THREE.PlaneGeometry(128, 128, segments, segments);g.rotateX(-Math.PI/2);g.translate(0,-1.35,0);g.computeBoundingSphere();geometries.push(g);return g;};
  const waterHighGeometry = waterGeometry(192), waterLowGeometry = waterGeometry(80);
  const water = new THREE.Mesh(waterHighGeometry, waterHigh); water.name = 'Tidal ocean'; water.frustumCulled = false;
  group.add(sky, water);
  const inverse = new THREE.Matrix4(), cameraWorld = new THREE.Vector3();
  const syncCamera = (_renderer, _scene, camera) => {
    inverse.copy(group.matrixWorld).invert(); camera.getWorldPosition(cameraWorld);
    uniforms.tdCamera.value.copy(cameraWorld).applyMatrix4(inverse);
  };
  sky.onBeforeRender = water.onBeforeRender = syncCamera;
  const view = {aspectFit: false, orbit: false, target: [0, 3.10, -8], direction: [0, .055, 1], distance: 12, minDistance: 10, maxDistance: 15, bloom: .22};
  function update(frame = {}) {
    if (disposed) return;
    const input = frame.labLook || {}, motion = frame.motion !== false, active = frame.active === true, previousForm = settings.form;
    settings = {form: forms.includes(input.form) ? input.form : defaults.form,
      flow: finite(input.flow,1,0,2),spread:finite(input.spread,1,.6,1.5),turbulence:finite(input.turbulence,.6,0,1.5),
      glow:finite(input.glow,1,.2,1.8),depth:finite(input.depth,.65),focus:finite(input.focus,.45),journey:input.journey===true};
    targetWeights.set(settings.form==='silk'?1:0,settings.form==='nova'?1:0,settings.form==='helix'?1:0);
    const dt = finite(frame.dt,0,0,.06);
    if (motion) {
      clock += dt; phase += dt*settings.flow;
      weights.lerp(targetWeights,1-Math.exp(-dt*2.4));
      const mix = 1-Math.exp(-dt*5.5);
      for (const [uniform,key,max] of [['tdBass','bass',2],['tdMid','mid',2],['tdTreble','treble',2],['tdEnergy','energy',2]]) {
        const target = active ? finite(frame[key],0,0,max) : 0;
        uniforms[uniform].value += (target-uniforms[uniform].value)*mix;
      }
      if(active && frame.onset === true && finite(frame.look?.pulseGain,1,0,2)>0 && clock-(events[(eventIndex+5)%6])>.08) {
        events[eventIndex]=clock;powers[eventIndex]=finite(frame.pulse,.25,0,2);eventIndex=(eventIndex+1)%6;eventCount++;
      }
      updates++;
    } else if (settings.form !== previousForm) weights.copy(targetWeights);
    uniforms.tdTime.value=phase;uniforms.tdClock.value=clock;
    uniforms.tdSpread.value=settings.spread;uniforms.tdTurbulence.value=settings.turbulence;
    uniforms.tdGlow.value=settings.glow*finite(frame.look?.particleGlow,1,.2,2);
    uniforms.tdDepth.value=settings.depth;uniforms.tdFocus.value=settings.focus;
    uniforms.tdDetail.value=finite(frame.look?.particles,1);
    low=frame.quality==='low';sky.material=low?skyLow:skyHigh;water.material=low?waterLow:waterHigh;water.geometry=low?waterLowGeometry:waterHighGeometry;
  }
  function setPalette(world = {}) {
    if(disposed)return;
    if(Number.isInteger(world.light)&&world.light>=0&&world.light<=0xffffff)uniforms.tdPrimary.value.setHex(world.light);
    if(Number.isInteger(world.rim)&&world.rim>=0&&world.rim<=0xffffff)uniforms.tdSecondary.value.setHex(world.rim);
  }
  function diagnostics() {return {mode:'spectral-ocean',quality:low?'low':'high',phase,clock,updates,eventCount,settings:{...settings},formWeights:weights.toArray(),waterVertices:water.geometry.attributes.position.count,waterTriangles:water.geometry.index.count/3,waveComponents:low?5:8,noiseOctaves:low?2:3,disposed};}
  function dispose() {if(disposed)return;disposed=true;for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();group.clear();}
  return {group,view,update,setPalette,diagnostics,dispose};
}
