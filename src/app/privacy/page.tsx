import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import { shop } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What this demo shop stores about you (very little), where, and why.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Privacy"
      intro="Cinderfield is a demo shop, so this page describes exactly what the code stores, in plain English. A real shop would add its company details and a lawful basis for each item."
      updated="30 October 2026"
    >
      <h2>In demo mode</h2>
      <p>This is how the public preview runs. Nothing about you leaves your browser:</p>
      <ul>
        <li>
          <strong>Your bag</strong> is saved in your browser&apos;s local storage (<code>cinderfield:cart:v1</code>), so it&apos;s still there if you reload.
        </li>
        <li>
          <strong>Demo orders</strong> you place are kept in local storage too (<code>cinderfield:orders:v1</code>), so the account page can show them. The name, email and address you type are never sent to a database.
        </li>
        <li>
          <strong>Changes you make in the demo admin</strong> stay in your browser (<code>cinderfield:admin:v1</code>), so you can&apos;t affect anyone else.
        </li>
        <li>
          <strong>Newsletter sign-ups</strong> are checked and then discarded.
        </li>
      </ul>
      <p>Clearing your browser&apos;s site data removes all of it. There are no cookies, no analytics and no advertising trackers.</p>

      <h2>In live mode</h2>
      <p>When the shop is connected to Supabase and Stripe:</p>
      <ul>
        <li>
          <strong>Accounts:</strong> your email and a hashed password are stored by Supabase Auth. A sign-in cookie keeps you signed in; it&apos;s strictly necessary, so there&apos;s no cookie banner.
        </li>
        <li>
          <strong>Orders:</strong> your name, email, delivery address and what you bought are stored so we can roast, post and help with returns.
        </li>
        <li>
          <strong>Payments</strong> are handled by Stripe on their own checkout page. Card details never reach this site&apos;s server.
        </li>
        <li>
          <strong>Newsletter:</strong> just your email, until you unsubscribe.
        </li>
        <li>
          <strong>Reviews</strong> show your first name (or the start of your email address) and are linked to your account.
        </li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete anything stored about you by emailing <a href={`mailto:${shop.email}`}>{shop.email}</a>. In a real shop you could also complain to the Information Commissioner&apos;s Office (ICO) in the UK.
      </p>
    </InfoPage>
  );
}
