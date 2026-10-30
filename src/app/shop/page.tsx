import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ShopSort } from "@/components/shop-sort";
import { getProducts, getRatings } from "@/lib/catalog";
import { filterProducts, flavourOptions, hrefWith, parseQuery, roastOptions, typeOptions, type ShopQuery } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Shop coffee",
  description: "Single origins, blends and decaf, roasted every Tuesday. Filter by roast and flavour to find your next bag.",
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function ShopPage({ searchParams }: { searchParams: SP }) {
  return (
    <div className="container-x pb-8 pt-12 md:pt-16">
      <header className="max-w-2xl">
        <p className="eyebrow">The shop</p>
        <h1 className="mt-3 text-5xl md:text-6xl">All our coffee</h1>
        <p className="mt-4 text-lg text-roast">Every coffee is roasted to order on Tuesday. Pick a roast and a flavour, or search for an origin or tasting note.</p>
      </header>
      <Suspense fallback={<ShopSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function Chips({ label, options, query, k }: { label: string; options: { value: string; label: string }[]; query: ShopQuery; k: keyof ShopQuery }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 w-full text-xs font-semibold uppercase tracking-[0.12em] text-muted sm:w-auto">{label}</span>
      {options.map((o) => {
        const on = query[k] === o.value;
        return (
          <Link
            key={o.value}
            href={hrefWith(query, k, o.value)}
            scroll={false}
            aria-current={on ? "true" : undefined}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${on ? "border-espresso bg-espresso text-cream" : "border-line bg-cream hover:border-espresso/40"}`}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}

async function Results({ searchParams }: { searchParams: SP }) {
  const query = parseQuery(await searchParams);
  const [products, ratings] = await Promise.all([getProducts(), getRatings()]);
  const list = filterProducts(products, query, ratings);
  const filtered = Boolean(query.q || query.roast || query.type || query.flavour);

  return (
    <>
      <div className="mt-10 space-y-4 rounded-card bg-cream p-5 shadow-soft md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form action="/shop" role="search" className="relative w-full md:max-w-sm">
            {query.roast && <input type="hidden" name="roast" value={query.roast} />}
            {query.type && <input type="hidden" name="type" value={query.type} />}
            {query.flavour && <input type="hidden" name="flavour" value={query.flavour} />}
            <label htmlFor="shop-q" className="sr-only">
              Search coffee
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input id="shop-q" name="q" defaultValue={query.q} placeholder="Search: Ethiopia, chocolate, natural…" className="h-11 w-full rounded-full border border-line bg-paper pl-10 pr-4 outline-none transition focus:border-espresso/50" />
          </form>
          <ShopSort query={query} />
        </div>
        <div className="flex flex-col gap-3 border-t border-line pt-4 lg:flex-row lg:flex-wrap lg:gap-x-8">
          <Chips label="Roast" options={roastOptions} query={query} k="roast" />
          <Chips label="Type" options={typeOptions} query={query} k="type" />
          <Chips label="Flavour" options={flavourOptions} query={query} k="flavour" />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-sm text-muted" aria-live="polite">
        <p>
          {list.length} {list.length === 1 ? "coffee" : "coffees"}
          {query.q && (
            <>
              {" "}
              for &ldquo;<span className="text-espresso">{query.q}</span>&rdquo;
            </>
          )}
        </p>
        {filtered && (
          <Link href="/shop" className="inline-flex items-center gap-1 font-semibold text-espresso hover:text-ember">
            <X className="h-4 w-4" aria-hidden="true" /> Clear filters
          </Link>
        )}
      </div>

      {list.length ? (
        <div className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} rating={ratings[p.id]} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-espresso/20 p-12 text-center">
          <p className="font-display text-2xl">No coffees match all of that</p>
          <p className="mt-2 text-muted">Try fewer filters, or let the coffee finder pick for you.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/shop" className="rounded-full bg-espresso px-5 py-2.5 font-semibold text-cream">
              Show all coffee
            </Link>
            <Link href="/finder" className="rounded-full border border-line px-5 py-2.5 font-semibold">
              Coffee finder
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

function ShopSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mt-10 h-36 animate-pulse rounded-card bg-cream" />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-card bg-sand/70" />
        ))}
      </div>
    </div>
  );
}
