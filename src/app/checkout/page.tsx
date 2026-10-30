import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { isLive } from "@/lib/config";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  // With Stripe connected, checkout happens on Stripe's page, started from the bag
  if (isLive) redirect("/cart");
  return (
    <div className="container-x pt-12 md:pt-16">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-3 text-5xl md:text-6xl">Almost there</h1>
      <CheckoutForm />
    </div>
  );
}
