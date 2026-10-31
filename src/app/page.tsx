import Link from "next/link";
import { ArrowRight, ArrowUpRight, Candy, Cherry, Cookie, Flower2, Leaf, PackageCheck, Sprout, Timer, Truck, Flame } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Stars } from "@/components/stars";
import { Hero3D } from "@/components/three-d";
import { buttonClass } from "@/components/ui/button";
import { getProducts, getRatings, getReviews } from "@/lib/catalog";
import { shop } from "@/lib/config";
import { formatGBP } from "@/lib/pricing";

const promises = ["Roasted Tuesday, posted Wednesday", `Free UK delivery over ${formatGBP(shop.freeShippingFrom)}`, "Home-compostable bags", "Change or cancel subscriptions anytime", "Above-Fairtrade prices for farmers"];

const flavours = [
  { key: "chocolate", label: "Chocolate & nuts", note: "Cocoa, hazelnut, brownie", icon: Cookie, tint: "#d8b48a", ink: "#3b2416" },
  { key: "fruit", label: "Fruit & berries", note: "Blueberry, cherry, jam", icon: Cherry, tint: "#b9c4ec", ink: "#1f2a55" },
  { key: "floral", label: "Floral & citrus", note: "Jasmine, lemon, bergamot", icon: Flower2, tint: "#f1dd8c", ink: "#4a3d06" },
  { key: "caramel", label: "Caramel & toffee", note: "Brown sugar, honey, fudge", icon: Candy, tint: "#f2b183", ink: "#5a250a" },
] as const;

const journey = [
  { icon: Sprout, title: "Bought direct", text: "From seven farms we visit, at prices well above Fairtrade." },
  { icon: Flame, title: "Roasted Tuesday", text: "In 12kg batches, tasted before a single bag is filled." },
  { icon: Timer, title: "Rested a day", text: "So the coffee settles and tastes its sweetest when it reaches you." },
  { icon: Truck, title: "Posted Wednesday", text: "Through your letterbox by Friday, in a bag you can compost." },
];

/** Splits a line into words that rise in one after another */
function Words({ text, from = 0 }: { text: string; from?: number }) {
  return text.split(" ").map((w, i) => (
    <span key={i} style={{ ["--i" as string]: from + i }}>
      {w}&nbsp;
    </span>
  ));
}

