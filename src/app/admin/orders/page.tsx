import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { OrdersTable } from "@/components/admin/orders-table";
import { loadAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrders() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-cream" aria-hidden="true" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const data = await loadAdmin();
  if (!data.ok) return <AdminGate data={data} />;
  return <OrdersTable live={data.live} orders={data.orders} products={data.products} />;
}
