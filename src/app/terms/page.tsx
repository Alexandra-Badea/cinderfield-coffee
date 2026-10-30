import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { shop } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using this demo shop.",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Terms"
      intro="The short version: this is a portfolio project. Nothing here is for sale, and nothing you do here creates a contract."
      updated="30 October 2026"
    >
      <h2>A demo, not a shop</h2>
      <p>
        Cinderfield Coffee Roasters doesn&apos;t exist. The coffees, farms, prices, reviews and people in the admin are examples written for this demo. Orders are never fulfilled and, in demo mode, nobody is charged. When the shop runs in live mode, Stripe is used in <strong>test mode</strong> only, with test cards.
      </p>
      <p>Please don&apos;t enter real card details, and use a made-up address if you try the checkout.</p>

      <h2>What a real shop would say here</h2>
      <p>For anyone using this as a starting point, a UK coffee shop&apos;s terms would usually cover:</p>
      <ul>
        <li>who the seller is, with company number and address;</li>
        <li>how orders are accepted, and that prices include VAT;</li>
        <li>delivery times and what happens if a parcel is lost (see <Link href="/shipping">delivery &amp; returns</Link>);</li>
        <li>the 14-day cancellation right for online orders, and why opened food can&apos;t be returned;</li>
        <li>how subscriptions renew, and how to cancel them at any time;</li>
        <li>how reviews are moderated.</li>
      </ul>

      <h2>The code</h2>
      <p>
        The code behind this site is open source under the MIT licence. See <Link href="/about-this-demo">about this demo</Link> for what&apos;s built and how to run it. Questions: <a href={`mailto:${shop.email}`}>{shop.email}</a>.
      </p>
    </InfoPage>
  );
}
