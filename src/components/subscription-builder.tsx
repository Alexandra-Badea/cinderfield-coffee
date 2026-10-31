"use client";

import { useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import { BagArt } from "./bag-art";
import { useCart } from "./cart/cart-provider";
import { grinds, shipping, shop, sizes } from "@/lib/config";
import { formatGBP, unitPrice } from "@/lib/pricing";
import type { Every, Grind, Product, Size } from "@/lib/types";

const grindOrder: Grind[] = ["whole", "espresso", "moka", "filter", "cafetiere"];

/** What a subscription costs and saves, for the summary card */
export function subscriptionMaths(product: Product, size: Size, every: Every) {
  const price = unitPrice(product, size, true);
  const full = unitPrice(product, size, false);
  const perYear = 52 / every;
  // bought one bag at a time, delivery is only free over the threshold
  const oneOffDelivery = full >= shop.freeShippingFrom ? 0 : shipping.standard.price;
  return {
    price,
    full,
    perMonth: Math.round((price * perYear) / 12),
    savedPerYear: Math.round((full - price + oneOffDelivery) * perYear),
  };
}

export function SubscriptionBuilder({ products }: { products: Product[] }) {
  const { add } = useCart();
  const list = products.filter((p) => p.active && p.stock > 0);
  const [slug, setSlug] = useState(list[0]?.slug);
  const [size, setSize] = useState<Size>("250g");
  const [grind, setGrind] = useState<Grind>("whole");
  const [every, setEvery] = useState<Every>(4);
  const [added, setAdded] = useState(false);
  const product = list.find((p) => p.slug === slug) ?? list[0];
  if (!product) return null;
  const m = subscriptionMaths(product, size, every);

  function start() {
    add({ productId: product.id, slug: product.slug, name: product.name, size, grind, qty: 1, every });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const step = "flex items-center gap-3 text-sm font-semibold";
  const num = "grid h-7 w-7 place-items-center rounded-full bg-espresso text-xs text-cream";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      <div className="space-y-9">
        <fieldset>
          <legend className={step}><span className={num}>1</span> Pick your coffee</legend>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <label key={p.id} className={`group relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 bg-cream p-3 transition ${p.id === product.id ? "border-espresso" : "border-transparent hover:border-espresso/20"}`}>
                <input type="radio" name="coffee" value={p.slug} checked={p.id === product.id} onChange={() => setSlug(p.slug)} className="sr-only" />
                <BagArt product={p} className="h-auto w-10 shrink-0 transition group-hover:-rotate-3" />
                <span className="min-w-0">
                  <span className="block font-display text-[1.05rem] leading-tight">{p.name}</span>
                  <span className="text-xs text-muted">{p.roast[0].toUpperCase() + p.roast.slice(1)} · {formatGBP(unitPrice(p, "250g", true))}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={step}><span className={num}>2</span> How much?</legend>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(Object.keys(sizes) as Size[]).map((s) => (
              <label key={s} className={`cursor-pointer rounded-2xl border-2 bg-cream p-4 transition ${size === s ? "border-espresso" : "border-transparent hover:border-espresso/20"}`}>
                <input type="radio" name="size" checked={size === s} onChange={() => setSize(s)} className="sr-only" />
                <span className="block font-display text-xl">{sizes[s].label}</span>
                <span className="text-sm text-muted">{sizes[s].cups}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={step}><span className={num}>3</span> Beans or ground?</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {grindOrder.map((g) => (
              <label key={g} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition ${grind === g ? "border-espresso bg-espresso text-cream" : "border-line bg-cream hover:border-espresso/40"}`}>
                <input type="radio" name="grind" checked={grind === g} onChange={() => setGrind(g)} className="sr-only" />
                {grinds[g].label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={step}><span className={num}>4</span> How often?</legend>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {([2, 4] as Every[]).map((e) => (
              <label key={e} className={`cursor-pointer rounded-2xl border-2 bg-cream p-4 transition ${every === e ? "border-espresso" : "border-transparent hover:border-espresso/20"}`}>
                <input type="radio" name="every" checked={every === e} onChange={() => setEvery(e)} className="sr-only" />
                <span className="block font-display text-xl">Every {e} weeks</span>
                <span className="text-sm text-muted">{e === 2 ? "A cup or two a day" : "A cup most days"}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="rounded-[1.75rem] bg-espresso p-7 text-cream shadow-lift lg:sticky lg:top-24" aria-live="polite">
        <div className="flex items-center gap-5">
          <BagArt key={product.id} product={product} className="h-auto w-20 shrink-0 animate-rise drop-shadow-xl" />
          <div>
            <p className="text-sm text-cream/60">Your subscription</p>
            <p className="font-display text-2xl leading-tight">{product.name}</p>
            <p className="mt-1 text-sm text-cream/70">{size} · {grinds[grind].label} · every {every} weeks</p>
          </div>
        </div>
        <dl className="mt-6 space-y-2 border-t border-cream/15 pt-5 text-sm">
          <div className="flex justify-between"><dt className="text-cream/70">Each delivery</dt><dd className="tabular-nums"><span className="mr-2 text-cream/40 line-through">{formatGBP(m.full)}</span><span className="text-lg font-semibold">{formatGBP(m.price)}</span></dd></div>
          <div className="flex justify-between"><dt className="text-cream/70">Delivery</dt><dd className="font-semibold text-[#b9c79f]">Free</dd></div>
          <div className="flex justify-between"><dt className="text-cream/70">About</dt><dd className="tabular-nums">{formatGBP(m.perMonth)} a month</dd></div>
        </dl>
        <p className="mt-5 rounded-xl bg-cream/[0.07] px-4 py-3 text-sm">
          Saves about <strong className="text-[#f3a37e]">{formatGBP(m.savedPerYear)} a year</strong> compared with buying each bag on its own.
        </p>
        <button type="button" onClick={start} className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-ember font-semibold text-white transition hover:bg-ember-dark active:translate-y-px">
          {added ? <><Check className="h-5 w-5" aria-hidden="true" /> Added to your bag</> : <><RefreshCw className="h-5 w-5" aria-hidden="true" /> Start my subscription</>}
        </button>
        <p className="mt-3 text-center text-xs text-cream/55">First bag today, then every {every} weeks. Change or cancel anytime.</p>
      </aside>
    </div>
  );
}
