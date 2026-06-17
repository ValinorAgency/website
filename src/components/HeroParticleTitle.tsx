"use client";

import { Canvas, useFrame, useThree, type GLProps } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { BufferAttribute, BufferGeometry, Color, NormalBlending, Vector2 } from "three";
import { PointsNodeMaterial, WebGPURenderer } from "three/webgpu";
import {
  attribute,
  clamp,
  distance,
  float,
  mix,
  positionLocal,
  sin,
  cos,
  uniform,
  vec3,
} from "three/tsl";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";

type HeroParticleTitleProps = {
  className?: string;
};

type ParticleGeometry = {
  geometry: BufferGeometry;
  count: number;
};

type ParticleSceneProps = {
  pointerRef: MutableRefObject<Vector2>;
  pointerActiveRef: MutableRefObject<boolean>;
};

const TITLE_LINES = ["Webs Profesionales", "a medida. /", "Agentes de AI", "personalizados."];

const TEXT_STEP = 1;
const MAX_PARTICLES = 32000;
const CLUSTER_POINTS = 10;
const CLUSTER_RADIUS = 1.05;
const TEXT_COLORS = [
  new Color("#101010"),
  new Color("#1b1b1b"),
  new Color("#242424"),
  new Color("#313131"),
  new Color("#454545"),
  new Color("#171717"),
];

const SHADER_UNIFORMS = {
  pointer: uniform(new Vector2(-9999, -9999)),
  pointerRadius: uniform(180),
  time: uniform(0),
  hiddenPointer: new Vector2(-9999, -9999),
};

function hash01(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createOffscreenContext(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create 2D context for title particles.");
  }

  return context;
}

function buildGeometry(width: number, height: number): ParticleGeometry {
  const context = createOffscreenContext(width, height);
  context.fillStyle = "#000";
  context.textAlign = "center";
  context.textBaseline = "middle";

  let titleSize = Math.max(50, Math.min(122, width * 0.105));
  const fontFamily = '"Arial Narrow", "Aptos Narrow", "Aptos", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  context.font = `600 ${titleSize}px ${fontFamily}`;

  const longestLineWidth = TITLE_LINES.reduce((longest, line) => {
    const current = context.measureText(line).width;
    return current > longest ? current : longest;
  }, 0);

  const safeWidth = width * 0.93;
  if (longestLineWidth > safeWidth) {
    const scale = safeWidth / longestLineWidth;
    titleSize = Math.max(44, Math.min(122, titleSize * scale));
    context.font = `600 ${titleSize}px ${fontFamily}`;
  }

  const lineWidths = TITLE_LINES.map((line) => context.measureText(line).width);
  const lineMetrics = TITLE_LINES.map((line) => {
    const metrics = context.measureText(line);
    const ascent = metrics.actualBoundingBoxAscent || titleSize * 0.72;
    const descent = metrics.actualBoundingBoxDescent || titleSize * 0.24;
    return {
      width: metrics.width,
      ascent,
      descent,
      height: ascent + descent,
    };
  });

  const totalLineWeight = lineWidths.reduce((total, lineWidth) => total + lineWidth, 0);
  const lineGap = Math.max(titleSize * 0.88, 34);
  const totalBlockHeight =
    lineMetrics.reduce((total, metric) => total + metric.height, 0) + lineGap * (TITLE_LINES.length - 1);

  const positions: number[] = [];
  const colors: number[] = [];
  const seeds: number[] = [];
  let seedIndex = 0;

  for (let index = 0; index < TITLE_LINES.length; index += 1) {
    const line = TITLE_LINES[index];
    const lineBudget = Math.max(1, Math.round(MAX_PARTICLES * (lineWidths[index] / totalLineWeight)));
    const metrics = lineMetrics[index];
    const lineY = height / 2 - totalBlockHeight / 2 + metrics.height / 2 + index * lineGap + titleSize * 0.05;

    context.clearRect(0, 0, width, height);
    context.fillText(line, width / 2, lineY);

    const imageData = context.getImageData(0, 0, width, height).data;
    const threshold = 10;
    const densityBoost = Math.max(0.98, Math.min(0.9998, width / Math.max(280, safeWidth)));
    const lineCandidates: Array<{
      x: number;
      y: number;
      seed: number;
      color: Color;
    }> = [];

    for (let py = 0; py < height; py += TEXT_STEP) {
      for (let px = 0; px < width; px += TEXT_STEP) {
        const alpha = imageData[(py * width + px) * 4 + 3];
        if (alpha < threshold) {
          continue;
        }

        const localSeed = seedIndex * 1.618 + px * 0.019 + py * 0.013;
        if (hash01(localSeed) > densityBoost) {
          continue;
        }

        const jitterX = (hash01(localSeed + 1.7) - 0.5) * 0.8;
        const jitterY = (hash01(localSeed + 8.3) - 0.5) * 0.8;
        const centeredX = px - width / 2 + jitterX;
        const centeredY = height / 2 - py + jitterY;
        const palette = TEXT_COLORS[Math.floor(hash01(localSeed + 4.2) * TEXT_COLORS.length) % TEXT_COLORS.length];

        lineCandidates.push({
          x: centeredX,
          y: centeredY,
          seed: localSeed,
          color: palette,
        });
        seedIndex += 1;
      }
    }

    const sampleCount = Math.min(Math.floor(lineBudget / CLUSTER_POINTS), lineCandidates.length);
    if (sampleCount > 0) {
      const stride = lineCandidates.length / sampleCount;
      const offset = Math.floor(hash01(index * 9.31 + 3.7) * lineCandidates.length);

      for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
        if (seeds.length >= MAX_PARTICLES) {
          break;
        }

        const candidateIndex = Math.floor((offset + sampleIndex * stride) % lineCandidates.length);
        const candidate = lineCandidates[candidateIndex];

        for (let clusterIndex = 0; clusterIndex < CLUSTER_POINTS; clusterIndex += 1) {
          if (seeds.length >= MAX_PARTICLES) {
            break;
          }

          const clusterSeed = candidate.seed + clusterIndex * 0.77;
          const angle = hash01(clusterSeed + 2.1) * Math.PI * 2;
          const radius = CLUSTER_RADIUS * (0.08 + hash01(clusterSeed + 6.8) * 0.22);
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;

          positions.push(candidate.x + offsetX, candidate.y + offsetY, 0);
          colors.push(candidate.color.r, candidate.color.g, candidate.color.b);
          seeds.push(clusterSeed);
        }
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));
  geometry.setAttribute("seed", new BufferAttribute(new Float32Array(seeds), 1));
  geometry.computeBoundingSphere();

  return { geometry, count: seeds.length };
}

