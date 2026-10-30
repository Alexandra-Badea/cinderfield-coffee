import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Flame, Mail, PackageOpen, PauseCircle, PiggyBank, Truck } from "lucide-react";
import { SubscriptionBuilder } from "@/components/subscription-builder";
import { getProducts } from "@/lib/catalog";
import { shop } from "@/lib/config";

export const metadata: Metadata = {
  title: "Coffee subscriptions",
  description: `Any coffee, roasted fresh and posted every 2 or 4 weeks. ${shop.subscriptionDiscount}% off every bag and free delivery. Skip, swap or cancel anytime.`,
};

const perks = [
  { icon: PiggyBank, t: `${shop.subscriptionDiscount}% off every bag`, d: "For as long as you subscribe." },
  { icon: Truck, t: "Free delivery", d: "On every order, whatever the size." },
  { icon: PauseCircle, t: "Skip, swap or cancel", d: "From your account, in one click." },
];

const timeline = [
  { icon: CalendarClock, t: "Today", d: "Choose your coffee and how often. You pay for the first bag now." },
  { icon: Flame, t: "Tuesday", d: "We roast your coffee in a small batch, with everyone else's." },
  { icon: PackageOpen, t: "Wednesday", d: "Packed in a letterbox-friendly box and posted first class." },
  { icon: Mail, t: "Then, every 2 or 4 weeks", d: "We email three days before each roast, so there's time to skip or swap." },
];

const faqs = [
  { q: "When am I charged?", a: "Your first bag is paid at checkout. After that, your card is charged every 2 or 4 weeks from that day, just before the next roast. No fees and no minimum term." },
  { q: "Can I change my coffee?", a: "Yes. Swap to any coffee in the shop before Monday night and the next delivery will be the new one. Changing size, grind or frequency works the same way." },
  { q: "What if I'm away?", a: "Skip a single delivery or pause for as long as you like from your account. We'll email you before we start again." },
  { q: "How do I cancel?", a: "From your account, any time, without phoning or emailing anyone. If a bag has already been roasted, it still goes out; nothing after that." },
  { q: "Can I give a subscription as a gift?", a: "Gift subscriptions of 3, 6 or 12 deliveries are coming soon. Until then, you can add a gift address at checkout." },
];

export default async function SubscriptionsPage() {
  const products = await getProducts();
  return (
    <>
      <section className="container-x pb-14 pt-12 md:pb-20 md:pt-20">
        <div className="max-w-3xl animate-rise">
          <p className="eyebrow">Subscriptions</p>
          <h1 className="mt-4 text-[2.6rem] leading-[1.04] sm:text-6xl">
            Fresh coffee, <em className="font-normal text-ember">on repeat.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-roast">
            Any coffee from the shop, roasted for you and posted every two or four weeks, so you never open an empty bag on a Monday morning.
          </p>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          {perks.map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex items-center gap-4 rounded-card bg-cream p-5 shadow-soft">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ember/10 text-ember"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span><span className="block font-display text-xl">{t}</span><span className="text-sm text-muted">{d}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-x" aria-labelledby="build-title">
        <h2 id="build-title" className="mb-8 text-3xl md:text-4xl">Build your subscription</h2>
        <SubscriptionBuilder products={products} />
      </section>

      <section className="container-x pt-24 md:pt-32" aria-labelledby="next-title">
        <h2 id="next-title" className="text-3xl md:text-4xl">What happens next</h2>
        <ol className="relative mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
          <span className="absolute left-[1.35rem] top-2 h-[calc(100%-1rem)] w-px bg-line md:left-0 md:top-[1.35rem] md:h-px md:w-full" aria-hidden="true" />
          {timeline.map(({ icon: Icon, t, d }) => (
            <li key={t} className="relative flex gap-4 md:block">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-espresso text-cream ring-8 ring-paper"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span className="md:mt-5 md:block">
                <span className="block font-display text-xl">{t}</span>
                <span className="mt-1 block text-roast">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x grid gap-10 pt-24 md:grid-cols-[1fr_1.6fr] md:pt-32" aria-labelledby="faq-title">
        <div>
          <h2 id="faq-title" className="text-3xl md:text-4xl">Questions, answered</h2>
          <p className="mt-4 text-roast">
            Anything else? Email <a href={`mailto:${shop.email}`} className="font-semibold underline decoration-line underline-offset-2">{shop.email}</a> and a real person will reply.
          </p>
          <p className="mt-4 text-sm text-muted">
            This is a demo shop: subscriptions run through Stripe in test mode when it&apos;s connected. <Link href="/about-this-demo" className="underline underline-offset-2">How it works</Link>.
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-lg transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-roast">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
