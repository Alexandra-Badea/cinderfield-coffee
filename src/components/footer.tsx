import Link from "next/link";
import { Mark } from "./logo";
import { NewsletterForm } from "./newsletter-form";
import { shop } from "@/lib/config";

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
      { href: "/account", label: "Your account" },
      { href: "/shipping", label: "Delivery & returns" },
      { href: "/brew-guides", label: "Brew guides" },
      { href: `mailto:${shop.email}`, label: "Contact us" },
    ],
  },
  {
    title: "Cinderfield",
    links: [
      { href: "/#story", label: "Our roastery" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="roastery relative mt-28 overflow-hidden rounded-t-[2.5rem] sm:rounded-t-[3.5rem]">
      <div className="grain pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
      <div className="container-x relative grid gap-14 pb-10 pt-16 md:grid-cols-[1.25fr_2fr] md:pt-20">
        <div className="min-w-0 max-w-sm">
          <p className="display text-4xl text-cream sm:text-5xl">
            Fresh coffee, <em className="text-glow">every month.</em>
          </p>
          <p className="mt-4 text-cream/65">New single origins, small lots before they sell out, and nothing else. One email a month.</p>
          <div className="mt-6">
            <NewsletterForm dark />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/45" style={{ fontFamily: "var(--font-sans)", fontStretch: "100%" }}>
                {col.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-cream/80 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {/* the name, as big as the page allows */}
      <p aria-hidden="true" className="display pointer-events-none relative -mb-[0.2em] select-none whitespace-nowrap px-2 text-center text-[19.5vw] leading-none text-transparent [-webkit-text-stroke:1.5px_rgb(242_196_141/0.4)] md:text-[17.5vw]">
        Cinderfield
      </p>
      <div className="relative border-t border-cream/10">
        <div className="container-x flex flex-col gap-2 py-6 text-sm text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Mark className="h-5 w-5" /> © 2026 {shop.name}
          </p>
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
