/* Aether: a surrounding nebular current with persistent GPU light filaments.
 * The listening room owns the renderer,
 * clock, analyser and camera. No timers, external textures or generated beats. */
export function createAetherAsset(THREE, { renderer } = {}) {
  const group = new THREE.Group(); group.name = 'Aether';
  const SIDE = 256, COUNT = SIDE * SIDE, SEGMENTS = SIDE - 1;
  const FIELD_COUNT = 4096, RIDER_COUNT = 768;
  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo));
  const value = (o, k, d, lo, hi) => clamp(Number.isFinite(o?.[k]) ? o[k] : d, lo, hi);
  const forms = ['silk', 'nova', 'helix'];
  const defaults = { form: 'silk', flow: 1, spread: 1, turbulence: .6, glow: 1, depth: .65, focus: .45, journey: false };
  let settings = { ...defaults }, disposed = false, initialized = false;
  let mode = 'analytical-shader', reason = 'A floating-point renderer has not been supplied.';
  let phase = 0, clock = 0, updates = 0, frames = 0, pendingDt = 0, eventCount = 0, eventIndex = 0;
  let lastStatic = '', lastForm = '', quality = 'high', count = COUNT;
  let readTarget = null, writeTarget = null;
  const targets = [], geometries = [], materials = [];
  const drawSize = new THREE.Vector2(1280, 720);
  const events = new Float32Array(8).fill(-100), powers = new Float32Array(8);
  const spectrum = new Float32Array(64);
  const weights = new THREE.Vector3(1, 0, 0);
  const uniforms = {
    aPhase: { value: 0 }, aClock: { value: 0 }, aDt: { value: 0 }, aReset: { value: 1 },
    aWeights: { value: weights }, aSpread: { value: 1 }, aTurbulence: { value: .6 }, aDepth: { value: .65 },
    aFocus: { value: .45 }, aGlow: { value: 1 }, aFlow: { value: 1 }, aIntensity: { value: .65 },
    aBass: { value: 0 }, aMid: { value: 0 }, aTreble: { value: 0 }, aEnergy: { value: 0 },
    aPulseGain: { value: 1 }, aSpectrum: { value: spectrum }, aEvents: { value: events }, aPowers: { value: powers },
    aPrimary: { value: new THREE.Color(0xb56aff) }, aSecondary: { value: new THREE.Color(0x58cced) },
    aPearl: { value: new THREE.Color(0xe9e5ff) }, aGpu: { value: 0 }, aHeight: { value: 720 }, aLineCoverage: { value: 1 },
    aPositions: { value: null }, aPrevious: { value: null }
  };
  const emptyTexture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  emptyTexture.needsUpdate = true;
  uniforms.aPositions.value = emptyTexture; uniforms.aPrevious.value = emptyTexture;

  // Names deliberately use the ae prefix: Three injects common shader helpers.
  const shapeShader = /* glsl */`
    uniform float aPhase, aClock, aDt, aReset, aSpread, aTurbulence, aDepth, aFlow;
    uniform float aBass, aMid, aTreble, aEnergy, aPulseGain;
    uniform vec3 aWeights;
    uniform float aEvents[8], aPowers[8];
    const float AE_TAU = 6.28318530718;
    float aeHash(float n) { return fract(sin(n * 127.1 + 17.7) * 43758.5453); }
    mat2 aeTurn(float a) { float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
    float aeFront(vec3 p) {
      float light = 0.;
      for (int i=0; i<8; i++) {
        float age = aClock - aEvents[i];
        float d = (length(vec3(p.xy*.5,(p.z-4.)*.65)) - age * 18.) * 1.8;
        light += exp(-d*d) * aPowers[i] * step(0.,age) * (1.-smoothstep(1.2,2.,age));
      }
      return min(light, 1.5) * step(.00001, aPulseGain);
    }
    vec3 aeShape(vec2 uv) {
      float row = floor(uv.y * 256.);
      float lane = row / 256.;
      float t = (uv.x * 256. - .5) / 255.;
      float family = floor(lane * 3.);
      float ribbon = fract(lane * 3.) - .5;
      float seed = aeHash(row + 1.);
      // The camera inhabits the near end of this forty-one-unit field. Streams
      // continue past the screen edges; this is deliberately not object-fitted.
      float z = 7. - t*41.;
      float depthScale = .9 + t*9.5;
      float bankAngle = family*2.094 + .58 + sin(t*5.+aPhase*.13)*.34;
      vec2 bank = vec2(cos(bankAngle),sin(bankAngle)*.58)*depthScale;
      bank += vec2(sin(t*11.+family),cos(t*8.+family))*.55;
      vec3 silk = vec3(bank,z);
      float bankWidth = .26+t*1.6;
      silk.xy += ribbon*bankWidth*vec2(1.2+sin(t*7.+family)*.7,2.2+cos(t*9.+family));
      silk.xy += vec2(sin(t*43.+seed*8.+aPhase*.24),cos(t*37.+seed*9.-aPhase*.19)) * (.04+t*.17)*aTurbulence;
      silk.z += ribbon*.5;
      // Hundreds of irregular trajectories line a vast open cavity. There are
      // no closed orbital rings: every fibre carries the eye through depth.
      float angle = lane*AE_TAU + t*2.4 + sin(t*3.2+seed*4.)*.48 + aPhase*.09;
      float radius = 1.1+t*12.5 + sin(t*21.+seed*12.)*(.16+t*.9)*aTurbulence;
      radius += (seed-.5)*(.3+t*2.4);
      vec3 nova = vec3(cos(angle)*radius,sin(angle)*radius*.67,z);
      nova.xy += vec2(sin(t*5.),cos(t*4.))*(.3+t*.9);
      // Two large cloud currents braid across the sightline and pass around
      // the viewer, instead of forming a miniature vertical DNA object.
      float side = step(.5,lane);
      float thread = fract(lane*2.)-.5;
      float helixAngle = t*8.4 + side*3.14159265359 + aPhase*.12;
      float helixRadius = .9+t*10.+thread*(.6+t*3.);
      vec3 helix = vec3(cos(helixAngle)*helixRadius,sin(helixAngle)*helixRadius*.64,z);
      helix.xy += vec2(sin(t*34.+thread*4.),cos(t*27.+thread*6.))*(.06+t*.18)*aTurbulence;
      vec3 p = silk*aWeights.x + nova*aWeights.y + helix*aWeights.z;
      p.xy += vec2(sin(p.z*.37+aPhase*.4),cos(p.z*.29-aPhase*.3))*aMid*(.14+t*.48);
      p.xy *= aSpread * (1.+aBass*.18);
      p.z = 3. + (p.z-3.)*mix(.74,1.22,aDepth);
      p += normalize(vec3(p.xy,p.z+8.)+vec3(.0001)) * aeFront(p) * .30;
      return p;
    }
    vec3 aeDrift(vec3 p) {
      // A bounded, divergence-free trigonometric field transports persistent
      // positions between attraction updates; no per-frame CPU position upload.
      return vec3(cos(p.y*1.9+aPhase)-sin(p.z*2.1-aPhase),
                  cos(p.z*1.7+aPhase*.7)-sin(p.x*1.8),
                  cos(p.x*1.6-aPhase*.8)-sin(p.y*2.))*aTurbulence*.09*aFlow;
    }
  `;

  const computeScene = new THREE.Scene(), computeCamera = new THREE.Camera();
  const computeGeometry = new THREE.BufferGeometry();
  computeGeometry.setAttribute('position', new THREE.Float32BufferAttribute([-1,-1,0, 3,-1,0, -1,3,0],3));
  geometries.push(computeGeometry);
  const computeMaterial = new THREE.ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false, blending: THREE.NoBlending, toneMapped: false,
    vertexShader: 'void main(){gl_Position=vec4(position,1.);}',
    fragmentShader: /* glsl */`
      ${shapeShader}
      uniform sampler2D aPrevious;
      void main() {
        vec2 uv = gl_FragCoord.xy / 256.;
        vec3 target = aeShape(uv);
        vec3 previous = texture2D(aPrevious,uv).xyz;
        vec3 p = aReset > .5 ? target : mix(previous + aeDrift(previous)*aDt, target, 1.-exp(-aDt*5.8));
        gl_FragColor = vec4(clamp(p,vec3(-65.),vec3(65.)),1.);
      }
    `
  });
  materials.push(computeMaterial);
  const computeQuad = new THREE.Mesh(computeGeometry, computeMaterial); computeQuad.frustumCulled = false;
  computeScene.add(computeQuad);

  // Render targets change the current GL viewport/scissor internally. Preserve
  // both the public logical settings and an active target's actual pixel state,
  // including custom target viewports and cube/mipmap selection.
  const savedViewport = new THREE.Vector4(), savedScissor = new THREE.Vector4();
  const targetViewport = new THREE.Vector4(), targetScissor = new THREE.Vector4();
  function withRendererState(operation) {
    const previousTarget = renderer.getRenderTarget();
    const face = renderer.getActiveCubeFace(), mip = renderer.getActiveMipmapLevel();
    renderer.getCurrentViewport(savedViewport);
    const gl = renderer.getContext();
    savedScissor.fromArray(gl.getParameter(gl.SCISSOR_BOX));
    const actualScissor = gl.isEnabled(gl.SCISSOR_TEST);
    const clear = renderer.autoClear, xr = renderer.xr.enabled;
    try {
      renderer.xr.enabled = false; renderer.autoClear = true;
      return operation(gl);
    } finally {
      if (previousTarget) {
        targetViewport.copy(previousTarget.viewport); targetScissor.copy(previousTarget.scissor);
        const targetTest = previousTarget.scissorTest;
        previousTarget.viewport.copy(savedViewport); previousTarget.scissor.copy(savedScissor); previousTarget.scissorTest = actualScissor;
        try { renderer.setRenderTarget(previousTarget,face,mip); }
        finally { previousTarget.viewport.copy(targetViewport); previousTarget.scissor.copy(targetScissor); previousTarget.scissorTest = targetTest; }
      } else renderer.setRenderTarget(null,face,mip);
      renderer.autoClear = clear; renderer.xr.enabled = xr;
    }
  }
  function switchToAnalytical(error) {
    mode = 'analytical-shader'; reason = error instanceof Error ? error.message : String(error);
    uniforms.aGpu.value = 0; uniforms.aPositions.value = emptyTexture;
  }
  if (renderer?.isWebGLRenderer && renderer.capabilities.maxVertexTextures > 0 && renderer.extensions.has('EXT_color_buffer_float')) {
    try {
      for (let i=0;i<2;i++) {
        const target = new THREE.WebGLRenderTarget(SIDE,SIDE,{
          type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.NearestFilter,
          magFilter: THREE.NearestFilter, depthBuffer: false, stencilBuffer: false,
          generateMipmaps: false, samples: 0
        });
        target.texture.name = `Aether position state ${i}`; targets.push(target);
      }
      withRendererState(gl => {
        for (const target of targets) {
          renderer.setRenderTarget(target);
          if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Half-float position targets are not renderable on this device.');
        }
      });
      [readTarget,writeTarget] = targets;
      mode = 'gpu-half-float'; reason = null;
    } catch(error) { switchToAnalytical(error); }
  } else if (renderer) reason = 'Renderable half-float color targets or vertex texture access are unavailable.';

  function compute(dt,reset) {
    if (mode !== 'gpu-half-float') return;
    uniforms.aDt.value = clamp(dt,0,.15); uniforms.aReset.value = reset ? 1 : 0;
    uniforms.aPrevious.value = initialized ? readTarget.texture : emptyTexture;
    try {
      withRendererState(() => { renderer.setRenderTarget(writeTarget); renderer.render(computeScene,computeCamera); });
      const previous = readTarget; readTarget = writeTarget; writeTarget = previous;
      uniforms.aPositions.value = readTarget.texture; uniforms.aGpu.value = 1;
      initialized = true; updates++;
    } catch(error) { switchToAnalytical(error); }
  }

  // Bit-reversed row ordering means reduced detail samples every light bundle,
  // instead of amputating the last forms or drawing one side of the helix.
  const reverseByte = n => { let r=0; for(let i=0;i<8;i++){r=(r<<1)|(n&1);n>>=1;} return r; };
  const pointUV = new Float32Array(COUNT*2), lineUV = new Float32Array(SIDE*SEGMENTS*4);
  for(let row=0;row<SIDE;row++) {
    const v=(reverseByte(row)+.5)/SIDE;
    for(let col=0;col<SIDE;col++) {
      const k=(row*SIDE+col)*2; pointUV[k]=(col+.5)/SIDE; pointUV[k+1]=v;
      if(col<SEGMENTS) {
        const j=(row*SEGMENTS+col)*4;
        lineUV[j]=(col+.5)/SIDE;lineUV[j+1]=v;lineUV[j+2]=(col+1.5)/SIDE;lineUV[j+3]=v;
      }
    }
  }
  const renderVertex = /* glsl */`
    ${shapeShader}
    uniform sampler2D aPositions;
    uniform float aGpu, aHeight, aFocus, aSpectrum[64];
    attribute vec2 aLookup;
    #if AE_KIND >= 2
      attribute vec3 aDetail;
    #endif
    varying float aeColour, aeLight, aeFocus, aeSeed, aeCoverage;
    void main() {
      vec2 lookup = aLookup;
      #if AE_KIND == 3
        // A small set of riders travels through the retained GPU trajectories.
        // Different seeded velocities avoid a synchronized flashing dotted line.
        lookup.x = fract(lookup.x + aPhase * (.029 + aDetail.x * .019));
        lookup.x = clamp(lookup.x, .5/256., 255.5/256.);
      #endif
      vec3 p = aGpu > .5 ? texture2D(aPositions,lookup).xyz : aeShape(lookup);
      float row = floor(aLookup.y*256.);
      aeSeed = aeHash(row+1.);
      aeColour = .5+.5*sin(lookup.x*4.4+row*.023+aPhase*.035);
      float sweep = pow(max(.5+.5*sin(lookup.x*27.-aPhase*1.8+row*.013),0.),12.);
      #if AE_KIND == 2
        // Depth lives both within and around the sculpture, not on a uniform
        // spherical shell. The cloud inherits its parent's current morph/state.
        float azimuth = aDetail.x * AE_TAU;
        float vertical = aDetail.y * 2. - 1.;
        vec3 direction = vec3(cos(azimuth)*sqrt(max(1.-vertical*vertical,0.)),vertical,sin(azimuth)*sqrt(max(1.-vertical*vertical,0.)));
        float farLayer = smoothstep(.68,.96,aDetail.z);
        float distance = .20 + aDetail.z*aDetail.z*1.8 + farLayer*1.7;
        // Suspended motes give sparse near/far depth, while the open focal
        // corridor stays readable through every environment state.
        p.xy *= 1. - aWeights.y * (.03 + (1.-aDetail.z)*.18);
        vec3 offset = direction * distance;
        offset.z *= 1.3 + aDepth*2.;
        offset += vec3(sin(aPhase*.19+aDetail.y*19.),cos(aPhase*.16+aDetail.z*13.),sin(aPhase*.23+aDetail.x*11.)) * .07 * aTurbulence;
        p += offset * aSpread;
        aeSeed = aDetail.z;
        aeColour = fract(aDetail.x*.71+aeColour*.5);
      #elif AE_KIND == 3
        p += vec3(sin(aDetail.y*AE_TAU),cos(aDetail.y*AE_TAU),sin(aDetail.z*AE_TAU)) * (.009+aTreble*.025);
      #endif
      float pulse = aeFront(p);
      aeLight = .13 + sweep*.32 + aTreble*(.035+aeSeed*.11) + aSpectrum[int(mod(row,64.))]*.13 + pulse*1.4;
      #if AE_KIND == 2
        aeLight = .045 + aeSeed*.055 + aTreble*.11 + pulse*.48;
      #elif AE_KIND == 3
        // The quiet current is ambient drift. Only supplied active spectral
        // energy and actual recorded onset fronts create the bright response.
        aeLight = (.15+aEnergy*.12+aTreble*.29+pulse*1.8) * smoothstep(0.,.055,lookup.x) * (1.-smoothstep(.945,1.,lookup.x));
      #endif
      vec4 view = modelViewMatrix * vec4(p,1.);
      // Focus controls how strongly depth separates luminous motes. It does not
      // purport to be a physically calibrated camera depth-of-field simulation.
      aeFocus = clamp(abs(p.z+5.) * aFocus * .025, 0., .8);
      gl_Position = projectionMatrix * view;
      float diameter = .016+.016*aeSeed+aeFocus*.012+aTreble*.005;
      #if AE_KIND == 2
        diameter = .045 + aeSeed*.08 + aeFocus*.07;
      #elif AE_KIND == 3
        diameter = .038 + aDetail.x*.048 + aTreble*.012 + pulse*.025;
      #endif
      float projected = diameter * aHeight * projectionMatrix[1][1] / max(-view.z,.5);
      // A GL point is at least a pixel on many devices. Without area coverage,
      // subpixel samples accumulate into opaque white wires in a small preview.
      aeCoverage = min(projected*projected,1.);
      gl_PointSize = clamp(projected,1.,16.);
    }
  `;
  function drawObject(kind) {
    const isPoints=kind!==0;
    const geometry = new THREE.BufferGeometry();
    let uv=kind===0?lineUV:pointUV;
    if(kind>=2) {
      const length=kind===2?FIELD_COUNT:RIDER_COUNT;
      uv=new Float32Array(length*2);
      const detail=new Float32Array(length*3);
      // Deterministic stratified rows preserve spatial variety at reduced draw
      // counts. These immutable attributes are never uploaded again per frame.
      const hash=n=>{const x=Math.sin(n*127.1+17.7)*43758.5453;return x-Math.floor(x);};
      for(let i=0;i<length;i++) {
        uv[i*2]=(Math.floor(hash(i*5+2)*SIDE)+.5)/SIDE;
        uv[i*2+1]=(reverseByte(i%SIDE)+.5)/SIDE;
        detail[i*3]=hash(i*7+3);detail[i*3+1]=hash(i*7+4);detail[i*3+2]=hash(i*7+5);
      }
      geometry.setAttribute('aDetail',new THREE.BufferAttribute(detail,3));
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(uv.length/2*3),3));
    geometry.setAttribute('aLookup',new THREE.BufferAttribute(uv,2));
    geometry.setDrawRange(0,uv.length/2);
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,-12),60);
    geometries.push(geometry);
    const material = new THREE.ShaderMaterial({
      uniforms, defines: { AE_KIND: kind }, vertexShader: renderVertex,
      fragmentShader: /* glsl */`
        uniform vec3 aPrimary,aSecondary,aPearl;
        uniform float aGlow,aIntensity,aLineCoverage;
        varying float aeColour,aeLight,aeFocus,aeSeed,aeCoverage;
        void main() {
          vec3 colour=mix(aPrimary,aSecondary,aeColour);
          float alpha;
          #if AE_KIND != 0
            vec2 q=gl_PointCoord*2.-1.;float r2=dot(q,q);
            if(r2>1.)discard;
            float core=exp(-r2*15.);
            float halo=exp(-r2*4.)*(1.-smoothstep(.55,1.,r2));
            alpha=(core*.60+halo*.20)*(1.-aeFocus*.42)*aeLight*aeCoverage;
            #if AE_KIND == 2
              alpha*=1.1;
            #elif AE_KIND == 3
              alpha*=1.35;
            #endif
            colour=mix(colour,aPearl,core*.12);
          #else
            alpha=(.022+aeLight*.075)*(1.-aeFocus*.32)*aLineCoverage;
            colour=mix(colour,aPearl,.025);
          #endif
          gl_FragColor=vec4(colour*(.80+aIntensity*.42)*aGlow,clamp(alpha,0.,.92));
        }
      `,
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false
    });
    materials.push(material);
    const object = isPoints ? new THREE.Points(geometry,material) : new THREE.LineSegments(geometry,material);
    object.frustumCulled=false;
    object.name=['Aether flowing silk filaments','Aether light motes','Aether suspended light field','Aether flow riders'][kind];
    group.add(object);return object;
  }
  const filaments=drawObject(0), motes=drawObject(1), field=drawObject(2), riders=drawObject(3);

  function update(frame={}) {
    if(disposed)return;
    const lab=frame.labLook, look=frame.look;
    settings={
      form:forms.includes(lab?.form)?lab.form:defaults.form,
      flow:value(lab,'flow',1,0,2),spread:value(lab,'spread',1,.6,1.5),
      turbulence:value(lab,'turbulence',.6,0,1.5),glow:value(lab,'glow',1,.2,1.8),
      depth:value(lab,'depth',.65,0,1),focus:value(lab,'focus',.45,0,1),journey:lab?.journey===true
    };
    const motion=frame.motion!==false, dt=clamp(frame.dt??1/60,0,.125);
    const staticKey=[settings.form,settings.spread,settings.turbulence,settings.depth].join('|');
    const staticEdit=lastStatic!==staticKey;lastStatic=staticKey;
    const formEdit=lastForm!==settings.form;lastForm=settings.form;
    const targetIndex=forms.indexOf(settings.form), blend=motion?1-Math.exp(-dt*2.2):(formEdit?1:0);
    weights.x+=(Number(targetIndex===0)-weights.x)*blend;
    weights.y+=(Number(targetIndex===1)-weights.y)*blend;
    weights.z+=(Number(targetIndex===2)-weights.z)*blend;
    uniforms.aSpread.value=settings.spread;uniforms.aTurbulence.value=settings.turbulence;
    uniforms.aDepth.value=settings.depth;uniforms.aFocus.value=settings.focus;uniforms.aFlow.value=settings.flow;
    uniforms.aGlow.value=settings.glow*value(look,'particleGlow',1,.2,2);
    uniforms.aIntensity.value=clamp(frame.intensity??.65);
    uniforms.aPulseGain.value=value(look,'pulseGain',1,0,2);
    quality=frame.quality==='low'?'low':'high';
    const density=value(look,'particles',1,0,1);
    const strands=Math.floor((quality==='low'?64:SIDE)*density);
    count=strands*SIDE;
    motes.geometry.setDrawRange(0,count);filaments.geometry.setDrawRange(0,strands*SEGMENTS*2);
    field.geometry.setDrawRange(0,Math.floor(FIELD_COUNT*(quality==='low'?.25:1)*density));
    riders.geometry.setDrawRange(0,Math.floor(RIDER_COUNT*(quality==='low'?.25:1)*density));
    if(renderer?.getDrawingBufferSize){renderer.getDrawingBufferSize(drawSize);uniforms.aHeight.value=Math.max(1,drawSize.y);}
    uniforms.aLineCoverage.value=clamp(uniforms.aHeight.value/620,.2,1);
    if(motion) {
      clock+=dt;
      // Host supplies analyser bands after mute/pause gating. Defensive active
      // gating here also settles any stale samples supplied by other callers.
      const active=frame.active===true, smoothing=1-Math.exp(-dt*(active?9:5));
      for(const [key,field] of [['aBass','bass'],['aMid','mid'],['aTreble','treble'],['aEnergy','energy']]) {
        const target=active?clamp(frame[field]??0):0;
        uniforms[key].value+=(target-uniforms[key].value)*smoothing;
      }
      for(let i=0;i<64;i++)spectrum[i]=active?clamp(frame.spectrum?.[i]??0):0;
      phase+=dt*settings.flow*(.34+uniforms.aEnergy.value*.68);
      uniforms.aClock.value=clock;uniforms.aPhase.value=phase;
      if(active&&frame.onset===true&&uniforms.aPulseGain.value>0) {
        events[eventIndex]=clock;powers[eventIndex]=clamp(frame.pulse??frame.energy??0,0,2);
        eventIndex=(eventIndex+1)%8;eventCount++;
      }
      frames++;pendingDt+=dt;
      if(!initialized || quality!=='low' || frames%3===0) {compute(pendingDt,!initialized);pendingDt=0;}
    } else if(!initialized||staticEdit) {compute(0,true);pendingDt=0;}
    // Ambient turning is separate from audio response. Retained phase means an
    // explicit static edit remains possible without restarting a frozen scene.
    group.rotation.y=Math.sin(phase*.07)*.025;
    group.rotation.z=Math.sin(phase*.06)*.018;
  }
  function setPalette(world={}) {
    if(disposed)return;
    uniforms.aPrimary.value.set(world.light??0xb56aff);
    uniforms.aSecondary.value.set(world.rim??0x58cced);
    uniforms.aPearl.value.set(world.tint??0xe9e5ff).lerp(new THREE.Color(0xf4f0ff),.8);
  }
  function diagnostics() {
    return {name:group.name,mode,fallbackReason:reason,count,strands:count/SIDE,lineSegments:filaments.geometry.drawRange.count/2,
      fieldCount:field.geometry.drawRange.count,riderCount:riders.geometry.drawRange.count,lineCoverage:uniforms.aLineCoverage.value,
      textureSize:mode==='gpu-half-float'?SIDE:0,computeCadence:quality==='low'?3:1,updates,phase,clock,events:eventCount,
      weights:weights.toArray(),settings:{...settings},signals:{bass:uniforms.aBass.value,mid:uniforms.aMid.value,treble:uniforms.aTreble.value,energy:uniforms.aEnergy.value},
      quality,initialized,disposed};
  }
  function dispose() {
    if(disposed)return;disposed=true;
    for(const target of targets)target.dispose();
    for(const geometry of geometries)geometry.dispose();
    for(const material of materials)material.dispose();
    emptyTexture.dispose();computeScene.clear();group.clear();
  }
  return {group,update,setPalette,diagnostics,dispose,
    view:{orbit:true,aspectFit:false,target:[0,2.75,-5],direction:[0,.04,1],distance:8,minDistance:4,maxDistance:18,fitRadius:0,fitWidth:0,bloom:.52}};
}
