"use client";

import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Product } from "@/lib/types";

export type BagProduct = Pick<Product, "slug" | "name" | "origin" | "roastLevel" | "art" | "decaf">;

/*
 * A coffee pouch in 3D: a box with a pillowed front and back that tapers to a crimped seal at the top,
 * printed with the same artwork as the flat SVG bags. The artwork is drawn on a canvas so it uses the
 * site's own fonts.
 */

export const BAG = { width: 2.16, height: 2.9, depth: 0.74 };

// ---------- Artwork ----------

/** The SVG bag is 240×340; the printable front of the pouch is the part from x 12–228 and y 36–326 */
const FACE = { x: 12, y: 36, w: 216, h: 290 };
const TEX_W = 1024;
const TEX_H = Math.round((TEX_W * FACE.h) / FACE.w);

function twoLines(name: string): string[] {
  if (name.length <= 11 || !name.includes(" ")) return [name];
  const mid = name.length / 2;
  let best = -1;
  for (let i = 0; i < name.length; i++) if (name[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return [name.slice(0, best), name.slice(best + 1)];
}

function fonts() {
  const css = getComputedStyle(document.documentElement);
  return {
    display: css.getPropertyValue("--font-bricolage").trim() || "Helvetica, sans-serif",
    sans: css.getPropertyValue("--font-instrument").trim() || "Helvetica, sans-serif",
  };
}

function spaced(ctx: CanvasRenderingContext2D, px: number) {
  // letterSpacing isn't in every browser yet; without it the text is simply set tighter
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`;
}

function pattern(ctx: CanvasRenderingContext2D, art: BagProduct["art"]) {
  const { accent, ink, label } = art;
  const stroke = (d: string, width: number, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = accent;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke(new Path2D(d));
    ctx.globalAlpha = 1;
  };
  const fill = (d: string, color: string, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fill(new Path2D(d));
    ctx.globalAlpha = 1;
  };
  const circle = (x: number, y: number, r: number, color: string, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  switch (art.pattern) {
    case "waves":
      for (let i = 0; i < 4; i++) stroke(`M30 ${150 + i * 17} q18 -12 36 0 t36 0 t36 0 t36 0 t36 0`, 5, 1 - i * 0.18);
      break;
    case "hills":
      fill("M28 214 L28 176 Q70 140 112 168 T212 150 L212 214 Z", accent, 0.35);
      fill("M28 214 L28 190 Q86 158 140 186 T212 176 L212 214 Z", accent, 0.7);
      circle(170, 152, 11, accent);
      break;
    case "sun":
      circle(120, 200, 46, accent, 0.9);
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (i * Math.PI) / 8;
        stroke(`M${120 + Math.cos(a) * 56} ${200 + Math.sin(a) * 56}L${120 + Math.cos(a) * 72} ${200 + Math.sin(a) * 72}`, 5);
      }
      break;
    case "dots":
      for (let i = 0; i < 30; i++) circle(40 + (i % 6) * 32 + (Math.floor(i / 6) % 2) * 16, 142 + Math.floor(i / 6) * 15, 4.2, accent, 0.35 + (i % 3) * 0.25);
      break;
    case "stripes":
      for (let i = 0; i < 10; i++) stroke(`M${i * 26 - 20} 220 L${i * 26 + 40} 130`, 9, 0.75);
      break;
    case "moon":
      circle(150, 170, 26, accent);
      circle(162, 162, 23, label);
      for (const [x, y] of [[62, 150], [92, 182], [74, 202], [190, 200], [118, 146]]) fill(`M${x} ${y - 6}l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z`, accent);
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.stroke(new Path2D("M28 214 Q120 196 212 214"));
      ctx.globalAlpha = 1;
      break;
  }
}

/** Paper texture, top fold and tin tie: shared by the front and back */
function body(ctx: CanvasRenderingContext2D, art: BagProduct["art"]) {
  ctx.fillStyle = art.bag;
  ctx.fillRect(FACE.x, FACE.y, FACE.w, FACE.h);
  // fine paper fibres
  const rand = mulberry(7);
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = rand() > 0.5 ? "#000" : "#fff";
    ctx.fillRect(FACE.x + rand() * FACE.w, FACE.y + rand() * FACE.h, 0.8 + rand() * 1.6, 0.25);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(0,0,0,.08)";
  ctx.fillRect(FACE.x, 58, FACE.w, 26);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = art.ink;
  ctx.beginPath();
  ctx.roundRect(10, 66, 220, 9, 4.5);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas() {
  const c = document.createElement("canvas");
  c.width = TEX_W;
  c.height = TEX_H;
  const ctx = c.getContext("2d")!;
  ctx.scale(TEX_W / FACE.w, TEX_H / FACE.h);
  ctx.translate(-FACE.x, -FACE.y);
  return { c, ctx };
}

function drawFront(product: BagProduct) {
  const { art } = product;
  const f = fonts();
  const { c, ctx } = canvas();
  body(ctx, art);
  ctx.textAlign = "center";
  ctx.fillStyle = art.ink;
  ctx.globalAlpha = 0.75;
  ctx.font = `600 10px ${f.sans}`;
  spaced(ctx, 3);
  ctx.fillText("CINDERFIELD", 120, 104);
  ctx.globalAlpha = 1;

  ctx.fillStyle = art.label;
  ctx.beginPath();
  ctx.roundRect(28, 120, 184, 190, 12);
  ctx.fill();
  ctx.save();
  ctx.clip(new Path2D("M40 120 H200 A12 12 0 0 1 212 132 V216 H28 V132 A12 12 0 0 1 40 120 Z"));
  pattern(ctx, art);
  ctx.restore();

  const lines = twoLines(product.name);
  const top = lines.length === 2 ? 238 : 252;
  ctx.fillStyle = art.ink;
  spaced(ctx, -0.4);
  ctx.font = `600 21px ${f.display}`;
  lines.forEach((l, i) => ctx.fillText(l, 120, top + i * 22));
  ctx.globalAlpha = 0.7;
  spaced(ctx, 1.5);
  ctx.font = `500 9.5px ${f.sans}`;
  ctx.fillText((product.decaf ? "DECAF · " : "") + product.origin.toUpperCase(), 120, top + lines.length * 22 - 2);
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = art.ink;
  ctx.lineWidth = 1.5;
  for (let n = 1; n <= 5; n++) {
    ctx.beginPath();
    ctx.arc(83 + (n - 1) * 18.5, 296, 4.5, 0, Math.PI * 2);
    if (n <= product.roastLevel) ctx.fill();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return c;
}

function drawBack(product: BagProduct) {
  const { art } = product;
  const f = fonts();
  const { c, ctx } = canvas();
  body(ctx, art);
  ctx.fillStyle = art.label;
  ctx.beginPath();
  ctx.roundRect(46, 150, 148, 120, 10);
  ctx.fill();
  ctx.fillStyle = art.ink;
  ctx.textAlign = "left";
  ctx.font = `600 8px ${f.sans}`;
  spaced(ctx, 1.6);
  ctx.fillText("ROASTED ON", 60, 172);
  ctx.fillText("BEST FROM", 60, 214);
  ctx.globalAlpha = 0.3;
  ctx.fillRect(60, 188, 120, 1.2);
  ctx.fillRect(60, 230, 120, 1.2);
  ctx.globalAlpha = 1;
  ctx.font = `500 15px ${f.display}`;
  spaced(ctx, -0.2);
  ctx.fillText("Tuesday", 60, 186);
  ctx.fillText("Saturday", 60, 228);
  ctx.globalAlpha = 0.6;
  ctx.font = `500 7.5px ${f.sans}`;
  spaced(ctx, 0.6);
  ctx.fillText("250g · roasted in small batches", 60, 254);
  ctx.globalAlpha = 1;
  // barcode
  const rand = mulberry(product.slug.length * 31);
  for (let x = 84; x < 156; ) {
    const w = 0.8 + rand() * 2.2;
    ctx.fillRect(x, 290, w, 22);
    x += w + 0.8 + rand() * 2;
  }
  return c;
}

const cache = new Map<string, { front: THREE.CanvasTexture; back: THREE.CanvasTexture }>();

/** The printed front and back for a bag, drawn once the site's fonts have loaded and then reused */
export function useBagTextures(product: BagProduct) {
  const gl = useThree((s) => s.gl);
  const [textures, setTextures] = useState(() => cache.get(product.slug) ?? null);
  useEffect(() => {
    if (cache.has(product.slug)) return;
    let live = true;
    const f = fonts();
    Promise.all([document.fonts.load(`600 21px ${f.display}`), document.fonts.load(`600 10px ${f.sans}`)])
      .catch(() => null)
      .then(() => {
        const make = (c: HTMLCanvasElement) => {
          const t = new THREE.CanvasTexture(c);
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
          return t;
        };
        const made = { front: make(drawFront(product)), back: make(drawBack(product)) };
        cache.set(product.slug, made);
        if (live) setTextures(made);
      });
    return () => {
      live = false;
    };
  }, [product, gl]);
  return textures;
}

// ---------- Shape ----------

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

let pouch: THREE.BufferGeometry | null = null;
/** A box, puffed in the middle and pressed flat towards the top seal, like a filled coffee pouch */
function pouchGeometry() {
  if (pouch) return pouch;
  const { width: W, height: H, depth: D } = BAG;
  const g = new THREE.BoxGeometry(W, H, D, 24, 32, 6);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const t = (y + H / 2) / H;
    const nx = x / (W / 2);
    const taper = 1 - smooth(0.6, 0.98, t) * 0.92;
    const pillow = 0.8 + 0.2 * (1 - nx * nx);
    p.setZ(i, p.getZ(i) * taper * pillow);
    p.setX(i, x * (1 - 0.035 * smooth(0.7, 1, t)));
  }
  g.computeVertexNormals();
  pouch = g;
  return g;
}

let crimp: THREE.BufferGeometry | null = null;
/** The heat-sealed, zig-zag crimped top */
function crimpGeometry() {
  if (crimp) return crimp;
  const w = BAG.width * 0.965;
  const teeth = 26;
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  for (let i = 0; i <= teeth; i++) s.lineTo(-w / 2 + (i * w) / teeth, i % 2 ? 0.2 : 0.14);
  s.lineTo(w / 2, 0);
  s.lineTo(-w / 2, 0);
  crimp = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false });
  crimp.translate(0, 0, -0.025);
  return crimp;
}

export function Bag({ product, ...props }: { product: BagProduct } & Omit<React.ComponentProps<"group">, "children">) {
  const textures = useBagTextures(product);
  const side = useMemo(() => new THREE.MeshStandardMaterial({ color: product.art.bag, roughness: 0.78 }), [product.art.bag]);
  const seal = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color(product.art.bag).multiplyScalar(0.88), roughness: 0.7 }), [product.art.bag]);
  const faces = useMemo(() => {
    if (!textures) return [side, side, side, side, side, side];
    const front = new THREE.MeshStandardMaterial({ map: textures.front, roughness: 0.58 });
    const back = new THREE.MeshStandardMaterial({ map: textures.back, roughness: 0.62 });
    // BoxGeometry material order: +x, -x, +y, -y, +z (front), -z (back)
    return [side, side, side, side, front, back];
  }, [textures, side]);
  return (
    <group {...props}>
      <mesh geometry={pouchGeometry()} material={faces} castShadow />
      <mesh geometry={crimpGeometry()} material={seal} position={[0, BAG.height / 2 - 0.03, 0]} />
    </group>
  );
}
