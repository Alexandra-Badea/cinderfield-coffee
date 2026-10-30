import Link from "next/link";

/** Always visible, so nobody mistakes the demo for a real shop */
export function DemoBanner() {
  return (
    <div className="bg-espresso text-cream">
      <p className="container-x py-2 text-center text-[0.8rem] leading-snug text-cream/85">
        <span className="font-semibold text-cream">Portfolio demo.</span> Cinderfield isn&apos;t a real roastery: products and reviews are examples and checkout never takes real payment.{" "}
        <Link href="/about-this-demo" className="font-semibold text-cream underline decoration-cream/40 underline-offset-2 hover:decoration-cream">
          What&apos;s built here
        </Link>
      </p>
    </div>
  );
}
