"use client";

import { useEffect, useRef } from "react"
import * as THREE from "three"

// ── Config ────────────────────────────────────────────────────────────────────
const TEX = 256;        // 256×256 = 65 536 particles on GPU
const PC  = TEX * TEX;

const PATTERNS: [number, number][] = [
  [2, 3], [3, 5], [4, 6], [2, 5], [5, 7], [3, 7],
];

// ── GLSL: simulation ──────────────────────────────────────────────────────────
const SIM_VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const SIM_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D tState;
uniform sampler2D tTarget;
uniform float uPhase;     // 0=ambient  1=chladni  2=forming
uniform float uM;
uniform float uN;
uniform float uTime;
uniform vec2  uRes;
uniform vec2  uImpulse;   // periodic tap from behind the screen

#define PI 3.14159265359

float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float n1(float t)   { return sin(t*0.0937)*cos(t*0.0719+1.31)+sin(t*0.0383)*0.38; }

void main() {
  vec4  st  = texture2D(tState, vUv);
  vec2  pos = st.xy;
  vec2  vel = st.zw;
  float sd  = vUv.x * 97.3 + vUv.y * 43.1;

  float ambB = clamp(1.0 - uPhase, 0.0, 1.0);
  float chlB = uPhase < 1.0 ? uPhase : clamp(2.0 - uPhase, 0.0, 1.0);
  float frmB = clamp(uPhase - 1.0, 0.0, 1.0);

  // ── Ambient drift ─────────────────────────────────────────────────────────
  vec2 aVel = vel * 0.994 + vec2(
    n1(sd * 100.0 + uTime * 0.055) * 0.012,
    n1(sd *  79.4 + uTime * 0.044) * 0.008 - 0.0009
  );
  if (ambB > 0.05) {
    if      (pos.x < -12.0)          pos.x += uRes.x + 24.0;
    else if (pos.x > uRes.x + 12.0)  pos.x -= uRes.x + 24.0;
    if      (pos.y < -12.0)          pos.y += uRes.y + 24.0;
    else if (pos.y > uRes.y + 12.0)  pos.y -= uRes.y + 24.0;
  }

  // ── Chladni: sand vibration physics ──────────────────────────────────────
  float nx = pos.x / uRes.x;
  float ny = pos.y / uRes.y;
  float f  = cos(uM*PI*nx)*cos(uN*PI*ny) - cos(uN*PI*nx)*cos(uM*PI*ny);
  float gx = (-uM*PI*sin(uM*PI*nx)*cos(uN*PI*ny) + uN*PI*sin(uN*PI*nx)*cos(uM*PI*ny)) / uRes.x;
  float gy = (-uN*PI*cos(uM*PI*nx)*sin(uN*PI*ny) + uM*PI*cos(uN*PI*nx)*sin(uM*PI*ny)) / uRes.y;
  float gLen = length(vec2(gx, gy)) + 1e-5;
  vec2  gDir = vec2(gx, gy) / gLen;
  vec2  tang = vec2(-gDir.y, gDir.x);

  // Grains at antinodes get random kicks; at nodes they slow and settle
  float vib     = pow(clamp(abs(f), 0.0, 1.0), 0.45);
  float kickAng = n1(sd * 1337.7 + uTime * 3.1) * PI;
  vec2  kick    = vec2(cos(kickAng), sin(kickAng)) * vib * 4.5;
  float pull    = pow(clamp(abs(f), 0.0, 1.0), 0.70) * 2.8;
  float settled = 1.0 - clamp(abs(f) * 3.5, 0.0, 1.0);
  float lat     = n1(sd * 23.7 + uTime * 0.55) * 2.2 * settled;
  float damp    = mix(0.93, 0.80, vib);
  vec2  cVel    = vel * damp + kick - gDir * sign(f) * pull + tang * lat;

  // ── Forming: spring to target + per-particle micro-jitter ────────────────
  vec4 tgt = texture2D(tTarget, vUv);

  // Each grain has its own persistent micro-vibration (subtle, feels alive)
  float microAmp = 0.55 + hash(sd + 17.3) * 0.45;
  float microX   = n1(sd * 53.1 + uTime * 1.10) * microAmp;
  float microY   = n1(sd * 71.9 + uTime * 0.93) * microAmp;

  // Impact tap: shared impulse with per-grain directional spread
  float tapSpread = (hash(sd + 99.1) - 0.5) * 0.6;
  float tapAng    = atan(uImpulse.y, uImpulse.x) + tapSpread;
  vec2  tap       = vec2(cos(tapAng), sin(tapAng)) * length(uImpulse) * (0.5 + hash(sd + 33.7) * 1.0);

  vec2  fVel = vel * 0.85
    + ((tgt.xy + vec2(microX, microY)) - pos) * 0.024
    + tap * frmB;

  vel = aVel * ambB + cVel * chlB + fVel * frmB;
  pos += vel;
  gl_FragColor = vec4(pos, vel);
}
`;

// ── GLSL: particle render ─────────────────────────────────────────────────────
const PTS_VERT = /* glsl */`
attribute vec2 aUv;
attribute vec3 aColorBase;
uniform sampler2D tState;
uniform vec2  uRes;
uniform float uPhase;
uniform float uTime;
uniform float uDpr;

