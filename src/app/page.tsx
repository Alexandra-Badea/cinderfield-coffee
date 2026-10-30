import Link from "next/link";
import { ArrowRight, Leaf, PackageCheck, RefreshCw, Flame } from "lucide-react";
import { HeroBags } from "@/components/hero-bags";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { Stars } from "@/components/stars";
import { buttonClass } from "@/components/ui/button";
import { getProducts, getRatings, getReviews } from "@/lib/catalog";
import { shop } from "@/lib/config";
import { formatGBP } from "@/lib/pricing";

const promises = [
  "Roasted every Tuesday, posted Wednesday",
  `Free UK delivery over ${formatGBP(shop.freeShippingFrom)}`,
  "Plastic-free, home-compostable bags",
  "Pause or cancel subscriptions anytime",
  "We pay farmers above Fairtrade prices",
];

export default async function Home() {
  const [products, ratings, reviews] = await Promise.all([getProducts(), getRatings(), getReviews()]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const heroBags = ["guji-natural", "morning-field", "night-shift-espresso"].map((s) => bySlug.get(s)).filter((p) => p !== undefined);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const best = reviews.filter((r) => r.rating === 5).slice(0, 3);
  const nameOf = new Map(products.map((p) => [p.id, p]));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grain pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="container-x relative grid items-center gap-10 pb-16 pt-12 md:grid-cols-[1.05fr_1fr] md:pb-24 md:pt-20">
          <div className="animate-rise">
            <p className="eyebrow">Small-batch speciality coffee</p>
            <h1 className="mt-4 text-[2.7rem] leading-[1.02] sm:text-6xl lg:text-[4.6rem]">
              Roasted on Tuesday. <em className="font-normal text-ember">In your cup</em> by Friday.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-roast">
              We roast in small batches every week and post the next day, so your coffee arrives at its sweetest. Single origins, a house blend you&apos;ll never tire of, and subscriptions you can pause anytime.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className={buttonClass("primary", "lg")}>
                Shop coffee <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/finder" className={buttonClass("outline", "lg")}>
                Find your coffee
              </Link>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-muted">
              <Stars rating={4.8} /> <span>Loved by home brewers across the UK</span>
            </p>
          </div>
          <HeroBags bags={heroBags} />
        </div>
      </section>

      {/* Promises, scrolling */}
      <section aria-label="Our promises" className="overflow-hidden border-y border-line bg-cream py-4">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap pr-12 motion-reduce:animate-none">
          {[...promises, ...promises].map((p, i) => (
            <span key={i} className="flex items-center gap-3 font-display text-lg text-roast" aria-hidden={i >= promises.length}>
              <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" /> {p}
            </span>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="container-x py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">This week&apos;s roasts</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Our most loved coffees</h2>
          </div>
          <Link href="/shop" className="group inline-flex items-center gap-2 font-semibold text-espresso">
            See all {products.length} coffees <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} rating={ratings[p.id]} priority={i < 2} />
          ))}
        </div>
      </section>

      {/* Subscriptions */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-espresso px-6 py-14 text-cream md:px-14 md:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-ember/30 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
            <div>
              <p className="eyebrow text-[#f3a37e]">Subscriptions</p>
              <h2 className="mt-3 text-4xl md:text-5xl">Never run out of good coffee</h2>
              <p className="mt-5 max-w-md text-lg text-cream/75">
                Pick any coffee and how often you want it. We roast it fresh and post it, with free delivery and {shop.subscriptionDiscount}% off every bag. Skip, swap or cancel in a click.
              </p>
              <Link href="/subscriptions" className={buttonClass("primary", "lg", "mt-8")}>
                Start a subscription
              </Link>
            </div>
            <ol className="grid gap-4">
              {[
                { icon: Flame, t: "Choose your coffee", d: "Any coffee in the shop, or let us surprise you with a new one each time." },
                { icon: RefreshCw, t: "Every 2 or 4 weeks", d: "Change how often, skip a delivery or pause while you're away." },
                { icon: PackageCheck, t: "Roasted, then posted", d: "Your bag is roasted on Tuesday and through your letterbox by Friday." },
              ].map(({ icon: Icon, t, d }, i) => (
                <li key={t} className="flex gap-4 rounded-2xl bg-cream/[0.06] p-5 ring-1 ring-cream/10">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ember text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-xl">
                      <span className="mr-2 text-cream/40">0{i + 1}</span>
                      {t}
                    </p>
                    <p className="mt-1 text-cream/70">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Coffee finder */}
      <section className="container-x py-20 md:py-28">
        <div className="grid items-center gap-10 rounded-[2rem] bg-cream p-8 shadow-soft md:grid-cols-[1.2fr_1fr] md:p-14">
          <div>
            <p className="eyebrow">Coffee finder</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Not sure what you like?</h2>
            <p className="mt-4 max-w-md text-lg text-roast">
              Answer four quick questions about how you brew and what you enjoy, and we&apos;ll match you with a coffee, already set to the right grind.
            </p>
            <Link href="/finder" className={buttonClass("dark", "lg", "mt-8")}>
              Take the 30-second quiz <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3" aria-hidden="true">
            {["Chocolate & nuts", "Fruit & berries", "Floral & citrus", "Caramel & toffee"].map((f, i) => (
              <div key={f} className={`rounded-2xl p-5 font-display text-lg ${["bg-[#d8b48a]/50", "bg-[#bfc9e6]/70", "bg-[#f3e3a6]/80", "bg-[#f0b88a]/60"][i]}`}>
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="scroll-mt-24 container-x grid gap-12 md:grid-cols-2 md:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#3a2a22]">
          <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <radialGradient id="glow" cx="50%" cy="62%" r="50%">
                <stop offset="0" stopColor="#f0a35e" stopOpacity=".55" />
                <stop offset="1" stopColor="#f0a35e" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="400" height="300" fill="url(#glow)" />
            {/* a small drum roaster, drawn simply */}
            <rect x="120" y="120" width="160" height="96" rx="48" fill="#2a1c15" />
            <rect x="132" y="132" width="136" height="72" rx="36" fill="#4a3428" />
            <circle cx="200" cy="168" r="26" fill="#c85a2a" />
            <circle cx="200" cy="168" r="14" fill="#f5c08a" />
            <rect x="186" y="70" width="28" height="50" rx="6" fill="#2a1c15" />
            <path d="M168 70 h64 l-10 -22 h-44 z" fill="#4a3428" />
            <rect x="140" y="216" width="12" height="44" fill="#2a1c15" />
            <rect x="248" y="216" width="12" height="44" fill="#2a1c15" />
            <ellipse cx="300" cy="250" rx="54" ry="12" fill="#c85a2a" opacity=".9" />
            {Array.from({ length: 14 }, (_, i) => (
              <ellipse key={i} cx={262 + (i % 7) * 12} cy={246 + Math.floor(i / 7) * 7} rx="4.5" ry="3" fill="#2a1c15" transform={`rotate(${i * 23} ${262 + (i % 7) * 12} ${246 + Math.floor(i / 7) * 7})`} />
            ))}
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M${192 + i * 9} 46 q-8 -12 0 -24 q8 -12 0 -24`} stroke="#fbf8f3" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-steam" style={{ animationDelay: `${i * 0.9}s` }} />
            ))}
          </svg>
        </div>
        <div>
          <p className="eyebrow">Our roastery</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Small batches. Big flavour. No shortcuts.</h2>
          <p className="mt-5 text-lg text-roast">
            Cinderfield started with a 5kg roaster in a garage and a stubborn belief that great coffee shouldn&apos;t sit in a warehouse for months. We still roast by hand, one small batch at a time, tasting every roast before it goes in a bag.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-8">
            {[
              ["12kg", "per batch, never more"],
              ["48h", "from roaster to post"],
              ["7", "farms we buy from directly"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd>
                  <span className="block font-display text-4xl text-ember">{n}</span>
                  <span className="mt-1 block text-sm text-muted">{l}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 flex items-center gap-2 text-sm text-muted">
            <Leaf className="h-4 w-4 text-sage" aria-hidden="true" /> Home-compostable bags and recycled paper tape.
          </p>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-x pt-24 md:pt-32">
        <div className="text-center">
          <p className="eyebrow">Kind words</p>
          <h2 className="mt-3 text-4xl md:text-5xl">From people who brew at home</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {best.map((r) => (
            <figure key={r.id} className="flex flex-col rounded-card bg-cream p-7 shadow-soft">
              <Stars rating={r.rating} />
              <blockquote className="mt-4 flex-1 font-display text-xl leading-snug">&ldquo;{r.body}&rdquo;</blockquote>
              <figcaption className="mt-6 text-sm text-muted">
                <span className="font-semibold text-espresso">{r.author}</span> on{" "}
                <Link href={`/coffee/${nameOf.get(r.productId)?.slug}`} className="underline decoration-line underline-offset-2 hover:text-ember">
                  {nameOf.get(r.productId)?.name}
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted">Sample reviews for this demo shop.</p>
      </section>

      {/* Newsletter */}
      <section className="container-x pt-24 md:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl md:text-5xl">New coffees land monthly</h2>
          <p className="mt-4 text-lg text-roast">Be first to hear about small lots before they sell out. One email a month, no spam.</p>
          <div className="mx-auto mt-8 max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
