"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { Beans } from "./atmosphere";
import { Bag, type BagProduct } from "./bag";
import { createSpin, spinHandlers, stepSpin, type Spin } from "./spin";

/** One bag on the product page, swaying gently. Drag to turn it and read the back. */
export default function BagViewer({ product, onReady }: { product: BagProduct; onReady: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [spin] = useState(createSpin);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing" {...spinHandlers(spin)}>
      <Canvas
        dpr={[1, 2]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0.25, 7.6], fov: 30 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={() => setTimeout(onReady, 200)}
        aria-hidden="true"
      >
        <Scene product={product} spin={spin} />
      </Canvas>
    </div>
  );
}

function Scene({ product, spin }: { product: BagProduct; spin: Spin }) {
  const bag = useRef<THREE.Group>(null);
  // At rest the front faces you, swaying a little; the back is there for anyone who turns it
  useFrame((state, dt) => stepSpin(spin, bag.current, dt, 0, { sway: Math.sin(state.clock.elapsedTime * 0.5) * 0.45 - 0.3 }));
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 6]} intensity={2.2} color="#fff1e2" />
      <pointLight position={[-4, 1, -2]} intensity={16} distance={10} color={product.art.accent} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.8} position={[0, 3, 6]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 0, 0]} rotation-y={Math.PI / 2} scale={[5, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[6, 0, 0]} rotation-y={-Math.PI / 2} scale={[5, 6, 1]} />
      </Environment>
      <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.5}>
        <group ref={bag} rotation={[0, -0.55, 0]}>
          <Bag product={product} />
        </group>
      </Float>
      <Beans count={9} radius={2.6} />
      <ContactShadows position={[0, -1.8, 0]} opacity={0.32} scale={9} blur={2.4} far={4} resolution={512} color="#2a1c15" />
    </>
  );
}
