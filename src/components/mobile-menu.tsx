"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useHydrated } from "@/lib/browser-store";
import { Logo } from "./logo";

const extra = [
  { href: "/account", label: "Your account" },
  { href: "/shipping", label: "Delivery & returns" },
];

/** On phones: a full-screen menu with big, easy-to-hit links */
export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  // remember which page the menu was opened on: navigating anywhere else closes it
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const hydrated = useHydrated();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpenOn(pathname)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-espresso/[0.06]" aria-expanded={open} aria-controls="mobile-menu" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      {/* rendered on <body>: the frosted header would otherwise trap a full-screen panel inside itself */}
      {hydrated && createPortal(
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="roastery fixed inset-0 z-50 flex flex-col overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
      >
        <div className="flex h-14 items-center justify-between">
          <Logo light />
          <button type="button" onClick={() => setOpenOn(null)} className="grid h-11 w-11 place-items-center rounded-full bg-cream/10 text-cream" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="mt-10 space-y-1">
          {[{ href: "/", label: "Home" }, ...links].map((l, i) => (
            <li key={l.href} className="animate-rise" style={{ animationDelay: `${i * 55}ms` }}>
              <Link href={l.href} onClick={() => setOpenOn(null)} className="group flex items-center justify-between py-2.5 font-display text-[2.6rem] font-semibold leading-none tracking-[-0.035em] text-cream">
                {l.label}
                <ArrowUpRight className="h-7 w-7 text-cream/30 transition group-hover:text-glow" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-auto space-y-3 border-t border-cream/10 pt-6">
          {extra.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpenOn(null)} className="text-lg text-cream/70 hover:text-cream">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>,
      document.body,
      )}
    </div>
  );
}
