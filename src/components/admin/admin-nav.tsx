"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Tag } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/discounts", label: "Discount codes", icon: Tag },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {items.map(({ href, label, icon: Icon }) => {
          const on = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} aria-current={on ? "page" : undefined} className={`flex items-center gap-2.5 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition lg:rounded-xl ${on ? "bg-espresso text-cream" : "hover:bg-espresso/[0.06]"}`}>
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
