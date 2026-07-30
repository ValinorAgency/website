"use client";

import { Canvas, useFrame, useThree, type GLProps } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import {
  Color,
  InstancedMesh,
  Object3D,
  SphereGeometry,
  Vector2,
} from "three"
import { MeshPhysicalNodeMaterial, WebGPURenderer } from "three/webgpu"

// ─── Types ────────────────────────────────────────────────────────────────────

type SpriteParticle = {
  x: number;
  y: number;
  z: number;
  size: number;
  // linear-space RGB [0-1]
  greyR: number; greyG: number; greyB: number;
  vibR:  number; vibG:  number; vibB:  number;
};

type GridCandidate = {
  x: number;
  y: number;
  seed: number;
  alpha: number;
  distance: number;
  localMax: boolean;
};

type ParticlePhysics = {
  restX: number; restY: number; restZ: number;
  currX: number; currY: number;
  vx: number;   vy: number;
  size: number;
  greyR: number; greyG: number; greyB: number;
  vibR:  number; vibG:  number; vibB:  number;
};

type SceneProps = {
  pointerRef: { current: Vector2 };
  pointerActiveRef: { current: boolean };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TITLE_LINES = [
  "WEBS PROFESIONALES /",
  "APLICACIONES WEB"
];

const GRID_STEP    = 3;
const MAX_SPRITES  = 9000;
const MIN_ALPHA    = 12;
const PACK_GAP     = 0.4;
const SPATIAL_CELL = 22;
const DAMPING            = 0.91;   // higher = floatier return
const SPRING_K           = 0.055;  // slower spring back
const MOUSE_PUSH         = 3;      // very mild radial push (prevents "white hole")
const DRAG_STRENGTH      = 0.10;   // drag along mouse velocity
const MOUSE_RADIUS_RATIO = 0.18;
const MAX_COLOR_DISP     = 24;     // pixels of displacement for full color saturation

// Greyscale palette — warm/cool whites to dark greys (linear-space RGB)
const GREY_PALETTE: [number, number, number][] = [
  [0.957, 0.914, 0.816],
  [0.875, 0.914, 0.949],
  [0.918, 0.847, 0.831],
  [0.961, 0.945, 0.910],
  [0.851, 0.851, 0.851],
  [0.753, 0.753, 0.753],
  [0.604, 0.604, 0.604],
  [0.420, 0.420, 0.420],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hash01(seed: number) {
  const v = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

function createTextContext(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  return ctx;
}

// ─── Sprite builder ───────────────────────────────────────────────────────────

function buildTextSprites(width: number, height: number): SpriteParticle[] {
  const ctx = createTextContext(width, height);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let titleSize = Math.max(80, Math.min(200, width * 0.175));
  const fontFamily =
    '"Impact", "Arial Black", "Aptos Black", "Segoe UI Black", "Arial Narrow", Arial, sans-serif';
  ctx.font = `900 ${titleSize}px ${fontFamily}`;

  const longestLineWidth = TITLE_LINES.reduce(
    (max, line) => Math.max(max, ctx.measureText(line).width),
    0
  );
  const safeWidth = width * 0.94;

  if (longestLineWidth > safeWidth) {
    titleSize = Math.max(70, Math.min(200, titleSize * (safeWidth / longestLineWidth)));
    ctx.font = `900 ${titleSize}px ${fontFamily}`;
  }

  const lineMetrics = TITLE_LINES.map((line) => {
    const m    = ctx.measureText(line);
    const asc  = m.actualBoundingBoxAscent  || titleSize * 0.72;
    const desc = m.actualBoundingBoxDescent || titleSize * 0.24;
    return { width: m.width, height: asc + desc };
  });

  const totalHeight =
    lineMetrics.reduce((t, m) => t + m.height, 0) +
    titleSize * 0.38 * (TITLE_LINES.length - 1);
  const startY      = height / 2 - totalHeight / 2;
  const totalWeight = lineMetrics.reduce((t, m) => t + m.width, 0);

  const sprites: SpriteParticle[]         = [];
  const gridW = Math.ceil(width  / GRID_STEP);
  const gridH = Math.ceil(height / GRID_STEP);
  let seedIndex = 0;

  const alphaAt = (data: Uint8ClampedArray, px: number, py: number) => {
    if (px < 0 || py < 0 || px >= width || py >= height) return 0;
    return data[(py * width + px) * 4 + 3];
  };

  const occupied    = new Map<string, number[]>();
  const spatialKey  = (x: number, y: number) =>
    `${Math.floor(x / SPATIAL_CELL)}:${Math.floor(y / SPATIAL_CELL)}`;

  const canPlace = (x: number, y: number, size: number, cs: number) => {
    const r      = size * cs;
    const cx     = Math.floor(x / SPATIAL_CELL);
    const cy     = Math.floor(y / SPATIAL_CELL);
    const search = Math.ceil(r / SPATIAL_CELL) + 1;
    for (let gy = cy - search; gy <= cy + search; gy++) {
      for (let gx = cx - search; gx <= cx + search; gx++) {
        const bucket = occupied.get(`${gx}:${gy}`);
        if (!bucket) continue;
        for (const idx of bucket) {
          const s      = sprites[idx];
          const or     = s.size * 0.50;
          const dx     = s.x - x, dy = s.y - y;
          const minDist = r + or + PACK_GAP;
          if (dx * dx + dy * dy < minDist * minDist) return false;
        }
      }
    }
    return true;
  };

  const placeSprite = (sp: SpriteParticle) => {
    const idx = sprites.length;
    sprites.push(sp);
    const key = spatialKey(sp.x, sp.y);
    const b   = occupied.get(key);
    if (b) b.push(idx); else occupied.set(key, [idx]);
  };

  const buildDistanceField = (data: Uint8ClampedArray) => {
    const n    = gridW * gridH;
    const dist = new Float32Array(n);
    const inside = new Uint8Array(n);
    const diag   = Math.SQRT2;

    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const px  = Math.min(width  - 1, Math.floor((gx + 0.5) * GRID_STEP));
        const py  = Math.min(height - 1, Math.floor((gy + 0.5) * GRID_STEP));
        const idx = gy * gridW + gx;
        if (alphaAt(data, px, py) >= MIN_ALPHA) {
          inside[idx] = 1;
          dist[idx]   = 1e6;
        }
      }
    }

    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const idx = gy * gridW + gx;
        if (!inside[idx]) continue;
        if (gx > 0)                  dist[idx] = Math.min(dist[idx], dist[idx - 1]        + 1);
        if (gy > 0)                  dist[idx] = Math.min(dist[idx], dist[idx - gridW]     + 1);
        if (gx > 0 && gy > 0)       dist[idx] = Math.min(dist[idx], dist[idx - gridW - 1] + diag);
        if (gx < gridW - 1 && gy > 0) dist[idx] = Math.min(dist[idx], dist[idx - gridW + 1] + diag);
      }
    }

    for (let gy = gridH - 1; gy >= 0; gy--) {
      for (let gx = gridW - 1; gx >= 0; gx--) {
        const idx = gy * gridW + gx;
        if (!inside[idx]) continue;
        if (gx < gridW - 1)                  dist[idx] = Math.min(dist[idx], dist[idx + 1]        + 1);
        if (gy < gridH - 1)                  dist[idx] = Math.min(dist[idx], dist[idx + gridW]     + 1);
        if (gx < gridW - 1 && gy < gridH - 1) dist[idx] = Math.min(dist[idx], dist[idx + gridW + 1] + diag);
        if (gx > 0 && gy < gridH - 1)         dist[idx] = Math.min(dist[idx], dist[idx + gridW - 1] + diag);
      }
    }

    return { dist, inside };
  };

  const isLocalMax = (
    dist: Float32Array,
    inside: Uint8Array,
    gx: number,
    gy: number
  ) => {
    const idx = gy * gridW + gx;
    const v   = dist[idx];
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        if (ox === 0 && oy === 0) continue;
        const nx = gx + ox, ny = gy + oy;
        if (nx < 0 || ny < 0 || nx >= gridW || ny >= gridH) continue;
        const nIdx = ny * gridW + nx;
        if (inside[nIdx] && dist[nIdx] > v + 0.2) return false;
      }
    }
    return true;
  };

  const placeFromCandidates = (
    list: GridCandidate[],
    count: number,
    sizeScale: number,
    minSize: number,
    maxSize: number,
    cs: number,
    zMin: number,
    zMax: number,
    localMaxOnly = false
  ) => {
    if (count <= 0 || list.length === 0) return;
    let placed   = 0;
    const limit  = Math.min(list.length, count * 10);

    for (let i = 0; i < limit && placed < count; i++) {
      const c = list[i];
      if (localMaxOnly && !c.localMax) continue;

      const size = Math.max(minSize, Math.min(maxSize, c.distance * sizeScale));
      if (!canPlace(c.x, c.y, size, cs)) continue;

      const lb = Math.pow(hash01(c.seed + 5.7), 0.3);
      const gi = Math.max(0, Math.min(GREY_PALETTE.length - 1, Math.floor(lb * (GREY_PALETTE.length - 1))));
      const [gr, gg, gb] = GREY_PALETTE[gi] ?? GREY_PALETTE[0];

      const hue = hash01(c.seed + 31.5) * 360;
      const sat = 80 + hash01(c.seed + 47.2) * 15;
      const lit = 55 + hash01(c.seed + 63.8) * 10;
      const [vr, vg, vb] = hslToRgb(hue, sat, lit);

      const z = zMin + hash01(c.seed + 9.1) * (zMax - zMin);

      placeSprite({
        x: c.x, y: c.y, z, size,
        greyR: gr, greyG: gg, greyB: gb,
        vibR: vr,  vibG: vg,  vibB: vb,
      });
      placed++;
    }
  };

  for (let lineIdx = 0; lineIdx < TITLE_LINES.length; lineIdx++) {
    const line = TITLE_LINES[lineIdx];
    const lm   = lineMetrics[lineIdx];
    const lineBudget = Math.max(1100, Math.round(MAX_SPRITES * (lm.width / totalWeight)));
    const lineY =
      startY +
      lineMetrics.slice(0, lineIdx).reduce((t, m) => t + m.height, 0) +
      lineIdx * titleSize * 0.38 +
      lm.height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillText(line, width / 2, lineY + titleSize * 0.03);
    const imgData = ctx.getImageData(0, 0, width, height).data;
    const { dist, inside } = buildDistanceField(imgData);

    const candidates: GridCandidate[] = [];
    const maxima: GridCandidate[]     = [];

    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const idx = gy * gridW + gx;
        if (!inside[idx]) continue;
        const d = dist[idx] * GRID_STEP;
        if (d < 1.25) continue;

        const px    = Math.min(width  - 1, Math.floor((gx + 0.5) * GRID_STEP));
        const py    = Math.min(height - 1, Math.floor((gy + 0.5) * GRID_STEP));
        const alpha = alphaAt(imgData, px, py);
        const seed  = seedIndex * 1.618 + gx * 0.91 + gy * 1.37;
        const jx    = (hash01(seed + 1.2) - 0.5) * 0.18;
        const jy    = (hash01(seed + 7.9) - 0.5) * 0.18;

        const cand: GridCandidate = {
          x: gx * GRID_STEP + GRID_STEP * 0.5 - width  / 2 + jx,
          y: height / 2 - (gy * GRID_STEP + GRID_STEP * 0.5) + jy,
          seed, alpha, distance: d,
          localMax: isLocalMax(dist, inside, gx, gy),
        };
        candidates.push(cand);
        if (cand.localMax) maxima.push(cand);
      }
    }

    const byDistAlpha = (a: GridCandidate, b: GridCandidate) =>
      b.distance - a.distance ||
      b.alpha - a.alpha ||
      hash01(a.seed + 13.1) - hash01(b.seed + 13.1);
    candidates.sort(byDistAlpha);
    maxima.sort(byDistAlpha);

    const largeCount  = Math.round(lineBudget * 0.48);
    const mediumCount = Math.round(lineBudget * 0.34);
    const smallCount  = lineBudget - largeCount - mediumCount;

    placeFromCandidates(maxima,     largeCount,  0.62, 8, 20, 0.52, 14, 42, true);
    placeFromCandidates(candidates, mediumCount, 0.44, 5, 12, 0.51,  5, 20);
    placeFromCandidates(candidates, smallCount,  0.28, 2,  6, 0.50,  0, 10);

    seedIndex += candidates.length + 1;
  }

  return sprites;
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function SphereScene({ pointerRef, pointerActiveRef }: SceneProps) {
  const { size } = useThree();
  const tempObj     = useRef(new Object3D());
  const tempColor   = useRef(new Color());
  const mouseRadius = useRef(200);
  const prevPtr     = useRef(new Vector2(-99999, -99999));
  const ptrVel      = useRef(new Vector2(0, 0));
  const meshRef     = useRef<InstancedMesh | null>(null);
  const physicsRef  = useRef<ParticlePhysics[]>([]);

  const buildResult = useMemo(() => {
    if (size.width < 8 || size.height < 8) return null;

    const particles = buildTextSprites(size.width, size.height);
    const count     = particles.length;
    if (count === 0) return null;

    const geom = new SphereGeometry(1, 10, 8);

    // MeshPhysicalNodeMaterial for PBR look (clearcoat = shiny ball surface)
    const mat = new MeshPhysicalNodeMaterial();
    mat.roughness          = 0.35;
    mat.metalness          = 0.0;
    mat.clearcoat          = 0.25;
    mat.clearcoatRoughness = 0.3;
    mat.vertexColors       = true; // reads instanceColor per-sphere

    const mesh = new InstancedMesh(geom, mat, count);
    mesh.frustumCulled = false;

    const physics: ParticlePhysics[] = [];
    const temp = new Object3D();
    const col  = new Color();

    for (let i = 0; i < count; i++) {
      const p = particles[i];

      // Initial position
      temp.position.set(p.x, p.y, p.z);
      temp.scale.setScalar(p.size);
      temp.updateMatrix();
      mesh.setMatrixAt(i, temp.matrix);

      // Initial colour — grey palette
      col.setRGB(p.greyR, p.greyG, p.greyB);
      mesh.setColorAt(i, col);

      physics.push({
        restX: p.x, restY: p.y, restZ: p.z,
        currX: p.x, currY: p.y,
        vx: 0, vy: 0,
        size: p.size,
        greyR: p.greyR, greyG: p.greyG, greyB: p.greyB,
        vibR:  p.vibR,  vibG:  p.vibG,  vibB:  p.vibB,
      });
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    return { mesh, physics, count };
  }, [size.width, size.height]);

  // Track mouse radius (world units = canvas pixels in orthographic zoom:1)
  useEffect(() => {
    mouseRadius.current = Math.min(size.width, size.height) * MOUSE_RADIUS_RATIO;
  }, [size.width, size.height]);

  // Dispose GPU resources when rebuilt or on unmount
  useEffect(() => {
    meshRef.current = buildResult?.mesh ?? null;
    physicsRef.current = buildResult?.physics ?? [];

    return () => {
      if (buildResult) {
        buildResult.mesh.geometry.dispose();
        (buildResult.mesh.material as MeshPhysicalNodeMaterial).dispose();
        buildResult.mesh.dispose();
      }
    };
  }, [buildResult]);

  // Spring physics + colour update each frame
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const physics = physicsRef.current;
    const active = pointerActiveRef.current;
    const ptr    = pointerRef.current;
    const radius = mouseRadius.current;
    const to     = tempObj.current;
    const col    = tempColor.current;

    // Track mouse velocity this frame
    if (active) {
      ptrVel.current.set(ptr.x - prevPtr.current.x, ptr.y - prevPtr.current.y);
      prevPtr.current.copy(ptr);
    } else {
      ptrVel.current.set(0, 0);
      // Reset prev so velocity doesn't spike on re-enter
      prevPtr.current.set(ptr.x, ptr.y);
    }
    const vx = ptrVel.current.x;
    const vy = ptrVel.current.y;

    for (let i = 0; i < physics.length; i++) {
      const p = physics[i];

      // ── Spring force toward rest position ──
      p.vx = p.vx * DAMPING + (p.restX - p.currX) * SPRING_K;
      p.vy = p.vy * DAMPING + (p.restY - p.currY) * SPRING_K;

      // ── Mouse drag + mild push (no white-hole repulsion) ──
      if (active) {
        const dx = p.currX - ptr.x;
        const dy = p.currY - ptr.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < radius * radius && d2 > 0.0001) {
          const d   = Math.sqrt(d2);
          const inf = (1 - d / radius) ** 2;
          // Drag particles in direction of mouse movement
          p.vx += vx * inf * DRAG_STRENGTH;
          p.vy += vy * inf * DRAG_STRENGTH;
          // Very mild push so cursor tip doesn't overlap center particles
          p.vx += (dx / d) * inf * MOUSE_PUSH;
          p.vy += (dy / d) * inf * MOUSE_PUSH;
        }
      }

      p.currX += p.vx;
      p.currY += p.vy;

      // ── Colour based on how far particle has moved from rest ──
      // (no white circle — colour is tied to physical displacement)
      const dispX = p.currX - p.restX;
      const dispY = p.currY - p.restY;
      const disp  = Math.sqrt(dispX * dispX + dispY * dispY);
      const colorInf = Math.min(1, disp / MAX_COLOR_DISP) ** 0.7;

      // ── Update matrix ──
      to.position.set(p.currX, p.currY, p.restZ);
      to.scale.setScalar(p.size);
      to.updateMatrix();
      mesh.setMatrixAt(i, to.matrix);

      // ── Update colour ──
      col.setRGB(
        p.greyR + (p.vibR - p.greyR) * colorInf,
        p.greyG + (p.vibG - p.greyG) * colorInf,
        p.greyB + (p.vibB - p.greyB) * colorInf
      );
      mesh.setColorAt(i, col);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  if (!buildResult) return null;

  return (
    <>
      <ambientLight intensity={1.6} />
      <directionalLight position={[0.6, 1.4, 1.2]} intensity={2.8} />
      <directionalLight position={[-1.2, -0.6, 0.6]} intensity={0.5} color="#b8d4ff" />
      <primitive object={buildResult.mesh} />
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function SpriteParticleProbe({ className = "" }: { className?: string }) {
  const containerRef     = useRef<HTMLDivElement | null>(null);
  const pointerRef       = useRef(new Vector2(-99999, -99999));
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

  // Allow className to supply a height (e.g. h-full); fall back to default when none provided
  const hasHeightClass = /\bh-/.test(className);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-visible ${className}`}
      style={hasHeightClass ? undefined : { height: "min(82svh, 54rem)" }}
      onPointerMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        pointerActiveRef.current = true;
        pointerRef.current.set(
          e.clientX - rect.left  - rect.width  / 2,
          rect.height / 2 - (e.clientY - rect.top)
        );
      }}
      onPointerLeave={() => {
        pointerActiveRef.current = false;
      }}
    >
      <Canvas
        orthographic
        dpr={[1, 1.25]}
        gl={gl}
        camera={{ position: [0, 0, 56], zoom: 1 }}
        style={{ background: "transparent" }}
      >
        <SphereScene
          pointerRef={pointerRef}
          pointerActiveRef={pointerActiveRef}
        />
      </Canvas>
    </div>
  );
}
