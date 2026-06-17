"use client";

import { Canvas, useFrame } from "@react-three/fiber"
import { useReducedMotion } from "framer-motion"
import { folder, useControls } from "leva"
import { useEffect, useMemo, useRef, type RefObject } from "react"
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  NormalBlending,
  Points,
  ShaderMaterial,
} from "three"

type NebulaParticle = {
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  opacity: number;
  softness: number;
  sharpness: number;
  phase: number;
  hueSeed: number;
  bandSeed: number;
  edgeSeed: number;
  armSeed: number;
};

type MotionState = {
  offsetX: Float32Array;
  offsetY: Float32Array;
  offsetZ: Float32Array;
  velocityX: Float32Array;
  velocityY: Float32Array;
  velocityZ: Float32Array;
};

type Controls = {
  particleCount: number;
  nebulaRadius: number;
  bandWobble: number;
  filaments: number;
  detailJitter: number;
  depth: number;
  pointerStrength: number;
  pointerRadius: number;
  pointerLerp: number;
  rotationStrength: number;
  rotationLerp: number;
  driftAmount: number;
  driftSpeed: number;
  autoSpin: number;
  autoSpinSpeed: number;
  pointSize: number;
  pointSizeVariance: number;
  sizeEdgeBoost: number;
  iridescence: number;
  opacity: number;
  colorShift: number;
  glow: number;
};

const DEFAULT_CONTROLS: Controls = {
  particleCount: 26000,
  nebulaRadius: 6.4,
  bandWobble: 0.14,
  filaments: 0.28,
  detailJitter: 0.04,
  depth: 0.38,
  pointerStrength: 0.52,
  pointerRadius: 0.18,
  pointerLerp: 0.08,
  rotationStrength: 0.52,
  rotationLerp: 0.08,
  driftAmount: 0.12,
  driftSpeed: 0.34,
  autoSpin: 0.06,
  autoSpinSpeed: 0.38,
  pointSize: 0.18,
  pointSizeVariance: 0.08,
  sizeEdgeBoost: 0.14,
  iridescence: 0.34,
  opacity: 0.92,
  colorShift: 0.16,
  glow: 0.08,
};

const TAU = Math.PI * 2;
const BASE_POINTER = { x: 0.18, y: -0.08 };
const FIELD_WIDTH = 7.8;
const FIELD_HEIGHT = 4.8;

