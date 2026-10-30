import { Suspense } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { Dashboard } from "@/components/admin/dashboard";
import { loadAdmin } from "@/lib/admin";

export default function AdminHome() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-cream" aria-hidden="true" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const data = await loadAdmin();
  if (!data.ok) return <AdminGate data={data} />;
  return <Dashboard live={data.live} orders={data.orders} products={data.products} />;
}
