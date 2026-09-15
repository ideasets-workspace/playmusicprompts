/* Tidal — a composed ocean world. The host owns the renderer, camera and clock. */
export function createTidalAsset(THREE) {
  const group = new THREE.Group(); group.name = 'Tidal';
  const finite = (v, d, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : d));
  const forms = ['silk', 'nova', 'helix'];
  const defaults = {form: 'silk', flow: 1, spread: 1, turbulence: .6, glow: 1, depth: .65, focus: .45, journey: false};
  let settings = {...defaults}, clock = 0, phase = 0, updates = 0, eventCount = 0, eventIndex = 0, disposed = false, low = false;
  let lastTouchSerial = 0, touchCount = 0, touchIndex = 0;
  const events = new Float32Array(6).fill(-100), powers = new Float32Array(6);
  const touchRings = Array.from({length: 4}, () => new THREE.Vector4(0,0,-100,0));
  const weights = new THREE.Vector3(1, 0, 0), targetWeights = new THREE.Vector3(1, 0, 0);
  const uniforms = {
    tdTime: {value: 0}, tdClock: {value: 0}, tdBass: {value: 0}, tdMid: {value: 0}, tdTreble: {value: 0}, tdEnergy: {value: 0},
    tdSpread: {value: 1}, tdTurbulence: {value: .6}, tdGlow: {value: 1}, tdDepth: {value: .65}, tdFocus: {value: .45},
    tdDetail: {value: 1}, tdWeights: {value: weights}, tdEvents: {value: events}, tdPowers: {value: powers},
    tdTouch: {value: new THREE.Vector3(0,-12,0)}, tdTouchRings: {value: touchRings},
    tdCamera: {value: new THREE.Vector3()}, tdPrimary: {value: new THREE.Color(0xb56aff)}, tdSecondary: {value: new THREE.Color(0x58cced)}
  };
  const common = /* glsl */`
    uniform float tdTime, tdClock, tdBass, tdMid, tdTreble, tdEnergy;
    uniform float tdSpread, tdTurbulence, tdGlow, tdDepth, tdFocus, tdDetail;
    uniform vec3 tdWeights, tdCamera, tdPrimary, tdSecondary;
    uniform float tdEvents[6], tdPowers[6];
    uniform vec3 tdTouch;
    uniform vec4 tdTouchRings[4];
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
      float cloudRim=smoothstep(.39,.55,cloud)*(1.-smoothstep(.55,.69,cloud));
      color=mix(color,tdPrimary*.075+vec3(.012,.016,.026),veil*(.24+tdWeights.y*.40));
      color+=warm*cloudRim*exp(-angle*angle*5.)*.043*tdDepth*smoothstep(.04,.11,rd.y);
      float highCloud=tdFbm(vec2(cloudP.x*.7+tdTime*.004,cloudP.y*1.9+8.));
      float cloudHeight=.24+sin(cloudP.x*.7)*.06;
      color+=mix(tdPrimary,tdSecondary,.25)*smoothstep(.43,.67,highCloud)*exp(-pow((rd.y-cloudHeight)*13.,2.))*.026*tdDepth;
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
    float tdTouchLight(vec2 xz, float footprint) {
      vec2 delta=xz-tdTouch.xy;
      float light=exp(-dot(delta,delta)*.65)*tdTouch.z*.46;
      for(int j=0;j<4;j++) {
        vec4 ring=tdTouchRings[j];float age=tdClock-ring.z;
        float r=length(xz-ring.xy)-age*3.2;
        float envelope=step(0.,age)*(1.-smoothstep(3.,5.,age));
        float width=max(.22,footprint*1.3);
        light+=exp(-r*r/(width*width))*envelope*ring.w*.38*.22/width;
      }
      return min(light,1.);
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
      for(int j=0;j<4;j++) {
        vec4 touchRing=tdTouchRings[j];float age=tdClock-touchRing.z;
        vec2 delta=xz-touchRing.xy;float r=max(length(delta),.001), ring=r-age*3.2;
        float envelope=step(0.,age)*(1.-smoothstep(3.,5.,age))*touchRing.w*.09*exp(-ring*ring*.65);
        float p=ring*4.6;
        s.x+=sin(p)*envelope;
        s.yz+=(delta/r)*(cos(p)*4.6-sin(p)*ring*1.3)*envelope;
      }
      // A differentiable safety envelope keeps even maximum-signal storm crests
      // below the composed camera, and applies the exact derivative to the normal.
      float bounded=2./(1.+exp(-2.*s.x/.92))-1.;
      s.yz*=1.-bounded*bounded;s.x=bounded*.92;
      return s;
    }
    vec3 tdNormal(vec2 xz, float footprint) {
      vec3 s=tdSurface(xz);
      float small=(.018+tdTurbulence*.038+tdWeights.y*.055)*(1.+tdTreble*.34);
      for(int j=0;j<TD_MICRO;j++) {
        float i=float(j), k=7.3+i*5.1;vec2 d=vec2(cos(i*2.3+.3),sin(i*2.3+.3));
        float p=dot(xz,d)*k+tdTime*(1.7+i*.4)+sin(dot(xz,d.yx)*.71+tdTime*.17)*.6;
        float tdFootprintWeight=exp(-k*k*footprint*footprint*.65);
        s.yz+=d*cos(p)*small*tdFootprintWeight/(1.+i*.5);
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
    vec4 tdCoastReflection(vec3 origin,vec3 ray) {
      float nearest=1000.;vec3 color=vec3(0.);
      for(int island=0;island<3;island++) {
        vec2 center=island==0?vec2(-14.,-29.):island==1?vec2(25.,-48.):vec2(-27.,-50.);
        vec2 radii=island==0?vec2(7.,12.):island==1?vec2(11.,12.):vec2(9.,12.);
        float height=island==0?5.8:island==1?4.4:8.2;
        vec2 o=(origin.xz-center)/radii,d=ray.xz/radii;
        float a=dot(d,d),b=dot(o,d),c=dot(o,o)-1.,discriminant=b*b-a*c;
        if(a>.000001&&discriminant>0.) {
          float entry=max(0.,(-b-sqrt(discriminant))/a),exitDistance=(-b+sqrt(discriminant))/a;
          if(exitDistance>entry&&entry<nearest) {
            for(int j=0;j<TD_COAST_STEPS;j++) {
              float distance=mix(entry,exitDistance,(float(j)+.5)/float(TD_COAST_STEPS));
              vec3 p=origin+ray*distance;float radial=length((p.xz-center)/radii);
              float t=clamp((radial-.08)/.92,0.,1.),profile=pow(max(0.,1.-t*t*(3.-2.*t)),.76);
              float surface=-1.68+height*profile*.87;
              if(p.y<surface&&p.y>-1.5&&distance<nearest) {
                nearest=distance;float haze=1.-exp(-distance*.020);
                color=mix(vec3(.009,.018,.025)+tdPrimary*.018,tdHorizon(),haze*.55);
              }
            }
          }
        }
      }
      return vec4(color,nearest<999.?1.:0.);
    }
    vec3 tdLivingCurrent(vec3 eye, vec3 normal, float footprint) {
      vec3 ray=refract(-eye,normal,1./1.333), light=vec3(0.);
      float slope=max(abs(ray.y),.14);
      for(int j=0;j<TD_CURRENT_LAYERS;j++) {
        float layer=float(j), depth=.25+layer*.52;
        vec2 p=tdPoint.xz+ray.xz*(depth/slope);
        vec2 q=p*.23+vec2(tdTime*.026,-tdTime*.011);
        float warp=tdFbm(q*.82+layer*4.7);
        float stream=sin(q.x*.8+q.y*.47+warp*3.2+layer*1.9);
        float thickness=.15+footprint*.18;
        float ribbon=exp(-stream*stream/(thickness*thickness));
        float broken=smoothstep(.26,.63,tdFbm(q*2.4+vec2(0.,tdTime*.04)));
        float caustic=pow(max(0.,1.-abs(sin(q.x*4.1+warp*5.))*abs(sin(q.y*3.7-warp*3.))),4.)*exp(-footprint*footprint*.8);
        float near=exp(-length(p-tdCamera.xz)*.07);
        vec3 tint=mix(mix(tdSecondary,tdPrimary,.15+layer*.19),vec3(.10,.66,.70),.25);
        light+=tint*(ribbon*broken*.063+caustic*.016)*exp(-depth*.85)*near;
      }
      return light*(.65+.6*tdDepth)*(1.+tdMid*.28)*tdGlow*tdDetail;
    }
    void main(){
      float footprint=max(length(dFdx(tdPoint.xz)),length(dFdy(tdPoint.xz)));
      vec3 eye=normalize(tdCamera-tdPoint), n=tdNormal(tdPoint.xz,footprint);
      vec3 reflection=reflect(-eye,n); reflection.y=abs(reflection.y);
      float facing=max(dot(eye,n),.0), fresnel=.022+.978*pow(1.-facing,5.);
      vec3 reflected=tdSky(reflection);
      vec4 coastReflection=tdCoastReflection(tdPoint,reflection);
      reflected=mix(reflected,coastReflection.rgb,coastReflection.a);
      vec3 sea=mix(vec3(.002,.013,.022),tdSecondary*.034,.45);
      float subsurface=pow(max(dot(normalize(vec3(-.2,.2,-1.)),-eye),0.),4.)*max(0.,tdPoint.y+1.52);
      vec3 color=sea*(.55+.6*facing)+reflected*(.40+.60*fresnel);
      color+=tdSecondary*subsurface*.012*(1.+tdBass);
      color+=tdLivingCurrent(eye,n,footprint)*(.35+.65*facing);
      float glint=pow(max(dot(reflection,tdSunDirection()),0.),mix(220.,950.,tdFocus));
      color+=mix(tdPrimary,vec3(1.,.67,.36),.64)*glint*(.22+.7*tdGlow);
      // Broken luminous filigree follows the moving crests, never a regular wire grid.
      float crest=tdSurface(tdPoint.xz).x;
      float filamentWidth=max(.032,fwidth(crest)*1.3);
      float filament=exp(-pow((crest-.13-tdWeights.y*.10)/filamentWidth,2.))*.032/filamentWidth;
      float breakup=smoothstep(.53,.78,tdFbm(tdPoint.xz*2.2+vec2(tdTime*.05,0.)));
      float farFade=exp(-length(tdPoint.xz-tdCamera.xz)*.075);
      color+=tdSecondary*filament*breakup*farFade*(.13+tdTreble*.30+tdEnergy*.09)*tdGlow*tdDetail;
      float foam=smoothstep(.12,.40,crest)*smoothstep(.50,.72,tdFbm(tdPoint.xz*1.5+tdTime*.015));
      color+=mix(vec3(.24,.32,.34),tdSecondary*.38,.55)*foam*farFade*(.16+tdWeights.y*.28);
      color+=mix(tdSecondary,vec3(.30,.95,1.),.80)*tdTouchLight(tdPoint.xz,footprint)*tdGlow*(.35+.65*tdDetail);
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
      defines: {TD_WAVES: isLow ? 5 : 8, TD_NOISE: isLow ? 2 : 3, TD_MICRO: isLow ? 2 : 4, TD_CURRENT_LAYERS: isLow ? 1 : 3, TD_COAST_STEPS: isLow ? 3 : 6}});
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
  // Actual depth-separated landforms frame the accepted central eclipse. Their
  // uneven shelves, cliff faces and shoreline are geometry, not flat sky decals.
  const islandSpecs = [[-14,-29,7,12,5.8,1.3],[25,-48,11,12,4.4,5.2],[-27,-50,9,12,8.2,8.7]];
  const coastVertex = /* glsl */`varying vec3 tdCoastPoint,tdCoastNormal;void main(){tdCoastPoint=position;tdCoastNormal=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
  const coastFragment = common + /* glsl */`
    varying vec3 tdCoastPoint,tdCoastNormal;
    void main(){
      vec3 normal=normalize(tdCoastNormal+vec3(0.,.00001,0.));
      vec2 stone=vec2(tdCoastPoint.x*.45+tdCoastPoint.z*.21,tdCoastPoint.y*1.8);
      float grain=tdFbm(stone), strata=sin(tdCoastPoint.y*6.+tdFbm(stone*.45)*6.);
      float strataFilter=exp(-fwidth(tdCoastPoint.y)*fwidth(tdCoastPoint.y)*72.);
      float face=.28+.58*max(dot(normal,tdSunDirection()),0.)+.12*max(normal.y,0.);
      vec3 color=mix(vec3(.008,.015,.023),tdPrimary*.038,.32)*(face+.23*grain);
      color+=mix(tdPrimary,vec3(.68,.37,.21),.50)*max(dot(normal,tdSunDirection()),0.)*.035;
      color*=.86+.14*strata*strataFilter;
      float wet=1.-smoothstep(-1.26,-.22,tdCoastPoint.y);color*=1.-wet*.32;
      float shore=exp(-pow((tdCoastPoint.y+1.20)*8.,2.));
      color+=tdSecondary*shore*(.14+.10*sin(tdTime*.55+tdCoastPoint.x*.7))*(.45+.55*grain)*tdGlow;
      float distanceToEye=length(tdCoastPoint-tdCamera);
      float fog=1.-exp(-pow(distanceToEye*(.009+tdDepth*.007),1.45));
      color=mix(color,tdSky(normalize(tdCoastPoint-tdCamera)),fog*.68);
      gl_FragColor=vec4(max(color,vec3(0.)),1.);
    }
  `;
  const coastHigh = makeMaterial(false,coastVertex,coastFragment), coastLow = makeMaterial(true,coastVertex,coastFragment);
  const islandGeometry = (spec,segments,rings) => {
    const [cx,cz,rx,rz,height,seed]=spec,positions=[],indices=[];
    for(let r=0;r<=rings;r++)for(let i=0;i<=segments;i++) {
      const radial=r/rings,a=i/segments*Math.PI*2;
      const edge=1+.09*Math.sin(a*5+seed)+.045*Math.sin(a*11-seed);
      const x=cx+Math.cos(a)*rx*radial*edge,z=cz+Math.sin(a)*rz*radial*edge;
      const t=Math.max(0,Math.min(1,(radial-.08)/.92)),smooth=t*t*(3-2*t);
      const profile=Math.pow(1-smooth,.76),ridge=.87+.10*Math.sin(a*3+seed)*radial+.055*Math.sin(a*7-seed)*radial;
      const crag=(Math.sin(x*1.4+z*.61)+Math.sin(x*.77-z*1.21))*.10*Math.sin(radial*Math.PI);
      const y=-1.68+height*profile*ridge+crag;
      positions.push(x,y,z);
    }
    for(let r=0;r<rings;r++)for(let i=0;i<segments;i++) {
      const a=r*(segments+1)+i,b=a+segments+1;indices.push(a,b+1,b,a,a+1,b+1);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();geometries.push(geometry);return geometry;
  };
  const islands=islandSpecs.map((spec,index)=>{
    const high=islandGeometry(spec,64,20),low=islandGeometry(spec,32,10),mesh=new THREE.Mesh(high,coastHigh);
    mesh.name=`Tidal coastline ${index+1}`;group.add(mesh);return {mesh,high,low};
  });
  const inverse = new THREE.Matrix4(), cameraWorld = new THREE.Vector3();
  const syncCamera = (_renderer, _scene, camera) => {
    inverse.copy(group.matrixWorld).invert(); camera.getWorldPosition(cameraWorld);
    uniforms.tdCamera.value.copy(cameraWorld).applyMatrix4(inverse);
  };
  sky.onBeforeRender = water.onBeforeRender = syncCamera;
  for(const island of islands)island.mesh.onBeforeRender=syncCamera;
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
      const touch=frame.touch||{}, x=finite(touch.x,0,-1,1),y=finite(touch.y,0,-1,1),strength=finite(touch.strength,0);
      uniforms.tdTouch.value.set(x*(4+(y+1)*5.5),-2-(y+1)*12,strength);
      if(touch.active===true&&Number.isSafeInteger(touch.serial)&&touch.serial>lastTouchSerial&&touch.serial>0) {
        lastTouchSerial=touch.serial;
        touchRings[touchIndex].set(uniforms.tdTouch.value.x,uniforms.tdTouch.value.y,clock,Math.max(.35,strength));
        touchIndex=(touchIndex+1)%4;touchCount++;
      }
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
    for(const island of islands){island.mesh.geometry=low?island.low:island.high;island.mesh.material=low?coastLow:coastHigh;}
  }
  function setPalette(world = {}) {
    if(disposed)return;
    if(Number.isInteger(world.light)&&world.light>=0&&world.light<=0xffffff)uniforms.tdPrimary.value.setHex(world.light);
    if(Number.isInteger(world.rim)&&world.rim>=0&&world.rim<=0xffffff)uniforms.tdSecondary.value.setHex(world.rim);
  }
  function diagnostics() {return {mode:'living-spectral-ocean',quality:low?'low':'high',phase,clock,updates,eventCount,touchCount,touchSerial:lastTouchSerial,touch:uniforms.tdTouch.value.toArray(),settings:{...settings},formWeights:weights.toArray(),waterVertices:water.geometry.attributes.position.count,waterTriangles:water.geometry.index.count/3,coastVertices:islands.reduce((sum,island)=>sum+island.mesh.geometry.attributes.position.count,0),currentLayers:low?1:3,waveComponents:low?5:8,noiseOctaves:low?2:3,disposed};}
  function dispose() {if(disposed)return;disposed=true;for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();group.clear();}
  return {group,view,update,setPalette,diagnostics,dispose};
}
