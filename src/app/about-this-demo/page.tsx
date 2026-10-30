import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BarChart3, CreditCard, Database, Gauge, Heart, LayoutDashboard, Lock, Search, ShieldCheck, ShoppingBag, Sparkles, TestTube, UserRound, type LucideIcon,
} from "lucide-react";
import { Mark } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { hasSupabase, isLive, repoUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "About this demo",
  description: "Cinderfield is a made-up coffee roaster with a real, working online shop: Next.js, Supabase and Stripe. Here's what's built and how it works.",
};

const tryThese: { href: string; icon: LucideIcon; t: string; d: string }[] = [
  { href: "/shop", icon: ShoppingBag, t: "Buy a coffee", d: "Use the code WELCOME10 at the bag. Checkout takes no payment." },
  { href: "/finder", icon: Sparkles, t: "Take the coffee finder", d: "Four questions, one match, ground the right way." },
  { href: "/account", icon: UserRound, t: "See your orders", d: "Orders you place show up here, with their status." },
  { href: "/admin", icon: LayoutDashboard, t: "Run the shop", d: "The owner's dashboard: sales, orders, stock and codes." },
];

const built: { icon: LucideIcon; t: string; items: string[] }[] = [
  {
    icon: Search,
    t: "Shopping",
    items: [
      "Catalogue with search, filters (roast, type, flavour) and sorting, all in the URL so results can be shared",
      "Product pages with tasting notes, a brew recipe, reviews and structured data for Google",
      "A bag that slides in, remembers itself between visits and shows how far you are from free delivery",
      "Discount codes (percentage, fixed amount, free delivery, minimum spend)",
      "Subscriptions every 2 or 4 weeks, at 10% off with free delivery",
      "A coffee finder quiz and brew guides with a ratio calculator",
    ],
  },
  {
    icon: CreditCard,
    t: "Checkout & payments",
    items: [
      "Stripe Checkout for one-off orders and subscriptions, in test mode",
      "The server re-prices every bag from the database: the browser never decides what anyone pays",
      "A Stripe webhook confirms payment, saves the address and takes the bags out of stock, only once even when Stripe sends the same event twice",
      "Delivery options, with free standard delivery over £35",
    ],
  },
  {
    icon: Database,
    t: "Accounts & data",
    items: [
      "Supabase Postgres for products, orders, reviews and discount codes",
      "Email and password accounts with Supabase Auth; customers see their own order history",
      "Row Level Security on every table: customers can only ever read their own orders, and only admins can change products",
    ],
  },
  {
    icon: BarChart3,
    t: "Shop admin",
    items: [
      "Dashboard with 30-day sales, best sellers, low stock and what to roast on Tuesday",
      "Orders that move from paid to roasting, shipped and delivered, with search and filters",
      "Edit prices and stock, feature a coffee or take it off sale; the shop updates straight away",
      "Create and switch off discount codes",
    ],
  },
];

const quality: { icon: LucideIcon; t: string; d: string }[] = [
  { icon: Gauge, t: "Fast", d: "Pages are pre-rendered and the catalogue is cached, so most pages load as static HTML. Only the parts that depend on you load on demand." },
  { icon: Heart, t: "Accessible", d: "Works with a keyboard and screen reader: real buttons and labels, visible focus, skip link, and no animation for people who turn motion off." },
  { icon: ShieldCheck, t: "Safe by default", d: "Prices, stock and discounts are checked on the server; admin pages are locked by the database itself, not just hidden." },
  { icon: TestTube, t: "Tested", d: "Automated tests for pricing, discounts, the coffee finder and every database security rule, run against a real Postgres in memory." },
];

const stack = ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Supabase", "PostgreSQL", "Stripe", "Vitest", "Vercel"];

const notBuilt = [
  "Emails (order confirmations, roast reminders): they'd go through a service like Resend, triggered by the same webhook.",
  "Renewal orders: Stripe bills each subscription renewal, but the shop doesn't yet turn that into a new order to roast.",
  "A page for customers to skip or change a subscription: Stripe's customer portal would handle most of it.",
  "Product photos: the bags are drawn in code, which keeps the demo light and consistent.",
];

