"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { saveProduct, type ProductPatch } from "@/app/admin/actions";
import { BagArt } from "@/components/bag-art";
import type { Product } from "@/lib/types";
import { useAdminProducts, writeSaved } from "./demo-store";

const pounds = (p: number) => (p / 100).toFixed(2);
const pence = (s: string) => Math.round(parseFloat(s) * 100);

function Row({ product, onSaved }: { product: Product; onSaved: (p: Product) => void }) {
  const [form, setForm] = useState({ p250: pounds(product.price250), p1kg: pounds(product.price1kg), stock: String(product.stock), active: product.active, featured: product.featured });
  const [state, setState] = useState<"idle" | "saved" | string>("idle");
  const [pending, start] = useTransition();
  const patch: ProductPatch = { price250: pence(form.p250), price1kg: pence(form.p1kg), stock: Number(form.stock), active: form.active, featured: form.featured };
  const dirty = patch.price250 !== product.price250 || patch.price1kg !== product.price1kg || patch.stock !== product.stock || patch.active !== product.active || patch.featured !== product.featured;

  function save() {
    start(async () => {
      const r = await saveProduct(product.id, patch);
      if (!r.ok) return setState(r.error);
      if (r.demo) writeSaved((s) => ({ ...s, products: { ...s.products, [product.id]: patch } }));
      onSaved({ ...product, ...patch });
      setState("saved");
      setTimeout(() => setState("idle"), 1800);
    });
  }
  const input = "h-9 w-full rounded-lg border border-line bg-paper px-2 text-right tabular-nums outline-none focus:border-espresso/50";
  return (
    <tr className={form.active ? "" : "opacity-55"}>
      <td className="px-5 py-3">
        <span className="flex items-center gap-3">
          <span className="w-9 shrink-0"><BagArt product={product} className="h-auto w-full" /></span>
          <span><span className="block font-medium">{product.name}</span><span className="text-muted">{product.origin}</span></span>
        </span>
      </td>
      <td className="px-2 py-3"><label className="flex items-center gap-1"><span className="text-muted">£</span><input aria-label={`${product.name} 250g price`} inputMode="decimal" value={form.p250} onChange={(e) => setForm({ ...form, p250: e.target.value })} className={input} /></label></td>
      <td className="px-2 py-3"><label className="flex items-center gap-1"><span className="text-muted">£</span><input aria-label={`${product.name} 1kg price`} inputMode="decimal" value={form.p1kg} onChange={(e) => setForm({ ...form, p1kg: e.target.value })} className={input} /></label></td>
      <td className="px-2 py-3"><input aria-label={`${product.name} stock`} inputMode="numeric" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value.replace(/\D/g, "") })} className={`${input} ${Number(form.stock) <= 5 ? "text-ember" : ""}`} /></td>
      <td className="px-2 py-3 text-center"><input type="checkbox" aria-label={`${product.name} featured`} checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-[#c85a2a]" /></td>
      <td className="px-2 py-3 text-center"><input type="checkbox" aria-label={`${product.name} on sale`} checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-[#2a1c15]" /></td>
      <td className="px-5 py-3 text-right">
        {state === "saved" ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-sage"><Check className="h-4 w-4" aria-hidden="true" /> Saved</span>
        ) : (
          <button type="button" onClick={save} disabled={!dirty || pending} className="rounded-full bg-espresso px-4 py-1.5 text-sm font-semibold text-cream disabled:opacity-30">
            {pending ? "Saving…" : "Save"}
          </button>
        )}
        {state !== "idle" && state !== "saved" && <p role="alert" className="mt-1 text-xs text-ember">{state}</p>}
      </td>
    </tr>
  );
}

export function ProductsTable({ live, products: initial }: { live: boolean; products: Product[] }) {
  const [products, setProducts] = useAdminProducts(live, initial);
  return (
    <div className="overflow-x-auto rounded-card bg-cream shadow-soft">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-5 py-3 font-semibold">Coffee</th>
            <th className="w-28 px-2 py-3 font-semibold">250g</th>
            <th className="w-28 px-2 py-3 font-semibold">1kg</th>
            <th className="w-24 px-2 py-3 font-semibold">Stock</th>
            <th className="w-20 px-2 py-3 text-center font-semibold">Featured</th>
            <th className="w-20 px-2 py-3 text-center font-semibold">On sale</th>
            <th className="w-28 px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((p) => (
            <Row key={`${p.id}-${p.price250}-${p.stock}-${p.active}-${p.featured}`} product={p} onSaved={(next) => setProducts((list) => list.map((x) => (x.id === next.id ? next : x)))} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
