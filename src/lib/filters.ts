import type { Rating } from "./catalog";
import type { Product } from "./types";

export type ShopQuery = {
  q?: string;
  roast?: string;
  type?: string;
  flavour?: string;
  sort?: string;
};

export const roastOptions = [
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "dark", label: "Dark" },
];
export const typeOptions = [
  { value: "single", label: "Single origin" },
  { value: "blend", label: "Blends" },
  { value: "decaf", label: "Decaf" },
];
export const flavourOptions = [
  { value: "chocolate", label: "Chocolate & nuts" },
  { value: "fruit", label: "Fruity" },
  { value: "floral", label: "Floral" },
  { value: "caramel", label: "Caramel" },
];
export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "rating", label: "Top rated" },
  { value: "new", label: "Newest" },
];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export function parseQuery(sp: Record<string, string | string[] | undefined>): ShopQuery {
  // footer links use ?decaf=1, which is the same as the Decaf filter
  return { q: one(sp.q), roast: one(sp.roast), type: one(sp.type) ?? (one(sp.decaf) ? "decaf" : undefined), flavour: one(sp.flavour), sort: one(sp.sort) };
}

/** Builds a shop URL that changes one filter and keeps the rest. Choosing the active value again clears it. */
export function hrefWith(query: ShopQuery, key: keyof ShopQuery, value: string | undefined) {
  const next = { ...query, [key]: query[key] === value ? undefined : value };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v && !(k === "sort" && v === "featured")) params.set(k, v);
  const s = params.toString();
  return s ? `/shop?${s}` : "/shop";
}

export function filterProducts(products: Product[], query: ShopQuery, ratings: Record<string, Rating>) {
  const q = query.q?.trim().toLowerCase();
  let list = products.filter((p) => {
    if (query.roast && p.roast !== query.roast) return false;
    if (query.type === "decaf" && !p.decaf) return false;
    if (query.type === "blend" && p.process !== "blend") return false;
    if (query.type === "single" && (p.process === "blend" || p.decaf)) return false;
    if (query.flavour && !p.flavour.includes(query.flavour as Product["flavour"][number])) return false;
    if (q) {
      const hay = [p.name, p.origin, p.region, p.process, p.varietal, ...p.notes].join(" ").toLowerCase();
      if (!q.split(/\s+/).every((word) => hay.includes(word))) return false;
    }
    return true;
  });
  switch (query.sort) {
    case "price-asc":
      list = [...list].sort((a, b) => a.price250 - b.price250);
      break;
    case "price-desc":
      list = [...list].sort((a, b) => b.price250 - a.price250);
      break;
    case "rating":
      list = [...list].sort((a, b) => (ratings[b.id]?.average ?? 0) - (ratings[a.id]?.average ?? 0));
      break;
    case "new":
      list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    default:
      list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }
  return list;
}
