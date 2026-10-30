"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/shop", label: "Shop coffee" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/finder", label: "Coffee finder" },
  { href: "/#story", label: "Our roastery" },
  { href: "/account", label: "Your account" },
  { href: "/shipping", label: "Delivery & returns" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="-ml-2 grid h-11 w-11 place-items-center rounded-full hover:bg-espresso/[0.06]" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <div id="mobile-menu" hidden={!open} className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-soft">
        <ul className="container-x py-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-line py-3.5 font-display text-xl last:border-0">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
