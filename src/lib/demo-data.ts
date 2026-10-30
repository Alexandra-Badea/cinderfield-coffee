import { totals } from "./pricing";
import type { CartLine, Grind, Order, OrderStatus, Product, ShippingMethod, Size } from "./types";

/** A small seeded random generator, so the demo admin shows the same believable month every time */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const first = ["Hannah", "Tom", "Priya", "Marcus", "Ella", "Jonah", "Sofia", "Liam", "Grace", "Noah", "Amira", "Ben", "Chloe", "Oscar", "Maya", "Daniel", "Ruth", "Sam", "Isla", "Arjun", "Freya", "Leo", "Zara", "Callum"];
const last = ["Walker", "Patel", "Hughes", "Okafor", "Bennett", "Murphy", "Khan", "Fletcher", "Price", "Ward", "Reid", "Shah", "Morgan", "Doyle", "Lloyd"];
const places = [
  ["Bristol", "BS"], ["Leeds", "LS"], ["Manchester", "M"], ["Brighton", "BN"], ["Edinburgh", "EH"], ["Cardiff", "CF"],
  ["Norwich", "NR"], ["York", "YO"], ["Bath", "BA"], ["Glasgow", "G"], ["London", "E"], ["Oxford", "OX"],
];
const streets = ["Harbour Street", "Mill Lane", "Station Road", "Orchard Close", "Victoria Road", "Church Street", "Park Avenue", "Queen's Road"];
const grindsList: Grind[] = ["whole", "espresso", "filter", "cafetiere", "moka"];

/**
 * About sixty orders over the last 30 days, ending at `now`. Older orders are delivered,
 * recent ones are waiting to be roasted, the way a real roastery's week looks.
 */
export function makeDemoOrders(products: Product[], now: number): Order[] {
  const r = rng(20261030);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const day = 86_400_000;
  const orders: Order[] = [];
  const catalogue = new Map(products.map((p) => [p.id, p]));
  // favourites sell more often
  const weighted = products.flatMap((p) => Array(p.featured ? 4 : 2).fill(p) as Product[]);

  for (let i = 0; i < 62; i++) {
    const age = Math.pow(r(), 1.15) * 30; // a little busier recently
    const created = now - age * day - r() * 3_600_000;
    const lines: CartLine[] = [];
    const n = r() < 0.6 ? 1 : r() < 0.8 ? 2 : 3;
    for (let k = 0; k < n; k++) {
      const p = pick(weighted);
      const size: Size = r() < 0.2 ? "1kg" : "250g";
      const every = r() < 0.18 ? (r() < 0.5 ? 2 : 4) : undefined;
      const grind = r() < 0.5 ? p.bestFor[0] : pick(grindsList);
      const existing = lines.find((l) => l.productId === p.id && l.size === size && l.grind === grind && l.every === every);
      if (existing) existing.qty++;
      else lines.push({ productId: p.id, slug: p.slug, name: p.name, size, grind, qty: r() < 0.85 ? 1 : 2, every });
    }
    const method: ShippingMethod = r() < 0.15 ? "express" : "standard";
    const t = totals(lines, catalogue, method);
    let status: OrderStatus = age > 6 ? "delivered" : age > 3 ? "shipped" : age > 1.5 ? "roasting" : "paid";
    if (r() < 0.035) status = "cancelled";
    const f = pick(first), l = pick(last), [city, pc] = pick(places);
    orders.push({
      id: `demo-seed-${i}`,
      number: 0,
      createdAt: new Date(created).toISOString(),
      email: `${f.toLowerCase()}.${l.toLowerCase()}@example.com`,
      name: `${f} ${l}`,
      address: { line1: `${1 + Math.floor(r() * 120)} ${pick(streets)}`, city, postcode: `${pc}${1 + Math.floor(r() * 20)} ${1 + Math.floor(r() * 9)}${"ABDEFGHJ"[Math.floor(r() * 8)]}${"LNPQRSTU"[Math.floor(r() * 8)]}`, country: "GB" },
      shippingMethod: method,
      lines: t.lines.map((x) => ({ productId: x.productId, name: x.name, size: x.size, grind: x.grind, qty: x.qty, unitPrice: x.unitPrice, every: x.every })),
      subtotal: t.subtotal,
      discount: 0,
      shipping: t.shipping,
      total: t.total,
      code: null,
      status,
    });
  }
  orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  orders.forEach((o, i) => (o.number = 1001 + i));
  return orders.reverse();
}
