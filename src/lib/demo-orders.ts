import type { Order } from "./types";

/* In demo mode, orders are kept in this browser only. Nothing is sent anywhere. */

const KEY = "cinderfield:orders:v1";

export function readDemoOrders(): Order[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function saveDemoOrder(order: Order) {
  try {
    localStorage.setItem(KEY, JSON.stringify([order, ...readDemoOrders()].slice(0, 25)));
  } catch {
    // storage unavailable: the confirmation page still shows the order from this visit
  }
}

export function updateDemoOrder(id: string, patch: Partial<Order>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(readDemoOrders().map((o) => (o.id === id ? { ...o, ...patch } : o))));
  } catch {
    // ignore
  }
}
