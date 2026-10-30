import type { Metadata } from "next";
import { Finder } from "@/components/finder";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Coffee finder",
  description: "Four quick questions about how you brew and what you like, and we'll match you with a coffee, ground the right way.",
};

export default async function FinderPage() {
  const products = await getProducts();
  return (
    <div className="container-x py-14 md:py-20">
      <div className="mx-auto mb-12 max-w-3xl">
        <h1 className="eyebrow">Coffee finder</h1>
        <p className="mt-3 font-display text-lg text-roast">Four questions, thirty seconds, one very good coffee.</p>
      </div>
      <Finder products={products} />
    </div>
  );
}