function ParticleScene({ pointerRef, pointerActiveRef }: ParticleSceneProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const { size } = useThree();

  const particleData = useMemo(() => {
    if (size.width < 8 || size.height < 8) {
      return { geometry: null as BufferGeometry | null, count: 0 };
    }

    return buildGeometry(size.width, size.height);
  }, [size.width, size.height]);

  const geometry = particleData.geometry;

  const material = useMemo(() => {
    const nodeMaterial = new PointsNodeMaterial();
    nodeMaterial.transparent = true;
    nodeMaterial.depthWrite = false;
    nodeMaterial.depthTest = false;
    nodeMaterial.blending = NormalBlending;

    const seedAttr = attribute("seed", "float") as unknown as ReturnType<typeof float>;
    const colorAttr = attribute("color", "vec3") as unknown as ReturnType<typeof vec3>;
    const pointerDelta = positionLocal.xy.sub(SHADER_UNIFORMS.pointer);
    const pointerDistance = distance(positionLocal.xy, SHADER_UNIFORMS.pointer);
    const influence = clamp(float(1).sub(pointerDistance.div(SHADER_UNIFORMS.pointerRadius)), 0, 1);
    const falloff = influence.mul(influence);
    const safeDistance = float(0.0001).add(pointerDistance);
    const pushDirection = pointerDelta.div(safeDistance);

    nodeMaterial.colorNode = mix(vec3(0.035, 0.035, 0.04), colorAttr, influence);
    nodeMaterial.opacityNode = mix(float(0.9), float(1), influence);
    nodeMaterial.positionNode = positionLocal.add(
      vec3(
        sin(SHADER_UNIFORMS.time.mul(0.85).add(seedAttr.mul(1.7))).mul(0.12).add(pushDirection.x.mul(falloff.mul(11))),
        cos(SHADER_UNIFORMS.time.mul(1.05).add(seedAttr.mul(2.3))).mul(0.1).add(pushDirection.y.mul(falloff.mul(11))),
        float(0)
      )
    );

    return nodeMaterial;
  }, []);

  useFrame(({ clock }) => {
    SHADER_UNIFORMS.time.value = clock.elapsedTime;
    SHADER_UNIFORMS.pointer.value.copy(pointerActiveRef.current ? pointerRef.current : SHADER_UNIFORMS.hiddenPointer);
    SHADER_UNIFORMS.pointerRadius.value = Math.min(size.width, size.height) * (reduceMotion ? 0.11 : 0.15);
  });

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return <>{geometry ? <points geometry={geometry} material={material} frustumCulled={false} /> : null}</>;
}

export default function HeroParticleTitle({ className = "" }: HeroParticleTitleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef(new Vector2(-9999, -9999));
  const pointerActiveRef = useRef(false);

  const gl = useMemo<GLProps>(
    () =>
      async (defaults) => {
        const renderer = new WebGPURenderer({
          canvas: defaults.canvas as HTMLCanvasElement,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });

        await renderer.init();
        return renderer;
      },
    []
  );

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto w-full overflow-visible ${className}`}
      style={{ height: "clamp(34rem, 54vw, 46rem)" }}
      onPointerMove={(event) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) {
          return;
        }

        pointerActiveRef.current = true;
        pointerRef.current.set(
          event.clientX - rect.left - rect.width / 2,
          rect.height / 2 - (event.clientY - rect.top)
        );
      }}
      onPointerLeave={() => {
        pointerActiveRef.current = false;
      }}
    >
      <Canvas
        orthographic
        dpr={[1, 1.15]}
        gl={gl}
        camera={{ position: [0, 0, 10], zoom: 1 }}
        style={{ background: "transparent" }}
        onCreated={({ gl: renderer }) => {
          renderer.setClearColor(0xffffff, 0);
        }}
      >
        <ParticleScene pointerRef={pointerRef} pointerActiveRef={pointerActiveRef} />
      </Canvas>
    </div>
  );
}
