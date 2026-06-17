"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type HologramCodeFigureProps = {
  className?: string;
};

const PARTICLE_COUNT = 30000;

const VERT = /* glsl */ `
attribute vec3 aBase;
attribute vec3 aNormal;
attribute float aSeed;

uniform float uTime;
uniform float uPixelRatio;
uniform float uPointScale;
uniform float uMouseActive;
uniform float uMouseEnergy;
uniform vec3 uMouse;
uniform vec3 uMouseVel;

varying float vShade;
varying float vStripe;
varying float vSeed;
varying float vMouseGlow;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

void main() {
  float pulse = sin(uTime * 1.12 + aSeed * 6.28318) * 0.018;
  vec3 p = aBase + aNormal * pulse;

  vec3 toParticle = aBase - uMouse;
  float mouseDist = length(toParticle);
  float falloff = clamp(1.0 - mouseDist / 0.95, 0.0, 1.0);
  falloff = falloff * falloff * uMouseActive;
  vec3 pushDir = normalize(toParticle + aNormal * 0.45 + vec3(0.0001));
  vec3 velDir = normalize(uMouseVel + vec3(0.0001));
  vec3 scatter = normalize(vec3(
    sin(aSeed * 127.1),
    cos(aSeed * 311.7),
    sin(aSeed * 74.3 + 1.0)
  ));
  p += pushDir * falloff * (0.21 + uMouseEnergy * 0.18);
  p += velDir * falloff * uMouseEnergy * 0.12;
  p += scatter * falloff * uMouseEnergy * 0.045;

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float depthScale = clamp(2.8 / -mvPosition.z, 0.55, 2.25);
  gl_PointSize = uPointScale * uPixelRatio * depthScale * (0.82 + hash(aSeed + 2.7) * 0.6);

  vec3 lightA = normalize(vec3(-0.45, 0.50, 0.78));
  vec3 lightB = normalize(vec3(0.55, -0.25, 0.78));
  float wrapA = dot(normalize(aNormal), lightA) * 0.5 + 0.5;
  float wrapB = dot(normalize(aNormal), lightB) * 0.5 + 0.5;
  vShade = clamp(0.22 + wrapA * 0.50 + wrapB * 0.30, 0.0, 1.0);

  float contour = aBase.y * 13.0 + sin(aBase.x * 8.0 + aBase.z * 4.0) * 0.18;
  float f = abs(fract(contour) - 0.5);
  vStripe = smoothstep(0.40, 0.50, f);
  vSeed = aSeed;
  vMouseGlow = clamp(falloff * (0.55 + uMouseEnergy * 1.75), 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uBlue;

varying float vShade;
varying float vStripe;
varying float vSeed;
varying float vMouseGlow;

float hash(float n) {
  return fract(sin(n * 311.7) * 43758.5453123);
}

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;

  float disk = 1.0 - smoothstep(0.18, 0.50, r);
  float flicker = 0.82 + 0.18 * sin(uTime * 1.2 + vSeed * 19.0);
  float blueHit = step(0.80, hash(vSeed + 4.3));
  vec3 grey = vec3(0.18 + vShade * 0.72);
  vec3 lineColor = mix(grey, uBlue, 0.58 + blueHit * 0.24);
  vec3 color = mix(grey, lineColor, clamp(vStripe + blueHit * 0.28, 0.0, 1.0));
  color = mix(color, vec3(0.92, 0.97, 1.0), vMouseGlow * 0.82);
  color = mix(color, uBlue, vMouseGlow * 0.34);
  float alpha = disk * flicker * (0.16 + vShade * 0.58 + vStripe * 0.34 + vMouseGlow * 0.68);

  gl_FragColor = vec4(color, alpha);
}
`;

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function buildCodePointCloud() {
  const width = 920;
  const height = 560;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    throw new Error("Unable to create code hologram canvas.");
  }

  const roundRect = (x: number, y: number, w: number, h: number, r: number, fill = true, stroke = false) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  };

  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const frameX = 58;
  const frameY = 58;
  const frameW = width - frameX * 2;
  const frameH = height - frameY * 2;
  const chromeH = 58;

  // Browser shell: mostly outline, not a filled rectangle, so it reads as UI.
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  roundRect(frameX, frameY, frameW, frameH, 34, true, false);
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 9;
  roundRect(frameX, frameY, frameW, frameH, 34, false, true);
  ctx.strokeStyle = "rgba(255,255,255,0.42)";
  ctx.lineWidth = 3;
  roundRect(frameX + 18, frameY + 18, frameW - 36, frameH - 36, 24, false, true);

  ctx.strokeStyle = "rgba(255,255,255,0.70)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(frameX + 4, frameY + chromeH);
  ctx.lineTo(frameX + frameW - 4, frameY + chromeH);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.86)";
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.arc(frameX + 30 + i * 23, frameY + 29, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.strokeStyle = "rgba(255,255,255,0.76)";
  ctx.lineWidth = 3;
  roundRect(frameX + 130, frameY + 16, frameW - 190, 26, 13, true, true);
  ctx.fillStyle = "rgba(255,255,255,0.80)";
  roundRect(frameX + 154, frameY + 27, 190, 4, 2);
  roundRect(frameX + frameW - 122, frameY + 25, 54, 7, 4);

  const screenX = frameX + 34;
  const screenY = frameY + chromeH + 34;
  const screenW = frameW - 68;
  const screenH = frameH - chromeH - 68;

  // Navbar.
  ctx.strokeStyle = "rgba(255,255,255,0.40)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(screenX, screenY + 34);
  ctx.lineTo(screenX + screenW, screenY + 34);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.84)";
  roundRect(screenX, screenY, 86, 12, 6);
  [58, 70, 46].forEach((w, i) => {
    ctx.fillStyle = "rgba(255,255,255,0.54)";
    roundRect(screenX + screenW - 265 + i * 76, screenY + 2, w, 8, 4);
  });
  ctx.fillStyle = "rgba(255,255,255,0.90)";
  roundRect(screenX + screenW - 82, screenY - 7, 82, 24, 12);

  // Hero block.
  const heroY = screenY + 74;
  ctx.strokeStyle = "rgba(255,255,255,0.34)";
  ctx.lineWidth = 2;
  roundRect(screenX - 4, heroY - 18, screenW * 0.76, 190, 20, false, true);
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  roundRect(screenX, heroY, screenW * 0.70, 24, 9);
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  roundRect(screenX, heroY + 38, screenW * 0.48, 16, 7);
  ctx.fillStyle = "rgba(255,255,255,0.54)";
  roundRect(screenX, heroY + 76, screenW * 0.52, 7, 4);
  roundRect(screenX, heroY + 92, screenW * 0.39, 7, 4);
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  roundRect(screenX, heroY + 124, 112, 28, 14);
  ctx.strokeStyle = "rgba(255,255,255,0.66)";
  ctx.lineWidth = 3;
  roundRect(screenX + 130, heroY + 124, 104, 28, 14, false, true);

  // Right mini product preview / API badges.
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 4;
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  roundRect(screenX + screenW - 190, heroY + 8, 190, 112, 18, true, true);
  ctx.strokeStyle = "rgba(255,255,255,0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(screenX + screenW - 170, heroY + 88);
  ctx.lineTo(screenX + screenW - 42, heroY + 32);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(screenX + screenW - 64, heroY + 42, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  roundRect(screenX + screenW - 164, heroY + 34, 90, 8, 4);
  roundRect(screenX + screenW - 164, heroY + 54, 128, 6, 3);
  roundRect(screenX + screenW - 164, heroY + 70, 78, 6, 3);
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  roundRect(screenX + screenW - 70, heroY + 76, 42, 20, 10);

  // Cards row.
  const cardY = screenY + screenH - 118;
  const cardGap = 18;
  const cardW = (screenW - cardGap * 2) / 3;
  for (let i = 0; i < 3; i++) {
    const x = screenX + i * (cardW + cardGap);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.strokeStyle = "rgba(255,255,255,0.64)";
    ctx.lineWidth = 3;
    roundRect(x, cardY, cardW, 82, 18, true, true);
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    roundRect(x + 18, cardY + 18, 22, 18, 6);
    ctx.fillStyle = "rgba(255,255,255,0.52)";
    roundRect(x + 18, cardY + 50, cardW * 0.62, 6, 3);
    roundRect(x + 18, cardY + 64, cardW * 0.42, 6, 3);
  }

  // Deploy footer.
  ctx.fillStyle = "rgba(255,255,255,0.90)";
  roundRect(screenX, screenY + screenH - 20, screenW, 20, 10);

  // Vertical structure lines make the browser layout clear in particle form.
  ctx.strokeStyle = "rgba(255,255,255,0.32)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(screenX + screenW * 0.73, screenY + 56);
  ctx.lineTo(screenX + screenW * 0.73, cardY - 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(screenX, cardY - 22);
  ctx.lineTo(screenX + screenW, cardY - 22);
  ctx.stroke();

  // Hologram scan contours.
  ctx.globalCompositeOperation = "destination-out";
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 3;
  for (let y = frameY + 34; y <= frameY + frameH - 24; y += 22) {
    ctx.beginPath();
    ctx.moveTo(frameX + 22, y);
    ctx.bezierCurveTo(frameX + frameW * 0.34, y + 10, frameX + frameW * 0.66, y - 10, frameX + frameW - 22, y);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  const image = ctx.getImageData(0, 0, width, height).data;
  const candidates: [number, number, number][] = [];

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const alpha = image[(y * width + x) * 4 + 3];
      if (alpha > 38) {
        const weight = alpha > 220 ? 6 : alpha > 150 ? 3 : 1;
        for (let i = 0; i < weight; i++) {
          candidates.push([x, y, alpha / 255]);
        }
      }
    }
  }

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const normals = new Float32Array(PARTICLE_COUNT * 3);
  const seeds = new Float32Array(PARTICLE_COUNT);
  const aspect = width / height;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const seed = seeded(i * 1.618);
    const candidate = candidates[Math.floor(seed * candidates.length)] ?? [width / 2, height / 2, 1];
    const jitterX = (seeded(seed + 1.3) - 0.5) * 2.2;
    const jitterY = (seeded(seed + 2.7) - 0.5) * 2.2;
    const px = candidate[0] + jitterX;
    const py = candidate[1] + jitterY;
    const normalizedY = py / height;
    const alphaWeight = candidate[2];
    const layer = seeded(seed + 9.1);
    const side = layer < 0.5 ? -1 : 1;
    const depthBias =
      normalizedY < 0.22 ? 0.18 :
      normalizedY > 0.76 ? 0.28 :
      normalizedY > 0.58 ? 0.42 :
      0.34;
    const depth = (0.04 + seeded(seed + 4.4) * depthBias + alphaWeight * 0.08) * side;
    const x = (px / width - 0.5) * 2.35 * aspect;
    const y = (0.5 - py / height) * 2.28;
    const z = depth + Math.sin(x * 1.8 + y * 2.5) * 0.025;
    const b = i * 3;

    positions[b] = x;
    positions[b + 1] = y;
    positions[b + 2] = z;

    const normal = new THREE.Vector3(x * 0.10, y * 0.09, side + alphaWeight * 0.24).normalize();
    normals[b] = normal.x;
    normals[b + 1] = normal.y;
    normals[b + 2] = normal.z;
    seeds[i] = seed;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aBase", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aNormal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.computeBoundingSphere();

  return geometry;
}

