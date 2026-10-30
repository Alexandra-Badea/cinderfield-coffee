import Link from "next/link";
import { BagArt } from "./bag-art";
import { QuickAdd } from "./quick-add";
import { Stars } from "./stars";
import { Tilt } from "./tilt";
import type { Rating } from "@/lib/catalog";
import { formatGBP } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export function ProductCard({ product, rating, priority = false }: { product: Product; rating?: Rating; priority?: boolean }) {
  const low = product.stock > 0 && product.stock <= 8;
  return (
    <article className="group relative flex flex-col">
      <Tilt className="relative" max={7}>
        <div className="relative overflow-hidden rounded-card bg-sand/70 px-8 pb-5 pt-9 transition-shadow duration-300 group-hover:shadow-lift" style={{ background: `radial-gradient(120% 90% at var(--gx,50%) var(--gy,30%), ${product.art.bag}66, transparent 70%), var(--color-sand)` }}>
          <BagArt product={product} className="mx-auto h-auto w-full max-w-[220px] drop-shadow-[0_18px_22px_rgba(42,28,21,0.18)] transition-transform duration-500 [transform:translateZ(40px)] group-hover:-translate-y-1" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            {product.isNew && <span className="rounded-full bg-ember px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-white">New</span>}
            {product.decaf && <span className="rounded-full bg-cream px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider">Decaf</span>}
            {low && <span className="rounded-full bg-cream px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-ember">Only {product.stock} left</span>}
            {product.stock < 1 && <span className="rounded-full bg-espresso px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-cream">Sold out</span>}
          </div>
          <div className="absolute bottom-4 right-4">
            <QuickAdd product={product} />
          </div>
        </div>
      </Tilt>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{product.origin}</p>
          <h3 className="mt-1 text-xl leading-tight">
            <Link href={`/coffee/${product.slug}`} prefetch={priority} className="after:absolute after:inset-0 after:content-[''] hover:text-ember">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1.5 text-sm text-muted">{product.notes.join(" · ")}</p>
          {rating && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <Stars rating={rating.average} /> <span className="tabular-nums">({rating.count})</span>
            </p>
          )}
        </div>
        <p className="shrink-0 pt-5 font-semibold tabular-nums">
          <span className="text-xs font-normal text-muted">from </span>
          {formatGBP(product.price250)}
        </p>
      </div>
    </article>
  );
}
