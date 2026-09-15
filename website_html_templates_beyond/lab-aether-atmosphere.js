/* Aether's bounded emissive medium. The parent owns the renderer and frame clock.
 * A back-face box supplies exit points; every fragment integrates a local-space
 * ray through a three-dimensional density field, including inside-box cameras. */
export function createAetherAtmosphere(THREE) {
  const group = new THREE.Group();
  group.name = 'Aether · luminous medium';
  const clamp = (value, low, high, fallback = low) => Math.min(high, Math.max(low, Number.isFinite(value) ? value : fallback));
  const setting = (source, key, low, high, fallback) => clamp(source?.[key], low, high, fallback);
  const forms = ['silk', 'nova', 'helix'];
  const touch={x:0,y:0,strength:0,active:false,serial:0};
  const touchRay=new THREE.Raycaster(),touchCursor=new THREE.Vector2();
  let touchCamera=null,lastMotion=true;
  // A small deterministic volume supplies non-periodic spatial cloud detail.
  // It is generated once locally, filtered in 3D, and disposed with the asset.
  const noiseData=new Uint8Array(64*64*64);
  let noiseSeed=0x41c64e6d;
  for(let i=0;i<noiseData.length;i++){
    noiseSeed^=noiseSeed<<13;noiseSeed^=noiseSeed>>>17;noiseSeed^=noiseSeed<<5;
    noiseData[i]=(noiseSeed>>>24)&255;
  }
  const noiseField=new THREE.Data3DTexture(noiseData,64,64,64);
  noiseField.name='Aether cloud structure';noiseField.format=THREE.RedFormat;
  noiseField.type=THREE.UnsignedByteType;noiseField.unpackAlignment=1;
  noiseField.wrapS=noiseField.wrapT=noiseField.wrapR=THREE.RepeatWrapping;
  noiseField.minFilter=THREE.LinearMipmapLinearFilter;noiseField.magFilter=THREE.LinearFilter;
  noiseField.generateMipmaps=true;noiseField.needsUpdate=true;
  const uniforms = {
    avCamera: {value: new THREE.Vector3()}, avDirection: {value: new THREE.Vector3(0, 0, -1)}, avOrthographic: {value: 0},
    avHalfBox: {value: new THREE.Vector3(34, 24, 55)},
    avTime: {value: 0}, avForms: {value: new THREE.Vector3(1, 0, 0)}, avSteps: {value: 64},
    avBass: {value: 0}, avMid: {value: 0}, avTreble: {value: 0}, avEnergy: {value: 0},
    avTouchPoint:{value:new THREE.Vector3(0,0,-9)},avTouchAxis:{value:new THREE.Vector3(0,0,-1)},avTouchStrength:{value:0},
    avNoiseField:{value:noiseField},
    avSpread: {value: 1}, avTurbulence: {value: .6}, avDepth: {value: .65}, avFocus: {value: .45}, avGlow: {value: 1},
    avPrimary: {value: new THREE.Color(0xb56aff)}, avSecondary: {value: new THREE.Color(0x58cced)}, avPearl: {value: new THREE.Color(0xe0dcf3)}
  };
  const vertexShader = /* glsl */`
    varying vec3 avExitPoint;
    void main() {
      avExitPoint = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const fragmentShader = /* glsl */`
    precision highp float;
    varying vec3 avExitPoint;
    uniform vec3 avCamera, avDirection, avHalfBox, avForms, avPrimary, avSecondary, avPearl;
    uniform vec3 avTouchPoint,avTouchAxis;
    uniform float avTouchStrength;
    uniform sampler3D avNoiseField;
    uniform float avOrthographic, avTime, avBass, avMid, avTreble, avSpread, avTurbulence, avDepth, avFocus, avGlow;
    uniform int avSteps;

    // The epsilon preserves the sign for near-parallel rays. Zero components
    // use positive epsilon; the slab range then correctly includes/rejects them.
    vec2 avIntersectBox(vec3 origin, vec3 direction) {
      vec3 safeDirection = mix(vec3(-1.0), vec3(1.0), step(vec3(0.0), direction)) * max(abs(direction), vec3(0.000001));
      vec3 nearPlane = (-avHalfBox - origin) / safeDirection;
      vec3 farPlane = (avHalfBox - origin) / safeDirection;
      vec3 lo = min(nearPlane, farPlane), hi = max(nearPlane, farPlane);
      return vec2(max(max(lo.x, lo.y), lo.z), min(min(hi.x, hi.y), hi.z));
    }
    float avFilament(vec2 delta, float thickness) {
      return exp(-dot(delta, delta) / thickness);
    }
    vec3 avTouchOffset(vec3 p) {
      vec3 delta=p-avTouchPoint;
      float distance=length(delta);
      float envelope=exp(-distance*distance*.035)*avTouchStrength;
      return (delta/max(distance,.6)*1.5+cross(avTouchAxis,delta)*.34)*envelope;
    }
    float avSilk(vec3 p) {
      float t = clamp((7.-p.z)/41.,0.,1.);
      float radius = .9+t*9.5;
      float density = 0.;
      for(int bank=0;bank<3;bank++) {
        float family=float(bank);
        float angle=family*2.094+.58+sin(t*5.+avTime*.13)*.34;
        vec2 centre=vec2(cos(angle),sin(angle)*.58)*radius;
        centre+=vec2(sin(t*11.+family),cos(t*8.+family))*.55;
        vec2 delta=p.xy-centre;
        // Five illuminated channels share the particle branch paths. A nearest
        // branch coordinate keeps the fixed ray budget independent of count.
        float width=.26+t*1.6;
        float fork=.42+.58*pow(.5+.5*sin(t*12.+family*1.7-avTime*.09),2.);
        float forkAngle=.4+family*.6+sin(t*7.+avTime*.1)*.38;
        vec2 axis=vec2(cos(forkAngle),sin(forkAngle));
        vec2 q=vec2(dot(delta,axis),dot(delta,vec2(-axis.y,axis.x)));
        float spacing=width*.38*fork;
        float branch=clamp(floor(q.x/spacing+.5),-2.,2.);
        float ridgeX=q.x-branch*spacing-sin(t*35.+branch*1.9+avTime*.22)*(.025+t*.13)*(1.+avTurbulence*.55);
        float ridge=avFilament(vec2(ridgeX*.9,q.y*.75),pow(width*.14+.025,2.));
        // Restore connected cloud shoulders around the engraved channels;
        // fine ridges should belong to a nebula, not isolated light cables.
        float cloudWidth=.44+t*2.7;
        density+=ridge*.86+avFilament(delta/vec2(1.,1.15),cloudWidth*cloudWidth)*.56;
      }
      return density;
    }
    float avNova(vec3 p) {
      float t=clamp((7.-p.z)/41.,0.,1.);
      vec2 centre=vec2(sin(t*5.),cos(t*4.))*(.3+t*.9);
      vec2 q=(p.xy-centre)/vec2(1.,.67);
      float angle=atan(q.y,q.x);
      float radius=1.1+t*12.5+sin(angle*3.+t*9.-avTime*.13)*(.20+t*.7)*avTurbulence;
      radius+=sin(angle*5.+t*17.-avTime*.16)*(.12+t*.64)*(1.+avTurbulence*.25);
      float thickness=.35+t*1.65;
      float shoulder=(length(q)-radius)/thickness;
      float folds=.20+.80*pow(.5+.5*sin(angle*5.+t*14.+avTime*.1),3.);
      float stratum=.5+.5*sin(shoulder*8.+t*23.+sin(angle*7.)*.9-avTime*.15);
      return exp(-shoulder*shoulder)*folds*(.22+pow(stratum,5.)*.92);
    }
    float avHelix(vec3 p) {
      float t=clamp((7.-p.z)/41.,0.,1.);
      float angle=t*8.4+avTime*.12;
      vec2 axis=vec2(cos(angle),sin(angle)*.64)*(.9+t*10.);
      float width=.35+t*2.1;
      float a=avFilament(p.xy-axis,width*width),b=avFilament(p.xy+axis,width*width);
      float striation=pow(.5+.5*sin((p.x+p.y)*3.7+t*21.+avTime*.21),4.);
      return (a*.84+b*.64)*(.30+striation*.90);
    }
    float avConnectedCloud(vec3 p) {
      float t=clamp((7.-p.z)/41.,0.,1.);
      vec2 centre=vec2(sin(t*6.+avTime*.035),cos(t*3.7-avTime*.028))*(.18+t*.62);
      vec2 q=(p.xy-centre)/vec2(1.,.69);
      float angle=atan(q.y,q.x);
      // A folded, narrowing cavity joins the three foreground banks at depth.
      // Its irregular shoulders have real thickness and survive flow=0.
      float radius=(.85+t*8.2)*(1.-smoothstep(.48,1.,t)*.61);
      radius+=sin(angle*3.+t*11.+sin(angle*2.-t*3.)*.8+avTime*.07)*(.12+t*.70);
      float thickness=.34+t*1.8;
      float shoulder=(length(q)-radius)/thickness;
      float folded=.35+.65*pow(.5+.5*sin(angle*4.+p.z*.38+sin(p.y*.6+avTime*.04)),2.);
      float cavity=exp(-shoulder*shoulder)*folded*.26;
      // A distant curved tributary gives the eye a layered luminous destination
      // instead of stopping in a large featureless hole between three jets.
      float streamY=-.4+p.x*.22+sin(p.x*.38+avTime*.09)*1.5;
      float back=exp(-pow((p.z+27.)/6.5,2.))*exp(-pow((p.y-streamY)/(1.5+.25*sin(p.x*.5)),2.));
      back*=1.-smoothstep(10.,18.,abs(p.x));
      float threads=.35+.65*pow(.5+.5*sin(p.y*2.5+p.z*.85+p.x*.47+sin(p.x*.9)*1.3-avTime*.14),3.);
      return cavity+back*threads*.50;
    }
    vec2 avDensity(vec3 point,float stride) {
      // Inverse domain warp follows the same camera-ray force as the forward
      // particle displacement. It bends an actual medium, not a screen decal.
      vec3 p = point-avTouchOffset(point);
      p.xy /= avSpread*(1.+avBass*.18);
      p.z = 3.+(p.z-3.)/mix(.74,1.22,avDepth);
      float along=smoothstep(-36.,-31.,p.z)*(1.-smoothstep(5.5,8.,p.z));
      if(along<.0001)return vec2(0.);
      float t = avTime * 0.12;
      vec3 warp = vec3(sin(p.y * .72 + p.z*.38 + t), sin(p.z * .61 - p.x*.55 + t * .7), sin(p.x * .63 + p.y*.41 - t));
      p += warp * avTurbulence * .30;
      float depthT=clamp((7.-p.z)/41.,0.,1.);
      p.xy-=vec2(sin(p.z*.37+avTime*.4),cos(p.z*.29-avTime*.3))*avMid*(.14+depthT*.48);
      float density = 0.0;
      if (avForms.x > 0.001) density += avSilk(p) * avForms.x;
      if (avForms.y > 0.001) density += avNova(p) * avForms.y;
      if (avForms.z > 0.001) density += avHelix(p) * avForms.z;
      density+=avConnectedCloud(p)*(.95*avForms.x+.52*avForms.y+.74*avForms.z);
      // Sample footprint selects a mip level as ray strides grow. This avoids
      // regular diagonal alias bands without animated screen-space jitter.
      vec3 drift=vec3(avTime*.0013,-avTime*.0008,avTime*.0010);
      float broad=textureLod(avNoiseField,p*.008+drift,max(0.,log2(max(stride*.008*64.,1.)))).r;
      float detail=textureLod(avNoiseField,p*.021+drift*1.7+vec3(.17,.37,.61),max(0.,log2(max(stride*.021*64.,1.)))).r;
      float small=detail;
      if(avSteps>36)small=textureLod(avNoiseField,p*.046+drift*.7+vec3(.73,.11,.43),max(0.,log2(max(stride*.046*64.,1.)))).r;
      float wisp=smoothstep(.36,.64,broad*.65+detail*.27+small*.08);
      float veins=pow(1.-abs(detail*2.-1.),7.);
      float focus=1.-avFocus*smoothstep(8.,38.,abs(p.z+5.))*.6;
      vec3 edge = 1.0 - smoothstep(avHalfBox * 0.88, avHalfBox, abs(point));
      return vec2(density * (.10+wisp*.90) * focus * along * edge.x * edge.y * edge.z,veins);
    }
    void main() {
      if (avDepth <= 0.0001) discard;
      vec3 direction = normalize(avExitPoint - avCamera);
      vec3 origin = avCamera;
      if (avOrthographic > 0.5) {
        direction = normalize(avDirection);
        origin = avExitPoint - direction * (length(avHalfBox) * 3.0);
      }
      vec2 bounds = avIntersectBox(origin, direction);
      float enter = max(bounds.x, 0.0), leave = bounds.y;
      if (leave <= enter) discard;
      float stride = (leave - enter) / float(avSteps);
      float transmittance = 1.0;
      vec3 radiance = vec3(0.0);
      // Midpoint integration is spatially stable: no screen-space random jitter
      // that would keep crawling while Motion is disabled.
      for (int i = 0; i < 64; i++) {
        if (i >= avSteps) break;
        vec3 samplePoint = origin + direction * (enter + (float(i) + 0.5) * stride);
        vec2 medium=avDensity(samplePoint,stride);
        float density = medium.x;
        float opacity = 1.0 - exp(-density * stride * avDepth * 0.36);
        float blend = .5+.5*sin(samplePoint.y*.21+samplePoint.x*.13+samplePoint.z*.11+.8);
        float vein=medium.y;
        vec3 colour = mix(avPrimary, avSecondary, blend);
        colour = mix(colour, avPearl, .015+avTreble*.035+vein*.075);
        radiance += transmittance * opacity * colour * (.82+vein*.95);
        transmittance *= 1.0 - opacity;
        if (transmittance < 0.08) break;
      }
      // Emissive additive integration cannot occlude the fine filaments. Each
      // colour channel is capped to keep this supporting medium below them.
      radiance *= avGlow * (.38+avBass*.09);
      radiance = min(radiance, vec3(0.42));
      if (max(max(radiance.r, radiance.g), radiance.b) < 0.00002) discard;
      gl_FragColor = vec4(radiance, 0.0);
    }
  `;
  const geometry = new THREE.BoxGeometry(68, 48, 110);
  const material = new THREE.ShaderMaterial({
    name: 'AetherBoundedMedium', uniforms, vertexShader, fragmentShader,
    side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: true,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    blendEquationAlpha: THREE.AddEquation, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
    toneMapped: false
  });
  const medium = new THREE.Mesh(geometry, material);
  medium.name = 'Raymarched luminous wisps'; medium.renderOrder = -10;
  group.add(medium);
  const inverseWorld = new THREE.Matrix4();
  function locateTouch(camera=touchCamera){
    if(!camera?.isPerspectiveCamera&&!camera?.isOrthographicCamera)return;
    touchCamera=camera;medium.updateWorldMatrix(true,false);
    inverseWorld.copy(medium.matrixWorld).invert();
    touchCursor.set(touch.x,touch.y);touchRay.setFromCamera(touchCursor,camera);
    touchRay.ray.at(12,uniforms.avTouchPoint.value).applyMatrix4(inverseWorld);
    uniforms.avTouchPoint.value.clampScalar(-55,55);
    uniforms.avTouchAxis.value.copy(touchRay.ray.direction).transformDirection(inverseWorld);
  }
  medium.onBeforeRender = (_renderer, _scene, camera) => {
    if (disposed) return;
    inverseWorld.copy(medium.matrixWorld).invert();
    camera.getWorldPosition(uniforms.avCamera.value).applyMatrix4(inverseWorld);
    camera.getWorldDirection(uniforms.avDirection.value).transformDirection(inverseWorld);
    uniforms.avOrthographic.value = camera.isOrthographicCamera ? 1 : 0;
    if(lastMotion)locateTouch(camera);
  };
  let disposed = false, elapsed = 0, updates = 0, form = 'silk';
  const target = new THREE.Vector3(1, 0, 0);
  let settings = {form, flow: 1, spread: 1, turbulence: .6, glow: 1, depth: .65, focus: .45};
  function update(frame = {}) {
    if (disposed) return;
    lastMotion=frame.motion!==false;
    if(lastMotion){
      touch.x=setting(frame.touch,'x',-1,1,0);touch.y=setting(frame.touch,'y',-1,1,0);
      touch.strength=setting(frame.touch,'strength',0,1,0);touch.active=frame.touch?.active===true;
      touch.serial=Math.floor(setting(frame.touch,'serial',0,Number.MAX_SAFE_INTEGER,0));
      uniforms.avTouchStrength.value=touch.strength;
      if(touchCamera)locateTouch();else uniforms.avTouchPoint.value.set(touch.x*7,touch.y*4,-9);
    }
    const look = frame.labLook;
    const nextForm = forms.includes(look?.form) ? look.form : 'silk';
    const changedForm = nextForm !== form;
    form = nextForm;
    settings = {
      form, flow: setting(look, 'flow', 0, 2, 1), spread: setting(look, 'spread', .6, 1.5, 1),
      turbulence: setting(look, 'turbulence', 0, 1.5, .6), glow: setting(look, 'glow', .2, 1.8, 1),
      depth: setting(look, 'depth', 0, 1, .65), focus: setting(look, 'focus', 0, 1, .45)
    };
    target.set(form === 'silk' ? 1 : 0, form === 'nova' ? 1 : 0, form === 'helix' ? 1 : 0);
    uniforms.avDepth.value = settings.depth;
    uniforms.avFocus.value = settings.focus;
    uniforms.avSpread.value = settings.spread;
    uniforms.avTurbulence.value = settings.turbulence;
    uniforms.avGlow.value = settings.glow * setting(frame.look, 'particleGlow', .2, 2, 1);
    uniforms.avSteps.value = frame.quality === 'low' ? 36 : 64;
    medium.visible = settings.depth > 0;
    if (frame.motion === false) {
      if (changedForm) uniforms.avForms.value.copy(target);
      return;
    }
    const dt = clamp(frame.dt, 0, .125, 1 / 60);
    uniforms.avForms.value.lerp(target, 1 - Math.exp(-dt * 2.2));
    const blend = 1 - Math.exp(-dt * (frame.active===true?9:5));
    for (const [input, output] of [['bass', 'avBass'], ['mid', 'avMid'], ['treble', 'avTreble'],['energy','avEnergy']]) {
      const level = frame.active === true ? clamp(frame[input], 0, 1, 0) : 0;
      uniforms[output].value += (level - uniforms[output].value) * blend;
    }
    elapsed += dt * settings.flow * (.34+uniforms.avEnergy.value*.68);
    uniforms.avTime.value = elapsed;
    updates++;
  }
  function setPalette(world = {}) {
    if (disposed) return;
    uniforms.avPrimary.value.set(world.light ?? 0xb56aff);
    uniforms.avSecondary.value.set(world.rim ?? 0x58cced);
    uniforms.avPearl.value.set(world.tint ?? 0xe0dcf3).lerp(new THREE.Color(0xe0dcf3), .75);
  }
  function diagnostics() {
    return {
      technique: 'bounded emissive raymarch', draws: 1, raySteps: uniforms.avSteps.value,noiseResolution:64,noiseBytes:noiseData.byteLength,
      elapsed, updates, form, formBlend: uniforms.avForms.value.toArray(),
      signals: {bass: uniforms.avBass.value, mid: uniforms.avMid.value, treble: uniforms.avTreble.value},
      settings: {...settings}, visible: medium.visible, disposed
      ,touch:{...touch,point:uniforms.avTouchPoint.value.toArray(),axis:uniforms.avTouchAxis.value.toArray(),frozen:!lastMotion}
    };
  }
  function dispose() {
    if (disposed) return;
    disposed = true; medium.onBeforeRender = () => {}; touchCamera=null;noiseField.dispose();geometry.dispose(); material.dispose(); group.clear();
  }
  return {group, update, setPalette, diagnostics, dispose};
}