export default function HologramCodeFigure({ className = "" }: HologramCodeFigureProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let raf = 0;
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0xffffff, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 20);
    camera.position.set(0, 0.02, 6.4);

    const group = new THREE.Group();
    group.rotation.y = -0.24;
    group.rotation.x = -0.05;
    scene.add(group);

    const geometry = buildCodePointCloud();
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uPointScale: { value: 3.6 },
        uMouseActive: { value: 0 },
        uMouseEnergy: { value: 0 },
        uMouse: { value: new THREE.Vector3(999, 999, 999) },
        uMouseVel: { value: new THREE.Vector3() },
        uBlue: { value: new THREE.Color("#3279F9") },
      },
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    group.add(points);

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const hitPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hitWorld = new THREE.Vector3();
    const hitLocal = new THREE.Vector3();
    const targetMouse = new THREE.Vector3(999, 999, 999);
    const smoothMouse = new THREE.Vector3(999, 999, 999);
    const previousMouse = new THREE.Vector3(999, 999, 999);
    const mouseVel = new THREE.Vector3();
    let pointerActive = false;
    let pointerInitialized = false;
    let dragging = false;
    let lastDragX = 0;
    let lastDragY = 0;
    let yawOffset = 0;
    let pitchOffset = 0;
    let targetYawOffset = 0;
    let targetPitchOffset = 0;
    let mouseEnergy = 0;

    const isInsideHost = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    };

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      if (!isInsideHost(clientX, clientY) && !dragging) {
        pointerActive = false;
        return;
      }

      pointerNdc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointerNdc, camera);
      hitPlane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(hitPlane.normal),
        group.getWorldPosition(hitWorld),
      );

      if (raycaster.ray.intersectPlane(hitPlane, hitWorld)) {
        hitLocal.copy(hitWorld);
        group.worldToLocal(hitLocal);
        targetMouse.copy(hitLocal);

        if (!pointerInitialized) {
          smoothMouse.copy(hitLocal);
          previousMouse.copy(hitLocal);
          pointerInitialized = true;
        }
      }

      pointerActive = true;
    };

    const onPointerMove = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY);

      if (dragging) {
        const dx = event.clientX - lastDragX;
        const dy = event.clientY - lastDragY;
        lastDragX = event.clientX;
        lastDragY = event.clientY;

        targetYawOffset += dx * 0.008;
        targetPitchOffset += dy * 0.005;
        targetPitchOffset = THREE.MathUtils.clamp(targetPitchOffset, -0.38, 0.38);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!isInsideHost(event.clientX, event.clientY)) return;
      dragging = true;
      pointerActive = true;
      lastDragX = event.clientX;
      lastDragY = event.clientY;
      updatePointer(event.clientX, event.clientY);
    };

    const onPointerUp = () => {
      dragging = false;
    };

    const onPointerLeave = () => {
      pointerActive = false;
      dragging = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    const onResize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = dpr;
      material.uniforms.uPointScale.value = width < 520 ? 2.7 : 3.25;
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(host);
    onResize();

    const clock = new THREE.Clock();
    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      material.uniforms.uTime.value = elapsed;

      if (pointerInitialized) {
        const lerpAlpha = 1 - Math.exp(-9 * delta);
        smoothMouse.lerp(targetMouse, lerpAlpha);
        mouseVel.subVectors(smoothMouse, previousMouse).divideScalar(Math.max(delta, 0.001));
        mouseVel.clampLength(0, 5.5);
        previousMouse.copy(smoothMouse);
        material.uniforms.uMouse.value.copy(smoothMouse);
        material.uniforms.uMouseVel.value.copy(mouseVel);
      }

      const movementEnergy = pointerActive ? Math.min(0.35 + mouseVel.length() / 3.2, 1.8) : 0;
      mouseEnergy += (movementEnergy - mouseEnergy) * (1 - Math.exp(-(pointerActive ? 8.5 : 4.5) * delta));
      material.uniforms.uMouseActive.value = pointerActive ? 1 : 0;
      material.uniforms.uMouseEnergy.value = mouseEnergy;

      const pointerTilt = pointerActive ? THREE.MathUtils.clamp(pointerNdc.x, -1, 1) * 0.065 : 0;
      yawOffset += (targetYawOffset - yawOffset) * (1 - Math.exp(-9 * delta));
      pitchOffset += (targetPitchOffset - pitchOffset) * (1 - Math.exp(-9 * delta));
      group.rotation.y = -0.24 + yawOffset + Math.sin(elapsed * 0.42) * 0.040 + pointerTilt;
      group.rotation.x = -0.05 + pitchOffset + Math.sin(elapsed * 0.31) * 0.018 + (pointerActive ? pointerNdc.y * 0.030 : 0);
      group.position.y = Math.sin(elapsed * 0.72) * 0.018;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden />;
}
