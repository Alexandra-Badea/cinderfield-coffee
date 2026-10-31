"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { Beans, Cinders } from "./atmosphere";
import { Bag, type BagProduct } from "./bag";
import { createSpin, spinHandlers, stepSpin, type Spin } from "./spin";

/**
 * The home page hero: three bags under warm light, beans tumbling and cinders rising.
 * Drag to spin the middle bag, click it to open that coffee. The scene turns gently toward the pointer.
 * It stops drawing when scrolled out of view.
 */
export default function HeroScene({ bags, onReady }: { bags: BagProduct[]; onReady: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [spin] = useState(createSpin);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing" {...spinHandlers(spin)}>
      <Canvas
        dpr={[1, 1.75]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0.15, 9.5], fov: 30 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={() => setTimeout(onReady, 250)}
        aria-hidden="true"
      >
        <Scene bags={bags} spin={spin} />
      </Canvas>
    </div>
  );
}

function Scene({ bags, spin }: { bags: BagProduct[]; spin: Spin }) {
  const router = useRouter();
  const size = useThree((s) => s.size);
  const narrow = size.width < 640;
  // on large screens the canvas fills the hero and the bags sit to the right of the text
  const wide = size.width >= 1024;
  const group = useRef<THREE.Group>(null);
  const centre = useRef<THREE.Group>(null);
  const [left, middle, right] = bags;

  useFrame((state, dt) => {
    // pull back on narrow screens so all three bags fit
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, narrow ? 13.5 : wide ? 12 : 10, 4, dt);
    const g = group.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.2, 2.5, dt);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.06, 2.5, dt);
    }
    stepSpin(spin, centre.current, dt, 0, { sway: Math.sin(state.clock.elapsedTime * 0.45) * 0.5 - 0.25 });
  });

  const side = narrow ? 2.05 : wide ? 1.95 : 2.5;
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={2.4} color="#ffe6cc" />
      <pointLight position={[-4.5, 1.5, -2.5]} intensity={40} distance={14} color="#ff6a2b" />
      <pointLight position={[4.5, -1, -2]} intensity={18} distance={12} color="#f2c48d" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 3, 6]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#ff8a4a" position={[-6, 0, -2]} rotation-y={Math.PI / 2} scale={[5, 6, 1]} />
        <Lightformer form="rect" intensity={1} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} />
      </Environment>

      <group ref={group} position={[wide ? 2.05 : 0, wide ? -0.1 : 0, 0]}>
        {left && (
          <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.7}>
            <Bag product={left} position={[-side, -0.25, -0.9]} rotation={[0, 0.55, 0.07]} scale={0.86} />
          </Float>
        )}
        {right && (
          <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.7}>
            <Bag product={right} position={[side, -0.2, -0.9]} rotation={[0, -0.6, -0.07]} scale={0.86} />
          </Float>
        )}
        {middle && (
          <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.6}>
            <group
              ref={centre}
              position={[0, 0.05, 0.6]}
              rotation={[0, -0.35, 0]}
              onClick={() => spin.moved < 6 && router.push(`/coffee/${middle.slug}`)}
            >
              <Bag product={middle} />
            </group>
          </Float>
        )}
        <Beans count={narrow ? 14 : 24} radius={narrow ? 3 : wide ? 3.3 : 4} />
      </group>
      <Cinders count={narrow ? 40 : 90} width={narrow ? 6 : 14} height={7.5} />
      <ContactShadows position={[0, -1.9, 0]} opacity={0.65} scale={14} blur={2.8} far={4.5} resolution={512} color="#000" />
    </>
  );
}