varying vec4  vColor;
varying float vAlive;

float h(float n) { return fract(sin(n * 127.1) * 43758.5453); }

void main() {
  float seed = aUv.x * 97.3 + aUv.y * 43.1;
  vec4  st   = texture2D(tState, aUv);
  vec2  pos  = st.xy;
  vAlive = 1.0;

  gl_Position = vec4(
    (pos.x / uRes.x) * 2.0 - 1.0,
    1.0 - (pos.y / uRes.y) * 2.0,
    0.0, 1.0
  );

  float ambB = clamp(1.0 - uPhase, 0.0, 1.0);
  float chlB = uPhase < 1.0 ? uPhase : clamp(2.0 - uPhase, 0.0, 1.0);
  float frmB = clamp(uPhase - 1.0, 0.0, 1.0);

  float ph    = uTime * 0.38 + h(seed) * 6.28;
  float pulse = 0.72 + 0.28 * sin(ph * 1.3 + h(seed + 3.1) * 3.14);

  // Size: large ambient → visible sand grains → polished icon spheres
  float sz = ambB * 7.0 + chlB * 4.0 + frmB * 3.2;
  gl_PointSize = max(1.2, sz * pulse * uDpr);

  // Ambient: muted steel blue-grey
  vec3 ambCol = aColorBase;

  // Chladni: warm gold sand with ~25 % cyan accent grains
  vec3 chlCol = mix(
    vec3(0.92, 0.78, 0.48),
    vec3(0.30, 0.85, 0.88),
    step(0.75, h(seed + 11.1))
  );
  chlCol *= 0.72 + 0.45 * (sin(uTime * 1.3 + seed * 9.7) * 0.5 + 0.5);

  // Forming: same warm gold (sand grains forming the shape), slight shimmer
  vec3 frmCol = mix(
    vec3(0.90, 0.76, 0.46),
    vec3(0.96, 0.88, 0.58),
    h(seed + 5.5)
  );
  frmCol *= 0.78 + 0.38 * sin(uTime * 0.9 + seed * 7.3);

  // Edge fade
  float ex = min(pos.x / uRes.x, 1.0 - pos.x / uRes.x) * 2.0;
  float ey = min(pos.y / uRes.y, 1.0 - pos.y / uRes.y) * 2.0;
  float ef = clamp(min(ex, ey) * 5.0, 0.0, 1.0);

  vec3  col   = ambCol * ambB + chlCol * chlB + frmCol * frmB;
  float alpha = (ambB * 0.38 + chlB * 0.85 + frmB * (0.65 + 0.35 * sin(ph * 1.7))) * ef;
  vColor = vec4(col, alpha);
}
`;

const PTS_FRAG = /* glsl */`
precision highp float;
varying vec4  vColor;
varying float vAlive;

