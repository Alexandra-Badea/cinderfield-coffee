"use client";

import clsx from "clsx";
import { useRef } from "react";

/**
 * Tilts its contents toward the mouse in 3D. Only with a mouse, and never when the visitor
 * prefers reduced motion. Uses CSS variables so React doesn't re-render on every move.
 */
export function Tilt({ children, className, max = 10 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const can = () => typeof window !== "undefined" && matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;

  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || !can()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  }
  function leave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  }

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={clsx("[perspective:900px]", className)}>
      <div className="h-full transition-transform duration-300 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]">
        {children}
      </div>
    </div>
  );
}
