"use client";

import { useMemo, useState } from "react";
import { browserStore, useBrowserStore, useNow } from "@/lib/browser-store";
import { makeDemoOrders } from "@/lib/demo-data";
import { demoOrders } from "@/lib/demo-orders";
import type { DiscountCode, Order, OrderStatus, Product } from "@/lib/types";
import type { ProductPatch } from "@/app/admin/actions";

/*
 * The demo admin keeps its changes in this browser, so you can try it without breaking anything for anyone else.
 * Live, each hook keeps a local copy of the server data for instant (optimistic) updates.
 */

type Saved = { status: Record<string, OrderStatus>; products: Record<string, ProductPatch>; codes: DiscountCode[]; codeActive: Record<string, boolean> };
const blank: Saved = { status: {}, products: {}, codes: [], codeActive: {} };

export const adminChanges = browserStore<Saved>("cinderfield:admin:v1", blank, (v) => ({ ...blank, ...(v as Partial<Saved>) }));

/** Orders for the admin: the real ones when live; otherwise a generated month plus any demo orders from this browser */
export function useAdminOrders(live: boolean, initial: Order[] | null, products: Product[]) {
  const [liveOrders, setLiveOrders] = useState(initial);
  const saved = useBrowserStore(adminChanges);
  const mine = useBrowserStore(demoOrders);
  const now = useNow();

  const generated = useMemo(() => (live || !now ? null : makeDemoOrders(products, now)), [live, now, products]);
  const orders = useMemo(() => {
    if (live) return liveOrders;
    if (!generated) return null; // still on the server: the month is built from the visitor's clock
    // the visitor's own orders keep the number they saw at checkout
    const all = [...mine, ...generated];
    return all.map((o) => (saved.status[o.id] ? { ...o, status: saved.status[o.id] } : o));
  }, [live, liveOrders, generated, mine, saved.status]);

  function setStatus(id: string, status: OrderStatus) {
    if (live) setLiveOrders((list) => list && list.map((o) => (o.id === id ? { ...o, status } : o)));
    else adminChanges.set((s) => ({ ...s, status: { ...s.status, [id]: status } }));
  }
  return [orders, setStatus] as const;
}

export function useAdminProducts(live: boolean, initial: Product[]) {
  const [liveList, setLiveList] = useState(initial);
  const saved = useBrowserStore(adminChanges);
  const list = useMemo(() => (live ? liveList : initial.map((p) => (saved.products[p.id] ? { ...p, ...saved.products[p.id] } : p))), [live, liveList, initial, saved.products]);

  function saveProduct(id: string, patch: ProductPatch) {
    if (live) setLiveList((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    else adminChanges.set((s) => ({ ...s, products: { ...s.products, [id]: patch } }));
  }
  return [list, saveProduct] as const;
}

export function useAdminCodes(live: boolean, initial: DiscountCode[]) {
  const [liveList, setLiveList] = useState(initial);
  const saved = useBrowserStore(adminChanges);
  const list = useMemo(
    () => (live ? liveList : [...saved.codes, ...initial].map((c) => (c.code in saved.codeActive ? { ...c, active: saved.codeActive[c.code] } : c))),
    [live, liveList, initial, saved.codes, saved.codeActive],
  );

  function setActive(code: string, active: boolean) {
    if (live) setLiveList((l) => l.map((c) => (c.code === code ? { ...c, active } : c)));
    else adminChanges.set((s) => ({ ...s, codeActive: { ...s.codeActive, [code]: active } }));
  }
  function addCode(code: DiscountCode) {
    if (live) setLiveList((l) => [code, ...l]);
    else adminChanges.set((s) => ({ ...s, codes: [code, ...s.codes] }));
  }
  return [list, { setActive, addCode }] as const;
}
