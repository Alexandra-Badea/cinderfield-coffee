import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { shipping, shop } from "@/lib/config";
import { formatGBP } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for buying coffee and subscriptions from us.",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Terms"
      intro={`The terms for buying from ${shop.name}. We've kept them short and plain; if anything is unclear, just ask.`}
      updated="31 October 2026"
    >
      <h2>Ordering</h2>
      <p>
        When you place an order you&apos;ll get an email receipt, and if you have an account the order appears there too. Your order is accepted when we take payment. If we can&apos;t fill an order (for example if a coffee sells out after you&apos;ve ordered it), we&apos;ll tell you straight away and refund anything you&apos;ve paid for it.
      </p>

      <h2>Prices</h2>
      <p>
        Prices are in pounds sterling and include VAT where it applies. Delivery is added at checkout: {formatGBP(shipping.standard.price)} for standard delivery and {formatGBP(shipping.express.price)} for express, with free standard delivery on orders over {formatGBP(shop.freeShippingFrom)} and on every subscription. Discount codes can&apos;t be combined.
      </p>

      <h2>Delivery</h2>
      <p>
        We roast on Tuesday and post on Wednesday. Delivery times and what to do if something goes wrong are on our <Link href="/shipping">delivery &amp; returns</Link> page. Your order is your responsibility once it has been delivered to the address you gave us.
      </p>

      <h2>Changing your mind</h2>
      <p>
        You can cancel an order for a full refund until it has been roasted. Because coffee is food, we can&apos;t take back bags once they&apos;ve been opened; unopened bags can be returned within 14 days of delivery. This doesn&apos;t affect your rights if something arrives damaged or isn&apos;t what you ordered.
      </p>

      <h2>Subscriptions</h2>
      <p>
        A subscription renews automatically every 2 or 4 weeks at the price shown when you signed up, and we charge your card before each roast. You can cancel at any time from your account, and nothing more will be charged after the current delivery. If we ever need to change the price, we&apos;ll email you at least two weeks before it applies.
      </p>

      <h2>Reviews</h2>
      <p>
        Reviews come from signed-in customers. We don&apos;t edit them, but we remove ones that are abusive, off-topic or about someone else&apos;s product.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, problems or complaints: email <a href={`mailto:${shop.email}`}>{shop.email}</a> and a person will reply, usually the same working day.
      </p>
    </InfoPage>
  );
}
