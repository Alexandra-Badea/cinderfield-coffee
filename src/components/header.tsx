import Link from "next/link";
import { UserRound } from "lucide-react";
import { CartButton } from "./cart/cart-drawer";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export const nav = [
  { href: "/shop", label: "Shop coffee" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/finder", label: "Coffee finder" },
  { href: "/#story", label: "Our roastery" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75">
      <div className="container-x flex h-16 items-center gap-6 md:h-18">
        <MobileMenu />
        <Link href="/" className="mr-auto md:mr-0" aria-label="Cinderfield Coffee Roasters, home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="mx-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-full px-3.5 py-2 text-[0.95rem] font-medium text-roast transition hover:bg-espresso/[0.05] hover:text-espresso">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/account" className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-espresso/[0.06]" aria-label="Your account">
            <UserRound className="h-5 w-5" />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
