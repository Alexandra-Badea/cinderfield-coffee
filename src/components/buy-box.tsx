"use client";

import { useState } from "react";
import { Check, Minus, Plus, RefreshCw, ShoppingBag } from "lucide-react";
import { useCart } from "./cart/cart-provider";
import { useSearch } from "@/lib/browser-store";
import { grinds, shop, sizes } from "@/lib/config";
import { formatGBP, unitPrice } from "@/lib/pricing";
import type { Every, Grind, Product, Size } from "@/lib/types";

const grindOrder: Grind[] = ["whole", "espresso", "moka", "filter", "cafetiere"];

export function BuyBox({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState<Size>("250g");
  // The coffee finder links here with ?grind=… and ?plan=subscribe already chosen; the visitor's own pick wins
  const url = new URLSearchParams(useSearch());
  const urlGrind = url.get("grind");
  const [grindPick, setGrind] = useState<Grind | null>(null);
  const grind: Grind = grindPick ?? (urlGrind && urlGrind in grinds ? (urlGrind as Grind) : "whole");
  const [planPick, setPlan] = useState<"once" | "subscribe" | null>(null);
  const plan = planPick ?? (url.get("plan") === "subscribe" ? "subscribe" : "once");
  const [every, setEvery] = useState<Every>(4);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const subscribe = plan === "subscribe";
  const price = unitPrice(product, size, subscribe);
  const full = unitPrice(product, size, false);
  const soldOut = product.stock < 1;

  function addToBag() {
    add({ productId: product.id, slug: product.slug, name: product.name, size, grind, qty, every: subscribe ? every : undefined });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-7">
      <p className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold tabular-nums">{formatGBP(price * qty)}</span>
        {subscribe && <span className="text-lg text-muted line-through tabular-nums">{formatGBP(full * qty)}</span>}
        {qty > 1 && <span className="text-sm text-muted">({formatGBP(price)} each)</span>}
      </p>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Size</legend>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(sizes) as Size[]).map((s) => (
            <label key={s} className={`cursor-pointer rounded-2xl border-2 p-4 transition ${size === s ? "border-espresso bg-cream" : "border-line bg-cream/50 hover:border-espresso/30"}`}>
              <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} className="sr-only" />
              <span className="flex items-baseline justify-between">
                <span className="font-display text-xl">{sizes[s].label}</span>
                <span className="font-semibold tabular-nums">{formatGBP(unitPrice(product, s, subscribe))}</span>
              </span>
              <span className="mt-1 block text-sm text-muted">{sizes[s].cups}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">
          Grind <span className="font-normal text-muted">· {grinds[grind].hint}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {grindOrder.map((g) => (
            <label key={g} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition ${grind === g ? "border-espresso bg-espresso text-cream" : "border-line bg-cream hover:border-espresso/40"}`}>
              <input type="radio" name="grind" value={g} checked={grind === g} onChange={() => setGrind(g)} className="sr-only" />
              {grinds[g].label}
              {product.bestFor[0] === g && <span className={`ml-1.5 text-xs ${grind === g ? "text-cream/70" : "text-ember"}`}>· best</span>}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-semibold">How often?</legend>
        <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition ${!subscribe ? "border-espresso bg-cream" : "border-line bg-cream/50"}`}>
          <input type="radio" name="plan" checked={!subscribe} onChange={() => setPlan("once")} className="h-4 w-4 accent-[#2a1c15]" />
          <span className="flex-1 font-medium">One-time purchase</span>
          <span className="tabular-nums">{formatGBP(full)}</span>
        </label>
        <label className={`block cursor-pointer rounded-2xl border-2 p-4 transition ${subscribe ? "border-espresso bg-cream" : "border-line bg-cream/50"}`}>
          <span className="flex items-center gap-3">
            <input type="radio" name="plan" checked={subscribe} onChange={() => setPlan("subscribe")} className="h-4 w-4 accent-[#2a1c15]" />
            <span className="flex-1 font-medium">
              Subscribe &amp; save {shop.subscriptionDiscount}%
              <span className="ml-2 inline-block whitespace-nowrap rounded-full bg-sage/15 px-2 py-0.5 text-xs font-semibold text-sage">Free delivery</span>
            </span>
            <span className="tabular-nums">{formatGBP(unitPrice(product, size, true))}</span>
          </span>
          {subscribe && (
            <span className="mt-3 flex items-center gap-2 pl-7 text-sm">
              <RefreshCw className="h-4 w-4 text-sage" aria-hidden="true" />
              Deliver every
              <select value={every} onChange={(e) => setEvery(Number(e.target.value) as Every)} className="rounded-full border border-line bg-paper px-3 py-1.5 font-medium" aria-label="Delivery frequency">
                <option value={2}>2 weeks</option>
                <option value={4}>4 weeks</option>
              </select>
              <span className="text-muted">· change or cancel anytime</span>
            </span>
          )}
        </label>
      </fieldset>

      <div className="flex gap-3">
        <div className="inline-flex h-13 items-center rounded-full border border-line bg-cream">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-13 w-12 place-items-center rounded-l-full hover:bg-espresso/5" aria-label="Fewer bags">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite" aria-label={`${qty} bags`}>
            {qty}
          </span>
          <button type="button" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={qty >= product.stock} className="grid h-13 w-12 place-items-center rounded-r-full hover:bg-espresso/5 disabled:opacity-30" aria-label="More bags">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={addToBag}
          disabled={soldOut}
          className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-ember px-6 font-semibold text-white shadow-[0_10px_24px_-10px_rgb(200_90_42/0.8)] transition hover:bg-ember-dark active:translate-y-px disabled:bg-espresso/30 disabled:shadow-none"
        >
          {soldOut ? "Sold out" : added ? (<><Check className="h-5 w-5" /> Added</>) : (<><ShoppingBag className="h-5 w-5" /> {subscribe ? "Start subscription" : "Add to bag"}</>)}
        </button>
      </div>
      <p className="text-sm text-muted">
        {soldOut
          ? "Sold out for now. We roast it again next week."
          : product.stock <= 8
            ? `Only ${product.stock} bags left from this week's roast.`
            : "In stock: roasted Tuesday, posted Wednesday."}
      </p>
    </div>
  );
}
