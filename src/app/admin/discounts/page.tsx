import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { DiscountsTable } from "@/components/admin/discounts-table";
import { loadAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Discount codes" };

export default function AdminDiscounts() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-cream" aria-hidden="true" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const data = await loadAdmin();
  if (!data.ok) return <AdminGate data={data} />;
  return <DiscountsTable live={data.live} codes={data.codes} />;
}
