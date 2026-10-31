import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StirredCup } from "@/components/stirred-cup";
import { buttonClass } from "@/components/ui/button";

const suggestions = [
  { href: "/shop", label: "All our coffee" },
  { href: "/finder", label: "Coffee finder" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/brew-guides", label: "Brew guides" },
];

/** For any address that doesn't exist: a 404 where the 0 is a cup being stirred */
export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      {/* cinders drifting up behind */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className="absolute bottom-0 h-1.5 w-1.5 animate-spark rounded-full bg-glow shadow-[0_0_10px_2px_rgb(255_122_46/0.6)]"
            style={{ left: `${6 + ((i * 37) % 88)}%`, animationDelay: `${(i * 0.7) % 4.5}s`, ["--dx" as string]: `${((i % 5) - 2) * 14}px` }}
          />
        ))}
      </div>
      <div className="container-x relative flex min-h-[72vh] flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow animate-rise">Error 404</p>
        <h1 className="display mt-4 flex animate-rise items-center justify-center gap-[0.04em] text-[9rem] leading-none text-espresso sm:text-[13rem] md:text-[16rem]" aria-label="404">
          <span aria-hidden="true">4</span>
          <StirredCup className="h-[0.82em] w-[0.82em] shrink-0 animate-float" />
          <span aria-hidden="true">4</span>
        </h1>
        <h2 className="mt-4 animate-rise text-4xl [animation-delay:.15s] sm:text-5xl">
          This page has <em>gone cold</em>
        </h2>
        <p className="mx-auto mt-4 max-w-md animate-rise text-lg text-roast [animation-delay:.25s]">
          The link may be old, or the address has a typo. While we brew a fresh one, here&apos;s where people usually go next.
        </p>
        <div className="mt-8 flex animate-rise flex-wrap justify-center gap-3 [animation-delay:.35s]">
          <Link href="/shop" className={buttonClass("primary", "lg")}>
            Shop coffee <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/" className={buttonClass("outline", "lg")}>
            Go home
          </Link>
        </div>
        <ul className="mt-10 flex animate-rise flex-wrap justify-center gap-2 [animation-delay:.45s]">
          {suggestions.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="inline-block rounded-full border border-line bg-cream px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:border-espresso/30">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
