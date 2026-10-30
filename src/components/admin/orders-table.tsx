"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { ChevronDown, Search } from "lucide-react";
import { setOrderStatus } from "@/app/admin/actions";
import { statusStyle } from "@/components/orders-list";
import { countries, grinds, shipping } from "@/lib/config";
import { formatGBP } from "@/lib/pricing";
import type { Order, OrderStatus, Product } from "@/lib/types";
import { useAdminOrders } from "./demo-store";

const tabs: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "To roast" },
  { value: "roasting", label: "Roasting" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];
const flow: OrderStatus[] = ["paid", "roasting", "shipped", "delivered", "cancelled"];

/** "2× Guji Natural, 1× Morning Field": the same coffee in different grinds counts together */
function summary(o: Order) {
  const byName = new Map<string, number>();
  for (const l of o.lines) byName.set(l.name, (byName.get(l.name) ?? 0) + l.qty);
  return [...byName].map(([name, n]) => `${n}× ${name}`).join(", ");
}

export function OrdersTable({ live, orders: initial, products }: { live: boolean; orders: Order[] | null; products: Product[] }) {
  const [orders, setStatus] = useAdminOrders(live, initial, products);
  const [tab, setTab] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  const visible = useMemo(() => {
    if (!orders) return [];
    const s = q.trim().toLowerCase();
    return orders.filter((o) => (tab === "all" || o.status === tab) && (!s || `${o.number} ${o.name} ${o.email} ${o.address?.city ?? ""}`.toLowerCase().includes(s)));
  }, [orders, tab, q]);

  if (!orders) return <div className="h-96 animate-pulse rounded-card bg-cream" aria-hidden="true" />;

  function change(o: Order, status: OrderStatus) {
    setError(null);
    const before = o.status;
    setStatus(o.id, status); // show it straight away, undo if the server says no
    start(async () => {
      const r = await setOrderStatus(o.id, status);
      if (!r.ok) {
        setError(r.error);
        setStatus(o.id, before);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filter orders by status" className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const n = t.value === "all" ? orders.length : orders.filter((o) => o.status === t.value).length;
            return (
              <button key={t.value} role="tab" aria-selected={tab === t.value} type="button" onClick={() => setTab(t.value)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${tab === t.value ? "bg-espresso text-cream" : "bg-cream hover:bg-sand"}`}>
                {t.label} <span className={tab === t.value ? "text-cream/60" : "text-muted"}>{n}</span>
              </button>
            );
          })}
        </div>
        <label className="relative block lg:w-72">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, city or #" className="h-10 w-full rounded-full border border-line bg-cream pl-9 pr-4 text-sm outline-none focus:border-espresso/50" />
        </label>
      </div>
      {error && <p role="alert" className="rounded-xl bg-ember/10 px-4 py-2 text-sm text-ember">{error}</p>}

      <div className="overflow-x-auto rounded-card bg-cream shadow-soft">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-3 py-3 font-semibold">Date</th>
              <th className="px-3 py-3 font-semibold">Customer</th>
              <th className="px-3 py-3 font-semibold">Items</th>
              <th className="px-3 py-3 text-right font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((o) => (
              <Fragment key={o.id}>
                <tr className="hover:bg-sand/30">
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id} className="inline-flex items-center gap-1 font-semibold hover:text-ember">
                      #{o.number} <ChevronDown className={`h-4 w-4 transition ${open === o.id ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted">{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                  <td className="px-3 py-3"><span className="block font-medium">{o.name}</span><span className="text-muted">{o.address?.city}</span></td>
                  <td className="px-3 py-3 text-muted">{summary(o)}</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatGBP(o.total)}</td>
                  <td className="px-5 py-3">
                    <select value={o.status} onChange={(e) => change(o, e.target.value as OrderStatus)} aria-label={`Status of order ${o.number}`} className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${statusStyle[o.status].className}`}>
                      {flow.map((s) => <option key={s} value={s}>{statusStyle[s].label}</option>)}
                    </select>
                  </td>
                </tr>
                {open === o.id && (
                  <tr className="bg-sand/30">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Items</p>
                          <ul className="space-y-1">
                            {o.lines.map((l, i) => (
                              <li key={i} className="flex justify-between gap-4">
                                <span>{l.qty} × {l.name} · {l.size} · {grinds[l.grind].label}{l.every ? ` · every ${l.every} weeks` : ""}</span>
                                <span className="tabular-nums">{formatGBP(l.unitPrice * l.qty)}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 text-muted">Subtotal {formatGBP(o.subtotal)}{o.discount ? ` · discount −${formatGBP(o.discount)}${o.code ? ` (${o.code})` : ""}` : ""} · delivery {o.shipping ? formatGBP(o.shipping) : "free"}</p>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Ship to</p>
                          {o.address ? (
                            <address className="not-italic">
                              {o.name}<br />{o.address.line1}<br />{o.address.city}, {o.address.postcode}<br />{countries.find((c) => c.code === o.address?.country)?.name}
                            </address>
                          ) : <p className="text-muted">No address</p>}
                          <p className="mt-2 text-muted">{shipping[o.shippingMethod].label} · {o.email}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="p-10 text-center text-muted">No orders here.</p>}
      </div>
    </div>
  );
}
