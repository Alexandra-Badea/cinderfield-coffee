"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { hrefWith, sortOptions, type ShopQuery } from "@/lib/filters";

export function ShopSort({ query }: { query: ShopQuery }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      Sort
      <select
        value={query.sort ?? "featured"}
        onChange={(e) => start(() => router.replace(hrefWith({ ...query, sort: undefined }, "sort", e.target.value), { scroll: false }))}
        className={`h-10 rounded-full border border-line bg-cream px-4 pr-8 text-[0.95rem] font-medium text-espresso ${pending ? "opacity-60" : ""}`}
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
