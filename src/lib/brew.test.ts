import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { brewAmounts } from "@/components/ratio-calculator";
import { subscriptionMaths } from "@/components/subscription-builder";
import { recipe } from "./brew";

describe("brew recipes", () => {
  it("uses hotter water for lighter roasts", () => {
    expect(recipe("filter", "light").temp).toBe("96°C");
    expect(recipe("filter", "dark").temp).toBe("90°C");
  });

  it("works out coffee and water for a number of mugs", () => {
    expect(brewAmounts(2, 16)).toEqual({ water: 500, coffee: 31, spoons: 5 });
    expect(brewAmounts(1, 17).coffee).toBe(15);
  });
});

describe("subscription maths", () => {
  const morningField = products.find((p) => p.slug === "morning-field")!;

  it("charges the discounted price and counts the delivery a one-off order would pay", () => {
    const m = subscriptionMaths(morningField, "250g", 4);
    expect(m.price).toBeLessThan(m.full);
    // 13 deliveries a year, each saving the discount plus £3.95 delivery
    expect(m.savedPerYear).toBe((m.full - m.price + 395) * 13);
  });

  it("doesn't count delivery savings on bags that already ship free", () => {
    const m = subscriptionMaths({ ...morningField, price1kg: 4000 }, "1kg", 2);
    expect(m.full).toBeGreaterThanOrEqual(3500);
    expect(m.savedPerYear).toBe((m.full - m.price) * 26);
  });
});
