"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, Bean, Candy, Check, Cherry, Coffee, Cookie, Droplets, Flame, Flower2, Link2, Milk, Moon, RotateCcw, ShoppingBag, Shuffle, Sparkles, Timer,
  type LucideIcon,
} from "lucide-react";
import { BagArt } from "./bag-art";
import { useCart } from "./cart/cart-provider";
import { Tilt } from "./tilt";
import { useSearch } from "@/lib/browser-store";
import { recipe } from "@/lib/brew";
import { grinds, shop } from "@/lib/config";
import { fromSearch, grindFor, rank, toSearch, type Answers, type Match } from "@/lib/finder";
import { formatGBP } from "@/lib/pricing";
import type { Product } from "@/lib/types";

type Option<T extends string> = { value: T; icon: LucideIcon; title: string; text: string; tint: string };
type Question<K extends keyof Answers> = { key: K; title: string; text: string; options: Option<Answers[K]>[] };

const questions: [Question<"method">, Question<"milk">, Question<"flavour">, Question<"mood">] = [
  {
    key: "method",
    title: "How do you make coffee at home?",
    text: "We'll send it ground for that, or whole if you have a grinder.",
    options: [
      { value: "espresso", icon: Coffee, title: "Espresso machine", text: "Shots, flat whites, lattes", tint: "bg-[#e9dcc6]" },
      { value: "moka", icon: Flame, title: "Moka pot", text: "Strong, on the stove", tint: "bg-[#f0c9a8]" },
      { value: "filter", icon: Droplets, title: "Pour-over or drip", text: "V60, Chemex, filter machine", tint: "bg-[#cfe0e3]" },
      { value: "cafetiere", icon: Timer, title: "Cafetière", text: "French press: steep and plunge", tint: "bg-[#dcdcc2]" },
    ],
  },
  {
    key: "milk",
    title: "How do you take it?",
    text: "Milk loves a fuller, rounder coffee.",
    options: [
      { value: "black", icon: Coffee, title: "Black", text: "Just coffee, nothing added", tint: "bg-[#e3d6cb]" },
      { value: "milk", icon: Milk, title: "With milk", text: "A splash, a latte, oat or dairy", tint: "bg-[#f3ece0]" },
      { value: "both", icon: Shuffle, title: "Depends on the day", text: "Sometimes black, sometimes milky", tint: "bg-[#e6dccf]" },
    ],
  },
  {
    key: "flavour",
    title: "Which sounds most delicious?",
    text: "Go with your gut. There are no wrong answers.",
    options: [
      { value: "chocolate", icon: Cookie, title: "Chocolate & nuts", text: "Cocoa, hazelnut, brownie", tint: "bg-[#d8b48a]/60" },
      { value: "fruit", icon: Cherry, title: "Fruit & berries", text: "Blueberry, cherry, jam", tint: "bg-[#bfc9e6]/80" },
      { value: "floral", icon: Flower2, title: "Floral & citrus", text: "Jasmine, lemon, bergamot", tint: "bg-[#f3e3a6]" },
      { value: "caramel", icon: Candy, title: "Caramel & toffee", text: "Brown sugar, honey, fudge", tint: "bg-[#f0b88a]/70" },
    ],
  },
  {
    key: "mood",
    title: "What are you in the mood for?",
    text: "Comfort, adventure, or a good night's sleep.",
    options: [
      { value: "familiar", icon: Bean, title: "Something comforting", text: "Smooth, sweet, classic coffee", tint: "bg-[#e9dcc6]" },
      { value: "bright", icon: Sparkles, title: "Something exciting", text: "Bright, juicy coffees that surprise", tint: "bg-[#f6d7c4]" },
      { value: "decaf", icon: Moon, title: "Decaf, please", text: "All the flavour, none of the jitters", tint: "bg-[#d9d6e6]" },
    ],
  },
];

