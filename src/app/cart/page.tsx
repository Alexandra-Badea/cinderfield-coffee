import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { isLive } from "@/lib/config";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return (
    <div className="container-x pt-12 md:pt-16">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-3 text-5xl md:text-6xl">Your bag</h1>
      <CartView live={isLive} />
    </div>
  );
}
