"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { TeamMember } from "./TeamSection";

const STRAP_TEXTURE_SRC = "/us/lanyard_valinor_negro.png";
// Alto real de la tarjeta (tarjeta + clip + clamp) en unidades de mundo: el
// resto de las medidas (collider, punto de enganche de la cuerda) se derivan
// de esto para no tener que recalcular todo a mano si cambia el modelo.
const CARD_HEIGHT = 3.1;
// Cuánto se mete el punto de enganche de la cuerda dentro del clip, para que
// la cuerda parezca pasar a través del gancho en vez de terminar antes.
const STRAP_OVERLAP = 0.08;
// Medio ancho de la cinta, en unidades de mundo reales (no píxeles de
// pantalla — ver por qué en la geometría de la cinta, más abajo).
const STRAP_HALF_WIDTH = 0.11;
// Largo máximo de cada uno de los 3 segmentos de la cuerda física (eslabones
// fixed→j1→j2→j3): son 3, así que este valor por tres es el largo total
// visible de la cinta. 1 world unit ≈ CARD_HEIGHT/9 (la tarjeta real mide
// ~9cm de alto), así que bajar esto ~0.18 acorta la cinta total ~1.5cm.
const STRAP_SEGMENT_LENGTH = 0.58;
// Cuántas muestras se toman de la curva de la cuerda para dibujar la cinta;
// más muestras en desktop para que se vea suave en el swing.
const STRAP_SAMPLE_DIVISIONS_DESKTOP = 32;
const STRAP_SAMPLE_DIVISIONS_MOBILE = 16;
// Eje de referencia (mundo) para calcular hacia dónde "mira" el ancho de la
// cinta: la cámara está fija en [0, 1.5, 22] mirando hacia -Z (ver
// TeamLanyard.tsx), así que "hacia la cámara" es +Z. Al ser constante (no se
// recalcula desde la cámara cada cuadro) no depende de ninguna posición que
// pueda tener ruido.
const RIBBON_VIEW_AXIS = new THREE.Vector3(0, 0, 1);

