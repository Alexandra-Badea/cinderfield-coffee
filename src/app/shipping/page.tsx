import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { countries, shipping, shop } from "@/lib/config";
import { formatGBP } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Delivery & returns",
  description: `Roasted Tuesday, posted Wednesday. Free UK delivery over ${formatGBP(shop.freeShippingFrom)} and on every subscription.`,
};

export default function ShippingPage() {
  const abroad = countries.filter((c) => c.code !== "GB").map((c) => c.name);
  return (
    <InfoPage
      eyebrow="Help"
      title="Delivery & returns"
      intro="We roast every Tuesday and post on Wednesday, so your coffee arrives a few days after roasting, which is when it tastes best."
    >
      <div className="not-prose mt-10 overflow-hidden rounded-card bg-cream shadow-soft">
        <table className="w-full text-left text-[0.95rem]">
          <caption className="sr-only">Delivery options</caption>
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Option</th>
              <th scope="col" className="hidden px-3 py-3 font-semibold sm:table-cell">Arrives</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-espresso">
            {Object.values(shipping).map((s) => (
              <tr key={s.label}>
                <td className="px-5 py-4 font-medium">
                  {s.label}
                  <span className="mt-0.5 block text-sm font-normal text-muted sm:hidden">{s.eta} after posting</span>
                </td>
                <td className="hidden px-3 py-4 text-muted sm:table-cell">{s.eta} after posting</td>
                <td className="px-5 py-4 text-right tabular-nums">{formatGBP(s.price)}</td>
              </tr>
            ))}
            <tr className="bg-sage/10">
              <td className="px-5 py-4 font-medium">
                Orders over {formatGBP(shop.freeShippingFrom)}, and subscriptions
                <span className="mt-0.5 block text-sm font-normal text-muted sm:hidden">{shipping.standard.eta} after posting</span>
              </td>
              <td className="hidden px-3 py-4 text-muted sm:table-cell">{shipping.standard.eta} after posting</td>
              <td className="px-5 py-4 text-right font-semibold text-sage">Free</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>When will it arrive?</h2>
      <p>
        Orders placed by <strong>midnight on Monday</strong> are roasted on Tuesday and posted on Wednesday. Order later in the week and it goes into the next Tuesday&apos;s roast. We email you a tracking link as soon as your parcel leaves.
      </p>
      <p>Our boxes fit through most letterboxes, so you don&apos;t need to be home.</p>

      <h2>Outside the UK</h2>
      <p>
        We also post to {abroad.slice(0, -1).join(", ")} and {abroad.at(-1)}. Prices are the same; international parcels usually take 3 to 7 working days. Customs charges outside the EU and UK are paid by the receiver.
      </p>

      <h2>Something wrong?</h2>
      <p>
        Coffee is food, so we can&apos;t take back opened bags. But if your parcel arrives damaged, you got the wrong grind, or the coffee just isn&apos;t for you, email <a href={`mailto:${shop.email}`}>{shop.email}</a> within 30 days and we&apos;ll send a replacement or refund you. No forms, no photos of the bag needed.
      </p>
      <p>
        Subscriptions can be changed or cancelled at any time; see <Link href="/subscriptions">how subscriptions work</Link>.
      </p>
    </InfoPage>
  );
}
