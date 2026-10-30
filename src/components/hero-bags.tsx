"use client";

import { useEffect, useRef } from "react";
import { BagArt } from "./bag-art";
import type { Product } from "@/lib/types";

type Bag = Pick<Product, "slug" | "name" | "origin" | "roastLevel" | "art" | "decaf">;

const beans = [
  { x: "6%", y: "18%", s: 1.1, r: -20, d: "0s" },
  { x: "88%", y: "12%", s: 0.8, r: 30, d: "-2s" },
  { x: "92%", y: "62%", s: 1.25, r: -50, d: "-4s" },
  { x: "2%", y: "70%", s: 0.9, r: 60, d: "-1s" },
  { x: "50%", y: "4%", s: 0.7, r: 10, d: "-3s" },
  { x: "70%", y: "88%", s: 0.75, r: -30, d: "-5s" },
];

function Bean({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 40" className={className} aria-hidden="true">
      <ellipse cx="15" cy="20" rx="12" ry="17" fill="#4a3428" />
      <path d="M11 5c6 5 1 11 5 15s-1 10-4 15" stroke="#2a1c15" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="10" cy="13" rx="3" ry="5" fill="#fff" opacity=".12" />
    </svg>
  );
}

/** Three bags fanned out in 3D, with beans drifting around them. The whole group turns gently toward the mouse. */
export function HeroBags({ bags }: { bags: Bag[] }) {
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stage.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / innerWidth - 0.5;
      ty = e.clientY / innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--ry", `${(x * 16).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const [left, middle, right] = bags;
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px] [perspective:1100px]">
      <div ref={stage} className="absolute inset-0 [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]">
        <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(closest-side,#f0b88a88,transparent)] [transform:translateZ(-120px)]" />
        {beans.map((b, i) => (
          <div key={i} className="absolute w-7 md:w-9" style={{ left: b.x, top: b.y, transform: `translateZ(${60 + i * 12}px) scale(${b.s})` }}>
            <div className="animate-drift" style={{ ["--r" as string]: `${b.r}deg`, animationDelay: b.d }}>
              <Bean className="h-auto w-full drop-shadow-md" />
            </div>
          </div>
        ))}
        {left && (
          <div className="absolute left-[2%] top-[14%] w-[38%] [transform:translateZ(-40px)_rotate(-9deg)]">
            <BagArt product={left} className="h-auto w-full drop-shadow-[0_24px_24px_rgba(42,28,21,.22)]" />
          </div>
        )}
        {right && (
          <div className="absolute right-[2%] top-[14%] w-[38%] [transform:translateZ(-40px)_rotate(9deg)]">
            <BagArt product={right} className="h-auto w-full drop-shadow-[0_24px_24px_rgba(42,28,21,.22)]" />
          </div>
        )}
        {middle && (
          <div className="absolute left-1/2 top-[4%] w-[44%] [transform:translateX(-50%)_translateZ(60px)]">
            <BagArt product={middle} className="h-auto w-full drop-shadow-[0_32px_30px_rgba(42,28,21,.3)]" />
          </div>
        )}
      </div>
    </div>
  );
}