void main() {
  if (vAlive < 0.5) discard;
  vec2  uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  if (r2 > 1.0) discard;
  float z  = sqrt(max(0.0, 1.0 - r2));
  vec3  N  = normalize(vec3(uv, z));
  vec3  V  = vec3(0.0, 0.0, 1.0);
  vec3  L1 = normalize(vec3(-0.48, 0.72, 0.88));
  float diff  = max(0.0, dot(N, L1));
  vec3  R1    = reflect(-L1, N);
  float RV    = max(0.0, dot(R1, V));
  float spec1 = pow(RV, 90.0) * 1.8;
  float spec2 = pow(RV, 500.0) * 3.2;
  float fres  = pow(1.0 - z, 3.5) * 0.65;
  // Warm highlight tint (golden sand catching light)
  vec3 hilit = mix(vec3(1.0, 0.92, 0.70), vec3(1.0), 0.5) * (spec1 + spec2);
  vec3 res   = vColor.rgb * (0.06 + diff * 0.60) + hilit - vColor.rgb * fres;
  gl_FragColor = vec4(max(vec3(0.0), res), vColor.a);
}
`;

// ── Chladni nodal-line target (CPU, synchronous) ──────────────────────────────
// Samples points near |f|<threshold to build a spring target texture
function computeChladniTargetTex(
  M: number, N: number,
  canvasW: number, canvasH: number,
): THREE.DataTexture {
  const THRESHOLD = 0.07;
  const SX = 500; const SY = 300;
  const cands: [number, number][] = [];
  for (let yi = 0; yi < SY; yi++) {
    for (let xi = 0; xi < SX; xi++) {
      const nx = xi / (SX - 1);
      const ny = yi / (SY - 1);
      const f = Math.cos(M * Math.PI * nx) * Math.cos(N * Math.PI * ny)
              - Math.cos(N * Math.PI * nx) * Math.cos(M * Math.PI * ny);
      if (Math.abs(f) < THRESHOLD) {
        cands.push([nx * canvasW, ny * canvasH]);
      }
    }
  }
  const buf = new Float32Array(PC * 4);
  const fallback: [number, number] = [canvasW / 2, canvasH / 2];
  for (let i = 0; i < PC; i++) {
    const c = cands.length ? cands[(Math.random() * cands.length) | 0] : fallback;
    buf[i * 4 + 0] = c[0] + (Math.random() - 0.5);
    buf[i * 4 + 1] = c[1] + (Math.random() - 0.5);
  }
  const tex = new THREE.DataTexture(buf, TEX, TEX, THREE.RGBAFormat, THREE.FloatType);
  tex.needsUpdate = true;
  return tex;
}

// ── Target texture builder ────────────────────────────────────────────────────

// mode "bright": sample bright pixels on dark bg  (forma1/2/3 — sand on black)
// mode "dark":   sample dark pixels on light bg   (prueba_icono — black on white)
async function loadTargetTex(
  src: string,
  canvasW: number,
  canvasH: number,
  mode: "bright" | "dark" = "dark",
): Promise<THREE.DataTexture> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      // Scale to fill most of the canvas while keeping aspect ratio
      const aspect = img.naturalWidth / img.naturalHeight;
      let dw = canvasW * 0.94;
      let dh = dw / aspect;
      if (dh > canvasH * 0.94) { dh = canvasH * 0.94; dw = dh * aspect; }
      const offX = (canvasW - dw) / 2;
      const offY = (canvasH - dh) / 2;

      const cvs = document.createElement("canvas");
      cvs.width  = canvasW;
      cvs.height = canvasH;
      const ctx  = cvs.getContext("2d")!;
      ctx.fillStyle = mode === "dark" ? "#ffffff" : "#000000";
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.drawImage(img, offX, offY, dw, dh);

      const d = ctx.getImageData(0, 0, canvasW, canvasH).data;
      const cands: [number, number][] = [];

      for (let y = 0; y < canvasH; y++) {
        for (let x = 0; x < canvasW; x++) {
          const i  = (y * canvasW + x) * 4;
          const br = (d[i] + d[i+1] + d[i+2]) / 3;
          const pick = mode === "dark" ? br < 190 : br > 55;
          if (pick) {
            const wt = mode === "dark"
              ? (br < 60 ? 5 : br < 120 ? 3 : 1)
              : (br > 200 ? 5 : br > 120 ? 3 : 1);
            for (let k = 0; k < wt; k++) {
              cands.push([x + Math.random() - 0.5, y + Math.random() - 0.5]);
            }
          }
        }
      }

      const buf = new Float32Array(PC * 4);
      const fallback: [number, number] = [canvasW / 2, canvasH / 2];
      for (let i = 0; i < PC; i++) {
        const c = cands.length ? cands[(Math.random() * cands.length) | 0] : fallback;
        buf[i*4+0] = c[0];
        buf[i*4+1] = c[1];
      }

      const tex = new THREE.DataTexture(buf, TEX, TEX, THREE.RGBAFormat, THREE.FloatType);
      tex.needsUpdate = true;
      resolve(tex);
    };

    img.onerror = () => {
      const buf = new Float32Array(PC * 4);
      for (let i = 0; i < PC; i++) { buf[i*4] = canvasW/2; buf[i*4+1] = canvasH/2; }
      const tex = new THREE.DataTexture(buf, TEX, TEX, THREE.RGBAFormat, THREE.FloatType);
      tex.needsUpdate = true;
      resolve(tex);
    };

    img.src = src;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChladniHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);

  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null);
  const rtReadRef    = useRef<THREE.WebGLRenderTarget | null>(null);
  const rtWriteRef   = useRef<THREE.WebGLRenderTarget | null>(null);
  const simMatRef    = useRef<THREE.ShaderMaterial | null>(null);
  const ptsMatRef    = useRef<THREE.ShaderMaterial | null>(null);
  const simSceneRef  = useRef<THREE.Scene | null>(null);
  const simCamRef    = useRef<THREE.OrthographicCamera | null>(null);
  const mainSceneRef = useRef<THREE.Scene | null>(null);
  const mainCamRef   = useRef<THREE.OrthographicCamera | null>(null);

  const texIconRef        = useRef<THREE.DataTexture | null>(null);
  const texIconShiftedRef = useRef<THREE.DataTexture | null>(null);

  // Phase state
  const phaseRef    = useRef(0);
  const tgtPhaseRef = useRef(0);

  // Impact tap state
  const impFramesRef = useRef(0);
  const impNextTRef  = useRef(999); // absolute time (seconds) of next tap

  const animRef = useRef<FrameRequestCallback>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w   = container.clientWidth;
    const h   = container.clientHeight;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // ── FBO render targets ────────────────────────────────────────────────
    const rtOpts = {
      type:          THREE.FloatType  as THREE.TextureDataType,
      format:        THREE.RGBAFormat as THREE.PixelFormat,
      minFilter:     THREE.NearestFilter as THREE.MinificationTextureFilter,
      magFilter:     THREE.NearestFilter as THREE.MagnificationTextureFilter,
      depthBuffer:   false,
      stencilBuffer: false,
    };
    const rtA = new THREE.WebGLRenderTarget(TEX, TEX, rtOpts);
    const rtB = rtA.clone();

    // ── Initial particle state ─────────────────────────────────────────────
    const initData = new Float32Array(PC * 4);
    for (let i = 0; i < PC; i++) {
      initData[i*4+0] = Math.random() * w;
      initData[i*4+1] = Math.random() * h;
      initData[i*4+2] = (Math.random() - 0.5) * 0.5;
      initData[i*4+3] = (Math.random() - 0.5) * 0.5 - 0.05;
    }
    const initTex = new THREE.DataTexture(initData, TEX, TEX, THREE.RGBAFormat, THREE.FloatType);
    initTex.needsUpdate = true;

    // ── Placeholder target ─────────────────────────────────────────────────
    const dummyBuf = new Float32Array(PC * 4);
    for (let i = 0; i < PC; i++) { dummyBuf[i*4] = w/2; dummyBuf[i*4+1] = h/2; }
    const dummyTex = new THREE.DataTexture(dummyBuf, TEX, TEX, THREE.RGBAFormat, THREE.FloatType);
    dummyTex.needsUpdate = true;

    // ── Per-particle static attributes ─────────────────────────────────────
    const uvs     = new Float32Array(PC * 2);
    const colBase = new Float32Array(PC * 3);
    for (let i = 0; i < PC; i++) {
      uvs[i*2+0] = ((i % TEX) + 0.5) / TEX;
      uvs[i*2+1] = (Math.floor(i / TEX) + 0.5) / TEX;
      const t = (Math.random() - 0.5) * 0.07;
      colBase[i*3+0] = 0.18 + Math.random() * 0.15 + t;
      colBase[i*3+1] = 0.21 + Math.random() * 0.12;
      colBase[i*3+2] = 0.30 + Math.random() * 0.20 - t;
    }

    // ── Geometry ──────────────────────────────────────────────────────────
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position",   new THREE.BufferAttribute(new Float32Array(PC * 3), 3));
    geo.setAttribute("aUv",        new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute("aColorBase", new THREE.BufferAttribute(colBase, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);

    // ── Simulation material ───────────────────────────────────────────────
    const simMat = new THREE.ShaderMaterial({
      vertexShader:   SIM_VERT,
      fragmentShader: SIM_FRAG,
      uniforms: {
        tState:   { value: initTex },
        tTarget:  { value: dummyTex },
        uPhase:   { value: 0.0 },
        uM:       { value: PATTERNS[0][0] },
        uN:       { value: PATTERNS[0][1] },
        uTime:    { value: 0.0 },
        uRes:     { value: new THREE.Vector2(w, h) },
        uImpulse: { value: new THREE.Vector2(0, 0) },
      },
    });
    simMatRef.current = simMat;

    // ── Points material ───────────────────────────────────────────────────
    const ptsMat = new THREE.ShaderMaterial({
      vertexShader:   PTS_VERT,
      fragmentShader: PTS_FRAG,
      transparent:    true,
      depthWrite:     false,
      depthTest:      false,
      blending:       THREE.AdditiveBlending,
      uniforms: {
        tState:  { value: initTex },
        uRes:    { value: new THREE.Vector2(w, h) },
        uPhase:  { value: 0.0 },
        uTime:   { value: 0.0 },
        uDpr:    { value: dpr },
      },
    });
    ptsMatRef.current = ptsMat;

    // ── Scenes ────────────────────────────────────────────────────────────
    const simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    simCamRef.current = simCam;
    const simScene = new THREE.Scene();
    simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat));
    simSceneRef.current = simScene;

    const mainCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    mainCamRef.current = mainCam;
    const mainScene = new THREE.Scene();
    const pts = new THREE.Points(geo, ptsMat);
    pts.frustumCulled = false;
    mainScene.add(pts);
    mainSceneRef.current = mainScene;

    // ── Seed both FBO targets ─────────────────────────────────────────────
    const copySim = new THREE.Scene();
    const copyMat = new THREE.ShaderMaterial({
      vertexShader:   SIM_VERT,
      fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D tD; void main(){gl_FragColor=texture2D(tD,vUv);}`,
      uniforms: { tD: { value: initTex } },
    });
    copySim.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), copyMat));
    const copyCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    renderer.setRenderTarget(rtA); renderer.render(copySim, copyCam);
    renderer.setRenderTarget(rtB); renderer.render(copySim, copyCam);
    renderer.setRenderTarget(null);
    copyMat.dispose();
    initTex.dispose();
    rtReadRef.current  = rtB;
    rtWriteRef.current = rtA;

    // ── Helpers ────────────────────────────────────────────────────────────
    const setTarget = (tex: THREE.DataTexture) => {
      if (simMatRef.current) simMatRef.current.uniforms.tTarget.value = tex;
    };
    const setPat = (idx: number) => {
      if (!simMatRef.current) return;
      simMatRef.current.uniforms.uM.value = PATTERNS[idx][0];
      simMatRef.current.uniforms.uN.value = PATTERNS[idx][1];
    };

    // ── Pre-compute Chladni nodal targets (sync, ~3ms total) ──────────────
    const chlTex1 = computeChladniTargetTex(PATTERNS[1][0], PATTERNS[1][1], w, h);
    const chlTex2 = computeChladniTargetTex(PATTERNS[2][0], PATTERNS[2][1], w, h);

    // ── Load icon target async ─────────────────────────────────────────────
    loadTargetTex("/logoValinor-removebg.png", w, h, "dark").then((ti) => {
      texIconRef.current = ti;
      // Shifted target: move icon center to x=0 so only the right half is
      // visible at the left edge of the canvas (wind-drift final position)
      const src     = ti.image.data as Float32Array;
      const shifted = new Float32Array(PC * 4);
      // const dx      = -w / 2;
      const dx      = -w / 2.10;
      for (let i = 0; i < PC; i++) {
        shifted[i * 4 + 0] = src[i * 4 + 0] + dx;
        shifted[i * 4 + 1] = src[i * 4 + 1];
      }
      const shiftedTex = new THREE.DataTexture(shifted, TEX, TEX, THREE.RGBAFormat, THREE.FloatType);
      shiftedTex.needsUpdate = true;
      texIconShiftedRef.current = shiftedTex;
      dummyTex.dispose();
    });

    // ── Phase sequencer ────────────────────────────────────────────────────
    //
    // t= 0.3s  Live Chladni [2,3] — particles form from random scatter
    // t= 1.7s  Spring → [3,5] nodal positions (smooth, no blank)
    // t= 2.4s  Live Chladni [3,5] — already on nodal lines, vibrates instantly
    // t= 3.5s  Spring → [4,6] nodal positions
    // t= 4.2s  Live Chladni [4,6]
    // t= 5.0s  Spring → icon
    //
    const timers = [
      // t=0.3s: first Chladni pattern activates
      setTimeout(() => { tgtPhaseRef.current = 1.0; }, 300),

      // t=1.7s: spring toward P2 — disturbance kick so sand "lifts" as it reorganises
      setTimeout(() => {
        setTarget(chlTex1); tgtPhaseRef.current = 2.0;
        if (simMatRef.current) {
          const a = Math.random() * Math.PI * 2;
          simMatRef.current.uniforms.uImpulse.value.set(Math.cos(a) * 3.2, Math.sin(a) * 2.0);
          impFramesRef.current = 14;
        }
      }, 1700),
      setTimeout(() => { setPat(1); tgtPhaseRef.current = 1.0; }, 2400),

      // t=3.5s: spring toward P3 — disturbance kick (slightly stronger, pattern more complex)
      setTimeout(() => {
        setTarget(chlTex2); tgtPhaseRef.current = 2.0;
        if (simMatRef.current) {
          const a = Math.random() * Math.PI * 2;
          simMatRef.current.uniforms.uImpulse.value.set(Math.cos(a) * 3.6, Math.sin(a) * 1.8);
          impFramesRef.current = 16;
        }
      }, 3500),
      setTimeout(() => { setPat(2); tgtPhaseRef.current = 1.0; }, 4200),

      // t=5.0s: icon formation — scatter impulse grows with frmB for an organic eruption
      setTimeout(() => {
        const tex = texIconRef.current;
        if (!tex || !simMatRef.current) return;
        setTarget(tex); tgtPhaseRef.current = 2.0;
        const a = Math.random() * Math.PI * 2;
        simMatRef.current.uniforms.uImpulse.value.set(Math.cos(a) * 4.5, Math.sin(a) * 2.8);
        impFramesRef.current = 28;
        impNextTRef.current  = performance.now() / 1000 + 2.2;
      }, 5000),

      // t=5.7s: gust 1 (1.5s earlier) — drift on desktop; quick fade on mobile so logo
      // is already translucent when the title enters at t=6.0s
      setTimeout(() => {
        const simM = simMatRef.current;
        if (!simM) return;
        impNextTRef.current = 99999; // stop auto-taps permanently
        const isMobile = w < 768;
        if (!isMobile) {
          const shiftedTex = texIconShiftedRef.current;
          if (shiftedTex) setTarget(shiftedTex);
          simM.uniforms.uImpulse.value.set(-5.5, 0.7);
          impFramesRef.current = 14;
        } else {
          // Fast fade-out: ease-out starts immediately, drops most of the way in 0.35s
          if (canvasRef.current) {
            canvasRef.current.style.transition = "opacity 0.35s cubic-bezier(0,0,0.2,1)";
            canvasRef.current.style.opacity    = "0.18";
          }
        }
      }, 6200),

      // t=6.15s: gust 2 — mid-strength, slight downward nudge (desktop only)
      setTimeout(() => {
        if (w < 768 || !simMatRef.current) return;
        simMatRef.current.uniforms.uImpulse.value.set(-3.8, -0.3);
        impFramesRef.current = 11;
      }, 6150),

      // t=6.55s: gust 3 — dying gust, animation settles (desktop only)
      setTimeout(() => {
        if (w < 768 || !simMatRef.current) return;
        simMatRef.current.uniforms.uImpulse.value.set(-2.1, 0.4);
        impFramesRef.current = 9;
      }, 6550),

      // t=8.0s: desktop fade canvas to soft decorative opacity
      setTimeout(() => {
        if (!canvasRef.current || w < 768) return;
        canvasRef.current.style.transition = "opacity 3.5s ease";
        canvasRef.current.style.opacity    = "0.45";
      }, 8000),
    ];

    // ── Animation loop ─────────────────────────────────────────────────────
    const animate: FrameRequestCallback = () => {
      const renderer  = rendererRef.current;
      const simMat    = simMatRef.current;
      const ptsMat    = ptsMatRef.current;
      const simScene  = simSceneRef.current;
      const simCam    = simCamRef.current;
      const mainScene = mainSceneRef.current;
      const mainCam   = mainCamRef.current;
      const rtRead    = rtReadRef.current;
      const rtWrite   = rtWriteRef.current;
      if (!renderer||!simMat||!ptsMat||!simScene||!simCam||!mainScene||!mainCam||!rtRead||!rtWrite) {
        rafRef.current = requestAnimationFrame(animRef.current); return;
      }

      const t = performance.now() / 1000;
      simMat.uniforms.uTime.value = t;
      ptsMat.uniforms.uTime.value = t;

      // Smooth phase lerp — 0.033 gives a slightly longer Chladni↔forming overlap
      phaseRef.current += (tgtPhaseRef.current - phaseRef.current) * 0.033;
      simMat.uniforms.uPhase.value = phaseRef.current;
      ptsMat.uniforms.uPhase.value = phaseRef.current;

      // ── Impact tap ──────────────────────────────────────────────────────
      const isForming = phaseRef.current > 1.6;
      if (isForming && t >= impNextTRef.current) {
        // Random direction, modest strength (feels like a gentle knock)
        const ang = Math.random() * Math.PI * 2;
        const str = 1.2 + Math.random() * 1.4;
        simMat.uniforms.uImpulse.value.set(Math.cos(ang) * str, Math.sin(ang) * str);
        impFramesRef.current = 3;
        // Next tap in 2.5–5 seconds
        impNextTRef.current = t + 2.5 + Math.random() * 2.5;
      }
      if (impFramesRef.current > 0) {
        impFramesRef.current--;
        if (impFramesRef.current === 0) simMat.uniforms.uImpulse.value.set(0, 0);
      }

      // Sim pass
      simMat.uniforms.tState.value = rtRead.texture;
      renderer.setRenderTarget(rtWrite);
      renderer.render(simScene, simCam);

      // Render pass
      ptsMat.uniforms.tState.value = rtWrite.texture;
      renderer.setRenderTarget(null);
      renderer.render(mainScene, mainCam);

      // Swap ping-pong
      rtReadRef.current  = rtWrite;
      rtWriteRef.current = rtRead;

      rafRef.current = requestAnimationFrame(animRef.current);
    };
    animRef.current = animate;
    rafRef.current  = requestAnimationFrame(animate);

    // ── Resize observer ───────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      renderer.setSize(nw, nh);
      simMat.uniforms.uRes.value.set(nw, nh);
      ptsMat.uniforms.uRes.value.set(nw, nh);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      timers.forEach(clearTimeout);
      ro.disconnect();
      renderer.dispose();
      rtA.dispose(); rtB.dispose();
      simMat.dispose(); ptsMat.dispose();
      geo.dispose();
      chlTex1.dispose(); chlTex2.dispose();
      texIconRef.current?.dispose();
      texIconShiftedRef.current?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 1 }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
