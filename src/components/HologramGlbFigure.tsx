"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

type HologramGlbFigureProps = {
  className?: string;
  url?: string;
  baseRotationX?: number;
  baseRotationY?: number;
  baseRotationZ?: number;
};

const PARTICLE_COUNT = 60000;

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
  float pulse = sin(uTime * 1.15 + aSeed * 6.28318) * 0.020;
  vec3 p = aBase + aNormal * pulse;

  vec3 toParticle = aBase - uMouse;
  float mouseDist = length(toParticle);
  float falloff = clamp(1.0 - mouseDist / 1.05, 0.0, 1.0);
  falloff = falloff * falloff * uMouseActive;
  vec3 pushDir = normalize(toParticle + aNormal * 0.45 + vec3(0.0001));
  vec3 velDir = normalize(uMouseVel + vec3(0.0001));
  vec3 scatter = normalize(vec3(
    sin(aSeed * 127.1),
    cos(aSeed * 311.7),
    sin(aSeed * 74.3 + 1.0)
  ));
  p += pushDir * falloff * (0.24 + uMouseEnergy * 0.22);
  p += velDir * falloff * uMouseEnergy * 0.14;
  p += scatter * falloff * uMouseEnergy * 0.055;

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float depthScale = clamp(2.7 / -mvPosition.z, 0.55, 2.2);
  gl_PointSize = uPointScale * uPixelRatio * depthScale * (0.82 + hash(aSeed + 2.7) * 0.55);

  vec3 lightA = normalize(vec3(-0.65, 0.50, 0.70));
  vec3 lightB = normalize(vec3(0.25, -0.20, 0.95));
  float wrapA = dot(normalize(aNormal), lightA) * 0.5 + 0.5;
  float wrapB = dot(normalize(aNormal), lightB) * 0.5 + 0.5;
  vShade = clamp(0.28 + wrapA * 0.52 + wrapB * 0.22, 0.0, 1.0);

  float contour = aBase.y * 11.5 + sin(aBase.x * 7.0 + aBase.z * 2.2) * 0.23;
  float f = abs(fract(contour) - 0.5);
  vStripe = smoothstep(0.42, 0.50, f);
  vSeed = aSeed;
  vMouseGlow = clamp(falloff * (0.55 + uMouseEnergy * 1.85), 0.0, 1.0);
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
  float flicker = 0.82 + 0.18 * sin(uTime * 1.15 + vSeed * 19.0);
  float blueHit = step(0.78, hash(vSeed + 4.3));
  vec3 grey = vec3(0.18 + vShade * 0.72);
  vec3 lineColor = mix(grey, uBlue, 0.62 + blueHit * 0.22);
  vec3 color = mix(grey, lineColor, clamp(vStripe + blueHit * 0.32, 0.0, 1.0));
  color = mix(color, vec3(0.92, 0.97, 1.0), vMouseGlow * 0.88);
  color = mix(color, uBlue, vMouseGlow * 0.38);
  float alpha = disk * flicker * (0.18 + vShade * 0.56 + vStripe * 0.32 + vMouseGlow * 0.72);

  gl_FragColor = vec4(color, alpha);
}
`;

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function normalizeScene(scene: THREE.Object3D) {
  scene.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  const size   = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale  = maxDim > 0 ? 2.1 / maxDim : 1;

  // worldPos = scale*v + position  →  set position = -center*scale
  // so that the center vertex lands exactly at the origin.
  scene.scale.setScalar(scale);
  scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  scene.updateMatrixWorld(true);
}

async function buildPointCloud(url: string) {
  const gltf = await new GLTFLoader().loadAsync(url);
  normalizeScene(gltf.scene);

  const meshes: THREE.Mesh[] = [];
  gltf.scene.traverse((child) => {
    const m = child as THREE.Mesh;
    if (m.isMesh && m.geometry?.attributes?.position) meshes.push(m);
  });
  if (meshes.length === 0) throw new Error(`No meshes in ${url}`);

  // Clone + applyMatrix4 is a native Three.js bulk op (fast).
  // We merge everything into one indexed geometry and use a single sampler
  // so area-weighted distribution works correctly across all 313 meshes.
  const clones: THREE.BufferGeometry[] = [];
  let totalV = 0, totalI = 0;

  for (const mesh of meshes) {
    const g = mesh.geometry.clone();
    g.applyMatrix4(mesh.matrixWorld);           // world-space positions + normals
    if (!g.attributes.normal) g.computeVertexNormals();
    clones.push(g);
    totalV += g.attributes.position.count;
    totalI += g.index ? g.index.count : g.attributes.position.count;
  }

  const mPos  = new Float32Array(totalV * 3);
  const mNorm = new Float32Array(totalV * 3);
  const mIdx  = new Uint32Array(totalI);        // Uint32 avoids overflow for 278K+ verts
  let vOff = 0, iOff = 0;

  for (const g of clones) {
    const vc   = g.attributes.position.count;
    const posA = g.attributes.position;                    // BufferAttribute or InterleavedBufferAttribute
    const normA = (g.attributes.normal ?? null) as typeof posA | null;

    // getX/Y/Z is safe for both regular and interleaved buffer attributes.
    // (set() on .array would copy the whole interleaved buffer — wrong data / RangeError)
    for (let i = 0; i < vc; i++) {
      const b = (vOff + i) * 3;
      mPos[b]     = posA.getX(i);
      mPos[b + 1] = posA.getY(i);
      mPos[b + 2] = posA.getZ(i);
      if (normA) {
        mNorm[b]     = normA.getX(i);
        mNorm[b + 1] = normA.getY(i);
        mNorm[b + 2] = normA.getZ(i);
      } else {
        mNorm[b + 1] = 1; // default up
      }
    }

    if (g.index) {
      const src = g.index.array;
      for (let i = 0; i < src.length; i++) mIdx[iOff + i] = (src[i] as number) + vOff;
      iOff += src.length;
    } else {
      for (let i = 0; i < vc; i++) mIdx[iOff + i] = vOff + i;
      iOff += vc;
    }
    vOff += vc;
    g.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(mPos,  3));
  merged.setAttribute("normal",   new THREE.BufferAttribute(mNorm, 3));
  merged.setIndex(new THREE.BufferAttribute(mIdx, 1));

  const sampler = new MeshSurfaceSampler(new THREE.Mesh(merged)).build();
  merged.dispose();

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const normals   = new Float32Array(PARTICLE_COUNT * 3);
  const seeds     = new Float32Array(PARTICLE_COUNT);
  const tp = new THREE.Vector3();
  const tn = new THREE.Vector3();

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    sampler.sample(tp, tn);
    const b    = i * 3;
    const seed = seeded(i * 1.618033);
    positions[b]     = tp.x + (seeded(seed + 1) - 0.5) * 0.006;
    positions[b + 1] = tp.y + (seeded(seed + 2) - 0.5) * 0.006;
    positions[b + 2] = tp.z + (seeded(seed + 3) - 0.5) * 0.006;
    normals[b]       = tn.x;
    normals[b + 1]   = tn.y;
    normals[b + 2]   = tn.z;
    seeds[i] = seed;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aBase",    new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aNormal",  new THREE.BufferAttribute(normals,   3));
  geometry.setAttribute("aSeed",    new THREE.BufferAttribute(seeds,     1));
  geometry.computeBoundingSphere();

  return geometry;
}

export default function HologramGlbFigure({
  className = "",
  url = "/base_basic_shaded.glb",
  baseRotationX = 0,
  baseRotationY = -Math.PI / 2,
  baseRotationZ = 0,
}: HologramGlbFigureProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let raf = 0;
    let geometry: THREE.BufferGeometry | null = null;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0xffffff, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
    camera.position.set(0, 0.05, 4.6);

    const group = new THREE.Group();
    // 'YXZ' order: Y rotation (auto-spin) applies first around world Y,
    // then X and Z apply the model's display orientation — prevents the
    // "spinning in circles" gimbal artefact when baseRotationX ≈ -π/2.
    group.rotation.order = "YXZ";
    group.rotation.x = baseRotationX;
    group.rotation.y = baseRotationY;
    group.rotation.z = baseRotationZ;
    scene.add(group);

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
        uPointScale: { value: 3.8 },
        uMouseActive: { value: 0 },
        uMouseEnergy: { value: 0 },
        uMouse: { value: new THREE.Vector3(999, 999, 999) },
        uMouseVel: { value: new THREE.Vector3() },
        uBlue: { value: new THREE.Color("#24D6BC") },
      },
    });

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
    let mouseEnergy = 0;

    const isInsideHost = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    };

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      if (!isInsideHost(clientX, clientY)) {
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
    };

    const onPointerLeave = () => {
      pointerActive = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    const onResize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = dpr;
      material.uniforms.uPointScale.value = width < 520 ? 3.0 : 3.8;
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(host);
    onResize();

    buildPointCloud(url).then((pointGeometry) => {
      if (disposed) {
        pointGeometry.dispose();
        return;
      }

      geometry = pointGeometry;
      const points = new THREE.Points(pointGeometry, material);
      points.frustumCulled = false;
      group.add(points);
    }).catch((error) => {
      console.error(error);
    });

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

      // Slow continuous auto-rotation (~42 s per full turn) with subtle wobble
      group.rotation.x = baseRotationX + Math.sin(elapsed * 0.31) * 0.018;
      group.rotation.y = baseRotationY + elapsed * 0.15;
      group.rotation.z = baseRotationZ;
      group.position.y = Math.sin(elapsed * 0.72) * 0.018;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      geometry?.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [url, baseRotationX, baseRotationY, baseRotationZ]);

  return <div ref={hostRef} className={className} aria-hidden />;
}