export default function AboutThisDemo() {
  const mode = isLive ? "live" : hasSupabase ? "partly connected" : "demo";
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="grain pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]" aria-hidden="true" />
        <div className="container-x relative pb-16 pt-12 md:pb-24 md:pt-20">
          <div className="max-w-3xl animate-rise">
            <p className="eyebrow">About this demo</p>
            <h1 className="mt-4 text-[2.6rem] leading-[1.04] sm:text-6xl">
              A made-up roastery. <em className="font-normal text-ember">A real, working shop.</em>
            </h1>
            <p className="mt-6 text-lg text-roast">
              Cinderfield doesn&apos;t exist, but everything you can click does. It&apos;s a complete online shop for a small coffee roaster, built to show what a small business can have: a shop people enjoy using, and an admin the owner can actually run.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={repoUrl} className={buttonClass("dark", "lg")}>
                View the code on GitHub <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link href="/shop" className={buttonClass("outline", "lg")}>
                Try the shop
              </Link>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-sm text-muted shadow-soft">
              <span className={`h-2 w-2 rounded-full ${isLive ? "bg-sage" : "bg-ember"}`} aria-hidden="true" /> Running in {mode} mode
            </p>
          </div>
        </div>
      </section>

      <section className="container-x" aria-labelledby="try-title">
        <h2 id="try-title" className="text-3xl md:text-4xl">Try it in two minutes</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tryThese.map(({ href, icon: Icon, t, d }, i) => (
            <Link key={href} href={href} className="group flex flex-col rounded-card bg-cream p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
              <span className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-ember/10 text-ember"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="font-display text-3xl text-espresso/15">0{i + 1}</span>
              </span>
              <span className="mt-5 font-display text-xl">{t}</span>
              <span className="mt-1 flex-1 text-sm text-muted">{d}</span>
              <ArrowRight className="mt-4 h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x pt-24 md:pt-32" aria-labelledby="built-title">
        <h2 id="built-title" className="text-3xl md:text-4xl">What&apos;s built</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {built.map(({ icon: Icon, t, items }) => (
            <div key={t} className="rounded-card border border-line p-7">
              <h3 className="flex items-center gap-3 text-2xl"><Icon className="h-5 w-5 text-ember" aria-hidden="true" /> {t}</h3>
              <ul className="mt-5 space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex gap-3 text-roast">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pt-24 md:pt-32" aria-labelledby="quality-title">
        <div className="rounded-[2rem] bg-espresso px-6 py-14 text-cream md:px-14 md:py-16">
          <h2 id="quality-title" className="text-3xl md:text-4xl">The parts you don&apos;t see</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {quality.map(({ icon: Icon, t, d }) => (
              <div key={t}>
                <Icon className="h-6 w-6 text-[#f3a37e]" aria-hidden="true" />
                <p className="mt-4 font-display text-2xl">{t}</p>
                <p className="mt-2 text-cream/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x grid gap-12 pt-24 md:grid-cols-2 md:pt-32">
        <div>
          <h2 className="text-3xl md:text-4xl">Two ways to run it</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-card bg-cream p-6 shadow-soft">
              <p className="font-display text-xl">Demo mode</p>
              <p className="mt-2 text-roast">
                No accounts or keys needed, which is how this preview runs. The catalogue comes from the code, orders and admin changes stay in your browser, and checkout skips payment. Nothing you do here affects anyone else.
              </p>
            </div>
            <div className="rounded-card bg-cream p-6 shadow-soft">
              <p className="flex items-center gap-2 font-display text-xl"><Lock className="h-4 w-4 text-sage" aria-hidden="true" /> Live mode</p>
              <p className="mt-2 text-roast">
                Add Supabase and Stripe keys and the same code uses a real database, real accounts and Stripe Checkout in test mode. Setup takes about ten minutes; the README walks through it.
              </p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl">Built with</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {stack.map((s) => (
              <li key={s} className="rounded-full border border-line bg-cream px-4 py-2 font-medium">{s}</li>
            ))}
          </ul>
          <h3 className="mt-10 text-2xl">Not built (yet)</h3>
          <ul className="mt-4 space-y-3">
            {notBuilt.map((n) => (
              <li key={n} className="flex gap-3 text-roast">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-espresso/30" aria-hidden="true" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-x pt-24 md:pt-32">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-cream p-8 shadow-soft md:flex-row md:items-center md:justify-between md:p-12">
          <div className="flex items-center gap-5">
            <Mark className="h-14 w-14 shrink-0" />
            <div>
              <p className="font-display text-2xl md:text-3xl">Want a shop like this for your business?</p>
              <p className="mt-1 text-roast">Designed and built by Pages by Alexa: websites, landing pages and web apps for small businesses.</p>
            </div>
          </div>
          <a href="https://pagesbyalexa.com" className={buttonClass("primary", "lg", "shrink-0")}>
            Get in touch <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}
