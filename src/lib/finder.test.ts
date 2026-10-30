import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { flavours, fromSearch, grindFor, methods, milks, moods, rank, targetRoast, toSearch, type Answers } from "./finder";

const top = (a: Answers) => rank(products, a)[0].product;

describe("coffee finder", () => {
  it("suggests a darker espresso for milk drinkers who like chocolate", () => {
    const p = top({ method: "espresso", milk: "milk", flavour: "chocolate", mood: "familiar" });
    expect(p.slug).toBe("night-shift-espresso");
  });

  it("suggests a light, fruity filter coffee for adventurous black coffee drinkers", () => {
    const p = top({ method: "filter", milk: "black", flavour: "fruit", mood: "bright" });
    expect(p.roast).toBe("light");
    expect(p.flavour).toContain("fruit");
    expect(p.bestFor).toContain("filter");
  });

  it("always puts the decaf first when someone asks for decaf", () => {
    for (const method of methods) for (const flavour of flavours) {
      expect(top({ method, milk: "both", flavour, mood: "decaf" }).decaf).toBe(true);
    }
  });

  it("never suggests decaf unless asked, and always picks a coffee that suits the brew method", () => {
    for (const method of methods) for (const milk of milks) for (const flavour of flavours) for (const mood of moods) {
      if (mood === "decaf") continue;
      const p = top({ method, milk, flavour, mood });
      expect(p.decaf, `${method}/${milk}/${flavour}/${mood}`).toBe(false);
      expect(p.bestFor, `${method}/${milk}/${flavour}/${mood}`).toContain(method);
    }
  });

  it("leaves out coffees that are sold out or off sale", () => {
    const soldOut = products.map((p) => (p.slug === "night-shift-espresso" ? { ...p, stock: 0 } : p.slug === "morning-field" ? { ...p, active: false } : p));
    const list = rank(soldOut, { method: "espresso", milk: "milk", flavour: "chocolate", mood: "familiar" });
    expect(list.map((m) => m.product.slug)).not.toContain("night-shift-espresso");
    expect(list.map((m) => m.product.slug)).not.toContain("morning-field");
  });

  it("gives each match at most three reasons", () => {
    for (const m of rank(products, { method: "cafetiere", milk: "both", flavour: "caramel", mood: "familiar" })) expect(m.reasons.length).toBeLessThanOrEqual(3);
  });

  it("keeps the target roast between 1 and 5", () => {
    expect(targetRoast({ milk: "black", mood: "bright" })).toBe(1);
    expect(targetRoast({ milk: "milk", mood: "familiar" })).toBe(4.5);
  });

  it("sends whole beans to people with a grinder", () => {
    expect(grindFor("espresso", true)).toBe("whole");
    expect(grindFor("cafetiere", false)).toBe("cafetiere");
  });

  it("round-trips answers through the URL and rejects anything else", () => {
    const a: Answers = { method: "moka", milk: "both", flavour: "caramel", mood: "familiar" };
    expect(fromSearch(toSearch(a))).toEqual(a);
    expect(fromSearch("?method=moka&milk=both&flavour=salty&mood=familiar")).toBeNull();
    expect(fromSearch("")).toBeNull();
  });
});
