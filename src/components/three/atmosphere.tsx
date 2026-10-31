"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * The things floating around the bags: roasted beans tumbling slowly, and cinders rising like
 * sparks from a roaster. Both are drawn in a single draw call each.
 */

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

let beanGeo: THREE.BufferGeometry | null = null;
/** An oval with a crease down its flat side */
function beanGeometry() {
  if (beanGeo) return beanGeo;
  const g = new THREE.SphereGeometry(1, 22, 16);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) * 0.68;
    let y = p.getY(i) * 0.46;
    const z = p.getZ(i);
    if (y > 0) y *= 0.7; // the flat side
    if (y > 0) y -= 0.22 * Math.exp(-(x * x) / 0.012) * (1 - z * z); // the crease
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  g.scale(0.14, 0.14, 0.14);
  beanGeo = g;
  return g;
}

export function Beans({ count = 26, radius = 3.6 }: { count?: number; radius?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const beans = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: count }, () => {
      const a = r() * Math.PI * 2;
      const d = radius * (0.65 + r() * 0.55);
      return {
        x: Math.cos(a) * d,
        y: (r() - 0.5) * 3.4,
        z: Math.sin(a) * d * 0.55 - 0.6,
        rx: r() * 6,
        ry: r() * 6,
        speed: 0.15 + r() * 0.35,
        bob: r() * 6,
        scale: 0.8 + r() * 0.6,
      };
    });
  }, [count, radius]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3b2416", roughness: 0.32, metalness: 0.05 }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const m = mesh.current;
    if (!m) return;
    beans.forEach((b, i) => {
      dummy.position.set(b.x, b.y + Math.sin(t * 0.6 + b.bob) * 0.18, b.z);
      dummy.rotation.set(b.rx + t * b.speed, b.ry + t * b.speed * 0.7, 0);
      dummy.scale.setScalar(b.scale);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[beanGeometry(), material, count]} />;
}

function glowSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,220,180,.9)");
  g.addColorStop(1, "rgba(255,120,40,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** Sparks rising and fading: their colour dims as they climb, which with additive blending reads as fading out */
export function Cinders({ count = 70, width = 9, height = 6 }: { count?: number; width?: number; height?: number }) {
  const points = useRef<THREE.Points>(null);
  const { positions, colors, seeds } = useMemo(() => {
    const r = rng(7);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = Array.from({ length: count }, () => ({ x: (r() - 0.5) * width, z: (r() - 0.5) * 3 - 0.5, offset: r(), speed: 0.12 + r() * 0.22, sway: r() * 6, hot: r() }));
    return { positions, colors, seeds };
  }, [count, width]);
  const material = useMemo(
    () => new THREE.PointsMaterial({ size: 0.09, map: glowSprite(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, sizeAttenuation: true }),
    [],
  );
  const ember = useMemo(() => new THREE.Color("#ff7a2e"), []);
  const gold = useMemo(() => new THREE.Color("#ffd29a"), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const p = points.current;
    if (!p) return;
    const t = clock.elapsedTime;
    seeds.forEach((s, i) => {
      const life = (s.offset + t * s.speed * 0.25) % 1;
      positions[i * 3] = s.x + Math.sin(t * 0.8 + s.sway) * 0.25;
      positions[i * 3 + 1] = -height / 2 + life * height;
      positions[i * 3 + 2] = s.z;
      const fade = Math.sin(life * Math.PI) * 0.9;
      tmp.copy(ember).lerp(gold, s.hot).multiplyScalar(fade);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    });
    p.geometry.attributes.position.needsUpdate = true;
    p.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={points} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
    </points>
  );
}
