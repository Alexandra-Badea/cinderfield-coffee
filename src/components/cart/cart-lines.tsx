"use client";

import Link from "next/link";
import { Minus, Plus, RefreshCw, X } from "lucide-react";
import { BagArt } from "@/components/bag-art";
import { grinds } from "@/lib/config";
import { formatGBP, lineKey, unitPrice } from "@/lib/pricing";
import { useCart } from "./cart-provider";

export function CartLines({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const { lines, products, setQty, remove, lastAdded } = useCart();
  return (
    <ul className="divide-y divide-line">
      {lines.map((line) => {
        const p = products.get(line.productId);
        if (!p) return null;
        const key = lineKey(line);
        const price = unitPrice(p, line.size, Boolean(line.every));
        const atMax = line.qty >= p.stock;
        return (
          <li key={key} className={`flex gap-4 py-4 ${lastAdded === key ? "animate-rise" : ""}`}>
            <Link href={`/coffee/${p.slug}`} onClick={onNavigate} className={`shrink-0 rounded-xl bg-sand/70 p-1.5 ${compact ? "w-16" : "w-20"}`}>
              <BagArt product={p} className="h-auto w-full" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/coffee/${p.slug}`} onClick={onNavigate} className="font-display text-lg leading-tight hover:text-ember">
                    {p.name}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted">
                    {line.size} · {grinds[line.grind].label}
                  </p>
                  {line.every && (
                    <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-sage/15 px-2 py-0.5 text-xs font-semibold text-sage">
                      <RefreshCw className="h-3 w-3" aria-hidden="true" /> Every {line.every} weeks
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(key)}
                  className="-mr-1 rounded-full p-1.5 text-muted transition hover:bg-espresso/5 hover:text-espresso"
                  aria-label={`Remove ${p.name} from your bag`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="inline-flex items-center rounded-full border border-line bg-cream">
                  <button type="button" onClick={() => setQty(key, line.qty - 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-espresso/5" aria-label={`One fewer ${p.name}`}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(key, line.qty + 1)}
                    disabled={atMax}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-espresso/5 disabled:opacity-30"
                    aria-label={`One more ${p.name}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="font-semibold tabular-nums">{formatGBP(price * line.qty)}</p>
              </div>
              {atMax && <p className="mt-1 text-xs text-ember">That&apos;s all we have roasted right now.</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