export default async function Home() {
  const [products, ratings, reviews] = await Promise.all([getProducts(), getRatings(), getReviews()]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const heroBags = ["guji-natural", "morning-field", "night-shift-espresso"].map((s) => bySlug.get(s) ?? products[0]).filter((p) => p !== undefined);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const best = reviews.filter((r) => r.rating === 5).slice(0, 10);
  const nameOf = new Map(products.map((p) => [p.id, p]));
  // the average across every review, so the hero shows what customers actually said
  const counted = Object.values(ratings);
  const reviewCount = counted.reduce((n, r) => n + r.count, 0);
  const average = reviewCount ? counted.reduce((s, r) => s + r.average * r.count, 0) / reviewCount : 0;

  return (
    <>
      {/* Hero: slides up under the floating header */}
      <section className="roastery relative -mt-[4.125rem] overflow-hidden pt-[4.125rem] sm:-mt-[4.875rem] sm:pt-[4.875rem]">
        <div className="grain pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="container-x pointer-events-none relative z-10 grid items-center pb-2 pt-10 lg:min-h-[min(820px,92svh)] lg:grid-cols-[1fr_1.08fr] lg:pb-16 lg:pt-6">
          <div className="pointer-events-auto relative max-w-[36rem]">
            <p className="inline-flex animate-rise items-center gap-2.5 rounded-full border border-cream/15 bg-cream/5 px-3.5 py-1.5 text-sm text-cream/80 backdrop-blur">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-glow" />
              </span>
              This week&apos;s roast posts on Wednesday
            </p>
            <h1 className="display words mt-6 text-[2.9rem] text-cream sm:text-7xl lg:text-[5.5rem]">
              <Words text="Roasted on Tuesday." />
              <span style={{ ["--i" as string]: 3 }}>
                <em className="text-glow pr-1">In your cup</em>&nbsp;
              </span>
              <Words text="by Friday." from={4} />
            </h1>
            <p className="mt-5 max-w-md animate-rise text-cream/70 [animation-delay:.45s] sm:mt-6 sm:text-lg">
              Small-batch speciality coffee, roasted every week and posted the next day, so it arrives at its sweetest. Single origins, a house blend you won&apos;t tire of, and subscriptions you control.
            </p>
            <div className="mt-7 grid animate-rise grid-cols-2 gap-3 [animation-delay:.55s] sm:mt-8 sm:flex sm:flex-wrap">
              <Link href="/shop" className={buttonClass("primary", "lg", "px-4 sm:px-7")}>
                Shop coffee <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/finder" className={buttonClass("light", "lg", "px-4 sm:px-7")}>
                Find your coffee
              </Link>
            </div>
            <div className="mt-6 flex animate-rise flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cream/60 [animation-delay:.65s] sm:mt-8">
              {reviewCount > 0 && (
                <span className="flex items-center gap-2">
                  <Stars rating={average} /> {average.toFixed(1)} from {reviewCount} reviews
                </span>
              )}
              <span className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-crema" aria-hidden="true" /> Compostable bags
              </span>
            </div>
          </div>
        </div>
        <div className="relative -mt-2 h-[380px] sm:h-[500px] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto">
          <Hero3D bags={heroBags} />
        </div>
      </section>

      {/* Promises, scrolling */}
      <section aria-label="Our promises" className="overflow-hidden bg-ember py-4 text-white sm:py-5">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap pr-10 motion-reduce:animate-none">
          {[...promises, ...promises].map((p, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-xl font-semibold tracking-[-0.02em] sm:text-2xl" aria-hidden={i >= promises.length}>
              {p}
              <svg viewBox="0 0 30 40" className="h-5 w-4 opacity-70" aria-hidden="true">
                <ellipse cx="15" cy="20" rx="12" ry="17" fill="currentColor" />
                <path d="M11 5c6 5 1 11 5 15s-1 10-4 15" stroke="#d9480f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          ))}
        </div>
      </section>

      {/* Bestsellers: a swipeable row on phones, a grid on bigger screens */}
      <section className="container-x pt-20 md:pt-28">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">This week&apos;s roasts</p>
            <h2 className="mt-3 text-4xl md:text-6xl">
              The coffees <em>everyone</em> reorders
            </h2>
          </div>
          <Link href="/shop" className="group inline-flex items-center gap-2 font-semibold">
            All {products.length} coffees <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
        <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-6 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {featured.map((p, i) => (
            <div key={p.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <ProductCard product={p} rating={ratings[p.id]} priority={i < 2} />
            </div>
          ))}
        </div>
      </section>

      {/* Flavour bento */}
      <section className="container-x pt-20 md:pt-28" aria-labelledby="flavour-title">
        <div className="reveal max-w-2xl">
          <p className="eyebrow">Shop by taste</p>
          <h2 id="flavour-title" className="mt-3 text-4xl md:text-6xl">
            Pick a flavour, <em>we&apos;ll do the rest</em>
          </h2>
        </div>
        <div className="reveal mt-10 grid gap-4 md:grid-cols-4 md:grid-rows-2">
          <Link href="/finder" className="roastery group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[2rem] p-7 md:col-span-2 md:row-span-2 md:p-10">
            <div className="grain pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
            <div className="relative">
              <p className="eyebrow text-crema">Coffee finder</p>
              <p className="display mt-4 max-w-sm text-4xl md:text-5xl">
                Not sure? <em className="text-glow">Thirty seconds</em> and we&apos;ll match you.
              </p>
            </div>
            <div className="relative mt-8 flex flex-wrap gap-2" aria-hidden="true">
              {["Espresso machine", "With milk", "Chocolate & nuts", "Something comforting"].map((t, i) => (
                <span key={t} className="animate-float rounded-full border border-cream/15 bg-cream/10 px-4 py-2 text-sm text-cream/85 backdrop-blur" style={{ animationDelay: `${i * -1.4}s` }}>
                  {t}
                </span>
              ))}
            </div>
            <span className="relative mt-8 inline-flex items-center gap-2 font-semibold text-cream">
              Take the quiz <ArrowUpRight className="h-5 w-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
          {flavours.map(({ key, label, note, icon: Icon, tint, ink }) => {
            const n = products.filter((p) => p.flavour.includes(key)).length;
            return (
              <Link key={key} href={`/shop?flavour=${key}`} className="group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-[2rem] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift" style={{ background: tint, color: ink }}>
                <Icon className="absolute -right-3 -top-3 h-28 w-28 opacity-15 transition duration-500 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />
                <Icon className="h-7 w-7" aria-hidden="true" />
                <div>
                  <p className="font-display text-2xl font-semibold tracking-[-0.03em]">{label}</p>
                  <p className="mt-1 text-sm opacity-75">
                    {note} · {n} {n === 1 ? "coffee" : "coffees"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Subscriptions */}
      <section className="container-x pt-20 md:pt-28">
        <div className="roastery reveal relative overflow-hidden rounded-[2.5rem] px-6 py-14 md:px-14 md:py-20">
          <div className="grain pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
          <div className="relative grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow text-crema">Subscriptions</p>
              <h2 className="mt-3 text-5xl md:text-7xl">
                Never open an <em className="text-glow">empty bag</em> again
              </h2>
              <p className="mt-6 max-w-md text-lg text-cream/70">Any coffee, roasted for you every 2 or 4 weeks. Change or cancel anytime from your account.</p>
              <Link href="/subscriptions" className={buttonClass("primary", "lg", "mt-8")}>
                Start a subscription <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <dl className="grid grid-cols-3 gap-3">
              {[
                [`${shop.subscriptionDiscount}%`, "off every bag"],
                ["£0", "delivery, always"],
                ["2 or 4", "weeks between bags"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-3xl border border-cream/10 bg-cream/[0.06] p-4 backdrop-blur sm:p-6">
                  <dt className="sr-only">{l}</dt>
                  <dd>
                    <span className="display block text-4xl text-crema sm:text-5xl">{n}</span>
                    <span className="mt-2 block text-sm text-cream/60">{l}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* From farm to door: the real order of things */}
      <section id="story" className="container-x scroll-mt-28 pt-20 md:pt-28" aria-labelledby="story-title">
        <div className="reveal grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className="eyebrow">Our roastery</p>
            <h2 id="story-title" className="mt-3 text-4xl md:text-6xl">
              From farm to your door <em>in 48 hours</em> of roasting
            </h2>
          </div>
          <p className="text-lg text-roast md:pb-2">
            Cinderfield started with a 5kg roaster in a garage and a stubborn belief that great coffee shouldn&apos;t sit in a warehouse for months. We still roast by hand, one small batch at a time.
          </p>
        </div>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="reveal group relative overflow-hidden rounded-[2rem] bg-cream p-7 shadow-soft">
              <span className="display absolute -right-2 -top-6 text-[7rem] text-espresso/[0.05]" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ember/10 text-ember transition group-hover:rotate-[-8deg]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-6 font-display text-2xl font-semibold tracking-[-0.03em]">{title}</p>
              <p className="mt-2 text-muted">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 flex items-center gap-2 text-sm text-muted">
          <PackageCheck className="h-4 w-4 text-sage" aria-hidden="true" /> Home-compostable bags and recycled paper tape.
        </p>
      </section>

      {/* Reviews, drifting past */}
      {best.length > 0 && (
        <section className="pt-20 md:pt-28" aria-labelledby="reviews-title">
          <div className="container-x reveal flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Kind words</p>
              <h2 id="reviews-title" className="mt-3 text-4xl md:text-6xl">
                From people who <em>brew at home</em>
              </h2>
            </div>
            {reviewCount > 0 && (
              <p className="flex items-center gap-2 text-muted">
                <Stars rating={average} size="md" /> <span className="font-semibold text-espresso">{average.toFixed(1)}</span> from {reviewCount} reviews
              </p>
            )}
          </div>
          <div className="group mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
            <ul className="flex w-max animate-marquee gap-5 pr-5 [animation-duration:60s] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
              {[...best, ...best].map((r, i) => (
                <li key={`${r.id}-${i}`} aria-hidden={i >= best.length} className="flex w-[300px] shrink-0 flex-col rounded-[1.75rem] bg-cream p-6 shadow-soft sm:w-[360px]">
                  <Stars rating={r.rating} />
                  <blockquote className="mt-4 flex-1 text-lg leading-snug">&ldquo;{r.body}&rdquo;</blockquote>
                  <p className="mt-5 text-sm text-muted">
                    <span className="font-semibold text-espresso">{r.author}</span> on{" "}
                    <Link href={`/coffee/${nameOf.get(r.productId)?.slug}`} tabIndex={i >= best.length ? -1 : undefined} className="underline decoration-line underline-offset-2 hover:text-ember">
                      {nameOf.get(r.productId)?.name}
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
