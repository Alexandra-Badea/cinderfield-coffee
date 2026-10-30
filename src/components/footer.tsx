import Link from "next/link";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All coffee" },
      { href: "/subscriptions", label: "Subscriptions" },
      { href: "/finder", label: "Coffee finder" },
      { href: "/shop?roast=light", label: "Light roasts" },
      { href: "/shop?decaf=1", label: "Decaf" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/shipping", label: "Delivery & returns" },
      { href: "/brew-guides", label: "Brew guides" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "Your orders" },
      { href: "/admin", label: "Shop admin (demo)" },
      { href: "/about-this-demo", label: "About this demo" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-espresso text-cream">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.3fr_2fr]">
        <div className="max-w-sm">
          <Logo light />
          <p className="mt-5 text-cream/70">
            Small-batch coffee, roasted every Tuesday and posted on Wednesday. Plastic-free bags, fair prices for farmers.
          </p>
          <p className="mt-8 font-display text-xl">One email a month. New coffees first.</p>
          <div className="mt-4">
            <NewsletterForm dark />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-cream/50" style={{ fontFamily: "var(--font-sans)" }}>
                {col.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-cream/85 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col gap-2 py-6 text-sm text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Cinderfield Coffee Roasters, a made-up shop for a portfolio.</p>
          <p>
            Designed and built by{" "}
            <a href="https://pagesbyalexa.com" className="font-semibold text-cream/85 underline decoration-cream/30 underline-offset-2 hover:text-white">
              Pages by Alexa
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
