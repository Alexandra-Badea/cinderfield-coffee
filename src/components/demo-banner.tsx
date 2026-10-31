import { hasStripe, takesRealPayments } from "@/lib/config";

/**
 * A single line at the top while the store can't take real money, so nobody tries to order
 * from it for real. It disappears once live Stripe keys are added.
 */
export function DemoBanner() {
  if (takesRealPayments) return null;
  return (
    <div className="bg-espresso text-cream">
      <p className="container-x py-2 text-center text-[0.8rem] leading-snug text-cream/80">
        <span className="font-semibold text-cream">Demo store.</span>{" "}
        {hasStripe ? (
          <>
            Payments are in test mode and orders aren&apos;t shipped. Try it with the card{" "}
            <span className="whitespace-nowrap font-semibold tabular-nums text-cream">4242 4242 4242 4242</span>.
          </>
        ) : (
          "Orders aren't shipped and no payment is taken."
        )}
      </p>
    </div>
  );
}