export function Finder({ products }: { products: Product[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [finished, setFinished] = useState<Answers | null>(null);
  const [restarted, setRestarted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);

  // A shared link (/finder?method=…) opens straight on the result
  const shared = fromSearch(useSearch());
  const done = finished ?? (restarted ? null : shared);

  // After each answer, move focus to the next question (or the result) so keyboard and screen reader users follow along
  useEffect(() => {
    if (interacted.current) heading.current?.focus();
  }, [step, done]);

  function choose<K extends keyof Answers>(key: K, value: Answers[K]) {
    interacted.current = true;
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < questions.length - 1) setStep(step + 1);
    else {
      const a = next as Answers;
      setFinished(a);
      history.replaceState(null, "", `/finder?${toSearch(a)}`);
    }
  }

  function restart() {
    interacted.current = true;
    setAnswers({});
    setFinished(null);
    setRestarted(true);
    setStep(0);
    history.replaceState(null, "", "/finder");
  }

  if (done) return <Result answers={done} matches={rank(products, done)} onRestart={restart} headingRef={heading} />;

  const q = questions[step];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-4">
        <ol className="flex flex-1 gap-1.5" aria-label="Progress">
          {questions.map((x, i) => (
            <li key={x.key} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-ember" : "bg-espresso/10"}`}>
              <span className="sr-only">{i < step ? "Answered" : i === step ? "Current question" : "Not answered yet"}</span>
            </li>
          ))}
        </ol>
        <p className="shrink-0 text-sm tabular-nums text-muted">
          {step + 1} of {questions.length}
        </p>
      </div>

      <fieldset key={q.key} className="mt-10 animate-rise">
        <legend className="contents">
          <h2 ref={heading} tabIndex={-1} className="text-3xl outline-none sm:text-4xl md:text-5xl">
            {q.title}
          </h2>
        </legend>
        <p className="mt-3 text-lg text-roast">{q.text}</p>
        <div className={`mt-8 grid gap-3 sm:grid-cols-2 ${q.options.length === 3 ? "lg:grid-cols-3" : ""}`}>
          {q.options.map((o) => {
            const Icon = o.icon;
            const picked = answers[q.key] === o.value;
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={picked}
                onClick={() => choose(q.key, o.value as never)}
                className={`group flex items-center gap-4 rounded-card border-2 bg-cream p-5 text-left shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:flex-col sm:items-start ${picked ? "border-ember" : "border-transparent"}`}
              >
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${o.tint} transition group-hover:rotate-[-6deg]`}>
                  <Icon className="h-6 w-6 text-espresso" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-xl">{o.title}</span>
                  <span className="mt-1 block text-sm text-muted">{o.text}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 h-10">
        {step > 0 && (
          <button type="button" onClick={() => { interacted.current = true; setStep(step - 1); }} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-roast hover:bg-espresso/5">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </button>
        )}
      </div>
    </div>
  );
}

function Result({ answers, matches, onRestart, headingRef }: { answers: Answers; matches: Match[]; onRestart: () => void; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const { add } = useCart();
  const [grinder, setGrinder] = useState(false);
  const [copied, setCopied] = useState(false);
  const [best, ...rest] = matches;
  if (!best) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h2 ref={headingRef} tabIndex={-1} className="text-4xl outline-none">Everything&apos;s sold out right now</h2>
        <p className="mt-4 text-roast">We roast again on Tuesday. Try again then?</p>
      </div>
    );
  }
  const p = best.product;
  const grind = grindFor(answers.method, grinder);
  const brew = recipe(answers.method, p.roast);
  const others = answers.mood === "decaf" ? [] : rest.slice(0, 2);

  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked: the address bar already has the link
    }
  }

  return (
    <div className="animate-rise">
      <div className="text-center">
        <p className="eyebrow">Your match</p>
        <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-4xl outline-none sm:text-5xl md:text-6xl">
          Meet <em className="font-normal text-ember">{p.name}</em>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-roast">{p.tagline}</p>
      </div>

      <div className="mt-12 grid items-center gap-10 rounded-[2rem] bg-cream p-6 shadow-soft sm:p-10 md:grid-cols-[0.9fr_1.1fr]">
        <Tilt className="mx-auto w-full max-w-[16rem]" max={12}>
          <div className="relative">
            <div className="absolute inset-x-6 bottom-0 h-8 rounded-[50%] bg-espresso/20 blur-xl" aria-hidden="true" />
            <BagArt product={p} className="relative h-auto w-full drop-shadow-xl" />
          </div>
        </Tilt>

        <div>
          <p className="text-sm text-muted">
            {p.origin} · {p.roast[0].toUpperCase() + p.roast.slice(1)} roast
          </p>
          <ul className="mt-4 space-y-2.5">
            {best.reasons.map((r) => (
              <li key={r} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sage/15 text-sage">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-2xl bg-sand/60 p-4">
            <p className="text-sm font-semibold">How to brew it: {brew.method}</p>
            <p className="mt-1 text-sm text-roast">
              {brew.dose} · {brew.water} · {brew.temp} · {brew.time}
            </p>
            <Link href={`/brew-guides#${answers.method}`} className="mt-2 inline-block text-sm font-semibold underline decoration-line underline-offset-2 hover:text-ember">
              Step-by-step guide
            </Link>
          </div>

          <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={grinder} onChange={(e) => setGrinder(e.target.checked)} className="h-4 w-4 accent-[#2a1c15]" />
            <span>
              I have a grinder, send whole beans <span className="text-muted">(otherwise ground for {grinds[answers.method].label.toLowerCase()})</span>
            </span>
          </label>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => add({ productId: p.id, slug: p.slug, name: p.name, size: "250g", grind, qty: 1 })}
              className="inline-flex h-13 items-center gap-2 rounded-full bg-ember px-6 font-semibold text-white shadow-[0_10px_24px_-10px_rgb(200_90_42/0.8)] transition hover:bg-ember-dark active:translate-y-px"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" /> Add 250g · {formatGBP(p.price250)}
            </button>
            <Link href={`/coffee/${p.slug}?grind=${grind}`} className="inline-flex h-13 items-center gap-2 rounded-full border border-espresso/25 px-6 font-semibold transition hover:border-espresso">
              More about it <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-3 text-sm text-muted">
            Or{" "}
            <Link href={`/coffee/${p.slug}?grind=${grind}&plan=subscribe`} className="font-semibold text-espresso underline decoration-line underline-offset-2 hover:text-ember">
              subscribe and save {shop.subscriptionDiscount}%
            </Link>
            , with free delivery.
          </p>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-14" aria-labelledby="also-title">
          <h3 id="also-title" className="text-2xl">Also worth a try</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {others.map(({ product: o, reasons }) => (
              <Link key={o.id} href={`/coffee/${o.slug}?grind=${grind}`} className="group flex items-center gap-5 rounded-card bg-cream p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <BagArt product={o} className="h-auto w-16 shrink-0 transition group-hover:rotate-[-4deg]" />
                <span className="min-w-0">
                  <span className="block font-display text-xl">{o.name}</span>
                  <span className="mt-1 block text-sm text-muted">{reasons.find((r) => r.startsWith("Tastes")) ?? reasons[0]}</span>
                  <span className="mt-2 block text-sm font-semibold">From {formatGBP(o.price250)}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-roast hover:bg-espresso/5">
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start again
        </button>
        <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-roast hover:bg-espresso/5" aria-live="polite">
          {copied ? <Check className="h-4 w-4 text-sage" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Link copied" : "Copy a link to your result"}
        </button>
      </div>
    </div>
  );
}
