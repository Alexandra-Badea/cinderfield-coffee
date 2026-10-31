import Link from "next/link";
import { UserRound } from "lucide-react";
import { CartButton } from "./cart/cart-drawer";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export const nav = [
  { href: "/shop", label: "Shop coffee" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/finder", label: "Coffee finder" },
  { href: "/brew-guides", label: "Brew guides" },
];

/** A floating bar that stays in reach while you scroll */
export function Header() {
  return (
    <header className="pointer-events-none sticky top-0 z-40 px-3 pt-[calc(env(safe-area-inset-top,0px)+0.625rem)] sm:px-5 sm:pt-[calc(env(safe-area-inset-top,0px)+0.875rem)]">
      {/* a soft blur that fades out downwards, so the page scrolls away under the bar instead of peeking over it */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[calc(100%+1rem)] backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_45%,transparent)]" />
      <div className="glass pointer-events-auto relative mx-auto flex h-14 max-w-[78rem] items-center gap-3 rounded-full border border-espresso/[0.07] pl-2 pr-1.5 shadow-[0_10px_40px_-18px_rgb(22_16_12/0.45)] sm:h-16 sm:pl-5 sm:pr-2">
        <MobileMenu links={nav} />
        <Link href="/" className="mr-auto rounded-full md:mr-0" aria-label="Cinderfield Coffee Roasters, home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="mx-auto hidden md:block">
          <ul className="flex items-center gap-0.5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-full px-3.5 py-2 text-[0.95rem] font-medium text-roast transition hover:bg-espresso/[0.06] hover:text-espresso lg:px-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-0.5">
          <Link href="/account" className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-espresso/[0.06]" aria-label="Your account">
            <UserRound className="h-5 w-5" />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
