"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { browserStore, useBrowserStore, useHydrated } from "@/lib/browser-store";
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

function parse(raw: unknown): Saved {
  const v = (raw ?? {}) as Partial<Saved>;
  return { lines: Array.isArray(v.lines) ? v.lines : [], code: typeof v.code === "string" ? v.code : "", method: v.method === "express" ? "express" : "standard" };
}

/** The bag lives in localStorage, so it survives reloads and stays in step across tabs */
const cart = browserStore<Saved>(KEY, empty, parse);

export function CartProvider({ catalog, children }: { catalog: CartProduct[]; children: React.ReactNode }) {
  const stored = useBrowserStore(cart);
  const ready = useHydrated();
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const products = useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog]);
  // drop lines for coffees that no longer exist
  const saved = useMemo(() => ({ ...stored, lines: stored.lines.filter((l) => products.has(l.productId)) }), [stored, products]);

  const add = useCallback(
    (line: CartLine) => {
      const key = lineKey(line);
      const stock = products.get(line.productId)?.stock ?? 99;
      cart.set((s) => {
        const existing = s.lines.find((l) => lineKey(l) === key);
        const lines = existing
          ? s.lines.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(stock, l.qty + line.qty) } : l))
          : [...s.lines, { ...line, qty: Math.min(stock, line.qty) }];
        return { ...s, lines };
      });
      setLastAdded(key);
      setOpen(true);
    },
    [products],
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
      cart.set((s) => ({
        ...s,
        lines: s.lines
          .map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(products.get(l.productId)?.stock ?? 99, qty) } : l))
          .filter((l) => l.qty > 0),
      })),
    remove: (key) => cart.set((s) => ({ ...s, lines: s.lines.filter((l) => lineKey(l) !== key) })),
    clear: () => cart.set(empty),
    setCode: (code) => cart.set((s) => ({ ...s, code })),
    setMethod: (method) => cart.set((s) => ({ ...s, method })),
    lastAdded,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
