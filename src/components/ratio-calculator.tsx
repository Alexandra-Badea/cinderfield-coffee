"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const strengths = [
  { label: "Lighter", ratio: 17 },
  { label: "Balanced", ratio: 16 },
  { label: "Stronger", ratio: 15 },
];
const CUP = 250; // ml in a mug

/** Coffee and water for filter or cafetière, by cups and strength */
export function brewAmounts(cups: number, ratio: number) {
  const water = cups * CUP;
  const coffee = Math.round(water / ratio);
  // a level tablespoon holds roughly 6g of ground coffee
  return { water, coffee, spoons: Math.max(1, Math.round(coffee / 6)) };
}

export function RatioCalculator() {
  const [cups, setCups] = useState(2);
  const [ratio, setRatio] = useState(16);
  const { water, coffee, spoons } = brewAmounts(cups, ratio);

  return (
    <div className="grid gap-8 rounded-[2rem] bg-cream p-5 shadow-soft sm:p-10 md:grid-cols-[1fr_1fr] md:items-center">
      <div className="space-y-7">
        <div>
          <p id="cups-label" className="text-sm font-semibold">How many mugs?</p>
          <div className="mt-3 inline-flex h-13 items-center rounded-full border border-line bg-paper" role="group" aria-labelledby="cups-label">
            <button type="button" onClick={() => setCups((c) => Math.max(1, c - 1))} disabled={cups <= 1} className="grid h-13 w-13 place-items-center rounded-l-full hover:bg-espresso/5 disabled:opacity-30" aria-label="One mug fewer">
              <Minus className="h-4 w-4" />
            </button>
            <output className="w-24 text-center font-display text-2xl tabular-nums" aria-live="polite">{cups}</output>
            <button type="button" onClick={() => setCups((c) => Math.min(8, c + 1))} disabled={cups >= 8} className="grid h-13 w-13 place-items-center rounded-r-full hover:bg-espresso/5 disabled:opacity-30" aria-label="One mug more">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold">How strong?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {strengths.map((s) => (
              <label key={s.ratio} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition ${ratio === s.ratio ? "border-espresso bg-espresso text-cream" : "border-line bg-paper hover:border-espresso/40"}`}>
                <input type="radio" name="strength" checked={ratio === s.ratio} onChange={() => setRatio(s.ratio)} className="sr-only" />
                {s.label} <span className={ratio === s.ratio ? "text-cream/60" : "text-muted"}>1:{s.ratio}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="relative overflow-hidden rounded-[1.5rem] bg-espresso p-6 text-cream sm:p-7" aria-live="polite">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-ember/30 blur-2xl" aria-hidden="true" />
        <dl className="relative grid gap-4 min-[400px]:grid-cols-2 min-[400px]:gap-6">
          <div>
            <dt className="text-sm text-cream/60">Coffee</dt>
            <dd className="font-display text-5xl tabular-nums">{coffee}<span className="ml-1 text-2xl text-cream/60">g</span></dd>
          </div>
          <div>
            <dt className="text-sm text-cream/60">Water</dt>
            <dd className="font-display text-5xl tabular-nums">{water}<span className="ml-1 text-2xl text-cream/60">ml</span></dd>
          </div>
        </dl>
        <p className="relative mt-5 text-sm text-cream/70">
          No scale? That&apos;s about {spoons} level tablespoon{spoons === 1 ? "" : "s"} of ground coffee. A scale is the cheapest upgrade in coffee, though.
        </p>
      </div>
    </div>
  );
}
