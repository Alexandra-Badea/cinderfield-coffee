import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Flame, MapPin, Mountain, Sprout, Truck } from "lucide-react";
import { BagArt } from "@/components/bag-art";
import { BuyBox } from "@/components/buy-box";
import { ProductCard } from "@/components/product-card";
import { ReviewForm } from "@/components/review-form";
import { Stars } from "@/components/stars";
import { Tilt } from "@/components/tilt";
import { recipe } from "@/lib/brew";
import { getProduct, getProducts, getRatings, getReviews } from "@/lib/catalog";
import { grinds, hasSupabase, shipping, shop, siteUrl } from "@/lib/config";
import { formatGBP } from "@/lib/pricing";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Coffee not found" };
  return {
    title: `${product.name}, ${product.origin}`,
    description: `${product.tagline} Tasting notes: ${product.notes.join(", ")}. From ${formatGBP(product.price250)}.`,
    openGraph: { title: product.name, description: product.tagline },
  };
}

const processLabel = { washed: "Washed", natural: "Natural", honey: "Honey", blend: "Blend" } as const;

export default async function CoffeePage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, all, ratings, allReviews] = await Promise.all([getProduct(slug), getProducts(), getRatings(), getReviews()]);
  if (!product) notFound();

  const rating = ratings[product.id];
  const reviews = allReviews.filter((r) => r.productId === product.id);
  const related = all
    .filter((p) => p.id !== product.id)
    .map((p) => ({ p, score: (p.roast === product.roast ? 2 : 0) + p.flavour.filter((f) => product.flavour.includes(f)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ p }) => p);
  const brew = recipe(product.bestFor[0], product.roast);

  // Structured data so search engines can show price and stock
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: shop.name },
    category: "Coffee beans",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "GBP",
      lowPrice: (product.price250 / 100).toFixed(2),
      highPrice: (product.price1kg / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteUrl}/coffee/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-x pt-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-espresso">Home</Link></li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <li><Link href="/shop" className="hover:text-espresso">Shop</Link></li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <li aria-current="page" className="text-espresso">{product.name}</li>
          </ol>
        </nav>
      </div>

      <section className="container-x mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Tilt max={8}>
            <div className="relative overflow-hidden rounded-[2rem] px-10 pb-8 pt-12 sm:px-20" style={{ background: `radial-gradient(90% 70% at 50% 35%, ${product.art.bag}aa, transparent 72%), var(--color-sand)` }}>
              <BagArt product={product} className="mx-auto h-auto w-full max-w-[380px] drop-shadow-[0_30px_30px_rgba(42,28,21,.25)] [transform:translateZ(50px)]" />
            </div>
          </Tilt>
          <ul className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            {product.notes.map((n) => (
              <li key={n} className="rounded-2xl bg-cream px-3 py-3 font-display text-base shadow-soft">{n}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">{product.origin}{product.decaf ? " · Decaf" : ""}</p>
          <h1 className="mt-3 text-5xl leading-[1.02] md:text-6xl">{product.name}</h1>
          {rating && (
            <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-sm text-muted hover:text-espresso">
              <Stars rating={rating.average} size="md" /> {rating.average.toFixed(1)} · {rating.count} review{rating.count === 1 ? "" : "s"}
            </a>
          )}
          <p className="mt-5 text-xl text-roast">{product.tagline}</p>

          <div className="mt-6 flex items-center gap-3 text-sm">
            <span className="font-semibold">Roast</span>
            <span className="flex gap-1" aria-label={`Roast level ${product.roastLevel} of 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`h-2 w-7 rounded-full ${n <= product.roastLevel ? "bg-roast" : "bg-espresso/10"}`} />
              ))}
            </span>
            <span className="capitalize text-muted">{product.roast}</span>
          </div>

          <div className="mt-8 border-t border-line pt-8">
            <BuyBox product={product} />
          </div>

          <div className="mt-10 space-y-3">
            <details open className="group rounded-card bg-cream p-6 shadow-soft">
              <summary className="cursor-pointer list-none font-display text-xl marker:hidden">About this coffee</summary>
              <p className="mt-3 text-roast">{product.description}</p>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                {[
                  { icon: MapPin, k: "Region", v: product.region },
                  { icon: Mountain, k: "Altitude", v: product.altitude },
                  { icon: Sprout, k: "Variety", v: product.varietal },
                  { icon: Flame, k: "Process", v: processLabel[product.process] },
                ].map(({ icon: Icon, k, v }) => (
                  <div key={k} className="flex gap-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
                    <div>
                      <dt className="text-muted">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </details>
            <details className="rounded-card bg-cream p-6 shadow-soft">
              <summary className="cursor-pointer list-none font-display text-xl">How we brew it: {brew.method}</summary>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[["Dose", brew.dose], ["Water", brew.water], ["Temperature", brew.temp], ["Time", brew.time]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-sand/60 p-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-roast">
                {brew.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
              <p className="mt-4 text-sm text-muted">
                Also great as: {product.bestFor.slice(1).map((g) => grinds[g].label.toLowerCase()).join(", ") || "anything you like"}. More recipes in our <Link href="/brew-guides" className="underline underline-offset-2 hover:text-ember">brew guides</Link>.
              </p>
            </details>
            <details className="rounded-card bg-cream p-6 shadow-soft">
              <summary className="cursor-pointer list-none font-display text-xl">Delivery &amp; freshness</summary>
              <ul className="mt-3 space-y-2 text-roast">
                <li className="flex gap-2"><Truck className="mt-1 h-4 w-4 shrink-0 text-ember" aria-hidden="true" /> {shipping.standard.label}: {formatGBP(shipping.standard.price)}, free over {formatGBP(shop.freeShippingFrom)} ({shipping.standard.eta}).</li>
                <li className="flex gap-2"><Truck className="mt-1 h-4 w-4 shrink-0 text-ember" aria-hidden="true" /> {shipping.express.label}: {formatGBP(shipping.express.price)} ({shipping.express.eta}).</li>
                <li>Roasted every Tuesday and posted Wednesday. Best between 7 and 40 days after roasting.</li>
              </ul>
            </details>
          </div>
        </div>
      </section>

      <section id="reviews" className="container-x mt-24 scroll-mt-24 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-4xl">Reviews</h2>
          {rating ? (
            <div className="mt-6">
              <p className="flex items-center gap-3">
                <span className="font-display text-6xl">{rating.average.toFixed(1)}</span>
                <span>
                  <Stars rating={rating.average} size="md" />
                  <span className="mt-1 block text-sm text-muted">{rating.count} review{rating.count === 1 ? "" : "s"}</span>
                </span>
              </p>
              <ul className="mt-6 space-y-1.5" aria-label="Rating breakdown">
                {[5, 4, 3, 2, 1].map((n) => {
                  const c = reviews.filter((r) => r.rating === n).length;
                  return (
                    <li key={n} className="flex items-center gap-3 text-sm">
                      <span className="w-12 text-muted">{n} star</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-espresso/10">
                        <span className="block h-full rounded-full bg-ember" style={{ width: `${(c / reviews.length) * 100}%` }} />
                      </span>
                      <span className="w-5 text-right tabular-nums text-muted">{c}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-muted">No reviews yet. Be the first.</p>
          )}
          <div className="mt-8">
            <ReviewForm productId={product.id} enabled={hasSupabase} />
          </div>
        </div>
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-card bg-cream p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <Stars rating={r.rating} />
                <time dateTime={r.createdAt} className="text-sm text-muted">
                  {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </time>
              </div>
              <p className="mt-3 font-display text-lg leading-snug">&ldquo;{r.body}&rdquo;</p>
              <p className="mt-3 text-sm font-semibold">{r.author}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-x mt-24">
        <h2 className="text-4xl">You might also like</h2>
        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => <ProductCard key={p.id} product={p} rating={ratings[p.id]} />)}
        </div>
      </section>
    </>
  );
}
