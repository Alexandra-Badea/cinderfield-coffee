import type { Grind, Product } from "./types";

export type Method = "espresso" | "moka" | "filter" | "cafetiere";
export type Milk = "black" | "milk" | "both";
export type Flavour = Product["flavour"][number];
export type Mood = "familiar" | "bright" | "decaf";

export type Answers = { method: Method; milk: Milk; flavour: Flavour; mood: Mood };
export type Match = { product: Product; score: number; reasons: string[] };

export const methods: Method[] = ["espresso", "moka", "filter", "cafetiere"];
export const milks: Milk[] = ["black", "milk", "both"];
export const flavours: Flavour[] = ["chocolate", "fruit", "floral", "caramel"];
export const moods: Mood[] = ["familiar", "bright", "decaf"];

const methodWords: Record<Method, string> = { espresso: "espresso", moka: "a moka pot", filter: "pour-over and filter", cafetiere: "a cafetière" };

/**
 * The roast level (1 light to 5 dark) that suits someone. Milk needs a fuller, darker coffee;
 * "something bright" pulls towards light roasts.
 */
export function targetRoast({ milk, mood }: Pick<Answers, "milk" | "mood">) {
  let t = 3;
  if (milk === "milk") t += 1;
  if (milk === "black") t -= 0.5;
  if (mood === "bright") t -= 1.5;
  if (mood === "familiar") t += 0.5;
  return Math.min(5, Math.max(1, t));
}

/** Scores every coffee in stock against the answers, best first, with the reasons it fits */
export function rank(products: Product[], a: Answers): Match[] {
  const target = targetRoast(a);
  return products
    .filter((p) => p.active && p.stock > 0)
    .map((p) => {
      let score = 0;
      const reasons: string[] = [];

      if (a.mood === "decaf") {
        if (p.decaf) {
          score += 20;
          reasons.push("Decaffeinated with water only, so you can have a cup at 9pm");
        } else score -= 20;
      } else if (p.decaf) score -= 3; // only suggest decaf to people who ask for it

      const m = p.bestFor.indexOf(a.method);
      if (m === 0) {
        score += 4;
        reasons.push(`Roasted with ${methodWords[a.method]} in mind`);
      } else if (m > 0) {
        score += 3;
        reasons.push(`Works beautifully in ${methodWords[a.method]}`);
      } else score -= 5; // how they brew matters more than anything else

      const f = p.flavour.indexOf(a.flavour);
      if (f === 0) score += 4;
      else if (f > 0) score += 2.5;
      if (f >= 0) reasons.push(`Tastes of ${p.notes.join(", ").toLowerCase().replace(/, ([^,]*)$/, " and $1")}`);

      const gap = Math.abs(p.roastLevel - target);
      score -= gap * 1.5;
      if (a.milk !== "black" && p.roastLevel >= 3) reasons.push("Full enough to stand up to milk");
      else if (p.roastLevel <= 2 && a.mood !== "familiar") reasons.push("A light roast: bright, juicy and best black");

      if (a.mood === "bright" && p.process !== "blend") score += 1;
      if (a.mood === "familiar" && p.process === "blend") score += 1;

      return { product: p, score, reasons: reasons.slice(0, 3) };
    })
    .sort((x, y) => y.score - x.score || x.product.price250 - y.product.price250);
}

/** Whole beans for people with a grinder, otherwise ground for how they brew */
export function grindFor(method: Method, hasGrinder: boolean): Grind {
  return hasGrinder ? "whole" : method;
}

/** Answers <-> URL, so a result can be shared */
export function toSearch(a: Answers) {
  return new URLSearchParams(a).toString();
}

export function fromSearch(search: string): Answers | null {
  const sp = new URLSearchParams(search);
  const method = sp.get("method") as Method;
  const milk = sp.get("milk") as Milk;
  const flavour = sp.get("flavour") as Flavour;
  const mood = sp.get("mood") as Mood;
  if (methods.includes(method) && milks.includes(milk) && flavours.includes(flavour) && moods.includes(mood)) return { method, milk, flavour, mood };
  return null;
}
