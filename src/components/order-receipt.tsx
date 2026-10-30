import { Check, Flame, Package, Truck } from "lucide-react";
import { countries, grinds, shipping } from "@/lib/config";
import { formatGBP } from "@/lib/pricing";
import type { Order } from "@/lib/types";

const steps = [
  { icon: Check, t: "Order confirmed", d: "We've got it." },
  { icon: Flame, t: "Roasting", d: "Your coffee is roasted on Tuesday." },
  { icon: Package, t: "Packed and posted", d: "On Wednesday, with tracking." },
  { icon: Truck, t: "Delivered", d: "Through your letterbox." },
];

export function OrderReceipt({ order }: { order: Order }) {
  const country = countries.find((c) => c.code === order.address?.country)?.name ?? order.address?.country;
  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
      <div className="space-y-6">
        <ol className="grid gap-3 sm:grid-cols-4">
          {steps.map(({ icon: Icon, t, d }, i) => (
            <li key={t} className={`rounded-2xl p-4 ${i === 0 ? "bg-espresso text-cream" : "bg-cream shadow-soft"}`}>
              <Icon className={`h-5 w-5 ${i === 0 ? "text-[#f3a37e]" : "text-ember"}`} aria-hidden="true" />
              <p className="mt-3 font-semibold">{t}</p>
              <p className={`text-sm ${i === 0 ? "text-cream/70" : "text-muted"}`}>{d}</p>
            </li>
          ))}
        </ol>
        {order.address && (
          <div className="rounded-card bg-cream p-6 shadow-soft">
            <h2 className="text-xl">Delivering to</h2>
            <address className="mt-2 not-italic text-roast">
              {order.name}
              <br />
              {order.address.line1}
              {order.address.line2 ? <>, {order.address.line2}</> : null}
              <br />
              {order.address.city}, {order.address.postcode}
              <br />
              {country}
            </address>
            <p className="mt-3 text-sm text-muted">{shipping[order.shippingMethod].label}: {shipping[order.shippingMethod].eta} after posting.</p>
          </div>
        )}
      </div>
      <div className="rounded-card bg-cream p-6 shadow-soft">
        <h2 className="text-xl">Order #{order.number}</h2>
        <ul className="mt-4 space-y-3">
          {order.lines.map((l, i) => (
            <li key={i} className="flex justify-between gap-4 text-sm">
              <span>
                <span className="font-medium">{l.qty} × {l.name}</span>
                <span className="block text-muted">{l.size} · {grinds[l.grind].label}{l.every ? ` · every ${l.every} weeks` : ""}</span>
              </span>
              <span className="tabular-nums">{formatGBP(l.unitPrice * l.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatGBP(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-sage"><dt>Discount{order.code ? ` (${order.code})` : ""}</dt><dd className="tabular-nums">−{formatGBP(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="tabular-nums">{order.shipping === 0 ? "Free" : formatGBP(order.shipping)}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatGBP(order.total)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
