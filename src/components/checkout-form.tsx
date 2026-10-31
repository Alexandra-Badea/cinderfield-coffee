"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Info, Lock } from "lucide-react";
import { checkCode } from "@/app/actions";
import { BagArt } from "./bag-art";
import { useCart } from "./cart/cart-provider";
import { buttonClass } from "./ui/button";
import { countries, grinds, shipping } from "@/lib/config";
import { saveDemoOrder } from "@/lib/demo-orders";
import { formatGBP, lineKey, totals } from "@/lib/pricing";
import type { DiscountCode, Order } from "@/lib/types";

const field = "h-12 w-full rounded-2xl border border-line bg-paper px-4 outline-none transition focus:border-espresso/50";

/** Checkout before payments are switched on: the server prices the order exactly as it would for Stripe, but nothing is charged */
export function CheckoutForm() {
  const router = useRouter();
  const { lines, products, ready, code, method, clear } = useCart();
  const [discount, setDiscount] = useState<DiscountCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && code) checkCode(code).then((r) => "code" in r && setDiscount(r.code));
  }, [ready, code]);

  useEffect(() => {
    if (ready && lines.length === 0 && !busy) router.replace("/cart");
  }, [ready, lines.length, busy, router]);

  if (!ready || lines.length === 0) return <div className="mt-10 h-96 animate-pulse rounded-card bg-cream" aria-hidden="true" />;
  const t = totals(lines, products, method, discount);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          code: discount?.code,
          method,
          customer: { email: get("email"), name: get("name"), address: { line1: get("line1"), line2: get("line2"), city: get("city"), postcode: get("postcode"), country: get("country") } },
        }),
      });
      const data = (await res.json()) as { order?: Order; error?: string };
      if (!res.ok || !data.order) throw new Error(data.error ?? "Something went wrong.");
      saveDemoOrder(data.order);
      router.push(`/checkout/success?order=${data.order.id}`);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div className="space-y-6">
        <p className="flex gap-3 rounded-2xl bg-sand/70 p-4 text-sm text-roast">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
          Card payments aren&apos;t switched on for this store yet, so placing an order doesn&apos;t charge you.
        </p>
        <fieldset className="space-y-4 rounded-card bg-cream p-6 shadow-soft">
          <legend className="sr-only">Contact</legend>
          <h2 className="text-2xl">Contact</h2>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" className={field} />
            <p className="mt-1.5 text-xs text-muted">For the order confirmation and delivery updates. We never share your email.</p>
          </div>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">Full name</label>
            <input id="name" name="name" required autoComplete="name" className={field} />
          </div>
        </fieldset>
        <fieldset className="space-y-4 rounded-card bg-cream p-6 shadow-soft">
          <legend className="sr-only">Delivery address</legend>
          <h2 className="text-2xl">Delivery address</h2>
          <div>
            <label htmlFor="line1" className="mb-1.5 block text-sm font-semibold">Address</label>
            <input id="line1" name="line1" required autoComplete="address-line1" className={field} />
          </div>
          <div>
            <label htmlFor="line2" className="mb-1.5 block text-sm font-semibold">Flat, suite, etc. <span className="font-normal text-muted">(optional)</span></label>
            <input id="line2" name="line2" autoComplete="address-line2" className={field} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-semibold">Town or city</label>
              <input id="city" name="city" required autoComplete="address-level2" className={field} />
            </div>
            <div>
              <label htmlFor="postcode" className="mb-1.5 block text-sm font-semibold">Postcode</label>
              <input id="postcode" name="postcode" required autoComplete="postal-code" className={`${field} uppercase`} />
            </div>
          </div>
          <div>
            <label htmlFor="country" className="mb-1.5 block text-sm font-semibold">Country</label>
            <select id="country" name="country" defaultValue="GB" autoComplete="country" className={field}>
              {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
        </fieldset>
      </div>

      <aside className="space-y-4 rounded-card bg-cream p-6 shadow-soft lg:sticky lg:top-28" aria-label="Order summary">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Your order</h2>
          <Link href="/cart" className="text-sm font-semibold underline underline-offset-2 hover:text-ember">Edit</Link>
        </div>
        <ul className="space-y-3">
          {t.lines.map((l) => {
            const p = products.get(l.productId)!;
            return (
              <li key={lineKey(l)} className="flex items-center gap-3">
                <span className="relative w-12 shrink-0 rounded-lg bg-sand/70 p-1">
                  <BagArt product={p} className="h-auto w-full" />
                  <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-espresso px-1 text-[0.7rem] font-bold text-cream">{l.qty}</span>
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block font-medium">{l.name}</span>
                  <span className="block text-muted">{l.size} · {grinds[l.grind].label}{l.every ? ` · every ${l.every} weeks` : ""}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums">{formatGBP(l.lineTotal)}</span>
              </li>
            );
          })}
        </ul>
        <dl className="space-y-2 border-t border-line pt-4 text-[0.95rem]">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatGBP(t.subtotal)}</dd></div>
          {t.discount > 0 && <div className="flex justify-between text-sage"><dt>Discount ({discount?.code})</dt><dd className="tabular-nums">−{formatGBP(t.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">{shipping[method].label}</dt><dd className="tabular-nums">{t.shipping === 0 ? "Free" : formatGBP(t.shipping)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatGBP(t.total)}</dd></div>
        </dl>
        <button type="submit" disabled={busy} className={buttonClass("primary", "lg", "w-full")}>
          <Lock className="h-4 w-4" aria-hidden="true" /> {busy ? "Placing order…" : "Place order"}
        </button>
        {error && <p role="alert" className="text-sm text-ember">{error}</p>}
        <p className="text-center text-xs text-muted">No payment is taken: card payments aren&apos;t switched on yet.</p>
      </aside>
    </form>
  );
}
