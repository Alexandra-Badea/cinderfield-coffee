import type { PointerEvent as ReactPointerEvent } from "react";
import * as THREE from "three";

/*
 * Drag sideways to spin a bag; let go and it keeps turning, slowing back to a gentle idle spin.
 * Only horizontal drags are taken (touch-action: pan-y on the wrapper), so on a phone the page still scrolls.
 */

export type Spin = { velocity: number; dragging: boolean; lastX: number; moved: number };

export const createSpin = (): Spin => ({ velocity: 0, dragging: false, lastX: 0, moved: 0 });

export function spinHandlers(spin: Spin) {
  return {
    onPointerDown: (e: ReactPointerEvent) => {
      spin.dragging = true;
      spin.lastX = e.clientX;
      spin.moved = 0;
    },
    onPointerMove: (e: ReactPointerEvent) => {
      if (!spin.dragging) return;
      const dx = e.clientX - spin.lastX;
      spin.lastX = e.clientX;
      spin.moved += Math.abs(dx);
      spin.velocity = dx * 0.9; // radians per second, roughly
    },
    onPointerUp: () => {
      spin.dragging = false;
    },
    onPointerLeave: () => {
      spin.dragging = false;
    },
  };
}

/**
 * Turns the object each frame: following the drag, then easing back to the idle speed.
 * With `sway`, an idle object instead settles towards that angle (the nearest full turn of it).
 */
export function stepSpin(spin: Spin, object: THREE.Object3D | null, dt: number, idle: number, opts: { sway?: number } = {}) {
  if (!object) return;
  if (!spin.dragging) spin.velocity = THREE.MathUtils.damp(spin.velocity, idle, 1.4, dt);
  object.rotation.y += spin.velocity * dt;
  if (opts.sway !== undefined && !spin.dragging && Math.abs(spin.velocity) < 0.6) {
    const turns = Math.round((object.rotation.y - opts.sway) / (Math.PI * 2));
    object.rotation.y = THREE.MathUtils.damp(object.rotation.y, opts.sway + turns * Math.PI * 2, 1.2, dt);
  }
}