// Arma la topología fija de la cinta (posiciones en cero, UVs e índices ya
// definitivos) para una cantidad de muestras dada. Las posiciones reales se
// escriben cuadro a cuadro en useFrame, sobre el mismo buffer.
function buildRibbonGeometry(sampleDivisions: number): THREE.BufferGeometry {
  const pointCount = sampleDivisions + 1;
  const g = new THREE.BufferGeometry();
  const positions = new Float32Array(pointCount * 2 * 3);
  const uvs = new Float32Array(pointCount * 2 * 2);
  for (let i = 0; i < pointCount; i++) {
    const u = i / (pointCount - 1);
    uvs[i * 4] = u;
    uvs[i * 4 + 1] = 0;
    uvs[i * 4 + 2] = u;
    uvs[i * 4 + 3] = 1;
  }
  const indices: number[] = [];
  for (let i = 0; i < pointCount - 1; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  const positionAttr = new THREE.BufferAttribute(positions, 3);
  positionAttr.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute("position", positionAttr);
  g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  g.setIndex(indices);
  return g;
}

interface GLTFResult {
  nodes: {
    card: THREE.Mesh;
    clip: THREE.Mesh;
    clamp: THREE.Mesh;
  };
  materials: {
    base: THREE.MeshStandardMaterial;
    metal: THREE.MeshStandardMaterial;
  };
}

type LerpedRigidBody = RapierRigidBody & { lerped?: THREE.Vector3 };

interface LanyardCardProps {
  member: TeamMember;
  anchorX: number;
  anchorY: number;
  isMobile: boolean;
  flipped: boolean;
  onToggleFlip: () => void;
}

export default function LanyardCard({ member, anchorX, anchorY, isMobile, flipped, onToggleFlip }: LanyardCardProps) {
  const band = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<LerpedRigidBody>(null!);
  const j2 = useRef<LerpedRigidBody>(null!);
  const j3 = useRef<LerpedRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);
  const flipGroup = useRef<THREE.Group>(null);
  const flipProgress = useRef(0);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  // Direcciones auxiliares para calcular el ancho de la cinta a mano en
  // espacio 3D real (ver buildRibbonGeometry y su uso en useFrame, más
  // abajo) — evita depender de una librería que calcule esto en espacio de
  // pantalla, sensible a la relación de aspecto de la cámara.
  const segIn = useMemo(() => new THREE.Vector3(), []);
  const segOut = useMemo(() => new THREE.Vector3(), []);
  const vertexDir = useMemo(() => new THREE.Vector3(), []);
  const widthOffset = useMemo(() => new THREE.Vector3(), []);

  const segmentProps: RigidBodyProps = {
    type: "dynamic",
    // Con canSleep:true la cadena se "dormía" a mitad de la caída (colgando en
    // diagonal en vez de vertical) antes de terminar de asentarse bajo la
    // gravedad — se desactiva para que siga simulando hasta quedar realmente
    // en reposo debajo del ancla.
    canSleep: false,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const getLerped = (body: LerpedRigidBody): THREE.Vector3 => {
    if (!body.lerped) body.lerped = new THREE.Vector3().copy(body.translation());
    return body.lerped;
  };

  const { nodes, materials } = useGLTF(member.model) as unknown as GLTFResult;
  const rawTexture = useTexture(STRAP_TEXTURE_SRC);
  // Cada tarjeta necesita su propia copia de la textura de la cinta: comparten
  // el mismo archivo de origen, pero cada instancia de material la usa de
  // forma independiente (por el repeat propio).
  const texture = useMemo(() => {
    // lanyard_valinor_negro.png es una tira vertical (angosta y alta), pero
    // el eje que se repite a lo largo de la cinta en nuestra geometría (UV
    // "u", ver ribbonGeometry) es el horizontal de la imagen — así que hay
    // que rotar el PÍXEL real 90°, redibujando en un canvas.
    const image = rawTexture.image as HTMLImageElement;
    const canvas = document.createElement("canvas");
    canvas.width = image.height;
    canvas.height = image.width;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 1);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [rawTexture]);

  // El .glb trae la tarjeta, el clip y el clamp como mallas sueltas (no como
  // una escena), cada una con su propio origen/escala de exportación. Se
  // centra y escala el conjunto una sola vez a CARD_HEIGHT, y se hornea esa
  // transformación directamente en copias de la geometría (en vez de envolver
  // todo en un <group> con scale/position) para que el collider físico pueda
  // usar las mismas coordenadas "centradas" sin tener que arrastrar la
  // transformación por separado.
  const geometry = useMemo(() => {
    const box = new THREE.Box3();
    [nodes.card, nodes.clip, nodes.clamp].forEach((node) => {
      node.geometry.computeBoundingBox();
      if (node.geometry.boundingBox) box.union(node.geometry.boundingBox);
    });
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = size.y > 0 ? CARD_HEIGHT / size.y : 1;

    const bake = (geom: THREE.BufferGeometry) => {
      const g = geom.clone();
      g.translate(-center.x, -center.y, -center.z);
      g.scale(scale, scale, scale);
      return g;
    };

    return {
      card: bake(nodes.card.geometry),
      clip: bake(nodes.clip.geometry),
      clamp: bake(nodes.clamp.geometry),
      halfWidth: (size.x * scale) / 2,
      // El collider representa solo el cuerpo rígido de la tarjeta (no el
      // clip, que sobresale por arriba), por eso usa una fracción del alto
      // total en vez de CARD_HEIGHT/2 completo.
      halfHeight: (CARD_HEIGHT * 0.78) / 2,
      // Punto local (ya centrado/escalado) donde se ancla la cuerda: dentro
      // del aro del clip (verificado contra su propio bounding box), no solo
      // "cerca del borde superior" a ojo.
      anchorLocalY: CARD_HEIGHT / 2 - STRAP_OVERLAP,
    };
  }, [nodes]);

  // Geometría de la cinta armada a mano: una tira de triángulos entre dos
  // filas de vértices (izquierda/derecha de cada punto muestreado de la
  // cuerda). La TOPOLOGÍA (índices, UVs) es fija — se arma una sola vez;
  // solo las POSICIONES se recalculan cuadro a cuadro en useFrame, sobre el
  // mismo buffer (sin volver a crear geometría). Se asigna directamente a
  // band.current.geometry, no a una variable propia del render, porque
  // después se muta cuadro a cuadro.
  const sampleDivisions = isMobile ? STRAP_SAMPLE_DIVISIONS_MOBILE : STRAP_SAMPLE_DIVISIONS_DESKTOP;

  useEffect(() => {
    const ribbonGeometry = buildRibbonGeometry(sampleDivisions);
    band.current.geometry = ribbonGeometry;
    return () => ribbonGeometry.dispose();
  }, [sampleDivisions]);

  useEffect(() => {
    return () => {
      geometry.card.dispose();
      geometry.clip.dispose();
      geometry.clamp.dispose();
    };
  }, [geometry]);

  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    c.curveType = "chordal";
    return c;
  });
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);
  const pointerDownInfo = useRef<{ x: number; y: number; time: number } | null>(null);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], STRAP_SEGMENT_LENGTH]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], STRAP_SEGMENT_LENGTH]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], STRAP_SEGMENT_LENGTH]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, geometry.anchorLocalY, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useFrame((state, rawDelta) => {
    // El primer frame puede reportar un delta enorme (el reloj interno cuenta
    // desde que se creó, no desde el primer frame real — con Suspense
    // esperando el .glb/la textura eso son varios segundos "acumulados").
    // Sin este piso, el suavizado de la cuerda (lerp de j1/j2) explotaba a
    // valores absurdos ese primer frame y nunca volvía a converger.
    const delta = Math.min(rawDelta, 1 / 30);
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        const lerped = getLerped(ref.current);
        const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(ref.current.translation())));
        lerped.lerp(ref.current.translation(), Math.min(1, delta * (1 + clampedDistance * 50)));
      });
      // j3 es la punta de la cinta del lado del clip. Suavizarlo con lerp
      // atenuaba el ruido normal del solver de física pero no lo eliminaba
      // del todo — se notaba sobre todo después de arrastrar la tarjeta y
      // soltarla (el joint "rebota" un poco al soltar, como un resorte
      // liberado, y ese rebote residual nunca llega a cero del todo mientras
      // el cuerpo siga despierto — canSleep:false). En vez de atenuar, se
      // CONGELA del todo mientras la velocidad real de j3 esté por debajo de
      // un umbral: solo se actualiza si de verdad se está moviendo (arrastre,
      // asentamiento inicial). En reposo genuino no hay ninguna actualización,
      // así que no hay ningún ruido que la cinta pueda amplificar.
      const j3Lerped = getLerped(j3.current);
      const j3Vel = j3.current.linvel();
      if (Math.hypot(j3Vel.x, j3Vel.y, j3Vel.z) > 0.02) {
        j3Lerped.copy(j3.current.translation());
      }
      curve.points[0].copy(j3Lerped);
      curve.points[1].copy(getLerped(j2.current));
      curve.points[2].copy(getLerped(j1.current));
      curve.points[3].copy(fixed.current.translation());
      const sampled = curve.getPoints(sampleDivisions);
      // Geometría de la cinta a mano: por cada punto muestreado de la
      // cuerda, dos vértices (izquierda/derecha) desplazados desde el punto
      // central, perpendicular a la dirección de la cuerda ahí Y a
      // RIBBON_VIEW_AXIS (para que el ancho "mire" hacia la cámara, no hacia
      // arriba/al costado). En los extremos se usa la dirección del único
      // segmento real que hay (sin vecino inventado ni autoreferencia) — un
      // corte transversal recto sale solo, porque el ancho no depende de
      // comparar el punto consigo mismo en ningún lado.
      const positionAttr = band.current.geometry.attributes.position as THREE.BufferAttribute | undefined;
      // El primer cuadro puede llegar a correr antes de que el useEffect que
      // arma y asigna la geometría de la cinta haya corrido — en ese caso
      // todavía no hay atributo "position" y no hay nada que dibujar todavía.
      if (positionAttr) {
        const positions = positionAttr.array as Float32Array;
        for (let i = 0; i < sampled.length; i++) {
          if (i === 0) {
            segOut.subVectors(sampled[1], sampled[0]).normalize();
            vertexDir.copy(segOut);
          } else if (i === sampled.length - 1) {
            segIn.subVectors(sampled[i], sampled[i - 1]).normalize();
            vertexDir.copy(segIn);
          } else {
            segIn.subVectors(sampled[i], sampled[i - 1]).normalize();
            segOut.subVectors(sampled[i + 1], sampled[i]).normalize();
            vertexDir.addVectors(segIn, segOut).normalize();
          }
          widthOffset.crossVectors(vertexDir, RIBBON_VIEW_AXIS).normalize().multiplyScalar(STRAP_HALF_WIDTH);
          const p = sampled[i];
          const base = i * 6;
          positions[base] = p.x + widthOffset.x;
          positions[base + 1] = p.y + widthOffset.y;
          positions[base + 2] = p.z + widthOffset.z;
          positions[base + 3] = p.x - widthOffset.x;
          positions[base + 4] = p.y - widthOffset.y;
          positions[base + 5] = p.z - widthOffset.z;
          // La punta pegada al ancla fijo (i === último) es un corte recto
          // que normalmente queda horizontal porque la cuerda cuelga vertical
          // ahí. Si se arrastra la tarjeta hacia el ancla, la cuerda se afloja
          // y ese último tramo puede dejar de ser vertical, girando el corte
          // y dejando que una esquina suba por encima del ancla — que es
          // justo donde está pegado el borde de la sección anterior (ver
          // .lanyard-canvas-wrap). Se recorta esa esquina para que nunca
          // dibuje por encima de la altura real del ancla, sin importar el
          // ángulo de la cuerda en ese instante.
          if (i === sampled.length - 1) {
            positions[base + 1] = Math.min(positions[base + 1], curve.points[3].y);
            positions[base + 4] = Math.min(positions[base + 4], curve.points[3].y);
          }
        }
        positionAttr.needsUpdate = true;
        band.current.geometry.computeBoundingSphere();
      }
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
    if (flipGroup.current) {
      const target = flipped ? Math.PI : 0;
      flipProgress.current += (target - flipProgress.current) * Math.min(1, delta * 6);
      flipGroup.current.rotation.y = flipProgress.current;
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    (event.target as Element).setPointerCapture(event.pointerId);
    pointerDownInfo.current = { x: event.clientX, y: event.clientY, time: performance.now() };
    drag(new THREE.Vector3().copy(event.point).sub(vec.copy(card.current.translation())));
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    (event.target as Element).releasePointerCapture(event.pointerId);
    drag(false);
    const info = pointerDownInfo.current;
    pointerDownInfo.current = null;
    if (info) {
      const moved = Math.hypot(event.clientX - info.x, event.clientY - info.y);
      const elapsed = performance.now() - info.time;
      if (moved < 6 && elapsed < 500) onToggleFlip();
    }
  };

  return (
    <>
      <group position={[anchorX, anchorY, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[geometry.halfWidth, geometry.halfHeight, 0.05]} />
          <group
            ref={flipGroup}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <mesh geometry={geometry.card}>
              <meshPhysicalMaterial
                map={materials.base.map}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.25}
                roughness={0.6}
                metalness={0.2}
              />
            </mesh>
            <mesh geometry={geometry.clip} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={geometry.clamp} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshBasicMaterial
          map={texture}
          side={THREE.DoubleSide}
          // La punta de la cinta queda muy cerca del aro metálico del clip.
          // Desactivar el depth test la saca de esa competencia por
          // profundidad por completo: siempre se dibuja encima, sin
          // ambigüedad. Mismo enfoque que la referencia de reactbits.dev en
          // la que se basa este componente.
          depthTest={false}
        />
      </mesh>
    </>
  );
}
