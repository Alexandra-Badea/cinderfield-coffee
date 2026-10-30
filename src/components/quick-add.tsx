"use client";

import { Plus } from "lucide-react";
import { useCart } from "./cart/cart-provider";
import type { Product } from "@/lib/types";

/** Adds a 250g bag of whole beans in one tap; the product page has every option */
export function QuickAdd({ product }: { product: Pick<Product, "id" | "slug" | "name" | "stock"> }) {
  const { add } = useCart();
  if (product.stock < 1) return null;
  return (
    <button
      type="button"
      onClick={() => add({ productId: product.id, slug: product.slug, name: product.name, size: "250g", grind: "whole", qty: 1 })}
      className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-espresso text-cream shadow-soft transition hover:scale-105 hover:bg-ember"
      aria-label={`Quick add ${product.name}, 250g whole bean`}
      title="Quick add: 250g, whole bean"
    >
      <Plus className="h-5 w-5" />
    </button>
  );
}
