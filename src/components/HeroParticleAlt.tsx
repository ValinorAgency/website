"use client";

import { AnimatePresence, cubicBezier, motion, useReducedMotion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import HologramGlbFigure from "./HologramGlbFigure"

// ── FBO config ────────────────────────────────────────────────────────────────
const TEX      = 256;                       // 256×256 = 65 536 particles on GPU
const PC       = TEX * TEX;
const AMB_PC   = 80;                        // sparse polished spheres in default state
const FIG_N    = Math.round(PC * 0.52);     // used in vertex shader threshold

// ── GLSL: simulation (physics on GPU) ─────────────────────────────────────────
const SIM_VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const SIM_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D tState;   // xy=pos  zw=vel  (pixel space)
uniform sampler2D tTarget;  // xy=target  z=type(0=fig,1=txt)
uniform float     uMode;    // 0.0=ambient  1.0=forming
uniform vec2      uWind;    // one-shot impulse applied this frame
uniform float     uTime;
uniform vec2      uRes;

float h(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float n1(float t) { return sin(t * 0.0937) * cos(t * 0.0719 + 1.31) + sin(t * 0.0383) * 0.38; }

void main() {
  vec4  st  = texture2D(tState, vUv);
  vec2  pos = st.xy;
  vec2  vel = st.zw;
  float sd  = vUv.x * 97.3 + vUv.y * 43.1;

  if (length(uWind) > 0.001) {
    float ang = atan(uWind.y, uWind.x) + (h(sd + 7.3) - 0.5) * 1.8;
    float pw  = length(uWind) * (0.55 + h(sd + 23.7) * 0.9);
    vel += vec2(cos(ang), sin(ang)) * pw;
  }

  if (uMode > 0.5) {
    vec4  tgt   = texture2D(tTarget, vUv);
    float isFig = 1.0 - tgt.z;   // 1.0 = figure particle, 0.0 = text particle
    vec2  diff  = tgt.xy - pos;
    float dist  = length(diff);

    // Stable hologram formation: spring to target with only subtle scan drift.
    float jx = n1(sd * 93.7 + uTime * 0.55) * 0.45;
    float jy = n1(sd * 47.2 + uTime * 0.42) * 0.38;
    vec2 drift = vec2(jx, jy);
    vec2 txtVel = vel * 0.84 + ((tgt.xy + drift) - pos) * 0.020;
    vec2 figVel = vel * 0.86 + ((tgt.xy + drift * 1.35) - pos) * 0.018;

    vel = mix(txtVel, figVel, isFig);
  } else {
    // Very slow graceful drift — sparse particles float like distant stars
    vel.x = vel.x * 0.994 + n1(sd * 100.0 + uTime * 0.055) * 0.011;
    vel.y = vel.y * 0.994 + n1(sd *  79.4  + uTime * 0.044) * 0.007 - 0.0008;
    if      (pos.x < -12.0)         pos.x += uRes.x + 24.0;
    else if (pos.x > uRes.x + 12.0) pos.x -= uRes.x + 24.0;
    if      (pos.y < -12.0)         pos.y += uRes.y + 24.0;
    else if (pos.y > uRes.y + 12.0) pos.y -= uRes.y + 24.0;
  }
  pos += vel;
  gl_FragColor = vec4(pos, vel);
}
`;

// ── GLSL: particle render ──────────────────────────────────────────────────────
const PTS_VERT = /* glsl */`
attribute vec2 aUv;
attribute vec3 aColorAmb;
attribute vec4 aColorFrm;  // rgb=color  a=baseAlpha
uniform sampler2D tState;
uniform vec2  uRes;
uniform float uIsForming;
uniform float uHideFigure;
uniform float uTime;
uniform float uDpr;

varying vec4  vColor;
varying float vAlive;

float h2(float n) { return fract(sin(n * 127.1) * 43758.5453); }

void main() {
  float idx = floor(aUv.y * ${TEX}.0) * ${TEX}.0 + floor(aUv.x * ${TEX}.0);
  float showAmb  = step(idx, ${AMB_PC}.0 - 1.0);
  float isFigure = step(idx, ${FIG_N}.0 - 1.0);
  float seed    = aUv.x * 97.3 + aUv.y * 43.1;
  float pDelay  = h2(seed + 99.3);
  float showFrm = step(pDelay, uIsForming);
  vAlive = max(showAmb, showFrm * step(0.001, uIsForming) * isFigure);
  vAlive *= 1.0 - (isFigure * uHideFigure * uIsForming);

  vec4 st  = texture2D(tState, aUv);
  vec2 pos = st.xy;

  if (vAlive < 0.5) {
    gl_Position  = vec4(9.9, 9.9, 0.0, 1.0);
    gl_PointSize = 1.0;
    vColor = vec4(0.0);
    return;
  }

  float x = (pos.x / uRes.x) * 2.0 - 1.0;
  float y = 1.0 - (pos.y / uRes.y) * 2.0;
  gl_Position = vec4(x, y, 0.0, 1.0);

  // Per-particle size pulse
  float sizePulse = 0.68 + 0.32 * sin(uTime * 0.55 + h2(seed + 7.1) * 6.28);
  gl_PointSize = max(2.0, mix(9.5, 2.2, uIsForming) * sizePulse * uDpr);

  // Ambient color: brightness drift + teal accent for ~28 % of particles
  vec3  tealCol     = vec3(0.141, 0.839, 0.737); // #24D6BC
  float isTeal      = step(0.72, h2(seed + 91.3));
  float tealPhase   = sin(uTime * 0.28 + h2(seed + 55.7) * 6.28) * 0.5 + 0.5;
  float brightCycle = 0.50 + 0.50 * sin(uTime * 0.18 + h2(seed + 23.1) * 6.28);
  vec3  dynAmb      = mix(aColorAmb * (0.52 + 0.48 * brightCycle), tealCol, isTeal * tealPhase * 0.85);
  vec3  col         = mix(dynAmb, aColorFrm.rgb, uIsForming);

  float phase    = uTime * 0.36 + h2(seed) * 6.28;
  float frmAlpha = aColorFrm.a * (0.58 + 0.42 * sin(phase * 1.7));
  float ambAlpha = 0.52 + 0.48 * sin(phase * 1.7);
  float alpha    = mix(ambAlpha, frmAlpha, uIsForming);
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

  // Luz principal — upper-left
  vec3  L1    = normalize(vec3(-0.48, 0.72, 0.88));
  float diff1 = max(0.0, dot(N, L1));
  vec3  R1    = reflect(-L1, N);
  float RdotV = max(0.0, dot(R1, V));
  // Doble especular: capa suave + punto caliente muy concentrado
  float spec1 = pow(RdotV, 160.0) * 3.0;
  float spec2 = pow(RdotV, 700.0) * 2.0;

  // Luz de relleno tenue
  vec3  L2    = normalize(vec3(0.60, -0.22, 0.65));
  float diff2 = max(0.0, dot(N, L2)) * 0.08;

  // Fresnel fuerte: bordes muy oscuros = esfera cromada pulida
  float fresnel = pow(1.0 - z, 4.0) * 0.85;

  float shade  = 0.04 + diff1 * 0.58 + diff2;
  vec3  base   = vColor.rgb * shade;
  vec3  hilit  = vec3(1.00, 1.00, 1.00) * (spec1 + spec2);
  vec3  result = base + hilit - vColor.rgb * fresnel;

  gl_FragColor = vec4(max(vec3(0.0), result), vColor.a);
}
`;

// ── Types ─────────────────────────────────────────────────────────────────────
type AppState = "default" | "code" | "ai";
type DrawFn   = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

// ── Canvas sampler ────────────────────────────────────────────────────────────
function sampleCanvas(draw: DrawFn, w: number, h: number, n: number): [number, number][] {
  const cvs = document.createElement("canvas");
  cvs.width = Math.round(w); cvs.height = Math.round(h);
  const ctx = cvs.getContext("2d")!;
  draw(ctx, cvs.width, cvs.height);
  const d = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
  const cands: [number, number][] = [];
  for (let y = 0; y < cvs.height; y++) {
    for (let x = 0; x < cvs.width; x++) {
      const a = d[(y * cvs.width + x) * 4 + 3];
      if (a > 40) {
        const c = a > 200 ? 3 : a > 100 ? 2 : 1;
        for (let k = 0; k < c; k++) cands.push([x, y]);
      }
    }
  }
  if (!cands.length) return Array.from({ length: n }, () => [w / 2, h / 2] as [number, number]);
  return Array.from({ length: n }, () => {
    const c = cands[(Math.random() * cands.length) | 0];
    return [c[0] + Math.random() - 0.5, c[1] + Math.random() - 0.5] as [number, number];
  });
}

// ── Drawing helpers ───────────────────────────────────────────────────────────
function hl(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
function sh(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}

// ── Shapes ────────────────────────────────────────────────────────────────────
function drawCode(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let sz = h;
  ctx.font = `900 ${sz}px "Courier New", Courier, monospace`;
  sz = sz * (w * 0.87 / ctx.measureText("</>").width);
  const fontSize = Math.min(sz, h * 0.95);
  ctx.font = `900 ${fontSize}px "Courier New", Courier, monospace`;

  // Soft volume pass: low-density body plus offset layers gives the flat glyph
  // enough depth for the particle cloud to read as a hologram.
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  for (let i = 7; i > 0; i--) {
    ctx.fillText("</>", w / 2 - i * 2.1, h / 2 + i * 1.1);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.70)";
  ctx.lineWidth = Math.max(2, fontSize * 0.018);
  ctx.strokeText("</>", w / 2, h / 2);

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillText("</>", w / 2, h / 2);

  ctx.globalCompositeOperation = "destination-out";
  ctx.strokeStyle = "rgba(0,0,0,0.42)";
  ctx.lineWidth = Math.max(1.5, fontSize * 0.010);
  for (let y = h * 0.22; y <= h * 0.78; y += Math.max(8, h * 0.035)) {
    ctx.beginPath();
    ctx.moveTo(w * 0.12, y);
    ctx.bezierCurveTo(w * 0.32, y + h * 0.025, w * 0.68, y - h * 0.025, w * 0.88, y);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineWidth = Math.max(1.5, fontSize * 0.009);
  for (let y = h * 0.26; y <= h * 0.74; y += Math.max(12, h * 0.052)) {
    ctx.beginPath();
    ctx.moveTo(w * 0.18, y);
    ctx.bezierCurveTo(w * 0.38, y - h * 0.04, w * 0.62, y + h * 0.04, w * 0.82, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.86)";
  ctx.lineWidth = Math.max(1.2, fontSize * 0.007);
  ctx.beginPath();
  ctx.moveTo(w * 0.18, h * 0.78);
  ctx.lineTo(w * 0.82, h * 0.18);
  ctx.stroke();

  ctx.restore();
}


function drawFace(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w, 0);
  ctx.scale(-1, 1);

  // Profile authored facing left, then mirrored above so the final hologram
  // looks right like the reference image.
  // headR is the "skull radius" — all measurements derived from it so the face
  // fills the canvas without clipping.
  // Constraints: skulX - headR*1.06 ≥ 4  (nose stays inside left edge)
  //              skulX + headR*0.94 ≤ w  (back of skull stays inside right edge)
  // → total width needed: headR*2.00; skulX = headR*1.07
  const headR = Math.min(w * 0.46, h * 0.29);
  const skulX = headR * 1.07;         // skull centre X (nose faces left)
  const skulY = h * 0.37;             // skull centre Y

  // ── vertical landmarks ────────────────────────────────────────────────────
  const topY    = skulY - headR * 0.97;  // crown top
  const foreY   = skulY - headR * 0.53;  // forehead
  const browY   = skulY - headR * 0.19;  // brow ridge
  const eyeY    = skulY + headR * 0.03;  // eye level
  const nTipY   = skulY + headR * 0.31;  // nose tip
  const nBaseY  = skulY + headR * 0.44;  // under-nose
  const upLipY  = skulY + headR * 0.54;  // upper lip
  const lpCrY   = skulY + headR * 0.61;  // lip crease
  const loLipY  = skulY + headR * 0.67;  // lower lip
  const chinY   = skulY + headR * 0.83;  // chin
  const jawY    = skulY + headR * 1.09;  // jaw corner
  const nkTopY  = skulY + headR * 1.36;  // neck top
  const nkBotY  = h * 0.97;              // neck base

  // ── horizontal landmarks ──────────────────────────────────────────────────
  const backX    = skulX + headR * 0.93;   // back of skull  (≤ w guaranteed)
  const nkBackX  = skulX + headR * 0.41;   // neck back
  const nkFrntX  = skulX - headR * 0.21;   // neck front
  const jawX     = skulX - headR * 0.31;   // jaw corner
  const chinX    = skulX - headR * 0.71;   // chin
  const loLipX   = skulX - headR * 0.87;   // lower lip (most forward of lips)
  const lpCrX    = skulX - headR * 0.83;   // lip crease
  const upLipX   = skulX - headR * 0.80;   // upper lip
  const nBaseX   = skulX - headR * 0.77;   // under-nose
  const nTipX    = skulX - headR * 1.05;   // NOSE TIP (≈ 4 px from left edge)
  const nBridX   = skulX - headR * 0.59;   // nose bridge top
  const browX    = skulX - headR * 0.57;   // brow
  const foreX    = skulX - headR * 0.51;   // forehead face
  const earX     = skulX + headR * 0.54;
  const earY     = skulY + headR * 0.07;

  // ── 1. Silhouette ─────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.moveTo(foreX + headR * 0.24, topY);                                 // crown front
  ctx.bezierCurveTo(                                                        // crown arc → back
    skulX + headR * 0.09, topY - headR * 0.06,
    backX, skulY - headR * 0.74,
    backX, skulY - headR * 0.19
  );
  ctx.bezierCurveTo(                                                        // back skull → nape
    backX, skulY + headR * 0.43,
    nkBackX + headR * 0.11, jawY - headR * 0.06,
    nkBackX, jawY + headR * 0.06
  );
  ctx.bezierCurveTo(                                                        // nape → neck back
    nkBackX - headR * 0.02, nkTopY,
    nkBackX - headR * 0.04, nkBotY - headR * 0.10,
    nkBackX - headR * 0.08, nkBotY
  );
  ctx.lineTo(nkFrntX, nkBotY);                                             // neck base
  ctx.bezierCurveTo(                                                        // neck front → jaw
    nkFrntX, nkTopY + headR * 0.12,
    nkFrntX - headR * 0.04, nkTopY,
    jawX, jawY
  );
  ctx.bezierCurveTo(                                                        // jaw → chin
    chinX + headR * 0.22, jawY - headR * 0.14,
    chinX + headR * 0.06, chinY + headR * 0.06,
    chinX, chinY
  );
  ctx.bezierCurveTo(                                                        // chin → lower lip
    chinX - headR * 0.06, chinY - headR * 0.10,
    loLipX + headR * 0.04, loLipY + headR * 0.04,
    loLipX, loLipY
  );
  ctx.bezierCurveTo(loLipX - headR * 0.04, lpCrY + headR * 0.01,          // lower lip → crease
    lpCrX, lpCrY, lpCrX, lpCrY);
  ctx.bezierCurveTo(upLipX - headR * 0.02, lpCrY - headR * 0.02,          // crease → upper lip
    upLipX, upLipY - headR * 0.01, upLipX, upLipY);
  ctx.bezierCurveTo(                                                        // upper lip → under-nose
    upLipX + headR * 0.04, nBaseY + headR * 0.04,
    nBaseX, nBaseY + headR * 0.02, nBaseX, nBaseY
  );
  ctx.bezierCurveTo(                                                        // under-nose → NOSE TIP
    nTipX + headR * 0.06, nBaseY,
    nTipX, nTipY + headR * 0.08,
    nTipX, nTipY
  );
  ctx.bezierCurveTo(                                                        // tip → bridge
    nTipX, nTipY - headR * 0.11,
    nBridX - headR * 0.06, browY + headR * 0.11,
    nBridX, browY + headR * 0.04
  );
  ctx.bezierCurveTo(nBridX + headR * 0.02, browY - headR * 0.01,          // bridge → brow
    browX, browY, browX, browY);
  ctx.bezierCurveTo(                                                        // brow → forehead
    browX + headR * 0.06, foreY + headR * 0.13,
    foreX, foreY + headR * 0.04, foreX, foreY
  );
  ctx.bezierCurveTo(                                                        // forehead → crown
    foreX + headR * 0.06, foreY - headR * 0.23,
    foreX + headR * 0.19, topY + headR * 0.04,
    foreX + headR * 0.24, topY
  );
  ctx.closePath();
  ctx.fill();

  // ── 2. Ear ────────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  ctx.beginPath();
  ctx.ellipse(earX, earY, headR * 0.12, headR * 0.16, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,0.38)";
  ctx.beginPath();
  ctx.ellipse(earX, earY, headR * 0.055, headR * 0.090, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  // ── 3. Highlights (bright → more particle density) ────────────────────────
  hl(ctx, foreX + headR * 0.17, foreY + headR * 0.11, headR * 0.16, headR * 0.14, 0.20);
  hl(ctx, nTipX + headR * 0.06, nTipY, headR * 0.09, headR * 0.07, 0.30);
  hl(ctx, browX + headR * 0.16, eyeY + headR * 0.19, headR * 0.14, headR * 0.11, 0.18);
  hl(ctx, chinX + headR * 0.10, chinY, headR * 0.10, headR * 0.07, 0.16);
  hl(ctx, loLipX - headR * 0.01, loLipY, headR * 0.07, headR * 0.04, 0.18);

  // ── 4. Shadows (destination-out → recessed areas have fewer particles) ────
  ctx.globalCompositeOperation = "destination-out";

  // Eye socket — the single most important profile feature
  sh(ctx, skulX - headR * 0.22, eyeY, headR * 0.17, headR * 0.13, 0.70);
  ctx.fillStyle = "rgba(0,0,0,0.76)";
  ctx.beginPath();
  ctx.ellipse(skulX - headR * 0.20, eyeY, headR * 0.10, headR * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();

  // Under-nose hollow
  sh(ctx, nBaseX + headR * 0.11, nBaseY, headR * 0.10, headR * 0.05, 0.56);
  // Lip crease
  sh(ctx, lpCrX + headR * 0.08, lpCrY, headR * 0.09, headR * 0.026, 0.50);
  // Temple hollow
  sh(ctx, skulX - headR * 0.07, skulY - headR * 0.29, headR * 0.23, headR * 0.18, 0.38);

  // Back-of-skull gradient (roundness illusion)
  const bkG = ctx.createLinearGradient(skulX + headR * 0.50, skulY, skulX + headR * 1.00, skulY);
  bkG.addColorStop(0, "rgba(0,0,0,0)");
  bkG.addColorStop(1, "rgba(0,0,0,0.46)");
  ctx.fillStyle = bkG;
  ctx.beginPath();
  ctx.ellipse(skulX + headR * 0.20, skulY - headR * 0.10, headR * 0.88, headR * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck side shadow
  const nkG = ctx.createLinearGradient(nkFrntX + headR * 0.06, nkTopY, nkBackX, nkBotY);
  nkG.addColorStop(0, "rgba(0,0,0,0)");
  nkG.addColorStop(1, "rgba(0,0,0,0.43)");
  ctx.fillStyle = nkG;
  ctx.fillRect(nkFrntX, nkTopY, w, nkBotY - nkTopY + 4);

  ctx.globalCompositeOperation = "source-over";

  // Topographic hologram lines: these become high-density particle ridges.
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.86)";
  ctx.lineWidth = Math.max(1.15, headR * 0.010);

  const contour = (points: [number, number][]) => {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length - 1; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    }
    ctx.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
    ctx.stroke();
  };

  for (let i = 0; i < 14; i++) {
    const y = topY + headR * (0.18 + i * 0.145);
    const wave = Math.sin(i * 0.9) * headR * 0.035;
    contour([
      [backX - headR * 0.12, y - headR * 0.12],
      [skulX + headR * 0.38, y + wave],
      [skulX - headR * 0.02, y - wave * 0.6],
      [nBridX + headR * 0.16, y + headR * 0.03],
      [nTipX + headR * 0.18, y + wave * 0.35],
    ]);
  }

  contour([
    [foreX + headR * 0.20, topY + headR * 0.12],
    [skulX + headR * 0.58, skulY - headR * 0.46],
    [skulX + headR * 0.46, skulY + headR * 0.12],
    [jawX + headR * 0.24, jawY],
    [nkBackX + headR * 0.04, nkBotY - headR * 0.08],
  ]);
  contour([
    [foreX + headR * 0.02, foreY + headR * 0.08],
    [browX + headR * 0.26, eyeY - headR * 0.04],
    [nBridX + headR * 0.18, nTipY - headR * 0.10],
    [nTipX + headR * 0.04, nTipY + headR * 0.02],
  ]);
  contour([
    [nBaseX + headR * 0.08, nBaseY + headR * 0.03],
    [upLipX + headR * 0.02, upLipY],
    [lpCrX + headR * 0.02, lpCrY],
    [loLipX + headR * 0.04, loLipY + headR * 0.02],
    [chinX + headR * 0.12, chinY - headR * 0.02],
  ]);

  ctx.strokeStyle = "rgba(255,255,255,0.48)";
  ctx.lineWidth = Math.max(0.9, headR * 0.006);
  for (let y = topY + headR * 0.06; y < nkBotY; y += headR * 0.105) {
    ctx.beginPath();
    ctx.moveTo(backX - headR * 0.02, y);
    ctx.lineTo(nTipX + headR * 0.05, y + Math.sin(y * 0.02) * headR * 0.015);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  const sparks: [number, number, number][] = [
    [foreX + headR * 0.08, foreY + headR * 0.12, 0.017],
    [browX + headR * 0.13, eyeY - headR * 0.02, 0.014],
    [nTipX + headR * 0.07, nTipY, 0.020],
    [upLipX + headR * 0.05, upLipY, 0.012],
    [chinX + headR * 0.12, chinY, 0.014],
    [skulX + headR * 0.35, skulY - headR * 0.18, 0.015],
  ];
  sparks.forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, headR * r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function HeroParticleAlt() {
  const expo         = cubicBezier(0.16, 1, 0.3, 1);
  const reduceMotion = useReducedMotion();
  const [appState, setAppState] = useState<AppState>("default");
  const [isDissolving, setIsDissolving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const sizeRef      = useRef({ w: 0, h: 0 });
  const stateRef     = useRef<AppState>("default");

  // Three.js objects
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null);
  const rtARef       = useRef<THREE.WebGLRenderTarget | null>(null);
  const rtBRef       = useRef<THREE.WebGLRenderTarget | null>(null);
  // ping-pong: rtRead is sampled by the sim shader; rtWrite receives the output
  const rtReadRef    = useRef<THREE.WebGLRenderTarget | null>(null);
  const rtWriteRef   = useRef<THREE.WebGLRenderTarget | null>(null);
  const simMatRef    = useRef<THREE.ShaderMaterial | null>(null);
  const ptsMatRef    = useRef<THREE.ShaderMaterial | null>(null);
  const simSceneRef  = useRef<THREE.Scene | null>(null);
  const simCamRef    = useRef<THREE.OrthographicCamera | null>(null);
  const mainSceneRef = useRef<THREE.Scene | null>(null);
  const mainCamRef   = useRef<THREE.OrthographicCamera | null>(null);
  const windFramesRef  = useRef(0);
  const isFormingRef = useRef(false);
  const formProgRef  = useRef(0);
  const tgtTexRef    = useRef<THREE.DataTexture | null>(null);
  const animateRef   = useRef<FrameRequestCallback>(() => {});

  useEffect(() => { stateRef.current = appState; }, [appState]);

  // ── Wind ───────────────────────────────────────────────────────────────────
  const applyWind = useCallback((dir: "right" | "left" | "burst") => {
    const sim = simMatRef.current;
    if (!sim) return;
    const isBurst = dir === "burst";
    const base    = isBurst ? 52 + Math.random() * 24 : 34 + Math.random() * 18;
    const spread  = (Math.random() - 0.5) * 12;
    if      (dir === "right") sim.uniforms.uWind.value.set( base, spread);
    else if (dir === "left")  sim.uniforms.uWind.value.set(-base, spread);
    else {
      const a = Math.random() * Math.PI * 2;
      sim.uniforms.uWind.value.set(Math.cos(a) * base, Math.sin(a) * base);
    }
    windFramesRef.current = isBurst ? 4 : 6;
  }, []);

  // ── Build targets: CPU → GPU texture ───────────────────────────────────────
  const buildTargets = useCallback((state: AppState) => {
    if (state === "default") {
      isFormingRef.current = false;
      if (simMatRef.current) simMatRef.current.uniforms.uMode.value = 0.0;
      if (ptsMatRef.current) ptsMatRef.current.uniforms.uHideFigure.value = 0.0;
      return;
    }
    // Expanded states: GLB handles the visual — ambient spheres drift in background
  }, []);

  useEffect(() => { buildTargets(appState); }, [appState, buildTargets]);

  // ── Animation loop ──────────────────────────────────────────────────────────
  const animate = useCallback(() => {
    const renderer  = rendererRef.current;
    const simMat    = simMatRef.current;
    const ptsMat    = ptsMatRef.current;
    const simScene  = simSceneRef.current;
    const simCam    = simCamRef.current;
    const mainScene = mainSceneRef.current;
    const mainCam   = mainCamRef.current;
    const rtRead    = rtReadRef.current;
    const rtWrite   = rtWriteRef.current;
    if (!renderer || !simMat || !ptsMat || !simScene || !simCam || !mainScene || !mainCam || !rtRead || !rtWrite) {
      rafRef.current = requestAnimationFrame(animateRef.current); return;
    }

    const t = performance.now() / 1000;
    simMat.uniforms.uTime.value = t;
    ptsMat.uniforms.uTime.value = t;

    // Sustain wind for windFramesRef frames, then clear
    if (windFramesRef.current > 0) {
      windFramesRef.current--;
    } else {
      simMat.uniforms.uWind.value.set(0, 0);
    }

    // Form progress smooth lerp
    const tgt  = isFormingRef.current ? 1.0 : 0.0;
    const rate = isFormingRef.current ? 0.005 : 0.05;
    formProgRef.current += (tgt - formProgRef.current) * rate;
    ptsMat.uniforms.uIsForming.value = formProgRef.current;

    // ── Simulation pass: read rtRead → write rtWrite ───────────────────────
    simMat.uniforms.tState.value = rtRead.texture;
    renderer.setRenderTarget(rtWrite);
    renderer.render(simScene, simCam);

    // ── Render particles to canvas ─────────────────────────────────────────
    ptsMat.uniforms.tState.value = rtWrite.texture;
    renderer.setRenderTarget(null);
    renderer.render(mainScene, mainCam);

    // ── Swap ping-pong (rtRead ↔ rtWrite) ──────────────────────────────────
    rtReadRef.current  = rtWrite;
    rtWriteRef.current = rtRead;

    rafRef.current = requestAnimationFrame(animateRef.current);
  }, []);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  // ── Setup ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (reduceMotion) return;
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w   = container.clientWidth;
    const h   = container.clientHeight;

    // ── Renderer ─────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0); // fully transparent background
    rendererRef.current = renderer;

    // ── Render targets (ping-pong) ────────────────────────────────────────
    const rtA = new THREE.WebGLRenderTarget(TEX, TEX, {
      type:          THREE.FloatType,
      format:        THREE.RGBAFormat,
      minFilter:     THREE.NearestFilter,
      magFilter:     THREE.NearestFilter,
      depthBuffer:   false,
      stencilBuffer: false,
    });
    const rtB = rtA.clone();
    rtARef.current = rtA;
    rtBRef.current = rtB;

    // ── Initial particle state ────────────────────────────────────────────
    const initData = new Float32Array(PC * 4);
    for (let i = 0; i < PC; i++) {
      initData[i*4+0] = Math.random() * w;
      initData[i*4+1] = Math.random() * h;
      initData[i*4+2] = (Math.random() - 0.5) * 0.5;
      initData[i*4+3] = (Math.random() - 0.5) * 0.5 - 0.06;
    }
    const initTex = new THREE.DataTexture(initData, TEX, TEX, THREE.RGBAFormat, THREE.FloatType);
    initTex.needsUpdate = true;

    // Dummy target texture (1×1 — ignored when uMode=0.0)
    const dummyData = new Float32Array([0, 0, 0, 0]);
    const dummyTex  = new THREE.DataTexture(dummyData, 1, 1, THREE.RGBAFormat, THREE.FloatType);
    dummyTex.needsUpdate = true;

    // ── Per-particle static attributes ────────────────────────────────────
    const uvs      = new Float32Array(PC * 2);
    const colAmb   = new Float32Array(PC * 3);
    const colFrm   = new Float32Array(PC * 4);
    for (let i = 0; i < PC; i++) {
      uvs[i*2+0] = ((i % TEX) + 0.5) / TEX;
      uvs[i*2+1] = (Math.floor(i / TEX) + 0.5) / TEX;
      // Ambient: base oscura — la luz viene del especular, no de la difusa (acero pulido)
      const tint = (Math.random() - 0.5) * 0.06;
      colAmb[i*3+0] = 0.20 + Math.random() * 0.18 + tint;
      colAmb[i*3+1] = 0.22 + Math.random() * 0.16;
      colAmb[i*3+2] = 0.26 + Math.random() * 0.18 - tint;
      // Forming: paleta acero/cromo — gris medio con tinte frío
      const isFigure = i < FIG_N;
      // Brillo base en rango medio para que el shading de esfera tenga contraste
      const brightness = isFigure
        ? 0.36 + Math.random() * 0.34   // 0.36–0.70 para figura
        : 0.28 + Math.random() * 0.36;  // 0.28–0.64 para texto
      const steelTint = Math.random() * 0.07;   // variación fría/cálida sutil
      const isChrome  = Math.random() < 0.12;   // ~12% de bolitas azul-cromo
      if (isChrome) {
        colFrm[i*4+0] = 0.16 + Math.random() * 0.16;
        colFrm[i*4+1] = 0.42 + Math.random() * 0.20;
        colFrm[i*4+2] = 0.80 + Math.random() * 0.18;
      } else {
        colFrm[i*4+0] = brightness - steelTint * 0.4;
        colFrm[i*4+1] = brightness - steelTint * 0.1;
        colFrm[i*4+2] = brightness + steelTint * 0.9;
      }
      colFrm[i*4+3] = isFigure
        ? 0.55 + Math.random() * 0.42   // más opaco para aspecto sólido metálico
        : 0.46 + Math.random() * 0.50;
    }

    // ── Points geometry ───────────────────────────────────────────────────
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position",  new THREE.BufferAttribute(new Float32Array(PC * 3), 3));
    geo.setAttribute("aUv",       new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute("aColorAmb", new THREE.BufferAttribute(colAmb, 3));
    geo.setAttribute("aColorFrm", new THREE.BufferAttribute(colFrm, 4));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);

    // ── Simulation material ───────────────────────────────────────────────
    const simMat = new THREE.ShaderMaterial({
      vertexShader:   SIM_VERT,
      fragmentShader: SIM_FRAG,
      uniforms: {
        tState:  { value: initTex },
        tTarget: { value: dummyTex },
        uMode:   { value: 0.0 },        // float, not int
        uWind:   { value: new THREE.Vector2(0, 0) },
        uTime:   { value: 0 },
        uRes:    { value: new THREE.Vector2(w, h) },
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
      blending:       THREE.NormalBlending,
      uniforms: {
        tState:     { value: initTex },
        uRes:       { value: new THREE.Vector2(w, h) },
        uIsForming: { value: 0 },
        uHideFigure:{ value: 0 },
        uTime:      { value: 0 },
        uDpr:       { value: dpr },
      },
    });
    ptsMatRef.current = ptsMat;

    // ── Scenes & cameras ──────────────────────────────────────────────────
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

    // ── Copy initial state into both render targets ───────────────────────
    // This ensures rtRead and rtWrite are both valid before the loop starts.
    const copySim = new THREE.Scene();
    const copyMat = new THREE.ShaderMaterial({
      vertexShader:   SIM_VERT,
      fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D tData; void main() { gl_FragColor = texture2D(tData, vUv); }`,
      uniforms: { tData: { value: initTex } },
    });
    copySim.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), copyMat));
    const copyCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    renderer.setRenderTarget(rtA); renderer.render(copySim, copyCam);
    renderer.setRenderTarget(rtB); renderer.render(copySim, copyCam);
    renderer.setRenderTarget(null);
    copyMat.dispose();
    initTex.dispose(); // no longer needed — state lives in render targets

    // rtRead = rtB (will be read first); rtWrite = rtA (will be written first)
    rtReadRef.current  = rtB;
    rtWriteRef.current = rtA;

    // ── Resize observer ───────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      renderer.setSize(nw, nh);
      sizeRef.current = { w: nw, h: nh };
      simMat.uniforms.uRes.value.set(nw, nh);
      ptsMat.uniforms.uRes.value.set(nw, nh);
      buildTargets(stateRef.current);
    });
    sizeRef.current = { w, h };
    ro.observe(container);

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      renderer.dispose();
      rtA.dispose(); rtB.dispose();
      dummyTex.dispose();
      simMat.dispose(); ptsMat.dispose();
      geo.dispose();
    };
  }, [reduceMotion, animate, buildTargets]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleExpand = (next: "code" | "ai") => {
    if (isDissolving) return;
    setIsDissolving(true);
    // Burst scatters ambient particles — they'll be slowly "absorbed" into the hologram
    applyWind("burst");
    setTimeout(() => {
      buildTargets(next);
      setAppState(next);
    }, 480);
  };
  const handleClose = () => {
    applyWind("burst");
    setIsDissolving(false);
    setAppState("default");
  };

  const isExpanded = appState !== "default";
  const subtitles  = {
    code: "Sitios web rápidos, modernos y que convierten, construidos con tecnología actual.",
    ai:   "Automatizaciones y asistentes inteligentes que trabajan por vos las 24 horas.",
  };

  return (
    <section
      ref={containerRef}
      id="about"
      className="pointer-events-none relative -mt-[4.5rem] flex min-h-svh flex-col items-center justify-center overflow-visible pt-[4.5rem]"
    >
      {!reduceMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 0 }}
        />
      )}

      {/* ── GLB holograms (aparecen mientras partículas forman y luego se desvanecen) ── */}
      <AnimatePresence>
        {appState === "code" && !reduceMotion && (
          <motion.div
            key="code-glb"
            className="pointer-events-none absolute z-[210] left-[8%] right-[8%] top-[5%] bottom-[22%] sm:left-[4%] sm:right-[46%] sm:top-[8%] sm:bottom-[8%]"
            initial={{ opacity: 0, scale: 0.93, x: "-8%" }}
            animate={{ opacity: 1, scale: 1, x: "0%" }}
            exit={{ opacity: 0, scale: 0.98, x: "-5%", transition: { duration: 0.28 } }}
            transition={{ duration: 1.0, delay: 0.30, ease: expo }}
          >
            <HologramGlbFigure className="h-full w-full" url="/notebook.glb" baseRotationX={-Math.PI / 2} baseRotationY={Math.PI * 0.15} baseRotationZ={0.7} />
          </motion.div>
        )}

        {appState === "ai" && !reduceMotion && (
          <motion.div
            key="ai-glb"
            className="pointer-events-none absolute z-[210] left-[4%] right-[4%] top-[2%] bottom-[18%] sm:left-[38%] sm:right-[-1%] sm:top-[2%] sm:bottom-[4%]"
            initial={{ opacity: 0, scale: 0.93, x: "8%" }}
            animate={{ opacity: 1, scale: 1, x: "0%" }}
            exit={{ opacity: 0, scale: 0.98, x: "5%", transition: { duration: 0.28 } }}
            transition={{ duration: 1.0, delay: 0.30, ease: expo }}
          >
            <HologramGlbFigure className="h-full w-full" url="/base_basic_shaded.glb" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Default hero ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            key="default-ui"
            className="pointer-events-auto relative z-10 flex flex-col items-center gap-6 px-4 text-center"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={isDissolving
              ? { opacity: 0, scale: 0.97, filter: "blur(8px)" }
              : { opacity: 1, scale: 1,    filter: "blur(0px)" }
            }
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{
              opacity: { duration: 0.45, ease: "easeOut" },
              scale:   { duration: 0.45, ease: "easeOut" },
              filter:  { duration: 0.40, ease: "easeOut" },
            }}
          >
            {/* Brand title */}
            <div className="flex flex-col items-center gap-3">
              <h1
                className="font-display font-black leading-[0.94]"
                style={{ fontSize: "clamp(3.6rem, 11vw, 10rem)", letterSpacing: "-0.055em" }}
              >
                <span style={{ color: "rgba(255,255,255,0.96)" }}>Valinor</span>{" "}
                <span className="text-outline">Agency</span>
              </h1>
              <p
                className='mt-8'
                style={{
                  fontSize: "clamp(1.56rem, 1.3vw, 0.75rem)",
                  fontWeight: 200,
                  letterSpacing: "0.32em",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                }}
              >
                Todo lo que necesitas
              </p>
            </div>

            {/* CTA buttons */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.55, ease: expo }}
            >
              <button
                className="hero-cta-btn"
                onClick={() => handleExpand("code")}
              >
                WEBSITES
              </button>
              <button
                className="hero-cta-btn"
                onClick={() => handleExpand("ai")}
              >
                AGENTES AI
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expanded hero ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expanded-ui"
            className="pointer-events-none absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ duration: 0.3 }}
          >
            {/* Title — wrapper handles position + vertical center; inner div animates slide */}
            <div
              className={`pointer-events-none absolute inset-y-0 flex items-center px-6
                left-4 right-4
                ${appState === "code"
                  ? "sm:left-[51%] sm:right-[4%]"
                  : "sm:left-[4%]  sm:right-[49%]"
                }`}
              style={appState === "ai" ? { paddingLeft: "calc(1.5rem + 60px)" } : undefined}
            >
              <motion.div
                className="pointer-events-auto flex flex-col gap-4 w-full"
                initial={{ opacity: 0, x: appState === "code" ? 55 : -55 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ delay: 0.85, duration: 0.9, ease: expo }}
              >
                <h2
                  className="font-display font-black leading-[0.96]"
                  style={{
                    fontSize: appState === "ai" ? "clamp(2.6rem, 6.5vw, 7rem)" : "clamp(2.2rem, 5.5vw, 5.8rem)",
                    letterSpacing: "-0.045em",
                    color: "rgba(255,255,255,0.95)",
                  }}
                >
                  {appState === "code" ? <>Webs<br/>Profesionales</> : <>Agentes<br/>de AI</>}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.48)", fontSize: appState === "ai" ? "1.06rem" : "0.92rem", lineHeight: 1.65, maxWidth: "30ch" }}>
                  {subtitles[appState]}
                </p>
                <div>
                  <a
                    href={appState === "code" ? "#servicios" : "#servicios-ai"}
                    className="hero-cta-btn"
                  >
                    {appState === "code" ? "Ver trabajos" : "Ver agentes"}
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Close */}
            <button
              onClick={handleClose}
              aria-label="Volver al inicio"
              className="pointer-events-auto absolute left-1/2 -translate-x-1/2 flex h-11 w-11 items-center justify-center rounded-full text-xl font-light transition-all hover:scale-110 hover:opacity-60"
              style={{
                bottom: "5%",
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.75)",
              }}
            >×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
