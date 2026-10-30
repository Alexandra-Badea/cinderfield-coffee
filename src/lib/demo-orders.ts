import { browserStore } from "./browser-store";
import type { Order } from "./types";

/* In demo mode, orders are kept in this browser only. Nothing is sent anywhere. */

export const demoOrders = browserStore<Order[]>("cinderfield:orders:v1", [], (v) => (Array.isArray(v) ? v : []));

/** The order just placed, for the confirmation page (kept for this tab only) */
export const lastOrder = browserStore<Order | null>("cinderfield:last-order", null, (v) => (v && typeof v === "object" ? (v as Order) : null), "session");

export function saveDemoOrder(order: Order) {
  demoOrders.set((list) => [order, ...list].slice(0, 25));
  lastOrder.set(order);
}
