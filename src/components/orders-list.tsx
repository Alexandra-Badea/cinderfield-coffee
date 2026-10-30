import { RefreshCw } from "lucide-react";
import { grinds } from "@/lib/config";
import { formatGBP } from "@/lib/pricing";
import type { Order, OrderStatus } from "@/lib/types";

export const statusStyle: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Awaiting payment", className: "bg-espresso/10 text-roast" },
  paid: { label: "Confirmed", className: "bg-[#f3e3a6] text-[#5a4a0c]" },
  roasting: { label: "Roasting", className: "bg-[#f6c9ad] text-[#7a2f0f]" },
  shipped: { label: "On its way", className: "bg-[#c9d8f0] text-[#1f3a66]" },
  delivered: { label: "Delivered", className: "bg-sage/20 text-[#3c4a2c]" },
  cancelled: { label: "Cancelled", className: "bg-espresso/10 text-muted line-through" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = statusStyle[status];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${s.className}`}>{s.label}</span>;
}

export function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id}>
          <details className="group rounded-card bg-cream shadow-soft">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2 p-5">
              <span className="font-display text-xl">#{o.number}</span>
              <span className="text-sm text-muted">{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              <StatusBadge status={o.status} />
              {o.lines.some((l) => l.every) && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sage">
                  <RefreshCw className="h-3 w-3" aria-hidden="true" /> Subscription
                </span>
              )}
              <span className="ml-auto font-semibold tabular-nums">{formatGBP(o.total)}</span>
            </summary>
            <div className="border-t border-line px-5 pb-5 pt-4">
              <ul className="space-y-1.5 text-sm">
                {o.lines.map((l, i) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span>
                      {l.qty} × {l.name} <span className="text-muted">· {l.size} · {grinds[l.grind].label}{l.every ? ` · every ${l.every} weeks` : ""}</span>
                    </span>
                    <span className="tabular-nums">{formatGBP(l.unitPrice * l.qty)}</span>
                  </li>
                ))}
              </ul>
              {o.address && (
                <p className="mt-3 text-sm text-muted">
                  To {o.name}, {o.address.line1}, {o.address.city} {o.address.postcode}
                </p>
              )}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
