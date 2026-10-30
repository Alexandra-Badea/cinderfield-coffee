"use client";

import { useEffect, useState } from "react";
import { makeDemoOrders } from "@/lib/demo-data";
import { readDemoOrders } from "@/lib/demo-orders";
import type { DiscountCode, Order, OrderStatus, Product } from "@/lib/types";
import type { ProductPatch } from "@/app/admin/actions";

/* The demo admin keeps its changes in this browser, so you can try it without breaking anything for anyone else. */

type Saved = { status: Record<string, OrderStatus>; products: Record<string, ProductPatch>; codes: DiscountCode[]; codeActive: Record<string, boolean> };
const KEY = "cinderfield:admin:v1";
const blank: Saved = { status: {}, products: {}, codes: [], codeActive: {} };

export function readSaved(): Saved {
  try {
    return { ...blank, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return blank;
  }
}
export function writeSaved(fn: (s: Saved) => Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(fn(readSaved())));
  } catch {
    // storage unavailable: changes last until the page reloads
  }
}

/** Orders for the admin: the real ones when live; otherwise a generated month plus any demo orders from this browser */
export function useAdminOrders(live: boolean, initial: Order[] | null, products: Product[]) {
  const [orders, setOrders] = useState<Order[] | null>(live ? initial : null);
  useEffect(() => {
    if (live) return;
    const saved = readSaved();
    const mine = readDemoOrders();
    const generated = makeDemoOrders(products, Date.now());
    const top = generated[0]?.number ?? 1000;
    const all = [...mine.map((o, i) => ({ ...o, number: top + mine.length - i })), ...generated];
    setOrders(all.map((o) => (saved.status[o.id] ? { ...o, status: saved.status[o.id] } : o)));
  }, [live, products]);
  return [orders, setOrders] as const;
}

export function useAdminProducts(live: boolean, initial: Product[]) {
  const [list, setList] = useState(initial);
  useEffect(() => {
    if (live) return;
    const saved = readSaved().products;
    setList(initial.map((p) => (saved[p.id] ? { ...p, ...saved[p.id] } : p)));
  }, [live, initial]);
  return [list, setList] as const;
}

export function useAdminCodes(live: boolean, initial: DiscountCode[]) {
  const [list, setList] = useState(initial);
  useEffect(() => {
    if (live) return;
    const s = readSaved();
    setList([...s.codes, ...initial].map((c) => (c.code in s.codeActive ? { ...c, active: s.codeActive[c.code] } : c)));
  }, [live, initial]);
  return [list, setList] as const;
}
