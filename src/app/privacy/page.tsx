import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { shop } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What we keep about you, why, and how to ask us to change or delete it.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Privacy"
      intro="We keep as little about you as we can: enough to roast, post and look after your orders. We never sell your details or use advertising trackers."
      updated="31 October 2026"
    >
      <h2>What we keep, and why</h2>
      <ul>
        <li>
          <strong>Your account:</strong> your name, email address and a securely hashed password, so you can sign in and see your orders. We can&apos;t see your password.
        </li>
        <li>
          <strong>Your orders:</strong> your name, email, delivery address and what you bought, so we can roast and post your coffee, deal with returns and keep the records the law asks for.
        </li>
        <li>
          <strong>Payments</strong> are handled by Stripe on their own secure checkout page. Your card details never reach us; we only see that the payment went through.
        </li>
        <li>
          <strong>Our newsletter:</strong> just your email address, until you unsubscribe.
        </li>
        <li>
          <strong>Reviews</strong> show your first name (or the start of your email address) next to what you wrote.
        </li>
      </ul>

      <h2>Cookies and storage</h2>
      <p>
        We use one cookie to keep you signed in, and your browser&apos;s local storage to remember what&apos;s in your bag between visits. Both are needed for the shop to work, so there&apos;s no cookie banner. We don&apos;t use analytics or advertising cookies.
      </p>

      <h2>Who else sees it</h2>
      <ul>
        <li>
          <strong>Stripe</strong> processes payments and subscriptions.
        </li>
        <li>
          <strong>Supabase</strong> hosts our database and sign-ins.
        </li>
        <li>
          <strong>Vercel</strong> hosts the website.
        </li>
        <li>
          <strong>Royal Mail and our couriers</strong> get your name and address to deliver your parcel.
        </li>
      </ul>
      <p>Each only uses your details to provide their service to us.</p>

      <h2>How long we keep it</h2>
      <p>
        Order records are kept for six years, as UK tax law requires. Your account stays until you ask us to close it. Newsletter addresses are deleted when you unsubscribe.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete anything we keep about you, or ask us to stop using it, by emailing <a href={`mailto:${shop.email}`}>{shop.email}</a>. We&apos;ll reply within a month. If you&apos;re not happy with how we handle your data, you can complain to the Information Commissioner&apos;s Office (ICO).
      </p>
    </InfoPage>
  );
}
