import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Coffee, Droplets, Flame, Gauge, Scale, Thermometer, Timer, type LucideIcon } from "lucide-react";
import { BagArt } from "@/components/bag-art";
import { RatioCalculator } from "@/components/ratio-calculator";
import { recipe } from "@/lib/brew";
import { getProducts } from "@/lib/catalog";
import type { Grind } from "@/lib/types";

export const metadata: Metadata = {
  title: "Brew guides",
  description: "Simple recipes for espresso, moka pot, pour-over and cafetière, a coffee-to-water calculator, and how to fix a cup that tastes sour or bitter.",
};

type Method = Exclude<Grind, "whole">;

const guides: { id: Method; short: string; icon: LucideIcon; tint: string; kit: string; intro: string; tip: string }[] = [
  {
    id: "filter",
    short: "pour-over",
    icon: Droplets,
    tint: "bg-[#cfe0e3]",
    kit: "V60 or similar dripper, paper filter, kettle, scale",
    intro: "Clean, clear and the best way to taste what makes a coffee special. Our light roasts shine here.",
    tip: "Pour slowly and keep the bed of coffee flat. If it drains in under 2:30, grind finer; over 3:30, coarser.",
  },
  {
    id: "cafetiere",
    short: "cafetière",
    icon: Timer,
    tint: "bg-[#dcdcc2]",
    kit: "Cafetière, kettle, spoon",
    intro: "The most forgiving way to brew, with a rich, heavy cup. The secret is patience, not pressing hard.",
    tip: "Don't push the plunger to the bottom: stop just above the grounds and pour gently to leave the silt behind.",
  },
  {
    id: "espresso",
    short: "espresso",
    icon: Coffee,
    tint: "bg-[#e9dcc6]",
    kit: "Espresso machine, grinder, scale, tamper",
    intro: "Small, intense and the base of every milk drink. Weigh what goes in and what comes out; it changes everything.",
    tip: "Change one thing at a time, and only the grind until you're close. Fresh coffee needs a few days' rest after roasting.",
  },
  {
    id: "moka",
    short: "a moka pot",
    icon: Flame,
    tint: "bg-[#f0c9a8]",
    kit: "Moka pot, kettle, hob",
    intro: "Strong, sweet and very Italian. Not quite espresso, but lovely with hot milk.",
    tip: "Starting with just-boiled water means the coffee spends less time on the heat, so it tastes sweeter and never burnt.",
  },
];

const fixes = [
  { taste: "Sour or sharp", why: "Under-extracted: the water didn't pull out enough sweetness.", fix: "Grind finer, use hotter water, or brew a little longer." },
  { taste: "Bitter or dry", why: "Over-extracted: too much came out, including the harsh bits.", fix: "Grind coarser, use slightly cooler water, or brew shorter." },
  { taste: "Weak or watery", why: "Not enough coffee for the water.", fix: "Use more coffee (move one step stronger in the calculator)." },
  { taste: "Flat or dull", why: "Usually old beans, or coffee ground a long time ago.", fix: "Buy smaller bags more often, and grind just before brewing if you can." },
];

