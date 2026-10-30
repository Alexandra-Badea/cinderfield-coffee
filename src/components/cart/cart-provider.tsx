"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { lineKey } from "@/lib/pricing";
import type { CartLine, Product, ShippingMethod } from "@/lib/types";

/** What the cart needs to know about each coffee: enough to price it and draw its bag */
export type CartProduct = Pick<Product, "id" | "slug" | "name" | "origin" | "price250" | "price1kg" | "stock" | "roastLevel" | "art" | "decaf">;

type Saved = { lines: CartLine[]; code: string; method: ShippingMethod };
type CartContext = Saved & {
  ready: boolean;
  count: number;
  products: Map<string, CartProduct>;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setCode: (code: string) => void;
  setMethod: (method: ShippingMethod) => void;
  lastAdded: string | null;
};

const KEY = "cinderfield:cart:v1";
const empty: Saved = { lines: [], code: "", method: "standard" };
const Ctx = createContext<CartContext | null>(null);

function read(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const v = JSON.parse(raw) as Partial<Saved>;
    return { lines: Array.isArray(v.lines) ? v.lines : [], code: v.code ?? "", method: v.method === "express" ? "express" : "standard" };
  } catch {
    return empty;
  }
}

export function CartProvider({ catalog, children }: { catalog: CartProduct[]; children: React.ReactNode }) {
  const [saved, setSaved] = useState<Saved>(empty);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const products = useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog]);

  // Load the saved cart after the first render (the server has no localStorage), and follow other tabs
  useEffect(() => {
    const load = () => {
      const v = read();
      // drop lines for coffees that no longer exist
      setSaved({ ...v, lines: v.lines.filter((l) => products.has(l.productId)) });
    };
    load();
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && load();
    addEventListener("storage", onStorage);
    return () => removeEventListener("storage", onStorage);
  }, [products]);

  const update = useCallback((fn: (s: Saved) => Saved) => {
    setSaved((s) => {
      const next = fn(s);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // private browsing or storage full: the cart still works for this visit
      }
      return next;
    });
  }, []);

  const add = useCallback(
    (line: CartLine) => {
      const key = lineKey(line);
      const stock = products.get(line.productId)?.stock ?? 99;
      update((s) => {
        const existing = s.lines.find((l) => lineKey(l) === key);
        const lines = existing
          ? s.lines.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(stock, l.qty + line.qty) } : l))
          : [...s.lines, { ...line, qty: Math.min(stock, line.qty) }];
        return { ...s, lines };
      });
      setLastAdded(key);
      setOpen(true);
    },
    [products, update],
  );

  const value: CartContext = {
    ...saved,
    ready,
    count: saved.lines.reduce((n, l) => n + l.qty, 0),
    products,
    open,
    setOpen,
    add,
    setQty: (key, qty) =>
      update((s) => ({
        ...s,
        lines: s.lines
          .map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(products.get(l.productId)?.stock ?? 99, qty) } : l))
          .filter((l) => l.qty > 0),
      })),
    remove: (key) => update((s) => ({ ...s, lines: s.lines.filter((l) => lineKey(l) !== key) })),
    clear: () => update(() => empty),
    setCode: (code) => update((s) => ({ ...s, code })),
    setMethod: (method) => update((s) => ({ ...s, method })),
    lastAdded,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
