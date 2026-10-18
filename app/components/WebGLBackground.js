'use client';
import { useRef, useEffect } from 'react';

export default function WebGLBackground() {
  const canvasRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    // Compiling the shader and drawing its first frame is a 0.5–1s main-thread task on a
    // mid-range phone. Starting it at idle still landed inside page load, so it waits for
    // the visitor's first interaction (the scene is scroll-driven anyway), then for an
    // idle moment so it never delays the input that triggered it. Until then the page
    // shows its plain background colour.
    const EVENTS = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'];
    let cleanup = null;
    let cancelled = false;
    let idleId = null;
    const start = () => { if (!cancelled) cleanup = init(); };
    const onFirstInteraction = () => {
      EVENTS.forEach((e) => window.removeEventListener(e, onFirstInteraction));
      idleId = 'requestIdleCallback' in window
        ? window.requestIdleCallback(start, { timeout: 500 })
        : window.setTimeout(start, 100);
    };
    EVENTS.forEach((e) => window.addEventListener(e, onFirstInteraction, { passive: true }));
    return () => {
      cancelled = true;
      EVENTS.forEach((e) => window.removeEventListener(e, onFirstInteraction));
      if (idleId !== null) {
        if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      }
      cleanup?.();
    };
  }, []);

  function init() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const gl = canvas.getContext('webgl', {
      alpha: false, antialias: false, depth: false,
      stencil: false, preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });

    if (!gl) { canvas.style.background = '#0a0a0f'; return; }

    const vs = `attribute vec2 a; void main(){gl_Position=vec4(a,0.,1.);}`;

    const fs = `precision highp float;
uniform vec2 uR;uniform float uT,uS,uSc,uBl;uniform vec3 uBg;
#define PI 3.14159265359
#define TAU 6.28318530718
#define MS 22
#define RS 5
float sat(float x){return clamp(x,0.,1.);}
float smoother(float x){x=sat(x);return x*x*x*(x*(x*6.-15.)+10.);}
vec3 sCol(vec3 c0,vec3 c1,vec3 c2,vec3 c3,vec3 c4){int si=int(uSc);vec3 a=c0;vec3 b=c1;if(si==1){a=c1;b=c2;}else if(si==2){a=c2;b=c3;}else if(si==3){a=c3;b=c4;}return mix(a,b,uBl);}
float sF(float c0,float c1,float c2,float c3,float c4){int si=int(uSc);float a=c0;float b=c1;if(si==1){a=c1;b=c2;}else if(si==2){a=c2;b=c3;}else if(si==3){a=c3;b=c4;}return mix(a,b,uBl);}
mat2 rot(float a){float c=cos(a);float s=sin(a);return mat2(c,-s,s,c);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);float a=hash(i);float b=hash(i+vec2(1.,0.));float c=hash(i+vec2(0.,1.));float d=hash(i+vec2(1.,1.));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float waveH(vec2 p,float t,float amp,float storm){float h=0.;vec2 s1=normalize(vec2(1.,.28));vec2 s2=normalize(vec2(-.48,.88));vec2 s3=normalize(vec2(.82,-.16));s2=rot(storm*.18)*s2;s3=rot(-storm*.14)*s3;float d1=dot(p,s1);float d2=dot(p,s2);float d3=dot(p,s3);h+=amp*.66*sin(d1*.42+t*.38);h+=amp*.22*sin(d1*.94-t*.62);h+=amp*.14*sin(d2*1.18-t*.82);h+=amp*.09*sin(d3*1.82+t*1.04);h+=amp*(.11+storm*.07)*sin(p.x*1.45-t*.76+p.y*.66);h+=amp*(.07+storm*.05)*sin(p.x*2.85+t*1.06-p.y*.52);h+=amp*(.04+storm*.03)*sin(p.x*4.6-t*1.5+p.y*1.02);float micro=noise(p*14.+vec2(t*.18,t*.06))-.5;h+=micro*amp*(.01+storm*.008);return h;}
vec3 waveNorm(vec2 p,float t,float amp,float storm){float e=.018;float hL=waveH(p-vec2(e,0.),t,amp,storm);float hR=waveH(p+vec2(e,0.),t,amp,storm);float hD=waveH(p-vec2(0.,e),t,amp,storm);float hU=waveH(p+vec2(0.,e),t,amp,storm);return normalize(vec3(-(hR-hL)/(2.*e),1.,-(hU-hD)/(2.*e)));}
float starField(vec2 uv){vec2 gv=floor(uv);vec2 lv=fract(uv)-.5;float h=hash(gv);float size=mix(.012,.0025,h);float d=length(lv+vec2(hash(gv+3.1)-.5,hash(gv+7.3)-.5)*.25);float star=smoothstep(size,0.,d);star*=smoothstep(.82,1.,h);return star;}
void main(){vec2 uv=(gl_FragCoord.xy-uR*.5)/uR.y;float s=smoother(uS);float camY=mix(1.14,1.03,s);camY+=sin(s*PI*1.4)*.028;float camZ=mix(.08,-.18,s);float pitch=mix(.115,.088,s);vec3 ro=vec3(0.,camY,camZ);vec3 rd=normalize(vec3(uv.x,uv.y-pitch,-1.4));float storm=smoothstep(.8,1.,s);float night=smoothstep(.56,.84,s);
vec3 skyTop=sCol(vec3(.18,.06,.24),vec3(.05,.24,.68),vec3(.26,.06,.04),vec3(.01,.01,.05),vec3(.04,.05,.09));
vec3 skyHori=sCol(vec3(.92,.48,.18),vec3(.42,.62,.9),vec3(.88,.32,.04),vec3(.03,.05,.14),vec3(.15,.17,.23));
vec3 sunCol=sCol(vec3(1.,.62,.22),vec3(1.,.96,.8),vec3(1.,.38,.05),vec3(.7,.75,.94),vec3(.26,.28,.34));
vec3 seaDeep=sCol(vec3(.08,.05,.12),vec3(.03,.14,.34),vec3(.1,.06,.04),vec3(0.,.01,.03),vec3(.03,.04,.07));
vec3 seaShlo=sCol(vec3(.28,.17,.24),vec3(.09,.38,.6),vec3(.24,.13,.06),vec3(.04,.06,.16),vec3(.07,.1,.14));
vec3 fogCol=sCol(vec3(.8,.5,.3),vec3(.58,.72,.9),vec3(.7,.28,.05),vec3(.02,.03,.08),vec3(.12,.14,.18));
float sunProgress=clamp(s/.58,0.,1.);float sunAngle=sunProgress*PI;float sunArcX=cos(sunAngle)*-.75;float sunArcY=sin(sunAngle)*.38-.08;vec3 sunDir=normalize(vec3(sunArcX,sunArcY,-1.));vec3 moonDir=normalize(vec3(-.14,.42,-1.));
float waveAmp=sF(.082,.07,.1,.054,.3);waveAmp+=storm*.02;float fogDen=sF(.02,.01,.022,.034,.046);float moonAmt=sF(0.,0.,.05,.92,.06);float sunAbove=step(0.,sunDir.y);float sunGlow=smoothstep(-.1,.06,sunDir.y);
vec3 col;
if(rd.y<0.){float tFlat=ro.y/(-rd.y);float stepSize=tFlat/float(MS);float t=stepSize;for(int i=0;i<MS;i++){vec2 wpTest=ro.xz+rd.xz*t;float wy=ro.y+rd.y*t;if(wy<waveH(wpTest,uT,waveAmp,storm))break;t+=stepSize;}float ta=t-stepSize;float tb=t;for(int i=0;i<RS;i++){float tm=(ta+tb)*.5;vec2 wpm=ro.xz+rd.xz*tm;if(ro.y+rd.y*tm<waveH(wpm,uT,waveAmp,storm))tb=tm;else ta=tm;}t=(ta+tb)*.5;
vec2 wp=ro.xz+rd.xz*t;vec3 n=waveNorm(wp,uT,waveAmp,storm);vec3 vDir=-rd;float fres=pow(1.-clamp(dot(n,vDir),0.,1.),4.);vec3 refl=reflect(rd,n);float rh=clamp(refl.y,0.,1.);vec3 reflSky=mix(skyHori,skyTop,pow(rh,.42));reflSky=mix(reflSky,skyHori,.12);float rSun=max(dot(refl,sunDir),0.);reflSky+=sunCol*pow(rSun,120.)*2.*sunGlow;reflSky+=sunCol*pow(rSun,18.)*.07*sunGlow;
if(moonAmt>.04){float rMoon=max(dot(refl,moonDir),0.);reflSky+=vec3(.72,.8,.95)*pow(rMoon,120.)*.78*moonAmt;}
float depth=exp(-t*.4);vec3 waterC=mix(seaDeep,seaShlo,depth*.5);vec3 absorb=vec3(.85,.92,1.);waterC*=mix(vec3(1.),absorb,clamp(t*.25,0.,1.));col=mix(waterC,reflSky,.15+fres*.34);
float spec=pow(max(dot(reflect(-sunDir,n),vDir),0.),200.);col+=sunCol*spec*1.1*sunAbove;float broadSpec=pow(max(dot(reflect(-sunDir,n),vDir),0.),32.);col+=sunCol*broadSpec*.12*sunGlow;float sunLine=pow(max(dot(reflect(rd,n),sunDir),0.),8.);col+=sunCol*sunLine*.48*smoothstep(0.,.35,-rd.y)*sunGlow;
float sparkle=noise(wp*18.+vec2(uT*.55,uT*.22));sparkle=smoothstep(.94,1.,sparkle);col+=sunCol*sparkle*.08*sunGlow*sunAbove;
if(moonAmt>.04){float mSpec=pow(max(dot(reflect(-moonDir,n),vDir),0.),520.);col+=vec3(.72,.8,.95)*mSpec*.09*moonAmt;}
float hC=waveH(wp,uT,waveAmp,storm);float hL=waveH(wp-vec2(.025,0.),uT,waveAmp,storm);float hR=waveH(wp+vec2(.025,0.),uT,waveAmp,storm);float hD=waveH(wp-vec2(0.,.025),uT,waveAmp,storm);float hU=waveH(wp+vec2(0.,.025),uT,waveAmp,storm);float curvature=hR+hL+hU+hD-4.*hC;float foam=clamp(curvature*(24.+storm*10.),0.,1.);col+=foam*vec3(1.)*(.03+storm*.1);
float fog=1.-exp(-t*fogDen*1.65);col=mix(col,fogCol,fog);}else{float h=clamp(rd.y,0.,1.);col=mix(skyHori,skyTop,pow(h,.38));}
float horizonW=.008;float skyMix=smoothstep(-horizonW,horizonW,rd.y);vec3 skyCol;{float h=clamp(rd.y,0.,1.);skyCol=mix(skyHori,skyTop,pow(h,.38));float cloudBand=noise(rd.x*5.5+vec2(rd.y*3.,uT*.015));float cloudBand2=noise(rd.x*8.-vec2(rd.y*4.,uT*.01));float clouds=smoothstep(.62,.86,cloudBand*.65+cloudBand2*.35);clouds*=smoothstep(-.02,.24,rd.y);clouds*=.08+storm*.18;vec3 cloudCol=mix(vec3(1.,.82,.65),vec3(.42,.48,.56),storm);skyCol=mix(skyCol,mix(skyCol*.97,cloudCol,.35),clouds);
float sd=max(dot(rd,sunDir),0.);skyCol+=sunCol*pow(sd,380.)*6.8*sunGlow;skyCol+=sunCol*pow(sd,22.)*.2*sunGlow;skyCol+=sunCol*pow(sd,5.)*.09*sunGlow;float sunDisk=smoothstep(.99925,.99995,dot(rd,sunDir));skyCol+=sunCol*sunDisk*2.6*sunGlow;float horizonBand=exp(-abs(rd.y)*24.);skyCol+=sunCol*horizonBand*.11*sunGlow;float viewSun=max(dot(rd,sunDir),0.);skyCol+=sunCol*pow(viewSun,3.)*.035*sunGlow;
if(moonAmt>.04){float md=max(dot(rd,moonDir),0.);skyCol+=vec3(.88,.92,1.)*pow(md,820.)*7.4*moonAmt;skyCol+=vec3(.88,.92,1.)*pow(md,6.)*.045*moonAmt;}
if(night>.02){vec2 starUv=rd.xy/max(.12,rd.z+1.6);starUv*=140.;float stars=starField(starUv)+starField(starUv*.55+11.7)*.65;stars*=smoothstep(.02,.26,rd.y);stars*=(1.-storm*.85);skyCol+=vec3(.8,.88,1.)*stars*night*.82;}
float horizonMist=exp(-abs(rd.y)*mix(38.,22.,storm));skyCol+=fogCol*horizonMist*(.09+storm*.1);skyCol=mix(skyCol,skyCol*vec3(.91,.94,.98),storm*.22);}
col=mix(col,skyCol,skyMix);float hEdge=smoothstep(-.008,.018,rd.y);col=mix(fogCol,col,hEdge*.25+.75);float grain=hash(gl_FragCoord.xy*.5+floor(uT*12.))-0.5;col+=grain*.006;gl_FragColor=vec4(clamp(col,0.,1.),1.);}`;

    /* ── compile helpers ── */
    const mkShader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vert = mkShader(gl.VERTEX_SHADER, vs);
    const frag = mkShader(gl.FRAGMENT_SHADER, fs);
    if (!vert || !frag) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.disable(gl.DITHER);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(prog, 'uR');
    const uTi = gl.getUniformLocation(prog, 'uT');
    const uScroll = gl.getUniformLocation(prog, 'uS');
    const uScene = gl.getUniformLocation(prog, 'uSc');
    const uBlend = gl.getUniformLocation(prog, 'uBl');
    const uBgU = gl.getUniformLocation(prog, 'uBg');

    /* ── theme ── */
    const hexToVec3 = (hex) => {
      const n = parseInt(hex.replace('#', ''), 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    };
    const updateBg = (theme) => {
      const [r, g, b] = hexToVec3(theme === 'light' ? '#eef4ff' : '#0a0a0f');
      gl.uniform3f(uBgU, r, g, b);
    };

    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      updateBg(theme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    updateBg(document.documentElement.getAttribute('data-theme') || 'dark');

    /* ── scene names for HUD ── */
    const NAMES = ['DAWN', 'MIDDAY', 'DUSK', 'NIGHT', 'STORM'];
    const N = NAMES.length;

    /* ── scroll tracking ── */
    let maxScroll = 1;
    let tgt = 0;
    let smooth = 0;

    let qualityScale = 1.0;
    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const MAX_DPR = isMobile ? 1.0 : 1.5;
    const MIN_QUALITY = isMobile ? 0.5 : 0.82;
    const MAX_QUALITY = isMobile ? 0.75 : 1.0;
    if (isMobile) qualityScale = 0.6;

    let lastViewportW = 0;
    let lastViewportH = 0;

    const updateScrollMetrics = () => {
      const vh = lastViewportH || window.innerHeight;
      maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
      tgt = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    };

    const resize = () => {
      const vp = window.visualViewport ?? { width: window.innerWidth, height: window.innerHeight };
      const cssW = Math.round(vp.width);
      const cssH = Math.round(vp.height);
      if (!cssW || !cssH) return;
      lastViewportW = cssW;
      lastViewportH = cssH;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const renderScale = dpr * qualityScale;
      const pixelW = Math.max(1, Math.round(cssW * renderScale));
      const pixelH = Math.max(1, Math.round(cssH * renderScale));

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
        gl.viewport(0, 0, pixelW, pixelH);
        gl.uniform2f(uR, pixelW, pixelH);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      updateScrollMetrics();
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', updateScrollMetrics, { passive: true });
    window.addEventListener('load', updateScrollMetrics, { passive: true });



    /* ── HUD update ── */
    const progFill = document.getElementById('prog_fill');
    const hudPct = document.getElementById('hud_pct');
    const sceneName = document.getElementById('scene_name');
    const dots = document.querySelectorAll('.scene-dot');
    let lastHUDPct = -1;
    let lastHUDScene = -1;

    const updateHUD = (s) => {
      const p = Math.round(s * 100);
      const si = Math.min(N - 1, Math.floor(s * N));
      if (p !== lastHUDPct) {
        lastHUDPct = p;
        if (hudPct) hudPct.textContent = String(p).padStart(3, '0') + '%';
        if (progFill) progFill.style.width = `${p}%`;
      }
      if (si !== lastHUDScene) {
        lastHUDScene = si;
        if (sceneName) sceneName.textContent = NAMES[si];
        dots.forEach((d, i) => d.classList.toggle('active', i === si));
      }
    };

    /* ── performance adapt ── */
    const t0 = performance.now();
    let lastNow = t0;
    let fpsAccum = 0;
    let fpsFrames = 0;
    let lowFpsTime = 0;
    let highFpsTime = 0;

    const maybeAdjustQuality = (dt) => {
      fpsAccum += dt;
      fpsFrames++;
      if (fpsAccum < 0.75) return;
      const avgDt = fpsAccum / fpsFrames;
      const fps = 1 / avgDt;
      fpsAccum = 0;
      fpsFrames = 0;
      if (fps < 50) { lowFpsTime += 0.75; highFpsTime = 0; }
      else if (fps > 57) { highFpsTime += 0.75; lowFpsTime = 0; }
      else { lowFpsTime = 0; highFpsTime = 0; }
      if (lowFpsTime >= 1.5 && qualityScale > MIN_QUALITY) {
        qualityScale = Math.max(MIN_QUALITY, +(qualityScale - 0.06).toFixed(2));
        lowFpsTime = 0;
        resize();
      }
      if (highFpsTime >= 3.0 && qualityScale < MAX_QUALITY) {
        qualityScale = Math.min(MAX_QUALITY, +(qualityScale + 0.04).toFixed(2));
        highFpsTime = 0;
        resize();
      }
    };

    /* ── render loop ── */
    let frameCount = 0;
    const frame = (now) => {
      rafId.current = requestAnimationFrame(frame);
      frameCount++;

      /* On mobile, skip every other frame to reduce GPU load */
      if (isMobile && qualityScale < 0.65 && (frameCount % 2 !== 0)) return;

      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;
      maybeAdjustQuality(dt);

      smooth += (tgt - smooth) * (1 - Math.exp(-dt * 8));
      const raw = smooth * (N - 1);
      const si = Math.min(Math.floor(raw), N - 2);
      const bl = raw - si;

      updateHUD(smooth);
      gl.uniform1f(uTi, (now - t0) / 1000);
      gl.uniform1f(uScroll, smooth);
      gl.uniform1f(uScene, si);
      gl.uniform1f(uBlend, bl);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    if (reducedMotion) {
      // One still frame at the top-of-page scene; no animation loop.
      gl.uniform1f(uTi, 0);
      gl.uniform1f(uScroll, 0);
      gl.uniform1f(uScene, 0);
      gl.uniform1f(uBlend, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else {
      rafId.current = requestAnimationFrame(frame);
    }

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener('resize', resize);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', resize);
      window.removeEventListener('scroll', updateScrollMetrics);
      window.removeEventListener('load', updateScrollMetrics);
      observer.disconnect();
    };
  }

  return (
    <>
      <canvas ref={canvasRef} id="webgl_canvas" style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
      }} />

    </>
  );
}
