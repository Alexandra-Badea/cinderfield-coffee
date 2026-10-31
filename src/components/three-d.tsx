"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import { BagArt } from "./bag-art";
import { HeroBags } from "./hero-bags";
import type { BagProduct } from "./three/bag";

/*
 * The 3D scenes load after the page, only in browsers that can draw them, and never for visitors
 * who ask for less motion. Until then (or instead) the flat SVG bags show, so the page is never empty.
 */

const HeroScene = dynamic(() => import("./three/hero-scene"), { ssr: false });
const BagViewer = dynamic(() => import("./three/bag-viewer"), { ssr: false });

let support: boolean | null = null;
function canDraw3D() {
  if (support === null) {
    try {
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      const c = document.createElement("canvas");
      support = !reduced && !saveData && Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      support = false;
    }
  }
  return support;
}
const never = () => () => {};
const useCan3D = () => useSyncExternalStore(never, canDraw3D, () => false);

export function Hero3D({ bags }: { bags: BagProduct[] }) {
  const can = useCan3D();
  const [ready, setReady] = useState(false);
  return (
    <div className="relative h-full w-full">
      <div className={`absolute inset-0 flex items-center justify-center px-5 transition-opacity duration-700 lg:pl-[48%] lg:pr-10 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <HeroBags bags={bags} />
      </div>
      {can && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <HeroScene bags={bags} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}

export function Bag3D({ product }: { product: BagProduct }) {
  const can = useCan3D();
  const [ready, setReady] = useState(false);
  return (
    <div className="relative h-full w-full">
      <div className={`absolute inset-0 flex items-center justify-center p-10 transition-opacity duration-700 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <BagArt product={product} className="h-full max-h-[440px] w-auto drop-shadow-[0_30px_30px_rgba(22,16,12,.25)]" />
      </div>
      {can && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <BagViewer product={product} onReady={() => setReady(true)} />
        </div>
      )}
      {can && (
        <p className={`pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-espresso/75 px-3 py-1 text-xs font-medium text-cream backdrop-blur transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          Drag to turn the bag
        </p>
      )}
    </div>
  );
}
