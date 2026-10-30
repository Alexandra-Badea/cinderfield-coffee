"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Flame, PoundSterling, RefreshCw, ShoppingBag } from "lucide-react";
import { BagArt } from "@/components/bag-art";
import { StatusBadge } from "@/components/orders-list";
import { formatGBP } from "@/lib/pricing";
import type { Order, Product } from "@/lib/types";
import { useAdminOrders, useAdminProducts } from "./demo-store";

const DAY = 86_400_000;

export function Dashboard({ live, orders: initialOrders, products: initialProducts }: { live: boolean; orders: Order[] | null; products: Product[] }) {
  const [orders] = useAdminOrders(live, initialOrders, initialProducts);
  const [products] = useAdminProducts(live, initialProducts);
  const [hover, setHover] = useState<number | null>(null);

  const stats = useMemo(() => {
    if (!orders) return null;
    const now = Date.now();
    const valid = orders.filter((o) => o.status !== "cancelled");
    const last30 = valid.filter((o) => now - Date.parse(o.createdAt) < 30 * DAY);
    const prev30 = valid.filter((o) => { const age = now - Date.parse(o.createdAt); return age >= 30 * DAY && age < 60 * DAY; });
    const revenue = last30.reduce((s, o) => s + o.total, 0);
    const days = Array.from({ length: 30 }, (_, i) => {
      const start = new Date(now - (29 - i) * DAY); start.setHours(0, 0, 0, 0);
      const end = start.getTime() + DAY;
      const list = valid.filter((o) => { const t = Date.parse(o.createdAt); return t >= start.getTime() && t < end; });
      return { date: start, total: list.reduce((s, o) => s + o.total, 0), count: list.length };
    });
    const toRoast = valid.filter((o) => o.status === "paid" || o.status === "roasting");
    const bags = new Map<string, number>();
    for (const o of last30) for (const l of o.lines) bags.set(l.productId, (bags.get(l.productId) ?? 0) + l.qty * (l.size === "1kg" ? 4 : 1));
    const subs = new Set(valid.filter((o) => o.lines.some((l) => l.every)).map((o) => o.email)).size;
    return {
      revenue,
      prevRevenue: prev30.reduce((s, o) => s + o.total, 0),
      count: last30.length,
      aov: last30.length ? Math.round(revenue / last30.length) : 0,
      subs,
      days,
      toRoastBags: toRoast.reduce((s, o) => s + o.lines.reduce((n, l) => n + l.qty * (l.size === "1kg" ? 4 : 1), 0), 0),
      toRoastOrders: toRoast.length,
      top: [...bags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [orders]);

  if (!orders || !stats) return <div className="h-96 animate-pulse rounded-card bg-cream" aria-hidden="true" />;
  const byId = new Map(products.map((p) => [p.id, p]));
  const max = Math.max(...stats.days.map((d) => d.total), 1);
  const low = products.filter((p) => p.active && p.stock <= 10).sort((a, b) => a.stock - b.stock);
  const topMax = stats.top[0]?.[1] ?? 1;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: PoundSterling, label: "Revenue, last 30 days", value: formatGBP(stats.revenue), note: stats.prevRevenue ? `${stats.revenue >= stats.prevRevenue ? "+" : ""}${Math.round(((stats.revenue - stats.prevRevenue) / stats.prevRevenue) * 100)}% on the month before` : "First month of sales" },
          { icon: ShoppingBag, label: "Orders, last 30 days", value: String(stats.count), note: `${formatGBP(stats.aov)} average order` },
          { icon: Flame, label: "To roast on Tuesday", value: `${stats.toRoastBags} bags`, note: `${stats.toRoastOrders} orders waiting (1kg counts as 4)` },
          { icon: RefreshCw, label: "Subscribers", value: String(stats.subs), note: "Customers with a repeat order" },
        ].map(({ icon: Icon, label, value, note }) => (
          <div key={label} className="rounded-card bg-cream p-5 shadow-soft">
            <p className="flex items-center gap-2 text-sm text-muted"><Icon className="h-4 w-4 text-ember" aria-hidden="true" /> {label}</p>
            <p className="mt-2 font-display text-4xl">{value}</p>
            <p className="mt-1 text-sm text-muted">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-card bg-cream p-6 shadow-soft" aria-labelledby="rev-title">
          <div className="flex items-baseline justify-between">
            <h2 id="rev-title" className="text-2xl">Sales per day</h2>
            <p className="text-sm text-muted" aria-live="polite">
              {hover !== null
                ? `${stats.days[hover].date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}: ${formatGBP(stats.days[hover].total)} · ${stats.days[hover].count} order${stats.days[hover].count === 1 ? "" : "s"}`
                : "Last 30 days"}
            </p>
          </div>
          <div className="mt-6 flex h-56 items-end gap-[3px]" role="img" aria-label={`Sales per day over the last 30 days, highest ${formatGBP(max)}`} onMouseLeave={() => setHover(null)}>
            {stats.days.map((d, i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                className="group relative flex h-full flex-1 items-end"
                aria-label={`${d.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${formatGBP(d.total)}`}
              >
                <span className={`block w-full rounded-t-md transition-colors ${hover === i ? "bg-ember" : d.date.getDay() === 2 ? "bg-roast" : "bg-roast/45"}`} style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }} />
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>{stats.days[0].date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
            <span>Darker bars are roast days (Tuesdays)</span>
            <span>Today</span>
          </div>
        </section>

        <section className="rounded-card bg-cream p-6 shadow-soft">
          <h2 className="text-2xl">Best sellers</h2>
          <p className="text-sm text-muted">Bags sold in the last 30 days</p>
          <ul className="mt-5 space-y-3">
            {stats.top.map(([id, n]) => {
              const p = byId.get(id);
              if (!p) return null;
              return (
                <li key={id} className="flex items-center gap-3">
                  <span className="w-8 shrink-0"><BagArt product={p} className="h-auto w-full" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between text-sm"><span className="truncate font-medium">{p.name}</span><span className="tabular-nums text-muted">{n}</span></span>
                    <span className="mt-1 block h-2 overflow-hidden rounded-full bg-espresso/10">
                      <span className="block h-full rounded-full" style={{ width: `${(n / topMax) * 100}%`, background: p.art.accent }} />
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-card bg-cream p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Latest orders</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold hover:text-ember">All orders <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                <span className="w-14 font-semibold">#{o.number}</span>
                <span className="min-w-0 flex-1 truncate">{o.name}</span>
                <span className="text-muted">{((n) => `${n} bag${n === 1 ? "" : "s"}`)(o.lines.reduce((n, l) => n + l.qty, 0))}</span>
                <StatusBadge status={o.status} />
                <span className="w-16 text-right font-semibold tabular-nums">{formatGBP(o.total)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-card bg-cream p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-2xl"><AlertTriangle className="h-5 w-5 text-ember" aria-hidden="true" /> Running low</h2>
          {low.length ? (
            <ul className="mt-4 space-y-2">
              {low.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-xl bg-sand/60 px-3 py-2 text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className={`font-semibold tabular-nums ${p.stock <= 5 ? "text-ember" : ""}`}>{p.stock} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-muted">Everything is well stocked.</p>
          )}
          <Link href="/admin/products" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:text-ember">Update stock <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </section>
      </div>
    </div>
  );
}