export default async function BrewGuidesPage() {
  const products = await getProducts();
  // A different coffee for each method: one roasted for it if we have one, otherwise one that suits it
  const used = new Set<string>();
  const picks = new Map(
    guides.map((g) => {
      const fits = products.filter((p) => p.active && !p.decaf && !used.has(p.id) && p.bestFor.includes(g.id));
      const pick = fits.find((p) => p.bestFor[0] === g.id) ?? fits[0];
      if (pick) used.add(pick.id);
      return [g.id, pick];
    }),
  );

  return (
    <>
      <section className="container-x pb-12 pt-12 md:pt-20">
        <p className="eyebrow">Brew guides</p>
        <h1 className="mt-4 max-w-3xl text-[2.6rem] leading-[1.04] sm:text-6xl">
          Better coffee at home is <em className="font-normal text-ember">mostly three things.</em>
        </h1>
        <ul className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
          {[
            { icon: Coffee, t: "Fresh beans", d: "Best 5 to 30 days after roasting." },
            { icon: Gauge, t: "The right grind", d: "Finer for espresso, coarser for cafetière." },
            { icon: Scale, t: "A scale", d: "Weigh it once and you'll never guess again." },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="rounded-card bg-cream p-5 shadow-soft">
              <Icon className="h-5 w-5 text-ember" aria-hidden="true" />
              <p className="mt-3 font-display text-xl">{t}</p>
              <p className="text-sm text-muted">{d}</p>
            </li>
          ))}
        </ul>
        <nav aria-label="Brew methods" className="mt-10 flex flex-wrap gap-2">
          {guides.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="rounded-full border border-line bg-cream px-4 py-2 text-sm font-semibold transition hover:border-espresso/40">
              {recipe(g.id).method}
            </a>
          ))}
          <a href="#calculator" className="rounded-full border border-line bg-cream px-4 py-2 text-sm font-semibold transition hover:border-espresso/40">Calculator</a>
          <a href="#fixes" className="rounded-full border border-line bg-cream px-4 py-2 text-sm font-semibold transition hover:border-espresso/40">Fix my coffee</a>
        </nav>
      </section>

      <section id="calculator" className="container-x scroll-mt-24" aria-labelledby="calc-title">
        <h2 id="calc-title" className="mb-2 text-3xl md:text-4xl">How much coffee?</h2>
        <p className="mb-8 text-roast">For pour-over and cafetière. Start balanced, then adjust to taste.</p>
        <RatioCalculator />
      </section>

      <div className="container-x mt-20 space-y-6 md:mt-28">
        {guides.map((g, i) => {
          const r = recipe(g.id);
          const pick = picks.get(g.id);
          const Icon = g.icon;
          return (
            <article key={g.id} id={g.id} className="scroll-mt-24 rounded-[2rem] bg-cream p-6 shadow-soft sm:p-10" aria-labelledby={`${g.id}-title`}>
              <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
                <div>
                  <div className="flex items-center gap-4">
                    <span className={`grid h-14 w-14 place-items-center rounded-2xl ${g.tint}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Guide {i + 1}</p>
                      <h2 id={`${g.id}-title`} className="text-3xl md:text-4xl">{r.method}</h2>
                    </div>
                  </div>
                  <p className="mt-5 text-lg text-roast">{g.intro}</p>
                  <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { icon: Coffee, k: "Coffee", v: r.dose },
                      { icon: Droplets, k: "Water", v: r.water },
                      { icon: Thermometer, k: "Temperature", v: r.temp },
                      { icon: Timer, k: "Time", v: r.time },
                    ].map(({ icon: I, k, v }) => (
                      <div key={k} className="rounded-2xl bg-paper p-4">
                        <dt className="flex items-center gap-1.5 text-xs text-muted"><I className="h-3.5 w-3.5" aria-hidden="true" /> {k}</dt>
                        <dd className="mt-1 font-semibold leading-snug">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-5 text-sm text-muted"><span className="font-semibold text-espresso">You&apos;ll need:</span> {g.kit}</p>
                </div>
                <div>
                  <ol className="space-y-4">
                    {r.steps.map((s, n) => (
                      <li key={s} className="flex gap-4">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-espresso font-display text-cream">{n + 1}</span>
                        <span className="pt-1">{s}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-6 rounded-2xl border border-dashed border-ember/40 p-4 text-sm text-roast">
                    <span className="font-semibold text-ember">Tip:</span> {g.tip}
                  </p>
                  {pick && (
                    <Link href={`/coffee/${pick.slug}?grind=${g.id}`} className="group mt-6 flex items-center gap-4 rounded-2xl bg-sand/60 p-4 transition hover:bg-sand">
                      <BagArt product={pick} className="h-auto w-11 shrink-0 transition group-hover:-rotate-3" />
                      <span className="flex-1">
                        <span className="block text-xs text-muted">Our pick for {g.short}</span>
                        <span className="font-display text-lg">{pick.name}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section id="fixes" className="container-x scroll-mt-24 pt-20 md:pt-28" aria-labelledby="fix-title">
        <h2 id="fix-title" className="text-3xl md:text-4xl">Fix my coffee</h2>
        <p className="mt-2 text-roast">Taste it black first, then find what&apos;s wrong below.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {fixes.map((f) => (
            <div key={f.taste} className="rounded-card border border-line p-6">
              <p className="font-display text-2xl">{f.taste}</p>
              <p className="mt-2 text-sm text-muted">{f.why}</p>
              <p className="mt-3 font-medium">{f.fix}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-roast">
          Still not sure which coffee to start with?{" "}
          <Link href="/finder" className="font-semibold underline decoration-line underline-offset-2 hover:text-ember">Take the coffee finder quiz</Link>.
        </p>
      </section>
    </>
  );
}
