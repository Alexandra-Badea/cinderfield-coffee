import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2, Info, RefreshCw } from "lucide-react";
import { NameForm } from "@/components/account-forms";
import { AuthForms } from "@/components/auth-forms";
import { DemoAccount } from "@/components/demo-account";
import { OrdersList } from "@/components/orders-list";
import { buttonClass } from "@/components/ui/button";
import { hasSupabase, isLive, shop } from "@/lib/config";
import { listSubscriptions, type SubscriptionSummary } from "@/lib/subscriptions";
import { userClient } from "@/lib/supabase/clients";
import { toOrder, type OrderRow } from "@/lib/supabase/map";
import { manageSubscription, signOut } from "./actions";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

type SP = Promise<Record<string, string | string[] | undefined>>;

const notices: Record<string, { tone: "good" | "bad"; text: string }> = {
  welcome: { tone: "good", text: "Welcome! Your email is confirmed and your account is ready." },
  password: { tone: "good", text: "Your password has been changed." },
  link: { tone: "bad", text: "That link has expired or has already been used. Please try again." },
  portal: { tone: "bad", text: "We couldn't open the subscription page just now. Please try again in a minute." },
  "no-subscription": { tone: "bad", text: "There's no subscription on this account yet." },
};

export default function AccountPage({ searchParams }: { searchParams: SP }) {
  return (
    <div className="container-x pt-12 md:pt-16">
      <p className="eyebrow">Your account</p>
      {hasSupabase ? (
        <Suspense fallback={<div className="mt-10 h-72 animate-pulse rounded-card bg-cream" aria-hidden="true" />}>
          <LiveAccount searchParams={searchParams} />
        </Suspense>
      ) : (
        <>
          <h1 className="mt-3 text-5xl md:text-6xl">Your orders</h1>
          <div className="mt-10">
            <DemoAccount />
          </div>
        </>
      )}
    </div>
  );
}

function Notice({ code }: { code?: string }) {
  const n = code ? notices[code] : undefined;
  if (!n) return null;
  const Icon = n.tone === "good" ? CheckCircle2 : Info;
  return (
    <p role="status" className={`mt-6 flex gap-3 rounded-2xl p-4 ${n.tone === "good" ? "bg-sage/15 text-[#3c4a2c]" : "bg-ember/10 text-ember"}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> {n.text}
    </p>
  );
}

async function LiveAccount({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const notice = one("welcome") ? "welcome" : (one("updated") ?? one("error"));
  const next = one("next");

  const supabase = await userClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return (
      <>
        <h1 className="mt-3 text-5xl md:text-6xl">Sign in</h1>
        <p className="mt-4 max-w-xl text-lg text-roast">See your orders, manage your subscription and check out faster.</p>
        <Notice code={notice} />
        <div className="mt-10">
          <AuthForms next={next?.startsWith("/") && !next.startsWith("//") ? next : "/account"} />
        </div>
      </>
    );
  }

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("full_name, role, stripe_customer_id").eq("id", auth.user.id).single(),
    supabase.from("orders").select("*, order_items(*)").neq("status", "pending").order("created_at", { ascending: false }),
  ]);
  const list = ((orders ?? []) as OrderRow[]).map(toOrder);
  const subscriptions = isLive && profile?.stripe_customer_id ? await listSubscriptions(profile.stripe_customer_id) : [];
  const name = profile?.full_name || "";

  return (
    <>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl md:text-6xl">{name ? `Hello, ${name.split(" ")[0]}` : "Hello"}</h1>
        <div className="flex gap-2">
          {profile?.role === "admin" && (
            <Link href="/admin" className={buttonClass("outline")}>
              Shop admin
            </Link>
          )}
          <form action={signOut}>
            <button type="submit" className={buttonClass("ghost")}>Sign out</button>
          </form>
        </div>
      </div>
      <Notice code={notice} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-card bg-cream p-6 shadow-soft" aria-labelledby="details-title">
            <h2 id="details-title" className="text-2xl">Your details</h2>
            <div className="mt-5 space-y-5">
              <NameForm name={name} />
              <div>
                <p className="text-sm font-semibold">Email</p>
                <p className="mt-1 text-roast">{auth.user.email}</p>
              </div>
              <Link href="/account/password" className="inline-block text-sm font-semibold underline decoration-line underline-offset-2 hover:text-ember">
                Change your password
              </Link>
            </div>
          </section>

          <section className="rounded-card bg-cream p-6 shadow-soft" aria-labelledby="subs-title">
            <h2 id="subs-title" className="flex items-center gap-2 text-2xl">
              <RefreshCw className="h-5 w-5 text-ember" aria-hidden="true" /> Subscriptions
            </h2>
            {subscriptions.length ? (
              <>
                <ul className="mt-5 space-y-3">
                  {subscriptions.map((s) => (
                    <Subscription key={s.id} s={s} />
                  ))}
                </ul>
                <form action={manageSubscription} className="mt-5">
                  <button type="submit" className={buttonClass("dark", "md", "w-full")}>Update card or cancel</button>
                  <p className="mt-2 text-center text-xs text-muted">Opens a secure page from Stripe, our payment provider.</p>
                </form>
              </>
            ) : (
              <p className="mt-3 text-roast">
                No subscriptions yet. Any coffee can come every 2 or 4 weeks, with{" "}
                <Link href="/subscriptions" className="font-semibold underline decoration-line underline-offset-2 hover:text-ember">{shop.subscriptionDiscount}% off and free delivery</Link>.
              </p>
            )}
          </section>
        </div>

        <section aria-labelledby="orders-title">
          <h2 id="orders-title" className="text-3xl">Your orders</h2>
          <div className="mt-5">
            {list.length ? (
              <OrdersList orders={list} />
            ) : (
              <p className="text-muted">
                No orders yet.{" "}
                <Link href="/shop" className="underline underline-offset-2">
                  Find a coffee you&apos;ll love
                </Link>
                .
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

const tone: Record<SubscriptionSummary["status"], string> = {
  active: "bg-sage/20 text-[#3c4a2c]",
  attention: "bg-ember/15 text-ember",
  paused: "bg-espresso/10 text-roast",
  ended: "bg-espresso/10 text-muted",
};

function Subscription({ s }: { s: SubscriptionSummary }) {
  const date = s.date ? new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : null;
  return (
    <li className="rounded-2xl bg-paper p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{s.items.join(", ")}</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone[s.status]}`}>{s.statusLabel}</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        {s.every ? `Every ${s.every} weeks` : "Repeating"}
        {date && (s.cancelling ? ` · last delivery ${date}` : s.status === "active" ? ` · next one ${date}` : "")}
      </p>
    </li>
  );
}