const BRAND = new Color("#171717");
const ACCENT = new Color("#bbbbbb");
const ACCENT_2 = new Color("#474747");

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function hash01(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function hashSigned(seed: number) {
  return hash01(seed) * 2 - 1;
}

function gaussian(seed: number) {
  const u1 = Math.max(0.0001, hash01(seed));
  const u2 = hash01(seed + 17.17);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(TAU * u2);
}

function createMotionState(length: number): MotionState {
  return {
    offsetX: new Float32Array(length),
    offsetY: new Float32Array(length),
    offsetZ: new Float32Array(length),
    velocityX: new Float32Array(length),
    velocityY: new Float32Array(length),
    velocityZ: new Float32Array(length),
  };
}

function buildParticles(controls: Controls) {
  const particles: NebulaParticle[] = [];
  const particleCount = Math.max(700, Math.floor(controls.particleCount));
  const cloudCenters = [
    { x: -1.75, y: 0.45, rx: 1.1, ry: 0.78 },
    { x: -0.35, y: -0.2, rx: 1.35, ry: 0.95 },
    { x: 0.95, y: 0.35, rx: 1.12, ry: 0.78 },
    { x: 0.15, y: 1.0, rx: 0.92, ry: 0.72 },
    { x: 1.7, y: -0.55, rx: 0.84, ry: 0.68 },
  ];
  const spread = 0.68 + controls.nebulaRadius * 0.03;

  for (let index = 0; index < particleCount; index += 1) {
    const seedA = hash01(index * 1.71 + 1.1);
    const seedB = hash01(index * 2.37 + 7.4);
    const seedC = hash01(index * 3.13 + 13.3);
    const seedD = hash01(index * 4.21 + 29.7);
    const seedE = hash01(index * 5.19 + 41.9);

    const centerIndex = Math.floor(seedA * cloudCenters.length) % cloudCenters.length;
    const center = cloudCenters[centerIndex];
    const major = center.rx * spread;
    const minor = center.ry * spread;
    const clumpOffsetX = gaussian(index * 0.57 + 9.3) * 0.44;
    const clumpOffsetY = gaussian(index * 0.63 + 17.9) * 0.32;
    const clumpCenterX = center.x + clumpOffsetX;
    const clumpCenterY = center.y + clumpOffsetY;
    const clumpRadiusX = major * (0.38 + seedD * 0.26);
    const clumpRadiusY = minor * (0.36 + seedE * 0.24);
    const clumpField = Math.exp(
      -(
        ((seedB - 0.5) * (seedB - 0.5)) / Math.max(0.08, clumpRadiusX * clumpRadiusX) +
        ((seedC - 0.5) * (seedC - 0.5)) / Math.max(0.08, clumpRadiusY * clumpRadiusY)
      ) * 8.5
    );
    const hotspot = Math.min(
      1,
      clumpField * 1.35 + Math.exp(-((seedA - 0.5) * (seedA - 0.5)) * 8.0) * 0.65
    );
    const density = Math.min(
      1,
      Math.exp(-((seedB - 0.5) * (seedB - 0.5)) * 2.4) +
        Math.exp(-(((seedC - 0.5) * (seedC - 0.5)) + ((seedD - 0.5) * (seedD - 0.5))) * 2.1) * 0.75
    );
    const opacity = Math.min(1, 0.48 + density * 0.24 + clumpField * 0.16 + hotspot * 0.18);
    const softness = Math.min(1, 0.16 + density * 0.08 + seedD * 0.05);
    const sharpness = Math.min(1, 0.42 + hotspot * 0.36 + (1 - softness) * 0.18);

    const x =
      clumpCenterX +
      gaussian(index * 0.97 + 0.31) * major +
      hashSigned(index * 0.83) * controls.detailJitter * 1.1;
    const y =
      clumpCenterY +
      gaussian(index * 1.21 + 4.17) * minor +
      hashSigned(index * 1.27 + 1.9) * controls.detailJitter * 0.9;
    const z =
      gaussian(index * 1.53 + 8.73) * controls.depth * 0.28 +
      Math.sin(seedD * TAU + seedA * 2.4) * controls.depth * 0.08;

    const waveX =
      Math.sin(y * (0.72 + controls.filaments * 0.2) + seedC * TAU) *
      controls.filaments *
      (0.8 + density * 0.9);
    const size =
      controls.pointSize +
      seedC * controls.pointSizeVariance +
      density * controls.sizeEdgeBoost * 0.016 +
      Math.max(0, 0.014 - Math.abs(z) * 0.008);

    particles.push({
      baseX: x,
      baseY: y,
      baseZ: z,
      size: Math.max(0.01, size),
      phase: seedB * TAU + seedE * 3.1,
      hueSeed: seedA,
      bandSeed: density,
      edgeSeed: density,
      armSeed: waveX,
      opacity,
      softness,
      sharpness,
    });
  }

  return particles;
}

function NebulaPlane({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const groupRef = useRef<Group>(null);
  const pointsRef = useRef<Points>(null);
  const mistPointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const mistMaterialRef = useRef<ShaderMaterial>(null);
  const target = useRef({ x: BASE_POINTER.x, y: BASE_POINTER.y });
  const previousTarget = useRef({ x: BASE_POINTER.x, y: BASE_POINTER.y });
  const rotation = useRef({ x: 0.08, y: -0.12, z: 0.04 });
  const motionStateRef = useRef<MotionState>(createMotionState(DEFAULT_CONTROLS.particleCount));

  const controls = useControls({
    layout: folder({
      particleCount: { value: DEFAULT_CONTROLS.particleCount, min: 700, max: 30000, step: 100 },
      nebulaRadius: { value: DEFAULT_CONTROLS.nebulaRadius, min: 1.4, max: 8.5, step: 0.01 },
      bandWobble: { value: DEFAULT_CONTROLS.bandWobble, min: 0, max: 0.55, step: 0.01 },
      filaments: { value: DEFAULT_CONTROLS.filaments, min: 0, max: 0.8, step: 0.01 },
      detailJitter: { value: DEFAULT_CONTROLS.detailJitter, min: 0, max: 0.25, step: 0.005 },
      depth: { value: DEFAULT_CONTROLS.depth, min: 0, max: 0.8, step: 0.01 },
    }),
    motion: folder({
      pointerStrength: { value: DEFAULT_CONTROLS.pointerStrength, min: 0, max: 2, step: 0.01 },
      pointerRadius: { value: DEFAULT_CONTROLS.pointerRadius, min: 0.05, max: 1.4, step: 0.01 },
      pointerLerp: { value: DEFAULT_CONTROLS.pointerLerp, min: 0.01, max: 0.25, step: 0.005 },
      rotationStrength: { value: DEFAULT_CONTROLS.rotationStrength, min: 0, max: 1.5, step: 0.01 },
      rotationLerp: { value: DEFAULT_CONTROLS.rotationLerp, min: 0.01, max: 0.25, step: 0.005 },
      driftAmount: { value: DEFAULT_CONTROLS.driftAmount, min: 0, max: 0.35, step: 0.005 },
      driftSpeed: { value: DEFAULT_CONTROLS.driftSpeed, min: 0.05, max: 1.2, step: 0.01 },
      autoSpin: { value: DEFAULT_CONTROLS.autoSpin, min: 0, max: 0.4, step: 0.01 },
      autoSpinSpeed: { value: DEFAULT_CONTROLS.autoSpinSpeed, min: 0.1, max: 1.8, step: 0.01 },
    }),
    appearance: folder({
      pointSize: { value: DEFAULT_CONTROLS.pointSize, min: 0.05, max: 0.34, step: 0.005 },
      pointSizeVariance: { value: DEFAULT_CONTROLS.pointSizeVariance, min: 0, max: 0.24, step: 0.005 },
      sizeEdgeBoost: { value: DEFAULT_CONTROLS.sizeEdgeBoost, min: 0, max: 1.4, step: 0.01 },
      iridescence: { value: DEFAULT_CONTROLS.iridescence, min: 0, max: 1, step: 0.01 },
      opacity: { value: DEFAULT_CONTROLS.opacity, min: 0.2, max: 1, step: 0.01 },
      colorShift: { value: DEFAULT_CONTROLS.colorShift, min: 0, max: 1, step: 0.01 },
      glow: { value: DEFAULT_CONTROLS.glow, min: 0, max: 1, step: 0.01 },
    }),
  }) as Controls;

  const resolvedControls = useMemo(
    () => ({ ...DEFAULT_CONTROLS, ...controls }),
    [controls]
  );

  const particles = useMemo(
    () => buildParticles(resolvedControls),
    [resolvedControls]
  );

  useEffect(() => {
    motionStateRef.current = createMotionState(particles.length);
  }, [particles.length]);

  const geometry = useMemo(() => {
    const positionArray = new Float32Array(particles.length * 3);
    const colorArray = new Float32Array(particles.length * 3);
    const sizeArray = new Float32Array(particles.length);
    const opacityArray = new Float32Array(particles.length);
    const softnessArray = new Float32Array(particles.length);
    const sharpnessArray = new Float32Array(particles.length);

    const nextGeometry = new BufferGeometry();
    nextGeometry.setAttribute("position", new BufferAttribute(positionArray, 3));
    nextGeometry.setAttribute("color", new BufferAttribute(colorArray, 3));
    nextGeometry.setAttribute("aSize", new BufferAttribute(sizeArray, 1));
    nextGeometry.setAttribute("aOpacity", new BufferAttribute(opacityArray, 1));
    nextGeometry.setAttribute("aSoftness", new BufferAttribute(softnessArray, 1));
    nextGeometry.setAttribute("aSharpness", new BufferAttribute(sharpnessArray, 1));

    return nextGeometry;
  }, [particles.length]);

  const vertexShader = useMemo(
    () => `
      attribute float aSize;
      attribute float aOpacity;
      attribute float aSoftness;
      attribute float aSharpness;
      varying vec3 vColor;
      varying float vEdge;
      varying float vDepth;
      varying float vOpacity;
      varying float vSoftness;
      varying float vSharpness;

      uniform float uPixelRatio;
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;

      void main() {
        vColor = color;
        vEdge = clamp(length(position.xy) / 4.4, 0.0, 1.0);
        vDepth = clamp((position.z + 0.4) / 0.8, 0.0, 1.0);
        vOpacity = aOpacity;
        vSoftness = aSoftness;
        vSharpness = aSharpness;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float perspective = 240.0 / max(2.6, -mvPosition.z);
        float flicker = 0.98 + sin(uTime * 0.18 + vEdge * 4.0) * 0.01;
        float mistScale = mix(1.08, 0.9, vSoftness) * mix(0.96, 1.08, vSharpness);
        gl_PointSize = aSize * uPixelRatio * perspective * flicker * mistScale;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    []
  );

  const fragmentShader = useMemo(
    () => `
      varying vec3 vColor;
      varying float vEdge;
      varying float vDepth;
      varying float vOpacity;
      varying float vSoftness;
      varying float vSharpness;

      uniform float uTime;
      uniform float uOpacity;
      uniform float uIridescence;
      uniform float uColorShift;
      uniform float uGlow;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;

      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float dist = length(uv);
        float core = smoothstep(0.28, 0.0, dist);
        float haze = smoothstep(0.76, 0.04, dist);
        float bloom = smoothstep(0.58, 0.0, dist);
        float alpha = ((core * 0.5) + (haze * 0.1) + (bloom * 0.04)) * uOpacity * (0.88 + vDepth * 0.12) * vOpacity * (0.9 + vSharpness * 0.18);

        float hueA = 0.5 + 0.5 * sin(uTime * 0.24 + vEdge * 5.0 + uColorShift * 1.4);
        float hueB = 0.5 + 0.5 * cos(uTime * 0.19 + vDepth * 4.2 + uColorShift * 1.1);
        vec3 iridescent = mix(uColorA, uColorB, hueA);
        iridescent = mix(iridescent, uColorC, hueB * 0.24);

        vec3 finalColor = mix(vColor, iridescent, uIridescence);
        finalColor = mix(finalColor, vec3(0.96, 0.98, 1.0), core * 0.26);
        finalColor = mix(finalColor, vec3(0.08, 0.16, 0.24), 0.08 - vSoftness * 0.02);
        finalColor += mix(vec3(0.05, 0.14, 0.2), vec3(0.12, 0.36, 0.5), haze) * uGlow * 0.18;
        finalColor += iridescent * bloom * uGlow * 0.08;

        if (alpha < 0.01) discard;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    []
  );

  const mistVertexShader = useMemo(
    () => `
      attribute float aSize;
      attribute float aOpacity;
      attribute float aSoftness;
      attribute float aSharpness;
      varying vec3 vColor;
      varying float vDepth;
      varying float vOpacity;
      varying float vSoftness;
      varying float vSharpness;

      uniform float uPixelRatio;
      uniform float uTime;

      void main() {
        vColor = color;
        vDepth = clamp((position.z + 0.4) / 0.8, 0.0, 1.0);
        vOpacity = aOpacity;
        vSoftness = aSoftness;
        vSharpness = aSharpness;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float perspective = 250.0 / max(2.4, -mvPosition.z);
        float drift = 1.0 + sin(uTime * 0.06 + aOpacity * 6.0) * 0.004;
        gl_PointSize = aSize * uPixelRatio * perspective * drift * mix(1.18, 1.72, vSoftness) * mix(0.98, 1.1, vSharpness);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    []
  );

  const mistFragmentShader = useMemo(
    () => `
      varying vec3 vColor;
      varying float vDepth;
      varying float vOpacity;
      varying float vSoftness;
      varying float vSharpness;

      uniform float uTime;
      uniform float uOpacity;
      uniform float uGlow;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;

      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float dist = length(uv);
        float cloud = smoothstep(0.92, 0.16, dist);
        float mist = smoothstep(0.76, 0.0, dist);
        float alpha = (cloud * 0.02 + mist * 0.04) * uOpacity * (0.78 + vDepth * 0.22) * vOpacity * (0.84 + vSoftness * 0.16) * (0.88 + vSharpness * 0.12);

        float hueA = 0.5 + 0.5 * sin(uTime * 0.14 + vDepth * 3.2);
        float hueB = 0.5 + 0.5 * cos(uTime * 0.11 + vSoftness * 4.1);
        vec3 wash = mix(uColorA, uColorB, hueA);
        wash = mix(wash, uColorC, hueB * 0.32);

        vec3 finalColor = mix(vColor, wash, 0.1);
        finalColor = mix(finalColor, vec3(0.06, 0.12, 0.18), 0.08);
        finalColor += mix(vec3(0.03, 0.08, 0.12), vec3(0.06, 0.18, 0.26), mist) * uGlow * 0.08 * (0.9 + vSharpness * 0.2);

        if (alpha < 0.005) discard;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    []
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) {
        previousTarget.current.x = target.current.x;
        previousTarget.current.y = target.current.y;
        target.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
        target.current.y = (event.clientY / window.innerHeight - 0.5) * -2;
        return;
      }

      const localX = (event.clientX - bounds.left) / bounds.width;
      const localY = (event.clientY - bounds.top) / bounds.height;

      previousTarget.current.x = target.current.x;
      previousTarget.current.y = target.current.y;
      target.current.x = (Math.min(1, Math.max(0, localX)) - 0.5) * 2;
      target.current.y = (Math.min(1, Math.max(0, localY)) - 0.5) * -2;
    };

    const handlePointerLeave = () => {
      target.current.x = BASE_POINTER.x;
      target.current.y = BASE_POINTER.y;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
    };
    // The ref object is stable for the lifetime of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    const motionXRaw = target.current.x - previousTarget.current.x;
    const motionYRaw = target.current.y - previousTarget.current.y;
    const motionLength = Math.max(0.0001, Math.sqrt(motionXRaw * motionXRaw + motionYRaw * motionYRaw));
    const motionX = motionXRaw / motionLength;
    const motionY = motionYRaw / motionLength;
    const motionStrength = Math.min(1, motionLength * 3.5);

    const autoPhase = elapsed * resolvedControls.autoSpinSpeed;
    const desiredRotationZ = Math.sin(autoPhase) * resolvedControls.autoSpin * 0.08;
    rotation.current.z = lerp(rotation.current.z, desiredRotationZ, resolvedControls.rotationLerp * 0.35);

    if (groupRef.current) {
      groupRef.current.rotation.x = 0;
      groupRef.current.rotation.y = 0;
      groupRef.current.rotation.z = rotation.current.z;
      groupRef.current.position.x = 0;
      groupRef.current.position.y = 0;
      groupRef.current.position.z = 0;
    }

    const positionAttribute = geometry.getAttribute("position") as BufferAttribute;
    const colorAttribute = geometry.getAttribute("color") as BufferAttribute;
    const sizeAttribute = geometry.getAttribute("aSize") as BufferAttribute;
    const opacityAttribute = geometry.getAttribute("aOpacity") as BufferAttribute;
    const softnessAttribute = geometry.getAttribute("aSoftness") as BufferAttribute;
    const sharpnessAttribute = geometry.getAttribute("aSharpness") as BufferAttribute;

    const pointerRadius = Math.max(0.2, resolvedControls.pointerRadius);
    const pointerX = lerp(-FIELD_WIDTH * 0.5, FIELD_WIDTH * 0.5, (target.current.x + 1) * 0.5);
    const pointerY = lerp(-FIELD_HEIGHT * 0.5, FIELD_HEIGHT * 0.5, (target.current.y + 1) * 0.5);
    const impactX = pointerX;
    const impactY = pointerY;

    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];
      const baseX = particle.baseX;
      const baseY = particle.baseY;
      const rx = baseX - impactX;
      const ry = baseY - impactY;
      const along = rx * motionX + ry * motionY;
      const perp = -rx * motionY + ry * motionX;
      const sideRadius = Math.max(0.035, pointerRadius * 0.24);
      const longRadius = Math.max(0.06, pointerRadius * (0.65 + motionStrength * 0.18));
      const influence = Math.exp(-((perp * perp) / (sideRadius * sideRadius) + (along * along) / (longRadius * longRadius)));
      const activeInfluence = Math.max(0, influence - 0.18) / 0.82;
      const push = resolvedControls.pointerStrength * activeInfluence;
      const pushX = motionX * push;
      const pushY = motionY * push;
      const pushZ = push * 0.0002;

      const floatTargetX = Math.sin(elapsed * (0.22 + particle.hueSeed * 0.1) + particle.phase) * (0.14 + particle.bandSeed * 0.14);
      const floatTargetY = Math.cos(elapsed * (0.19 + particle.bandSeed * 0.11) + particle.phase * 0.8) * (0.13 + particle.edgeSeed * 0.13);
      const floatTargetZ = Math.sin(elapsed * (0.13 + particle.edgeSeed * 0.09) + particle.phase * 1.15) * (0.018 + particle.armSeed * 0.028);

      const motionState = motionStateRef.current;

      const offsetX = motionState.offsetX[index];
      const offsetY = motionState.offsetY[index];
      const offsetZ = motionState.offsetZ[index];

      motionState.velocityX[index] += (floatTargetX - offsetX) * 0.02 + pushX * 0.12;
      motionState.velocityY[index] += (floatTargetY - offsetY) * 0.02 + pushY * 0.12;
      motionState.velocityZ[index] += (floatTargetZ - offsetZ) * 0.014 + pushZ;

      motionState.velocityX[index] *= 0.905;
      motionState.velocityY[index] *= 0.905;
      motionState.velocityZ[index] *= 0.86;

      motionState.offsetX[index] = offsetX + motionState.velocityX[index];
      motionState.offsetY[index] = offsetY + motionState.velocityY[index];
      motionState.offsetZ[index] = offsetZ + motionState.velocityZ[index];

      motionState.offsetX[index] *= 0.996;
      motionState.offsetY[index] *= 0.996;
      motionState.offsetZ[index] *= 0.9985;

      const px = baseX + motionState.offsetX[index];
      const py = baseY + motionState.offsetY[index];
      const pz = particle.baseZ + motionState.offsetZ[index];

      const offset = index * 3;
      positionAttribute.array[offset] = px;
      positionAttribute.array[offset + 1] = py;
      positionAttribute.array[offset + 2] = pz;

      const edge = particle.edgeSeed;
      const band = particle.bandSeed;
      const colorBase = BRAND.clone().lerp(ACCENT, Math.min(1, band * 0.9 + 0.12));
      const accentBase = ACCENT.clone().lerp(ACCENT_2, Math.min(1, edge * 0.42 + band * 0.16));
      const finalBase = colorBase.clone().lerp(accentBase, 0.62 + edge * 0.14);

      colorAttribute.array[offset] = finalBase.r;
      colorAttribute.array[offset + 1] = finalBase.g;
      colorAttribute.array[offset + 2] = finalBase.b;

      sizeAttribute.array[index] = particle.size;
      opacityAttribute.array[index] = particle.opacity;
      softnessAttribute.array[index] = particle.softness;
      sharpnessAttribute.array[index] = particle.sharpness;
    }

    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
    sizeAttribute.needsUpdate = true;
    opacityAttribute.needsUpdate = true;
    softnessAttribute.needsUpdate = true;
    sharpnessAttribute.needsUpdate = true;

    if (pointsRef.current) {
      pointsRef.current.rotation.z = Math.sin(elapsed * 0.03) * 0.003;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uPixelRatio.value = state.viewport.dpr;
      materialRef.current.uniforms.uTime.value = elapsed;
      materialRef.current.uniforms.uOpacity.value = resolvedControls.opacity;
      materialRef.current.uniforms.uIridescence.value = resolvedControls.iridescence;
      materialRef.current.uniforms.uColorShift.value = resolvedControls.colorShift;
    }

    if (mistMaterialRef.current) {
      mistMaterialRef.current.uniforms.uPixelRatio.value = state.viewport.dpr;
      mistMaterialRef.current.uniforms.uTime.value = elapsed;
      mistMaterialRef.current.uniforms.uOpacity.value = resolvedControls.opacity * 0.72;
      mistMaterialRef.current.uniforms.uGlow.value = resolvedControls.glow * 0.82;
    }

    previousTarget.current.x = target.current.x;
    previousTarget.current.y = target.current.y;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          vertexColors
          blending={NormalBlending}
          uniforms={{
            uPixelRatio: { value: 1 },
            uTime: { value: 0 },
            uOpacity: { value: resolvedControls.opacity },
            uIridescence: { value: resolvedControls.iridescence },
            uColorShift: { value: resolvedControls.colorShift },
            uGlow: { value: resolvedControls.glow },
            uColorA: { value: BRAND },
            uColorB: { value: ACCENT },
            uColorC: { value: ACCENT_2 },
          }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </points>
      <points ref={mistPointsRef} geometry={geometry}>
        <shaderMaterial
          ref={mistMaterialRef}
          transparent
          depthWrite={false}
          vertexColors
          blending={AdditiveBlending}
          uniforms={{
            uPixelRatio: { value: 1 },
            uTime: { value: 0 },
            uOpacity: { value: resolvedControls.opacity * 0.28 },
            uGlow: { value: resolvedControls.glow * 0.38 },
            uColorA: { value: BRAND },
            uColorB: { value: ACCENT },
            uColorC: { value: ACCENT_2 },
          }}
          vertexShader={mistVertexShader}
          fragmentShader={mistFragmentShader}
        />
      </points>
    </group>
  );
}

export default function HeroSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute left-[54%] top-[10%] h-[34rem] w-[34rem] rounded-full opacity-45 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.42 0.17 272 / 0.12) 0%, transparent 68%)",
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <Canvas
          className="absolute inset-0 h-full w-full"
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 10], fov: 32 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          style={{ opacity: 0.92, touchAction: "none" }}
        >
          <NebulaPlane containerRef={containerRef} />
        </Canvas>
      </div>

    </>
  );
}
